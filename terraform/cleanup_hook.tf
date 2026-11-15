# ==============================================================================
# Automated Cleanup Hook for Kubernetes Out-of-Band Load Balancers & ENIs
# ==============================================================================
# When Kubernetes services (Argo CD, App, Grafana, etc.) use type: LoadBalancer,
# Kubernetes creates AWS ELBs/ALBs and ENIs directly in AWS without Terraform's knowledge.
# On "terraform destroy", this resource executes FIRST to cleanly delete all ELBs/ENIs
# in the VPC, preventing "DependencyViolation" so the VPC deletes cleanly in seconds.
# ==============================================================================

resource "null_resource" "auto_cleanup_vpc_load_balancers" {
  triggers = {
    vpc_id = module.vpc.vpc_id
    region = local.region
  }

  provisioner "local-exec" {
    when    = destroy
    command = <<-EOT
      powershell -Command "
        $vpcId = '${self.triggers.vpc_id}'
        $region = '${self.triggers.region}'
        Write-Host '==> [Terraform Auto-Cleanup] Finding & Deleting Classic ELBs in VPC: $vpcId'
        $elbs = (aws elb describe-load-balancers --region $region --query \"LoadBalancerDescriptions[?VPCId=='$vpcId'].LoadBalancerName\" --output text) -split '\s+'
        foreach ($elb in $elbs) {
          if ($elb) {
            aws elb delete-load-balancer --region $region --load-balancer-name $elb
            Write-Host \"✔ [Auto-Cleanup] Deleted Classic ELB: $elb\"
          }
        }

        Write-Host '==> [Terraform Auto-Cleanup] Finding & Deleting ALBs/NLBs in VPC: $vpcId'
        $albs = (aws elbv2 describe-load-balancers --region $region --query \"LoadBalancers[?VpcId=='$vpcId'].LoadBalancerArn\" --output text) -split '\s+'
        foreach ($alb in $albs) {
          if ($alb) {
            aws elbv2 delete-load-balancer --region $region --load-balancer-arn $alb
            Write-Host \"✔ [Auto-Cleanup] Deleted ALB/NLB: $alb\"
          }
        }

        Write-Host '==> [Terraform Auto-Cleanup] Waiting 30s for AWS to release ENIs...'
        Start-Sleep -Seconds 30

        Write-Host '==> [Terraform Auto-Cleanup] Deleting leftover available Network Interfaces...'
        $enis = (aws ec2 describe-network-interfaces --region $region --filters \"Name=vpc-id,Values=$vpcId\" \"Name=status,Values=available\" --query \"NetworkInterfaces[*].NetworkInterfaceId\" --output text) -split '\s+'
        foreach ($eni in $enis) {
          if ($eni) {
            aws ec2 delete-network-interface --region $region --network-interface-id $eni
            Write-Host \"✔ [Auto-Cleanup] Deleted ENI: $eni\"
          }
        }
        Write-Host '==> [Terraform Auto-Cleanup] VPC is clean! Proceeding with Terraform VPC deletion.'
      "
    EOT
  }

  depends_on = [module.eks]
}

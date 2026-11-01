output "region" {
  description = "The AWS region where resources are created"
  value       = local.region
}

output "vpc_id" {
  description = "The ID of the created VPC"
  value       = module.vpc.vpc_id
}

output "eks_cluster_name" {
  description = "EKS Cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster API endpoint"
  value       = module.eks.cluster_endpoint
}

output "ec2_public_ip" {
  description = "Public IP of the EC2 Jenkins instance"
  value       = aws_instance.my_instance.public_ip
}

output "jenkins_url" {
  description = "Direct Web URL to access Jenkins UI"
  value       = "http://${aws_instance.my_instance.public_ip}:8080"
}

output "eks_managed_node_group_private_ips" {
  description = "Private IPs of the EKS node group instances in private subnets"
  value       = data.aws_instances.eks_nodes.private_ips
}

output "eks_managed_node_group_public_ips" {
  description = "Public IPs of the EKS node group instances (empty since worker nodes are deployed in private subnets)"
  value       = data.aws_instances.eks_nodes.public_ips
}

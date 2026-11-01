# Harvesto Infrastructure as Code (Terraform)

This directory provisions the complete AWS production infrastructure for the Harvesto (GreenCart) cloud deployment in the `ap-south-1` (Mumbai) region.

---

## 🏛️ Architecture Components

1. **Custom VPC (`vpc.tf`)**:
   - CIDR `10.0.0.0/16` spanning across 2 Availability Zones (`ap-south-1a`, `ap-south-1b`).
   - **Public Subnets**: `10.0.1.0/24`, `10.0.2.0/24` with internet gateway and ingress ALB tags.
   - **Private Subnets**: `10.0.3.0/24`, `10.0.4.0/24` for secure worker node placement.
   - **Intra Subnets**: `10.0.5.0/24`, `10.0.6.0/24` for EKS control plane network interfaces.
   - **Single NAT Gateway**: Allows private subnet nodes to download container images and updates securely.

2. **Amazon EKS Kubernetes Cluster (`eks.tf`)**:
   - EKS Control Plane v1.31 with public API endpoint enabled.
   - Core add-ons: CoreDNS, Kube-Proxy, VPC-CNI.
   - **Managed Node Group**: 2x `t3.large` SPOT instances (scale up to 3) with 35 GB gp3 disks in private subnets.

3. **Jenkins Automation Server (`ec2.tf`)**:
   - `t2.medium` EC2 instance with 20 GB gp3 storage.
   - Pre-installed automated toolchain: Jenkins (port 8080), Docker, Trivy security scanner, AWS CLI, Helm, and Kubectl via `install_tools.sh`.

---

## 🚀 Deployment Commands

```bash
# 1. Initialize modules and providers
terraform init

# 2. Preview infrastructure changes
terraform plan

# 3. Apply infrastructure to AWS
terraform apply -auto-approve

# 4. Connect to EKS cluster with kubectl
aws eks update-kubeconfig --region ap-south-1 --name my-eks-cluster
kubectl get nodes

# 5. Access Jenkins Web UI
# Open URL printed in output: http://<ec2_public_ip>:8080

# 6. Destroy infrastructure when finished (Prevents unwanted cloud billing)
terraform destroy -auto-approve
```

---

## 💰 AWS Cost Breakdown (ap-south-1 Mumbai)

| Component | Specification | Hourly Cost (USD) | 4 Hours Cost | 1 Day (24h) Cost |
| :--- | :--- | :--- | :--- | :--- |
| **EKS Control Plane** | AWS Managed EKS Cluster | $0.100 / hr | $0.40 | $2.40 |
| **EKS Worker Nodes** | 2x `t3.large` SPOT instances | ~$0.056 / hr ($0.028/node) | ~$0.22 | ~$1.34 |
| **Worker Node EBS** | 2x 35 GB = 70 GB gp3 | ~$0.008 / hr | ~$0.03 | ~$0.19 |
| **NAT Gateway** | 1x Single AZ NAT Gateway | $0.045 / hr | $0.18 | $1.08 |
| **EC2 Server (Jenkins)**| 1x `t2.medium` On-Demand | $0.046 / hr | $0.19 | $1.11 |
| **EC2 Storage** | 20 GB gp3 root disk | ~$0.002 / hr | ~$0.01 | ~$0.05 |
| **Public IPv4 Addresses** | 2x IPv4 (EC2 + NAT EIP) | $0.010 / hr ($0.005/ip) | $0.04 | $0.24 |
| **Total Estimated Cost** | **Full Stack Active** | **~$0.267 / hour** | **~$1.07 USD (~₹90)** | **~$6.41 USD (~₹535)** |

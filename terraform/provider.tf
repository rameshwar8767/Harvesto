locals {
  region   = var.aws_region
  name     = var.cluster_name
  vpc_cidr = "10.0.0.0/16"

  azs = [
    "${var.aws_region}a",
    "${var.aws_region}b"
  ]

  public_subnets = [
    "10.0.1.0/24",
    "10.0.2.0/24"
  ]

  private_subnets = [
    "10.0.3.0/24",
    "10.0.4.0/24"
  ]

  intra_subnets = [
    "10.0.5.0/24",
    "10.0.6.0/24"
  ]

  tags = {
    Project     = "Harvesto"
    Environment = var.my_environment
    ManagedBy   = "Terraform"
  }
}

provider "aws" {
  region = local.region
}

# Dynamic authentication token for EKS cluster
data "aws_eks_cluster_auth" "cluster" {
  name = module.eks.cluster_name
}

provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
  token                  = data.aws_eks_cluster_auth.cluster.token
}

provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
    token                  = data.aws_eks_cluster_auth.cluster.token
  }
}

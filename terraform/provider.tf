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

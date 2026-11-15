variable "aws_region" {
  description = "AWS region where resources will be provisioned"
  type        = string
  default     = "ap-south-1"
}

variable "ami_id" {
  description = "AMI ID for the EC2 Jenkins instance (leave empty to dynamically use the latest Ubuntu 24.04 LTS AMI)"
  type        = string
  default     = ""
}

variable "instance_type" {
  description = "Instance type for the EC2 Jenkins instance"
  type        = string
  default     = "t2.medium"
}

variable "my_environment" {
  description = "Environment identifier (e.g. dev, stage, prod)"
  type        = string
  default     = "dev"
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "harvesto-eks-cluster"
}

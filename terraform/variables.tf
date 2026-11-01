variable "aws_region" {
  description = "AWS region where resources will be provisioned"
  default     = "ap-south-1"
}

variable "ami_id" {
  description = "AMI ID for the EC2 instance"
  default     = "ami-0c7632fb77f35db43"
}

variable "instance_type" {
  description = "Instance type for the EC2 instance"
  default     = "t2.medium"
}

variable "my_environment" {
  description = "Environment like dev, prod, stage"
  default     = "dev"
}

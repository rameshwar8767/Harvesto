# Data source to fetch the latest official Ubuntu 24.04 LTS AMI if not explicitly specified
data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*", "ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

# SSH Key Pair for EC2 Jenkins instance
resource "aws_key_pair" "my_secret_key" {
  key_name   = "terra-key"
  public_key = file("${path.module}/terra-key.pub")
  tags       = local.tags
}

# Security Group for Jenkins Server inside custom VPC
resource "aws_security_group" "allow_user_to_connect" {
  name_prefix = "harvesto-jenkins-sg-"
  description = "Security group for Harvesto Jenkins Automation EC2 instance"
  vpc_id      = module.vpc.vpc_id

  # SSH Access
  ingress {
    description = "SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Jenkins Web UI
  ingress {
    description = "Jenkins Web UI"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP
  ingress {
    description = "HTTP web traffic"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS
  ingress {
    description = "HTTPS secure traffic"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # All outbound traffic allowed
  egress {
    description = "Allow all outbound internet traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.tags, {
    Name = "harvesto-jenkins-sg"
  })
}

# Jenkins Automation Server (EC2) provisioned inside Harvesto Public Subnet
resource "aws_instance" "my_instance" {
  ami                         = var.ami_id != "" ? var.ami_id : data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  key_name                    = aws_key_pair.my_secret_key.key_name
  subnet_id                   = module.vpc.public_subnets[0]
  associate_public_ip_address = true
  vpc_security_group_ids      = [aws_security_group.allow_user_to_connect.id]
  user_data                   = file("${path.module}/install_tools.sh")

  root_block_device {
    volume_size           = 25
    volume_type           = "gp3"
    delete_on_termination = true
  }

  tags = merge(local.tags, {
    Name = "Harvesto-Jenkins-Automate"
  })
}

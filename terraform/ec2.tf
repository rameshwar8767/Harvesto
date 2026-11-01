# data "aws_ami" "os_image" {

# }

resource "aws_key_pair" "my_secret_key" {
  key_name   = "terra-key"
  public_key = file("terra-key.pub")
}

resource "aws_default_vpc" "default_vpc" {

}

resource "aws_security_group" "allow_user_to_connect" {
  name        = "allow TLS"
  description = "Allow uer to connect"
  vpc_id      = aws_default_vpc.default_vpc.id

  // ssh allows
  ingress {
    description = "port 22 allow"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "all outgoing traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  // Backend running on 5000
  ingress {
    description = "port 5000 allow"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  // Frontend running on 5173
  ingress {
    description = "port 5173 allow"
    from_port   = 5173
    to_port     = 5173
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  // Http
  ingress {
    description = "port 80 allow"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  // Https allows
  ingress {
    description = "port 443 allow"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "my_security"
  }

}

resource "aws_ec2_instance" "my_instance" {
  ami             = "ami-0c7632fb77f35db43"
  instance_type   = var.instance_type
  key_name        = aws_key_pair.my_secret_key.key_name
  security_groups = [aws_security_group.my_security.allow_user_to_connect.name]
  user_data       = file("${path.module}/install_tools.sh")

  tags = {
    Name = "Jenkins-Automate"
  }

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }
}

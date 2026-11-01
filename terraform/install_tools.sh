#!/bin/bash
set -euo pipefail

# Update system and install core packages
apt-get update -y
apt-get install -y \
  fontconfig \
  openjdk-21-jre \
  wget \
  gnupg \
  ca-certificates \
  curl \
  snapd

# Jenkins installation
install -d -m 0755 /etc/apt/keyrings

wget -qO /etc/apt/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key

echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" \
  > /etc/apt/sources.list.d/jenkins.list

apt-get update -y
apt-get install -y jenkins

# Docker installation
apt-get install -y docker.io

systemctl enable --now docker

# Allow Jenkins to use Docker
usermod -aG docker jenkins

# Jenkins installation and startup
systemctl enable jenkins
systemctl start jenkins

# Trivy installation
install -d -m 0755 /usr/share/keyrings

wget -qO - \
  https://aquasecurity.github.io/trivy-repo/deb/public.key \
  | gpg --dearmor \
  > /usr/share/keyrings/trivy.gpg

chmod 0644 /usr/share/keyrings/trivy.gpg

echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb generic main" \
  > /etc/apt/sources.list.d/trivy.list

apt-get update -y
apt-get install -y trivy

# AWS CLI installation
snap install aws-cli --classic

# Helm installation
snap install helm --classic

# kubectl installation
snap install kubectl --classic

# Restart Jenkins to apply Docker group membership
systemctl restart jenkins

echo "EC2 setup completed successfully"

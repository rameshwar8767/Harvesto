#!/bin/bash
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

echo "==> Updating package repositories..."
apt-get update -y
apt-get install -y \
  fontconfig \
  openjdk-21-jre \
  wget \
  gnupg \
  ca-certificates \
  curl \
  unzip \
  git \
  apt-transport-https

# 1. Jenkins Installation
echo "==> Installing Jenkins..."
install -d -m 0755 /etc/apt/keyrings
wget -qO /etc/apt/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" > /etc/apt/sources.list.d/jenkins.list

apt-get update -y
apt-get install -y jenkins

# 2. Docker Installation
echo "==> Installing Docker..."
apt-get install -y docker.io
systemctl enable --now docker
usermod -aG docker jenkins

# 3. Trivy Security Scanner Installation
echo "==> Installing Trivy..."
install -d -m 0755 /usr/share/keyrings
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor > /usr/share/keyrings/trivy.gpg
chmod 0644 /usr/share/keyrings/trivy.gpg
echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb generic main" > /etc/apt/sources.list.d/trivy.list

apt-get update -y
apt-get install -y trivy

# 4. Kubectl Installation (Direct official binary - fast & reliable)
echo "==> Installing kubectl..."
KUBECTL_VERSION="v1.31.0"
curl -sLO "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl"
chmod +x kubectl
mv kubectl /usr/local/bin/

# 5. Helm Installation (Direct official script)
echo "==> Installing Helm..."
curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# 6. AWS CLI v2 Installation
echo "==> Installing AWS CLI v2..."
curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip -q awscliv2.zip
./aws/install --update
rm -rf awscliv2.zip aws

# 7. Restart Jenkins to apply Docker group permissions
systemctl enable jenkins
systemctl restart jenkins

echo "==> Harvesto DevOps Tools installation completed successfully!"

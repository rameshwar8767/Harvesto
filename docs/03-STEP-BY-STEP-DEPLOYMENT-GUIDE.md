# 🚀 Harvesto Complete Step-by-Step Deployment Guide

This guide provides end-to-end instructions to provision the entire cloud infrastructure, CI/CD pipeline, and observability stack from scratch on AWS.

---

## 📋 Prerequisites & Tools

Ensure the following CLI tools are installed and configured on your machine:
* **AWS CLI v2:** Configured with Administrator credentials (`aws configure`)
* **Terraform (v1.5+):** Infrastructure as Code engine
* **Kubectl (v1.31+):** Kubernetes command-line interface
* **Helm (v3+):** Kubernetes package manager
* **Git:** Version control
* **Node.js 20+ & Docker:** For local building and container management

Verify installations:
```powershell
aws sts get-caller-identity
terraform version
kubectl version --client
helm version
docker --version
```

---

## Phase 1: Infrastructure Provisioning (Terraform)

### 1.1 Navigate to Terraform Directory
```powershell
cd C:\Users\Rameshwar\Desktop\Harvesto\terraform
```

### 1.2 Initialize Providers & Modules
```powershell
terraform init
```

### 1.3 Review Execution Plan
```powershell
terraform plan -out=tfplan
```

### 1.4 Apply Infrastructure
```powershell
terraform apply "tfplan"
```
*(Provisions VPC, Subnets, NAT Gateway, EKS Cluster, Managed Spot Node Groups, and EC2 Jenkins Server).*

### 1.5 Configure Local Kubectl for EKS
```powershell
aws eks update-kubeconfig --region ap-south-1 --name harvesto-eks-cluster
```

Verify cluster access:
```powershell
kubectl get nodes -o wide
```

---

## Phase 2: Jenkins CI Automation Setup

### 2.1 Retrieve Jenkins Public IP & URL
```powershell
terraform output jenkins_url
```
Example: `http://13.127.143.19:8080`

### 2.2 Retrieve Initial Admin Password
SSH into the Jenkins EC2 instance:
```powershell
ssh -i terraform/terra-key ubuntu@<EC2_PUBLIC_IP>
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### 2.3 Configure Jenkins Credentials
Navigate to **Manage Jenkins** ➔ **Credentials** ➔ **System** ➔ **Global credentials**:

1. **Docker Hub Token (`docker-hub-credentials`):**
   * **Kind:** Username with password
   * **Username:** `rameshwarrm`
   * **Password:** Personal Access Token with **`Read & Write`** permissions
   * **ID:** `docker-hub-credentials`

2. **GitHub Token (`github-credentials`):**
   * **Kind:** Username with password (or SSH Key)
   * **Username:** `rameshwar8767`
   * **Password:** GitHub Personal Access Token (repo scope)
   * **ID:** `github-credentials`

### 2.4 Configure Jenkins Shared Library
1. **Manage Jenkins** ➔ **System** ➔ **Global Pipeline Libraries**
2. **Name:** `Shared`
3. **Default version:** `main`
4. **Retrieval method:** Modern SCM ➔ Git ➔ `https://github.com/rameshwar8767/jenkins-shared-library.git`
5. **Credentials:** `github-credentials`

### 2.5 Create Pipeline Job
1. Create **New Item** ➔ Name: `Harvesto` ➔ **Pipeline**
2. **Pipeline definition:** Pipeline script from SCM
3. **SCM:** Git ➔ `https://github.com/rameshwar8767/Harvesto.git` ➔ Branch: `*/main`
4. **Script Path:** `Jenkinsfile`
5. Click **Save** ➔ **Build Now**.

---

## Phase 3: GitOps Continuous Delivery (Argo CD)

### 3.1 Install Argo CD via Server-Side Apply
```powershell
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml --server-side --force-conflicts
```

### 3.2 Expose Argo CD Server via AWS LoadBalancer
```powershell
kubectl patch svc argocd-server -n argocd -p '{\"spec\": {\"type\": \"LoadBalancer\"}}'
```

### 3.3 Retrieve Argo CD Initial Admin Password
```powershell
[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String((kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}")))
```

### 3.4 Retrieve Argo CD Public URL
```powershell
kubectl get svc argocd-server -n argocd
```
Open in browser: `https://<EXTERNAL-IP>` *(Username: `admin`)*.

### 3.5 Create Harvesto GitOps Application in Argo CD
Run via CLI or create in UI:
```powershell
argocd login <ARGOCD_EXTERNAL_IP> --username admin --password <PASSWORD> --insecure

argocd app create harvesto `
  --repo https://github.com/rameshwar8767/Harvesto.git `
  --path kubernetes `
  --dest-server https://kubernetes.default.svc `
  --dest-namespace harvesto `
  --sync-policy automated `
  --auto-prune `
  --self-heal
```

---

## Phase 4: Observability (Prometheus & Grafana)

### 4.1 Install Metrics Server (For HPA Autoscaling)
```powershell
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### 4.2 Add Helm Repositories
```powershell
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

### 4.3 Install Kube-Prometheus-Stack
```powershell
kubectl create namespace monitoring

helm install prometheus prometheus-community/kube-prometheus-stack `
  --namespace monitoring `
  --set grafana.service.type=LoadBalancer `
  --set grafana.adminPassword="admin123" `
  --set prometheus.service.type=LoadBalancer
```

### 4.4 Retrieve Monitoring Endpoints
```powershell
kubectl get svc -n monitoring
```

* **Grafana Dashboard:** `http://<GRAFANA_EXTERNAL_IP>` *(Username: `admin`, Password: `admin123`)*
* **Prometheus Metrics:** `http://<PROMETHEUS_EXTERNAL_IP>:9090`

---

## Phase 5: Complete Teardown & Clean Destruction

To avoid cloud dependency errors when destroying:

```powershell
# 1. Delete Kubernetes LoadBalancer services to release AWS ENIs
kubectl delete svc -A --field-selector spec.type=LoadBalancer

# 2. Wait 30 seconds for AWS to detach ENIs
Start-Sleep -Seconds 30

# 3. Destroy all infrastructure cleanly via Terraform
cd C:\Users\Rameshwar\Desktop\Harvesto\terraform
terraform destroy -auto-approve
```

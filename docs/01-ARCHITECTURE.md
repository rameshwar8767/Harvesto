# 🏛️ Harvesto Enterprise Architecture & System Design

Harvesto is a cloud-native, enterprise-grade e-commerce microservices and web platform deployed on Amazon Web Services (AWS) using modern DevOps, GitOps, and Site Reliability Engineering (SRE) paradigms.

---

## 1. High-Level Architectural Topology

```mermaid
flowchart TD
    subgraph Clients["🌐 End-Users & External Traffic"]
        Browser["Desktop & Mobile Web Browsers"]
        Dev["DevOps Engineer / Workstation"]
    end

    subgraph AWSCloud["☁️ AWS Cloud Infrastructure (ap-south-1)"]
        subgraph VPC["Custom VPC: 10.0.0.0/16"]
            IGW["Internet Gateway (IGW)"]
            
            subgraph PublicSubnets["Public Subnets (10.0.1.0/24, 10.0.2.0/24)"]
                NAT["NAT Gateway (Single AZ / Cost Optimized)"]
                JenkinsEC2["Jenkins Automation Server (t3.large)"]
                AppELB["Harvesto Public ELB (Port 80)"]
                ArgoELB["Argo CD Public ELB (Port 443)"]
                GrafanaELB["Grafana Public ELB (Port 80)"]
            end

            subgraph PrivateSubnets["Private Subnets (10.0.3.0/24, 10.0.4.0/24)"]
                subgraph EKSCluster["Amazon EKS Cluster v1.31"]
                    subgraph HarvestoNS["Namespace: harvesto"]
                        AppPods["Harvesto Full-Stack Pods (2-5 Replicas)\n[Node.js 20 + Express 5 + React Vite]"]
                        MongoStateful["MongoDB 7.0 StatefulSet\n[PersistentVolumeClaim + EBS gp3]"]
                        MigrationJob["Database Migration Job\n[batch/v1 PreSync Hook]"]
                        HPA["Horizontal Pod Autoscaler (HPA)\n[Target: 70% CPU]"]
                    end

                    subgraph MonitoringNS["Namespace: monitoring"]
                        PrometheusServer["Prometheus Server\n[Scrapes Pods, Nodes & cAdvisor]"]
                        GrafanaServer["Grafana Dashboard\n[Cluster, Node & App Metrics]"]
                        NodeExporter["Node Exporter DaemonSet\n[Host CPU, RAM, Disk]"]
                        KubeState["Kube-State-Metrics"]
                    end

                    subgraph KubeSystem["Namespace: kube-system"]
                        CoreDNS["CoreDNS Deployments"]
                        VPCCNI["AWS VPC-CNI Plugin"]
                        MetricsServer["Kubernetes Metrics Server"]
                    end

                    subgraph ArgoCDNS["Namespace: argocd"]
                        ArgoController["Argo CD Controller"]
                        ArgoServer["Argo CD API Server"]
                        ArgoRepo["Argo CD Repo Server"]
                    end
                end
            end

            subgraph IntraSubnets["Intra Subnets (10.0.5.0/24, 10.0.6.0/24)"]
                ControlPlane["EKS Managed Control Plane (Kube-API)"]
            end
        end
    end

    subgraph ExternalServices["🌍 External Services & Registries"]
        GitHub["GitHub (App Repo & Shared Library)"]
        DockerHub["Docker Hub (Container Registry)"]
    end

    %% Traffic and Pipeline Flows
    Dev -->|git push| GitHub
    GitHub -->|Webhook Trigger| JenkinsEC2
    JenkinsEC2 -->|docker push| DockerHub
    JenkinsEC2 -->|git commit tag| GitHub
    ArgoServer -->|GitOps Sync| GitHub
    ArgoController -->|Deploy / Reconcile| AppPods
    AppELB -->|Port 80 -> 30080| AppPods
    ArgoELB -->|Port 443 -> 32169| ArgoServer
    GrafanaELB -->|Port 80 -> 31147| GrafanaServer
    Browser --> AppELB
    Browser --> ArgoELB
    Browser --> GrafanaELB
    AppPods --> MongoStateful
    PrometheusServer --> AppPods
    PrometheusServer --> NodeExporter
    GrafanaServer --> PrometheusServer
    MetricsServer --> HPA
    HPA -.->|Scale 2-5| AppPods
```

---

## 2. Infrastructure as Code (Terraform) Blueprint

| Component | AWS Resource | Specification / Configuration |
| :--- | :--- | :--- |
| **VPC** | `aws_vpc` | CIDR: `10.0.0.0/16`, DNS Hostnames & Support enabled |
| **Public Subnets** | `aws_subnet` | `10.0.1.0/24`, `10.0.2.0/24` (Auto-assign public IP) |
| **Private Subnets** | `aws_subnet` | `10.0.3.0/24`, `10.0.4.0/24` (Worker nodes isolate internet ingress) |
| **Intra Subnets** | `aws_subnet` | `10.0.5.0/24`, `10.0.6.0/24` (Control plane communication) |
| **NAT Gateway** | `aws_nat_gateway` | Single NAT Gateway with Elastic IP in `ap-south-1a` for egress updates |
| **EKS Control Plane** | `aws_eks_cluster` | Kubernetes version `1.31`, public/private API endpoint access |
| **Managed Node Group**| `aws_eks_node_group` | Instance type: `t3.large`, SPOT capacity, Min: 2, Desired: 2, Max: 3 |
| **Security Groups** | `aws_security_group` | NodePort range `30000-32767` explicitly allowed from VPC & ELB |

---

## 3. DevSecOps CI/CD Pipeline Architecture

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant Git as GitHub (Harvesto Repo)
    participant CI as Jenkins (Automation EC2)
    participant Sec as Trivy Security Scanner
    participant Reg as Docker Hub
    participant CD as Argo CD (GitOps Controller)
    participant K8s as Amazon EKS Cluster

    Dev->>Git: git push origin main
    Git->>CI: Trigger Build via GitHub Webhook
    CI->>CI: Initialize & Clean Workspace
    CI->>CI: Run Tests (npm test / node --test)
    CI->>Sec: Trivy Filesystem Scan (Vulnerabilities check)
    Sec-->>CI: Security Gate Passed (Exit Code 0)
    CI->>CI: Multi-Stage Docker Build (App & Migration)
    CI->>Sec: Trivy Image Scan (CRITICAL severity filter)
    Sec-->>CI: Image Scan Passed
    CI->>Reg: Sequential Push: harvesto-app:TAG & latest
    CI->>Reg: Sequential Push: harvesto-migration:TAG & latest
    CI->>Git: Update kubernetes/09-deployment.yaml with new TAG [ci skip]
    CD->>Git: GitOps Poll / Webhook detects new manifest commit
    CD->>K8s: PreSync Hook: Execute Database Migration Job
    K8s-->>CD: Migration Succeeded
    CD->>K8s: Rolling Update Deployment: harvesto (Zero Downtime)
    K8s->>K8s: Health Probes Passed (startup, liveness, readiness)
    CD-->>Dev: Pipeline & Deployment Status: Synced & Healthy
```

---

## 4. Kubernetes Resource Layout

* **Namespace: `harvesto`**
  * `01-namespace.yaml`: Enforces logical multi-tenant isolation.
  * `02-mongodb-pv.yaml` & `03-mongodb-pvc.yaml`: Persistent volume claim for database storage.
  * `04-configmap.yaml` & `05-secrets.yaml`: Decoupled runtime configuration and credentials.
  * `06-mongodb-service.yaml`: ClusterIP service (`mongodb-service:27017`).
  * `07-mongodb-statefulset.yaml`: Single replica MongoDB 7.0 stateful engine.
  * `08-migration-job.yaml`: PreSync lifecycle hook for database schema and seed updates.
  * `09-deployment.yaml`: RollingUpdate Deployment (2 replicas minimum, container port 5000).
  * `10-service.yaml`: Public AWS LoadBalancer service (Port 80 -> NodePort 30080).
  * `11-hpa.yaml`: Horizontal Pod Autoscaler scaling from 2 to 5 pods when CPU exceeds 70%.

---

## 5. Network Routing & Port Mapping Matrix

| Service | Protocol | External Port | NodePort | Container Port | Security Boundary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Harvesto Web App** | HTTP | `80` | `30080` | `5000` | Internet Facing via AWS ELB |
| **Argo CD UI** | HTTPS | `443` | `32169` | `8080` (TLS) | Internet Facing via AWS ELB |
| **Grafana Dashboard** | HTTP | `80` | `31147` | `3000` | Internet Facing via AWS ELB |
| **Prometheus Server** | HTTP | `9090` | `32058` | `9090` | Internet Facing via AWS ELB |
| **Jenkins Automation**| HTTP | `8080` | N/A | Host `8080` | EC2 Public Subnet SG (0.0.0.0/0) |
| **MongoDB Service** | TCP | N/A | None | `27017` | Cluster-Internal Only (ClusterIP) |

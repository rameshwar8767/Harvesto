# 🛡️ Production Best Practices & SRE Runbook

This document defines the Site Reliability Engineering (SRE) operational standards, security baselines, cost optimization strategies, and incident response playbooks for the Harvesto cloud platform.

---

## 1. Security & Hardening Standards

### 1.1 Non-Root Container Execution
All production containers run under unprivileged system users:
* **Application Container:** Runs under user `node` (`USER node` in Dockerfile, UID 1000).
* **Linux Capabilities:** Disallow privilege escalation (`allowPrivilegeEscalation: false`).
* **Filesystem:** Read-only root filesystem with dedicated `/tmp` scratch storage.

### 1.2 Secrets & Credential Isolation
* Secrets are stored in Kubernetes `v1/Secret` objects and injected as environment variables.
* No credentials, private tokens, or passwords are hardcoded in Git repositories or Docker images.
* Cloud API credentials use AWS IAM Roles for Service Accounts (IRSA) with least-privilege scoping.

### 1.3 HTTP Defense-in-Depth Headers
Enforced at the reverse-proxy and application level:
* `X-Content-Type-Options: nosniff` (Prevents MIME-sniffing attacks)
* `X-Frame-Options: DENY` (Mitigates clickjacking)
* `X-XSS-Protection: 1; mode=block` (Blocks reflected XSS)
* `Referrer-Policy: strict-origin-when-cross-origin` (Protects referrer data)
* Removal of `X-Powered-By` header (Prevents tech stack fingerprinting)

---

## 2. Cloud Cost Optimization

Harvesto employs aggressive cost optimization patterns:

### 2.1 EC2 Spot Instances
The EKS Managed Node Group utilizes AWS Spot Instances (`capacity_type = "SPOT"`, `t3.large`), reducing compute costs by up to **70-80%** compared to On-Demand pricing.

### 2.2 Horizontal Pod Autoscaling (HPA)
Instead of over-provisioning static pod counts:
* Baselines at **2 replicas** during quiet hours.
* Scales dynamically up to **5 replicas** only during traffic spikes, ensuring optimal resource utilization.

### 2.3 Single NAT Gateway Architecture
AWS charges hourly for every NAT Gateway provisioned per Availability Zone. Harvesto deploys a single NAT Gateway in `ap-south-1a` with route table sharing across all private subnets, cutting data processing and gateway idle costs by 50%.

---

## 3. Disaster Recovery & Backup Playbook

### 3.1 MongoDB Data Snapshot
Backup MongoDB database:
```powershell
kubectl exec -it mongodb-0 -n harvesto -- mongodump --db harvesto --out /data/db/backup
```
Copy backup archive to local machine or S3:
```powershell
kubectl cp harvesto/mongodb-0:/data/db/backup ./mongodb-backup-$(Get-Date -Format "yyyyMMdd")
```

### 3.2 MongoDB Restore
Restore database from an archive:
```powershell
kubectl cp ./mongodb-backup harvesto/mongodb-0:/data/db/restore
kubectl exec -it mongodb-0 -n harvesto -- mongorestore --db harvesto /data/db/restore/harvesto
```

---

## 4. On-Call Incident Response Playbook

### Incident A: Pods in `CrashLoopBackOff`
1. Check pod events:
   ```powershell
   kubectl describe pod <POD_NAME> -n harvesto
   ```
2. Inspect previous container logs:
   ```powershell
   kubectl logs <POD_NAME> -n harvesto --previous
   ```
3. Common fixes:
   * Verify MongoDB connection string in `harvesto-config`.
   * Check for syntax or router exceptions.

### Incident B: Service Unavailable / 503 from LoadBalancer
1. Check if backend pods are ready:
   ```powershell
   kubectl get endpoints harvesto-service -n harvesto
   ```
2. If `ENDPOINTS` is `<none>`, check pod readiness probe failures.
3. Verify NodePort Security Group allows ingress from port range `30000-32767`.

### Incident C: Argo CD OutOfSync / Degraded
1. Force hard refresh in Argo CD:
   ```powershell
   argocd app get harvesto --refresh
   ```
2. Sync with replacement if schema changed:
   ```powershell
   argocd app sync harvesto --force --replace
   ```

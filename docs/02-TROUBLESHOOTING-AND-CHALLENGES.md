# 🛠️ Real-World Production Challenges & Troubleshooting Guide

This guide documents the real-world distributed system challenges, edge cases, and root causes encountered while building and deploying Harvesto on AWS EKS, along with battle-tested solutions.

---

## Challenge 1: The 29-Minute EKS NodeGroup Deadlock

### ⚠️ Symptom
During `terraform apply`, Terraform hung indefinitely:
```text
module.eks.module.eks_managed_node_group["harvesto-nodes"].aws_eks_node_group.this[0]: Still creating... [23m10s elapsed]
```
Worker nodes were launched in EC2, but Kubernetes never transitioned them to `Ready`.

### 🔍 Root Cause
A classic networking bootstrap deadlock:
* EKS managed nodes require the `vpc-cni` pod to be running on each node to allocate secondary ENI private IPs for pods.
* CoreDNS and kube-proxy addons were waiting for network routing, while the node group was waiting for CoreDNS and CNI to report health checks.

### 💡 Solution
1. Forcefully created core EKS addons via AWS CLI:
   ```bash
   aws eks create-addon --cluster-name harvesto-eks-cluster --addon-name vpc-cni --region ap-south-1
   aws eks create-addon --cluster-name harvesto-eks-cluster --addon-name kube-proxy --region ap-south-1
   aws eks create-addon --cluster-name harvesto-eks-cluster --addon-name coredns --region ap-south-1
   ```
2. Updated `terraform/eks.tf` with conflict resolution to prevent 409 errors on future runs:
   ```hcl
   addons = {
     coredns    = { most_recent = true, resolve_conflicts_on_create = "OVERWRITE" }
     kube-proxy = { most_recent = true, resolve_conflicts_on_create = "OVERWRITE" }
     vpc-cni    = { most_recent = true, resolve_conflicts_on_create = "OVERWRITE" }
   }
   ```
3. Nodes immediately transitioned to `Ready` status.

---

## Challenge 2: Java Regex Named Capturing Group Error in Jenkins Shared Library

### ⚠️ Symptom
The Jenkins pipeline failed at the `Update Kubernetes Manifests` stage:
```text
java.lang.IllegalArgumentException: named capturing group is missing trailing '}' 
at java.base/java.util.regex.Matcher.appendExpandedReplacement(Matcher.java:1096)
at update_k8s_manifests.call(update_k8s_manifests.groovy:73)
```

### 🔍 Root Cause
In `jenkins-shared-library/vars/update_k8s_manifests.groovy`:
```groovy
def authPushUrl = pushRepoUrl.replaceFirst('^(https?://)', "\$1\${GIT_USERNAME}:\${GIT_PASSWORD}@")
```
* In Groovy, `"\$1\${GIT_USERNAME}..."` evaluates to `"$1${GIT_USERNAME}..."` at runtime.
* In Java 9+, the regex replacement engine interprets `${name}` as a **named capture group reference** (like `(?<name>...)`).
* Because the regex was `^(https?://)` (which only defines numbered group 1 `$1`), Java tried to look up the named group `GIT_USERNAME:`, encountered `:` instead of `}`, and threw `IllegalArgumentException`.

### 💡 Solution
Eliminated regex replacement with literal string protocol manipulation and injected the credentials securely via standard shell environment parameter expansion:
```groovy
def cleanRepoUrl = pushRepoUrl.replaceFirst('^https?://', '')
sh """
    git push "https://\${GIT_USERNAME}:\${GIT_PASSWORD}@${cleanRepoUrl}" HEAD:"${gitBranch}"
"""
```
Jenkins securely masks credentials (`****`) in console logs without triggering regex parsing exceptions.

---

## Challenge 3: Parallel Docker Logout Race Condition

### ⚠️ Symptom
```text
+ docker push rameshwarrm/harvesto-app:latest
failed commit on ref "manifest-sha256:...": server message: insufficient_scope: authorization failed
```
Docker login succeeded initially, but pushing the main container image failed with an authorization error.

### 🔍 Root Cause
In `Jenkinsfile`, `Push Main App Image` and `Push Migration Image` ran in **parallel** on the same build agent:
```groovy
parallel {
    stage('Push Main App Image') { steps { docker_push(...) } }
    stage('Push Migration Image') { steps { docker_push(...) } }
}
```
* The migration image was tiny (~15 MB) and completed uploading in 2 seconds.
* `docker_push.groovy` executed its `finally { sh "docker logout || true" }` block.
* This immediately deleted `~/.docker/config.json` on the Jenkins worker.
* At that exact moment, the main application image (~300 MB) was still in the middle of uploading its final manifest layer. Because credentials had been wiped by the other stage, Docker Hub rejected the unauthenticated upload with `insufficient_scope: authorization failed`.

### 💡 Solution
Swapped parallel execution to **deterministic sequential execution**:
```groovy
stage('Push Docker Images') {
    steps {
        echo "==> Pushing Main Application Docker Image..."
        docker_push(imageName: env.DOCKER_IMAGE_NAME, imageTag: env.DOCKER_IMAGE_TAG, pushLatest: true)

        echo "==> Pushing Migration Docker Image..."
        docker_push(imageName: env.DOCKER_MIGRATION_IMAGE_NAME, imageTag: env.DOCKER_IMAGE_TAG, pushLatest: true)
    }
}
```

---

## Challenge 4: Kubernetes 256KB Client-Side CRD Annotation Limit

### ⚠️ Symptom
Installing Argo CD manifests via `kubectl apply` failed:
```text
The CustomResourceDefinition "applicationsets.argoproj.io" is invalid: 
metadata.annotations: Too long: must have at most 262144 bytes
```

### 🔍 Root Cause
`kubectl apply` saves the full manifest schema inside the `kubectl.kubernetes.io/last-applied-configuration` annotation. Kubernetes enforces a strict **256 KB (262,144 bytes)** limit on annotations. The `applicationsets.argoproj.io` CRD schema exceeds this size.

### 💡 Solution
Used **Server-Side Apply (`--server-side`)**, which delegates field management to the API server without creating the oversized client-side annotation:
```powershell
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml --server-side --force-conflicts
```

---

## Challenge 5: Completed Job Immutability in Argo CD GitOps Sync

### ⚠️ Symptom
Argo CD showed:
```text
APP HEALTH: Degraded
SYNC STATUS: Sync failed
Error: Job.batch "db-migration" is invalid: spec.template: Invalid value: field is immutable
```

### 🔍 Root Cause
In Kubernetes, once a batch `Job` finishes, its `spec.template` cannot be updated. When Jenkins updated the image tag from `126` to `131`, Argo CD attempted an in-place patch on the existing completed job, which Kubernetes rejected.

### 💡 Solution
Configured Argo CD resource lifecycle hook annotations in `kubernetes/08-migration-job.yaml`:
```yaml
metadata:
  name: db-migration
  namespace: harvesto
  annotations:
    argocd.argoproj.io/hook: Sync
    argocd.argoproj.io/hook-delete-policy: BeforeHookCreation
```
Argo CD now automatically deletes the previous migration job before spinning up the fresh job during each sync.

---

## Challenge 6: Express 5 Router Crash (`pathToRegexpError`)

### ⚠️ Symptom
The new container failed on startup:
```text
TypeError: Missing parameter name at 1: https://git.new/pathToRegexpError
    at name (/app/backend/node_modules/path-to-regexp/dist/index.js:73:19)
```
Pod entered `CrashLoopBackOff`.

### 🔍 Root Cause
`backend/package.json` was running **Express v5.1.0**. In Express 5, `path-to-regexp` v7/v8 deprecated legacy Express 4 wildcard catch-alls like `app.get('*')`.

### 💡 Solution
Replaced `app.get('*')` with Express 5-compatible standard middleware:
```javascript
// SPA Fallback for non-API routes
if (effectiveDistPath) {
    app.use((req, res, next) => {
        if (req.method === 'GET' && !req.path.startsWith('/api')) {
            return res.sendFile(path.join(effectiveDistPath, 'index.html'));
        }
        next();
    });
}
```

---

## Challenge 7: CORS 500 Internal Server Error & Strict MIME Type Rejection

### ⚠️ Symptom
The web browser failed to load the app when accessed via the AWS LoadBalancer URL:
```text
index-C8FSciqw.js:1 Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Refused to apply style from '.../index-Ja4Ribdr.css' because its MIME type ('application/json') is not a supported stylesheet
```

### 🔍 Root Cause
1. Modern browsers send `Origin` headers on Vite `<script type="module" crossorigin>` and `<link crossorigin>` tags.
2. The backend CORS middleware only allowed `localhost:5173` and threw `callback(new Error('Not allowed by CORS'))` when accessed via AWS ELB.
3. Express caught this error and sent HTTP 500 with a JSON payload (`{"success":false,"message":"Not allowed by CORS"}`).
4. The browser expected `text/css` but received `application/json`, failing strict MIME checks.

### 💡 Solution
Updated `backend/app.js` to dynamic origin reflection:
```javascript
app.use(cors({
    origin: true,
    credentials: true,
}));
```

---

## Challenge 8: 20-Minute Terraform Destroy VPC Dependency Violation

### ⚠️ Symptom
`terraform destroy` hung on VPC deletion for 20 minutes before failing:
```text
Error: deleting EC2 VPC (vpc-0bf0b183b8692135c): operation error EC2: DeleteVpc: api error DependencyViolation: The vpc has dependencies and cannot be deleted.
```

### 🔍 Root Cause
When Kubernetes creates `type: LoadBalancer` services out-of-band via `kubectl`, AWS provisions Classic/Network Load Balancers and Network Interfaces (ENIs) inside the VPC. Because Terraform did not manage these ELBs, it did not delete them, and AWS refused to delete subnets containing active ENIs.

### 💡 Solution
1. Ran automated cleanup script in PowerShell to delete orphan ELBs and available ENIs:
   ```powershell
   $elbs = (aws elb describe-load-balancers --region ap-south-1 --query "LoadBalancerDescriptions[?VPCId=='<VPC_ID>'].LoadBalancerName" --output text) -split "\s+"
   foreach ($elb in $elbs) { if ($elb) { aws elb delete-load-balancer --region ap-south-1 --load-balancer-name $elb } }
   ```
2. Codified all cluster ingress and observability services in `terraform/helm_apps.tf` using the `helm_release` provider. Now `terraform destroy` automatically destroys Helm releases and ELBs first, followed by the VPC in under 30 seconds.

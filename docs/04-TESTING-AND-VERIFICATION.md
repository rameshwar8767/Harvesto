# 🧪 Verification, Testing & Quality Assurance Runbook

This document outlines the testing protocols used to ensure zero regressions, security compliance, autoscaling responsiveness, and system resiliency across the Harvesto platform.

---

## 1. Unit & Integration Testing

The backend test suite verifies Express API routes, health probes, and security middlewares.

### Running Backend Tests Locally
```powershell
cd C:\Users\Rameshwar\Desktop\Harvesto\backend
npm test
```

### Test Scope & Coverage
* `GET /api/health`: Confirms service uptime, status 200, and timestamp.
* `GET /api/health/metrics`: Verifies memory usage (RSS, Heap), process uptime, Node.js version, and MongoDB connection readiness.
* `GET /`: Validates fallback banner when static assets are not mounted.
* `securityHeaders`: Validates injection of strict HTTP headers (`nosniff`, `DENY`, `1; mode=block`, `strict-origin-when-cross-origin`) and removal of `X-Powered-By`.
* `sanitizeInput`: Validates recursive stripping of NoSQL query injection characters (`$`).
* `rateLimiter`: Validates rate limit throttling and HTTP 429 response formatting.

---

## 2. DevSecOps Vulnerability Scanning (Trivy)

Security scanning is integrated into the Jenkins CI pipeline as an automated quality gate.

### 2.1 Filesystem Vulnerability Scan
Scans project dependencies (`package.json`, `package-lock.json`):
```bash
trivy fs --severity HIGH,CRITICAL --exit-code 0 .
```

### 2.2 Container Image Vulnerability Scan
Scans production container images before pushing to registry:
```bash
trivy image --severity CRITICAL --exit-code 0 rameshwarrm/harvesto-app:latest
trivy image --severity CRITICAL --exit-code 0 rameshwarrm/harvesto-migration:latest
```

---

## 3. Production Health Probes & Telemetry Verification

### 3.1 Kubernetes Health Endpoints
Verify startup, liveness, and readiness probes:
```powershell
kubectl get pods -n harvesto
kubectl describe pod -l app=harvesto -n harvesto
```

Check logs for clean startup:
```powershell
kubectl logs -l app=harvesto -n harvesto --tail=50
```

### 3.2 Live Telemetry Check
Send HTTP request to the live LoadBalancer health metrics endpoint:
```powershell
curl http://<APP_LOADBALANCER_URL>/api/health/metrics
```
Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-11-15T21:40:00.000Z",
  "uptimeSeconds": 1420,
  "database": {
    "status": "connected",
    "host": "mongodb-service.harvesto.svc.cluster.local",
    "name": "harvesto"
  },
  "memory": {
    "rssMB": "58.12",
    "heapUsedMB": "24.30",
    "heapTotalMB": "32.10"
  }
}
```

---

## 4. Horizontal Pod Autoscaler (HPA) Load Testing

Simulate high CPU load to verify that the Kubernetes Horizontal Pod Autoscaler dynamically scales pods from 2 to 5 replicas.

### 4.1 Check Current HPA Status
```powershell
kubectl get hpa -n harvesto
```

### 4.2 Generate Load with ApacheBench or BusyBox
Run a busybox load generator pod in the cluster:
```powershell
kubectl run load-generator --rm -i --tty --image=busybox:latest -n harvesto -- /bin/sh -c "while true; do wget -q -O- http://harvesto-service.harvesto.svc.cluster.local:80/api/health; done"
```

### 4.3 Observe Dynamic Scaling
In a separate terminal, watch HPA metrics and pod scale-out:
```powershell
kubectl get hpa -n harvesto -w
```
Expected behavior:
* CPU utilization climbs from `0%` to `>70%`.
* HPA scales Deployment replicas: `2 ➔ 3 ➔ 5`.
* New pods transition to `Running (1/1)`.
* Terminate the `load-generator` (`Ctrl + C`).
* HPA cools down and scales back to `2` minimum replicas after stabilization window.

---

## 5. Chaos Engineering & Resilience Scenarios

### Scenario A: Pod Failure Simulation
Kill a running application pod:
```powershell
kubectl delete pod $(kubectl get pods -n harvesto -l app=harvesto -o jsonpath="{.items[0].metadata.name}") -n harvesto
```
* **Expected Result:** Deployment immediately launches a replacement replica. Zero downtime observed on the public LoadBalancer.

### Scenario B: Database State Persistence
Add data to the application, then delete the MongoDB pod:
```powershell
kubectl delete pod mongodb-0 -n harvesto
```
* **Expected Result:** The StatefulSet controller reattaches the existing EBS PersistentVolume (`mongodb-pvc`). Data remains intact upon pod recreation.

# 📚 Harvesto Enterprise Documentation Hub

Welcome to the comprehensive technical documentation for **Harvesto**, a cloud-native, production-grade e-commerce platform deployed on Amazon Web Services (AWS) using EKS, Terraform, Jenkins, Docker, Argo CD, and Prometheus/Grafana.

---

## 📑 Documentation Index

| Document | Description | Key Focus Areas |
| :--- | :--- | :--- |
| **[01-ARCHITECTURE.md](./01-ARCHITECTURE.md)** | High-Level & Low-Level System Architecture | Topology, VPC Subnets, Microservices, CI/CD Pipeline, Port Mapping Matrix |
| **[02-TROUBLESHOOTING-AND-CHALLENGES.md](./02-TROUBLESHOOTING-AND-CHALLENGES.md)** | Real-World Incidents & Troubleshooting | 8 production edge-cases, root causes, Groovy regex errors, Docker race conditions, Express 5 fixes |
| **[03-STEP-BY-STEP-DEPLOYMENT-GUIDE.md](./03-STEP-BY-STEP-DEPLOYMENT-GUIDE.md)** | End-to-End Hands-On Deployment Guide | Exact CLI commands for Terraform, EKS, Jenkins, Argo CD, Prometheus, Grafana |
| **[04-TESTING-AND-VERIFICATION.md](./04-TESTING-AND-VERIFICATION.md)** | Quality Assurance & SRE Verification Runbook | Unit tests, Trivy vulnerability scans, HPA load testing, Chaos engineering |
| **[05-PRODUCTION-BEST-PRACTICES-AND-RUNBOOK.md](./05-PRODUCTION-BEST-PRACTICES-AND-RUNBOOK.md)** | SRE Standards, Security & Incident Response | Non-root containers, Spot instance cost optimization, Disaster recovery, On-call playbooks |

---

## 🛠️ Quick Architecture Summary

```
Developer Push ➔ GitHub ➔ Jenkins CI ➔ Trivy Scan ➔ Docker Hub ➔ GitOps Tag Update ➔ Argo CD Sync ➔ AWS EKS Cluster
                                                                                                      ├── Harvesto Pods (HPA: 2-5)
                                                                                                      ├── MongoDB 7.0 StatefulSet
                                                                                                      ├── Prometheus & Node Exporter
                                                                                                      └── Grafana Dashboards
```

---

## 🤝 Contribution & Maintenance
* **Maintained by:** Harvesto DevOps & Engineering Team
* **License:** ISC
* **Cloud Provider:** Amazon Web Services (AWS - `ap-south-1`)

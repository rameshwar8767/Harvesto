# ==============================================================================
# Managed Kubernetes Add-ons & Observability Stack (Automated Lifecycle)
# All LoadBalancers are tracked in Terraform state so "terraform destroy"
# cleanly removes all AWS LoadBalancers and ENIs before destroying VPC.
# ==============================================================================

# 1. Kubernetes Metrics Server (Required for HPA / Resource Metrics)
resource "helm_release" "metrics_server" {
  name             = "metrics-server"
  repository       = "https://kubernetes-sigs.github.io/metrics-server/"
  chart            = "metrics-server"
  namespace        = "kube-system"
  version          = "~> 3.12"
  cleanup_on_fail  = true
  timeout          = 600

  set {
    name  = "args[0]"
    value = "--kubelet-insecure-tls"
  }

  depends_on = [module.eks]
}

# 2. Argo CD with AWS Public Load Balancer
resource "helm_release" "argocd" {
  name             = "argocd"
  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-cd"
  namespace        = "argocd"
  create_namespace = true
  version          = "~> 7.7"
  cleanup_on_fail  = true
  timeout          = 900

  set {
    name  = "server.service.type"
    value = "LoadBalancer"
  }

  set {
    name  = "server.service.annotations.service\\.beta\\.kubernetes\\.io/aws-load-balancer-scheme"
    value = "internet-facing"
  }

  depends_on = [module.eks]
}

# 3. Kube Prometheus Stack (Prometheus + Grafana with AWS Public Load Balancer)
resource "helm_release" "prometheus_stack" {
  name             = "prometheus"
  repository       = "https://prometheus-community.github.io/helm-charts"
  chart            = "kube-prometheus-stack"
  namespace        = "monitoring"
  create_namespace = true
  version          = "~> 66.3"
  cleanup_on_fail  = true
  timeout          = 1200

  # Expose Grafana via Public Load Balancer
  set {
    name  = "grafana.service.type"
    value = "LoadBalancer"
  }

  set {
    name  = "grafana.service.annotations.service\\.beta\\.kubernetes\\.io/aws-load-balancer-scheme"
    value = "internet-facing"
  }

  # Set predictable admin password
  set {
    name  = "grafana.adminPassword"
    value = "admin123"
  }

  # Expose Prometheus via Public Load Balancer
  set {
    name  = "prometheus.service.type"
    value = "LoadBalancer"
  }

  set {
    name  = "prometheus.service.annotations.service\\.beta\\.kubernetes\\.io/aws-load-balancer-scheme"
    value = "internet-facing"
  }

  depends_on = [module.eks]
}

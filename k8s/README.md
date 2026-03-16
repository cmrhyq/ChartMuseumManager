# ChartMuseum Manager Kubernetes 部署

本目录包含将 ChartMuseum Manager 部署到 Kubernetes 的相关配置文件。

## 文件说明

| 文件 | 说明 |
|------|------|
| `deployment.yaml` | Deployment 配置，定义 Pod 副本、资源限制、健康检查等 |
| `service.yaml` | Service 配置，提供集群内部访问 |
| `ingress.yaml` | Ingress 配置，提供集群外部访问 |
| `configmap.yaml` | ConfigMap 配置，存储应用配置 |
| `kustomization.yaml` | Kustomize 配置，统一管理所有资源 |

## 部署方式

### 方式一：使用 kubectl 逐个部署

```bash
kubectl apply -f configmap.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
```

### 方式二：使用 Kustomize 一键部署

```bash
kubectl apply -k .
```

### 方式三：指定命名空间部署

```bash
kubectl apply -k . -n your-namespace
```

## 配置说明

### 镜像配置

修改 `deployment.yaml` 中的镜像地址：

```yaml
image: your-registry/chartmuseum-manager:latest
```

### Ingress 域名

修改 `ingress.yaml` 中的域名：

```yaml
rules:
  - host: your-domain.example.com
```

### 资源配置

根据实际需求调整 `deployment.yaml` 中的资源限制：

```yaml
resources:
  requests:
    cpu: 50m
    memory: 64Mi
  limits:
    cpu: 200m
    memory: 128Mi
```

## 验证部署

```bash
# 查看 Pod 状态
kubectl get pods -l app=chartmuseum-manager

# 查看 Service
kubectl get svc chartmuseum-manager

# 查看 Ingress
kubectl get ingress chartmuseum-manager

# 查看 Pod 日志
kubectl logs -l app=chartmuseum-manager
```

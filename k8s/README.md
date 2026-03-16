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

### 镜像配置（推荐通过 Kustomize 管理）

- 不建议直接在 `deployment.yaml` 中硬编码镜像 registry 与 tag，便于在不同环境中复用同一套清单。
- 本目录通过 `kustomization.yaml` 中的 `images` 段统一管理镜像：

```yaml
images:
  - name: chart-museum-manager
    newName: your-registry/chartmuseum-manager
    newTag: latest
```

当需要切换镜像仓库或版本时，仅需修改 `kustomization.yaml`，而无需改动 `deployment.yaml`。

### Ingress 域名

修改 `ingress.yaml` 中的域名：

```yaml
rules:
  - host: your-domain.example.com
```

生产环境建议：

- 在 `ingress.yaml` 中为对应域名配置 `tls` 段并提供合法证书；
- 将 `nginx.ingress.kubernetes.io/ssl-redirect` 设置为 `"true"`，确保 HTTP 请求自动跳转到 HTTPS；
- 若在上游网关或负载均衡器终止 TLS，可根据实际架构调整是否在 Ingress 层再次跳转。

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

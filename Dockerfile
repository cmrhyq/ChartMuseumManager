# 生产阶段 - 使用 nginx 提供静态文件服务
FROM registry.cn-shenzhen.aliyuncs.com/amgs/nginx:latest

# 构建参数 - 用于镜像标签
ARG BUILD_DATE
ARG VERSION
ARG COMMIT_SHA

# 镜像标签
LABEL org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${COMMIT_SHA}" \
      org.opencontainers.image.title="ChartMuseum Manager" \
      org.opencontainers.image.description="ChartMuseum Manager Web UI" \
      org.opencontainers.image.source="https://github.com/cmrhyq/chartmuseum-manager"

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物（由 CI 构建完成）
COPY dist /usr/share/nginx/html

# 设置宽松的文件权限，确保任何用户都可以读取静态文件
# 这对于 Kubernetes 中可能以不同 UID 运行的场景很重要
RUN chmod -R 755 /usr/share/nginx/html && \
    find /usr/share/nginx/html -type f -exec chmod 644 {} \; && \
    # 确保 nginx 缓存和日志目录可写
    chmod -R 777 /var/cache/nginx && \
    chmod -R 777 /var/log/nginx && \
    chmod -R 777 /var/run

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# 以 root 用户运行 nginx（nginx 会自动降权到 worker 进程）
# 如需非 root 运行，请使用 nginx-unprivileged 镜像
CMD ["nginx", "-g", "daemon off;"]

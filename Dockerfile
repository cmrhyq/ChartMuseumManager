# 生产阶段 - 使用 nginx 提供静态文件服务
FROM registry.cn-shenzhen.aliyuncs.com/amgs/nginx:latest

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物（由 Jenkins 构建完成）
COPY dist /usr/share/nginx/html

# 确保文件属于 nginx 用户（大多数 nginx 镜像使用 nginx 用户，UID 通常是 101）
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    find /usr/share/nginx/html -type f -exec chmod 644 {} \;

# 明确指定以 nginx 用户运行
USER nginx

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]

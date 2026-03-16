# 生产阶段 - 使用 nginx 提供静态文件服务
FROM registry.cn-shenzhen.aliyuncs.com/amgs/nginx:latest

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物（由 Jenkins 构建完成）
COPY dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]

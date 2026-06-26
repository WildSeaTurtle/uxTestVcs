FROM nginxinc/nginx-unprivileged:mainline-alpine-slim
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/ /usr/share/nginx/html/vcs/

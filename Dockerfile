FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY *.html *.css *.png *.jpg *.webp /usr/share/nginx/html/
EXPOSE 80

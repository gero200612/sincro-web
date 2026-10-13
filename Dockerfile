FROM nginx:1.27-alpine
COPY *.html *.css *.png *.jpg *.webp /usr/share/nginx/html/
EXPOSE 80

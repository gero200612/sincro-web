FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY *.html *.css *.js *.png *.jpg *.webp /usr/share/nginx/html/
COPY img/ /usr/share/nginx/html/img/
EXPOSE 80

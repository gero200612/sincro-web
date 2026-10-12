FROM nginx:1.27-alpine
COPY index.html privacidad.html estilo.css logo.png /usr/share/nginx/html/
EXPOSE 80

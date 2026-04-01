# Usamos la imagen oficial, ultraligera de Nginx basada en Alpine Linux
FROM nginx:alpine

# Copiamos todo el contenido de nuestra carpeta actual al directorio que Nginx utiliza para servir webs estáticas
COPY . /usr/share/nginx/html/

# Exponemos el puerto 80, que Railway mapeará de forma automática
EXPOSE 80

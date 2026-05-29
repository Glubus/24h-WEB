FROM forge-registry.iut-larochelle.fr/nginx/nginx-1.23.3

# Copy nginx config
COPY ./build/nginx/conf/default.conf /etc/nginx/conf.d/default.conf

# Create de app directory
RUN mkdir -p /app/sfapi

# Copy Symfony public files for production images
COPY ./sfapi/public /app/sfapi/public

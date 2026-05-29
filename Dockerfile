# Multi-stage build for Symfony application with nginx

# Stage 1: Build the Symfony application
FROM forge-registry.iut-larochelle.fr/php-fpm-composer/iutlr-info-php8.2-fpm-composer2 as builder

# Login to container as root user
USER root

# Symfony dev environment
ENV APP_ENV=prod

# Copy php configuration
COPY ./build/sfapi/conf/default.ini /usr/local/etc/php/conf.d/default.ini

# Set working directory
WORKDIR /app/sfapi

# Arguments defined in compose.yml
ARG USER_NAME
ARG USER_ID
ARG GROUP_NAME
ARG GROUP_ID

# Create system user to run Composer and PHP Commands
RUN if [ ! -z ${USER_NAME} ] && [ ! -z ${GROUP_NAME} ] && [ ${USER_ID:-0} -ne 0 ] && [ ${GROUP_ID:-0} -ne 0 ] ; then \
    useradd -G www-data,root -u $USER_ID -d /home/$USER_NAME $USER_NAME && \
    mkdir -p /home/$USER_NAME/.composer  && \
    chown -Rf ${USER_NAME}:${GROUP_NAME} /home/$USER_NAME  && \
    chown -R ${USER_NAME}:${GROUP_NAME} /app \
    ; fi

# Copy all Symfony application files first
COPY ./sfapi ./

# Install PHP dependencies (including dev dependencies for MonologBundle)
RUN composer install --optimize-autoloader --no-interaction

# Build assets (if any)
RUN php bin/console assets:install --no-interaction

# Final stage: PHP-FPM server for production
FROM forge-registry.iut-larochelle.fr/php-fpm-composer/iutlr-info-php8.2-fpm-composer2

# Copy built application from builder stage
COPY --from=builder /app /app

# Set working directory
WORKDIR /app/sfapi

# Set proper permissions for PHP-FPM
RUN chown -R www-data:www-data /app && chmod -R 755 /app

# Default command (will be overridden by deployment)
CMD ["php-fpm"]

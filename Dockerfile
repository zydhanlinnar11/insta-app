FROM php@sha256:635da5d54fcd6bc2c4355984717c6b3ab798a18a1595861743af0f795e380f24 AS base

WORKDIR /var/www/html

FROM base AS builder

RUN apk add --no-cache \
    nodejs \
    npm

COPY package.json package-lock.json ./
RUN npm ci 
COPY . .
RUN npm run build

FROM base AS runner

COPY build/supervisord.ini /etc/supervisor.d/supervisord.ini
COPY build/laravel.conf /etc/nginx/http.d/default.conf
COPY build/php-jakarta-timezone.ini /usr/local/etc/php/conf.d/php-jakarta-timezone.ini

WORKDIR /var/www/html
COPY . .
COPY --from=composer:2.8.8 /usr/bin/composer /usr/bin/composer
RUN composer install --optimize-autoloader --no-dev
COPY --from=builder /var/www/html/public/build /var/www/html/public/build

RUN echo "Asia/Jakarta" > /etc/timezone \
    # Configure supervisor
    && apk add --no-cache supervisor nginx \
    && mkdir -p /var/log/supervisord/ \
    && php artisan storage:link \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && rm /usr/bin/composer

EXPOSE 80

CMD ["sh", "-c", "php artisan optimize && /usr/bin/supervisord -c /etc/supervisor.d/supervisord.ini"]

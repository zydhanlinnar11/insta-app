FROM php@sha256:635da5d54fcd6bc2c4355984717c6b3ab798a18a1595861743af0f795e380f24 AS base

FROM base AS installer

WORKDIR /app
RUN apk add --no-cache \
    nodejs \
    npm

COPY package.json package-lock.json /app/
RUN npm ci

# Install Composer
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer
COPY composer.json composer.lock /app/
RUN composer install --no-autoloader --no-dev

FROM base AS builder

WORKDIR /app
RUN apk add --no-cache \
    nodejs \
    npm

COPY --from=composer:2.8.8 /usr/bin/composer /usr/bin/composer
COPY --from=installer /app/vendor /app/node_modules /app/
COPY . /app/
RUN composer dump-autoload -o
RUN npm run build

FROM base AS runner

COPY build/supervisord.ini /etc/supervisor.d/supervisord.ini
COPY build/laravel.conf /etc/nginx/http.d/default.conf
COPY build/php-jakarta-timezone.ini /usr/local/etc/php/conf.d/php-jakarta-timezone.ini

WORKDIR /var/www/html
COPY . .
COPY --from=builder /app/vendor .
COPY --from=builder /app/public/build .
RUN echo "Asia/Jakarta" > /etc/timezone \
    # Configure supervisor
    && apk add --no-cache supervisor nginx \
    && mkdir -p /var/log/supervisord/ \
    && php artisan storage:link \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

CMD ["sh", "-c", "php artisan optimize && /usr/bin/supervisord -c /etc/supervisor.d/supervisord.ini"]

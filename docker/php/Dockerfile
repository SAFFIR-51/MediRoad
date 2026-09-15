# 로컬 테스트용 PHP + Apache (카페24 웹호스팅과 비슷한 구성: mod_rewrite, .htaccess, PDO MySQL, GD)
FROM php:8.2-apache

RUN apt-get update \
 && apt-get install -y --no-install-recommends libjpeg62-turbo-dev libpng-dev libwebp-dev libfreetype6-dev \
 && docker-php-ext-configure gd --with-jpeg --with-webp --with-freetype \
 && docker-php-ext-install -j"$(nproc)" gd pdo_mysql exif \
 && a2enmod rewrite headers \
 && sed -ri 's!AllowOverride None!AllowOverride All!g' /etc/apache2/apache2.conf \
 && rm -rf /var/lib/apt/lists/*

COPY php.ini /usr/local/etc/php/conf.d/mediroad.ini

#!/bin/bash

echo "-> Frontend papkasiga kirilmoqda..."
cd /home/evikouz/eviko_new/frontend || exit

echo "-> Eski kutubxonalar o'chirilmoqda..."
rm -rf node_modules package-lock.json .next

echo "-> npm cPanel xatolari tozalanmoqda..."
export NODE_ENV=development
unset NPM_CONFIG_PREFIX
unset NPM_CONFIG_GLOBAL

echo "-> O'rnatish yo'li (npm root):"
npm root

echo "-> Barcha kutubxonalar 0 dan aniq shu papkaga o'rnatilmoqda..."
npm install --prefix . --include=dev --ignore-scripts --no-package-lock

echo "-> O'rnatilganlar tekshirilmoqda:"
ls -la node_modules/.bin/next || echo "XATO: next topilmadi!"
ls -la node_modules/@prisma/client || echo "XATO: @prisma/client topilmadi!"

echo "-> Prisma ulashilmoqda..."
npx prisma@5.22.0 generate --schema=/home/evikouz/eviko_new/frontend/prisma/schema.prisma

echo "-> Loyiha Build qilinmoqda..."
export NODE_ENV=production
npm run build

echo "-> TABRIKLAYMIZ! Barcha qadamlar yakunlandi."

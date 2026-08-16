#!/bin/bash

echo "-> Frontend papkasiga kirilmoqda..."
cd /home/evikouz/eviko_new/frontend || exit

echo "-> Eski xato o'rnatilgan kutubxonalar tozalanmoqda..."
rm -rf node_modules package-lock.json .next

echo "-> Barcha kutubxonalar (dasturchi rejimida) skriptlarsiz o'rnatilmoqda..."
export NODE_ENV=development
npm install --ignore-scripts

echo "-> Prisma ulashilmoqda..."
npx prisma@5.22.0 generate --schema=/home/evikouz/eviko_new/frontend/prisma/schema.prisma

echo "-> Loyiha Server uchun qurilmoqda (Build)..."
export NODE_ENV=production
npm run build

echo "-> TABRIKLAYMIZ! Barcha qadamlar muvaffaqiyatli yakunlandi."
echo "-> Endi cPanel'dan Node.js App ni 'Restart' qilib yuboring!"

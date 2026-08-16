#!/bin/bash

echo "-> Frontend papkasiga kirilmoqda..."
cd /home/evikouz/eviko_new/frontend || exit

echo "-> Eski fayllar o'chirilmoqda..."
rm -rf node_modules package-lock.json .next

echo "-> Barcha kutubxonalar o'rnatilmoqda (1-bosqich)..."
export NODE_ENV=development
npm install --ignore-scripts

echo "-> Asosiy kerakli kutubxonalar majburan o'rnatilmoqda (2-bosqich)..."
npm install next@14.2.5 @prisma/client@5.22.0 prisma@5.22.0 tailwindcss postcss autoprefixer --ignore-scripts

echo "-> O'rnatilganlar holati:"
ls -la node_modules/.bin/next || echo "NEXT topilmadi!"

echo "-> Prisma ulashilmoqda..."
npx prisma@5.22.0 generate --schema=prisma/schema.prisma

echo "-> Loyiha Server uchun qurilmoqda (Build)..."
export NODE_ENV=production
npx next build

echo "-> Barcha qadamlar yakunlandi."

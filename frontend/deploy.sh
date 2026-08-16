#!/bin/bash

echo "-> Frontend papkasiga kirilmoqda..."
cd /home/evikouz/eviko_new/frontend || exit

echo "-> Eski kutubxonalar o'chirilmoqda..."
rm -rf node_modules package-lock.json .next package-lock.json.backup
# Ehtiyot shart nomi o'zgartirilmoqda
mv node_modules node_modules_old 2>/dev/null

echo "-> npm sozlamalari to'g'irlanmoqda..."
npm config set production false
export NODE_ENV=development

echo "-> Barcha kutubxonalar 0 dan o'rnatilmoqda..."
npm install --production=false --ignore-scripts --force --no-package-lock

echo "-> O'rnatilganlar tekshirilmoqda:"
ls -la node_modules/.bin/next || echo "XATO: next topilmadi!"
ls -la node_modules/@prisma/client || echo "XATO: @prisma/client topilmadi!"

echo "-> Prisma ulashilmoqda..."
npx prisma@5.22.0 generate --schema=/home/evikouz/eviko_new/frontend/prisma/schema.prisma

echo "-> Loyiha Build qilinmoqda..."
export NODE_ENV=production
npm run build

echo "-> TABRIKLAYMIZ! Barcha qadamlar muvaffaqiyatli yakunlandi."

#!/bin/bash

echo "-> Frontend papkasiga kirilmoqda..."
cd /home/evikouz/eviko_new/frontend || exit

echo "-> Eski xato o'rnatilgan kutubxonalar tozalanmoqda..."
rm -rf node_modules package-lock.json .next
rm -rf package-lock.json.backup node_modules_old

echo "-> npm cPanel xatolari tozalanmoqda..."
export NODE_ENV=development
unset NPM_CONFIG_PREFIX
unset NPM_CONFIG_GLOBAL

echo "-> Barcha kutubxonalar 0 dan o'rnatilmoqda..."
# --ignore-scripts olib tashlandi, endi npm tabiiy ishlaydi
npm install

echo "-> Loyiha Build qilinmoqda..."
export NODE_ENV=production
npm run build

echo "-> TABRIKLAYMIZ! Barcha qadamlar muvaffaqiyatli yakunlandi."

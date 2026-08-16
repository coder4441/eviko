#!/bin/bash

echo "-> Frontend papkasiga kirilmoqda..."
cd /home/evikouz/eviko_new/frontend || exit

echo "-> Yangi kodlar tortilmoqda..."
git pull

echo "-> Production kutubxonalari o'rnatilmoqda..."
export NODE_ENV=production
npm install --omit=dev

echo "-> Prisma generate (to'liq yo'l bilan)..."
NODEVENV_BIN="/home/evikouz/nodevenv/frontend/20/bin"
SCHEMA_PATH="/home/evikouz/eviko_new/frontend/prisma/schema.prisma"

if [ -f "$NODEVENV_BIN/prisma" ]; then
    echo "   nodevenv prisma topildi..."
    "$NODEVENV_BIN/prisma" generate --schema="$SCHEMA_PATH" && echo "   ✅ Prisma OK" || echo "   ⚠️  Prisma xato (davom etiladi)"
elif [ -f "node_modules/.bin/prisma" ]; then
    node_modules/.bin/prisma generate --schema="$SCHEMA_PATH" && echo "   ✅ Prisma OK" || echo "   ⚠️  Prisma xato (davom etiladi)"
else
    echo "   ⚠️  Prisma binary topilmadi, o'tkazib yuborilmoqda..."
fi

echo "-> .next papkasi mavjudligi tekshirilmoqda..."
if [ -d ".next" ]; then
    echo "   ✅ .next papkasi topildi - Build shart emas!"
else
    echo "   ❌ .next papkasi yo'q!"
fi

echo "-> TAYYOR! Endi cPanel'dan 'Restart' bosing."

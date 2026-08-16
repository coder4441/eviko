#!/bin/bash

echo "-> Frontend papkasiga kirilmoqda..."
cd /home/evikouz/eviko_new/frontend || exit

echo "-> Yangi kodlar tortilmoqda..."
git pull

echo "-> Production kutubxonalari o'rnatilmoqda (build kerak emas)..."
export NODE_ENV=production
npm install --omit=dev

echo "-> Prisma generate (agar kerak bo'lsa)..."
NODEVENV_BIN="/home/evikouz/nodevenv/frontend/20/bin"
SCHEMA_PATH="/home/evikouz/eviko_new/frontend/prisma/schema.prisma"

if [ -f "$NODEVENV_BIN/prisma" ]; then
    "$NODEVENV_BIN/prisma" generate --schema="$SCHEMA_PATH" 2>/dev/null || true
elif [ -f "node_modules/.bin/prisma" ]; then
    node_modules/.bin/prisma generate --schema="$SCHEMA_PATH" 2>/dev/null || true
fi

echo "-> .next papkasi mavjudligi tekshirilmoqda..."
if [ -d ".next" ]; then
    echo "   ✅ .next papkasi topildi - Build shart emas!"
else
    echo "   ⚠️  .next papkasi yo'q, muammo bor!"
fi

echo "-> TAYYOR! Endi cPanel'dan 'Restart' bosing."

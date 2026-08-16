#!/bin/bash

echo "-> Frontend papkasiga kirilmoqda..."
cd /home/evikouz/eviko_new/frontend || exit

echo "-> Eski fayllar o'chirilmoqda..."
rm -rf node_modules package-lock.json .next

echo "-> npm install ishga tushirilmoqda..."
export NODE_ENV=development
npm install

echo "-> Binary yo'llari aniqlanmoqda..."
NODEVENV_BIN="/home/evikouz/nodevenv/frontend/20/bin"

echo "-> Prisma generate..."
SCHEMA_PATH="/home/evikouz/eviko_new/frontend/prisma/schema.prisma"
if [ -f "$NODEVENV_BIN/prisma" ]; then
    "$NODEVENV_BIN/prisma" generate --schema="$SCHEMA_PATH"
elif [ -f "node_modules/.bin/prisma" ]; then
    node_modules/.bin/prisma generate --schema="$SCHEMA_PATH"
else
    npx --yes prisma generate --schema="$SCHEMA_PATH"
fi

echo "-> Loyiha Build qilinmoqda (RAM tejash rejimida)..."
export NODE_ENV=production
# RAM muammosini hal qilish: max 512MB, single thread
export NODE_OPTIONS="--max-old-space-size=512"

if [ -f "$NODEVENV_BIN/next" ]; then
    echo "   nodevenv/next ishlatilmoqda..."
    "$NODEVENV_BIN/next" build
elif [ -f "node_modules/.bin/next" ]; then
    echo "   local next ishlatilmoqda..."
    node_modules/.bin/next build
elif [ -f "node_modules/next/dist/bin/next" ]; then
    echo "   node orqali next ishlatilmoqda..."
    node node_modules/next/dist/bin/next build
else
    npx next build
fi

echo "-> TUGADI!"

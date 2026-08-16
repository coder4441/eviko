#!/bin/bash

echo "-> Frontend papkasiga kirilmoqda..."
cd /home/evikouz/eviko_new/frontend || exit

echo "-> nodevenv binary yo'llari aniqlanmoqda..."
NODEVENV_BIN="/home/evikouz/nodevenv/frontend/20/bin"
NODE_BIN=$(which node)
NPM_BIN=$(which npm)

echo "   node: $NODE_BIN"
echo "   npm:  $NPM_BIN"
echo "   nodevenv bin: $NODEVENV_BIN"

echo "-> Eski fayllar o'chirilmoqda..."
rm -rf node_modules package-lock.json .next

echo "-> npm install ishga tushirilmoqda..."
npm install

echo "-> Mavjud binary fayllari tekshirilmoqda..."
ls -la "$NODEVENV_BIN/" | grep -E "next|prisma" || echo "nodevenv binda next/prisma yo'q"
ls -la node_modules/.bin/ | grep -E "next|prisma" || echo "local binlarda ham yo'q"

echo "-> Prisma generate (to'liq yo'l bilan)..."
SCHEMA_PATH="/home/evikouz/eviko_new/frontend/prisma/schema.prisma"

# 1-urinish: nodevenv orqali
if [ -f "$NODEVENV_BIN/prisma" ]; then
    "$NODEVENV_BIN/prisma" generate --schema="$SCHEMA_PATH"
# 2-urinish: npx orqali
else
    npx --yes prisma@5.22.0 generate --schema="$SCHEMA_PATH"
fi

echo "-> Next build (to'liq yo'l bilan)..."

# 1-urinish: nodevenv ichidagi next
if [ -f "$NODEVENV_BIN/next" ]; then
    echo "   nodevenv/next ishlatilmoqda..."
    "$NODEVENV_BIN/next" build
# 2-urinish: node_modules ichidagi next
elif [ -f "node_modules/.bin/next" ]; then
    echo "   local next ishlatilmoqda..."
    node_modules/.bin/next build
# 3-urinish: node orqali to'g'ridan-to'g'ri
elif [ -f "node_modules/next/dist/bin/next" ]; then
    echo "   node orqali next ishlatilmoqda..."
    node node_modules/next/dist/bin/next build
# 4-urinish: npx orqali
else
    echo "   npx orqali next ishlatilmoqda..."
    npx next build
fi

echo "-> TUGADI! Natijani tekshiringiz."

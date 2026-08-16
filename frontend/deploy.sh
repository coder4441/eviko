#!/bin/bash

echo "-> Frontend papkasiga kirilmoqda..."
cd /home/evikouz/eviko_new/frontend || exit

echo "-> Yangi kodlar tortilmoqda..."
git pull

echo "-> Kutubxonalar o'rnatilmoqda (postinstall o'chirilgan)..."
export NODE_ENV=production
# --ignore-scripts: postinstall va boshqa skriptlarni o'tkazib yuboradi
npm install --omit=dev --ignore-scripts

echo "-> Prisma generate (absolut yo'l bilan)..."
NODEVENV_BIN="/home/evikouz/nodevenv/frontend/20/bin"
SCHEMA="/home/evikouz/eviko_new/frontend/prisma/schema.prisma"

if [ -f "$NODEVENV_BIN/prisma" ]; then
    "$NODEVENV_BIN/prisma" generate --schema="$SCHEMA" \
        && echo "   ✅ Prisma OK" \
        || echo "   ⚠️  Prisma xato (build .next dan ishlaydi)"
elif [ -f "/home/evikouz/eviko_new/frontend/node_modules/.bin/prisma" ]; then
    /home/evikouz/eviko_new/frontend/node_modules/.bin/prisma generate --schema="$SCHEMA" \
        && echo "   ✅ Prisma OK" \
        || echo "   ⚠️  Prisma xato"
else
    echo "   ⚠️  Prisma binary topilmadi"
fi

echo "-> .next holati..."
if [ -d ".next" ]; then
    echo "   ✅ .next TAYYOR!"
else
    echo "   ❌ .next YO'Q!"
fi

echo "-> Barcha qadamlar tugadi! cPanel -> Node.js -> Restart bosing."

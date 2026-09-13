# EVIKO POS — Virtual Hosting (cPanel) Deploy Qo'llanmasi

## Tizim Talablari

| Talab | Minimum |
|-------|---------|
| Node.js | 18.x yoki 20.x |
| RAM | 1 GB (2 GB tavsiya) |
| Disk | 5 GB |
| PostgreSQL | 14+ |
| cPanel | Phusion Passenger bilan |

---

## QADAM 1: Deploy ZIP tayyorlash (Kompyuterda)

**`DEPLOY_TAYYORLA.bat`** faylini ikki marta bosing va kuting.

Bu skript:
1. `npm install` — paketlar o'rnatadi
2. `prisma generate` — DB client yaratadi
3. `npm run build` — production build qiladi
4. `eviko_deploy.zip` — yuklash uchun ZIP tayyorlaydi

> Build jarayoni **5-15 daqiqa** olishi mumkin. Sabr qiling!

---

## QADAM 2: cPanel ga kirish

1. Hosting panelingizga kiring: `https://sizningdomen.uz:2083`
2. Foydalanuvchi nomi va parol bilan tizimga kiring

---

## QADAM 3: PostgreSQL Bazasi Yaratish

**cPanel → Databases → PostgreSQL Databases**

```
Baza nomi:     evikouz_coder4441
Foydalanuvchi: evikouz_Kamol
Parol:         [kuchli parol yarating]
```

1. "Create Database" bosing
2. "Create User" bosing
3. "Add User to Database" — barcha huquqlarni bering

---

## QADAM 4: Node.js App Yaratish (cPanel)

**cPanel → Software → Setup Node.js App**

| Maydon | Qiymat |
|--------|--------|
| Node.js version | 20.x (yoki 18.x) |
| Application mode | Production |
| Application root | `eviko` |
| Application URL | `eviko.uz` |
| Application startup file | `server.js` |

"Create" tugmasini bosing.

---

## QADAM 5: Fayllarni Yuklash

**cPanel → File Manager → `eviko/` papkasiga kiring**

1. `eviko_deploy.zip` ni yuklang
2. "Extract" bosib chiqarib oling

**Fayl strukturasi:**
```
eviko/
├── server.js
├── package.json
├── next.config.mjs
├── .next/
├── public/
└── prisma/migrations/
```

---

## QADAM 6: `.env` Fayl Yaratish (MUHIM!)

**File Manager da `eviko/.env` yangi fayl yarating:**

```env
DATABASE_URL="postgresql://evikouz_Kamol:PAROLINGIZ@127.0.0.1:5432/evikouz_coder4441"
NEXT_PUBLIC_APP_URL="https://eviko.uz"
NEXTAUTH_URL="https://eviko.uz"
JWT_SECRET="[64 belgili tasodifiy matn]"
NEXTAUTH_SECRET="[64 belgili tasodifiy matn]"
NODE_ENV="production"
PORT=3000
HTTPS="true"
```

JWT_SECRET yaratish uchun terminal da:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## QADAM 7: npm install (cPanel Terminal)

**cPanel → Advanced → Terminal:**

```bash
cd ~/eviko
npm install --production --legacy-peer-deps
```

---

## QADAM 8: Ma'lumotlar Bazasini Sozlash

```bash
cd ~/eviko

# Prisma client generatsiya
npx prisma generate

# Barcha migration larni yuklash
npx prisma migrate deploy

# Agar xato bersa (birinchi deploy):
npx prisma db push
```

---

## QADAM 9: Super Admin Yaratish

```bash
cd ~/eviko

node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash('YangiParol123!', 12);
  await prisma.superAdmin.create({
    data: { name: 'Super Admin', email: 'admin@eviko.uz', password: hash, role: 'SUPER_ADMIN' }
  });
  console.log('Tayyor!');
  await prisma.\$disconnect();
}
main().catch(console.error);
"
```

---

## QADAM 10: Ilovani Ishga Tushirish

**cPanel → Setup Node.js App → Restart** tugmasini bosing.

---

## Tekshirish

```bash
curl -I https://eviko.uz
```

---

## Muammolar va Yechimlar

| Xato | Yechim |
|------|--------|
| Cannot find module | `npm install` qayta ishga tushiring |
| Database connection failed | `.env` dagi `DATABASE_URL` ni tekshiring |
| 502 Bad Gateway | cPanel dan Node.js App ni restart qiling |
| Prisma not generated | `npx prisma generate` ishga tushiring |

---

## SSL Ulash

**cPanel → Domains → SSL/TLS Status**
- `eviko.uz` domenini tanlang
- "AutoSSL" yoqing — bepul sertifikat

---

> MUHIM: `.env` faylingizni hech kimga bermang va GitHub ga yuklamang!
> Har yangilanishda `DEPLOY_TAYYORLA.bat` ni qayta ishga tushiring.

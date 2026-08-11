import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// EVIKO POS — Aqlli FAQ Chatbot (API kerak emas)
// ============================================================

interface Intent {
  patterns: string[];
  response: string;
}

const INTENTS: Intent[] = [
  // Salomlashish
  {
    patterns: ['salom', 'assalomu', 'hello', 'hi', 'привет', 'здравствуй', 'хай'],
    response: `Salom! 👋 **EVIKO POS** tizimiga xush kelibsiz!

Men sizga tizim haqida har qanday savolga javob bera olaman. Quyidagilardan birini so'rashingiz mumkin:

• 📦 Tizim xususiyatlari
• 💰 Narxlar va paketlar  
• 🚀 Boshlash uchun qo'llanma
• 🖥️ Modullar haqida
• 📞 Aloqa ma'lumotlari`,
  },

  // EVIKO nima
  {
    patterns: ['eviko nima', 'tizim nima', 'bu nima', 'nima bu', 'что такое', 'nima haqida'],
    response: `**EVIKO** — O'zbekistondagi restoran, kafe, fast food va mehmonxonalar uchun maxsus ishlab chiqilgan zamonaviy POS va ERP tizimi.

🎯 **Asosiy imkoniyatlar:**
• Buyurtma qabul qilish va boshqarish
• Ombor va mahsulot hisobi
• Moliyaviy hisobotlar
• Xodimlar boshqaruvi
• Onlayn va oflayn ishlash

📍 O'zbekistondagi 100+ restoran va kafelarda ishlatilmoqda!`,
  },

  // Narx
  {
    patterns: ['narx', 'qancha', 'pul', 'to\'lov', 'cena', 'сколько', 'стоит', 'цена', 'tariflar', 'paket'],
    response: `💰 **EVIKO narxlari:**

Oylik obuna tizimi asosida ishlaydi. Narxlar tashkilot hajmi va kerakli modullarga qarab belgilanadi.

📞 Batafsil narx uchun bog'laning:
• **Telefon:** +998 50 002 37 78
• **Ish vaqti:** Du-Sha, 9:00 - 18:00

🎁 **Bepul demo** sinab ko'rish imkoniyati mavjud!`,
  },

  // Demo
  {
    patterns: ['demo', 'sinab', 'trial', 'bepul', 'tekin', 'бесплатно', 'попробовать'],
    response: `🎁 **Bepul demo mavjud!**

Tizimni 14 kun bepul sinab ko'rishingiz mumkin:

1. Bizga qo'ng'iroq qiling: **+998 50 002 37 78**
2. Yoki admin paneldan ro'yxatdan o'ting
3. Demo akkaunt aktivatsiya qilinadi

Demo davrida barcha xususiyatlardan to'liq foydalanishingiz mumkin! 🚀`,
  },

  // Kassir
  {
    patterns: ['kassir', 'kassa', 'sotish', 'sotuv', 'buyurtma', 'касса', 'кассир', 'продажа'],
    response: `🖥️ **Kassir moduli:**

• ✅ Mahsulotlarni tez qidirish va tanlash
• ✅ Naqd, karta va online to'lov qabul qilish
• ✅ Chek chiqarish (termal printer)
• ✅ Chegirma va aksiyalar qo'llash
• ✅ Qaytarim (vozvrat) qilish
• ✅ Smena ochish va yopish

**Ishlatish:** Kassir login → Mahsulot tanlash → To'lov → Chek chiqarish`,
  },

  // Smart POS / Stol
  {
    patterns: ['stol', 'zal', 'ofitsiant', 'smart', 'kds', 'oshxona', 'kitchen', 'официант', 'столик'],
    response: `🍽️ **Smart-POS (Stol boshqaruvi):**

• ✅ Interaktiv stol xaritasi
• ✅ Stolga buyurtma biriktirish
• ✅ Buyurtmani oshxonaga yuborish (KDS)
• ✅ Bir stolni bo'lish yoki birlashtirish
• ✅ Ofitsiantlar orasida stol o'tkazish
• ✅ Real vaqtda buyurtma holati

**KDS** — Oshxona ekranida buyurtmalar real vaqtda ko'rinadi!`,
  },

  // Ombor
  {
    patterns: ['ombor', 'sklat', 'kirim', 'chiqim', 'inventar', 'mahsulot', 'склад', 'инвентар', 'товар'],
    response: `📦 **Ombor moduli:**

• ✅ Mahsulot kirim va chiqimi
• ✅ Inventarizatsiya (tekshirish)
• ✅ Omborlar orasida ko'chirish
• ✅ Spisaniye (buzilgan/yo'qolgan)
• ✅ Kam qolgan mahsulotlar haqida ogohlantirish
• ✅ Yetkazib beruvchilar (kontragentlar) bilan ishlash

Bir nechta ombor boshqarish imkoniyati mavjud!`,
  },

  // Hisobot
  {
    patterns: ['hisobot', 'analitika', 'statistika', 'daromad', 'foyda', 'отчет', 'аналитика', 'статистика'],
    response: `📊 **Hisobotlar va analitika:**

• ✅ Kunlik/haftalik/oylik savdo hisoboti
• ✅ Eng ko'p sotiladigan mahsulotlar
• ✅ Kassirlar bo'yicha savdo hisobi
• ✅ Smena hisoboti
• ✅ Ombor qoldig'i hisoboti
• ✅ Moliyaviy tahlil (daromad/xarajat)

Hisobotlarni **PDF** yoki **Excel** ga eksport qilish mumkin!`,
  },

  // Boshlash
  {
    patterns: ['boshlash', 'qanday', 'ro\'yxat', 'registratsiya', 'начать', 'как начать', 'как пользоваться'],
    response: `🚀 **EVIKO ni boshlash juda oson!**

**1-qadam:** +998 50 002 37 78 ga qo'ng'iroq qiling
**2-qadam:** Demo akkaunt oling
**3-qadam:** Tashkilotingizni sozlang:
   - Menyuni kiriting
   - Xodimlar qo'shing
   - Printerlarni sozlang
**4-qadam:** Kassirlar tizimga kiradi va ishlaydi!

O'rgatish va texnik yordam biz tomondan beriladi ✅`,
  },

  // Printer / Chek
  {
    patterns: ['printer', 'chek', 'bosib', 'print', 'принтер', 'чек', 'печать', 'chiqmayapdi', 'chiqmayapti'],
    response: `🖨️ **Printer va chek muammolari:**

**Chek chiqmayapti?**
1. Printerning ulanganini tekshiring (USB yoki Wi-Fi)
2. Admin panel → Sozlamalar → Printerlar bo'limiga kiring
3. Printer IP manzilini to'g'ri kiriting
4. "Test chek" tugmasini bosing

**Qo'llab-quvvatlanadigan printerlar:**
• Xprinter, Epson, Star, Citizen seriyalari
• USB, LAN, Wi-Fi ulanish

Muammo davom etsa: **+998 50 002 37 78**`,
  },

  // Internet / Offline
  {
    patterns: ['internet', 'offline', 'uzilib', 'tarmoq', 'ishlamayapdi', 'интернет', 'оффлайн', 'без интернета'],
    response: `📡 **Oflayn rejim:**

EVIKO internet bo'lmasa ham ishlaydi! ✅

• Barcha savdolar lokal saqlanadi
• Internet qaytgach avtomatik sinxronlanadi
• Hisobotlar real vaqtda ishlayveradi

**Tavsiya:** Barqaror internet bo'lsa, Cloud funksiyalar ham ishlaydi (masofaviy boshqarish, online monitoring).`,
  },

  // Xodimlar / Staff
  {
    patterns: ['xodim', 'hodim', 'staff', 'ish', 'smena', 'kassir qosh', 'сотрудник', 'персонал', 'смена'],
    response: `👥 **Xodimlar boshqaruvi:**

• ✅ Kassirlar, ofitsiantlar, oshpazlar profili
• ✅ Har bir xodimga alohida login/parol
• ✅ Smena tarixi va hisobi
• ✅ Xodim savdo ko'rsatkichlari
• ✅ Ruxsatlarni cheklash (kim nimani ko'ra oladi)

**Kassir qo'shish:**
Admin panel → Xodimlar → Yangi xodim → Ma'lumotlarni kiriting`,
  },

  // Aloqa
  {
    patterns: ['aloqa', 'telefon', 'bog\'lan', 'contact', 'support', 'помощь', 'связь', 'звонить', 'murojaat'],
    response: `📞 **Bizga murojaat qiling:**

• **Telefon:** +998 50 002 37 78
• **Ish vaqti:** Dushanba - Shanba, 9:00 - 18:00

🔧 **Texnik yordam:**
Tizimda muammo bo'lsa, telefon orqali yoki yuzma-yuz yordam beramiz.

💡 **Maslahat:**
Savol va takliflaringizni ham yuborishingiz mumkin — tizimni yanada yaxshilaymiz!`,
  },

  // Rahmat
  {
    patterns: ['rahmat', 'tashakkur', 'спасибо', 'thanks', 'thank you', 'ok', 'yaxshi', 'zo\'r', 'ajoyib'],
    response: `Iltifotingiz uchun rahmat! 😊

Boshqa savollaringiz bo'lsa, doim yordam berishga tayyorman.

📞 Qo'shimcha ma'lumot uchun: **+998 50 002 37 78**

EVIKO ni tanlaysiz deb umid qilamiz! 🚀`,
  },
];

// ============================================================
// Intent Recognition Engine
// ============================================================

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[?!.,;:'"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findBestIntent(userMessage: string): string | null {
  const normalized = normalizeText(userMessage);
  const words = normalized.split(' ');

  let bestMatch: { intent: Intent; score: number } | null = null;

  for (const intent of INTENTS) {
    let score = 0;
    for (const pattern of intent.patterns) {
      const patternWords = pattern.split(' ');
      if (normalized.includes(pattern)) {
        score += pattern.length * 2; // Exact substring match
      } else {
        for (const pWord of patternWords) {
          if (words.some(w => w.includes(pWord) || pWord.includes(w))) {
            score += pWord.length;
          }
        }
      }
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { intent, score };
    }
  }

  return bestMatch ? bestMatch.intent.response : null;
}

const FALLBACK_RESPONSES = [
  `Kechirasiz, bu savol bo'yicha aniq ma'lumotim yo'q.

📞 Batafsil ma'lumot uchun:
**Telefon:** +998 50 002 37 78

Yoki quyidagi mavzulardan birini so'rang:
• Kassir, ombor, hisobot modullari
• Narxlar va demo
• Boshlash uchun qo'llanma
• Printer va texnik muammolar`,
];

// ============================================================
// API Route Handler
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Xabar bo\'sh' }, { status: 400 });
    }

    const lastUserMessage = [...messages].reverse().find(
      (m: { role: string; content: string }) => m.role === 'user'
    );

    if (!lastUserMessage) {
      return NextResponse.json({ error: 'Foydalanuvchi xabari topilmadi' }, { status: 400 });
    }

    // Local intent matching engine
    const reply = findBestIntent(lastUserMessage.content) ?? FALLBACK_RESPONSES[0];

    // Small delay to feel natural
    await new Promise(r => setTimeout(r, 350));

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.' },
      { status: 500 }
    );
  }
}

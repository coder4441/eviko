"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
    ArrowRight, 
    Smartphone, 
    Code, 
    MessageSquare, 
    Server, 
    Zap, 
    ShieldCheck, 
    Headset, 
    ChevronRight,
    MonitorSmartphone,
    Code2,
    Bot,
    Phone,
    Send,
    Instagram
} from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
            {/* Navbar */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center">
                        <img src="/eviko-logo.svg" alt="EVIKO" className="h-10 w-auto" />
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                        <a href="#" className="hover:text-blue-600 transition-colors">Bosh sahifa</a>
                        <a href="#services" className="hover:text-blue-600 transition-colors">Xizmatlar</a>
                        <a href="#benefits" className="hover:text-blue-600 transition-colors">Afzalliklar</a>
                        <a href="#contact" className="hover:text-blue-600 transition-colors">Aloqa</a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-28 pb-6 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-5"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-bold text-xs uppercase tracking-widest">
                            <Zap size={14} /> Raqamli Transformatsiya
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black leading-tight text-slate-900">
                            Biznesingiz Uchun <span className="text-blue-600">Intellektual Raqamli</span> Yechimlar
                        </h1>
                        <p className="text-base text-slate-600 font-medium leading-relaxed max-w-lg">
                            EVIKO – biznes jarayonlarini to'liq avtomatlashtiruvchi, savdoni oshiruvchi va boshqaruvni osonlashtiruvchi kompleks dasturiy ta'minotlar yaratish bo'yicha ishonchli hamkoringiz. Standart shablonlardan voz kechib, muvaffaqiyatingizga xizmat qiladigan eksklyuziv tizimlarni ishlab chiqamiz.
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                            <a href="#services" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-xl shadow-blue-500/20">
                                Xizmatlar bilan tanishish
                            </a>
                            <a href="#contact" className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
                                Bog'lanish <ChevronRight size={16} />
                            </a>
                        </div>
                    </motion.div>
                    
                    {/* Hero Graphics */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-[3rem] transform rotate-3 scale-105 -z-10"></div>
                        <div className="bg-white p-5 rounded-[2rem] shadow-2xl border border-slate-100 grid grid-cols-2 gap-4 relative z-10">
                            {[
                                { icon: MonitorSmartphone, label: "EVIKO POS", desc: "Savdo avtomatizatsiyasi", gradient: "from-blue-500 to-blue-700" },
                                { icon: Code2, label: "Maxsus Dasturlar", desc: "Web & Mobile loyihalar", gradient: "from-indigo-500 to-indigo-700" },
                                { icon: Bot, label: "Telegram Botlar", desc: "Aqlli assistentlar", gradient: "from-violet-500 to-violet-700" },
                                { icon: Server, label: "CRM / ERP", desc: "Biznes boshqaruvi", gradient: "from-emerald-500 to-emerald-700" }
                            ].map((item, idx) => (
                                <motion.div 
                                    key={idx}
                                    whileHover={{ y: -5, scale: 1.03 }}
                                    className={`p-4 rounded-2xl bg-gradient-to-br ${item.gradient} flex flex-col items-start gap-2 cursor-default shadow-lg relative overflow-hidden`}
                                >
                                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                                        <item.icon size={24} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm">{item.label}</h3>
                                        <p className="text-xs text-white/70 mt-1 font-medium">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Partners / Brands Ticker */}
            <section className="py-8 bg-white border-y border-slate-100 overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-6 mb-5 text-center">
                    <p className="text-3xl md:text-4xl font-black text-blue-600 tracking-tight">Bizning hamkorlarimiz</p>
                    <p className="text-base md:text-lg font-bold text-slate-500 mt-2">O'zbekistonning yetakchi restoran va cafe zanjirlari biz bilan ishlaydi</p>
                </div>
                <style>{`
                    @keyframes marqueeScroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .marquee-logos {
                        display: flex;
                        width: max-content;
                        animation: marqueeScroll 32s linear infinite;
                    }
                    .marquee-logos:hover {
                        animation-play-state: paused;
                    }
                `}</style>
                <div className="overflow-hidden">
                    <div className="marquee-logos">
                        {[
                            { name: "Besh Qozon", tag: "RESTORAN", accent: "#e63946", bg: "#fff5f5" },
                            { name: "Chayxona №1", tag: "CAFE ZANJIRI", accent: "#2d6a4f", bg: "#f0fdf4" },
                            { name: "Milliy Taomlar", tag: "RESTORAN", accent: "#c77dff", bg: "#faf5ff" },
                            { name: "Plov Centre", tag: "FAST FOOD", accent: "#f4a261", bg: "#fff8f0" },
                            { name: "Tandir Cafe", tag: "CAFE", accent: "#e76f51", bg: "#fff4f0" },
                            { name: "Samarqand", tag: "RESTORAN", accent: "#3a86ff", bg: "#f0f7ff" },
                            { name: "Baraka", tag: "CAFE ZANJIRI", accent: "#06d6a0", bg: "#f0fffe" },
                            { name: "Navruz", tag: "ZIYOFAT", accent: "#ffd166", bg: "#fffdf0" },
                            { name: "Ziyofat Hall", tag: "BANKET ZALI", accent: "#8338ec", bg: "#f9f0ff" },
                            { name: "Grand Mir", tag: "HOTEL RESTORAN", accent: "#073b4c", bg: "#f0f8ff" },
                            { name: "Dolores", tag: "CAFE", accent: "#ef476f", bg: "#fff0f4" },
                            { name: "Soffitto", tag: "ITALIAN", accent: "#118ab2", bg: "#f0faff" },
                            { name: "National", tag: "RESTORAN", accent: "#06a77d", bg: "#f0fdf8" },
                            { name: "Ustaz", tag: "MILLIY TAOM", accent: "#b5451b", bg: "#fff3ef" },
                            { name: "Besh Qozon", tag: "RESTORAN", accent: "#e63946", bg: "#fff5f5" },
                            { name: "Chayxona №1", tag: "CAFE ZANJIRI", accent: "#2d6a4f", bg: "#f0fdf4" },
                            { name: "Milliy Taomlar", tag: "RESTORAN", accent: "#c77dff", bg: "#faf5ff" },
                            { name: "Plov Centre", tag: "FAST FOOD", accent: "#f4a261", bg: "#fff8f0" },
                            { name: "Tandir Cafe", tag: "CAFE", accent: "#e76f51", bg: "#fff4f0" },
                            { name: "Samarqand", tag: "RESTORAN", accent: "#3a86ff", bg: "#f0f7ff" },
                            { name: "Baraka", tag: "CAFE ZANJIRI", accent: "#06d6a0", bg: "#f0fffe" },
                            { name: "Navruz", tag: "ZIYOFAT", accent: "#ffd166", bg: "#fffdf0" },
                            { name: "Ziyofat Hall", tag: "BANKET ZALI", accent: "#8338ec", bg: "#f9f0ff" },
                            { name: "Grand Mir", tag: "HOTEL RESTORAN", accent: "#073b4c", bg: "#f0f8ff" },
                            { name: "Dolores", tag: "CAFE", accent: "#ef476f", bg: "#fff0f4" },
                            { name: "Soffitto", tag: "ITALIAN", accent: "#118ab2", bg: "#f0faff" },
                            { name: "National", tag: "RESTORAN", accent: "#06a77d", bg: "#f0fdf8" },
                            { name: "Ustaz", tag: "MILLIY TAOM", accent: "#b5451b", bg: "#fff3ef" },
                        ].map((brand, i) => (
                            <div
                                key={i}
                                className="flex flex-col justify-center items-start px-10 py-7 mx-4 rounded-3xl border border-slate-100 shadow-md whitespace-nowrap shrink-0 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-default"
                                style={{ background: brand.bg, minWidth: 240 }}
                            >
                                {/* Styled SVG text logo */}
                                <svg width="200" height="50" viewBox="0 0 200 50">
                                    <text
                                        x="0" y="38"
                                        fontFamily="'Segoe UI', system-ui, sans-serif"
                                        fontWeight="900"
                                        fontSize="30"
                                        fill={brand.accent}
                                        letterSpacing="-1"
                                    >
                                        {brand.name}
                                    </text>
                                </svg>
                                <span
                                    className="text-[11px] font-black uppercase tracking-widest mt-2"
                                    style={{ color: brand.accent, opacity: 0.5 }}
                                >
                                    {brand.tag}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* Services Section */}
            <section id="services" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Bizning Texnologik Ekosistemamiz</h2>
                        <p className="text-slate-600 font-medium">Oddiy vositalar emas, balki daromadingizni oshiradigan va operatsion xarajatlarni qisqartiradigan kuchli biznes qurollari.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "EVIKO POS",
                                desc: "Barcha turdagi savdo va xizmat ko'rsatish shaxobchalari uchun maxsus ishlab chiqilgan super tezkor kassa va ombor hisobi tizimi.",
                                icon: MonitorSmartphone,
                                iconBg: "bg-white/20",
                                iconColor: "text-white",
                                gradient: "from-blue-500 to-blue-700",
                                features: ["Online rejim", "Ombor hisobi", "QR Menyu", "Xodimlar nazorati"],
                                action: { label: "Tizimga kirish", href: "/portal" }
                            },
                            {
                                title: "Maxsus Dasturlar",
                                desc: "Sizning biznes jarayonlaringizga to'liq moslashgan maxsus Web va Mobile ilovalar ishlab chiqamiz. G'oyangizni reallikka aylantiramiz.",
                                icon: Code2,
                                iconBg: "bg-white/20",
                                iconColor: "text-white",
                                gradient: "from-indigo-500 to-indigo-700",
                                features: ["Web Ilovalar", "Mobile Ilovalar (iOS/Android)", "Murakkab Tizimlar", "API Integratsiyalar"],
                                action: { label: "Ariza qoldirish", href: "#contact" }
                            },
                            {
                                title: "Telegram Botlar",
                                desc: "Mijozlar bilan ishlash, buyurtmalar qabul qilish va xodimlarni boshqarish uchun aqlli Telegram botlar yaratamiz.",
                                icon: Bot,
                                iconBg: "bg-white/20",
                                iconColor: "text-white",
                                gradient: "from-violet-500 to-violet-700",
                                features: ["Do'kon botlari", "CRM botlar", "To'lov tizimlari", "Avto-javoblar"],
                                action: { label: "Ariza qoldirish", href: "#contact" }
                            }
                        ].map((service, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className={`bg-gradient-to-br ${service.gradient} p-8 rounded-3xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}
                            >
                                {/* Subtle glow top-right */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                                <div className={`w-14 h-14 rounded-2xl ${service.iconBg} backdrop-blur-sm flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                    <service.icon className={service.iconColor} size={28} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                                <p className="text-white/75 text-sm leading-relaxed font-medium mb-6">{service.desc}</p>
                                <ul className="space-y-3">
                                    {service.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm font-semibold text-white">
                                            <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0">
                                                <ShieldCheck size={12} />
                                            </div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                
                                {service.action && (
                                    <div className="mt-8">
                                        <Link href={service.action.href} className="inline-flex bg-white hover:bg-blue-50 text-blue-700 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors items-center gap-2 shadow-lg shadow-blue-900/20 w-full justify-center">
                                            {service.action.label} <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Us Section */}
            <section id="benefits" className="py-28 relative overflow-hidden bg-white text-slate-900">
                {/* Subtle background decoration */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-50 to-blue-50/40 pointer-events-none"></div>
                <div className="absolute top-1/4 right-0 w-72 h-72 bg-blue-100/50 blur-3xl rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-indigo-100/40 blur-3xl rounded-full pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        {/* Left */}
                        <div className="space-y-10">
                            <div>
                                <span className="inline-block bg-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-blue-200 mb-5">EVIKO Afzalligi</span>
                                <h2 className="text-4xl md:text-5xl font-black leading-tight text-slate-900">Nega Yirik Brendlar <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Bizga</span> Ishonadi?</h2>
                                <p className="mt-5 text-slate-500 font-medium leading-relaxed text-lg">
                                    Biz texnik pudratchi emas, balki sizning o'sish strategiyangizdagi IT hamkormiz. Loyihalarimiz chuqur tahlil, yuqori yuklanishga bardoshlilik va zamonaviy UI/UX standartlari asosida quriladi.
                                </p>
                            </div>

                            <div className="space-y-5">
                                {[
                                    { title: "Yuqori Tezlik", desc: "Eng so'nggi texnologiyalar asosida qurilgan tizimlar — soniyaning yuzdan birida ishlaydi.", icon: Zap, color: "from-yellow-500 to-orange-500", bg: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" },
                                    { title: "To'liq Xavfsizlik", desc: "Ma'lumotlaringiz xavfsizligi va maxfiyligi yuqori darajada himoyalangan.", icon: ShieldCheck, color: "from-emerald-500 to-teal-500", bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
                                    { title: "Doimiy Qo'llab-quvvatlash", desc: "24/7 texnik yordam va tizimni doimiy rivojlantirish xizmatlari.", icon: Headset, color: "from-blue-500 to-indigo-500", bg: "bg-blue-500/10 border-blue-500/20 text-blue-400" }
                                ].map((feature, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex gap-5 group"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${feature.bg}`}>
                                            <feature.icon size={26} strokeWidth={1.5} />
                                        </div>
                                        <div className="pt-1">
                                            <h4 className="font-bold text-lg mb-1 text-slate-900">{feature.title}</h4>
                                            <p className="text-slate-500 text-sm font-medium leading-relaxed">{feature.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Right – Stats card */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/60 to-indigo-200/60 rounded-3xl blur-2xl scale-105"></div>
                            <div className="relative bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
                                <div className="flex items-center justify-between pb-5 border-b border-slate-200 mb-6">
                                    <span className="font-bold text-lg text-slate-900">Bizning Natijalar</span>
                                    <span className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-semibold">2024-yil</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { num: "1500+", label: "Faol Mijozlar", gradient: "from-blue-500 to-blue-700" },
                                        { num: "100%", label: "Xavfsizlik", gradient: "from-emerald-500 to-emerald-700" },
                                        { num: "24/7", label: "Qo'llab-quvvatlash", gradient: "from-violet-500 to-violet-700" },
                                        { num: "3+", label: "Yillik Tajriba", gradient: "from-orange-500 to-orange-700" },
                                    ].map((stat, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            className={`bg-gradient-to-br ${stat.gradient} p-5 rounded-2xl hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden`}
                                        >
                                            <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                                            <div className="text-4xl font-black text-white mb-2">{stat.num}</div>
                                            <div className="text-xs font-bold text-white/70 uppercase tracking-widest">{stat.label}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="contact" className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-80 h-80 bg-white/10 blur-3xl rounded-full"></div>
                    <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-indigo-400/20 blur-3xl rounded-full"></div>
                </div>
                <div className="max-w-4xl mx-auto px-6 text-center text-white relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black mb-6">Kelajak Loyihangizni Bugun Yarating</h2>
                    <p className="text-blue-100 text-lg font-medium mb-10 max-w-2xl mx-auto">
                        Raqobatda oldinda bo'lish uchun texnologik ustunlikka ega bo'ling. Bizning ekspertlarimiz bilan bog'laning va biznesingiz salohiyatini to'liq ochib beradigan yechimni muhokama qiling.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {/* Phone */}
                        <a href="tel:+998772931014" className="inline-flex items-center gap-3 bg-white text-blue-600 px-7 py-4 rounded-2xl font-black text-lg hover:bg-slate-50 hover:scale-105 transition-all shadow-xl">
                            <Phone size={22} />
                            +998 77 293 10 14
                        </a>
                        {/* Telegram */}
                        <a href="https://t.me/coder4441" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-sm border border-white/30 text-white px-7 py-4 rounded-2xl font-bold text-lg hover:bg-white/25 hover:scale-105 transition-all shadow-lg">
                            <Send size={22} />
                            @coder4441
                        </a>
                        {/* Instagram */}
                        <a href="https://www.instagram.com/evikopos.uz?igsh=cXE2Yjl3OHJqNWpx&utm_source=qr" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-7 py-4 rounded-2xl font-bold text-lg hover:opacity-90 hover:scale-105 transition-all shadow-lg">
                            <Instagram size={22} />
                            evikopos.uz
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 py-12 border-t border-slate-200 text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <img src="/eviko-logo.svg" alt="EVIKO" className="h-8 w-auto grayscale opacity-80" />
                </div>
                <p className="text-slate-500 font-medium text-sm">
                    © {new Date().getFullYear()} EVIKO IT Solutions. Barcha huquqlar himoyalangan.
                </p>
            </footer>
        </div>
    );
}

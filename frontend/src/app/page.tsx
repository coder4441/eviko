"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
    ArrowRight, 
    MonitorSmartphone,
    Code2,
    Bot,
    Server,
    Zap, 
    ShieldCheck, 
    Headset, 
    ChevronRight,
    Phone,
    Send,
    Instagram,
    X,
    CheckCircle2
} from "lucide-react";

export default function LandingPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success">("idle");

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus("submitting");
        // Simulate API call
        setTimeout(() => {
            setFormStatus("success");
            setTimeout(() => {
                setIsModalOpen(false);
                setFormStatus("idle");
            }, 2500);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200 overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-40 border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center">
                        <img src="/eviko-logo.svg" alt="EVIKO" className="h-10 w-auto" />
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-[15px] font-bold text-slate-700">
                        <a href="#" className="hover:text-blue-600 transition-colors">Bosh sahifa</a>
                        <a href="#services" className="hover:text-blue-600 transition-colors">Xizmatlar</a>
                        <a href="#benefits" className="hover:text-blue-600 transition-colors">Afzalliklar</a>
                        <a href="#contact" className="hover:text-blue-600 transition-colors">Aloqa</a>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-[15px] transition-all shadow-lg"
                    >
                        Ariza qoldirish
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-28 pb-10 px-6 relative">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-100/50 text-blue-700 font-bold text-[13px] uppercase tracking-widest border border-blue-200">
                            <Zap size={16} /> Raqamli Transformatsiya
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black leading-[1.1] text-slate-900 tracking-tight">
                            Biznesingiz Uchun <br/><span className="text-blue-600">Intellektual Raqamli</span> Yechimlar
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-xl">
                            EVIKO – biznes jarayonlarini to'liq avtomatlashtiruvchi, savdoni oshiruvchi va boshqaruvni osonlashtiruvchi premium dasturiy ta'minotlar yaratadi.
                        </p>
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-600/30 flex items-center gap-2 hover:-translate-y-1"
                            >
                                Bepul Konsultatsiya <ChevronRight size={20} />
                            </button>
                            <a href="#services" className="bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 px-8 py-4 rounded-2xl font-bold text-lg transition-all">
                                Xizmatlar
                            </a>
                        </div>
                    </motion.div>
                    
                    {/* Hero Graphics */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-[3rem] transform rotate-3 scale-105 -z-10"></div>
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100 grid grid-cols-2 gap-5 relative z-10">
                            {[
                                { icon: MonitorSmartphone, label: "EVIKO POS", desc: "Savdo avtomatizatsiyasi", gradient: "from-blue-500 to-blue-700" },
                                { icon: Code2, label: "Maxsus Dasturlar", desc: "Web & Mobile loyihalar", gradient: "from-indigo-500 to-indigo-700" },
                                { icon: Bot, label: "Telegram Botlar", desc: "Aqlli assistentlar", gradient: "from-violet-500 to-violet-700" },
                                { icon: Server, label: "CRM / ERP", desc: "Biznes boshqaruvi", gradient: "from-emerald-500 to-emerald-700" }
                            ].map((item, idx) => (
                                <div key={idx} className={`p-6 rounded-3xl bg-gradient-to-br ${item.gradient} flex flex-col items-start gap-3 shadow-lg relative overflow-hidden`}>
                                    <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                                        <item.icon size={28} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-[17px] tracking-wide">{item.label}</h3>
                                        <p className="text-[13px] text-white/80 mt-1 font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Partners Section */}
            <section className="py-12 bg-white border-y border-slate-200 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
                    <p className="text-[28px] md:text-4xl font-black text-slate-900 tracking-tight">Hamkorlarimiz</p>
                    <p className="text-lg font-semibold text-slate-500 mt-2">Eng yaxshilar bizni tanlaydi</p>
                </div>
                <style>{`
                    @keyframes marqueeScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                    .marquee-logos { display: flex; width: max-content; animation: marqueeScroll 35s linear infinite; }
                    .marquee-logos:hover { animation-play-state: paused; }
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
                            // Duplicate for continuous scroll
                            { name: "Besh Qozon", tag: "RESTORAN", accent: "#e63946", bg: "#fff5f5" },
                            { name: "Chayxona №1", tag: "CAFE ZANJIRI", accent: "#2d6a4f", bg: "#f0fdf4" },
                            { name: "Milliy Taomlar", tag: "RESTORAN", accent: "#c77dff", bg: "#faf5ff" },
                            { name: "Plov Centre", tag: "FAST FOOD", accent: "#f4a261", bg: "#fff8f0" },
                            { name: "Tandir Cafe", tag: "CAFE", accent: "#e76f51", bg: "#fff4f0" },
                            { name: "Samarqand", tag: "RESTORAN", accent: "#3a86ff", bg: "#f0f7ff" },
                            { name: "Baraka", tag: "CAFE ZANJIRI", accent: "#06d6a0", bg: "#f0fffe" },
                            { name: "Navruz", tag: "ZIYOFAT", accent: "#ffd166", bg: "#fffdf0" }
                        ].map((brand, i) => (
                            <div key={i} className="flex flex-col justify-center items-start px-8 py-6 mx-3 rounded-[24px] border border-slate-100 shadow-sm whitespace-nowrap shrink-0 hover:shadow-lg transition-all duration-300" style={{ background: brand.bg, minWidth: 260 }}>
                                <svg width="220" height="45" viewBox="0 0 220 45">
                                    <text x="0" y="35" fontFamily="'Inter', sans-serif" fontWeight="900" fontSize="32" fill={brand.accent} letterSpacing="-1.5">
                                        {brand.name}
                                    </text>
                                </svg>
                                <span className="text-[12px] font-black uppercase tracking-[0.2em] mt-2" style={{ color: brand.accent, opacity: 0.6 }}>{brand.tag}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-20 bg-slate-50 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-5 tracking-tight">Bizning Ekosistema</h2>
                        <p className="text-lg md:text-xl text-slate-600 font-medium">Operatsion xarajatlarni qisqartirib, daromadni oshiruvchi premium biznes vositalari.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "EVIKO POS",
                                desc: "Savdo va xizmat ko'rsatish shaxobchalari uchun super tezkor kassa va ombor hisobi tizimi.",
                                icon: MonitorSmartphone,
                                bg: "bg-blue-600",
                                features: ["Online kassalar", "Ombor hisobi", "QR Menyu", "Xodimlar boshqaruvi"],
                                action: "Batafsil"
                            },
                            {
                                title: "Maxsus Dasturlar",
                                desc: "Sizning biznes jarayonlaringizga to'liq moslashgan maxsus Web va Mobile (iOS/Android) ilovalar.",
                                icon: Code2,
                                bg: "bg-indigo-600",
                                features: ["Web Loyihalar", "Mobile Ilovalar", "Murakkab ERP", "API Integratsiyalar"],
                                action: "Ariza qoldirish"
                            },
                            {
                                title: "Telegram Botlar",
                                desc: "Mijozlar bilan avtomatik ishlash va buyurtmalar qabul qilish uchun aqlli botlar.",
                                icon: Bot,
                                bg: "bg-violet-600",
                                features: ["Do'kon botlari", "CRM botlar", "To'lov tizimlari", "Avto-javoblar"],
                                action: "Ariza qoldirish"
                            }
                        ].map((service, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full">
                                <div className={`w-16 h-16 rounded-2xl ${service.bg} flex items-center justify-center mb-6 shadow-lg shadow-[${service.bg}]/30`}>
                                    <service.icon className="text-white" size={32} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-[26px] font-black text-slate-900 mb-4 tracking-tight">{service.title}</h3>
                                <p className="text-slate-600 text-[16px] leading-relaxed font-medium mb-8 flex-grow">{service.desc}</p>
                                <ul className="space-y-4 mb-8">
                                    {service.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-[15px] font-bold text-slate-700">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                <CheckCircle2 size={16} className="text-blue-600" />
                                            </div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <button 
                                    onClick={() => service.action === "Batafsil" ? window.location.href="/portal" : setIsModalOpen(true)}
                                    className={`w-full py-4 rounded-2xl font-bold text-[16px] transition-all flex items-center justify-center gap-2 ${service.action === 'Batafsil' ? 'bg-slate-100 text-slate-800 hover:bg-slate-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30'}`}
                                >
                                    {service.action} <ArrowRight size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="contact" className="py-20 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-50">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 blur-[100px] rounded-full"></div>
                    <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/20 blur-[100px] rounded-full"></div>
                </div>
                <div className="max-w-5xl mx-auto px-6 text-center text-white relative z-10">
                    <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Biznesingizni Biz Bilan O'stiring</h2>
                    <p className="text-slate-300 text-xl font-medium mb-12 max-w-2xl mx-auto">
                        Mutaxassislarimiz bilan bepul konsultatsiya orqali loyihangiz qanday qilib daromadni oshirishini bilib oling.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                        <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-xl transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3">
                            Ariza qoldirish <ArrowRight size={24} />
                        </button>
                        <a href="tel:+998772931014" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all flex items-center justify-center gap-3 backdrop-blur-md">
                            <Phone size={24} />
                            +998 77 293 10 14
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 py-10 border-t border-slate-800 text-center relative z-20">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <img src="/eviko-logo.svg" alt="EVIKO" className="h-10 w-auto brightness-0 invert opacity-50" />
                </div>
                <p className="text-slate-500 font-medium text-[15px]">
                    © {new Date().getFullYear()} EVIKO IT Solutions. Barcha huquqlar himoyalangan.
                </p>
            </footer>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl relative z-10 overflow-hidden"
                        >
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                            
                            {formStatus === "success" ? (
                                <div className="text-center py-10">
                                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 size={40} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">Arizangiz qabul qilindi!</h3>
                                    <p className="text-slate-600 font-medium text-[16px]">Mutaxassislarimiz tez orada siz bilan bog'lanishadi.</p>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Ariza qoldirish</h3>
                                    <p className="text-slate-500 font-medium text-[16px] mb-8">Ma'lumotlaringizni kiriting, biz sizga qayta aloqaga chiqamiz.</p>
                                    
                                    <form onSubmit={handleFormSubmit} className="space-y-5">
                                        <div>
                                            <label className="block text-[13px] font-bold text-slate-700 uppercase tracking-wider mb-2">Ismingiz</label>
                                            <input 
                                                type="text" required placeholder="Masalan: Sardor"
                                                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3.5 text-[16px] font-medium text-slate-900 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-bold text-slate-700 uppercase tracking-wider mb-2">Telefon raqamingiz</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-[16px]">+998</span>
                                                <input 
                                                    type="tel" required placeholder="90 123 45 67"
                                                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl pl-16 pr-4 py-3.5 text-[16px] font-bold text-slate-900 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-bold text-slate-700 uppercase tracking-wider mb-2">Qaysi xizmat qiziqtirdi?</label>
                                            <select className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3.5 text-[16px] font-medium text-slate-900 outline-none transition-all appearance-none">
                                                <option>EVIKO POS (Avtomatizatsiya)</option>
                                                <option>Maxsus Web/Mobile Dastur</option>
                                                <option>Telegram Bot</option>
                                                <option>Boshqa / Maslahat kerak</option>
                                            </select>
                                        </div>
                                        <button 
                                            type="submit" disabled={formStatus === "submitting"}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-4 font-black text-[16px] mt-4 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {formStatus === "submitting" ? (
                                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>Yuborish <Send size={18} /></>
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

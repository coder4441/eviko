"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, UserCheck, MonitorPlay } from "lucide-react";

export default function PortalPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 selection:bg-blue-200">
            
            <div className="w-full max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-6 font-semibold text-sm">
                        <ArrowLeft size={16} /> Bosh sahifaga qaytish
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">Tizimga kirish</h1>
                    <p className="text-slate-500 font-medium">O'zingizga kerakli portalni tanlang</p>
                </div>

                {/* Portals Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    
                    {/* Admin Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-start relative overflow-hidden group hover:border-blue-200 transition-colors"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                        <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                            <BriefcaseBusiness size={28} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Admin Panel</h2>
                        <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">
                            Restoran, kafe va savdo nuqtalari rahbarlari uchun. Biznesingizni boshqarish, hisobotlarni ko'rish va tizim sozlamalari.
                        </p>
                        
                        <div className="mt-auto w-full">
                            <Link href="/login" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                                Tizimga kirish <ArrowRight size={16} />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Agent Portal */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-start relative overflow-hidden group hover:border-violet-200 transition-colors"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                        <div className="w-14 h-14 bg-violet-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30">
                            <UserCheck size={28} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Agent Portal</h2>
                        <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">
                            Sotuv agentlari va hamkorlar uchun maxsus portal. Yangi mijozlarni qo'shish va bonuslarni kuzatish.
                        </p>
                        
                        <div className="mt-auto w-full">
                            <Link href="/agent-portal" className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                                Tizimga kirish <ArrowRight size={16} />
                            </Link>
                        </div>
                    </motion.div>

                    {/* KDS (Kitchen Display System) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-start relative overflow-hidden group hover:border-amber-200 transition-colors"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                        <div className="w-14 h-14 bg-amber-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30">
                            <MonitorPlay size={28} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Oshxona (KDS)</h2>
                        <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">
                            Oshpazlar va oshxona xodimlari uchun maxsus ekran. Buyurtmalarni qabul qilish va tayyorlash jarayonini boshqarish.
                        </p>
                        
                        <div className="mt-auto w-full">
                            <Link href="/kds-login" className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                                Tizimga kirish <ArrowRight size={16} />
                            </Link>
                        </div>
                    </motion.div>

                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 text-center">
                <img src="/eviko-logo.svg" alt="EVIKO" className="h-6 w-auto mx-auto grayscale opacity-50 mb-3" />
                <p className="text-xs font-bold text-slate-400">© {new Date().getFullYear()} EVIKO IT Solutions</p>
            </div>
        </div>
    );
}

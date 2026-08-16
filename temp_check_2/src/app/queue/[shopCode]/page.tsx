"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function QueueDisplayPage() {
    const params = useParams();
    const shopCode = (params?.shopCode as string) || "";

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [shopName, setShopName] = useState("EVIKO");
    const [themeColor, setThemeColor] = useState("#f97316");

    const [preparing, setPreparing] = useState<number[]>([]);
    const [ready, setReady] = useState<number[]>([]);
    const prevReadyRef = useRef<number[]>([]);

    const fetchQueue = async () => {
        try {
            const res = await fetch(`/api/queue/${shopCode}`);
            if (!res.ok) throw new Error("Yuklab bo'lmadi");
            const data = await res.json();
            if (data.tenant) {
                setShopName(data.tenant.shopName);
                if (data.tenant.themeColor) setThemeColor(data.tenant.themeColor);
            }
            setPreparing(data.preparing || []);
            const newReady = data.ready || [];
            const added = newReady.filter((n: number) => !prevReadyRef.current.includes(n));
            if (added.length > 0 && prevReadyRef.current.length >= 0) playBell();
            prevReadyRef.current = newReady;
            setReady(newReady);
            setLoading(false);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!shopCode) return;
        fetchQueue();
        const interval = setInterval(fetchQueue, 5000);
        return () => clearInterval(interval);
    }, [shopCode]);

    const playBell = () => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            [0, 0.3, 0.6].forEach(delay => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(880, ctx.currentTime + delay);
                osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + delay + 0.6);
                gain.gain.setValueAtTime(0.8, ctx.currentTime + delay);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.6);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + delay);
                osc.stop(ctx.currentTime + delay + 0.7);
            });
        } catch {}
    };

    if (error) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center text-gray-700">
                <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                <h1 className="text-2xl font-bold">Xatolik: {error}</h1>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-14 h-14 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
            </div>
        );
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
    const dateStr = now.toLocaleDateString("uz-UZ", { day: "2-digit", month: "long", year: "numeric" });

    return (
        <div className="min-h-screen bg-white flex flex-col overflow-hidden select-none" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

            {/* ── HEADER ─────────────────────────────────────────── */}
            <header className="flex items-center justify-between px-8 py-4 shadow-sm border-b-4" style={{ borderColor: themeColor }}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg" style={{ background: themeColor }}>
                        {shopName.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">{shopName}</h1>
                        <p className="text-sm font-semibold text-gray-400 mt-0.5">Buyurtmalar Navbati</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-4xl font-black text-gray-800 tabular-nums">{timeStr}</p>
                    <p className="text-sm text-gray-400 font-medium">{dateStr}</p>
                </div>
            </header>

            {/* ── COLUMN HEADERS ─────────────────────────────────── */}
            <div className="grid grid-cols-2 text-white text-center" style={{ minHeight: "72px" }}>
                <div className="flex items-center justify-center gap-3 py-4" style={{ background: "#f59e0b" }}>
                    <Clock className="w-7 h-7" />
                    <span className="text-2xl font-black tracking-wider uppercase">Tayyorlanmoqda</span>
                    <span className="bg-white/30 text-white text-base font-black px-3 py-1 rounded-full ml-1">
                        {preparing.length}
                    </span>
                </div>
                <div className="flex items-center justify-center gap-3 py-4" style={{ background: "#16a34a" }}>
                    <CheckCircle2 className="w-7 h-7" />
                    <span className="text-2xl font-black tracking-wider uppercase">Tayyor!</span>
                    <span className="bg-white/30 text-white text-base font-black px-3 py-1 rounded-full ml-1">
                        {ready.length}
                    </span>
                </div>
            </div>

            {/* ── MAIN GRID ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 flex-1 divide-x-4 divide-gray-100" style={{ minHeight: 0 }}>

                {/* LEFT: Tayyorlanmoqda */}
                <div className="bg-amber-50 p-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
                    {preparing.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 text-amber-300 py-20">
                            <Clock className="w-20 h-20 opacity-30" />
                            <p className="text-2xl font-black uppercase tracking-widest text-amber-300">Hozircha yo'q</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4 auto-rows-max content-start">
                            {preparing.map(num => (
                                <div key={num}
                                    className="bg-white rounded-3xl shadow-md border-2 border-amber-100 flex items-center justify-center py-8 hover:shadow-lg transition-all"
                                    style={{ aspectRatio: "1" }}>
                                    <span className="text-6xl font-black text-gray-800 leading-none tabular-nums">{num}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT: Tayyor */}
                <div className="bg-green-50 p-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
                    {ready.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 text-green-300 py-20">
                            <CheckCircle2 className="w-20 h-20 opacity-30" />
                            <p className="text-2xl font-black uppercase tracking-widest text-green-300">Kutilmoqda...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-5 auto-rows-max content-start">
                            {ready.map((num, i) => (
                                <div key={num}
                                    className={`rounded-3xl flex items-center justify-center py-8 shadow-lg transition-all
                                        ${i === ready.length - 1
                                            ? "border-4 border-green-400 scale-105 shadow-green-200 shadow-xl animate-pulse"
                                            : "bg-green-500 border-2 border-green-400"
                                        }`}
                                    style={{
                                        background: i === ready.length - 1 ? "#16a34a" : "#22c55e",
                                        aspectRatio: "1"
                                    }}>
                                    <span className="text-7xl font-black text-white leading-none tabular-nums drop-shadow-sm">{num}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── FOOTER TICKER ──────────────────────────────────── */}
            <footer className="bg-gray-900 py-3 overflow-hidden flex-shrink-0">
                <div className="flex whitespace-nowrap">
                    <span className="text-lg font-bold text-gray-300 animate-[marquee_25s_linear_infinite] inline-block pr-12">
                        🛎️&nbsp; Buyurtmangiz raqami yashil bo'lganda kassaga yaqinlashing va buyurtmangizni oling! &nbsp;•&nbsp;
                        ✅&nbsp; Iltimos, chekingizni ko'rsatib buyurtmani qabul qiling. &nbsp;•&nbsp;
                        🍽️&nbsp; Yoqimli ishtaha, xush kelibsiz! &nbsp;•&nbsp;
                        📱&nbsp; QR kodni skanerlang va onlayn menyu bilan tanishing. &nbsp;•&nbsp;
                    </span>
                </div>
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes marquee {
                        0% { transform: translateX(100vw); }
                        100% { transform: translateX(-100%); }
                    }
                `}} />
            </footer>
        </div>
    );
}

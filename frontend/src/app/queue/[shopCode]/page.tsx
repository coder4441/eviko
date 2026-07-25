"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function QueueDisplayPage() {
    const params = useParams();
    const shopCode = (params?.shopCode as string) || "";

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [shopName, setShopName] = useState("KFC uslubi");
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
            
            // Check for new ready orders to play sound
            const newReady = data.ready || [];
            if (prevReadyRef.current.length > 0) {
                const added = newReady.filter((n: number) => !prevReadyRef.current.includes(n));
                if (added.length > 0) {
                    playBellSound();
                }
            }
            prevReadyRef.current = newReady;
            setReady(newReady);
            
            setLoading(false);
        } catch (err: any) {
            setError(err.message);
        }
    };

    useEffect(() => {
        if (!shopCode) return;
        fetchQueue();
        const interval = setInterval(fetchQueue, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [shopCode]);

    const playBellSound = () => {
        // Simple ding sound using Web Audio API
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = "bell" as any; // sine is default
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 1.5);
            
            gain.gain.setValueAtTime(1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 1.5);
        } catch (e) {
            console.warn("Audio play error", e);
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-3xl font-bold">Xatolik: {error}</h1>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col">
            {/* Header */}
            <header className="py-4 px-8 border-b-4 border-gray-800 flex justify-between items-center" style={{ borderColor: themeColor }}>
                <h1 className="text-4xl font-black tracking-widest uppercase flex items-center gap-4" style={{ color: themeColor }}>
                    {shopName} <span className="text-white text-2xl font-bold tracking-normal opacity-50">/ Buyurtmalar Holati</span>
                </h1>
                <div className="text-2xl font-bold text-gray-400">
                    EVIKO SMART TV
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 grid grid-cols-2">
                
                {/* Left Side: PREPARING */}
                <div className="border-r border-gray-800 flex flex-col">
                    <div className="py-6 bg-gray-900 flex justify-center items-center gap-4">
                        <Clock className="w-12 h-12 text-yellow-500" />
                        <h2 className="text-5xl font-black text-yellow-500 uppercase tracking-wider">Tayyorlanmoqda</h2>
                    </div>
                    <div className="flex-1 p-8 overflow-hidden">
                        <div className="grid grid-cols-3 gap-6 auto-rows-max">
                            {preparing.map(num => (
                                <div key={num} className="bg-gray-800/50 border border-gray-700 rounded-3xl p-6 flex items-center justify-center shadow-lg">
                                    <span className="text-7xl font-black text-white">{num}</span>
                                </div>
                            ))}
                            {preparing.length === 0 && (
                                <div className="col-span-3 text-center text-gray-600 text-3xl font-bold mt-20">
                                    Hozircha buyurtmalar yo'q
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: READY */}
                <div className="flex flex-col bg-green-950/20">
                    <div className="py-6 bg-green-900 flex justify-center items-center gap-4 shadow-lg">
                        <CheckCircle2 className="w-12 h-12 text-green-400 animate-pulse" />
                        <h2 className="text-5xl font-black text-green-400 uppercase tracking-wider">Tayyor</h2>
                    </div>
                    <div className="flex-1 p-8 overflow-hidden">
                        <div className="grid grid-cols-2 gap-8 auto-rows-max">
                            {ready.map((num, i) => (
                                <div 
                                    key={num} 
                                    className={`rounded-3xl p-8 flex items-center justify-center shadow-2xl transition-all
                                        ${i === ready.length - 1 ? 'bg-green-500 border-4 border-white animate-pulse scale-105' : 'bg-green-600 border border-green-500'}
                                    `}
                                >
                                    <span className="text-8xl font-black text-white drop-shadow-md">{num}</span>
                                </div>
                            ))}
                            {ready.length === 0 && (
                                <div className="col-span-2 text-center text-green-900/50 text-4xl font-black mt-20 uppercase tracking-widest">
                                    Kutish...
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer ticker (Optional) */}
            <div className="bg-gray-900 py-3 overflow-hidden whitespace-nowrap">
                <p className="text-xl font-bold text-gray-500 animate-[marquee_20s_linear_infinite] inline-block">
                    Iltimos, navbatingiz yetganda chekni ko'rsatib buyurtmani oling! • Iloji bo'lsa raqamingiz ekranda YASHIL rangda chiqqanidagina kassaga yaqinlashing. • Yoqimli ishtaha!
                </p>
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes marquee {
                        0% { transform: translateX(100vw); }
                        100% { transform: translateX(-100%); }
                    }
                `}} />
            </div>
        </div>
    );
}

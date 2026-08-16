"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Check, Utensils, AlertTriangle, LogOut } from "lucide-react";
import { useStore } from "@/lib/store";

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
}

interface Order {
    id: string;
    dailyOrderNumber: number;
    queueStatus: "PREPARING" | "READY";
    createdAt: string;
    method: string;
    items: OrderItem[];
}

export default function KDSPage() {
    const router = useRouter();
    const { kassirSession } = useStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);

    // Auth guard: kassirSession yo'q bo'lsa /kds-login ga qaytarish
    useEffect(() => {
        const session = useStore.getState().kassirSession;
        if (!session) {
            router.replace("/kds-login");
        } else {
            setAuthChecked(true);
        }
    }, [router]);

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/eviko/kds");
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Failed to fetch KDS orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authChecked) return;
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, [authChecked]);

    const updateStatus = async (id: string, newStatus: string) => {
        if (newStatus === "COMPLETED") {
            setOrders(prev => prev.filter(o => o.id !== id));
        } else {
            setOrders(prev => prev.map(o => o.id === id ? { ...o, queueStatus: newStatus as any } : o));
        }

        try {
            await fetch("/api/eviko/kds", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, newStatus })
            });
        } catch (error) {
            console.error("Failed to update status", error);
            fetchOrders();
        }
    };

    const handleLogout = () => {
        useStore.getState().setKassirSession(null);
        router.replace("/kds-login");
    };

    if (!authChecked || loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const preparingOrders = orders.filter(o => o.queueStatus === "PREPARING");
    const readyOrders = orders.filter(o => o.queueStatus === "READY");

    return (
        <div className="p-6 h-screen flex flex-col bg-slate-100 overflow-hidden">
            <header className="flex justify-between items-center mb-6 shrink-0 bg-white p-4 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                        <Utensils className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800">Oshxona Ekrani (KDS)</h1>
                        <p className="text-sm text-slate-500 font-medium">
                            {kassirSession?.name || "Xodim"} — Buyurtmalarni boshqarish markazi
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl border border-yellow-200 font-bold">
                        Tayyorlanmoqda: {preparingOrders.length}
                    </div>
                    <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-200 font-bold">
                        Kutmoqda: {readyOrders.length}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl border border-slate-200 font-bold transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> Chiqish
                    </button>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                {/* PREPARING COLUMN */}
                <div className="flex flex-col bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 bg-yellow-500 text-white font-black text-xl flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <Clock className="w-6 h-6" /> TAYYORLANMOQDA
                        </div>
                        <span className="bg-white/20 px-3 py-1 rounded-lg">{preparingOrders.length}</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                        {preparingOrders.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                                <CheckCircle2 className="w-16 h-16 opacity-20" />
                                <p className="font-bold text-lg">Yangi buyurtmalar yo'q</p>
                            </div>
                        )}
                        
                        {preparingOrders.map(order => (
                            <div key={order.id} className="bg-white rounded-2xl border-2 border-yellow-200 shadow-sm p-5 hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center text-2xl font-black">
                                            {order.dailyOrderNumber}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase">Buyurtma turi</p>
                                            <p className="font-black text-slate-800">{order.method}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-slate-400">
                                        {new Date(order.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                
                                <ul className="space-y-2 mb-5">
                                    {order.items.map(item => (
                                        <li key={item.id} className="flex justify-between items-center text-slate-700 font-bold text-lg">
                                            <span>{item.name}</span>
                                            <span className="bg-slate-100 px-3 py-1 rounded-lg">x{item.quantity}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button 
                                    onClick={() => updateStatus(order.id, "READY")}
                                    className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-xl text-lg flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                                >
                                    <Check className="w-6 h-6" /> TAYYOR QILISH
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* READY COLUMN */}
                <div className="flex flex-col bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 bg-green-500 text-white font-black text-xl flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-6 h-6" /> TAYYOR (Olib ketish kutilmoqda)
                        </div>
                        <span className="bg-white/20 px-3 py-1 rounded-lg">{readyOrders.length}</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                        {readyOrders.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                                <Utensils className="w-16 h-16 opacity-20" />
                                <p className="font-bold text-lg">Mijoz kutayotgan buyurtma yo'q</p>
                            </div>
                        )}
                        
                        {readyOrders.map(order => (
                            <div key={order.id} className="bg-white rounded-2xl border-2 border-green-200 shadow-sm p-5 hover:shadow-md transition">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-2xl font-black">
                                            {order.dailyOrderNumber}
                                        </div>
                                        <span className="font-bold text-slate-500">{order.items.length} ta mahsulot</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-orange-500 bg-orange-50 px-3 py-1 rounded-lg font-bold text-sm">
                                        <AlertTriangle className="w-4 h-4" /> TV Ekranda chiqib turibdi
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => updateStatus(order.id, "COMPLETED")}
                                    className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl text-lg transition active:scale-95"
                                >
                                    OLIB KETILDI (Ekranni tozalash)
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

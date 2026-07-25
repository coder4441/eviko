"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
    Bell, Utensils, Search, Phone, CheckCircle2,
    AlertCircle, RefreshCw, X, ChevronRight, Coffee,
    Instagram, Send, MapPin
} from "lucide-react";

interface Product {
    id: string;
    name: string;
    category: string;
    sellingPrice: number;
    unit: string;
    image?: string;
    type?: string;
    inStock?: number;
}

interface TenantInfo {
    shopCode: string;
    shopName: string;
    phone: string;
    address: string;
    settings?: {
        logoUrl?: string;
        phone?: string;
        instagram?: string;
        telegram?: string;
        themeColor?: string;
    };
}

function formatPrice(val: number) {
    return val.toLocaleString("uz-UZ") + " so'm";
}

// Lighten a hex color by mixing with white for backgrounds
function hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}
function lighten(hex: string, amount = 0.9): string {
    try {
        const { r, g, b } = hexToRgb(hex);
        const lr = Math.round(r + (255 - r) * amount);
        const lg = Math.round(g + (255 - g) * amount);
        const lb = Math.round(b + (255 - b) * amount);
        return `rgb(${lr},${lg},${lb})`;
    } catch { return "#f1f5f9"; }
}

export default function PublicQRMenuPage() {
    const params = useParams();
    const searchParams = useSearchParams();

    const shopCode = (params?.shopCode as string) || "";
    const tableNumber = searchParams?.get("table") || searchParams?.get("stol") || "";

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tenant, setTenant] = useState<TenantInfo | null>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");

    const [callingWaiter, setCallingWaiter] = useState(false);
    const [callModalOpen, setCallModalOpen] = useState(false);
    const [callNote, setCallNote] = useState("");
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState<number>(0);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setInterval(() => setCooldown(p => p - 1), 1000);
        return () => clearInterval(t);
    }, [cooldown]);

    useEffect(() => {
        if (!shopCode) return;
        setLoading(true);
        fetch(`/api/menu/${shopCode}`)
            .then(async res => {
                if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Yuklab bo'lmadi"); }
                return res.json();
            })
            .then(data => {
                setTenant(data.tenant);
                setCategories(data.categories || []);
                setProducts(data.products || []);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [shopCode]);

    const filteredProducts = useMemo(() =>
        products.filter(p => {
            const matchCat = activeCategory === "all" || p.category === activeCategory;
            const q = searchQuery.toLowerCase().trim();
            const matchQ = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
            return matchCat && matchQ;
        }),
    [products, activeCategory, searchQuery]);

    const grouped = useMemo(() => {
        if (activeCategory !== "all") return { [activeCategory]: filteredProducts };
        return filteredProducts.reduce((acc, p) => {
            if (!acc[p.category]) acc[p.category] = [];
            acc[p.category].push(p);
            return acc;
        }, {} as Record<string, Product[]>);
    }, [filteredProducts, activeCategory]);

    const handleCallWaiter = async () => {
        if (cooldown > 0) return;
        setCallingWaiter(true);
        try {
            const res = await fetch("/api/menu/call-waiter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shopCode, tableNumber: tableNumber || "Umumiy", notes: callNote.trim() || undefined })
            });
            const data = await res.json();
            if (res.ok) {
                setCallModalOpen(false);
                setCallNote("");
                setToastMessage(data.message || "✅ Ofitsiantga xabar yuborildi!");
                setCooldown(60);
                setTimeout(() => setToastMessage(null), 5000);
            } else {
                alert(data.error || "Xatolik yuz berdi");
            }
        } catch { alert("Ulanishda xatolik"); }
        finally { setCallingWaiter(false); }
    };

    /* ─── LOADING ─────────────────────────────────── */
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-gray-200 border-t-gray-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Utensils className="w-8 h-8 text-gray-400" />
                    </div>
                </div>
                <p className="mt-5 text-gray-500 font-semibold text-sm animate-pulse">Menyu yuklanmoqda...</p>
            </div>
        );
    }

    /* ─── ERROR ───────────────────────────────────── */
    if (error || !tenant) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mb-4 text-red-400">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <h1 className="text-xl font-bold text-gray-800 mb-2">Menyu topilmadi</h1>
                <p className="text-gray-500 text-sm max-w-xs mb-6">{error || "Muassasa menyusi mavjud emas."}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-5 py-2.5 bg-gray-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition hover:bg-gray-800"
                >
                    <RefreshCw className="w-4 h-4" /> Qayta urinib ko'rish
                </button>
            </div>
        );
    }

    const tc = tenant.settings?.themeColor || "#f97316";          // solid theme color
    const tcLight = lighten(tc, 0.88);                            // very light tint for bg
    const tcLighter = lighten(tc, 0.94);                          // even lighter for cards
    const phone = tenant.settings?.phone || tenant.phone;

    /* ─── MAIN PAGE ───────────────────────────────── */
    return (
        <div className="min-h-screen pb-32 font-sans" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#f9fafb" }}>

            {/* ── TOAST ────────────────────────────────────── */}
            {toastMessage && (
                <div className="fixed top-4 left-4 right-4 z-50">
                    <div className="max-w-sm mx-auto text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3" style={{ background: tc }}>
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-semibold">{toastMessage}</span>
                    </div>
                </div>
            )}

            {/* ── HEADER ───────────────────────────────────── */}
            <div className="pt-10 pb-24 px-5" style={{ background: tc }}>
                <div className="max-w-md mx-auto">
                    {/* Status bar */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Onlayn Menyu</span>
                        </div>
                        {tableNumber && (
                            <div className="bg-white font-extrabold text-xs px-4 py-1.5 rounded-full shadow-md" style={{ color: tc }}>
                                🍽️ Stol #{tableNumber}
                            </div>
                        )}
                    </div>

                    {/* Branding */}
                    <div className="flex items-center gap-4">
                        {tenant.settings?.logoUrl ? (
                            <img src={tenant.settings.logoUrl} alt={tenant.shopName}
                                className="w-16 h-16 object-cover rounded-2xl bg-white shadow-xl shrink-0" />
                        ) : (
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-xl shrink-0 bg-white/20 text-white">
                                {tenant.shopName.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-black text-white leading-tight">{tenant.shopName}</h1>
                            <div className="flex flex-wrap items-center gap-3 mt-1">
                                {tenant.address && (
                                    <span className="flex items-center gap-1 text-xs text-white/80">
                                        <MapPin className="w-3 h-3" /> {tenant.address}
                                    </span>
                                )}
                                {phone && (
                                    <a href={`tel:${phone}`} className="flex items-center gap-1 text-xs text-white/80 hover:text-white">
                                        <Phone className="w-3 h-3" /> {phone}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── SEARCH (overlapping) ─────────────────────── */}
            <div className="max-w-md mx-auto px-4 -mt-14 relative z-10 mb-2">
                <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Taom yoki ichimlik qidirish..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-2xl pl-11 pr-10 py-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none shadow-lg transition"
                        style={{ "--tw-ring-color": tc } as React.CSSProperties}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* ── CATEGORY TABS ────────────────────────────── */}
            <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 py-3">
                <div className="max-w-md mx-auto px-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {[
                        { key: "all", label: "Barchasi", count: products.length },
                        ...categories.map(c => ({ key: c, label: c, count: products.filter(p => p.category === c).length }))
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveCategory(tab.key)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border"
                            style={activeCategory === tab.key
                                ? { background: tc, color: "#fff", borderColor: tc }
                                : { background: "#fff", color: "#64748b", borderColor: "#e2e8f0" }
                            }
                        >
                            {tab.label}
                            <span
                                className="px-1.5 py-0.5 rounded-md text-[10px] font-black"
                                style={activeCategory === tab.key
                                    ? { background: "rgba(255,255,255,0.25)", color: "#fff" }
                                    : { background: "#f1f5f9", color: "#94a3b8" }
                                }
                            >
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── PRODUCT LIST ─────────────────────────────── */}
            <main className="max-w-md mx-auto px-4 pt-5 space-y-8">
                {filteredProducts.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4" style={{ background: tcLight }}>
                            <Coffee className="w-8 h-8" style={{ color: tc }} />
                        </div>
                        <p className="text-gray-400 font-medium">Ushbu bo'limda taomlar topilmadi</p>
                    </div>
                ) : (
                    Object.entries(grouped).map(([cat, items]) => (
                        <section key={cat}>
                            {activeCategory === "all" && (
                                <div className="flex items-center gap-3 mb-3">
                                    <h2 className="text-sm font-black text-gray-700 uppercase tracking-wider">{cat}</h2>
                                    <div className="flex-1 h-px bg-gray-200" />
                                    <span className="text-xs text-gray-400">{items.length} ta</span>
                                </div>
                            )}
                            <div className="space-y-3">
                                {items.map(product => (
                                    <div key={product.id}
                                        className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex items-stretch shadow-sm hover:shadow-md transition group">
                                        {/* Image */}
                                        <div className="w-24 h-24 flex items-center justify-center shrink-0 relative overflow-hidden"
                                            style={{ background: tcLighter }}>
                                            {product.image ? (
                                                <img src={product.image} alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                                            ) : (
                                                <Utensils className="w-8 h-8 opacity-30" style={{ color: tc }} />
                                            )}
                                        </div>
                                        {/* Info */}
                                        <div className="flex-1 px-3.5 py-3 flex flex-col justify-center">
                                            <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: tc }}>
                                                {product.category}
                                            </span>
                                            <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2">
                                                {product.name}
                                            </h3>
                                            <div className="mt-2 flex items-baseline gap-2">
                                                <span className="text-base font-black" style={{ color: tc }}>
                                                    {formatPrice(product.sellingPrice)}
                                                </span>
                                                {product.unit && <span className="text-xs text-gray-400">/ {product.unit}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </main>

            {/* ── SOCIAL FOOTER ────────────────────────────── */}
            {(tenant.settings?.instagram || tenant.settings?.telegram || phone) && (
                <footer className="max-w-md mx-auto px-4 mt-10 pt-6 border-t border-gray-200">
                    <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Biz bilan bog'laning</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {phone && (
                            <a href={`tel:${phone}`}
                                className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs text-gray-600 font-semibold shadow-sm transition hover:border-current"
                                style={{ "--hover-color": tc } as React.CSSProperties}>
                                <Phone className="w-3.5 h-3.5 text-green-500" /> {phone}
                            </a>
                        )}
                        {tenant.settings?.instagram && (
                            <a href={tenant.settings.instagram.startsWith("http") ? tenant.settings.instagram : `https://instagram.com/${tenant.settings.instagram.replace("@", "")}`}
                                target="_blank" rel="noreferrer"
                                className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs text-gray-600 font-semibold shadow-sm transition">
                                <Instagram className="w-3.5 h-3.5 text-pink-500" /> {tenant.settings.instagram}
                            </a>
                        )}
                        {tenant.settings?.telegram && (
                            <a href={tenant.settings.telegram.startsWith("http") ? tenant.settings.telegram : `https://t.me/${tenant.settings.telegram.replace("@", "")}`}
                                target="_blank" rel="noreferrer"
                                className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs text-gray-600 font-semibold shadow-sm transition">
                                <Send className="w-3.5 h-3.5 text-sky-500" /> {tenant.settings.telegram}
                            </a>
                        )}
                    </div>
                </footer>
            )}

            {/* ── WAITER CALL FAB ──────────────────────────── */}
            <div className="fixed bottom-5 left-4 right-4 z-40">
                <div className="max-w-md mx-auto">
                    <button
                        onClick={() => setCallModalOpen(true)}
                        disabled={cooldown > 0}
                        className="w-full py-4 px-6 rounded-2xl font-bold text-base shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
                        style={cooldown > 0
                            ? { background: "#e2e8f0", color: "#94a3b8", cursor: "not-allowed" }
                            : { background: tc, color: "#fff" }
                        }
                    >
                        <Bell className={`w-5 h-5 ${cooldown > 0 ? "" : "animate-bounce"}`} />
                        {cooldown > 0
                            ? `Qayta chaqirish mumkin (${cooldown}s)`
                            : `🛎️ Ofitsiantni chaqirish${tableNumber ? ` — Stol #${tableNumber}` : ""}`}
                    </button>
                </div>
            </div>

            {/* ── CALL MODAL ───────────────────────────────── */}
            {callModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
                        {/* Modal header */}
                        <div className="px-6 pt-6 pb-8 relative text-white" style={{ background: tc }}>
                            <button onClick={() => setCallModalOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
                                <Bell className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-lg font-black">Ofitsiantni chaqirasizmi?</h2>
                            <p className="text-white/80 text-xs mt-1">
                                {tableNumber
                                    ? `Stol #${tableNumber} uchun ofitsiantga darhol xabarnoma yuboriladi.`
                                    : "Ofitsiantga xabarnoma yuboriladi."}
                            </p>
                        </div>

                        <div className="px-6 py-5 space-y-4">
                            {!tableNumber && (
                                <div className="rounded-xl p-3 border" style={{ background: tcLight, borderColor: tcLight }}>
                                    <label className="block text-xs font-bold mb-1.5" style={{ color: tc }}>Stol raqami (ixtiyoriy):</label>
                                    <input type="text" placeholder="Masalan: 5" value={callNote}
                                        onChange={e => setCallNote(e.target.value)}
                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition" />
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button onClick={() => setCallModalOpen(false)}
                                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition">
                                    Bekor qilish
                                </button>
                                <button onClick={handleCallWaiter} disabled={callingWaiter}
                                    className="flex-1 py-3 text-white text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg transition hover:opacity-90"
                                    style={{ background: tc }}>
                                    {callingWaiter
                                        ? <RefreshCw className="w-4 h-4 animate-spin" />
                                        : <><span>Chaqirish</span><ChevronRight className="w-4 h-4" /></>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { QRCodeSVG } from "qrcode.react";
import { 
    QrCode, Copy, Check, ExternalLink, Printer, LayoutGrid, Sparkles, 
    Palette, Phone, Instagram, Send, Image as ImageIcon, Save, X, RefreshCw, Upload, Trash2
} from "lucide-react";

interface MenuSettings {
    logoUrl: string;
    phone: string;
    instagram: string;
    telegram: string;
}

export default function AdminQRMenuPage() {
    const store = useStore();
    
    const [selectedTable, setSelectedTable] = useState<string>("all");
    const [copied, setCopied] = useState(false);
    const [baseUrl, setBaseUrl] = useState("");
    const [shopCode, setShopCode] = useState("EV-1234");
    const [shopName, setShopName] = useState("Restoran & Kafe");

    // Design Modal State
    const [designModalOpen, setDesignModalOpen] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [settings, setSettings] = useState<MenuSettings>({
        logoUrl: "",
        phone: "+998901234567",
        instagram: "@eviko_restaurant",
        telegram: "@eviko_bot"
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setBaseUrl(window.location.origin);
        }
        store.fetchSmartTables();

        // Session orqali tenant ma'lumotlarini olish
        fetch("/api/menu/settings")
            .then(res => res.json())
            .then(data => {
                if (data.tenant) {
                    setShopCode(data.tenant.shopCode || "EV-1234");
                    setShopName(data.tenant.shopName || "Restoran & Kafe");
                }
                if (data.settings) {
                    setSettings({
                        logoUrl: data.settings.logoUrl || "",
                        phone: data.settings.phone || "",
                        instagram: data.settings.instagram || "",
                        telegram: data.settings.telegram || ""
                    });
                }
            })
            .catch(() => {
                if (typeof window !== "undefined") {
                    const activeShop = localStorage.getItem("smart-active-shop");
                    if (activeShop) setShopCode(activeShop);
                }
            });
    }, []);

    const targetUrl = selectedTable === "all"
        ? `${baseUrl}/menu/${shopCode}`
        : `${baseUrl}/menu/${shopCode}?table=${selectedTable}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(targetUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = () => {
        window.print();
    };

    // File Upload Handler (PNG/JPG -> Base64)
    const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 3 * 1024 * 1024) {
            alert("Rasm hajmi juda katta (maksimum 3MB)!");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            if (base64) {
                setSettings((prev) => ({ ...prev, logoUrl: base64 }));
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveLogo = () => {
        setSettings((prev) => ({ ...prev, logoUrl: "" }));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        try {
            const res = await fetch("/api/menu/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });

            const data = await res.json();
            if (res.ok) {
                if (data.tenant?.shopCode) setShopCode(data.tenant.shopCode);
                if (data.tenant?.shopName) setShopName(data.tenant.shopName);
                setDesignModalOpen(false);
                alert("✅ Logo va kontaktlar muvaffaqiyatli saqlandi!");
            } else {
                alert(data.error || "Saqlashda xatolik yuz berdi");
            }
        } catch {
            alert("Ulanishda xatolik yuz berdi");
        } finally {
            setSavingSettings(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            
            {/* PAGE HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400">
                            <QrCode className="w-5 h-5" />
                        </div>
                        <span>QR Kodli Menyu Generator</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Mijozlaringiz uchun stollarga qo'yiladigan QR kodlarni yaratish va yuklab olish paneli.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setDesignModalOpen(true)}
                        className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-purple-600/20 flex items-center gap-2 transition"
                    >
                        <Palette className="w-4 h-4" />
                        <span>🎨 Logo va Kontaktnilarni Sozlash</span>
                    </button>
                    <button
                        onClick={handleCopy}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700/80 flex items-center gap-2 transition"
                    >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        <span>{copied ? "Nusxalandi!" : "Nusxalash"}</span>
                    </button>
                    <a
                        href={targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700/80 flex items-center gap-2 transition"
                    >
                        <ExternalLink className="w-4 h-4" />
                        <span>Menyuni ko'rish</span>
                    </a>
                </div>
            </div>

            {/* MAIN GENERATOR CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* SETTINGS PANEL */}
                <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <LayoutGrid className="w-5 h-5 text-indigo-400" />
                        <span>QR Kod Parametrlari</span>
                    </h2>

                    {/* Shop Details */}
                    <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Muassasa nomi:</span>
                            <span className="font-bold text-white">{shopName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Muassasa kodi:</span>
                            <span className="font-mono text-indigo-400 font-bold">{shopCode}</span>
                        </div>
                    </div>

                    {/* Table Select */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">
                            Stolni tanlang:
                        </label>
                        <select
                            value={selectedTable}
                            onChange={(e) => setSelectedTable(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-indigo-500 transition"
                        >
                            <option value="all">Umumiy QR Menyu (Stolsiz)</option>
                            {store.smartTables.map((t) => {
                                const tableNum = t.name.replace(/^Stol\s*/i, "");
                                return (
                                    <option key={t.id} value={tableNum}>
                                        Stol #{tableNum} ({t.zone || "Asosiy zal"})
                                    </option>
                                );
                            })}
                        </select>
                        <p className="text-xs text-slate-500 mt-1">
                            Har bir stol uchun alohida QR kod tayyorlasangiz, mijoz chaqiruv berganda ofitsiantga stol raqami avtomatik yetib boradi.
                        </p>
                    </div>

                    {/* Edit Design Quick Button */}
                    <div className="p-4 bg-purple-950/30 border border-purple-800/40 rounded-2xl flex items-center justify-between">
                        <div className="space-y-0.5">
                            <div className="text-sm font-bold text-purple-200">PNG Logo & Aloqa Sozlamalari</div>
                            <div className="text-xs text-purple-400">Kompyuterdan PNG rasm logo yuklash hamda social tarmoqlar</div>
                        </div>
                        <button
                            onClick={() => setDesignModalOpen(true)}
                            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow transition"
                        >
                            Tahrirlash
                        </button>
                    </div>

                    {/* Preview URL */}
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-slate-400">
                            QR Kod Havolasi:
                        </label>
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-indigo-300 truncate">
                            {targetUrl}
                        </div>
                    </div>

                </div>

                {/* QR PREVIEW CARD (PRINTABLE AREA) */}
                <div className="lg:col-span-6 flex flex-col items-center">
                    <div className="bg-white text-slate-950 rounded-3xl p-8 shadow-2xl border-4 border-slate-800 flex flex-col items-center text-center max-w-sm w-full transition transform hover:scale-105">
                        
                        {/* Logo Preview */}
                        {settings.logoUrl ? (
                            <img 
                                src={settings.logoUrl} 
                                alt="Logo" 
                                className="w-20 h-20 object-contain rounded-2xl mb-3 p-1 border border-slate-200 shadow-sm"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-3 shadow-lg shadow-indigo-600/30">
                                {shopName.charAt(0)}
                            </div>
                        )}

                        <h3 className="text-xl font-black text-slate-900 tracking-tight">
                            {shopName}
                        </h3>

                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">
                            {selectedTable === "all" ? "Elektron Menyu" : `Stol #${selectedTable}`}
                        </p>

                        <div className="my-5 p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl shadow-inner">
                            <QRCodeSVG 
                                value={targetUrl} 
                                size={180}
                                level="H"
                                includeMargin={true}
                            />
                        </div>

                        {/* Social Links Preview */}
                        <div className="w-full pt-3 border-t border-slate-200 space-y-1 text-xs text-slate-600 font-medium">
                            {settings.phone && (
                                <div className="flex items-center justify-center gap-1.5 font-bold">
                                    <Phone className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>{settings.phone}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-center gap-4 text-[11px] font-semibold text-slate-500 pt-1">
                                {settings.instagram && (
                                    <span className="flex items-center gap-1 text-pink-600">
                                        <Instagram className="w-3.5 h-3.5" /> {settings.instagram}
                                    </span>
                                )}
                                {settings.telegram && (
                                    <span className="flex items-center gap-1 text-sky-600">
                                        <Send className="w-3.5 h-3.5" /> {settings.telegram}
                                    </span>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* PRINT BUTTON */}
                    <div className="mt-6 flex items-center gap-3 w-full max-w-sm">
                        <button
                            onClick={handlePrint}
                            className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Chop etish</span>
                        </button>
                    </div>
                </div>

            </div>

            {/* DESIGN & CONTACT EDIT MODAL */}
            {designModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5">
                        
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-600/20 border border-purple-500/30 rounded-xl flex items-center justify-center text-purple-400">
                                    <Palette className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Logo va Aloqa Sozlamalari</h2>
                                    <p className="text-xs text-slate-400">Kompyuterdan PNG rasm yuklash va kontaktlarni kiritish</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setDesignModalOpen(false)}
                                className="text-slate-500 hover:text-slate-300 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            
                            {/* PNG LOGO FILE UPLOAD */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                                    <ImageIcon className="w-4 h-4 text-purple-400" />
                                    <span>Muassasa Logotipi (PNG / JPG rasm):</span>
                                </label>
                                
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleLogoFileUpload}
                                    className="hidden"
                                />

                                <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
                                    {settings.logoUrl ? (
                                        <div className="relative group shrink-0">
                                            <img 
                                                src={settings.logoUrl} 
                                                alt="Logo preview" 
                                                className="w-16 h-16 object-contain rounded-xl bg-slate-900 border border-slate-700 p-1"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 bg-slate-900 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-slate-600 shrink-0">
                                            <ImageIcon className="w-7 h-7" />
                                        </div>
                                    )}

                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition"
                                            >
                                                <Upload className="w-3.5 h-3.5" />
                                                <span>{settings.logoUrl ? "Almashtirish" : "PNG rasm yuklash"}</span>
                                            </button>

                                            {settings.logoUrl && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveLogo}
                                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition"
                                                    title="Logotipni o'chirish"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-500">
                                            Format: PNG, JPG yoki WEBP (maksimum 3MB).
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Telefon raqam:</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="+998901234567"
                                    value={settings.phone}
                                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            {/* Instagram */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                                    <Instagram className="w-3.5 h-3.5 text-pink-400" />
                                    <span>Instagram (nik yoki link):</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="@eviko_restaurant yoki https://instagram.com/nik"
                                    value={settings.instagram}
                                    onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            {/* Telegram */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                                    <Send className="w-3.5 h-3.5 text-sky-400" />
                                    <span>Telegram (nik yoki link):</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="@eviko_bot yoki https://t.me/eviko"
                                    value={settings.telegram}
                                    onChange={(e) => setSettings({ ...settings, telegram: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>

                        </div>

                        {/* MODAL FOOTER */}
                        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setDesignModalOpen(false)}
                                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition"
                            >
                                Bekor qilish
                            </button>
                            <button
                                onClick={handleSaveSettings}
                                disabled={savingSettings}
                                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-purple-600/30"
                            >
                                {savingSettings ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                <span>Saqlash</span>
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

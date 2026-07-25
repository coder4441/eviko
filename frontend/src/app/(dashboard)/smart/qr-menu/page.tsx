"use client";

import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { QRCodeSVG } from "qrcode.react";
import {
    QrCode, Copy, Check, ExternalLink, Printer, LayoutGrid,
    Palette, Phone, Instagram, Send, Image as ImageIcon, Save, X, RefreshCw, Upload, Trash2
} from "lucide-react";

interface MenuSettings {
    logoUrl: string;
    phone: string;
    instagram: string;
    telegram: string;
    themeColor: string;
}

// Preset color palette
const PRESET_COLORS = [
    { label: "To'q sariq",  value: "#f97316" },
    { label: "Ko'k",        value: "#3b82f6" },
    { label: "Yashil",      value: "#22c55e" },
    { label: "Binafsha",    value: "#8b5cf6" },
    { label: "Qizil",       value: "#ef4444" },
    { label: "Moviy",       value: "#06b6d4" },
    { label: "Pushti",      value: "#ec4899" },
    { label: "Jigarrang",   value: "#92400e" },
    { label: "Tosh-kulrang",value: "#475569" },
    { label: "Qora",        value: "#1e293b" },
];

export default function AdminQRMenuPage() {
    const store = useStore();

    const [selectedTable, setSelectedTable] = useState<string>("all");
    const [copied, setCopied] = useState(false);
    const [baseUrl, setBaseUrl] = useState("");
    const [shopCode, setShopCode] = useState("...");
    const [shopName, setShopName] = useState("Restoran & Kafe");
    const [designModalOpen, setDesignModalOpen] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [settings, setSettings] = useState<MenuSettings>({
        logoUrl: "",
        phone: "",
        instagram: "",
        telegram: "",
        themeColor: "#f97316"
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (typeof window !== "undefined") setBaseUrl(window.location.origin);
        store.fetchSmartTables();
        fetch("/api/menu/settings")
            .then(r => r.json())
            .then(data => {
                if (data.tenant) {
                    setShopCode(data.tenant.shopCode || "EV-1234");
                    setShopName(data.tenant.shopName || "Restoran & Kafe");
                }
                if (data.settings) {
                    setSettings({
                        logoUrl:    data.settings.logoUrl    || "",
                        phone:      data.settings.phone      || "",
                        instagram:  data.settings.instagram  || "",
                        telegram:   data.settings.telegram   || "",
                        themeColor: data.settings.themeColor || "#f97316"
                    });
                }
            })
            .catch(() => {
                if (typeof window !== "undefined") {
                    const s = localStorage.getItem("smart-active-shop");
                    if (s) setShopCode(s);
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
    const handlePrint = () => window.print();

    const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) { alert("Rasm hajmi juda katta (max 3MB)!"); return; }
        const reader = new FileReader();
        reader.onload = ev => {
            const b64 = ev.target?.result as string;
            if (b64) setSettings(p => ({ ...p, logoUrl: b64 }));
        };
        reader.readAsDataURL(file);
    };
    const handleRemoveLogo = () => {
        setSettings(p => ({ ...p, logoUrl: "" }));
        if (fileInputRef.current) fileInputRef.current.value = "";
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
                alert("✅ Sozlamalar muvaffaqiyatli saqlandi!");
            } else {
                alert(data.error || "Saqlashda xatolik");
            }
        } catch {
            alert("Ulanishda xatolik");
        } finally {
            setSavingSettings(false);
        }
    };

    const tc = settings.themeColor;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-7">

            {/* ── PAGE HEADER ──────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-200">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                            <QrCode className="w-5 h-5" />
                        </div>
                        QR Kodli Menyu Generator
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Stollar uchun QR kodlarni yaratish, logo, rang va kontaktlarni sozlash.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setDesignModalOpen(true)}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition"
                    >
                        <Palette className="w-4 h-4" />
                        Logo, Rang & Kontakt
                    </button>
                    <button
                        onClick={handleCopy}
                        className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 flex items-center gap-2 shadow-sm transition"
                    >
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Nusxalandi!" : "Havolani nusxalash"}
                    </button>
                    <a
                        href={`/queue/${shopCode}`} target="_blank" rel="noreferrer"
                        className="px-4 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-semibold rounded-xl border border-green-200 flex items-center gap-2 shadow-sm transition"
                    >
                        TV Navbat Ekrani
                    </a>
                    <a
                        href={targetUrl} target="_blank" rel="noreferrer"
                        className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 flex items-center gap-2 shadow-sm transition"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Menyuni ko'rish
                    </a>
                </div>
            </div>

            {/* ── MAIN GRID ────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 items-start">

                {/* LEFT — SETTINGS */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-sm">
                    <h2 className="text-base font-bold text-gray-700 flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 text-indigo-500" />
                        QR Kod Parametrlari
                    </h2>

                    {/* Shop info */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Muassasa nomi:</span>
                            <span className="font-bold text-gray-800">{shopName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Muassasa kodi:</span>
                            <span className="font-mono font-bold text-indigo-600">{shopCode}</span>
                        </div>
                        {/* Theme color badge */}
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-gray-500">Menyu rangi:</span>
                            <span className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-lg border border-gray-200 shadow-sm" style={{ background: tc }} />
                                <span className="font-mono text-xs text-gray-600">{tc}</span>
                            </span>
                        </div>
                    </div>

                    {/* Table Select */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-600">Stolni tanlang:</label>
                        <select
                            value={selectedTable}
                            onChange={(e) => setSelectedTable(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        >
                            <option value="all">Umumiy QR Menyu (Stolsiz)</option>
                            {store.smartTables.map((t) => {
                                const n = t.name.replace(/^Stol\s*/i, "");
                                return <option key={t.id} value={n}>Stol #{n} ({t.zone || "Asosiy zal"})</option>;
                            })}
                        </select>
                        <p className="text-xs text-gray-400">
                            Har bir stol uchun alohida QR tayyorlasangiz, ofitsiantga stol raqami avtomatik yetib boradi.
                        </p>
                    </div>

                    {/* Edit quick link */}
                    <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
                        <div>
                            <p className="text-sm font-semibold text-indigo-700">PNG Logo, Rang & Aloqa</p>
                            <p className="text-xs text-indigo-400 mt-0.5">Logotip, rang, telefon, Instagram va Telegram</p>
                        </div>
                        <button
                            onClick={() => setDesignModalOpen(true)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"
                        >
                            Tahrirlash
                        </button>
                    </div>

                    {/* QR URL */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-500">QR Kod Havolasi:</label>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-mono text-indigo-600 truncate">
                            {targetUrl}
                        </div>
                    </div>
                </div>

                {/* RIGHT — QR PREVIEW */}
                <div className="flex flex-col items-center gap-5">
                    <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 w-full max-w-xs overflow-hidden hover:shadow-2xl transition-shadow">
                        {/* Header preview with theme color */}
                        <div className="px-6 pt-6 pb-8 flex flex-col items-center text-center text-white" style={{ background: tc }}>
                            {settings.logoUrl ? (
                                <img src={settings.logoUrl} alt="Logo" className="w-16 h-16 object-contain rounded-2xl bg-white p-1 shadow-md mb-3" />
                            ) : (
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center font-black text-2xl mb-3">
                                    {shopName.charAt(0)}
                                </div>
                            )}
                            <h3 className="text-lg font-black">{shopName}</h3>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mt-0.5">
                                {selectedTable === "all" ? "Elektron Menyu" : `Stol #${selectedTable}`}
                            </p>
                        </div>

                        {/* QR code */}
                        <div className="flex flex-col items-center px-6 py-5">
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl">
                                <QRCodeSVG value={targetUrl} size={160} level="H" includeMargin />
                            </div>

                            {/* Social preview */}
                            {(settings.phone || settings.instagram || settings.telegram) && (
                                <div className="w-full mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-xs">
                                    {settings.phone && (
                                        <div className="flex items-center justify-center gap-1.5 text-gray-600 font-semibold">
                                            <Phone className="w-3.5 h-3.5" style={{ color: tc }} />
                                            {settings.phone}
                                        </div>
                                    )}
                                    <div className="flex items-center justify-center gap-4">
                                        {settings.instagram && (
                                            <span className="flex items-center gap-1 text-pink-500 font-semibold">
                                                <Instagram className="w-3.5 h-3.5" /> {settings.instagram}
                                            </span>
                                        )}
                                        {settings.telegram && (
                                            <span className="flex items-center gap-1 text-sky-500 font-semibold">
                                                <Send className="w-3.5 h-3.5" /> {settings.telegram}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Print */}
                    <button
                        onClick={handlePrint}
                        className="w-full max-w-xs py-3 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition hover:opacity-90"
                        style={{ background: tc }}
                    >
                        <Printer className="w-4 h-4" />
                        Chop etish (Print)
                    </button>
                </div>
            </div>

            {/* ── DESIGN MODAL ─────────────────────────────────── */}
            {designModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                                    <Palette className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-800">Menyu Sozlamalari</h2>
                                    <p className="text-xs text-gray-400">Logo, rang va aloqa ma'lumotlari</p>
                                </div>
                            </div>
                            <button onClick={() => setDesignModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">

                            {/* ── COLOR PICKER ─────── */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    🎨 Menyu asosiy rangi
                                </label>
                                {/* Preset swatches */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {PRESET_COLORS.map(c => (
                                        <button
                                            key={c.value}
                                            title={c.label}
                                            onClick={() => setSettings(p => ({ ...p, themeColor: c.value }))}
                                            className="w-8 h-8 rounded-xl border-2 transition-transform hover:scale-110"
                                            style={{
                                                background: c.value,
                                                borderColor: settings.themeColor === c.value ? "#1e293b" : "transparent",
                                                boxShadow: settings.themeColor === c.value ? "0 0 0 2px white, 0 0 0 4px " + c.value : "none"
                                            }}
                                        />
                                    ))}
                                </div>
                                {/* Custom hex + native color input */}
                                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
                                    <input
                                        type="color"
                                        value={settings.themeColor}
                                        onChange={e => setSettings(p => ({ ...p, themeColor: e.target.value }))}
                                        className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                                        title="O'z rangingizni tanlang"
                                    />
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-gray-600">Maxsus rang (hex)</p>
                                        <input
                                            type="text"
                                            value={settings.themeColor}
                                            onChange={e => {
                                                const v = e.target.value;
                                                if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setSettings(p => ({ ...p, themeColor: v }));
                                            }}
                                            className="w-full bg-transparent text-sm font-mono text-gray-700 focus:outline-none"
                                            placeholder="#f97316"
                                        />
                                    </div>
                                    <div className="w-10 h-10 rounded-xl border border-gray-200 shadow-sm shrink-0" style={{ background: settings.themeColor }} />
                                </div>
                            </div>

                            <div className="border-t border-gray-100" />

                            {/* ── PNG LOGO UPLOAD ───── */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                    <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                                    Muassasa Logotipi (PNG / JPG)
                                </label>
                                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoFileUpload} className="hidden" />
                                <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-3.5">
                                    {settings.logoUrl ? (
                                        <img src={settings.logoUrl} alt="preview" className="w-16 h-16 object-contain rounded-xl border border-gray-200 bg-white p-1 shrink-0" />
                                    ) : (
                                        <div className="w-16 h-16 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 shrink-0">
                                            <ImageIcon className="w-7 h-7" />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
                                            >
                                                <Upload className="w-3.5 h-3.5" />
                                                {settings.logoUrl ? "Almashtirish" : "Rasm yuklash"}
                                            </button>
                                            {settings.logoUrl && (
                                                <button type="button" onClick={handleRemoveLogo}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-red-200 transition">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-gray-400">PNG, JPG yoki WEBP • Max 3MB</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100" />

                            {/* ── CONTACT FIELDS ────── */}
                            <div className="space-y-3">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">📞 Aloqa ma'lumotlari</label>

                                {/* Phone */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-emerald-500" /> Telefon raqam:
                                    </label>
                                    <input type="text" placeholder="+998901234567" value={settings.phone}
                                        onChange={e => setSettings({ ...settings, phone: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                                </div>

                                {/* Instagram */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                                        <Instagram className="w-3.5 h-3.5 text-pink-500" /> Instagram:
                                    </label>
                                    <input type="text" placeholder="@eviko_restaurant" value={settings.instagram}
                                        onChange={e => setSettings({ ...settings, instagram: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                                </div>

                                {/* Telegram */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                                        <Send className="w-3.5 h-3.5 text-sky-500" /> Telegram:
                                    </label>
                                    <input type="text" placeholder="@eviko_bot" value={settings.telegram}
                                        onChange={e => setSettings({ ...settings, telegram: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 pb-5 pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                            <button onClick={() => setDesignModalOpen(false)}
                                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition">
                                Bekor qilish
                            </button>
                            <button onClick={handleSaveSettings} disabled={savingSettings}
                                className="px-5 py-2.5 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm transition hover:opacity-90"
                                style={{ background: settings.themeColor }}>
                                {savingSettings ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Saqlash
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

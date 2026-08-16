"use client";

import { useSuperAdminStore } from "@/lib/superAdminStore";
import { useAgentStore } from "@/lib/agentStore";
import { Users, Building, Plus, ArrowRight, Wallet, User as UserIcon, Phone as PhoneIcon, MapPin, Key, X, ClipboardList, FileText } from "lucide-react";
import { PhoneInput } from "@/components/ui/PhoneInput";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AgentDashboard() {
    const { currentUser, isAuthenticated } = useSuperAdminStore();
    const { leads, tenants, fetchLeads, fetchTenants, isLoading } = useAgentStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    // New Tenant Modal States
    const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [formState, setFormState] = useState({
        shopName: "",
        ownerName: "",
        phone: "+998",
        address: "",
        adminPassword: "",
    });

    // New Lead Modal States
    const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
    const { addLead } = useAgentStore();
    const [leadFormLoading, setLeadFormLoading] = useState(false);
    const [leadFormError, setLeadFormError] = useState("");
    const [leadForm, setLeadForm] = useState({
        businessName: "", ownerName: "", phone: "+998", address: "", notes: ""
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!isAuthenticated || currentUser?.role !== "Agent") {
            router.push("/super-admin/staff-login");
        } else if (currentUser?.agentCode) {
            fetchLeads(currentUser.agentCode);
            fetchTenants(currentUser.agentCode);
        }
    }, [isAuthenticated, mounted, router, currentUser, fetchLeads, fetchTenants]);

    if (!mounted || !isAuthenticated || currentUser?.role !== "Agent") return null;

    // Stats calculations
    const totalLeads = leads.length;
    const activeTenants = tenants.length;
    const convertedThisMonth = leads.filter(l =>
        l.status === 'converted' &&
        new Date(l.updatedAt || l.createdAt).getMonth() === new Date().getMonth()
    ).length;

    const handleAddTenant = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError("");

        try {
            const body = {
                ...formState,
                adminUsername: formState.phone.replace(/[\s+()-]/g, ''),
                plan: "pro",
                settings: { subscriptionDays: 30, planPrice: 300000 },
                status: "active",
                agentCode: currentUser.agentCode
            };

            const res = await fetch("/api/super-admin/tenants", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Tashkilot yaratishda xatolik");

            setIsAddTenantOpen(false);
            setFormState({ shopName: "", ownerName: "", phone: "+998", address: "", adminPassword: "" });
            fetchTenants(currentUser.agentCode);
        } catch (err: any) {
            setFormError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleAddLead = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.agentCode) return;
        setLeadFormLoading(true);
        setLeadFormError("");
        try {
            await addLead({
                agentCode: currentUser.agentCode,
                businessName: leadForm.businessName,
                ownerName: leadForm.ownerName,
                phone: leadForm.phone,
                address: leadForm.address,
                status: "new",
                notes: leadForm.notes,
                nextContactDate: null
            });
            setIsAddLeadOpen(false);
            setLeadForm({ businessName: "", ownerName: "", phone: "+998", address: "", notes: "" });
            fetchLeads(currentUser.agentCode);
        } catch (err: any) {
            setLeadFormError(err.message || "Xatolik yuz berdi");
        } finally {
            setLeadFormLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">

            {/* ─── Header ─── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Xush kelibsiz, {currentUser.name}!</h1>
                    <p className="text-slate-400 mt-2">Bugun qanday yangi mijozlar bilan ishlaymiz?</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setIsAddLeadOpen(true)}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl flex items-center gap-2 border border-slate-700 transition-all active:scale-95">
                        <Plus size={20} className="text-sky-400" />
                        Zayavka qabul qilish
                    </button>
                    <button
                        onClick={() => setIsAddTenantOpen(true)}
                        className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-medium rounded-xl flex items-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 transition-all">
                        <Building size={20} />
                        Yangi tashkilot ochish
                    </button>
                </div>
            </div>

            {/* ─── Stats ─── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <Users size={20} className="text-purple-400" />
                        </div>
                        <h3 className="text-slate-400 font-medium">Umumiy mijozlarim</h3>
                    </div>
                    <p className="text-4xl font-black text-white mt-4">{isLoading ? "..." : totalLeads}</p>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
                            <Building size={20} className="text-sky-400" />
                        </div>
                        <h3 className="text-slate-400 font-medium">Ochilgan do'konlar</h3>
                    </div>
                    <p className="text-4xl font-black text-sky-400 mt-4">{isLoading ? "..." : activeTenants}</p>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <Wallet size={20} className="text-green-400" />
                        </div>
                        <h3 className="text-slate-400 font-medium">Joriy oydagi natija</h3>
                    </div>
                    <p className="text-4xl font-black text-green-400 mt-4">{isLoading ? "..." : convertedThisMonth}</p>
                    <p className="text-xs text-slate-500 mt-2">Mijozga aylanganlar soni</p>
                </div>
            </div>

            {/* ─── Quick Links ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Users size={20} className="text-sky-400" /> Potensial Mijozlar</h2>
                        <p className="text-slate-400 text-sm mb-6">Mijozlar bilan aloqalar tarixini va qiziqish holatini kuzatib boring.</p>
                    </div>
                    <Link href="/agent-portal/leads" className="flex items-center gap-2 text-sky-400 font-medium hover:text-sky-300 w-fit bg-sky-500/10 px-4 py-2 rounded-lg transition-colors">
                        Qiziqish bildirilgan zayavkalar <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Building size={20} className="text-indigo-400" /> Do'konlar Holati</h2>
                        <p className="text-slate-400 text-sm mb-6">O'zingiz ulagan barcha do'konlarning hisoboti.</p>
                    </div>
                    <Link href="/agent-portal/tenants" className="flex items-center gap-2 text-indigo-400 font-medium hover:text-indigo-300 w-fit bg-indigo-500/10 px-4 py-2 rounded-lg transition-colors">
                        Do'konlarni ko'rish <ArrowRight size={16} />
                    </Link>
                </div>
            </div>

            {/* ─── Recent Leads ─── */}
            {leads.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2"><ClipboardList size={20} className="text-sky-400" /> So'nggi Zayavkalar</h2>
                        <Link href="/agent-portal/leads" className="text-sm text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1">Barchasini ko'rish <ArrowRight size={14} /></Link>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-800/80 border-b border-slate-700/50">
                                        <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tashkilot/Mijoz</th>
                                        <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Telefon</th>
                                        <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Holat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leads.slice(0, 3).map((lead: any) => (
                                        <tr key={lead.id} className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-medium text-white">{lead.businessName}</div>
                                                <div className="text-xs text-slate-400">{lead.ownerName}</div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-300 font-mono">{lead.phone}</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                                                    lead.status === "new" ? "bg-blue-500/20 text-blue-400" :
                                                    lead.status === "contacted" ? "bg-yellow-500/20 text-yellow-500" :
                                                    lead.status === "interested" ? "bg-purple-500/20 text-purple-400" :
                                                    lead.status === "converted" ? "bg-green-500/20 text-green-400" :
                                                    "bg-red-500/20 text-red-500"
                                                }`}>{lead.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════
                YANGI TASHKILOT MODAL — Oq va ko'k professional dizayn
            ════════════════════════════════════════════════════════ */}
            {isAddTenantOpen && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)' }}
                    onClick={(e) => { if (e.target === e.currentTarget && !formLoading) setIsAddTenantOpen(false); }}
                >
                    <div
                        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col"
                        style={{ maxHeight: 'calc(100vh - 48px)' }}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/30">
                                    <Building size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Yangi Tashkilot Ochish</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Agent kodi: <span className="font-semibold text-blue-600">{currentUser.agentCode}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => !formLoading && setIsAddTenantOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body — scrollable */}
                        <div className="overflow-y-auto flex-1 px-6 py-5">
                            <form id="tenant-form" onSubmit={handleAddTenant} className="space-y-4">
                                {formError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm flex items-center gap-2">
                                        <span className="font-bold">!</span> {formError}
                                    </div>
                                )}

                                {/* Tashkilot nomi */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                        Tashkilot nomi <span className="text-blue-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <Building size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            required disabled={formLoading}
                                            placeholder="Misol: Milliy Taomlar"
                                            value={formState.shopName}
                                            onChange={(e) => setFormState({...formState, shopName: e.target.value})}
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                                    </div>
                                </div>

                                {/* Rahbar + Manzil */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                            Rahbar ismi <span className="text-blue-600">*</span>
                                        </label>
                                        <div className="relative">
                                            <UserIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                required disabled={formLoading}
                                                placeholder="Dilshod Karimov"
                                                value={formState.ownerName}
                                                onChange={(e) => setFormState({...formState, ownerName: e.target.value})}
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Manzil</label>
                                        <div className="relative">
                                            <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                disabled={formLoading}
                                                placeholder="Toshkent, Yunusobod"
                                                value={formState.address}
                                                onChange={(e) => setFormState({...formState, address: e.target.value})}
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                                        </div>
                                    </div>
                                </div>

                                {/* Telefon */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                        Telefon raqam (Login) <span className="text-blue-600">*</span>
                                    </label>
                                    <div className="relative z-50">
                                        <PhoneInput
                                            value={formState.phone}
                                            onChange={(val) => setFormState({...formState, phone: val})}
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-1 pl-1">Tizimga kirish uchun ushbu raqam login bo'ladi.</p>
                                </div>

                                {/* Parol */}
                                <div>
                                    <label className="block text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1.5">
                                        Admin Paroli <span className="text-blue-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <Key size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" />
                                        <input
                                            type="text" required disabled={formLoading}
                                            placeholder="Misol: password123"
                                            value={formState.adminPassword}
                                            onChange={(e) => setFormState({...formState, adminPassword: e.target.value})}
                                            className="w-full pl-10 pr-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                                    </div>
                                </div>

                                {/* To'lov */}
                                <div className="flex items-center gap-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white">
                                    <div className="w-11 h-11 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <Wallet size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold text-blue-100 uppercase tracking-widest">Majburiy To'lov (Oylik)</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black">300,000</span>
                                            <span className="text-sm font-semibold text-blue-200">UZS</span>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-gray-50/80 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={() => setIsAddTenantOpen(false)}
                                disabled={formLoading}
                                className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">
                                Bekor qilish
                            </button>
                            <button
                                type="submit" form="tenant-form"
                                disabled={formLoading}
                                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center gap-2">
                                {formLoading ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Yaratilmoqda...</>
                                ) : (
                                    <>Tashkilot Ochish <ArrowRight size={16} /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════
                ZAYAVKA MODAL — Oq va ko'k professional dizayn
            ════════════════════════════════════════════════════════ */}
            {isAddLeadOpen && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)' }}
                    onClick={(e) => { if (e.target === e.currentTarget && !leadFormLoading) setIsAddLeadOpen(false); }}
                >
                    <div
                        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col"
                        style={{ maxHeight: 'calc(100vh - 48px)' }}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
                                    <ClipboardList size={20} className="text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Zayavka Qabul Qilish</h3>
                            </div>
                            <button
                                onClick={() => !leadFormLoading && setIsAddLeadOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body — scrollable */}
                        <div className="overflow-y-auto flex-1 px-6 py-5">
                            <form id="lead-form" onSubmit={handleAddLead} className="space-y-4">
                                {leadFormError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm flex items-center gap-2">
                                        <span className="font-bold">!</span> {leadFormError}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                        Tashkilot/Do'kon nomi <span className="text-indigo-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <Building size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            required disabled={leadFormLoading}
                                            placeholder="Masalan: Milliy Taomlar"
                                            value={leadForm.businessName}
                                            onChange={(e) => setLeadForm({...leadForm, businessName: e.target.value})}
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                        Mijoz Ismi <span className="text-indigo-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <UserIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            required disabled={leadFormLoading}
                                            placeholder="Dilshod Karimov"
                                            value={leadForm.ownerName}
                                            onChange={(e) => setLeadForm({...leadForm, ownerName: e.target.value})}
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                        Telefon <span className="text-indigo-600">*</span>
                                    </label>
                                    <div className="relative z-50">
                                        <PhoneInput
                                            value={leadForm.phone}
                                            onChange={(val) => setLeadForm({...leadForm, phone: val})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Manzil</label>
                                    <div className="relative">
                                        <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            disabled={leadFormLoading}
                                            placeholder="Toshkent, Yunusobod"
                                            value={leadForm.address}
                                            onChange={(e) => setLeadForm({...leadForm, address: e.target.value})}
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Qo'shimcha izoh</label>
                                    <textarea
                                        disabled={leadFormLoading}
                                        rows={3}
                                        placeholder="Mijoz haqida qisqacha ma'lumot..."
                                        value={leadForm.notes}
                                        onChange={(e) => setLeadForm({...leadForm, notes: e.target.value})}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none" />
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-gray-50/80 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={() => setIsAddLeadOpen(false)}
                                disabled={leadFormLoading}
                                className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">
                                Bekor qilish
                            </button>
                            <button
                                type="submit" form="lead-form"
                                disabled={leadFormLoading}
                                className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/30 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center gap-2">
                                {leadFormLoading ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saqlanmoqda...</>
                                ) : "Saqlash"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

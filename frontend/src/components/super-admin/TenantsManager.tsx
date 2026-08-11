"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    Search, Edit2, Trash2, LogIn, Plus
} from "lucide-react";


const STATUS_COLORS: Record<string, string> = {
    active: "bg-green-500/10 text-green-400",
    trial: "bg-yellow-500/10 text-yellow-400",
    suspended: "bg-red-500/10 text-red-400",
    paid: "bg-green-500/10 text-green-400",
    overdue: "bg-red-500/10 text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
    active: "Faol", trial: "Sinov", suspended: "To'xtatilgan",
    paid: "To'langan", overdue: "Muddati o'tgan",
};

export function TenantsManager({ canCreateTenants, canEditTenants, canDeleteTenants, canImpersonateTenants, handleOpenAddModal, handleOpenEditModal }: any) {
    const queryClient = useQueryClient();
    
    // States
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);
    const [isBulkActionRunning, setIsBulkActionRunning] = useState(false);
    const [page, setPage] = useState(1);

    // Tariflarni yuklab olish
    const { data: tariffsData } = useQuery({
        queryKey: ["super-tariffs"],
        queryFn: async () => {
            const res = await fetch("/api/super-admin/tariffs");
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
    });
    const tariffMap = useMemo(() => {
        const map: Record<string, any> = {};
        (tariffsData?.tariffs || []).forEach((t: any) => { map[t.id] = t; });
        return map;
    }, [tariffsData]);

    const { data: tenantsData, isLoading: tenantsLoading } = useQuery({
        queryKey: ["tenants", page, searchTerm, filterStatus],
        queryFn: async () => {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                search: searchTerm,
                status: filterStatus !== "all" ? filterStatus : ""
            });
            const res = await fetch(`/api/super-admin/tenants?${queryParams}`);
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
    });

    const tenants = useMemo(() => (tenantsData?.tenants || []) as any[], [tenantsData?.tenants]);
    const pagination = tenantsData?.pagination;

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/super-admin/tenants/${id}`, { method: "DELETE" });
            if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Xatolik"); }
            return res.json();
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tenants"] }); setConfirmDeleteId(null); },
    });

    const handleImpersonate = (shopCode: string, phone: string) => {
        localStorage.setItem("smart-active-shop", shopCode);
        localStorage.setItem("smart-tenant-admin-user", phone);
        window.location.href = "/";
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedTenantIds(tenants.map(t => t.id));
        } else {
            setSelectedTenantIds([]);
        }
    };

    const handleSelectTenant = (id: string) => {
        setSelectedTenantIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkAction = async (action: 'activate' | 'suspend') => {
        if (selectedTenantIds.length === 0) return;
        const msg = action === 'activate' ? "Tanlangan do'konlarni faollashtirasizmi?" : "Tanlangan do'konlarni to'xtatasizmi?";
        if (!confirm(msg)) return;

        setIsBulkActionRunning(true);
        try {
            const res = await fetch("/api/super-admin/tenants/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, tenantIds: selectedTenantIds })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Xatolik");
            alert(data.message);
            setSelectedTenantIds([]);
            queryClient.invalidateQueries({ queryKey: ["tenants"] });
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsBulkActionRunning(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Tashkilotlar boshqaruvi</h2>
                    <p className="text-sm text-slate-500 mt-1">Platformadagi barcha do'konlar ro'yxati</p>
                </div>
                {canCreateTenants && (
                    <button onClick={handleOpenAddModal} className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white rounded-xl font-bold shadow-lg shadow-sky-500/30 transition-all flex items-center gap-2">
                        <Plus size={18} /> Yangi tashkilot
                    </button>
                )}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                <div className="flex-1 min-w-[240px] relative">
                    <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input type="text" placeholder="Qidiruv..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500/50 shadow-sm" />
                </div>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500/50 shadow-sm">
                    <option value="all">Barcha holatlar</option>
                    <option value="active">Faol</option>
                    <option value="trial">Sinov</option>
                    <option value="suspended">To'xtatilgan</option>
                </select>

                {canEditTenants && selectedTenantIds.length > 0 && (
                    <div className="flex gap-2 items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <span className="text-xs font-semibold px-2 text-slate-600">{selectedTenantIds.length} tanlandi</span>
                        <button disabled={isBulkActionRunning} onClick={() => handleBulkAction('activate')} className="px-3 py-1.5 text-xs font-bold bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50">Faollashtirish</button>
                        <button disabled={isBulkActionRunning} onClick={() => handleBulkAction('suspend')} className="px-3 py-1.5 text-xs font-bold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50">To'xtatish</button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {tenantsLoading ? (
                    <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                         <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
                         Yuklanmoqda...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-400 uppercase">
                                    <th className="px-5 py-3 w-10">
                                        <input type="checkbox" onChange={handleSelectAll} checked={tenants.length > 0 && selectedTenantIds.length === tenants.length} className="rounded text-sky-500 focus:ring-sky-500" />
                                    </th>
                                    <th className="px-5 py-3">Kod / Nomi</th>
                                    <th className="px-5 py-3">Billing ID</th>
                                    <th className="px-5 py-3">Aloqa</th>
                                    <th className="px-5 py-3">Tarif</th>
                                    <th className="px-5 py-3">Holat</th>
                                    <th className="px-5 py-3">Amallar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tenants.length === 0 ? (
                                    <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">Tashkilotlar topilmadi</td></tr>
                                ) : tenants.map((t: any) => (
                                    <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-4">
                                            <input type="checkbox" checked={selectedTenantIds.includes(t.id)} onChange={() => handleSelectTenant(t.id)} className="rounded text-sky-500 focus:ring-sky-500" />
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="text-sm font-bold text-sky-600">{t.shopCode}</div>
                                            <div className="text-sm text-slate-800 font-medium">{t.shopName}</div>
                                        </td>
                                        <td className="px-5 py-4 text-base font-black text-indigo-600 tracking-wider">{t.billingId || "N/A"}</td>
                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            <div>{t.ownerName}</div>
                                            <div className="text-slate-400 text-xs">{t.phone}</div>
                                        </td>
                                        <td className="px-5 py-4 text-sm">
                                            {(() => {
                                                const tariff = tariffMap[t.plan];
                                                if (tariff) {
                                                    return (
                                                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-600">
                                                            {tariff.name}
                                                        </span>
                                                    );
                                                }
                                                return (
                                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-400">
                                                        {t.plan || "—"}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-5 py-4 text-sm">
                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_COLORS[t.status]||""}`}>{STATUS_LABELS[t.status]||t.status}</span>
                                        </td>
                                        <td className="px-5 py-4 text-sm">
                                            {confirmDeleteId === t.id ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-red-500 font-bold">O'chirilsinmi?</span>
                                                    <button onClick={() => deleteMutation.mutate(t.id)} className="px-2 py-1 bg-red-500 text-white text-xs rounded font-bold hover:bg-red-600">Ha</button>
                                                    <button onClick={() => setConfirmDeleteId(null)} className="px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded font-bold hover:bg-slate-300">Yo'q</button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    {canImpersonateTenants && <button onClick={()=>handleImpersonate(t.shopCode,t.phone)} className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors" title="Kirish"><LogIn size={16}/></button>}
                                                    {canEditTenants && <button onClick={()=>handleOpenEditModal(t)} className="p-2 rounded-lg bg-slate-50 hover:bg-slate-200 text-slate-600 transition-colors" title="Tahrirlash"><Edit2 size={16}/></button>}
                                                    {canDeleteTenants && <button onClick={()=>setConfirmDeleteId(t.id)} className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors" title="O'chirish"><Trash2 size={16}/></button>}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            {/* Pagination footer */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm mt-4">
                    <div className="text-sm text-slate-500">
                        Jami <span className="font-bold text-slate-700">{pagination.total}</span> ta natija
                    </div>
                    <div className="flex gap-2">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-slate-200 rounded text-sm disabled:opacity-50 bg-slate-50 hover:bg-slate-100">Oldingi</button>
                        <span className="px-3 py-1.5 text-sm font-bold text-sky-600">{page} / {pagination.totalPages}</span>
                        <button disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-slate-200 rounded text-sm disabled:opacity-50 bg-slate-50 hover:bg-slate-100">Keyingi</button>
                    </div>
                </div>
            )}
        </div>
    );
}

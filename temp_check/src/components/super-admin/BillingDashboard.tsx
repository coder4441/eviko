"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, DollarSign } from "lucide-react";

export function BillingDashboard({ canViewBilling, totalRevenue, onAction }: any) {
    const queryClient = useQueryClient();
    
    const [billingSearch, setBillingSearch] = useState("");
    const [billingStatusFilter, setBillingStatusFilter] = useState("all");
    const [page, setPage] = useState(1);

    const { data: billingData, isLoading: billingLoading } = useQuery({
        queryKey: ["super-billing", page, billingSearch, billingStatusFilter],
        queryFn: async () => {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                search: billingSearch,
                status: billingStatusFilter !== "all" ? billingStatusFilter : ""
            });
            const res = await fetch(`/api/super-admin/billing?${queryParams}`);
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
    });

    const billingRows = useMemo(() => (billingData?.billing || []) as any[], [billingData?.billing]);
    const pagination = billingData?.pagination;
    const rev = billingData?.totalRevenue || totalRevenue || 0;

    const fmtM = (v: number) => new Intl.NumberFormat("uz-UZ").format(v || 0);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Billing va To'lovlar</h2>
                    <p className="text-sm text-slate-500 mt-1">Platforma tushumlari va moliyaviy hisobotlar</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 px-5 py-3 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Umumiy MRR</div>
                        <div className="text-2xl font-black text-emerald-700">{fmtM(rev)} <span className="text-sm">UZS/oy</span></div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                <div className="flex-1 min-w-[240px] relative">
                    <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input type="text" placeholder="Do'kon nomi yoki kodini qidiring..." value={billingSearch} onChange={(e) => setBillingSearch(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-emerald-500/50 shadow-sm" />
                </div>
                <select value={billingStatusFilter} onChange={(e) => setBillingStatusFilter(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-emerald-500/50 shadow-sm">
                    <option value="all">Barcha to'lov holatlari</option>
                    <option value="paid">To'langan</option>
                    <option value="overdue">Muddati o'tgan / To'lanmagan</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {billingLoading ? (
                    <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                         <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                         Yuklanmoqda...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-400 uppercase">
                                    <th className="px-5 py-3">Tashkilot</th>
                                    <th className="px-5 py-3">Tarif</th>
                                    <th className="px-5 py-3">To'lov holati</th>
                                    <th className="px-5 py-3">Oylik to'lov</th>
                                    <th className="px-5 py-3">Muddat tugaydi</th>
                                    <th className="px-5 py-3">Amallar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {billingRows.length === 0 ? (
                                    <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">Ma'lumot topilmadi</td></tr>
                                ) : billingRows.map((b: any) => (
                                    <tr key={b.tenantId} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="text-sm font-bold text-slate-800">{b.shopName}</div>
                                            <div className="text-xs text-sky-500 font-semibold">{b.shopCode}</div>
                                        </td>
                                        <td className="px-5 py-4 text-sm font-semibold text-slate-600 capitalize">{b.plan}</td>
                                        <td className="px-5 py-4 text-sm">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${b.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {b.paymentStatus === 'paid' ? 'Tö' + 'langan' : "Muddati o'tgan"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm font-black text-emerald-600">{fmtM(b.pricePerMonth)} UZS</td>
                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {b.expiresAt ? new Date(b.expiresAt).toLocaleDateString() : 'Noma\'lum'}
                                        </td>
                                        <td className="px-5 py-4 text-sm">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <button
                                                    onClick={() => onAction?.(b, "trial")}
                                                    className="text-xs px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg font-semibold border border-amber-100 transition-all"
                                                >
                                                    7kun sinov
                                                </button>
                                                <button
                                                    onClick={() => onAction?.(b, "subscribe")}
                                                    className="text-xs px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold border border-blue-100 transition-all"
                                                >
                                                    Obuna
                                                </button>
                                                <button
                                                    onClick={() => onAction?.(b, "topup")}
                                                    className="text-xs px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-semibold border border-emerald-100 transition-all"
                                                >
                                                    + Pul
                                                </button>
                                            </div>
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
                        <span className="px-3 py-1.5 text-sm font-bold text-emerald-600">{page} / {pagination.totalPages}</span>
                        <button disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-slate-200 rounded text-sm disabled:opacity-50 bg-slate-50 hover:bg-slate-100">Keyingi</button>
                    </div>
                </div>
            )}
        </div>
    );
}

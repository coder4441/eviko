"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Check, X, Clock, Edit2, Plus, PhoneCall, Filter, CalendarDays, MoreVertical } from "lucide-react";

const statusColors: any = {
    new: "bg-blue-500/10 text-blue-500 border-blue-200",
    contacted: "bg-amber-500/10 text-amber-500 border-amber-200",
    interested: "bg-indigo-500/10 text-indigo-500 border-indigo-200",
    converted: "bg-emerald-500/10 text-emerald-500 border-emerald-200",
    rejected: "bg-red-500/10 text-red-500 border-red-200"
};

const statusLabels: any = {
    new: "Yangi",
    contacted: "Aloqaga chiqildi",
    interested: "Qiziqish bildirgan",
    converted: "Mijozga aylandi",
    rejected: "Rad etildi"
};

export function LeadsTab({ onConvertToTenant }: { onConvertToTenant: (lead: any) => void }) {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [editLead, setEditLead] = useState<any>(null);
    const [editForm, setEditForm] = useState({ status: "", notes: "" });

    const { data: leads = [], isLoading } = useQuery({
        queryKey: ["super-leads"],
        queryFn: async () => {
            const res = await fetch("/api/super-admin/leads");
            if (!res.ok) throw new Error("Failed to fetch leads");
            return res.json();
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            const res = await fetch(`/api/super-admin/leads/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to update");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["super-leads"] });
            setEditLead(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/super-admin/leads/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["super-leads"] })
    });

    const filteredLeads = leads.filter((l: any) => {
        const matchesSearch = 
            l.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            l.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.phone?.includes(searchTerm);
        const matchesStatus = statusFilter === "all" || l.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editLead) {
            updateMutation.mutate({ id: editLead.id, data: editForm });
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Yuklanmoqda...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <input 
                        type="text"
                        placeholder="Qidiruv (nomi, telefon)..."
                        className="px-4 py-2 border border-slate-200 rounded-xl text-sm w-full sm:w-64 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Barcha statuslar</option>
                        {Object.entries(statusLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label as string}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Biznes</th>
                                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aloqa</th>
                                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Agent</th>
                                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sana</th>
                                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">Zayavkalar topilmadi</td>
                                </tr>
                            ) : filteredLeads.map((lead: any) => (
                                <tr key={lead.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-5 py-4">
                                        <p className="font-semibold text-slate-800">{lead.businessName}</p>
                                        <p className="text-xs text-slate-400 mt-1">{lead.address || 'Manzil yo\'q'}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="text-sm text-slate-700">{lead.ownerName}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{lead.phone}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                            {lead.agentCode}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[lead.status] || statusColors.new}`}>
                                            {statusLabels[lead.status] || lead.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="text-sm text-slate-600">{format(new Date(lead.createdAt), 'dd.MM.yyyy')}</p>
                                        {lead.nextContactDate && (
                                            <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                                                <CalendarDays size={12} />
                                                {format(new Date(lead.nextContactDate), 'dd.MM.yyyy')}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {lead.status !== 'converted' && (
                                                <button 
                                                    onClick={() => onConvertToTenant(lead)}
                                                    className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Tashkilot ochish"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => {
                                                    setEditLead(lead);
                                                    setEditForm({ status: lead.status, notes: lead.notes || "" });
                                                }}
                                                className="p-1.5 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                                                title="Tahrirlash"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    if(confirm('Rostdan ham o\'chirmoqchimisiz?')) deleteMutation.mutate(lead.id);
                                                }}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="O'chirish"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {editLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-800">Zayavkani tahrirlash</h3>
                            <button onClick={() => setEditLead(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                                <select 
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                                    value={editForm.status}
                                    onChange={e => setEditForm({...editForm, status: e.target.value})}
                                >
                                    {Object.entries(statusLabels).map(([key, label]) => (
                                        <option key={key} value={key}>{label as string}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Izoh</label>
                                <textarea 
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                                    rows={3}
                                    value={editForm.notes}
                                    onChange={e => setEditForm({...editForm, notes: e.target.value})}
                                    placeholder="Zayavka haqida qo'shimcha ma'lumotlar..."
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setEditLead(null)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                                >
                                    Bekor qilish
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={updateMutation.isPending}
                                    className="px-4 py-2 bg-sky-500 text-white hover:bg-sky-600 rounded-xl font-medium shadow-lg shadow-sky-500/20 disabled:opacity-50 transition-colors"
                                >
                                    {updateMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

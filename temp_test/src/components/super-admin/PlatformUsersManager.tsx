"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    Search, Edit2, Trash2, Plus, X
} from "lucide-react";
import { PhoneInput } from "@/components/ui/PhoneInput";

const PERMISSIONS_LIST = [
    {
        category: "Tashkilotlar boshqaruvi",
        permissions: [
            { id: "tenants:view", label: "Ko'rish (Faqat o'qish)" },
            { id: "tenants:create", label: "Yangi tashkilot qo'shish" },
            { id: "tenants:edit", label: "Tahrirlash va sozlamalar" },
            { id: "tenants:impersonate", label: "Tashkilot profiliga kirish" },
            { id: "tenants:delete", label: "O'chirish" }
        ]
    },
    {
        category: "Foydalanuvchilar (Xodimlar)",
        permissions: [
            { id: "users:view", label: "Xodimlarni ko'rish" },
            { id: "users:create", label: "Qo'shish va Tahrirlash" },
            { id: "users:delete", label: "O'chirish" }
        ]
    },
    {
        category: "Moliya (Billing)",
        permissions: [
            { id: "billing:view", label: "Moliyaviy faoliyatni ko'rish" },
            { id: "billing:manage", label: "To'lovlarni boshqarish" }
        ]
    }
];

export function PlatformUsersManager({ canCreateUsers, canDeleteUsers }: any) {
    const queryClient = useQueryClient();
    
    // States
    const [userSearch, setUserSearch] = useState("");
    const [userRoleFilter, setUserRoleFilter] = useState("all");
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    // Form/Modal states
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [userFormData, setUserFormData] = useState({ id: "", name: "", phone: "", password: "", role: "Menejer", agentCode: "", permissions: [] as string[] });
    const [isEditing, setIsEditing] = useState(false);

    // Bulk selection state
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [isBulkActionRunning, setIsBulkActionRunning] = useState(false);
    
    // Pagination state
    const [page, setPage] = useState(1);

    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ["super-users", page, userSearch, userRoleFilter],
        queryFn: async () => {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                search: userSearch,
                role: userRoleFilter !== "all" ? userRoleFilter : ""
            });
            const res = await fetch(`/api/super-admin/users?${queryParams}`);
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
    });

    const allUsers = useMemo(() => (usersData?.users || []) as any[], [usersData?.users]);
    const pagination = usersData?.pagination;

    const deleteUserMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch("/api/super-admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
            if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Xatolik"); }
            return res.json();
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["super-users"] }); setConfirmDeleteId(null); },
    });

    const createUserMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await fetch("/api/super-admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Xatolik"); }
            return res.json();
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["super-users"] }); setShowAddUserModal(false); },
    });

    const updateUserMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await fetch("/api/super-admin/users", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Xatolik"); }
            return res.json();
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["super-users"] }); setShowAddUserModal(false); },
    });

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedUserIds(allUsers.map(u => u.id));
        } else {
            setSelectedUserIds([]);
        }
    };

    const handleSelectUser = (id: string) => {
        setSelectedUserIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkAction = async (action: 'activate' | 'suspend') => {
        if (selectedUserIds.length === 0) return;
        const msg = action === 'activate' ? "Tanlangan foydalanuvchilarni faollashtirasizmi?" : "Tanlangan foydalanuvchilarni to'xtatasizmi?";
        if (!confirm(msg)) return;

        setIsBulkActionRunning(true);
        try {
            const res = await fetch("/api/super-admin/users/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, userIds: selectedUserIds })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Xatolik");
            alert(data.message);
            setSelectedUserIds([]);
            queryClient.invalidateQueries({ queryKey: ["super-users"] });
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsBulkActionRunning(false);
        }
    };

    const openNewUserModal = () => {
        setIsEditing(false);
        setUserFormData({ id: "", name: "", phone: "", password: "", role: "Menejer", agentCode: "", permissions: [] });
        setShowAddUserModal(true);
    };

    const openEditUserModal = (user: any) => {
        setIsEditing(true);
        setUserFormData({ id: user.id, name: user.name, phone: user.phone, password: "", role: user.role, agentCode: user.agentCode || "", permissions: user.permissions || [] });
        setShowAddUserModal(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Foydalanuvchilar boshqaruvi</h2>
                    <p className="text-sm text-slate-500 mt-1">Tizim administratorlari va xodimlar</p>
                </div>
                {canCreateUsers && (
                    <button onClick={openNewUserModal} className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-sky-500/30 transition-all flex items-center gap-2">
                        <Plus size={18} /> Yangi foydalanuvchi
                    </button>
                )}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                <div className="flex-1 min-w-[240px] relative">
                    <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input type="text" placeholder="Ism yoki telefon..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500/50 shadow-sm" />
                </div>
                <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500/50 shadow-sm">
                    <option value="all">Barcha rollar</option>
                    <option value="Agent">Agent</option>
                    <option value="Menejer">Menejer</option>
                </select>

                {canCreateUsers && selectedUserIds.length > 0 && (
                    <div className="flex gap-2 items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <span className="text-xs font-semibold px-2 text-slate-600">{selectedUserIds.length} tanlandi</span>
                        <button disabled={isBulkActionRunning} onClick={() => handleBulkAction('activate')} className="px-3 py-1.5 text-xs font-bold bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50">Faollashtirish</button>
                        <button disabled={isBulkActionRunning} onClick={() => handleBulkAction('suspend')} className="px-3 py-1.5 text-xs font-bold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50">To'xtatish</button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {usersLoading ? (
                    <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                         <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                         Yuklanmoqda...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-400 uppercase">
                                    <th className="px-5 py-3 w-10">
                                        <input type="checkbox" onChange={handleSelectAll} checked={allUsers.length > 0 && selectedUserIds.length === allUsers.length} className="rounded text-indigo-500 focus:ring-indigo-500" />
                                    </th>
                                    <th className="px-5 py-3">F.I.O</th>
                                    <th className="px-5 py-3">Telefon</th>
                                    <th className="px-5 py-3">Rol / Agent Kod</th>
                                    <th className="px-5 py-3">Holat</th>
                                    <th className="px-5 py-3">Ruxsatlar</th>
                                    <th className="px-5 py-3">Sana</th>
                                    <th className="px-5 py-3">Amallar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allUsers.length === 0 ? (
                                    <tr><td colSpan={8} className="px-5 py-8 text-center text-slate-400">Foydalanuvchilar topilmadi</td></tr>
                                ) : allUsers.map((u: any) => (
                                    <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-4">
                                            <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => handleSelectUser(u.id)} className="rounded text-indigo-500 focus:ring-indigo-500" />
                                        </td>
                                        <td className="px-5 py-4 font-bold text-slate-800">{u.name}</td>
                                        <td className="px-5 py-4 text-sm text-slate-600">{u.phone}</td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${u.role === "Agent" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                                                {u.role}
                                            </span>
                                            {u.agentCode && <div className="text-xs text-slate-500 mt-1 font-mono">{u.agentCode}</div>}
                                        </td>
                                        <td className="px-5 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {u.status === 'active' ? 'Faol' : 'Nofaol'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-500">
                                            {(u.permissions && u.permissions.includes("all")) ? (
                                                <span className="font-bold text-purple-500">Barchasi</span>
                                            ) : (
                                                <span>{(u.permissions || []).length} ta ruxsat</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-500">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-5 py-4 text-sm">
                                            {confirmDeleteId === u.id ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-red-500 font-bold">O'chirasizmi?</span>
                                                    <button onClick={() => deleteUserMutation.mutate(u.id)} className="px-2 py-1 bg-red-500 text-white text-xs rounded font-bold">Ha</button>
                                                    <button onClick={() => setConfirmDeleteId(null)} className="px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded font-bold">Yo'q</button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    {canCreateUsers && <button onClick={() => openEditUserModal(u)} className="p-2 rounded-lg bg-slate-50 hover:bg-slate-200 text-slate-600 transition-colors" title="Tahrirlash"><Edit2 size={16}/></button>}
                                                    {canDeleteUsers && <button onClick={() => setConfirmDeleteId(u.id)} className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors" title="O'chirish"><Trash2 size={16}/></button>}
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
                        <span className="px-3 py-1.5 text-sm font-bold text-indigo-600">{page} / {pagination.totalPages}</span>
                        <button disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-slate-200 rounded text-sm disabled:opacity-50 bg-slate-50 hover:bg-slate-100">Keyingi</button>
                    </div>
                </div>
            )}

            {/* ── ADD/EDIT USER MODAL ─────────────────────────────────── */}
            {showAddUserModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800">{isEditing ? "Foydalanuvchini tahrirlash" : "Yangi foydalanuvchi qo'shish"}</h3>
                            <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors"><X size={18}/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Ism F.I.Sh</label>
                                <input type="text" value={userFormData.name} onChange={(e) => setUserFormData({...userFormData, name: e.target.value})} className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500/50" placeholder="Eldorbek" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Telefon</label>
                                <PhoneInput value={userFormData.phone} onChange={(val) => setUserFormData({...userFormData, phone: val})} className="w-full bg-slate-100 border border-slate-200 rounded-xl focus-within:border-sky-500/50 text-slate-800" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Parol {isEditing && <span className="text-slate-400 font-normal">(bo'sh qolsa o'zgarmaydi)</span>}</label>
                                <input type="password" value={userFormData.password} onChange={(e) => setUserFormData({...userFormData, password: e.target.value})} className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500/50" placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Rol</label>
                                <select value={userFormData.role} onChange={(e) => setUserFormData({...userFormData, role: e.target.value})} className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500/50">
                                    <option value="Menejer">Menejer</option>
                                    <option value="Agent">Agent</option>
                                    <option value="Support">Texnik Yordam</option>
                                    <option value="Moliyachi">Moliyachi</option>
                                </select>
                            </div>
                            {userFormData.role === "Agent" && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Agent Kodi <span className="text-amber-500">(majburiy)</span></label>
                                    <input type="text" value={userFormData.agentCode} onChange={(e) => setUserFormData({...userFormData, agentCode: e.target.value.toUpperCase().trim()})} className="w-full bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-sm font-mono uppercase text-amber-700 focus:outline-none focus:border-amber-400" placeholder="AGT-001" />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-2">Maxsus huquqlar</label>
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                    {PERMISSIONS_LIST.map((group, gIdx) => (
                                        <div key={gIdx} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                                            <div className="bg-slate-100 px-3 py-2 border-b border-slate-200">
                                                <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">{group.category}</span>
                                            </div>
                                            <div className="p-2 space-y-1">
                                                {group.permissions.map(perm => {
                                                    const isChecked = userFormData.permissions.includes(perm.id);
                                                    return (
                                                        <label key={perm.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
                                                            <input type="checkbox" checked={isChecked} onChange={() => {
                                                                const p = userFormData.permissions;
                                                                setUserFormData({...userFormData, permissions: p.includes(perm.id) ? p.filter(x => x !== perm.id) : [...p, perm.id]});
                                                            }} className="accent-sky-500 w-4 h-4"/>
                                                            <span className="text-sm text-slate-700">{perm.label}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {(createUserMutation.isError || updateUserMutation.isError) && (
                                <div className="text-red-500 text-xs bg-red-50 p-2 rounded-lg border border-red-100">
                                    {(createUserMutation.error as any)?.message || (updateUserMutation.error as any)?.message}
                                </div>
                            )}
                            <button onClick={() => {
                                if (isEditing) {
                                    updateUserMutation.mutate(userFormData);
                                } else {
                                    createUserMutation.mutate(userFormData);
                                }
                            }} disabled={createUserMutation.isPending || updateUserMutation.isPending} className="w-full mt-2 bg-gradient-to-r from-sky-500 to-indigo-500 text-white py-2.5 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50">
                                {createUserMutation.isPending || updateUserMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

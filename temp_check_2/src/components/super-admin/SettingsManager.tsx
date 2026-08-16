"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, AlertCircle, CreditCard, Settings as SettingsIcon } from "lucide-react";

export function SettingsManager({ canManageSettings }: any) {
    const queryClient = useQueryClient();
    
    // Config states
    const [auditRetentionDays, setAuditRetentionDays] = useState(30);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [settingsFormData, setSettingsFormData] = useState({
        card_number: "",
        card_owner: "",
        tg_username: "",
        phone: "",
        phone_raw: "",
        supportBotToken: "",
        supportChatId: ""
    });
    const [isSaving, setIsSaving] = useState(false);

    // Fetch existing settings
    const { isLoading } = useQuery({
        queryKey: ["super-settings"],
        queryFn: async () => {
            const res = await fetch("/api/super-admin/settings");
            if (!res.ok) throw new Error("Failed to load settings");
            const data = await res.json();
            
            // Populate state
            if (data.auditRetentionDays) setAuditRetentionDays(data.auditRetentionDays);
            if (data.maintenanceMode !== undefined) setMaintenanceMode(data.maintenanceMode);
            if (data.settings) {
                setSettingsFormData({
                    card_number: data.settings.card_number || "",
                    card_owner: data.settings.card_owner || "",
                    tg_username: data.settings.tg_username || "",
                    phone: data.settings.phone || "",
                    phone_raw: data.settings.phone_raw || "",
                    supportBotToken: data.settings.supportBotToken || "",
                    supportChatId: data.settings.supportChatId || ""
                });
            }
            
            return data;
        },
    });

    const updateSettingsMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await fetch("/api/super-admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const e = await res.json();
                throw new Error(e.error || "Failed to update");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["super-settings"] });
            alert("Sozlamalar saqlandi!");
        },
        onError: (e: any) => alert(e.message)
    });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSettingsMutation.mutateAsync({
                auditRetentionDays,
                maintenanceMode,
                settings: settingsFormData
            });
        } finally {
            setIsSaving(false);
        }
    };

    const labelClass = "block text-xs font-semibold text-slate-400 mb-1";
    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500/50";

    if (isLoading) return <div className="p-8 text-center text-slate-500">Sozlamalar yuklanmoqda...</div>;

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">Tizim sozlamalari</h2>
                <p className="text-sm text-slate-500 mt-1">Platformaning global parametrlari</p>
            </div>

            {/* Platform sozlamalari (karta, telegram, telefon) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                        <CreditCard size={20} className="text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Platform sozlamalari</h3>
                        <p className="text-sm text-slate-400">Karta, Telegram va telefon — mijozlar billing sahifasida ko'radi</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {/* Karta preview */}
                    <div className="bg-slate-900 rounded-2xl p-5 w-full sm:w-2/3 md:w-1/2">
                        <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mb-3">To'lov kartasi</div>
                        <div className="text-white font-mono text-xl font-bold tracking-[0.2em] mb-1">
                            {settingsFormData.card_number || "— — — —"}
                        </div>
                        <div className="text-slate-400 text-sm">{settingsFormData.card_owner || "—"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Karta raqami</label>
                            <input type="text" value={settingsFormData.card_number}
                                onChange={e => {
                                    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                                    const formatted = raw.replace(/(.{4})/g, "$1 ").trim();
                                    setSettingsFormData(p => ({ ...p, card_number: formatted }));
                                }}
                                placeholder="8600 0000 0000 0000" maxLength={19}
                                className={inputClass} disabled={!canManageSettings} />
                        </div>
                        <div>
                            <label className={labelClass}>Karta egasi</label>
                            <input type="text" value={settingsFormData.card_owner}
                                onChange={e => setSettingsFormData(p => ({ ...p, card_owner: e.target.value }))}
                                placeholder="Abdualimov Eldorbek" className={inputClass} disabled={!canManageSettings} />
                        </div>
                        <div>
                            <label className={labelClass}>Telegram username (@ siz)</label>
                            <input type="text" value={settingsFormData.tg_username}
                                onChange={e => setSettingsFormData(p => ({ ...p, tg_username: e.target.value.trim() }))}
                                placeholder="smart_support" className={inputClass} disabled={!canManageSettings} />
                        </div>
                        <div>
                            <label className={labelClass}>Telefon (ko'rsatish uchun)</label>
                            <input type="text" value={settingsFormData.phone}
                                onChange={e => setSettingsFormData(p => ({ ...p, phone: e.target.value }))}
                                placeholder="+998 99 000 00 00" className={inputClass} disabled={!canManageSettings} />
                        </div>
                        <div>
                            <label className={labelClass}>Telefon (tel: link uchun)</label>
                            <input type="text" value={settingsFormData.phone_raw}
                                onChange={e => setSettingsFormData(p => ({ ...p, phone_raw: e.target.value.trim() }))}
                                placeholder="+998990000000" className={inputClass} disabled={!canManageSettings} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Texnik yordam bot */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                        <SettingsIcon size={20} className="text-sky-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Texnik yordam bot</h3>
                        <p className="text-sm text-slate-400">Telegram bot orqali bildirishnomalar</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Bot Token</label>
                        <input type="text" value={settingsFormData.supportBotToken}
                            onChange={(e) => setSettingsFormData(p => ({ ...p, supportBotToken: e.target.value.trim() }))}
                            className={inputClass} placeholder="123456:ABC-DEF1234ghIkl..." disabled={!canManageSettings} />
                    </div>
                    <div>
                        <label className={labelClass}>Chat ID (Lichka yoki Guruh raqami)</label>
                        <input type="text" value={settingsFormData.supportChatId}
                            onChange={(e) => setSettingsFormData(p => ({ ...p, supportChatId: e.target.value.trim() }))}
                            className={inputClass} placeholder="-1001234567" disabled={!canManageSettings} />
                    </div>
                </div>
            </div>

            {/* Xavfsizlik va Texnik holat */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2 mb-4">Xavfsizlik va Audit</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-semibold text-slate-800">Audit jurnali saqlanish muddati</div>
                            <div className="text-xs text-slate-500 mt-1">Loglar bazada necha kun saqlanadi (xotira tejamkorligi uchun)</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                min={1} max={365} 
                                value={auditRetentionDays} 
                                onChange={(e) => setAuditRetentionDays(parseInt(e.target.value) || 30)}
                                className="w-24 text-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-sky-500"
                                disabled={!canManageSettings}
                            />
                            <span className="text-sm text-slate-600">kun</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2 mb-4">Texnik Holat</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-semibold text-slate-800">Profilaktika rejimi (Maintenance mode)</div>
                            <div className="text-xs text-slate-500 mt-1">Tizimga faqat Super Adminlar kira oladi. Boshqalar uchun yopiq.</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={maintenanceMode} 
                                onChange={(e) => setMaintenanceMode(e.target.checked)} 
                                disabled={!canManageSettings}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                        </label>
                    </div>
                    {maintenanceMode && (
                        <div className="mt-3 bg-red-50 text-red-600 text-xs p-3 rounded-lg flex items-start gap-2 border border-red-100">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            DIQQAT! Profilaktika rejimi yoqilsa, barcha mijozlar (do'konlar va kassirlar) tizimga kira olmaydi. Bu ishni faqat muhim yangilanishlar vaqtida qiling.
                        </div>
                    )}
                </div>
            </div>

            {/* Save button */}
            {canManageSettings && (
                <div className="flex">
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:opacity-90 text-white rounded-xl font-bold transition-opacity flex items-center gap-2 disabled:opacity-50 shadow-md"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : <Save size={18} />}
                        {isSaving ? "Saqlanmoqda..." : "Sozlamalarni saqlash"}
                    </button>
                </div>
            )}
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, MonitorPlay, User, ArrowLeft, Tv } from "lucide-react";
import { useStore } from "@/lib/store";

export default function KDSLoginPage() {
    const [selectedRole, setSelectedRole] = useState<"kds" | "tv" | null>(null);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        const session = useStore.getState().kassirSession;
        if (session) router.replace(session.role === "TV Ekran" ? "/tv" : "/kds");
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!username) { setError("Login kiritilishi shart"); return; }
        if (!password) { setError("Parol kiritilishi shart"); return; }
        setIsLoading(true);
        try {
            const res = await fetch("/api/kassir/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Login yoki parol noto'g'ri"); setIsLoading(false); return; }
            useStore.getState().setKassirSession({ ...data.session.user, token: data.session.token, shopCode: data.shopCode, shopType: data.shopType });
            router.push(selectedRole === "tv" ? "/tv" : "/kds");
        } catch { setError("Tizimga ulanishda xatolik"); }
        finally { setIsLoading(false); }
    };

    /* ─── ROL TANLASH ─────────────────────────────────── */
    if (!selectedRole) {
        return (
            <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4ff 0%, #e8efff 50%, #f0f7ff 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter','Segoe UI',sans-serif", position: "relative", overflow: "hidden" }}>
                {/* Decorative circles */}
                <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "320px", height: "320px", borderRadius: "50%", background: "rgba(59,130,246,0.08)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: "-100px", left: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "rgba(99,102,241,0.07)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", top: "30%", left: "5%", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(59,130,246,0.05)", pointerEvents: "none" }} />

                <div style={{ width: "100%", maxWidth: "720px", padding: "24px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {/* Logo */}
                    <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "linear-gradient(135deg, #3b82f6, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", boxShadow: "0 8px 30px rgba(59,130,246,0.35)" }}>
                        <span style={{ fontSize: "28px", fontWeight: 900, color: "#fff" }}>E</span>
                    </div>

                    <h1 style={{ fontSize: "36px", fontWeight: 900, color: "#1e293b", margin: "0 0 10px", letterSpacing: "-0.8px", textAlign: "center" }}>Ekranlar Portali</h1>
                    <p style={{ color: "#64748b", fontSize: "16px", marginBottom: "48px", textAlign: "center" }}>Qaysi ekranga kirishni xohlaysiz?</p>

                    {/* Cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", width: "100%" }}>
                        {/* KDS */}
                        <button
                            onClick={() => setSelectedRole("kds")}
                            style={{ padding: "36px 28px", borderRadius: "24px", background: "#fff", border: "2px solid #fde68a", boxShadow: "0 4px 24px rgba(245,158,11,0.12)", cursor: "pointer", textAlign: "left", transition: "all 0.2s ease", position: "relative", overflow: "hidden" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(245,158,11,0.22)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.borderColor = "#f59e0b"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(245,158,11,0.12)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.borderColor = "#fde68a"; }}
                        >
                            <div style={{ position: "absolute", top: 0, right: 0, width: "100px", height: "100px", background: "radial-gradient(circle at top right, rgba(251,191,36,0.15), transparent 70%)", pointerEvents: "none" }} />
                            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, #fef3c7, #fde68a)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", boxShadow: "0 4px 14px rgba(245,158,11,0.25)" }}>
                                <MonitorPlay size={28} color="#d97706" />
                            </div>
                            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#92400e", margin: "0 0 10px" }}>Oshxona (KDS)</h2>
                            <p style={{ color: "#a16207", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>Oshpazlar uchun buyurtmalarni tayyorlash jarayonini boshqarish ekrani.</p>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "20px", color: "#d97706", fontSize: "13px", fontWeight: 700 }}>
                                <span>Kirish</span>
                                <ArrowRight size={14} />
                            </div>
                        </button>

                        {/* TV */}
                        <button
                            onClick={() => setSelectedRole("tv")}
                            style={{ padding: "36px 28px", borderRadius: "24px", background: "#fff", border: "2px solid #c7d2fe", boxShadow: "0 4px 24px rgba(99,102,241,0.1)", cursor: "pointer", textAlign: "left", transition: "all 0.2s ease", position: "relative", overflow: "hidden" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(99,102,241,0.2)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.borderColor = "#6366f1"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(99,102,241,0.1)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.borderColor = "#c7d2fe"; }}
                        >
                            <div style={{ position: "absolute", top: 0, right: 0, width: "100px", height: "100px", background: "radial-gradient(circle at top right, rgba(99,102,241,0.12), transparent 70%)", pointerEvents: "none" }} />
                            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, #e0e7ff, #c7d2fe)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", boxShadow: "0 4px 14px rgba(99,102,241,0.2)" }}>
                                <Tv size={28} color="#4f46e5" />
                            </div>
                            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#312e81", margin: "0 0 10px" }}>TV Navbat Ekrani</h2>
                            <p style={{ color: "#4338ca", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>Mijozlar uchun buyurtmalar navbati va tayyor bo'lganligini ko'rsatuvchi katta ekran.</p>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "20px", color: "#4f46e5", fontSize: "13px", fontWeight: 700 }}>
                                <span>Kirish</span>
                                <ArrowRight size={14} />
                            </div>
                        </button>
                    </div>

                    <button
                        onClick={() => router.push("/portal")}
                        style={{ marginTop: "36px", color: "#94a3b8", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 600, transition: "color 0.2s" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#64748b"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#94a3b8"}
                    >
                        <ArrowLeft size={15} /> Bosh portaga qaytish
                    </button>
                </div>
            </div>
        );
    }

    /* ─── LOGIN EKRANI ────────────────────────────────── */
    const isTv = selectedRole === "tv";
    const a = isTv
        ? { iconBg: "linear-gradient(135deg,#e0e7ff,#c7d2fe)", iconColor: "#4f46e5", titleColor: "#312e81", labelColor: "#4338ca", btnFrom: "#4f46e5", btnTo: "#6366f1", glowColor: "rgba(99,102,241,0.25)", borderFocus: "#6366f1", accentBar: "linear-gradient(90deg,#4f46e5,#6366f1,#818cf8)" }
        : { iconBg: "linear-gradient(135deg,#fef3c7,#fde68a)", iconColor: "#d97706", titleColor: "#92400e", labelColor: "#a16207", btnFrom: "#f59e0b", btnTo: "#d97706", glowColor: "rgba(245,158,11,0.25)", borderFocus: "#f59e0b", accentBar: "linear-gradient(90deg,#f59e0b,#fbbf24,#fcd34d)" };
    const Icon = isTv ? Tv : MonitorPlay;
    const title = isTv ? "TV Navbat Ekrani" : "Oshxona (KDS)";

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4ff 0%, #e8efff 50%, #f0f7ff 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter','Segoe UI',sans-serif", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "320px", height: "320px", borderRadius: "50%", background: "rgba(59,130,246,0.07)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-100px", left: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "rgba(99,102,241,0.06)", pointerEvents: "none" }} />

            <div style={{ width: "100%", maxWidth: "400px", padding: "24px", position: "relative", zIndex: 1 }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "28px", position: "relative" }}>
                    <button
                        onClick={() => setSelectedRole(null)}
                        style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "38px", height: "38px", borderRadius: "12px", background: "#fff", border: "1.5px solid #e2e8f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "all 0.2s" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#cbd5e1"; (e.currentTarget as HTMLElement).style.color = "#1e293b"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLElement).style.color = "#64748b"; }}
                    >
                        <ArrowLeft size={17} />
                    </button>
                    <div style={{ width: "60px", height: "60px", borderRadius: "18px", background: a.iconBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", boxShadow: `0 6px 20px ${a.glowColor}` }}>
                        <Icon size={30} color={a.iconColor} />
                    </div>
                    <h1 style={{ fontSize: "22px", fontWeight: 800, color: a.titleColor, margin: 0 }}>{title}</h1>
                    <p style={{ color: "#64748b", fontSize: "14px", marginTop: "6px" }}>Kirish uchun ma'lumotlarni kiriting</p>
                </div>

                {/* Card */}
                <div style={{ borderRadius: "24px", background: "#fff", border: "1.5px solid #e8ecf5", boxShadow: "0 8px 40px rgba(99,102,241,0.1)", padding: "32px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: a.accentBar, borderRadius: "24px 24px 0 0" }} />

                    {error && (
                        <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", padding: "12px 14px", borderRadius: "12px", fontSize: "13px", marginBottom: "18px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                            <span style={{ fontWeight: 700, flexShrink: 0 }}>!</span>
                            <p style={{ margin: 0 }}>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {/* Username */}
                        <div>
                            <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "7px" }}>Login yoki Telefon</label>
                            <div style={{ position: "relative" }}>
                                <div style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}><User size={16} /></div>
                                <input
                                    type="text" value={username} onChange={e => setUsername(e.target.value)}
                                    placeholder="@username yoki telefon" autoComplete="username"
                                    style={{ width: "100%", paddingLeft: "40px", paddingRight: "14px", paddingTop: "12px", paddingBottom: "12px", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "12px", color: "#1e293b", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border 0.2s" }}
                                    onFocus={e => (e.currentTarget as HTMLElement).style.border = `1.5px solid ${a.borderFocus}`}
                                    onBlur={e => (e.currentTarget as HTMLElement).style.border = "1.5px solid #e2e8f0"}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "7px" }}>Parol</label>
                            <div style={{ position: "relative" }}>
                                <div style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}><Lock size={16} /></div>
                                <input
                                    type="password" value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••" autoComplete="current-password"
                                    style={{ width: "100%", paddingLeft: "40px", paddingRight: "14px", paddingTop: "12px", paddingBottom: "12px", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "12px", color: "#1e293b", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border 0.2s" }}
                                    onFocus={e => (e.currentTarget as HTMLElement).style.border = `1.5px solid ${a.borderFocus}`}
                                    onBlur={e => (e.currentTarget as HTMLElement).style.border = "1.5px solid #e2e8f0"}
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit" disabled={isLoading}
                            style={{ marginTop: "4px", padding: "14px", borderRadius: "12px", background: `linear-gradient(135deg, ${a.btnFrom}, ${a.btnTo})`, border: "none", color: "#fff", fontSize: "15px", fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: isLoading ? 0.75 : 1, boxShadow: `0 6px 20px ${a.glowColor}`, fontFamily: "inherit", transition: "opacity 0.2s, transform 0.1s" }}
                            onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.opacity = "0.9"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = isLoading ? "0.75" : "1"; }}
                        >
                            {isLoading ? (
                                <>
                                    <div style={{ width: "17px", height: "17px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                                    <span>Kirilmoqda...</span>
                                </>
                            ) : (
                                <>
                                    <span>Tizimga kirish</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { LogOut } from "lucide-react";

export default function TVQueuePage() {
    const router = useRouter();
    const [authChecked, setAuthChecked] = useState(false);
    const [shopCode, setShopCode] = useState("");
    const [shopName, setShopName] = useState("EVIKO");
    const [themeColor, setThemeColor] = useState("#3b82f6");
    const [preparing, setPreparing] = useState<number[]>([]);
    const [ready, setReady] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [online, setOnline] = useState(true);
    const [time, setTime] = useState(new Date());
    const [newReadyIds, setNewReadyIds] = useState<number[]>([]);
    const prevReadyRef = useRef<number[]>([]);

    useEffect(() => {
        const session = useStore.getState().kassirSession;
        if (!session) { router.replace("/kds-login"); return; }
        setShopCode(session.shopCode || "");
        setAuthChecked(true);
    }, [router]);

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const playBell = useCallback(() => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            [0, 0.35, 0.7].forEach(delay => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(1047, ctx.currentTime + delay);
                osc.frequency.exponentialRampToValueAtTime(523, ctx.currentTime + delay + 0.5);
                gain.gain.setValueAtTime(0.5, ctx.currentTime + delay);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.7);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + delay);
                osc.stop(ctx.currentTime + delay + 0.9);
            });
        } catch {}
    }, []);

    const fetchQueue = useCallback(async () => {
        if (!shopCode) return;
        try {
            const res = await fetch(`/api/queue/${shopCode}`);
            if (!res.ok) throw new Error("fail");
            const data = await res.json();
            if (data.tenant) {
                setShopName(data.tenant.shopName || "EVIKO");
                if (data.tenant.themeColor) setThemeColor(data.tenant.themeColor);
            }
            setPreparing(data.preparing || []);
            const newReady: number[] = data.ready || [];
            const added = newReady.filter((n: number) => !prevReadyRef.current.includes(n));
            if (added.length > 0) {
                playBell();
                setNewReadyIds(added);
                setTimeout(() => setNewReadyIds([]), 3000);
            }
            prevReadyRef.current = newReady;
            setReady(newReady);
            setOnline(true);
            setLoading(false);
        } catch {
            setOnline(false);
            setLoading(false);
        }
    }, [shopCode, playBell]);

    useEffect(() => {
        if (!authChecked || !shopCode) return;
        fetchQueue();
        const iv = setInterval(fetchQueue, 4000);
        return () => clearInterval(iv);
    }, [authChecked, shopCode, fetchQueue]);

    const handleLogout = () => {
        useStore.getState().setKassirSession(null);
        router.replace("/kds-login");
    };

    const timeStr = time.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const dateStr = time.toLocaleDateString("uz-UZ", { weekday: "long", day: "2-digit", month: "long" });

    if (!authChecked || loading) {
        return (
            <div style={{ minHeight: "100vh", background: "#f0f4ff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", border: "3px solid #bfdbfe", borderTopColor: "#3b82f6", animation: "spin 0.9s linear infinite" }} />
                <p style={{ color: "#93c5fd", fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" }}>Yuklanmoqda...</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "#f8faff", display: "flex", flexDirection: "column", overflow: "hidden", userSelect: "none", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
            <style>{`
                @keyframes spin{to{transform:rotate(360deg)}}
                @keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.45}}
                @keyframes ping{0%{transform:scale(1);opacity:0.7}75%,100%{transform:scale(1.6);opacity:0}}
                @keyframes bounce-badge{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-5px)}}
                @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
                @keyframes glow-green{0%,100%{box-shadow:0 4px 24px rgba(22,163,74,0.18)}50%{box-shadow:0 4px 40px rgba(22,163,74,0.35)}}
                @keyframes appear{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
            `}</style>

            {/* ── HEADER ── */}
            <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", background: "#fff", borderBottom: "1.5px solid #e2e8f0", boxShadow: "0 2px 12px rgba(59,130,246,0.07)", flexShrink: 0, zIndex: 10, position: "relative" }}>
                {/* Brand */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "50px", height: "50px", borderRadius: "14px", background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 900, color: "#fff", boxShadow: `0 6px 20px ${themeColor}44`, flexShrink: 0 }}>
                        {shopName.charAt(0)}
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 900, color: "#1e293b", letterSpacing: "-0.5px", lineHeight: 1 }}>{shopName}</h1>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginTop: "4px" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: online ? "#22c55e" : "#ef4444", boxShadow: online ? "0 0 8px rgba(34,197,94,0.7)" : "none", animation: "pulse-dot 2s ease-in-out infinite" }} />
                            <span style={{ color: online ? "#16a34a" : "#dc2626", fontSize: "13px", fontWeight: 600 }}>{online ? "Jonli uzatish" : "Aloqa yo'q"}</span>
                        </div>
                    </div>
                </div>

                {/* Status pills */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "9px 18px", borderRadius: "12px", background: "#fffbeb", border: "1.5px solid #fde68a" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 8px rgba(245,158,11,0.7)", animation: "pulse-dot 2s ease-in-out infinite" }} />
                        <span style={{ color: "#92400e", fontWeight: 800, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Tayyorlanmoqda</span>
                        <span style={{ background: "#fef3c7", color: "#92400e", width: "26px", height: "26px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "14px" }}>{preparing.length}</span>
                    </div>
                    <div style={{ width: "1px", height: "30px", background: "#e2e8f0" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "9px 18px", borderRadius: "12px", background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px rgba(34,197,94,0.7)", animation: "pulse-dot 2s ease-in-out infinite" }} />
                        <span style={{ color: "#14532d", fontWeight: 800, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Tayyor!</span>
                        <span style={{ background: "#dcfce7", color: "#14532d", width: "26px", height: "26px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "14px" }}>{ready.length}</span>
                    </div>
                </div>

                {/* Clock + logout */}
                <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                    <div style={{ textAlign: "right" }}>
                        <p style={{ margin: 0, fontSize: "34px", fontWeight: 900, color: "#1e293b", letterSpacing: "-1px", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{timeStr}</p>
                        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "capitalize" }}>{dateStr}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        title="Chiqish"
                        style={{ width: "38px", height: "38px", borderRadius: "11px", background: "#f8fafc", border: "1.5px solid #e2e8f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", transition: "all 0.2s" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fef2f2"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; (e.currentTarget as HTMLElement).style.borderColor = "#fecaca"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; }}
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </header>

            {/* ── MAIN GRID ── */}
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 0, position: "relative", zIndex: 1 }}>

                {/* LEFT — Tayyorlanmoqda */}
                <div style={{ display: "flex", flexDirection: "column", borderRight: "1.5px solid #e2e8f0" }}>
                    <div style={{ padding: "14px 24px", background: "#fffbeb", borderBottom: "1.5px solid #fde68a", flexShrink: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 10px rgba(245,158,11,0.6)", animation: "pulse-dot 2s ease-in-out infinite" }} />
                            <span style={{ color: "#92400e", fontWeight: 900, fontSize: "15px", letterSpacing: "0.15em", textTransform: "uppercase" }}>Tayyorlanmoqda</span>
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: "auto", padding: "20px", background: "#fffdf5" }}>
                        {preparing.length === 0 ? (
                            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", opacity: 0.35 }}>
                                <span style={{ fontSize: "72px" }}>⏳</span>
                                <p style={{ color: "#d97706", fontWeight: 900, fontSize: "16px", letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}>Hozircha yo'q</p>
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "12px", alignContent: "start" }}>
                                {preparing.map(num => (
                                    <div key={num} style={{ aspectRatio: "1", borderRadius: "20px", background: "#fff", border: "2px solid #fde68a", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(245,158,11,0.1)", animation: "appear 0.3s ease" }}>
                                        <span style={{ fontSize: "clamp(32px,4.5vw,56px)", fontWeight: 900, color: "#d97706", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{num}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT — Tayyor */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "14px 24px", background: "#f0fdf4", borderBottom: "1.5px solid #bbf7d0", flexShrink: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 10px rgba(34,197,94,0.6)", animation: "pulse-dot 2s ease-in-out infinite" }} />
                            <span style={{ color: "#14532d", fontWeight: 900, fontSize: "15px", letterSpacing: "0.15em", textTransform: "uppercase" }}>Tayyor — Oling!</span>
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: "auto", padding: "20px", background: "#f7fffe" }}>
                        {ready.length === 0 ? (
                            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", opacity: 0.35 }}>
                                <span style={{ fontSize: "72px" }}>✅</span>
                                <p style={{ color: "#16a34a", fontWeight: 900, fontSize: "16px", letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}>Kutilmoqda...</p>
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: "16px", alignContent: "start" }}>
                                {ready.map((num, i) => {
                                    const isNewest = i === ready.length - 1;
                                    const justAdded = newReadyIds.includes(num);
                                    return (
                                        <div key={num} style={{
                                            aspectRatio: "1",
                                            borderRadius: "24px",
                                            background: isNewest ? "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)" : "#fff",
                                            border: isNewest ? "2.5px solid #22c55e" : "2px solid #bbf7d0",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            position: "relative",
                                            boxShadow: isNewest ? "0 6px 30px rgba(22,163,74,0.2)" : "0 2px 10px rgba(22,163,74,0.07)",
                                            animation: isNewest ? "glow-green 2s ease-in-out infinite" : (justAdded ? "appear 0.3s ease" : "none"),
                                            transform: justAdded && !isNewest ? "scale(1.03)" : "scale(1)",
                                            transition: "transform 0.4s ease",
                                        }}>
                                            {isNewest && (
                                                <div style={{ position: "absolute", inset: 0, borderRadius: "24px", border: "2px solid rgba(34,197,94,0.5)", animation: "ping 1.6s ease-in-out infinite" }} />
                                            )}
                                            {isNewest && (
                                                <div style={{ position: "absolute", top: "-13px", left: "50%", background: "linear-gradient(135deg, #16a34a, #22c55e)", color: "#fff", fontSize: "10px", fontWeight: 900, padding: "4px 12px", borderRadius: "20px", letterSpacing: "0.12em", textTransform: "uppercase", boxShadow: "0 4px 12px rgba(22,163,74,0.35)", animation: "bounce-badge 1.5s ease-in-out infinite", whiteSpace: "nowrap" }}>
                                                    YANGI!
                                                </div>
                                            )}
                                            <span style={{
                                                fontSize: isNewest ? "clamp(48px,7vw,84px)" : "clamp(40px,5.5vw,68px)",
                                                fontWeight: 900,
                                                color: isNewest ? "#14532d" : "#16a34a",
                                                fontVariantNumeric: "tabular-nums",
                                                lineHeight: 1,
                                                position: "relative",
                                                zIndex: 1,
                                            }}>{num}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── TICKER ── */}
            <footer style={{ flexShrink: 0, background: "#1e293b", borderTop: "1.5px solid #334155", padding: "12px 0", overflow: "hidden", zIndex: 10, position: "relative" }}>
                <div style={{ display: "flex", whiteSpace: "nowrap", animation: "ticker 32s linear infinite" }}>
                    {[1, 2].map(i => (
                        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "20px", paddingRight: "80px", color: "#94a3b8", fontWeight: 600, fontSize: "14px" }}>
                            <span>🛎️ Raqamingiz yashil bo'lganda kassaga yaqinlashing va buyurtmangizni oling!</span>
                            <span style={{ color: "#334155" }}>•</span>
                            <span>✅ Iltimos, chekingizni ko'rsatib buyurtmani qabul qiling.</span>
                            <span style={{ color: "#334155" }}>•</span>
                            <span>🍽️ {shopName} da xush kelibsiz! Yoqimli ishtaha!</span>
                            <span style={{ color: "#334155" }}>•</span>
                            <span>📱 QR kodni skanerlang va onlayn menyu bilan tanishing.</span>
                            <span style={{ color: "#334155" }}>•</span>
                        </span>
                    ))}
                </div>
            </footer>
        </div>
    );
}

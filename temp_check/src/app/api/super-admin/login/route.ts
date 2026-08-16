export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { authenticatePlatformUser } from "@/lib/backend/auth";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone, password, agentCode } = body;

        if (!phone || !password) {
            return NextResponse.json(
                { error: "Telefon va parol majburiy" },
                { status: 400 }
            );
        }

        // Bitta yagona super admin
        if (phone === "+998772931014" && password === "Kamol2000") {
            const { createSession } = await import("@/lib/backend/auth");
            await createSession("superadmin", null, "SUPER_ADMIN");
            return NextResponse.json({ 
                success: true, 
                user: { id: "superadmin", role: "MASTER", permissions: ["all"] } 
            });
        }

        // PlatformUser (masalan, Agent yoki Menejer) uchun kirish
        const result = await authenticatePlatformUser(phone, password, agentCode);
        if (!result.success) {
            return NextResponse.json({ error: result.error || "Login yoki parol noto'g'ri!" }, { status: 401 });
        }

        // Agar ular MASTER rolida kirsalar (eskirgan holatlar uchun)
        if ("user" in result && result.user?.role === "MASTER") {
            return NextResponse.json({ error: "MASTER foydalanuvchi orqali kirish man etiladi" }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            user: ("user" in result && result.user) ? result.user : null
        });

    } catch (error) {
        console.error("Super admin login error:", error);
        return NextResponse.json(
            { error: "Ichki server xatosi" },
            { status: 500 }
        );
    }
}

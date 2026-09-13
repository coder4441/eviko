export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { authenticateSuperAdmin, authenticatePlatformUser } from "@/lib/backend/auth";

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

        // Super Admin (master) login - faqat DB orqali
        if (phone === "superadmin" || phone === "+998772931014") {
            const result = await authenticateSuperAdmin(password);
            if (!result.success) {
                return NextResponse.json({ error: result.error || "Login yoki parol noto'g'ri!" }, { status: 401 });
            }
            return NextResponse.json({ 
                success: true, 
                user: { id: "superadmin", role: "MASTER", permissions: ["all"] } 
            });
        }

        // PlatformUser (Agent, Menejer va boshqalar) uchun kirish
        const result = await authenticatePlatformUser(phone, password, agentCode);
        if (!result.success) {
            return NextResponse.json({ error: result.error || "Login yoki parol noto'g'ri!" }, { status: 401 });
        }

        // MASTER rolida platformuser orqali kirish man etiladi
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

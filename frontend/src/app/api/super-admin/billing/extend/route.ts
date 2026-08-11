export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getSuperSession } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/db";
import { logAuditAction } from "@/lib/backend/rbac";

// POST /api/super-admin/billing/extend
// Body: { tenantId: string, days: number }
export async function POST(request: NextRequest) {
    try {
        const session = await getSuperSession();
        if (!session || (session.role !== "SUPER_ADMIN" && !(session as any).permissions?.includes("billing:manage"))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { tenantId, days } = await request.json();
        if (!tenantId || !days || days <= 0) {
            return NextResponse.json({ error: "tenantId va musbat days talab qilinadi" }, { status: 400 });
        }

        // Fetch current expiry
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { id: true, expiresAt: true }
        });

        if (!tenant) {
            return NextResponse.json({ error: "Tashkilot topilmadi" }, { status: 404 });
        }
        // Start from NOW or from current expiry if it's in the future
        const base = tenant.expiresAt && new Date(tenant.expiresAt) > new Date()
            ? new Date(tenant.expiresAt)
            : new Date();
        
        const newExpiry = new Date(base);
        newExpiry.setDate(newExpiry.getDate() + Number(days));

        await prisma.tenant.update({
            where: { id: tenantId },
            data: { expiresAt: newExpiry, status: 'active' }
        });

        await logAuditAction(session.userId || "superadmin", "billing_extend", { tenantId, days, newExpiry });

        return NextResponse.json({
            success: true,
            newExpiresAt: newExpiry.toISOString(),
            message: `Obuna ${days} kunga uzaytirildi`,
        });
    } catch (error) {
        console.error("Extend subscription error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

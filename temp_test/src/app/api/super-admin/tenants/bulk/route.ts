import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/backend/db";
import { checkSuperAdminPermission, logAuditAction } from "@/lib/backend/rbac";

export async function POST(request: NextRequest) {
    try {
        const auth = await checkSuperAdminPermission("tenants:edit");
        if (!auth.authorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { action, tenantIds } = body; // action: 'activate' | 'suspend'

        if (!tenantIds || !Array.isArray(tenantIds) || tenantIds.length === 0) {
            return NextResponse.json({ error: "Do'konlar tanlanmagan" }, { status: 400 });
        }

        if (action !== "activate" && action !== "suspend") {
            return NextResponse.json({ error: "Noto'g'ri amal" }, { status: 400 });
        }

        const newStatus = action === "activate" ? "active" : "suspended";

        const result = await prisma.tenant.updateMany({
            where: { id: { in: tenantIds } },
            data: { status: newStatus }
        });

        // Log the action
        await logAuditAction(
            auth.user?.id || "superadmin",
            `bulk_${action}_tenants`,
            { count: result.count, tenantIds }
        );

        return NextResponse.json({
            success: true,
            message: `${result.count} ta do'kon ${newStatus} holatiga o'tkazildi`
        });
    } catch (error: any) {
        console.error("Bulk tenants error:", error);
        return NextResponse.json({ error: "Ichki server xatosi" }, { status: 500 });
    }
}

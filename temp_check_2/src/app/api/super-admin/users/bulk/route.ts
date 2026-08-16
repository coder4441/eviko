import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/backend/db";
import { checkSuperAdminPermission, logAuditAction } from "@/lib/backend/rbac";

export async function POST(request: NextRequest) {
    try {
        const auth = await checkSuperAdminPermission("users:create"); // Typically only master or users:create can do this
        if (!auth.authorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { action, userIds } = body; // action: 'activate' | 'suspend'

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return NextResponse.json({ error: "Foydalanuvchilar tanlanmagan" }, { status: 400 });
        }

        if (action !== "activate" && action !== "suspend") {
            return NextResponse.json({ error: "Noto'g'ri amal" }, { status: 400 });
        }

        const newStatus = action === "activate" ? "active" : "suspended";

        const result = await prisma.platformUser.updateMany({
            where: { id: { in: userIds } },
            data: { status: newStatus }
        });

        // Log the action
        await logAuditAction(
            auth.user?.id || "superadmin",
            `bulk_${action}_users`,
            { count: result.count, userIds }
        );

        return NextResponse.json({
            success: true,
            message: `${result.count} ta foydalanuvchi ${newStatus} holatiga o'tkazildi`
        });
    } catch (error: any) {
        console.error("Bulk users error:", error);
        return NextResponse.json({ error: "Ichki server xatosi" }, { status: 500 });
    }
}

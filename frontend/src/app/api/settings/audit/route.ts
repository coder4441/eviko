export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/db";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const tenantId = session.tenantId;

        const logs = await prisma.auditLog.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        return NextResponse.json({
            auditLog: logs.map(l => {
                const dateObj = new Date(l.createdAt);
                const date = dateObj.toISOString().split('T')[0];
                const time = dateObj.toTimeString().split(' ')[0];
                return {
                    id: l.id,
                    user: l.user,
                    action: l.action,
                    detail: l.detail,
                    time,
                    date,
                    type: l.type
                };
            })
        });
    } catch (error) {
        console.error("Get audit log error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

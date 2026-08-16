import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/backend/db";
import { getSuperSession } from "@/lib/backend/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await getSuperSession();
        if (session?.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 401 });
        }

        let platformUser = null;
        let isMaster = false;
        let canViewLeads = false;
        
        if (session.userId === "superadmin") {
            isMaster = true;
            canViewLeads = true;
        } else {
            platformUser = await prisma.platformUser.findUnique({ where: { id: session.userId } });
            if (!platformUser || platformUser.status !== "active") {
                return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 401 });
            }
            
            let permissions: string[] = [];
            if (typeof platformUser.permissions === 'string') {
                try { permissions = JSON.parse(platformUser.permissions); } catch {}
            } else if (Array.isArray(platformUser.permissions)) {
                permissions = platformUser.permissions as string[];
            }
            isMaster = platformUser.role.toUpperCase() === "MASTER";
            canViewLeads = isMaster || permissions.includes("leads:view");
        }

        if (!canViewLeads) {
            return NextResponse.json({ error: "Sizda zayavkalarni ko'rish huquqi yo'q" }, { status: 403 });
        }

        const leads = await prisma.potentialClient.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json(leads);
    } catch (error) {
        console.error("Super Admin leads GET xatosi:", error);
        return NextResponse.json({ error: "Ichki server xatosi" }, { status: 500 });
    }
}


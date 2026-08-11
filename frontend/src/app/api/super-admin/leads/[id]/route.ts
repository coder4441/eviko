import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/backend/db";
import { getSuperSession } from "@/lib/backend/auth";

async function checkLeadsPermission() {
    const session = await getSuperSession();
    if (session?.role !== "SUPER_ADMIN") return false;

    if (session.userId === "superadmin") return true;

    const platformUser = await prisma.platformUser.findUnique({ where: { id: session.userId } });
    if (!platformUser || platformUser.status !== "active") return false;
    
    let permissions: string[] = [];
    if (typeof platformUser.permissions === 'string') {
        try { permissions = JSON.parse(platformUser.permissions); } catch {}
    } else if (Array.isArray(platformUser.permissions)) {
        permissions = platformUser.permissions as string[];
    }
    return permissions.includes("leads:view") || permissions.includes("leads:manage"); // Assuming manage implies write
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const canManage = await checkLeadsPermission();
        if (!canManage) {
            return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 401 });
        }

        const body = await request.json();
        const { status, notes } = body;
        
        const dataToUpdate: any = {};
        if (status) dataToUpdate.status = status;
        if (notes !== undefined) dataToUpdate.notes = notes;

        const updatedLead = await prisma.potentialClient.update({
            where: { id: params.id },
            data: dataToUpdate
        });

        return NextResponse.json(updatedLead);
    } catch (error) {
        console.error("Super Admin lead PATCH xatosi:", error);
        return NextResponse.json({ error: "Ichki server xatosi" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const canManage = await checkLeadsPermission();
        if (!canManage) {
            return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 401 });
        }

        await prisma.potentialClient.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Super Admin lead DELETE xatosi:", error);
        return NextResponse.json({ error: "Ichki server xatosi" }, { status: 500 });
    }
}


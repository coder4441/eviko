export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/db";

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { name, phone, info, currency } = await req.json();
        if (!name) return NextResponse.json({ error: "Nom majburiy" }, { status: 400 });

        const existing = await prisma.ubtSupplier.findFirst({
            where: { id: params.id, tenantId: session.tenantId }
        });
        if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

        await prisma.ubtSupplier.update({
            where: { id: params.id },
            data: {
                name,
                phone: phone || null,
                info: info || null,
                currency: currency || "UZS"
            }
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const existing = await prisma.ubtSupplier.findFirst({
            where: { id: params.id, tenantId: session.tenantId }
        });
        if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

        await prisma.ubtSupplier.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

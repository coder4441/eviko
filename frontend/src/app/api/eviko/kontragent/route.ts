import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/db";

export const dynamic = "force-dynamic";

// GET: Returns mijozlar (customers) + yetkazib beruvchilar (suppliers) for a tenant
export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Customers from Prisma Customer model
        const customers = await prisma.customer.findMany({
            where: { tenantId: session.tenantId },
            select: { id: true, name: true, phone: true },
            orderBy: { name: "asc" },
            take: 300,
        });

        // Suppliers from Prisma model
        const suppliers = await prisma.ubtSupplier.findMany({
            where: { tenantId: session.tenantId },
            select: { id: true, name: true, phone: true, info: true, currency: true },
            orderBy: { name: "asc" },
            take: 300,
        });

        // Staff from Prisma Staff model
        const staff = await prisma.staff.findMany({
            where: { tenantId: session.tenantId },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        });

        return NextResponse.json({ customers, suppliers, staff });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST: Add new supplier
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { name, phone, info, currency } = await req.json();
        if (!name) return NextResponse.json({ error: "Nom majburiy" }, { status: 400 });

        const supplier = await prisma.ubtSupplier.create({
            data: {
                tenantId: session.tenantId,
                name,
                phone: phone || null,
                info: info || null,
                currency: currency || "UZS"
            }
        });

        return NextResponse.json({ success: true, id: supplier.id });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

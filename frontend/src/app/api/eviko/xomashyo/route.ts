export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/backend/db";
import { getSession } from "@/lib/backend/auth";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "@/lib/backend/jwt";

async function getAuthTenantId(request: NextRequest): Promise<string | null> {
    try {
        const cookieSession = await getSession();
        if (cookieSession?.tenantId) return cookieSession.tenantId;
    } catch {}
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
        try {
            const { payload } = await jwtVerify(authHeader.slice(7), JWT_SECRET);
            if (payload.tenantId) return payload.tenantId as string;
        } catch {}
    }
    return null;
}

export async function GET(req: NextRequest) {
    try {
        const tenantId = await getAuthTenantId(req);
        if (!tenantId) return NextResponse.json([], { status: 200 });
        
        const type = req.nextUrl.searchParams.get("type");
        
        const rows = await prisma.ubtIngredient.findMany({
            where: {
                tenantId,
                ...(type ? { type } : {})
            },
            orderBy: [
                { type: 'asc' },
                { createdAt: 'asc' }
            ]
        });

        return NextResponse.json(rows);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const tenantId = await getAuthTenantId(req);
        if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        
        const { id, name, unit, stock, price, type, categoryId } = await req.json();
        const ingType = type || "xomashyo";
        const catId = categoryId || null;
        if (!name) return NextResponse.json({ error: "Xomashyo nomi kiritilishi shart" }, { status: 400 });
        
        if (id) {
            // Update
            await prisma.ubtIngredient.update({
                where: { id },
                data: {
                    name,
                    unit,
                    stock: Number(stock),
                    price: Number(price),
                    type: ingType,
                    categoryId: catId
                }
            });
            return NextResponse.json({ success: true, id });
        } else {
            // Create
            const newId = "ing_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
            await prisma.ubtIngredient.create({
                data: {
                    id: newId,
                    tenantId,
                    name,
                    unit,
                    stock: Number(stock),
                    price: Number(price),
                    type: ingType,
                    categoryId: catId
                }
            });
            return NextResponse.json({ success: true, id: newId });
        }
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const tenantId = await getAuthTenantId(req);
        if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        
        const { id } = await req.json();
        if (!id) return NextResponse.json({ error: "ID kiritilmagan" }, { status: 400 });
        
        await prisma.ubtIngredient.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

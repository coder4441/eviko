import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/backend/db";
import { getSession } from "@/lib/backend/auth";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "@/lib/backend/jwt";

export const dynamic = 'force-dynamic';

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
        
        const type = req.nextUrl.searchParams.get("type") || "taom";
        const rows = await prisma.ubtCategory.findMany({
            where: { tenantId, type },
            orderBy: { createdAt: 'asc' },
            select: { id: true, name: true, type: true, itemCount: true, createdAt: true }
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
        
        const { id, name, type } = await req.json();
        const catType = type || "taom";
        if (!name) return NextResponse.json({ error: "Kategoriya nomi kiritilishi shart" }, { status: 400 });
        
        if (id && !id.startsWith("C")) {
            // Update
            await prisma.ubtCategory.update({
                where: { id },
                data: { name, type: catType }
            });
            return NextResponse.json({ success: true, id });
        } else {
            // Create
            const newId = "cat_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
            await prisma.ubtCategory.create({
                data: {
                    id: newId,
                    tenantId,
                    name,
                    type: catType,
                    itemCount: 0
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
        
        await prisma.ubtCategory.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

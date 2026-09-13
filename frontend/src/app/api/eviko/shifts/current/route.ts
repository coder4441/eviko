export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/db";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "@/lib/backend/jwt";

async function getAuth(request) {
    try {
        const session = await getSession();
        if (session?.tenantId) return { tenantId: session.tenantId, staffName: session.name || null };
    } catch {}
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
        try {
            const { payload } = await jwtVerify(authHeader.slice(7), JWT_SECRET);
            if (payload.tenantId) return { tenantId: payload.tenantId, staffName: payload.name || null };
        } catch {}
    }
    return null;
}

export async function GET(request) {
    try {
        const auth = await getAuth(request);
        if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const shift = await prisma.cashShift.findFirst({
            where: { tenantId: auth.tenantId, status: "OPEN" },
            orderBy: { startTime: 'desc' }
        });
        return NextResponse.json({ shift });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

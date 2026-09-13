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

export async function POST(request) {
    try {
        const auth = await getAuth(request);
        if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { shiftId, actualCash } = await request.json();

        // Find open shift
        const shift = await prisma.cashShift.findFirst({
            where: { tenantId: auth.tenantId, status: "OPEN" }
        });
        if (!shift) {
            return NextResponse.json({ error: "Ochiq smena topilmadi" }, { status: 404 });
        }

        const now = new Date();
        const startTime = shift.startTime;
        const endTime = now;

        // Calculate totals from KassiHarakat within shift window
        const kassiRecords = await prisma.kassiHarakat.findMany({
            where: {
                tenantId: auth.tenantId,
                date: { gte: startTime, lte: endTime },
                type: "kirim"
            }
        });

        const expenseRecords = await prisma.kassiHarakat.findMany({
            where: {
                tenantId: auth.tenantId,
                date: { gte: startTime, lte: endTime },
                type: "chiqim"
            }
        });

        let cashTotal = 0;
        let cardTotal = 0;
        let mixedTotal = 0;
        let salesTotal = 0;

        for (const r of kassiRecords) {
            salesTotal += r.amount;
            const m = r.paymentMethod?.toLowerCase() || "";
            if (m.includes("naqd") || m.includes("cash")) cashTotal += r.amount;
            else if (m.includes("karta") || m.includes("card") || m.includes("plastik")) cardTotal += r.amount;
            else if (m.includes("aralash") || m.includes("mixed")) mixedTotal += r.amount;
            else cashTotal += r.amount;
        }

        const expensesTotal = expenseRecords.reduce((s, r) => s + r.amount, 0);
        const expectedCash = shift.initialCash + cashTotal - expensesTotal;
        const actualCashNum = parseFloat(actualCash) || 0;
        const difference = actualCashNum - expectedCash;

        const updatedShift = await prisma.cashShift.update({
            where: { id: shift.id },
            data: {
                status: "CLOSED",
                endTime,
                salesTotal,
                cardTotal,
                mixedTotal,
                expensesTotal,
                expectedCash,
                actualCash: actualCashNum,
                difference,
            }
        });

        return NextResponse.json({ shift: updatedShift });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

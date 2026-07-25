import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { shopCode, tableNumber, notes } = body;

        if (!shopCode) {
            return NextResponse.json({ error: "Do'kon kodi ko'rsatilmadi" }, { status: 400 });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { shopCode: shopCode.toUpperCase() }
        });

        if (!tenant) {
            return NextResponse.json({ error: "Muassasa topilmadi" }, { status: 404 });
        }

        const tableStr = tableNumber ? String(tableNumber) : "Noma'lum";

        // Find table in SmartTable if available
        const smartTable = await prisma.smartTable.findFirst({
            where: {
                tenantId: tenant.id,
                tableNumber: tableStr
            }
        });

        // 1. Update SmartTable status to "Chaqiruv" or "CALL" if table exists
        if (smartTable) {
            await prisma.smartTable.update({
                where: { id: smartTable.id },
                data: {
                    status: "Chaqiruv",
                    order: `🔔 Ofitsiant chaqirildi (${new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })})`
                }
            });
        }

        // 2. Create KDSOrder entry so Waiter and Kitchen displays receive notification
        if (smartTable) {
            await prisma.kDSOrder.create({
                data: {
                    tenantId: tenant.id,
                    tableId: smartTable.id,
                    description: notes ? `🔔 Ofitsiant chaqiruvi: ${notes}` : `🔔 Ofitsiant chaqiruvi (${tableStr}-stol)`,
                    status: "pending",
                    priority: "high"
                }
            });
        }

        // 3. Log Audit Trail
        await prisma.auditLog.create({
            data: {
                tenantId: tenant.id,
                user: `QR-Mijoz (${tableStr}-stol)`,
                action: "OFITSIANT_CHAQIRILDI",
                detail: `${tableStr}-stoldan ofitsiant chaqirish tugmasi bosildi`,
                type: "warning"
            }
        });

        return NextResponse.json({
            success: true,
            message: `${tableStr}-stol uchun ofitsiantga xabar yuborildi! Teh orada yetib keladi.`
        });
    } catch (error: any) {
        console.error("Call waiter error:", error);
        return NextResponse.json({ error: "Serverda xatolik yuz berdi" }, { status: 500 });
    }
}

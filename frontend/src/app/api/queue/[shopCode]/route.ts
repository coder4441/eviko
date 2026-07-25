import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
    request: NextRequest,
    { params }: { params: { shopCode: string } }
) {
    try {
        const { shopCode } = params;

        if (!shopCode) {
            return NextResponse.json({ error: "Do'kon kodi ko'rsatilmadi" }, { status: 400 });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { shopCode: shopCode.toUpperCase() },
            select: { id: true, shopName: true, settings: true }
        });

        if (!tenant) {
            return NextResponse.json({ error: "Muassasa topilmadi" }, { status: 404 });
        }

        // Only get today's orders
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const activeOrders = await prisma.transaction.findMany({
            where: {
                tenantId: tenant.id,
                createdAt: { gte: startOfDay },
                queueStatus: { in: ["PREPARING", "READY"] },
                dailyOrderNumber: { not: null }
            },
            select: {
                id: true,
                dailyOrderNumber: true,
                queueStatus: true,
                createdAt: true
            },
            orderBy: {
                createdAt: "asc" // Oldest first
            }
        });

        // Parse settings to get theme color
        let themeColor = "#f97316";
        try {
            if (tenant.settings) {
                const parsed = JSON.parse(tenant.settings);
                if (parsed.themeColor) themeColor = parsed.themeColor;
            }
        } catch {}

        return NextResponse.json({
            tenant: {
                shopName: tenant.shopName,
                themeColor
            },
            preparing: activeOrders.filter(o => o.queueStatus === "PREPARING").map(o => o.dailyOrderNumber),
            ready: activeOrders.filter(o => o.queueStatus === "READY").map(o => o.dailyOrderNumber),
            orders: activeOrders // pass full array just in case
        });
    } catch (error: any) {
        console.error("Queue API fetch error:", error);
        return NextResponse.json({ error: "Serverda xatolik yuz berdi" }, { status: 500 });
    }
}

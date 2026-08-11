import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/backend/auth";

const prisma = new PrismaClient();

// Get active KDS orders for the logged-in tenant
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const orders = await prisma.transaction.findMany({
            where: {
                tenantId: session.tenantId,
                createdAt: { gte: startOfDay },
                queueStatus: { in: ["PREPARING", "READY"] },
                dailyOrderNumber: { not: null }
            },
            select: {
                id: true,
                dailyOrderNumber: true,
                queueStatus: true,
                createdAt: true,
                method: true,
                items: {
                    select: {
                        id: true,
                        name: true,
                        quantity: true
                    }
                }
            },
            orderBy: {
                createdAt: "asc"
            }
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error("KDS GET error", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// Update order status
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, newStatus } = await request.json();
        
        if (!id || !newStatus) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const updated = await prisma.transaction.updateMany({
            where: {
                id,
                tenantId: session.tenantId
            },
            data: {
                queueStatus: newStatus
            }
        });

        if (updated.count === 0) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("KDS POST error", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

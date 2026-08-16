export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/backend/db";
import { hashPassword } from "@/lib/backend/auth";
import { isPhoneGloballyUnique } from "@/lib/backend/validators";
import { checkSuperAdminPermission, logAuditAction } from "@/lib/backend/rbac";

export async function GET(request: NextRequest) {
    try {
        const auth = await checkSuperAdminPermission(["tenants:view", "tenants:edit", "tenants:create"]);
        if (!auth.authorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const skip = (page - 1) * limit;

        const isMaster = auth.user?.role === "MASTER";
        
        const whereClause: any = {
            AND: [
                (!isMaster && auth.user?.role === "Agent" && auth.user?.agentCode) ? { agentCode: auth.user.agentCode } : {},
                status ? { status } : {},
                search ? {
                    OR: [
                        { shopName: { contains: search, mode: 'insensitive' } },
                        { ownerName: { contains: search, mode: 'insensitive' } },
                        { shopCode: { contains: search, mode: 'insensitive' } },
                        { phone: { contains: search } }
                    ]
                } : {}
            ]
        };

        const [tenants, total] = await Promise.all([
            prisma.tenant.findMany({
                where: whereClause,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                select: {
                    id: true,
                    shopCode: true,
                    billingId: true,
                    shopName: true,
                    ownerName: true,
                    phone: true,
                    email: true,
                    address: true,
                    plan: true,
                    status: true,
                    adminUsername: true,
                    settings: true,
                    agentCode: true,
                    createdAt: true,
                    expiresAt: true,
                },
            }),
            prisma.tenant.count({ where: whereClause })
        ]);

        return NextResponse.json({
            tenants,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Get tenants error:", error);
        return NextResponse.json({ error: "Ichki server xatosi" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = await checkSuperAdminPermission("tenants:create");
        if (!auth.authorized) {
            return NextResponse.json({ error: "Permission denied" }, { status: 403 });
        }

        const body = await request.json();
        const {
            shopName, ownerName, phone, email, address,
            plan, status, adminUsername, adminPassword, settings, agentCode
        } = body;

        if (!shopName || !ownerName || !adminUsername || !adminPassword) {
            return NextResponse.json({ error: "Barcha majburiy maydonlar to'ldirilishi shart" }, { status: 400 });
        }

        if (phone) {
            const isUnique = await isPhoneGloballyUnique(phone);
            if (!isUnique) {
                return NextResponse.json({ error: "Bu telefon raqami allaqachon tizimda ro'yxatdan o'tgan" }, { status: 409 });
            }
        }

        let shopCode = "";
        for (let attempt = 0; attempt < 20; attempt++) {
            const num = Math.floor(1000 + Math.random() * 9000);
            const candidate = `SHOP${num}`;
            const taken = await prisma.tenant.findFirst({ where: { shopCode: candidate } });
            if (!taken) { shopCode = candidate; break; }
        }
        if (!shopCode) {
            return NextResponse.json({ error: "Do'kon kodi generatsiya qilib bo'lmadi" }, { status: 500 });
        }

        const passwordHash = await hashPassword(adminPassword);
        const id = `cm${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
        
        // expiresAt NULL — to'lov qilinguncha tarif boshlanmaydi
        const expiresAt = null;
        
        let billingId = "";
        for (let attempt = 0; attempt < 10; attempt++) {
            const candidate = Math.floor(10000000 + Math.random() * 90000000).toString();
            const existing = await prisma.tenant.findFirst({ where: { billingId: candidate } });
            if (!existing) { billingId = candidate; break; }
        }
        if (!billingId) {
            return NextResponse.json({ error: "Billing ID generatsiya qilib bo'lmadi, qayta urinib ko'ring" }, { status: 500 });
        }

        const newTenant = await prisma.tenant.create({
            data: {
                id,
                shopCode,
                billingId,
                shopName,
                ownerName,
                phone: phone || "",
                email: email || "",
                address: address || "",
                plan: plan || "basic",
                status: "suspended",   // to'lov qilinguncha kutish holatida
                adminUsername,
                adminPasswordHash: passwordHash,
                settings: settings || {},
                agentCode: agentCode || null,
                expiresAt,   // null — to'lovdan keyin billing orqali o'rnatiladi
            },
        });

        await logAuditAction(
            auth.user?.id || "superadmin",
            "create_tenant",
            { tenantId: id, shopCode, shopName }
        );

        return NextResponse.json({
            success: true,
            tenant: { id, shopCode, billingId, shopName },
        }, { status: 201 });
    } catch (error) {
        console.error("Create tenant error:", error);
        return NextResponse.json({ error: "Ichki server xatosi" }, { status: 500 });
    }
}

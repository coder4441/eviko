export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/db";
import { hashPassword } from "@/lib/backend/auth";
import { createAuditLog } from "@/lib/backend/audit";
import { isPhoneGloballyUnique } from "@/lib/backend/validators";

export async function GET(_request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const tenantId = session.tenantId;

        const staff = await prisma.staff.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                tenantId: true,
                name: true,
                role: true,
                username: true,
                permissions: true,
                branch: true,
                phone: true,
                status: true,
                sales: true,
                transactions: true,
                createdAt: true
            }
        });

        return NextResponse.json({
            staff: staff.map((s) => ({
                ...s,
                permissions: typeof s.permissions === 'string' ? JSON.parse(s.permissions || '[]') : s.permissions,
            })),
        });
    } catch (error) {
        console.error("Get staff error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const tenantId = session.tenantId;
        const body = await request.json();

        const { name, role, username, password, permissions, branch, phone, staffMeta } = body;

        if (!name || !username || !password) {
            return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
        }

        if (phone) {
            const isUnique = await isPhoneGloballyUnique(phone);
            if (!isUnique) {
                return NextResponse.json({ error: "Bu telefon raqami tizimda allaqachon band" }, { status: 409 });
            }
        }

        // Check if username already exists globally (across all tenants)
        const existing = await prisma.staff.findFirst({
            where: { username },
        });

        if (existing) {
            return NextResponse.json({ error: "Username already exists system-wide" }, { status: 409 });
        }

        const passwordHash = await hashPassword(password);
        const id = `cm${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
        const permStr = JSON.stringify(permissions || ["pos"]);
        const branchVal = branch || "Filial #1";
        const phoneVal = phone || "";
        const roleVal = role || "Kassir";
        const metaVal = staffMeta ? JSON.stringify(staffMeta) : "{}";

        await prisma.staff.create({
            data: {
                id,
                tenantId,
                name,
                role: roleVal,
                username,
                passwordHash,
                permissions: permStr,
                branch: branchVal,
                phone: phoneVal,
                staffMeta: metaVal,
                status: 'active',
                sales: 0,
                transactions: 0
            }
        });

        // Ensure only one main monoblock exists if this creation sets isMainMonoblock to true
        if (roleVal === "Manablog" && phoneVal) {
            try {
                const phoneData = JSON.parse(phoneVal);
                if (phoneData.isMainMonoblock) {
                    const otherManablogs = await prisma.staff.findMany({
                        where: {
                            tenantId,
                            role: 'Manablog',
                            id: { not: id }
                        }
                    });
                    
                    for (const m of otherManablogs) {
                        try {
                            const p2 = JSON.parse(m.phone || '{}');
                            if (p2.isMainMonoblock) {
                                p2.isMainMonoblock = false;
                                await prisma.staff.update({
                                    where: { id: m.id },
                                    data: { phone: JSON.stringify(p2) }
                                });
                            }
                        } catch (e) {}
                    }
                }
            } catch (e) {}
        }

        await createAuditLog(tenantId, session.userId ? "Admin" : "System", "Yangi xodim qo'shildi", `${name} (${roleVal})`, "create");

        return NextResponse.json(
            {
                success: true,
                staff: { id, name, role: roleVal },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create staff error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

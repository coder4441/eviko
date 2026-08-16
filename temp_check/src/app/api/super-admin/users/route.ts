export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/backend/db";
import { hashPassword } from "@/lib/backend/auth";
import { checkSuperAdminPermission, logAuditAction } from "@/lib/backend/rbac";

// GET Platform Users
export async function GET(request: NextRequest) {
    try {
        const auth = await checkSuperAdminPermission("users:view");
        if (!auth.authorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const role = searchParams.get("role") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const skip = (page - 1) * limit;

        const whereClause: any = {
            AND: [
                role ? { role } : {},
                search ? {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { phone: { contains: search } },
                        { agentCode: { contains: search, mode: 'insensitive' } }
                    ]
                } : {}
            ]
        };

        const [users, total] = await Promise.all([
            prisma.platformUser.findMany({
                where: whereClause,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.platformUser.count({ where: whereClause })
        ]);

        const mappedUsers = users.map((u: any) => ({
            id: u.id,
            name: u.name,
            phone: u.phone,
            role: u.role,
            agentCode: u.agentCode || null,
            permissions: typeof u.permissions === "string" ? JSON.parse(u.permissions) : u.permissions,
            status: u.status,
            createdAt: u.createdAt,
        }));

        return NextResponse.json({
            users: mappedUsers,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST Create Platform User
export async function POST(req: NextRequest) {
    try {
        const auth = await checkSuperAdminPermission("users:create");
        if (!auth.authorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        if (!data.name || !data.phone || !data.password || !data.role) {
            return NextResponse.json({ error: "Barcha majburiy maydonlarni to'ldiring" }, { status: 400 });
        }

        const normalizedPhone = data.phone.replace(/\s+/g, "");
        const existing = await prisma.platformUser.findUnique({ where: { phone: normalizedPhone } });
        if (existing) {
            return NextResponse.json({ error: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" }, { status: 400 });
        }

        const pHash = await hashPassword(data.password);
        const newUser = await prisma.platformUser.create({
            data: {
                name: data.name,
                phone: normalizedPhone,
                passwordHash: pHash,
                role: data.role,
                agentCode: data.role === "Agent" ? (data.agentCode || null) : null,
                permissions: data.permissions || [],
                status: data.status || "active",
            }
        });

        await logAuditAction(
            auth.user?.id || "superadmin",
            "create_user",
            { userId: newUser.id, name: newUser.name, role: newUser.role }
        );

        return NextResponse.json({
            success: true,
            user: {
                id: newUser.id,
                name: newUser.name,
                phone: newUser.phone,
                role: newUser.role,
                agentCode: newUser.agentCode,
                permissions: newUser.permissions
            }
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// PUT Update Platform User
export async function PUT(req: NextRequest) {
    try {
        const auth = await checkSuperAdminPermission("users:create");
        if (!auth.authorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const { id, name, phone, password, role, permissions, status, agentCode } = data;

        if (!id || !name || !phone || !role) {
            return NextResponse.json({ error: "Barcha majburiy maydonlarni to'ldiring" }, { status: 400 });
        }

        const normalizedPhone = phone.replace(/\s+/g, "");
        const existing = await prisma.platformUser.findUnique({ where: { phone: normalizedPhone } });
        if (existing && existing.id !== id) {
            return NextResponse.json({ error: "Bu telefon raqam allaqachon boshqa foydalanuvchida ro'yxatdan o'tgan" }, { status: 400 });
        }

        const updateData: any = { name, phone: normalizedPhone, role, permissions: permissions || [] };
        if (status) updateData.status = status;
        
        if (role === "Agent") {
            updateData.agentCode = agentCode || null;
        } else {
            updateData.agentCode = null;
        }

        if (password && password.trim() !== "") {
            updateData.passwordHash = await hashPassword(password);
        }

        const updatedUser = await prisma.platformUser.update({
            where: { id },
            data: updateData
        });

        await logAuditAction(
            auth.user?.id || "superadmin",
            "update_user",
            { userId: updatedUser.id, name: updatedUser.name, role: updatedUser.role }
        );

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                phone: updatedUser.phone,
                role: updatedUser.role,
                agentCode: updatedUser.agentCode,
                permissions: updatedUser.permissions
            }
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE a Platform user
export async function DELETE(req: NextRequest) {
    try {
        const auth = await checkSuperAdminPermission("users:delete");
        if (!auth.authorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await req.json();
        
        const user = await prisma.platformUser.findUnique({ where: { id } });
        if (!user) {
             return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        await prisma.platformUser.delete({ where: { id } });

        await logAuditAction(
            auth.user?.id || "superadmin",
            "delete_user",
            { userId: id, name: user.name, role: user.role }
        );

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

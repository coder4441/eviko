export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/db";
import { hashPassword } from "@/lib/backend/auth";
import { createAuditLog } from "@/lib/backend/audit";
import { isPhoneGloballyUnique } from "@/lib/backend/validators";

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const tenantId = session.tenantId;
        const body = await request.json();

        if (body.phone) {
            const isUnique = await isPhoneGloballyUnique(body.phone, params.id);
            if (!isUnique) {
                return NextResponse.json({ error: "Bu telefon raqami allaqachon tizimda band" }, { status: 409 });
            }
        }

        // Check staff exists and belongs to tenant
        const existing = await prisma.staff.findUnique({
            where: { id: params.id },
            select: { id: true, tenantId: true }
        });

        if (!existing || existing.tenantId !== tenantId) {
            return NextResponse.json({ error: "Staff not found" }, { status: 404 });
        }

        const dataToUpdate: any = {};
        if (body.name) dataToUpdate.name = body.name;
        if (body.role) dataToUpdate.role = body.role;
        if (body.branch) dataToUpdate.branch = body.branch;
        if (body.phone !== undefined) dataToUpdate.phone = body.phone;
        if (body.staffMeta !== undefined) dataToUpdate.staffMeta = typeof body.staffMeta === "string" ? body.staffMeta : JSON.stringify(body.staffMeta);
        if (body.status) dataToUpdate.status = body.status;
        if (body.permissions) dataToUpdate.permissions = JSON.stringify(body.permissions);
        if (body.password) {
            dataToUpdate.passwordHash = await hashPassword(body.password);
        }

        if (Object.keys(dataToUpdate).length > 0) {
            await prisma.staff.update({
                where: { id: params.id },
                data: dataToUpdate
            });

            // Ensure only one main monoblock exists if this update sets isMainMonoblock to true
            if (body.phone) {
                try {
                    const phoneData = typeof body.phone === "string" ? JSON.parse(body.phone) : body.phone;
                    if (phoneData.isMainMonoblock) {
                        const otherManablogs = await prisma.staff.findMany({
                            where: { tenantId, role: 'Manablog', id: { not: params.id } }
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

            await createAuditLog(tenantId, session.userId ? "Admin" : "System", "Xodim ma'lumotlari yangilandi", `ID: ${params.id}`, "update");
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update staff error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const tenantId = session.tenantId;

        const existing = await prisma.staff.findUnique({
            where: { id: params.id },
            select: { id: true, tenantId: true }
        });

        if (!existing || existing.tenantId !== tenantId) {
            return NextResponse.json({ error: "Staff not found" }, { status: 404 });
        }

        await prisma.staff.delete({ where: { id: params.id } });

        await createAuditLog(tenantId, session.userId ? "Admin" : "System", "Xodim tizimdan o'chirildi", `ID: ${params.id}`, "delete");

        return NextResponse.json({ success: true, message: "Staff deleted" });
    } catch (error) {
        console.error("Delete staff error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

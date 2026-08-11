import { getSuperSession } from "./auth";
import { prisma } from "./db";

export async function checkSuperAdminPermission(permission: string | string[]): Promise<{ authorized: boolean, user?: any }> {
    const session = await getSuperSession();
    if (session?.role !== "SUPER_ADMIN") {
        return { authorized: false };
    }

    // superadmin login is hardcoded for master
    if (session.userId === "superadmin") {
        return { authorized: true, user: { id: "superadmin", role: "MASTER" } };
    }

    const user = await prisma.platformUser.findUnique({ where: { id: session.userId } });
    if (!user || user.status !== "active") {
        return { authorized: false };
    }

    if (user.role.toUpperCase() === "MASTER") {
        return { authorized: true, user };
    }

    // JSON parsing check for backward compatibility if it's still somehow string
    let perms: string[] = [];
    if (typeof user.permissions === 'string') {
        try { perms = typeof user.permissions === "string" ? JSON.parse(user.permissions) : (user.permissions as any); } catch {}
    } else if (Array.isArray(user.permissions)) {
        perms = user.permissions as string[];
    }

    if (perms.includes("all")) {
        return { authorized: true, user };
    }

    const reqPerms = Array.isArray(permission) ? permission : [permission];
    for (const p of reqPerms) {
        if (perms.includes(p)) {
            return { authorized: true, user };
        }
    }

    return { authorized: false, user };
}

export async function logAuditAction(userId: string, action: string, details: any) {
    try {
        await prisma.auditLog.create({
            data: {
                tenantId: "super-admin", // Pseudo tenant id for system level
                user: userId,
                action: action,
                detail: typeof details === 'string' ? details : JSON.stringify(details),
                type: "SUPER_ADMIN_ACTION"
            }
        });
    } catch (err) {
        console.error("Failed to log audit action:", err);
    }
}

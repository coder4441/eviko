import { prisma } from "./db";

export async function createAuditLog(
    tenantId: string,
    user: string,
    action: string,
    detail: string,
    type: "create" | "update" | "delete" | "info"
) {
    try {
        await prisma.auditLog.create({
            data: {
                id: `log_${Date.now()}`,
                tenantId,
                user,
                action,
                detail,
                type
            }
        });
    } catch (error) {
        console.error("Failed to create audit log:", error);
    }
}

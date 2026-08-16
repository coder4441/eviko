import { prisma } from "@/lib/backend/db";

/**
 * Checks if a phone number is globally unique across Tenant, Staff, and PlatformUser tables.
 * Empty phones are ignored (assumed valid).
 * 
 * @param phone The phone number to check
 * @param currentId Optional ID of the document being edited to exclude it from uniqueness checks
 * @returns true if unique or empty, false if already in use by another record
 */
export async function isPhoneGloballyUnique(phone: string, currentId?: string): Promise<boolean> {
    if (!phone) return true;
    
    // Normalize phone (remove all whitespace)
    const normalizedPhone = phone.replace(/\s+/g, "");
    if (normalizedPhone === "") return true;
    
    // Ignore JSON payloads which are stored in the phone field for some roles
    if (normalizedPhone.startsWith("{") && normalizedPhone.endsWith("}")) return true;

    // Check Tenant - using Prisma ORM (PostgreSQL compatible)
    const tenantCount = await prisma.tenant.count({
        where: {
            phone: normalizedPhone,
            ...(currentId ? { NOT: { id: currentId } } : {}),
        },
    });
    if (tenantCount > 0) return false;

    // Check Staff - using Prisma ORM
    const staffCount = await prisma.staff.count({
        where: {
            phone: normalizedPhone,
            ...(currentId ? { NOT: { id: currentId } } : {}),
        },
    });
    if (staffCount > 0) return false;

    // Check PlatformUser - using Prisma ORM
    const platformUserCount = await prisma.platformUser.count({
        where: {
            phone: normalizedPhone,
            ...(currentId ? { NOT: { id: currentId } } : {}),
        },
    });
    if (platformUserCount > 0) return false;

    return true;
}

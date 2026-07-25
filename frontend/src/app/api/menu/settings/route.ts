import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/backend/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { id: session.tenantId },
            select: { id: true, shopCode: true, shopName: true, phone: true, settings: true }
        });

        if (!tenant) {
            return NextResponse.json({ error: "Muassasa topilmadi" }, { status: 404 });
        }

        let menuSettings = { logoUrl: "", phone: tenant.phone || "", instagram: "", telegram: "", themeColor: "#f97316" };
        try {
            if (tenant.settings) {
                const parsed = JSON.parse(tenant.settings);
                menuSettings = {
                    logoUrl: parsed.logoUrl || "",
                    phone: parsed.phone || tenant.phone || "",
                    instagram: parsed.instagram || "",
                    telegram: parsed.telegram || "",
                    themeColor: parsed.themeColor || "#f97316"
                };
            }
        } catch {}

        return NextResponse.json({
            success: true,
            tenant: {
                id: tenant.id,
                shopCode: tenant.shopCode,
                shopName: tenant.shopName,
                settings: menuSettings
            }
        });
    } catch (error: any) {
        console.error("Get menu settings error:", error);
        return NextResponse.json({ error: "Serverda xatolik yuz berdi" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
        }

        const body = await request.json();
        const { logoUrl, phone, instagram, telegram, themeColor } = body;

        const tenant = await prisma.tenant.findUnique({
            where: { id: session.tenantId }
        });

        if (!tenant) {
            return NextResponse.json({ error: "Muassasa topilmadi" }, { status: 404 });
        }

        let existingSettings: Record<string, any> = {};
        try {
            if (tenant.settings) {
                existingSettings = JSON.parse(tenant.settings);
            }
        } catch {}

        const updatedSettings = {
            ...existingSettings,
            logoUrl: logoUrl !== undefined ? logoUrl : (existingSettings.logoUrl || ""),
            phone: phone !== undefined ? phone : (existingSettings.phone || tenant.phone || ""),
            instagram: instagram !== undefined ? instagram : (existingSettings.instagram || ""),
            telegram: telegram !== undefined ? telegram : (existingSettings.telegram || ""),
            themeColor: themeColor !== undefined ? themeColor : (existingSettings.themeColor || "#f97316")
        };

        await prisma.tenant.update({
            where: { id: tenant.id },
            data: {
                settings: JSON.stringify(updatedSettings),
                phone: phone ? phone : tenant.phone
            }
        });

        return NextResponse.json({
            success: true,
            tenant: {
                shopCode: tenant.shopCode,
                shopName: tenant.shopName
            },
            settings: updatedSettings,
            message: "Menyu sozlamalari muvaffaqiyatli saqlandi!"
        });
    } catch (error: any) {
        console.error("Save menu settings error:", error);
        return NextResponse.json({ error: "Serverda xatolik yuz berdi" }, { status: 500 });
    }
}

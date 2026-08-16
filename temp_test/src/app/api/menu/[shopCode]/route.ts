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
            select: {
                id: true,
                shopCode: true,
                shopName: true,
                phone: true,
                address: true,
                settings: true
            }
        });

        if (!tenant) {
            return NextResponse.json({ error: "Muassasa topilmadi" }, { status: 404 });
        }

        // Fetch active products
        const products = await prisma.product.findMany({
            where: {
                tenantId: tenant.id
            },
            select: {
                id: true,
                name: true,
                category: true,
                sellingPrice: true,
                unit: true,
                image: true,
                type: true,
                inStock: true
            },
            orderBy: {
                name: "asc"
            }
        });

        // Extract unique categories
        const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

        // Fetch tables for this tenant
        const tables = await prisma.smartTable.findMany({
            where: { tenantId: tenant.id },
            select: {
                id: true,
                tableNumber: true,
                section: true
            },
            orderBy: {
                tableNumber: "asc"
            }
        });

        let menuSettings = { logoUrl: "", phone: tenant.phone || "", instagram: "", telegram: "", themeColor: "#f97316" };
        try {
            if (tenant.settings) {
                const parsed: any = typeof tenant.settings === "string" ? JSON.parse(tenant.settings) : (tenant.settings || {});
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
            tenant: {
                shopCode: tenant.shopCode,
                shopName: tenant.shopName,
                phone: menuSettings.phone || tenant.phone,
                address: tenant.address,
                settings: menuSettings
            },
            categories,
            products,
            tables
        });
    } catch (error: any) {
        console.error("Public menu fetch error:", error);
        return NextResponse.json({ error: "Serverda xatolik yuz berdi" }, { status: 500 });
    }
}

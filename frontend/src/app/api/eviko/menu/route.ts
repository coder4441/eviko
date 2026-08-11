export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/backend/db";
import { getSession } from "@/lib/backend/auth";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "@/lib/backend/jwt";

async function getAuthTenantId(request: NextRequest): Promise<string | null> {
    try {
        const cookieSession = await getSession();
        if (cookieSession?.tenantId) return cookieSession.tenantId;
    } catch {}

    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
        try {
            const { payload } = await jwtVerify(authHeader.slice(7), JWT_SECRET);
            if (payload.tenantId) return payload.tenantId as string;
        } catch {}
    }
    return null;
}

async function isProductInActiveOrder(tenantId: string, productName: string, productId?: string) {
    const occupiedTables = await prisma.smartTable.findMany({
        where: { tenantId, status: "occupied" },
        select: { id: true },
    });

    if (occupiedTables.length === 0) {
        const activeDeliveries = await prisma.deliveryOrder.findMany({
            where: { tenantId, status: { in: ["new", "assigned", "on_the_way"] } },
            select: { items: true },
        });
        for (const d of activeDeliveries) {
            if (d.items) {
                try {
                    const parsed = JSON.parse(d.items);
                    if (parsed.some((i: any) => i.name === productName || (productId && i.id === productId))) {
                        return true;
                    }
                } catch {}
            }
        }
        return false;
    }

    const occupiedTableIds = occupiedTables.map(t => t.id);

    const activeKdsOrders = await prisma.kDSOrder.findMany({
        where: {
            tenantId,
            tableId: { in: occupiedTableIds },
            status: { not: "served" },
        },
        select: { description: true },
    });

    for (const kds of activeKdsOrders) {
        if (kds.description) {
            try {
                const parsed = JSON.parse(kds.description);
                if (Array.isArray(parsed)) {
                    if (parsed.some((i: any) =>
                        (i.item?.name === productName) ||
                        (i.name === productName) ||
                        (productId && i.item?.id === productId) ||
                        (productId && i.id === productId)
                    )) {
                        return true;
                    }
                }
            } catch {
                if (kds.description.includes(productName)) return true;
            }
        }
    }

    const activeDeliveries = await prisma.deliveryOrder.findMany({
        where: { tenantId, status: { in: ["new", "assigned", "on_the_way"] } },
        select: { items: true },
    });
    for (const d of activeDeliveries) {
        if (d.items) {
            try {
                const parsed = JSON.parse(d.items);
                if (parsed.some((i: any) => i.name === productName || (productId && i.id === productId))) {
                    return true;
                }
            } catch {}
        }
    }

    return false;
}

export async function GET(request: NextRequest) {
    try {
        const tenantId = await getAuthTenantId(request);

        if (!tenantId) {
            return NextResponse.json({ categories: [], items: [], cancelCode: "" });
        }

        const returnAll = request.nextUrl.searchParams.get("all") === "1";

        let cancelCode = "";
        let blockSell = false;
        let paymentMethods: any[] = [];
        if (!returnAll) {
            const tObj = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
            if (tObj?.settings) {
                try {
                    const parsed = typeof tObj.settings === "string" ? JSON.parse(tObj.settings) : (tObj.settings || {});
                    if (parsed.cancelCode) cancelCode = parsed.cancelCode;
                    if (parsed.paymentMethods) paymentMethods = parsed.paymentMethods;
                    if (parsed.blockSell) blockSell = parsed.blockSell;
                } catch {}
            }
        }

        const products = await prisma.product.findMany({
            where: { tenantId },
            orderBy: [
                { category: 'asc' },
                { name: 'asc' }
            ]
        });

        let explicitCategories: any[] = [];
        try {
            explicitCategories = await prisma.ubtCategory.findMany({
                where: { tenantId },
                select: { id: true, name: true },
                orderBy: { createdAt: 'asc' }
            });
        } catch { }

        const productCategoryNames = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
        const stableId = (s: string) => s.split("").reduce((a, c) => ((a * 31 + c.charCodeAt(0)) & 0xfffffff), 5381).toString(36);
        
        const categoriesMap = new Map<string, { id: string; name: string }>();
        
        explicitCategories.forEach(c => categoriesMap.set(c.name, { id: c.id, name: c.name }));
        
        productCategoryNames.forEach((name: string) => {
            if (!categoriesMap.has(name)) {
                categoriesMap.set(name, { id: stableId(name), name });
            }
        });

        const categories = Array.from(categoriesMap.values());
        const catNameToId = Object.fromEntries(categories.map((c: any) => [c.name, c.id]));

        const items = products.map((p) => ({
            id: p.id,
            name: p.name,
            categoryId: catNameToId[p.category] ?? "0",
            price: Number(p.sellingPrice),
            cost: Number(p.costPrice),
            type: p.type || "taom",
            warehouse: p.warehouse || "",
            inStock: Number(p.inStock) !== 0,
            hasBarcode: Number(p.hasBarcode) !== 0,
            autoCalculate: Number(p.autoCalculate) !== 0,
            stock: Number(p.stock),
            unit: p.unit,
            image: p.image ?? null,
            printerIp: p.printerIp ?? null,
            isSetMenu: Number(p.isSetMenu) !== 0,
            modifiers: (() => { try { return p.modifiers ? (typeof p.modifiers === "string" ? JSON.parse(p.modifiers) : (p.modifiers as any)) : []; } catch { return []; } })(),
            recipes: (() => { try { return (p as any).recipes ? (typeof (p as any).recipes === "string" ? JSON.parse((p as any).recipes) : ((p as any).recipes as any)) : []; } catch { return []; } })(),
        }));

        if (returnAll) {
            return NextResponse.json({ categories, items, cancelCode: "", blockSell: false, paymentMethods: [] });
        }

        return NextResponse.json({ categories, items, cancelCode, blockSell, paymentMethods });
    } catch (error) {
        console.error("UBT menu GET error:", error);
        return NextResponse.json({ categories: [], items: [], error: String(error) });
    }
}

export async function POST(request: NextRequest) {
    try {
        const tenantId = await getAuthTenantId(request);
        if (!tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, category, sellingPrice, costPrice, type, warehouse, stock, unit, image, printerIp, isSetMenu, modifiers, recipes, inStock, hasBarcode, autoCalculate } = body;

        if (!name) return NextResponse.json({ error: "Nomi kiritilishi shart" }, { status: 400 });

        const catVal = category || "Umumiy";
        const sellPrice = Number(sellingPrice) || 0;
        const costPr = Number(costPrice) || 0;
        const stk = (stock !== undefined && stock !== null && stock !== "") ? Number(stock) : 0;
        const utStr = unit || "dona";
        const imgVal = image ?? null;
        const piVal = printerIp || null;
        const isSetMenuVal = isSetMenu ? 1 : 0;
        const inStockVal = (inStock === false || inStock === 0) ? 0 : 1;
        const hasBarcodeVal = hasBarcode ? 1 : 0;
        const autoCalculateVal = (autoCalculate === false || autoCalculate === 0) ? 0 : 1;
        const typeVal = (type === "mahsulot" ? "mahsulot" : "taom");
        const warehouseVal = warehouse || null;
        const modifiersVal = modifiers && Array.isArray(modifiers) && modifiers.length > 0 ? JSON.stringify(modifiers) : null;
        const recipesVal = recipes && Array.isArray(recipes) && recipes.length > 0 ? JSON.stringify(recipes) : null;

        let targetId = id;
        if (!targetId) {
            const existingByName = await prisma.product.findFirst({
                where: { tenantId, name }
            });
            if (existingByName) targetId = existingByName.id;
        }

        if (targetId) {
            const active = await isProductInActiveOrder(tenantId, name, targetId);
            if (active) {
                return NextResponse.json({ error: "Ushbu mahsulot ayni paytda faol zakazlar (band stollar yoki yetkazish) ichida mavjud! Mijoz to'lov qilmaguncha uni tahrirlash mumkin emas." }, { status: 400 });
            }

            await prisma.product.update({
                where: { id: targetId },
                data: {
                    name, 
                    category: catVal, 
                    sellingPrice: sellPrice, 
                    costPrice: costPr, 
                    type: typeVal, 
                    warehouse: warehouseVal, 
                    stock: stk, 
                    unit: utStr, 
                    image: imgVal, 
                    printerIp: piVal, 
                    isSetMenu: isSetMenuVal, 
                    modifiers: modifiersVal, 
                    recipes: recipesVal, 
                    inStock: inStockVal, 
                    hasBarcode: hasBarcodeVal, 
                    autoCalculate: autoCalculateVal
                }
            });
            return NextResponse.json({ success: true, action: "updated", id: targetId });
        } else {
            const newId = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            await prisma.product.create({
                data: {
                    id: newId, 
                    tenantId, 
                    name, 
                    category: catVal, 
                    sellingPrice: sellPrice, 
                    costPrice: costPr, 
                    type: typeVal, 
                    warehouse: warehouseVal, 
                    stock: stk, 
                    minStock: 10,
                    unit: utStr, 
                    image: imgVal, 
                    printerIp: piVal, 
                    isSetMenu: isSetMenuVal, 
                    modifiers: modifiersVal, 
                    recipes: recipesVal, 
                    inStock: inStockVal, 
                    hasBarcode: hasBarcodeVal, 
                    autoCalculate: autoCalculateVal
                }
            });
            return NextResponse.json({ success: true, action: "created", id: newId }, { status: 201 });
        }
    } catch (error) {
        console.error("UBT menu POST error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const tenantId = await getAuthTenantId(request);
        if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { id, name } = body;

        if (id) {
            const existing = await prisma.product.findFirst({
                where: { id, tenantId },
                select: { name: true }
            });
            if (existing) {
                const active = await isProductInActiveOrder(tenantId, existing.name, id);
                if (active) return NextResponse.json({ error: "Faol zakazda bo'lgan mahsulotni o'chirish mumkin emas, mijoz oldin to'lov qilishi kerak!" }, { status: 400 });
            }
            await prisma.product.deleteMany({
                where: { id, tenantId }
            });
        } else if (name) {
            const active = await isProductInActiveOrder(tenantId, name);
            if (active) return NextResponse.json({ error: "Faol zakazda bo'lgan mahsulotni o'chirish mumkin emas, mijoz oldin to'lov qilishi kerak!" }, { status: 400 });
            await prisma.product.deleteMany({
                where: { name, tenantId }
            });
        } else {
            return NextResponse.json({ error: "ID yoki nom kiritilmagan" }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

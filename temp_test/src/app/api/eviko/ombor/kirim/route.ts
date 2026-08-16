export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/backend/db";
import { getSession } from "@/lib/backend/auth";



// ─── Helper: get usdRate for tenant ──────────────────────────────────────────
async function getUsdRate(tenantId: string): Promise<number> {
    try {
        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        if (tenant?.settings) {
            const s = JSON.parse((tenant.settings) as string);
            if (s.usdRate) return Number(s.usdRate);
        }
    } catch {}
    return 12500;
}

function toUzs(amount: number, currency: string, usdRate: number): number {
    if (currency === "USD") return amount * usdRate;
    if (currency === "EUR") return amount * usdRate * 1.08;
    return amount;
}

// ─── GET: Return receipts grouped by documentId ───────────────────────────────
export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch all rows with extra columns
        // Fetch all rows with extra columns using ORM
        const rows = await prisma.inventoryReceipt.findMany({
            where: { tenantId: session.tenantId },
            include: { product: true },
            orderBy: { createdAt: 'desc' }
        });

        // Group by documentId (fall back to id if no documentId)
        const docsMap = new Map<string, any>();
        for (const r of rows) {
            const docKey = r.documentId || r.id;
            if (!docsMap.has(docKey)) {
                docsMap.set(docKey, {
                    id: docKey,
                    documentId: docKey,
                    invoiceNo: r.invoiceNo,
                    supplier: r.supplier,
                    warehouse: r.warehouse,
                    currency: r.currency || "UZS",
                    notes: r.notes,
                    status: r.status,
                    createdAt: r.createdAt,
                    items: [],
                    totalCost: 0,
                    totalCostUzs: 0,
                    totalQuantity: 0,
                });
            }
            const doc = docsMap.get(docKey);
            doc.items.push({
                id: r.id,
                productId: r.productId,
                productName: r.productName,
                quantity: Number(r.quantity),
                unit: r.unit,
                costPrice: Number(r.costPrice),
                costPriceUzs: Number(r.costPriceUzs || 0),
                totalCost: Number(r.totalCost),
                totalCostUzs: Number(r.totalCostUzs || 0),
            });
            doc.totalCost += Number(r.totalCost || 0);
            doc.totalCostUzs += Number(r.totalCostUzs || r.totalCost || 0);
            doc.totalQuantity += Number(r.quantity || 0);
        }

        return NextResponse.json(Array.from(docsMap.values()));
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Xatolik yuz berdi" }, { status: 500 });
    }
}

// ─── POST: Create grouped kirim document ──────────────────────────────────────
export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { date, supplier, warehouse, notes, status, currency, invoiceNo, items } = body;

        // Get usdRate for currency conversion
        const usdRate = await getUsdRate(session.tenantId);

        // Generate ONE documentId for all items in this batch
        const documentId = Math.random().toString(36).slice(2, 14) + Date.now().toString(36);

        const createdReceipts: any[] = [];

        for (const item of items) {
            let pId = item.productId;
            let pName = item.productName || "Noma'lum";
            let pUnit = item.unit || "dona";
            const qty = Number(item.quantity) || 0;
            const cost = Number(item.costPrice) || 0;
            const costUzs = toUzs(cost, currency || "UZS", usdRate);
            const totalUzs = qty * costUzs;
            const pType = item.productType || "";

            if (pId) {
                // Mahsulot (Product jadvali)
                if (pType === "mahsulot" || pType === "taom" || !pType) {
                    const existingProduct = await prisma.product.findUnique({
                        where: { id: pId, tenantId: session.tenantId }
                    });
                    if (existingProduct && status === 'accepted') {
                        pName = existingProduct.name;
                        pUnit = existingProduct.unit;
                        await prisma.product.update({
                            where: { id: pId },
                            data: {
                                stock: existingProduct.stock + qty,
                                costPrice: costUzs  // UZS ga o'tkazilgan narx
                            }
                        });
                    }
                }

                // Xomashyo / Polfabrikat
                if (pType === "xomashyo" || pType === "polfabrikat") {
                    try {
                        const ing = await prisma.ubtIngredient.findFirst({
                            where: { id: pId, tenantId: session.tenantId }
                        });
                        if (ing && status === 'accepted') {
                            pName = ing.name;
                            pUnit = ing.unit;
                            const newStock = Number(ing.stock || 0) + qty;
                            await prisma.ubtIngredient.update({
                                where: { id: pId },
                                data: { stock: newStock, price: costUzs }
                            });
                        }
                    } catch (e) {
                        console.error("UbtIngredient stock update error:", e);
                    }
                }
            }

            const receiptProductId = (pType === "xomashyo" || pType === "polfabrikat") ? null : pId;

            const receipt = await prisma.inventoryReceipt.create({
                data: {
                    tenantId: session.tenantId,
                    date: new Date(date || Date.now()),
                    supplier: supplier || "Noma'lum",
                    productId: receiptProductId,
                    productName: pName,
                    quantity: qty,
                    unit: pUnit,
                    costPrice: cost,       // Original valyutada
                    totalCost: qty * cost, // Original valyutada
                    warehouse: warehouse || "Asosiy Ombor",
                    notes: notes || null,
                    status: status || "accepted",
                    registeredAt: new Date(),
                    acceptedAt: status === 'accepted' ? new Date() : null,
                    currency: currency || "UZS",
                    invoiceNo: invoiceNo || null,
                    documentId: documentId,
                    costPriceUzs: costUzs,
                    totalCostUzs: totalUzs
                }
            });

            createdReceipts.push({ ...receipt, costPriceUzs: costUzs, totalCostUzs: totalUzs });
        }

        // Auto-generate Moliya Expense — UZS da saqlash
        if (status === "accepted") {
            const totalUzsAll = createdReceipts.reduce((sum, r) => sum + (r.totalCostUzs || 0), 0);
            if (totalUzsAll > 0) {
                const kh = await prisma.kassiHarakat.create({
                    data: {
                        tenantId: session.tenantId,
                        type: "expense",
                        category: "Bozor-ochar (xomashyo)",
                        amount: totalUzsAll,
                        description: `Ombor kirimi (${currency || "UZS"}, kurs: ${usdRate}) — ${supplier || "Noma'lum"}`,
                        paymentMethod: "Naqd pul",
                        date: new Date(date || Date.now()),
                        createdBy: session.userId || "System",
                        kontragent: supplier || null,
                        refId: documentId
                    }
                });
            }
        }

        await prisma.auditLog.create({
            data: {
                tenantId: session.tenantId,
                user: session.userId,
                action: "INVENTORY_RECEIPT_CREATED",
                detail: `${createdReceipts.length} ta mahsulot qabul qilindi. Valyuta: ${currency || "UZS"}`,
                type: "create"
            }
        });

        return NextResponse.json({ success: true, documentId, count: createdReceipts.length });
    } catch (e: any) {
        console.error("Kirim Error:", e);
        return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
    }
}

// ─── DELETE: Rollback stock + expense + delete receipts ──────────────────────
export async function DELETE(req: Request) {
    try {
        const session = await getSession();
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const documentId: string = body.documentId;
        if (!documentId) return NextResponse.json({ error: "documentId majburiy" }, { status: 400 });

        // 1️⃣ Get all items of this document (with productType from notes)
        const rows = await prisma.inventoryReceipt.findMany({
            where: { documentId, tenantId: session.tenantId }
        });

        if (!rows.length) {
            return NextResponse.json({ error: "Hujjat topilmadi" }, { status: 404 });
        }

        const wasAccepted = rows[0]?.status === "accepted";

        // 2️⃣ Rollback STOCK — only if status was accepted
        if (wasAccepted) {
            for (const row of rows) {
                const qty = Number(row.quantity || 0);
                const notes: string = row.notes || "";
                // productType ni notes ichidan o'qiymiz (Tur: xomashyo)
                const typeMatch = notes.match(/Tur:\s*(\S+)/);
                const pType = typeMatch ? typeMatch[1] : "";
                const pId = row.productId;

                if (!pId && !pType) continue;

                if (pType === "xomashyo" || pType === "polfabrikat") {
                    // UbtIngredient stock kamaytirish
                    try {
                        const ing = await prisma.ubtIngredient.findFirst({
                            where: { 
                                id: pId || row.productName,
                                tenantId: session.tenantId 
                            }
                        });
                        if (ing) {
                            const newStock = Math.max(0, Number(ing.stock || 0) - qty);
                            await prisma.ubtIngredient.update({
                                where: { id: ing.id },
                                data: { stock: newStock }
                            });
                        }
                    } catch (e) { console.error("Ingredient rollback error:", e); }
                } else if (pId) {
                    // Product stock kamaytirish
                    try {
                        const product = await prisma.product.findUnique({
                            where: { id: pId, tenantId: session.tenantId }
                        });
                        if (product) {
                            await prisma.product.update({
                                where: { id: pId },
                                data: { stock: Math.max(0, product.stock - qty) }
                            });
                        }
                    } catch (e) { console.error("Product rollback error:", e); }
                }
            }
        }

        // 3️⃣ Rollback EXPENSE (KassiHarakat)
        const khRows = await prisma.kassiHarakat.findMany({
            where: { refId: documentId, tenantId: session.tenantId },
            select: { id: true }
        });
        for (const kh of khRows) {
            await prisma.kassiHarakat.delete({ where: { id: kh.id } });
        }

        // 4️⃣ Delete InventoryReceipt rows
        for (const row of rows) {
            await prisma.inventoryReceipt.delete({ where: { id: row.id } });
        }

        // 5️⃣ Audit log
        await prisma.auditLog.create({
            data: {
                tenantId: session.tenantId,
                user: session.userId,
                action: "INVENTORY_RECEIPT_DELETED",
                detail: `Hujjat o'chirildi. ${rows.length} ta mahsulot stock orqaga qaytarildi. documentId: ${documentId}`,
                type: "delete"
            }
        });

        return NextResponse.json({
            success: true,
            deleted: rows.length,
            stockRolledBack: wasAccepted,
            expenseDeleted: khRows.length
        });
    } catch (e: any) {
        console.error("Kirim DELETE error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}


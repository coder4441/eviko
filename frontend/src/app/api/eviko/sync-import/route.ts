/**
 * /api/eviko/sync-import — Eksport qilingan ma'lumotni LOKAL pos.db ga yozadi.
 *
 * EXE (agent) online paytda VPS dan /api/eviko/sync-export ni olib, uni shu yerga
 * (lokal server, 127.0.0.1) POST qiladi. Offline'ga o'tganda ma'lumot tayyor turadi.
 *
 * UPSERT ishlatamiz (delete emas) — offline buyurtmalar (KDSOrder/Transaction) ga
 * tegmaydi, faqat ma'lumotnoma (Tenant/Staff/Product/Category/Table/Printer) yangilanadi.
 */
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/backend/db";

async function upsertAll(model: any, rows: any[]): Promise<number> {
    if (!Array.isArray(rows)) return 0;
    let n = 0;
    for (const row of rows) {
        if (!row || !row.id) continue;
        const { id, ...rest } = row;
        try {
            await model.upsert({ where: { id }, create: row, update: rest });
            n++;
        } catch (e: any) {
            console.warn("[sync-import] upsert xato:", e?.message);
        }
    }
    return n;
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        if (!data || !data.tenantId) return NextResponse.json({ error: "tenantId yo'q" }, { status: 400 });

        // Tenant (bitta)
        if (data.tenant && data.tenant.id) {
            const { id, ...rest } = data.tenant;
            try { await prisma.tenant.upsert({ where: { id }, create: data.tenant, update: rest }); } catch (e: any) { console.warn("[sync-import] tenant:", e?.message); }
        }

        // Kategoriyalar UbtCategory — Prisma ORM bilan upsert
        let categoriesCount = 0;
        if (Array.isArray(data.categories)) {
            try {
                for (const c of data.categories) {
                    if (!c || !c.id) continue;
                    try {
                        await prisma.ubtCategory.upsert({
                            where: { id: c.id },
                            create: {
                                id: c.id,
                                tenantId: c.tenantId || data.tenantId,
                                name: c.name || "",
                                type: c.type || "taom",
                                itemCount: c.itemCount || 0,
                            },
                            update: {
                                name: c.name || "",
                                type: c.type || "taom",
                                itemCount: c.itemCount || 0,
                            }
                        });
                        categoriesCount++;
                    } catch (e: any) { console.warn("[sync-import] category upsert:", e?.message); }
                }
            } catch (e: any) { console.warn("[sync-import] categories:", e?.message); }
        }

        const counts = {
            staff: await upsertAll(prisma.staff, data.staff),
            products: await upsertAll(prisma.product, data.products),
            categories: categoriesCount,
            tables: await upsertAll(prisma.smartTable, data.tables),
            printers: await upsertAll(prisma.smartPrinter, data.printers),
        };

        return NextResponse.json({ ok: true, importedAt: Date.now(), counts });
    } catch (e: any) {
        console.error("[sync-import]", e);
        return NextResponse.json({ error: e?.message || "Server xatosi" }, { status: 500 });
    }
}

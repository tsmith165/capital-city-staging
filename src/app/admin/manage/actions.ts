import { eq, asc, desc } from 'drizzle-orm';
import { db, inventoryTable } from '@/db/db';
import { Inventory } from '@/db/schema';
import { revalidatePath } from 'next/cache';

export async function getInventory(): Promise<Inventory[]> {
    return await db.select().from(inventoryTable).orderBy(asc(inventoryTable.o_id));
}

export async function changeOrder(currIdList: number[], nextIdList: number[]): Promise<void> {
    const [currId, currOrderId] = currIdList;
    const [nextId, nextOrderId] = nextIdList;
    console.log(`Swapping ${currId} (${currOrderId}) with ${nextId} (${nextOrderId})`);

    await db.update(inventoryTable).set({ o_id: nextOrderId }).where(eq(inventoryTable.id, currId));
    await db.update(inventoryTable).set({ o_id: currOrderId }).where(eq(inventoryTable.id, nextId));

    revalidatePath(`/admin/manage`);
    revalidatePath(`/admin/inventory`);
}

// File: /src/app/admin/manage/actions.ts

import { eq, asc, desc } from 'drizzle-orm';
import { db, inventoryTable } from '@/db/db';
import { Inventory } from '@/db/schema';
import { revalidatePath } from 'next/cache';

export async function getInventory(): Promise<Inventory[]> {
    return await db.select().from(inventoryTable).where(eq(inventoryTable.active, true)).orderBy(asc(inventoryTable.o_id));
}

export async function getPrioritizedInventory(): Promise<Inventory[]> {
    return await db.select().from(inventoryTable).where(eq(inventoryTable.active, true)).orderBy(desc(inventoryTable.p_id));
}

export async function getArchivedInventory(): Promise<Inventory[]> {
    return await db.select().from(inventoryTable).where(eq(inventoryTable.active, false)).orderBy(asc(inventoryTable.o_id));
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

export async function changePriority(currIdList: number[], nextIdList: number[]): Promise<void> {
    const [currId, currPriorityId] = currIdList;
    const [nextId, nextPriorityId] = nextIdList;
    console.log(`Swapping priority ${currId} (${currPriorityId}) with ${nextId} (${nextPriorityId})`);

    await db.update(inventoryTable).set({ p_id: nextPriorityId }).where(eq(inventoryTable.id, currId));
    await db.update(inventoryTable).set({ p_id: currPriorityId }).where(eq(inventoryTable.id, nextId));
    revalidatePath(`/admin/manage`);
    revalidatePath(`/admin/inventory`);
}

export async function setInactive(id: number): Promise<void> {
    console.log(`Setting item with id: ${id} as inactive`);
    await db.update(inventoryTable).set({ active: false, o_id: -1000000 }).where(eq(inventoryTable.id, id));
    revalidatePath(`/admin/manage`);
    revalidatePath(`/admin/inventory`);
}

export async function setActive(id: number): Promise<void> {
    console.log(`Setting item with id: ${id} as active`);

    const lastItem = await db.select().from(inventoryTable).orderBy(desc(inventoryTable.o_id)).limit(1);
    const newOId = lastItem.length > 0 ? lastItem[0].o_id + 1 : 1;

    await db.update(inventoryTable).set({ active: true, o_id: newOId }).where(eq(inventoryTable.id, id));
    revalidatePath(`/admin/manage`);
    revalidatePath(`/admin/inventory`);
}
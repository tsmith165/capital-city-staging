'use server';

import { eq, desc, asc, gt, lt, and, inArray } from 'drizzle-orm';
import { db, inventoryTable, extraImagesTable } from '@/db/db';
import { InventoryWithImages, ExtraImages } from '@/db/schema';

export async function fetchInventory(): Promise<InventoryWithImages[]> {
    console.log(`Fetching inventory with Drizzle`);
    const inventoryWithImages = await db
        .select({
            inventory: inventoryTable,
            extraImages: extraImagesTable,
        })
        .from(inventoryTable)
        .where(eq(inventoryTable.active, true))
        .leftJoin(extraImagesTable, eq(extraImagesTable.inventory_id, inventoryTable.id))
        .orderBy(desc(inventoryTable.o_id));

    console.log(`Captured inventory successfully`);

    const formattedInventory = inventoryWithImages.reduce<InventoryWithImages[]>((acc, curr) => {
        const inventory = curr.inventory;
        const extraImage = curr.extraImages;

        const existingInventory = acc.find((p) => p.id === inventory.id);

        if (existingInventory) {
            if (extraImage) {
                existingInventory.extraImages.push(extraImage);
            }
        } else {
            acc.push({
                ...inventory,
                extraImages: extraImage ? [extraImage] : [],
            });
        }

        return acc;
    }, []);

    return formattedInventory;
}

export async function fetchInventoryIds(): Promise<number[]> {
    const inventoryList = await db.select({ id: inventoryTable.id }).from(inventoryTable);
    return inventoryList.map((inventory) => inventory.id);
}

export async function fetchInventoryById(id: number) {
    const inventory = await db.select().from(inventoryTable).where(eq(inventoryTable.id, id)).execute();
    const extraImages = await db
        .select()
        .from(extraImagesTable)
        .where(eq(extraImagesTable.inventory_id, id))
        .orderBy(asc(extraImagesTable.id))
        .execute();

    const inventoryData = {
        ...inventory[0],
        extraImages,
    };

    return inventoryData;
}

export async function fetchInventoryByIds(ids: number[]) {
    const inventoryItems = await db.select().from(inventoryTable).where(inArray(inventoryTable.id, ids)).execute();
    const inventoryWithImages = await Promise.all(
        inventoryItems.map(async (inventory) => {
            const extraImages = await db
                .select()
                .from(extraImagesTable)
                .where(eq(extraImagesTable.inventory_id, inventory.id))
                .orderBy(asc(extraImagesTable.id))
                .execute();

            return {
                ...inventory,
                extraImages,
            };
        }),
    );

    return inventoryWithImages;
}

export async function fetchAdjacentInventoryIds(currentId: number) {
    console.log(`Fetching adjacent inventory IDs for inventory ID: ${currentId}`);
    const currentInventory = await db.select().from(inventoryTable).where(eq(inventoryTable.id, currentId)).limit(1);

    if (currentInventory.length === 0) {
        return { next_id: -1, last_id: -1 };
    }

    const currentOId = currentInventory[0].o_id;

    // Fetch the next inventory by o_id
    const nextInventory = await db
        .select()
        .from(inventoryTable)
        .where(gt(inventoryTable.o_id, currentOId))
        .orderBy(asc(inventoryTable.o_id))
        .limit(1);

    // Fetch the last inventory by o_id
    const lastInventory = await db
        .select()
        .from(inventoryTable)
        .where(lt(inventoryTable.o_id, currentOId))
        .orderBy(desc(inventoryTable.o_id))
        .limit(1);

    // Fetch the inventory with the minimum o_id
    const firstInventory = await db.select().from(inventoryTable).orderBy(asc(inventoryTable.o_id)).limit(1);

    // Fetch the inventory with the maximum o_id
    const maxOIdInventory = await db.select().from(inventoryTable).orderBy(desc(inventoryTable.o_id)).limit(1);

    const next_id = nextInventory.length > 0 ? nextInventory[0].id : firstInventory[0].id;
    const last_id = lastInventory.length > 0 ? lastInventory[0].id : maxOIdInventory[0].id;

    console.log(`Found next_id: ${next_id} and last_id: ${last_id}`);

    return { next_id, last_id };
}

export async function getMostRecentId(): Promise<number | null> {
    console.log('Fetching most recent inventory ID...');
    const inventory = await db
        .select()
        .from(inventoryTable)
        .orderBy(desc(inventoryTable.o_id))
        .limit(1);

    return inventory[0]?.id || null;
}

export async function fetchInventoryImageById(id: number) {
    const inventory = await db
        .select({
            image_path: inventoryTable.image_path,
            width: inventoryTable.width,
            height: inventoryTable.height,
        })
        .from(inventoryTable)
        .where(eq(inventoryTable.id, id))
        .execute();

    return inventory[0] || null;
}

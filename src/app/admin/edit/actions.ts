'use server';
import { auth } from '@clerk/nextjs/server';
import { db, inventoryTable, extraImagesTable } from '@/db/db';
import { Inventory } from '@/db/schema';

import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';


async function checkUserRole(): Promise<{ isAdmin: boolean; error?: string | undefined; }> {
    const { userId } = auth();
    if (!userId) {
        return { isAdmin: false, error: 'User is not authenticated. Cannot edit piece.' };
    }
    console.log(`User ID: ${userId}`);
    const hasAdminRole = await isClerkUserIdAdmin(userId);
    console.log(`User hasAdminRole: ${hasAdminRole}`);
    if (!hasAdminRole) {
        return { isAdmin: false, error: 'User does not have the admin role. Cannot edit piece.' };
    }
    return { isAdmin: true };
}

interface SubmitFormData {
    inventory_id: string;
    inventory_name: string;
    description: string;
    category: string;
    vendor: string;
    price: string;
    real_width: string;
    real_height: string;
    real_depth: string;
    location: string;
    count: string;
    image_path: string;
    width: string;
    height: string;
}

export async function onSubmitEditForm(data: SubmitFormData): Promise<{ success: boolean; error?: string }> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return { success: false, error: roleError };
    }

    try {
        console.log('Form Data (Next Line):');
        console.log(data);

        if (!data.inventory_name) {
            console.error('Name is required');
            return { success: false, error: 'Name is required' };
        }

        if (data.inventory_id) {
            // Update existing inventory
            await db
                .update(inventoryTable)
                .set({
                    name: data.inventory_name?.toString(),
                    description: data.description || '',
                    category: data.category || '',
                    vendor: data.vendor || '',
                    price: parseInt(data.price || '0'),
                    real_width: parseInt(data.real_width || '0'),
                    real_height: parseInt(data.real_height || '0'),
                    real_depth: parseInt(data.real_depth || '0'),
                    location: data.location || '',
                    count: parseInt(data.count || '0'),
                    image_path: data.image_path || '',
                    width: parseInt(data.width || '0'),
                    height: parseInt(data.height || '0'),
                })
                .where(eq(inventoryTable.id, parseInt(data.inventory_id)));
        } else {
            console.log("Couldn't find inventory with id " + data.inventory_id);
            console.log("Skipping inventory creation");
            return { success: false, error: 'Could not find inventory with id ' + data.inventory_id };
        }
        revalidatePath(`/admin/edit/${data.inventory_id}`);
        return { success: true };
    } catch (error) {
        console.error('Error creating inventory:', error);
        return { success: false, error: 'Error creating inventory' };
    }
}

interface UploadFormData {
    inventory_id: string;
    image_path: string;
    width: string;
    height: string;
    small_image_path: string;
    small_width: string;
    small_height: string;
    title: string | null;
    inventory_type: string;
}

export async function storeUploadedImageDetails(data: UploadFormData): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return { success: false, error: roleError };
    }
    console.log('Uploading Image...');
    try {
        const inventoryId = parseInt(data.inventory_id?.toString() || '0');
        const imageUrl = data.image_path?.toString() || '';
        const width = parseInt(data.width?.toString() || '0');
        const height = parseInt(data.height?.toString() || '0');
        const title = data.title;
        const imageType = data.inventory_type?.toString() || '';
        const smallImageUrl = data.small_image_path?.toString() || '';
        const smallWidth = parseInt(data.small_width?.toString() || '0');
        const smallHeight = parseInt(data.small_height?.toString() || '0');

        const inventory = await db.select().from(inventoryTable).where(eq(inventoryTable.id, inventoryId)).limit(1);
        if (!inventory.length) {
            console.error(`Inventory with id ${inventoryId} not found`);
            return { success: false, error: `Inventory with id ${inventoryId} not found` };
        }

        if (imageType === 'main') {
            console.log('Modifying main image');
            await db
                .update(inventoryTable)
                .set({
                    image_path: imageUrl,
                    width: width,
                    height: height,
                    small_image_path: smallImageUrl,
                    small_width: smallWidth,
                    small_height: smallHeight,
                })
                .where(eq(inventoryTable.id, inventoryId));
        } else {
            if (imageType === 'extra') {
                console.log('Adding extra image');
                await db.insert(extraImagesTable).values({
                    inventory_id: inventoryId,
                    image_path: imageUrl,
                    title: title,
                    width: width,
                    height: height,
                    small_image_path: smallImageUrl,
                    small_width: smallWidth,
                    small_height: smallHeight,
                });
            }
        }
        revalidatePath(`/admin/edit/${inventory[0].id}`);
        return { success: true, imageUrl: imageUrl };
    } catch (error) {
        console.error('Error creating inventory:', error);
        return { success: false, error: 'Error creating inventory' };
    }
}

export async function handleImageReorder(inventoryId: number, currentInventoryId: number, targetInventoryId: number): Promise<{ success: boolean; error?: string }> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return { success: false, error: roleError };
    }

    try {
        const currentImage = await db.select().from(extraImagesTable).where(eq(extraImagesTable.id, currentInventoryId)).limit(1);
        const targetImage = await db.select().from(extraImagesTable).where(eq(extraImagesTable.id, targetInventoryId)).limit(1);

        if (currentImage.length === 0 || targetImage.length === 0) {
            console.error(`No images found for reordering`);
            return { success: false, error: `No images found for reordering` };
        }

        console.log(`Setting image path for ${currentInventoryId} to ${targetImage[0].image_path}`);
        await db.update(extraImagesTable).set({ image_path: targetImage[0].image_path }).where(eq(extraImagesTable.id, currentInventoryId));

        console.log(`Setting image path for ${targetInventoryId} to ${currentImage[0].image_path}`);
        await db.update(extraImagesTable).set({ image_path: currentImage[0].image_path }).where(eq(extraImagesTable.id, targetInventoryId));

        // Revalidate the path to refetch the data
        revalidatePath(`/admin/edit/${inventoryId}`);
        return { success: true };
    } catch (error) {
        console.error('Error reordering images:', error);
        return { success: false, error: 'Error reordering images' };
    }
}

export async function handleImageTitleEdit(imageId: number, newTitle: string): Promise<{ success: boolean; error?: string }> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return { success: false, error: roleError };
    }

    try {
        await db.update(extraImagesTable).set({ title: newTitle }).where(eq(extraImagesTable.id, imageId));
        revalidatePath(`/admin/edit/${imageId}`);
        return { success: true };
    } catch (error) {
        console.error('Error editing image title:', error);
        return { success: false, error: 'Error editing image title' };
    }
}

export async function handleImageDelete(inventoryId: number, imagePath: string): Promise<{ success: boolean; error?: string }> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return { success: false, error: roleError };
    }
    try {
        await db.delete(extraImagesTable).where(and(eq(extraImagesTable.inventory_id, inventoryId), eq(extraImagesTable.image_path, imagePath)));
        revalidatePath(`/admin/edit/${inventoryId}`);
        return { success: true };
    } catch (error) {
        console.error('Error deleting image:', error);
        return { success: false, error: 'Error deleting image' };
    }
}

export async function handleTitleUpdate(formData: FormData): Promise<{ success: boolean; error?: string }> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return { success: false, error: roleError };
    }

    try {
        const inventoryId = Number(formData.get('inventoryId'));
        const newTitle = formData.get('newTitle')?.toString();

        if (!inventoryId || !newTitle) {
            console.error('Required form data missing. Cannot update title.');
            return { success: false, error: 'Required form data missing. Cannot update title.' };
        }

        await db.update(inventoryTable).set({ name: newTitle }).where(eq(inventoryTable.id, inventoryId));
        revalidatePath(`/admin/edit/${inventoryId}`);
        return { success: true };
    } catch (error) {
        console.error('Error updating title:', error);
        return { success: false, error: 'Error updating title' };
    }
}

async function getMostRecentId() {
    const lastInventory = await db.select({ o_id: inventoryTable.o_id }).from(inventoryTable).orderBy(desc(inventoryTable.o_id)).limit(1);
    return lastInventory.length > 0 ? lastInventory[0].o_id : null;
}

interface NewInventoryData {
    name: string;
    imagePath: string;
    width: number;
    height: number;
    smallImagePath: string;
    smallWidth: number;
    smallHeight: number;
}

export async function createInventory(newInventoryData: NewInventoryData): Promise<{ success: boolean; inventory?: Inventory; error?: string }> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return { success: false, error: roleError };
    }

    try {
        const { name, imagePath, width, height, smallImagePath, smallWidth, smallHeight } = newInventoryData;

        const maxOId = await getMostRecentId();
        console.log('Max OId:', maxOId);
        const newOId = maxOId ? maxOId + 1 : 1;
        console.log('New OId:', newOId);

        const data = {
            name: name,
            image_path: imagePath,
            width: width,
            height: height,
            small_image_path: smallImagePath,
            small_width: smallWidth,
            small_height: smallHeight,
            description: '',
            category: '',
            vendor: '',
            price: 0,
            real_width: 0,
            real_height: 0,
            real_depth: 0,
            location: '',
            count: 0,
            o_id: newOId,
        };
        console.log('New Inventory Data:', data);

        const newInventory = await db.insert(inventoryTable).values(data).returning();
        return { success: true, inventory: newInventory[0] };
    } catch (error) {
        console.error('Error creating inventory:', error);
        return { success: false, error: 'Error creating inventory' };
    }
}

import { redirect } from 'next/navigation';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';

export async function createNewInventory(newInventoryData: NewInventoryData) {
    console.log('Creating new inventory:', newInventoryData);
    const newInventoryOutput = await createInventory(newInventoryData);

    if (!newInventoryOutput.success) {
        console.error('Error creating new piece:', newInventoryOutput.error);
        return { success: false, error: 'Error creating new piece.' };
    }
    if (!newInventoryOutput.inventory) {
        console.error('No piece returned from createPiece:', newInventoryOutput.error);
        return { success: false, error: 'Error creating new piece.' };
    }

    revalidatePath('/admin/edit');
    redirect(`/admin/edit/${newInventoryOutput.inventory.id}`);
}


'use server';

import { auth } from '@clerk/nextjs/server';
import { db, inventoryTable, extraImagesTable } from '@/db/db';
import { eq, isNull } from 'drizzle-orm';
import { createSmallerImage } from '@/utils/uploads/imageUtils';
import { Buffer } from 'buffer';
import { utapi } from '@/server/uploadthing';
import sharp from 'sharp';

import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { Inventory, InventoryWithImages, ExtraImages } from '@/db/schema';

const f = createUploadthing();

const ourFileRouter = {
    imageUploader: f({ image: { maxFileSize: '4MB' } }).onUploadComplete(async ({ file }) => {
        console.log('file url', file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

function checkUserRole(): { isAdmin: boolean; error?: string } {
    const { orgRole } = auth();
    console.log(`User organization Role: ${orgRole}`);
    const isAdmin = orgRole === 'ADMIN';
    if (!isAdmin) {
        return { isAdmin: false, error: 'User does not have the "ADMIN" role. Cannot edit piece.' };
    }
    return { isAdmin: true };
}

export async function generateMissingSmallImages(
    progressCallback?: (piece: any, current: number, total: number) => Promise<boolean>,
): Promise<{
    success: boolean;
    updatedPeces?: { updatedPieces: number; updatedExtraImages: number; updatedProgressImages: number };
    error?: string;
}> {
    const { isAdmin, error: roleError } = checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return { success: false, error: roleError };
    }

    try {
        const piecesWithoutSmallImages = await db.select().from(inventoryTable).where(isNull(inventoryTable.small_image_path)).execute();
        const extraImagesWithoutSmallImages = await db
            .select()
            .from(extraImagesTable)
            .where(isNull(extraImagesTable.small_image_path))
            .execute();

        const allImages = [...piecesWithoutSmallImages, ...extraImagesWithoutSmallImages];
        let updatedPieces = 0;
        let updatedExtraImages = 0;
        let updatedProgressImages = 0;

        const updateImage = async (
            image: any,
            table: typeof inventoryTable | typeof extraImagesTable,
            index: number,
        ) => {
            if (!image.image_path) return;

            if (progressCallback) {
                const shouldStop = await progressCallback(image, index + 1, allImages.length);
                if (shouldStop) return;
            }

            const response = await fetch(image.image_path);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Resize the image
            const resizedImage = await createSmallerImage(buffer, 450);
            const resizedBuffer = await resizedImage.toBuffer();

            // Create a File-like object
            const file: FileEsque = new Blob([resizedBuffer], { type: 'image/jpeg' }) as FileEsque;
            file.name = `small_${image.id}.jpg`;

            // Upload the resized image using UploadThing
            const uploadResult = (await utapi.uploadFiles(file)) as UploadFileResponse;

            if ('error' in uploadResult && uploadResult.error) {
                throw new Error(`Failed to upload small image: ${uploadResult.error.message}`);
            }

            const uploadedFile = uploadResult.data;

            if (!uploadedFile) {
                throw new Error('Upload succeeded but no file data returned');
            }

            const metadata = await resizedImage.metadata();

            await db
                .update(table)
                .set({
                    small_image_path: uploadedFile.url,
                    small_width: metadata.width,
                    small_height: metadata.height,
                })
                .where(eq(table.id, image.id));

            if (table === inventoryTable) updatedPieces++;
            else if (table === extraImagesTable) updatedExtraImages++;
        };

        for (let i = 0; i < allImages.length; i++) {
            const image = allImages[i];
            let table;
            if ('piece_type' in image) {
                table = inventoryTable;
            } else if ('extra_image_id' in image) {
                table = extraImagesTable;
            } else {
                console.error('Unknown table type for image:', image);
                continue;
            }
            await updateImage(image, table, i);
        }

        return {
            success: true,
            updatedPeces: {
                updatedPieces,
                updatedExtraImages,
                updatedProgressImages,
            },
        };
    } catch (error) {
        console.error('Error generating small images:', error);
        return {
            success: false,
            error: 'An error occurred while processing your request.' ,
        };
    }
}

export async function getPiecesToVerify(): Promise<{ success: boolean; inventory?: InventoryWithImages[]; error?: string }> {
    const { isAdmin, error: roleError } = checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return { success: false, error: roleError };
    }
    try {
        const inventory = await db.select().from(inventoryTable).execute();
        const extraImages = await db.select().from(extraImagesTable).execute();
        const inventoryWithImages: InventoryWithImages[] = inventory.map((item: Inventory) => ({
            ...item,
            extraImages: extraImages.filter((extra: ExtraImages) => extra.inventory_id === item.id),        
        }));
        return { success: true, inventory: inventoryWithImages };
    } catch (error) {
        console.error('Error fetching pieces:', error);
        return { success: false, error: 'An error occurred while processing your request.' };
    }
}

export async function verifyImageDimensions(
    image: any
): Promise<{ success: boolean; verifyResult?: { id: number; title: string; mainImage?: any; smallImage?: any }; error?: string }> {
    const { isAdmin, error: roleError } = checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return { success: false, error: roleError };
    }
    try {
        const verifyAndUpdateDimensions = async (imageUrl: string, isSmall: boolean) => {
            if (!imageUrl) return null;

            try {
                const response = await fetch(imageUrl);
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                const metadata = await sharp(buffer).metadata();

                if (!metadata.width || !metadata.height) {
                    console.error(`Unable to get dimensions for image: ${imageUrl}`);
                    return null;
                }

                const updateFields = isSmall
                    ? {
                        small_width: metadata.width,
                        small_height: metadata.height,
                    }
                    : {
                        width: metadata.width,
                        height: metadata.height,
                    };

                let table;
                if ('piece_type' in image) {
                    table = inventoryTable;
                } else  {
                    table = extraImagesTable;
                }

                await db.update(table).set(updateFields).where(eq(table.id, image.id));

                return {
                    url: imageUrl,
                    ...updateFields,
                };
            } catch (error) {
                console.error(`Error processing image ${imageUrl}:`, error);
                return null;
            }
        };

        const result = await verifyAndUpdateDimensions(image.image_path, false);
        const smallResult = image.small_image_path ? await verifyAndUpdateDimensions(image.small_image_path, true) : null;

        return {
            success: true,
            verifyResult: {
                id: image.id,
                title: image.title,
                mainImage: result,
                smallImage: smallResult,
            },
        };
    } catch (error) {
        console.error('Error verifying image dimensions:', error);
        return { success: false, error: 'An error occurred while processing your request.' };
    }
}

// Add these interfaces at the end of the file
interface FileEsque extends Blob {
    name: string;
    customId?: string;
}

type UploadFileResponse = {
    data: {
        key: string;
        url: string;
        name: string;
        size: number;
    } | null;
    error: {
        code: string;
        message: string;
        data: any;
    } | null;
};

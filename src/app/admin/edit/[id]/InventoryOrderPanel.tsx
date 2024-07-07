import React from 'react';
import { IoIosArrowUp, IoIosArrowDown, IoIosTrash } from 'react-icons/io';
import { handleImageReorder, handleImageDelete, handleImageTitleEdit } from '../actions';
import { InventoryWithImages, ExtraImages } from '@/db/schema';
import Image from 'next/image';

interface InventoryOrderPanelProps {
    current_inventory: InventoryWithImages;
}

const InventoryOrderPanel: React.FC<InventoryOrderPanelProps> = ({ current_inventory }) => {
    const extra_images: ExtraImages[] = current_inventory.extraImages || [];

    async function handleImageReorderAction(formData: FormData) {
        const inventoryId = Number(formData.get('inventoryId'));
        const currentInventoryId = Number(formData.get('currentInventoryId'));
        const targetInventoryId = Number(formData.get('targetInventoryId'));

        if (!currentInventoryId || !targetInventoryId) {
            console.error(`Required form data missing. Cannot reorder image.`);
            return;
        }

        await handleImageReorder(inventoryId, currentInventoryId, targetInventoryId);
    }

    async function handleImageDeleteAction(formData: FormData) {
        const inventoryId = Number(formData.get('inventoryId'));
        const imagePath = formData.get('imagePath')?.toString();

        if (!imagePath) {
            console.error(`Required form data missing. Cannot delete image.`);
            return;
        }

        await handleImageDelete(inventoryId, imagePath);
    }

    async function handleImageTitleEditAction(formData: FormData) {
        const imageId = Number(formData.get('imageId'));
        const newTitle = formData.get('newTitle')?.toString();

        if (!imageId || !newTitle) {
            console.error(`Required form data missing. Cannot edit image title.`);
            return;
        }

        await handleImageTitleEdit(imageId, newTitle);
    }

    const renderImages = (images: ExtraImages[]) => {
        const elements = [];
        for (let index = 0; index < images.length; index++) {
            const image = images[index];
            const currentInventoryId = image.id;
            const prevInventoryId = images[index - 1]?.id || images[images.length - 1]?.id;
            const nextInventoryId = images[index + 1]?.id || images[0]?.id;

            elements.push(
                <div
                    key={index}
                    className="flex h-[70px] flex-row items-center space-x-2 rounded-b-lg px-2 py-2 hover:bg-stone-600 hover:text-secondary_light"
                >
                    <Image
                        src={image.image_path}
                        alt={image.image_path}
                        width={image.width}
                        height={image.height}
                        className="h-[40x] w-[40px] object-contain"
                    />
                    <div className="flex h-[58px] flex-col space-y-1">
                        <form action={handleImageReorderAction}>
                            <input type="hidden" name="inventoryId" value={current_inventory.id.toString()} />
                            <input type="hidden" name="currentInventoryId" value={currentInventoryId.toString()} />
                            <input type="hidden" name="targetInventoryId" value={prevInventoryId.toString()} />
                            <button type="submit">
                                <IoIosArrowUp className="h-6 w-6 cursor-pointer rounded-sm bg-secondary_dark fill-stone-400 p-1 hover:bg-primary hover:fill-secondary_dark" />
                            </button>
                        </form>
                        <form action={handleImageReorderAction}>
                            <input type="hidden" name="inventoryId" value={current_inventory.id.toString()} />
                            <input type="hidden" name="currentInventoryId" value={currentInventoryId.toString()} />
                            <input type="hidden" name="targetInventoryId" value={nextInventoryId.toString()} />
                            <button type="submit">
                                <IoIosArrowDown className="h-6 w-6 cursor-pointer rounded-sm bg-secondary_dark fill-stone-400 p-1 hover:bg-primary hover:fill-secondary_dark" />
                            </button>
                        </form>
                    </div>

                    <div className="flex h-[58px] items-center justify-center">
                        <form action={handleImageDeleteAction} className="h-6 w-6">
                            <input type="hidden" name="inventoryId" value={current_inventory.id.toString()} />
                            <input type="hidden" name="imagePath" value={image.image_path} />
                            <button type="submit">
                                <IoIosTrash className="h-6 w-6 cursor-pointer rounded-sm bg-red-800 fill-stone-400 p-1 hover:bg-red-600" />
                            </button>
                        </form>
                    </div>
                    <div className="flex h-[58px] items-center justify-center text-stone-400">{image.title || image.image_path}</div>
                </div>,
            );
        }
        return elements;
    };

    return (
        <div className="flex h-fit w-full flex-col p-2 pt-0">
            <div className="rounded-lg bg-stone-700">
                {extra_images.length > 0 && (
                    <div>
                        <h3 className="rounded-t-lg bg-secondary_dark px-2 py-2 text-lg font-semibold text-stone-400">Extra Images</h3>
                        <div className="flex h-fit flex-col">{renderImages(extra_images)}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InventoryOrderPanel;
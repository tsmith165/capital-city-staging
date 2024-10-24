import React from 'react';
import Image from 'next/image';
import { InventoryWithImages } from '@/db/schema';

interface InventoryItemProps {
    item: InventoryWithImages & { index: number };
    handleItemClick: (id: number, index: number) => void;
}

const InventoryItem = ({ item, handleItemClick }: InventoryItemProps) => {
    const image_path = item.small_image_path || item.image_path;
    let image_width = item.small_width || item.width || 0;
    let image_height = item.small_height || item.height || 0;

    return (
        <div
            key={`item-${item.id}`}
            className="group relative cursor-pointer overflow-hidden rounded-md bg-stone-600 shadow-md transition duration-300 ease-in-out hover:shadow-lg"
            onClick={() => handleItemClick(item.id, item.index)}
        >
            <Image
                src={image_path}
                alt={item.name}
                width={image_width}
                height={image_height}
                className="h-auto w-full rounded-md bg-stone-600 object-cover p-1"
                priority
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 p-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="text-center text-xl font-bold text-white">{item.name}</p>
            </div>
            {item.count === 0 && <div className="absolute bottom-6 right-6 h-2 w-2 rounded-full bg-red-600 shadow-md" />}
        </div>
    );
};

export default InventoryItem;

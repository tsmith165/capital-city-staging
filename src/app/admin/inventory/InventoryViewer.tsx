'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Masonry from 'react-masonry-css';
import 'react-tooltip/dist/react-tooltip.css';
import { InventoryWithImages } from '@/db/schema';
import useInventoryStore from '@/stores/inventory_store';
import FilterMenu from './FilterMenu';
import FullScreenView from './FullScreenView';
import SelectedItemView from './SelectedItemView';
import InventoryItem from './InventoryItem';
import { motion } from 'framer-motion';

interface InventoryItemProps {
    item: InventoryWithImages & { index: number };
    handleItemClick: (id: number, index: number) => void;
}

const Inventory = ({ items }: { items: InventoryWithImages[] }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

    const { category, filterMenuOpen, setFilterMenuOpen, itemList, inventoryItems, setItemList, setInventoryItems } = useInventoryStore(
        (state) => ({
            category: state.category,
            filterMenuOpen: state.filterMenuOpen,
            setFilterMenuOpen: state.setFilterMenuOpen,
            itemList: state.itemList,
            inventoryItems: state.inventoryItems,
            setItemList: state.setItemList,
            setInventoryItems: state.setInventoryItems,
        }),
    );

    const [isMasonryLoaded, setIsMasonryLoaded] = useState(false);
    const [isFullScreenImage, setIsFullScreenImage] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageLoadStates, setImageLoadStates] = useState<{ [key: number]: boolean }>({});

    const selectedItem = selectedItemIndex !== null ? items[selectedItemIndex] : null;
    const selectedImageRef = useRef<HTMLDivElement>(null);

    const imageList = selectedItem
        ? [
              {
                  src: selectedItem.small_image_path || selectedItem.image_path,
                  width: selectedItem.small_width || selectedItem.width,
                  height: selectedItem.small_height || selectedItem.height,
              },
              ...(selectedItem.extraImages || []).map((image) => ({
                  src: image.small_image_path || image.image_path,
                  width: image.small_width || image.width,
                  height: image.small_height || image.height,
              })),
          ]
        : [];

    useEffect(() => {
        setItemList(items);
    }, [items]);

    useEffect(() => {
        if (itemList.length > 0) {
            createInventory(itemList, category).then(() => {
                setTimeout(() => {
                    setIsMasonryLoaded(true);
                }, 0);
            });
        }
    }, [itemList, category]);

    useEffect(() => {
        const selectedItemId = searchParams.get('item');
        const initialSelectedIndex = items.findIndex((item) => item.id.toString() === selectedItemId);
        setSelectedItemIndex(initialSelectedIndex !== -1 ? initialSelectedIndex : null);
    }, [searchParams]);

    const createInventory = async (item_list: InventoryWithImages[], selected_category: string) => {
        setInventoryItems(() => []);

        const filteredItems = item_list.filter((item) => {
            const item_category = item.category || 'None';

            if (selected_category !== 'None' && selected_category) {
                return item_category.includes(selected_category);
            }
            return true;
        });

        const newInventoryItems = filteredItems.map((item, index) => (
            <InventoryItem key={`item-${item.id}`} item={{ ...item, index }} handleItemClick={handleItemClick} />
        ));

        setInventoryItems((prevInventoryItems) => [...prevInventoryItems, ...newInventoryItems]);
    };

    const inventory_clicked = (e: React.MouseEvent) => {
        if (filterMenuOpen && window.innerWidth < 768) {
            setFilterMenuOpen(false);
        }
    };

    const handleItemClick = (id: number, index: number) => {
        if (selectedItemIndex === index) {
            selectedImageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        setCurrentImageIndex(0);
        setSelectedItemIndex(index);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('item', `${id}`);
        router.replace(`/inventory?${newSearchParams.toString()}`);
        setImageLoadStates({});
        selectedImageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <>
            <motion.div
                className={`flex h-full w-full flex-col overflow-y-auto overflow-x-hidden bg-stone-900`}
                onClick={inventory_clicked}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2 }}
            >
                {selectedItem && (
                    <SelectedItemView
                        selectedItem={selectedItem}
                        currentImageIndex={currentImageIndex}
                        imageList={imageList}
                        imageLoadStates={imageLoadStates}
                        setIsFullScreenImage={setIsFullScreenImage}
                        selectedItemIndex={selectedItemIndex}
                        selectedImageRef={selectedImageRef}
                    />
                )}
                <motion.div
                    className={`flex h-fit w-full px-8 ${selectedItem ? 'py-4 md:py-8' : 'py-8'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                >
                    <Masonry
                        breakpointCols={{
                            default: 5,
                            1500: 4,
                            1100: 3,
                            700: 2,
                            300: 1,
                        }}
                        className="my-masonry-grid w-full"
                        columnClassName="my-masonry-grid_column"
                    >
                        {inventoryItems}
                    </Masonry>
                </motion.div>
            </motion.div>
            <FilterMenu />
            {isFullScreenImage && selectedItem && (
                <FullScreenView
                    selectedItem={selectedItem}
                    currentImageIndex={currentImageIndex}
                    setCurrentImageIndex={setCurrentImageIndex}
                    imageList={imageList}
                    setIsFullScreenImage={setIsFullScreenImage}
                    selectedItemIndex={selectedItemIndex}
                />
            )}
        </>
    );
};

export default Inventory;
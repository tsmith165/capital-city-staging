// File: /src/app/admin/inventory/InventoryViewer.tsx

'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Masonry from 'react-masonry-css';
import 'react-tooltip/dist/react-tooltip.css';

import { InventoryWithImages } from '@/db/schema';
import useInventoryStore from '@/stores/inventory_store';

import InventoryItem from './InventoryItem';
import FullScreenView from './FullScreenView';
import SelectedItemView from './SelectedItemView';
import FilterMenu from './FilterMenu';

const InventoryViewer: React.FC<{ items: InventoryWithImages[] }> = ({ items }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { category, filterMenuOpen, setFilterMenuOpen, itemList, setItemList } = useInventoryStore((state) => ({
        category: state.category,
        filterMenuOpen: state.filterMenuOpen,
        setFilterMenuOpen: state.setFilterMenuOpen,
        itemList: state.itemList,
        setItemList: state.setItemList,
    }));

    const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
    const [isMasonryLoaded, setIsMasonryLoaded] = useState(false);
    const [isFullScreenImage, setIsFullScreenImage] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageLoadStates, setImageLoadStates] = useState<{ [key: number]: boolean }>({});
    const [isPlaying, setIsPlaying] = useState(true);
    const [speed, setSpeed] = useState(3000);

    const selectedItem = useMemo(() => (selectedItemIndex !== null ? items[selectedItemIndex] : null), [items, selectedItemIndex]);
    const selectedImageRef = useRef<HTMLDivElement>(null);

    const imageList = useMemo(() => {
        if (!selectedItem) return [];
        return [
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
        ];
    }, [selectedItem]);

    useEffect(() => {
        setItemList(items);
    }, [items, setItemList]);

    const handleItemClick = useCallback((id: number, index: number) => {
        if (selectedItemIndex === index) {
            selectedImageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        setCurrentImageIndex(0);
        setSelectedItemIndex(index);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('item', `${id}`);
        router.replace(`/admin/inventory?${newSearchParams.toString()}`);
        setImageLoadStates({});
        selectedImageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [selectedItemIndex, searchParams, router]);

    const filteredItems = useMemo(() => {
        return itemList.filter((item) => {
            const item_category = item.category || 'None';
            if (category !== 'None' && category) {
                return item_category.includes(category);
            }
            return true;
        });
    }, [itemList, category]);

    const inventoryItems = useMemo(() => {
        return filteredItems.map((item, index) => (
            <InventoryItem key={`item-${item.id}`} item={{ ...item, index }} handleItemClick={handleItemClick} />
        ));
    }, [filteredItems, handleItemClick]);

    useEffect(() => {
        if (itemList.length > 0) {
            setIsMasonryLoaded(true);
        }
    }, [itemList]);

    useEffect(() => {
        const selectedItemId = searchParams.get('item');
        const initialSelectedIndex = items.findIndex((item) => item.id.toString() === selectedItemId);
        setSelectedItemIndex(initialSelectedIndex !== -1 ? initialSelectedIndex : null);
    }, [searchParams, items]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPlaying && selectedItem && imageList.length > 1) {
            interval = setInterval(() => {
                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageList.length);
            }, speed);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [speed, isPlaying, imageList.length, selectedItem]);

    const inventory_clicked = useCallback((e: React.MouseEvent) => {
        if (filterMenuOpen && window.innerWidth < 768) {
            setFilterMenuOpen(false);
        }
    }, [filterMenuOpen, setFilterMenuOpen]);

    const handleImageLoad = useCallback(() => {
        setImageLoadStates((prevLoadStates) => ({
            ...prevLoadStates,
            [currentImageIndex]: true,
        }));
    }, [currentImageIndex]);

    const handleNext = useCallback(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageList.length);
    }, [imageList.length]);

    const handlePrev = useCallback(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageList.length) % imageList.length);
    }, [imageList.length]);

    const togglePlayPause = useCallback(() => {
        setIsPlaying((prevState) => !prevState);
    }, []);

    if (!isMasonryLoaded)
        return (
            <div className="inset-0 flex h-full w-full items-center justify-center">
                <div className="relative flex h-[250px] w-[250px] items-center justify-center rounded-full bg-stone-900 p-6 opacity-70 xxs:h-[300px] xxs:w-[300px] xs:h-[350px] xs:w-[350px]">
                    <Image src="/logo/ccs_logo.png" alt="Capital City Staging Logo" width={370} height={150} />
                </div>
            </div>
        );

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
                        handleImageLoad={handleImageLoad}
                        setIsFullScreenImage={setIsFullScreenImage}
                        selectedItemIndex={selectedItemIndex}
                        selectedImageRef={selectedImageRef}
                        handleNext={handleNext}
                        handlePrev={handlePrev}
                        togglePlayPause={togglePlayPause}
                        isPlaying={isPlaying}
                        speed={speed}
                        setSpeed={setSpeed}
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
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    setIsFullScreenImage={setIsFullScreenImage}
                    selectedItemIndex={selectedItemIndex}
                    setSpeed={setSpeed}
                    speed={speed}
                />
            )}
        </>
    );
};

export default InventoryViewer;
'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useQueryStates, useQueryState } from 'nuqs';
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
import { categoryParser, itemIdParser, ParsedParams } from './parsers';

interface InventoryViewerProps {
    items: InventoryWithImages[];
    initialParams: ParsedParams;
}

const InventoryViewer: React.FC<InventoryViewerProps> = ({ items, initialParams }) => {
    const [params, setParams] = useQueryStates(
        {
            category: categoryParser,
            item: itemIdParser,
        },
        {
            shallow: true,
            history: 'push',
        },
    );

    const [category] = useQueryState('category');

    const {
        category: storeCategory,
        filterMenuOpen,
        setFilterMenuOpen,
        setItemList,
        setCategory,
    } = useInventoryStore((state) => ({
        category: state.category,
        filterMenuOpen: state.filterMenuOpen,
        setFilterMenuOpen: state.setFilterMenuOpen,
        setItemList: state.setItemList,
        setCategory: state.setCategory,
    }));

    // Initialize loading state based on items
    const [isMasonryLoaded, setIsMasonryLoaded] = useState(items.length > 0);

    // Find initial selected item index
    const initialIndex = useMemo(() => {
        if (!initialParams.item) return null;
        return items.findIndex((item) => item.id.toString() === initialParams.item);
    }, [items, initialParams.item]);

    const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(initialIndex);
    const [isFullScreenImage, setIsFullScreenImage] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageLoadStates, setImageLoadStates] = useState<{ [key: number]: boolean }>({});
    const [isPlaying, setIsPlaying] = useState(true);
    const [speed, setSpeed] = useState(3000);
    const [mounted, setMounted] = useState(false);

    const selectedImageRef = useRef<HTMLDivElement>(null);

    const selectedItem = useMemo(() => (selectedItemIndex !== null ? items[selectedItemIndex] : null), [items, selectedItemIndex]);

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

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const item_category = item.category || 'None';
            if (category && category !== 'None') {
                return item_category.includes(category);
            }
            return true;
        });
    }, [items, category]);

    const handleItemClick = useCallback(
        (id: number, index: number) => {
            if (selectedItemIndex === index) {
                selectedImageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }
            setCurrentImageIndex(0);
            setSelectedItemIndex(index);
            setParams({ item: id.toString() });
            setImageLoadStates({});
            selectedImageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },
        [selectedItemIndex, setParams],
    );

    const renderedItems = useMemo(() => {
        return filteredItems.map((item, index) => (
            <InventoryItem key={`item-${item.id}`} item={{ ...item, index }} handleItemClick={handleItemClick} />
        ));
    }, [filteredItems, handleItemClick]);

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

    const inventory_clicked = useCallback(
        (e: React.MouseEvent) => {
            if (filterMenuOpen && window.innerWidth < 768) {
                setFilterMenuOpen(false);
            }
        },
        [filterMenuOpen, setFilterMenuOpen],
    );

    useEffect(() => {
        setMounted(true);
    }, []);

    // Initial data setup
    useEffect(() => {
        // Initialize store with server-side state
        setItemList(items);
        if (initialParams.category) {
            setCategory(initialParams.category);
        }
    }, [items, initialParams.category, setItemList, setCategory]);

    // Sync URL category to store only when different
    useEffect(() => {
        const urlCategory = params.category;
        if (urlCategory && urlCategory !== category) {
            setCategory(urlCategory);
        }
    }, [params.category, category, setCategory]);

    // Handle selected item from URL
    useEffect(() => {
        const selectedItemId = params.item;
        if (selectedItemId) {
            const initialSelectedIndex = items.findIndex((item) => item.id.toString() === selectedItemId);
            setSelectedItemIndex(initialSelectedIndex !== -1 ? initialSelectedIndex : null);
        }
    }, [params.item, items]);

    // Handle image slideshow
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

    const handleNextItem = useCallback(() => {
        if (selectedItemIndex === null) return;
        const nextIndex = (selectedItemIndex + 1) % filteredItems.length;
        const nextItem = filteredItems[nextIndex];
        handleItemClick(nextItem.id, nextIndex);
    }, [selectedItemIndex, filteredItems, handleItemClick]);

    const handlePrevItem = useCallback(() => {
        if (selectedItemIndex === null) return;
        const prevIndex = (selectedItemIndex - 1 + filteredItems.length) % filteredItems.length;
        const prevItem = filteredItems[prevIndex];
        handleItemClick(prevItem.id, prevIndex);
    }, [selectedItemIndex, filteredItems, handleItemClick]);

    if (!mounted) {
        return null; // Return null on server-side and first render
    }

    if (!isMasonryLoaded)
        return (
            <div className="inset-0 flex h-full w-full items-center justify-center">
                <div className="xxs:h-[300px] xxs:w-[300px] relative flex h-[250px] w-[250px] items-center justify-center rounded-full bg-stone-900 p-6 opacity-70 xs:h-[350px] xs:w-[350px]">
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
                        imageList={imageList.map((img) => ({
                            ...img,
                            width: img.width ?? 0,
                            height: img.height ?? 0,
                        }))}
                        imageLoadStates={imageLoadStates}
                        handleImageLoad={handleImageLoad}
                        setIsFullScreenImage={setIsFullScreenImage}
                        selectedItemIndex={selectedItemIndex}
                        selectedImageRef={selectedImageRef}
                        handleNext={handleNext}
                        handlePrev={handlePrev}
                        handleNextItem={handleNextItem}
                        handlePrevItem={handlePrevItem}
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
                        {renderedItems}
                    </Masonry>
                </motion.div>
            </motion.div>
            <FilterMenu />
            {isFullScreenImage && selectedItem && (
                <FullScreenView
                    selectedItem={selectedItem}
                    currentImageIndex={currentImageIndex}
                    setCurrentImageIndex={setCurrentImageIndex}
                    imageList={imageList.map((img) => ({
                        ...img,
                        width: img.width ?? 0,
                        height: img.height ?? 0,
                    }))}
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

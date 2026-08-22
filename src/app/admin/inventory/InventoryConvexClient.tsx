'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Plus, Edit, Info, ExternalLink } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import AddInventoryOverlay from '@/components/AddInventoryOverlay';
import { SkeletonBlock, SkeletonTiles } from '@/components/admin/AdminSkeleton';

export default function InventoryConvexClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Seeded from the URL once. The filter handlers below write the URL, so re-syncing state
    // from `searchParams` on every change would feed the component its own output.
    const [selectedCategory, setSelectedCategory] = useState<string>(() => searchParams.get('category') || '');
    const [searchTerm, setSearchTerm] = useState<string>(() => searchParams.get('search') || '');
    const [showAddInventoryOverlay, setShowAddInventoryOverlay] = useState(false);
    const [showItemInfo, setShowItemInfo] = useState<Record<string, boolean>>({});

    // Function to update URL with new params
    const updateURLParams = (category: string, search: string) => {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (search) params.set('search', search);
        
        const newUrl = params.toString() ? `/admin/inventory?${params.toString()}` : '/admin/inventory';
        router.replace(newUrl);
    };

    // Handle category change
    const handleCategoryChange = (newCategory: string) => {
        setSelectedCategory(newCategory);
        updateURLParams(newCategory, searchTerm);
    };

    // Handle search change
    const handleSearchChange = (newSearch: string) => {
        setSearchTerm(newSearch);
        updateURLParams(selectedCategory, newSearch);
    };

    const inventory = useQuery(api.inventory.getInventory, {
        category: selectedCategory || undefined,
        search: searchTerm || undefined,
        active: true,
    });
    
    const categories = useQuery(api.inventory.getInventoryCategories);

    const handleEditItem = (oId: number) => {
        router.push(`/admin/edit?id=${oId}`);
    };

    const toggleItemInfo = (itemId: string) => {
        setShowItemInfo(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    if (inventory === undefined || categories === undefined) {
        return (
            <div className="container mx-auto max-w-7xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-body">Inventory Management</h1>
                    <SkeletonBlock className="h-10 w-44 rounded-lg" />
                </div>
                <div className="mb-6 flex flex-wrap gap-4">
                    <SkeletonBlock className="h-10 min-w-[200px] flex-1 rounded" />
                    <SkeletonBlock className="h-10 w-40 rounded" />
                </div>
                <SkeletonTiles count={9} label="Loading inventory" />
            </div>
        );
    }

    const filteredInventory = inventory || [];

    return (
        <div className="container mx-auto max-w-7xl p-4">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold text-body">Inventory Management</h1>
                    <button
                        onClick={() => setShowAddInventoryOverlay(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary_dark text-body-inverse hover:text-body-inverse rounded-lg transition-colors font-medium"
                        title="Create new inventory item"
                    >
                        <Plus size={20} />
                        <span>Add New Inventory</span>
                    </button>
                </div>
                
                {/* Search and Filter Controls */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search inventory..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="flex-1 min-w-[200px] rounded border border-line-strong bg-surface-overlay px-3 py-2 text-body focus:border-primary focus:outline-none"
                    />
                    
                    <select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="rounded border border-line-strong bg-surface-overlay px-3 py-2 text-body focus:border-primary focus:outline-none"
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                    
                </div>

                {/* Inventory Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInventory.map((item) => (
                        <div
                            key={item._id}
                            className="bg-surface-raised rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                        >
                            {/* Image or Info Display */}
                            <div className="relative h-48">
                                {showItemInfo[item._id] ? (
                                    // Show item info
                                    <div className="flex h-full flex-col justify-start bg-gradient-to-br from-stone-800 to-stone-900 p-4 text-body">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-bold text-primary">${item.price}</div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/admin/edit?id=${item.oId}`);
                                                    }}
                                                    className="flex items-center gap-1 px-2 py-1 text-xs text-primary hover:text-secondary transition-colors"
                                                >
                                                    <ExternalLink size={8} />
                                                    <span className="text-[10px]">Edit</span>
                                                </button>
                                            </div>
                                            <div className="text-xs text-body-muted">
                                                <span className="font-medium">Size:</span> {item.realWidth}" × {item.realHeight}" × {item.realDepth}"
                                            </div>
                                            <div className="text-xs text-body-muted">
                                                <span className="font-medium">Available:</span> {item.count - item.inUse} of {item.count}
                                            </div>
                                            {item.location && (
                                                <div className="text-xs text-body-subtle">
                                                    📍 {item.location}
                                                </div>
                                            )}
                                            {item.description && (
                                                <div className="text-xs text-body-subtle border-t border-line pt-2">
                                                    {item.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    // Show item image
                                    <>
                                        <Image
                                            src={item.smallImagePath}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                        <div className="absolute top-2 right-2 bg-secondary text-white px-2 py-1 rounded text-sm">
                                            ${item.price}
                                        </div>
                                        {!item.active && (
                                            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-sm">
                                                Inactive
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            
                            <div className="p-4">
                                <h3 className="font-semibold text-body mb-3 truncate">{item.name}</h3>
                                
                                {/* Availability and buttons on same row */}
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-body-subtle">
                                        <span>Available: {item.count - item.inUse} / {item.count}</span>
                                    </div>
                                    
                                    {/* Edit and Info buttons */}
                                    <div className="flex gap-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleItemInfo(item._id);
                                            }}
                                            className="w-6 h-6 rounded border border-blue-500 bg-transparent text-blue-400 transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center"
                                            data-tooltip-id="info-tooltip"
                                            data-tooltip-content="Show item info"
                                        >
                                            <Info size={10} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditItem(item.oId);
                                            }}
                                            className="w-6 h-6 rounded border border-primary bg-transparent text-primary transition-colors hover:border-secondary hover:bg-secondary hover:text-body-muted flex items-center justify-center"
                                            data-tooltip-id="edit-tooltip"
                                            data-tooltip-content="Edit item"
                                        >
                                            <Edit size={10} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredInventory.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-body-subtle text-lg">No inventory items found</p>
                        <button
                            onClick={() => setShowAddInventoryOverlay(true)}
                            className="mt-4 rounded border-2 bg-transparent border-primary text-primary px-6 py-2 font-medium transition-colors hover:bg-secondary hover:border-secondary hover:text-body-muted"
                        >
                            Add First Item
                        </button>
                    </div>
                )}
            </div>
            
            {/* Add Inventory Overlay */}
            {showAddInventoryOverlay && (
                <AddInventoryOverlay
                    onClose={() => setShowAddInventoryOverlay(false)}
                    onSuccess={() => {
                        // Refresh the inventory list to show the new item
                        router.refresh();
                    }}
                    defaultAction="stay"
                />
            )}
            
            {/* Tooltips */}
            <Tooltip id="info-tooltip" place="top" />
            <Tooltip id="edit-tooltip" place="top" />
        </div>
    );
}
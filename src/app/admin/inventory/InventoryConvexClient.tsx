'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function InventoryConvexClient() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    const inventory = useQuery(api.inventory.getInventory, {
        category: selectedCategory || undefined,
        search: searchTerm || undefined,
        active: true,
    });
    
    const categories = useQuery(api.inventory.getInventoryCategories);

    const handleItemClick = (oId: number) => {
        router.push(`/admin/edit?id=${oId}`);
    };

    const handleEditItem = (oId: number) => {
        router.push(`/admin/edit?id=${oId}`);
    };

    const handleEditImages = (inventoryOId: number) => {
        router.push(`/admin/edit?id=${inventoryOId}`);
    };

    if (inventory === undefined || categories === undefined) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-stone-300">Loading inventory...</div>
            </div>
        );
    }

    const filteredInventory = inventory || [];

    return (
        <div className="container mx-auto max-w-7xl p-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-stone-100 mb-4">Inventory Management</h1>
                
                {/* Search and Filter Controls */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search inventory..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 min-w-[200px] rounded border border-stone-600 bg-stone-700 px-3 py-2 text-stone-100 focus:border-primary focus:outline-none"
                    />
                    
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="rounded border border-stone-600 bg-stone-700 px-3 py-2 text-stone-100 focus:border-primary focus:outline-none"
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                    
                    <button
                        onClick={() => router.push('/admin/inventory/new')}
                        className="rounded border-2 bg-transparent border-primary text-primary px-4 py-2 font-medium transition-colors hover:bg-secondary hover:border-secondary hover:text-stone-300"
                    >
                        Add New Item
                    </button>
                </div>

                {/* Inventory Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredInventory.map((item) => (
                        <div
                            key={item._id}
                            className="bg-stone-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                            onClick={() => handleItemClick(item.oId)}
                        >
                            <div className="relative h-48">
                                <Image
                                    src={item.smallImagePath}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                />
                                <div className="absolute top-2 right-2 bg-secondary text-white px-2 py-1 rounded text-sm">
                                    ${item.price}
                                </div>
                                {!item.active && (
                                    <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-sm">
                                        Inactive
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-4">
                                <h3 className="font-semibold text-stone-100 mb-2 truncate">{item.name}</h3>
                                <p className="text-sm text-stone-400 mb-2">{item.category}</p>
                                <p className="text-xs text-stone-500 mb-3 line-clamp-2">{item.description}</p>
                                
                                <div className="flex justify-between items-center text-xs text-stone-400">
                                    <span>Available: {item.count - item.inUse}</span>
                                    <span>In Use: {item.inUse}</span>
                                </div>
                                
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditItem(item.oId);
                                        }}
                                        className="flex-1 rounded bg-primary text-secondary_dark px-2 py-1 text-sm font-medium hover:bg-secondary hover:text-primary transition-colors"
                                    >
                                        Edit Details
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditImages(item.oId);
                                        }}
                                        className="flex-1 rounded bg-stone-600 text-stone-200 px-2 py-1 text-sm font-medium hover:bg-stone-500 transition-colors"
                                    >
                                        Edit Images
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredInventory.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-stone-400 text-lg">No inventory items found</p>
                        <button
                            onClick={() => router.push('/admin/inventory/new')}
                            className="mt-4 rounded border-2 bg-transparent border-primary text-primary px-6 py-2 font-medium transition-colors hover:bg-secondary hover:border-secondary hover:text-stone-300"
                        >
                            Add First Item
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
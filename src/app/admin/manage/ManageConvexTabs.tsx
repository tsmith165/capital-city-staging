'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import { FaEdit } from 'react-icons/fa';
import { MdRestore, MdArchive, MdStar, MdStarBorder } from 'react-icons/md';

export default function ManageConvexTabs() {
    const [activeTab, setActiveTab] = useState('order');
    
    // Convex queries
    const inventory = useQuery(api.inventory.getInventory, { active: true });
    const archivedInventory = useQuery(api.inventory.getInventory, { active: false });
    const allInventory = useQuery(api.inventory.getAllInventory);
    
    // Convex mutations
    const updateInventory = useMutation(api.inventory.updateInventory);
    
    // Loading state
    if (!inventory || !archivedInventory || !allInventory) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <div className="text-stone-400">Loading inventory...</div>
            </div>
        );
    }
    
    // Filter prioritized items (assuming priority field or using pId for now)
    const prioritizedInventory = allInventory
        .filter(item => item.active)
        .sort((a, b) => b.pId - a.pId)
        .slice(0, 10); // Top 10 items by pId
    
    const handleSetInactive = async (id: Id<"inventory">) => {
        try {
            await updateInventory({
                id,
                updates: { active: false }
            });
        } catch (error) {
            console.error('Failed to archive item:', error);
        }
    };
    
    const handleSetActive = async (id: Id<"inventory">) => {
        try {
            await updateInventory({
                id,
                updates: { active: true }
            });
        } catch (error) {
            console.error('Failed to activate item:', error);
        }
    };
    
    const renderInventoryItem = (item: any, index: number, isArchived: boolean = false) => (
        <div 
            key={item._id}
            className="flex items-center border-b border-stone-700 py-3 hover:bg-stone-800/50 transition-colors"
        >
            {/* Image */}
            <div className="w-32 h-20 relative mr-4">
                <Image
                    src={item.smallImagePath || item.imagePath}
                    alt={item.name}
                    fill
                    className="object-cover rounded"
                    sizes="128px"
                />
            </div>
            
            {/* Item Details */}
            <div className="flex-grow">
                <h3 className="text-stone-100 font-medium">{item.name}</h3>
                <p className="text-stone-400 text-sm">
                    {item.category} • ${item.price} • Count: {item.count}
                </p>
                <p className="text-stone-500 text-xs">
                    In Use: {item.inUse} • Location: {item.location || 'N/A'}
                </p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
                {activeTab === 'order' && (
                    <>
                        <button
                            disabled={index === 0}
                            className={`p-2 rounded ${
                                index === 0 
                                    ? 'bg-stone-700 text-stone-500 cursor-not-allowed' 
                                    : 'bg-stone-600 text-stone-300 hover:bg-secondary hover:text-white'
                            }`}
                            title="Move Up"
                        >
                            <IoIosArrowUp size={16} />
                        </button>
                        <button
                            disabled={index === inventory.length - 1}
                            className={`p-2 rounded ${
                                index === inventory.length - 1
                                    ? 'bg-stone-700 text-stone-500 cursor-not-allowed' 
                                    : 'bg-stone-600 text-stone-300 hover:bg-secondary hover:text-white'
                            }`}
                            title="Move Down"
                        >
                            <IoIosArrowDown size={16} />
                        </button>
                    </>
                )}
                
                <Link
                    href={`/admin/edit?id=${item.oId}`}
                    className="p-2 rounded bg-stone-600 text-stone-300 hover:bg-secondary hover:text-white"
                    title="Edit"
                >
                    <FaEdit size={16} />
                </Link>
                
                {isArchived ? (
                    <button
                        onClick={() => handleSetActive(item._id)}
                        className="p-2 rounded bg-stone-600 text-stone-300 hover:bg-green-600 hover:text-white"
                        title="Restore"
                    >
                        <MdRestore size={16} />
                    </button>
                ) : (
                    <button
                        onClick={() => handleSetInactive(item._id)}
                        className="p-2 rounded bg-stone-600 text-stone-300 hover:bg-red-600 hover:text-white"
                        title="Archive"
                        disabled={item.inUse > 0}
                    >
                        <MdArchive size={16} />
                    </button>
                )}
            </div>
        </div>
    );
    
    return (
        <div className="flex h-full w-full flex-col bg-stone-900">
            {/* Header */}
            <div className="p-4 border-b border-stone-700">
                <h1 className="text-2xl font-bold text-stone-100">Manage Inventory</h1>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-1 p-4 pb-0">
                <button
                    onClick={() => setActiveTab('order')}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                        activeTab === 'order'
                            ? 'bg-stone-800 text-stone-100 border-b-2 border-secondary'
                            : 'bg-stone-800/50 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                    }`}
                >
                    Order ({inventory.length})
                </button>
                <button
                    onClick={() => setActiveTab('archived')}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                        activeTab === 'archived'
                            ? 'bg-stone-800 text-stone-100 border-b-2 border-secondary'
                            : 'bg-stone-800/50 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                    }`}
                >
                    Archived ({archivedInventory.length})
                </button>
                <button
                    onClick={() => setActiveTab('priority')}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                        activeTab === 'priority'
                            ? 'bg-stone-800 text-stone-100 border-b-2 border-secondary'
                            : 'bg-stone-800/50 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                    }`}
                >
                    Priority ({prioritizedInventory.length})
                </button>
            </div>
            
            {/* Tab Content */}
            <div className="flex-grow overflow-y-auto bg-stone-800 mx-4 mb-4 rounded-b-lg p-4">
                {activeTab === 'order' && (
                    <div className="space-y-1">
                        {inventory.length === 0 ? (
                            <p className="text-stone-400 text-center py-8">No active inventory items</p>
                        ) : (
                            inventory.map((item, index) => renderInventoryItem(item, index))
                        )}
                    </div>
                )}
                
                {activeTab === 'archived' && (
                    <div className="space-y-1">
                        {archivedInventory.length === 0 ? (
                            <p className="text-stone-400 text-center py-8">No archived inventory items</p>
                        ) : (
                            archivedInventory.map((item, index) => renderInventoryItem(item, index, true))
                        )}
                    </div>
                )}
                
                {activeTab === 'priority' && (
                    <div className="space-y-1">
                        {prioritizedInventory.length === 0 ? (
                            <p className="text-stone-400 text-center py-8">No priority items set</p>
                        ) : (
                            <>
                                <p className="text-stone-400 text-sm mb-4">
                                    Top {prioritizedInventory.length} items by priority
                                </p>
                                {prioritizedInventory.map((item, index) => (
                                    <div 
                                        key={item._id}
                                        className="flex items-center border-b border-stone-700 py-3 hover:bg-stone-800/50 transition-colors"
                                    >
                                        {/* Priority Number */}
                                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white font-bold mr-4">
                                            {index + 1}
                                        </div>
                                        
                                        {/* Image */}
                                        <div className="w-32 h-20 relative mr-4">
                                            <Image
                                                src={item.smallImagePath || item.imagePath}
                                                alt={item.name}
                                                fill
                                                className="object-cover rounded"
                                                sizes="128px"
                                            />
                                        </div>
                                        
                                        {/* Item Details */}
                                        <div className="flex-grow">
                                            <h3 className="text-stone-100 font-medium">{item.name}</h3>
                                            <p className="text-stone-400 text-sm">
                                                {item.category} • ${item.price}
                                            </p>
                                        </div>
                                        
                                        {/* Edit Button */}
                                        <Link
                                            href={`/admin/edit?id=${item.oId}`}
                                            className="p-2 rounded bg-stone-600 text-stone-300 hover:bg-secondary hover:text-white"
                                            title="Edit"
                                        >
                                            <FaEdit size={16} />
                                        </Link>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
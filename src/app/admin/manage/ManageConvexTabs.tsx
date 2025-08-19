'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { MdRestore } from 'react-icons/md';
import { Tooltip } from 'react-tooltip';

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

    const handleMoveUp = async (currentIndex: number) => {
        if (!inventory) return;
        
        const targetIndex = currentIndex === 0 ? inventory.length - 1 : currentIndex - 1;
        const currentItem = inventory[currentIndex];
        const targetItem = inventory[targetIndex];
        
        try {
            // Swap oId values
            await updateInventory({
                id: currentItem._id,
                updates: { oId: targetItem.oId }
            });
            await updateInventory({
                id: targetItem._id,
                updates: { oId: currentItem.oId }
            });
        } catch (error) {
            console.error('Failed to move item up:', error);
        }
    };

    const handleMoveDown = async (currentIndex: number) => {
        if (!inventory) return;
        
        const targetIndex = currentIndex === inventory.length - 1 ? 0 : currentIndex + 1;
        const currentItem = inventory[currentIndex];
        const targetItem = inventory[targetIndex];
        
        try {
            // Swap oId values
            await updateInventory({
                id: currentItem._id,
                updates: { oId: targetItem.oId }
            });
            await updateInventory({
                id: targetItem._id,
                updates: { oId: currentItem.oId }
            });
        } catch (error) {
            console.error('Failed to move item down:', error);
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
                            onClick={() => handleMoveUp(index)}
                            className="p-2 rounded bg-stone-600 text-stone-300 hover:bg-secondary hover:text-white"
                            data-tooltip-id={`move-up-${item._id}`}
                            data-tooltip-content="Move up in order (wraps to end)"
                        >
                            <IoIosArrowUp size={16} />
                        </button>
                        
                        {/* Order Position */}
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white font-bold text-sm">
                            {item.oId}
                        </div>
                        
                        <button
                            onClick={() => handleMoveDown(index)}
                            className="p-2 rounded bg-stone-600 text-stone-300 hover:bg-secondary hover:text-white"
                            data-tooltip-id={`move-down-${item._id}`}
                            data-tooltip-content="Move down in order (wraps to start)"
                        >
                            <IoIosArrowDown size={16} />
                        </button>
                    </>
                )}
                
                <Link
                    href={`/admin/edit?id=${item.oId}`}
                    className="p-2 rounded bg-stone-600 text-stone-300 hover:bg-secondary hover:text-white"
                    data-tooltip-id={`edit-${item._id}`}
                    data-tooltip-content="Edit this item"
                >
                    <FaEdit size={16} />
                </Link>
                
                {isArchived ? (
                    <button
                        onClick={() => handleSetActive(item._id)}
                        className="p-2 rounded bg-stone-600 text-stone-300 hover:bg-green-600 hover:text-white"
                        data-tooltip-id={`restore-${item._id}`}
                        data-tooltip-content="Restore this item"
                    >
                        <MdRestore size={16} />
                    </button>
                ) : (
                    <button
                        onClick={() => handleSetInactive(item._id)}
                        className="p-2 rounded bg-stone-600 text-stone-300 hover:bg-red-600 hover:text-white"
                        data-tooltip-id={`archive-${item._id}`}
                        data-tooltip-content="Archive Item"
                        disabled={item.inUse > 0}
                    >
                        <FaTrash size={16} />
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
            </div>
            
            {/* Tooltips */}
            {inventory && inventory.map((item) => (
                <div key={`tooltips-${item._id}`}>
                    <Tooltip id={`move-up-${item._id}`} />
                    <Tooltip id={`move-down-${item._id}`} />
                    <Tooltip id={`edit-${item._id}`} />
                    <Tooltip id={`archive-${item._id}`} />
                </div>
            ))}
            {archivedInventory && archivedInventory.map((item) => (
                <div key={`archived-tooltips-${item._id}`}>
                    <Tooltip id={`edit-${item._id}`} />
                    <Tooltip id={`restore-${item._id}`} />
                </div>
            ))}
        </div>
    );
}
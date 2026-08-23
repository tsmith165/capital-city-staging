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
    const [error, setError] = useState<string | null>(null);

    // Convex queries
    const inventory = useQuery(api.inventory.getInventory, { active: true });
    const archivedInventory = useQuery(api.inventory.getInventory, { active: false });
    const allInventory = useQuery(api.inventory.getAllInventory);

    // Convex mutations
    const updateInventory = useMutation(api.inventory.updateInventory);
    const swapOrder = useMutation(api.inventory.swapInventoryOrder);

    // Loading state
    if (!inventory || !archivedInventory || !allInventory) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <div className="text-body-subtle">Loading inventory...</div>
            </div>
        );
    }

    const setActiveState = async (id: Id<'inventory'>, active: boolean) => {
        setError(null);
        try {
            await updateInventory({ id, updates: { active } });
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : `Could not ${active ? 'restore' : 'archive'} that item.`);
        }
    };

    const handleSetInactive = (id: Id<'inventory'>) => setActiveState(id, false);
    const handleSetActive = (id: Id<'inventory'>) => setActiveState(id, true);

    /* Ordering swaps two rows in one mutation, so a failure cannot leave two items sharing an id. */
    const swapWith = async (currentIndex: number, targetIndex: number) => {
        if (!inventory) return;

        setError(null);
        try {
            await swapOrder({ firstId: inventory[currentIndex]._id, secondId: inventory[targetIndex]._id });
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Could not reorder those items.');
        }
    };

    const handleMoveUp = (currentIndex: number) =>
        swapWith(currentIndex, currentIndex === 0 ? (inventory?.length ?? 1) - 1 : currentIndex - 1);

    const handleMoveDown = (currentIndex: number) =>
        swapWith(currentIndex, currentIndex === (inventory?.length ?? 1) - 1 ? 0 : currentIndex + 1);

    const renderInventoryItem = (item: any, index: number, isArchived: boolean = false) => (
        <div key={item._id} className="border-line hover:bg-surface-raised/50 flex items-center border-b py-3 transition-colors">
            {/* Image */}
            <div className="relative mr-4 h-20 w-32">
                <Image src={item.smallImagePath || item.imagePath} alt={item.name} fill className="rounded object-cover" sizes="128px" />
            </div>

            {/* Item Details */}
            <div className="flex-grow">
                <h3 className="text-body font-medium">{item.name}</h3>
                <p className="text-body-subtle text-sm">
                    {item.category} • ${item.price} • Count: {item.count}
                </p>
                <p className="text-body-subtle text-xs">
                    In Use: {item.inUse} • Location: {item.location || 'N/A'}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {activeTab === 'order' && (
                    <>
                        <button
                            onClick={() => handleMoveUp(index)}
                            className="bg-surface-hover text-body-muted hover:bg-secondary rounded p-2 hover:text-white"
                            data-tooltip-id={`move-up-${item._id}`}
                            data-tooltip-content="Move up in order (wraps to end)"
                        >
                            <IoIosArrowUp size={16} />
                        </button>

                        {/* Order Position */}
                        <div className="bg-secondary flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
                            {item.oId}
                        </div>

                        <button
                            onClick={() => handleMoveDown(index)}
                            className="bg-surface-hover text-body-muted hover:bg-secondary rounded p-2 hover:text-white"
                            data-tooltip-id={`move-down-${item._id}`}
                            data-tooltip-content="Move down in order (wraps to start)"
                        >
                            <IoIosArrowDown size={16} />
                        </button>
                    </>
                )}

                <Link
                    href={`/admin/edit?id=${item.oId}`}
                    className="bg-surface-hover text-body-muted hover:bg-secondary rounded p-2 hover:text-white"
                    data-tooltip-id={`edit-${item._id}`}
                    data-tooltip-content="Edit this item"
                >
                    <FaEdit size={16} />
                </Link>

                {isArchived ? (
                    <button
                        onClick={() => handleSetActive(item._id)}
                        className="bg-surface-hover text-body-muted rounded p-2 hover:bg-green-600 hover:text-white"
                        data-tooltip-id={`restore-${item._id}`}
                        data-tooltip-content="Restore this item"
                    >
                        <MdRestore size={16} />
                    </button>
                ) : (
                    <button
                        onClick={() => handleSetInactive(item._id)}
                        className="bg-surface-hover text-body-muted rounded p-2 hover:bg-red-600 hover:text-white"
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
        <div className="bg-surface flex h-full w-full flex-col">
            {/* Header */}
            <div className="border-line border-b p-4">
                <h1 className="text-body text-2xl font-bold">Manage Inventory</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-4 pb-0">
                <button
                    onClick={() => setActiveTab('order')}
                    className={`rounded-t-lg px-4 py-2 font-medium transition-colors ${
                        activeTab === 'order'
                            ? 'bg-surface-raised text-body border-gold-400 border-b-2'
                            : 'bg-surface-raised/50 text-body-subtle hover:bg-surface-raised hover:text-body'
                    }`}
                >
                    Order ({inventory.length})
                </button>
                <button
                    onClick={() => setActiveTab('archived')}
                    className={`rounded-t-lg px-4 py-2 font-medium transition-colors ${
                        activeTab === 'archived'
                            ? 'bg-surface-raised text-body border-gold-400 border-b-2'
                            : 'bg-surface-raised/50 text-body-subtle hover:bg-surface-raised hover:text-body'
                    }`}
                >
                    Archived ({archivedInventory.length})
                </button>
            </div>

            {error && (
                <p role="alert" className="border-danger/40 bg-danger-soft text-danger mx-4 mt-3 rounded-md border px-4 py-2.5 text-sm">
                    {error}
                </p>
            )}

            {/* Tab Content */}
            <div className="bg-surface-raised mx-4 mb-4 flex-grow overflow-y-auto rounded-b-lg p-4">
                {activeTab === 'order' && (
                    <div className="space-y-1">
                        {inventory.length === 0 ? (
                            <p className="text-body-subtle py-8 text-center">No active inventory items</p>
                        ) : (
                            inventory.map((item, index) => renderInventoryItem(item, index))
                        )}
                    </div>
                )}

                {activeTab === 'archived' && (
                    <div className="space-y-1">
                        {archivedInventory.length === 0 ? (
                            <p className="text-body-subtle py-8 text-center">No archived inventory items</p>
                        ) : (
                            archivedInventory.map((item, index) => renderInventoryItem(item, index, true))
                        )}
                    </div>
                )}
            </div>

            {/* Tooltips */}
            {inventory &&
                inventory.map((item) => (
                    <div key={`tooltips-${item._id}`}>
                        <Tooltip id={`move-up-${item._id}`} />
                        <Tooltip id={`move-down-${item._id}`} />
                        <Tooltip id={`edit-${item._id}`} />
                        <Tooltip id={`archive-${item._id}`} />
                    </div>
                ))}
            {archivedInventory &&
                archivedInventory.map((item) => (
                    <div key={`archived-tooltips-${item._id}`}>
                        <Tooltip id={`edit-${item._id}`} />
                        <Tooltip id={`restore-${item._id}`} />
                    </div>
                ))}
        </div>
    );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { Search, Package, ShoppingCart, X, ZoomIn, Trash2, ChevronLeft, Info } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

export default function ProjectInventoryClient({ projectId }: { projectId: string }) {
    const router = useRouter();
    const { user, isLoaded } = useUser();

    // Only call queries when user is loaded and authenticated
    const project = useQuery(api.projects.getProjectById, isLoaded && user ? { projectId: projectId as Id<'projects'> } : 'skip');
    const inventory = useQuery(api.inventory.getInventory, isLoaded && user ? { active: true } : 'skip');
    const projectInventory = useQuery(
        api.projects.getProjectInventory,
        isLoaded && user ? { projectId: projectId as Id<'projects'> } : 'skip',
    );
    const assignInventory = useMutation(api.projects.assignInventoryToProject);
    const returnInventory = useMutation(api.projects.returnInventoryFromProject);

    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [cartCategoryFilter, setCartCategoryFilter] = useState('');
    const [quantityOverlay, setQuantityOverlay] = useState<string | null>(null);
    const [overlayQuantity, setOverlayQuantity] = useState<number>(1);
    const [showItemInfo, setShowItemInfo] = useState<Record<string, boolean>>({});
    const overlayRef = useRef<HTMLDivElement>(null);

    // Close overlay when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
                setQuantityOverlay(null);
            }
        };

        if (quantityOverlay) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [quantityOverlay]);

    const handleAssignInventory = async (inventoryId: string) => {
        const quantity = quantities[inventoryId] || 1;
        try {
            await assignInventory({
                projectId: projectId as Id<'projects'>,
                inventoryId: inventoryId as Id<'inventory'>,
                quantity,
            });
            setQuantities({ ...quantities, [inventoryId]: 1 });
        } catch (error) {
            console.error('Error assigning inventory:', error);
            alert('Error assigning inventory. Please try again.');
        }
    };

    const handleReturnInventory = async (assignmentId: string) => {
        try {
            await returnInventory({
                projectInventoryId: assignmentId as Id<'projectInventory'>,
            });
            setQuantityOverlay(null); // Close overlay after deletion
        } catch (error) {
            console.error('Error returning inventory:', error);
            alert('Error returning inventory. Please try again.');
        }
    };

    const toggleItemInfo = (itemId: string) => {
        setShowItemInfo(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const handleUpdateQuantity = async (assignmentId: string, newQuantity: number) => {
        try {
            // Remove the old assignment
            await returnInventory({
                projectInventoryId: assignmentId as Id<'projectInventory'>,
            });
            
            // Find the inventory item to re-assign with new quantity
            const assignment = cartItems.find(item => item._id === assignmentId);
            if (assignment && assignment.inventoryId) {
                await assignInventory({
                    projectId: projectId as Id<'projects'>,
                    inventoryId: assignment.inventoryId as Id<'inventory'>,
                    quantity: newQuantity,
                });
            }
            setQuantityOverlay(null);
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Error updating quantity. Please try again.');
        }
    };

    // Helper function to check if item is already in cart
    const getItemCartAssignment = (inventoryId: string) => {
        return projectInventory?.find((assignment) => assignment.inventoryId === inventoryId && !assignment.returnedAt);
    };

    // Show loading while user auth is loading
    if (!isLoaded) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-stone-300">Loading...</div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        router.push('/sign-in');
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-stone-300">Redirecting to login...</div>
            </div>
        );
    }

    // Show loading while data is loading
    if (project === undefined || inventory === undefined || projectInventory === undefined) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-stone-300">Loading project data...</div>
            </div>
        );
    }

    if (project === null) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-stone-300">Project not found</div>
            </div>
        );
    }

    // Filter available inventory (only show items that are available)
    const availableInventory = inventory.filter((item) => item.count - item.inUse > 0);

    const filteredInventory = availableInventory.filter((item) => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Get unique categories from available inventory
    const categories = [...new Set(availableInventory.map((item) => item.category))].sort();
    
    // Get cart items and their categories
    const cartItems = projectInventory?.filter(assignment => !assignment.returnedAt) || [];
    const cartCategories = [...new Set(cartItems.map(assignment => assignment.inventory?.category).filter(Boolean))].sort();
    
    // Filter cart items by category
    const filteredCartItems = cartItems.filter(assignment => 
        !cartCategoryFilter || assignment.inventory?.category === cartCategoryFilter
    );

    return (
        <div className="flex h-[calc(100vh-50px)] flex-col">
            {/* Fixed Header */}
            <div className="flex-shrink-0 border-b border-stone-700 bg-stone-800">
                <div className="container mx-auto max-w-7xl p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.push(`/admin/projects/${projectId}/edit`)}
                                className="text-primary hover:text-secondary transition-colors"
                                data-tooltip-id="back-tooltip"
                                data-tooltip-content="Back to Project"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <h2 className="text-2xl font-bold text-stone-100">Select Inventory</h2>
                            <span className="text-sm text-stone-400">(showing {filteredInventory.length} items)</span>
                        </div>

                        {/* Cart Button */}
                        <button
                            onClick={() => setIsCartOpen(!isCartOpen)}
                            className="relative flex items-center gap-2 rounded-lg border-2 border-primary bg-transparent px-4 py-2 font-medium text-primary transition-colors hover:border-secondary hover:bg-secondary hover:text-stone-300"
                        >
                            <ShoppingCart size={20} />
                            <span className="hidden sm:inline">Project Cart</span>
                            {projectInventory.filter((a) => !a.returnedAt).length > 0 && (
                                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-secondary_dark">
                                    {projectInventory.filter((a) => !a.returnedAt).length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Search and Filter */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-stone-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded border border-stone-600 bg-stone-700 px-3 py-2 pl-10 text-stone-100 focus:border-primary focus:outline-none"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full rounded border border-stone-600 bg-stone-700 px-3 py-2 text-stone-100 focus:border-primary focus:outline-none"
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto bg-stone-900">
                <div className="container mx-auto max-w-7xl">
                    {/* Inventory Grid */}
                    <div className="p-6">
                        {filteredInventory.length === 0 ? (
                            <div className="py-12 text-center text-stone-400">
                                <Package size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No available inventory found</p>
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="mt-2 text-primary hover:underline">
                                        Clear search
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredInventory.map((item) => {
                                    const available = item.count - item.inUse;
                                    const quantity = quantities[item._id] || 1;

                                    return (
                                        <div
                                            key={item._id}
                                            className="overflow-hidden rounded-lg bg-stone-700 transition-colors hover:bg-stone-600"
                                        >
                                            {/* Item Image or Info Display */}
                                            <div className="relative aspect-square">
                                                {showItemInfo[item._id] ? (
                                                    // Show item info
                                                    <div className="h-full p-4 bg-stone-800 text-stone-100 text-xs overflow-auto">
                                                        <div className="space-y-2">
                                                            <div><span className="font-semibold">Price:</span> ${item.price}</div>
                                                            <div><span className="font-semibold">Cost:</span> ${item.cost || 'N/A'}</div>
                                                            <div><span className="font-semibold">Dimensions:</span> {item.realWidth}"W × {item.realHeight}"H × {item.realDepth}"D</div>
                                                            <div><span className="font-semibold">Category:</span> {item.category}</div>
                                                            <div><span className="font-semibold">Vendor:</span> {item.vendor || 'N/A'}</div>
                                                            <div><span className="font-semibold">Location:</span> {item.location || 'N/A'}</div>
                                                            <div><span className="font-semibold">Count:</span> {item.count}</div>
                                                            <div><span className="font-semibold">In Use:</span> {item.inUse}</div>
                                                            {item.description && <div><span className="font-semibold">Description:</span> {item.description}</div>}
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
                                                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                                                        />
                                                        {/* Category tag */}
                                                        <div className="absolute right-2 top-2 rounded bg-secondary px-2 py-1 text-xs font-medium text-white">
                                                            {item.category}
                                                        </div>
                                                        {/* Quantity available tag */}
                                                        <div className="absolute left-2 top-2 rounded bg-black bg-opacity-70 px-2 py-1 text-xs font-medium text-white">
                                                            {available}
                                                        </div>
                                                        {/* Enlarge button */}
                                                        <button
                                                            onClick={() => setSelectedImage(item.imagePath)}
                                                            className="absolute bottom-2 right-2 rounded bg-black bg-opacity-70 p-1 text-white transition-opacity hover:bg-opacity-90"
                                                        >
                                                            <ZoomIn size={14} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            <div className="p-4">
                                                <h3 className="mb-3 line-clamp-2 min-h-[2.5rem] font-medium text-stone-100">{item.name}</h3>

                                                {(() => {
                                                    const cartAssignment = getItemCartAssignment(item._id);

                                                    if (cartAssignment) {
                                                        // Item is already in cart - show info and trash buttons
                                                        return (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => toggleItemInfo(item._id)}
                                                                    className="flex-1 rounded border-2 border-blue-500 bg-transparent px-3 py-2 text-sm font-medium text-blue-400 transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center"
                                                                    data-tooltip-id="info-tooltip"
                                                                    data-tooltip-content="Show item info"
                                                                >
                                                                    <Info size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReturnInventory(cartAssignment._id)}
                                                                    className="flex-1 rounded border-2 border-red-500 bg-transparent px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center"
                                                                    data-tooltip-id="remove-tooltip"
                                                                    data-tooltip-content="Remove from project"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        );
                                                    }

                                                    // Item not in cart - show add button(s)
                                                    if (available === 1) {
                                                        return (
                                                            <button
                                                                onClick={() => handleAssignInventory(item._id)}
                                                                className="w-full rounded border-2 border-primary bg-transparent px-3 py-2 text-sm font-medium text-primary transition-colors hover:border-secondary hover:bg-secondary hover:text-stone-300"
                                                            >
                                                                Add to Project
                                                            </button>
                                                        );
                                                    } else {
                                                        return (
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    max={available}
                                                                    value={quantity}
                                                                    onChange={(e) =>
                                                                        setQuantities({
                                                                            ...quantities,
                                                                            [item._id]: parseInt(e.target.value) || 1,
                                                                        })
                                                                    }
                                                                    className="w-16 rounded border border-stone-600 bg-stone-600 px-2 py-1 text-center text-stone-100 focus:border-primary focus:outline-none"
                                                                />
                                                                <button
                                                                    onClick={() => handleAssignInventory(item._id)}
                                                                    disabled={quantity > available}
                                                                    className="flex-1 rounded border-2 border-primary bg-transparent px-3 py-1 text-sm font-medium text-primary transition-colors hover:border-secondary hover:bg-secondary hover:text-stone-300 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    Add to Project
                                                                </button>
                                                            </div>
                                                        );
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div>
                {/* Cart Sidebar Overlay */}
                {isCartOpen && (
                    <>
                        {/* Backdrop */}
                        <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsCartOpen(false)} />

                        {/* Sidebar */}
                        <div className="fixed right-0 top-0 z-50 flex h-full w-full transform flex-col overflow-hidden bg-stone-800 shadow-2xl transition-transform duration-300 ease-in-out sm:w-3/5 lg:w-2/5 xl:w-1/3">
                            {/* Cart Header */}
                            <div className="border-b border-stone-700 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <ShoppingCart className="text-primary" size={24} />
                                        <h2 className="text-2xl font-bold text-stone-100">Project Cart</h2>
                                        <span className="text-sm text-stone-400">
                                            ({cartItems.length} items)
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-700 hover:text-stone-200"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                
                                {/* Cart Category Filter */}
                                {cartCategories.length > 0 && (
                                    <select
                                        value={cartCategoryFilter}
                                        onChange={(e) => setCartCategoryFilter(e.target.value)}
                                        className="w-full rounded border border-stone-600 bg-stone-700 px-3 py-2 text-stone-100 focus:border-primary focus:outline-none"
                                    >
                                        <option value="">All Categories ({cartItems.length} items)</option>
                                        {cartCategories.map((category) => (
                                            <option key={category} value={category}>
                                                {category} ({cartItems.filter(item => item.inventory?.category === category).length} items)
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Cart Content */}
                            <div className="flex-1 overflow-y-auto">
                                <div className="p-6">
                                    {filteredCartItems.length === 0 ? (
                                        <div className="py-12 text-center text-stone-400">
                                            <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                                            {cartCategoryFilter ? (
                                                <>
                                                    <p>No items in "{cartCategoryFilter}" category.</p>
                                                    <button 
                                                        onClick={() => setCartCategoryFilter('')}
                                                        className="mt-2 text-primary hover:underline"
                                                    >
                                                        Show all categories
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <p>No inventory assigned to this project yet.</p>
                                                    <p className="mt-1 text-sm">Add items from the inventory grid.</p>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3 overflow-visible">
                                            {filteredCartItems.map((assignment) => (
                                                <div
                                                    key={assignment._id}
                                                    className="relative rounded-lg bg-stone-700 transition-colors hover:bg-stone-600"
                                                >
                                                    <div className="flex h-20">
                                                        {/* Item Image - Full Height */}
                                                        <div className="relative w-20 h-20 flex-shrink-0 cursor-pointer group" onClick={() => setSelectedImage(assignment.inventory?.imagePath || '')}>
                                                            <Image
                                                                src={assignment.inventory?.smallImagePath || ''}
                                                                alt={assignment.inventory?.name || ''}
                                                                fill
                                                                className="object-cover transition-transform group-hover:scale-105"
                                                                sizes="80px"
                                                            />
                                                            {/* Zoom overlay on hover */}
                                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                                                <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                                                            </div>
                                                        </div>

                                                        {/* Item Details */}
                                                        <div className="flex-1 p-3 flex flex-col justify-between">
                                                            <div>
                                                                <h3 className="font-medium text-stone-100 leading-tight line-clamp-2">
                                                                    {assignment.inventory?.name}
                                                                </h3>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2 text-sm text-stone-300">
                                                                    <span className="bg-secondary text-white px-2 py-1 rounded text-xs font-medium">
                                                                        {assignment.inventory?.category}
                                                                    </span>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            console.log('Quantity button clicked, current overlay:', quantityOverlay, 'assignment ID:', assignment._id);
                                                                            setOverlayQuantity(assignment.quantity);
                                                                            setQuantityOverlay(quantityOverlay === assignment._id ? null : assignment._id);
                                                                        }}
                                                                        className="bg-secondary text-white px-2 py-1 rounded text-xs font-medium hover:bg-opacity-80 cursor-pointer transition-colors"
                                                                    >
                                                                        Quantity: {assignment.quantity}
                                                                    </button>
                                                                    <span className="text-primary font-medium">
                                                                        ${(assignment.quantity * assignment.pricePerItem).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Quantity Adjustment Overlay */}
                                                            {quantityOverlay === assignment._id && (() => {
                                                                console.log('Rendering overlay for assignment:', assignment._id);
                                                                const inventoryItem = inventory?.find(item => item._id === assignment.inventoryId);
                                                                const maxAvailable = inventoryItem ? inventoryItem.count : 10; // Use total inventory count since we don't track inUse anymore
                                                                const currentQuantity = assignment.quantity;
                                                                const hasChanged = overlayQuantity !== currentQuantity;
                                                                
                                                                return (
                                                                    <div ref={overlayRef} className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-stone-800 border border-stone-600 rounded-md p-2 shadow-lg z-[100] w-48">
                                                                        <div className="mb-2">
                                                                            <div className="text-xs text-stone-200 font-medium mb-1 text-center">
                                                                                Update quantity (max {maxAvailable})
                                                                            </div>
                                                                            <div className="flex justify-between items-center mb-1">
                                                                                <span className="text-xs text-stone-400">1</span>
                                                                                <span className="text-xs text-stone-400">{maxAvailable}</span>
                                                                            </div>
                                                                            <input
                                                                                type="range"
                                                                                min="1"
                                                                                max={maxAvailable}
                                                                                value={overlayQuantity}
                                                                                onChange={(e) => {
                                                                                    setOverlayQuantity(parseInt(e.target.value));
                                                                                }}
                                                                                className="w-full h-1.5 bg-stone-700 rounded appearance-none cursor-pointer"
                                                                                style={{
                                                                                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${((overlayQuantity - 1) / (maxAvailable - 1)) * 100}%, #374151 ${((overlayQuantity - 1) / (maxAvailable - 1)) * 100}%, #374151 100%)`
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div className="flex gap-1">
                                                                            <button
                                                                                onClick={() => {
                                                                                    if (hasChanged) {
                                                                                        handleUpdateQuantity(assignment._id, overlayQuantity);
                                                                                    } else {
                                                                                        setQuantityOverlay(null);
                                                                                    }
                                                                                }}
                                                                                className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                                                                                    hasChanged 
                                                                                        ? 'bg-primary text-white hover:bg-primary_dark' 
                                                                                        : 'bg-stone-600 text-stone-400 hover:bg-stone-500'
                                                                                }`}
                                                                                data-tooltip-id="update-tooltip"
                                                                                data-tooltip-content={hasChanged ? `Update quantity to ${overlayQuantity}` : 'Close overlay'}
                                                                            >
                                                                                {hasChanged ? `Update (${overlayQuantity})` : `Current (${currentQuantity})`}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleReturnInventory(assignment._id)}
                                                                                className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                                                                                data-tooltip-id="remove-tooltip"
                                                                                data-tooltip-content="Remove item from project"
                                                                            >
                                                                                <Trash2 size={12} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Cart Footer - Total */}
                            {cartItems.length > 0 && (
                                <div className="bg-stone-750 border-t border-stone-700 p-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-medium text-stone-200">
                                            {cartCategoryFilter ? `${cartCategoryFilter} Total:` : 'Total Project Cost:'}
                                        </span>
                                        <span className="text-xl font-bold text-primary">
                                            $
                                            {filteredCartItems
                                                .reduce((sum, a) => sum + a.quantity * a.pricePerItem, 0)
                                                .toFixed(2)}
                                        </span>
                                    </div>
                                    {cartCategoryFilter && (
                                        <div className="text-center mt-2">
                                            <button
                                                onClick={() => setCartCategoryFilter('')}
                                                className="text-sm text-stone-400 hover:text-primary transition-colors"
                                            >
                                                View all items (${cartItems.reduce((sum, a) => sum + a.quantity * a.pricePerItem, 0).toFixed(2)} total)
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Image Modal */}
                {selectedImage && (
                    <>
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
                            onClick={() => setSelectedImage(null)}
                        >
                            <div className="relative max-h-full max-w-4xl">
                                <Image
                                    src={selectedImage}
                                    alt="Enlarged view"
                                    width={800}
                                    height={600}
                                    className="max-h-[90vh] rounded-lg object-contain"
                                />
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute right-4 top-4 rounded-full bg-black bg-opacity-50 p-2 text-white transition-opacity hover:bg-opacity-75"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <Tooltip id="update-tooltip" place="top" />
            <Tooltip id="remove-tooltip" place="top" />
            <Tooltip id="back-tooltip" place="top" />
            <Tooltip id="info-tooltip" place="top" />
        </div>
    );
}

'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { ArrowLeft, Search, Package, ShoppingCart, X, ZoomIn } from 'lucide-react';

export default function ProjectInventoryClient({ projectId }: { projectId: string }) {
    const router = useRouter();
    const { user, isLoaded } = useUser();
    
    // Only call queries when user is loaded and authenticated
    const project = useQuery(
        api.projects.getProjectById, 
        isLoaded && user ? { projectId: projectId as Id<"projects"> } : "skip"
    );
    const inventory = useQuery(
        api.inventory.getInventory,
        isLoaded && user ? { active: true } : "skip"
    );
    const projectInventory = useQuery(
        api.projects.getProjectInventory,
        isLoaded && user ? { projectId: projectId as Id<"projects"> } : "skip"
    );
    const assignInventory = useMutation(api.projects.assignInventoryToProject);
    const returnInventory = useMutation(api.projects.returnInventoryFromProject);
    
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleAssignInventory = async (inventoryId: string) => {
        const quantity = quantities[inventoryId] || 1;
        try {
            await assignInventory({
                projectId: projectId as Id<"projects">,
                inventoryId: inventoryId as Id<"inventory">,
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
                projectInventoryId: assignmentId as Id<"projectInventory">,
            });
        } catch (error) {
            console.error('Error returning inventory:', error);
            alert('Error returning inventory. Please try again.');
        }
    };

    // Show loading while user auth is loading
    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-stone-300">Loading...</div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        router.push('/sign-in');
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-stone-300">Redirecting to login...</div>
            </div>
        );
    }

    // Show loading while data is loading
    if (project === undefined || inventory === undefined || projectInventory === undefined) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-stone-300">Loading project data...</div>
            </div>
        );
    }

    if (project === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-stone-300">Project not found</div>
            </div>
        );
    }

    // Filter available inventory (only show items that are available)
    const availableInventory = inventory.filter(item => (item.count - item.inUse) > 0);
    
    const filteredInventory = availableInventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Get unique categories from available inventory
    const categories = [...new Set(availableInventory.map(item => item.category))].sort();

    return (
        <div className="container mx-auto max-w-7xl p-4">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push(`/admin/projects/${projectId}/edit`)}
                            className="flex items-center gap-2 rounded-lg border-2 bg-transparent border-stone-300 text-stone-300 px-4 py-2 font-medium transition-colors hover:bg-stone-700 hover:border-primary hover:text-primary"
                        >
                            <ArrowLeft size={16} />
                            Back to Project
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-stone-100">{project.name}</h1>
                            <p className="text-stone-400">Manage inventory assignments</p>
                        </div>
                    </div>
                    
                    {/* Cart Button */}
                    <button
                        onClick={() => setIsCartOpen(!isCartOpen)}
                        className="relative flex items-center gap-2 rounded-lg border-2 bg-transparent border-primary text-primary px-4 py-2 font-medium transition-colors hover:bg-secondary hover:border-secondary hover:text-stone-300"
                    >
                        <ShoppingCart size={20} />
                        <span className="hidden sm:inline">Project Cart</span>
                        {projectInventory.filter(a => !a.returnedAt).length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-primary text-secondary_dark rounded-full w-6 h-6 text-xs font-bold flex items-center justify-center">
                                {projectInventory.filter(a => !a.returnedAt).length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="relative">
                {/* Available Inventory */}
                <div className="bg-stone-800 rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-stone-700">
                        <div className="flex items-center gap-3 mb-4">
                            <Package className="text-primary" size={24} />
                            <h2 className="text-2xl font-bold text-stone-100">Available Inventory</h2>
                            <span className="text-sm text-stone-400">({filteredInventory.length} items)</span>
                        </div>
                        
                        {/* Search and Filter */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search inventory..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 rounded border border-stone-600 bg-stone-700 px-3 py-2 text-stone-100 focus:border-primary focus:outline-none"
                                />
                            </div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full rounded border border-stone-600 bg-stone-700 px-3 py-2 text-stone-100 focus:border-primary focus:outline-none"
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Inventory Grid */}
                    <div className="p-6">
                        {filteredInventory.length === 0 ? (
                            <div className="text-center py-12 text-stone-400">
                                <Package size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No available inventory found</p>
                                {searchTerm && (
                                    <button 
                                        onClick={() => setSearchTerm('')}
                                        className="mt-2 text-primary hover:underline"
                                    >
                                        Clear search
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {filteredInventory.map((item) => {
                                    const available = item.count - item.inUse;
                                    const quantity = quantities[item._id] || 1;
                                    
                                    return (
                                        <div key={item._id} className="bg-stone-700 rounded-lg overflow-hidden hover:bg-stone-600 transition-colors">
                                            {/* Item Image */}
                                            <div className="relative aspect-square">
                                                <Image
                                                    src={item.smallImagePath}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                                                />
                                                {/* Category tag */}
                                                <div className="absolute top-2 right-2 bg-secondary text-white px-2 py-1 rounded text-xs font-medium">
                                                    {item.category}
                                                </div>
                                                {/* Quantity available tag */}
                                                <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
                                                    {available}
                                                </div>
                                                {/* Enlarge button */}
                                                <button
                                                    onClick={() => setSelectedImage(item.imagePath)}
                                                    className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white p-1 rounded hover:bg-opacity-90 transition-opacity"
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                            </div>
                                            
                                            <div className="p-4">
                                                <h3 className="font-medium text-stone-100 mb-3 line-clamp-2 min-h-[2.5rem]">{item.name}</h3>
                                                
                                                {available === 1 ? (
                                                    <button
                                                        onClick={() => handleAssignInventory(item._id)}
                                                        className="w-full rounded border-2 bg-transparent border-primary text-primary px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:border-secondary hover:text-stone-300"
                                                    >
                                                        Add to Project
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={available}
                                                            value={quantity}
                                                            onChange={(e) => setQuantities({
                                                                ...quantities,
                                                                [item._id]: parseInt(e.target.value) || 1
                                                            })}
                                                            className="w-16 rounded border border-stone-600 bg-stone-600 px-2 py-1 text-stone-100 text-center focus:border-primary focus:outline-none"
                                                        />
                                                        <button
                                                            onClick={() => handleAssignInventory(item._id)}
                                                            disabled={quantity > available}
                                                            className="flex-1 rounded border-2 bg-transparent border-primary text-primary px-3 py-1 text-sm font-medium transition-colors hover:bg-secondary hover:border-secondary hover:text-stone-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Add to Project
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                
                {/* Cart Sidebar Overlay */}
                {isCartOpen && (
                    <>
                        {/* Backdrop */}
                        <div 
                            className="fixed inset-0 bg-black bg-opacity-50 z-40"
                            onClick={() => setIsCartOpen(false)}
                        />
                        
                        {/* Sidebar */}
                        <div className="fixed top-0 right-0 h-full w-full sm:w-3/5 lg:w-2/5 xl:w-1/3 bg-stone-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-hidden flex flex-col">
                            {/* Cart Header */}
                            <div className="p-6 border-b border-stone-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ShoppingCart className="text-primary" size={24} />
                                    <h2 className="text-2xl font-bold text-stone-100">Project Cart</h2>
                                    <span className="text-sm text-stone-400">
                                        ({projectInventory.filter(a => !a.returnedAt).length} items)
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="p-2 rounded-lg hover:bg-stone-700 transition-colors text-stone-400 hover:text-stone-200"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            {/* Cart Content */}
                            <div className="flex-1 overflow-y-auto">
                                <div className="p-6">
                                    {projectInventory.filter(a => !a.returnedAt).length === 0 ? (
                                        <div className="text-center py-12 text-stone-400">
                                            <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                                            <p>No inventory assigned to this project yet.</p>
                                            <p className="text-sm mt-1">Add items from the inventory grid.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {projectInventory
                                                .filter(assignment => !assignment.returnedAt)
                                                .map((assignment) => (
                                                <div key={assignment._id} className="bg-stone-700 rounded-lg p-4 hover:bg-stone-600 transition-colors">
                                                    <div className="flex items-start gap-3">
                                                        {/* Item Image */}
                                                        <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                                                            <Image
                                                                src={assignment.inventory?.smallImagePath || ''}
                                                                alt={assignment.inventory?.name || ''}
                                                                fill
                                                                className="object-cover"
                                                                sizes="64px"
                                                            />
                                                        </div>
                                                        
                                                        {/* Item Details */}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-medium text-stone-100 mb-1 truncate">
                                                                {assignment.inventory?.name}
                                                            </h3>
                                                            <div className="flex items-center gap-3 text-sm text-stone-300 mb-2">
                                                                <span>Qty: {assignment.quantity}</span>
                                                                <span>${assignment.pricePerItem} each</span>
                                                            </div>
                                                            <p className="text-sm font-medium text-primary">
                                                                Total: ${(assignment.quantity * assignment.pricePerItem).toFixed(2)}
                                                            </p>
                                                            <p className="text-xs text-stone-500 mt-1">
                                                                Added: {new Date(assignment.assignedAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        
                                                        {/* Remove Button */}
                                                        <button
                                                            onClick={() => handleReturnInventory(assignment._id)}
                                                            className="flex-shrink-0 p-2 rounded hover:bg-red-600 hover:text-white text-red-400 transition-colors"
                                                            title="Remove from project"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Cart Footer - Total */}
                            {projectInventory.filter(a => !a.returnedAt).length > 0 && (
                                <div className="p-6 border-t border-stone-700 bg-stone-750">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-medium text-stone-200">Total Project Cost:</span>
                                        <span className="text-xl font-bold text-primary">
                                            ${projectInventory
                                                .filter(a => !a.returnedAt)
                                                .reduce((sum, a) => sum + (a.quantity * a.pricePerItem), 0)
                                                .toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
                
                {/* Image Modal */}
                {selectedImage && (
                    <>
                        <div 
                            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
                            onClick={() => setSelectedImage(null)}
                        >
                            <div className="relative max-w-4xl max-h-full">
                                <Image
                                    src={selectedImage}
                                    alt="Enlarged view"
                                    width={800}
                                    height={600}
                                    className="object-contain max-h-[90vh] rounded-lg"
                                />
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
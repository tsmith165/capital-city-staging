'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import ProjectResizeUploader from '@/components/ProjectResizeUploader';
import { Id } from '@/convex/_generated/dataModel';
import { ChevronDown, ChevronRight, Plus, Bell, Loader2, Info, Trash2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { Tooltip } from 'react-tooltip';

interface UploadedImage {
    fileName: string;
    originalImageUrl: string;
    smallImageUrl: string;
    originalWidth: number;
    originalHeight: number;
    smallWidth: number;
    smallHeight: number;
}

export default function EditProjectClient({ projectId }: { projectId: string }) {
    const router = useRouter();
    const { user, isLoaded } = useUser();

    // All hooks must be called at the top level before any conditional returns
    const project = useQuery(api.projects.getProjectById, isLoaded && user ? { projectId: projectId as Id<'projects'> } : 'skip');
    const projectInventory = useQuery(
        api.projects.getProjectInventory,
        isLoaded && user ? { projectId: projectId as Id<'projects'> } : 'skip',
    );
    const availableInventory = useQuery(api.inventory.getInventory, isLoaded && user ? { active: true } : 'skip');

    const updateProject = useMutation(api.projects.updateProject);
    const addProjectImage = useMutation(api.projects.addProjectImage);
    const removeProjectImage = useMutation(api.projects.removeProjectImage);
    const reorderProjectImages = useMutation(api.projects.reorderProjectImages);
    const assignInventoryToProject = useMutation(api.projects.assignInventoryToProject);
    const returnInventoryFromProject = useMutation(api.projects.returnInventoryFromProject);

    const [formData, setFormData] = useState({
        name: '',
        status: 'draft' as const,
        address: '',
        startDate: '',
        endDate: '',
        revenue: '',
        notes: '',
        highlighted: false,
    });

    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
    const [isUploadingImages, setIsUploadingImages] = useState(false);

    // Tab state
    const [activeTab, setActiveTab] = useState<'details' | 'images' | 'inventory'>('details');
    const [inventoryFilter, setInventoryFilter] = useState('');
    const [showItemInfo, setShowItemInfo] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || '',
                status:
                    project.status === 'active' || project.status === 'completed' || project.status === 'cancelled'
                        ? 'draft'
                        : project.status || 'draft',
                address: project.address || '',
                startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
                endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
                revenue: project.revenue ? project.revenue.toString() : '',
                notes: project.notes || '',
                highlighted: project.highlighted || false,
            });
        }
    }, [project]);

    const handleUploadComplete = async (images: UploadedImage[]) => {
        setIsUploadingImages(true);
        setUploadedImages((prev) => [...prev, ...images]);

        try {
            // Add images to project
            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                const currentImageCount = (project?.images?.length || 0) + i;
                await addProjectImage({
                    projectId: projectId as Id<'projects'>,
                    imagePath: image.originalImageUrl,
                    width: image.originalWidth,
                    height: image.originalHeight,
                    thumbnailPath: image.smallImageUrl,
                    thumbnailWidth: image.smallWidth,
                    thumbnailHeight: image.smallHeight,
                    displayOrder: currentImageCount,
                });
            }
        } finally {
            setIsUploadingImages(false);
        }
    };

    const handleResetImages = () => {
        setUploadedImages([]);
    };

    const handleRemoveImage = async (imageId: string) => {
        await removeProjectImage({ imageId: imageId as Id<'projectImages'> });
    };

    const handleDragStart = (index: number) => {
        setDraggedImageIndex(index);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedImageIndex === null || draggedImageIndex === dropIndex || !project?.images) return;

        const newOrder = [...project.images];
        const draggedImage = newOrder[draggedImageIndex];
        newOrder.splice(draggedImageIndex, 1);
        newOrder.splice(dropIndex, 0, draggedImage);

        // Update display order in database
        const imageIds = newOrder.map((img) => img._id);
        await reorderProjectImages({
            projectId: projectId as Id<'projects'>,
            imageIds: imageIds as Id<'projectImages'>[],
        });

        setDraggedImageIndex(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await updateProject({
                projectId: projectId as Id<'projects'>,
                name: formData.name,
                status: formData.status,
                address: formData.address || undefined,
                startDate: formData.startDate ? new Date(formData.startDate).getTime() : undefined,
                endDate: formData.endDate ? new Date(formData.endDate).getTime() : undefined,
                revenue: formData.revenue ? parseFloat(formData.revenue) : undefined,
                notes: formData.notes || undefined,
                highlighted: formData.highlighted,
            });

            router.push('/admin/projects');
        } catch (error) {
            console.error('Error updating project:', error);
            alert('Error updating project. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
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

    // Show loading while project data is loading
    if (project === undefined) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-stone-300">Loading project...</div>
            </div>
        );
    }

    // Show not found if project doesn't exist
    if (project === null) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-stone-300">Project not found</div>
            </div>
        );
    }

    const handleReturnInventory = async (assignmentId: string) => {
        try {
            await returnInventoryFromProject({
                projectInventoryId: assignmentId as Id<'projectInventory'>,
            });
        } catch (error) {
            console.error('Error returning inventory:', error);
            alert('Error returning inventory. Please try again.');
        }
    };

    const toggleItemInfo = (itemId: string) => {
        setShowItemInfo((prev) => ({
            ...prev,
            [itemId]: !prev[itemId],
        }));
    };

    return (
        <div className="container mx-auto max-w-5xl p-4">
            {/* Tab Navigation */}
            <div className="mb-6 flex space-x-1 rounded-lg bg-stone-800 p-1">
                <button
                    type="button"
                    onClick={() => setActiveTab('details')}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'details' ? 'bg-primary text-white' : 'text-stone-400 hover:text-stone-200'
                    }`}
                >
                    Details
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('images')}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'images' ? 'bg-primary text-white' : 'text-stone-400 hover:text-stone-200'
                    }`}
                >
                    Images {project.images && project.images.length > 0 && <span className="ml-1 text-xs">({project.images.length})</span>}
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('inventory')}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'inventory' ? 'bg-primary text-white' : 'text-stone-400 hover:text-stone-200'
                    }`}
                >
                    Inventory{' '}
                    {projectInventory && projectInventory.length > 0 && (
                        <span className="ml-1 text-xs">({projectInventory.filter((item) => !item.returnedAt).length})</span>
                    )}
                </button>
            </div>

            {/* Tab Content */}
            <div className="rounded-lg bg-stone-800">
                {activeTab === 'details' && (
                    <form onSubmit={handleSubmit} className="p-6">
                        <h2 className="mb-6 text-2xl font-bold text-stone-100">Project Details</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-stone-200">Project Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded border border-stone-600 bg-stone-700 px-3 py-2 text-stone-100 focus:border-primary focus:outline-none"
                                    placeholder="Enter project name"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-stone-200">Status *</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full rounded border border-stone-600 bg-stone-700 px-3 py-2 text-stone-100 focus:border-primary focus:outline-none"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-stone-200">Address</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full rounded border border-stone-600 bg-stone-700 px-3 py-2 text-stone-100 focus:border-primary focus:outline-none"
                                    placeholder="Project address"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-stone-200">Start Date</label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full rounded border border-stone-600 bg-stone-700 px-3 py-2 text-stone-100 focus:border-primary focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-stone-200">End Date</label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full rounded border border-stone-600 bg-stone-700 px-3 py-2 text-stone-100 focus:border-primary focus:outline-none"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-stone-200">Revenue ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.revenue}
                                    onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                                    className="w-full rounded border border-stone-600 bg-stone-700 px-3 py-2 text-stone-100 focus:border-primary focus:outline-none"
                                    placeholder="Project revenue"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-stone-200">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    className="w-full rounded border border-stone-600 bg-stone-700 px-3 py-2 text-stone-100 focus:border-primary focus:outline-none"
                                    placeholder="Project notes..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <div className="flex items-center justify-between">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`rounded px-4 py-2 font-medium transition-colors ${
                                            isSubmitting
                                                ? 'cursor-not-allowed bg-stone-600 text-stone-400'
                                                : 'bg-primary text-white hover:bg-primary_dark'
                                        }`}
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Project'}
                                    </button>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="highlighted"
                                            checked={formData.highlighted}
                                            onChange={(e) => setFormData({ ...formData, highlighted: e.target.checked })}
                                            className="mr-2 h-4 w-4 rounded border-stone-600 bg-stone-700 text-primary focus:ring-2 focus:ring-primary"
                                        />
                                        <label htmlFor="highlighted" className="text-sm font-medium text-stone-200">
                                            Show in portfolio (highlighted)
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                )}

                {activeTab === 'images' && (
                    <div className="p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-stone-100">Project Images</h2>
                            <button
                                type="button"
                                onClick={() => {
                                    const uploadInput = document.querySelector('#project-uploader input') as HTMLInputElement;
                                    if (uploadInput) uploadInput.click();
                                }}
                                disabled={isUploadingImages}
                                className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                                    isUploadingImages
                                        ? 'cursor-not-allowed border-stone-600 bg-stone-600 text-stone-400'
                                        : 'border-primary bg-transparent text-primary hover:border-secondary hover:bg-secondary hover:text-stone-300'
                                }`}
                                title={isUploadingImages ? 'Processing images...' : 'Add images'}
                            >
                                {isUploadingImages ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Hidden ProjectResizeUploader */}
                            <div id="project-uploader" className="hidden">
                                <ProjectResizeUploader
                                    onUploadComplete={handleUploadComplete}
                                    onResetInputs={handleResetImages}
                                    disabled={isSubmitting}
                                />
                            </div>

                            {/* Upload Loading Spinner */}
                            {isUploadingImages && (
                                <div className="flex items-center justify-center py-8">
                                    <div className="flex items-center gap-3 rounded-lg bg-stone-700 px-4 py-3">
                                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                        <span className="text-sm text-stone-200">Processing uploaded images...</span>
                                    </div>
                                </div>
                            )}

                            {/* Existing Images */}
                            {project.images && project.images.length > 0 && (
                                <div>
                                    <div className="mb-3 flex items-center gap-2 rounded-lg bg-green-300/70 p-2 text-stone-950">
                                        <Bell size={16} />
                                        <span className="text-sm">Drag and drop to reorder</span>
                                    </div>
                                    <div className="scrollbar-thin scrollbar-thumb-stone-600 scrollbar-track-stone-800 max-h-120 overflow-y-auto">
                                        <div className="grid grid-cols-2 gap-4 pr-2 md:grid-cols-3 lg:grid-cols-4">
                                            {project.images.map((image, index) => (
                                                <div
                                                    key={image._id}
                                                    className="group relative cursor-move"
                                                    draggable
                                                    onDragStart={() => handleDragStart(index)}
                                                    onDragOver={handleDragOver}
                                                    onDrop={(e) => handleDrop(e, index)}
                                                >
                                                    <img
                                                        src={image.thumbnailPath || image.imagePath}
                                                        alt={`Project image ${index + 1}`}
                                                        className="aspect-square w-full rounded-lg object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(image._id)}
                                                        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                                    >
                                                        ×
                                                    </button>
                                                    <div className="absolute bottom-2 left-2 rounded bg-black bg-opacity-60 px-2 py-1 text-xs text-white">
                                                        {index + 1}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-stone-100">Project Inventory</h2>
                            <div className="flex items-center gap-2">
                                {/* Category Filter */}
                                {projectInventory && projectInventory.filter((item) => !item.returnedAt).length > 0 && (
                                    <select
                                        value={inventoryFilter}
                                        onChange={(e) => setInventoryFilter(e.target.value)}
                                        className="rounded border border-stone-600 bg-stone-700 px-2 py-1 text-xs text-stone-100 focus:border-primary focus:outline-none"
                                    >
                                        <option value="">All Categories</option>
                                        {[
                                            ...new Set(
                                                projectInventory
                                                    .filter((item) => !item.returnedAt)
                                                    .map((item) => item.inventory?.category)
                                                    .filter(Boolean),
                                            ),
                                        ]
                                            .sort()
                                            .map((category) => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                    </select>
                                )}
                                <button
                                    type="button"
                                    onClick={() => router.push(`/admin/projects/${projectId}/inventory`)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary bg-transparent text-primary transition-colors hover:border-secondary hover:bg-secondary hover:text-stone-300"
                                    title="Assign inventory"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="px-6 pb-6 pt-4">
                            <div className="space-y-4">
                                {/* Assigned Inventory */}
                                {projectInventory && projectInventory.filter((item) => !item.returnedAt).length > 0 ? (
                                    <div className="scrollbar-thin scrollbar-thumb-stone-600 scrollbar-track-stone-800 max-h-120 overflow-y-auto">
                                        <div className="grid grid-cols-1 gap-4 pr-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                            {projectInventory
                                                .filter((item) => !item.returnedAt)
                                                .filter((item) => !inventoryFilter || item.inventory?.category === inventoryFilter)
                                                .map((assignment) => (
                                                    <div
                                                        key={assignment._id}
                                                        className="group relative overflow-hidden rounded-lg bg-stone-700 transition-all hover:bg-stone-600"
                                                    >
                                                        {/* Image or Info Display */}
                                                        <div className="relative aspect-square overflow-hidden">
                                                            {showItemInfo[assignment._id] ? (
                                                                // Show item info
                                                                <div className="flex h-full flex-col justify-center bg-gradient-to-br from-stone-800 to-stone-900 p-4 text-stone-100">
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="text-sm font-bold text-primary">
                                                                                ${assignment.inventory?.price}
                                                                            </div>
                                                                            <div className="text-xs text-stone-400">{assignment.inventory?.category}</div>
                                                                        </div>
                                                                        <div className="text-xs text-stone-300">
                                                                            <span className="font-medium">Size:</span>{' '}
                                                                            {assignment.inventory?.realWidth}" ×{' '}
                                                                            {assignment.inventory?.realHeight}" ×{' '}
                                                                            {assignment.inventory?.realDepth}"
                                                                        </div>
                                                                        <div className="text-xs text-stone-300">
                                                                            <span className="font-medium">Available:</span>{' '}
                                                                            {(assignment.inventory?.count || 0) -
                                                                                (assignment.inventory?.inUse || 0)}{' '}
                                                                            of {assignment.inventory?.count}
                                                                        </div>
                                                                        {assignment.inventory?.location && (
                                                                            <div className="text-xs text-stone-400">
                                                                                📍 {assignment.inventory.location}
                                                                            </div>
                                                                        )}
                                                                        {assignment.inventory?.description && (
                                                                            <div className="text-xs text-stone-400 border-t border-stone-700 pt-2">
                                                                                {assignment.inventory.description}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                // Show item image
                                                                <>
                                                                    <Image
                                                                        src={assignment.inventory?.imagePath || '/placeholder-image.jpg'}
                                                                        alt={assignment.inventory?.name || 'Inventory item'}
                                                                        width={200}
                                                                        height={200}
                                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                                    />
                                                                    {/* Category tag */}
                                                                    {assignment.inventory?.category && (
                                                                        <div className="absolute right-2 top-2 rounded bg-secondary px-2 py-1 text-xs font-medium text-white">
                                                                            {assignment.inventory.category}
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Info overlay */}
                                                        <div className="p-3">
                                                            <h3 className="mb-2 truncate font-medium text-stone-100">
                                                                {assignment.inventory?.name}
                                                            </h3>

                                                            {/* Quantity info and buttons on same row */}
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-sm text-stone-400">
                                                                    Qty: {assignment.quantity} • ${assignment.pricePerItem} each
                                                                </p>

                                                                {/* Info and Trash buttons */}
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleItemInfo(assignment._id)}
                                                                        className="flex h-6 w-6 items-center justify-center rounded border border-blue-500 bg-transparent text-blue-400 transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                                                                        data-tooltip-id="info-tooltip"
                                                                        data-tooltip-content="Show item info"
                                                                    >
                                                                        <Info size={10} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleReturnInventory(assignment._id)}
                                                                        className="flex h-6 w-6 items-center justify-center rounded border border-red-500 bg-transparent text-red-400 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white"
                                                                        data-tooltip-id="remove-tooltip"
                                                                        data-tooltip-content="Remove from project"
                                                                    >
                                                                        <Trash2 size={10} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-stone-400">
                                        <p>No inventory assigned to this project</p>
                                        <p className="mt-1 text-sm">Click the + button to assign inventory</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tooltips */}
            <Tooltip id="info-tooltip" place="top" />
            <Tooltip id="remove-tooltip" place="top" />
        </div>
    );
}

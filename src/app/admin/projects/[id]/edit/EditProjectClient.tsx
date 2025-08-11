'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import ProjectResizeUploader from '@/components/ProjectResizeUploader';
import { Id } from '@/convex/_generated/dataModel';
import { ChevronDown, ChevronRight, Plus, Bell } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

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

    // Collapsible sections state
    const [detailsExpanded, setDetailsExpanded] = useState(false);
    const [imagesExpanded, setImagesExpanded] = useState(false);
    const [inventoryExpanded, setInventoryExpanded] = useState(false);

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
        setUploadedImages((prev) => [...prev, ...images]);

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

    return (
        <div className="container mx-auto max-w-5xl p-4">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Project Details Section */}
                <div className="overflow-hidden rounded-lg bg-stone-800">
                    <button
                        type="button"
                        onClick={() => setDetailsExpanded(!detailsExpanded)}
                        className="flex w-full items-center p-6 transition-colors hover:bg-stone-700"
                    >
                        <div className="mr-3 flex items-center text-stone-300">
                            {detailsExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </div>
                        <h2 className="text-2xl font-bold text-stone-100">Project Details</h2>
                    </button>

                    {detailsExpanded && (
                        <div className="px-6 pb-6">
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
                    )}
                </div>

                {/* Project Images Section */}
                <div className="overflow-hidden rounded-lg bg-stone-800">
                    <div className="flex w-full items-center justify-between p-6 transition-colors hover:bg-stone-700">
                        <button type="button" onClick={() => setImagesExpanded(!imagesExpanded)} className="flex flex-1 items-center">
                            <div className="mr-3 flex items-center text-stone-300">
                                {imagesExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-stone-100">Project Images</h2>
                                {project.images && project.images.length > 0 && (
                                    <span className="text-sm text-stone-400">({project.images.length})</span>
                                )}
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const uploadInput = document.querySelector('#project-uploader input') as HTMLInputElement;
                                if (uploadInput) uploadInput.click();
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary bg-transparent text-primary transition-colors hover:border-secondary hover:bg-secondary hover:text-stone-300"
                            title="Add images"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    {imagesExpanded && (
                        <div className="px-6">
                            <div className="space-y-4">
                                {/* Hidden ProjectResizeUploader */}
                                <div id="project-uploader" className="hidden">
                                    <ProjectResizeUploader
                                        onUploadComplete={handleUploadComplete}
                                        onResetInputs={handleResetImages}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Existing Images */}
                                {project.images && project.images.length > 0 && (
                                    <div>
                                        <div className="mb-3 flex items-center gap-2 rounded-lg bg-green-300/70 p-2 text-stone-950">
                                            <Bell size={16} />
                                            <span className="text-sm">Drag and drop to reorder</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
                                                        className="h-32 w-full rounded-lg object-cover"
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
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Project Inventory Section */}
                <div className="overflow-hidden rounded-lg bg-stone-800">
                    <div className="flex w-full items-center justify-between p-6 transition-colors hover:bg-stone-700">
                        <button type="button" onClick={() => setInventoryExpanded(!inventoryExpanded)} className="flex flex-1 items-center">
                            <div className="mr-3 flex items-center text-stone-300">
                                {inventoryExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-stone-100">Project Inventory</h2>
                                {projectInventory && projectInventory.length > 0 && (
                                    <span className="text-sm text-stone-400">
                                        ({projectInventory.filter((item) => !item.returnedAt).length} assigned)
                                    </span>
                                )}
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push(`/admin/projects/${projectId}/inventory`)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary bg-transparent text-primary transition-colors hover:border-secondary hover:bg-secondary hover:text-stone-300"
                            title="Assign inventory"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    {inventoryExpanded && (
                        <div className="px-6 pb-6">
                            <div className="space-y-4">
                                {/* Assigned Inventory */}
                                {projectInventory && projectInventory.filter((item) => !item.returnedAt).length > 0 ? (
                                    <div className="space-y-2">
                                        {projectInventory
                                            .filter((item) => !item.returnedAt)
                                            .map((assignment) => (
                                                <div
                                                    key={assignment._id}
                                                    className="flex items-center justify-between rounded-lg bg-stone-700 p-3"
                                                >
                                                    <div className="flex-1">
                                                        <p className="font-medium text-stone-100">{assignment.inventory?.name}</p>
                                                        <p className="text-sm text-stone-400">
                                                            Quantity: {assignment.quantity} • ${assignment.pricePerItem} each
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReturnInventory(assignment._id)}
                                                        className="rounded bg-red-600 px-3 py-1 text-sm text-white transition-colors hover:bg-red-700"
                                                    >
                                                        Return
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-stone-400">
                                        <p>No inventory assigned to this project</p>
                                        <p className="mt-1 text-sm">Click the + button to assign inventory</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}

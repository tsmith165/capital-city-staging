'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import ProjectResizeUploader from '@/components/ProjectResizeUploader';
import { Id } from '@/convex/_generated/dataModel';
import { Plus, Bell, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

import CheckInDialog from './CheckInDialog';
import ProjectInventoryTab from './ProjectInventoryTab';
import { CLOSING_STATUSES, type ProjectAssignmentLine, type ProjectStatus } from './project.types';

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
    const assignments = useQuery(
        api.assignments.getProjectAssignments,
        isLoaded && user ? { projectId: projectId as Id<'projects'> } : 'skip',
    );

    const updateProject = useMutation(api.projects.updateProject);
    const addProjectImage = useMutation(api.projects.addProjectImage);
    const removeProjectImage = useMutation(api.projects.removeProjectImage);
    const reorderProjectImages = useMutation(api.projects.reorderProjectImages);

    const [formData, setFormData] = useState({
        name: '',
        status: 'draft' as ProjectStatus,
        address: '',
        startDate: '',
        endDate: '',
        revenue: '',
        notes: '',
        highlighted: false,
    });

    const [, setUploadedImages] = useState<UploadedImage[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
    const [isUploadingImages, setIsUploadingImages] = useState(false);

    // Tab state
    const [activeTab, setActiveTab] = useState<'details' | 'images' | 'inventory'>('details');
    const [saveError, setSaveError] = useState<string | null>(null);
    /* Held while the check-in dialog is open, so submitting again can carry the confirmed ids. */
    const [pendingCheckIn, setPendingCheckIn] = useState<'completed' | 'cancelled' | null>(null);

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || '',
                /*
                 * This used to force every non-draft project back to 'draft' when the form loaded, so
                 * opening a completed job and saving it silently reopened it.
                 */
                status: project.status ?? 'draft',
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

    const save = async (checkInAssignmentIds?: string[]) => {
        setIsSubmitting(true);
        setSaveError(null);

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
                checkInAssignmentIds: checkInAssignmentIds?.length ? (checkInAssignmentIds as Id<'projectInventory'>[]) : undefined,
            });

            router.push('/admin/projects');
        } catch (error) {
            setSaveError(error instanceof Error ? error.message : 'Could not save this project. Try again.');
            setPendingCheckIn(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Finishing a job is the moment its furniture should come home, so a closing status with
     * inventory still assigned opens the check-in step first. Nothing about the save is blocked by
     * it — the dialog offers a way through either way — but it stops the job from quietly closing
     * while the catalog still believes the furniture is unavailable.
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const closing = CLOSING_STATUSES.includes(formData.status);
        const stillOut = assignments?.open ?? [];

        if (closing && stillOut.length > 0 && project?.status !== formData.status) {
            setPendingCheckIn(formData.status as 'completed' | 'cancelled');
            return;
        }

        void save();
    };

    // Show loading while user auth is loading
    if (!isLoaded) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-body-muted">Loading...</div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        router.push('/sign-in');
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-body-muted">Redirecting to login...</div>
            </div>
        );
    }

    // Show loading while project data is loading
    if (project === undefined) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-body-muted">Loading project...</div>
            </div>
        );
    }

    // Show not found if project doesn't exist
    if (project === null) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-body-muted">Project not found</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-5xl p-4">
            {/* Tab Navigation */}
            <div className="bg-surface-raised mb-6 flex space-x-1 rounded-lg p-1">
                <button
                    type="button"
                    onClick={() => setActiveTab('details')}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'details' ? 'bg-primary text-white' : 'text-body-subtle hover:text-body'
                    }`}
                >
                    Details
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('images')}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'images' ? 'bg-primary text-white' : 'text-body-subtle hover:text-body'
                    }`}
                >
                    Images {project.images && project.images.length > 0 && <span className="ml-1 text-xs">({project.images.length})</span>}
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('inventory')}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'inventory' ? 'bg-primary text-white' : 'text-body-subtle hover:text-body'
                    }`}
                >
                    Inventory{' '}
                    {assignments && assignments.open.length > 0 && <span className="ml-1 text-xs">({assignments.open.length})</span>}
                </button>
            </div>

            {/* Tab Content */}
            <div className="bg-surface-raised rounded-lg">
                {activeTab === 'details' && (
                    <form onSubmit={handleSubmit} className="p-6">
                        <h2 className="text-body mb-6 text-2xl font-bold">Project Details</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-body mb-1 block text-sm font-medium">Project Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="border-line-strong bg-surface-overlay text-body focus:border-primary w-full rounded border px-3 py-2 focus:outline-none"
                                    placeholder="Enter project name"
                                />
                            </div>

                            <div>
                                <label className="text-body mb-1 block text-sm font-medium">Status *</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    className="border-line-strong bg-surface-overlay text-body focus:border-primary w-full rounded border px-3 py-2 focus:outline-none"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-body mb-1 block text-sm font-medium">Address</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="border-line-strong bg-surface-overlay text-body focus:border-primary w-full rounded border px-3 py-2 focus:outline-none"
                                    placeholder="Project address"
                                />
                            </div>

                            <div>
                                <label className="text-body mb-1 block text-sm font-medium">Start Date</label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="border-line-strong bg-surface-overlay text-body focus:border-primary w-full rounded border px-3 py-2 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-body mb-1 block text-sm font-medium">End Date</label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="border-line-strong bg-surface-overlay text-body focus:border-primary w-full rounded border px-3 py-2 focus:outline-none"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-body mb-1 block text-sm font-medium">Revenue ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.revenue}
                                    onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                                    className="border-line-strong bg-surface-overlay text-body focus:border-primary w-full rounded border px-3 py-2 focus:outline-none"
                                    placeholder="Project revenue"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-body mb-1 block text-sm font-medium">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    className="border-line-strong bg-surface-overlay text-body focus:border-primary w-full rounded border px-3 py-2 focus:outline-none"
                                    placeholder="Project notes..."
                                />
                            </div>

                            {saveError && (
                                <p
                                    role="alert"
                                    className="border-danger/40 bg-danger-soft text-danger rounded-md border px-4 py-2.5 text-sm md:col-span-2"
                                >
                                    {saveError}
                                </p>
                            )}

                            <div className="md:col-span-2">
                                <div className="flex items-center justify-between">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`rounded px-4 py-2 font-medium transition-colors ${
                                            isSubmitting
                                                ? 'bg-surface-hover text-body-subtle cursor-not-allowed'
                                                : 'bg-primary hover:bg-primary_dark text-white'
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
                                            className="border-line-strong bg-surface-overlay text-primary focus:ring-primary mr-2 h-4 w-4 rounded focus:ring-2"
                                        />
                                        <label htmlFor="highlighted" className="text-body text-sm font-medium">
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
                            <h2 className="text-body text-2xl font-bold">Project Images</h2>
                            <button
                                type="button"
                                onClick={() => {
                                    const uploadInput = document.querySelector('#project-uploader input') as HTMLInputElement;
                                    if (uploadInput) uploadInput.click();
                                }}
                                disabled={isUploadingImages}
                                className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                                    isUploadingImages
                                        ? 'border-line-strong bg-surface-hover text-body-subtle cursor-not-allowed'
                                        : 'border-primary text-primary hover:border-secondary hover:bg-secondary hover:text-body-muted bg-transparent'
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
                                    <div className="bg-surface-overlay flex items-center gap-3 rounded-lg px-4 py-3">
                                        <Loader2 className="text-primary h-5 w-5 animate-spin" />
                                        <span className="text-body text-sm">Processing uploaded images...</span>
                                    </div>
                                </div>
                            )}

                            {/* Existing Images */}
                            {project.images && project.images.length > 0 && (
                                <div>
                                    <div className="text-body-inverse mb-3 flex items-center gap-2 rounded-lg bg-green-300/70 p-2">
                                        <Bell size={16} />
                                        <span className="text-sm">Drag and drop to reorder</span>
                                    </div>
                                    <div className="max-h-120 overflow-y-auto">
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
                                                        className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                                    >
                                                        ×
                                                    </button>
                                                    <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
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
                        <ProjectInventoryTab projectId={projectId} />
                    </div>
                )}
            </div>

            {pendingCheckIn && (
                <CheckInDialog
                    projectName={project.name}
                    status={pendingCheckIn}
                    lines={(assignments?.open ?? []) as ProjectAssignmentLine[]}
                    saving={isSubmitting}
                    onCancel={() => setPendingCheckIn(null)}
                    onConfirm={(checkInIds) => void save(checkInIds)}
                />
            )}
        </div>
    );
}

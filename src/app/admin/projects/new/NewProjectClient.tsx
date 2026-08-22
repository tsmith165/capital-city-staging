'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import ProjectResizeUploader from '@/components/ProjectResizeUploader';

interface UploadedImage {
    fileName: string;
    originalImageUrl: string;
    smallImageUrl: string;
    originalWidth: number;
    originalHeight: number;
    smallWidth: number;
    smallHeight: number;
}

export default function NewProjectClient() {
    const router = useRouter();
    const createProject = useMutation(api.projects.createProject);
    const addProjectImage = useMutation(api.projects.addProjectImage);

    const [formData, setFormData] = useState({
        name: '',
        status: 'draft' as const,
        address: '',
        startDate: '',
        endDate: '',
        revenue: '',
        notes: '',
    });

    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUploadComplete = (images: UploadedImage[]) => {
        console.log('Images uploaded:', images);
        setUploadedImages((prev) => [...prev, ...images]);
    };

    const handleResetImages = () => {
        setUploadedImages([]);
    };

    const removeImage = (index: number) => {
        setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Create project
            const projectId = await createProject({
                name: formData.name,
                status: formData.status,
                address: formData.address || undefined,
                startDate: formData.startDate ? new Date(formData.startDate).getTime() : undefined,
                endDate: formData.endDate ? new Date(formData.endDate).getTime() : undefined,
                revenue: formData.revenue ? parseFloat(formData.revenue) : undefined,
                notes: formData.notes || undefined,
            });

            // Upload images if any
            if (uploadedImages.length > 0) {
                for (let i = 0; i < uploadedImages.length; i++) {
                    const image = uploadedImages[i];
                    await addProjectImage({
                        projectId,
                        imagePath: image.originalImageUrl,
                        width: image.originalWidth,
                        height: image.originalHeight,
                        thumbnailPath: image.smallImageUrl,
                        thumbnailWidth: image.smallWidth,
                        thumbnailHeight: image.smallHeight,
                        displayOrder: i,
                    });
                }
            }

            router.push('/admin/projects');
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Error creating project. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto max-w-7xl p-4">
            <div className="flex gap-8">
                {/* Left Column - Project Details Form (60%) */}
                <div className="w-3/5">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-surface-raised rounded-lg p-6">
                            <h2 className="text-body mb-6 text-2xl font-bold">New Project Details</h2>

                            <div className="space-y-4">
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

                                <div>
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

                                <div>
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

                                <div>
                                    <label className="text-body mb-1 block text-sm font-medium">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={2}
                                        className="border-line-strong bg-surface-overlay text-body focus:border-primary w-full rounded border px-3 py-2 focus:outline-none"
                                        placeholder="Project notes..."
                                    />
                                </div>
                            </div>
                            {/* Actions */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="border-primary text-primary hover:bg-secondary hover:border-secondary hover:text-body-muted rounded-lg border-2 bg-transparent px-6 py-3 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Project'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => router.push('/admin/projects')}
                                    className="text-body-muted hover:bg-surface-overlay rounded-lg border-2 border-stone-300 bg-transparent px-6 py-3 font-medium transition-colors hover:border-red-500 hover:text-red-500"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Right Column - Project Images (40%) */}
                <div className="w-2/5">
                    <div className="bg-surface-raised rounded-lg p-6">
                        <h2 className="text-body mb-6 text-2xl font-bold">Project Images</h2>

                        <div className="space-y-4">
                            <ProjectResizeUploader
                                onUploadComplete={handleUploadComplete}
                                onResetInputs={handleResetImages}
                                disabled={isSubmitting}
                            />

                            {uploadedImages.length > 0 && (
                                <div>
                                    <h3 className="text-body-muted mb-3 text-lg font-medium">Uploaded Images ({uploadedImages.length})</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {uploadedImages.map((image, index) => (
                                            <div key={index} className="group relative">
                                                <img
                                                    src={image.smallImageUrl}
                                                    alt={`Project image ${index + 1}`}
                                                    className="h-32 w-full rounded-lg object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                                >
                                                    ×
                                                </button>
                                                <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
                                                    {image.originalWidth}×{image.originalHeight}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

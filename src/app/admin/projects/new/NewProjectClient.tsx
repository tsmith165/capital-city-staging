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
                        <div className="rounded-lg bg-stone-800 p-6">
                            <h2 className="mb-6 text-2xl font-bold text-stone-100">New Project Details</h2>

                            <div className="space-y-4">
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

                                <div>
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

                                <div>
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

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-stone-200">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={2}
                                        className="w-full rounded border border-stone-600 bg-stone-700 px-3 py-2 text-stone-100 focus:border-primary focus:outline-none"
                                        placeholder="Project notes..."
                                    />
                                </div>
                            </div>
                            {/* Actions */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-lg border-2 bg-transparent border-primary text-primary px-6 py-3 font-medium transition-colors hover:bg-secondary hover:border-secondary hover:text-stone-300 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Project'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => router.push('/admin/projects')}
                                    className="rounded-lg border-2 bg-transparent border-stone-300 text-stone-300 px-6 py-3 font-medium transition-colors hover:bg-stone-700 hover:border-red-500 hover:text-red-500"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Right Column - Project Images (40%) */}
                <div className="w-2/5">
                    <div className="rounded-lg bg-stone-800 p-6">
                        <h2 className="mb-6 text-2xl font-bold text-stone-100">Project Images</h2>

                        <div className="space-y-4">
                            <ProjectResizeUploader
                                onUploadComplete={handleUploadComplete}
                                onResetInputs={handleResetImages}
                                disabled={isSubmitting}
                            />

                            {uploadedImages.length > 0 && (
                                <div>
                                    <h3 className="mb-3 text-lg font-medium text-stone-300">Uploaded Images ({uploadedImages.length})</h3>
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
                                                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                                >
                                                    ×
                                                </button>
                                                <div className="absolute bottom-2 left-2 rounded bg-black bg-opacity-60 px-2 py-1 text-xs text-white">
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

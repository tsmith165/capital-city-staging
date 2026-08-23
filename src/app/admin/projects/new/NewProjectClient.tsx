'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import { AdminHeading, AdminPanel } from '@/components/admin/AdminPrimitives';
import ProjectDetailsForm from '@/components/admin/projects/ProjectDetailsForm';
import type { ProjectFormState } from '@/components/admin/projects/project.types';
import PendingPhotoTray, { pendingSettled, readyPending, revokePreviews } from '@/components/admin/images/PendingPhotoTray';
import type { PendingImage } from '@/components/admin/images/images.types';

/**
 * Creating a job and its first photos.
 *
 * Both halves commit together in one mutation. The previous version wrote the project first and then
 * looped one image write per photo, so a failure partway through left a real project on the list with
 * some of its photos, and the natural retry made a second copy of the same house.
 */

const FORM_ID = 'new-project-form';

const EMPTY_FORM: ProjectFormState = {
    name: '',
    status: 'draft',
    address: '',
    startDate: '',
    endDate: '',
    revenue: '',
    notes: '',
    highlighted: false,
};

export default function NewProjectClient() {
    const router = useRouter();
    const createProject = useMutation(api.projects.createProjectWithImages);

    const [formData, setFormData] = useState<ProjectFormState>(EMPTY_FORM);
    const [pending, setPending] = useState<PendingImage[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const ready = readyPending(pending);
    const settled = pendingSettled(pending);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (saving) return;

        if (!settled) {
            setError('Some photos are still uploading.');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            const projectId = await createProject({
                name: formData.name,
                status: formData.status,
                address: formData.address || undefined,
                startDate: formData.startDate ? new Date(formData.startDate).getTime() : undefined,
                endDate: formData.endDate ? new Date(formData.endDate).getTime() : undefined,
                revenue: formData.revenue ? parseFloat(formData.revenue) : undefined,
                notes: formData.notes || undefined,
                images: ready.map((image) => ({
                    title: image.title.trim() || undefined,
                    imagePath: image.imagePath as string,
                    width: image.width as number,
                    height: image.height as number,
                    thumbnailPath: image.thumbnailPath,
                    thumbnailWidth: image.thumbnailWidth,
                    thumbnailHeight: image.thumbnailHeight,
                })),
            });

            revokePreviews(pending);
            router.push(`/admin/projects/${projectId}/edit`);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Could not create that project.');
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-5 p-5 sm:p-8">
            <AdminHeading eyebrow="Back office" title="New project" />

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[3fr_2fr]">
                <ProjectDetailsForm
                    formId={FORM_ID}
                    formData={formData}
                    onChange={(patch) => setFormData((current) => ({ ...current, ...patch }))}
                    onSubmit={handleSubmit}
                    saving={saving}
                    error={error}
                    saved={false}
                    panelTitle="Details"
                    submitLabel={
                        ready.length > 0
                            ? `Create project with ${ready.length} ${ready.length === 1 ? 'photo' : 'photos'}`
                            : 'Create project'
                    }
                    savingLabel="Creating…"
                    footNote=""
                >
                    <button
                        type="button"
                        onClick={() => {
                            revokePreviews(pending);
                            router.push('/admin/projects');
                        }}
                        className="border-line text-body-muted hover:bg-surface-hover hover:text-body inline-flex items-center gap-1.5 rounded-md border px-3.5 py-2.5 text-xs font-bold transition-colors"
                    >
                        <X size={13} aria-hidden="true" /> Cancel
                    </button>
                </ProjectDetailsForm>

                <AdminPanel eyebrow="Photos" title={pending.length > 0 ? `Ready · ${ready.length} of ${pending.length}` : 'Photos'}>
                    <div className="p-4">
                        <PendingPhotoTray
                            pending={pending}
                            onPendingChange={(update) => setPending(update)}
                            onFilesChosen={() => setError(null)}
                            disabled={saving}
                        />
                        <p className="text-body-subtle mt-3 text-xs">
                            Photos are attached when the project is created, in the order shown.
                        </p>
                    </div>
                </AdminPanel>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeft, BadgeDollarSign, Images, ListChecks, MapPin, SlidersHorizontal } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import CheckInDialog from './CheckInDialog';
import ProjectDetailsForm from '@/components/admin/projects/ProjectDetailsForm';
import ProjectImagesSection from './ProjectImagesSection';
import ProjectPaymentSection from './ProjectPaymentSection';
import ProjectInventoryTab from './ProjectInventoryTab';
import type { CommittedImage } from '@/components/admin/images/images.types';
import {
    CLOSING_STATUSES,
    type ProjectAssignmentLine,
    type ProjectFormState,
    type ProjectStatus,
} from '@/components/admin/projects/project.types';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';

/**
 * Editing one project.
 *
 * This was three tabs, which meant the photos and the furniture on the job were each one click away
 * from being forgotten, and saving from the Details tab navigated the whole page away. Everything is
 * on one column now; the header carries the save and a jump link per section, and saving stays put so
 * a save in the middle of arranging photos does not throw the arrangement away.
 */

const DETAILS_FORM_ID = 'project-details-form';

const SECTIONS = [
    { id: 'details', label: 'Details', icon: SlidersHorizontal },
    { id: 'payment', label: 'Payment', icon: BadgeDollarSign },
    { id: 'photos', label: 'Photos', icon: Images },
    { id: 'inventory', label: 'Inventory', icon: ListChecks },
] as const;

const STATUS_TONES: Record<ProjectStatus, string> = {
    draft: 'border-line text-body-muted',
    active: 'border-success/40 bg-success-soft text-success',
    completed: 'border-line-strong text-body-subtle',
    cancelled: 'border-danger/40 bg-danger-soft text-danger',
};

export default function EditProjectClient({ projectId }: { projectId: string }) {
    const { user, isLoaded } = useUser();

    const project = useQuery(api.projects.getProjectById, isLoaded && user ? { projectId: projectId as Id<'projects'> } : 'skip');
    const assignments = useQuery(
        api.assignments.getProjectAssignments,
        isLoaded && user ? { projectId: projectId as Id<'projects'> } : 'skip',
    );

    const updateProject = useMutation(api.projects.updateProject);

    const [formData, setFormData] = useState<ProjectFormState>({
        name: '',
        status: 'draft',
        address: '',
        startDate: '',
        endDate: '',
        revenue: '',
        notes: '',
        highlighted: false,
    });

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    /* Held while the check-in dialog is open, so submitting again can carry the confirmed ids. */
    const [pendingCheckIn, setPendingCheckIn] = useState<'completed' | 'cancelled' | null>(null);

    /*
     * Seeded from the query the first time a project arrives, adjusted during render rather than in an
     * effect. Keying on the id matters: this is a live subscription, so it re-emits after every save and
     * after every photo edit, and the effect this replaced re-seeded the form each time — typing into a
     * field while an upload landed lost the edit.
     */
    const [seededFor, setSeededFor] = useState<string | null>(null);
    if (project && seededFor !== project._id) {
        setSeededFor(project._id);
        setFormData({
            name: project.name || '',
            /*
             * This used to force every non-draft project back to 'draft' when the form loaded, so
             * opening a completed job and saving it silently reopened it.
             */
            status: (project.status as ProjectStatus) ?? 'draft',
            address: project.address || '',
            startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
            endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
            revenue: project.revenue ? project.revenue.toString() : '',
            notes: project.notes || '',
            highlighted: project.highlighted || false,
        });
    }

    /* The form is dirty whenever what is on screen differs from what the last query returned. */
    const dirty = Boolean(
        project &&
        (formData.name !== (project.name || '') ||
            formData.status !== ((project.status as ProjectStatus) ?? 'draft') ||
            formData.address !== (project.address || '') ||
            formData.revenue !== (project.revenue ? project.revenue.toString() : '') ||
            formData.notes !== (project.notes || '') ||
            formData.highlighted !== (project.highlighted || false)),
    );
    useUnsavedChangesWarning(dirty);

    const save = async (checkInAssignmentIds?: string[]) => {
        setSaving(true);
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

            setPendingCheckIn(null);
            setSaved(true);
        } catch (error) {
            setSaveError(error instanceof Error ? error.message : 'Could not save this project. Try again.');
            setPendingCheckIn(null);
        } finally {
            setSaving(false);
        }
    };

    /**
     * Finishing a job is the moment its furniture should come home, so a closing status with
     * inventory still assigned opens the check-in step first. Nothing about the save is blocked by
     * it — the dialog offers a way through either way — but it stops the job from quietly closing
     * while the catalog still believes the furniture is unavailable.
     */
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const closing = CLOSING_STATUSES.includes(formData.status);
        const stillOut = assignments?.open ?? [];

        if (closing && stillOut.length > 0 && project?.status !== formData.status) {
            setPendingCheckIn(formData.status as 'completed' | 'cancelled');
            return;
        }

        void save();
    };

    if (!isLoaded || project === undefined) {
        return <p className="text-body-muted p-6 text-sm">Loading project…</p>;
    }

    if (!user) {
        return (
            <p className="text-body-muted p-6 text-sm">
                <Link href="/sign-in" className="text-gold-300 hover:text-gold-200 font-bold">
                    Sign in
                </Link>{' '}
                to edit this project.
            </p>
        );
    }

    if (project === null) {
        return (
            <div className="flex flex-col gap-3 p-6">
                <p className="text-body text-sm font-bold">That project no longer exists.</p>
                <Link href="/admin/projects" className="text-gold-300 hover:text-gold-200 text-sm font-bold">
                    Back to projects
                </Link>
            </div>
        );
    }

    const images = (project.images ?? []) as CommittedImage[];
    const openCount = assignments?.open.length ?? 0;
    const counts: Record<(typeof SECTIONS)[number]['id'], number | null> = {
        details: null,
        payment: null,
        photos: images.length,
        inventory: openCount,
    };

    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-5 p-4">
            <header className="bg-ink/95 border-line sticky top-0 z-20 -mx-4 flex flex-col gap-3 border-b px-4 py-3 backdrop-blur">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <Link
                        href="/admin/projects"
                        className="text-body-subtle hover:text-body inline-flex items-center gap-1.5 text-xs font-bold transition-colors"
                    >
                        <ArrowLeft size={13} aria-hidden="true" /> Projects
                    </Link>

                    <div className="flex min-w-0 flex-col">
                        <h1 className="font-display text-body truncate text-xl leading-tight font-normal">
                            {formData.name || project.name || 'Untitled project'}
                        </h1>
                        {formData.address && (
                            <span className="text-body-subtle inline-flex items-center gap-1 truncate text-xs">
                                <MapPin size={11} aria-hidden="true" /> {formData.address}
                            </span>
                        )}
                    </div>

                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize ${STATUS_TONES[formData.status]}`}>
                        {formData.status}
                    </span>

                    <button
                        type="submit"
                        form={DETAILS_FORM_ID}
                        disabled={saving}
                        className="bg-gold-400 text-body-inverse hover:bg-gold-300 ml-auto rounded-md px-4 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                </div>

                <nav aria-label="Sections" className="flex flex-wrap gap-1.5">
                    {SECTIONS.map((section) => (
                        <a
                            key={section.id}
                            href={`#${section.id}`}
                            className="border-line text-body-muted hover:bg-surface-hover hover:text-body inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors"
                        >
                            <section.icon size={12} aria-hidden="true" />
                            {section.label}
                            {counts[section.id] !== null && counts[section.id]! > 0 && (
                                <span className="text-body-subtle">{counts[section.id]}</span>
                            )}
                        </a>
                    ))}
                </nav>
            </header>

            <section id="details" className="scroll-mt-32">
                <ProjectDetailsForm
                    formId={DETAILS_FORM_ID}
                    formData={formData}
                    onChange={(patch) => {
                        setSaved(false);
                        setFormData((current) => ({ ...current, ...patch }));
                    }}
                    onSubmit={handleSubmit}
                    saving={saving}
                    error={saveError}
                    saved={saved}
                />
            </section>

            <section id="payment" className="scroll-mt-32">
                <ProjectPaymentSection projectId={projectId} projectName={project.name} payment={project.payment} />
            </section>

            <section id="photos" className="scroll-mt-32">
                <ProjectImagesSection projectId={projectId} images={images} />
            </section>

            <section id="inventory" className="scroll-mt-32">
                <ProjectInventoryTab projectId={projectId} />
            </section>

            {pendingCheckIn && (
                <CheckInDialog
                    projectName={project.name}
                    status={pendingCheckIn}
                    lines={(assignments?.open ?? []) as ProjectAssignmentLine[]}
                    saving={saving}
                    onCancel={() => setPendingCheckIn(null)}
                    onConfirm={(checkInIds) => void save(checkInIds)}
                />
            )}
        </div>
    );
}

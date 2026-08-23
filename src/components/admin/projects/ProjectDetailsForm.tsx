'use client';

import { CheckCircle2, Loader2, Star } from 'lucide-react';

import { AdminPanel } from '@/components/admin/AdminPrimitives';

import type { ProjectFormState, ProjectStatus } from './project.types';

/**
 * The written record of a job: what it is called, where it is, what it earned.
 *
 * The form id is deliberate — the save button lives in the page header so it is reachable from any
 * section, and a submit button outside a form is only wired to it by `form="…"`.
 */

const FIELD =
    'border-line bg-surface text-body placeholder:text-body-subtle focus-visible:border-gold-300 w-full rounded-md border px-3 py-2.5 text-sm outline-none transition-colors';
const LABEL = 'text-body-muted text-xs font-bold';

const STATUS_OPTIONS: { value: ProjectStatus; label: string; hint: string }[] = [
    { value: 'draft', label: 'Draft', hint: 'Not started yet' },
    { value: 'active', label: 'Active', hint: 'Furniture is on site' },
    { value: 'completed', label: 'Completed', hint: 'Closes the job and prompts a check-in' },
    { value: 'cancelled', label: 'Cancelled', hint: 'Closes the job and prompts a check-in' },
];

export default function ProjectDetailsForm({
    formId,
    formData,
    onChange,
    onSubmit,
    saving,
    error,
    saved,
    panelTitle = 'Project details',
    submitLabel = 'Save details',
    savingLabel = 'Saving…',
    footNote = 'Photos and inventory save on their own.',
    children,
}: {
    formId: string;
    formData: ProjectFormState;
    onChange: (patch: Partial<ProjectFormState>) => void;
    onSubmit: (event: React.FormEvent) => void;
    saving: boolean;
    error: string | null;
    saved: boolean;
    panelTitle?: string;
    submitLabel?: string;
    savingLabel?: string;
    footNote?: string;
    /** Extra controls in the action row, such as a cancel link on the create page. */
    children?: React.ReactNode;
}) {
    const statusHint = STATUS_OPTIONS.find((option) => option.value === formData.status)?.hint;

    return (
        <AdminPanel eyebrow="Details" title={panelTitle}>
            <form id={formId} onSubmit={onSubmit} className="flex flex-col gap-4 p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-1.5 md:col-span-2">
                        <span className={LABEL}>Project name *</span>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(event) => onChange({ name: event.target.value })}
                            placeholder="123 Oak Street"
                            className={FIELD}
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className={LABEL}>Status *</span>
                        <select
                            value={formData.status}
                            onChange={(event) => onChange({ status: event.target.value as ProjectStatus })}
                            className={FIELD}
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {statusHint && <span className="text-body-subtle text-xs">{statusHint}</span>}
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className={LABEL}>Revenue</span>
                        <div className="relative">
                            <span className="text-body-subtle pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">$</span>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.revenue}
                                onChange={(event) => onChange({ revenue: event.target.value })}
                                placeholder="0.00"
                                className={`${FIELD} pl-7`}
                            />
                        </div>
                    </label>

                    <label className="flex flex-col gap-1.5 md:col-span-2">
                        <span className={LABEL}>Address</span>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(event) => onChange({ address: event.target.value })}
                            placeholder="Street, city, state"
                            className={FIELD}
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className={LABEL}>Start date</span>
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(event) => onChange({ startDate: event.target.value })}
                            className={FIELD}
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className={LABEL}>End date</span>
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(event) => onChange({ endDate: event.target.value })}
                            className={FIELD}
                        />
                    </label>

                    <label className="flex flex-col gap-1.5 md:col-span-2">
                        <span className={LABEL}>Notes</span>
                        <textarea
                            value={formData.notes}
                            onChange={(event) => onChange({ notes: event.target.value })}
                            rows={3}
                            placeholder="Anything worth remembering about this job."
                            className={`${FIELD} resize-y`}
                        />
                    </label>
                </div>

                <label
                    className={`flex cursor-pointer items-start gap-3 rounded-md border px-3.5 py-3 transition-colors ${
                        formData.highlighted ? 'border-gold-300/50 bg-gold-400/5' : 'border-line hover:bg-surface-hover'
                    }`}
                >
                    <input
                        type="checkbox"
                        checked={formData.highlighted}
                        onChange={(event) => onChange({ highlighted: event.target.checked })}
                        className="accent-gold-400 mt-0.5 h-4 w-4"
                    />
                    <span className="flex flex-col gap-0.5">
                        <span className="text-body inline-flex items-center gap-1.5 text-sm font-bold">
                            <Star size={13} aria-hidden="true" className={formData.highlighted ? 'text-gold-300' : 'text-body-subtle'} />
                            Show in the public portfolio
                        </span>
                        <span className="text-body-subtle text-xs">
                            Highlighted projects appear on the portfolio page, using the first photo below.
                        </span>
                    </span>
                </label>

                {error && (
                    <p role="alert" className="border-danger/40 bg-danger-soft text-danger rounded-md border px-4 py-2.5 text-sm">
                        {error}
                    </p>
                )}

                <div className="border-line flex flex-wrap items-center gap-3 border-t pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-gold-400 text-body-inverse hover:bg-gold-300 inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving && <Loader2 size={15} aria-hidden="true" className="animate-spin" />}
                        {saving ? savingLabel : submitLabel}
                    </button>
                    {children}
                    <p aria-live="polite" className="empty:hidden">
                        {saved && !saving && (
                            <span className="text-success inline-flex items-center gap-1.5 text-sm font-bold">
                                <CheckCircle2 size={14} aria-hidden="true" /> Saved
                            </span>
                        )}
                    </p>
                    {footNote && <span className="text-body-subtle ml-auto text-xs">{footNote}</span>}
                </div>
            </form>
        </AdminPanel>
    );
}

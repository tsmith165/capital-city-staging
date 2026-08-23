'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';

import { AdminPanel } from '@/components/admin/AdminPrimitives';
import { DIMENSION_REQUIRED_CATEGORIES } from '@/components/admin/inventory/inventory.constants';

import { FIELD_CLASSES, INVENTORY_CATEGORIES, LABEL_CLASSES, exactMoney } from './inventory.editor.constants';
import type { EditorItem, InventoryFormState } from './inventory.editor.types';

/**
 * Everything written about one piece of furniture.
 *
 * Three things changed from the form this replaces. The name is here and only here — it used to have
 * its own save button above a form that also wrote it, so whichever was submitted last won. The
 * pixel dimensions of the photo are gone, because they are a property of the uploaded file and
 * editing them only ever broke how the catalog renders it. And the count says what is actually
 * available, since lowering it below what is at houses is the one edit that corrupts the catalog.
 */

const NUMBER_FIELDS = [
    { key: 'price', label: 'Price', hint: 'What a client is charged to rent it', prefix: '$' },
    { key: 'cost', label: 'Cost', hint: 'What it cost to buy', prefix: '$' },
] as const;

const DIMENSION_FIELDS = [
    { key: 'realWidth', label: 'Width' },
    { key: 'realHeight', label: 'Height' },
    { key: 'realDepth', label: 'Depth' },
] as const;

export default function InventoryDetailsForm({
    formId,
    item,
    form,
    onChange,
    onSubmit,
    saving,
    saved,
    error,
}: {
    formId: string;
    item: EditorItem;
    form: InventoryFormState;
    onChange: (patch: Partial<InventoryFormState>) => void;
    onSubmit: (event: React.FormEvent) => void;
    saving: boolean;
    saved: boolean;
    error: string | null;
}) {
    const committed = item.availability.out + item.availability.awaitingCheckIn;
    const count = Number(form.count || 0);
    const countTooLow = Number.isFinite(count) && count < committed;
    const dimensionsMatter = DIMENSION_REQUIRED_CATEGORIES.includes(form.category);
    const missingDimensions = dimensionsMatter && !form.realWidth && !form.realHeight && !form.realDepth;

    /* Existing values first, so a catalog that has outgrown the original list still offers its own. */
    const categoryOptions = [...new Set([...INVENTORY_CATEGORIES, ...item.categories])].sort();

    return (
        <AdminPanel eyebrow="Details" title="What this is">
            <form id={formId} onSubmit={onSubmit} className="flex flex-col gap-5 p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-1.5 md:col-span-2">
                        <span className={LABEL_CLASSES}>Name *</span>
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={(event) => onChange({ name: event.target.value })}
                            placeholder="Walnut mid-century sofa"
                            className={FIELD_CLASSES}
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className={LABEL_CLASSES}>Category *</span>
                        <input
                            type="text"
                            required
                            list="inventory-categories"
                            value={form.category}
                            onChange={(event) => onChange({ category: event.target.value })}
                            placeholder="Couch"
                            className={FIELD_CLASSES}
                        />
                        <datalist id="inventory-categories">
                            {categoryOptions.map((category) => (
                                <option key={category} value={category} />
                            ))}
                        </datalist>
                        {dimensionsMatter && <span className="text-body-subtle text-xs">Measurements matter for this category.</span>}
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className={LABEL_CLASSES}>Where it is stored</span>
                        <input
                            type="text"
                            list="inventory-locations"
                            value={form.location}
                            onChange={(event) => onChange({ location: event.target.value })}
                            placeholder="Warehouse bay 2"
                            className={FIELD_CLASSES}
                        />
                        <datalist id="inventory-locations">
                            {item.locations.map((location) => (
                                <option key={location} value={location} />
                            ))}
                        </datalist>
                    </label>

                    <label className="flex flex-col gap-1.5 md:col-span-2">
                        <span className={LABEL_CLASSES}>Vendor</span>
                        <input
                            type="text"
                            value={form.vendor}
                            onChange={(event) => onChange({ vendor: event.target.value })}
                            placeholder="Where it came from"
                            className={FIELD_CLASSES}
                        />
                    </label>

                    <label className="flex flex-col gap-1.5 md:col-span-2">
                        <span className={LABEL_CLASSES}>Description</span>
                        <textarea
                            value={form.description}
                            onChange={(event) => onChange({ description: event.target.value })}
                            rows={3}
                            placeholder="Colour, material, condition — whatever helps recognise it in the picker."
                            className={`${FIELD_CLASSES} resize-y`}
                        />
                    </label>
                </div>

                <fieldset className="border-line flex flex-col gap-4 border-t pt-4">
                    <legend className="sr-only">Money and stock</legend>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {NUMBER_FIELDS.map((field) => (
                            <label key={field.key} className="flex flex-col gap-1.5">
                                <span className={LABEL_CLASSES}>{field.label}</span>
                                <div className="relative">
                                    <span className="text-body-subtle pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                                        {field.prefix}
                                    </span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form[field.key]}
                                        onChange={(event) => onChange({ [field.key]: event.target.value })}
                                        placeholder="0.00"
                                        className={`${FIELD_CLASSES} pl-7`}
                                    />
                                </div>
                                <span className="text-body-subtle text-xs">{field.hint}</span>
                            </label>
                        ))}

                        <label className="flex flex-col gap-1.5">
                            <span className={LABEL_CLASSES}>How many you own *</span>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                required
                                value={form.count}
                                onChange={(event) => onChange({ count: event.target.value })}
                                aria-invalid={countTooLow}
                                className={`${FIELD_CLASSES} ${countTooLow ? 'border-danger' : ''}`}
                            />
                            <span className={`text-xs ${countTooLow ? 'text-danger font-bold' : 'text-body-subtle'}`}>
                                {committed > 0
                                    ? countTooLow
                                        ? `${committed} are at houses — the count cannot go below that.`
                                        : `${committed} at houses, ${Math.max(0, count - committed)} free to stage.`
                                    : 'None are out right now.'}
                            </span>
                        </label>
                    </div>

                    {form.price === '0' || form.price === '' ? (
                        <p className="border-warning/40 bg-warning-soft text-warning rounded-md border px-3.5 py-2.5 text-xs">
                            With no price set, every job this goes on records it at {exactMoney.format(0)} and that project&rsquo;s rental
                            total comes out short.
                        </p>
                    ) : null}
                </fieldset>

                <fieldset className="border-line flex flex-col gap-3 border-t pt-4">
                    <legend className={LABEL_CLASSES}>Measurements, in inches</legend>
                    <div className="grid grid-cols-3 gap-3">
                        {DIMENSION_FIELDS.map((field) => (
                            <label key={field.key} className="flex flex-col gap-1.5">
                                <span className="text-body-subtle text-xs">{field.label}</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={form[field.key]}
                                    onChange={(event) => onChange({ [field.key]: event.target.value })}
                                    placeholder="0"
                                    className={FIELD_CLASSES}
                                />
                            </label>
                        ))}
                    </div>
                    {missingDimensions && (
                        <p className="text-body-subtle text-xs">
                            Without these, nobody can answer whether it fits the room they are staging.
                        </p>
                    )}
                </fieldset>

                {error && (
                    <p role="alert" className="border-danger/40 bg-danger-soft text-danger rounded-md border px-4 py-2.5 text-sm">
                        {error}
                    </p>
                )}

                <div className="border-line flex flex-wrap items-center gap-3 border-t pt-4">
                    <button
                        type="submit"
                        disabled={saving || countTooLow}
                        className="bg-gold-400 text-body-inverse hover:bg-gold-300 inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving && <Loader2 size={15} aria-hidden="true" className="animate-spin" />}
                        {saving ? 'Saving…' : 'Save item'}
                    </button>
                    <p aria-live="polite" className="empty:hidden">
                        {saved && !saving && (
                            <span className="text-success inline-flex items-center gap-1.5 text-sm font-bold">
                                <CheckCircle2 size={14} aria-hidden="true" /> Saved
                            </span>
                        )}
                    </p>
                    <span className="text-body-subtle ml-auto text-xs">Photos save on their own.</span>
                </div>
            </form>
        </AdminPanel>
    );
}

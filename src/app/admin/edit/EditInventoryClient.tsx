'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { ArrowLeft, ChevronLeft, ChevronRight, Images, ImageOff, Plus, Settings2, SlidersHorizontal } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import AddInventoryOverlay from '@/components/AddInventoryOverlay';

import InventoryDetailsForm from './InventoryDetailsForm';
import InventoryPhotosSection from './InventoryPhotosSection';
import InventoryStatusPanel from './InventoryStatusPanel';
import { money } from './inventory.editor.constants';
import type { EditorItem, InventoryFormState } from './inventory.editor.types';

/**
 * Editing one piece of inventory.
 *
 * What this replaces: a two-pane layout with a slideshow on the left, a title with its own save
 * button, a form that also wrote that title, editable pixel dimensions of the photo, a separate
 * image-ordering widget, and eleven tooltips. It reported nothing about whether the item was out on
 * a job — the one fact that decides whether an edit here is safe.
 *
 * Now it is one column of sections with a sticky header, matching the project editor, and the header
 * carries the save so it is reachable from any section.
 */

const DETAILS_FORM_ID = 'inventory-details-form';

const SECTIONS = [
    { id: 'details', label: 'Details', icon: SlidersHorizontal },
    { id: 'photos', label: 'Photos', icon: Images },
    { id: 'status', label: 'Availability', icon: Settings2 },
] as const;

function toForm(item: EditorItem): InventoryFormState {
    return {
        name: item.name,
        category: item.category ?? '',
        vendor: item.vendor ?? '',
        location: item.location ?? '',
        description: item.description ?? '',
        price: item.price ? String(item.price) : '',
        cost: item.cost ? String(item.cost) : '',
        count: String(item.count ?? 0),
        realWidth: item.realWidth ? String(item.realWidth) : '',
        realHeight: item.realHeight ? String(item.realHeight) : '',
        realDepth: item.realDepth ? String(item.realDepth) : '',
    };
}

export default function EditInventoryClient({ oId }: { oId: number }) {
    const item = useQuery(api.inventory.getInventoryEditor, { oId }) as EditorItem | null | undefined;
    const saveItem = useMutation(api.inventory.updateInventoryDetails);

    const [form, setForm] = useState<InventoryFormState | null>(null);
    /*
     * Seeded during render rather than in an effect, keyed on the item. This is a live subscription:
     * it re-emits on every photo edit, and re-seeding on each of those would discard whatever was
     * being typed at the time.
     */
    const [seededFor, setSeededFor] = useState<number | null>(null);
    if (item && seededFor !== item.oId) {
        setSeededFor(item.oId);
        setForm(toForm(item));
    }

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [addingNew, setAddingNew] = useState(false);

    if (item === undefined || (item && !form)) return <p className="text-body-muted p-6 text-sm">Loading item…</p>;

    if (item === null) {
        return (
            <div className="flex flex-col gap-3 p-6">
                <p className="text-body text-sm font-bold">That item no longer exists.</p>
                <Link href="/admin/inventory" className="text-gold-300 hover:text-gold-200 text-sm font-bold">
                    Back to the catalog
                </Link>
            </div>
        );
    }

    const current = form as InventoryFormState;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            await saveItem({
                id: item._id as Id<'inventory'>,
                name: current.name,
                category: current.category,
                vendor: current.vendor,
                location: current.location,
                description: current.description,
                /* Parsed as decimals: the old form used parseInt, which turned $12.50 into $12. */
                price: Number(current.price || 0),
                cost: Number(current.cost || 0),
                count: Number(current.count || 0),
                realWidth: Number(current.realWidth || 0),
                realHeight: Number(current.realHeight || 0),
                realDepth: Number(current.realDepth || 0),
            });
            setSaved(true);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Could not save this item.');
        } finally {
            setSaving(false);
        }
    };

    const counts: Record<(typeof SECTIONS)[number]['id'], number | null> = {
        details: null,
        photos: item.extraImages.length + 1,
        status: null,
    };

    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-5 p-4">
            <header className="bg-ink/95 border-line sticky top-0 z-20 -mx-4 flex flex-col gap-3 border-b px-4 py-3 backdrop-blur">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <Link
                        href="/admin/inventory"
                        className="text-body-subtle hover:text-body inline-flex items-center gap-1.5 text-xs font-bold transition-colors"
                    >
                        <ArrowLeft size={13} aria-hidden="true" /> Catalog
                    </Link>

                    <span className="border-line bg-surface relative h-10 w-10 shrink-0 overflow-hidden rounded-md border">
                        {item.smallImagePath || item.imagePath ? (
                            <Image src={item.smallImagePath || item.imagePath} alt="" fill sizes="40px" className="object-cover" />
                        ) : (
                            <span className="grid h-full w-full place-items-center">
                                <ImageOff size={14} aria-hidden="true" className="text-body-subtle" />
                            </span>
                        )}
                    </span>

                    <div className="flex min-w-0 flex-col">
                        <h1 className="font-display text-body truncate text-xl leading-tight font-normal">{current.name || item.name}</h1>
                        <span className="text-body-subtle truncate text-xs">
                            #{item.oId} · {current.category || 'Uncategorised'}
                            {item.price > 0 && ` · ${money.format(item.price)}`}
                            {!item.active && ' · retired'}
                        </span>
                    </div>

                    <button
                        type="submit"
                        form={DETAILS_FORM_ID}
                        disabled={saving}
                        className="bg-gold-400 text-body-inverse hover:bg-gold-300 ml-auto rounded-md px-4 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                    <nav aria-label="Sections" className="flex flex-wrap gap-1.5">
                        {SECTIONS.map((section) => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className="border-line text-body-muted hover:bg-surface-hover hover:text-body inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors"
                            >
                                <section.icon size={12} aria-hidden="true" />
                                {section.label}
                                {counts[section.id] !== null && <span className="text-body-subtle">{counts[section.id]}</span>}
                            </a>
                        ))}
                    </nav>

                    <div className="ml-auto flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setAddingNew(true)}
                            className="border-line text-body-muted hover:bg-surface-hover hover:text-body inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors"
                        >
                            <Plus size={12} aria-hidden="true" /> New item
                        </button>

                        <span className="text-body-subtle px-1 text-xs tabular-nums">
                            {item.position} / {item.total}
                        </span>
                        <NavArrow oId={item.newerOId} label="Newer item" icon={ChevronLeft} />
                        <NavArrow oId={item.olderOId} label="Older item" icon={ChevronRight} />
                    </div>
                </div>
            </header>

            <section id="details" className="scroll-mt-36">
                <InventoryDetailsForm
                    formId={DETAILS_FORM_ID}
                    item={item}
                    form={current}
                    onChange={(patch) => {
                        setSaved(false);
                        setForm({ ...current, ...patch });
                    }}
                    onSubmit={handleSubmit}
                    saving={saving}
                    saved={saved}
                    error={error}
                />
            </section>

            <section id="photos" className="scroll-mt-36">
                <InventoryPhotosSection item={item} />
            </section>

            <section id="status" className="scroll-mt-36">
                <InventoryStatusPanel item={item} />
            </section>

            {addingNew && <AddInventoryOverlay onClose={() => setAddingNew(false)} onSuccess={() => setAddingNew(false)} />}
        </div>
    );
}

function NavArrow({ oId, label, icon: Icon }: { oId: number | null; label: string; icon: typeof ChevronLeft }) {
    if (!oId) {
        return (
            <span aria-hidden="true" className="border-line text-body-subtle grid h-7 w-7 place-items-center rounded border opacity-30">
                <Icon size={13} />
            </span>
        );
    }

    return (
        <Link
            href={`/admin/edit?id=${oId}`}
            aria-label={label}
            className="border-line text-body-muted hover:bg-surface-hover hover:text-body grid h-7 w-7 place-items-center rounded border transition-colors"
        >
            <Icon size={13} aria-hidden="true" />
        </Link>
    );
}

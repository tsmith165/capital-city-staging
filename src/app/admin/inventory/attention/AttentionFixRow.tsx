'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMutation } from 'convex/react';
import { Check, ImageOff, Loader2, Pencil } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { AdminStatus } from '@/components/admin/AdminPrimitives';

import type { AttentionItem } from './attention.types';

/**
 * One queue row, fixable in place.
 *
 * The queue's job is fixing, not listing. A missing price is the single most common problem and the
 * only thing standing between an item and being correct, so the row carries the input: type, Enter,
 * done, move on. Routing a hundred of those through the full edit page is why none of them ever got
 * fixed.
 */

const NUMBER_INPUT_CLASSES =
    'h-9 w-20 rounded-md border border-line-strong bg-surface px-2 text-sm text-body [appearance:textfield] focus:border-gold-300 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none';

export default function AttentionFixRow({ item, onFixed }: { item: AttentionItem; onFixed: () => void }) {
    const setPrice = useMutation(api.inventory.setInventoryPrice);
    const setDimensions = useMutation(api.inventory.setInventoryDimensions);

    const [price, setPriceValue] = useState(item.price ? String(item.price) : '');
    const [width, setWidth] = useState(item.realWidth ? String(item.realWidth) : '');
    const [height, setHeight] = useState(item.realHeight ? String(item.realHeight) : '');
    const [depth, setDepth] = useState(item.realDepth ? String(item.realDepth) : '');
    const [saving, setSaving] = useState<'price' | 'dimensions' | null>(null);
    const [error, setError] = useState<string | null>(null);

    const codes = new Set(item.reasons.map((reason) => reason.code));
    const needsPrice = codes.has('unpriced') || codes.has('unpriced-and-assigned');
    const needsDimensions = codes.has('missing-dimensions');

    const savePrice = async () => {
        const parsed = Number.parseFloat(price);
        if (!Number.isFinite(parsed) || parsed <= 0) {
            setError('Enter a rental price above zero.');
            return;
        }

        setSaving('price');
        setError(null);
        try {
            await setPrice({ id: item._id as Id<'inventory'>, price: parsed });
            onFixed();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Could not save that price.');
        } finally {
            setSaving(null);
        }
    };

    const saveDimensions = async () => {
        const values = [width, height, depth].map((value) => Number.parseFloat(value));
        if (values.some((value) => !Number.isFinite(value) || value <= 0)) {
            setError('Enter width, height, and depth in inches.');
            return;
        }

        setSaving('dimensions');
        setError(null);
        try {
            await setDimensions({
                id: item._id as Id<'inventory'>,
                realWidth: values[0],
                realHeight: values[1],
                realDepth: values[2],
            });
            onFixed();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Could not save those measurements.');
        } finally {
            setSaving(null);
        }
    };

    return (
        <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start">
            <span className="border-line bg-surface grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-md border">
                {item.smallImagePath || item.imagePath ? (
                    <Image
                        src={item.smallImagePath || item.imagePath}
                        alt=""
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <ImageOff size={18} aria-hidden="true" className="text-body-subtle" />
                )}
            </span>

            <span className="flex min-w-0 flex-1 flex-col gap-2">
                <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <strong className="text-body text-sm font-bold">{item.name}</strong>
                    <small className="text-body-subtle text-[11px]">{item.category || 'Uncategorised'}</small>
                    {item.holderName && (
                        <AdminStatus tone={item.awaitingCheckIn > 0 ? 'warning' : 'info'}>
                            {item.awaitingCheckIn > 0 ? `Not checked in · ${item.holderName}` : `Out · ${item.holderName}`}
                        </AdminStatus>
                    )}
                </span>

                <ul className="flex flex-col gap-1">
                    {item.reasons.map((reason) => (
                        <li key={reason.code} className="text-body-muted text-xs">
                            <strong className={reason.tier === 'fix-now' ? 'text-danger' : 'text-warning'}>{reason.label}.</strong>{' '}
                            {reason.detail}
                        </li>
                    ))}
                </ul>

                {(needsPrice || needsDimensions) && (
                    <span className="flex flex-wrap items-end gap-3 pt-1">
                        {needsPrice && (
                            <label className="flex flex-col gap-1">
                                <span className="text-body-subtle text-[10px] font-extrabold tracking-[0.14em] uppercase">
                                    Rental price
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        inputMode="decimal"
                                        value={price}
                                        onChange={(event) => setPriceValue(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                event.preventDefault();
                                                void savePrice();
                                            }
                                        }}
                                        placeholder="$"
                                        className={NUMBER_INPUT_CLASSES}
                                    />
                                    <button
                                        type="button"
                                        onClick={savePrice}
                                        disabled={saving !== null}
                                        className="bg-gold-400 text-body-inverse hover:bg-gold-300 grid h-9 w-9 place-items-center rounded-md transition-colors disabled:opacity-60"
                                        aria-label={`Save price for ${item.name}`}
                                    >
                                        {saving === 'price' ? (
                                            <Loader2 size={15} aria-hidden="true" className="animate-spin" />
                                        ) : (
                                            <Check size={15} aria-hidden="true" />
                                        )}
                                    </button>
                                </span>
                            </label>
                        )}

                        {needsDimensions && (
                            <label className="flex flex-col gap-1">
                                <span className="text-body-subtle text-[10px] font-extrabold tracking-[0.14em] uppercase">
                                    Size in inches — W × H × D
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <input
                                        type="number"
                                        min="0"
                                        value={width}
                                        onChange={(event) => setWidth(event.target.value)}
                                        aria-label={`Width of ${item.name}`}
                                        placeholder="W"
                                        className={NUMBER_INPUT_CLASSES}
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        value={height}
                                        onChange={(event) => setHeight(event.target.value)}
                                        aria-label={`Height of ${item.name}`}
                                        placeholder="H"
                                        className={NUMBER_INPUT_CLASSES}
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        value={depth}
                                        onChange={(event) => setDepth(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                event.preventDefault();
                                                void saveDimensions();
                                            }
                                        }}
                                        aria-label={`Depth of ${item.name}`}
                                        placeholder="D"
                                        className={NUMBER_INPUT_CLASSES}
                                    />
                                    <button
                                        type="button"
                                        onClick={saveDimensions}
                                        disabled={saving !== null}
                                        className="bg-gold-400 text-body-inverse hover:bg-gold-300 grid h-9 w-9 place-items-center rounded-md transition-colors disabled:opacity-60"
                                        aria-label={`Save measurements for ${item.name}`}
                                    >
                                        {saving === 'dimensions' ? (
                                            <Loader2 size={15} aria-hidden="true" className="animate-spin" />
                                        ) : (
                                            <Check size={15} aria-hidden="true" />
                                        )}
                                    </button>
                                </span>
                            </label>
                        )}
                    </span>
                )}

                {error && (
                    <small role="alert" className="text-danger text-[11px] font-bold">
                        {error}
                    </small>
                )}
            </span>

            <Link
                href={`/admin/edit?id=${item.oId}`}
                className="border-line text-body-muted hover:bg-surface-hover hover:text-body inline-flex shrink-0 items-center gap-1.5 self-start rounded-md border px-3 py-2 text-xs font-bold transition-colors"
            >
                <Pencil size={13} aria-hidden="true" /> Full editor
            </Link>
        </li>
    );
}

'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { Check, ImageOff, ZoomIn } from 'lucide-react';

import AvailabilityBadge from './AvailabilityBadge';
import type { AvailabilitySummary } from './inventory.types';

/**
 * The one photo card used by both the picker and the catalog.
 *
 * There used to be three independent implementations of this, each with its own colours and its own
 * "flip the photo over to read the details" toggle. The flip is gone: the photo is how she recognises
 * her own furniture, so hiding it behind an undiscoverable toggle traded the card's whole purpose for
 * a text block that belongs on a detail view.
 *
 * The zoom control is a sibling of the main button rather than nested inside it — a button inside a
 * button is invalid, and making zoom the card's tap target is what forced the old design to put
 * "add" on a separate control.
 */

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function InventoryCard({
    name,
    category,
    price,
    thumbnail,
    availability,
    selected = false,
    inactive = false,
    actionLabel,
    onActivate,
    onZoom,
    badge,
    footer,
}: {
    name: string;
    category: string;
    price: number;
    thumbnail: string;
    availability: AvailabilitySummary;
    selected?: boolean;
    inactive?: boolean;
    /** Spoken label for the card's primary action, e.g. "Add Blue Waffle Knit Pillows". */
    actionLabel: string;
    onActivate?: () => void;
    onZoom?: () => void;
    /** Extra status pill, used for "At this house · 2". */
    badge?: ReactNode;
    /** Quantity stepper or per-card controls. Rendered outside the button so it stays clickable. */
    footer?: ReactNode;
}) {
    const interactive = Boolean(onActivate);

    return (
        <article
            className={`bg-surface-raised relative flex flex-col overflow-hidden rounded-lg border transition-colors ${
                selected ? 'border-gold-300 ring-gold-300 ring-1' : 'border-line hover:border-line-strong'
            }`}
        >
            <button
                type="button"
                onClick={onActivate}
                aria-pressed={interactive ? selected : undefined}
                disabled={!interactive}
                className="focus-visible:outline-gold-300 flex flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-default"
            >
                <span className="sr-only">{actionLabel}</span>

                <span className="bg-surface relative block aspect-square w-full overflow-hidden">
                    {thumbnail ? (
                        <Image
                            src={thumbnail}
                            alt=""
                            fill
                            className={`object-cover ${inactive ? 'opacity-40' : ''}`}
                            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 20vw"
                        />
                    ) : (
                        <span className="grid h-full w-full place-items-center">
                            <ImageOff size={22} aria-hidden="true" className="text-body-subtle" />
                        </span>
                    )}

                    {selected && (
                        <span className="bg-gold-300 text-body-inverse shadow-card absolute top-2 left-2 grid h-7 w-7 place-items-center rounded-full">
                            <Check size={16} strokeWidth={3} aria-hidden="true" />
                        </span>
                    )}
                </span>

                <span className="flex flex-col gap-2 p-3">
                    <span className="flex items-start justify-between gap-2">
                        <strong className="text-body line-clamp-2 min-h-[2.25rem] text-xs leading-snug font-bold">{name}</strong>
                        <span className="text-gold-300 shrink-0 text-xs font-bold">{price ? money.format(price) : '—'}</span>
                    </span>

                    <span className="flex flex-wrap items-center gap-1.5">
                        <AvailabilityBadge availability={availability} />
                        {badge}
                        {inactive && <span className="text-body-subtle text-[10px] font-bold uppercase">Inactive</span>}
                    </span>

                    <small className="text-body-subtle truncate text-[11px]">{category || 'Uncategorised'}</small>
                </span>
            </button>

            {footer && <div className="border-line border-t p-2">{footer}</div>}

            {onZoom && thumbnail && (
                <button
                    type="button"
                    onClick={onZoom}
                    aria-label={`Enlarge photo of ${name}`}
                    className="border-line-strong bg-ink/70 text-body hover:bg-ink focus-visible:outline-gold-300 absolute top-2 right-2 grid h-9 w-9 place-items-center rounded-md border backdrop-blur transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                    <ZoomIn size={15} aria-hidden="true" />
                </button>
            )}
        </article>
    );
}

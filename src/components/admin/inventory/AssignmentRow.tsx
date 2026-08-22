'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { ImageOff } from 'lucide-react';

/**
 * A compact line for one assigned item.
 *
 * Used by the picker's staging list, the project's inventory tab, and both check-in screens — three
 * places that previously each drew their own photo grid. A list is the right form here: these rows
 * are read as a manifest and acted on one at a time, so a 64px thumbnail is enough to recognise the
 * item and the rest of the width can carry the numbers.
 */
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function AssignmentRow({
    name,
    category,
    thumbnail,
    quantity,
    pricePerItem,
    note,
    problem,
    action,
    leading,
}: {
    name: string;
    category?: string;
    thumbnail?: string;
    quantity: number;
    pricePerItem: number;
    /** Neutral supporting text, e.g. "Assigned Mar 14". */
    note?: string;
    /** Danger-toned message shown when this line blocked a commit. */
    problem?: string;
    /** Stepper, remove button, or check-in control. */
    action?: ReactNode;
    /** Checkbox slot, used by the check-in screens. */
    leading?: ReactNode;
}) {
    return (
        <li className={`flex items-center gap-3 px-4 py-3 ${problem ? 'bg-danger-soft/40' : ''}`}>
            {leading}

            <span className="border-line bg-surface grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-md border">
                {thumbnail ? (
                    <Image src={thumbnail} alt="" width={48} height={48} className="h-full w-full object-cover" />
                ) : (
                    <ImageOff size={16} aria-hidden="true" className="text-body-subtle" />
                )}
            </span>

            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <strong className="text-body truncate text-sm font-bold">{name}</strong>
                <small className="text-body-subtle truncate text-[11px]">
                    {category ? `${category} · ` : ''}
                    {quantity} × {pricePerItem ? money.format(pricePerItem) : '$0'}
                    {note ? ` · ${note}` : ''}
                </small>
                {problem && <small className="text-danger text-[11px] font-bold">{problem}</small>}
            </span>

            <span className="text-body shrink-0 text-sm font-bold">{money.format(quantity * pricePerItem)}</span>

            {action && <span className="shrink-0">{action}</span>}
        </li>
    );
}

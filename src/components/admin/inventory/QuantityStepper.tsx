'use client';

import { Minus, Plus } from 'lucide-react';

/**
 * Quantity for small integers.
 *
 * This replaces a range slider. A slider is the wrong control for "two or three lamps": on a touch
 * screen the difference between 2 and 3 is a few pixels wide, and the old one was fed a maximum of
 * `item.count`, which ignored every unit already sitting in another house. Targets are 40px so the
 * control is usable on an iPad in a warehouse.
 */
export default function QuantityStepper({
    value,
    max,
    min = 0,
    label,
    onChange,
}: {
    value: number;
    max: number;
    min?: number;
    /** What is being counted, for the screen reader: "Blue Waffle Knit Pillows". */
    label: string;
    onChange: (next: number) => void;
}) {
    const clamp = (next: number) => Math.max(min, Math.min(max, next));

    return (
        <div className="flex items-center gap-1" role="group" aria-label={`Quantity of ${label}`}>
            <button
                type="button"
                onClick={() => onChange(clamp(value - 1))}
                disabled={value <= min}
                aria-label={`One fewer ${label}`}
                className="border-line-strong text-body-muted hover:bg-surface-hover hover:text-body focus-visible:outline-gold-300 grid h-10 w-10 shrink-0 place-items-center rounded-md border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <Minus size={15} aria-hidden="true" />
            </button>

            <input
                type="number"
                inputMode="numeric"
                min={min}
                max={max}
                value={value}
                aria-label={`Quantity of ${label}, up to ${max}`}
                onChange={(event) => onChange(clamp(Number.parseInt(event.target.value, 10) || min))}
                className="border-line-strong bg-surface text-body focus:border-gold-300 h-10 w-12 shrink-0 [appearance:textfield] rounded-md border px-1 text-center text-sm font-bold focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />

            <button
                type="button"
                onClick={() => onChange(clamp(value + 1))}
                disabled={value >= max}
                aria-label={`One more ${label}`}
                className="border-line-strong text-body-muted hover:bg-surface-hover hover:text-body focus-visible:outline-gold-300 grid h-10 w-10 shrink-0 place-items-center rounded-md border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <Plus size={15} aria-hidden="true" />
            </button>
        </div>
    );
}

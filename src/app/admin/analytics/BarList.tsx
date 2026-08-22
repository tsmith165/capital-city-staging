import type { AnalyticsEntry } from '@/data/posthogAnalytics.types';

const number = new Intl.NumberFormat('en-US');

/**
 * Ranked list with a proportional bar behind each row. The bar is decorative — the value is
 * always present as text so the ranking does not depend on reading the fill.
 */
export default function BarList({
    entries,
    format = (value: number) => number.format(value),
}: {
    entries: (AnalyticsEntry & { hint?: string })[];
    /** Overrides the value formatting, so money-shaped lists read as money. */
    format?: (value: number) => string;
}) {
    const max = Math.max(...entries.map((entry) => entry.value), 1);

    return (
        <ul className="divide-line flex flex-col divide-y">
            {entries.map((entry) => (
                <li key={entry.label} className="relative flex items-center justify-between gap-4 px-5 py-2.5">
                    <span
                        aria-hidden="true"
                        className="bg-forest-400/25 absolute inset-y-1 left-2 rounded-sm"
                        style={{ width: `calc(${(entry.value / max) * 100}% - 1rem)` }}
                    />
                    <span className="relative flex min-w-0 flex-col">
                        <span className="text-body truncate text-sm">{entry.label}</span>
                        {entry.hint && <small className="text-body-subtle truncate text-[11px]">{entry.hint}</small>}
                    </span>
                    <strong className="text-body-muted relative shrink-0 text-sm font-bold tabular-nums">{format(entry.value)}</strong>
                </li>
            ))}
        </ul>
    );
}

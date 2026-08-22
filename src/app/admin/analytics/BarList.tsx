import type { AnalyticsEntry } from '@/data/posthogAnalytics.types';

const number = new Intl.NumberFormat('en-US');

/**
 * Ranked list with a proportional bar behind each row. The bar is decorative — the value is
 * always present as text so the ranking does not depend on reading the fill.
 */
export default function BarList({ entries }: { entries: AnalyticsEntry[] }) {
    const max = Math.max(...entries.map((entry) => entry.value), 1);

    return (
        <ul className="flex flex-col divide-y divide-line">
            {entries.map((entry) => (
                <li key={entry.label} className="relative flex items-center justify-between gap-4 px-5 py-2.5">
                    <span
                        aria-hidden="true"
                        className="absolute inset-y-1 left-2 rounded-sm bg-forest-400/25"
                        style={{ width: `calc(${(entry.value / max) * 100}% - 1rem)` }}
                    />
                    <span className="relative min-w-0 truncate text-sm text-body">{entry.label}</span>
                    <strong className="relative shrink-0 text-sm font-bold tabular-nums text-body-muted">
                        {number.format(entry.value)}
                    </strong>
                </li>
            ))}
        </ul>
    );
}

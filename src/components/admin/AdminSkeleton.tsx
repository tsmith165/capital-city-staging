/**
 * Loading placeholders that mirror the geometry of the component they stand in for, so a section
 * keeps its size and does not shove its neighbours down when the data arrives.
 *
 * Two things are deliberate. The pulse needs no reduced-motion guard because the global rule in
 * globals.css already neutralises every animation. And each composite carries `role="status"` with
 * an off-screen label, because a screen reader given a grid of empty boxes reports nothing at all.
 */

const GRID_COLUMNS = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-2 xl:grid-cols-4',
} as const;

type SkeletonColumns = keyof typeof GRID_COLUMNS;

/** One shimmering bar. Width and height come from the caller so it can match real content. */
export function SkeletonBlock({ className = '' }: { className?: string }) {
    return <span aria-hidden="true" className={`bg-line-strong/60 block animate-pulse rounded ${className}`} />;
}

/**
 * `sr-only` is absolutely positioned, so this label never takes up a grid cell or a flex slot.
 */
function LoadingLabel({ children }: { children: string }) {
    return <span className="sr-only">{children}</span>;
}

/** Matches `AdminHeading`: eyebrow, title, one line of description. */
export function SkeletonHeading() {
    return (
        <header
            role="status"
            aria-busy="true"
            className="border-line flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between"
        >
            <LoadingLabel>Loading page heading</LoadingLabel>
            <div className="flex min-w-0 flex-col gap-2.5">
                <SkeletonBlock className="h-2.5 w-24" />
                <SkeletonBlock className="h-8 w-56" />
                <SkeletonBlock className="h-3.5 w-full max-w-md" />
            </div>
        </header>
    );
}

/** Matches `AdminMetric` exactly, including the border and the optional hint line. */
function SkeletonMetric() {
    return (
        <div className="border-line bg-surface flex flex-col gap-2 rounded-lg border px-4 py-3.5">
            <SkeletonBlock className="h-2.5 w-20" />
            <SkeletonBlock className="h-6 w-16" />
            <SkeletonBlock className="h-2.5 w-24" />
        </div>
    );
}

export function SkeletonMetricGrid({
    count = 4,
    columns = 4,
    label = 'Loading figures',
}: {
    count?: number;
    columns?: SkeletonColumns;
    label?: string;
}) {
    return (
        <div role="status" aria-busy="true" className={`grid gap-3 ${GRID_COLUMNS[columns]}`}>
            <LoadingLabel>{label}</LoadingLabel>
            {Array.from({ length: count }, (_, index) => (
                <SkeletonMetric key={index} />
            ))}
        </div>
    );
}

/** Matches `AdminCard`: icon row, headline, description, and a footer action. */
export function SkeletonCardGrid({ count = 3, label = 'Loading cards' }: { count?: number; label?: string }) {
    return (
        <div role="status" aria-busy="true" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <LoadingLabel>{label}</LoadingLabel>
            {Array.from({ length: count }, (_, index) => (
                <article key={index} className="border-line bg-surface-raised shadow-card flex flex-col gap-3 rounded-lg border p-5">
                    <SkeletonBlock className="h-2.5 w-20" />
                    <SkeletonBlock className="h-6 w-4/5" />
                    <SkeletonBlock className="h-3.5 w-full" />
                    <SkeletonBlock className="h-3.5 w-2/3" />
                    <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                        <SkeletonBlock className="h-3 w-24" />
                        <SkeletonBlock className="h-5 w-16 rounded-full" />
                    </div>
                </article>
            ))}
        </div>
    );
}

/** Taper the widths so the block reads as a ranked list, not a stack of identical grey bars. */
const BAR_WIDTHS = ['w-4/5', 'w-3/5', 'w-1/2', 'w-2/5', 'w-1/3', 'w-1/4'] as const;

/** Rows for the inside of an `AdminPanel`, matching `BarList`. */
export function SkeletonBarRows({ rows = 5, label = 'Loading list' }: { rows?: number; label?: string }) {
    return (
        <ul role="status" aria-busy="true" className="divide-line flex flex-col divide-y">
            <LoadingLabel>{label}</LoadingLabel>
            {Array.from({ length: rows }, (_, index) => (
                <li key={index} className="flex items-center justify-between gap-4 px-5 py-2.5">
                    <SkeletonBlock className={`h-3.5 ${BAR_WIDTHS[index % BAR_WIDTHS.length]}`} />
                    <SkeletonBlock className="h-3.5 w-10 shrink-0" />
                </li>
            ))}
        </ul>
    );
}

/** Matches the two-line list rows used by the dashboard panels. */
export function SkeletonListRows({ rows = 4, label = 'Loading list' }: { rows?: number; label?: string }) {
    return (
        <ul role="status" aria-busy="true" className="divide-line flex flex-col divide-y">
            <LoadingLabel>{label}</LoadingLabel>
            {Array.from({ length: rows }, (_, index) => (
                <li key={index} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <SkeletonBlock className="h-3.5 w-2/5" />
                        <SkeletonBlock className="h-3 w-3/5" />
                    </span>
                    <SkeletonBlock className="h-5 w-16 shrink-0 rounded-full" />
                </li>
            ))}
        </ul>
    );
}

/** Matches the card grids used by the inbox and the needs-attention queue. */
export function SkeletonTiles({
    count = 6,
    label = 'Loading items',
    className = 'grid gap-3 md:grid-cols-2 xl:grid-cols-3',
}: {
    count?: number;
    label?: string;
    className?: string;
}) {
    return (
        <div role="status" aria-busy="true" className={className}>
            <LoadingLabel>{label}</LoadingLabel>
            {Array.from({ length: count }, (_, index) => (
                <div key={index} className="border-line bg-surface-raised shadow-card flex flex-col gap-3 rounded-lg border p-4">
                    <div className="flex items-start gap-3">
                        <SkeletonBlock className="h-16 w-16 shrink-0 rounded-md" />
                        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                            <SkeletonBlock className="h-3.5 w-3/4" />
                            <SkeletonBlock className="h-3 w-1/2" />
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        <SkeletonBlock className="h-5 w-20 rounded-full" />
                        <SkeletonBlock className="h-5 w-16 rounded-full" />
                    </div>
                    <SkeletonBlock className="h-3 w-24" />
                </div>
            ))}
        </div>
    );
}

/** Matches a table: real column headers, placeholder cells. */
export function SkeletonTable({
    headers,
    rows = 6,
    label = 'Loading table',
}: {
    headers: readonly string[];
    rows?: number;
    label?: string;
}) {
    return (
        <div role="status" aria-busy="true" className="border-line overflow-x-auto rounded-lg border">
            <LoadingLabel>{label}</LoadingLabel>
            <table className="bg-surface-raised min-w-full">
                <thead>
                    <tr className="border-line border-b">
                        {headers.map((header) => (
                            <th
                                key={header}
                                className="text-body-subtle px-4 py-3 text-left text-[10px] font-extrabold tracking-[0.14em] uppercase"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-line divide-y">
                    {Array.from({ length: rows }, (_, rowIndex) => (
                        <tr key={rowIndex}>
                            {headers.map((header, columnIndex) => (
                                <td key={header} className="px-4 py-3.5">
                                    <SkeletonBlock className={columnIndex === 0 ? 'h-3.5 w-16' : 'h-3.5 w-full max-w-[10rem]'} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/** A simple stack, for panels whose content shape is not worth mirroring precisely. */
export function SkeletonStack({ rows = 3, label = 'Loading' }: { rows?: number; label?: string }) {
    return (
        <div role="status" aria-busy="true" className="flex flex-col gap-3 px-5 py-5">
            <LoadingLabel>{label}</LoadingLabel>
            {Array.from({ length: rows }, (_, index) => (
                <SkeletonBlock key={index} className="h-3.5" />
            ))}
        </div>
    );
}

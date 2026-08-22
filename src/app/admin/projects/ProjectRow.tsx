'use client';

import { ChevronDown, ChevronUp, Images, MapPin, PackageOpen, Star } from 'lucide-react';

import PaymentBadge from '@/components/admin/projects/PaymentBadge';
import { money, shortDate } from '@/components/admin/projects/payments.constants';

import { STATUS_LABELS, STATUS_TONES } from './projects.constants';
import type { ProjectOverviewRow } from './projects.types';

/**
 * One project in the list.
 *
 * The row answers the two questions worth chasing without opening anything — is furniture still out,
 * and is money still owed. Everything else lives in the detail column, so this stays scannable at a
 * dozen rows.
 *
 * The reorder and highlight controls are siblings of the row button rather than children, because a
 * button inside a button is invalid and the browser resolves it by dropping one of them.
 */
export default function ProjectRow({
    project,
    selected,
    reorderable,
    onSelect,
    onMove,
    onToggleHighlight,
}: {
    project: ProjectOverviewRow;
    selected: boolean;
    /** Order is global, so the arrows are hidden while a filter is hiding some of it. */
    reorderable: boolean;
    onSelect: () => void;
    onMove: (direction: -1 | 1) => void;
    onToggleHighlight: () => void;
}) {
    const owed = project.payment.status !== 'paid' && project.status === 'completed';

    return (
        <li
            className={`relative border-l-2 transition-colors ${
                selected ? 'border-l-gold-300 bg-surface-hover' : 'hover:bg-surface-hover/60 border-l-transparent'
            }`}
        >
            <button
                type="button"
                onClick={onSelect}
                aria-current={selected ? 'true' : undefined}
                className="flex w-full flex-col gap-1.5 px-4 py-3 pr-24 text-left"
            >
                <span className="flex flex-wrap items-center gap-2">
                    <strong className="text-body min-w-0 truncate text-sm font-bold">{project.name}</strong>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-bold ${STATUS_TONES[project.status]}`}>
                        {STATUS_LABELS[project.status]}
                    </span>
                    {(owed || project.payment.status !== 'unpaid') && <PaymentBadge payment={project.payment} showBalance />}
                </span>

                {project.address && (
                    <span className="text-body-subtle inline-flex min-w-0 items-center gap-1 truncate text-xs">
                        <MapPin size={11} aria-hidden="true" className="shrink-0" /> {project.address}
                    </span>
                )}

                <span className="text-body-subtle flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    {project.startDate && <span>{shortDate.format(new Date(project.startDate))}</span>}
                    {project.revenue ? <span className="text-body-muted font-bold">{money.format(project.revenue)}</span> : null}
                    {project.openUnits > 0 && (
                        <span className="text-warning inline-flex items-center gap-1 font-bold">
                            <PackageOpen size={11} aria-hidden="true" /> {project.openUnits} out
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                        <Images size={11} aria-hidden="true" /> {project.imageCount}
                    </span>
                </span>
            </button>

            <div className="absolute top-2.5 right-3 flex items-center gap-1">
                <button
                    type="button"
                    onClick={onToggleHighlight}
                    aria-pressed={project.highlighted}
                    aria-label={project.highlighted ? `Remove ${project.name} from the portfolio` : `Show ${project.name} in the portfolio`}
                    title={project.highlighted ? 'In the portfolio' : 'Not in the portfolio'}
                    className={`grid h-7 w-7 place-items-center rounded border transition-colors ${
                        project.highlighted
                            ? 'border-gold-300/50 bg-gold-400/10 text-gold-300'
                            : 'border-line text-body-subtle hover:bg-surface-hover hover:text-body'
                    }`}
                >
                    <Star size={13} aria-hidden="true" fill={project.highlighted ? 'currentColor' : 'none'} />
                </button>

                {reorderable && (
                    <div className="flex flex-col">
                        <button
                            type="button"
                            onClick={() => onMove(-1)}
                            aria-label={`Move ${project.name} earlier`}
                            className="text-body-subtle hover:text-body grid h-4 w-6 place-items-center transition-colors"
                        >
                            <ChevronUp size={13} aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onMove(1)}
                            aria-label={`Move ${project.name} later`}
                            className="text-body-subtle hover:text-body grid h-4 w-6 place-items-center transition-colors"
                        >
                            <ChevronDown size={13} aria-hidden="true" />
                        </button>
                    </div>
                )}
            </div>
        </li>
    );
}

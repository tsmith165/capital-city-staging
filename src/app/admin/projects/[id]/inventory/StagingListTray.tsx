'use client';

import { ChevronDown, ChevronUp, Loader2, Trash2 } from 'lucide-react';

import AssignmentRow from '@/components/admin/inventory/AssignmentRow';
import QuantityStepper from '@/components/admin/inventory/QuantityStepper';

import type { LineProblem, PickerItem, StagingSummary } from './picker.types';

/**
 * The pending pull list.
 *
 * One DOM tree, two shapes. On a tablet it is docked to the bottom: the bar sits in thumb reach and,
 * unlike the old full-height slide-over, it never covers the grid it is summarising — collapsed it is
 * a running total, expanded it is the manifest. From `xl` up it becomes a persistent right-hand rail
 * with the manifest always open, because a desktop has the width to spare and reviewing a twenty-item
 * list should not cost a tap. Responsive classes rather than two renders, so there is never a second
 * hidden copy of every stepper for a screen reader to walk through.
 */

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function commitLabel(summary: StagingSummary<PickerItem>, projectName: string) {
    const { unitsAdded, unitsRemoved } = summary;

    if (unitsAdded === 0 && unitsRemoved === 0) return `Add to ${projectName}`;
    if (unitsAdded > 0 && unitsRemoved > 0) return `Update ${projectName}`;
    if (unitsRemoved > 0) return `Take ${unitsRemoved} ${unitsRemoved === 1 ? 'unit' : 'units'} off ${projectName}`;
    return `Add ${unitsAdded} ${unitsAdded === 1 ? 'unit' : 'units'} to ${projectName}`;
}

export default function StagingListTray({
    summary,
    projectName,
    expanded,
    problems,
    committing,
    onToggleExpanded,
    onQuantityChange,
    onRemove,
    onClear,
    onCommit,
}: {
    summary: StagingSummary<PickerItem>;
    projectName: string;
    expanded: boolean;
    problems: LineProblem[];
    committing: boolean;
    onToggleExpanded: () => void;
    onQuantityChange: (item: PickerItem, quantity: number) => void;
    onRemove: (itemId: string) => void;
    onClear: () => void;
    onCommit: () => void;
}) {
    const problemsById = new Map(problems.map((problem) => [problem.inventoryId, problem] as const));
    const touched = [...summary.adding, ...summary.changing, ...summary.removing];
    const empty = summary.pendingCount === 0;

    return (
        <div
            className={`border-line-strong bg-surface-raised shadow-overlay sticky bottom-0 z-30 flex-col border-t xl:top-0 xl:bottom-auto xl:max-h-[calc(100dvh-64px)] xl:w-[21rem] xl:shrink-0 xl:self-start xl:border-t-0 xl:border-l xl:shadow-none ${
                empty ? 'hidden xl:flex' : 'flex'
            }`}
        >
            <div
                className={`border-line min-h-0 overflow-y-auto border-b xl:block xl:max-h-none xl:flex-1 xl:border-b-0 ${
                    expanded ? 'block max-h-[52vh]' : 'hidden'
                }`}
            >
                {problems.length > 0 && (
                    <p role="alert" className="border-danger/40 bg-danger-soft text-danger border-b px-4 py-3 text-sm">
                        Nothing was added. {problems.length === 1 ? 'One item' : `${problems.length} items`} would need more units than you
                        have free — adjust the highlighted lines and try again.
                    </p>
                )}

                <section>
                    <h3 className="border-line bg-surface-raised text-body-subtle sticky top-0 border-b px-4 py-2.5 text-[10px] font-extrabold tracking-[0.14em] uppercase">
                        Adding now
                    </h3>
                    {touched.length === 0 ? (
                        <p className="text-body-subtle px-4 py-6 text-center text-sm">
                            Tap items in the grid to build a list for this house.
                        </p>
                    ) : (
                        <ul className="divide-line divide-y">
                            {touched.map(({ item, desired, delta }) => (
                                <AssignmentRow
                                    key={item._id}
                                    name={item.name}
                                    category={item.category}
                                    thumbnail={item.smallImagePath}
                                    quantity={desired}
                                    pricePerItem={item.price}
                                    note={
                                        item.assignedHere > 0 ? `was ${item.assignedHere} · ${delta > 0 ? `+${delta}` : delta}` : undefined
                                    }
                                    problem={problemsById.get(item._id)?.message}
                                    action={
                                        <span className="flex items-center gap-1">
                                            <QuantityStepper
                                                value={desired}
                                                max={item.maxForThisProject}
                                                label={item.name}
                                                onChange={(next) => onQuantityChange(item, next)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => onRemove(item._id)}
                                                aria-label={`Remove ${item.name} from this list`}
                                                className="border-line-strong text-body-subtle hover:border-danger/50 hover:bg-danger-soft hover:text-danger grid h-10 w-10 place-items-center rounded-md border transition-colors"
                                            >
                                                <Trash2 size={15} aria-hidden="true" />
                                            </button>
                                        </span>
                                    }
                                />
                            ))}
                        </ul>
                    )}
                </section>

                {summary.alreadyHere.length > 0 && (
                    <section>
                        <h3 className="border-line bg-surface-raised text-body-subtle sticky top-0 border-y px-4 py-2.5 text-[10px] font-extrabold tracking-[0.14em] uppercase">
                            Already at this house · {summary.alreadyHere.length}
                        </h3>
                        <ul className="divide-line divide-y opacity-75">
                            {summary.alreadyHere.map((item) => (
                                <AssignmentRow
                                    key={item._id}
                                    name={item.name}
                                    category={item.category}
                                    thumbnail={item.smallImagePath}
                                    quantity={item.assignedHere}
                                    pricePerItem={item.price}
                                    note="unchanged"
                                />
                            ))}
                        </ul>
                    </section>
                )}
            </div>

            <div className="xl:border-line flex flex-wrap items-center gap-3 px-4 py-3 xl:shrink-0 xl:border-t">
                <button
                    type="button"
                    onClick={onToggleExpanded}
                    aria-expanded={expanded}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left xl:cursor-default"
                >
                    <span className="xl:hidden">
                        {expanded ? (
                            <ChevronDown size={17} aria-hidden="true" className="text-body-subtle shrink-0" />
                        ) : (
                            <ChevronUp size={17} aria-hidden="true" className="text-body-subtle shrink-0" />
                        )}
                    </span>
                    <span className="flex min-w-0 flex-col">
                        <strong className="text-body truncate text-sm font-bold">
                            {empty ? 'Nothing picked yet' : `${summary.pendingCount} ${summary.pendingCount === 1 ? 'item' : 'items'}`}
                            {!empty && ' · '}
                            {summary.unitsAdded > 0 && `${summary.unitsAdded} in`}
                            {summary.unitsAdded > 0 && summary.unitsRemoved > 0 && ', '}
                            {summary.unitsRemoved > 0 && `${summary.unitsRemoved} out`}
                        </strong>
                        <small className="text-body-subtle truncate text-[11px]">
                            {money.format(summary.valueAdded)} rental value
                            <span className="xl:hidden"> · tap to review</span>
                        </small>
                    </span>
                </button>

                <button
                    type="button"
                    onClick={onClear}
                    disabled={empty}
                    className="border-line text-body-muted hover:bg-surface-hover hover:text-body rounded-md border px-3 py-2.5 text-xs font-bold transition-colors disabled:opacity-40"
                >
                    Clear
                </button>

                <button
                    type="button"
                    onClick={onCommit}
                    disabled={committing || empty}
                    className="bg-gold-400 text-body-inverse hover:bg-gold-300 inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {committing && <Loader2 size={15} aria-hidden="true" className="animate-spin" />}
                    {commitLabel(summary, projectName)}
                </button>
            </div>
        </div>
    );
}

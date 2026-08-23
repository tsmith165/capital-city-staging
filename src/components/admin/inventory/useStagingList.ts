'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import type { StagingItem, StagingLine, StagingSummary } from './staging.types';

/**
 * The pending pull list.
 *
 * A draft entry holds the *total* quantity wanted at this house, not a delta. That is what lets one
 * shape cover all three cases — adding an item, changing how many are already there, and taking one
 * off the job by stepping it to zero — and it makes the commit idempotent, so a retry after a
 * shortfall cannot double-assign anything.
 *
 * Nothing is written until commit. Staging a house is one decision made while walking a warehouse,
 * and the old design turned it into twenty separate transactions with no way to review or undo.
 *
 * The draft survives navigation and reload. Walking a warehouse means opening an item, checking a
 * project, and coming back; holding the list in component state alone threw the whole pull list away
 * every time, which is the one failure that makes the tool not worth using.
 */

const STORAGE_PREFIX = 'ccs.staging-list';

function readDraft(projectId: string | undefined): Record<string, number> {
    if (!projectId || typeof window === 'undefined') return {};
    try {
        const raw = window.sessionStorage.getItem(`${STORAGE_PREFIX}:${projectId}`);
        return raw ? (JSON.parse(raw) as Record<string, number>) : {};
    } catch {
        return {};
    }
}

function writeDraft(projectId: string | undefined, draft: Record<string, number>) {
    if (!projectId || typeof window === 'undefined') return;
    try {
        const key = `${STORAGE_PREFIX}:${projectId}`;
        if (Object.keys(draft).length === 0) window.sessionStorage.removeItem(key);
        else window.sessionStorage.setItem(key, JSON.stringify(draft));
    } catch {
        /* A full or blocked store is not worth failing a pull list over. */
    }
}

export function useStagingList<T extends StagingItem>(items: T[] | undefined, projectId?: string) {
    const [draft, setDraftState] = useState<Record<string, number>>({});
    /* Restored after mount rather than during render: sessionStorage does not exist on the server. */
    const restoredFor = useRef<string | null>(null);

    useEffect(() => {
        if (restoredFor.current === (projectId ?? null)) return;
        restoredFor.current = projectId ?? null;
        setDraftState(readDraft(projectId));
    }, [projectId]);

    const setDraft = (update: (current: Record<string, number>) => Record<string, number>) =>
        setDraftState((current) => {
            const next = update(current);
            writeDraft(projectId, next);
            return next;
        });

    const toggle = (item: T) => {
        setDraft((current) => {
            if (item._id in current) {
                const { [item._id]: _removed, ...rest } = current;
                return rest;
            }
            /* Picking up an item already at this house starts from what is there, not from one. */
            const start = item.assignedHere > 0 ? item.assignedHere : 1;
            return { ...current, [item._id]: Math.min(start, Math.max(1, item.maxForThisProject)) };
        });
    };

    const setQuantity = (item: T, quantity: number) => {
        const capped = Math.max(0, Math.min(quantity, item.maxForThisProject));
        setDraft((current) => {
            /* Zero on an item that is not at this house yet just means "never mind". */
            if (capped === 0 && item.assignedHere === 0) {
                const { [item._id]: _removed, ...rest } = current;
                return rest;
            }
            return { ...current, [item._id]: capped };
        });
    };

    const remove = (itemId: string) =>
        setDraft((current) => {
            const { [itemId]: _removed, ...rest } = current;
            return rest;
        });

    const clear = () => setDraft(() => ({}));

    const summary = useMemo<StagingSummary<T>>(() => {
        const source = items ?? [];
        const adding: StagingLine<T>[] = [];
        const changing: StagingLine<T>[] = [];
        const removing: StagingLine<T>[] = [];

        for (const item of source) {
            const desired = draft[item._id];
            if (desired === undefined) continue;

            const line: StagingLine<T> = { item, desired, delta: desired - item.assignedHere };

            if (item.assignedHere === 0) adding.push(line);
            else if (desired === 0) removing.push(line);
            else if (desired !== item.assignedHere) changing.push(line);
        }

        const touched = [...adding, ...changing, ...removing];
        const alreadyHere = source.filter((item) => item.assignedHere > 0 && draft[item._id] === undefined);

        return {
            adding,
            changing,
            removing,
            alreadyHere,
            /* Only lines that actually change anything count as pending work. */
            pendingCount: touched.length,
            unitsAdded: touched.reduce((total, line) => total + Math.max(0, line.delta), 0),
            unitsRemoved: touched.reduce((total, line) => total + Math.max(0, -line.delta), 0),
            valueAdded: touched.reduce((total, line) => total + Math.max(0, line.delta) * line.item.price, 0),
            /* Everything in the draft, including no-op lines, is what the mutation is sent. */
            lines: Object.entries(draft).map(([inventoryId, quantity]) => ({ inventoryId, quantity })),
            selectedIds: new Set(Object.keys(draft)),
        };
    }, [items, draft]);

    return { draft, toggle, setQuantity, remove, clear, summary };
}

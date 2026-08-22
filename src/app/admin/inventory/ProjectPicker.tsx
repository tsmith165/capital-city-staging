'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, House, X } from 'lucide-react';

import { AdminStatus } from '@/components/admin/AdminPrimitives';

import type { ProjectOption } from './catalog.types';

/**
 * Which house the catalog is staging for.
 *
 * Picking furniture used to mean leaving the catalog, opening a project, and entering a separate
 * picker screen — so the catalog was a place to look at things rather than a place to work. Holding
 * the target house here turns the whole grid into the picker and keeps every filter, sort, and search
 * she has already set.
 */

const number = new Intl.NumberFormat('en-US');

function statusTone(status: string) {
    if (status === 'active') return 'good' as const;
    if (status === 'draft') return 'neutral' as const;
    return 'info' as const;
}

export default function ProjectPicker({
    projects,
    selectedId,
    onSelect,
}: {
    projects: ProjectOption[] | undefined;
    selectedId: string | null;
    onSelect: (projectId: string | null) => void;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    /* Click-outside and Escape are document-level concerns, so they need a real subscription. */
    useEffect(() => {
        if (!open) return;

        const onPointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };

        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    const selected = projects?.find((project) => project._id === selectedId) ?? null;
    const needle = query.trim().toLowerCase();
    const visible = (projects ?? []).filter(
        (project) => !needle || project.name.toLowerCase().includes(needle) || project.address.toLowerCase().includes(needle),
    );

    return (
        <div ref={containerRef} className="relative shrink-0">
            <button
                type="button"
                onClick={() => {
                    setOpen((isOpen) => !isOpen);
                    setQuery('');
                }}
                aria-expanded={open}
                aria-haspopup="listbox"
                className={`flex min-w-[15rem] items-center gap-2.5 rounded-md border px-3.5 py-2.5 text-left transition-colors ${
                    selected
                        ? 'border-gold-400/60 bg-gold-400/10 hover:border-gold-400'
                        : 'border-line text-body-muted hover:bg-surface-raised hover:text-body'
                }`}
            >
                <House size={16} aria-hidden="true" className={selected ? 'text-gold-300 shrink-0' : 'shrink-0'} />
                <span className="flex min-w-0 flex-col">
                    <span className="text-body-subtle text-[10px] font-extrabold tracking-[0.14em] uppercase">
                        {selected ? 'Staging for' : 'No house selected'}
                    </span>
                    <strong className={`truncate text-sm font-bold ${selected ? 'text-body' : 'text-body-muted'}`}>
                        {selected ? selected.name : 'Choose a house to stage'}
                    </strong>
                </span>
                <ChevronDown size={15} aria-hidden="true" className="text-body-subtle ml-auto shrink-0" />
            </button>

            {selected && (
                <button
                    type="button"
                    onClick={() => onSelect(null)}
                    aria-label={`Stop staging for ${selected.name}`}
                    className="border-line bg-surface-raised text-body-subtle hover:text-body absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full border transition-colors"
                >
                    <X size={12} aria-hidden="true" />
                </button>
            )}

            {open && (
                <div className="border-line bg-surface-raised shadow-overlay absolute top-full right-0 z-40 mt-2 flex max-h-[60vh] w-[22rem] flex-col overflow-hidden rounded-lg border">
                    <div className="border-line border-b p-2">
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search houses"
                            aria-label="Search houses"
                            autoFocus
                            className="border-line bg-surface text-body placeholder:text-body-subtle focus-visible:border-gold-300 w-full rounded-md border px-3 py-2 text-sm outline-none"
                        />
                    </div>

                    {projects === undefined ? (
                        <p className="text-body-subtle px-4 py-6 text-center text-sm">Loading houses…</p>
                    ) : visible.length === 0 ? (
                        <p className="text-body-subtle px-4 py-6 text-center text-sm">
                            {projects.length === 0 ? 'No projects yet.' : 'No house matches that.'}
                        </p>
                    ) : (
                        <ul role="listbox" className="divide-line min-h-0 divide-y overflow-y-auto">
                            {visible.map((project) => {
                                const isSelected = project._id === selectedId;

                                return (
                                    <li key={project._id}>
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={isSelected}
                                            onClick={() => {
                                                onSelect(isSelected ? null : project._id);
                                                setOpen(false);
                                            }}
                                            className={`hover:bg-surface-hover flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                                                isSelected ? 'bg-gold-400/10' : ''
                                            }`}
                                        >
                                            <span className="flex min-w-0 flex-col gap-1">
                                                <strong className="text-body truncate text-sm font-bold">{project.name}</strong>
                                                {project.address && (
                                                    <small className="text-body-subtle truncate text-[11px]">{project.address}</small>
                                                )}
                                            </span>
                                            <span className="ml-auto flex shrink-0 items-center gap-2">
                                                {project.openUnits > 0 && (
                                                    <span className="text-body-muted text-[11px] font-bold">
                                                        {number.format(project.openUnits)} units
                                                    </span>
                                                )}
                                                <AdminStatus tone={statusTone(project.status)}>{project.status}</AdminStatus>
                                                {isSelected && <Check size={15} aria-hidden="true" className="text-gold-300" />}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

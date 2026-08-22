'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { FolderOpen, Plus, Search, SlidersHorizontal, X } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { AdminHeading } from '@/components/admin/AdminPrimitives';
import AdminSidePanel from '@/components/admin/AdminSidePanel';
import { SkeletonListRows } from '@/components/admin/AdminSkeleton';
import ProjectPaymentDialog from '@/components/admin/projects/ProjectPaymentDialog';
import { money } from '@/components/admin/projects/payments.constants';

import ProjectDetailPanel from './ProjectDetailPanel';
import ProjectRow from './ProjectRow';
import { MONEY_FILTERS, STATUS_FILTERS } from './projects.constants';
import type { MoneyFilter, ProjectOverviewRow, StatusFilter } from './projects.types';

/**
 * Every project, beside the one that is selected.
 *
 * This was a wide table whose every row ended in three icons, which meant the only way to learn
 * anything about a job was to leave the page. The list now carries the two facts that prompt action —
 * furniture still out, money still owed — and the selected project opens in a column that stays put
 * while the list keeps scrolling.
 *
 * Selection lives in the URL so a project can be linked to, and so returning from its editor lands
 * back on the same row.
 */
export default function AdminProjectsClient() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const projects = useQuery(api.projects.getProjectsOverview) as ProjectOverviewRow[] | undefined;
    const toggleHighlight = useMutation(api.projects.toggleProjectHighlight);
    const moveUp = useMutation(api.projects.moveProjectUp);
    const moveDown = useMutation(api.projects.moveProjectDown);
    const moveToFirst = useMutation(api.projects.moveProjectToFirst);
    const moveToLast = useMutation(api.projects.moveProjectToLast);

    const selectedId = searchParams.get('project');

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<StatusFilter>('all');
    const [payment, setPayment] = useState<MoneyFilter>('all');
    const [panelOpen, setPanelOpen] = useState(false);
    const [payingId, setPayingId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return (projects ?? []).filter((project) => {
            if (status !== 'all' && project.status !== status) return false;
            if (payment === 'owed' && project.payment.status === 'paid') return false;
            if (payment === 'paid' && project.payment.status !== 'paid') return false;
            if (!term) return true;
            return `${project.name} ${project.address ?? ''}`.toLowerCase().includes(term);
        });
    }, [projects, search, status, payment]);

    const filtering = search.trim().length > 0 || status !== 'all' || payment !== 'all';
    const selected = (projects ?? []).find((project) => project._id === selectedId) ?? null;
    const paying = (projects ?? []).find((project) => project._id === payingId) ?? null;

    const totals = useMemo(() => {
        const rows = projects ?? [];
        const outstanding = rows.reduce((total, project) => total + project.payment.outstanding, 0);
        return {
            count: rows.length,
            active: rows.filter((project) => project.status === 'active').length,
            owed: rows.filter((project) => project.status === 'completed' && project.payment.status !== 'paid').length,
            outstanding,
        };
    }, [projects]);

    const select = (projectId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (projectId === selectedId) params.delete('project');
        else params.set('project', projectId);
        router.replace(params.size ? `${pathname}?${params}` : pathname, { scroll: false });
        setPanelOpen(projectId !== selectedId);
    };

    const handleMove = (project: ProjectOverviewRow, direction: -1 | 1) => {
        const all = projects ?? [];
        const index = all.findIndex((row) => row._id === project._id);
        const args = { projectId: project._id as Id<'projects'> };

        /* The ends wrap, which is how a project gets to the front of the portfolio in one click. */
        if (direction === -1) void (index === 0 ? moveToLast(args) : moveUp(args));
        else void (index === all.length - 1 ? moveToFirst(args) : moveDown(args));
    };

    const panelBody = selected ? (
        <ProjectDetailPanel
            project={selected}
            onOpenPayment={() => setPayingId(selected._id)}
            onDeleted={() => {
                router.replace(pathname, { scroll: false });
                setPanelOpen(false);
            }}
        />
    ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <FolderOpen size={26} aria-hidden="true" className="text-body-subtle" />
            <strong className="font-display text-body text-base leading-tight font-normal">No project selected</strong>
            <p className="text-body-muted max-w-[16rem] text-sm">
                Pick a project to see its money, its furniture and its photos, and to change the small things without opening it.
            </p>
        </div>
    );

    return (
        <div className="flex min-h-full flex-col xl:flex-row xl:items-start">
            <div className="flex min-w-0 flex-1 flex-col gap-5 p-5 sm:p-8">
                <AdminHeading
                    eyebrow="Back office"
                    title="Projects"
                    description={
                        totals.owed > 0
                            ? `${totals.count} projects, ${totals.active} active. ${totals.owed} finished ${totals.owed === 1 ? 'job is' : 'jobs are'} still owed ${money.format(totals.outstanding)}.`
                            : `${totals.count} projects, ${totals.active} active. Nothing is outstanding.`
                    }
                    action={
                        <Link
                            href="/admin/projects/new"
                            className="bg-gold-400 text-body-inverse hover:bg-gold-300 inline-flex shrink-0 items-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition-colors"
                        >
                            <Plus size={15} aria-hidden="true" /> New project
                        </Link>
                    }
                />

                <div className="flex flex-col gap-2.5">
                    <label className="relative block">
                        <span className="sr-only">Search projects</span>
                        <Search
                            size={15}
                            aria-hidden="true"
                            className="text-body-subtle pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                        />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by name or address"
                            className="border-line bg-surface text-body placeholder:text-body-subtle focus-visible:border-gold-300 w-full rounded-md border py-2.5 pr-3 pl-9 text-sm transition-colors outline-none"
                        />
                    </label>

                    <div className="flex flex-wrap items-center gap-1.5">
                        {STATUS_FILTERS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setStatus(option.value)}
                                aria-pressed={status === option.value}
                                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                                    status === option.value
                                        ? 'border-gold-300/60 bg-gold-400/10 text-gold-200'
                                        : 'border-line text-body-muted hover:bg-surface-hover hover:text-body'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}

                        <span aria-hidden="true" className="bg-line mx-1 h-5 w-px" />

                        {MONEY_FILTERS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setPayment(option.value)}
                                aria-pressed={payment === option.value}
                                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                                    payment === option.value
                                        ? 'border-gold-300/60 bg-gold-400/10 text-gold-200'
                                        : 'border-line text-body-muted hover:bg-surface-hover hover:text-body'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}

                        {filtering && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    setStatus('all');
                                    setPayment('all');
                                }}
                                className="text-body-subtle hover:text-body ml-auto inline-flex items-center gap-1 text-xs font-bold transition-colors"
                            >
                                <X size={12} aria-hidden="true" /> Clear filters
                            </button>
                        )}
                    </div>
                </div>

                <div className="border-line bg-surface-raised min-h-0 flex-1 overflow-hidden rounded-lg border">
                    {projects === undefined ? (
                        <SkeletonListRows rows={6} label="Loading projects" />
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
                            <FolderOpen size={24} aria-hidden="true" className="text-body-subtle" />
                            <p className="text-body-muted text-sm">
                                {projects.length === 0 ? 'No projects yet.' : 'No projects match those filters.'}
                            </p>
                            {projects.length === 0 && (
                                <Link
                                    href="/admin/projects/new"
                                    className="bg-gold-400 text-body-inverse hover:bg-gold-300 inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition-colors"
                                >
                                    <Plus size={15} aria-hidden="true" /> Create the first one
                                </Link>
                            )}
                        </div>
                    ) : (
                        <>
                            {filtering && (
                                <p className="border-line text-body-subtle flex items-center gap-1.5 border-b px-4 py-2 text-xs">
                                    <SlidersHorizontal size={11} aria-hidden="true" />
                                    Showing {filtered.length} of {projects.length}. Portfolio order can only be changed with filters
                                    cleared.
                                </p>
                            )}
                            <ul className="divide-line divide-y">
                                {filtered.map((project) => (
                                    <ProjectRow
                                        key={project._id}
                                        project={project}
                                        selected={project._id === selectedId}
                                        reorderable={!filtering}
                                        onSelect={() => select(project._id)}
                                        onMove={(direction) => handleMove(project, direction)}
                                        onToggleHighlight={() => void toggleHighlight({ projectId: project._id as Id<'projects'> })}
                                    />
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            </div>

            <AdminSidePanel open={panelOpen && selected !== null} onOpenChange={setPanelOpen} label="Project details">
                {panelBody}
            </AdminSidePanel>

            {paying && (
                <ProjectPaymentDialog
                    projectId={paying._id}
                    projectName={paying.name}
                    payment={paying.payment}
                    onClose={() => setPayingId(null)}
                />
            )}
        </div>
    );
}

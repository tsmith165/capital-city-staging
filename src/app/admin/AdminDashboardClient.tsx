'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { ArrowRight, ChevronRight, FileWarning, Home, Inbox, Plus, Undo2 } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import AdminShell from '@/components/admin/AdminShell';
import { AdminCard, AdminEmpty, AdminHeading, AdminMetric, AdminPanel, AdminStatus } from '@/components/admin/AdminPrimitives';
import { SkeletonCardGrid, SkeletonHeading, SkeletonListRows, SkeletonMetricGrid } from '@/components/admin/AdminSkeleton';

const number = new Intl.NumberFormat('en-US');
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

function plural(count: number, singular: string, pluralForm: string) {
    return count === 1 ? singular : pluralForm;
}

export default function AdminDashboardClient() {
    const summary = useQuery(api.dashboard.getDashboardSummary);
    const projectsNeedingAttention = useQuery(api.dashboard.getProjectsNeedingAttention);
    const recentSubmissions = useQuery(api.contactSubmissions.getRecentSubmissions, { limit: 5 });

    /*
     * The dashboard used to collapse to a single centred line of text, so arriving here meant
     * watching the layout appear from nothing. The real structure is drawn straight away and each
     * region fills in place.
     */
    if (!summary) {
        return (
            <AdminShell title="Today">
                <div className="flex flex-col gap-8 p-5 sm:p-8">
                    <SkeletonHeading />
                    <SkeletonCardGrid count={3} label="Loading what needs attention" />
                    <SkeletonMetricGrid count={4} columns={4} label="Loading the business overview" />
                    <div className="grid gap-5 xl:grid-cols-2">
                        <AdminPanel eyebrow="Projects" title="Needs your attention" href="/admin/projects">
                            <SkeletonListRows rows={5} label="Loading projects" />
                        </AdminPanel>
                        <AdminPanel eyebrow="Inbox" title="Recent quote requests" href="/admin/inbox">
                            <SkeletonListRows rows={4} label="Loading recent messages" />
                        </AdminPanel>
                    </div>
                </div>
            </AdminShell>
        );
    }

    const attentionAreas =
        Number(summary.projects.awaitingPayment > 0) +
        Number(summary.inventory.needsAttention > 0) +
        Number(summary.inventory.awaitingCheckIn > 0) +
        Number(summary.inbox.unanswered > 0);

    return (
        <AdminShell title="Today">
            <div className="flex flex-col gap-8 p-5 sm:p-8">
                <AdminHeading
                    eyebrow={today.format(new Date())}
                    title="Good morning, Mia."
                    description={
                        attentionAreas > 0
                            ? `${attentionAreas} ${plural(attentionAreas, 'area needs', 'areas need')} attention before the day begins.`
                            : 'Everything is in order. Nothing is waiting on you right now.'
                    }
                    action={
                        <Link
                            href="/admin/projects/new"
                            className="bg-gold-400 text-body-inverse hover:bg-gold-300 inline-flex shrink-0 items-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition-colors"
                        >
                            <Plus size={16} aria-hidden="true" /> New project
                        </Link>
                    }
                />

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {/*
                     * Furniture stranded on a finished job is the one problem that makes every other
                     * inventory number wrong, so it takes the first card whenever it exists.
                     */}
                    {summary.inventory.awaitingCheckIn > 0 && (
                        <AdminCard
                            icon={Undo2}
                            label="Inventory"
                            headline={`${number.format(summary.inventory.awaitingCheckIn)} ${plural(summary.inventory.awaitingCheckIn, 'unit is', 'units are')} still checked out to finished houses`}
                            description={`Assigned to ${summary.inventory.strandedProjects} ${plural(summary.inventory.strandedProjects, 'job that has', 'jobs that have')} already closed, so what you have free reads lower than it is.`}
                            href="/admin/inventory/check-in"
                            linkLabel="Check them in"
                            tone="warning"
                        />
                    )}
                    <AdminCard
                        icon={Home}
                        label="Projects"
                        headline={
                            summary.projects.awaitingPayment
                                ? `${summary.projects.awaitingPayment} ${plural(summary.projects.awaitingPayment, 'project is', 'projects are')} awaiting payment`
                                : 'Payments are up to date'
                        }
                        description="Completed jobs stay here until the payment is recorded against them."
                        href="/admin/projects"
                        linkLabel="Open projects"
                        tone={summary.projects.awaitingPayment ? 'warning' : 'good'}
                    />
                    <AdminCard
                        icon={FileWarning}
                        label="Catalog"
                        headline={
                            summary.inventory.needsAttention
                                ? `${summary.inventory.needsAttention} ${plural(summary.inventory.needsAttention, 'item needs', 'items need')} attention`
                                : 'Catalog is complete'
                        }
                        description="Items with no photo, or unpriced while out on a job. Prices can be fixed straight from the queue."
                        href="/admin/inventory/attention"
                        linkLabel="Open fix queue"
                        tone={summary.inventory.needsAttention ? 'warning' : 'good'}
                    />
                    <AdminCard
                        icon={Inbox}
                        label="Clients"
                        headline={
                            summary.inbox.unanswered
                                ? `${summary.inbox.unanswered} new ${plural(summary.inbox.unanswered, 'message', 'messages')}`
                                : 'Inbox is clear'
                        }
                        description="Every quote request from the contact form is saved here, even if its email fails."
                        href="/admin/inbox"
                        linkLabel="Open inbox"
                        tone={summary.inbox.unanswered ? 'warning' : 'good'}
                    />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Business overview">
                    <AdminMetric
                        label="Active projects"
                        value={number.format(summary.projects.active)}
                        hint={`${number.format(summary.projects.draft)} in draft`}
                    />
                    <AdminMetric
                        label="Revenue this year"
                        value={money.format(summary.projects.revenueThisYear)}
                        hint={`${number.format(summary.projects.completed)} completed ${plural(summary.projects.completed, 'project', 'projects')}`}
                    />
                    <AdminMetric
                        label="Free to stage"
                        value={`${number.format(summary.inventory.free)} units`}
                        hint={`of ${number.format(summary.inventory.units)} owned`}
                    />
                    <AdminMetric
                        label="Out staging"
                        value={`${number.format(summary.inventory.out)} units`}
                        hint={
                            summary.inventory.out === 0
                                ? 'Nothing is at a house right now'
                                : summary.projects.activeName
                                  ? `At ${summary.projects.activeName}`
                                  : `Across ${number.format(summary.inventory.outProjects)} houses`
                        }
                    />
                </div>

                <div className="grid gap-5 xl:grid-cols-2">
                    <AdminPanel eyebrow="Projects" title="Needs your attention" href="/admin/projects">
                        {projectsNeedingAttention === undefined ? (
                            <SkeletonListRows rows={5} label="Loading projects" />
                        ) : projectsNeedingAttention.length === 0 ? (
                            <AdminEmpty>No active or unpaid projects.</AdminEmpty>
                        ) : (
                            <ul className="divide-line divide-y">
                                {projectsNeedingAttention.slice(0, 6).map((project) => (
                                    <li key={project._id}>
                                        <Link
                                            href={`/admin/projects/${project._id}/edit`}
                                            className="hover:bg-surface-overlay flex items-center gap-3 px-5 py-3.5 transition-colors"
                                        >
                                            <span className="flex min-w-0 flex-col gap-0.5">
                                                <strong className="text-body truncate text-sm font-bold">{project.name}</strong>
                                                <small className="text-body-subtle truncate text-xs">
                                                    {project.address || 'No address recorded'}
                                                </small>
                                            </span>
                                            <span className="ml-auto flex shrink-0 items-center gap-3">
                                                {project.revenue ? (
                                                    <strong className="text-body text-sm font-bold">{money.format(project.revenue)}</strong>
                                                ) : null}
                                                {project.awaitingCheckIn && (
                                                    <AdminStatus tone="warning">{project.openUnits} to check in</AdminStatus>
                                                )}
                                                <AdminStatus tone={project.awaitingPayment ? 'warning' : 'info'}>
                                                    {project.awaitingPayment ? 'Unpaid' : project.status === 'active' ? 'Active' : 'Closed'}
                                                </AdminStatus>
                                            </span>
                                            <ChevronRight size={16} aria-hidden="true" className="text-body-subtle shrink-0" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </AdminPanel>

                    <AdminPanel eyebrow="Inbox" title="Recent quote requests" href="/admin/inbox">
                        {recentSubmissions === undefined ? (
                            <SkeletonListRows rows={4} label="Loading recent messages" />
                        ) : recentSubmissions.length === 0 ? (
                            <AdminEmpty>No messages yet. New contact form submissions appear here.</AdminEmpty>
                        ) : (
                            <ul className="divide-line divide-y">
                                {recentSubmissions.map((submission) => (
                                    <li key={submission._id} className="flex items-start gap-3 px-5 py-3.5">
                                        <span className="flex min-w-0 flex-col gap-1">
                                            <strong className="text-body truncate text-sm font-bold">{submission.name}</strong>
                                            <p className="text-body-muted line-clamp-2 text-xs">{submission.message}</p>
                                            <small className="text-body-subtle text-[11px]">
                                                {shortDate.format(new Date(submission.createdAt))}
                                            </small>
                                        </span>
                                        <span className="ml-auto shrink-0">
                                            <AdminStatus tone={submission.responded ? 'good' : 'warning'}>
                                                {submission.responded ? 'Answered' : 'New'}
                                            </AdminStatus>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </AdminPanel>
                </div>

                <Link
                    href="/admin/analytics"
                    className="text-gold-300 hover:text-gold-200 inline-flex w-fit items-center gap-1.5 text-xs font-bold transition-colors"
                >
                    See traffic and engagement analytics <ArrowRight size={14} aria-hidden="true" />
                </Link>
            </div>
        </AdminShell>
    );
}

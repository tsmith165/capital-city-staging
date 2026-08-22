'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { ArrowRight, ChevronRight, FileWarning, Home, Inbox, Plus } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import AdminShell from '@/components/admin/AdminShell';
import { AdminCard, AdminEmpty, AdminHeading, AdminMetric, AdminPanel, AdminStatus } from '@/components/admin/AdminPrimitives';

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

    if (!summary) {
        return (
            <AdminShell title="Today">
                <div className="flex h-full items-center justify-center p-8 text-sm text-body-subtle">Loading your workspace…</div>
            </AdminShell>
        );
    }

    const attentionAreas =
        Number(summary.projects.awaitingPayment > 0) +
        Number(summary.inventory.needsAttention > 0) +
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
                            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-gold-400 px-4 py-2.5 text-sm font-bold text-body-inverse transition-colors hover:bg-gold-300"
                        >
                            <Plus size={16} aria-hidden="true" /> New project
                        </Link>
                    }
                />

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                        description="Missing photos, dimensions, and prices are collected into a single queue."
                        href="/admin/inventory/attention"
                        linkLabel="Review catalog"
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
                        label="Active inventory"
                        value={number.format(summary.inventory.active)}
                        hint={`${number.format(summary.inventory.units)} total units`}
                    />
                    <AdminMetric
                        label="Currently staged"
                        value={number.format(summary.inventory.inUse)}
                        hint="Units assigned to a project"
                    />
                </div>

                <div className="grid gap-5 xl:grid-cols-2">
                    <AdminPanel eyebrow="Projects" title="Needs your attention" href="/admin/projects">
                        {projectsNeedingAttention === undefined ? (
                            <AdminEmpty>Loading projects…</AdminEmpty>
                        ) : projectsNeedingAttention.length === 0 ? (
                            <AdminEmpty>No active or unpaid projects.</AdminEmpty>
                        ) : (
                            <ul className="divide-y divide-line">
                                {projectsNeedingAttention.slice(0, 6).map((project) => (
                                    <li key={project._id}>
                                        <Link
                                            href={`/admin/projects/${project._id}/edit`}
                                            className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-overlay"
                                        >
                                            <span className="flex min-w-0 flex-col gap-0.5">
                                                <strong className="truncate text-sm font-bold text-body">{project.name}</strong>
                                                <small className="truncate text-xs text-body-subtle">
                                                    {project.address || 'No address recorded'}
                                                </small>
                                            </span>
                                            <span className="ml-auto flex shrink-0 items-center gap-3">
                                                {project.revenue ? (
                                                    <strong className="text-sm font-bold text-body">
                                                        {money.format(project.revenue)}
                                                    </strong>
                                                ) : null}
                                                <AdminStatus tone={project.awaitingPayment ? 'warning' : 'info'}>
                                                    {project.awaitingPayment ? 'Unpaid' : 'Active'}
                                                </AdminStatus>
                                            </span>
                                            <ChevronRight size={16} aria-hidden="true" className="shrink-0 text-body-subtle" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </AdminPanel>

                    <AdminPanel eyebrow="Inbox" title="Recent quote requests" href="/admin/inbox">
                        {recentSubmissions === undefined ? (
                            <AdminEmpty>Loading messages…</AdminEmpty>
                        ) : recentSubmissions.length === 0 ? (
                            <AdminEmpty>No messages yet. New contact form submissions appear here.</AdminEmpty>
                        ) : (
                            <ul className="divide-y divide-line">
                                {recentSubmissions.map((submission) => (
                                    <li key={submission._id} className="flex items-start gap-3 px-5 py-3.5">
                                        <span className="flex min-w-0 flex-col gap-1">
                                            <strong className="truncate text-sm font-bold text-body">{submission.name}</strong>
                                            <p className="line-clamp-2 text-xs text-body-muted">{submission.message}</p>
                                            <small className="text-[11px] text-body-subtle">
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
                    className="inline-flex w-fit items-center gap-1.5 text-xs font-bold text-gold-300 transition-colors hover:text-gold-200"
                >
                    See traffic and engagement analytics <ArrowRight size={14} aria-hidden="true" />
                </Link>
            </div>
        </AdminShell>
    );
}

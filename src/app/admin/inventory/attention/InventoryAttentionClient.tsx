'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { ArrowLeft, CheckCircle2, ImageOff, Pencil } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import AdminShell from '@/components/admin/AdminShell';
import { AdminEmpty, AdminHeading, AdminStatus } from '@/components/admin/AdminPrimitives';

export default function InventoryAttentionClient() {
    const items = useQuery(api.dashboard.getInventoryNeedingAttention);

    return (
        <AdminShell title="Needs attention">
            <div className="flex flex-col gap-6 p-5 sm:p-8">
                <AdminHeading
                    eyebrow="Inventory"
                    title="Needs attention"
                    description="Active inventory that is missing something a customer or a project would need. Fixing these keeps the public catalog accurate."
                    action={
                        <Link
                            href="/admin/inventory"
                            className="inline-flex shrink-0 items-center gap-2 rounded-md border border-line px-4 py-2.5 text-sm font-bold text-body-muted transition-colors hover:bg-surface-raised hover:text-body"
                        >
                            <ArrowLeft size={16} aria-hidden="true" /> All inventory
                        </Link>
                    }
                />

                {items === undefined ? (
                    <AdminEmpty>Checking the catalog…</AdminEmpty>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-lg border border-line bg-surface-raised px-5 py-12 text-center">
                        <CheckCircle2 size={28} aria-hidden="true" className="text-success" />
                        <strong className="font-display text-xl font-normal text-body">The catalog is complete</strong>
                        <p className="max-w-md text-sm text-body-muted">
                            Every active item has a photo, a thumbnail, real dimensions, and a price, and none are assigned out more
                            times than you own.
                        </p>
                    </div>
                ) : (
                    <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {items.map((item) => (
                            <li
                                key={item._id}
                                className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-4 shadow-card"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-surface">
                                        {item.smallImagePath || item.imagePath ? (
                                            <Image
                                                src={item.smallImagePath || item.imagePath}
                                                alt=""
                                                width={64}
                                                height={64}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <ImageOff size={20} aria-hidden="true" className="text-body-subtle" />
                                        )}
                                    </div>
                                    <div className="flex min-w-0 flex-col gap-0.5">
                                        <strong className="truncate text-sm font-bold text-body">{item.name}</strong>
                                        <small className="truncate text-xs text-body-subtle">{item.category}</small>
                                    </div>
                                </div>

                                <ul className="flex flex-wrap gap-1.5">
                                    {item.reasons.map((reason) => (
                                        <li key={reason}>
                                            <AdminStatus tone="warning">{reason}</AdminStatus>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href={`/admin/edit?id=${item.oId}`}
                                    className="mt-auto inline-flex w-fit items-center gap-1.5 text-xs font-bold text-gold-300 transition-colors hover:text-gold-200"
                                >
                                    <Pencil size={13} aria-hidden="true" /> Fix this item
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </AdminShell>
    );
}

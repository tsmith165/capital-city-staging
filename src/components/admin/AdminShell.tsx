'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Menu, X } from 'lucide-react';

import AdminNav from './AdminNav';

interface AdminShellProps {
    title: string;
    children: ReactNode;
}

function RailContents() {
    return (
        <>
            <Link
                href="/admin"
                className="flex min-h-[88px] items-center gap-3 border-b border-line px-5 py-5 text-body transition-colors hover:bg-surface-raised"
            >
                <Image src="/logo/CCS_logo.png" alt="" width={44} height={44} className="h-11 w-11 object-contain" />
                <span className="flex min-w-0 flex-col">
                    <strong className="truncate font-display text-base font-normal leading-tight">Capital City Staging</strong>
                    <small className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-gold-300">Admin console</small>
                </span>
            </Link>

            <AdminNav />

            <Link
                href="/"
                target="_blank"
                className="mx-3 mb-4 mt-auto grid grid-cols-[24px_1fr] items-center gap-3 border-t border-line px-3 pt-4 text-body-muted transition-colors hover:text-body"
            >
                <ExternalLink size={17} aria-hidden="true" />
                <span className="flex min-w-0 flex-col">
                    <strong className="text-xs font-bold">View website</strong>
                    <small className="text-[10px] text-body-subtle">Open the public site</small>
                </span>
            </Link>
        </>
    );
}

export default function AdminShell({ title, children }: AdminShellProps) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="grid h-[100dvh] w-full grid-cols-1 overflow-hidden bg-ink text-body lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="hidden min-h-0 flex-col border-r border-line bg-surface lg:flex">
                <RailContents />
            </aside>

            {menuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        aria-label="Close menu"
                        onClick={() => setMenuOpen(false)}
                        className="absolute inset-0 h-full w-full bg-black/70"
                    />
                    <aside className="relative flex h-full w-[280px] max-w-[85vw] flex-col border-r border-line bg-surface shadow-overlay">
                        <RailContents />
                    </aside>
                </div>
            )}

            <div className="grid min-h-0 min-w-0 grid-rows-[64px_minmax(0,1fr)]">
                <header className="flex items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur sm:px-6">
                    <button
                        type="button"
                        onClick={() => setMenuOpen((open) => !open)}
                        aria-label={menuOpen ? 'Close admin menu' : 'Open admin menu'}
                        aria-expanded={menuOpen}
                        className="grid h-10 w-10 place-items-center rounded-md border border-line text-body-muted transition-colors hover:bg-surface-raised hover:text-body lg:hidden"
                    >
                        {menuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>

                    <div className="flex min-w-0 flex-col">
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-body-subtle">
                            Capital City Staging
                        </span>
                        <strong className="truncate font-display text-lg font-normal leading-tight">{title}</strong>
                    </div>

                    <Link
                        href="/"
                        target="_blank"
                        className="ml-auto hidden items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs font-bold text-body-muted transition-colors hover:bg-surface-raised hover:text-body sm:flex"
                    >
                        View site <ExternalLink size={13} aria-hidden="true" />
                    </Link>
                </header>

                <div className="min-h-0 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
}

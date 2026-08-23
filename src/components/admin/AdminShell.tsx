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
                className="border-line text-body hover:bg-surface-raised flex min-h-[88px] items-center gap-3 border-b px-5 py-5 transition-colors"
            >
                <Image src="/logo/CCS_logo.png" alt="" width={44} height={44} className="h-11 w-11 object-contain" />
                <span className="flex min-w-0 flex-col">
                    <strong className="font-display truncate text-base leading-tight font-normal">Capital City Staging</strong>
                    <small className="text-gold-300 mt-1 text-[9px] font-extrabold tracking-[0.14em] uppercase">Admin console</small>
                </span>
            </Link>

            <AdminNav />

            <Link
                href="/"
                target="_blank"
                className="border-line text-body-muted hover:text-body mx-3 mt-auto mb-4 grid grid-cols-[24px_1fr] items-center gap-3 border-t px-3 pt-4 transition-colors"
            >
                <ExternalLink size={17} aria-hidden="true" />
                <strong className="truncate text-xs font-bold">View website</strong>
            </Link>
        </>
    );
}

export default function AdminShell({ title, children }: AdminShellProps) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="bg-ink text-body grid h-[100dvh] w-full grid-cols-1 overflow-hidden lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="border-line bg-surface hidden min-h-0 flex-col border-r lg:flex">
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
                    <aside className="border-line bg-surface shadow-overlay relative flex h-full w-[280px] max-w-[85vw] flex-col border-r">
                        <RailContents />
                    </aside>
                </div>
            )}

            <div className="grid min-h-0 min-w-0 grid-rows-[64px_minmax(0,1fr)]">
                <header className="border-line bg-surface/95 flex items-center gap-3 border-b px-4 backdrop-blur sm:px-6">
                    <button
                        type="button"
                        onClick={() => setMenuOpen((open) => !open)}
                        aria-label={menuOpen ? 'Close admin menu' : 'Open admin menu'}
                        aria-expanded={menuOpen}
                        className="border-line text-body-muted hover:bg-surface-raised hover:text-body grid h-10 w-10 place-items-center rounded-md border transition-colors lg:hidden"
                    >
                        {menuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>

                    <strong className="font-display min-w-0 truncate text-lg leading-tight font-normal">{title}</strong>

                    <Link
                        href="/"
                        target="_blank"
                        className="border-line text-body-muted hover:bg-surface-raised hover:text-body ml-auto hidden items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-bold transition-colors sm:flex"
                    >
                        View site <ExternalLink size={13} aria-hidden="true" />
                    </Link>
                </header>

                <div className="min-h-0 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
}

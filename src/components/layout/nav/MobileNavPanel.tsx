'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Mail, Phone, X } from 'lucide-react';

import { CONTACT_DETAILS, PRIMARY_CTA, PRIMARY_NAV, type NavItem } from '@/lib/menu_list';
import { track } from '@/lib/analytics';

interface MobileNavPanelProps {
    open: boolean;
    onClose: () => void;
    isAdmin: boolean;
    activeId: string | null;
    onSectionClick: (event: React.MouseEvent<HTMLAnchorElement>, section: string) => void;
}

const PANEL_LINK_CLASSES = 'flex min-h-[52px] items-center rounded-md px-4 text-base font-semibold transition-colors';

export default function MobileNavPanel({ open, onClose, isAdmin, activeId, onSectionClick }: MobileNavPanelProps) {
    const [expanded, setExpanded] = useState<string | null>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    // Focus the close control and lock the page behind the panel while it is open.
    useEffect(() => {
        if (!open) return;

        closeButtonRef.current?.focus();

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open, onClose]);

    if (!open) return null;

    const renderLink = (item: NavItem, nested = false) => {
        const isActive = activeId === item.id;
        const tone = isActive ? 'bg-surface-overlay text-gold-300' : 'text-body hover:bg-surface-overlay hover:text-gold-300';

        return (
            <Link
                key={item.id}
                href={item.href}
                onClick={(event) => {
                    if (item.section) onSectionClick(event, item.section);
                    onClose();
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`${PANEL_LINK_CLASSES} ${tone} ${nested ? 'min-h-[46px] pl-8 text-[15px] font-medium' : ''}`}
            >
                {item.label}
            </Link>
        );
    };

    return (
        <div className="tm:hidden fixed inset-0 z-50">
            <button
                type="button"
                aria-label="Close menu"
                tabIndex={-1}
                onClick={onClose}
                className="bg-ink/80 absolute inset-0 h-full w-full cursor-default backdrop-blur-sm"
            />

            <div
                id="site-menu"
                role="dialog"
                aria-modal="true"
                aria-label="Site menu"
                className="border-line bg-surface shadow-overlay absolute inset-y-0 right-0 flex w-[min(88vw,360px)] flex-col border-l"
            >
                <div className="border-line flex h-16 shrink-0 items-center justify-between border-b px-4">
                    <span className="text-body-subtle text-[13px] font-bold tracking-[0.12em] uppercase">Menu</span>
                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={onClose}
                        aria-label="Close menu"
                        className="text-body-muted hover:bg-surface-raised hover:text-gold-300 grid h-11 w-11 place-items-center rounded-md transition-colors"
                    >
                        <X size={22} aria-hidden="true" />
                    </button>
                </div>

                <nav aria-label="Site" className="flex-1 overflow-y-auto p-3">
                    <div className="flex flex-col gap-0.5">
                        {PRIMARY_NAV.map((item) =>
                            item.children ? (
                                <div key={item.id} className="flex flex-col gap-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setExpanded((value) => (value === item.id ? null : item.id))}
                                        aria-expanded={expanded === item.id}
                                        className={`${PANEL_LINK_CLASSES} text-body hover:bg-surface-overlay hover:text-gold-300 w-full justify-between`}
                                    >
                                        {item.label}
                                        <ChevronDown
                                            size={18}
                                            aria-hidden="true"
                                            className={`transition-transform ${expanded === item.id ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                    {expanded === item.id ? (
                                        <div className="border-line flex flex-col gap-0.5 border-l pb-1 pl-1">
                                            {renderLink({ ...item, id: `${item.id}-all`, label: 'All articles' }, true)}
                                            {item.children.map((child) => renderLink(child, true))}
                                        </div>
                                    ) : null}
                                </div>
                            ) : (
                                renderLink(item)
                            ),
                        )}

                        {isAdmin ? (
                            <Link
                                href="/admin"
                                onClick={onClose}
                                className={`${PANEL_LINK_CLASSES} text-forest-200 hover:bg-surface-overlay hover:text-gold-300`}
                            >
                                Admin console
                            </Link>
                        ) : null}
                    </div>
                </nav>

                <div className="border-line shrink-0 border-t p-4">
                    <Link
                        href={PRIMARY_CTA.href}
                        onClick={() => {
                            track('cta_clicked', { cta: 'get_a_quote', placement: 'nav_mobile' });
                            onClose();
                        }}
                        className="bg-gold-400 text-body-inverse hover:bg-gold-300 flex min-h-[48px] w-full items-center justify-center rounded-md text-sm font-bold tracking-[0.06em] uppercase transition-colors"
                    >
                        {PRIMARY_CTA.label}
                    </Link>

                    <div className="mt-2 flex flex-col text-sm">
                        <a
                            href={CONTACT_DETAILS.phoneHref}
                            onClick={() => track('contact_channel_clicked', { channel: 'phone', placement: 'nav_mobile' })}
                            className="text-body-muted hover:text-gold-300 flex min-h-[44px] items-center gap-2 transition-colors"
                        >
                            <Phone size={15} aria-hidden="true" />
                            {CONTACT_DETAILS.phone}
                        </a>
                        <a
                            href={`mailto:${CONTACT_DETAILS.email}`}
                            onClick={() => track('contact_channel_clicked', { channel: 'email', placement: 'nav_mobile' })}
                            className="text-body-muted hover:text-gold-300 flex min-h-[44px] items-center gap-2 break-all transition-colors"
                        >
                            <Mail size={15} aria-hidden="true" />
                            {CONTACT_DETAILS.email}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

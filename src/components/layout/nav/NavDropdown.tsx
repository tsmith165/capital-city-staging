'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

import type { NavItem } from '@/lib/menu_list';
import { track } from '@/lib/analytics';
import { NAV_LINK_ACTIVE, NAV_LINK_CLASSES, NAV_LINK_IDLE } from './nav.constants';

interface NavDropdownProps {
    item: NavItem;
    isActive: boolean;
}

/** Desktop-only disclosure. Opens on click and on hover, but hover alone never gates access. */
export default function NavDropdown({ item, isActive }: NavDropdownProps) {
    // Hover and click are tracked separately so activating the trigger never closes a menu
    // that hover had already opened. Dismissal is Escape or a click outside, never the trigger.
    const [pinned, setPinned] = useState(false);
    const [hovering, setHovering] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const panelId = useId();

    const open = pinned || hovering;

    const close = useCallback(() => {
        setPinned(false);
        setHovering(false);
    }, []);

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') close();
        };
        const onPointerDown = (event: PointerEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) close();
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('pointerdown', onPointerDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('pointerdown', onPointerDown);
        };
    }, [open, close]);

    return (
        <div ref={containerRef} className="relative" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
            <button
                type="button"
                onClick={() => setPinned(true)}
                aria-expanded={open}
                aria-controls={panelId}
                className={`${NAV_LINK_CLASSES} ${isActive ? NAV_LINK_ACTIVE : NAV_LINK_IDLE} inline-flex items-center gap-1`}
            >
                {item.label}
                <ChevronDown size={14} aria-hidden="true" className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open ? (
                <div id={panelId} className="absolute top-full left-1/2 z-50 w-60 -translate-x-1/2 pt-3">
                    <div className="border-line bg-surface-raised shadow-overlay overflow-hidden rounded-lg border py-1.5">
                        <Link
                            href={item.href}
                            onClick={close}
                            className="text-gold-300 hover:bg-surface-overlay block px-4 py-2 text-[13px] font-bold transition-colors"
                        >
                            All articles
                        </Link>
                        <div className="border-line my-1.5 border-t" />
                        {item.children?.map((child) => (
                            <Link
                                key={child.id}
                                href={child.href}
                                onClick={() => {
                                    track('article_opened', { slug: child.id, placement: 'nav' });
                                    close();
                                }}
                                className="text-body-muted hover:bg-surface-overlay hover:text-gold-300 block px-4 py-2 text-[13px] transition-colors"
                            >
                                {child.label}
                            </Link>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

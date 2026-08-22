'use client';

import React from 'react';
import { SignOutButton } from '@clerk/nextjs';
import { LayoutDashboard, LogOut, RefreshCw } from 'lucide-react';

interface AccountSessionPanelProps {
    email: string;
    isAdmin: boolean;
}

const SECONDARY_BUTTON =
    'inline-flex w-full items-center justify-center gap-2 rounded-md border border-line-strong px-4 py-2.5 text-sm font-semibold text-body transition-colors hover:bg-surface-hover';

/** Signing in while already signed in used to show an empty Clerk form with no explanation. */
export default function AccountSessionPanel({ email, isAdmin }: AccountSessionPanelProps) {
    return (
        <div className="space-y-5">
            <div className="rounded-lg border border-line bg-surface-overlay p-4">
                <p className="text-xs font-semibold tracking-[0.14em] text-body-subtle uppercase">Signed in as</p>
                <p className="mt-1.5 text-sm font-semibold break-all text-body">{email}</p>
                <p className="mt-2 text-sm text-body-muted">
                    {isAdmin
                        ? 'This account has admin console access.'
                        : 'This account does not have admin access. Ask Mia to grant it, or sign in with a different account.'}
                </p>
            </div>

            <div className="space-y-3">
                {isAdmin ? (
                    <a
                        href="/admin"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-forest-400 px-4 py-2.5 text-sm font-semibold text-body transition-colors hover:bg-forest-300"
                    >
                        <LayoutDashboard size={16} aria-hidden="true" />
                        Open admin console
                    </a>
                ) : null}

                <SignOutButton redirectUrl="/signin?account=switched">
                    <button className={SECONDARY_BUTTON} type="button">
                        <RefreshCw size={15} aria-hidden="true" />
                        Use a different account
                    </button>
                </SignOutButton>

                <SignOutButton redirectUrl="/">
                    <button className={SECONDARY_BUTTON} type="button">
                        <LogOut size={15} aria-hidden="true" />
                        Sign out
                    </button>
                </SignOutButton>
            </div>
        </div>
    );
}

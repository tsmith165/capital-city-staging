import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { ShieldAlert } from 'lucide-react';

import AuthShell from '@/components/auth/AuthShell';
import AccountSessionPanel from '@/components/auth/AccountSessionPanel';
import { authMetadata } from '@/components/auth/auth.metadata';

export const metadata: Metadata = authMetadata('Access required', 'This account does not have admin console access.');

/**
 * Reached when a signed-in account without the admin role asks for /admin. Previously that
 * case redirected to the homepage, which looked identical to being signed out.
 */
export default async function NotAuthorizedPage() {
    const user = await currentUser();

    // Landing here signed out is a dead end: there is no account to explain or switch away from.
    if (!user) redirect('/signin?redirect_url=%2Fadmin');

    const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? 'Signed-in account';

    return (
        <AuthShell
            eyebrow="Admin access"
            title="You do not have console access"
            description="Your account is signed in, but it has not been granted the admin role."
            footer={
                <p>
                    Looking to book staging?{' '}
                    <Link href="/contact" className="text-gold-300 hover:text-gold-200 font-semibold">
                        Get a quote
                    </Link>
                    .
                </p>
            }
        >
            <div className="space-y-5">
                <div className="border-warning/40 bg-warning-soft flex items-start gap-3 rounded-lg border p-4">
                    <ShieldAlert size={18} className="text-warning mt-0.5 shrink-0" aria-hidden="true" />
                    <p className="text-body-muted text-sm">
                        Ask Mia to grant admin access to this address, then reload. If you have a second account with access, switch to it
                        below.
                    </p>
                </div>
                <AccountSessionPanel email={email} isAdmin={false} />
            </div>
        </AuthShell>
    );
}

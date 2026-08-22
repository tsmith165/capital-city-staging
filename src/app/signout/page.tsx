import React from 'react';
import type { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';

import AuthShell from '@/components/auth/AuthShell';
import AccountSessionPanel from '@/components/auth/AccountSessionPanel';
import SignedOutNotice from '@/app/signout/SignedOutNotice';
import { authMetadata } from '@/components/auth/auth.metadata';

export const metadata: Metadata = authMetadata('Sign out', 'Sign out of Capital City Staging.');

export default async function SignOutPage() {
    const user = await currentUser();

    if (!user) {
        return (
            <AuthShell eyebrow="Session" title="You are signed out" description="Nothing else is stored in this browser.">
                <SignedOutNotice />
            </AuthShell>
        );
    }

    const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? 'Signed-in account';
    const isAdmin = await isClerkUserIdAdmin(user.id);

    return (
        <AuthShell eyebrow="Session" title="Sign out" description="Confirm below, or head back to the console." >
            <AccountSessionPanel email={email} isAdmin={isAdmin} />
        </AuthShell>
    );
}

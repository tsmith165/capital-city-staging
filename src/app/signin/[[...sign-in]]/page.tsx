import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';

import AuthShell from '@/components/auth/AuthShell';
import AccountSessionPanel from '@/components/auth/AccountSessionPanel';
import { authAppearance } from '@/components/auth/authAppearance';
import { authMetadata } from '@/components/auth/auth.metadata';

export const metadata: Metadata = authMetadata('Sign in', 'Sign in to the Capital City Staging admin console.');

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ redirect_url?: string; account?: string }> }) {
    const [user, params] = await Promise.all([currentUser(), searchParams]);

    // Only ever return people to an internal admin path. An open redirect here would let a
    // crafted link bounce a freshly authenticated session anywhere.
    const requested = params.redirect_url;
    const returnTo = requested && requested.startsWith('/admin') ? requested : '/admin';

    const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? 'Signed-in account';
    const isAdmin = user ? await isClerkUserIdAdmin(user.id) : false;

    if (user) {
        return (
            <AuthShell
                eyebrow="Admin access"
                title="You are already signed in"
                description="Continue to the console, or switch to a different account."
            >
                <AccountSessionPanel email={email} isAdmin={isAdmin} />
            </AuthShell>
        );
    }

    return (
        <AuthShell
            eyebrow="Admin access"
            title="Sign in"
            footer={
                <p>
                    Trying to book staging instead?{' '}
                    <Link href="/contact" className="text-gold-300 hover:text-gold-200 font-semibold">
                        Get a quote
                    </Link>
                    .
                </p>
            }
        >
            {/*
                `signUpUrl` leaves public sign-up reachable even though accounts do nothing for
                customers. Kept for now; the two admin gates make it a quota concern rather than an
                access one. See DEPLOYMENTS.md, "Authentication".
            */}
            <SignIn path="/signin" routing="path" signUpUrl="/signup" fallbackRedirectUrl={returnTo} appearance={authAppearance} />
        </AuthShell>
    );
}

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';

import AuthShell from '@/components/auth/AuthShell';
import { authAppearance } from '@/components/auth/authAppearance';
import { authMetadata } from '@/components/auth/auth.metadata';

export const metadata: Metadata = authMetadata('Create an account', 'Create a Capital City Staging account.');

export default function SignUpPage() {
    return (
        <AuthShell
            eyebrow="New account"
            title="Create an account"
            description="Creating an account does not grant admin access on its own. Mia grants console access separately once an account exists."
            footer={
                <p>
                    Trying to book staging instead?{' '}
                    <Link href="/contact" className="font-semibold text-gold-300 hover:text-gold-200">
                        Get a quote
                    </Link>
                    .
                </p>
            }
        >
            <SignUp path="/signup" routing="path" signInUrl="/signin" fallbackRedirectUrl="/signin" appearance={authAppearance} />
        </AuthShell>
    );
}

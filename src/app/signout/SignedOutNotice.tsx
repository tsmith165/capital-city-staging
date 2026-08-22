import React from 'react';
import Link from 'next/link';

export default function SignedOutNotice() {
    return (
        <div className="space-y-3">
            <Link
                href="/signin"
                className="inline-flex w-full items-center justify-center rounded-md bg-forest-400 px-4 py-2.5 text-sm font-semibold text-body transition-colors hover:bg-forest-300"
            >
                Sign back in
            </Link>
            <Link
                href="/"
                className="inline-flex w-full items-center justify-center rounded-md border border-line-strong px-4 py-2.5 text-sm font-semibold text-body transition-colors hover:bg-surface-hover"
            >
                Go to the site
            </Link>
        </div>
    );
}

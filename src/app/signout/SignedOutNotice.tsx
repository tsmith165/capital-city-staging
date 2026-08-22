import React from 'react';
import Link from 'next/link';

export default function SignedOutNotice() {
    return (
        <div className="space-y-3">
            <Link
                href="/signin"
                className="bg-forest-400 text-body hover:bg-forest-300 inline-flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold transition-colors"
            >
                Sign back in
            </Link>
            <Link
                href="/"
                className="border-line-strong text-body hover:bg-surface-hover inline-flex w-full items-center justify-center rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors"
            >
                Go to the site
            </Link>
        </div>
    );
}

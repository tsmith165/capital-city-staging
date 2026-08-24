'use client';

import Link from 'next/link';
import { AlertTriangle, RotateCcw } from 'lucide-react';

/**
 * Route-level recovery.
 *
 * Without this, one throw inside a page — a Convex query returning a shape a component did not
 * expect, a null where a document was assumed — replaced the whole app with a blank screen and the
 * only way out was the browser's back button.
 */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <main id="main-content" tabIndex={-1} className="bg-ink grid min-h-dvh place-items-center p-6 focus:outline-none">
            <div className="border-line bg-surface-raised flex max-w-md flex-col gap-4 rounded-lg border p-6 text-center">
                <AlertTriangle size={26} aria-hidden="true" className="text-warning mx-auto" />
                <h1 className="font-display text-body text-2xl leading-tight font-normal">Something went wrong on this page</h1>
                <p className="text-body-muted text-sm">
                    Nothing you had already saved is affected. Try the page again, or head back and come at it from somewhere else.
                </p>
                {error.digest && <code className="text-body-subtle text-xs">Reference {error.digest}</code>}
                <div className="flex flex-wrap justify-center gap-2 pt-1">
                    <button
                        type="button"
                        onClick={reset}
                        className="bg-gold-400 text-body-inverse hover:bg-gold-300 inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition-colors"
                    >
                        <RotateCcw size={14} aria-hidden="true" /> Try again
                    </button>
                    <Link
                        href="/"
                        className="border-line text-body-muted hover:bg-surface-hover hover:text-body rounded-md border px-4 py-2.5 text-sm font-bold transition-colors"
                    >
                        Go home
                    </Link>
                </div>
            </div>
        </main>
    );
}

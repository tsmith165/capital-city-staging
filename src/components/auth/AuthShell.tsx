import React, { type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface AuthShellProps {
    eyebrow: string;
    title: string;
    description: string;
    children: ReactNode;
    footer?: ReactNode;
}

/**
 * One frame for sign in, sign up, sign out and the not-authorized screen. These were four
 * bare Clerk widgets centred on an empty page, three of which carried another business's
 * metadata.
 */
export default function AuthShell({ eyebrow, title, description, children, footer }: AuthShellProps) {
    return (
        <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-ink px-5 py-12">
            <div className="w-full max-w-md">
                <Link href="/" className="mx-auto flex w-fit items-center justify-center" aria-label="Capital City Staging home">
                    <Image
                        src="/logo/CCS_logo_text.png"
                        alt="Capital City Staging"
                        width={247}
                        height={88}
                        priority
                        className="h-auto w-[190px] object-contain"
                    />
                </Link>

                <div className="mt-8 rounded-xl border border-line bg-surface-raised p-6 shadow-card sm:p-8">
                    <p className="text-xs font-semibold tracking-[0.2em] text-forest-200 uppercase">{eyebrow}</p>
                    <h1 className="mt-2 font-display text-2xl font-bold text-gold-300">{title}</h1>
                    <p className="mt-2 text-sm leading-relaxed text-body-muted">{description}</p>

                    <div className="mt-7">{children}</div>

                    {footer ? <div className="mt-7 border-t border-line pt-5 text-sm text-body-muted">{footer}</div> : null}
                </div>

                <Link
                    href="/"
                    className="mx-auto mt-6 flex w-fit items-center gap-2 text-sm text-body-subtle transition-colors hover:text-gold-300"
                >
                    <ArrowLeft size={15} aria-hidden="true" />
                    Back to capitalcitystaging.com
                </Link>
            </div>
        </div>
    );
}

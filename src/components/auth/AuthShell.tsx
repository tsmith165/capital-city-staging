import React, { type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface AuthShellProps {
    eyebrow: string;
    title: string;
    description?: string;
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
        <div className="bg-ink flex min-h-[100dvh] w-full flex-col items-center justify-center px-5 py-12">
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

                <div className="border-line bg-surface-raised shadow-card mt-8 rounded-xl border p-6 sm:p-8">
                    <p className="text-forest-200 text-xs font-semibold tracking-[0.2em] uppercase">{eyebrow}</p>
                    <h1 className="font-display text-gold-300 mt-2 text-2xl font-bold">{title}</h1>
                    {description ? <p className="text-body-muted mt-2 text-sm leading-relaxed">{description}</p> : null}

                    <div className="mt-7">{children}</div>

                    {footer ? <div className="border-line text-body-muted mt-7 border-t pt-5 text-sm">{footer}</div> : null}
                </div>

                <Link
                    href="/"
                    className="text-body-subtle hover:text-gold-300 mx-auto mt-6 flex w-fit items-center gap-2 text-sm transition-colors"
                >
                    <ArrowLeft size={15} aria-hidden="true" />
                    Back to capitalcitystaging.com
                </Link>
            </div>
        </div>
    );
}

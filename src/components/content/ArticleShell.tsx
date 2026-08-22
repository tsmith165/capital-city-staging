import React, { type ReactNode } from 'react';
import Image from 'next/image';

export interface ArticleShellImage {
    src: string;
    alt: string;
    width: number;
    height: number;
}

interface ArticleShellProps {
    eyebrow?: string;
    title: string;
    lead?: ReactNode;
    image?: ArticleShellImage;
    children: ReactNode;
    /** Rendered full width below the prose column, outside the typography styles. */
    aside?: ReactNode;
}

/**
 * Shared frame for every long-form public page: the two service pages, the five info
 * articles and the sixteen location pages. They used to be independent copies of the same
 * markup, each carrying its own colour utilities.
 */
export default function ArticleShell({ eyebrow, title, lead, image, children, aside }: ArticleShellProps) {
    return (
        <article className="bg-ink w-full">
            <header className="mx-auto w-full max-w-3xl px-6 pt-14 pb-10 text-center sm:px-8 sm:pt-20">
                {eyebrow ? <p className="text-forest-200 text-xs font-semibold tracking-[0.2em] uppercase">{eyebrow}</p> : null}
                <h1 className="font-display gradient-gold-main mt-3 bg-clip-text text-3xl leading-tight font-bold text-transparent sm:text-4xl">
                    {title}
                </h1>
                {lead ? <p className="text-body-muted mx-auto mt-5 max-w-2xl text-lg">{lead}</p> : null}
            </header>

            {image ? (
                <div className="mx-auto w-full max-w-4xl px-6 sm:px-8">
                    <div className="border-line shadow-card overflow-hidden rounded-xl border">
                        <Image
                            src={image.src}
                            alt={image.alt}
                            width={image.width}
                            height={image.height}
                            className="h-auto w-full"
                            sizes="(max-width: 896px) 100vw, 896px"
                            priority
                        />
                    </div>
                </div>
            ) : null}

            <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
                <div className="prose prose-lg prose-ccs max-w-none">{children}</div>
                {aside ? <div className="mt-14">{aside}</div> : null}
            </div>
        </article>
    );
}

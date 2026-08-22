'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Images } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

import { PRIMARY_ACTION, SECONDARY_ACTION } from '@/components/content/content.constants';
import { track } from '@/lib/analytics';
import { HERO_FALLBACK_IMAGES, HERO_PROOF, HERO_ROTATE_MS } from './home.constants';

type HomepageImage = { src: string; width: number; height: number };

interface InitialHomepageImage {
    imagePath: string;
    width: number;
    height: number;
}

export default function Home({ initialHomepageImages }: { initialHomepageImages?: InitialHomepageImage[] | null }) {
    const homepageImagesData = useQuery(api.homepageImages.getHomepageImages);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Live Convex data once it arrives, the SSR preload before that, local stills as a last resort.
    const images: HomepageImage[] = useMemo(() => {
        const source = homepageImagesData?.length ? homepageImagesData : initialHomepageImages;
        if (source?.length) {
            return source.map((img: InitialHomepageImage) => ({ src: img.imagePath, width: img.width, height: img.height }));
        }
        return [...HERO_FALLBACK_IMAGES];
    }, [homepageImagesData, initialHomepageImages]);

    useEffect(() => {
        if (images.length < 2) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((index) => (index + 1) % images.length);
        }, HERO_ROTATE_MS);

        return () => clearInterval(interval);
    }, [images.length]);

    // The list can shrink underneath us when an admin removes a homepage image.
    const activeIndex = currentImageIndex % images.length;

    return (
        <section className="relative w-full overflow-hidden min-section-viewport">
            {/*
             * The background used to animate a 1.3x scale across three seconds on every rotation.
             * A full-bleed image being transformed forever is the most expensive thing a page can
             * do at idle, and it moved the composition under the copy. It crossfades in place now.
             */}
            <div className="absolute inset-0">
                {images.map((image, index) => (
                    <Image
                        key={image.src}
                        src={image.src}
                        width={image.width}
                        height={image.height}
                        alt=""
                        aria-hidden="true"
                        priority={index === 0}
                        sizes="100vw"
                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                            index === activeIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                    />
                ))}
            </div>

            {/* A readable ground for the copy rather than a radial vignette over the whole frame. */}
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-transparent" aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/40" aria-hidden="true" />

            <div className="relative mx-auto flex min-h-[inherit] w-full max-w-[1400px] flex-col justify-center px-5 py-16 sm:px-8 lg:py-24">
                <div className="max-w-2xl">
                    <p className="text-xs font-bold tracking-[0.2em] text-forest-200 uppercase">
                        Home staging in Sacramento
                    </p>

                    <h1 className="mt-4 text-4xl leading-[1.1] font-bold text-balance text-body sm:text-5xl lg:text-[3.5rem]">
                        Your home, staged to <span className="gradient-gold-main-text">sell faster</span> and for more.
                    </h1>

                    <p className="mt-5 max-w-xl text-lg text-pretty text-body-muted">
                        Mia Dofflemyer is a RESA-certified stager and licensed agent serving Sacramento, Placer and Yolo
                        counties. Vacant or occupied, we stage for the buyers your home is competing for.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <Link
                            href="/contact"
                            className={PRIMARY_ACTION}
                            onClick={() => track('cta_clicked', { cta: 'get_a_quote', placement: 'hero' })}
                        >
                            Get a free quote
                            <ArrowRight size={17} aria-hidden="true" />
                        </Link>
                        <Link
                            href="/?component=portfolio"
                            className={SECONDARY_ACTION}
                            onClick={() => track('cta_clicked', { cta: 'see_our_work', placement: 'hero' })}
                        >
                            <Images size={17} aria-hidden="true" />
                            See our work
                        </Link>
                    </div>

                    <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t border-line/70 pt-6">
                        {HERO_PROOF.map(({ value, label }) => (
                            <div key={label}>
                                <dt className="font-display text-2xl font-bold text-gold-300">{value}</dt>
                                <dd className="mt-0.5 text-xs tracking-wide text-body-subtle uppercase">{label}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </section>
    );
}

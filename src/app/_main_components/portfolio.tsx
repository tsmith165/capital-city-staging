'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

import SectionHeading from '@/components/content/SectionHeading';
import { track } from '@/lib/analytics';
import PortfolioLightbox from './PortfolioLightbox';

export default function Portfolio() {
    const projects = useQuery(api.projects.getHighlightedProjects);
    const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const currentProject = projects?.[selectedProjectIndex];
    const images = currentProject?.images ?? [];

    if (!projects) {
        return (
            <section className="w-full px-5 py-20 sm:px-8">
                <div className="mx-auto max-w-[1200px]">
                    <SectionHeading eyebrow="Recent work" title="Staged by Mia" />
                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[0, 1, 2, 3, 4, 5].map((key) => (
                            <div key={key} className="aspect-[4/3] animate-pulse rounded-lg border border-line bg-surface-raised" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (projects.length === 0) {
        return (
            <section className="w-full px-5 py-20 sm:px-8">
                <div className="mx-auto max-w-[1200px]">
                    <SectionHeading
                        eyebrow="Recent work"
                        title="Portfolio coming soon"
                        lead="Recent projects are being photographed. Call or send a message in the meantime and we will walk you through comparable work."
                    />
                </div>
            </section>
        );
    }

    const step = (delta: number) =>
        setLightboxIndex((current) => (current === null ? null : (current + delta + images.length) % images.length));

    return (
        <section className="w-full px-5 py-20 sm:px-8">
            <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center">
                <SectionHeading
                    eyebrow="Recent work"
                    title="Staged by Mia"
                    lead="Real Sacramento-area listings, photographed after install. Select a project to see the rooms."
                />

                {projects.length > 1 ? (
                    <div role="tablist" aria-label="Projects" className="mt-8 flex flex-wrap justify-center gap-2.5">
                        {projects.map((project, index) => {
                            const isSelected = index === selectedProjectIndex;

                            return (
                                <button
                                    key={project._id}
                                    type="button"
                                    role="tab"
                                    aria-selected={isSelected}
                                    onClick={() => {
                                        setSelectedProjectIndex(index);
                                        track('portfolio_project_selected', { project: project.name });
                                    }}
                                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                                        isSelected
                                            ? 'border-gold-400 bg-gold-400 text-body-inverse'
                                            : 'border-line-strong text-body-muted hover:border-gold-400 hover:text-gold-300'
                                    }`}
                                >
                                    {project.name}
                                </button>
                            );
                        })}
                    </div>
                ) : null}

                {images.length > 0 ? (
                    <div className="mt-10 grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {images.map((image, index) => (
                            <button
                                key={image._id}
                                type="button"
                                onClick={() => {
                                    setLightboxIndex(index);
                                    track('portfolio_image_opened', { project: currentProject?.name ?? '', index });
                                }}
                                aria-label={`View ${currentProject?.name} image ${index + 1} full size`}
                                className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-surface-raised shadow-card"
                            >
                                <Image
                                    src={image.thumbnailPath || image.imagePath}
                                    alt={`${currentProject?.name}, image ${index + 1}`}
                                    fill
                                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                    priority={index < 3}
                                />
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="mt-10 text-body-subtle">Photography for this project is on its way.</p>
                )}
            </div>

            {lightboxIndex !== null ? (
                <PortfolioLightbox
                    images={images}
                    index={lightboxIndex}
                    projectName={currentProject?.name ?? ''}
                    onClose={() => setLightboxIndex(null)}
                    onStep={step}
                />
            ) : null}
        </section>
    );
}

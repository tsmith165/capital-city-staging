'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { MapContainer, Polygon, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import SectionHeading from '@/components/content/SectionHeading';
import { SERVICE_AREAS } from '@/components/layout/Footer.constants';
import { track } from '@/lib/analytics';
import rawCityBoundaries from '@/lib/city_boundaries.json';
import { CITY_CYCLE_MS, MAP_CENTER, MAP_ZOOM } from './where.constants';

/** Ordered by the service-area constant so the map, the footer and the sitemap cannot drift. */
const cityBoundaries = SERVICE_AREAS.map((area) => {
    const boundary = rawCityBoundaries.find((city) => city.name === area.name);
    return boundary ? { ...area, coordinates: boundary.coordinates } : null;
}).filter((city): city is NonNullable<typeof city> => city !== null);

export default function Where() {
    const [hoveredCity, setHoveredCity] = useState<string | null>(null);
    const [cycleIndex, setCycleIndex] = useState(0);
    const [visible, setVisible] = useState(false);
    const [mapReady, setMapReady] = useState(false);
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hasFlown = useRef(false);

    /*
     * The highlight cycle used to run on a one-second interval for as long as the page was open,
     * repainting the canvas whether or not the map was on screen. It now only ticks while the
     * section is actually visible, stops while a pointer or keyboard is driving the highlight,
     * and never starts for a reader who has asked for reduced motion.
     */
    useEffect(() => {
        const node = containerRef.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setVisible(entry.isIntersecting);

                if (entry.isIntersecting && !hasFlown.current) {
                    hasFlown.current = true;
                    mapRef.current?.flyTo(MAP_CENTER, MAP_ZOOM, { duration: 1.5, easeLinearity: 0.25 });
                    setMapReady(true);
                }
            },
            { threshold: 0.2 },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    const reducedMotion = useReducedMotion();
    const cycling = visible && !hoveredCity && !reducedMotion && cityBoundaries.length > 1;

    useEffect(() => {
        if (!cycling) return;

        const interval = setInterval(() => {
            setCycleIndex((index) => (index + 1) % cityBoundaries.length);
        }, CITY_CYCLE_MS);

        return () => clearInterval(interval);
    }, [cycling]);

    // A pointer or a focus ring always wins over the ambient cycle.
    const activeCity = hoveredCity ?? (cycling ? cityBoundaries[cycleIndex].name : null);

    const selectCity = (name: string) => {
        setHoveredCity(name);
        track('service_area_selected', { city: name });
    };

    return (
        <section ref={containerRef} className="w-full px-5 py-20 sm:px-8">
            <div className="mx-auto flex w-full max-w-[1200px] flex-col">
                <SectionHeading
                    title="Where we work"
                    lead="Sacramento, Placer and Yolo counties. Anything further is quoted per job."
                />

                {/* Cities are links, not decorated divs: each one has a page and each is reachable by keyboard. */}
                <ul className="mt-8 flex flex-wrap gap-x-2 gap-y-2.5">
                    {cityBoundaries.map((city) => (
                        <li key={city.slug}>
                            <Link
                                href={`/locations/${city.slug}`}
                                onMouseEnter={() => setHoveredCity(city.name)}
                                onMouseLeave={() => setHoveredCity(null)}
                                onFocus={() => setHoveredCity(city.name)}
                                onBlur={() => setHoveredCity(null)}
                                onClick={() => selectCity(city.name)}
                                className={`inline-flex rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors duration-500 ${
                                    activeCity === city.name
                                        ? 'border-gold-400 bg-gold-400 text-body-inverse'
                                        : 'border-line-strong text-body-muted hover:border-gold-400 hover:text-gold-300'
                                }`}
                            >
                                {city.name}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="mt-10 h-[clamp(320px,50vh,520px)] w-full overflow-hidden rounded-xl border border-line shadow-card">
                    <MapContainer
                        center={MAP_CENTER}
                        zoom={7}
                        className="h-full w-full"
                        ref={mapRef}
                        dragging={false}
                        zoomControl={false}
                        scrollWheelZoom={false}
                        doubleClickZoom={false}
                        touchZoom={false}
                        keyboard={false}
                        attributionControl={false}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            subdomains="abcd"
                            maxZoom={11}
                        />
                        {mapReady
                            ? cityBoundaries.map((city) => {
                                  const isActive = activeCity === city.name;

                                  return (
                                      <Polygon
                                          key={city.slug}
                                          positions={city.coordinates[0].map(([lng, lat]) => [lat, lng])}
                                          pathOptions={{
                                              color: isActive ? '#b99727' : '#355e3b',
                                              fillColor: isActive ? '#d4af37' : '#498352',
                                              fillOpacity: isActive ? 0.5 : 0.2,
                                          }}
                                          eventHandlers={{
                                              mouseover: () => setHoveredCity(city.name),
                                              mouseout: () => setHoveredCity(null),
                                              click: () => selectCity(city.name),
                                          }}
                                      />
                                  );
                              })
                            : null}
                    </MapContainer>
                </div>
            </div>
        </section>
    );
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/*
 * `useSyncExternalStore` rather than state-in-an-effect: the media query is external state, and
 * reading it during render means the cycle never starts for one frame before being torn down.
 */
function subscribeToReducedMotion(onChange: () => void) {
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
}

function useReducedMotion() {
    return useSyncExternalStore(
        subscribeToReducedMotion,
        () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
        () => false,
    );
}

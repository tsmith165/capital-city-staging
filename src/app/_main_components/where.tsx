'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MapContainer, Polygon, TileLayer } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import SectionHeading from '@/components/content/SectionHeading';
import { SERVICE_AREAS } from '@/components/layout/Footer.constants';
import { track } from '@/lib/analytics';
import rawCityBoundaries from '@/lib/city_boundaries.json';

const MAP_CENTER: LatLngTuple = [38.6171, -121.3283];

/** Ordered by the service-area constant so the map, the footer and the sitemap cannot drift. */
const cityBoundaries = SERVICE_AREAS.map((area) => {
    const boundary = rawCityBoundaries.find((city) => city.name === area.name);
    return boundary ? { ...area, coordinates: boundary.coordinates } : null;
}).filter((city): city is NonNullable<typeof city> => city !== null);

export default function Where() {
    const [activeCity, setActiveCity] = useState<string | null>(null);
    const [mapReady, setMapReady] = useState(false);
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    /*
     * The map used to cycle a highlighted polygon on a one-second interval for as long as the
     * page was open, repainting the whole canvas each tick whether or not it was on screen.
     * Highlighting now follows the pointer or keyboard focus and is idle otherwise.
     */
    useEffect(() => {
        const node = containerRef.current;
        if (!node) return;

        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;

                timeoutId = setTimeout(() => {
                    mapRef.current?.flyTo(MAP_CENTER, 9.5, { duration: 1.5, easeLinearity: 0.25 });
                    setMapReady(true);
                }, 300);

                observer.disconnect();
            },
            { threshold: 0.2 },
        );

        observer.observe(node);

        return () => {
            observer.disconnect();
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);

    const selectCity = (name: string) => {
        setActiveCity(name);
        track('service_area_selected', { city: name });
    };

    return (
        <section ref={containerRef} className="w-full px-5 py-20 sm:px-8">
            <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center">
                <SectionHeading
                    eyebrow="Service area"
                    title="Where we work"
                    lead="Sacramento and the surrounding cities across Sacramento, Placer and Yolo counties. Travel beyond the map is quoted per job."
                />

                {/* Cities are links, not decorated divs: each one has a page and each is reachable by keyboard. */}
                <ul className="mt-8 flex flex-wrap justify-center gap-x-2 gap-y-2.5">
                    {cityBoundaries.map((city) => (
                        <li key={city.slug}>
                            <Link
                                href={`/locations/${city.slug}`}
                                onMouseEnter={() => setActiveCity(city.name)}
                                onMouseLeave={() => setActiveCity(null)}
                                onFocus={() => setActiveCity(city.name)}
                                onBlur={() => setActiveCity(null)}
                                onClick={() => selectCity(city.name)}
                                className={`inline-flex rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
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
                                              mouseover: () => setActiveCity(city.name),
                                              mouseout: () => setActiveCity(null),
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

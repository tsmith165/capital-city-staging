'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import { LatLngExpression, LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import cityBoundaries from '../lib/city_boundaries.json';

const WhereWeWork: React.FC = () => {
    const MAP_CENTER: LatLngTuple = [38.6171, -121.3283];

    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [hoveredMap, setHoveredMap] = useState<boolean>(false);
    const [currentCityIndex, setCurrentCityIndex] = useState<number>(0);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [zoomComplete, setZoomComplete] = useState<boolean>(false);
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;

        if (!hoveredMap && !selectedCity && zoomComplete) {
            interval = setInterval(() => {
                setCurrentCityIndex((prevIndex) => (prevIndex === cityBoundaries.length - 1 ? 0 : prevIndex + 1));
            }, 1000);
        }

        return () => {
            if (interval !== null) {
                clearInterval(interval);
            }
        };
    }, [selectedCity, hoveredMap, zoomComplete]);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        console.log('Map is intersecting');

                        timeoutId = setTimeout(() => {
                            setIsVisible(true);
                            if (mapRef.current) {
                                mapRef.current.on('zoomend', () => {
                                    console.log('Zoom complete...');
                                    setTimeout(() => {
                                        setZoomComplete(true);
                                    }, 500);
                                });

                                mapRef.current.flyTo(MAP_CENTER, 9.5, {
                                    duration: 2,
                                    easeLinearity: 0.25,
                                });
                            }
                        }, 500);
                    } else {
                        setIsVisible(false);
                        if (timeoutId) {
                            clearTimeout(timeoutId);
                        }
                    }
                });
            },
            { threshold: 0.2 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, []);

    const handleMouseOver = (cityName: string) => {
        setSelectedCity(cityName);
        const cityIndex = cityBoundaries.findIndex((city) => city.name === cityName);
        setCurrentCityIndex(cityIndex);
    };

    const handleMouseOut = () => {
        setSelectedCity(null);
    };

    const handleCityClick = (cityName: string) => {
        setSelectedCity(cityName);
        const cityIndex = cityBoundaries.findIndex((city) => city.name === cityName);
        setCurrentCityIndex(cityIndex);
    };

    const handleMapReady = () => {
        console.log('handleMapReady');
        if (mapRef.current) {
            mapRef.current.on('zoomend', () => {
                console.log('Zoom complete...');
                setZoomComplete(true);
            });
        }
    };

    return (
        <div ref={containerRef} className="w-full h-[calc(100dvh-50px)] p-2 flex flex-col space-y-2">
            <div className="w-full text-center items-center justify-center flex">
                <h1 className="w-fit text-transparent bg-clip-text bg-gradient-to-r from-secondary from-10% via-secondary_light via-70% to-secondary_dark to-90% text-4xl font-bold">
                    Where We Work
                </h1>
            </div>
            <div className="flex flex-wrap justify-center space-x-2 pb-2">
                {cityBoundaries.map((city, index) => (
                    <React.Fragment key={index}>
                        <div
                            onMouseOver={() => handleMouseOver(city.name)}
                            onMouseOut={handleMouseOut}
                            onClick={() => handleCityClick(city.name)}
                            className={`cursor-pointer font-bold text-transparent bg-clip-text ${
                                selectedCity === city.name || (!selectedCity && index === currentCityIndex)
                                    ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400'
                                    : 'bg-gradient-to-r  from-secondary from-10% via-secondary_light via-70% to-secondary to-90% hover:from-yellow-400 hover:via-amber-500 hover:to-yellow-400'
                            }`}>
                            {city.name}
                        </div>
                        {index < cityBoundaries.length - 1 && (
                            <div className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500">
                                -
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
            <div className="flex-grow relative w-full">
                <MapContainer center={MAP_CENTER} zoom={isVisible ? 10 : 6} className="w-full h-full rounded-lg" ref={mapRef}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" subdomains="abcd" maxZoom={11} />
                    {zoomComplete && (
                        <>
                            {cityBoundaries.map((city, index) => (
                                <Polygon
                                    key={index}
                                    positions={city.coordinates[0].map(([lng, lat]) => [lat, lng])}
                                    pathOptions={{
                                        color: '#355e3b',
                                        fillColor: '#498352',
                                        fillOpacity: 0.2,
                                    }}
                                    eventHandlers={{
                                        mouseover: () => handleMouseOver(city.name),
                                        mouseout: handleMouseOut,
                                        click: () => handleCityClick(city.name),
                                    }}
                                />
                            ))}
                            {!selectedCity && cityBoundaries[currentCityIndex] && (
                                <Polygon
                                    positions={cityBoundaries[currentCityIndex].coordinates[0].map(([lng, lat]) => [lat, lng])}
                                    pathOptions={{
                                        color: '#b99727',
                                        fillColor: '#d4af37',
                                        fillOpacity: 0.5,
                                    }}
                                    eventHandlers={{
                                        mouseover: () => handleMouseOver(cityBoundaries[currentCityIndex].name),
                                        mouseout: handleMouseOut,
                                        click: () => handleCityClick(cityBoundaries[currentCityIndex].name),
                                    }}
                                />
                            )}
                            {selectedCity && (
                                <Polygon
                                    positions={
                                        cityBoundaries
                                            .find((city) => city.name === selectedCity)
                                            ?.coordinates[0].map(([lng, lat]) => [lat, lng]) || []
                                    }
                                    pathOptions={{
                                        color: '#b99727',
                                        fillColor: '#d4af37',
                                        fillOpacity: 0.5,
                                    }}
                                    eventHandlers={{
                                        mouseover: () => handleMouseOver(selectedCity),
                                        mouseout: handleMouseOut,
                                        click: () => handleCityClick(selectedCity),
                                    }}
                                />
                            )}
                        </>
                    )}
                </MapContainer>
            </div>
        </div>
    );
};

export default WhereWeWork;

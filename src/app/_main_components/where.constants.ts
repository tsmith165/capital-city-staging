import type { LatLngTuple } from 'leaflet';

export const MAP_CENTER: LatLngTuple = [38.6171, -121.3283];
export const MAP_ZOOM = 9.5;

/** Slow enough to read the city name that lit up, rather than the one-second strobe it replaced. */
export const CITY_CYCLE_MS = 2200;

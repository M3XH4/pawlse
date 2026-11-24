export type TravelMode = 'walking' | 'driving';

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface RouteResult {
    /** Ordered [latitude, longitude] pairs for Leaflet L.polyline */
    coordinates: [number, number][];
    distanceMeters: number;
    durationSeconds: number | null;
    mode: TravelMode;
    isFallback: boolean;
}

/**
 * Calculates the great-circle distance in kilometers between two GPS coordinates.
 */
export function haversineDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c;
}

/**
 * Formats a distance in meters into a concise human-readable string (e.g. "850 m" or "2.4 km").
 */
export function formatTravelDistance(meters: number): string {
    if (!Number.isFinite(meters) || meters <= 0) {
        return '0 m';
    }

    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }

    const km = meters / 1000;

    return `${km.toFixed(1)} km`;
}

/**
 * Formats a travel duration in seconds into a concise string (e.g. "~6 min" or "~1 hr 15 min").
 */
export function formatTravelDuration(seconds: number | null): string | null {
    if (seconds === null || !Number.isFinite(seconds) || seconds < 0) {
        return null;
    }

    if (seconds === 0) {
        return '< 1 min';
    }

    const totalMinutes = Math.max(1, Math.round(seconds / 60));

    if (totalMinutes < 60) {
        return `~${totalMinutes} min`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    return mins > 0 ? `~${hours} hr ${mins} min` : `~${hours} hr`;
}

async function queryOsrmEndpoint(
    url: string,
    mode: TravelMode,
    externalSignal?: AbortSignal,
): Promise<RouteResult | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const onExternalAbort = () => controller.abort();

    if (externalSignal) {
        if (externalSignal.aborted) {
            clearTimeout(timeoutId);

            throw new DOMException('Aborted', 'AbortError');
        }

        externalSignal.addEventListener('abort', onExternalAbort, {
            once: true,
        });
    }

    try {
        const response = await fetch(url, {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        const route = data?.routes?.[0];
        const rawCoords = route?.geometry?.coordinates;

        if (
            data?.code !== 'Ok' ||
            !route ||
            !Array.isArray(rawCoords) ||
            rawCoords.length < 2
        ) {
            return null;
        }

        const coordinates: [number, number][] = rawCoords
            .filter(
                (pair: unknown): pair is [number, number] =>
                    Array.isArray(pair) &&
                    pair.length >= 2 &&
                    typeof pair[0] === 'number' &&
                    typeof pair[1] === 'number',
            )
            .map(([lng, lat]) => [lat, lng]);

        if (coordinates.length < 2) {
            return null;
        }

        return {
            coordinates,
            distanceMeters:
                typeof route.distance === 'number' ? route.distance : 0,
            durationSeconds:
                typeof route.duration === 'number' ? route.duration : null,
            mode,
            isFallback: false,
        };
    } catch (error) {
        if (externalSignal?.aborted) {
            throw error;
        }

        return null;
    } finally {
        clearTimeout(timeoutId);
        externalSignal?.removeEventListener('abort', onExternalAbort);
    }
}

/**
 * Fetches a walking or driving route between origin and destination using OpenStreetMap OSRM.
 * Falls back to a straight-line Haversine estimate if OSRM is unavailable or times out.
 */
export async function fetchRoute(
    origin: Coordinates,
    destination: Coordinates,
    mode: TravelMode = 'walking',
    signal?: AbortSignal,
): Promise<RouteResult> {
    const straightKm = haversineDistanceKm(
        origin.lat,
        origin.lng,
        destination.lat,
        destination.lng,
    );

    if (straightKm < 0.005) {
        return {
            coordinates: [
                [origin.lat, origin.lng],
                [destination.lat, destination.lng],
            ],
            distanceMeters: Math.round(straightKm * 1000),
            durationSeconds: 0,
            mode,
            isFallback: false,
        };
    }

    const coordsPath = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;

    const candidates =
        mode === 'walking'
            ? [
                  `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${coordsPath}`,
              ]
            : [
                  `https://routing.openstreetmap.de/routed-car/route/v1/driving/${coordsPath}`,
                  `https://router.project-osrm.org/route/v1/driving/${coordsPath}`,
              ];

    for (const url of candidates) {
        const result = await queryOsrmEndpoint(url, mode, signal);

        if (result) {
            return result;
        }
    }

    if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
    }

    return {
        coordinates: [
            [origin.lat, origin.lng],
            [destination.lat, destination.lng],
        ],
        distanceMeters: straightKm * 1000,
        durationSeconds: null,
        mode,
        isFallback: true,
    };
}

/**
 * Reverse geocodes latitude and longitude into a readable address string.
 * Uses OpenStreetMap Nominatim with a fallback to BigDataCloud reverse geocode API.
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
    const defaultCoords = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

    // Try OpenStreetMap Nominatim first
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
                headers: {
                    Accept: 'application/json',
                    'Accept-Language': 'en',
                },
                signal: controller.signal,
            }
        );
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            if (data && data.address) {
                const addr = data.address;
                const building = addr.amenity || addr.building || addr.shop || addr.tourism || addr.office;
                const road = addr.road || addr.pedestrian || addr.street || addr.highway || addr.footway || addr.path;
                const houseNumber = addr.house_number;
                const street = [houseNumber, road].filter(Boolean).join(' ');
                const neighborhood = addr.neighbourhood || addr.suburb || addr.quarter || addr.village || addr.hamlet || addr.district;
                const city = addr.city || addr.town || addr.municipality || addr.city_district || addr.county;
                const state = addr.state || addr.province || addr.region;
                const country = addr.country;

                const parts: string[] = [];
                if (building) parts.push(building);
                if (street) parts.push(street);
                if (neighborhood && !parts.includes(neighborhood)) parts.push(neighborhood);
                if (city && !parts.includes(city)) parts.push(city);
                if (state && !parts.includes(state)) parts.push(state);
                if (country && !parts.includes(country)) parts.push(country);

                if (parts.length > 0) {
                    const formatted = parts.join(', ');
                    return formatted.length > 250 ? formatted.slice(0, 247) + '...' : formatted;
                }

                if (data.display_name) {
                    const cleanDisplay = data.display_name;
                    return cleanDisplay.length > 250 ? cleanDisplay.slice(0, 247) + '...' : cleanDisplay;
                }
            }
        }
    } catch (err) {
        console.warn('Nominatim reverse geocode error or timeout:', err);
    }

    // Fallback: BigDataCloud Reverse Geocoding API
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
            {
                headers: {
                    Accept: 'application/json',
                },
                signal: controller.signal,
            }
        );
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            const parts: string[] = [];
            if (data.locality) parts.push(data.locality);
            if (data.city && !parts.includes(data.city)) parts.push(data.city);
            if (data.principalSubdivision && !parts.includes(data.principalSubdivision)) parts.push(data.principalSubdivision);
            if (data.countryName && !parts.includes(data.countryName)) parts.push(data.countryName);

            if (parts.length > 0) {
                const formatted = parts.join(', ');
                return formatted.length > 250 ? formatted.slice(0, 247) + '...' : formatted;
            }
        }
    } catch (err) {
        console.warn('BigDataCloud reverse geocode error or timeout:', err);
    }

    return defaultCoords;
}

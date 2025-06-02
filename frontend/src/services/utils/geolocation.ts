export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=uk`);
        const data = await response.json();

        return data.address.city || data.address.town || data.address.village || null;
    } catch (e) {
        console.error('Reverse geocoding error:', e);
        return null;
    }
}

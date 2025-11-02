// Telemetry Mapper - Maps telemetry data points to track coordinates
class TelemetryMapper {
    constructor(trackLoaderInstance) {
        this.trackLoader = trackLoaderInstance;
        this.cache = new Map();
    }

    /**
     * Maps a telemetry point to the closest track coordinate
     * @param {string} trackKey - The track identifier
     * @param {object} telemetryPoint - Telemetry data point with x, y coordinates
     * @returns {number} Index of closest track coordinate
     */
    mapToTrack(trackKey, telemetryPoint) {
        const track = this.trackLoader.getTrack(trackKey);
        if (!track || !track.coordinates) {
            console.error('Track not found:', trackKey);
            return 0;
        }

        const coords = track.coordinates;
        let closestIndex = 0;
        let minDistance = Infinity;

        // Find closest track point to telemetry point
        for (let i = 0; i < coords.length; i++) {
            const dx = coords[i].x - telemetryPoint.x;
            const dy = coords[i].y - telemetryPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = i;
            }
        }

        return closestIndex;
    }

    /**
     * Interpolates telemetry data to match track coordinate count
     * @param {array} telemetryData - Array of telemetry points
     * @param {number} targetPoints - Desired number of points
     * @returns {array} Interpolated telemetry data
     */
    interpolate(telemetryData, targetPoints) {
        if (!telemetryData || telemetryData.length === 0) {
            return [];
        }

        if (telemetryData.length === targetPoints) {
            return telemetryData;
        }

        const result = [];
        const ratio = (telemetryData.length - 1) / (targetPoints - 1);

        for (let i = 0; i < targetPoints; i++) {
            const index = i * ratio;
            const lower = Math.floor(index);
            const upper = Math.min(Math.ceil(index), telemetryData.length - 1);
            const fraction = index - lower;

            if (lower === upper) {
                result.push({ ...telemetryData[lower] });
            } else {
                // Linear interpolation between two points
                const interpolated = {
                    speed: Math.round(
                        telemetryData[lower].speed * (1 - fraction) +
                        telemetryData[upper].speed * fraction
                    ),
                    throttle: Math.round(
                        telemetryData[lower].throttle * (1 - fraction) +
                        telemetryData[upper].throttle * fraction
                    ),
                    brake: Math.round(
                        telemetryData[lower].brake * (1 - fraction) +
                        telemetryData[upper].brake * fraction
                    ),
                    gear: fraction < 0.5 ? telemetryData[lower].gear : telemetryData[upper].gear
                };
                result.push(interpolated);
            }
        }

        return result;
    }

    /**
     * Calculates distance along track
     * @param {array} coordinates - Track coordinates
     * @returns {array} Cumulative distances
     */
    calculateDistances(coordinates) {
        const distances = [0];
        let totalDistance = 0;

        for (let i = 1; i < coordinates.length; i++) {
            const dx = coordinates[i].x - coordinates[i - 1].x;
            const dy = coordinates[i].y - coordinates[i - 1].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            totalDistance += distance;
            distances.push(totalDistance);
        }

        return distances;
    }

    /**
     * Normalizes telemetry data to track length
     * @param {string} trackKey - The track identifier
     * @param {array} telemetryData - Raw telemetry data
     * @returns {array} Normalized telemetry aligned to track coordinates
     */
    normalizeToTrack(trackKey, telemetryData) {
        const track = this.trackLoader.getTrack(trackKey);
        if (!track || !track.coordinates) {
            return telemetryData;
        }

        const targetPoints = track.coordinates.length;
        return this.interpolate(telemetryData, targetPoints);
    }

    /**
     * Clears the mapping cache
     */
    clearCache() {
        this.cache.clear();
    }
}

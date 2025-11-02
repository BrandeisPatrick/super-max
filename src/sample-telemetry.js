// Sample Telemetry Generator - Creates realistic simulated telemetry data

/**
 * Generates sample telemetry data based on track coordinates
 * @param {array} trackCoordinates - Array of {x, y} track coordinate points
 * @returns {array} Array of telemetry data points with speed, throttle, brake, and gear
 */
function generateSampleTelemetry(trackCoordinates) {
    if (!trackCoordinates || trackCoordinates.length === 0) {
        console.warn('No track coordinates provided for telemetry generation');
        return [];
    }

    const telemetryData = [];
    const totalPoints = trackCoordinates.length;

    // Calculate track geometry for realistic speed simulation
    const curvatures = calculateCurvatures(trackCoordinates);
    const maxCurvature = Math.max(...curvatures.map(Math.abs));

    for (let i = 0; i < totalPoints; i++) {
        const curvature = curvatures[i];
        const normalizedCurvature = Math.abs(curvature) / (maxCurvature || 1);

        // Speed calculation based on curvature
        // Straights: 300-330 km/h, Tight corners: 80-150 km/h
        const baseSpeed = 330 - (normalizedCurvature * 250);
        const speedVariation = (Math.random() - 0.5) * 10; // Small random variation
        const speed = Math.max(80, Math.min(330, Math.round(baseSpeed + speedVariation)));

        // Throttle calculation (inverse of braking)
        // High speed = high throttle, low speed = low throttle
        const throttle = Math.round(Math.min(100, (speed / 330) * 100 + 20));

        // Brake calculation based on curvature and speed change
        let brake = 0;
        if (i > 0) {
            const prevSpeed = telemetryData[i - 1].speed;
            const speedDrop = prevSpeed - speed;

            // Brake proportional to speed reduction
            if (speedDrop > 10) {
                brake = Math.min(100, Math.round((speedDrop / 200) * 100 + normalizedCurvature * 50));
            }
        }

        // Gear calculation based on speed
        let gear;
        if (speed < 100) gear = 2;
        else if (speed < 150) gear = 3;
        else if (speed < 200) gear = 4;
        else if (speed < 250) gear = 5;
        else if (speed < 290) gear = 6;
        else if (speed < 320) gear = 7;
        else gear = 8;

        telemetryData.push({
            speed: speed,
            throttle: brake > 0 ? Math.max(0, throttle - brake) : throttle,
            brake: brake,
            gear: gear
        });
    }

    // Smooth out the data to avoid unrealistic jumps
    return smoothTelemetry(telemetryData);
}

/**
 * Calculates curvature at each point along the track
 * @param {array} coords - Track coordinates
 * @returns {array} Curvature values
 */
function calculateCurvatures(coords) {
    const curvatures = [];
    const windowSize = 5; // Look ahead/behind window

    for (let i = 0; i < coords.length; i++) {
        const prevIndex = (i - windowSize + coords.length) % coords.length;
        const nextIndex = (i + windowSize) % coords.length;

        const prev = coords[prevIndex];
        const curr = coords[i];
        const next = coords[nextIndex];

        // Calculate angle change
        const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
        const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);

        let angleDiff = angle2 - angle1;

        // Normalize angle to [-π, π]
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        curvatures.push(angleDiff);
    }

    return curvatures;
}

/**
 * Smooths telemetry data using moving average
 * @param {array} telemetryData - Raw telemetry data
 * @returns {array} Smoothed telemetry data
 */
function smoothTelemetry(telemetryData) {
    const smoothed = [];
    const windowSize = 3;

    for (let i = 0; i < telemetryData.length; i++) {
        const window = [];

        for (let j = -windowSize; j <= windowSize; j++) {
            const index = (i + j + telemetryData.length) % telemetryData.length;
            window.push(telemetryData[index]);
        }

        const avgSpeed = Math.round(window.reduce((sum, d) => sum + d.speed, 0) / window.length);
        const avgThrottle = Math.round(window.reduce((sum, d) => sum + d.throttle, 0) / window.length);
        const avgBrake = Math.round(window.reduce((sum, d) => sum + d.brake, 0) / window.length);

        // Gear doesn't get averaged, just take the middle value
        const gear = telemetryData[i].gear;

        smoothed.push({
            speed: avgSpeed,
            throttle: avgThrottle,
            brake: avgBrake,
            gear: gear
        });
    }

    return smoothed;
}

/**
 * Validates telemetry data structure
 * @param {array} telemetryData - Telemetry data to validate
 * @returns {boolean} True if valid
 */
function validateTelemetry(telemetryData) {
    if (!Array.isArray(telemetryData) || telemetryData.length === 0) {
        return false;
    }

    const requiredFields = ['speed', 'throttle', 'brake', 'gear'];

    return telemetryData.every(point =>
        requiredFields.every(field =>
            point.hasOwnProperty(field) && typeof point[field] === 'number'
        )
    );
}

// API Integration for F1 and GT3 data

const API = {
    // Jolpica F1 API (Ergast mirror - ergast.com is down)
    ERGAST_BASE: 'https://api.jolpi.ca/ergast/f1',

    // OpenF1 API (live and detailed telemetry)
    OPENF1_BASE: 'https://api.openf1.org/v1',

    // Current season (2025 - in progress, 20/24 races completed)
    CURRENT_SEASON: 2025,

    // Max Verstappen driver ID
    VERSTAPPEN_ID: 'max_verstappen',

    // Cache for API responses
    cache: {},

    /**
     * Fetch races for the current season
     */
    async getRaces(season = this.CURRENT_SEASON) {
        const cacheKey = `races_${season}`;
        if (this.cache[cacheKey]) return this.cache[cacheKey];

        try {
            const response = await fetch(`${this.ERGAST_BASE}/${season}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const races = data.MRData.RaceTable.Races;

            if (!races || races.length === 0) {
                console.warn(`No races found for ${season}`);
                return [];
            }

            this.cache[cacheKey] = races;
            return races;
        } catch (error) {
            console.error(`Error fetching races for ${season}:`, error);
            return [];
        }
    },

    /**
     * Fetch qualifying results for a specific race
     */
    async getQualifyingResults(season, round) {
        const cacheKey = `quali_${season}_${round}`;
        if (this.cache[cacheKey]) return this.cache[cacheKey];

        try {
            const response = await fetch(`${this.ERGAST_BASE}/${season}/${round}/qualifying.json`);
            const data = await response.json();
            const results = data.MRData.RaceTable.Races[0]?.QualifyingResults || [];
            this.cache[cacheKey] = results;
            return results;
        } catch (error) {
            console.error('Error fetching qualifying results:', error);
            return [];
        }
    },

    /**
     * Get Max Verstappen's qualifying data for a specific race
     */
    async getVerstappenQuali(season, round) {
        const results = await this.getQualifyingResults(season, round);
        return results.find(r => r.Driver.driverId === this.VERSTAPPEN_ID);
    },

    /**
     * Get all drivers for a specific race
     */
    async getDrivers(season, round) {
        const results = await this.getQualifyingResults(season, round);
        return results.map(r => ({
            id: r.Driver.driverId,
            name: `${r.Driver.givenName} ${r.Driver.familyName}`,
            constructor: r.Constructor.name
        }));
    },

    /**
     * Get driver qualifying data
     */
    async getDriverQuali(season, round, driverId) {
        const results = await this.getQualifyingResults(season, round);
        return results.find(r => r.Driver.driverId === driverId);
    },

    /**
     * Calculate time difference between two lap times
     */
    calculateTimeDiff(time1, time2) {
        const parseTime = (timeStr) => {
            if (!timeStr) return 0;
            const parts = timeStr.split(':');
            const minutes = parseInt(parts[0]) || 0;
            const seconds = parseFloat(parts[1]) || 0;
            return minutes * 60 + seconds;
        };

        const t1 = parseTime(time1);
        const t2 = parseTime(time2);
        const diff = Math.abs(t1 - t2);

        const sign = t1 < t2 ? '-' : '+';
        return `${sign}${diff.toFixed(3)}s`;
    },

    /**
     * Format lap time for display
     */
    formatLapTime(timeStr) {
        if (!timeStr) return '--:--.---';
        return timeStr;
    },

    /**
     * Get race statistics (simulated for now - can be enhanced with real telemetry)
     */
    getSimulatedStats(trackName) {
        // Simulated stats based on typical F1 data
        const speedRanges = {
            'monaco': { top: 290, avg: 158 },
            'monza': { top: 360, avg: 264 },
            'spa': { top: 345, avg: 235 },
            'default': { top: 320, avg: 210 }
        };

        const trackKey = trackName.toLowerCase();
        const speeds = speedRanges[trackKey] || speedRanges.default;

        return {
            topSpeed: speeds.top + Math.floor(Math.random() * 10),
            avgSpeed: speeds.avg + Math.floor(Math.random() * 5)
        };
    },

    /**
     * Fetch OpenF1 session data (for 2025 season with live data)
     */
    async getOpenF1Sessions(year = this.CURRENT_SEASON) {
        try {
            const response = await fetch(`${this.OPENF1_BASE}/sessions?year=${year}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching OpenF1 sessions:', error);
            return [];
        }
    },

    /**
     * Get lap data from OpenF1
     */
    async getOpenF1Laps(sessionKey, driverNumber = 1) {
        try {
            const response = await fetch(`${this.OPENF1_BASE}/laps?session_key=${sessionKey}&driver_number=${driverNumber}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching OpenF1 laps:', error);
            return [];
        }
    },

    /**
     * Mock GT3 data (replace with real API when available)
     */
    getMockGT3Data() {
        return {
            driver: 'Max Verstappen',
            team: 'Red Bull Racing',
            qualiTime: '2:18.456',
            position: 1,
            sectors: {
                s1: '42.123',
                s2: '48.567',
                s3: '47.766'
            },
            topSpeed: 285,
            avgSpeed: 178
        };
    },

    /**
     * Get track mapping from circuit name to track data key
     */
    getTrackKey(circuitName) {
        const mappings = {
            // Original 15 tracks
            'Bahrain International Circuit': 'bahrain',
            'Jeddah Corniche Circuit': 'jeddah',
            'Albert Park Grand Prix Circuit': 'australia',
            'Albert Park Circuit': 'australia',
            'Circuit de Monaco': 'monaco',
            'Circuit de Barcelona-Catalunya': 'spain',
            'Circuit de Spa-Francorchamps': 'spa',
            'Autodromo Nazionale di Monza': 'monza',
            'Autodromo Nazionale Monza': 'monza',
            'Silverstone Circuit': 'silverstone',
            'Suzuka Circuit': 'japan',
            'Suzuka International Racing Course': 'japan',
            'Autódromo José Carlos Pace': 'brazil',
            'Autódromo José Carlos Pace - Interlagos': 'brazil',
            'Circuit of the Americas': 'cota',
            'Autódromo Hermanos Rodríguez': 'mexico',
            'Yas Marina Circuit': 'abudhabi',
            'Circuit Gilles Villeneuve': 'canada',
            'Circuit Gilles-Villeneuve': 'canada',
            'Hungaroring': 'hungary',

            // New tracks added
            'Circuit Zandvoort': 'zandvoort',
            'Red Bull Ring': 'austria',
            'Las Vegas Street Circuit': 'lasvegas',
            'Miami International Autodrome': 'miami',
            'Marina Bay Street Circuit': 'singapore',
            'Shanghai International Circuit': 'china',
            'Autodromo Enzo e Dino Ferrari': 'imola',
            'Autodromo Internazionale Enzo e Dino Ferrari': 'imola',
            'Losail International Circuit': 'qatar',
            'Baku City Circuit': 'azerbaijan'
        };

        return mappings[circuitName] || Object.keys(mappings).find(key =>
            circuitName.toLowerCase().includes(key.toLowerCase())
        );
    }
};

// Track Loader - Dynamically loads track data
// This replaces the monolithic track-data.js with on-demand loading

class TrackLoader {
    constructor() {
        this.tracks = {};
        this.index = null;
        this.loadingPromises = {};
    }

    /**
     * Initialize the loader by fetching the tracks index
     */
    async init() {
        if (this.index) return this.index;

        try {
            const response = await fetch('data/tracks-index.json');
            this.index = await response.json();
            console.log(`✓ Track loader initialized with ${this.index.totalTracks} tracks`);
            return this.index;
        } catch (error) {
            console.error('Failed to load tracks index:', error);
            throw error;
        }
    }

    /**
     * Get list of available tracks
     */
    async getTrackList() {
        await this.init();
        return this.index.tracks;
    }

    /**
     * Load a specific track by key
     * @param {string} trackKey - The track identifier (e.g., 'monaco', 'spa')
     */
    async loadTrack(trackKey) {
        // Return cached track if already loaded
        if (this.tracks[trackKey]) {
            return this.tracks[trackKey];
        }

        // Return existing loading promise if already in progress
        if (this.loadingPromises[trackKey]) {
            return this.loadingPromises[trackKey];
        }

        // Start loading the track
        this.loadingPromises[trackKey] = (async () => {
            try {
                const response = await fetch(`data/tracks/${trackKey}.json`);
                if (!response.ok) {
                    throw new Error(`Track not found: ${trackKey}`);
                }

                const trackData = await response.json();
                this.tracks[trackKey] = trackData;

                const sizeKB = (JSON.stringify(trackData).length / 1024).toFixed(1);
                console.log(`✓ Loaded ${trackData.name} (${sizeKB} KB)`);

                return trackData;
            } catch (error) {
                console.error(`Failed to load track ${trackKey}:`, error);
                throw error;
            } finally {
                delete this.loadingPromises[trackKey];
            }
        })();

        return this.loadingPromises[trackKey];
    }

    /**
     * Preload multiple tracks
     * @param {array} trackKeys - Array of track identifiers
     */
    async preloadTracks(trackKeys) {
        const promises = trackKeys.map(key => this.loadTrack(key));
        return Promise.all(promises);
    }

    /**
     * Load all tracks
     */
    async loadAllTracks() {
        await this.init();
        const trackKeys = this.index.tracks.map(t => t.key);
        return this.preloadTracks(trackKeys);
    }

    /**
     * Get track by key (throws if not loaded)
     */
    getTrack(trackKey) {
        if (!this.tracks[trackKey]) {
            throw new Error(`Track ${trackKey} not loaded. Call loadTrack() first.`);
        }
        return this.tracks[trackKey];
    }

    /**
     * Check if a track is loaded
     */
    isLoaded(trackKey) {
        return !!this.tracks[trackKey];
    }

    /**
     * Clear loaded tracks from memory
     */
    clearCache() {
        this.tracks = {};
        console.log('✓ Track cache cleared');
    }

    /**
     * Get memory usage statistics
     */
    getStats() {
        const loadedTracks = Object.keys(this.tracks).length;
        const totalSize = Object.values(this.tracks).reduce((sum, track) => {
            return sum + JSON.stringify(track).length;
        }, 0);

        return {
            loadedTracks,
            totalSizeKB: (totalSize / 1024).toFixed(1),
            availableTracks: this.index ? this.index.totalTracks : 0
        };
    }
}

// Create global instance for backward compatibility
const trackLoader = new TrackLoader();

// Create ALL_TRACKS proxy for backward compatibility with existing code
const ALL_TRACKS = new Proxy({}, {
    get(target, trackKey) {
        if (trackKey === 'then' || trackKey === 'toJSON') {
            return undefined; // Prevent Promise detection
        }

        if (!trackLoader.isLoaded(trackKey)) {
            console.warn(`⚠️  Track '${trackKey}' accessed but not loaded. Use await trackLoader.loadTrack('${trackKey}') first.`);
            return undefined;
        }

        return trackLoader.getTrack(trackKey);
    },

    has(target, trackKey) {
        return trackLoader.isLoaded(trackKey);
    },

    ownKeys(target) {
        return Object.keys(trackLoader.tracks);
    }
});

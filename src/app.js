// Main Application Logic

// Loading Manager
class LoadingManager {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingMessage = document.getElementById('loading-message');
        this.loadingProgress = document.getElementById('loading-progress');
    }

    show(message = 'Loading Race Data...') {
        this.loadingMessage.textContent = message;
        this.loadingScreen.classList.remove('fade-out');
        this.loadingScreen.style.display = 'flex';

        // Reset progress animation
        this.loadingProgress.style.animation = 'none';
        setTimeout(() => {
            this.loadingProgress.style.animation = 'progressFlow 2s ease-in-out infinite, fillProgress 2s ease-out forwards';
        }, 10);
    }

    hide(delay = 500) {
        setTimeout(() => {
            this.loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
            }, 500);
        }, delay);
    }

    updateMessage(message) {
        this.loadingMessage.textContent = message;
    }
}

// Global loading manager instance
const loadingManager = new LoadingManager();

class F1Visualizer {
    constructor() {
        this.canvas = document.getElementById('track-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.selectedTrack = null;
        this.selectedRace = null;
        this.animationId = null;
        this.carPosition = 0;
        this.isAnimating = false;
        this.comparisonData = null;

        // Telemetry system initialization
        this.telemetryMapper = null;
        this.currentLapTelemetry = null;
        this.currentTelemetryIndex = 0;
        this.trackScale = 1;
        this.trackOffsetX = 0;
        this.trackOffsetY = 0;

        this.init();
    }

    async init() {
        // Show initial loading screen
        loadingManager.show('Initializing Application...');

        // Initialize track loader
        await trackLoader.init();

        await this.loadRaces();
        this.setupEventListeners();
        this.renderEmptyTrack();

        // Hide loading screen after everything is loaded
        loadingManager.hide(800);
    }

    async loadRaces() {
        try {
            loadingManager.updateMessage(`Loading ${API.CURRENT_SEASON} F1 Season...`);
            const races = await API.getRaces(API.CURRENT_SEASON);

            const trackSelect = document.getElementById('track-select');
            trackSelect.innerHTML = '<option value="">Select a track...</option>';

            races.forEach((race, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${race.raceName} (${race.Circuit.circuitName})`;
                option.dataset.circuitName = race.Circuit.circuitName;
                option.dataset.round = race.round;
                trackSelect.appendChild(option);
            });

            // Add GT3 option
            const gt3Option = document.createElement('option');
            gt3Option.value = 'gt3-nurburgring';
            gt3Option.textContent = 'GT3 - Nürburgring (2025)';
            gt3Option.dataset.circuitName = 'Nürburgring';
            gt3Option.dataset.gt3 = 'true';
            trackSelect.appendChild(gt3Option);

        } catch (error) {
            console.error('Error loading races:', error);
            document.getElementById('track-select').innerHTML =
                '<option value="">Error loading races</option>';
        }
    }

    setupEventListeners() {
        document.getElementById('load-data-btn').addEventListener('click', () => {
            this.loadRaceData();
        });

        document.getElementById('animate-btn').addEventListener('click', () => {
            this.toggleAnimation();
        });

        document.getElementById('track-select').addEventListener('change', async (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            const circuitName = selectedOption.dataset.circuitName;
            const isGT3 = selectedOption.dataset.gt3 === 'true';

            if (circuitName) {
                await this.loadTrackLayout(circuitName, isGT3);
            }
        });

        document.getElementById('race-type').addEventListener('change', (e) => {
            this.filterTracksByType(e.target.value);
        });
    }

    filterTracksByType(type) {
        const trackSelect = document.getElementById('track-select');
        const options = trackSelect.getElementsByTagName('option');

        for (let option of options) {
            if (option.value === '') continue;

            if (type === 'gt3') {
                option.style.display = option.dataset.gt3 ? 'block' : 'none';
            } else {
                option.style.display = option.dataset.gt3 ? 'none' : 'block';
            }
        }
    }

    async loadTrackLayout(circuitName, isGT3 = false) {
        // Show loading for track switching
        loadingManager.show(`Loading ${circuitName}...`);

        let trackKey;

        if (isGT3) {
            trackKey = 'nurburgring';
        } else {
            trackKey = API.getTrackKey(circuitName);
        }

        if (!trackKey) {
            console.error('Track key not found for:', circuitName);
            this.renderEmptyTrack();
            loadingManager.hide(300);
            return;
        }

        // Load track data dynamically
        try {
            this.selectedTrack = await trackLoader.loadTrack(trackKey);
        } catch (error) {
            console.error('Track not found:', circuitName, error);
            this.renderEmptyTrack();
            loadingManager.hide(300);
            return;
        }

        // Initialize telemetry system for accurate lap animation
        if (!this.telemetryMapper) {
            this.telemetryMapper = new TelemetryMapper(trackLoader);
        }

        // Try to load REAL telemetry data first, fall back to simulated
        loadingManager.updateMessage('Loading telemetry data...');
        this.currentLapTelemetry = await this.loadTelemetryData(trackKey);
        this.currentTelemetryIndex = 0;

        console.log(`✓ Loaded ${this.selectedTrack.name} with ${this.currentLapTelemetry.length} telemetry points`);

        // Simulate loading time for track rendering
        setTimeout(() => {
            this.renderTrack();
            this.updateTrackInfo();
            loadingManager.hide(300);
        }, 800);
    }

    async loadRaceData() {
        const trackSelect = document.getElementById('track-select');
        const selectedOption = trackSelect.options[trackSelect.selectedIndex];

        if (!selectedOption || !selectedOption.value) {
            alert('Please select a track first');
            return;
        }

        // Show loading for data fetching
        loadingManager.show('Fetching Race Data...');

        const isGT3 = selectedOption.dataset.gt3 === 'true';

        if (isGT3) {
            this.loadGT3Data();
            loadingManager.hide(500);
        } else {
            await this.loadF1Data(selectedOption.dataset.round);
        }

        document.getElementById('animate-btn').disabled = false;
    }

    async loadF1Data(round) {
        try {
            loadingManager.updateMessage('Loading Qualification Results...');

            // Get Max's qualifying data
            const maxQuali = await API.getVerstappenQuali(API.CURRENT_SEASON, round);

            if (!maxQuali) {
                alert('No qualifying data found for Max Verstappen');
                loadingManager.hide(300);
                return;
            }

            loadingManager.updateMessage('Processing Data...');

            // Update Max's card
            document.getElementById('max-quali-time').textContent =
                API.formatLapTime(maxQuali.Q3 || maxQuali.Q2 || maxQuali.Q1);
            document.getElementById('max-quali-pos').textContent =
                `Position: ${maxQuali.position}`;

            // Display sector times if available
            const sectorsHtml = `
                ${maxQuali.Q1 ? `<div>Q1: ${maxQuali.Q1}</div>` : ''}
                ${maxQuali.Q2 ? `<div>Q2: ${maxQuali.Q2}</div>` : ''}
                ${maxQuali.Q3 ? `<div>Q3: ${maxQuali.Q3}</div>` : ''}
            `;
            document.getElementById('max-sectors').innerHTML = sectorsHtml;

            // Load drivers for comparison
            const drivers = await API.getDrivers(API.CURRENT_SEASON, round);
            const compareSelect = document.getElementById('compare-driver');
            compareSelect.innerHTML = '<option value="">Select a driver...</option>';

            drivers.forEach(driver => {
                if (driver.id !== API.VERSTAPPEN_ID) {
                    const option = document.createElement('option');
                    option.value = driver.id;
                    option.textContent = `${driver.name} (${driver.constructor})`;
                    compareSelect.appendChild(option);
                }
            });

            // Handle comparison selection
            compareSelect.onchange = async (e) => {
                if (e.target.value) {
                    await this.loadComparisonData(round, e.target.value, maxQuali);
                } else {
                    document.getElementById('compare-card').style.display = 'none';
                }
            };

            // Load and display statistics
            if (this.selectedTrack) {
                const stats = API.getSimulatedStats(this.selectedTrack.name);
                document.getElementById('top-speed').textContent = `${stats.topSpeed} km/h`;
                document.getElementById('avg-speed').textContent = `${stats.avgSpeed} km/h`;

                // Simulated sector times
                if (maxQuali.Q3 || maxQuali.Q2 || maxQuali.Q1) {
                    const totalTime = maxQuali.Q3 || maxQuali.Q2 || maxQuali.Q1;
                    const timeInSeconds = parseFloat(totalTime.split(':')[1]);
                    document.getElementById('sector-1').textContent =
                        `${(timeInSeconds * 0.33).toFixed(3)}s`;
                    document.getElementById('sector-2').textContent =
                        `${(timeInSeconds * 0.33).toFixed(3)}s`;
                    document.getElementById('sector-3').textContent =
                        `${(timeInSeconds * 0.34).toFixed(3)}s`;
                }
            }

            // Hide loading screen after data is loaded
            loadingManager.hide(500);

        } catch (error) {
            console.error('Error loading F1 data:', error);
            alert('Error loading race data. Please try again.');
            loadingManager.hide(300);
        }
    }

    async loadComparisonData(round, driverId, maxQuali) {
        const driverQuali = await API.getDriverQuali(API.CURRENT_SEASON, round, driverId);

        if (!driverQuali) return;

        const compareCard = document.getElementById('compare-card');
        compareCard.style.display = 'block';

        document.getElementById('compare-driver-name').textContent =
            `${driverQuali.Driver.givenName} ${driverQuali.Driver.familyName}`;
        document.getElementById('compare-quali-time').textContent =
            API.formatLapTime(driverQuali.Q3 || driverQuali.Q2 || driverQuali.Q1);
        document.getElementById('compare-quali-pos').textContent =
            `Position: ${driverQuali.position}`;

        const sectorsHtml = `
            ${driverQuali.Q1 ? `<div>Q1: ${driverQuali.Q1}</div>` : ''}
            ${driverQuali.Q2 ? `<div>Q2: ${driverQuali.Q2}</div>` : ''}
            ${driverQuali.Q3 ? `<div>Q3: ${driverQuali.Q3}</div>` : ''}
        `;
        document.getElementById('compare-sectors').innerHTML = sectorsHtml;

        // Calculate time difference
        const maxTime = maxQuali.Q3 || maxQuali.Q2 || maxQuali.Q1;
        const compareTime = driverQuali.Q3 || driverQuali.Q2 || driverQuali.Q1;
        const diff = API.calculateTimeDiff(maxTime, compareTime);

        const timeDiffEl = document.getElementById('time-diff');
        timeDiffEl.textContent = diff;
        timeDiffEl.className = 'time-diff ' + (diff.startsWith('-') ? 'faster' : 'slower');

        this.comparisonData = driverQuali;
    }

    loadGT3Data() {
        const gt3Data = API.getMockGT3Data();

        document.getElementById('max-quali-time').textContent = gt3Data.qualiTime;
        document.getElementById('max-quali-pos').textContent = `Position: ${gt3Data.position}`;

        const sectorsHtml = `
            <div>S1: ${gt3Data.sectors.s1}</div>
            <div>S2: ${gt3Data.sectors.s2}</div>
            <div>S3: ${gt3Data.sectors.s3}</div>
        `;
        document.getElementById('max-sectors').innerHTML = sectorsHtml;

        document.getElementById('top-speed').textContent = `${gt3Data.topSpeed} km/h`;
        document.getElementById('avg-speed').textContent = `${gt3Data.avgSpeed} km/h`;
        document.getElementById('sector-1').textContent = gt3Data.sectors.s1;
        document.getElementById('sector-2').textContent = gt3Data.sectors.s2;
        document.getElementById('sector-3').textContent = gt3Data.sectors.s3;

        document.getElementById('compare-card').style.display = 'none';
    }

    renderEmptyTrack() {
        this.ctx.fillStyle = '#0a0e14';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#666';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Select a track to view', this.canvas.width / 2, this.canvas.height / 2);
    }

    // Simple track rendering without splines
    drawTrackPath(coords, strokeStyle, lineWidth, scale, offsetX, offsetY) {
        if (coords.length < 2) return;

        this.ctx.strokeStyle = strokeStyle;
        this.ctx.lineWidth = lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();

        coords.forEach((point, index) => {
            const x = point.x * scale + offsetX;
            const y = point.y * scale + offsetY;
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });

        this.ctx.closePath();
        this.ctx.stroke();
    }

    renderTrack() {
        if (!this.selectedTrack) return;

        // Clear canvas
        this.ctx.fillStyle = '#0a0e14';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const coords = this.selectedTrack.coordinates;

        // Calculate bounds and scale
        const padding = 50;
        const bounds = this.getTrackBounds(coords);
        const scale = Math.min(
            (this.canvas.width - padding * 2) / bounds.width,
            (this.canvas.height - padding * 2) / bounds.height
        );

        const offsetX = padding - bounds.minX * scale + (this.canvas.width - bounds.width * scale - padding * 2) / 2;
        const offsetY = padding - bounds.minY * scale + (this.canvas.height - bounds.height * scale - padding * 2) / 2;

        // Store scale and offset for telemetry animation
        this.trackScale = scale;
        this.trackOffsetX = offsetX;
        this.trackOffsetY = offsetY;

        // Draw track outline
        this.drawTrackPath(coords, '#444', 30, scale, offsetX, offsetY);

        // Draw track surface
        this.drawTrackPath(coords, '#2a2a2a', 24, scale, offsetX, offsetY);

        // Draw start/finish line
        const startX = coords[0].x * scale + offsetX;
        const startY = coords[0].y * scale + offsetY;

        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(startX - 15, startY);
        this.ctx.lineTo(startX + 15, startY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Store scaled coordinates for animation
        this.scaledCoords = coords.map(point => ({
            x: point.x * scale + offsetX,
            y: point.y * scale + offsetY
        }));
    }

    getTrackBounds(coords) {
        const xs = coords.map(p => p.x);
        const ys = coords.map(p => p.y);

        return {
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys),
            width: Math.max(...xs) - Math.min(...xs),
            height: Math.max(...ys) - Math.min(...ys)
        };
    }

    updateTrackInfo() {
        if (!this.selectedTrack) return;

        document.getElementById('track-name').textContent = this.selectedTrack.name;
        document.getElementById('track-details').textContent =
            `${this.selectedTrack.country} | ${this.selectedTrack.length} | ${this.selectedTrack.turns} turns`;
    }

    toggleAnimation() {
        if (this.isAnimating) {
            this.stopAnimation();
        } else {
            this.startAnimation();
        }
    }

    startAnimation() {
        if (!this.scaledCoords || this.scaledCoords.length === 0) return;

        // Show loading before starting animation
        loadingManager.show('Preparing Lap Animation...');

        setTimeout(() => {
            this.isAnimating = true;
            this.carPosition = 0;
            document.getElementById('animate-btn').textContent = 'Stop Animation';

            loadingManager.hide(300);

            const animate = () => {
            if (!this.isAnimating) return;

            this.renderTrack();

            // Use telemetry data for accurate car position and speed
            if (this.currentLapTelemetry && this.currentLapTelemetry.length > 0) {
                // Get current telemetry point
                const telemetryIndex = this.currentTelemetryIndex % this.currentLapTelemetry.length;
                const telemetry = this.currentLapTelemetry[telemetryIndex];

                // Map telemetry progress to track coordinates
                const trackCoords = this.selectedTrack.coordinates;
                const progress = telemetryIndex / this.currentLapTelemetry.length;
                const trackIndex = Math.floor(progress * trackCoords.length) % trackCoords.length;
                const trackPoint = trackCoords[trackIndex];

                // Car position using track coordinates with canvas transformation
                const x = trackPoint.x * this.trackScale + this.trackOffsetX;
                const y = trackPoint.y * this.trackScale + this.trackOffsetY;

                // Use single color for car dot
                const carColor = '#FFD700';

                // Draw Max's car
                this.drawCar(x, y, carColor);

                // Draw telemetry info on canvas with background
                const statsX = 20;
                const statsY = 20;
                const statsWidth = 180;
                const statsHeight = 90;

                // Draw semi-transparent background
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(statsX - 10, statsY - 10, statsWidth, statsHeight);

                // Draw text
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = 'bold 14px Arial';
                this.ctx.fillText(`Speed: ${telemetry.speed} km/h`, statsX, statsY + 20);
                this.ctx.fillText(`Throttle: ${telemetry.throttle}%`, statsX, statsY + 40);
                this.ctx.fillText(`Brake: ${telemetry.brake}%`, statsX, statsY + 60);
                this.ctx.fillText(`Gear: ${telemetry.gear}`, statsX, statsY + 80);

                // Draw comparison car if exists
                if (this.comparisonData) {
                    const offset = Math.max(1, Math.floor(this.currentLapTelemetry.length * 0.05)); // 5% behind
                    const compIndex = (telemetryIndex - offset + this.currentLapTelemetry.length) % this.currentLapTelemetry.length;
                    const compTelemetry = this.currentLapTelemetry[compIndex];

                    // Map comparison car to track coordinates
                    const compProgress = compIndex / this.currentLapTelemetry.length;
                    const compTrackIndex = Math.floor(compProgress * trackCoords.length) % trackCoords.length;
                    const compTrackPoint = trackCoords[compTrackIndex];

                    const compX = compTrackPoint.x * this.trackScale + this.trackOffsetX;
                    const compY = compTrackPoint.y * this.trackScale + this.trackOffsetY;
                    this.drawCar(compX, compY, '#ff6b00');
                }

                this.currentTelemetryIndex += 1;
            } else {
                // Fallback to original animation if telemetry not available
                const progress = this.carPosition / 100;
                const totalPoints = this.scaledCoords.length;
                const pointIndex = Math.floor(progress * (totalPoints - 1));
                const nextIndex = Math.min(pointIndex + 1, totalPoints - 1);

                const point = this.scaledCoords[pointIndex];
                const nextPoint = this.scaledCoords[nextIndex];

                const localProgress = (progress * (totalPoints - 1)) - pointIndex;
                const x = point.x + (nextPoint.x - point.x) * localProgress;
                const y = point.y + (nextPoint.y - point.y) * localProgress;

                // Draw Max's car (Red Bull)
                this.drawCar(x, y, '#0090ff');

                // Draw comparison car if exists
                if (this.comparisonData) {
                    const offset = -5; // Slightly behind
                    const compIndex = Math.max(0, pointIndex + offset);
                    const compPoint = this.scaledCoords[compIndex % totalPoints];
                    this.drawCar(compPoint.x, compPoint.y, '#ff6b00');
                }

                this.carPosition += 0.5;
                if (this.carPosition >= 100) {
                    this.carPosition = 0;
                }
            }

                this.animationId = requestAnimationFrame(animate);
            };

            animate();
        }, 600);
    }

    stopAnimation() {
        this.isAnimating = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.currentTelemetryIndex = 0;
        this.carPosition = 0;
        document.getElementById('animate-btn').textContent = 'Animate Lap';
        this.renderTrack();
    }

    /**
     * Load telemetry data - tries REAL data first, falls back to simulated
     */
    async loadTelemetryData(trackKey) {
        try {
            // Try to load REAL telemetry data from file
            const trackName = this.selectedTrack.name.split(' ').pop() || trackKey;
            const filename = `real_telemetry_${trackKey.toLowerCase()}.json`;

            console.log(`🔄 Attempting to load REAL telemetry from ${filename}...`);

            const response = await fetch(filename);
            if (response.ok) {
                const data = await response.json();
                if (data.telemetry && data.telemetry.length > 0) {
                    console.log(`✅ LOADED REAL TELEMETRY: ${data.telemetry.length} points from ${data.metadata.driver}`);
                    console.log(`   📍 ${data.metadata.gp} - ${data.metadata.year} ${data.metadata.session}`);
                    console.log(`   🏎️  Team: ${data.metadata.team}`);
                    const speeds = data.telemetry.map(p => p.speed);
                    const avgSpeed = Math.round(speeds.reduce((a, b) => a + b) / speeds.length);
                    const topSpeed = Math.max(...speeds);
                    console.log(`   ⚡ Speed: ${avgSpeed} km/h avg, ${topSpeed.toFixed(1)} km/h top`);
                    return data.telemetry;
                }
            }
        } catch (error) {
            console.log('⚠️  Real telemetry not available, using simulated data');
        }

        // Fallback to simulated data
        console.log(`📊 Generating simulated telemetry for ${this.selectedTrack.name}...`);
        return generateSampleTelemetry(this.selectedTrack.coordinates);
    }

    drawCar(x, y, color) {
        // Draw car as a circle with team color
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 8, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw white outline
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new F1Visualizer();
});

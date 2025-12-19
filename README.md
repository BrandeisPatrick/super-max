# Max Verstappen - F1 Race Data Visualization

An interactive web app with F1-style track visualization, real telemetry data, and lap animations.

**Live Demo:** [https://brandeispatrick.github.io/super-max/](https://brandeispatrick.github.io/super-max/)

## Features

- Professional track rendering with color-coded speed zones
- Real-time telemetry (speed, throttle, brake, gear)
- Corner detection with F1-style labels
- Driver comparison with time differences
- Smooth 60fps lap animations
- 2025 F1 season data via Jolpica F1 API and OpenF1

## Getting Started

No installation required - just open `index.html` in a browser.

1. Select a track from the dropdown
2. Click "Load Data" for qualifying results
3. Select a driver for comparison
4. Click "Animate Lap" to watch the visualization

## Project Structure

```
super-max/
├── index.html      # Main HTML
├── styles.css      # Styling
├── app.js          # App logic
├── api.js          # API integration
└── track-data.js   # Track coordinates
```

## Data Sources

- **Ergast F1 API** - Historical F1 data (no API key needed)
- **OpenF1 API** - Live telemetry and 2025 season data

## License

MIT License

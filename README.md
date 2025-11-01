# Max Verstappen - Race Data Visualization

An interactive web application that visualizes Max Verstappen's F1 and GT3 race data, including qualification times, lap animations, and driver comparisons.

## Features

- **Real F1 Data Integration**: Uses Ergast F1 API and OpenF1 API for 2025 season data
- **Track Visualization**: Displays all F1 calendar tracks with accurate layouts
- **Live Animation**: Watch animated lap simulations on real circuit layouts
- **Driver Comparison**: Compare Max Verstappen's qualification times with other drivers
- **GT3 Support**: Includes Max's GT3 race data
- **Detailed Statistics**: View top speeds, sector times, and qualifying positions

## Getting Started

### Installation

No installation required! This is a pure HTML/CSS/JavaScript application.

1. Clone or download this repository
2. Open `index.html` in a modern web browser

### Usage

1. **Select a Track**: Choose from the dropdown menu (F1 circuits or GT3 tracks)
2. **Select Race Type**: Filter between F1 and GT3 races
3. **Load Data**: Click "Load Data" to fetch qualifying results
4. **Compare Drivers**: Select another driver from the comparison dropdown
5. **Animate**: Click "Animate Lap" to see the lap visualization

## Project Structure

```
max-laps/
├── index.html          # Main HTML structure
├── styles.css          # Styling and layout
├── app.js             # Main application logic
├── api.js             # API integration (Ergast F1 & OpenF1)
├── track-data.js      # Track coordinates and layouts
└── README.md          # Documentation
```

## Data Sources

- **Ergast F1 API**: Historical F1 data and qualifying results
  - URL: https://ergast.com/api/f1
  - Free, no API key required

- **OpenF1 API**: Live telemetry and detailed session data
  - URL: https://api.openf1.org/v1
  - Real-time 2025 season data

## Track Coverage

### F1 2025 Calendar Tracks
- Bahrain International Circuit
- Jeddah Corniche Circuit
- Albert Park Circuit (Australia)
- Circuit de Monaco
- Circuit de Barcelona-Catalunya
- Circuit de Spa-Francorchamps
- Autodromo Nazionale di Monza
- Silverstone Circuit
- Suzuka International Racing Course
- Autódromo José Carlos Pace (Interlagos)
- Circuit of The Americas
- Autódromo Hermanos Rodríguez
- Las Vegas Street Circuit
- Yas Marina Circuit

### GT3 Tracks
- Nürburgring

## Features Breakdown

### Qualification Times Display
- Shows Max Verstappen's best qualifying time
- Displays Q1, Q2, and Q3 session times
- Grid position information

### Driver Comparison
- Select any driver from the same race
- See side-by-side qualification times
- Automatic time difference calculation
- Color-coded faster/slower indicators

### Track Animation
- Real-time lap simulation
- Smooth car movement along circuit layout
- Multi-car animation for comparisons
- Team-colored car markers

### Statistics Panel
- Top speed for the session
- Average speed
- Individual sector times
- Session-specific metrics

## Technical Details

### Canvas Rendering
- HTML5 Canvas for track visualization
- Automatic scaling to fit different screen sizes
- Smooth animation at 60fps

### API Integration
- Asynchronous data fetching
- Response caching for performance
- Error handling and fallbacks

### Responsive Design
- Mobile-friendly interface
- Adaptive layouts for different screen sizes
- Touch-friendly controls

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

- [ ] Add more GT3 tracks and data sources
- [ ] Include race results (not just qualifying)
- [ ] Real-time telemetry visualization
- [ ] 3D track rendering
- [ ] Historical season data comparison
- [ ] Tire strategy visualization
- [ ] Weather data integration
- [ ] Lap-by-lap position changes

## Notes

- GT3 data is currently simulated/mock data. Update with real API when available.
- Track coordinates are simplified representations of actual circuits
- Some 2025 season data may not be available until races occur

## Contributing

Feel free to submit issues or pull requests to improve the application!

## License

MIT License - Free to use and modify

## Credits

- Data: Ergast F1 API & OpenF1
- Track layouts: Approximate representations based on official F1 circuits
- Inspired by Max Verstappen's racing achievements

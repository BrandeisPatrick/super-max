# F1 Data Organization

This directory contains all F1 race data, telemetry, and track information for the Max Verstappen visualization application.

## Directory Structure

```
data/
├── tracks/                          # F1 track layouts (24 circuits)
│   ├── *.json                       # Individual track coordinate files
│   └── tracks-index.json            # Index of all available tracks
│
└── seasons/                         # Season-specific data
    ├── 2024/                        # 2024 F1 Season
    │   ├── qualifying/              # Qualifying results by race
    │   │   └── round-XX-*.json      # Per-race qualifying data
    │   ├── drivers/                 # Driver profiles and statistics
    │   │   ├── index.json           # All drivers summary
    │   │   └── {driver-id}.json     # Individual driver data
    │   └── sessions/                # Session data (future)
    │
    └── 2025/                        # 2025 F1 Season (future)
        ├── qualifying/
        ├── drivers/
        └── sessions/
```

## Data Files

### Tracks (`tracks/`)

All 24 F1 2024/2025 calendar circuits with coordinate data for visualization:

**Track Data Format:**
```json
{
  "name": "Circuit Name",
  "country": "Location",
  "length": "X.XXX km",
  "turns": 14,
  "coordinates": [
    {"x": 111, "y": 54},
    ...
  ]
}
```

**Available Tracks:**
1. Albert Park Circuit (Melbourne, Australia)
2. Bahrain International Circuit (Sakhir, Bahrain)
3. Circuit de Monaco (Monaco)
4. Circuit Gilles-Villeneuve (Montreal, Canada)
5. Silverstone Circuit (Silverstone, UK)
6. Hungaroring (Budapest, Hungary)
7. Circuit de Spa-Francorchamps (Spa Francorchamps, Belgium)
8. Suzuka International Racing Course (Suzuka, Japan)
9. Autódromo Hermanos Rodríguez (Mexico City, Mexico)
10. Yas Marina Circuit (Yas Marina, UAE)
11. Jeddah Corniche Circuit (Jeddah, Saudi Arabia)
12. Circuit de Barcelona-Catalunya (Barcelona, Spain)
13. Autodromo Nazionale Monza (Monza, Italy)
14. Circuit of the Americas (Austin, USA)
15. Autódromo José Carlos Pace - Interlagos (Sao Paulo, Brazil)
16. **Circuit Zandvoort** (Zandvoort, Netherlands) 🇳🇱 *Max's Home Race*
17. **Red Bull Ring** (Spielberg, Austria) 🇦🇹 *Red Bull Home Track*
18. Las Vegas Street Circuit (Las Vegas, USA)
19. Miami International Autodrome (Miami, USA)
20. Marina Bay Street Circuit (Singapore)
21. Shanghai International Circuit (Shanghai, China)
22. Autodromo Enzo e Dino Ferrari (Imola, Italy)
23. Losail International Circuit (Lusail, Qatar)
24. Baku City Circuit (Baku, Azerbaijan)

### Qualifying Data (`seasons/2024/qualifying/`)

Complete qualifying results for all 24 races of the 2024 F1 season.

**File naming:** `round-{XX}-{circuit-name}.json`

**Data Format:**
```json
{
  "season": 2024,
  "round": 1,
  "raceName": "Bahrain Grand Prix",
  "circuit": {
    "name": "Bahrain International Circuit",
    "location": "Sakhir",
    "country": "Bahrain"
  },
  "date": "2024-03-02",
  "results": [
    {
      "position": 1,
      "driver": {
        "id": "max_verstappen",
        "number": "1",
        "code": "VER",
        "name": "Max Verstappen",
        "nationality": "Dutch"
      },
      "constructor": {
        "id": "red_bull",
        "name": "Red Bull",
        "nationality": "Austrian"
      },
      "q1": "1:30.031",
      "q2": "1:29.374",
      "q3": "1:29.179"
    },
    ...
  ]
}
```

### Driver Data (`seasons/2024/drivers/`)

Individual driver profiles with complete 2024 season statistics.

**Files:**
- `index.json` - Summary of all 24 drivers sorted by average qualifying position
- `{driver-id}.json` - Individual driver detailed data

**Driver Data Format:**
```json
{
  "id": "max_verstappen",
  "name": "Max Verstappen",
  "code": "VER",
  "number": "1",
  "nationality": "Dutch",
  "races": [
    {
      "round": 1,
      "raceName": "Bahrain Grand Prix",
      "circuit": "Bahrain International Circuit",
      "position": 1,
      "q1": "1:30.031",
      "q2": "1:29.374",
      "q3": "1:29.179",
      "constructor": "Red Bull"
    },
    ...
  ],
  "stats": {
    "totalRaces": 24,
    "polePositions": 10,
    "avgQualifyingPosition": "2.92",
    "bestQualifyingPosition": 1
  }
}
```

## 2024 Season Statistics

### Top 10 Drivers (by avg qualifying position)

1. **Max Verstappen** - Avg P2.92 (10 poles) 🏆
2. **Lando Norris** - Avg P3.54 (8 poles)
3. **George Russell** - Avg P5.17 (3 poles)
4. **Charles Leclerc** - Avg P5.33 (2 poles)
5. **Oscar Piastri** - Avg P5.42
6. **Carlos Sainz** - Avg P5.52 (1 pole)
7. **Lewis Hamilton** - Avg P8.5
8. **Sergio Pérez** - Avg P9.25
9. **Fernando Alonso** - Avg P9.58
10. **Yuki Tsunoda** - Avg P11.13

### Total Data Points

- **24 Races** - Complete 2024 F1 calendar
- **24 Drivers** - All drivers who competed in qualifying
- **24 Track Layouts** - 100% circuit coverage
- **476 Qualifying Results** - All driver results across all races

## Data Sources

### 1. Ergast F1 API (via Jolpi.ca)
- **URL:** https://api.jolpi.ca/ergast/f1
- **Usage:** Qualifying results, driver info, race calendar
- **Coverage:** Historical data (1950-2024)
- **Cost:** Free, no API key required

### 2. OpenF1 API
- **URL:** https://api.openf1.org/v1
- **Usage:** Real-time telemetry, position data, car data
- **Coverage:** 2023+ with live data
- **Data Types:**
  - Sessions (Practice, Qualifying, Race)
  - Drivers
  - Laps with sector times
  - Position/Location (lat/lon + x/y/z coordinates)
  - Car telemetry (speed, RPM, gear, throttle, brake)
- **Cost:** Free, no API key required

### 3. F1 Circuits (bacinger/f1-circuits)
- **GitHub:** https://github.com/bacinger/f1-circuits
- **Usage:** Track coordinate data in GeoJSON format
- **Coverage:** All 41 current and historic F1 circuits
- **License:** Open source

## Usage in Application

### Loading Track Data
```javascript
// Initialize track loader
await trackLoader.init();

// Load specific track
const monaco = await trackLoader.loadTrack('monaco');

// Get all available tracks
const tracks = await trackLoader.getTrackList();
```

### Loading Driver Data
```javascript
// Load driver index
const driversIndex = await fetch('data/seasons/2024/drivers/index.json');
const drivers = await driversIndex.json();

// Load specific driver
const maxData = await fetch('data/seasons/2024/drivers/max_verstappen.json');
const max = await maxData.json();
```

### Loading Qualifying Data
```javascript
// Load specific race qualifying
const bahrain = await fetch('data/seasons/2024/qualifying/round-01-bahrain-international-circuit.json');
const qualiResults = await bahrain.json();
```

## Future Enhancements

- [ ] Add race results (not just qualifying)
- [ ] Include practice session data
- [ ] Store OpenF1 telemetry data locally
- [ ] Add historical season data (2023, 2022, etc.)
- [ ] Tire strategy data
- [ ] Weather data
- [ ] Lap-by-lap position changes
- [ ] Team championship standings

## Data Freshness

- **Track Data:** Static, updated when new circuits are added
- **2024 Qualifying Data:** Complete season (all 24 races)
- **2025 Data:** Will be populated as season progresses

## Notes

- All times are in UTC
- Qualifying times format: "M:SS.mmm" (minutes:seconds.milliseconds)
- Track coordinates are normalized to 600x600 canvas with 50px padding
- Driver IDs use Formula 1 official driver identifiers
- All data validated with JSON schema

---

**Last Updated:** November 2, 2024
**Total Data Size:** ~2.5 MB
**Generated By:** F1 Data Fetcher Scripts

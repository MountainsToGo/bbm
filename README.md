# Bogus Basin Interactive Maps

Interactive maps for exploring Bogus Basin — winter ski runs and summer multi-use trails.

🏔️ **Live Site:** [https://mountainstogo.github.io/bbm/](https://mountainstogo.github.io/bbm/)

## Maps

### ⛷️ Winter Map
An interactive learning tool for memorizing the locations of all lifts, runs, lodges, and terrain features at Bogus Basin.

**[Open Winter Map](https://mountainstogo.github.io/bbm/Winter/learn.html)**

- 120 locations — lifts, runs, lodges, and landmarks
- Auto-zoom, search, scramble, hide map text, progress tracking
- Mountain Host Tour route animation
- Fully responsive (phones, tablets, desktops)

### 🥾 Summer Map
An interactive explorer for Bogus Basin's summer multi-use trail network.

**[Open Summer Map](https://mountainstogo.github.io/bbm/Summer/learn.html)**

- Trail list with click-to-highlight markers
- Animated trail tracing with START/FINISH markers
- Multi-location support (trails spanning multiple points)
- Zoom, search, pan, and pinch-to-zoom

## Project Structure

```
bbm/
├── index.html                  # Landing page (season selector)
├── README.md                   # This file
├── USER_GUIDE.md               # Detailed user guide
├── images/                     # Shared images
│   └── responsibility-code.jpg
├── Winter/                     # Winter map application
│   ├── learn.html              # Main interactive winter map
│   ├── location_manager.html   # Admin tool for locations & overlays
│   ├── bogus_basin_config.json # Location data (120 locations)
│   ├── text_overlays.json      # Text overlay rectangles
│   ├── routes.json             # Mountain Host Tour route
│   ├── location_names.js       # Location names array
│   └── trail_map.png           # Winter trail map image
└── Summer/                     # Summer map application
    ├── learn.html              # Interactive summer trail map
    ├── location_manager.html   # Admin tool for trail locations
    ├── SummerBB.json           # Trail location data
    ├── text_overlays.json      # Text overlay rectangles
    ├── routes.json             # Traced trail routes
    ├── location_names.js       # Trail names array
    └── trail_map.png           # Summer trail map image
```

## Technology Stack

- **HTML5 Canvas** - Interactive map rendering
- **Vanilla JavaScript (ES6)** - No frameworks, pure performance
- **CSS3** - Modern responsive design with mobile breakpoints
- **No dependencies** - Works anywhere, no build step required

## Local Development

```bash
# Clone the repository
git clone https://github.com/mountainstogo/bbm.git
cd bbm

# Start a local server
python -m http.server 8000

# Open in browser
# http://localhost:8000/           (landing page)
# http://localhost:8000/Winter/    (winter map)
# http://localhost:8000/Summer/    (summer map)
```

## Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Credits

- **Trail Maps:** Bogus Basin Mountain Recreation Area
- **Development:** Interactive learning & exploration tools

## License

This project is open source and available for educational purposes.

---

**Enjoy exploring the mountain!** ⛷️🥾

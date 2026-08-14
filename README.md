# Bogus Basin Interactive Maps

Interactive maps for exploring Bogus Basin — winter ski runs and summer multi-use trails.

🏔️ **Live Site:** [https://mountainstogo.github.io/bbm/](https://mountainstogo.github.io/bbm/)

## Maps

### ⛷️ Winter Map
An interactive learning tool for memorizing the locations of all lifts, runs, lodges, and terrain features at Bogus Basin.

**[Open Winter Map](https://mountainstogo.github.io/bbm/Winter/learn.html)**

- Quiz workflow with forgiving map-click targets and immediate feedback
- Filters for the full mountain, lifts, runs, and lodges/bases
- Search, shuffle, labels, map-text visibility, auto-zoom, and map zoom controls
- Correct, incorrect, skipped, streak, remaining, and accuracy tracking
- Progress restored from local browser storage between visits
- Mountain Host Tour route plus quick access to learning and safety resources
- Responsive two-column desktop layout and mobile progress drawer

### 🥾 Summer Map
An interactive, map-first explorer for Bogus Basin's summer multi-use trail network.

**[Open Summer Map](https://mountainstogo.github.io/bbm/Summer/learn.html)**

- Full-screen Leaflet map with mouse, touch, and pinch navigation
- Searchable trail and map-feature drawer with difficulty filters
- Trail selection that focuses the map and reveals only matching target markers
- Multi-location support for trails that appear in several places
- Contextual animated route tracing for routes defined in `routes.json`
- Responsive desktop sidebar and mobile bottom drawer
- Accessible controls, reduced-motion support, and uncluttered default map state

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
│   ├── modernization.css       # Responsive Winter layout and visual system
│   ├── modernization.js        # Quiz navigation, persistence, and accessibility enhancements
│   ├── location_manager.html   # Admin tool for locations & overlays
│   ├── bogus_basin_config.json # Location data (120 locations)
│   ├── text_overlays.json      # Text overlay rectangles
│   ├── routes.json             # Mountain Host Tour route
│   ├── location_names.js       # Location names array
│   └── trail_map.png           # Winter trail map image
└── Summer/                     # Summer map application
    ├── learn.html              # Interactive summer trail map
    ├── app.css                 # Public map visual system and responsive layout
    ├── app.js                  # Leaflet map, filters, selection, and route tracing
    ├── location_manager.html   # Admin tool for locations, overlays, and routes
    ├── manager.css             # Responsive editor visual system
    ├── manager-enhancements.js # Drafts, undo/redo, dragging, and direct saves
    ├── SummerBB.json           # Trail location data
    ├── text_overlays.json      # Text overlay rectangles
    ├── routes.json             # Traced trail routes
    ├── location_names.js       # Trail names array
    └── trail_map.png           # Summer trail map image
```

## Technology Stack

- **Leaflet 1.9** - Summer image-map navigation, markers, and route layers
- **HTML5 Canvas** - Winter map and Summer editor rendering
- **Vanilla JavaScript (ES6)** - No application framework or build step
- **CSS3** - Responsive desktop and mobile layouts
- **Lucide** - Public map interface icons
- **Google Fonts** - Barlow Condensed and Manrope

Leaflet, Lucide, and Google Fonts are loaded from public CDNs, so the modern Summer interface needs an internet connection unless those assets are vendored locally.

## Local Development

```bash
# Clone the repository
git clone https://github.com/mountainstogo/bbm.git
cd bbm

# Start a local server
python -m http.server 8000

# Open in browser
# http://localhost:8000/                              (landing page)
# http://localhost:8000/Winter/learn.html             (winter map)
# http://localhost:8000/Summer/learn.html             (summer map)
# http://localhost:8000/Summer/location_manager.html  (summer editor)
```

Opening the HTML files directly with a `file://` URL will prevent the JSON configuration files from loading. Always use a local HTTP server.

## Summer Editor Workflow

1. Open `http://localhost:8000/Summer/location_manager.html`.
2. Use the Locations, Text Overlays, or Trace Trails tab.
3. Drag an existing location marker to reposition it, or enter a name and click the map to create one.
4. Use Undo/Redo in the editor header. Work is also retained as a local browser draft.
5. Use the save button in each tab to write its JSON file. Chromium browsers can save directly through the file picker; other browsers download a replacement file.
6. Refresh `Summer/learn.html` to verify the published-map behavior.

The editor writes these source files independently:

- `SummerBB.json` for named map locations
- `text_overlays.json` for map-text cover regions
- `routes.json` for traced route waypoints

Commit the updated JSON files together with any interface changes after testing both desktop and mobile layouts.

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

# Bogus Basin Interactive Map

An interactive learning tool for memorizing the locations of all lifts, runs, lodges, and terrain features at Bogus Basin Ski Resort.

🎿 **Live Demo:** [https://mountainstogo.github.io/bogus-basin-map/](https://mountainstogo.github.io/bogus-basin-map/)

## Features

- 🎿 **110 Locations** - All lifts, runs, lodges, and landmarks mapped
- 📱 **Fully Responsive** - Optimized for phones, tablets, and desktops
- 🎯 **Auto-Zoom** - Automatically zoom to the current location
- 🔍 **Zoom Controls** - Pan and zoom the high-resolution trail map
- 📊 **Progress Tracking** - Track completed locations, streaks, and percentage
- ⛷️ **Custom Cursors** - Choose between ski, snowboard, or default cursors
- 🏷️ **Toggle Labels** - Show/hide location names on the map
- ✓ **Smart List** - Clickable location list with completion status
- 💡 **Show Answer** - Get help when stuck
- ⏭️ **Skip Option** - Skip difficult locations and return later

## How to Use

1. Visit the live demo link above
2. Click on the map where you think the highlighted location is
3. Get instant feedback (✓ for correct, ✗ for incorrect)
4. Track your progress as you learn all 110 locations!

## Technology Stack

- **HTML5 Canvas** - Interactive map rendering
- **Vanilla JavaScript (ES6)** - No frameworks, pure performance
- **CSS3** - Modern responsive design with mobile breakpoints
- **No dependencies** - Works anywhere, no build step required

## Local Development

Want to run this locally or contribute?

```bash
# Clone the repository
git clone https://github.com/mountainstogo/bogus-basin-map.git
cd bogus-basin-map

# Start a local server
python -m http.server 8000

# Open in browser
# Navigate to http://localhost:8000/learn.html
```

## Project Structure

```
bogus-basin-map/
├── learn.html                  # Main interactive map application
├── location_manager.html       # Admin tool for managing locations
├── bogus_basin_config.json     # Location data (110 locations with coordinates)
├── location_names.js           # Location names array
├── trail_map.png              # High-resolution trail map (3131x1999px)
├── mobile_testing_guide.md    # Guide for testing mobile responsiveness
└── README.md                  # This file
```

## Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Screenshots

### Desktop View
Full interactive map with sidebar showing location list and statistics.

### Mobile View
Responsive design with touch-optimized controls and scrollable location list.

### Features in Action
- Auto-zoom highlighting with red circle indicators
- Visual feedback for correct/incorrect answers
- Progress tracking with streak counter

## Credits

- **Trail Map:** Bogus Basin Mountain Recreation Area
- **Development:** Interactive learning application
- **Inspiration:** Making it easier to learn the mountain!

## License

This project is open source and available for educational purposes.

## Contributing

Found a bug or want to add a feature? Feel free to open an issue or submit a pull request!

---

**Enjoy learning the mountain!** ⛷️🏂

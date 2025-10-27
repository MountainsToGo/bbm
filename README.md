# Bogus Basin Interactive Map

An interactive learning tool for memorizing the locations of all lifts, runs, lodges, and terrain features at Bogus Basin Ski Resort.

🎿 **Live Demo:** [https://mountainstogo.github.io/bbm/](https://mountainstogo.github.io/bbm/)

## Features

- 🎿 **120 Locations** - All lifts, runs, lodges, and landmarks mapped
- 📱 **Fully Responsive** - Optimized for phones, tablets, and desktops
- 🎯 **Auto-Zoom** - Automatically zoom to the current location when selected
- 🔍 **Zoom Controls** - Pan and zoom the high-resolution trail map (up to 1000%)
- � **Scramble List** - Shuffle the location order for varied practice
- 🙈 **Hide Map Text** - Cover trail/lift names with black overlays; reveals as you learn each location
- �📊 **Progress Tracking** - Track completed locations, streaks, and percentage
- ⛷️ **Custom Cursors** - Choose between ski, snowboard, or default cursors
- 🏷️ **Toggle Labels** - Show/hide location names on completed locations
- ✓ **Smart List** - Clickable location list - jump to any location anytime
- ⏭️ **Skip Option** - Skip difficult locations and return later
- � **Visual Markers** - Red-bordered boxes mark unlearned locations, green dots mark completed
- 🎨 **Color-Coded List** - Purple for current, green for completed, gray for pending
- 🔥 **Streak Counter** - Track your consecutive correct answers
- 💾 **Session Persistence** - Your progress stays tracked during your session
- 🖱️ **Drag to Pan** - Click and drag to navigate the map
- ⌨️ **Keyboard Shortcuts** - Ctrl+Scroll to zoom in/out

## How to Use

1. Visit the live demo link above
2. The current location name appears in the purple box at the top of the sidebar
3. Click on the map where you think that location is
4. Get instant feedback (✓ for correct, ✗ for incorrect)
5. Completed locations turn green, and you move to the next location
6. Track your progress in the stats boxes (Completed, Remaining, Progress %, Streak)

### Tips for Learning

- **Turn on Auto-Zoom** - Click any location in the list to jump right to it on the map
- **Use Scramble List** - Randomize the order to avoid memorizing alphabetically
- **Enable Hide Map Text** - Once you know the general area, hide the text for a real challenge. Overlays disappear as you correctly identify each location!
- **Skip Tricky Ones** - Use the Skip button and come back to difficult locations later
- **Click Completed Locations** - Click green (completed) items in the list to view where they are
- **Show Labels** - Turn on labels to see names of completed locations on the map

## Technology Stack

- **HTML5 Canvas** - Interactive map rendering
- **Vanilla JavaScript (ES6)** - No frameworks, pure performance
- **CSS3** - Modern responsive design with mobile breakpoints
- **No dependencies** - Works anywhere, no build step required

## Local Development

Want to run this locally or contribute?

```bash
# Clone the repository
git clone https://github.com/mountainstogo/bbm.git
cd bbm

# Start a local server
python -m http.server 8000

# Open in browser
# Navigate to http://localhost:8000/learn.html
```

## Project Structure

```
bbm/
├── learn.html                  # Main interactive map application
├── location_manager.html       # Admin tool for managing locations and overlays
├── bogus_basin_config.json     # Location data (120 locations with coordinates)
├── text_overlays.json          # Text overlay rectangles for hiding trail/lift names
├── location_names.js           # Location names array
├── trail_map.png              # High-resolution trail map (3131x1999px)
├── USER_GUIDE.md              # Detailed user guide
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
Full interactive map with sidebar showing location list and statistics. Features include:
- Real-time progress tracking (Completed, Remaining, Progress %, Streak)
- Clickable location list with color-coded status
- Control buttons: Skip, Scramble List, Hide Map Text, Reset
- Map controls: Auto-Zoom, Labels, Zoom In/Out, Reset Map
- Visual markers: Red-bordered boxes for pending locations, green dots for completed

### Mobile View
Responsive design with touch-optimized controls:
- Touch-friendly buttons and location list
- Pinch-to-zoom support on the map
- Scrollable location list
- Map controls organized in a grid layout

### Features in Action
- **Auto-zoom highlighting** - Bold red concentric circles around current location
- **Visual feedback** - Green checkmark popups for correct, red X for incorrect
- **Progress tracking** - Live statistics update as you learn
- **Scramble feature** - Randomize list order and jump to first incomplete location
- **Hide Map Text** - Black overlays cover trail/lift names for advanced practice
- **Smart clicking** - Click any location in the list to jump to it instantly

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

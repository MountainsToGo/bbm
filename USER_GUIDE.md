# Bogus Basin Interactive Maps - User Guide

## 📖 Overview
Explore Bogus Basin with interactive maps for both winter and summer seasons.

- **Winter Map**: Learn all 120 locations — lifts, runs, lodges, and landmarks — through a gamified quiz experience.
- **Summer Map**: Explore the multi-use trail network with focused trail selection, difficulty filters, and animated route tracing.

---

## 🔗 Quick Links

- **Landing Page**: [https://mountainstogo.github.io/bbm/](https://mountainstogo.github.io/bbm/)
- **Winter Map**: [https://mountainstogo.github.io/bbm/Winter/learn.html](https://mountainstogo.github.io/bbm/Winter/learn.html)
- **Summer Map**: [https://mountainstogo.github.io/bbm/Summer/learn.html](https://mountainstogo.github.io/bbm/Summer/learn.html)

---

## ⛷️ Winter Map

### 🎯 Getting Started
1. A location name appears at the top
2. **Click** where you think that location is on the map
3. Get instant feedback: ✅ Correct or ❌ Incorrect

### 🎮 Controls
- **Search Box**: Filter locations by name or type, such as chairlift, lodge, or food truck; press Enter to jump to the first result
- **Location Selector**: Switch between the full mountain, lifts/carpets, all runs, places/facilities, or a specific run difficulty
- **Difficulty Filters**: Practice easier (green circle), more difficult (blue square), or most difficult (black diamond) runs; the dropdown and run list use the same icons
- **Auto-Zoom**: Automatically zooms to each new location when enabled
- **Labels**: Show/hide location names on the map
- **Zoom In/Out**: 100% to 1000% zoom range
- **Reset Map**: Return to default view
- **Skip**: Skip difficult locations and return later
- **Scramble List**: Shuffle the location order
- **Hide Map Text**: Cover trail/lift names with black overlays for advanced practice
- **Know the Code**: View the ski/snowboard responsibility code
- **Mountain Host Tour**: Animated route tracing of the guided tour

### 📊 Progress Tracking
- **Remaining**: Locations still to learn
- **Complete %**: Overall progress
- **Streak**: Consecutive correct answers

### ✅ Location List Colors
- **Purple** = Current location to find
- **Green** = Completed correctly
- **Gray** = Not yet attempted

Run names show the official difficulty symbol. Single and double black-diamond runs are grouped under **Most difficult**.

Other locations use icons that match what they represent: cable cars with numbered badges for chairlifts 1-7, chevrons for magic carpet conveyors, houses for lodges, a building for the condominiums, map pins for base areas, a flag for ski-racing training, a truck for The Beach, a tube for Tubing Hill, and mountain icons for summits and landmarks.

### 🛠️ Maintaining Locations
Open `Winter/location_manager.html` from the local web server to add or remove map points. Choose either a run difficulty or a place type before placing a new point, or change the matching selector beside an existing location. Selecting one clears the other because a location cannot be both a run and a place. Use **Save All Changes** to download the updated `bogus_basin_config.json`, then refresh the Winter map to verify the filters and icons before publishing.

---

## 🥾 Summer Map

### 🎯 Getting Started
1. Browse the trail list in the desktop sidebar, or open the trail drawer on mobile
2. Search by name or filter by trail difficulty
3. **Select a trail or map feature** to focus the map on its known locations
4. Use Reset Map in the header to return to the full-map view

### 🎮 Controls
- **Search Box**: Filter trails and named map features
- **Difficulty Filters**: Show all, easier, more difficult, or most difficult trails
- **Route Button**: Appears in the map toolbar when the selected trail has a traced route; click again to stop the trace
- **Zoom In/Out**: Zoom the image map while preserving marker alignment
- **Map Guide**: Open a compact guide to difficulty and trail-type symbols
- **Reset Map**: Clear the selection and return to the complete map

### 🗺️ Map Features
- **Unselected map**: No overlay markers, leaving the official trail artwork unobstructed
- **Selected targets**: Red-and-white circular targets with red pointers mark only the selected trail's known locations
- **Trail animation**: The selected route draws progressively over the official trail map
- **Multiple targets**: Some trails appear at several labeled points on the map

### Trail and Place Icons
- **Green circle**: Easier trail
- **Blue square**: More difficult trail
- **Black diamond**: Most difficult trail
- **Green circle + blue square**: Around the Mountain, which includes easier and more-difficult segments
- **Cable car**: Chairlift
- **House**: Lodge
- **Route line**: Road
- **Signpost**: Trail junction or connector

Permitted use and direction appear in the text beside each trail rating. For example, Around the Mountain reads **Bike + Hike · One way**, while a bidirectional cross-country trail reads **Bike + Hike · Uphill + downhill**. Downhill-only and bike-only restrictions appear only where officially marked.

Trail use, direction, and difficulty are based on the [official Bogus Basin trail report](https://bogusbasin.org/your-mountain/trails-grooming/) and summer map. Cross-country trails are shared by hikers and bikers and are generally bidirectional unless the map shows a directional exception.

---

## 📱 Mobile & Tablet

Both maps support mobile and tablet:
- **Pinch to Zoom**: Two fingers to zoom in/out
- **Drag to Pan**: Move around the map
- **Tap**: Click locations and buttons
- **Summer Trail Drawer**: Open the list from the header; it closes after selecting an item

---

## ⌨️ Keyboard Shortcuts (Desktop)

- **Scroll Wheel**: Zoom the Summer map
- **Click & Drag**: Pan the map
- **Tab / Enter / Space**: Navigate and activate map controls and trail selectors

---

## 🌐 Browser Compatibility

✅ **Desktop**: Chrome, Firefox, Edge, Safari
✅ **Mobile**: iOS Safari, Android Chrome
✅ **Tablet**: iPad Safari, Android tablets

---

## 🆘 Troubleshooting

### Map Won't Load
- Refresh the page (F5 or Cmd+R)
- Clear browser cache
- Check internet connection
- Confirm the page is running from an HTTP server rather than a `file://` URL
- The maps load interface libraries and fonts from public CDNs

### Zoom Issues on Mobile
- Use two fingers to pinch-to-zoom
- Try closing and reopening the browser

---

## 🔗 Links

- **GitHub Repository**: https://github.com/MountainsToGo/bbm
- **Live Site**: https://mountainstogo.github.io/bbm/
- **Bogus Basin**: https://www.bogusbasin.org/

---

**Enjoy exploring the mountain!** ⛷️🥾

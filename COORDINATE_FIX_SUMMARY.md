# Coordinate Alignment Fix Summary

## Issues Identified

### 1. **Incorrect Tolerance Scaling**
**Problem:** The click tolerance was being scaled based on `zoomLevel` using `baseTolerance / Math.sqrt(zoomLevel)`. This caused the tolerance to decrease when zoomed in, making locations harder to click.

**Why this was wrong:** The tolerance was being calculated in display pixel space, but should be constant in map coordinate space. Since the click coordinates are already converted to map coordinates, the tolerance should also be in map coordinates and remain constant.

**Fix:** Changed to `const tolerance = baseTolerance;` to keep tolerance constant at 120 pixels in map coordinate space.

```javascript
// BEFORE (incorrect):
const tolerance = baseTolerance / Math.sqrt(zoomLevel);

// AFTER (correct):
const tolerance = baseTolerance; // 120px constant in map coordinates
```

### 2. **Incorrect Box Scaling**
**Problem:** The white location boxes were being scaled based on `zoomLevel` using `baseBoxSize * Math.sqrt(zoomLevel)`. This caused boxes to grow larger when zoomed in, creating a visual mismatch with the actual clickable areas.

**Why this was wrong:** The CSS zoom already scales the entire canvas visually. Adding additional scaling to the box size caused double-scaling, making boxes appear in the wrong visual position relative to the map.

**Fix:** Removed the zoom-based scaling and use a fixed box size of 20 pixels in canvas coordinates.

```javascript
// BEFORE (incorrect):
const boxSize = Math.max(baseBoxSize, baseBoxSize * Math.sqrt(zoomLevel));

// AFTER (correct):
const baseBoxSize = 20; // Fixed size in canvas coordinates
```

## How the Coordinate System Works

The app uses a multi-layer coordinate system:

1. **Map Coordinates** (Source): The x, y values in `bogus_basin_config.json` (e.g., x: 1827, y: 329)
2. **Canvas Coordinates**: Map coordinates × `canvasScale` (currently always 1.0)
3. **Display Coordinates**: Canvas scaled by CSS (`canvas.style.width = (100 * zoomLevel) + '%'`)
4. **Client Coordinates**: Where the user actually clicks on screen

### Click Coordinate Conversion Flow:
```
Client Click (e.clientX, e.clientY)
    ↓ (account for canvas.getBoundingClientRect())
Raw Click in element (clientX - rect.left)
    ↓ (scale by canvas.width / rect.width)
Canvas Coordinates (rawClickX, rawClickY)
    ↓ (divide by canvasScale)
Map Coordinates (clickX, clickY)
```

## Testing Tool

A new diagnostic tool has been created: **`coordinate_test.html`**

### Features:
- ✅ Visual display of location boxes and click tolerance circles
- ✅ Real-time click coordinate conversion display
- ✅ Distance measurement to nearest location
- ✅ Zoom level testing (0.5x to 3.0x)
- ✅ Tolerance adjustment slider (50px to 200px)
- ✅ Click to add markers showing if click would be accepted
- ✅ List of all locations with quick zoom
- ✅ "Test All Locations" button to mark all location centers

### How to Use:
1. Open `coordinate_test.html` in your browser (server must be running)
2. Adjust the zoom level using the slider
3. Click on white location boxes to test if they're clickable
4. Check the "Within Tolerance" indicator (green ✓ = success, red ✗ = fail)
5. The yellow dashed circle around each location shows the tolerance area
6. Use "Toggle Labels" to see location names
7. Click "Test All Locations" to verify all locations are accessible

### What to Look For:
- ✅ Boxes should always be clickable when you click directly on them
- ✅ Tolerance circles (yellow dashed) should be consistent size at all zoom levels
- ✅ Distance measurements should be accurate
- ❌ If locations are not clickable at certain zoom levels, there's still a problem

## Expected Behavior After Fix:

1. **Constant Tolerance**: A 120px tolerance in map coordinates means the clickable area remains proportionally the same regardless of zoom
2. **Visual Consistency**: Location boxes appear in the correct position and don't grow/shrink unexpectedly
3. **Reliable Clicking**: Locations should be clickable at ALL zoom levels when you click on or near the white box

## Additional Notes:

- The canvas always renders at full resolution (3131 × 1999 pixels)
- CSS zoom only affects display size, not internal canvas coordinates
- All drawing (boxes, markers, highlights) should use fixed sizes in canvas coordinates
- The browser automatically scales the canvas visually via CSS

## Testing Checklist:

- [ ] Test clicking at zoom 1.0x (default)
- [ ] Test clicking at zoom 0.5x (zoomed out)
- [ ] Test clicking at zoom 3.0x (zoomed in)
- [ ] Test clicking on edge locations (corners of map)
- [ ] Test clicking on center locations
- [ ] Verify boxes align with actual map features
- [ ] Verify tolerance circles show appropriate click area
- [ ] Test on different screen sizes/resolutions
- [ ] Test on mobile devices (touch events)

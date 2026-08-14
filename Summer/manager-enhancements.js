(() => {
    "use strict";

    const DRAFT_KEY = "bogus-basin-summer-map-draft-v2";
    const history = [];
    let historyIndex = -1;
    let applyingHistory = false;
    let initialized = false;
    let lastSerialized = "";
    let savedHashes = null;
    let draggingLocationIndex = null;
    let dragMoved = false;
    let suppressNextClick = false;

    const undoButton = document.getElementById("undoButton");
    const redoButton = document.getElementById("redoButton");
    const saveState = document.getElementById("saveState");

    function captureState() {
        return {
            locations: structuredClone(locations),
            textOverlays: structuredClone(textOverlays),
            routes: structuredClone(routes),
            currentRoute: structuredClone(currentRoute),
            editingRouteIndex,
            savedAt: Date.now()
        };
    }

    function serializeState(snapshot = captureState()) {
        return JSON.stringify(snapshot, (key, value) => key === "savedAt" ? undefined : value);
    }

    function datasetHashes() {
        return {
            locations: JSON.stringify(locations),
            overlays: JSON.stringify(textOverlays),
            routes: JSON.stringify(routes)
        };
    }

    function isDirty() {
        if (!savedHashes) return false;
        const current = datasetHashes();
        return current.locations !== savedHashes.locations || current.overlays !== savedHashes.overlays || current.routes !== savedHashes.routes || currentRoute.waypoints.length > 0;
    }

    function updateCommandState(message) {
        undoButton.disabled = historyIndex <= 0;
        redoButton.disabled = historyIndex < 0 || historyIndex >= history.length - 1;
        const dirty = isDirty();
        saveState.classList.toggle("dirty", dirty);
        saveState.textContent = message || (dirty ? "Draft saved locally" : "All exported data is current");
    }

    function refreshPanels() {
        updateLocationList();
        updateStats();
        updateOverlayList();
        updateOverlayStats();
        updateRouteList();
        updateRouteStats();
        updateWaypointsList();
        updateButtonStates();
        drawMap();
    }

    function applySnapshot(snapshot) {
        applyingHistory = true;
        locations = structuredClone(snapshot.locations || []);
        textOverlays = structuredClone(snapshot.textOverlays || []);
        routes = structuredClone(snapshot.routes || []);
        currentRoute = structuredClone(snapshot.currentRoute || { name: "", waypoints: [] });
        editingRouteIndex = snapshot.editingRouteIndex ?? -1;
        refreshPanels();
        lastSerialized = serializeState(snapshot);
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...snapshot, savedAt: Date.now() }));
        applyingHistory = false;
        updateCommandState();
    }

    function pushHistory(snapshot) {
        const serialized = serializeState(snapshot);
        if (serialized === lastSerialized || applyingHistory) return;
        history.splice(historyIndex + 1);
        history.push(structuredClone(snapshot));
        if (history.length > 60) history.shift();
        historyIndex = history.length - 1;
        lastSerialized = serialized;
        localStorage.setItem(DRAFT_KEY, JSON.stringify(snapshot));
        updateCommandState();
    }

    function undo() {
        if (historyIndex <= 0) return;
        historyIndex -= 1;
        applySnapshot(history[historyIndex]);
        showStatus("Undid the last map change", "info");
    }

    function redo() {
        if (historyIndex >= history.length - 1) return;
        historyIndex += 1;
        applySnapshot(history[historyIndex]);
        showStatus("Redid the map change", "info");
    }

    async function writeJson(filename, data, kind) {
        const json = JSON.stringify(data, null, 2);
        try {
            if ("showSaveFilePicker" in window) {
                const handle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{ description: "JSON data", accept: { "application/json": [".json"] } }]
                });
                const writable = await handle.createWritable();
                await writable.write(json);
                await writable.close();
            } else {
                const blob = new Blob([json], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = filename;
                link.click();
                URL.revokeObjectURL(url);
            }
            savedHashes[kind] = JSON.stringify(kind === "locations" ? locations : kind === "overlays" ? textOverlays : routes);
            updateCommandState(`${filename} saved`);
            showStatus(`${filename} saved successfully`, "success");
        } catch (error) {
            if (error.name !== "AbortError") {
                console.error(error);
                showStatus(`Could not save ${filename}`, "error");
            }
        }
    }

    window.saveToFile = () => writeJson("SummerBB.json", {
        mapImageSrc: "trail_map.png",
        imageWidth: img.width,
        imageHeight: img.height,
        locations
    }, "locations");
    window.saveOverlaysToFile = () => writeJson("text_overlays.json", { overlays: textOverlays }, "overlays");
    window.saveRoutesToFile = () => writeJson("routes.json", { routes }, "routes");

    function canvasPoint(event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((event.clientX - rect.left) * (canvas.width / rect.width)),
            y: Math.round((event.clientY - rect.top) * (canvas.height / rect.height))
        };
    }

    canvas.addEventListener("mousedown", event => {
        if (currentMode !== "locations" || event.button !== 0) return;
        const point = canvasPoint(event);
        const rect = canvas.getBoundingClientRect();
        const tolerance = 18 * (canvas.width / rect.width);
        let closestDistance = Infinity;
        locations.forEach((location, index) => {
            const distance = Math.hypot(location.x - point.x, location.y - point.y);
            if (distance < tolerance && distance < closestDistance) {
                closestDistance = distance;
                draggingLocationIndex = index;
            }
        });
        dragMoved = false;
    }, true);

    canvas.addEventListener("mousemove", event => {
        if (draggingLocationIndex === null || currentMode !== "locations") return;
        const point = canvasPoint(event);
        const location = locations[draggingLocationIndex];
        if (!location) return;
        if (Math.hypot(location.x - point.x, location.y - point.y) > 1) dragMoved = true;
        location.x = point.x;
        location.y = point.y;
        canvas.style.cursor = "grabbing";
        drawMap();
    }, true);

    window.addEventListener("mouseup", () => {
        if (draggingLocationIndex === null) return;
        if (dragMoved) {
            suppressNextClick = true;
            updateLocationList();
            showStatus("Location moved. Draft saved locally.", "success");
            pushHistory(captureState());
        }
        draggingLocationIndex = null;
        canvas.style.cursor = "crosshair";
    }, true);

    canvas.addEventListener("click", event => {
        if (!suppressNextClick) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        suppressNextClick = false;
    }, true);

    undoButton.addEventListener("click", undo);
    redoButton.addEventListener("click", redo);
    document.addEventListener("keydown", event => {
        if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "z") return;
        event.preventDefault();
        if (event.shiftKey) redo(); else undo();
    });

    window.addEventListener("beforeunload", event => {
        if (!isDirty()) return;
        event.preventDefault();
        event.returnValue = "";
    });

    function initializeEnhancements() {
        if (initialized || !img.complete || !locations.length) return;
        initialized = true;
        savedHashes = datasetHashes();
        const serverState = captureState();
        const draftText = localStorage.getItem(DRAFT_KEY);
        let initialState = serverState;
        if (draftText) {
            try {
                const draft = JSON.parse(draftText);
                if (serializeState(draft) !== serializeState(serverState) && confirm("A newer local editor draft is available. Restore it?")) {
                    initialState = draft;
                    applySnapshot(draft);
                    showStatus("Local editor draft restored", "success");
                }
            } catch (error) {
                console.warn("Ignoring invalid local map draft", error);
            }
        }
        history.push(structuredClone(serverState));
        if (serializeState(initialState) !== serializeState(serverState)) history.push(structuredClone(initialState));
        historyIndex = history.length - 1;
        lastSerialized = serializeState(initialState);
        updateCommandState("Editor ready · drag markers to reposition");

        setInterval(() => {
            if (!applyingHistory) pushHistory(captureState());
        }, 700);
    }

    const initializationTimer = setInterval(() => {
        initializeEnhancements();
        if (initialized) clearInterval(initializationTimer);
    }, 250);
})();
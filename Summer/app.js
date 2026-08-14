(() => {
    "use strict";

    const metadata = {
        "Around the Mountain": { difficulty: "more", difficulties: ["easier", "more"], type: "XC", uses: ["Bike", "Hike"], direction: "one-way", description: "A signature one-way cross-country route wrapping around the mountain with broad views and varied terrain." },
        "Bogus Creek": { difficulty: "easier", type: "XC", uses: ["Bike", "Hike"], description: "A lower-mountain cross-country trail near the Morning Star area." },
        "Brewer's Byway": { difficulty: "easier", type: "XC", uses: ["Bike", "Hike"], description: "A flowing cross-country connection through the central trail network." },
        "Brewer's Cut Off": { difficulty: "more", type: "XC", uses: ["Bike", "Hike"], description: "A more difficult shortcut connecting into the Brewer's trail network." },
        "Deer Point Trail": { difficulty: "more", type: "XC", uses: ["Bike", "Hike"], description: "A long cross-country descent and traverse on the east side of the mountain." },
        "Elk Meadows": { difficulty: "easier", type: "XC", uses: ["Bike", "Hike"], description: "An easier cross-country trail traversing the upper mountain." },
        "Face": { difficulty: "more", type: "XC", uses: ["Bike", "Hike"], description: "A more difficult cross-country line through the upper central mountain." },
        "Packing Trail": { difficulty: "most", type: "XC", uses: ["Bike", "Hike"], description: "A technical cross-country trail near Shafer Butte." },
        "Shindig": { difficulty: "most", type: "XC", uses: ["Bike", "Hike"], description: "A most-difficult cross-country trail with technical terrain." },
        "Sunshine": { difficulty: "easier", type: "XC", uses: ["Bike", "Hike"], description: "An easier cross-country trail in the Morning Star zone." },
        "Tempest": { difficulty: "most", type: "XC", uses: ["Bike", "Hike"], description: "A most-difficult technical cross-country trail on the west side." },
        "Return Road": { difficulty: "easier", type: "Road", uses: ["Bike", "Hike"], description: "A 1.8-mile return road connecting the lower mountain back toward the base area." }
    };

    const state = {
        map: null,
        imageBounds: null,
        config: null,
        routes: [],
        trails: [],
        markers: new Map(),
        selectedName: null,
        activeFilter: "all",
        search: "",
        activeRoute: null,
        animationFrame: null
    };

    const elements = {
        panel: document.getElementById("trailPanel"),
        list: document.getElementById("trailList"),
        count: document.getElementById("trailCount"),
        search: document.getElementById("trailSearch"),
        traceButton: document.getElementById("traceRouteButton"),
        status: document.getElementById("mapStatus"),
        guide: document.getElementById("mapGuide"),
        scrim: document.getElementById("drawerScrim")
    };

    const difficultyLabels = { easier: "Easier", more: "More difficult", most: "Most difficult", unclassified: "Map feature" };

    const featureIcons = {
        Lift: { icons: ["cable-car"], label: "Chair lift" },
        Lodge: { icons: ["house"], label: "Lodge" },
        Road: { icons: ["route"], label: "Road" },
        Junction: { icons: ["signpost"], label: "Trail junction" },
        Trail: { icons: ["mountain"], label: "Trail or mountain feature" }
    };

    function getTravelInfo(trail) {
        if (trail.type !== "XC" && trail.type !== "DH") return featureIcons[trail.type] || featureIcons.Trail;

        const icons = [];
        if (trail.uses.includes("Bike")) icons.push("bike");
        if (trail.uses.includes("Hike")) icons.push("footprints");
        icons.push(trail.type === "DH" ? "arrow-down" : trail.direction === "one-way" ? "arrow-right" : "arrow-up-down");

        const travelers = trail.uses.length ? trail.uses.join(" + ") : "Trail";
        const direction = trail.type === "DH" ? "Downhill only" : trail.direction === "one-way" ? "One way" : "Uphill + downhill";
        return { icons, label: `${travelers} · ${direction}` };
    }

    function getDifficultyLabel(trail) {
        return (trail.difficulties || [trail.difficulty]).map(difficulty => difficultyLabels[difficulty]).join(" + ");
    }

    function pointToLatLng(point) {
        return [state.config.imageHeight - point.y, point.x];
    }

    function inferMetadata(name) {
        if (metadata[name]) return metadata[name];
        const lowerName = name.toLowerCase();
        const isLift = lowerName.includes("lift");
        const isLodge = lowerName.includes("lodge");
        const isRoad = lowerName.includes("road") || lowerName.startsWith("highway");
        const isJunction = lowerName.includes("junction") || lowerName.includes("connector");
        return {
            difficulty: "unclassified",
            type: isLift ? "Lift" : isRoad ? "Road" : isLodge ? "Lodge" : isJunction ? "Junction" : "Trail",
            uses: [],
            description: isLift ? "Lift location shown on the official summer map." : isRoad ? "Road shown on the official summer map." : isLodge ? "Lodge and visitor facility shown on the official summer map." : "A named location on the Bogus Basin summer trail map."
        };
    }

    function buildTrails(locations) {
        const grouped = new Map();
        locations.filter(location => location.enabled !== false).forEach(location => {
            if (!grouped.has(location.name)) grouped.set(location.name, []);
            grouped.get(location.name).push(location);
        });
        return [...grouped.entries()].map(([name, points]) => ({ name, points, ...inferMetadata(name) })).sort((left, right) => left.name.localeCompare(right.name));
    }

    function markerIcon(selected = false) {
        const size = selected ? 24 : 14;
        return L.divIcon({
            className: `location-marker${selected ? " selected" : ""}`,
            html: '<span class="location-marker-dot"></span>',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
        });
    }

    function createMarkers() {
        state.trails.forEach(trail => {
            const markers = trail.points.map(point => L.marker(pointToLatLng(point), { icon: markerIcon() })
                .bindTooltip(trail.name, { direction: "top", className: "trail-tooltip", offset: [0, -7] })
                .on("click", () => selectTrail(trail.name)));
            state.markers.set(trail.name, markers);
        });
    }

    function renderTrailList() {
        const term = state.search.trim().toLowerCase();
        const visible = state.trails.filter(trail => {
            const matchesSearch = !term || trail.name.toLowerCase().includes(term) || trail.type.toLowerCase().includes(term);
            const matchesDifficulty = state.activeFilter === "all" || (trail.difficulties || [trail.difficulty]).includes(state.activeFilter);
            return matchesSearch && matchesDifficulty;
        });

        elements.list.replaceChildren();
        elements.count.textContent = `${visible.length} ${visible.length === 1 ? "result" : "results"}`;

        if (!visible.length) {
            const empty = document.createElement("p");
            empty.className = "empty-results";
            empty.textContent = "No mapped trails or places match those filters.";
            elements.list.appendChild(empty);
            return;
        }

        visible.forEach(trail => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = `trail-row${state.selectedName === trail.name ? " active" : ""}`;

            const travelInfo = getTravelInfo(trail);
            const icon = document.createElement("span");
            const isRatedTrail = trail.difficulty !== "unclassified";
            icon.className = `trail-row-icon ${isRatedTrail ? "rating-icons" : trail.type.toLowerCase()}`;
            icon.setAttribute("aria-label", isRatedTrail ? `${getDifficultyLabel(trail)}. ${travelInfo.label}` : travelInfo.label);
            icon.title = icon.getAttribute("aria-label");
            if (isRatedTrail) {
                const ratingClasses = { easier: "circle", more: "square", most: "diamond" };
                (trail.difficulties || [trail.difficulty]).forEach(difficulty => {
                    const rating = document.createElement("span");
                    rating.className = `rating-symbol ${ratingClasses[difficulty]}`;
                    rating.setAttribute("aria-hidden", "true");
                    icon.appendChild(rating);
                });
            } else {
                travelInfo.icons.forEach(iconName => {
                    const iconElement = document.createElement("i");
                    iconElement.dataset.lucide = iconName;
                    iconElement.setAttribute("aria-hidden", "true");
                    icon.appendChild(iconElement);
                });
            }

            const copy = document.createElement("span");
            copy.className = "trail-row-copy";
            const name = document.createElement("span");
            name.className = "trail-row-name";
            name.textContent = trail.name;
            const meta = document.createElement("span");
            meta.className = "trail-row-meta";
            meta.textContent = trail.difficulty === "unclassified"
                ? travelInfo.label
                : `${getDifficultyLabel(trail)} · ${travelInfo.label}`;
            copy.append(name, meta);

            button.append(icon, copy);
            button.addEventListener("click", () => selectTrail(trail.name));
            elements.list.appendChild(button);
        });
        lucide.createIcons({ attrs: { "stroke-width": 2 } });
    }

    function setSelectedMarkers(name) {
        state.markers.forEach((markers, markerName) => markers.forEach(marker => {
            if (markerName === name) {
                marker.setIcon(markerIcon(true));
                if (!state.map.hasLayer(marker)) marker.addTo(state.map);
            } else if (state.map.hasLayer(marker)) {
                state.map.removeLayer(marker);
            }
        }));
    }

    function fitTrail(trail, maxZoom = 0.35) {
        const points = trail.points.map(pointToLatLng);
        const route = state.routes.find(candidate => candidate.name === trail.name);
        if (route) points.push(...route.waypoints.map(pointToLatLng));
        const bounds = L.latLngBounds(points);
        if (matchMedia("(max-width: 760px)").matches) {
            const portraitZoom = Math.min(maxZoom, state.map.getBoundsZoom(bounds.pad(.2)) + 1);
            state.map.flyTo(bounds.getCenter(), portraitZoom, { animate: true, duration: .55 });
        } else {
            state.map.fitBounds(bounds.pad(.35), { animate: true, duration: .55, maxZoom });
        }
    }

    function selectTrail(name) {
        const trail = state.trails.find(candidate => candidate.name === name);
        if (!trail) return;
        stopRouteAnimation();
        state.selectedName = name;
        setSelectedMarkers(name);
        renderTrailList();
        updateTraceButton(trail);
        fitTrail(trail);
        closeDrawer();
        elements.status.textContent = `${trail.name} selected`;
    }

    function updateTraceButton(trail) {
        const hasRoute = state.routes.some(route => route.name === trail.name);
        elements.traceButton.hidden = !hasRoute;
        const isActive = state.activeRoute?.name === trail.name;
        elements.traceButton.classList.toggle("route-active", isActive);
        elements.traceButton.setAttribute("aria-label", isActive ? `Stop tracing ${trail.name}` : `Trace ${trail.name}`);
        elements.traceButton.title = isActive ? `Stop tracing ${trail.name}` : `Trace ${trail.name}`;
    }

    function stopRouteAnimation() {
        if (state.animationFrame) cancelAnimationFrame(state.animationFrame);
        state.animationFrame = null;
        if (state.activeRoute?.layer) state.map.removeLayer(state.activeRoute.layer);
        state.activeRoute = null;
    }

    function traceSelectedRoute() {
        const route = state.routes.find(candidate => candidate.name === state.selectedName);
        if (!route) return;
        if (state.activeRoute?.name === route.name) {
            stopRouteAnimation();
            updateTraceButton(state.trails.find(trail => trail.name === state.selectedName));
            elements.status.textContent = "Route trace stopped";
            return;
        }
        stopRouteAnimation();
        const points = route.waypoints.map(pointToLatLng);
        const layer = L.polyline([], { color: route.color || "#147bb8", weight: 6, opacity: .95, lineCap: "round", lineJoin: "round" }).addTo(state.map);
        state.activeRoute = { name: route.name, layer };
        state.map.fitBounds(L.latLngBounds(points).pad(.12), { animate: true, duration: .6 });
        updateTraceButton(state.trails.find(trail => trail.name === state.selectedName));
        elements.status.textContent = `Tracing ${route.name}`;

        if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
            layer.setLatLngs(points);
            return;
        }

        const startedAt = performance.now();
        const duration = Math.min(5200, Math.max(2400, points.length * 48));
        const animate = now => {
            if (!state.activeRoute || state.activeRoute.layer !== layer) return;
            const progress = Math.min(1, (now - startedAt) / duration);
            const exactIndex = progress * (points.length - 1);
            const index = Math.floor(exactIndex);
            const rendered = points.slice(0, index + 1);
            if (index < points.length - 1) {
                const fraction = exactIndex - index;
                rendered.push([
                    points[index].lat + (points[index + 1].lat - points[index].lat) * fraction,
                    points[index].lng + (points[index + 1].lng - points[index].lng) * fraction
                ]);
            }
            layer.setLatLngs(rendered);
            if (progress < 1) state.animationFrame = requestAnimationFrame(animate);
            else {
                state.animationFrame = null;
                elements.status.textContent = `${route.name} route shown`;
            }
        };
        state.animationFrame = requestAnimationFrame(animate);
    }

    function resetView() {
        stopRouteAnimation();
        state.selectedName = null;
        setSelectedMarkers(null);
        elements.traceButton.hidden = true;
        state.map.fitBounds(state.imageBounds, { animate: true, duration: .6 });
        elements.status.textContent = "Showing the full summer trail map";
        renderTrailList();
    }

    function openDrawer() {
        elements.panel.classList.add("open");
        elements.panel.inert = false;
        elements.panel.removeAttribute("aria-hidden");
        elements.scrim.hidden = false;
    }

    function closeDrawer() {
        elements.panel.classList.remove("open");
        elements.scrim.hidden = true;
        if (matchMedia("(max-width: 760px)").matches) {
            elements.panel.inert = true;
            elements.panel.setAttribute("aria-hidden", "true");
        }
    }

    function bindEvents() {
        elements.search.addEventListener("input", event => { state.search = event.target.value; renderTrailList(); });
        document.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => {
            state.activeFilter = button.dataset.filter;
            document.querySelectorAll("[data-filter]").forEach(item => item.classList.toggle("active", item === button));
            renderTrailList();
        }));
        document.getElementById("clearFiltersButton").addEventListener("click", () => {
            state.search = "";
            state.activeFilter = "all";
            elements.search.value = "";
            document.querySelectorAll("[data-filter]").forEach(button => button.classList.toggle("active", button.dataset.filter === "all"));
            renderTrailList();
        });
        document.getElementById("openTrailsButton").addEventListener("click", openDrawer);
        document.getElementById("closeTrailsButton").addEventListener("click", closeDrawer);
        elements.scrim.addEventListener("click", closeDrawer);
        document.getElementById("resetViewButton").addEventListener("click", resetView);
        document.getElementById("zoomInButton").addEventListener("click", () => state.map.zoomIn());
        document.getElementById("zoomOutButton").addEventListener("click", () => state.map.zoomOut());
        document.getElementById("legendButton").addEventListener("click", () => { elements.guide.hidden = !elements.guide.hidden; });
        document.getElementById("closeLegendButton").addEventListener("click", () => { elements.guide.hidden = true; });
        elements.traceButton.addEventListener("click", traceSelectedRoute);
    }

    async function initialize() {
        try {
            const cacheBuster = Date.now();
            const [configResponse, routesResponse] = await Promise.all([
                fetch(`SummerBB.json?v=${cacheBuster}`),
                fetch(`routes.json?v=${cacheBuster}`)
            ]);
            if (!configResponse.ok) throw new Error("Trail location data could not be loaded.");
            state.config = await configResponse.json();
            state.routes = routesResponse.ok ? (await routesResponse.json()).routes || [] : [];
            state.trails = buildTrails(state.config.locations || []);
            state.imageBounds = [[0, 0], [state.config.imageHeight, state.config.imageWidth]];

            state.map = L.map("trailMap", {
                crs: L.CRS.Simple,
                zoomControl: false,
                attributionControl: false,
                minZoom: -2.5,
                maxZoom: 2,
                zoomSnap: .25,
                wheelPxPerZoomLevel: 90,
                maxBounds: L.latLngBounds(state.imageBounds).pad(.25),
                maxBoundsViscosity: .72
            });
            L.imageOverlay(state.config.mapImageSrc || "trail_map.png", state.imageBounds, { interactive: false }).addTo(state.map);
            state.map.fitBounds(state.imageBounds);
            createMarkers();
            bindEvents();
            renderTrailList();
            if (matchMedia("(max-width: 760px)").matches) closeDrawer();
            elements.status.textContent = `${state.trails.length} mapped trails and places`;
            lucide.createIcons({ attrs: { "stroke-width": 2 } });
        } catch (error) {
            console.error(error);
            elements.status.textContent = error.message || "The trail map could not be loaded.";
        }
    }

    initialize();
})();
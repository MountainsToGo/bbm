(() => {
    'use strict';

    let sourceLocations = [];
    let activeCategory = 'all';
    const visitProgress = new Map();
    let syncCategoryControl = () => {};

    const categoryPredicates = {
        all: () => true,
        lifts: location => location.type === 'chairlift' || location.type === 'magic-carpet',
        places: location => Boolean(location.type) && location.type !== 'chairlift' && location.type !== 'magic-carpet',
        lodges: location => location.type === 'lodge' || location.type === 'condominium',
        bases: location => location.type === 'base-area',
        landmarks: location => location.type === 'summit' || location.type === 'mountain-landmark',
        activities: location => location.type === 'race-training' || location.type === 'food-truck' || location.type === 'tubing',
        runs: location => Boolean(location.difficulty),
        easier: location => location.difficulty === 'easier',
        more: location => location.difficulty === 'more',
        most: location => location.difficulty === 'most',
        double: location => location.difficulty === 'double'
    };

    const difficultyLabels = {
        easier: 'Green',
        more: 'Blue',
        most: 'Diamond',
        double: 'Double Diamond'
    };

    const locationTypes = {
        chairlift: { label: 'Chairlift', icon: 'cable-car' },
        'magic-carpet': { label: 'Magic carpet conveyor', icon: 'chevrons-up' },
        condominium: { label: 'Condominiums', icon: 'building-2' },
        lodge: { label: 'Lodge', icon: 'house' },
        'race-training': { label: 'Ski racing training center', icon: 'flag-triangle-right' },
        'food-truck': { label: 'Food truck', icon: 'truck' },
        tubing: { label: 'Tubing hill', icon: 'circle-dot' },
        summit: { label: 'Mountain summit', icon: 'mountain-snow' },
        'base-area': { label: 'Base area and meeting point', icon: 'map-pin' },
        'mountain-landmark': { label: 'Mountain landmark', icon: 'mountain' }
    };

    function difficultyIcon(location) {
        if (!location.difficulty) return '';
        const label = difficultyLabels[location.difficulty];
        return `<span class="difficulty-icon ${location.difficulty}" aria-label="${label}" title="${label}"></span>`;
    }

    function locationIcon(location) {
        if (location.difficulty) return difficultyIcon(location);
        const type = locationTypes[location.type];
        if (!type) return '';
        const liftNumber = location.type === 'chairlift' ? location.name.match(/#(\d)/)?.[1] : null;
        return `<span class="location-type-icon ${location.type}" aria-label="${type.label}" title="${type.label}"><i data-lucide="${type.icon}" aria-hidden="true"></i>${liftNumber ? `<span class="lift-number">${liftNumber}</span>` : ''}</span>`;
    }

    function rememberProgress() {
        locations.forEach((location, index) => {
            visitProgress.set(location.name, {
                completed: completedIndices.has(index),
                skipped: skippedIndices.has(index),
                missed: missedIndices.has(index)
            });
        });
    }

    function restoreProgress() {
        completedIndices = new Set();
        skippedIndices = new Set();
        missedIndices = new Set();
        locations.forEach((location, index) => {
            const progress = visitProgress.get(location.name);
            if (progress?.completed) completedIndices.add(index);
            if (progress?.skipped) skippedIndices.add(index);
            if (progress?.missed) missedIndices.add(index);
        });
    }

    function updateAccuracy() {
        const attempts = correctCount + incorrectCount;
        const value = attempts ? Math.round((correctCount / attempts) * 100) : 0;
        const accuracy = document.querySelector('#accuracyCount');
        if (accuracy) accuracy.textContent = `${value}%`;
    }

    function updateQuizCopy() {
        const instruction = document.querySelector('.instruction');
        const targetLabel = document.querySelector('.current-name .label');
        if (!instruction || !targetLabel) return;

        document.body.dataset.experienceMode = 'quiz';
        const hasTarget = currentIndex < locations.length;
        targetLabel.textContent = hasTarget ? 'Find this location' : 'Progress';
        instruction.innerHTML = hasTarget
            ? '<strong>Click the map</strong> where <span id="instructionName"></span> is located.'
            : '<span id="instructionName"></span>';
        instruction.querySelector('#instructionName').textContent = hasTarget ? locations[currentIndex].name
            : !locations.length ? 'No locations in this category.'
            : completedIndices.size === locations.length ? 'All locations learned' : 'Select a skipped location to retry.';
    }

    function setCategory(category) {
        if (!categoryPredicates[category] || !sourceLocations.length) return;
        if (category === activeCategory) return;
        rememberProgress();
        const currentName = locations[currentIndex]?.name;
        activeCategory = category;
        locations = sourceLocations.filter(categoryPredicates[category]);
        displayOrder = locations.map((_, index) => index);
        restoreProgress();
        currentIndex = locations.findIndex(location => location.name === currentName);
        if (currentIndex < 0 || completedIndices.has(currentIndex) || skippedIndices.has(currentIndex)) {
            currentIndex = locations.findIndex((_, index) => !completedIndices.has(index) && !skippedIndices.has(index));
        }
        if (currentIndex < 0) currentIndex = locations.length;
        highlightedLocationIndex = null;
        clickMarkers = [];
        celebrationActive = false;
        document.querySelector('#locationSearch').value = '';
        syncCategoryControl();
        updateUI();
        filterLocations();
        if (autoZoomEnabled && currentIndex < locations.length) zoomToLocation(currentIndex);
        drawMap();
    }

    function decorateToolbar() {
        const controls = document.querySelector('.map-controls');
        if (!controls) return;

        const buttons = [...controls.querySelectorAll('button')];
        const findById = id => buttons.find(button => button.id === id);
        const findByText = text => buttons.find(button => button.textContent.includes(text));
        const makeGroup = (label, groupButtons) => {
            const group = document.createElement('div');
            group.className = 'tool-group';
            const groupLabel = document.createElement('span');
            groupLabel.className = 'tool-group-label';
            groupLabel.textContent = label;
            group.append(groupLabel, ...groupButtons.filter(Boolean));
            return group;
        };

        const studyGroup = makeGroup('Study', [findById('labelsBtn'), document.querySelector('#hideMapTextBtn'), findById('routeBtn')]);
        const zoomGroup = makeGroup('Map', [findById('autoZoomBtn'), findByText('Zoom In'), findByText('Zoom Out'), findByText('Reset Map')]);

        const resources = document.createElement('details');
        resources.className = 'resources-menu';
        const summary = document.createElement('summary');
        summary.textContent = 'Resources';
        const panel = document.createElement('div');
        panel.className = 'resources-panel';
        [findByText('Tour Guide'), findByText('User Guide'), findByText('Know the Code')].filter(Boolean).forEach(button => panel.appendChild(button));
        resources.append(summary, panel);
        document.addEventListener('pointerdown', event => {
            if (resources.open && !resources.contains(event.target)) {
                resources.open = false;
            }
        });

        controls.replaceChildren(studyGroup, zoomGroup, resources);

        const labelButton = findById('labelsBtn');
        const autoZoomButton = findById('autoZoomBtn');
        const routeButton = findById('routeBtn');
        if (labelButton) labelButton.textContent = 'Labels';
        if (autoZoomButton) autoZoomButton.textContent = 'Auto zoom';
        if (routeButton) routeButton.textContent = 'Tour route';
        const tourGuideButton = findByText('Tour Guide');
        const userGuideButton = findByText('User Guide');
        const codeButton = findByText('Know the Code');
        if (tourGuideButton) tourGuideButton.textContent = 'Tour guide';
        if (userGuideButton) userGuideButton.textContent = 'User guide';
        if (codeButton) codeButton.textContent = 'Know the code';
        const zoomInButton = findByText('Zoom In');
        const zoomOutButton = findByText('Zoom Out');
        const resetButton = findByText('Reset Map');
        if (zoomInButton) {
            zoomInButton.textContent = '+';
            zoomInButton.title = 'Zoom in';
            zoomInButton.setAttribute('aria-label', 'Zoom in');
        }
        if (zoomOutButton) {
            zoomOutButton.textContent = '−';
            zoomOutButton.title = 'Zoom out';
            zoomOutButton.setAttribute('aria-label', 'Zoom out');
        }
        if (resetButton) {
            resetButton.textContent = '↺';
            resetButton.title = 'Reset map zoom';
            resetButton.setAttribute('aria-label', 'Reset map zoom');
        }
    }

    function buildNavigation() {
        const search = document.querySelector('.location-search');
        if (!search) return;

        const categoryOptions = [
            ['all', 'Full mountain'],
            ['lifts', 'Lifts & carpets'],
            ['runs', 'Runs'],
            ['easier', '🟢 Green runs'],
            ['more', '🟦 Blue runs'],
            ['most', '◆ Diamond runs'],
            ['double', '◆◆ Double Diamond runs'],
            ['places', 'Places & facilities'],
            ['lodges', 'Lodges & condominiums'],
            ['bases', 'Base areas'],
            ['landmarks', 'Summits & landmarks'],
            ['activities', 'Activities & services']
        ];
        const field = document.createElement('div');
        field.className = 'category-field';
        field.innerHTML = `
            <span id="categoryLabel">Show</span>
            <div class="category-picker">
                <button type="button" id="categorySelect" aria-labelledby="categoryLabel categorySelectValue" aria-haspopup="listbox" aria-expanded="false">
                    <span id="categorySelectValue">Full mountain</span>
                    <span class="category-chevron" aria-hidden="true">⌄</span>
                </button>
                <div id="categoryMenu" class="category-menu" role="listbox" aria-labelledby="categoryLabel" hidden>
                    ${categoryOptions.map(([value, label]) => `<button type="button" class="category-option" role="option" data-value="${value}">${label}</button>`).join('')}
                </div>
            </div>`;
        search.insertAdjacentElement('afterend', field);

        const picker = field.querySelector('.category-picker');
        const select = field.querySelector('#categorySelect');
        const valueLabel = field.querySelector('#categorySelectValue');
        const menu = field.querySelector('#categoryMenu');
        const options = [...field.querySelectorAll('.category-option')];
        const setMenuOpen = open => {
            if (open) {
                menu.hidden = false;
                menu.classList.remove('opens-up');
                const pickerBounds = picker.getBoundingClientRect();
                const sidebarBounds = picker.closest('.sidebar').getBoundingClientRect();
                const spaceAbove = pickerBounds.top - sidebarBounds.top;
                const spaceBelow = sidebarBounds.bottom - pickerBounds.bottom;
                const opensUp = spaceBelow < 120 && spaceAbove > spaceBelow;
                menu.classList.toggle('opens-up', opensUp);
                const availableSpace = opensUp ? spaceAbove : spaceBelow;
                menu.style.maxHeight = `${Math.max(120, Math.min(360, availableSpace - 8))}px`;
            } else {
                menu.hidden = true;
            }
            select.setAttribute('aria-expanded', String(open));
        };
        syncCategoryControl = () => {
            const selected = categoryOptions.find(([value]) => value === activeCategory) || categoryOptions[0];
            valueLabel.textContent = selected[1];
            options.forEach(option => option.setAttribute('aria-selected', String(option.dataset.value === activeCategory)));
        };
        select.addEventListener('click', () => {
            setMenuOpen(menu.hidden);
        });
        options.forEach(option => option.addEventListener('click', () => {
            setMenuOpen(false);
            setCategory(option.dataset.value);
            select.focus();
        }));
        field.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
                select.focus();
            }
        });
        document.addEventListener('pointerdown', event => {
            if (!picker.contains(event.target)) setMenuOpen(false);
        });
        syncCategoryControl();
    }

    function buildTaskRow() {
        const sidebar = document.querySelector('.sidebar');
        const mapArea = document.querySelector('.map-area');
        const currentName = document.querySelector('.current-name');
        const instruction = document.querySelector('.instruction');
        if (!sidebar || !mapArea || !currentName || !instruction) return;

        currentName.setAttribute('role', 'status');
        currentName.setAttribute('aria-live', 'polite');
        const taskRow = document.createElement('div');
        taskRow.className = 'task-row';
        mapArea.insertBefore(taskRow, mapArea.firstChild);
        taskRow.append(currentName, instruction);

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'sidebar-toggle';
        toggle.textContent = '☰';
        toggle.title = 'Open progress and locations';
        toggle.setAttribute('aria-label', 'Open progress and locations');
        toggle.setAttribute('aria-expanded', 'false');
        sidebar.id = sidebar.id || 'progressSidebar';
        toggle.setAttribute('aria-controls', sidebar.id);
        const drawerMedia = window.matchMedia('(max-width: 900px)');
        const syncDrawer = () => {
            const open = sidebar.classList.contains('is-open');
            sidebar.inert = drawerMedia.matches && !open;
            if (drawerMedia.matches && open) {
                sidebar.setAttribute('role', 'dialog');
                sidebar.setAttribute('aria-modal', 'true');
                sidebar.setAttribute('aria-label', 'Progress and locations');
            } else {
                sidebar.removeAttribute('role');
                sidebar.removeAttribute('aria-modal');
                sidebar.removeAttribute('aria-label');
            }
        };
        const setDrawerOpen = open => {
            sidebar.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.textContent = open ? '×' : '☰';
            toggle.title = open ? 'Close progress and locations' : 'Open progress and locations';
            toggle.setAttribute('aria-label', open ? 'Close progress and locations' : 'Open progress and locations');
            syncDrawer();
            if (drawerMedia.matches) {
                if (open) closeButton.focus();
                else toggle.focus();
            }
        };
        toggle.addEventListener('click', () => setDrawerOpen(!sidebar.classList.contains('is-open')));
        taskRow.appendChild(toggle);

        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'drawer-close';
        closeButton.textContent = '×';
        closeButton.setAttribute('aria-label', 'Close progress and locations');
        closeButton.addEventListener('click', () => {
            setDrawerOpen(false);
            toggle.focus();
        });
        sidebar.insertBefore(closeButton, sidebar.firstChild);

        document.addEventListener('keydown', event => {
            if (!drawerMedia.matches || !sidebar.classList.contains('is-open')) return;
            if (event.key === 'Escape') {
                if (event.defaultPrevented) return;
                setDrawerOpen(false);
            } else if (event.key === 'Tab') {
                const controls = [...sidebar.querySelectorAll('button, input, select, a[href], [tabindex]')]
                    .filter(control => !control.disabled && control.tabIndex >= 0 && control.getClientRects().length);
                const first = controls[0];
                const last = controls[controls.length - 1];
                if (event.shiftKey && (document.activeElement === first || !sidebar.contains(document.activeElement))) {
                    event.preventDefault();
                    last?.focus();
                } else if (!event.shiftKey && (document.activeElement === last || !sidebar.contains(document.activeElement))) {
                    event.preventDefault();
                    first?.focus();
                }
            }
        });
        drawerMedia.addEventListener('change', () => {
            sidebar.classList.remove('is-open');
            setDrawerOpen(false);
        });
        syncDrawer();

        const listHeading = sidebar.querySelector('h2');
        if (listHeading) {
            const header = document.createElement('div');
            header.className = 'sidebar-header';
            listHeading.parentNode.insertBefore(header, listHeading);
            header.appendChild(listHeading);
        }
    }

    function addAccuracyStat() {
        const stats = document.querySelector('.stats');
        const remainingBox = document.querySelector('#remainingCount')?.closest('.stat-box');
        if (!stats || !remainingBox) return;
        const accuracyBox = remainingBox.cloneNode(true);
        accuracyBox.classList.add('accuracy-box');
        accuracyBox.querySelector('.stat-value').id = 'accuracyCount';
        accuracyBox.querySelector('.stat-value').textContent = '0%';
        accuracyBox.querySelector('.stat-label').textContent = 'Accuracy';
        stats.appendChild(accuracyBox);
    }

    function improveSemantics() {
        const search = document.querySelector('#locationSearch');
        if (search) {
            search.setAttribute('aria-label', 'Search locations');
        }

        const canvasElement = document.querySelector('#mapCanvas');
        if (canvasElement) {
            canvasElement.setAttribute('role', 'img');
            canvasElement.setAttribute('aria-label', 'Interactive Bogus Basin trail map. Select a location by clicking the map.');
        }

        const mapStatus = [...document.querySelectorAll('.map-area > div')].find(element => element.textContent.includes('Zoom Level:'));
        if (mapStatus) {
            mapStatus.classList.add('map-status');
            mapStatus.innerHTML = `<strong>Zoom</strong> <span id="zoomLevel">100%</span><span aria-hidden="true">·</span><strong>Auto zoom</strong> <span id="autoZoomStatus">OFF</span><span class="tip-copy">Ctrl + scroll to zoom</span>`;
        }

        document.querySelectorAll('.feedback-popup').forEach(popup => popup.setAttribute('role', 'status'));
    }

    function installStateHooks() {
        const originalUpdateList = updateList;
        updateList = function modernizedUpdateList() {
            originalUpdateList();
            let iconsChanged = false;
            document.querySelectorAll('#namesList .name-list-item').forEach(item => {
                const locationIndex = Number(item.dataset.locationIndex);
                const location = locations[locationIndex];
                if (!location) return;

                const prefix = item.classList.contains('completed') ? '✓' : item.classList.contains('current') ? '→' : item.classList.contains('pending') && skippedIndices.has(locationIndex) ? '⏭️' : '';
                if (item.dataset.decoratedName !== location.name) {
                    const icon = locationIcon(location);
                    const copy = document.createElement('span');
                    copy.className = 'name-list-item-copy';
                    const prefixNode = document.createElement('span');
                    prefixNode.className = 'name-list-item-prefix';
                    copy.appendChild(prefixNode);
                    const name = document.createElement('span');
                    name.className = 'name-list-item-name';
                    name.textContent = location.name;
                    copy.appendChild(name);
                    item.replaceChildren();
                    if (icon) {
                        const iconWrapper = document.createElement('span');
                        iconWrapper.className = 'name-list-item-icon';
                        iconWrapper.innerHTML = icon;
                        item.appendChild(iconWrapper);
                        iconsChanged = true;
                    }
                    item.appendChild(copy);
                    item.dataset.decoratedName = location.name;
                }
                const prefixNode = item.querySelector('.name-list-item-prefix');
                if (prefixNode.textContent !== prefix) prefixNode.textContent = prefix;
                prefixNode.hidden = !prefix;
            });
            if (iconsChanged && window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 2, width: 16, height: 16 } });
        };

        const originalUpdateUI = updateUI;
        updateUI = function modernizedUpdateUI() {
            originalUpdateUI();
            updateAccuracy();
            updateQuizCopy();
            rememberProgress();
        };

        const originalInitializeMode = initializeMode;
        initializeMode = function modernizedInitializeMode() {
            visitProgress.clear();
            highlightedLocationIndex = null;
            document.querySelector('#locationSearch').value = '';
            originalInitializeMode();
            if (!sourceLocations.length) sourceLocations = [...locations];
            syncCategoryControl();
            filterLocations();
        };

        resetPractice = function modernizedResetPractice() {
            if (confirm('Start over from the beginning?')) {
                initializeMode();
            }
        };
        window.addEventListener('pageshow', event => {
            if (event.persisted) initializeMode();
        });
    }

    function initializeModernUI() {
        buildNavigation();
        buildTaskRow();
        addAccuracyStat();
        decorateToolbar();
        improveSemantics();
        installStateHooks();
    }

    initializeModernUI();
})();

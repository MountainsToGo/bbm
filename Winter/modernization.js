(() => {
    'use strict';

    const STORAGE_KEY = 'bogus-basin-learning-state-v2';
    let sourceLocations = [];
    let activeCategory = 'all';
    let firstInitialization = true;
    let suppressPersistence = true;
    let syncCategoryControl = () => {};

    const categoryPredicates = {
        all: () => true,
        lifts: location => location.type === 'chairlift' || location.type === 'magic-carpet',
        lodges: location => Boolean(location.type) && location.type !== 'chairlift' && location.type !== 'magic-carpet',
        runs: location => Boolean(location.difficulty),
        easier: location => location.difficulty === 'easier',
        more: location => location.difficulty === 'more',
        most: location => location.difficulty === 'most'
    };

    const difficultyLabels = {
        easier: 'Easier',
        more: 'More difficult',
        most: 'Most difficult'
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

    function readSavedState() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
        } catch (error) {
            console.warn('Could not read saved learning state.', error);
            return null;
        }
    }

    function saveState() {
        if (suppressPersistence || !locations.length) return;

        const state = {
            category: activeCategory,
            currentName: currentIndex < locations.length ? locations[currentIndex].name : null,
            completedNames: [...completedIndices].map(index => locations[index]?.name).filter(Boolean),
            skippedNames: [...skippedIndices].map(index => locations[index]?.name).filter(Boolean),
            missedNames: [...missedIndices].map(index => locations[index]?.name).filter(Boolean),
            correctCount,
            incorrectCount,
            streak,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function restoreState() {
        const state = readSavedState();
        if (!state || state.category !== activeCategory) return;

        const indexByName = new Map(locations.map((location, index) => [location.name, index]));
        completedIndices = new Set((state.completedNames || []).map(name => indexByName.get(name)).filter(Number.isInteger));
        skippedIndices = new Set((state.skippedNames || []).map(name => indexByName.get(name)).filter(Number.isInteger));
        missedIndices = new Set((state.missedNames || []).map(name => indexByName.get(name)).filter(Number.isInteger));
        correctCount = Number(state.correctCount) || completedIndices.size;
        incorrectCount = Number(state.incorrectCount) || 0;
        streak = Number(state.streak) || 0;

        if (state.currentName && indexByName.has(state.currentName)) {
            currentIndex = indexByName.get(state.currentName);
        } else if (completedIndices.size === locations.length) {
            currentIndex = locations.length;
        } else {
            currentIndex = locations.findIndex((_, index) => !completedIndices.has(index) && !skippedIndices.has(index));
            if (currentIndex < 0) currentIndex = locations.length;
        }
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
        const name = currentIndex < locations.length ? locations[currentIndex].name : 'All locations learned';
        targetLabel.textContent = 'Find this location';
        instruction.innerHTML = `<strong>Click the map</strong> where “<span id="instructionName">${name}</span>” is located.`;
    }

    function setCategory(category) {
        if (!categoryPredicates[category] || !sourceLocations.length) return;
        activeCategory = category;
        locations = sourceLocations.filter(categoryPredicates[category]);
        localStorage.removeItem(STORAGE_KEY);
        initializeMode();
        updateQuizCopy();
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
        const header = document.querySelector('.header');
        if (!header) return;

        const nav = document.createElement('nav');
        nav.className = 'modern-nav';
        nav.setAttribute('aria-label', 'Location category');
        nav.innerHTML = `
            <label class="visually-hidden" for="categorySelect">Location category</label>
            <select class="visually-hidden" id="categorySelect" tabindex="-1" aria-hidden="true">
                <option value="all">Full mountain</option>
                <option value="lifts">Lifts & carpets</option>
                <option value="runs">Runs</option>
                <option value="easier">Easier runs</option>
                <option value="more">More difficult runs</option>
                <option value="most">Most difficult runs</option>
                <option value="lodges">Places & facilities</option>
            </select>
            <details class="category-menu">
                <summary><span class="category-menu-icon"></span><span class="category-menu-label">Full mountain</span></summary>
                <div class="category-menu-panel">
                    <button type="button" data-category="all">Full mountain</button>
                    <button type="button" data-category="lifts">Lifts & carpets</button>
                    <button type="button" data-category="runs">Runs</button>
                    <button type="button" data-category="easier"><span class="difficulty-icon easier" aria-hidden="true"></span>Easier runs</button>
                    <button type="button" data-category="more"><span class="difficulty-icon more" aria-hidden="true"></span>More difficult runs</button>
                    <button type="button" data-category="most"><span class="difficulty-icon most" aria-hidden="true"></span>Most difficult runs</button>
                    <button type="button" data-category="lodges">Places & facilities</button>
                </div>
            </details>`;
        header.appendChild(nav);

        const select = nav.querySelector('#categorySelect');
        const menu = nav.querySelector('.category-menu');
        const menuIcon = nav.querySelector('.category-menu-icon');
        const menuLabel = nav.querySelector('.category-menu-label');
        syncCategoryControl = () => {
            const selectedOption = select.options[select.selectedIndex];
            menuLabel.textContent = selectedOption.textContent;
            menuIcon.className = `category-menu-icon${difficultyLabels[select.value] ? ` difficulty-icon ${select.value}` : ''}`;
            menu.querySelectorAll('[data-category]').forEach(button => {
                button.classList.toggle('active', button.dataset.category === select.value);
            });
        };
        select.addEventListener('change', event => {
            syncCategoryControl();
            setCategory(event.target.value);
        });
        menu.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
            select.value = button.dataset.category;
            syncCategoryControl();
            select.dispatchEvent(new Event('change'));
            menu.open = false;
        }));
        document.addEventListener('pointerdown', event => {
            if (menu.open && !menu.contains(event.target)) menu.open = false;
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
        const setDrawerOpen = open => {
            sidebar.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.textContent = open ? '×' : '☰';
            toggle.title = open ? 'Close progress and locations' : 'Open progress and locations';
            toggle.setAttribute('aria-label', open ? 'Close progress and locations' : 'Open progress and locations');
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
            if (event.key === 'Escape' && sidebar.classList.contains('is-open')) {
                setDrawerOpen(false);
                toggle.focus();
            }
        });

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
            document.querySelectorAll('#namesList .name-list-item').forEach((item, position) => {
                const location = locations[displayOrder[position]];
                const icon = location ? locationIcon(location) : '';
                if (icon) item.insertAdjacentHTML('afterbegin', icon);
            });
            if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 2, width: 16, height: 16 } });
        };

        const originalUpdateUI = updateUI;
        updateUI = function modernizedUpdateUI() {
            originalUpdateUI();
            updateAccuracy();
            updateQuizCopy();
            saveState();
        };

        const originalInitializeMode = initializeMode;
        initializeMode = function modernizedInitializeMode() {
            suppressPersistence = true;
            originalInitializeMode();
            if (!sourceLocations.length) sourceLocations = [...locations];
            if (firstInitialization) {
                const saved = readSavedState();
                if (saved?.category && categoryPredicates[saved.category] && saved.category !== 'all') {
                    activeCategory = saved.category;
                    locations = sourceLocations.filter(categoryPredicates[activeCategory]);
                    originalInitializeMode();
                }
                restoreState();
                firstInitialization = false;
            }
            suppressPersistence = false;
            originalUpdateUI();
            updateAccuracy();
            updateQuizCopy();
            const categorySelect = document.querySelector('#categorySelect');
            if (categorySelect) categorySelect.value = activeCategory;
            syncCategoryControl();
            saveState();
        };

        resetPractice = function modernizedResetPractice() {
            if (confirm('Start over from the beginning?')) {
                localStorage.removeItem(STORAGE_KEY);
                initializeMode();
            }
        };
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

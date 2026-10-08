const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const test = require('node:test');

const html = fs.readFileSync(path.join(__dirname, 'learn.html'), 'utf8');
const modernization = fs.readFileSync(path.join(__dirname, 'modernization.js'), 'utf8');
const overlays = JSON.parse(fs.readFileSync(path.join(__dirname, 'text_overlays.json'), 'utf8')).overlays;

function functionSource(name) {
    const start = html.indexOf(`        function ${name}(`);
    assert.ok(start >= 0, `Missing function ${name}`);
    return html.slice(start, html.indexOf('\n        }', start) + 10);
}

test('quiz wraps around independently of search and preserves skipped items', () => {
    const search = { value: 'B' };
    const state = {
        locations: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
        displayOrder: [2, 0, 1], currentIndex: 1,
        completedIndices: new Set([1]), skippedIndices: new Set(),
        highlightedLocationIndex: null, autoZoomEnabled: false,
        document: { getElementById: () => search }
    };
    vm.createContext(state);
    vm.runInContext(functionSource('moveToNextLocation') + functionSource('getVisibleLocationIndices'), state);
    assert.deepEqual(Array.from(vm.runInContext('getVisibleLocationIndices()', state)), [1]);
    vm.runInContext('moveToNextLocation()', state);
    assert.equal(state.currentIndex, 2);
    assert.deepEqual(state.displayOrder, [2, 0, 1]);
    search.value = '';
    assert.deepEqual(Array.from(vm.runInContext('getVisibleLocationIndices()', state)), [2, 0, 1]);
    state.skippedIndices.add(0);
    state.completedIndices.add(2);
    vm.runInContext('moveToNextLocation()', state);
    assert.equal(state.currentIndex, 3);
    assert.equal(state.completedIndices.size, 2);
});

test('auto zoom uses rendered dimensions at desktop and mobile widths', () => {
    for (const width of [320, 390, 1000, 1600]) {
        const wrapper = { clientWidth: width, clientHeight: 500 };
        const state = {
            locations: [{ x: 1500, y: 1000 }], canvasScale: 1, zoomLevel: 1,
            canvas: { width: 3131, height: 1999, getBoundingClientRect: () => ({ width: width * 1.5, height: 1999 * width * 1.5 / 3131 }) },
            document: { getElementById: () => wrapper }, applyZoom() {}, drawMap() {}
        };
        vm.createContext(state);
        vm.runInContext(functionSource('zoomToLocation') + 'zoomToLocation(0)', state);
        assert.ok(Math.abs(wrapper.scrollLeft - Math.max(0, 1500 * width * 1.5 / 3131 - width / 2)) < 0.001);
        assert.ok(Math.abs(wrapper.scrollTop - Math.max(0, 1000 * width * 1.5 / 3131 - 250)) < 0.001);
    }
});

test('category changes preserve visit progress without browser storage', () => {
    const locations = [{ name: 'A', difficulty: 'easier' }, { name: 'B', type: 'chairlift' }, { name: 'C', difficulty: 'more' }];
    const state = {
        locations, currentIndex: 1, displayOrder: [0, 1, 2],
        completedIndices: new Set([0]), skippedIndices: new Set([2]), missedIndices: new Set([1]),
        correctCount: 1, incorrectCount: 2, streak: 0, highlightedLocationIndex: null,
        clickMarkers: [], celebrationActive: false, autoZoomEnabled: false,
        document: { querySelector: () => ({ value: '' }) }, updateUI() {}, filterLocations() {}, drawMap() {}
    };
    Object.defineProperty(state, 'localStorage', { get() { throw Error('Storage unavailable'); } });
    vm.createContext(state);
    vm.runInContext(modernization.replace('    initializeModernUI();', '    sourceLocations = [...locations]; globalThis.hooks = { setCategory };'), state);
    state.hooks.setCategory('lifts');
    assert.equal(state.locations.length, 1);
    assert.ok(state.missedIndices.has(0));
    state.completedIndices.add(0);
    state.missedIndices.clear();
    state.correctCount++;
    state.hooks.setCategory('all');
    assert.deepEqual(Array.from(state.completedIndices), [0, 1]);
    assert.deepEqual(Array.from(state.skippedIndices), [2]);
    assert.equal(state.correctCount, 2);
    state.hooks.setCategory('double');
    assert.equal(state.locations.length, 0);
    state.hooks.setCategory('all');
    assert.equal(state.completedIndices.size, 2);
    assert.ok(!modernization.includes('localStorage'));
    assert.ok(!modernization.includes('sessionStorage'));
});

test('rounded opaque masks preserve coverage, rotation and cached reveal behavior', () => {
    const calls = { images: 0, masks: [], rotations: [] };
    const painter = {
        drawImage() { calls.images++; }, save() {}, restore() {}, translate() {},
        rotate(value) { calls.rotations.push(value); }, beginPath() {},
        roundRect(...args) { calls.masks.push(args); }, fill() {}, stroke() {}
    };
    const state = {
        canvas: { width: 3131, height: 1999 }, canvasScale: 1, hideMapText: true,
        revealedOverlays: new Set(), textOverlays: overlays, baseMapKey: '',
        baseMapCanvas: {}, baseMapContext: painter, img: {}, ctx: { drawImage() {} }
    };
    vm.createContext(state);
    vm.runInContext(functionSource('drawBaseMap') + 'drawBaseMap(); drawBaseMap();', state);
    assert.equal(calls.images, 1);
    assert.equal(calls.masks.length, overlays.length);
    assert.equal(painter.fillStyle, '#edf2f4');
    overlays.forEach((mask, index) => {
        const [left, top, width, height, radius] = calls.masks[index];
        assert.equal(width, mask.width + radius * 2);
        assert.equal(height, mask.height + radius * 2);
        assert.equal(left, -mask.width / 2 - radius);
        assert.equal(top, -mask.height / 2 - radius);
        assert.ok(Math.abs(calls.rotations[index] - (mask.rotation || 0) * Math.PI / 180) < 1e-10);
    });
    state.revealedOverlays.add(0);
    vm.runInContext('drawBaseMap()', state);
    assert.equal(calls.images, 2);
    assert.equal(calls.masks.length, overlays.length * 2 - 1);
    state.hideMapText = false;
    vm.runInContext('drawBaseMap()', state);
    assert.equal(calls.images, 3);
    assert.equal(calls.masks.length, overlays.length * 2 - 1);
});

test('all Winter scripts parse', () => {
    for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
    new vm.Script(modernization);
});

test('Edge desktop and mobile regression checks', {
    skip: !process.env.BBM_BROWSER_TOOLS || !process.env.BBM_TEST_URL,
    timeout: 120000
}, async () => {
    const { chromium } = require(path.join(process.env.BBM_BROWSER_TOOLS, 'node_modules/playwright'));
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.addInitScript(() => {
            Object.defineProperty(window, 'localStorage', { get() { throw Error('Storage unavailable'); } });
        });
        const ready = () => page.waitForFunction(() => typeof locations !== 'undefined' && locations.length === 120 && document.querySelectorAll('#namesList button').length === 120);
        const clickTarget = async () => {
            const point = await page.evaluate(() => {
                const bounds = canvas.getBoundingClientRect();
                return { x: bounds.left + locations[currentIndex].x * bounds.width / canvas.width, y: bounds.top + locations[currentIndex].y * bounds.height / canvas.height };
            });
            await page.mouse.click(point.x, point.y);
        };
        const category = async value => {
            await page.locator('#categorySelect').click();
            await page.locator(`.category-option[data-value="${value}"]`).click();
        };
        await page.goto(process.env.BBM_TEST_URL);
        await ready();
        const lastName = await page.evaluate(() => locations[locations.length - 1].name);
        await page.locator('#locationSearch').fill(lastName);
        await page.locator('#namesList button').filter({ hasText: lastName }).click();
        await clickTarget();
        assert.equal(await page.evaluate(() => completedIndices.size), 1);
        assert.equal(await page.evaluate(() => currentIndex), 0);
        assert.ok(!(await page.locator('#currentName').innerText()).includes('Complete'));
        await page.locator('#clearSearchBtn').click();
        await page.evaluate(() => {
            window.originalRow = document.querySelector('#namesList button');
            window.originalIcon = originalRow.querySelector('.name-list-item-icon');
        });
        await clickTarget();
        assert.equal(await page.evaluate(() => originalRow === document.querySelector('#namesList button') && originalIcon === originalRow.querySelector('.name-list-item-icon')), true);
        const completedNames = await page.evaluate(() => [...completedIndices].map(index => locations[index].name).sort());
        await category('lifts');
        await category('all');
        assert.deepEqual(await page.evaluate(() => [...completedIndices].map(index => locations[index].name).sort()), completedNames);
        assert.equal(await page.evaluate(() => correctCount), 2);
        await page.getByRole('button', { name: 'Shuffle', exact: true }).click();
        const shuffled = await page.evaluate(() => [...displayOrder]);
        await page.locator('#locationSearch').fill('B-2');
        await page.locator('#clearSearchBtn').click();
        assert.deepEqual(await page.evaluate(() => [...displayOrder]), shuffled);
        await page.locator('#hideMapTextBtn').click();
        assert.deepEqual(await page.evaluate(() => {
            const mask = textOverlays[0];
            return [...baseMapContext.getImageData(mask.x + mask.width / 2, mask.y + mask.height / 2, 1, 1).data];
        }), [237, 242, 244, 255]);
        assert.equal(await page.evaluate(() => {
            let rebuilds = 0;
            const original = baseMapContext.drawImage;
            baseMapContext.drawImage = function (...args) { rebuilds++; return original.apply(this, args); };
            for (let frame = 0; frame < 60; frame++) drawMap();
            baseMapContext.drawImage = original;
            return rebuilds;
        }), 0);
        await page.screenshot({ path: path.join(process.env.BBM_BROWSER_TOOLS, 'winter-desktop.png'), animations: 'disabled' });
        await page.locator('#autoZoomBtn').click();
        assert.equal(await page.evaluate(() => {
            const bounds = canvas.getBoundingClientRect();
            const target = locations[currentIndex];
            const expected = Math.min(mapWrapper.scrollWidth - mapWrapper.clientWidth, Math.max(0, target.x * bounds.width / canvas.width - mapWrapper.clientWidth / 2));
            return Math.abs(mapWrapper.scrollLeft - expected) <= 2;
        }), true);
        await page.locator('#autoZoomBtn').click();
        await page.locator('#labelsBtn').click();
        assert.equal(await page.evaluate(() => showLabels), true);
        await page.locator('#routeBtn').click();
        await page.waitForFunction(() => routeAnimating && flashPhase === 1 && animationProgress > 0.1);
        await page.locator('#routeBtn').click();
        assert.equal(await page.evaluate(() => routeAnimating), false);
        await page.evaluate(() => {
            skippedIndices = new Set(locations.map((_, index) => index).filter(index => !completedIndices.has(index)));
            moveToNextLocation(); updateUI(); drawMap();
        });
        assert.equal(await page.locator('#currentName').innerText(), 'Review skipped locations');
        await page.reload();
        await ready();
        assert.equal(await page.evaluate(() => completedIndices.size + skippedIndices.size + correctCount + incorrectCount), 0);
        await page.evaluate(() => {
            completedIndices.add(0); correctCount = 1; updateUI();
            window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
        });
        assert.equal(await page.evaluate(() => completedIndices.size + correctCount), 0);
        await page.setViewportSize({ width: 390, height: 844 });
        await page.waitForFunction(() => document.querySelector('.sidebar').inert);
        for (let press = 0; press < 12; press++) {
            await page.keyboard.press('Tab');
            assert.equal(await page.evaluate(() => document.querySelector('.sidebar').contains(document.activeElement)), false);
        }
        await page.locator('.sidebar-toggle').click();
        assert.equal(await page.evaluate(() => document.activeElement.classList.contains('drawer-close')), true);
        await page.keyboard.press('Shift+Tab');
        assert.equal(await page.evaluate(() => document.activeElement === document.querySelector('#namesList button:last-child')), true);
        await page.keyboard.press('Tab');
        assert.equal(await page.evaluate(() => document.activeElement.classList.contains('drawer-close')), true);
        await page.screenshot({ path: path.join(process.env.BBM_BROWSER_TOOLS, 'winter-mobile-drawer.png'), animations: 'disabled' });
        assert.equal(await page.evaluate(() => Math.abs(document.querySelector('.sidebar').getBoundingClientRect().left - 6) < 1), true);
        await page.keyboard.press('Escape');
        assert.equal(await page.evaluate(() => document.querySelector('.sidebar').inert && document.activeElement.classList.contains('sidebar-toggle')), true);
        await page.locator('#hideMapTextBtn').click();
        await page.screenshot({ path: path.join(process.env.BBM_BROWSER_TOOLS, 'winter-mobile.png'), animations: 'disabled' });
        assert.equal(await page.evaluate(() => document.querySelector('.sidebar').getBoundingClientRect().right <= 0), true);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
        await page.setViewportSize({ width: 320, height: 740 });
        await page.evaluate(() => {
            currentIndex = locations.findIndex(location => location.name === 'Condominiums');
            if (currentIndex < 0) currentIndex = 0;
            updateUI();
        });
        assert.equal(await page.evaluate(() => {
            const name = document.querySelector('.current-name .name');
            return name.scrollWidth <= name.clientWidth;
        }), true);
        await page.screenshot({ path: path.join(process.env.BBM_BROWSER_TOOLS, 'winter-narrow.png'), animations: 'disabled' });
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.waitForFunction(() => !document.querySelector('.sidebar').inert);
        assert.deepEqual(errors, []);
    } finally {
        await browser.close();
    }
});
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [ui, html, css] = await Promise.all([
  readFile(new URL('../src/ui/uiController.js', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../src/style.css', import.meta.url), 'utf8'),
]);

test('adding one food does not automatically close the food drawer', () => {
  assert.ok(!ui.includes('setTimeout(() => setPanel(null)'));
  assert.ok(!ui.includes("compactViewport) setTimeout"));
  assert.ok(ui.includes('sessionAddedCount += 1'));
  assert.ok(ui.includes('updateAddStatus'));
});

test('food grid preserves its scroll position while inventory rerenders', () => {
  assert.ok(ui.includes('const previousScroll = preserveScroll ? elements.foodGrid.scrollTop : 0'));
  assert.ok(ui.includes('elements.foodGrid.scrollTop = previousScroll'));
});

test('continuous adding provides inline feedback and exact undo', () => {
  assert.ok(html.includes('id="foodDrawerStatus"'));
  assert.ok(html.includes('id="undoLastAdded"'));
  assert.ok(html.includes('完成添加食材'));
  assert.ok(ui.includes('undoLastAddition'));
  assert.ok(ui.includes('store.remove(lastAdded.instanceId)'));
  assert.ok(css.includes('.food-drawer-status'));
  assert.ok(css.includes('.food-card--added'));
});

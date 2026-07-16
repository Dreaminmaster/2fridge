import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [scene, main, html, placement, details, desktopCss] = await Promise.all([
  readFile(new URL('../src/scene/sceneController.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../src/scene/foodPlacement.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/scene/foodDetails.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/desktop-polish.css', import.meta.url), 'utf8'),
]);

test('desktop scene supports explicit fridge movement without distance fog', () => {
  assert.ok(scene.includes('toggleMoveMode'));
  assert.ok(scene.includes('userOffsetX'));
  assert.ok(scene.includes('userOffsetZ'));
  assert.ok(scene.includes('scene.fog = null'));
  assert.ok(scene.includes('groundedY'));
  assert.ok(scene.includes('fridgeLocalBottom'));
});

test('desktop move mode is connected to accessible UI', () => {
  assert.ok(html.includes('moveFridgeButton'));
  assert.ok(html.includes('aria-pressed="false"'));
  assert.ok(main.includes('scene.toggleMoveMode()'));
  assert.ok(main.includes("import './desktop-polish.css'"));
  assert.ok(desktopCss.includes('.fridge-move-mode'));
});

test('food detail pass runs before collision-safe placement', () => {
  assert.ok(placement.includes('enhanceFoodModel(root)'));
  assert.ok(details.includes('addCanDetails'));
  assert.ok(details.includes('addEggTray'));
  assert.ok(details.includes('addBottleDetails'));
  assert.ok(details.includes('addBreadScores'));
});

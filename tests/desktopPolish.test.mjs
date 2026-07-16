import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [scene, main, html, placement, details, polish, desktopCss, fridge] = await Promise.all([
  readFile(new URL('../src/scene/sceneController.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../src/scene/foodPlacement.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/scene/foodDetails.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/scene/foodPolish.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/desktop-polish.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/scene/createFridge.js', import.meta.url), 'utf8'),
]);

test('desktop scene pans the camera view instead of moving the fridge object', () => {
  assert.ok(scene.includes('controls.enablePan = !profile.mobile'));
  assert.ok(scene.includes('handleDesktopWheel'));
  assert.ok(scene.includes('panViewByWheel'));
  assert.ok(scene.includes('THREE.MOUSE.PAN'));
  assert.ok(!scene.includes('toggleMoveMode'));
  assert.ok(!scene.includes('userOffsetX'));
  assert.ok(!main.includes('moveFridgeButton'));
  assert.ok(!html.includes('moveFridgeButton'));
  assert.ok(html.includes('电脑触控板双指平移'));
  assert.ok(desktopCss.includes('cursor: grab'));
});

test('scene remains crisp and refreshes only broad dynamic shadow casters', () => {
  assert.ok(scene.includes('scene.fog = null'));
  assert.ok(scene.includes('groundedY'));
  assert.ok(scene.includes('fridgeLocalBottom'));
  assert.ok(scene.includes('cabinetMoving || finalShadowFrame || shadowDirty'));
  assert.ok(fridge.includes('cabinetShadowCasters'));
  assert.ok(fridge.includes('child.castShadow = false'));
});

test('food detail passes run before collision-safe placement', () => {
  assert.ok(placement.includes('enhanceFoodModel(root)'));
  assert.ok(placement.includes('refineFoodModel(root)'));
  assert.ok(details.includes('addCanDetails'));
  assert.ok(details.includes('addEggTray'));
  assert.ok(polish.includes('addBottleRibs'));
  assert.ok(polish.includes('addLeafVeins'));
  assert.ok(polish.includes('addTofuCutLines'));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [scene, fridge, html, ui, desktopCss] = await Promise.all([
  readFile(new URL('../src/scene/sceneController.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/scene/createFridge.js', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../src/ui/uiController.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/desktop-polish.css', import.meta.url), 'utf8'),
]);

test('opening a door does not reposition or rescale the cabinet', () => {
  assert.ok(scene.includes('const desiredScale = baseScale;'));
  assert.ok(scene.includes('const desiredX = baseX;'));
  assert.ok(!scene.includes('baseScale * (anyOpen'));
  assert.ok(!scene.includes('baseX + (anyOpen'));
});

test('closed doors block interactions with internal food', () => {
  const doorIndex = scene.indexOf('const doorHit = raycaster.intersectObjects');
  const foodIndex = scene.indexOf('const foodHit = raycaster.intersectObjects');
  assert.ok(doorIndex >= 0 && foodIndex > doorIndex);
  assert.ok(scene.includes('isFoodInteractable'));
  assert.ok(scene.includes("zone === 'fridge' || zone === 'door'"));
  assert.ok(scene.includes("zone === 'freezer'"));
});

test('refrigerator is straight and positioned against the wall', () => {
  assert.ok(fridge.includes('group.rotation.y = 0'));
  assert.ok(!fridge.includes('group.rotation.y = -0.16'));
  assert.ok(scene.includes('FRIDGE_WALL_Z = -2.2'));
});

test('unnecessary instructional copy is absent', () => {
  for (const copy of [
    '可连续添加，面板不会自动关闭',
    '连续选择食材，系统会自动分配四层前后排空位',
    '逐件移除后，前后排空位会自动重新利用',
    '双指平移',
    '捏合缩放',
    '电脑触控板双指平移',
  ]) {
    assert.ok(!html.includes(copy), copy);
    assert.ok(!desktopCss.includes(copy), copy);
  }
  assert.ok(ui.includes("message ?? ''"));
});

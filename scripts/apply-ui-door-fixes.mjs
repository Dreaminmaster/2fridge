import { readFile, writeFile } from 'node:fs/promises';

async function patchFile(path, operations) {
  let text = await readFile(path, 'utf8');
  for (const [from, to, label] of operations) {
    if (text.includes(to)) continue;
    if (!text.includes(from)) throw new Error(`Missing patch target: ${label}`);
    text = text.replace(from, to);
  }
  await writeFile(path, text);
}

await patchFile('src/scene/sceneController.js', [
  [
    "const ROOM_FLOOR_Y = -3.32;\nconst PAN_LIMITS = { x: 4.6, y: 3.0, z: 2.6 };",
    "const ROOM_FLOOR_Y = -3.32;\nconst FRIDGE_WALL_Z = -2.2;\nconst PAN_LIMITS = { x: 4.6, y: 3.0, z: 2.6 };",
    'wall position constant',
  ],
  [
    "  fridge.group.position.set(0, 0, 0);",
    "  fridge.group.position.set(0, 0, FRIDGE_WALL_Z);",
    'initial wall placement',
  ],
  [
    "  const foodMeshes = new Map();\n  const animations = [];",
    "  const foodMeshes = new Map();\n  const foodZones = new Map();\n  const animations = [];",
    'food zone index',
  ],
  [
    `    const foodHit = raycaster.intersectObjects([...foodMeshes.values()], true)[0];\n    if (foodHit) {\n      const root = findFoodRoot(foodHit.object);\n      if (root) onFoodSelect?.(root.userData.instanceId);\n      return;\n    }\n\n    const doorHit = raycaster.intersectObjects(fridge.doorTargets, false)[0];\n    if (!doorHit) return;\n    const key = doorHit.object.userData.doorName === 'upper-door' ? 'upper' : 'lower';\n    doorState[key] = !doorState[key];\n    onDoorChange?.({ ...doorState });\n    invalidate(45);`,
    `    const doorHit = raycaster.intersectObjects(fridge.doorTargets, false)[0];\n    if (doorHit) {\n      const key = doorHit.object.userData.doorName === 'upper-door' ? 'upper' : 'lower';\n      doorState[key] = !doorState[key];\n      onDoorChange?.({ ...doorState });\n      invalidate(45);\n      return;\n    }\n\n    const interactableFood = [...foodMeshes.entries()]\n      .filter(([instanceId]) => isFoodInteractable(foodZones.get(instanceId)))\n      .map(([, mesh]) => mesh);\n    const foodHit = raycaster.intersectObjects(interactableFood, true)[0];\n    if (!foodHit) return;\n    const root = findFoodRoot(foodHit.object);\n    if (root) onFoodSelect?.(root.userData.instanceId);`,
    'door-first hit testing',
  ],
  [
    "  function buildFoodMesh(food, item) {",
    `  function isFoodInteractable(zone) {\n    if (zone === 'fridge' || zone === 'door') return doorState.upper;\n    if (zone === 'freezer') return doorState.lower;\n    return false;\n  }\n\n  function buildFoodMesh(food, item) {`,
    'closed-door interaction guard',
  ],
  [
    "      foodMeshes.set(item.instanceId, mesh);\n      if (animate)",
    "      foodMeshes.set(item.instanceId, mesh);\n      foodZones.set(item.instanceId, item.zone);\n      if (animate)",
    'store food zone',
  ],
  [
    "    foodMeshes.delete(instanceId);\n    invalidate(1);",
    "    foodMeshes.delete(instanceId);\n    foodZones.delete(instanceId);\n    invalidate(1);",
    'remove food zone',
  ],
  [
    "        camera.position.set(8.4, 2.85, 17.5);\n        controls.target.set(-0.1, 0.05, -0.08);",
    "        camera.position.set(8.4, 2.85, 15.3);\n        controls.target.set(-0.1, 0.05, -2.28);",
    'portrait wall-relative camera',
  ],
  [
    "        camera.position.set(11.1, 2.8, 17.8);\n        controls.target.set(-0.3, 0.08, -0.18);",
    "        camera.position.set(11.1, 2.8, 15.6);\n        controls.target.set(-0.3, 0.08, -2.38);",
    'desktop wall-relative camera',
  ],
  [
    "      fridge.group.position.set(baseX, groundedY(baseScale), 0);",
    "      fridge.group.position.set(baseX, groundedY(baseScale), FRIDGE_WALL_Z);",
    'responsive wall placement',
  ],
  [
    "    const anyOpen = doorState.upper || doorState.lower;\n    const desiredScale = baseScale * (anyOpen ? 0.94 : 1);\n    const desiredX = baseX + (anyOpen ? -0.72 : 0);\n    const desiredY = groundedY(desiredScale);",
    "    const desiredScale = baseScale;\n    const desiredX = baseX;\n    const desiredY = groundedY(desiredScale);",
    'fixed cabinet position while opening',
  ],
  [
    "    fridge.group.position.z = damp(fridge.group.position.z, 0, 8.5, delta);",
    "    fridge.group.position.z = damp(fridge.group.position.z, FRIDGE_WALL_Z, 8.5, delta);",
    'wall z damping',
  ],
  [
    "      || !near(fridge.group.position.z, 0)\n      || !near(fridge.group.scale.x, desiredScale);",
    "      || !near(fridge.group.position.z, FRIDGE_WALL_Z)\n      || !near(fridge.group.scale.x, desiredScale);",
    'wall z movement check',
  ],
]);

await patchFile('src/scene/createFridge.js', [
  [
    "  group.rotation.y = -0.16;\n  group.position.set(-0.35, -0.05, 0);",
    "  group.rotation.y = 0;\n  group.position.set(0, -0.05, 0);",
    'straight refrigerator orientation',
  ],
]);

await patchFile('index.html', [
  [
    '        <p id="gestureHint" class="gesture-hint">拖动旋转 · 双指缩放 · 电脑触控板双指平移</p>',
    '        <p id="gestureHint" class="gesture-hint" hidden></p>',
    'remove persistent gesture copy',
  ],
  [
    `            <div>\n              <h2>添加食材</h2>\n              <p>连续选择食材，系统会自动分配四层前后排空位</p>\n            </div>`,
    `            <div>\n              <h2>添加食材</h2>\n            </div>`,
    'remove add drawer subtitle',
  ],
  [
    '<span id="foodDrawerStatusText">可连续添加，面板不会自动关闭</span>',
    '<span id="foodDrawerStatusText"></span>',
    'remove add drawer default status',
  ],
  [
    `            <div>\n              <h2>冰箱内容</h2>\n              <p>逐件移除后，前后排空位会自动重新利用</p>\n            </div>`,
    `            <div>\n              <h2>冰箱内容</h2>\n            </div>`,
    'remove inventory subtitle',
  ],
  [
    `          <div class="help-grid">\n            <article><b>拖动旋转</b><span>鼠标左键或单指拖动，查看冰箱深处和柜门内侧</span></article>\n            <article><b>电脑平移</b><span>Mac 触控板双指滑动，或按住鼠标右键拖动，移动整个视角</span></article>\n            <article><b>缩放</b><span>触控板捏合、鼠标滚轮或电脑端视角按钮缩放</span></article>\n            <article><b>冷藏四层</b><span>三块层板加底部内衬，每层都有前排和后排</span></article>\n            <article><b>连续添加</b><span>食材面板会保持打开，完成后再主动关闭</span></article>\n            <article><b>轻点食物</b><span>查看所在层与前后排，并可单独移除</span></article>\n          </div>`,
    `          <div class="help-grid">\n            <article><b>拖动旋转</b><span>查看冰箱深处和柜门内侧</span></article>\n            <article><b>开关柜门</b><span>点击上门或下门进行开合</span></article>\n            <article><b>冷藏四层</b><span>每层都有前排和后排</span></article>\n            <article><b>轻点食物</b><span>查看所在层与前后排，并可单独移除</span></article>\n          </div>`,
    'simplify help copy',
  ],
]);

await patchFile('src/ui/uiController.js', [
  [
    "    elements.foodDrawerStatusText.textContent = message ?? '可连续添加，面板不会自动关闭';",
    "    elements.foodDrawerStatusText.textContent = message ?? '';",
    'empty add status default',
  ],
]);

await writeFile('src/desktop-polish.css', `@media (min-width: 760px) and (pointer: fine) {\n  #scene {\n    cursor: grab;\n  }\n\n  #scene:active {\n    cursor: grabbing;\n  }\n\n  .camera-controls {\n    gap: 10px;\n  }\n}\n`);

await patchFile('tests/desktopPolish.test.mjs', [
  [
    "  assert.ok(html.includes('电脑触控板双指平移'));\n  assert.ok(desktopCss.includes('cursor: grab'));",
    "  assert.ok(!html.includes('电脑触控板双指平移'));\n  assert.ok(!desktopCss.includes('双指平移'));\n  assert.ok(desktopCss.includes('cursor: grab'));",
    'desktop tooltip expectations',
  ],
]);

await writeFile('tests/doorOcclusionAndCopy.test.mjs', `import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport { readFile } from 'node:fs/promises';\n\nconst [scene, fridge, html, ui, desktopCss] = await Promise.all([\n  readFile(new URL('../src/scene/sceneController.js', import.meta.url), 'utf8'),\n  readFile(new URL('../src/scene/createFridge.js', import.meta.url), 'utf8'),\n  readFile(new URL('../index.html', import.meta.url), 'utf8'),\n  readFile(new URL('../src/ui/uiController.js', import.meta.url), 'utf8'),\n  readFile(new URL('../src/desktop-polish.css', import.meta.url), 'utf8'),\n]);\n\ntest('opening a door does not reposition or rescale the cabinet', () => {\n  assert.ok(scene.includes('const desiredScale = baseScale;'));\n  assert.ok(scene.includes('const desiredX = baseX;'));\n  assert.ok(!scene.includes('baseScale * (anyOpen'));\n  assert.ok(!scene.includes('baseX + (anyOpen'));\n});\n\ntest('closed doors block interactions with internal food', () => {\n  const doorIndex = scene.indexOf('const doorHit = raycaster.intersectObjects');\n  const foodIndex = scene.indexOf('const foodHit = raycaster.intersectObjects');\n  assert.ok(doorIndex >= 0 && foodIndex > doorIndex);\n  assert.ok(scene.includes('isFoodInteractable'));\n  assert.ok(scene.includes("zone === 'fridge' || zone === 'door'"));\n  assert.ok(scene.includes("zone === 'freezer'"));\n});\n\ntest('refrigerator is straight and positioned against the wall', () => {\n  assert.ok(fridge.includes('group.rotation.y = 0'));\n  assert.ok(!fridge.includes('group.rotation.y = -0.16'));\n  assert.ok(scene.includes('FRIDGE_WALL_Z = -2.2'));\n});\n\ntest('unnecessary instructional copy is absent', () => {\n  for (const copy of [\n    '可连续添加，面板不会自动关闭',\n    '连续选择食材，系统会自动分配四层前后排空位',\n    '逐件移除后，前后排空位会自动重新利用',\n    '双指平移',\n    '捏合缩放',\n    '电脑触控板双指平移',\n  ]) {\n    assert.ok(!html.includes(copy), copy);\n    assert.ok(!desktopCss.includes(copy), copy);\n  }\n  assert.ok(ui.includes("message ?? ''"));\n});\n`);

console.log('Applied fixed cabinet opening, door occlusion, wall alignment, and UI copy cleanup.');

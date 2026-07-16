import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { FOOD_CATALOG, ZONE_META } from '../src/data/foodCatalog.js';
import { SLOT_LAYOUT } from '../src/scene/fridgeLayout.js';

assert.ok(FOOD_CATALOG.length >= 45, '基础食材数量不足');
assert.equal(new Set(FOOD_CATALOG.map((food) => food.id)).size, FOOD_CATALOG.length, '食材 id 必须唯一');
assert.ok(FOOD_CATALOG.every((food) => food.ingredientKey && food.name && food.target && food.model), '食材元数据不完整');
assert.equal(Object.values(ZONE_META).reduce((sum, zone) => sum + zone.capacity, 0), 60);
Object.values(ZONE_META).forEach((zone) => assert.equal(SLOT_LAYOUT[zone.id].length, zone.capacity, `${zone.label}槽位与容量不一致`));
assert.ok(SLOT_LAYOUT.fridge.some((slot) => slot.depth === 'front'));
assert.ok(SLOT_LAYOUT.fridge.some((slot) => slot.depth === 'back'));
assert.equal(new Set(SLOT_LAYOUT.fridge.map((slot) => slot.shelf)).size, 4, '冷藏区必须包含四层');
assert.ok(SLOT_LAYOUT.freezer.some((slot) => slot.depth === 'front'));
assert.ok(SLOT_LAYOUT.freezer.some((slot) => slot.depth === 'back'));
assert.ok(SLOT_LAYOUT.fridge.slice(0, 4).every((slot) => slot.depth === 'front'), '冷藏必须前排优先');
assert.ok(SLOT_LAYOUT.freezer.slice(0, 4).every((slot) => slot.depth === 'front'), '冷冻必须前排优先');
assert.ok(Object.values(SLOT_LAYOUT).flat().every((slot) => Number.isFinite(slot.supportY)), '每个槽位必须定义承托面');
assert.ok(Object.values(SLOT_LAYOUT).flat().every((slot) => slot.maxWidth && slot.maxHeight && slot.maxDepth), '每个槽位必须定义安全包围盒');

const files = await Promise.all([
  'src/domain/inventoryStore.js',
  'src/domain/recipeContext.js',
  'src/scene/sceneController.js',
  'src/scene/createFridge.js',
  'src/scene/createFoodModel.js',
  'src/scene/foodPlacement.js',
  'src/scene/foodPolish.js',
  'src/ui/uiController.js',
  'src/style.css',
  'src/mobile-performance.css',
  'src/main.js',
  'index.html',
  'README.md',
].map((path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')));

assert.ok(files[0].includes('prepareAdd'));
assert.ok(files[0].includes('commitPrepared'));
assert.ok(files[0].includes('pocket-fridge-v3'));
assert.ok(files[1].includes('availableIngredientKeys'));
assert.ok(files[2].includes('OrbitControls'));
assert.ok(files[2].includes('requestAnimationFrame(renderFrame)'));
assert.ok(!files[2].includes('setAnimationLoop'));
assert.ok(files[2].includes('pixelRatioCap: coarsePointer || narrowViewport ? 1.8 : 2'));
assert.ok(files[2].includes('shadowMap.autoUpdate = false'));
assert.ok(files[2].includes('controls.enablePan = !profile.mobile'));
assert.ok(files[2].includes('panViewByWheel'));
assert.ok(!files[2].includes('toggleMoveMode'));
assert.ok(files[2].includes('stageItem'));
assert.ok(files[3].includes('fridgeFloor'));
assert.ok(files[3].includes('freezerFloor'));
assert.ok(files[3].includes('cabinetShadowCasters'));
assert.ok(files[3].includes('frontGuard'));
assert.ok(files[4].includes('prepareFoodPlacement'));
assert.ok(files[4].includes('depthLabel'));
assert.ok(!files[4].includes('THREE.CapsuleGeometry'));
assert.ok(files[5].includes('new THREE.Box3().setFromObject'));
assert.ok(files[5].includes('refineFoodModel(root)'));
assert.ok(files[5].includes('supportY'));
assert.ok(files[6].includes('addBottleRibs'));
assert.ok(files[6].includes('addLeafVeins'));
assert.ok(files[7].includes('store.prepareAdd'));
assert.ok(files[7].includes('store.commitPrepared'));
assert.ok(files[7].includes('scene.stageItem'));
assert.ok(files[7].includes('undoLastAddition'));
assert.ok(files[7].includes('elements.foodGrid.scrollTop = previousScroll'));
assert.ok(!files[7].includes('setTimeout(() => setPanel(null)'));
assert.ok(!files[8].includes('statusText'));
assert.ok(files[8].includes('.food-drawer-status'));
assert.ok(files[8].includes('.food-card--added'));
assert.ok(files[9].includes('.camera-controls'));
assert.ok(files[9].includes('display: none'));
assert.ok(files[10].includes("import './mobile-performance.css'"));
assert.ok(!files[10].includes('moveFridgeButton'));
assert.ok(files[11].includes('id="foodDrawerStatus"'));
assert.ok(files[11].includes('id="undoLastAdded"'));
assert.ok(files[11].includes('0 / 60'));
assert.ok(files[12].includes('https://dreaminmaster.github.io/2fridge/'));
console.log(`Project validation passed: ${FOOD_CATALOG.length} foods, four refrigerator shelves, camera panning, smooth dynamic shadows, refined existing models, physical grounding, transactional inventory, and continuous mobile adding.`);

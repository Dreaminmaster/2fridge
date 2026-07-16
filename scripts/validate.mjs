import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { FOOD_CATALOG, ZONE_META } from '../src/data/foodCatalog.js';
import { SLOT_LAYOUT } from '../src/scene/fridgeLayout.js';

assert.ok(FOOD_CATALOG.length >= 45, '基础食材数量不足');
assert.equal(new Set(FOOD_CATALOG.map((food) => food.id)).size, FOOD_CATALOG.length, '食材 id 必须唯一');
assert.ok(FOOD_CATALOG.every((food) => food.ingredientKey && food.name && food.target && food.model), '食材元数据不完整');
assert.equal(Object.values(ZONE_META).reduce((sum, zone) => sum + zone.capacity, 0), 52);
Object.values(ZONE_META).forEach((zone) => assert.equal(SLOT_LAYOUT[zone.id].length, zone.capacity, `${zone.label}槽位与容量不一致`));
assert.ok(SLOT_LAYOUT.fridge.some((slot) => slot.depth === 'front'));
assert.ok(SLOT_LAYOUT.fridge.some((slot) => slot.depth === 'back'));
assert.ok(SLOT_LAYOUT.freezer.some((slot) => slot.depth === 'front'));
assert.ok(SLOT_LAYOUT.freezer.some((slot) => slot.depth === 'back'));

const files = await Promise.all([
  'src/domain/inventoryStore.js',
  'src/domain/recipeContext.js',
  'src/scene/sceneController.js',
  'src/scene/createFridge.js',
  'src/scene/createFoodModel.js',
  'src/ui/uiController.js',
  'src/style.css',
  'README.md',
].map((path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')));

assert.ok(files[0].includes('zone-full'));
assert.ok(files[1].includes('availableIngredientKeys'));
assert.ok(files[2].includes('OrbitControls'));
assert.ok(files[2].includes('targetScale'));
assert.ok(files[3].includes('genuinely deep cabinet'));
assert.ok(files[4].includes('depthLabel'));
assert.ok(files[5].includes('removeOne'));
assert.ok(!files[6].includes('statusText'));
assert.ok(files[7].includes('https://dreaminmaster.github.io/2fridge/'));
console.log(`Project validation passed: ${FOOD_CATALOG.length} foods, 52 slots, front/back depth layers.`);

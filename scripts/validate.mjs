import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { FOOD_CATALOG, ZONE_META } from '../src/data/foodCatalog.js';

assert.equal(FOOD_CATALOG.length, 15);
assert.equal(new Set(FOOD_CATALOG.map((food) => food.id)).size, FOOD_CATALOG.length);
assert.equal(Object.values(ZONE_META).reduce((sum, zone) => sum + zone.capacity, 0), 29);
const files = await Promise.all([
  'src/domain/inventoryStore.js', 'src/domain/recipeContext.js', 'src/scene/sceneController.js', 'src/ui/uiController.js', 'src/style.css', 'README.md',
].map((path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')));
assert.ok(files[0].includes('zone-full'));
assert.ok(files[1].includes('availableIngredientKeys'));
assert.ok(files[2].includes('OrbitControls'));
assert.ok(files[3].includes('removeOne'));
assert.ok(!files[4].includes('statusText'));
assert.ok(files[5].includes('https://dreaminmaster.github.io/2fridge/'));
console.log('Project validation passed.');

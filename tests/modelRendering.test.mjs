import test from 'node:test';
import assert from 'node:assert/strict';
import { FOOD_CATALOG } from '../src/data/foodCatalog.js';
import { createFoodModel } from '../src/scene/createFoodModel.js';

for (const food of FOOD_CATALOG) {
  test(`3D model renders for ${food.name}`, () => {
    const model = createFoodModel(food, {
      instanceId: `test-${food.id}`,
      foodId: food.id,
      zone: food.target,
      slot: 0,
    });
    assert.equal(model.userData.foodId, food.id);
    assert.ok(model.children.length > 0, `${food.name} should contain visible geometry`);
    let meshCount = 0;
    model.traverse((child) => {
      if (child.isMesh) {
        meshCount += 1;
        assert.ok(child.geometry, `${food.name} mesh should have geometry`);
        assert.ok(child.material, `${food.name} mesh should have material`);
      }
    });
    assert.ok(meshCount > 0, `${food.name} should render at least one mesh`);
  });
}

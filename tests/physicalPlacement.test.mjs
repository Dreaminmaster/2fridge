import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { FOOD_CATALOG } from '../src/data/foodCatalog.js';
import { SLOT_LAYOUT } from '../src/scene/fridgeLayout.js';
import { createFoodModel } from '../src/scene/createFoodModel.js';

const representativeSlots = {
  fridge: [0, 4, 8, 12, 16, 20],
  freezer: [0, 4, 8, 12],
  door: [0, 4, 8],
};

for (const food of FOOD_CATALOG) {
  for (const slotIndex of representativeSlots[food.target]) {
    test(`${food.name} rests inside ${food.target} slot ${slotIndex}`, () => {
      const slot = SLOT_LAYOUT[food.target][slotIndex];
      const model = createFoodModel(food, {
        instanceId: `${food.id}-${slotIndex}`,
        foodId: food.id,
        zone: food.target,
        slot: slotIndex,
      });

      model.scale.setScalar(model.userData.targetScale);
      model.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3());
      const expectedBottom = slot.supportY + slot.clearance;

      assert.ok(Math.abs(bounds.min.y - expectedBottom) < 0.025, `${food.name} bottom is not grounded`);
      assert.ok(size.x <= slot.maxWidth + 0.035, `${food.name} exceeds slot width`);
      assert.ok(size.y <= slot.maxHeight + 0.025, `${food.name} exceeds vertical clearance`);
      assert.ok(size.z <= slot.maxDepth + 0.035, `${food.name} exceeds slot depth`);
      assert.ok(model.userData.placement?.naturalSize, `${food.name} placement metadata missing`);
    });
  }
}

test('adjacent shelf slots keep a collision-safe horizontal gap', () => {
  for (const zone of ['fridge', 'freezer']) {
    const slots = SLOT_LAYOUT[zone];
    for (const shelf of new Set(slots.map((slot) => slot.shelf))) {
      for (const depth of ['front', 'back']) {
        const row = slots.filter((slot) => slot.shelf === shelf && slot.depth === depth).sort((a, b) => a.x - b.x);
        for (let index = 1; index < row.length; index += 1) {
          const minimumSpacing = (row[index - 1].maxWidth + row[index].maxWidth) / 2;
          assert.ok(row[index].x - row[index - 1].x > minimumSpacing, `${zone} shelf ${shelf} slots overlap`);
        }
      }
    }
  }
});

test('front and back rows have separate depth envelopes', () => {
  for (const zone of ['fridge', 'freezer']) {
    const front = SLOT_LAYOUT[zone].find((slot) => slot.shelf === 0 && slot.depth === 'front');
    const back = SLOT_LAYOUT[zone].find((slot) => slot.shelf === 0 && slot.depth === 'back');
    const minimumSpacing = (front.maxDepth + back.maxDepth) / 2;
    assert.ok(front.z - back.z > minimumSpacing, `${zone} front/back envelopes overlap`);
  }
});

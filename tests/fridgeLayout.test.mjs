import test from 'node:test';
import assert from 'node:assert/strict';
import { SLOT_LAYOUT } from '../src/scene/fridgeLayout.js';
import { ZONE_META } from '../src/data/foodCatalog.js';

test('slot counts match declared capacities', () => {
  Object.values(ZONE_META).forEach((zone) => assert.equal(SLOT_LAYOUT[zone.id].length, zone.capacity));
});

test('each cold shelf contains a back and front row', () => {
  for (const zone of ['fridge', 'freezer']) {
    const shelves = new Map();
    SLOT_LAYOUT[zone].forEach((slot) => {
      const depths = shelves.get(slot.shelf) ?? new Set();
      depths.add(slot.depth);
      shelves.set(slot.shelf, depths);
    });
    shelves.forEach((depths) => assert.deepEqual(depths, new Set(['back', 'front'])));
  }
});

test('all slots stay within the deep cabinet cavity', () => {
  for (const zone of ['fridge', 'freezer']) {
    SLOT_LAYOUT[zone].forEach((slot) => {
      assert.ok(slot.x > -2 && slot.x < 2);
      assert.ok(slot.z > -1.8 && slot.z < 1.5);
      assert.ok(slot.scale <= 0.7);
    });
  }
});

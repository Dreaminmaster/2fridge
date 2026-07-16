import test from 'node:test';
import assert from 'node:assert/strict';
import { SLOT_LAYOUT } from '../src/scene/fridgeLayout.js';
import { ZONE_META } from '../src/data/foodCatalog.js';

test('slot counts match declared capacities', () => {
  Object.values(ZONE_META).forEach((zone) => assert.equal(SLOT_LAYOUT[zone.id].length, zone.capacity));
});

test('refrigerator exposes four usable shelves with front and back rows', () => {
  const shelves = new Map();
  SLOT_LAYOUT.fridge.forEach((slot) => {
    const depths = shelves.get(slot.shelf) ?? new Set();
    depths.add(slot.depth);
    shelves.set(slot.shelf, depths);
  });
  assert.equal(shelves.size, 4);
  shelves.forEach((depths) => assert.deepEqual(depths, new Set(['back', 'front'])));
  assert.equal(SLOT_LAYOUT.fridge.filter((slot) => slot.shelf === 3).length, 8);
  assert.ok(SLOT_LAYOUT.fridge.filter((slot) => slot.shelf === 3).every((slot) => slot.supportY < 0));
});

test('each freezer shelf contains a back and front row', () => {
  const shelves = new Map();
  SLOT_LAYOUT.freezer.forEach((slot) => {
    const depths = shelves.get(slot.shelf) ?? new Set();
    depths.add(slot.depth);
    shelves.set(slot.shelf, depths);
  });
  shelves.forEach((depths) => assert.deepEqual(depths, new Set(['back', 'front'])));
});

test('all slots stay within the cabinet and define physical envelopes', () => {
  for (const zone of ['fridge', 'freezer']) {
    SLOT_LAYOUT[zone].forEach((slot) => {
      assert.ok(slot.x > -2 && slot.x < 2);
      assert.ok(slot.z > -1.8 && slot.z < 1.5);
      assert.ok(slot.scale <= 0.72);
      assert.ok(Number.isFinite(slot.supportY));
      assert.ok(slot.maxWidth > 0 && slot.maxWidth < 1);
      assert.ok(slot.maxHeight > 0 && slot.maxHeight < 1.2);
      assert.ok(slot.maxDepth > 0 && slot.maxDepth < 1);
      assert.ok(slot.fitPadding > 0 && slot.fitPadding < 1);
    });
  }
});

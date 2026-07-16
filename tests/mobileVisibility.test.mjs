import test from 'node:test';
import assert from 'node:assert/strict';
import { SLOT_LAYOUT } from '../src/scene/fridgeLayout.js';
import { createInventoryStore } from '../src/domain/inventoryStore.js';
import { FOOD_CATALOG } from '../src/data/foodCatalog.js';

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test('new chilled and frozen items fill the visible front row first', () => {
  assert.ok(SLOT_LAYOUT.fridge.slice(0, 4).every((slot) => slot.depth === 'front'));
  assert.ok(SLOT_LAYOUT.freezer.slice(0, 4).every((slot) => slot.depth === 'front'));
  assert.ok(SLOT_LAYOUT.fridge.slice(4, 8).every((slot) => slot.depth === 'back'));
  assert.ok(SLOT_LAYOUT.freezer.slice(4, 8).every((slot) => slot.depth === 'back'));
});

test('the first chilled inventory entry resolves to a visible front slot', () => {
  const store = createInventoryStore({
    storage: memoryStorage(),
    idFactory: () => 'visible-item',
  });
  const eggs = FOOD_CATALOG.find((food) => food.id === 'eggs');
  const result = store.add(eggs);
  assert.equal(result.ok, true);
  assert.equal(result.item.slot, 0);
  assert.equal(SLOT_LAYOUT.fridge[result.item.slot].depth, 'front');
  assert.ok(SLOT_LAYOUT.fridge[result.item.slot].z > 0);
});

test('back row shares the shelf support plane without floating', () => {
  const front = SLOT_LAYOUT.fridge[0];
  const back = SLOT_LAYOUT.fridge[4];
  assert.equal(front.shelf, back.shelf);
  assert.equal(front.supportY, back.supportY);
  assert.equal(front.y, back.y);
  assert.ok(back.z < front.z);
  assert.notEqual(back.x, front.x);
  assert.ok(back.scale > 0.6);
});

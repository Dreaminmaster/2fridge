import test from 'node:test';
import assert from 'node:assert/strict';
import { createInventoryStore } from '../src/domain/inventoryStore.js';
import { FOOD_CATALOG } from '../src/data/foodCatalog.js';

function memoryStorage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    values,
  };
}

test('prepareAdd does not consume capacity before commit', () => {
  const store = createInventoryStore({ storage: memoryStorage(), idFactory: () => 'prepared-1' });
  const sausage = FOOD_CATALOG.find((food) => food.id === 'sausage');
  const prepared = store.prepareAdd(sausage);
  assert.equal(prepared.ok, true);
  assert.equal(store.getSnapshot().total, 0);
  const committed = store.commitPrepared(prepared.item);
  assert.equal(committed.ok, true);
  assert.equal(store.getSnapshot().total, 1);
});

test('a failing subscriber cannot interrupt a committed mutation', () => {
  const store = createInventoryStore({ storage: memoryStorage(), idFactory: () => 'safe-listener' });
  const eggs = FOOD_CATALOG.find((food) => food.id === 'eggs');
  store.subscribe(() => { throw new Error('render failed'); });
  const result = store.add(eggs);
  assert.equal(result.ok, true);
  assert.equal(store.getSnapshot().usage.fridge, 1);
});

test('legacy duplicate and invalid slots are repaired on load', () => {
  const legacy = {
    version: 2,
    items: [
      { instanceId: 'a', foodId: 'eggs', zone: 'fridge', slot: 0, quantity: 1, unit: '盒', addedAt: '2026-01-01T00:00:00.000Z' },
      { instanceId: 'b', foodId: 'eggs', zone: 'fridge', slot: 0, quantity: 1, unit: '盒', addedAt: '2026-01-01T00:00:01.000Z' },
      { instanceId: 'c', foodId: 'missing-food', zone: 'fridge', slot: 2, quantity: 1, unit: '份', addedAt: '2026-01-01T00:00:02.000Z' },
    ],
  };
  const storage = memoryStorage({ 'pocket-fridge-v2': JSON.stringify(legacy) });
  const store = createInventoryStore({ storage });
  const snapshot = store.getSnapshot();
  assert.equal(snapshot.total, 2);
  assert.deepEqual(snapshot.items.map((item) => item.slot), [0, 1]);
  assert.ok(storage.values.has('pocket-fridge-v3'));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createInventoryStore } from '../src/domain/inventoryStore.js';
import { FOOD_CATALOG, ZONE_META } from '../src/data/foodCatalog.js';

function memoryStorage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test('capacity is enforced per storage zone and overfilling is rejected', () => {
  let nextId = 0;
  const store = createInventoryStore({ storage: memoryStorage(), idFactory: () => `id-${nextId++}` });
  const coke = FOOD_CATALOG.find((food) => food.id === 'coke');
  for (let index = 0; index < ZONE_META.door.capacity; index += 1) assert.equal(store.add(coke).ok, true);
  const extra = store.add(coke);
  assert.equal(extra.ok, false);
  assert.equal(extra.reason, 'zone-full');
  assert.equal(store.getSnapshot().usage.door, ZONE_META.door.capacity);
});

test('removing one item frees its exact slot for reuse', () => {
  let nextId = 0;
  const store = createInventoryStore({ storage: memoryStorage(), idFactory: () => `id-${nextId++}` });
  const eggs = FOOD_CATALOG.find((food) => food.id === 'eggs');
  const first = store.add(eggs).item;
  const second = store.add(eggs).item;
  assert.deepEqual([first.slot, second.slot], [0, 1]);
  store.remove(first.instanceId);
  const replacement = store.add(eggs).item;
  assert.equal(replacement.slot, 0);
});

test('removeOne removes only one matching instance', () => {
  const store = createInventoryStore({ storage: memoryStorage(), idFactory: (() => { let id = 0; return () => `x-${id++}`; })() });
  const onion = FOOD_CATALOG.find((food) => food.id === 'onion');
  store.add(onion); store.add(onion);
  assert.equal(store.removeOne(onion.id).ok, true);
  assert.equal(store.getSnapshot().items.filter((item) => item.foodId === onion.id).length, 1);
});

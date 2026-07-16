import { ZONE_META, getFoodById } from '../data/foodCatalog.js';

const STORAGE_KEY = 'pocket-fridge-v3';
const LEGACY_KEYS = ['pocket-fridge-v2'];

export function createInventoryStore({ storage = resolveStorage(), now = () => new Date().toISOString(), idFactory = createId } = {}) {
  let state = loadState(storage);
  const listeners = new Set();

  // Persist the normalized v3 state immediately so stale, duplicate, or invalid
  // slots from previous builds cannot keep occupying invisible capacity.
  writeState(storage, state);

  function getSnapshot() {
    const items = state.items.map((item) => ({ ...item }));
    const usage = Object.fromEntries(Object.keys(ZONE_META).map((zone) => [zone, items.filter((item) => item.zone === zone).length]));
    return {
      items,
      usage,
      total: items.length,
      totalCapacity: Object.values(ZONE_META).reduce((sum, zone) => sum + zone.capacity, 0),
    };
  }

  function prepareAdd(food) {
    if (!food || !ZONE_META[food.target] || !getFoodById(food.id)) {
      return { ok: false, reason: 'invalid-food', zone: food?.target };
    }
    const slot = firstFreeSlot(food.target, state.items);
    if (slot === -1) return { ok: false, reason: 'zone-full', zone: food.target };
    return {
      ok: true,
      item: {
        instanceId: idFactory(),
        foodId: food.id,
        ingredientKey: food.ingredientKey,
        zone: food.target,
        slot,
        quantity: 1,
        unit: food.unit,
        addedAt: now(),
      },
    };
  }

  function commitPrepared(item) {
    const food = getFoodById(item?.foodId);
    if (!food || item.zone !== food.target || !isValidSlot(item.zone, item.slot)) {
      return { ok: false, reason: 'invalid-item', zone: item?.zone };
    }
    if (state.items.some((entry) => entry.instanceId === item.instanceId)) {
      return { ok: false, reason: 'duplicate-id', zone: item.zone };
    }
    if (state.items.some((entry) => entry.zone === item.zone && entry.slot === item.slot)) {
      return { ok: false, reason: 'slot-taken', zone: item.zone };
    }
    state = { version: 3, items: [...state.items, { ...item }] };
    persist();
    return { ok: true, item: { ...item } };
  }

  function add(food) {
    const prepared = prepareAdd(food);
    return prepared.ok ? commitPrepared(prepared.item) : prepared;
  }

  function remove(instanceId) {
    const item = state.items.find((entry) => entry.instanceId === instanceId);
    if (!item) return { ok: false, reason: 'not-found' };
    state = { version: 3, items: state.items.filter((entry) => entry.instanceId !== instanceId) };
    persist();
    return { ok: true, item: { ...item } };
  }

  function removeMany(instanceIds) {
    const ids = new Set(instanceIds);
    if (!ids.size) return { ok: true, removed: [] };
    const removed = state.items.filter((item) => ids.has(item.instanceId));
    if (!removed.length) return { ok: false, reason: 'not-found', removed: [] };
    state = { version: 3, items: state.items.filter((item) => !ids.has(item.instanceId)) };
    persist();
    return { ok: true, removed: removed.map((item) => ({ ...item })) };
  }

  function removeOne(foodId) {
    const item = [...state.items].reverse().find((entry) => entry.foodId === foodId);
    return item ? remove(item.instanceId) : { ok: false, reason: 'not-found' };
  }

  function clear() {
    state = { version: 3, items: [] };
    persist();
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function persist() {
    writeState(storage, state);
    const snapshot = getSnapshot();
    listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (error) {
        // A rendering failure must never make a successful inventory mutation
        // appear to fail or leave the caller stuck in an inconsistent state.
        console.error('Pocket Fridge subscriber failed:', error);
      }
    });
  }

  return {
    getSnapshot,
    prepareAdd,
    commitPrepared,
    add,
    remove,
    removeMany,
    removeOne,
    clear,
    subscribe,
  };
}

function firstFreeSlot(zone, items) {
  const capacity = ZONE_META[zone]?.capacity ?? 0;
  const occupied = new Set(items.filter((item) => item.zone === zone).map((item) => item.slot));
  for (let slot = 0; slot < capacity; slot += 1) if (!occupied.has(slot)) return slot;
  return -1;
}

function loadState(storage) {
  const candidates = [STORAGE_KEY, ...LEGACY_KEYS];
  for (const key of candidates) {
    try {
      const parsed = JSON.parse(storage?.getItem(key) ?? 'null');
      if (parsed && Array.isArray(parsed.items)) return normalizeItems(parsed.items);
    } catch {
      // Continue to the next legacy key.
    }
  }
  return { version: 3, items: [] };
}

function normalizeItems(items) {
  const normalized = [];
  const usedIds = new Set();
  const occupied = Object.fromEntries(Object.keys(ZONE_META).map((zone) => [zone, new Set()]));

  items.forEach((item) => {
    const food = getFoodById(item?.foodId);
    if (!food || typeof item.instanceId !== 'string' || usedIds.has(item.instanceId)) return;
    const zone = food.target;
    let slot = Number.isInteger(item.slot) && isValidSlot(zone, item.slot) && !occupied[zone].has(item.slot)
      ? item.slot
      : firstFreeSlot(zone, normalized);
    if (slot === -1) return;
    usedIds.add(item.instanceId);
    occupied[zone].add(slot);
    normalized.push({
      instanceId: item.instanceId,
      foodId: food.id,
      ingredientKey: food.ingredientKey,
      zone,
      slot,
      quantity: Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1,
      unit: food.unit,
      addedAt: typeof item.addedAt === 'string' ? item.addedAt : new Date(0).toISOString(),
    });
  });

  return { version: 3, items: normalized };
}

function isValidSlot(zone, slot) {
  return Boolean(ZONE_META[zone]) && Number.isInteger(slot) && slot >= 0 && slot < ZONE_META[zone].capacity;
}

function writeState(storage, state) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Local storage is optional, for example in restricted private browsing.
  }
}

function resolveStorage() {
  try { return globalThis.localStorage; } catch { return null; }
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

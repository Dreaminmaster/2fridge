import { ZONE_META } from '../data/foodCatalog.js';

const STORAGE_KEY = 'pocket-fridge-v2';

export function createInventoryStore({ storage = resolveStorage(), now = () => new Date().toISOString(), idFactory = createId } = {}) {
  let state = loadState(storage);
  const listeners = new Set();

  function getSnapshot() {
    const items = state.items.map((item) => ({ ...item }));
    const usage = Object.fromEntries(Object.keys(ZONE_META).map((zone) => [zone, items.filter((item) => item.zone === zone).length]));
    return { items, usage, total: items.length, totalCapacity: Object.values(ZONE_META).reduce((sum, zone) => sum + zone.capacity, 0) };
  }

  function add(food) {
    const slot = firstFreeSlot(food.target, state.items);
    if (slot === -1) return { ok: false, reason: 'zone-full', zone: food.target };
    const item = {
      instanceId: idFactory(),
      foodId: food.id,
      ingredientKey: food.ingredientKey,
      zone: food.target,
      slot,
      quantity: 1,
      unit: food.unit,
      addedAt: now(),
    };
    state = { ...state, items: [...state.items, item] };
    persist();
    return { ok: true, item: { ...item } };
  }

  function remove(instanceId) {
    const item = state.items.find((entry) => entry.instanceId === instanceId);
    if (!item) return { ok: false, reason: 'not-found' };
    state = { ...state, items: state.items.filter((entry) => entry.instanceId !== instanceId) };
    persist();
    return { ok: true, item: { ...item } };
  }

  function removeOne(foodId) {
    const item = [...state.items].reverse().find((entry) => entry.foodId === foodId);
    return item ? remove(item.instanceId) : { ok: false, reason: 'not-found' };
  }

  function clear() {
    state = { version: 2, items: [] };
    persist();
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function persist() {
    try { storage?.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage is optional */ }
    const snapshot = getSnapshot();
    listeners.forEach((listener) => listener(snapshot));
  }

  return { getSnapshot, add, remove, removeOne, clear, subscribe };
}

function firstFreeSlot(zone, items) {
  const capacity = ZONE_META[zone]?.capacity ?? 0;
  const occupied = new Set(items.filter((item) => item.zone === zone).map((item) => item.slot));
  for (let slot = 0; slot < capacity; slot += 1) if (!occupied.has(slot)) return slot;
  return -1;
}

function loadState(storage) {
  try {
    const parsed = JSON.parse(storage?.getItem(STORAGE_KEY) ?? 'null');
    if (parsed?.version === 2 && Array.isArray(parsed.items)) return { version: 2, items: parsed.items.filter(validItem) };
  } catch { /* ignore invalid stored data */ }
  return { version: 2, items: [] };
}

function validItem(item) {
  return item && typeof item.instanceId === 'string' && typeof item.foodId === 'string' && ZONE_META[item.zone] && Number.isInteger(item.slot) && item.slot >= 0 && item.slot < ZONE_META[item.zone].capacity;
}

function resolveStorage() {
  try { return globalThis.localStorage; } catch { return null; }
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

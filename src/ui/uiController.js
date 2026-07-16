import { FOOD_CATALOG, FOOD_CATEGORIES, ZONE_META, getFoodById } from '../data/foodCatalog.js';
import { SLOT_LAYOUT } from '../scene/fridgeLayout.js';
import { foodIconSvg } from './foodIcon.js';

export function createUIController({ store, scene }) {
  const elements = collectElements();
  const catalogById = new Map(FOOD_CATALOG.map((food) => [food.id, food]));
  let activeCategory = 'all';
  let searchTerm = '';
  let selectedInstanceId = null;
  let activePanel = null;
  let toastTimer;

  FOOD_CATEGORIES.forEach((category) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `category-tab${category.id === activeCategory ? ' active' : ''}`;
    button.textContent = category.label;
    button.dataset.category = category.id;
    button.addEventListener('click', () => { activeCategory = category.id; renderFoodGrid(store.getSnapshot()); });
    elements.categoryTabs.appendChild(button);
  });

  elements.foodToggle.addEventListener('click', () => setPanel(activePanel === 'food' ? null : 'food'));
  elements.inventoryToggle.addEventListener('click', () => setPanel(activePanel === 'inventory' ? null : 'inventory'));
  elements.foodDrawerClose.addEventListener('click', () => setPanel(null));
  elements.inventoryDrawerClose.addEventListener('click', () => setPanel(null));
  elements.foodSearch.addEventListener('input', (event) => { searchTerm = event.target.value.trim().toLowerCase(); renderFoodGrid(store.getSnapshot()); });
  elements.zoomInButton.addEventListener('click', scene.zoomIn);
  elements.zoomOutButton.addEventListener('click', scene.zoomOut);
  elements.resetViewButton.addEventListener('click', scene.resetView);
  elements.helpButton.addEventListener('click', () => openModal(elements.helpSheet));
  elements.resetButton.addEventListener('click', () => openModal(elements.confirmSheet));
  elements.confirmReset.addEventListener('click', () => { store.clear(); closeModals(); setPanel(null); closeItemSheet(); showToast('冰箱已经清空'); });
  document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', closeModals));
  elements.scrim.addEventListener('click', closeModals);
  elements.removeSelectedItem.addEventListener('click', removeSelected);
  elements.itemSheetClose.addEventListener('click', closeItemSheet);

  const unsubscribe = store.subscribe(render);
  render(store.getSnapshot());

  function render(snapshot) {
    scene.syncInventory(snapshot.items, catalogById);
    renderCapacity(snapshot);
    renderFoodGrid(snapshot);
    renderInventory(snapshot);
    if (selectedInstanceId && !snapshot.items.some((item) => item.instanceId === selectedInstanceId)) closeItemSheet();
  }

  function renderCapacity(snapshot) {
    elements.inventoryCount.textContent = `${snapshot.total} / ${snapshot.totalCapacity}`;
    elements.zoneMeters.innerHTML = Object.values(ZONE_META).map((zone) => {
      const used = snapshot.usage[zone.id];
      const percent = Math.round((used / zone.capacity) * 100);
      return `<div class="zone-meter" title="${zone.label} ${used}/${zone.capacity}"><span>${zone.shortLabel}</span><i><b style="width:${percent}%"></b></i><em>${used}/${zone.capacity}</em></div>`;
    }).join('');
  }

  function renderFoodGrid(snapshot) {
    document.querySelectorAll('.category-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.category === activeCategory));
    const visible = FOOD_CATALOG.filter((food) => {
      const categoryMatch = activeCategory === 'all' || food.category === activeCategory;
      const searchMatch = !searchTerm || [food.name, ...food.aliases].some((value) => value.toLowerCase().includes(searchTerm));
      return categoryMatch && searchMatch;
    });
    elements.foodGrid.innerHTML = '';
    visible.forEach((food) => {
      const used = snapshot.usage[food.target];
      const zone = ZONE_META[food.target];
      const full = used >= zone.capacity;
      const count = snapshot.items.filter((item) => item.foodId === food.id).length;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `food-card${full ? ' food-card--disabled' : ''}`;
      button.disabled = full;
      button.innerHTML = `${foodIconSvg(food)}<span class="food-card__copy"><strong>${food.name}</strong><small>${full ? `${zone.shortLabel}已满` : `放入${zone.shortLabel}`}</small></span>${count ? `<span class="food-card__count">${count}</span>` : ''}`;
      button.addEventListener('click', () => addFood(food));
      elements.foodGrid.appendChild(button);
    });
    if (!visible.length) elements.foodGrid.innerHTML = '<p class="empty-state">没有找到匹配的食材</p>';
  }

  function renderInventory(snapshot) {
    elements.inventorySections.innerHTML = '';
    Object.values(ZONE_META).forEach((zone) => {
      const section = document.createElement('section');
      section.className = 'inventory-zone';
      const zoneItems = snapshot.items.filter((item) => item.zone === zone.id);
      section.innerHTML = `<header><div><h3>${zone.label}</h3><span>${zoneItems.length} / ${zone.capacity}</span></div><div class="mini-meter"><b style="width:${(zoneItems.length / zone.capacity) * 100}%"></b></div></header>`;
      const grouped = groupByFood(zoneItems);
      if (!grouped.length) section.insertAdjacentHTML('beforeend', '<p class="empty-state empty-state--small">这里还是空的</p>');
      grouped.forEach(({ foodId, items }) => {
        const food = catalogById.get(foodId);
        const row = document.createElement('div');
        row.className = 'inventory-row';
        row.innerHTML = `<span class="inventory-row__icon">${foodIconSvg(food)}</span><span class="inventory-row__copy"><strong>${food.name}</strong><small>${items.length} ${food.unit}</small></span><button class="remove-one" type="button" aria-label="移除一个${food.name}">−</button>`;
        row.querySelector('.remove-one').addEventListener('click', () => {
          const result = store.removeOne(foodId);
          if (result.ok) { scene.removeItem(result.item.instanceId); showToast(`已移除一个${food.name}`); }
        });
        section.appendChild(row);
      });
      elements.inventorySections.appendChild(section);
    });
  }

  function addFood(food) {
    const result = store.add(food);
    if (!result.ok) { showToast(`${ZONE_META[result.zone].label}已经放满了`); return; }
    scene.openForZone(food.target);
    const slot = SLOT_LAYOUT[result.item.zone][result.item.slot];
    const depthCopy = slot?.depthLabel && slot.depthLabel !== '门架' ? ` · ${slot.depthLabel}` : '';
    showToast(`${food.name}已放入${ZONE_META[food.target].label}${depthCopy}`);
  }

  function selectItem(instanceId) {
    const item = store.getSnapshot().items.find((entry) => entry.instanceId === instanceId);
    if (!item) return;
    selectedInstanceId = instanceId;
    const food = getFoodById(item.foodId);
    const slot = SLOT_LAYOUT[item.zone]?.[item.slot];
    const shelfCopy = slot?.shelf != null ? `第 ${slot.shelf + 1} 层` : `第 ${item.slot + 1} 个位置`;
    const depthCopy = slot?.depthLabel ? ` · ${slot.depthLabel}` : '';
    elements.itemSheetIcon.innerHTML = foodIconSvg(food);
    elements.itemSheetName.textContent = food.name;
    elements.itemSheetMeta.textContent = `${ZONE_META[item.zone].label} · ${shelfCopy}${depthCopy}`;
    elements.itemSheet.classList.add('open');
    elements.itemSheet.setAttribute('aria-hidden', 'false');
  }

  function removeSelected() {
    if (!selectedInstanceId) return;
    const item = store.getSnapshot().items.find((entry) => entry.instanceId === selectedInstanceId);
    const food = item ? getFoodById(item.foodId) : null;
    const result = store.remove(selectedInstanceId);
    if (result.ok) { scene.removeItem(selectedInstanceId); showToast(`已移除${food?.name ?? '食材'}`); }
    closeItemSheet();
  }

  function closeItemSheet() {
    selectedInstanceId = null;
    elements.itemSheet.classList.remove('open');
    elements.itemSheet.setAttribute('aria-hidden', 'true');
  }

  function setPanel(panel) {
    activePanel = panel;
    elements.foodDrawer.classList.toggle('open', panel === 'food');
    elements.inventoryDrawer.classList.toggle('open', panel === 'inventory');
    elements.foodDrawer.setAttribute('aria-hidden', String(panel !== 'food'));
    elements.inventoryDrawer.setAttribute('aria-hidden', String(panel !== 'inventory'));
    elements.foodToggle.setAttribute('aria-expanded', String(panel === 'food'));
    elements.inventoryToggle.setAttribute('aria-expanded', String(panel === 'inventory'));
    closeItemSheet();
  }

  function openModal(modal) {
    closeModals();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    elements.scrim.hidden = false;
    requestAnimationFrame(() => elements.scrim.classList.add('open'));
  }

  function closeModals() {
    document.querySelectorAll('.modal-sheet.open').forEach((modal) => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); });
    elements.scrim.classList.remove('open');
    setTimeout(() => { if (!document.querySelector('.modal-sheet.open')) elements.scrim.hidden = true; }, 180);
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    toastTimer = setTimeout(() => elements.toast.classList.remove('show'), 1800);
  }

  return { selectItem, hideGestureHint: () => elements.gestureHint.classList.add('hidden'), destroy: unsubscribe };
}

function collectElements() {
  return Object.fromEntries([
    'foodToggle', 'inventoryToggle', 'foodDrawer', 'inventoryDrawer', 'foodDrawerClose', 'inventoryDrawerClose', 'foodSearch', 'foodGrid', 'categoryTabs', 'inventoryCount', 'zoneMeters', 'inventorySections', 'zoomInButton', 'zoomOutButton', 'resetViewButton', 'helpButton', 'resetButton', 'helpSheet', 'confirmSheet', 'confirmReset', 'scrim', 'itemSheet', 'itemSheetIcon', 'itemSheetName', 'itemSheetMeta', 'removeSelectedItem', 'itemSheetClose', 'toast', 'gestureHint',
  ].map((id) => [id, document.getElementById(id)]));
}

function groupByFood(items) {
  const groups = new Map();
  items.forEach((item) => groups.set(item.foodId, [...(groups.get(item.foodId) ?? []), item]));
  return [...groups.entries()].map(([foodId, groupedItems]) => ({ foodId, items: groupedItems }));
}

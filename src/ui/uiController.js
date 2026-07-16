import { FOOD_CATALOG, FOOD_CATEGORIES, ZONE_META, getFoodById } from '../data/foodCatalog.js';
import { SLOT_LAYOUT } from '../scene/fridgeLayout.js';
import { foodIconSvg } from './foodIcon.js';

export function createUIController({ store, scene }) {
  const elements = collectElements();
  const catalogById = new Map(FOOD_CATALOG.map((food) => [food.id, food]));
  const foodToggleLabel = elements.foodToggle.querySelector('span');
  let activeCategory = 'all';
  let searchTerm = '';
  let selectedInstanceId = null;
  let activePanel = null;
  let toastTimer;
  let repairing = false;
  let sessionAddedCount = 0;
  let lastAdded = null;
  let flashFoodId = null;
  let flashTimer;

  FOOD_CATEGORIES.forEach((category) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `category-tab${category.id === activeCategory ? ' active' : ''}`;
    button.textContent = category.label;
    button.dataset.category = category.id;
    button.addEventListener('click', () => {
      activeCategory = category.id;
      renderFoodGrid(store.getSnapshot(), { preserveScroll: false });
    });
    elements.categoryTabs.appendChild(button);
  });

  elements.foodToggle.addEventListener('click', () => {
    if (activePanel === 'food') setPanel(null);
    else {
      beginAddSession();
      setPanel('food');
    }
  });
  elements.inventoryToggle.addEventListener('click', () => setPanel(activePanel === 'inventory' ? null : 'inventory'));
  elements.foodDrawerClose.addEventListener('click', () => setPanel(null));
  elements.inventoryDrawerClose.addEventListener('click', () => setPanel(null));
  elements.foodSearch.addEventListener('input', (event) => {
    searchTerm = event.target.value.trim().toLowerCase();
    renderFoodGrid(store.getSnapshot(), { preserveScroll: false });
  });
  elements.zoomInButton.addEventListener('click', scene.zoomIn);
  elements.zoomOutButton.addEventListener('click', scene.zoomOut);
  elements.resetViewButton.addEventListener('click', scene.resetView);
  elements.helpButton.addEventListener('click', () => openModal(elements.helpSheet));
  elements.resetButton.addEventListener('click', () => openModal(elements.confirmSheet));
  elements.confirmReset.addEventListener('click', () => {
    store.clear();
    closeModals();
    setPanel(null);
    closeItemSheet();
    beginAddSession();
    showToast('冰箱已经清空');
  });
  document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', closeModals));
  elements.scrim.addEventListener('click', closeModals);
  elements.removeSelectedItem.addEventListener('click', removeSelected);
  elements.itemSheetClose.addEventListener('click', closeItemSheet);
  elements.undoLastAdded.addEventListener('click', undoLastAddition);
  document.addEventListener('keydown', handleKeydown);

  const unsubscribe = store.subscribe(render);
  beginAddSession();
  render(store.getSnapshot());

  function render(snapshot) {
    const failedIds = scene.syncInventory(snapshot.items, catalogById);
    if (failedIds.length && !repairing) {
      repairing = true;
      store.removeMany(failedIds);
      repairing = false;
      showToast(`已自动清理 ${failedIds.length} 个无法显示的库存项`);
      return;
    }
    if (lastAdded && !snapshot.items.some((item) => item.instanceId === lastAdded.instanceId)) {
      lastAdded = null;
      updateAddStatus(sessionAddedCount ? `本次已添加 ${sessionAddedCount} 件` : undefined);
    }
    renderCapacity(snapshot);
    renderFoodGrid(snapshot, { preserveScroll: true });
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

  function renderFoodGrid(snapshot, { preserveScroll = true } = {}) {
    const previousScroll = preserveScroll ? elements.foodGrid.scrollTop : 0;
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
      const nextSlotIndex = findFirstFreeSlot(snapshot.items, food.target);
      const nextSlot = nextSlotIndex >= 0 ? SLOT_LAYOUT[food.target]?.[nextSlotIndex] : null;
      const full = nextSlotIndex < 0 || used >= zone.capacity;
      const count = snapshot.items.filter((item) => item.foodId === food.id).length;
      const placementCopy = full
        ? `${zone.shortLabel}已满`
        : `放入${zone.shortLabel}${nextSlot?.depthLabel && nextSlot.depthLabel !== '门架' ? ` · ${nextSlot.depthLabel}` : ''}`;
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.foodId = food.id;
      button.className = `food-card${full ? ' food-card--disabled' : ''}${flashFoodId === food.id ? ' food-card--added' : ''}`;
      button.disabled = full;
      button.innerHTML = `${foodIconSvg(food)}<span class="food-card__copy"><strong>${food.name}</strong><small>${placementCopy}</small></span>${count ? `<span class="food-card__count">${count}</span>` : ''}`;
      button.addEventListener('click', () => addFood(food));
      elements.foodGrid.appendChild(button);
    });
    if (!visible.length) elements.foodGrid.innerHTML = '<p class="empty-state">没有找到匹配的食材</p>';
    requestAnimationFrame(() => { elements.foodGrid.scrollTop = previousScroll; });
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
        if (!food) return;
        const frontCount = items.filter((item) => SLOT_LAYOUT[item.zone]?.[item.slot]?.depth === 'front').length;
        const backCount = items.filter((item) => SLOT_LAYOUT[item.zone]?.[item.slot]?.depth === 'back').length;
        const depthSummary = zone.id === 'door' ? '' : ` · 前${frontCount} 后${backCount}`;
        const row = document.createElement('div');
        row.className = 'inventory-row';
        row.innerHTML = `<span class="inventory-row__icon">${foodIconSvg(food)}</span><span class="inventory-row__copy"><strong>${food.name}</strong><small>${items.length} ${food.unit}${depthSummary}</small></span><button class="remove-one" type="button" aria-label="移除一个${food.name}">−</button>`;
        row.querySelector('.remove-one').addEventListener('click', () => {
          const result = store.removeOne(foodId);
          if (result.ok) {
            scene.removeItem(result.item.instanceId);
            showToast(`已移除一个${food.name}`);
          }
        });
        section.appendChild(row);
      });
      elements.inventorySections.appendChild(section);
    });
  }

  function addFood(food) {
    const prepared = store.prepareAdd(food);
    if (!prepared.ok) {
      const zoneLabel = ZONE_META[prepared.zone]?.label ?? '该区域';
      showToast(prepared.reason === 'zone-full' ? `${zoneLabel}已经放满了` : '这个食材暂时无法添加');
      return;
    }

    const staged = scene.stageItem(food, prepared.item, { animate: true });
    if (!staged.ok) {
      showToast(`${food.name}模型加载失败，未占用冰箱容量`);
      return;
    }

    flashFoodId = food.id;
    const committed = store.commitPrepared(prepared.item);
    if (!committed.ok) {
      flashFoodId = null;
      scene.removeItem(prepared.item.instanceId);
      showToast('存放位置刚刚发生变化，请再试一次');
      return;
    }

    sessionAddedCount += 1;
    lastAdded = { instanceId: prepared.item.instanceId, foodId: food.id };
    const slot = SLOT_LAYOUT[prepared.item.zone][prepared.item.slot];
    scene.revealItem(prepared.item.instanceId, food.target);
    const depthCopy = slot?.depthLabel && slot.depthLabel !== '门架' ? ` · ${slot.depthLabel}` : '';
    const shelfCopy = slot?.shelf != null ? `第${slot.shelf + 1}层` : '';
    updateAddStatus(`已添加 ${food.name}${shelfCopy ? ` · ${shelfCopy}` : ''}${depthCopy}`);
    scheduleFlashClear();
    tryHaptic(12);
  }

  function undoLastAddition() {
    if (!lastAdded) return;
    const food = getFoodById(lastAdded.foodId);
    const result = store.remove(lastAdded.instanceId);
    if (!result.ok) {
      lastAdded = null;
      updateAddStatus();
      return;
    }
    scene.removeItem(lastAdded.instanceId);
    sessionAddedCount = Math.max(0, sessionAddedCount - 1);
    lastAdded = null;
    updateAddStatus(`已撤销${food?.name ? ` ${food.name}` : '上一次添加'}`);
    tryHaptic(8);
  }

  function beginAddSession() {
    sessionAddedCount = 0;
    lastAdded = null;
    flashFoodId = null;
    clearTimeout(flashTimer);
    updateAddStatus();
  }

  function updateAddStatus(message) {
    elements.foodDrawerStatusText.textContent = message ?? '可连续添加，面板不会自动关闭';
    elements.foodDrawerStatus.classList.toggle('food-drawer-status--active', Boolean(lastAdded));
    elements.undoLastAdded.disabled = !lastAdded;
  }

  function scheduleFlashClear() {
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => {
      flashFoodId = null;
      document.querySelectorAll('.food-card--added').forEach((card) => card.classList.remove('food-card--added'));
    }, 760);
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
    if (result.ok) {
      scene.removeItem(selectedInstanceId);
      showToast(`已移除${food?.name ?? '食材'}`);
    }
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
    if (foodToggleLabel) foodToggleLabel.textContent = panel === 'food' ? '添加中' : '添加';
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
    document.querySelectorAll('.modal-sheet.open').forEach((modal) => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    });
    elements.scrim.classList.remove('open');
    setTimeout(() => {
      if (!document.querySelector('.modal-sheet.open')) elements.scrim.hidden = true;
    }, 180);
  }

  function handleKeydown(event) {
    if (event.key !== 'Escape') return;
    if (document.querySelector('.modal-sheet.open')) closeModals();
    else if (activePanel) setPanel(null);
    else closeItemSheet();
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    toastTimer = setTimeout(() => elements.toast.classList.remove('show'), 1800);
  }

  function tryHaptic(duration) {
    try { globalThis.navigator?.vibrate?.(duration); } catch { /* Optional feedback only. */ }
  }

  function destroy() {
    clearTimeout(toastTimer);
    clearTimeout(flashTimer);
    document.removeEventListener('keydown', handleKeydown);
    unsubscribe();
  }

  return { selectItem, hideGestureHint: () => elements.gestureHint.classList.add('hidden'), destroy };
}

function collectElements() {
  return Object.fromEntries([
    'foodToggle', 'inventoryToggle', 'foodDrawer', 'inventoryDrawer', 'foodDrawerClose', 'inventoryDrawerClose', 'foodSearch', 'foodGrid', 'categoryTabs', 'foodDrawerStatus', 'foodDrawerStatusText', 'undoLastAdded', 'inventoryCount', 'zoneMeters', 'inventorySections', 'zoomInButton', 'zoomOutButton', 'resetViewButton', 'helpButton', 'resetButton', 'helpSheet', 'confirmSheet', 'confirmReset', 'scrim', 'itemSheet', 'itemSheetIcon', 'itemSheetName', 'itemSheetMeta', 'removeSelectedItem', 'itemSheetClose', 'toast', 'gestureHint',
  ].map((id) => [id, document.getElementById(id)]));
}

function groupByFood(items) {
  const groups = new Map();
  items.forEach((item) => groups.set(item.foodId, [...(groups.get(item.foodId) ?? []), item]));
  return [...groups.entries()].map(([foodId, groupedItems]) => ({ foodId, items: groupedItems }));
}

function findFirstFreeSlot(items, zone) {
  const occupied = new Set(items.filter((item) => item.zone === zone).map((item) => item.slot));
  const slots = SLOT_LAYOUT[zone] ?? [];
  for (let index = 0; index < slots.length; index += 1) if (!occupied.has(index)) return index;
  return -1;
}

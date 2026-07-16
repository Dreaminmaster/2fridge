import './style.css';
import './mobile-performance.css';
import { FOOD_CATALOG } from './data/foodCatalog.js';
import { createInventoryStore } from './domain/inventoryStore.js';
import { buildRecipeContext } from './domain/recipeContext.js';
import { createSceneController } from './scene/sceneController.js';
import { createUIController } from './ui/uiController.js';

const store = createInventoryStore();
const moveFridgeButton = document.getElementById('moveFridgeButton');
let ui;
const scene = createSceneController({
  canvas: document.getElementById('scene'),
  stage: document.getElementById('stage'),
  onFoodSelect: (instanceId) => ui?.selectItem(instanceId),
  onUserNavigate: () => ui?.hideGestureHint(),
  onMoveModeChange: (active) => {
    moveFridgeButton?.classList.toggle('active', active);
    moveFridgeButton?.setAttribute('aria-pressed', String(active));
    if (moveFridgeButton) moveFridgeButton.title = active ? '退出移动模式' : '移动冰箱';
  },
});
ui = createUIController({ store, scene });
moveFridgeButton?.addEventListener('click', () => scene.toggleMoveMode());

// Stable, normalized data boundary for a future recipe recommendation module.
globalThis.pocketFridge = {
  getInventory: () => store.getSnapshot(),
  getRecipeContext: () => buildRecipeContext(store.getSnapshot().items, FOOD_CATALOG),
};

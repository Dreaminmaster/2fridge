import './style.css';
import './mobile-performance.css';
import './desktop-polish.css';
import { FOOD_CATALOG } from './data/foodCatalog.js';
import { createInventoryStore } from './domain/inventoryStore.js';
import { buildRecipeContext } from './domain/recipeContext.js';
import { createSceneController } from './scene/sceneController.js';
import { createUIController } from './ui/uiController.js';

const store = createInventoryStore();
let ui;
const scene = createSceneController({
  canvas: document.getElementById('scene'),
  stage: document.getElementById('stage'),
  onFoodSelect: (instanceId) => ui?.selectItem(instanceId),
  onUserNavigate: () => ui?.hideGestureHint(),
});
ui = createUIController({ store, scene });

globalThis.pocketFridge = {
  getInventory: () => store.getSnapshot(),
  getRecipeContext: () => buildRecipeContext(store.getSnapshot().items, FOOD_CATALOG),
};

import './style.css';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { foodItems, categories } from './foodData.js';

const STORAGE_KEY = 'pocket-fridge-v1';
const appState = {
  upperOpen: false,
  lowerOpen: false,
  drawerOpen: false,
  filter: 'all',
  inventory: loadInventory(),
};

const els = {
  canvas: document.querySelector('#scene'),
  stage: document.querySelector('#stage'),
  foodToggle: document.querySelector('#foodToggle'),
  foodDrawer: document.querySelector('#foodDrawer'),
  drawerClose: document.querySelector('#drawerClose'),
  foodGrid: document.querySelector('#foodGrid'),
  categoryTabs: document.querySelector('#categoryTabs'),
  statusText: document.querySelector('#statusText'),
  inventoryBadge: document.querySelector('#inventoryBadge'),
  inventoryCount: document.querySelector('#inventoryCount'),
  peekItems: document.querySelector('#peekItems'),
  inventoryPeek: document.querySelector('#inventoryPeek'),
  toast: document.querySelector('#toast'),
  tapHint: document.querySelector('#tapHint'),
  helpButton: document.querySelector('#helpButton'),
  helpSheet: document.querySelector('#helpSheet'),
  resetButton: document.querySelector('#resetButton'),
  confirmSheet: document.querySelector('#confirmSheet'),
  confirmReset: document.querySelector('#confirmReset'),
};

const renderer = new THREE.WebGLRenderer({ canvas: els.canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#efcf98');
scene.fog = new THREE.Fog('#efcf98', 11, 25);

const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const clock = new THREE.Clock();
const clickableDoors = [];
const animatedFoods = [];
const foodMeshes = new Map();
const occupied = { fridge: 0, freezer: 0, door: 0 };
let toastTimer;
let dragStart = null;

const palette = {
  mint: '#83ad8f', mintDark: '#5d846d', cream: '#f6ead0', inner: '#f3e7cd', white: '#fff9e9', metal: '#d4c8ad', floor: '#b76b35', floorLine: '#8f4e29', wall: '#efcf98', green: '#5f8b4d', pot: '#a95b32', dark: '#634c40', shadow: '#a65e34',
};

const materials = {
  mint: toon(palette.mint),
  mintDark: toon(palette.mintDark),
  cream: toon(palette.cream),
  inner: toon(palette.inner),
  white: toon(palette.white),
  metal: toon(palette.metal),
  dark: toon(palette.dark),
  glass: new THREE.MeshStandardMaterial({ color: '#dfe9df', transparent: true, opacity: .32, roughness: .26, metalness: 0, side: THREE.DoubleSide }),
};

setupLights();
setupRoom();
const fridge = createFridge();
scene.add(fridge.group);
restoreInventoryModels();
setupUI();
resize();
window.addEventListener('resize', resize, { passive: true });
els.canvas.addEventListener('pointerdown', onPointerDown);
els.canvas.addEventListener('pointerup', onPointerUp);
els.canvas.addEventListener('pointercancel', () => { dragStart = null; });
renderer.setAnimationLoop(render);

function toon(color, options = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: .82, metalness: 0, flatShading: true, ...options });
}

function rounded(w, h, d, radius, mat) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, radius), mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function setupLights() {
  const hemi = new THREE.HemisphereLight('#fff6da', '#8d603d', 2.3);
  scene.add(hemi);
  const key = new THREE.DirectionalLight('#fff1ce', 3.2);
  key.position.set(-4, 8, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1536, 1536);
  key.shadow.camera.left = -7; key.shadow.camera.right = 7; key.shadow.camera.top = 9; key.shadow.camera.bottom = -5;
  key.shadow.bias = -0.0003;
  scene.add(key);
  const fill = new THREE.PointLight('#ffdca7', 1.2, 14);
  fill.position.set(4, 3, 4);
  scene.add(fill);
}

function setupRoom() {
  const floorMat = toon(palette.floor);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -3.32;
  floor.receiveShadow = true;
  scene.add(floor);

  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 18), toon(palette.wall));
  wall.position.set(0, 3.5, -4.5);
  wall.receiveShadow = true;
  scene.add(wall);

  for (let i = -10; i <= 10; i++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(.025, .015, 30), toon(palette.floorLine));
    line.position.set(i * 1.1, -3.305, 0);
    line.rotation.y = .12;
    scene.add(line);
  }

  const baseboard = rounded(30, .42, .25, .08, toon('#6f7d4c'));
  baseboard.position.set(0, -2.92, -4.3);
  scene.add(baseboard);

  const plant = new THREE.Group();
  const pot = rounded(1.35, 1.25, 1.35, .18, toon(palette.pot));
  pot.position.y = -2.7;
  plant.add(pot);
  const trunkMat = toon('#6f4b32');
  const leafMat = toon(palette.green);
  for (let i = 0; i < 4; i++) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.06, .09, 2.7, 7), trunkMat);
    trunk.position.set((i - 1.5) * .18, -1.4 + i * .07, 0);
    trunk.rotation.z = (i - 1.5) * .12;
    plant.add(trunk);
    for (let j = 0; j < 3; j++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(.58, 5, 4), leafMat);
      leaf.scale.set(1, .42, .45);
      leaf.position.set((i - 1.5) * .25 + (j - 1) * .5, -.5 + i * .36 + j * .4, (j % 2 ? .18 : -.15));
      leaf.rotation.z = (j - 1) * .6;
      plant.add(leaf);
    }
  }
  plant.position.set(3.8, 0, -1.5);
  plant.scale.setScalar(.88);
  scene.add(plant);
}

function createFridge() {
  const group = new THREE.Group();
  group.rotation.y = -.16;
  group.position.set(-.35, -.05, 0);

  // The cabinet is assembled from separate panels so the interior remains truly hollow.
  const backPanel = rounded(5.2, 8.45, .28, .18, materials.mintDark);
  backPanel.position.set(0, .7, -1.48);
  group.add(backPanel);

  const leftWall = rounded(.42, 8.45, 3.1, .18, materials.mint);
  leftWall.position.set(-2.42, .7, 0);
  const rightWall = leftWall.clone();
  rightWall.position.x = 2.42;
  group.add(leftWall, rightWall);

  const topPanel = rounded(5.15, .42, 3.1, .18, materials.mint);
  topPanel.position.set(0, 4.72, 0);
  const bottomPanel = topPanel.clone();
  bottomPanel.position.y = -3.32;
  group.add(topPanel, bottomPanel);

  const innerBackTop = rounded(4.55, 4.98, .12, .08, materials.inner);
  innerBackTop.position.set(0, 2.02, -1.29);
  const innerBackBottom = rounded(4.55, 2.55, .12, .08, materials.inner);
  innerBackBottom.position.set(0, -2.28, -1.29);
  group.add(innerBackTop, innerBackBottom);

  const divider = rounded(4.82, .28, 2.92, .08, materials.cream);
  divider.position.set(0, -1.0, .02);
  group.add(divider);

  const innerTop = rounded(4.62, .18, 2.75, .07, materials.cream);
  innerTop.position.set(0, 4.42, .02);
  const innerBottom = rounded(4.62, .18, 2.75, .07, materials.cream);
  innerBottom.position.set(0, -3.05, .02);
  group.add(innerTop, innerBottom);

  // Front trim around the two open cavities.
  const trimSpecs = [
    [-2.18, 2.02, .18, 4.95], [2.18, 2.02, .18, 4.95],
    [0, 4.42, 4.48, .18], [0, -.56, 4.48, .18],
    [-2.18, -2.28, .18, 2.55], [2.18, -2.28, .18, 2.55],
    [0, -1.10, 4.48, .18], [0, -3.47, 4.48, .18],
  ];
  trimSpecs.forEach(([x, y, w, h]) => {
    const trim = rounded(w, h, .22, .06, materials.cream);
    trim.position.set(x, y, 1.43);
    group.add(trim);
  });

  const shelfPositions = [2.95, 1.75, .57];
  shelfPositions.forEach((y) => {
    const shelf = rounded(4.0, .11, 2.48, .04, materials.white);
    shelf.position.set(0, y, .08);
    group.add(shelf);
  });

  const freezerShelf = rounded(4.0, .11, 2.48, .04, materials.white);
  freezerShelf.position.set(0, -2.33, .08);
  group.add(freezerShelf);

  const topLight = new THREE.PointLight('#fff4c9', .8, 4);
  topLight.position.set(0, 3.55, .65);
  group.add(topLight);

  const feet = [[-2.05, -3.63], [2.05, -3.63]];
  feet.forEach(([x, y]) => {
    const foot = rounded(.45, .35, .55, .08, materials.dark);
    foot.position.set(x, y, .35);
    group.add(foot);
  });

  const upperDoor = createDoor({ y: 2.02, height: 4.98, name: 'upper-door', racks: 3 });
  const lowerDoor = createDoor({ y: -2.30, height: 2.72, name: 'lower-door', racks: 1 });
  group.add(upperDoor.pivot, lowerDoor.pivot);

  const handleTop = rounded(.28, 1.25, .28, .08, materials.cream);
  handleTop.position.set(-4.13, .06, .31);
  upperDoor.pivot.add(handleTop);
  const handleBottom = rounded(.28, .86, .28, .08, materials.cream);
  handleBottom.position.set(-4.13, .02, .31);
  lowerDoor.pivot.add(handleBottom);

  return { group, upperDoor, lowerDoor };
}

function createDoor({ y, height, name, racks }) {
  const pivot = new THREE.Group();
  pivot.position.set(2.38, y, 1.53);
  const panel = rounded(4.75, height, .38, .28, materials.mint);
  panel.position.set(-2.38, 0, .18);
  panel.userData.doorName = name;
  panel.userData.isDoor = true;
  clickableDoors.push(panel);
  pivot.add(panel);

  const innerPanel = rounded(4.15, height - .48, .18, .20, materials.cream);
  innerPanel.position.set(-2.38, 0, -.05);
  pivot.add(innerPanel);

  for (let i = 0; i < racks; i++) {
    const rack = new THREE.Group();
    const rackBack = rounded(3.5, .62, .12, .08, materials.white);
    rackBack.position.set(-2.38, (i - (racks - 1) / 2) * 1.22, -.26);
    const rail = rounded(3.52, .18, .48, .06, materials.white);
    rail.position.set(-2.38, rackBack.position.y - .25, -.48);
    rack.add(rackBack, rail);
    pivot.add(rack);
  }

  const hingeA = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, .5, 8), materials.metal);
  hingeA.position.set(-.03, height * .28, 0);
  const hingeB = hingeA.clone(); hingeB.position.y = -height * .28;
  pivot.add(hingeA, hingeB);

  return { pivot, panel, name };
}

function setupUI() {
  categories.forEach((category) => {
    const button = document.createElement('button');
    button.className = `category-tab${category.id === appState.filter ? ' active' : ''}`;
    button.textContent = category.label;
    button.dataset.category = category.id;
    button.role = 'tab';
    button.addEventListener('click', () => {
      appState.filter = category.id;
      document.querySelectorAll('.category-tab').forEach((el) => el.classList.toggle('active', el.dataset.category === category.id));
      renderFoodGrid();
    });
    els.categoryTabs.appendChild(button);
  });
  renderFoodGrid();
  updateInventoryUI();

  els.foodToggle.addEventListener('click', toggleDrawer);
  els.drawerClose.addEventListener('click', () => setDrawer(false));
  els.helpButton.addEventListener('click', () => openSheet(els.helpSheet));
  document.querySelectorAll('[data-close-help]').forEach((el) => el.addEventListener('click', () => closeSheet(els.helpSheet)));
  els.resetButton.addEventListener('click', () => openSheet(els.confirmSheet));
  document.querySelectorAll('[data-close-confirm]').forEach((el) => el.addEventListener('click', () => closeSheet(els.confirmSheet)));
  els.confirmReset.addEventListener('click', resetInventory);
}

function renderFoodGrid() {
  els.foodGrid.innerHTML = '';
  const filtered = foodItems.filter((item) => appState.filter === 'all' || item.category === appState.filter);
  filtered.forEach((item) => {
    const count = appState.inventory[item.id] || 0;
    const button = document.createElement('button');
    button.className = `food-card${count ? ' selected' : ''}`;
    button.dataset.foodId = item.id;
    button.innerHTML = `${foodIconSvg(item)}<span class="food-name">${item.name}</span>${count ? `<span class="food-count">${count}</span>` : ''}`;
    button.addEventListener('click', () => addFood(item, button));
    els.foodGrid.appendChild(button);
  });
}

function foodIconSvg(item) {
  const [a, b] = item.palette;
  const common = `class="food-icon" viewBox="0 0 100 100" aria-hidden="true"`;
  const shadow = `<ellipse cx="50" cy="81" rx="27" ry="7" fill="rgba(92,60,42,.12)"/>`;
  const facets = (path, color = a) => `<path d="${path}" fill="${color}"/><path d="M50 18 68 34 58 64 31 57Z" fill="${b}" opacity=".28"/>`;
  switch (item.model) {
    case 'meatStrip': return `<svg ${common}>${shadow}<g transform="rotate(-16 50 50)"><rect x="25" y="30" width="17" height="48" rx="6" fill="${a}"/><rect x="52" y="24" width="17" height="54" rx="6" fill="${b}"/><path d="M29 38h9M56 34h9" stroke="#f1b2a4" stroke-width="4" stroke-linecap="round"/></g></svg>`;
    case 'cubes': return `<svg ${common}>${shadow}<g fill="${a}" stroke="${b}" stroke-width="2"><path d="M26 41 43 32l16 9-16 10Z"/><path d="m43 51 16-10v20L43 71Z"/><path d="m26 41 17 10v20L26 61Z"/><path d="M53 31 68 23l14 8-14 9Z"/><path d="m68 40 14-9v18l-14 9Z"/></g></svg>`;
    case 'drumstick': return `<svg ${common}>${shadow}<path d="M34 69c-12-9-9-29 8-41 16-10 31 1 28 16-3 18-22 34-36 25Z" fill="${a}"/><path d="m66 33 12-12c3-3 8 2 5 6l-11 13" stroke="${b}" stroke-width="8" stroke-linecap="round"/></svg>`;
    case 'wing': return `<svg ${common}>${shadow}<path d="M27 62c1-25 23-42 35-29 10 11-2 25-13 31-9 5-20 8-22-2Z" fill="${a}"/><path d="M50 64c6-20 24-27 31-17 7 10-8 27-31 17Z" fill="${b}" opacity=".75"/></svg>`;
    case 'can': return `<svg ${common}>${shadow}<ellipse cx="50" cy="28" rx="23" ry="8" fill="#d9d3c5"/><rect x="27" y="28" width="46" height="46" rx="5" fill="${a}"/><ellipse cx="50" cy="74" rx="23" ry="8" fill="${b}"/><path d="M30 42h40" stroke="#fff" stroke-width="6" opacity=".55"/></svg>`;
    case 'onion': return `<svg ${common}>${shadow}<path d="M50 17c5 10 22 12 23 35 1 21-10 29-23 29S26 73 27 52c1-23 18-25 23-35Z" fill="${a}"/><path d="M50 17c-3 15-6 39 0 64M50 17c8 17 14 40 7 62" stroke="${b}" stroke-width="4" fill="none" opacity=".65"/><path d="M48 18c-5-8 1-12 7-13" stroke="#6c8b4b" stroke-width="5"/></svg>`;
    case 'greens': return `<svg ${common}>${shadow}<g stroke="${a}" stroke-width="8" stroke-linecap="round"><path d="M30 72 45 25"/><path d="M41 75 51 20"/><path d="M51 74 60 25"/><path d="M61 72 69 31"/></g><path d="M27 69h39" stroke="${b}" stroke-width="7" stroke-linecap="round"/></svg>`;
    case 'box': return `<svg ${common}>${shadow}<path d="M24 38 53 24l25 13-29 15Z" fill="${b}"/><path d="m24 38 25 14v27L24 65Z" fill="${a}"/><path d="m49 52 29-15v27L49 79Z" fill="${a}" opacity=".78"/></svg>`;
    case 'carton': return `<svg ${common}>${shadow}<path d="m31 31 13-13h22l8 14v47H31Z" fill="${a}"/><path d="M31 31h43v17H31Z" fill="${b}"/><path d="m44 18 7 13" stroke="${b}" stroke-width="4"/><circle cx="53" cy="62" r="10" fill="${b}" opacity=".22"/></svg>`;
    case 'eggs': return `<svg ${common}>${shadow}<path d="M22 57h56l-5 21H27Z" fill="${b}"/><g fill="${a}"><ellipse cx="32" cy="49" rx="10" ry="14"/><ellipse cx="50" cy="46" rx="10" ry="15"/><ellipse cx="68" cy="49" rx="10" ry="14"/></g></svg>`;
    case 'bottle': return `<svg ${common}>${shadow}<path d="M43 20h14v12l8 11v35H35V43l8-11Z" fill="${a}"/><rect x="42" y="14" width="16" height="10" rx="3" fill="${b}"/><rect x="38" y="48" width="24" height="18" rx="5" fill="#f2d6ad" opacity=".78"/></svg>`;
    default: return `<svg ${common}>${shadow}${facets('M50 18 76 42 67 73 34 78 22 46Z')}</svg>`;
  }
}

function addFood(item, button) {
  appState.inventory[item.id] = (appState.inventory[item.id] || 0) + 1;
  occupied[item.target] += 1;
  saveInventory();
  const mesh = createFoodModel(item, occupied[item.target] - 1);
  foodMeshes.set(`${item.id}-${appState.inventory[item.id]}`, mesh);
  getFoodParent(item.target).add(mesh);
  animatedFoods.push({ mesh, age: 0 });
  openDoorForTarget(item.target);
  updateInventoryUI();
  renderFoodGrid();
  showToast(`${item.name}已放入${targetLabel(item.target)}`);
  button?.animate?.([{ transform: 'scale(1)' }, { transform: 'scale(.9)' }, { transform: 'scale(1)' }], { duration: 250 });
}

function createFoodModel(item, index) {
  const group = new THREE.Group();
  group.userData.foodId = item.id;
  const [a, b] = item.palette;
  const matA = toon(a);
  const matB = toon(b);
  const matBone = toon('#efe0bf');

  const add = (mesh) => { mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh; };
  switch (item.model) {
    case 'meatStrip':
      for (let i = 0; i < 3; i++) { const m = rounded(.5, .14, .9, .07, i % 2 ? matB : matA); m.position.x = (i - 1) * .42; m.rotation.y = .1 * i; add(m); }
      break;
    case 'cubes':
      for (let i = 0; i < 5; i++) { const m = rounded(.38, .35, .38, .06, i % 2 ? matB : matA); m.position.set((i % 3 - 1) * .35, i > 2 ? .25 : 0, Math.floor(i / 3) * .25); add(m); }
      break;
    case 'drumstick': {
      const meat = new THREE.Mesh(new THREE.SphereGeometry(.48, 6, 5), matA); meat.scale.set(1.15, .78, .85); meat.position.x = -.12; add(meat);
      const bone = new THREE.Mesh(new THREE.CylinderGeometry(.09, .12, .65, 7), matBone); bone.rotation.z = Math.PI / 2; bone.position.x = .48; add(bone); break;
    }
    case 'wing':
      for (let i = 0; i < 2; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.42, 6, 4), i ? matB : matA); m.scale.set(1.3, .45, .7); m.position.x = (i - .5) * .5; m.rotation.z = (i ? 1 : -1) * .45; add(m); }
      break;
    case 'can': {
      const can = new THREE.Mesh(new THREE.CylinderGeometry(.28, .28, .72, 10), matA); add(can);
      const rim1 = new THREE.Mesh(new THREE.TorusGeometry(.27, .025, 5, 10), matB); rim1.rotation.x = Math.PI / 2; rim1.position.y = .36; add(rim1);
      const rim2 = rim1.clone(); rim2.position.y = -.36; add(rim2); break;
    }
    case 'onion': {
      const onion = new THREE.Mesh(new THREE.SphereGeometry(.44, 7, 6), matA); onion.scale.y = 1.12; add(onion);
      const stem = new THREE.Mesh(new THREE.ConeGeometry(.12, .28, 5), toon('#69864c')); stem.position.y = .58; add(stem); break;
    }
    case 'greens':
      for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(.035, .055, .95, 5), i < 2 ? matB : matA); m.rotation.z = Math.PI / 2 + (i - 3) * .03; m.position.y = (i - 3) * .055; add(m); }
      break;
    case 'box': add(rounded(.78, .42, .58, .08, matA)); break;
    case 'carton': {
      const box = rounded(.54, .82, .45, .06, matA); add(box);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(.38, .32, 4), matB); roof.rotation.y = Math.PI / 4; roof.position.y = .56; add(roof); break;
    }
    case 'eggs':
      for (let i = 0; i < 4; i++) { const egg = new THREE.Mesh(new THREE.SphereGeometry(.19, 7, 6), matA); egg.scale.y = 1.25; egg.position.set((i - 1.5) * .23, 0, (i % 2) * .1); add(egg); }
      break;
    case 'bottle': {
      const body = new THREE.Mesh(new THREE.CylinderGeometry(.22, .28, .7, 8), matA); add(body);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(.11, .14, .28, 8), matA); neck.position.y = .47; add(neck);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .1, 8), matB); cap.position.y = .66; add(cap); break;
    }
  }

  const pos = getPlacement(item.target, index);
  group.position.copy(pos);
  group.scale.setScalar(.001);
  return group;
}

function getFoodParent(target) {
  return target === 'door' ? fridge.upperDoor.pivot : fridge.group;
}

function getPlacement(target, index) {
  if (target === 'door') {
    const rack = index % 3;
    const col = Math.floor(index / 3) % 3;
    return new THREE.Vector3(-3.05 + col * .72, 1.22 - rack * 1.22, -.62);
  }
  if (target === 'freezer') {
    const row = Math.floor(index / 4) % 2;
    const col = index % 4;
    return new THREE.Vector3(-1.35 + col * .88, -1.80 - row * 1.0, .35);
  }
  const shelf = Math.floor(index / 4) % 3;
  const col = index % 4;
  return new THREE.Vector3(-1.38 + col * .9, 3.32 - shelf * 1.18, .35);
}

function restoreInventoryModels() {
  Object.keys(occupied).forEach((k) => occupied[k] = 0);
  foodItems.forEach((item) => {
    const count = appState.inventory[item.id] || 0;
    for (let i = 0; i < count; i++) {
      const index = occupied[item.target]++;
      const mesh = createFoodModel(item, index);
      mesh.scale.setScalar(1);
      getFoodParent(item.target).add(mesh);
      foodMeshes.set(`${item.id}-${i + 1}`, mesh);
    }
  });
}

function openDoorForTarget(target) {
  if (target === 'freezer') appState.lowerOpen = true;
  else appState.upperOpen = true;
  els.tapHint.classList.add('hidden');
  updateStatus();
}

function targetLabel(target) {
  return target === 'door' ? '冰箱门内' : target === 'freezer' ? '冷冻区' : '冷藏区';
}

function toggleDrawer() { setDrawer(!appState.drawerOpen); }
function setDrawer(open) {
  appState.drawerOpen = open;
  els.foodDrawer.classList.toggle('open', open);
  els.foodDrawer.setAttribute('aria-hidden', String(!open));
  els.foodToggle.setAttribute('aria-expanded', String(open));
  els.inventoryPeek.classList.toggle('drawer-open', open);
  updateStatus();
}

function updateInventoryUI() {
  const total = Object.values(appState.inventory).reduce((a, b) => a + b, 0);
  els.inventoryBadge.textContent = total;
  els.inventoryCount.textContent = `${total} 件`;
  els.peekItems.innerHTML = '';
  const populated = foodItems.filter((item) => appState.inventory[item.id]);
  if (!populated.length) {
    els.peekItems.innerHTML = '<p class="empty-copy">还没有放入食材</p>';
  } else {
    populated.slice(0, 8).forEach((item) => {
      const chip = document.createElement('span');
      chip.className = 'peek-chip';
      chip.innerHTML = `<i style="--chip-color:${item.palette[0]}"></i>${item.name} ×${appState.inventory[item.id]}`;
      els.peekItems.appendChild(chip);
    });
  }
}

function updateStatus() {
  if (appState.drawerOpen) els.statusText.textContent = '选择食材';
  else if (appState.upperOpen || appState.lowerOpen) els.statusText.textContent = '冰箱已打开';
  else els.statusText.textContent = '轻触柜门，打开冰箱';
}

function showToast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = `✓ ${message}`;
  els.toast.classList.add('show');
  toastTimer = setTimeout(() => els.toast.classList.remove('show'), 1600);
}

function loadInventory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
function saveInventory() { localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.inventory)); }

function resetInventory() {
  appState.inventory = {};
  saveInventory();
  foodMeshes.forEach((mesh) => mesh.parent?.remove(mesh));
  foodMeshes.clear();
  Object.keys(occupied).forEach((key) => occupied[key] = 0);
  updateInventoryUI();
  renderFoodGrid();
  closeSheet(els.confirmSheet);
  showToast('冰箱已经清空');
}

function openSheet(sheet) { sheet.classList.add('open'); sheet.setAttribute('aria-hidden', 'false'); }
function closeSheet(sheet) { sheet.classList.remove('open'); sheet.setAttribute('aria-hidden', 'true'); }

function onPointerDown(event) { dragStart = { x: event.clientX, y: event.clientY }; }
function onPointerUp(event) {
  if (!dragStart) return;
  const movement = Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y);
  dragStart = null;
  if (movement > 10 || appState.drawerOpen) return;
  const rect = els.canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(clickableDoors, false)[0];
  if (!hit) return;
  if (hit.object.userData.doorName === 'upper-door') appState.upperOpen = !appState.upperOpen;
  else appState.lowerOpen = !appState.lowerOpen;
  els.tapHint.classList.add('hidden');
  updateStatus();
}

function render() {
  const dt = Math.min(clock.getDelta(), .05);
  const upperTarget = appState.upperOpen ? -1.92 : 0;
  const lowerTarget = appState.lowerOpen ? -1.80 : 0;
  fridge.upperDoor.pivot.rotation.y = damp(fridge.upperDoor.pivot.rotation.y, upperTarget, 7.5, dt);
  fridge.lowerDoor.pivot.rotation.y = damp(fridge.lowerDoor.pivot.rotation.y, lowerTarget, 7.5, dt);

  for (let i = animatedFoods.length - 1; i >= 0; i--) {
    const item = animatedFoods[i];
    item.age += dt;
    const t = Math.min(item.age / .42, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const overshoot = 1 + Math.sin(t * Math.PI) * .18;
    item.mesh.scale.setScalar(Math.max(.001, eased * overshoot));
    item.mesh.rotation.y += dt * 2;
    if (t >= 1) { item.mesh.scale.setScalar(1); animatedFoods.splice(i, 1); }
  }

  renderer.render(scene, camera);
}

function damp(current, target, lambda, dt) { return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt)); }

function resize() {
  const width = els.stage.clientWidth;
  const height = els.stage.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  const portrait = height > width * 1.1;
  if (portrait) {
    camera.position.set(8.9, 3.1, 14.4);
    camera.lookAt(-.1, .15, 0);
    camera.fov = width < 390 ? 39 : 36;
    fridge.group.scale.setScalar(width < 390 ? .88 : .96);
  } else {
    camera.position.set(10.5, 2.4, 15.8);
    camera.lookAt(-.25, .2, 0);
    camera.fov = 31;
    fridge.group.scale.setScalar(1.03);
  }
  camera.updateProjectionMatrix();
}

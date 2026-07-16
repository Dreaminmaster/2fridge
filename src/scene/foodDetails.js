import * as THREE from 'three';
import { roundedBox } from './geometry.js';
import { toon } from './materials.js';

const cream = toon('#f6ead0');
const paper = toon('#eadfc9');
const dark = toon('#5e463b');
const green = toon('#5f8747');
const silver = toon('#c9c5b8', { roughness: 0.58, metalness: 0.18 });
const white = toon('#fff8e9');

const PACKAGED_MEATS = new Set([
  'beef-strips', 'lamb-strips', 'chicken-cubes', 'pork-slices', 'ground-pork',
  'bacon', 'sausage', 'braised-pork', 'shrimp', 'dumplings', 'fish-ball',
]);

export function enhanceFoodModel(root) {
  if (root.userData.detailsApplied) return root;
  root.userData.detailsApplied = true;
  const id = root.userData.foodId;

  const add = (mesh) => {
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.userData.foodRoot = root;
    root.add(mesh);
    return mesh;
  };

  if (PACKAGED_MEATS.has(id)) addTray(add, id);

  if (['beef-strips', 'lamb-strips', 'pork-slices', 'bacon'].includes(id)) {
    for (let index = 0; index < 3; index += 1) {
      const fat = roundedBox(0.4, 0.025, 0.055, 0.015, cream);
      fat.position.set((index - 1) * 0.42, 0.105, 0.12 - index * 0.06);
      fat.rotation.y = index * 0.1;
      add(fat);
    }
  }

  if (['chicken-cubes', 'ground-pork', 'braised-pork'].includes(id)) {
    for (let index = 0; index < 3; index += 1) {
      const garnish = new THREE.Mesh(new THREE.SphereGeometry(0.035, 5, 4), id === 'braised-pork' ? green : cream);
      garnish.position.set((index - 1) * 0.25, 0.35 + (index % 2) * 0.06, 0.18);
      add(garnish);
    }
  }

  if (id === 'steak') {
    [-0.22, 0.05, 0.28].forEach((x, index) => {
      const line = roundedBox(0.42, 0.025, 0.045, 0.012, cream);
      line.position.set(x, 0.135, 0.08 - index * 0.12);
      line.rotation.y = -0.45;
      add(line);
    });
  }

  if (id === 'fish-fillet') {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 7, 5), dark);
    eye.position.set(0.38, 0.09, 0.28);
    add(eye);
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.34, 3), toon('#6f97a3'));
    fin.rotation.z = Math.PI / 2;
    fin.position.set(0.08, 0.23, 0);
    add(fin);
  }

  if (id === 'chicken-leg' || id === 'chicken-wing') {
    const highlight = roundedBox(0.38, 0.035, 0.1, 0.02, cream);
    highlight.position.set(-0.12, 0.25, 0.24);
    highlight.rotation.z = id === 'chicken-wing' ? 0.35 : -0.18;
    add(highlight);
  }

  if (id === 'shrimp') {
    [-0.36, 0, 0.36].forEach((x) => {
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 3), toon('#d56e5b'));
      tail.rotation.z = -Math.PI / 2;
      tail.position.set(x + 0.2, 0.07, 0.08);
      add(tail);
    });
  }

  if (id === 'dumplings') {
    [-0.29, 0.29].forEach((x) => {
      for (let index = 0; index < 3; index += 1) {
        const pleat = roundedBox(0.035, 0.12, 0.2, 0.012, dark);
        pleat.position.set(x + (index - 1) * 0.07, 0.13, 0.12);
        add(pleat);
      }
    });
  }

  if (['tuna', 'coke', 'sparkling-water'].includes(id)) addCanDetails(add, id);
  if (['milk', 'juice'].includes(id)) addCartonDetails(add, id);
  if (['sauce', 'water', 'ketchup', 'mayonnaise'].includes(id)) addBottleDetails(add, id);
  if (id === 'jam') addJarDetails(add);
  if (id === 'eggs') addEggTray(add);
  if (id === 'butter' || id === 'tofu') addBoxWrap(add, id);
  if (id === 'cheese') addCheeseHoles(add);
  if (id === 'ice-cream' || id === 'yogurt') addCupDetails(add, id);
  if (id === 'onion' || id === 'tomato' || id === 'apple' || id === 'lemon') addProduceHighlight(add, id);
  if (id === 'carrot') addCarrotLeaves(add);
  if (id === 'potato') addPotatoEyes(add);
  if (id === 'broccoli' || id === 'frozen-broccoli') addBroccoliLeaves(add);
  if (id === 'mushroom') addMushroomSpots(add);
  if (id === 'lettuce' || id === 'cabbage') addLeafCore(add);
  if (id === 'garlic-sprout' || id === 'chives') addGreensTie(add);
  if (id === 'banana') addBananaBunch(add);
  if (id === 'bread') addBreadScores(add);
  if (id === 'cooked-rice') addBowlDetails(add);
  if (id === 'frozen-corn') addCornLeaves(add);

  return root;
}

function addTray(add, id) {
  const trayColor = id === 'braised-pork' ? toon('#8d553f') : paper;
  const tray = roundedBox(1.35, 0.11, 0.82, 0.08, trayColor);
  tray.position.y = -0.28;
  add(tray);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.035, 4, 12), cream);
  rim.scale.set(1.32, 1, 0.8);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = -0.2;
  add(rim);
}

function addCanDetails(add, id) {
  const labelColor = id === 'coke' ? cream : id === 'tuna' ? toon('#d8e4df') : toon('#e7f2e8');
  const label = new THREE.Mesh(new THREE.CylinderGeometry(0.286, 0.286, 0.32, 12), labelColor);
  label.position.y = -0.03;
  add(label);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.255, 0.255, 0.025, 12), silver);
  top.position.y = 0.365;
  add(top);
  const tab = roundedBox(0.13, 0.025, 0.055, 0.018, dark);
  tab.position.set(0.05, 0.386, 0.02);
  tab.rotation.y = 0.35;
  add(tab);
}

function addCartonDetails(add, id) {
  const accent = id === 'milk' ? toon('#71a2a0') : toon('#c56b39');
  const panel = roundedBox(0.34, 0.34, 0.025, 0.025, accent);
  panel.position.set(0, 0.02, 0.238);
  add(panel);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.08, 8), white);
  cap.position.set(0.13, 0.72, 0.02);
  add(cap);
}

function addBottleDetails(add, id) {
  const labelColor = id === 'water' ? toon('#e6f5f6') : id === 'mayonnaise' ? toon('#d8c992') : cream;
  const label = new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.285, 0.26, 10), labelColor);
  label.position.y = -0.02;
  add(label);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.025, 5, 10), dark);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.39;
  add(collar);
}

function addJarDetails(add) {
  const label = roundedBox(0.43, 0.24, 0.025, 0.035, cream);
  label.position.set(0, -0.02, 0.31);
  add(label);
  const berry = new THREE.Mesh(new THREE.SphereGeometry(0.07, 7, 5), toon('#b84c6d'));
  berry.position.set(0, -0.02, 0.335);
  add(berry);
}

function addEggTray(add) {
  const base = roundedBox(1.02, 0.12, 0.55, 0.08, paper);
  base.position.y = -0.2;
  add(base);
  [-0.34, -0.11, 0.12, 0.35].forEach((x) => {
    const cup = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 5, 9), dark);
    cup.rotation.x = Math.PI / 2;
    cup.position.set(x, -0.08, 0.04);
    add(cup);
  });
}

function addBoxWrap(add, id) {
  const band = roundedBox(id === 'butter' ? 0.28 : 0.8, 0.44, 0.6, 0.045, id === 'butter' ? white : toon('#b8d3cb'));
  band.position.z = 0.01;
  add(band);
  const mark = roundedBox(0.18, 0.07, 0.025, 0.018, dark);
  mark.position.set(0, 0.02, 0.32);
  add(mark);
}

function addCheeseHoles(add) {
  [[-0.12, 0.11, 0.25], [0.18, -0.03, 0.23], [0.02, 0.18, -0.18]].forEach(([x, y, z], index) => {
    const hole = new THREE.Mesh(new THREE.SphereGeometry(index ? 0.07 : 0.09, 7, 5), toon('#a66e27'));
    hole.scale.z = 0.35;
    hole.position.set(x, y, z);
    add(hole);
  });
}

function addCupDetails(add, id) {
  const label = new THREE.Mesh(new THREE.CylinderGeometry(0.275, 0.235, 0.22, 10), id === 'ice-cream' ? toon('#fff2e2') : toon('#d8c9e2'));
  label.position.y = -0.02;
  add(label);
  if (id === 'ice-cream') {
    const scoop = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), toon('#f5d3dd'));
    scoop.position.y = 0.45;
    add(scoop);
  }
}

function addProduceHighlight(add, id) {
  const color = id === 'onion' ? toon('#d9b8d2') : id === 'lemon' ? toon('#fff0a2') : toon('#f3a092');
  const highlight = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), color);
  highlight.scale.set(0.6, 1.2, 0.35);
  highlight.position.set(-0.15, 0.16, 0.37);
  add(highlight);
}

function addCarrotLeaves(add) {
  for (let index = 0; index < 4; index += 1) {
    const leaf = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.34, 5), green);
    leaf.rotation.z = Math.PI / 2 + (index - 1.5) * 0.17;
    leaf.position.set(0.48, 0.04 + index * 0.015, 0);
    add(leaf);
  }
}

function addPotatoEyes(add) {
  [[-0.18, 0.17, 0.28], [0.17, 0.04, 0.35], [0.02, -0.18, 0.31]].forEach(([x, y, z]) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 5, 4), dark);
    eye.position.set(x, y, z);
    add(eye);
  });
}

function addBroccoliLeaves(add) {
  [-0.2, 0.2].forEach((x, index) => {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 4), green);
    leaf.scale.set(0.55, 1.2, 0.35);
    leaf.position.set(x, -0.18 + index * 0.04, 0.08);
    leaf.rotation.z = x < 0 ? 0.55 : -0.55;
    add(leaf);
  });
}

function addMushroomSpots(add) {
  [-0.16, 0.02, 0.17].forEach((x, index) => {
    const spot = new THREE.Mesh(new THREE.SphereGeometry(0.045 + index * 0.008, 6, 4), cream);
    spot.scale.y = 0.35;
    spot.position.set(x, 0.32 + (index % 2) * 0.04, 0.16);
    add(spot);
  });
}

function addLeafCore(add) {
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.2, 7, 5), cream);
  core.scale.set(0.75, 1.15, 0.65);
  core.position.y = -0.12;
  add(core);
}

function addGreensTie(add) {
  const tie = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.035, 5, 10), toon('#d9b66f'));
  tie.rotation.y = Math.PI / 2;
  tie.position.x = -0.05;
  add(tie);
}

function addBananaBunch(add) {
  [-0.14, 0.12].forEach((y, index) => {
    const banana = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.09, 6, 12, Math.PI * 1.3), toon(index ? '#d6b53f' : '#efcf58'));
    banana.rotation.set(Math.PI / 2, 0, 0.54 + index * 0.28);
    banana.position.y = y;
    add(banana);
  });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.22, 6), dark);
  stem.rotation.z = Math.PI / 2;
  stem.position.set(-0.35, 0.18, 0);
  add(stem);
}

function addBreadScores(add) {
  [-0.23, 0, 0.23].forEach((x) => {
    const score = roundedBox(0.1, 0.025, 0.54, 0.015, cream);
    score.position.set(x, 0.26, 0);
    score.rotation.z = -0.18;
    add(score);
  });
}

function addBowlDetails(add) {
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.035, 5, 12), dark);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.04;
  add(rim);
  for (let index = 0; index < 2; index += 1) {
    const chopstick = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.025, 0.95, 5), toon('#7b5234'));
    chopstick.rotation.z = Math.PI / 2;
    chopstick.rotation.y = 0.28 + index * 0.04;
    chopstick.position.set(0.05, 0.32 + index * 0.04, 0.02);
    add(chopstick);
  }
}

function addCornLeaves(add) {
  [-0.14, 0.14].forEach((z, index) => {
    const leaf = roundedBox(0.76, 0.045, 0.13, 0.025, green);
    leaf.position.set(0, -0.14, z);
    leaf.rotation.y = index ? -0.18 : 0.18;
    add(leaf);
  });
}

import * as THREE from 'three';
import { roundedBox } from './geometry.js';
import { toon } from './materials.js';

/**
 * A final, lightweight detail pass for existing food models. It adds small
 * silhouette and packaging cues without introducing new catalog items or
 * changing inventory semantics.
 */
export function refineFoodModel(root) {
  if (root.userData.polishApplied) return root;
  root.userData.polishApplied = true;
  const id = root.userData.foodId;
  const cream = toon('#f5e6c7');
  const dark = toon('#65483a');
  const green = toon('#587d45');
  const silver = toon('#d3d0c5', { roughness: 0.5, metalness: 0.2 });

  const add = (mesh) => {
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.userData.foodRoot = root;
    root.add(mesh);
    return mesh;
  };

  if (id === 'sausage') addSausageEnds(add, cream);
  if (id === 'onion') addOnionRoot(add, dark);
  if (['tomato', 'apple', 'lemon'].includes(id)) addProduceLeaf(add, green, id);
  if (id === 'tofu') addTofuCutLines(add, dark);
  if (['yogurt', 'ice-cream'].includes(id)) addCupFoil(add, silver, dark);
  if (['water', 'sauce', 'ketchup', 'mayonnaise'].includes(id)) addBottleRibs(add, cream);
  if (['lettuce', 'cabbage'].includes(id)) addLeafVeins(add, cream);
  if (id === 'mushroom') addMushroomGills(add, dark);
  if (id === 'cheese') addCheeseRind(add, cream);
  if (id === 'bread') addBreadCrumb(add, cream);
  if (id === 'banana') addBananaTips(add, dark);

  return root;
}

function addSausageEnds(add, material) {
  [-0.22, 0, 0.22].forEach((y) => {
    [-0.33, 0.33].forEach((x) => {
      const tie = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.014, 4, 8), material);
      tie.rotation.y = Math.PI / 2;
      tie.position.set(x, y, 0);
      add(tie);
    });
  });
}

function addOnionRoot(add, material) {
  for (let index = 0; index < 5; index += 1) {
    const fiber = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.20, 4), material);
    fiber.position.set((index - 2) * 0.035, -0.53, 0);
    fiber.rotation.z = (index - 2) * 0.12;
    add(fiber);
  }
}

function addProduceLeaf(add, material, id) {
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 4), material);
  leaf.scale.set(1.25, 0.28, 0.65);
  leaf.rotation.z = id === 'lemon' ? -0.45 : 0.38;
  leaf.position.set(0.12, id === 'tomato' ? 0.43 : 0.49, 0.03);
  add(leaf);
}

function addTofuCutLines(add, material) {
  [-0.18, 0.18].forEach((x) => {
    const line = roundedBox(0.025, 0.018, 0.48, 0.008, material);
    line.position.set(x, 0.225, 0);
    add(line);
  });
  const cross = roundedBox(0.68, 0.018, 0.025, 0.008, material);
  cross.position.set(0, 0.225, 0);
  add(cross);
}

function addCupFoil(add, material, markMaterial) {
  const foil = new THREE.Mesh(new THREE.CylinderGeometry(0.265, 0.265, 0.018, 12), material);
  foil.position.y = 0.365;
  add(foil);
  const tab = roundedBox(0.16, 0.018, 0.075, 0.015, markMaterial);
  tab.position.set(0.20, 0.37, 0.02);
  tab.rotation.y = -0.28;
  add(tab);
}

function addBottleRibs(add, material) {
  [-0.24, 0.02, 0.24].forEach((y) => {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(0.255, 0.018, 4, 10), material);
    rib.rotation.x = Math.PI / 2;
    rib.position.y = y;
    add(rib);
  });
}

function addLeafVeins(add, material) {
  [-0.22, 0, 0.22].forEach((x, index) => {
    const vein = roundedBox(0.035, 0.43, 0.028, 0.01, material);
    vein.position.set(x, -0.02 + index * 0.04, 0.26);
    vein.rotation.z = (index - 1) * 0.28;
    add(vein);
  });
}

function addMushroomGills(add, material) {
  [-0.16, -0.08, 0, 0.08, 0.16].forEach((x) => {
    const gill = roundedBox(0.018, 0.035, 0.30, 0.006, material);
    gill.position.set(x, 0.02, 0.08);
    add(gill);
  });
}

function addCheeseRind(add, material) {
  const rind = roundedBox(0.72, 0.055, 0.12, 0.025, material);
  rind.position.set(0, -0.17, -0.28);
  rind.rotation.y = -0.05;
  add(rind);
}

function addBreadCrumb(add, material) {
  [-0.24, 0, 0.24].forEach((x, index) => {
    const crumb = new THREE.Mesh(new THREE.SphereGeometry(0.035 + index * 0.006, 5, 4), material);
    crumb.position.set(x, 0.18 + (index % 2) * 0.05, 0.33);
    add(crumb);
  });
}

function addBananaTips(add, material) {
  [-0.40, 0.40].forEach((x) => {
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.055, 5, 4), material);
    tip.scale.x = 0.65;
    tip.position.set(x, 0.08, 0);
    add(tip);
  });
}

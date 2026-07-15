import * as THREE from 'three';
import { roundedBox } from './geometry.js';
import { toon } from './materials.js';
import { SLOT_LAYOUT } from './fridgeLayout.js';

export function createFoodModel(food, inventoryItem) {
  const group = new THREE.Group();
  group.userData = { type: 'food', instanceId: inventoryItem.instanceId, foodId: food.id };
  const [primary, secondary] = food.palette;
  const a = toon(primary);
  const b = toon(secondary);
  const bone = toon('#efe0bf');
  const add = (mesh) => { mesh.castShadow = true; mesh.receiveShadow = true; mesh.userData.foodRoot = group; group.add(mesh); return mesh; };

  switch (food.model) {
    case 'meatStrip':
      for (let index = 0; index < 3; index += 1) { const part = roundedBox(0.5, 0.14, 0.9, 0.07, index % 2 ? b : a); part.position.x = (index - 1) * 0.42; part.rotation.y = index * 0.1; add(part); }
      break;
    case 'cubes':
      for (let index = 0; index < 5; index += 1) { const part = roundedBox(0.38, 0.35, 0.38, 0.06, index % 2 ? b : a); part.position.set((index % 3 - 1) * 0.35, index > 2 ? 0.25 : 0, Math.floor(index / 3) * 0.25); add(part); }
      break;
    case 'drumstick': {
      const meat = new THREE.Mesh(new THREE.SphereGeometry(0.48, 6, 5), a); meat.scale.set(1.15, 0.78, 0.85); meat.position.x = -0.12; add(meat);
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.65, 7), bone); stick.rotation.z = Math.PI / 2; stick.position.x = 0.48; add(stick); break;
    }
    case 'wing':
      for (let index = 0; index < 2; index += 1) { const part = new THREE.Mesh(new THREE.SphereGeometry(0.42, 6, 4), index ? b : a); part.scale.set(1.3, 0.45, 0.7); part.position.x = (index - 0.5) * 0.5; part.rotation.z = (index ? 1 : -1) * 0.45; add(part); }
      break;
    case 'can': {
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.72, 10), a));
      const rimTop = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.025, 5, 10), b); rimTop.rotation.x = Math.PI / 2; rimTop.position.y = 0.36; add(rimTop);
      const rimBottom = rimTop.clone(); rimBottom.position.y = -0.36; add(rimBottom); break;
    }
    case 'onion': {
      const onion = new THREE.Mesh(new THREE.SphereGeometry(0.44, 7, 6), a); onion.scale.y = 1.12; add(onion);
      const stem = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 5), toon('#69864c')); stem.position.y = 0.58; add(stem); break;
    }
    case 'greens':
      for (let index = 0; index < 6; index += 1) { const part = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.055, 0.95, 5), index < 2 ? b : a); part.rotation.z = Math.PI / 2 + (index - 3) * 0.03; part.position.y = (index - 3) * 0.055; add(part); }
      break;
    case 'box': add(roundedBox(0.78, 0.42, 0.58, 0.08, a)); break;
    case 'carton': {
      add(roundedBox(0.54, 0.82, 0.45, 0.06, a));
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.32, 4), b); roof.rotation.y = Math.PI / 4; roof.position.y = 0.56; add(roof); break;
    }
    case 'eggs':
      for (let index = 0; index < 4; index += 1) { const egg = new THREE.Mesh(new THREE.SphereGeometry(0.19, 7, 6), a); egg.scale.y = 1.25; egg.position.set((index - 1.5) * 0.23, 0, (index % 2) * 0.1); add(egg); }
      break;
    case 'bottle': {
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.7, 8), a));
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.28, 8), a); neck.position.y = 0.47; add(neck);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 8), b); cap.position.y = 0.66; add(cap); break;
    }
    default: add(roundedBox(0.6, 0.6, 0.6, 0.08, a));
  }

  const position = SLOT_LAYOUT[inventoryItem.zone][inventoryItem.slot];
  group.position.set(position.x, position.y, position.z);
  group.scale.setScalar(0.001);
  return group;
}

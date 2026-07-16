import * as THREE from 'three';
import { roundedBox } from './geometry.js';
import { toon } from './materials.js';
import { SLOT_LAYOUT } from './fridgeLayout.js';

export function createFoodModel(food, inventoryItem) {
  const group = new THREE.Group();
  const slot = SLOT_LAYOUT[inventoryItem.zone]?.[inventoryItem.slot];
  if (!slot) throw new Error(`Missing slot ${inventoryItem.zone}:${inventoryItem.slot}`);

  group.userData = {
    type: 'food',
    instanceId: inventoryItem.instanceId,
    foodId: food.id,
    targetScale: slot.scale ?? 1,
    shelf: slot.shelf,
    depth: slot.depth,
    depthLabel: slot.depthLabel,
  };

  const [primary, secondary] = food.palette;
  const a = toon(primary);
  const b = toon(secondary);
  const bone = toon('#efe0bf');
  const green = toon('#5f8747');
  const add = (mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.foodRoot = group;
    group.add(mesh);
    return mesh;
  };

  switch (food.model) {
    case 'meatStrip':
      for (let index = 0; index < 3; index += 1) {
        const part = roundedBox(0.5, 0.14, 0.9, 0.07, index % 2 ? b : a);
        part.position.x = (index - 1) * 0.42;
        part.rotation.y = index * 0.1;
        add(part);
      }
      break;
    case 'cubes':
      for (let index = 0; index < 5; index += 1) {
        const part = roundedBox(0.38, 0.35, 0.38, 0.06, index % 2 ? b : a);
        part.position.set((index % 3 - 1) * 0.35, index > 2 ? 0.25 : 0, Math.floor(index / 3) * 0.25);
        add(part);
      }
      break;
    case 'drumstick': {
      const meat = new THREE.Mesh(new THREE.SphereGeometry(0.48, 6, 5), a);
      meat.scale.set(1.15, 0.78, 0.85);
      meat.position.x = -0.12;
      add(meat);
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.65, 7), bone);
      stick.rotation.z = Math.PI / 2;
      stick.position.x = 0.48;
      add(stick);
      break;
    }
    case 'wing':
      for (let index = 0; index < 2; index += 1) {
        const part = new THREE.Mesh(new THREE.SphereGeometry(0.42, 6, 4), index ? b : a);
        part.scale.set(1.3, 0.45, 0.7);
        part.position.x = (index - 0.5) * 0.5;
        part.rotation.z = (index ? 1 : -1) * 0.45;
        add(part);
      }
      break;
    case 'steak': {
      const steak = roundedBox(1.02, 0.22, 0.72, 0.17, a);
      steak.rotation.y = -0.18;
      add(steak);
      const fat = roundedBox(0.92, 0.07, 0.12, 0.05, b);
      fat.position.set(0, 0.13, -0.26);
      fat.rotation.y = -0.18;
      add(fat);
      break;
    }
    case 'fish': {
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.45, 7, 5), a);
      body.scale.set(1.35, 0.48, 0.72);
      add(body);
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.5, 3), b);
      tail.rotation.z = -Math.PI / 2;
      tail.position.x = -0.72;
      add(tail);
      break;
    }
    case 'shrimp':
      for (let index = 0; index < 3; index += 1) {
        const shrimp = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.095, 5, 10, Math.PI * 1.45), index % 2 ? b : a);
        shrimp.rotation.set(Math.PI / 2, 0, 0.45 + index * 0.18);
        shrimp.position.set((index - 1) * 0.36, (index % 2) * 0.1, 0);
        add(shrimp);
      }
      break;
    case 'sausage':
      for (let index = 0; index < 3; index += 1) {
        const material = index % 2 ? b : a;
        const sausage = new THREE.Group();
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.6, 8), material);
        body.rotation.z = Math.PI / 2;
        sausage.add(body);
        const leftCap = new THREE.Mesh(new THREE.SphereGeometry(0.13, 7, 5), material);
        leftCap.position.x = -0.3;
        const rightCap = leftCap.clone();
        rightCap.position.x = 0.3;
        sausage.add(leftCap, rightCap);
        sausage.position.y = (index - 1) * 0.22;
        sausage.position.x = index % 2 ? 0.08 : -0.08;
        sausage.traverse((child) => { if (child.isMesh) child.userData.foodRoot = group; });
        group.add(sausage);
      }
      break;
    case 'dumpling':
      for (let index = 0; index < 4; index += 1) {
        const dumpling = new THREE.Mesh(new THREE.SphereGeometry(0.28, 7, 5), index % 2 ? b : a);
        dumpling.scale.set(1.15, 0.56, 0.72);
        dumpling.position.set((index % 2 - 0.5) * 0.58, Math.floor(index / 2) * 0.28 - 0.14, 0);
        add(dumpling);
      }
      break;
    case 'can': {
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.72, 10), a));
      const rimTop = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.025, 5, 10), b);
      rimTop.rotation.x = Math.PI / 2;
      rimTop.position.y = 0.36;
      add(rimTop);
      // Create the bottom rim independently. Cloning rimTop after add() would
      // copy its circular foodRoot reference and fail inside Three.js.
      const rimBottom = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.025, 5, 10), b);
      rimBottom.rotation.x = Math.PI / 2;
      rimBottom.position.y = -0.36;
      add(rimBottom);
      break;
    }
    case 'onion': {
      const onion = new THREE.Mesh(new THREE.SphereGeometry(0.44, 7, 6), a);
      onion.scale.y = 1.12;
      add(onion);
      const stem = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 5), green);
      stem.position.y = 0.58;
      add(stem);
      break;
    }
    case 'greens':
      for (let index = 0; index < 6; index += 1) {
        const part = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.055, 0.95, 5), index < 2 ? b : a);
        part.rotation.z = Math.PI / 2 + (index - 3) * 0.03;
        part.position.y = (index - 3) * 0.055;
        add(part);
      }
      break;
    case 'corn': {
      const cob = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.9, 10), a);
      cob.rotation.z = Math.PI / 2;
      add(cob);
      break;
    }
    case 'tomato':
    case 'fruit': {
      const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 6), a);
      fruit.scale.y = food.model === 'tomato' ? 0.9 : 1;
      add(fruit);
      const stem = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.24, 5), green);
      stem.position.y = 0.47;
      add(stem);
      break;
    }
    case 'root': {
      const root = new THREE.Mesh(new THREE.SphereGeometry(0.43, 7, 5), a);
      root.scale.set(1.15, 0.82, 0.9);
      root.rotation.z = 0.18;
      add(root);
      break;
    }
    case 'carrot': {
      const carrot = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.9, 7), a);
      carrot.rotation.z = -Math.PI / 2;
      add(carrot);
      break;
    }
    case 'broccoli': {
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.18, 0.55, 7), b);
      stalk.position.y = -0.18;
      add(stalk);
      [[0, 0.26], [-0.26, 0.18], [0.26, 0.18], [-0.15, 0.42], [0.15, 0.42]].forEach(([x, y]) => {
        const crown = new THREE.Mesh(new THREE.SphereGeometry(0.25, 6, 5), a);
        crown.position.set(x, y, 0);
        add(crown);
      });
      break;
    }
    case 'mushroom': {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.17, 0.45, 7), b);
      stem.position.y = -0.18;
      add(stem);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.42, 7, 5), a);
      cap.scale.y = 0.52;
      cap.position.y = 0.14;
      add(cap);
      break;
    }
    case 'leafy':
      for (let index = 0; index < 7; index += 1) {
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.28, 6, 4), index % 2 ? b : a);
        leaf.scale.set(0.72, 1.18, 0.46);
        leaf.position.set((index % 3 - 1) * 0.26, Math.floor(index / 3) * 0.22 - 0.16, (index % 2) * 0.1);
        leaf.rotation.z = (index - 3) * 0.12;
        add(leaf);
      }
      break;
    case 'box':
    case 'tofu':
      add(roundedBox(0.78, 0.42, 0.58, 0.08, a));
      break;
    case 'cheese': {
      const cheese = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.34, 3), a);
      cheese.rotation.x = Math.PI / 2;
      cheese.rotation.z = Math.PI / 6;
      add(cheese);
      break;
    }
    case 'carton': {
      add(roundedBox(0.54, 0.82, 0.45, 0.06, a));
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.32, 4), b);
      roof.rotation.y = Math.PI / 4;
      roof.position.y = 0.56;
      add(roof);
      break;
    }
    case 'eggs':
      for (let index = 0; index < 4; index += 1) {
        const egg = new THREE.Mesh(new THREE.SphereGeometry(0.19, 7, 6), a);
        egg.scale.y = 1.25;
        egg.position.set((index - 1.5) * 0.23, 0, (index % 2) * 0.1);
        add(egg);
      }
      break;
    case 'bottle': {
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.7, 8), a));
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.28, 8), a);
      neck.position.y = 0.47;
      add(neck);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 8), b);
      cap.position.y = 0.66;
      add(cap);
      break;
    }
    case 'jar': {
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.55, 9), a));
      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.12, 9), b);
      lid.position.y = 0.33;
      add(lid);
      break;
    }
    case 'cup': {
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.23, 0.58, 9), a));
      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.07, 9), b);
      lid.position.y = 0.32;
      add(lid);
      break;
    }
    case 'banana': {
      const banana = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.11, 6, 12, Math.PI * 1.35), a);
      banana.rotation.set(Math.PI / 2, 0, 0.7);
      add(banana);
      break;
    }
    case 'bread':
      add(roundedBox(0.9, 0.5, 0.62, 0.18, a));
      break;
    case 'bowl': {
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.3, 0.34, 10), b);
      bowl.position.y = -0.12;
      add(bowl);
      const rice = new THREE.Mesh(new THREE.SphereGeometry(0.37, 8, 5), a);
      rice.scale.y = 0.42;
      rice.position.y = 0.13;
      add(rice);
      break;
    }
    default:
      add(roundedBox(0.6, 0.6, 0.6, 0.08, a));
  }

  group.position.set(slot.x, slot.y, slot.z);
  group.rotation.y = slot.rotationY ?? 0;
  group.scale.setScalar(0.001);
  return group;
}

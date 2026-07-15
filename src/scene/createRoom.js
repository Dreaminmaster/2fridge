import * as THREE from 'three';
import { palette, toon } from './materials.js';
import { roundedBox } from './geometry.js';

export function createRoom(scene) {
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), toon(palette.floor));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -3.32;
  floor.receiveShadow = true;
  scene.add(floor);

  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 18), toon(palette.wall));
  wall.position.set(0, 3.5, -4.5);
  wall.receiveShadow = true;
  scene.add(wall);

  for (let index = -10; index <= 10; index += 1) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.015, 30), toon(palette.floorLine));
    line.position.set(index * 1.1, -3.305, 0);
    line.rotation.y = 0.12;
    scene.add(line);
  }

  const baseboard = roundedBox(30, 0.42, 0.25, 0.08, toon('#6f7d4c'));
  baseboard.position.set(0, -2.92, -4.3);
  scene.add(baseboard);

  const plant = createPlant();
  plant.position.set(4.15, 0, -1.65);
  plant.scale.setScalar(0.8);
  scene.add(plant);
}

function createPlant() {
  const plant = new THREE.Group();
  const pot = roundedBox(1.35, 1.25, 1.35, 0.18, toon(palette.pot));
  pot.position.y = -2.7;
  plant.add(pot);
  const trunkMaterial = toon('#6f4b32');
  const leafMaterial = toon(palette.green);
  for (let branch = 0; branch < 4; branch += 1) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 2.7, 7), trunkMaterial);
    trunk.position.set((branch - 1.5) * 0.18, -1.4 + branch * 0.07, 0);
    trunk.rotation.z = (branch - 1.5) * 0.12;
    plant.add(trunk);
    for (let leafIndex = 0; leafIndex < 3; leafIndex += 1) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.58, 5, 4), leafMaterial);
      leaf.scale.set(1, 0.42, 0.45);
      leaf.position.set((branch - 1.5) * 0.25 + (leafIndex - 1) * 0.5, -0.5 + branch * 0.36 + leafIndex * 0.4, leafIndex % 2 ? 0.18 : -0.15);
      leaf.rotation.z = (leafIndex - 1) * 0.6;
      plant.add(leaf);
    }
  }
  return plant;
}

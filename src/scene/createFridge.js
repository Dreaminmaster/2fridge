import * as THREE from 'three';
import { roundedBox } from './geometry.js';

export function createFridge(materials) {
  const group = new THREE.Group();
  group.rotation.y = -0.12;
  group.position.set(-0.35, -0.05, 0);

  addCabinet(group, materials);
  const upperDoor = createDoor({ y: 2.02, height: 4.98, rackCount: 3, name: 'upper-door', materials });
  const lowerDoor = createDoor({ y: -2.30, height: 2.72, rackCount: 1, name: 'lower-door', materials });
  group.add(upperDoor.pivot, lowerDoor.pivot);

  const handleTop = roundedBox(0.28, 1.25, 0.28, 0.08, materials.cream);
  handleTop.position.set(-4.13, 0.06, 0.31);
  upperDoor.pivot.add(handleTop);
  const handleBottom = roundedBox(0.28, 0.86, 0.28, 0.08, materials.cream);
  handleBottom.position.set(-4.13, 0.02, 0.31);
  lowerDoor.pivot.add(handleBottom);

  const fridgeFoodRoot = new THREE.Group();
  const freezerFoodRoot = new THREE.Group();
  const doorFoodRoot = new THREE.Group();
  group.add(fridgeFoodRoot, freezerFoodRoot);
  upperDoor.pivot.add(doorFoodRoot);

  return {
    group,
    doors: { upper: upperDoor, lower: lowerDoor },
    doorTargets: [upperDoor.panel, lowerDoor.panel],
    foodRoots: { fridge: fridgeFoodRoot, freezer: freezerFoodRoot, door: doorFoodRoot },
  };
}

function addCabinet(group, materials) {
  const back = roundedBox(5.2, 8.45, 0.28, 0.18, materials.mintDark); back.position.set(0, 0.7, -1.48);
  const left = roundedBox(0.42, 8.45, 3.1, 0.18, materials.mint); left.position.set(-2.42, 0.7, 0);
  const right = left.clone(); right.position.x = 2.42;
  const top = roundedBox(5.15, 0.42, 3.1, 0.18, materials.mint); top.position.set(0, 4.72, 0);
  const bottom = top.clone(); bottom.position.y = -3.32;
  const innerTop = roundedBox(4.55, 4.98, 0.12, 0.08, materials.inner); innerTop.position.set(0, 2.02, -1.29);
  const innerBottom = roundedBox(4.55, 2.55, 0.12, 0.08, materials.inner); innerBottom.position.set(0, -2.28, -1.29);
  const divider = roundedBox(4.82, 0.28, 2.92, 0.08, materials.cream); divider.position.set(0, -1, 0.02);
  group.add(back, left, right, top, bottom, innerTop, innerBottom, divider);

  [2.95, 1.75, 0.57].forEach((y) => { const shelf = roundedBox(4, 0.11, 2.48, 0.04, materials.white); shelf.position.set(0, y, 0.08); group.add(shelf); });
  const freezerShelf = roundedBox(4, 0.11, 2.48, 0.04, materials.white); freezerShelf.position.set(0, -2.33, 0.08); group.add(freezerShelf);

  const trim = [
    [-2.18, 2.02, 0.18, 4.95], [2.18, 2.02, 0.18, 4.95], [0, 4.42, 4.48, 0.18], [0, -0.56, 4.48, 0.18],
    [-2.18, -2.28, 0.18, 2.55], [2.18, -2.28, 0.18, 2.55], [0, -1.1, 4.48, 0.18], [0, -3.47, 4.48, 0.18],
  ];
  trim.forEach(([x, y, width, height]) => { const part = roundedBox(width, height, 0.22, 0.06, materials.cream); part.position.set(x, y, 1.43); group.add(part); });

  [[-2.05, -3.63], [2.05, -3.63]].forEach(([x, y]) => { const foot = roundedBox(0.45, 0.35, 0.55, 0.08, materials.dark); foot.position.set(x, y, 0.35); group.add(foot); });
  const light = new THREE.PointLight('#fff4c9', 0.8, 4); light.position.set(0, 3.55, 0.65); group.add(light);
}

function createDoor({ y, height, rackCount, name, materials }) {
  const pivot = new THREE.Group();
  pivot.position.set(2.38, y, 1.53);
  const panel = roundedBox(4.75, height, 0.38, 0.28, materials.mint);
  panel.position.set(-2.38, 0, 0.18);
  panel.userData = { type: 'door', doorName: name };
  pivot.add(panel);

  const inner = roundedBox(4.15, height - 0.48, 0.18, 0.2, materials.cream);
  inner.position.set(-2.38, 0, -0.07);
  pivot.add(inner);

  for (let rackIndex = 0; rackIndex < rackCount; rackIndex += 1) {
    const yPosition = (rackIndex - (rackCount - 1) / 2) * 1.22;
    const rackBack = roundedBox(3.5, 0.62, 0.12, 0.08, materials.white); rackBack.position.set(-2.38, yPosition, -0.32);
    const rail = roundedBox(3.52, 0.18, 0.55, 0.06, materials.white); rail.position.set(-2.38, yPosition - 0.25, -0.62);
    pivot.add(rackBack, rail);
  }

  const hingeTop = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 8), materials.metal); hingeTop.position.set(-0.03, height * 0.28, 0);
  const hingeBottom = hingeTop.clone(); hingeBottom.position.y = -height * 0.28;
  pivot.add(hingeTop, hingeBottom);
  return { pivot, panel, name };
}

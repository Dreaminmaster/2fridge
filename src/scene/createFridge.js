import * as THREE from 'three';
import { roundedBox } from './geometry.js';

export function createFridge(materials) {
  const group = new THREE.Group();
  group.rotation.y = 0;
  group.position.set(0, -0.05, 0);

  const cabinetShadowCasters = addCabinet(group, materials);
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

  // Dynamic shadow rendering is intentionally limited to the broad exterior
  // silhouette. Shelves, food details, handles and trims still receive light,
  // but do not make the shadow map expensive to refresh while doors animate.
  group.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = false;
    child.receiveShadow = true;
  });
  [...cabinetShadowCasters, upperDoor.panel, lowerDoor.panel].forEach((mesh) => {
    mesh.castShadow = true;
  });

  return {
    group,
    doors: { upper: upperDoor, lower: lowerDoor },
    doorTargets: [upperDoor.panel, lowerDoor.panel],
    foodRoots: { fridge: fridgeFoodRoot, freezer: freezerFoodRoot, door: doorFoodRoot },
  };
}

function addCabinet(group, materials) {
  const back = roundedBox(5.2, 8.45, 0.3, 0.18, materials.mintDark); back.position.set(0, 0.7, -2.08);
  const left = roundedBox(0.42, 8.45, 4.55, 0.18, materials.mint); left.position.set(-2.42, 0.7, -0.02);
  const right = left.clone(); right.position.x = 2.42;
  const top = roundedBox(5.15, 0.42, 4.55, 0.18, materials.mint); top.position.set(0, 4.72, -0.02);
  const bottom = top.clone(); bottom.position.y = -3.32;
  const innerTop = roundedBox(4.55, 4.98, 0.12, 0.08, materials.inner); innerTop.position.set(0, 2.02, -1.91);
  const innerBottom = roundedBox(4.55, 2.55, 0.12, 0.08, materials.inner); innerBottom.position.set(0, -2.28, -1.91);
  const divider = roundedBox(4.82, 0.28, 4.18, 0.08, materials.cream); divider.position.set(0, -1, -0.02);
  group.add(back, left, right, top, bottom, innerTop, innerBottom, divider);

  [2.95, 1.75, 0.57].forEach((y) => addShelfSet(group, y, materials));

  // The bottom of the refrigerator compartment is a real fourth storage
  // surface, not decorative empty space. A liner and guards make the support
  // visually explicit and match the fourth row in fridgeLayout.js.
  const fridgeFloor = roundedBox(4, 0.11, 3.72, 0.04, materials.white);
  fridgeFloor.position.set(0, -0.80, -0.12);
  const fridgeFloorLip = roundedBox(4.04, 0.16, 0.16, 0.04, materials.cream);
  fridgeFloorLip.position.set(0, -0.71, 1.65);
  const fridgeFloorStop = roundedBox(4.04, 0.13, 0.14, 0.04, materials.cream);
  fridgeFloorStop.position.set(0, -0.72, -1.83);
  group.add(fridgeFloor, fridgeFloorLip, fridgeFloorStop);

  const freezerShelf = roundedBox(4, 0.11, 3.72, 0.04, materials.white);
  freezerShelf.position.set(0, -2.33, -0.12);
  const freezerFrontLip = roundedBox(4.04, 0.15, 0.16, 0.04, materials.cream);
  freezerFrontLip.position.set(0, -2.25, 1.65);
  const freezerBackStop = roundedBox(4.04, 0.13, 0.14, 0.04, materials.cream);
  freezerBackStop.position.set(0, -2.26, -1.83);
  const freezerFloor = roundedBox(4, 0.12, 3.72, 0.05, materials.white);
  freezerFloor.position.set(0, -3.08, -0.12);
  const freezerFloorLip = roundedBox(4.04, 0.18, 0.18, 0.05, materials.cream);
  freezerFloorLip.position.set(0, -2.99, 1.65);
  group.add(freezerShelf, freezerFrontLip, freezerBackStop, freezerFloor, freezerFloorLip);

  [3.03, 1.83, 0.65, -0.73, -2.25, -3.00].forEach((y) => {
    const leftRail = roundedBox(0.12, 0.13, 3.55, 0.035, materials.cream);
    leftRail.position.set(-2.04, y, -0.12);
    const rightRail = leftRail.clone(); rightRail.position.x = 2.04;
    group.add(leftRail, rightRail);
  });

  const thermostat = roundedBox(0.92, 0.34, 0.10, 0.06, materials.cream);
  thermostat.position.set(1.36, 4.03, -1.80);
  const thermostatDot = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), materials.mintDark);
  thermostatDot.position.set(1.62, 4.03, -1.72);
  const lightHousing = roundedBox(1.18, 0.25, 0.18, 0.07, materials.white);
  lightHousing.position.set(-0.90, 4.11, -1.73);
  group.add(thermostat, thermostatDot, lightHousing);

  // Small cooling vents and shelf labels add scale without changing the clean
  // low-poly language.
  for (let index = 0; index < 5; index += 1) {
    const vent = roundedBox(0.34, 0.055, 0.07, 0.02, materials.mintDark);
    vent.position.set(-0.68 + index * 0.34, 3.72, -1.75);
    group.add(vent);
  }
  [2.95, 1.75, 0.57, -0.80].forEach((y, index) => {
    const tab = roundedBox(0.28, 0.11, 0.07, 0.025, materials.mintDark);
    tab.position.set(1.77, y + 0.13, 1.54);
    tab.userData.shelfNumber = index + 1;
    group.add(tab);
  });

  const trim = [
    [-2.18, 2.02, 0.18, 4.95], [2.18, 2.02, 0.18, 4.95], [0, 4.42, 4.48, 0.18], [0, -0.56, 4.48, 0.18],
    [-2.18, -2.28, 0.18, 2.55], [2.18, -2.28, 0.18, 2.55], [0, -1.1, 4.48, 0.18], [0, -3.47, 4.48, 0.18],
  ];
  trim.forEach(([x, y, width, height]) => {
    const part = roundedBox(width, height, 0.22, 0.06, materials.cream);
    part.position.set(x, y, 2.16);
    group.add(part);
  });

  [[-2.05, -3.63], [2.05, -3.63]].forEach(([x, y]) => {
    const foot = roundedBox(0.45, 0.35, 0.65, 0.08, materials.dark);
    foot.position.set(x, y, 0.3);
    group.add(foot);
  });
  const light = new THREE.PointLight('#fff4c9', 0.9, 5.4);
  light.position.set(0, 3.55, 0.35);
  group.add(light);

  return [back, left, right, top, bottom];
}

function addShelfSet(group, y, materials) {
  const shelf = roundedBox(4, 0.11, 3.72, 0.04, materials.white);
  shelf.position.set(0, y, -0.12);
  const frontLip = roundedBox(4.04, 0.15, 0.16, 0.04, materials.cream);
  frontLip.position.set(0, y + 0.08, 1.65);
  const backStop = roundedBox(4.04, 0.13, 0.14, 0.04, materials.cream);
  backStop.position.set(0, y + 0.07, -1.83);
  group.add(shelf, frontLip, backStop);
}

function createDoor({ y, height, rackCount, name, materials }) {
  const pivot = new THREE.Group();
  pivot.position.set(2.38, y, 2.26);
  const panel = roundedBox(4.75, height, 0.42, 0.28, materials.mint);
  panel.position.set(-2.38, 0, 0.18);
  panel.userData = { type: 'door', doorName: name };
  pivot.add(panel);

  const inner = roundedBox(4.15, height - 0.48, 0.18, 0.2, materials.cream);
  inner.position.set(-2.38, 0, -0.08);
  pivot.add(inner);

  const gasketInset = 0.30;
  const gasketDepth = -0.20;
  const gasketTop = roundedBox(3.78, 0.10, 0.08, 0.03, materials.mintDark);
  gasketTop.position.set(-2.38, height / 2 - gasketInset, gasketDepth);
  const gasketBottom = gasketTop.clone(); gasketBottom.position.y = -height / 2 + gasketInset;
  const gasketLeft = roundedBox(0.10, height - 0.62, 0.08, 0.03, materials.mintDark);
  gasketLeft.position.set(-4.20, 0, gasketDepth);
  const gasketRight = gasketLeft.clone(); gasketRight.position.x = -0.56;
  pivot.add(gasketTop, gasketBottom, gasketLeft, gasketRight);

  for (let rackIndex = 0; rackIndex < rackCount; rackIndex += 1) {
    const yPosition = (rackIndex - (rackCount - 1) / 2) * 1.22;
    const rackBack = roundedBox(3.62, 0.62, 0.12, 0.08, materials.white);
    rackBack.position.set(-2.38, yPosition, -0.40);
    const rail = roundedBox(3.66, 0.18, 0.72, 0.06, materials.white);
    rail.position.set(-2.38, yPosition - 0.25, -0.82);
    const frontGuard = roundedBox(3.66, 0.16, 0.14, 0.05, materials.cream);
    frontGuard.position.set(-2.38, yPosition - 0.08, -1.15);
    const leftGuard = roundedBox(0.16, 0.44, 0.64, 0.05, materials.cream);
    leftGuard.position.set(-4.12, yPosition - 0.06, -0.82);
    const rightGuard = leftGuard.clone(); rightGuard.position.x = -0.64;
    pivot.add(rackBack, rail, frontGuard, leftGuard, rightGuard);
  }

  const hingeTop = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 8), materials.metal);
  hingeTop.position.set(-0.03, height * 0.28, 0);
  const hingeBottom = hingeTop.clone(); hingeBottom.position.y = -height * 0.28;
  pivot.add(hingeTop, hingeBottom);
  return { pivot, panel, name };
}

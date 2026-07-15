import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createMaterials } from './materials.js';
import { createRoom } from './createRoom.js';
import { createFridge } from './createFridge.js';
import { createFoodModel } from './createFoodModel.js';

export function createSceneController({ canvas, stage, onDoorChange, onFoodSelect, onUserNavigate }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio ?? 1, 1.8));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#efcf98');
  scene.fog = new THREE.Fog('#efcf98', 12, 28);
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.enablePan = false;
  controls.minDistance = 10;
  controls.maxDistance = 24;
  controls.minPolarAngle = Math.PI * 0.24;
  controls.maxPolarAngle = Math.PI * 0.68;
  controls.rotateSpeed = 0.62;
  controls.zoomSpeed = 0.75;

  setupLights(scene);
  createRoom(scene);
  const fridge = createFridge(createMaterials());
  scene.add(fridge.group);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const foodMeshes = new Map();
  const animations = [];
  const doorState = { upper: false, lower: false };
  const clock = new THREE.Clock();
  let pointerStart = null;
  let baseScale = 0.82;
  let baseX = -0.45;
  let initialView = null;

  controls.addEventListener('start', () => onUserNavigate?.());
  canvas.addEventListener('pointerdown', (event) => { pointerStart = { x: event.clientX, y: event.clientY }; });
  canvas.addEventListener('pointerup', handleTap);
  canvas.addEventListener('pointercancel', () => { pointerStart = null; });
  globalThis.addEventListener('resize', resize, { passive: true });

  function handleTap(event) {
    if (!pointerStart) return;
    const movement = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
    pointerStart = null;
    if (movement > 8) return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const foodHit = raycaster.intersectObjects([...foodMeshes.values()], true)[0];
    if (foodHit) {
      const root = findFoodRoot(foodHit.object);
      if (root) onFoodSelect?.(root.userData.instanceId);
      return;
    }

    const doorHit = raycaster.intersectObjects(fridge.doorTargets, false)[0];
    if (!doorHit) return;
    const key = doorHit.object.userData.doorName === 'upper-door' ? 'upper' : 'lower';
    doorState[key] = !doorState[key];
    onDoorChange?.({ ...doorState });
  }

  function syncInventory(items, catalogById) {
    const liveIds = new Set(items.map((item) => item.instanceId));
    foodMeshes.forEach((mesh, id) => {
      if (!liveIds.has(id)) { mesh.parent?.remove(mesh); disposeObject(mesh); foodMeshes.delete(id); }
    });
    items.forEach((item) => {
      if (foodMeshes.has(item.instanceId)) return;
      const food = catalogById.get(item.foodId);
      if (!food) return;
      const mesh = createFoodModel(food, item);
      fridge.foodRoots[item.zone].add(mesh);
      foodMeshes.set(item.instanceId, mesh);
      animations.push({ mesh, age: 0 });
    });
  }

  function removeItem(instanceId) {
    const mesh = foodMeshes.get(instanceId);
    if (!mesh) return;
    mesh.parent?.remove(mesh);
    disposeObject(mesh);
    foodMeshes.delete(instanceId);
  }

  function openForZone(zone) {
    if (zone === 'freezer') doorState.lower = true;
    else doorState.upper = true;
    onDoorChange?.({ ...doorState });
  }

  function zoomBy(amount) {
    const direction = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
    const nextDistance = THREE.MathUtils.clamp(camera.position.distanceTo(controls.target) + amount, controls.minDistance, controls.maxDistance);
    camera.position.copy(controls.target).add(direction.multiplyScalar(nextDistance));
    controls.update();
    onUserNavigate?.();
  }

  function resetView() {
    if (!initialView) return;
    camera.position.copy(initialView.position);
    controls.target.copy(initialView.target);
    controls.update();
  }

  function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const portrait = height > width * 1.08;
    if (portrait) {
      baseScale = width < 390 ? 0.73 : 0.79;
      baseX = -0.42;
      camera.fov = width < 390 ? 42 : 39;
      camera.position.set(8.8, 3.25, 17.4);
      controls.target.set(-0.15, 0.15, 0);
    } else {
      baseScale = width < 1000 ? 0.9 : 0.98;
      baseX = -0.65;
      camera.fov = 33;
      camera.position.set(10.4, 2.65, 16.4);
      controls.target.set(-0.35, 0.1, 0);
    }
    initialView = { position: camera.position.clone(), target: controls.target.clone() };
    fridge.group.scale.setScalar(baseScale);
    fridge.group.position.x = baseX;
    camera.updateProjectionMatrix();
    controls.update();
  }

  function render() {
    const delta = Math.min(clock.getDelta(), 0.05);
    fridge.doors.upper.pivot.rotation.y = damp(fridge.doors.upper.pivot.rotation.y, doorState.upper ? 1.92 : 0, 7.5, delta);
    fridge.doors.lower.pivot.rotation.y = damp(fridge.doors.lower.pivot.rotation.y, doorState.lower ? 1.82 : 0, 7.5, delta);
    const anyOpen = doorState.upper || doorState.lower;
    fridge.group.position.x = damp(fridge.group.position.x, baseX + (anyOpen ? -0.9 : 0), 5.5, delta);
    const targetScale = baseScale * (anyOpen ? 0.9 : 1);
    const nextScale = damp(fridge.group.scale.x, targetScale, 5.5, delta);
    fridge.group.scale.setScalar(nextScale);

    for (let index = animations.length - 1; index >= 0; index -= 1) {
      const animation = animations[index];
      animation.age += delta;
      const t = Math.min(animation.age / 0.42, 1);
      const eased = 1 - (1 - t) ** 3;
      animation.mesh.scale.setScalar(Math.max(0.001, eased * (1 + Math.sin(t * Math.PI) * 0.14)));
      if (t >= 1) { animation.mesh.scale.setScalar(1); animations.splice(index, 1); }
    }
    controls.update();
    renderer.render(scene, camera);
  }

  resize();
  renderer.setAnimationLoop(render);

  return { syncInventory, removeItem, openForZone, zoomIn: () => zoomBy(-1.7), zoomOut: () => zoomBy(1.7), resetView, getDoorState: () => ({ ...doorState }) };
}

function setupLights(scene) {
  scene.add(new THREE.HemisphereLight('#fff6da', '#8d603d', 2.3));
  const key = new THREE.DirectionalLight('#fff1ce', 3.2); key.position.set(-4, 8, 6); key.castShadow = true; key.shadow.mapSize.set(1536, 1536); key.shadow.camera.left = -7; key.shadow.camera.right = 7; key.shadow.camera.top = 9; key.shadow.camera.bottom = -5; key.shadow.bias = -0.0003; scene.add(key);
  const fill = new THREE.PointLight('#ffdca7', 1.2, 14); fill.position.set(4, 3, 4); scene.add(fill);
}

function findFoodRoot(object) {
  let current = object;
  while (current && current.userData?.type !== 'food') current = current.parent;
  return current?.userData?.type === 'food' ? current : null;
}

function disposeObject(object) {
  object.traverse((child) => { child.geometry?.dispose?.(); if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose?.()); else child.material?.dispose?.(); });
}

function damp(current, target, lambda, delta) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * delta));
}

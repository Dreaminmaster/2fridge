import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createMaterials } from './materials.js';
import { createRoom } from './createRoom.js';
import { createFridge } from './createFridge.js';
import { createFoodModel } from './createFoodModel.js';

export function createSceneController({ canvas, stage, onDoorChange, onFoodSelect, onUserNavigate }) {
  const performanceProfile = getPerformanceProfile();
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !performanceProfile.lowPower,
    alpha: true,
    powerPreference: 'high-performance',
    precision: performanceProfile.lowPower ? 'mediump' : 'highp',
  });
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio ?? 1, performanceProfile.pixelRatioCap));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = performanceProfile.shadowType;
  // The light and objects do not change during camera orbiting, so rebuilding the
  // shadow map on every touch frame is wasted work on mobile Safari.
  renderer.shadowMap.autoUpdate = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#efcf98');
  scene.fog = new THREE.Fog('#efcf98', 13, 30);
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = performanceProfile.lowPower ? 0.14 : 0.075;
  controls.enablePan = false;
  controls.minDistance = 10.5;
  controls.maxDistance = 26;
  controls.minPolarAngle = Math.PI * 0.24;
  controls.maxPolarAngle = Math.PI * 0.68;
  controls.rotateSpeed = performanceProfile.lowPower ? 0.86 : 0.62;
  controls.zoomSpeed = performanceProfile.lowPower ? 0.9 : 0.75;
  controls.touches.ONE = THREE.TOUCH.ROTATE;
  controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;

  setupLights(scene, performanceProfile);
  createRoom(scene);
  const fridge = createFridge(createMaterials());
  scene.add(fridge.group);
  renderer.shadowMap.needsUpdate = true;

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
  let attention = null;

  controls.addEventListener('start', () => onUserNavigate?.());
  controls.addEventListener('end', () => { renderer.shadowMap.needsUpdate = true; });
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
    renderer.shadowMap.needsUpdate = true;
    onDoorChange?.({ ...doorState });
  }

  function syncInventory(items, catalogById) {
    const liveIds = new Set(items.map((item) => item.instanceId));
    foodMeshes.forEach((mesh, id) => {
      if (!liveIds.has(id)) {
        if (attention?.instanceId === id) clearAttention();
        mesh.parent?.remove(mesh);
        disposeObject(mesh);
        foodMeshes.delete(id);
      }
    });
    items.forEach((item) => {
      if (foodMeshes.has(item.instanceId)) return;
      const food = catalogById.get(item.foodId);
      if (!food) return;
      const mesh = createFoodModel(food, item);
      // Dozens of small food shadows are expensive and visually unnecessary.
      mesh.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = false;
          child.receiveShadow = false;
        }
      });
      fridge.foodRoots[item.zone].add(mesh);
      foodMeshes.set(item.instanceId, mesh);
      animations.push({ mesh, age: 0 });
    });
  }

  function removeItem(instanceId) {
    const mesh = foodMeshes.get(instanceId);
    if (!mesh) return;
    if (attention?.instanceId === instanceId) clearAttention();
    mesh.parent?.remove(mesh);
    disposeObject(mesh);
    foodMeshes.delete(instanceId);
  }

  function openForZone(zone) {
    if (zone === 'freezer') doorState.lower = true;
    else doorState.upper = true;
    renderer.shadowMap.needsUpdate = true;
    onDoorChange?.({ ...doorState });
  }

  function revealItem(instanceId, zone) {
    openForZone(zone);
    const reveal = () => {
      const mesh = foodMeshes.get(instanceId);
      if (!mesh) return;
      clearAttention();
      const marker = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.22, 0),
        new THREE.MeshBasicMaterial({
          color: '#fff1a6',
          transparent: true,
          opacity: 0.98,
          depthTest: false,
          depthWrite: false,
        }),
      );
      marker.position.set(0, 1.05, 0);
      marker.renderOrder = 999;
      mesh.add(marker);
      attention = { instanceId, mesh, marker, age: 0 };
    };
    if (foodMeshes.has(instanceId)) reveal();
    else requestAnimationFrame(reveal);
  }

  function clearAttention() {
    if (!attention) return;
    attention.marker.parent?.remove(attention.marker);
    attention.marker.geometry.dispose();
    attention.marker.material.dispose();
    attention = null;
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
    renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio ?? 1, performanceProfile.pixelRatioCap));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const portrait = height > width * 1.08;
    if (portrait) {
      baseScale = width < 390 ? 0.70 : 0.76;
      baseX = -0.48;
      camera.fov = width < 390 ? 43 : 40;
      camera.position.set(8.2, 3.25, 18.9);
      controls.target.set(-0.12, 0.12, -0.1);
    } else {
      baseScale = width < 1000 ? 0.86 : 0.94;
      baseX = -0.68;
      camera.fov = 34;
      camera.position.set(11.1, 2.8, 17.8);
      controls.target.set(-0.3, 0.08, -0.18);
    }
    initialView = { position: camera.position.clone(), target: controls.target.clone() };
    fridge.group.scale.setScalar(baseScale);
    fridge.group.position.x = baseX;
    camera.updateProjectionMatrix();
    controls.update();
    renderer.shadowMap.needsUpdate = true;
  }

  function render() {
    const delta = Math.min(clock.getDelta(), 0.05);
    const upperTarget = doorState.upper ? 1.92 : 0;
    const lowerTarget = doorState.lower ? 1.82 : 0;
    const previousUpper = fridge.doors.upper.pivot.rotation.y;
    const previousLower = fridge.doors.lower.pivot.rotation.y;
    fridge.doors.upper.pivot.rotation.y = damp(previousUpper, upperTarget, 7.5, delta);
    fridge.doors.lower.pivot.rotation.y = damp(previousLower, lowerTarget, 7.5, delta);
    const anyOpen = doorState.upper || doorState.lower;
    const desiredX = baseX + (anyOpen ? -0.92 : 0);
    const desiredScale = baseScale * (anyOpen ? 0.88 : 1);
    const previousX = fridge.group.position.x;
    const previousScale = fridge.group.scale.x;
    fridge.group.position.x = damp(previousX, desiredX, 5.5, delta);
    const nextScale = damp(previousScale, desiredScale, 5.5, delta);
    fridge.group.scale.setScalar(nextScale);

    const cabinetMoving = Math.abs(previousUpper - upperTarget) > 0.001
      || Math.abs(previousLower - lowerTarget) > 0.001
      || Math.abs(previousX - desiredX) > 0.001
      || Math.abs(previousScale - desiredScale) > 0.001;
    if (cabinetMoving) renderer.shadowMap.needsUpdate = true;

    for (let index = animations.length - 1; index >= 0; index -= 1) {
      const animation = animations[index];
      animation.age += delta;
      const t = Math.min(animation.age / 0.42, 1);
      const eased = 1 - (1 - t) ** 3;
      const itemScale = animation.mesh.userData.targetScale ?? 1;
      animation.mesh.scale.setScalar(Math.max(0.001, eased * (1 + Math.sin(t * Math.PI) * 0.14) * itemScale));
      if (t >= 1) {
        animation.mesh.scale.setScalar(itemScale);
        animations.splice(index, 1);
      }
    }

    if (attention) {
      attention.age += delta;
      attention.marker.position.y = 1.05 + Math.sin(attention.age * 6) * 0.12;
      const pulse = 1 + Math.sin(attention.age * 8) * 0.18;
      attention.marker.scale.setScalar(pulse);
      attention.marker.rotation.y += delta * 2.5;
      attention.marker.material.opacity = Math.max(0, 1 - Math.max(0, attention.age - 1.35) / 0.55);
      if (attention.age >= 1.9) clearAttention();
    }

    controls.update();
    renderer.render(scene, camera);
  }

  resize();
  renderer.setAnimationLoop(render);

  return {
    syncInventory,
    removeItem,
    openForZone,
    revealItem,
    zoomIn: () => zoomBy(-1.7),
    zoomOut: () => zoomBy(1.7),
    resetView,
    getDoorState: () => ({ ...doorState }),
  };
}

function getPerformanceProfile() {
  const coarsePointer = typeof globalThis.matchMedia === 'function' && globalThis.matchMedia('(pointer: coarse)').matches;
  const narrowViewport = (globalThis.innerWidth ?? 1024) < 760;
  const lowPower = coarsePointer || narrowViewport;
  return {
    lowPower,
    pixelRatioCap: lowPower ? 1 : 1.55,
    shadowType: lowPower ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap,
    shadowMapSize: lowPower ? 512 : 1536,
  };
}

function setupLights(scene, performanceProfile) {
  scene.add(new THREE.HemisphereLight('#fff6da', '#8d603d', 2.3));
  const key = new THREE.DirectionalLight('#fff1ce', 3.2);
  key.position.set(-4, 8, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(performanceProfile.shadowMapSize, performanceProfile.shadowMapSize);
  key.shadow.camera.left = -7;
  key.shadow.camera.right = 7;
  key.shadow.camera.top = 9;
  key.shadow.camera.bottom = -5;
  key.shadow.bias = -0.0003;
  scene.add(key);
  const fill = new THREE.PointLight('#ffdca7', 1.2, 16);
  fill.position.set(4, 3, 5);
  scene.add(fill);
}

function findFoodRoot(object) {
  let current = object;
  while (current && current.userData?.type !== 'food') current = current.parent;
  return current?.userData?.type === 'food' ? current : null;
}

function disposeObject(object) {
  object.traverse((child) => {
    child.geometry?.dispose?.();
    if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose?.());
    else child.material?.dispose?.();
  });
}

function damp(current, target, lambda, delta) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * delta));
}

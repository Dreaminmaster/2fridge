import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createMaterials } from './materials.js';
import { createRoom } from './createRoom.js';
import { createFridge } from './createFridge.js';
import { createFoodModel } from './createFoodModel.js';

const ROOM_FLOOR_Y = -3.32;
const FRIDGE_WALL_Z = -2.2;
const PAN_LIMITS = { x: 4.6, y: 3.0, z: 2.6 };

export function createSceneController({
  canvas,
  stage,
  onDoorChange,
  onFoodSelect,
  onUserNavigate,
}) {
  const profile = getRenderProfile();
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    precision: 'highp',
  });
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio ?? 1, profile.pixelRatioCap));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#efcf98');
  scene.fog = null;

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = !profile.mobile;
  controls.dampingFactor = 0.07;
  controls.enablePan = !profile.mobile;
  controls.screenSpacePanning = true;
  controls.enableZoom = profile.mobile;
  controls.minDistance = 10.5;
  controls.maxDistance = 32;
  controls.minPolarAngle = Math.PI * 0.24;
  controls.maxPolarAngle = Math.PI * 0.68;
  controls.rotateSpeed = profile.mobile ? 0.78 : 0.62;
  controls.zoomSpeed = profile.mobile ? 0.9 : 0.75;
  controls.panSpeed = 0.78;
  controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
  controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY;
  controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
  controls.touches.ONE = THREE.TOUCH.ROTATE;
  controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;

  setupLights(scene, profile);
  createRoom(scene);
  const fridge = createFridge(createMaterials());
  fridge.group.position.set(0, 0, FRIDGE_WALL_Z);
  scene.add(fridge.group);
  fridge.group.updateMatrixWorld(true);
  const fridgeLocalBottom = new THREE.Box3().setFromObject(fridge.group).min.y;

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const foodMeshes = new Map();
  const foodZones = new Map();
  const animations = [];
  const doorState = { upper: false, lower: false };
  const clock = new THREE.Clock();
  let pointerStart = null;
  let baseScale = 0.82;
  let baseX = -0.45;
  let initialView = null;
  let layoutSignature = '';
  let attention = null;
  let frameId = 0;
  let controlsActive = false;
  let settleFrames = 0;
  let shadowDirty = true;
  let cabinetWasMoving = false;

  controls.addEventListener('change', () => {
    if (!profile.mobile) clampPanTarget();
    invalidate(1);
  });
  controls.addEventListener('start', () => {
    controlsActive = true;
    onUserNavigate?.();
    invalidate(1);
  });
  controls.addEventListener('end', () => {
    controlsActive = false;
    settleFrames = profile.mobile ? 0 : 12;
    invalidate(settleFrames || 1);
  });

  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('pointercancel', cancelPointer);
  if (!profile.mobile) canvas.addEventListener('wheel', handleDesktopWheel, { passive: false });
  globalThis.addEventListener('resize', resize, { passive: true });

  function handlePointerDown(event) {
    if (event.button !== 0) return;
    pointerStart = { x: event.clientX, y: event.clientY };
  }

  function handlePointerUp(event) {
    if (event.button !== 0) return;
    handleTap(event);
  }

  function cancelPointer() {
    pointerStart = null;
  }

  function handleDesktopWheel(event) {
    event.preventDefault();
    onUserNavigate?.();
    const looksLikePinch = event.ctrlKey;
    const looksLikeMouseWheel = event.deltaMode !== 0
      || (Math.abs(event.deltaX) < 1 && Math.abs(event.deltaY) >= 70);

    if (looksLikePinch || looksLikeMouseWheel) {
      zoomBy(event.deltaY * (looksLikePinch ? 0.032 : 0.018));
      return;
    }
    panViewByWheel(event.deltaX, event.deltaY);
  }

  function panViewByWheel(deltaX, deltaY) {
    if (!initialView) return;
    camera.updateMatrixWorld();
    const distance = camera.position.distanceTo(controls.target);
    const worldPerPixel = THREE.MathUtils.clamp(distance * 0.00115, 0.012, 0.036);
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar(-deltaX * worldPerPixel);
    const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1).multiplyScalar(deltaY * worldPerPixel);
    const offset = right.add(up);
    camera.position.add(offset);
    controls.target.add(offset);
    clampPanTarget();
    controls.update();
    invalidate(2);
  }

  function clampPanTarget() {
    if (!initialView) return;
    const base = initialView.target;
    const clamped = new THREE.Vector3(
      THREE.MathUtils.clamp(controls.target.x, base.x - PAN_LIMITS.x, base.x + PAN_LIMITS.x),
      THREE.MathUtils.clamp(controls.target.y, base.y - PAN_LIMITS.y, base.y + PAN_LIMITS.y),
      THREE.MathUtils.clamp(controls.target.z, base.z - PAN_LIMITS.z, base.z + PAN_LIMITS.z),
    );
    const correction = clamped.sub(controls.target);
    if (correction.lengthSq() < 1e-8) return;
    controls.target.add(correction);
    camera.position.add(correction);
  }

  function handleTap(event) {
    if (!pointerStart) return;
    const movement = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
    pointerStart = null;
    if (movement > 8) return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const doorHit = raycaster.intersectObjects(fridge.doorTargets, false)[0];
    if (doorHit) {
      const key = doorHit.object.userData.doorName === 'upper-door' ? 'upper' : 'lower';
      doorState[key] = !doorState[key];
      onDoorChange?.({ ...doorState });
      invalidate(45);
      return;
    }

    const interactableFood = [...foodMeshes.entries()]
      .filter(([instanceId]) => isFoodInteractable(foodZones.get(instanceId)))
      .map(([, mesh]) => mesh);
    const foodHit = raycaster.intersectObjects(interactableFood, true)[0];
    if (!foodHit) return;
    const root = findFoodRoot(foodHit.object);
    if (root) onFoodSelect?.(root.userData.instanceId);
  }

  function isFoodInteractable(zone) {
    if (zone === 'fridge' || zone === 'door') return doorState.upper;
    if (zone === 'freezer') return doorState.lower;
    return false;
  }

  function buildFoodMesh(food, item) {
    const mesh = createFoodModel(food, item);
    mesh.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
    return mesh;
  }

  function stageItem(food, item, { animate = true } = {}) {
    if (foodMeshes.has(item.instanceId)) return { ok: true, mesh: foodMeshes.get(item.instanceId) };
    try {
      const mesh = buildFoodMesh(food, item);
      fridge.foodRoots[item.zone].add(mesh);
      foodMeshes.set(item.instanceId, mesh);
      foodZones.set(item.instanceId, item.zone);
      if (animate) animations.push({ mesh, age: 0 });
      else mesh.scale.setScalar(mesh.userData.targetScale ?? 1);
      invalidate(animate ? 30 : 1);
      return { ok: true, mesh };
    } catch (error) {
      console.error(`Unable to render food ${food?.id ?? item.foodId}:`, error);
      return { ok: false, error };
    }
  }

  function syncInventory(items, catalogById) {
    const failures = [];
    const liveIds = new Set(items.map((item) => item.instanceId));
    foodMeshes.forEach((mesh, id) => {
      if (!liveIds.has(id)) removeItem(id);
    });
    items.forEach((item) => {
      if (foodMeshes.has(item.instanceId)) return;
      const food = catalogById.get(item.foodId);
      if (!food) {
        failures.push(item.instanceId);
        return;
      }
      const result = stageItem(food, item, { animate: false });
      if (!result.ok) failures.push(item.instanceId);
    });
    invalidate(1);
    return failures;
  }

  function removeItem(instanceId) {
    const mesh = foodMeshes.get(instanceId);
    if (!mesh) return;
    if (attention?.instanceId === instanceId) clearAttention();
    mesh.parent?.remove(mesh);
    disposeObject(mesh);
    foodMeshes.delete(instanceId);
    foodZones.delete(instanceId);
    invalidate(1);
  }

  function openForZone(zone) {
    if (zone === 'freezer') doorState.lower = true;
    else doorState.upper = true;
    onDoorChange?.({ ...doorState });
    invalidate(45);
  }

  function revealItem(instanceId, zone) {
    openForZone(zone);
    const reveal = () => {
      const mesh = foodMeshes.get(instanceId);
      if (!mesh) return;
      clearAttention();
      const marker = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.22, 0),
        new THREE.MeshBasicMaterial({ color: '#fff1a6', transparent: true, opacity: 0.98, depthTest: false, depthWrite: false }),
      );
      marker.position.set(0, 1.05, 0);
      marker.renderOrder = 999;
      mesh.add(marker);
      attention = { instanceId, mesh, marker, age: 0 };
      invalidate(120);
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
    const nextDistance = THREE.MathUtils.clamp(
      camera.position.distanceTo(controls.target) + amount,
      controls.minDistance,
      controls.maxDistance,
    );
    camera.position.copy(controls.target).add(direction.multiplyScalar(nextDistance));
    controls.update();
    onUserNavigate?.();
    invalidate(profile.mobile ? 1 : 10);
  }

  function resetView() {
    if (!initialView) return;
    camera.position.copy(initialView.position);
    controls.target.copy(initialView.target);
    controls.update();
    invalidate(profile.mobile ? 1 : 12);
  }

  function groundedY(scale) {
    return ROOM_FLOOR_Y - fridgeLocalBottom * scale + 0.006;
  }

  function resize() {
    const width = Math.max(1, stage.clientWidth);
    const height = Math.max(1, stage.clientHeight);
    renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio ?? 1, profile.pixelRatioCap));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const portrait = height > width * 1.08;
    const signature = `${portrait ? 'portrait' : 'landscape'}-${width < 390 ? 'small' : width < 760 ? 'medium' : 'wide'}`;

    if (!initialView || signature !== layoutSignature) {
      layoutSignature = signature;
      if (portrait) {
        baseScale = width < 390 ? 0.76 : 0.81;
        baseX = -0.38;
        camera.fov = width < 390 ? 42 : 39;
        camera.position.set(8.4, 2.85, 15.3);
        controls.target.set(-0.1, 0.05, -2.28);
      } else {
        baseScale = width < 1000 ? 0.88 : 0.96;
        baseX = -0.62;
        camera.fov = 34;
        camera.position.set(11.1, 2.8, 15.6);
        controls.target.set(-0.3, 0.08, -2.38);
      }
      initialView = { position: camera.position.clone(), target: controls.target.clone() };
      fridge.group.scale.setScalar(baseScale);
      fridge.group.position.set(baseX, groundedY(baseScale), FRIDGE_WALL_Z);
      controls.update();
    }

    camera.updateProjectionMatrix();
    shadowDirty = true;
    invalidate(1);
  }

  function invalidate(extraFrames = 0) {
    settleFrames = Math.max(settleFrames, extraFrames);
    if (frameId) return;
    frameId = requestAnimationFrame(renderFrame);
  }

  function renderFrame() {
    frameId = 0;
    const delta = Math.min(clock.getDelta(), 0.05);
    const upperTarget = doorState.upper ? 1.92 : 0;
    const lowerTarget = doorState.lower ? 1.82 : 0;
    const desiredScale = baseScale;
    const desiredX = baseX;
    const desiredY = groundedY(desiredScale);

    fridge.doors.upper.pivot.rotation.y = damp(fridge.doors.upper.pivot.rotation.y, upperTarget, 8.5, delta);
    fridge.doors.lower.pivot.rotation.y = damp(fridge.doors.lower.pivot.rotation.y, lowerTarget, 8.5, delta);
    fridge.group.position.x = damp(fridge.group.position.x, desiredX, 7.5, delta);
    fridge.group.position.y = damp(fridge.group.position.y, desiredY, 7.5, delta);
    fridge.group.position.z = damp(fridge.group.position.z, FRIDGE_WALL_Z, 8.5, delta);
    const nextScale = damp(fridge.group.scale.x, desiredScale, 6.5, delta);
    fridge.group.scale.setScalar(nextScale);

    const cabinetMoving = !near(fridge.doors.upper.pivot.rotation.y, upperTarget)
      || !near(fridge.doors.lower.pivot.rotation.y, lowerTarget)
      || !near(fridge.group.position.x, desiredX)
      || !near(fridge.group.position.y, desiredY)
      || !near(fridge.group.position.z, FRIDGE_WALL_Z)
      || !near(fridge.group.scale.x, desiredScale);

    for (let index = animations.length - 1; index >= 0; index -= 1) {
      const animation = animations[index];
      animation.age += delta;
      const t = Math.min(animation.age / 0.38, 1);
      const eased = 1 - (1 - t) ** 3;
      const itemScale = animation.mesh.userData.targetScale ?? 1;
      animation.mesh.scale.setScalar(Math.max(0.001, eased * (1 + Math.sin(t * Math.PI) * 0.12) * itemScale));
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

    const controlsChanged = controls.update();
    const finalShadowFrame = !cabinetMoving && cabinetWasMoving;
    if (cabinetMoving || finalShadowFrame || shadowDirty) {
      renderer.shadowMap.needsUpdate = true;
      shadowDirty = false;
    }
    cabinetWasMoving = cabinetMoving;
    renderer.render(scene, camera);

    if (settleFrames > 0) settleFrames -= 1;
    const needsAnotherFrame = controlsActive
      || cabinetMoving
      || animations.length > 0
      || Boolean(attention)
      || settleFrames > 0
      || (!profile.mobile && Boolean(controlsChanged));
    if (needsAnotherFrame) invalidate();
  }

  resize();

  return {
    syncInventory,
    stageItem,
    removeItem,
    openForZone,
    revealItem,
    zoomIn: () => zoomBy(-1.7),
    zoomOut: () => zoomBy(1.7),
    resetView,
    getDoorState: () => ({ ...doorState }),
  };
}

function getRenderProfile() {
  const coarsePointer = typeof globalThis.matchMedia === 'function' && globalThis.matchMedia('(pointer: coarse)').matches;
  const narrowViewport = (globalThis.innerWidth ?? 1024) < 760;
  return {
    mobile: coarsePointer || narrowViewport,
    pixelRatioCap: coarsePointer || narrowViewport ? 1.8 : 2,
    shadowMapSize: 1536,
  };
}

function setupLights(scene, profile) {
  scene.add(new THREE.HemisphereLight('#fff6da', '#8d603d', 2.3));
  const key = new THREE.DirectionalLight('#fff1ce', 3.2);
  key.position.set(-4, 8, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(profile.shadowMapSize, profile.shadowMapSize);
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
    if (Array.isArray(child.material)) {
      child.material.forEach((material) => {
        if (!material.userData?.sharedFoodDetail) material.dispose?.();
      });
    } else if (!child.material?.userData?.sharedFoodDetail) {
      child.material?.dispose?.();
    }
  });
}

function near(value, target, epsilon = 0.0015) {
  return Math.abs(value - target) <= epsilon;
}

function damp(current, target, lambda, delta) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * delta));
}

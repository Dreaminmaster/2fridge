import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createMaterials } from './materials.js';
import { createRoom } from './createRoom.js';
import { createFridge } from './createFridge.js';
import { createFoodModel } from './createFoodModel.js';

const ROOM_FLOOR_Y = -3.32;
const MOVE_LIMITS = { x: 4.5, z: 2.8 };

export function createSceneController({
  canvas,
  stage,
  onDoorChange,
  onFoodSelect,
  onUserNavigate,
  onMoveModeChange,
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
  controls.dampingFactor = 0.075;
  controls.enablePan = false;
  controls.minDistance = 10.5;
  controls.maxDistance = 32;
  controls.minPolarAngle = Math.PI * 0.24;
  controls.maxPolarAngle = Math.PI * 0.68;
  controls.rotateSpeed = profile.mobile ? 0.78 : 0.62;
  controls.zoomSpeed = profile.mobile ? 0.9 : 0.75;
  controls.touches.ONE = THREE.TOUCH.ROTATE;
  controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;

  setupLights(scene, profile);
  createRoom(scene);
  const fridge = createFridge(createMaterials());
  fridge.group.position.set(0, 0, 0);
  scene.add(fridge.group);
  fridge.group.updateMatrixWorld(true);
  const fridgeLocalBottom = new THREE.Box3().setFromObject(fridge.group).min.y;

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const foodMeshes = new Map();
  const animations = [];
  const doorState = { upper: false, lower: false };
  const clock = new THREE.Clock();
  let pointerStart = null;
  let movePointer = null;
  let moveMode = false;
  let userOffsetX = 0;
  let userOffsetZ = 0;
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

  controls.addEventListener('change', () => invalidate(1));
  controls.addEventListener('start', () => {
    controlsActive = true;
    onUserNavigate?.();
    invalidate(1);
  });
  controls.addEventListener('end', () => {
    controlsActive = false;
    settleFrames = profile.mobile ? 0 : 20;
    invalidate(settleFrames || 1);
  });

  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('pointercancel', cancelPointer);
  canvas.addEventListener('contextmenu', (event) => {
    if (moveMode) event.preventDefault();
  });
  globalThis.addEventListener('resize', resize, { passive: true });

  function handlePointerDown(event) {
    pointerStart = { x: event.clientX, y: event.clientY };
    if (!profile.mobile && moveMode && event.button === 0) {
      movePointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
      canvas.setPointerCapture?.(event.pointerId);
      onUserNavigate?.();
      event.preventDefault();
    }
  }

  function handlePointerMove(event) {
    if (!movePointer || event.pointerId !== movePointer.id) return;
    const dx = event.clientX - movePointer.x;
    const dy = event.clientY - movePointer.y;
    movePointer.x = event.clientX;
    movePointer.y = event.clientY;
    const distance = camera.position.distanceTo(controls.target);
    const worldPerPixel = THREE.MathUtils.clamp(distance * 0.00135, 0.014, 0.035);
    userOffsetX = THREE.MathUtils.clamp(userOffsetX + dx * worldPerPixel, -MOVE_LIMITS.x, MOVE_LIMITS.x);
    userOffsetZ = THREE.MathUtils.clamp(userOffsetZ + dy * worldPerPixel * 0.72, -MOVE_LIMITS.z, MOVE_LIMITS.z);
    shadowDirty = true;
    invalidate(2);
    event.preventDefault();
  }

  function handlePointerUp(event) {
    if (movePointer && event.pointerId === movePointer.id) {
      canvas.releasePointerCapture?.(event.pointerId);
      movePointer = null;
      pointerStart = null;
      shadowDirty = true;
      invalidate(3);
      return;
    }
    handleTap(event);
  }

  function cancelPointer(event) {
    if (movePointer && event.pointerId === movePointer.id) movePointer = null;
    pointerStart = null;
  }

  function handleTap(event) {
    if (!pointerStart || moveMode) {
      pointerStart = null;
      return;
    }
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
    invalidate(45);
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
    invalidate(profile.mobile ? 1 : 15);
  }

  function setMoveMode(enabled) {
    const next = !profile.mobile && Boolean(enabled);
    moveMode = next;
    controls.enableRotate = !moveMode;
    canvas.classList.toggle('fridge-move-mode', moveMode);
    if (!moveMode) movePointer = null;
    onMoveModeChange?.(moveMode);
    invalidate(1);
    return moveMode;
  }

  function toggleMoveMode() {
    return setMoveMode(!moveMode);
  }

  function resetView() {
    if (!initialView) return;
    setMoveMode(false);
    userOffsetX = 0;
    userOffsetZ = 0;
    camera.position.copy(initialView.position);
    controls.target.copy(initialView.target);
    controls.update();
    shadowDirty = true;
    invalidate(profile.mobile ? 1 : 18);
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
        camera.position.set(8.4, 2.85, 17.5);
        controls.target.set(-0.1, 0.05, -0.08);
      } else {
        baseScale = width < 1000 ? 0.88 : 0.96;
        baseX = -0.62;
        camera.fov = 34;
        camera.position.set(11.1, 2.8, 17.8);
        controls.target.set(-0.3, 0.08, -0.18);
      }
      initialView = { position: camera.position.clone(), target: controls.target.clone() };
      fridge.group.scale.setScalar(baseScale);
      fridge.group.position.set(baseX + userOffsetX, groundedY(baseScale), userOffsetZ);
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
    const anyOpen = doorState.upper || doorState.lower;
    const desiredScale = baseScale * (anyOpen ? 0.94 : 1);
    const desiredX = baseX + userOffsetX + (anyOpen ? -0.72 : 0);
    const desiredZ = userOffsetZ;
    const desiredY = groundedY(desiredScale);

    fridge.doors.upper.pivot.rotation.y = damp(fridge.doors.upper.pivot.rotation.y, upperTarget, 8.5, delta);
    fridge.doors.lower.pivot.rotation.y = damp(fridge.doors.lower.pivot.rotation.y, lowerTarget, 8.5, delta);
    fridge.group.position.x = damp(fridge.group.position.x, desiredX, 7.5, delta);
    fridge.group.position.y = damp(fridge.group.position.y, desiredY, 7.5, delta);
    fridge.group.position.z = damp(fridge.group.position.z, desiredZ, 8.5, delta);
    const nextScale = damp(fridge.group.scale.x, desiredScale, 6.5, delta);
    fridge.group.scale.setScalar(nextScale);

    const cabinetMoving = !near(fridge.doors.upper.pivot.rotation.y, upperTarget)
      || !near(fridge.doors.lower.pivot.rotation.y, lowerTarget)
      || !near(fridge.group.position.x, desiredX)
      || !near(fridge.group.position.y, desiredY)
      || !near(fridge.group.position.z, desiredZ)
      || !near(fridge.group.scale.x, desiredScale);
    if (!cabinetMoving && cabinetWasMoving) shadowDirty = true;
    cabinetWasMoving = cabinetMoving;

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
    if (shadowDirty) {
      renderer.shadowMap.needsUpdate = true;
      shadowDirty = false;
    }
    renderer.render(scene, camera);

    if (settleFrames > 0) settleFrames -= 1;
    const needsAnotherFrame = controlsActive
      || Boolean(movePointer)
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
    setMoveMode,
    toggleMoveMode,
    getMoveMode: () => moveMode,
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
    if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose?.());
    else child.material?.dispose?.();
  });
}

function near(value, target, epsilon = 0.0015) {
  return Math.abs(value - target) <= epsilon;
}

function damp(current, target, lambda, delta) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * delta));
}

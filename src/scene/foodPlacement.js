import * as THREE from 'three';

const EPSILON = 1e-4;

/**
 * Normalize a procedurally generated food model around its own footprint,
 * fit it inside the slot envelope, then place its lowest point directly on
 * the shelf/floor/rack support plane.
 */
export function prepareFoodPlacement(root, slot) {
  if (!slot) throw new Error('A storage slot is required');

  root.position.set(0, 0, 0);
  root.rotation.set(0, 0, 0);
  root.scale.setScalar(1);
  root.updateMatrixWorld(true);

  const bounds = new THREE.Box3().setFromObject(root);
  if (bounds.isEmpty()) throw new Error('Food model has no measurable geometry');

  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const offset = new THREE.Vector3(-center.x, -bounds.min.y, -center.z);

  // Move the generated geometry inside the root rather than shifting the
  // root itself. The root remains the stable inventory/animation anchor.
  root.children.forEach((child) => child.position.add(offset));

  const widthFit = finiteFit(slot.maxWidth, size.x);
  const heightFit = finiteFit(slot.maxHeight, size.y);
  const depthFit = finiteFit(slot.maxDepth, size.z);
  const padding = slot.fitPadding ?? 0.92;
  const targetScale = Math.max(
    0.12,
    Math.min(slot.scale ?? 1, widthFit, heightFit, depthFit) * padding,
  );

  const clearance = slot.clearance ?? 0.012;
  root.userData.targetScale = targetScale;
  root.userData.placement = {
    supportY: slot.supportY,
    clearance,
    naturalSize: { x: size.x, y: size.y, z: size.z },
    fittedSize: {
      x: size.x * targetScale,
      y: size.y * targetScale,
      z: size.z * targetScale,
    },
  };

  root.position.set(slot.x, slot.supportY + clearance, slot.z);
  root.rotation.y = slot.rotationY ?? 0;
  root.scale.setScalar(0.001);
  return root;
}

function finiteFit(limit, measured) {
  if (!Number.isFinite(limit)) return Infinity;
  return limit / Math.max(measured, EPSILON);
}

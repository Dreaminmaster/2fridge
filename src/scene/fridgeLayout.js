export const SLOT_LAYOUT = {
  fridge: buildLayeredShelves({
    supports: [
      { supportY: 3.02, maxHeight: 1.12 },
      { supportY: 1.82, maxHeight: 0.88 },
      { supportY: 0.64, maxHeight: 0.88 },
    ],
    cols: [-1.44, -0.48, 0.48, 1.44],
    maxWidth: 0.76,
    maxDepth: 0.72,
    layers: [
      { id: 'front', label: '前排', z: 0.70, xOffset: -0.04, scale: 0.72 },
      { id: 'back', label: '后排', z: -0.70, xOffset: 0.12, scale: 0.69 },
    ],
  }),
  freezer: buildLayeredShelves({
    supports: [
      // Upper freezer shelf.
      { supportY: -2.26, maxHeight: 0.86 },
      // Lower freezer floor liner. Its vertical clearance is intentionally
      // smaller so tall models are automatically scaled down instead of
      // cutting through the shelf above.
      { supportY: -3.02, maxHeight: 0.58 },
    ],
    cols: [-1.44, -0.48, 0.48, 1.44],
    maxWidth: 0.76,
    maxDepth: 0.72,
    layers: [
      { id: 'front', label: '前排', z: 0.70, xOffset: -0.04, scale: 0.70 },
      { id: 'back', label: '后排', z: -0.70, xOffset: 0.12, scale: 0.67 },
    ],
  }),
  door: buildDoorGrid({
    supports: [1.07, -0.15, -1.37],
    cols: [-3.35, -2.70, -2.05, -1.40],
    z: -0.82,
    scale: 0.66,
    maxWidth: 0.50,
    maxHeight: 0.72,
    maxDepth: 0.48,
  }),
};

function buildLayeredShelves({ supports, cols, layers, maxWidth, maxDepth }) {
  return supports.flatMap((support, shelfIndex) => layers.flatMap((layer) => cols.map((x, columnIndex) => ({
    x: x + layer.xOffset,
    y: support.supportY,
    supportY: support.supportY,
    z: layer.z,
    shelf: shelfIndex,
    column: columnIndex,
    depth: layer.id,
    depthLabel: layer.label,
    scale: layer.scale,
    maxWidth,
    maxHeight: support.maxHeight,
    maxDepth,
    clearance: 0.012,
    fitPadding: 0.92,
    rotationY: (columnIndex - 1.5) * 0.035 + (layer.id === 'back' ? -0.025 : 0.025),
  }))));
}

function buildDoorGrid({ supports, cols, z, scale, maxWidth, maxHeight, maxDepth }) {
  return supports.flatMap((supportY, shelfIndex) => cols.map((x, columnIndex) => ({
    x,
    y: supportY,
    supportY,
    z,
    shelf: shelfIndex,
    column: columnIndex,
    depth: 'door',
    depthLabel: '门架',
    scale,
    maxWidth,
    maxHeight,
    maxDepth,
    clearance: 0.01,
    fitPadding: 0.92,
    rotationY: (columnIndex - 1.5) * 0.025,
  })));
}

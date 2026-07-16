export const SLOT_LAYOUT = {
  fridge: buildLayeredShelves({
    rows: [3.34, 2.16, 0.98],
    cols: [-1.42, -0.47, 0.48, 1.43],
    layers: [
      { id: 'back', label: '后排', z: -0.92, xOffset: 0.14, yOffset: 0.08, scale: 0.60 },
      { id: 'front', label: '前排', z: 0.58, xOffset: -0.04, yOffset: 0, scale: 0.65 },
    ],
  }),
  freezer: buildLayeredShelves({
    rows: [-1.72, -2.66],
    cols: [-1.42, -0.47, 0.48, 1.43],
    layers: [
      { id: 'back', label: '后排', z: -0.90, xOffset: 0.14, yOffset: 0.08, scale: 0.60 },
      { id: 'front', label: '前排', z: 0.58, xOffset: -0.04, yOffset: 0, scale: 0.65 },
    ],
  }),
  door: buildDoorGrid({
    rows: [1.22, 0, -1.22],
    cols: [-3.34, -2.70, -2.06, -1.42],
    z: -0.80,
    scale: 0.64,
  }),
};

function buildLayeredShelves({ rows, cols, layers }) {
  return rows.flatMap((y, shelfIndex) => layers.flatMap((layer) => cols.map((x, columnIndex) => ({
    x: x + layer.xOffset,
    y: y + layer.yOffset,
    z: layer.z,
    shelf: shelfIndex,
    column: columnIndex,
    depth: layer.id,
    depthLabel: layer.label,
    scale: layer.scale,
    rotationY: (columnIndex - 1.5) * 0.045 + (layer.id === 'back' ? -0.04 : 0.04),
  }))));
}

function buildDoorGrid({ rows, cols, z, scale }) {
  return rows.flatMap((y, shelfIndex) => cols.map((x, columnIndex) => ({
    x,
    y,
    z,
    shelf: shelfIndex,
    column: columnIndex,
    depth: 'door',
    depthLabel: '门架',
    scale,
    rotationY: (columnIndex - 1.5) * 0.035,
  })));
}

export const SLOT_LAYOUT = {
  fridge: buildGrid({ rows: [3.34, 2.16, 0.98], cols: [-1.36, -0.45, 0.46, 1.37], z: 0.36 }),
  freezer: buildGrid({ rows: [-1.72, -2.66], cols: [-1.36, -0.45, 0.46, 1.37], z: 0.36 }),
  door: buildGrid({ rows: [1.22, 0, -1.22], cols: [-3.05, -2.35, -1.65], z: -0.64 }),
};

function buildGrid({ rows, cols, z }) {
  return rows.flatMap((y) => cols.map((x) => ({ x, y, z })));
}

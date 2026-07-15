import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { foodItems, categories } from '../src/foodData.js';

assert.equal(foodItems.length, 15, '第一版应包含 15 种食材');
assert.equal(new Set(foodItems.map((item) => item.id)).size, foodItems.length, '食材 id 必须唯一');
assert.deepEqual(new Set(foodItems.map((item) => item.target)), new Set(['freezer', 'fridge', 'door']), '必须覆盖冷冻、冷藏和门内三个目标区域');
assert.ok(foodItems.every((item) => item.name && item.model && item.palette?.length === 2), '食材模型数据不完整');
assert.ok(categories.some((item) => item.id === 'all'), '缺少“全部”分类');

const [html, main, css, vite, workflow, readme] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/style.css', import.meta.url), 'utf8'),
  readFile(new URL('../vite.config.js', import.meta.url), 'utf8'),
  readFile(new URL('../.github/workflows/bootstrap-project.yml', import.meta.url), 'utf8'),
  readFile(new URL('../README.md', import.meta.url), 'utf8'),
]);

for (const selector of ['scene', 'foodToggle', 'foodDrawer', 'foodGrid', 'resetButton']) {
  assert.ok(html.includes(`id="${selector}"`), `HTML 缺少 #${selector}`);
}
assert.ok(main.includes('Raycaster'), '缺少柜门点击射线检测');
assert.ok(main.includes('localStorage'), '缺少本地库存保存');
assert.ok(main.includes('getFoodParent'), '门内食材必须随柜门一起运动');
assert.ok(css.includes('@media (min-width: 760px)'), '缺少桌面端响应式布局');
assert.ok(css.includes('env(safe-area-inset-top)'), '缺少手机安全区适配');
assert.ok(vite.includes("'/2fridge/'"), 'GitHub Pages base 路径不正确');
assert.ok(workflow.includes('actions/deploy-pages@v4'), '缺少 GitHub Pages 部署步骤');
assert.ok(readme.includes('https://dreaminmaster.github.io/2fridge/'), 'README 缺少在线体验网址');

console.log(`Validation passed: ${foodItems.length} foods, 3 storage zones, responsive UI, persistence and Pages deployment.`);

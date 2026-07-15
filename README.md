# 口袋冰箱 · Pocket Fridge

一个以手机端为核心、使用 Three.js 实现的低多边形 3D 互动冰箱。

**当前版本：2.0 交互与数据结构重构版**

## 在线体验

**<https://dreaminmaster.github.io/2fridge/>**

## 本次版本重点

- 拖动旋转冰箱，双指或滚轮缩放，并提供放大、缩小和恢复视角按钮
- 上下柜门独立开合，打开后可以观察内部与柜门置物架
- 每一件食材都有独立 `instanceId`、存放区域和固定槽位
- 冷藏区 12 个位置、冷冻区 8 个位置、门内 9 个位置，总容量 29 件
- 区域放满后禁止继续添加，并在食材面板和容量条中明确显示
- 轻点 3D 食材可单独移除，也可在库存面板按种类逐件减少
- 删除食材后空槽会被重新利用，不会因持续添加造成模型重叠
- 手机端底部抽屉与桌面端右侧抽屉使用不同布局
- 删除了原来顶部的冰箱状态提示，保留更轻量的操作反馈

## 面向未来菜谱系统的数据结构

库存不再只是一个数量对象，而是独立条目数组：

```js
{
  instanceId: "...",
  foodId: "eggs",
  ingredientKey: "egg",
  zone: "fridge",
  slot: 0,
  quantity: 1,
  unit: "盒",
  addedAt: "..."
}
```

`src/domain/recipeContext.js` 会把冰箱条目转换成稳定的菜谱输入：

```js
window.pocketFridge.getRecipeContext()
```

返回内容包括标准食材键、数量、单位、存放区域和菜谱标签。后续无论连接本地规则菜谱、数据库还是 AI 菜谱生成，都不需要重写 3D 冰箱与库存层。

## 代码结构

```text
src/
├─ data/
│  └─ foodCatalog.js       食材、分类、容量及菜谱元数据
├─ domain/
│  ├─ inventoryStore.js    库存状态、容量、槽位、持久化与移除逻辑
│  └─ recipeContext.js     菜谱系统标准数据出口
├─ scene/
│  ├─ createFridge.js      冰箱结构与柜门
│  ├─ createFoodModel.js   Low-poly 食物模型
│  ├─ createRoom.js        场景背景
│  ├─ fridgeLayout.js      固定存储槽位
│  ├─ geometry.js          通用几何体
│  ├─ materials.js         材质与色板
│  └─ sceneController.js   Three.js、旋转缩放、射线点击和动画
├─ ui/
│  ├─ foodIcon.js          食材界面图标
│  └─ uiController.js      抽屉、容量、添加、移除和提示
├─ main.js                 依赖组装和公开数据接口
└─ style.css               手机与桌面响应式样式
```

## 运行与测试

```bash
npm install
npm run dev
npm test
npm run build
npm run preview
```

测试覆盖：

- 区域容量上限
- 超量添加拒绝
- 单件移除
- 空槽重新使用
- 同类食材数量聚合
- 未来菜谱上下文生成

## 技术栈

- Three.js
- OrbitControls
- Vite
- 原生 JavaScript、HTML、CSS
- Node.js 内置测试运行器
- GitHub Actions / GitHub Pages

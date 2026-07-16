# 口袋冰箱 · Pocket Fridge

一个以手机端为核心、使用 Three.js 实现的低多边形 3D 互动冰箱。

## 在线体验

**<https://dreaminmaster.github.io/2fridge/>**

## 当前版本

- 拖动旋转冰箱，双指或滚轮缩放，并提供放大、缩小和恢复视角按钮
- 手机端使用独立性能档：1× 像素比、低成本阴影、静态阴影缓存和无毛玻璃旋转模式
- 上下柜门独立开合，可以观察冰箱深处和柜门内侧
- 冰箱柜体与层板已经加深，同一层分为前排与后排
- 新食物优先进入可见的前排，前排放满后再进入抬高错位的后排
- 手机端添加食物后自动收起面板、打开对应柜门，并短暂标记新食物位置
- 冷藏区 24 个位置、冷冻区 16 个位置、门内 12 个位置，总容量 52 件
- 每件食材拥有独立 `instanceId`、存放区域、层号、前后排和固定槽位
- 区域放满后禁止继续添加；移除食材后会优先复用空槽
- 轻点 3D 食材可查看所在层与前后排，并可单独移除
- 48 种基础食材，覆盖肉类、海鲜、冷冻食品、蔬菜、水果、乳制品、主食、饮料与调味料
- 手机端底部抽屉和桌面端右侧抽屉使用不同布局
- 本地库存持久化，刷新后继续保留

## 三维储物结构

冷藏和冷冻不再使用单一平面网格，而是：

```text
每一层
├─ 前排：4 个位置（优先使用）
└─ 后排：4 个位置（抬高、错位显示）
```

冷藏区共有 3 层，冷冻区共有 2 层。前四件食物会优先摆在当前层前排，保证刚添加时能直接看到；当前层前排放满后才使用后排。后排食物会略微缩小、抬高并错位，旋转冰箱后可以清楚看见深处。食物模型会按照槽位缩放，避免横向重叠或跑出柜体。

## 手机端性能策略

移动端不会再沿用桌面端渲染参数：

- WebGL 像素比上限为 `1`，避免 Retina 屏幕一次渲染数百万额外像素
- 使用较低成本的阴影贴图，小食物不单独投射阴影
- 阴影贴图仅在柜门、柜体发生变化时更新，旋转相机时不重复计算
- 手机端覆盖层关闭 `backdrop-filter`，避免 Safari 在旋转画面时同时重算毛玻璃
- 触摸旋转使用更直接的阻尼和速度参数

## 面向未来菜谱系统的数据结构

库存条目结构：

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

公开菜谱上下文：

```js
window.pocketFridge.getRecipeContext()
```

返回标准食材键、数量、单位、存放区域和菜谱标签。后续连接规则菜谱库、数据库或 AI 菜谱生成时，不需要重写 3D 冰箱与库存层。

## 代码结构

```text
src/
├─ data/
│  └─ foodCatalog.js       食材、分类、容量及菜谱元数据
├─ domain/
│  ├─ inventoryStore.js    库存、容量、槽位、持久化与移除
│  └─ recipeContext.js     菜谱系统标准数据出口
├─ scene/
│  ├─ createFridge.js      深柜体、层板与柜门结构
│  ├─ createFoodModel.js   Low-poly 食物模型
│  ├─ fridgeLayout.js      前排、后排与门架槽位
│  └─ sceneController.js   Three.js、旋转缩放、点击、性能档和动画
├─ ui/
│  ├─ foodIcon.js          食材界面图标
│  └─ uiController.js      添加、容量、库存与移除
├─ main.js
├─ style.css
└─ mobile-performance.css  手机端合成与触控性能优化
```

## 本地运行

```bash
npm install
npm run dev
```

测试与生产构建：

```bash
npm test
npm run build
npm run preview
```

GitHub Actions 会在每次推送到 `main` 后自动测试、构建并发布到 GitHub Pages。

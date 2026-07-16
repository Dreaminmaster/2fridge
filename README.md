# 口袋冰箱 · Pocket Fridge

一个以手机端为核心、使用 Three.js 实现的低多边形 3D 互动冰箱。

## 在线体验

**<https://dreaminmaster.github.io/2fridge/>**

## 当前版本

- 拖动旋转冰箱，双指或滚轮缩放，并提供放大、缩小和恢复视角按钮
- 上下柜门独立开合，可以观察冰箱深处和柜门内侧
- 冰箱柜体与层板已经加深，同一层分为后排与前排
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
├─ 后排：4 个位置
└─ 前排：4 个位置
```

冷藏区共有 3 层，冷冻区共有 2 层。后排食物会略微缩小、抬高并错位，旋转冰箱后可以清楚看见深处。食物模型会按照槽位缩放，避免横向重叠或跑出柜体。

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
│  └─ sceneController.js   Three.js、旋转缩放、点击和动画
├─ ui/
│  ├─ foodIcon.js          食材界面图标
│  └─ uiController.js      添加、容量、库存与移除
├─ main.js
└─ style.css
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

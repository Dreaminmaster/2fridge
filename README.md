# 口袋冰箱 · Pocket Fridge

一个以手机端为核心、使用 Three.js 实现的低多边形 3D 互动冰箱。用户可以分别打开冷藏门和冷冻门，从右侧食材面板选择食材，并把它们自动放入冷藏区、冷冻区或柜门收纳架。

## 在线体验

**GitHub Pages：<https://dreaminmaster.github.io/2fridge/>**

> 第一次提交后，GitHub Pages 工作流需要短暂构建和部署。如果页面暂时显示 404，请等待 Actions 中的 `Deploy Pocket Fridge to GitHub Pages` 完成。

## 当前已实现

- 手机竖屏优先的全屏交互界面，同时兼容桌面浏览器
- Three.js 程序化低多边形冰箱、房间、地板和装饰植物
- 独立开合的冷藏门与冷冻门，支持鼠标和触摸点击
- 冷藏层架、冷冻层架以及冰箱门内置物架
- 15 种低多边形 3D 食材
- 食材分类面板：全部、冷冻、冷藏、门内
- 点击食材后自动分类、自动摆放并播放落位动画
- 同一区域连续添加时自动错位排列，避免完全重叠
- 添加食材时自动打开对应柜门
- 本地库存保存，刷新页面后食材仍然保留
- 当前库存预览、数量角标、清空确认和操作提示
- 对 `prefers-reduced-motion` 的无障碍支持
- GitHub Actions 自动构建并部署到 GitHub Pages

## 食材

牛肉条、羊肉条、鸡肉块、鸡腿、鸡翅、金枪鱼、红烧肉、洋葱、蒜苗、韭菜、可乐、黄油、牛奶、鸡蛋、酱料瓶。

## 技术栈

- Vite
- Three.js
- 原生 HTML、CSS 和 JavaScript
- GitHub Actions
- GitHub Pages

## 本地运行

```bash
npm install
npm run dev
```

构建和本地预览：

```bash
npm run build
npm run preview
```

## 交互说明

1. 轻触冰箱上门或下门，分别打开冷藏区和冷冻区。
2. 点击右侧绿色篮子按钮，展开食材选择面板。
3. 点击任意食材，系统会自动生成相应的 3D 模型并放入合适区域。
4. 点击右上角清空按钮，可以清除当前设备保存的全部食材。

## 响应式设计

手机竖屏是主要设计基准。较宽屏幕下，相机距离、冰箱比例、食材面板宽度和底部库存条会自动调整；触控点击区域、底部安全区和 iPhone 刘海安全区也已经纳入布局。

## 部署

仓库中的 `.github/workflows/bootstrap-project.yml` 会在每次推送到 `main` 后自动：

1. 安装依赖；
2. 执行生产构建；
3. 上传 `dist`；
4. 发布到 GitHub Pages。

Vite 的生产路径已经配置为 `/2fridge/`，因此静态资源可以在项目 Pages 地址下正常加载。

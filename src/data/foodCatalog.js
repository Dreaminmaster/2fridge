export const ZONE_META = {
  fridge: { id: 'fridge', label: '冷藏区', shortLabel: '冷藏', capacity: 12 },
  freezer: { id: 'freezer', label: '冷冻区', shortLabel: '冷冻', capacity: 8 },
  door: { id: 'door', label: '柜门内', shortLabel: '门内', capacity: 9 },
};

export const FOOD_CATEGORIES = [
  { id: 'all', label: '全部' },
  { id: 'frozen', label: '冷冻' },
  { id: 'cold', label: '冷藏' },
  { id: 'door', label: '饮料与瓶罐' },
];

export const FOOD_CATALOG = [
  food('beef-strips', 'beef', '牛肉条', 'frozen', 'freezer', 'meatStrip', ['#b84f43', '#7f342f'], '份', ['牛肉', '高蛋白'], ['牛肉丝', '牛肉条']),
  food('lamb-strips', 'lamb', '羊肉条', 'frozen', 'freezer', 'meatStrip', ['#c76561', '#8d413f'], '份', ['羊肉', '高蛋白'], ['羊肉片', '羊肉条']),
  food('chicken-cubes', 'chicken', '鸡肉块', 'frozen', 'freezer', 'cubes', ['#e8a16f', '#bd6f4a'], '份', ['鸡肉', '高蛋白'], ['鸡块', '鸡肉']),
  food('chicken-leg', 'chicken_leg', '鸡腿', 'frozen', 'freezer', 'drumstick', ['#d98b58', '#f1d8ae'], '个', ['鸡肉', '空气炸锅'], ['琵琶腿', '鸡腿']),
  food('chicken-wing', 'chicken_wing', '鸡翅', 'frozen', 'freezer', 'wing', ['#e39b67', '#bd704e'], '个', ['鸡肉', '空气炸锅'], ['翅中', '鸡翅']),
  food('tuna', 'tuna', '金枪鱼', 'cold', 'fridge', 'can', ['#6b9fb3', '#406c7e'], '罐', ['海鲜', '罐头', '快手菜'], ['吞拿鱼', '金枪鱼罐头']),
  food('braised-pork', 'braised_pork', '红烧肉', 'cold', 'fridge', 'cubes', ['#99513d', '#6c342a'], '份', ['猪肉', '熟食'], ['红烧肉']),
  food('onion', 'onion', '洋葱', 'cold', 'fridge', 'onion', ['#a56c9c', '#6d416b'], '个', ['蔬菜', '配菜'], ['洋葱']),
  food('garlic-sprout', 'garlic_sprout', '蒜苗', 'cold', 'fridge', 'greens', ['#6f9a4e', '#d9e5b4'], '把', ['蔬菜', '配菜'], ['青蒜', '蒜苗']),
  food('chives', 'chives', '韭菜', 'cold', 'fridge', 'greens', ['#4f8a42', '#b8d79d'], '把', ['蔬菜', '配菜'], ['韭菜']),
  food('coke', 'cola', '可乐', 'door', 'door', 'can', ['#c64c3e', '#802e2d'], '罐', ['饮料', '可乐鸡翅'], ['可乐', '可口可乐']),
  food('butter', 'butter', '黄油', 'cold', 'fridge', 'box', ['#e8c45e', '#c39732'], '盒', ['乳制品', '烘焙'], ['黄油', '牛油']),
  food('milk', 'milk', '牛奶', 'door', 'door', 'carton', ['#eef3e9', '#71a2a0'], '盒', ['乳制品', '早餐'], ['牛奶', '鲜奶']),
  food('eggs', 'egg', '鸡蛋', 'cold', 'fridge', 'eggs', ['#efe4c6', '#bda77d'], '盒', ['蛋类', '早餐'], ['鸡蛋', '蛋']),
  food('sauce', 'sauce', '酱料瓶', 'door', 'door', 'bottle', ['#9e633e', '#663720'], '瓶', ['调味料'], ['酱油', '酱料', '调味汁']),
];

function food(id, ingredientKey, name, category, target, model, palette, unit, recipeTags, aliases) {
  return { id, ingredientKey, name, category, target, model, palette, unit, recipeTags, aliases };
}

export function getFoodById(id) {
  return FOOD_CATALOG.find((item) => item.id === id) ?? null;
}

export const ZONE_META = {
  fridge: { id: 'fridge', label: '冷藏区', shortLabel: '冷藏', capacity: 32 },
  freezer: { id: 'freezer', label: '冷冻区', shortLabel: '冷冻', capacity: 16 },
  door: { id: 'door', label: '柜门内', shortLabel: '门内', capacity: 12 },
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
  food('pork-slices', 'pork', '猪肉片', 'frozen', 'freezer', 'meatStrip', ['#d88379', '#9f554f'], '份', ['猪肉', '高蛋白'], ['猪肉', '肉片']),
  food('ground-pork', 'ground_pork', '猪肉末', 'frozen', 'freezer', 'cubes', ['#d99082', '#a65d55'], '份', ['猪肉', '肉末'], ['猪肉馅', '肉末']),
  food('steak', 'beef_steak', '牛排', 'frozen', 'freezer', 'steak', ['#9f433b', '#d18572'], '块', ['牛肉', '煎烤'], ['牛排', '西冷']),
  food('fish-fillet', 'fish', '鱼排', 'frozen', 'freezer', 'fish', ['#8fb7c3', '#d8e1d4'], '片', ['鱼类', '高蛋白'], ['鱼片', '鱼排']),
  food('shrimp', 'shrimp', '虾仁', 'frozen', 'freezer', 'shrimp', ['#ef9c7c', '#d56e5b'], '份', ['海鲜', '高蛋白'], ['虾仁', '虾']),
  food('dumplings', 'dumpling', '水饺', 'frozen', 'freezer', 'dumpling', ['#eee0bd', '#c4ab7e'], '袋', ['主食', '快手菜'], ['饺子', '水饺']),
  food('ice-cream', 'ice_cream', '冰淇淋', 'frozen', 'freezer', 'cup', ['#f0b7c2', '#b77082'], '盒', ['甜品'], ['雪糕', '冰淇淋']),
  food('frozen-corn', 'corn', '冷冻玉米', 'frozen', 'freezer', 'corn', ['#e6bd45', '#9b7730'], '袋', ['蔬菜', '配菜'], ['玉米粒', '冷冻玉米']),
  food('frozen-broccoli', 'broccoli', '冷冻西兰花', 'frozen', 'freezer', 'broccoli', ['#638f50', '#315f38'], '袋', ['蔬菜', '健身'], ['西兰花', '绿花菜']),
  food('bacon', 'bacon', '培根', 'frozen', 'freezer', 'meatStrip', ['#b95e55', '#f0b49b'], '包', ['猪肉', '早餐'], ['培根', '烟肉']),
  food('fish-ball', 'fish_ball', '鱼丸', 'frozen', 'freezer', 'dumpling', ['#e8dfca', '#a8b8b1'], '袋', ['火锅', '快手菜'], ['鱼丸', '丸子']),

  food('tuna', 'tuna', '金枪鱼', 'cold', 'fridge', 'can', ['#6b9fb3', '#406c7e'], '罐', ['海鲜', '罐头', '快手菜'], ['吞拿鱼', '金枪鱼罐头']),
  food('braised-pork', 'braised_pork', '红烧肉', 'cold', 'fridge', 'cubes', ['#99513d', '#6c342a'], '份', ['猪肉', '熟食'], ['红烧肉']),
  food('onion', 'onion', '洋葱', 'cold', 'fridge', 'onion', ['#a56c9c', '#6d416b'], '个', ['蔬菜', '配菜'], ['洋葱']),
  food('garlic-sprout', 'garlic_sprout', '蒜苗', 'cold', 'fridge', 'greens', ['#6f9a4e', '#d9e5b4'], '把', ['蔬菜', '配菜'], ['青蒜', '蒜苗']),
  food('chives', 'chives', '韭菜', 'cold', 'fridge', 'greens', ['#4f8a42', '#b8d79d'], '把', ['蔬菜', '配菜'], ['韭菜']),
  food('butter', 'butter', '黄油', 'cold', 'fridge', 'box', ['#e8c45e', '#c39732'], '盒', ['乳制品', '烘焙'], ['黄油', '牛油']),
  food('eggs', 'egg', '鸡蛋', 'cold', 'fridge', 'eggs', ['#efe4c6', '#bda77d'], '盒', ['蛋类', '早餐'], ['鸡蛋', '蛋']),
  food('sausage', 'sausage', '香肠', 'cold', 'fridge', 'sausage', ['#b95f54', '#7b3b36'], '包', ['肉类', '早餐'], ['香肠', '热狗肠']),
  food('tomato', 'tomato', '西红柿', 'cold', 'fridge', 'tomato', ['#d95e4f', '#6f8d45'], '个', ['蔬菜', '配菜'], ['番茄', '西红柿']),
  food('potato', 'potato', '土豆', 'cold', 'fridge', 'root', ['#b99662', '#765b3f'], '个', ['蔬菜', '主食'], ['马铃薯', '土豆']),
  food('carrot', 'carrot', '胡萝卜', 'cold', 'fridge', 'carrot', ['#df8340', '#5c8a43'], '根', ['蔬菜', '配菜'], ['红萝卜', '胡萝卜']),
  food('broccoli', 'broccoli', '西兰花', 'cold', 'fridge', 'broccoli', ['#58834a', '#315f38'], '颗', ['蔬菜', '健身'], ['绿花菜', '西兰花']),
  food('mushroom', 'mushroom', '蘑菇', 'cold', 'fridge', 'mushroom', ['#d9c7aa', '#8b6e52'], '盒', ['菌菇', '配菜'], ['香菇', '蘑菇']),
  food('lettuce', 'lettuce', '生菜', 'cold', 'fridge', 'leafy', ['#79a75a', '#47743d'], '颗', ['蔬菜', '沙拉'], ['生菜', '莴苣']),
  food('cabbage', 'cabbage', '白菜', 'cold', 'fridge', 'leafy', ['#b9cf83', '#6f9556'], '颗', ['蔬菜', '家常菜'], ['大白菜', '白菜']),
  food('tofu', 'tofu', '豆腐', 'cold', 'fridge', 'tofu', ['#eee7cf', '#c8b995'], '盒', ['豆制品', '高蛋白'], ['豆腐', '嫩豆腐']),
  food('cheese', 'cheese', '奶酪', 'cold', 'fridge', 'cheese', ['#e3b94d', '#b7802f'], '盒', ['乳制品', '早餐'], ['芝士', '奶酪']),
  food('yogurt', 'yogurt', '酸奶', 'cold', 'fridge', 'cup', ['#efe8dd', '#b87998'], '杯', ['乳制品', '早餐'], ['优格', '酸奶']),
  food('apple', 'apple', '苹果', 'cold', 'fridge', 'fruit', ['#c95145', '#5f8449'], '个', ['水果'], ['苹果']),
  food('banana', 'banana', '香蕉', 'cold', 'fridge', 'banana', ['#e4c350', '#9b7b2d'], '根', ['水果'], ['香蕉']),
  food('lemon', 'lemon', '柠檬', 'cold', 'fridge', 'fruit', ['#d7c53d', '#6f914c'], '个', ['水果', '调味'], ['柠檬']),
  food('bread', 'bread', '面包', 'cold', 'fridge', 'bread', ['#c98c54', '#8b5b35'], '袋', ['主食', '早餐'], ['吐司', '面包']),
  food('cooked-rice', 'cooked_rice', '米饭', 'cold', 'fridge', 'bowl', ['#efe8d5', '#b58d64'], '盒', ['主食', '剩饭'], ['米饭', '熟米饭']),

  food('coke', 'cola', '可乐', 'door', 'door', 'can', ['#c64c3e', '#802e2d'], '罐', ['饮料', '可乐鸡翅'], ['可乐', '可口可乐']),
  food('milk', 'milk', '牛奶', 'door', 'door', 'carton', ['#eef3e9', '#71a2a0'], '盒', ['乳制品', '早餐'], ['牛奶', '鲜奶']),
  food('sauce', 'sauce', '酱料瓶', 'door', 'door', 'bottle', ['#9e633e', '#663720'], '瓶', ['调味料'], ['酱油', '酱料', '调味汁']),
  food('juice', 'juice', '果汁', 'door', 'door', 'carton', ['#edb64f', '#c56b39'], '盒', ['饮料', '早餐'], ['橙汁', '苹果汁', '果汁']),
  food('water', 'water', '矿泉水', 'door', 'door', 'bottle', ['#87b9c9', '#4f8095'], '瓶', ['饮料'], ['水', '矿泉水']),
  food('sparkling-water', 'sparkling_water', '气泡水', 'door', 'door', 'can', ['#8cc3b5', '#477d73'], '罐', ['饮料'], ['苏打水', '气泡水']),
  food('ketchup', 'ketchup', '番茄酱', 'door', 'door', 'bottle', ['#c84f43', '#7b2d29'], '瓶', ['调味料'], ['番茄酱', '茄汁']),
  food('mayonnaise', 'mayonnaise', '蛋黄酱', 'door', 'door', 'bottle', ['#eee2b6', '#a98d5c'], '瓶', ['调味料'], ['沙拉酱', '蛋黄酱']),
  food('jam', 'jam', '果酱', 'door', 'door', 'jar', ['#a83f62', '#6b2c43'], '瓶', ['早餐', '调味料'], ['果酱', '草莓酱']),
];

function food(id, ingredientKey, name, category, target, model, palette, unit, recipeTags, aliases) {
  return { id, ingredientKey, name, category, target, model, palette, unit, recipeTags, aliases };
}

export function getFoodById(id) {
  return FOOD_CATALOG.find((item) => item.id === id) ?? null;
}

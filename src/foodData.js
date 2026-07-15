export const categories = [
  { id: 'all', label: '全部' },
  { id: 'frozen', label: '冷冻' },
  { id: 'chilled', label: '冷藏' },
  { id: 'door', label: '门内' },
];

export const foodItems = [
  { id: 'beef-strip', name: '牛肉条', category: 'frozen', target: 'freezer', model: 'meatStrip', palette: ['#a64e43', '#71352f'] },
  { id: 'lamb-strip', name: '羊肉条', category: 'frozen', target: 'freezer', model: 'meatStrip', palette: ['#c66f68', '#8b4541'] },
  { id: 'chicken-cubes', name: '鸡肉块', category: 'frozen', target: 'freezer', model: 'cubes', palette: ['#efb28c', '#c8785d'] },
  { id: 'drumstick', name: '鸡腿', category: 'frozen', target: 'freezer', model: 'drumstick', palette: ['#d99361', '#f0d6b3'] },
  { id: 'wing', name: '鸡翅', category: 'frozen', target: 'freezer', model: 'wing', palette: ['#e1a071', '#ba704f'] },
  { id: 'tuna', name: '金枪鱼', category: 'chilled', target: 'fridge', model: 'can', palette: ['#5a87a6', '#d7b86a'] },
  { id: 'braised-pork', name: '红烧肉', category: 'chilled', target: 'fridge', model: 'cubes', palette: ['#8b4535', '#d48b53'] },
  { id: 'onion', name: '洋葱', category: 'chilled', target: 'fridge', model: 'onion', palette: ['#985d88', '#d7a5c8'] },
  { id: 'garlic-sprout', name: '蒜苗', category: 'chilled', target: 'fridge', model: 'greens', palette: ['#5d9349', '#d9e4a8'] },
  { id: 'chives', name: '韭菜', category: 'chilled', target: 'fridge', model: 'greens', palette: ['#3f7d42', '#b9d28e'] },
  { id: 'coke', name: '可乐', category: 'door', target: 'door', model: 'can', palette: ['#c74434', '#f3e8cc'] },
  { id: 'butter', name: '黄油', category: 'chilled', target: 'fridge', model: 'box', palette: ['#e8bf58', '#fff0a5'] },
  { id: 'milk', name: '牛奶', category: 'door', target: 'door', model: 'carton', palette: ['#edf0df', '#5684aa'] },
  { id: 'eggs', name: '鸡蛋', category: 'chilled', target: 'fridge', model: 'eggs', palette: ['#ddb989', '#f4dfbd'] },
  { id: 'sauce', name: '酱料瓶', category: 'door', target: 'door', model: 'bottle', palette: ['#a84434', '#3f6c3f'] },
];

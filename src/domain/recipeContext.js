export function buildRecipeContext(items, catalog) {
  const byFoodId = new Map(catalog.map((food) => [food.id, food]));
  const grouped = new Map();

  items.forEach((item) => {
    const food = byFoodId.get(item.foodId);
    if (!food) return;
    const current = grouped.get(food.ingredientKey) ?? {
      ingredientKey: food.ingredientKey,
      name: food.name,
      quantity: 0,
      unit: food.unit,
      foodIds: new Set(),
      storageZones: new Set(),
      recipeTags: new Set(),
    };
    current.quantity += item.quantity ?? 1;
    current.foodIds.add(food.id);
    current.storageZones.add(item.zone);
    food.recipeTags.forEach((tag) => current.recipeTags.add(tag));
    grouped.set(food.ingredientKey, current);
  });

  const ingredients = [...grouped.values()].map((item) => ({
    ...item,
    foodIds: [...item.foodIds],
    storageZones: [...item.storageZones],
    recipeTags: [...item.recipeTags],
  }));

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    ingredients,
    availableIngredientKeys: ingredients.map((item) => item.ingredientKey),
  };
}

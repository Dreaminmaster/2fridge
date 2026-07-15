import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRecipeContext } from '../src/domain/recipeContext.js';
import { FOOD_CATALOG } from '../src/data/foodCatalog.js';

test('recipe context groups independent inventory instances into normalized ingredients', () => {
  const items = [
    { foodId: 'eggs', ingredientKey: 'egg', zone: 'fridge', quantity: 1 },
    { foodId: 'eggs', ingredientKey: 'egg', zone: 'fridge', quantity: 1 },
    { foodId: 'coke', ingredientKey: 'cola', zone: 'door', quantity: 1 },
  ];
  const context = buildRecipeContext(items, FOOD_CATALOG);
  assert.equal(context.ingredients.find((item) => item.ingredientKey === 'egg').quantity, 2);
  assert.deepEqual(new Set(context.availableIngredientKeys), new Set(['egg', 'cola']));
});

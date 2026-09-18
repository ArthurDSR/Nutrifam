import catalogPolicy from '../data/catalogPolicy.json';
import { FoodItem } from '../types';
import { normalizeCatalogText } from './localFoodCatalogText';

export type CatalogEligibilityReason =
  | 'simple_food'
  | 'complete_recipe'
  | 'identified_packaged_product'
  | 'composite_without_recipe_or_barcode';

export interface CatalogEligibility {
  eligible: boolean;
  reason: CatalogEligibilityReason;
}

export const isCompositeDishName = (name: string): boolean => {
  const normalized = ` ${normalizeCatalogText(name)} `;
  return catalogPolicy.compositeDishTerms.some((term) => normalized.includes(` ${term} `));
};

export function getCatalogEligibility(food: FoodItem): CatalogEligibility {
  if (!isCompositeDishName(food.name)) return { eligible: true, reason: 'simple_food' };

  const hasCompleteRecipe = food.isRecipe === true
    && Boolean(food.recipeYieldPortions && food.recipeYieldPortions > 0)
    && Boolean(food.recipeIngredients?.length);
  if (hasCompleteRecipe) return { eligible: true, reason: 'complete_recipe' };

  const hasIdentifiedPackage = Boolean(food.barcode && food.barcode.replace(/\D/g, '').length >= 8 && food.brand);
  if (hasIdentifiedPackage) return { eligible: true, reason: 'identified_packaged_product' };

  return { eligible: false, reason: 'composite_without_recipe_or_barcode' };
}

export const isCatalogEligibleFood = (food: FoodItem): boolean => getCatalogEligibility(food).eligible;


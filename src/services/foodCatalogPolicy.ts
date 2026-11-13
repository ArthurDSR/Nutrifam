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

function isValidGtin(value = ''): boolean {
  if (!/^(\d{8}|\d{12,14})$/.test(value)) return false;
  const digits = [...value].map(Number);
  const sum = digits.slice(0, -1).reverse().reduce(
    (total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0
  );
  return (10 - sum % 10) % 10 === digits[digits.length - 1];
}

export function getCatalogEligibility(food: FoodItem): CatalogEligibility {
  const brand = normalizeCatalogText(food.brand || '');
  const unattributed = catalogPolicy.unattributedSourcePrefixes.some(
    (prefix) => brand === prefix || brand.startsWith(`${prefix} `)
  );
  if (!unattributed && !isCompositeDishName(food.name) && !isCompositeDishName(food.sourceName || '')) {
    return { eligible: true, reason: 'simple_food' };
  }

  const hasCompleteRecipe = food.isRecipe === true
    && Number.isFinite(food.recipeYieldPortions) && (food.recipeYieldPortions ?? 0) > 0
    && Boolean(food.recipeIngredients?.length && food.recipeIngredients.every((item) =>
      typeof item?.name === 'string' && item.name.trim() && Number.isFinite(item.grams) && item.grams > 0
    ));
  if (hasCompleteRecipe) return { eligible: true, reason: 'complete_recipe' };

  const hasIdentifiedPackage = Boolean(brand && !unattributed && isValidGtin(food.barcode));
  if (hasIdentifiedPackage) return { eligible: true, reason: 'identified_packaged_product' };

  return { eligible: false, reason: 'composite_without_recipe_or_barcode' };
}

export const isCatalogEligibleFood = (food: FoodItem): boolean => getCatalogEligibility(food).eligible;


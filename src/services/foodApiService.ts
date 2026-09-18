import { FoodItem } from '../types';
import { getLocalCatalogFoods } from './localFoodCatalog';
import { parseQuickAddWithAI } from './aiService';

export interface EnhancedFoodItem extends FoodItem {
  isOnlineResult?: boolean;
  isTacoResult?: boolean;
  isBrazilianBrand?: boolean;
  isAiResult?: boolean;
  sourceBadge?: string;
  searchScore?: number;
  foodCategory?: FoodCategoryKey;
}

export type FoodCategoryKey = 'all' | 'protein' | 'carb' | 'fruit_veg' | 'dairy_drink' | 'snack_treat';

// In-memory cache for fast repeated queries
const queryCache = new Map<string, EnhancedFoodItem[]>();

/**
 * Remove diacritics / accents, punctuation and lowercase for fuzzy matching
 * E.g. "Pão com Manteiga" -> "pao com manteiga"
 * "Maçã" -> "maca"
 */
export function normalizeSearchString(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Portuguese plural & synonym word variants for smart matching
 * e.g. "ovos" -> "ovo", "macas" -> "maca", "paes" -> "pao"
 */
export function getWordVariants(word: string): string[] {
  const variants = [word];
  if (word.endsWith('es') && word.length > 3) {
    variants.push(word.slice(0, -2));
    variants.push(word.slice(0, -2) + 'ao'); // paes -> pao
  } else if (word.endsWith('is') && word.length > 3) {
    variants.push(word.slice(0, -2) + 'l'); // pasteis -> pastel
  } else if (word.endsWith('s') && word.length > 3) {
    variants.push(word.slice(0, -1)); // ovos -> ovo, bananas -> banana
  }

  // Synonym expansions for everyday Brazilian dietary terms
  if (word === 'pao') variants.push('frances', 'sal');
  if (word === 'coca') variants.push('refrigerante');
  if (word === 'whey') variants.push('protein', 'proteina');
  if (word === 'cafe') variants.push('pingado');
  if (word === 'frango') variants.push('peito', 'file');
  if (word === 'carne') variants.push('bife', 'patinho', 'alcatra');
  if (word === 'peixe') variants.push('tilapia', 'salmao', 'file');

  return variants;
}

/**
 * Checks if target string matches query tokens allowing plural and variant flexibility
 */
export function matchesQueryTokens(targetText: string, queryTokens: string[]): boolean {
  return queryTokens.every((token) => {
    const variants = getWordVariants(token);
    return variants.some((v) => targetText.includes(v));
  });
}

/**
 * Classifies a food item into one of the main meal categories
 */
export function classifyFoodCategory(item: FoodItem): FoodCategoryKey {
  const norm = normalizeSearchString(item.name + ' ' + (item.brand || ''));

  // 1. Proteínas
  if (
    norm.includes('frango') ||
    norm.includes('carne') ||
    norm.includes('patinho') ||
    norm.includes('alcatra') ||
    norm.includes('mignon') ||
    norm.includes('picanha') ||
    norm.includes('contrafile') ||
    norm.includes('bife') ||
    norm.includes('peixe') ||
    norm.includes('tilapia') ||
    norm.includes('salmao') ||
    norm.includes('atum') ||
    norm.includes('sardinha') ||
    norm.includes('camarao') ||
    norm.includes('bacalhau') ||
    norm.includes('lombo') ||
    norm.includes('bisteca') ||
    norm.includes('ovo') ||
    norm.includes('clara') ||
    norm.includes('whey') ||
    norm.includes('creatina') ||
    norm.includes('yopro')
  ) {
    return 'protein';
  }

  // 2. Frutas & Saladas / Vegetais
  if (
    norm.includes('banana') ||
    norm.includes('maca') ||
    norm.includes('laranja') ||
    norm.includes('mamao') ||
    norm.includes('melancia') ||
    norm.includes('abacaxi') ||
    norm.includes('melao') ||
    norm.includes('manga') ||
    norm.includes('morango') ||
    norm.includes('uva') ||
    norm.includes('abacate') ||
    norm.includes('limao') ||
    norm.includes('goiaba') ||
    norm.includes('pera') ||
    norm.includes('alface') ||
    norm.includes('tomate') ||
    norm.includes('cenoura') ||
    norm.includes('beterraba') ||
    norm.includes('brocolis') ||
    norm.includes('couve') ||
    norm.includes('abobrinha') ||
    norm.includes('chuchu') ||
    norm.includes('pepino') ||
    norm.includes('rucula') ||
    norm.includes('cebola') ||
    norm.includes('alho') ||
    norm.includes('palmito') ||
    norm.includes('quiabo') ||
    norm.includes('vagem')
  ) {
    return 'fruit_veg';
  }

  // 3. Laticínios & Bebidas
  if (
    norm.includes('leite') ||
    norm.includes('iogurte') ||
    norm.includes('queijo') ||
    norm.includes('requeijao') ||
    norm.includes('cottage') ||
    norm.includes('ricota') ||
    norm.includes('manteiga') ||
    norm.includes('margarina') ||
    norm.includes('cafe') ||
    norm.includes('cappuccino') ||
    norm.includes('suco') ||
    norm.includes('agua de coco') ||
    norm.includes('refrigerante') ||
    norm.includes('coca') ||
    norm.includes('guarana') ||
    norm.includes('fanta') ||
    norm.includes('sprite') ||
    norm.includes('cerveja') ||
    norm.includes('vinho') ||
    norm.includes('energetico') ||
    norm.includes('red bull') ||
    norm.includes('monster')
  ) {
    return 'dairy_drink';
  }

  // 4. Lanches, Doces & Salgados
  if (
    norm.includes('pao de queijo') ||
    norm.includes('coxinha') ||
    norm.includes('pastel') ||
    norm.includes('esfiha') ||
    norm.includes('kibe') ||
    norm.includes('empada') ||
    norm.includes('misto') ||
    norm.includes('hamburguer') ||
    norm.includes('burger') ||
    norm.includes('pizza') ||
    norm.includes('lasanha') ||
    norm.includes('brigadeiro') ||
    norm.includes('beijinho') ||
    norm.includes('pacoca') ||
    norm.includes('chocolate') ||
    norm.includes('doce de leite') ||
    norm.includes('pudim') ||
    norm.includes('acai') ||
    norm.includes('bolo') ||
    norm.includes('biscoito') ||
    norm.includes('barra') ||
    norm.includes('amendoim') ||
    norm.includes('castanha') ||
    norm.includes('sorvete') ||
    norm.includes('picole') ||
    norm.includes('nutella')
  ) {
    return 'snack_treat';
  }

  // 5. Carboidratos & Grãos (Default para arroz, feijão, pão, batata, aveia, etc.)
  return 'carb';
}

/**
 * Returns popular verified Brazilian foods filtered by category for empty query view
 */
export function getPopularFoodsByCategory(category: FoodCategoryKey = 'all'): EnhancedFoodItem[] {
  const allStaples = getLocalCatalogFoods().map((food) => ({
    ...food,
    isTacoResult: food.catalogSource === 'taco',
    isBrazilianBrand: food.catalogSource === 'brazilian' || food.catalogSource === 'manufacturer',
    sourceBadge: food.catalogSource === 'taco' ? 'TACO (UNICAMP)' : food.brand || food.catalogSource.toUpperCase(),
    foodCategory: classifyFoodCategory(food)
  }));

  if (category === 'all') {
    return allStaples;
  }

  return allStaples.filter((item) => item.foodCategory === category);
}

/**
 * Fast synchronous search across every source in the local catalog
 * with plural/synonym stemming and category filtering.
 */
export function searchLocalBrazilianFoods(query: string, categoryFilter: FoodCategoryKey = 'all'): EnhancedFoodItem[] {
  const normQuery = normalizeSearchString(query);
  if (!normQuery || normQuery.length < 2) {
    return getPopularFoodsByCategory(categoryFilter);
  }

  const queryTokens = normQuery.split(' ').filter(Boolean);
  const results: EnhancedFoodItem[] = [];

  for (const item of getLocalCatalogFoods()) {
    const itemCat = classifyFoodCategory(item);
    if (categoryFilter !== 'all' && itemCat !== categoryFilter) continue;

    const normName = normalizeSearchString(item.name);
    const normBrand = normalizeSearchString(item.brand || '');
    const combined = normName + ' ' + normBrand;

    if (matchesQueryTokens(combined, queryTokens)) {
      let score = 50;
      if (normName === normQuery) score += 100;
      else if (normName.startsWith(normQuery)) score += 60;
      else if (normName.includes(normQuery)) score += 30;
      else if (normBrand.includes(normQuery)) score += 20;

      const isTaco = item.catalogSource === 'taco';
      results.push({
        ...item,
        isTacoResult: isTaco,
        isBrazilianBrand: item.catalogSource === 'brazilian' || item.catalogSource === 'manufacturer',
        sourceBadge: isTaco ? 'TACO (UNICAMP)' : item.brand || item.catalogSource.toUpperCase(),
        searchScore: score,
        foodCategory: itemCat
      });
    }
  }

  // Sort by relevance score descending
  results.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0));

  return results;
}

/**
 * Compatibility wrapper kept for callers migrated from the former online search.
 * Results now come exclusively from the versioned local catalog.
 */
export async function searchFoodsOnline(query: string, categoryFilter: FoodCategoryKey = 'all'): Promise<EnhancedFoodItem[]> {
  const clean = query.trim();
  const norm = normalizeSearchString(clean);
  if (!norm || norm.length < 2) return getPopularFoodsByCategory(categoryFilter);

  const cacheKey = norm + '_' + categoryFilter;
  if (queryCache.has(cacheKey)) {
    return queryCache.get(cacheKey)!;
  }

  const localResults = searchLocalBrazilianFoods(clean, categoryFilter);
  queryCache.set(cacheKey, localResults);
  return localResults;
}

/**
 * 1-Tap AI Nutrition Estimator: Calculates calories, macros and portions
 * for any food or custom recipe description like Foodvisor.
 */
export async function estimateFoodWithAI(
  description: string,
  provider: 'gemini' | 'openai' | 'openrouter' = 'openrouter',
  geminiApiKey?: string,
  openaiApiKey?: string,
  openaiModel?: string,
  openrouterApiKey?: string,
  openrouterModel?: string,
  geminiModel?: string
): Promise<EnhancedFoodItem | null> {
  try {
    const activeKey =
      provider === 'openrouter'
        ? openrouterApiKey
        : provider === 'openai'
        ? openaiApiKey
        : geminiApiKey;
    const activeModel =
      provider === 'openrouter'
        ? openrouterModel
        : provider === 'openai'
        ? openaiModel
        : (geminiModel || 'gemini-3.5-flash-lite');

    const parsed = await parseQuickAddWithAI(
      description,
      activeKey,
      provider,
      activeModel
    );

    if (parsed && parsed.items && parsed.items.length > 0) {
      const first = parsed.items[0];
      const item: EnhancedFoodItem = {
        id: 'ai_' + Math.random().toString(36).substring(2, 9),
        name: first.name || description,
        brand: first.brand || 'Estimativa Inteligente',
        calories: first.calories,
        servingSize: first.servingSize || '1 porção',
        servingGrams: first.servingGrams || 100,
        servingUnitName: first.servingUnitName || 'porção',
        protein: first.protein,
        carbs: first.carbs,
        fat: first.fat,
        fiber: first.fiber || 0,
        colorDot: '#8b5cf6',
        category: 'Food',
        isAiResult: true,
        sourceBadge: '✨ IA Nutricional',
        foodCategory: classifyFoodCategory({
          name: first.name,
          brand: first.brand,
          calories: first.calories,
          protein: first.protein,
          carbs: first.carbs,
          fat: first.fat,
          fiber: first.fiber || 0,
          servingGrams: first.servingGrams,
          servingSize: first.servingSize,
          id: 'temp'
        })
      };
      return item;
    }
  } catch (err) {
    console.warn('AI estimate error:', err);
  }
  return null;
}

export type OnlineFoodItem = EnhancedFoodItem;

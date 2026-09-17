import { FoodItem } from '../types';
import { TACO_FOODS } from '../data/tacoFoods';
import { BRAZILIAN_FOODS } from '../data/brazilianFoods';
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
  const allStaples = [
    ...BRAZILIAN_FOODS.map((b) => ({
      ...b,
      isBrazilianBrand: true,
      sourceBadge: b.brand || 'Marca Brasileira',
      foodCategory: classifyFoodCategory(b)
    })),
    ...TACO_FOODS.map((t) => ({
      ...t,
      isTacoResult: true,
      sourceBadge: 'TACO (UNICAMP)',
      foodCategory: classifyFoodCategory(t)
    }))
  ];

  if (category === 'all') {
    return allStaples;
  }

  return allStaples.filter((item) => item.foodCategory === category);
}

/**
 * Fast synchronous search across Brazilian Brands and UNICAMP TACO staples
 * with plural/synonym stemming and category filtering.
 */
export function searchLocalBrazilianFoods(query: string, categoryFilter: FoodCategoryKey = 'all'): EnhancedFoodItem[] {
  const normQuery = normalizeSearchString(query);
  if (!normQuery || normQuery.length < 2) {
    return getPopularFoodsByCategory(categoryFilter);
  }

  const queryTokens = normQuery.split(' ').filter(Boolean);
  const results: EnhancedFoodItem[] = [];

  // 1. Search Brazilian Branded Foods
  for (const item of BRAZILIAN_FOODS) {
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

      results.push({
        ...item,
        isBrazilianBrand: true,
        sourceBadge: item.brand || 'Marca Brasileira',
        searchScore: score,
        foodCategory: itemCat
      });
    }
  }

  // 2. Search UNICAMP TACO Foods
  for (const taco of TACO_FOODS) {
    const tacoCat = classifyFoodCategory(taco);
    if (categoryFilter !== 'all' && tacoCat !== categoryFilter) continue;

    const normName = normalizeSearchString(taco.name);
    if (matchesQueryTokens(normName, queryTokens)) {
      let score = 45;
      if (normName === normQuery) score += 100;
      else if (normName.startsWith(normQuery)) score += 50;
      else if (normName.includes(normQuery)) score += 25;

      results.push({
        ...taco,
        isTacoResult: true,
        sourceBadge: 'TACO (UNICAMP)',
        searchScore: score,
        foodCategory: tacoCat
      });
    }
  }

  // Sort by relevance score descending
  results.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0));

  return results;
}

/**
 * Hybrid search: Combines verified Brazilian Brands + TACO staples WITH Open Food Facts.
 * Open Food Facts is queried with robust JSON verification and 503 resilience.
 */
export async function searchFoodsOnline(query: string, categoryFilter: FoodCategoryKey = 'all'): Promise<EnhancedFoodItem[]> {
  const clean = query.trim();
  const norm = normalizeSearchString(clean);
  if (!norm || norm.length < 2) return getPopularFoodsByCategory(categoryFilter);

  const cacheKey = norm + '_' + categoryFilter;
  if (queryCache.has(cacheKey)) {
    return queryCache.get(cacheKey)!;
  }

  // 1. Instant verified matches (Brazilian Brands & TACO)
  const localResults = searchLocalBrazilianFoods(clean, categoryFilter);
  const queryTokens = norm.split(' ').filter(Boolean);

  // 2. Query Open Food Facts with safety and fallback
  let offResults: EnhancedFoodItem[] = [];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const encodedQuery = encodeURIComponent(clean);
    // Use search.pl endpoint which is standard and supports broad keyword search
    const url = 'https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + encodedQuery + '&search_simple=1&action=process&json=1&page_size=20';

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'NutriFamApp/2.0 (contact@nutrifam.app)',
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('json')) {
      const data = await response.json();
      const rawProducts = data.products || [];

      offResults = rawProducts
        .filter((p: any) => {
          if (!p.product_name && !p.product_name_pt) return false;
          if (!p.nutriments) return false;

          const pName = p.product_name_pt || p.product_name;
          const normName = normalizeSearchString(pName);
          const normBrand = normalizeSearchString(p.brands || '');
          const combined = normName + ' ' + normBrand;

          // Must match query tokens
          const hasKeywordMatch = matchesQueryTokens(combined, queryTokens);
          if (!hasKeywordMatch) return false;

          const cal = Math.round(p.nutriments['energy-kcal_100g'] || p.nutriments['energy-kcal'] || 0);
          if (cal <= 0 || cal > 950) return false;

          return true;
        })
        .slice(0, 15)
        .map((p: any) => {
          const nutriments = p.nutriments || {};
          const cal = Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0);
          const prot = Number((nutriments.proteins_100g || 0).toFixed(1));
          const carbs = Number((nutriments.carbohydrates_100g || 0).toFixed(1));
          const fat = Number((nutriments.fat_100g || 0).toFixed(1));
          const fiber = Number((nutriments.fiber_100g || 0).toFixed(1));

          let colorDot = '#f97316';
          if (prot > 15) colorDot = '#3b82f6';
          else if (cal < 100) colorDot = '#10b981';
          else if (fat > 15) colorDot = '#eab308';

          const productName = p.product_name_pt || p.product_name;

          const item: EnhancedFoodItem = {
            id: 'off_' + (p.code || Math.random().toString(36).substr(2, 7)),
            name: productName,
            brand: p.brands || 'Marca Nacional',
            calories: cal,
            servingSize: p.serving_size || '100 g',
            servingGrams: 100,
            servingUnitName: 'porção',
            protein: prot,
            carbs: carbs,
            fat: fat,
            fiber: fiber,
            colorDot,
            barcode: p.code,
            imageUrl: p.image_front_small_url,
            category: 'Food' as const,
            isOnlineResult: true,
            sourceBadge: 'Open Food Facts'
          };

          item.foodCategory = classifyFoodCategory(item);
          return item;
        });
    }
  } catch {
    // Silently continue on timeout or 503 error
  }

  // Filter category on online results if specified
  const filteredOff = categoryFilter === 'all'
    ? offResults
    : offResults.filter((o) => o.foodCategory === categoryFilter);

  // Merge results: Brazilian Brands & TACO first, then Open Food Facts without duplicates
  const existingKeys = new Set(
    localResults.map((it) => normalizeSearchString(it.name + ' ' + (it.brand || '')))
  );

  const uniqueOff = filteredOff.filter(
    (o) => !existingKeys.has(normalizeSearchString(o.name + ' ' + (o.brand || '')))
  );

  const combined = [...localResults, ...uniqueOff];
  queryCache.set(cacheKey, combined);
  return combined;
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
  openrouterModel?: string
): Promise<EnhancedFoodItem | null> {
  try {
    const activeKey =
      provider === 'openrouter'
        ? openrouterApiKey
        : provider === 'openai'
        ? openaiApiKey
        : geminiApiKey;
    const activeModel =
      provider === 'openrouter' ? openrouterModel : provider === 'openai' ? openaiModel : undefined;

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

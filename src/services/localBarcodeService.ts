import { ProductEvaluation } from '../types';
import { findLocalFoodByBarcode } from './localFoodCatalog';

export const SAMPLE_PRODUCTS: Record<string, ProductEvaluation> = {
  // Screen 5 exact match
  '7898943180015': {
    barcode: '7898943180015',
    name: 'Chocolate 75% Cacau Orgânico',
    brand: 'Amma',
    portion: '20 g',
    overallScore: 65,
    scoreColor: 'yellow',
    imageUrl: '',
    processing: {
      score: 85,
      label: 'Menos processado (NOVA 2: Ingredientes culinários processados)',
      novaGroup: 2
    },
    nutrients: {
      score: 30,
      label: 'Menos equilibrado (Rico em gorduras saturadas e densidade calórica, baixo teor de sódio)',
      calories: 110,
      fat: 8.5,
      saturatedFat: 5.2,
      sugar: 5.0,
      salt: 0.0,
      protein: 1.8,
      fiber: 2.4
    },
    additives: {
      score: 95,
      label: 'Menos risco (0 aditivos sintéticos ou controversos)',
      count: 0,
      items: ['Sem aditivos artificiais']
    },
    ingredients: [
      'Amêndoas de cacau orgânico',
      'Açúcar demerara orgânico',
      'Manteiga de cacau orgânica',
      'Emulsificante lecitina de girassol'
    ],
    alternatives: [
      { name: 'Chocolate 85% Cacau Puro', brand: 'Dengo', score: 78, calories: 95 },
      { name: 'Cacau Nibs 100% Puro', brand: 'Mãe Terra', score: 90, calories: 85 }
    ]
  },
  '7898099887766': {
    barcode: '7898099887766',
    name: 'Macarrão De Sêmola Com Ovos Espaguete',
    brand: 'SYMBOL',
    portion: '100 g',
    overallScore: 72,
    scoreColor: 'green',
    imageUrl: '',
    processing: {
      score: 75,
      label: 'Menos processado (NOVA 3: Alimento processado simples)',
      novaGroup: 3
    },
    nutrients: {
      score: 68,
      label: 'Equilibrado (Boa fonte de carboidratos complexos e energia)',
      calories: 149,
      fat: 0.8,
      saturatedFat: 0.2,
      sugar: 1.1,
      salt: 0.02,
      protein: 5.5,
      fiber: 1.8
    },
    additives: {
      score: 90,
      label: 'Sem aditivos nocivos',
      count: 0,
      items: ['Nenhum aditivo de risco']
    },
    ingredients: [
      'Sêmola de trigo enriquecida com ferro e ácido fólico',
      'Ovos pasteurizados',
      'Corantes naturais cúrcuma e urucum'
    ]
  },
  '7898215150022': {
    barcode: '7898215150022',
    name: 'Leite zero lactose semidesnatado',
    brand: 'Piracanjuba',
    portion: '200 mL',
    overallScore: 80,
    scoreColor: 'green',
    imageUrl: '',
    processing: {
      score: 80,
      label: 'Menos processado (NOVA 2)',
      novaGroup: 2
    },
    nutrients: {
      score: 85,
      label: 'Muito equilibrado (Rico em cálcio e proteínas, teor moderado de gordura)',
      calories: 84,
      fat: 2.0,
      saturatedFat: 1.2,
      sugar: 9.8,
      salt: 0.12,
      protein: 6.2,
      fiber: 0
    },
    additives: {
      score: 85,
      label: 'Enzima lactase natural e estabilizantes seguros',
      count: 1,
      items: ['Enzima Lactase']
    },
    ingredients: [
      'Leite semidesnatado',
      'Enzima lactase',
      'Estabilizantes citrato de sódio e trifosfato de sódio'
    ]
  }
};

export async function fetchProductByBarcode(barcode: string): Promise<ProductEvaluation> {
  const cleanBarcode = barcode.replace(/\D/g, '');
  if (SAMPLE_PRODUCTS[cleanBarcode]) {
    return SAMPLE_PRODUCTS[cleanBarcode];
  }
  const food = findLocalFoodByBarcode(cleanBarcode);
  if (!food) {
    throw new Error(`Produto com código "${cleanBarcode}" ainda não existe no catálogo local.`);
  }

  const nova = food.novaGroup ?? 1;
  const score = food.healthScore ?? (nova === 1 ? 90 : nova === 2 ? 78 : nova === 3 ? 58 : 35);
  return {
    barcode: cleanBarcode,
    name: food.name,
    brand: food.brand || 'Catálogo NutriFam',
    portion: food.servingSize,
    overallScore: score,
    scoreColor: score >= 70 ? 'green' : score >= 50 ? 'yellow' : score >= 35 ? 'orange' : 'red',
    imageUrl: food.imageUrl || '',
    processing: {
      score: nova === 1 ? 95 : nova === 2 ? 80 : nova === 3 ? 55 : 25,
      label: food.processingGrade || `Classificação NOVA ${nova}`,
      novaGroup: nova
    },
    nutrients: {
      score,
      label: `Informações nutricionais para ${food.servingSize}`,
      calories: food.calories,
      fat: food.fat,
      saturatedFat: 0,
      sugar: 0,
      salt: 0,
      protein: food.protein,
      fiber: food.fiber
    },
    additives: {
      score: Math.max(10, 100 - (food.preservativesCount || 0) * 15),
      label: food.additives?.length ? 'Aditivos cadastrados no catálogo local' : 'Sem aditivos cadastrados',
      count: food.preservativesCount || food.additives?.length || 0,
      items: food.additives || []
    },
    ingredients: ['Consulte os ingredientes no rótulo do produto']
  };
}

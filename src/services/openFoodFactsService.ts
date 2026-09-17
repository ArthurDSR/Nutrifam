import { ProductEvaluation } from '../types';

export const SAMPLE_PRODUCTS: Record<string, ProductEvaluation> = {
  // Screen 5 exact match
  '7898943180015': {
    barcode: '7898943180015',
    name: 'Chocolate 75% Cacau Orgânico',
    brand: 'Amma',
    portion: '20 g',
    overallScore: 65,
    scoreColor: 'yellow',
    imageUrl: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=600&auto=format&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=600&auto=format&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
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
  const cleanBarcode = barcode.trim();
  if (SAMPLE_PRODUCTS[cleanBarcode]) {
    return SAMPLE_PRODUCTS[cleanBarcode];
  }

  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`);
    if (!response.ok) throw new Error('Produto não encontrado no OpenFoodFacts');
    const data = await response.json();

    if (!data.product) {
      throw new Error('Produto não encontrado');
    }

    const p = data.product;
    const nutriments = p.nutriments || {};
    const nova = p.nova_group || 3;
    const nutriScore = p.nutriscore_score !== undefined ? Math.max(0, Math.min(100, 100 - p.nutriscore_score * 2.5)) : 60;
    const additivesCount = p.additives_n || 0;

    let scoreColor: 'green' | 'yellow' | 'orange' | 'red' = 'yellow';
    if (nutriScore >= 70) scoreColor = 'green';
    else if (nutriScore >= 50) scoreColor = 'yellow';
    else if (nutriScore >= 35) scoreColor = 'orange';
    else scoreColor = 'red';

    const evaluation: ProductEvaluation = {
      barcode: cleanBarcode,
      name: p.product_name || p.product_name_pt || 'Alimento ' + cleanBarcode,
      brand: p.brands || 'Marca Genérica',
      portion: p.serving_size || '100 g',
      overallScore: Math.round(nutriScore),
      scoreColor,
      imageUrl: p.image_url || p.image_front_url || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80',
      processing: {
        score: nova === 1 ? 95 : nova === 2 ? 80 : nova === 3 ? 55 : 25,
        label: nova <= 2 ? 'Menos processado (NOVA ' + nova + ')' : 'Mais processado (NOVA ' + nova + ')',
        novaGroup: nova
      },
      nutrients: {
        score: Math.min(100, Math.max(10, Math.round(100 - (nutriments['energy-kcal_100g'] || 100) / 6))),
        label: 'Informações nutricionais por 100g',
        calories: Math.round(nutriments['energy-kcal_100g'] || 0),
        fat: Number((nutriments.fat_100g || 0).toFixed(1)),
        saturatedFat: Number((nutriments['saturated-fat_100g'] || 0).toFixed(1)),
        sugar: Number((nutriments.sugars_100g || 0).toFixed(1)),
        salt: Number((nutriments.salt_100g || 0).toFixed(2)),
        protein: Number((nutriments.proteins_100g || 0).toFixed(1)),
        fiber: Number((nutriments.fiber_100g || 0).toFixed(1))
      },
      additives: {
        score: Math.max(10, 100 - additivesCount * 15),
        label: additivesCount === 0 ? 'Sem aditivos detectados' : `${additivesCount} aditivo(s) identificado(s)`,
        count: additivesCount,
        items: p.additives_tags ? p.additives_tags.map((tag: string) => tag.replace('en:', '').toUpperCase()) : []
      },
      ingredients: p.ingredients_text ? p.ingredients_text.split(/,\s*|\.\s*/).filter(Boolean) : ['Ingredientes sob consulta no rótulo']
    };

    return evaluation;
  } catch {
    // Fallback template
    return {
      barcode: cleanBarcode,
      name: 'Alimento ' + cleanBarcode,
      brand: 'Código de Barras Escaneado',
      portion: '100 g',
      overallScore: 68,
      scoreColor: 'yellow',
      imageUrl: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=600&auto=format&fit=crop&q=80',
      processing: {
        score: 70,
        label: 'Processamento moderado',
        novaGroup: 2
      },
      nutrients: {
        score: 65,
        label: 'Equilibrado em nutrientes básicos',
        calories: 130,
        fat: 4.5,
        saturatedFat: 2.1,
        sugar: 6.0,
        salt: 0.1,
        protein: 7.0,
        fiber: 2.0
      },
      additives: {
        score: 90,
        label: 'Poucos ou nenhum aditivo de risco',
        count: 0,
        items: []
      },
      ingredients: ['Ingredientes do rótulo registrado']
    };
  }
}

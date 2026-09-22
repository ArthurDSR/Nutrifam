import { FoodItem, DayLog, UserProfile } from '../types';
import type { DeterministicVisionResult } from './deterministicVisionService';

export interface ParsedFoodResult {
  items: Omit<FoodItem, 'id'>[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  confidenceMessage: string;
}

/**
 * Intelligent client-side heuristic parser for Brazilian & English natural descriptions
 */
function localRuleBasedParser(text: string): ParsedFoodResult {
  const lower = text.toLowerCase();
  const items: Omit<FoodItem, 'id'>[] = [];

  // Direct macro notation: "I had 35g of protein, and 140 calories" or "35g proteina 140 calorias"
  const directCalMatch = lower.match(/(\d+)\s*(cal|kcal|calorias)/i);
  const directProtMatch = lower.match(/(\d+)\s*g?\s*(protein|proteina|proteínas)/i);
  const directCarbMatch = lower.match(/(\d+)\s*g?\s*(carb|carbo|carboidratos)/i);
  const directFatMatch = lower.match(/(\d+)\s*g?\s*(fat|gordura|gorduras)/i);

  if (directCalMatch && (directProtMatch || directCarbMatch || directFatMatch)) {
    const cal = parseInt(directCalMatch[1], 10);
    const prot = directProtMatch ? parseInt(directProtMatch[1], 10) : 0;
    const carbs = directCarbMatch ? parseInt(directCarbMatch[1], 10) : 0;
    const fat = directFatMatch ? parseInt(directFatMatch[1], 10) : 0;

    items.push({
      name: 'Entrada Rápida de Macros',
      brand: 'Cálculo Direto',
      calories: cal,
      servingSize: '1 porção',
      servingGrams: 100,
      protein: prot,
      carbs: carbs,
      fat: fat,
      fiber: 0,
      colorDot: '#3b82f6',
      category: 'Food'
    });

    return {
      items,
      totalCalories: cal,
      totalProtein: prot,
      totalCarbs: carbs,
      totalFat: fat,
      totalFiber: 0,
      confidenceMessage: 'Valores nutricionais calculados diretamente da sua descrição.'
    };
  }

  // Common food heuristics
  const foodDictionary: {
    triggers: string[];
    name: string;
    portionText: string;
    portionGrams: number;
    cal: number;
    p: number;
    c: number;
    f: number;
    fib: number;
    color: string;
  }[] = [
    {
      triggers: ['egg', 'eggs', 'ovo', 'ovos'],
      name: 'Ovos (Cozidos/Mexidos)',
      portionText: '2 unidades (100g)',
      portionGrams: 100,
      cal: 140,
      p: 12.5,
      c: 1.0,
      f: 9.8,
      fib: 0,
      color: '#eab308'
    },
    {
      triggers: ['rice', 'arroz'],
      name: 'Arroz Cozido',
      portionText: '1 porção média (150g)',
      portionGrams: 150,
      cal: 195,
      p: 3.8,
      c: 42.0,
      f: 0.4,
      fib: 1.5,
      color: '#f97316'
    },
    {
      triggers: ['orange juice', 'suco de laranja', 'juice', 'suco'],
      name: 'Suco de Laranja Natural',
      portionText: '1 copo (200ml)',
      portionGrams: 200,
      cal: 90,
      p: 1.4,
      c: 21.0,
      f: 0.2,
      fib: 0.6,
      color: '#f97316'
    },
    {
      triggers: ['chicken', 'frango', 'peito de frango', 'filé de frango'],
      name: 'Peito de Frango Grelhado',
      portionText: '1 filé médio (150g)',
      portionGrams: 150,
      cal: 240,
      p: 46.5,
      c: 0,
      f: 5.1,
      fib: 0,
      color: '#10b981'
    },
    {
      triggers: ['meat', 'carne', 'bife', 'lagarto', 'patinho'],
      name: 'Bife Magro Grelhado',
      portionText: '1 porção (120g)',
      portionGrams: 120,
      cal: 210,
      p: 32.0,
      c: 0,
      f: 8.5,
      fib: 0,
      color: '#ef4444'
    },
    {
      triggers: ['tapioca'],
      name: 'Tapioca Simples',
      portionText: '1 unidade (60g)',
      portionGrams: 60,
      cal: 190,
      p: 0,
      c: 46.0,
      f: 0.1,
      fib: 0.3,
      color: '#f97316'
    },
    {
      triggers: ['banana', 'bananas'],
      name: 'Banana Prata',
      portionText: '1 unidade (100g)',
      portionGrams: 100,
      cal: 89,
      p: 1.1,
      c: 22.8,
      f: 0.3,
      fib: 2.6,
      color: '#eab308'
    },
    {
      triggers: ['bread', 'pao', 'pão', 'torrada', 'toast'],
      name: 'Pão Integral',
      portionText: '2 fatias (50g)',
      portionGrams: 50,
      cal: 120,
      p: 4.5,
      c: 22.0,
      f: 1.8,
      fib: 3.5,
      color: '#d97706'
    },
    {
      triggers: ['salad', 'salada', 'alface', 'tomate'],
      name: 'Salada Verde com Tomate',
      portionText: '1 prato raso (100g)',
      portionGrams: 100,
      cal: 25,
      p: 1.2,
      c: 4.8,
      f: 0.2,
      fib: 2.2,
      color: '#22c55e'
    },
    {
      triggers: ['whey', 'proteina em po', 'protein powder'],
      name: 'Whey Protein Isolado',
      portionText: '1 dosador (30g)',
      portionGrams: 30,
      cal: 120,
      p: 24.0,
      c: 2.0,
      f: 1.0,
      fib: 0,
      color: '#3b82f6'
    },
    {
      triggers: ['chocolate', 'cacau'],
      name: 'Chocolate 75% Cacau',
      portionText: '2 quadradinhos (20g)',
      portionGrams: 20,
      cal: 110,
      p: 1.8,
      c: 7.2,
      f: 8.5,
      fib: 2.4,
      color: '#78350f'
    },
    {
      triggers: ['pasta', 'macarrao', 'macarrão', 'espaguete'],
      name: 'Macarrão Cozido',
      portionText: '1 prato médio (140g)',
      portionGrams: 140,
      cal: 215,
      p: 7.5,
      c: 43.0,
      f: 1.2,
      fib: 2.5,
      color: '#f59e0b'
    },
    {
      triggers: ['milk', 'leite', 'latte', 'cafe com leite'],
      name: 'Leite Semidesnatado',
      portionText: '1 copo (200ml)',
      portionGrams: 200,
      cal: 92,
      p: 6.2,
      c: 9.8,
      f: 2.8,
      fib: 0,
      color: '#06b6d4'
    }
  ];

  for (const food of foodDictionary) {
    if (food.triggers.some((trigger) => lower.includes(trigger))) {
      items.push({
        name: food.name,
        brand: 'Estimativa IA',
        calories: food.cal,
        servingSize: food.portionText,
        servingGrams: food.portionGrams,
        protein: food.p,
        carbs: food.c,
        fat: food.f,
        fiber: food.fib,
        colorDot: food.color,
        category: 'Food'
      });
    }
  }

  // If nothing recognized, build a balanced custom item
  if (items.length === 0) {
    items.push({
      name: text.length > 30 ? text.slice(0, 30) + '...' : text,
      brand: 'Estimativa Rápida',
      calories: 250,
      servingSize: '1 porção (150 g)',
      servingGrams: 150,
      protein: 15,
      carbs: 25,
      fat: 8,
      fiber: 3,
      colorDot: '#10b981',
      category: 'Food'
    });
  }

  const totalCalories = items.reduce((acc, i) => acc + i.calories, 0);
  const totalProtein = Number(items.reduce((acc, i) => acc + i.protein, 0).toFixed(1));
  const totalCarbs = Number(items.reduce((acc, i) => acc + i.carbs, 0).toFixed(1));
  const totalFat = Number(items.reduce((acc, i) => acc + i.fat, 0).toFixed(1));
  const totalFiber = Number(items.reduce((acc, i) => acc + i.fiber, 0).toFixed(1));

  return {
    items,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    totalFiber,
    confidenceMessage: `Identificamos ${items.length} item(ns) na sua descrição com macros calculados.`
  };
}

/**
 * Helper to call Gemini generateContent with automatic fallback across supported models
 * (gemini-2.5-flash -> gemini-2.0-flash -> gemini-2.0-flash-lite)
 */
export async function callGeminiApi(
  apiKey: string,
  body: any,
  preferredModel = 'gemini-3.5-flash-lite'
): Promise<Response> {
  const modelsToTry = [
    preferredModel,
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite'
  ].filter((m, i, arr) => arr.indexOf(m) === i);

  let lastResponse: Response | null = null;

  for (const m of modelsToTry) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      );
      if (res.ok) return res;
      lastResponse = res;
      // If 404 (model deprecated / not found) or 400 with invalid model, continue to next fallback
      if (res.status !== 404 && res.status !== 400) {
        return res;
      }
    } catch {
      // Continue to next model on fetch error
    }
  }

  return (
    lastResponse ||
    new Response(JSON.stringify({ error: { message: 'Erro ao conectar ao Google Gemini' } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  );
}

/**
 * Test AI API Key connection (OpenAI, Gemini or OpenRouter)
 */
export async function testAIConnection(
  provider: 'gemini' | 'openai' | 'openrouter',
  apiKey: string,
  model?: string
): Promise<{ success: boolean; message: string }> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return { success: false, message: 'Por favor, insira uma chave de API antes de testar.' };
  }

  try {
    if (provider === 'openrouter') {
      const targetModel = model || 'openrouter/free';
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`,
          'HTTP-Referer': 'https://nutrifam.app',
          'X-Title': 'NutriFam'
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 10
        })
      });

      if (response.ok) {
        return { success: true, message: `Conexão com OpenRouter (${targetModel}) validada com sucesso!` };
      }

      if (response.status === 401) {
        return { success: false, message: 'Chave do OpenRouter inválida ou não autorizada (401).' };
      }

      if (response.status === 429) {
        return { success: false, message: 'Limite de requisições excedido no OpenRouter (429 Rate Limit).' };
      }

      const errData = await response.json().catch(() => ({}));
      return { success: false, message: errData.error?.message || `Erro do OpenRouter: status ${response.status}` };
    } else if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 5
        })
      });

      if (response.ok) {
        return { success: true, message: `Conexão com OpenAI (${model || 'gpt-4o-mini'}) validada com sucesso!` };
      }

      if (response.status === 401) {
        return { success: false, message: 'Chave da OpenAI inválida ou não autorizada (401 Unauthorized).' };
      }

      if (response.status === 429) {
        return { success: false, message: 'Limite de requisições ou créditos insuficientes na conta OpenAI (429 Rate Limit/Quota).' };
      }

      const errData = await response.json().catch(() => ({}));
      return { success: false, message: errData.error?.message || `Erro da OpenAI: status ${response.status}` };
    } else {
      // Google Gemini with automatic modern model fallback
      const targetModel = model || 'gemini-3.5-flash-lite';
      const response = await callGeminiApi(
        cleanKey,
        {
          contents: [{ parts: [{ text: 'Ping' }] }]
        },
        targetModel
      );

      if (response.ok) {
        return { success: true, message: `Conexão com Google Gemini (${targetModel}) validada com sucesso!` };
      }

      if (response.status === 400 || response.status === 403) {
        return { success: false, message: 'Chave do Google Gemini inválida ou sem permissão de acesso.' };
      }

      const errData = await response.json().catch(() => ({}));
      return { success: false, message: errData.error?.message || `Erro do Gemini: status ${response.status}` };
    }
  } catch (err: any) {
    return { success: false, message: `Falha na conexão de rede com a API: ${err.message || 'Verifique sua conexão'}` };
  }
}

/**
 * Quick Add parsing with OpenAI ChatGPT or Gemini support + local rule fallback
 */
export async function parseQuickAddWithAI(
  text: string,
  apiKey?: string,
  provider: 'gemini' | 'openai' | 'openrouter' = 'gemini',
  model?: string
): Promise<ParsedFoodResult> {
  const cleanKey = apiKey?.trim();
  if (!cleanKey) {
    return localRuleBasedParser(text);
  }

  try {
    const prompt = `Você é um nutricionista especialista em cálculo de macronutrientes.
O usuário descreveu uma refeição em linguagem natural: "${text}".
Retorne ESTRITAMENTE um objeto JSON válido (sem tags markdown nem explicações) no seguinte formato:
{
  "items": [
    {
      "name": "Nome do alimento em português",
      "brand": "Estimativa IA",
      "calories": 150,
      "servingSize": "100 g",
      "servingGrams": 100,
      "protein": 12.0,
      "carbs": 18.0,
      "fat": 3.5,
      "fiber": 2.0,
      "colorDot": "#10b981"
    }
  ],
  "confidenceMessage": "Breve comentário amigável sobre os macronutrientes calculados"
}`;

    if (provider === 'openrouter') {
      const targetModel = model || 'openrouter/free';
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`,
          'HTTP-Referer': 'https://nutrifam.app',
          'X-Title': 'NutriFam'
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [
            {
              role: 'system',
              content: 'Você é um nutricionista especialista em cálculo de macronutrientes. Responda em JSON válido com as propriedades items e confidenceMessage.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) return localRuleBasedParser(text);
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) return localRuleBasedParser(text);

      const jsonStr = content.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      const items = parsed.items || [];
      const totalCalories = items.reduce((acc: number, i: any) => acc + (i.calories || 0), 0);
      const totalProtein = Number(items.reduce((acc: number, i: any) => acc + (i.protein || 0), 0).toFixed(1));
      const totalCarbs = Number(items.reduce((acc: number, i: any) => acc + (i.carbs || 0), 0).toFixed(1));
      const totalFat = Number(items.reduce((acc: number, i: any) => acc + (i.fat || 0), 0).toFixed(1));
      const totalFiber = Number(items.reduce((acc: number, i: any) => acc + (i.fiber || 0), 0).toFixed(1));

      return {
        items,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        totalFiber,
        confidenceMessage: parsed.confidenceMessage || `Analisado via OpenRouter (${targetModel}).`
      };
    } else if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: 'Você é um nutricionista especialista em cálculo de macronutrientes. Responda em JSON válido com as propriedades items e confidenceMessage.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        return localRuleBasedParser(text);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) return localRuleBasedParser(text);

      const parsed = JSON.parse(content);
      const items = parsed.items || [];
      const totalCalories = items.reduce((acc: number, i: any) => acc + (i.calories || 0), 0);
      const totalProtein = Number(items.reduce((acc: number, i: any) => acc + (i.protein || 0), 0).toFixed(1));
      const totalCarbs = Number(items.reduce((acc: number, i: any) => acc + (i.carbs || 0), 0).toFixed(1));
      const totalFat = Number(items.reduce((acc: number, i: any) => acc + (i.fat || 0), 0).toFixed(1));
      const totalFiber = Number(items.reduce((acc: number, i: any) => acc + (i.fiber || 0), 0).toFixed(1));

      return {
        items,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        totalFiber,
        confidenceMessage: parsed.confidenceMessage || `Analisado com sucesso via OpenAI (${model || 'gpt-4o-mini'}).`
      };
    } else {
      // Gemini with modern model and fallback
      const targetModel = model || 'gemini-3.5-flash-lite';
      const response = await callGeminiApi(
        cleanKey,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        },
        targetModel
      );

      if (!response.ok) {
        return localRuleBasedParser(text);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return localRuleBasedParser(text);

      const parsed = JSON.parse(rawText);
      const items = parsed.items || [];
      const totalCalories = items.reduce((acc: number, i: any) => acc + (i.calories || 0), 0);
      const totalProtein = Number(items.reduce((acc: number, i: any) => acc + (i.protein || 0), 0).toFixed(1));
      const totalCarbs = Number(items.reduce((acc: number, i: any) => acc + (i.carbs || 0), 0).toFixed(1));
      const totalFat = Number(items.reduce((acc: number, i: any) => acc + (i.fat || 0), 0).toFixed(1));
      const totalFiber = Number(items.reduce((acc: number, i: any) => acc + (i.fiber || 0), 0).toFixed(1));

      return {
        items,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        totalFiber,
        confidenceMessage: parsed.confidenceMessage || `Refeição decomposta e analisada com Google Gemini (${targetModel}).`
      };
    }
  } catch (err) {
    console.warn('AI API failed, falling back to local engine:', err);
    return localRuleBasedParser(text);
  }
}

/**
 * Photo Food Recognition with OpenAI Vision (gpt-4o-mini / gpt-4o) or Gemini Vision
 */
export async function analyzeFoodPhotoWithAI(
  imageBase64: string,
  mimeType = 'image/jpeg',
  apiKey?: string,
  provider: 'gemini' | 'openai' | 'openrouter' = 'gemini',
  model?: string,
  visualAnalysis?: DeterministicVisionResult
): Promise<ParsedFoodResult> {
  const cleanKey = apiKey?.trim();
  if (cleanKey) {
    try {
      const deterministicContext = visualAnalysis?.promptContext || '{"method":"unavailable"}';
      const prompt = `Analise esta foto de prato/refeição. Identifique os alimentos visíveis, estime as porções em gramas e calcule as calorias e macronutrientes aproximados.
Uma análise visual local determinística já segmentou a imagem. Use as regiões e proporções abaixo como restrições geométricas; não trate famílias de cor como identificação definitiva do alimento:
${deterministicContext}
Regras: não invente itens invisíveis; tente manter o número de itens compatível com as regiões relevantes; use areaRatio apenas para proporção relativa, pois a foto não possui escala física; indique baixa confiança quando não houver referência de tamanho.
Retorne ESTRITAMENTE um JSON no formato:
{
  "items": [
    {
      "name": "Nome do alimento em português",
      "brand": "Foto IA",
      "calories": 200,
      "servingSize": "150 g",
      "servingGrams": 150,
      "protein": 25.0,
      "carbs": 10.0,
      "fat": 5.0,
      "fiber": 2.0,
      "colorDot": "#10b981"
    }
  ],
  "confidenceMessage": "Foto identificada com sucesso."
}`;

      if (provider === 'openrouter') {
        const cleanBase64 = imageBase64.startsWith('data:') ? imageBase64 : `data:${mimeType};base64,${imageBase64}`;
        const targetModel = model || 'openrouter/free';

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cleanKey}`,
            'HTTP-Referer': 'https://nutrifam.app',
            'X-Title': 'NutriFam'
          },
          body: JSON.stringify({
            model: targetModel,
            messages: [
              {
                role: 'system',
                content: 'Você é um nutricionista especialista em visão computacional e cálculo de macronutrientes de pratos. Responda em JSON válido com as propriedades items e confidenceMessage.'
              },
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  {
                    type: 'image_url',
                    image_url: {
                      url: cleanBase64
                    }
                  }
                ]
              }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const jsonStr = content.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(jsonStr);
            const items = parsed.items || [];
            const totalCalories = items.reduce((acc: number, i: any) => acc + (i.calories || 0), 0);
            const totalProtein = Number(items.reduce((acc: number, i: any) => acc + (i.protein || 0), 0).toFixed(1));
            const totalCarbs = Number(items.reduce((acc: number, i: any) => acc + (i.carbs || 0), 0).toFixed(1));
            const totalFat = Number(items.reduce((acc: number, i: any) => acc + (i.fat || 0), 0).toFixed(1));
            const totalFiber = Number(items.reduce((acc: number, i: any) => acc + (i.fiber || 0), 0).toFixed(1));

            return {
              items,
              totalCalories,
              totalProtein,
              totalCarbs,
              totalFat,
              totalFiber,
              confidenceMessage: parsed.confidenceMessage || `Alimentos identificados com OpenRouter (${targetModel}).`
            };
          }
        }
      } else if (provider === 'openai') {
        const cleanBase64 = imageBase64.startsWith('data:') ? imageBase64 : `data:${mimeType};base64,${imageBase64}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cleanKey}`
          },
          body: JSON.stringify({
            model: model || 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content: 'Você é um nutricionista especialista em visão computacional e cálculo de macronutrientes de pratos. Responda em JSON com as chaves items e confidenceMessage.'
              },
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  {
                    type: 'image_url',
                    image_url: {
                      url: cleanBase64,
                      detail: 'low'
                    }
                  }
                ]
              }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            const items = parsed.items || [];
            const totalCalories = items.reduce((acc: number, i: any) => acc + (i.calories || 0), 0);
            const totalProtein = Number(items.reduce((acc: number, i: any) => acc + (i.protein || 0), 0).toFixed(1));
            const totalCarbs = Number(items.reduce((acc: number, i: any) => acc + (i.carbs || 0), 0).toFixed(1));
            const totalFat = Number(items.reduce((acc: number, i: any) => acc + (i.fat || 0), 0).toFixed(1));
            const totalFiber = Number(items.reduce((acc: number, i: any) => acc + (i.fiber || 0), 0).toFixed(1));

            return {
              items,
              totalCalories,
              totalProtein,
              totalCarbs,
              totalFat,
              totalFiber,
              confidenceMessage: parsed.confidenceMessage || `Alimentos identificados visualmente com OpenAI (${model || 'gpt-4o-mini'}).`
            };
          }
        }
      } else {
        // Gemini Vision with modern model fallback
        const targetModel = model || 'gemini-3.5-flash-lite';
        const rawBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        const response = await callGeminiApi(
          cleanKey,
          {
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: rawBase64
                    }
                  }
                ]
              }
            ],
            generationConfig: { responseMimeType: 'application/json' }
          },
          targetModel
        );

        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            const items = parsed.items || [];
            const totalCalories = items.reduce((acc: number, i: any) => acc + (i.calories || 0), 0);
            const totalProtein = Number(items.reduce((acc: number, i: any) => acc + (i.protein || 0), 0).toFixed(1));
            const totalCarbs = Number(items.reduce((acc: number, i: any) => acc + (i.carbs || 0), 0).toFixed(1));
            const totalFat = Number(items.reduce((acc: number, i: any) => acc + (i.fat || 0), 0).toFixed(1));
            const totalFiber = Number(items.reduce((acc: number, i: any) => acc + (i.fiber || 0), 0).toFixed(1));

            return {
              items,
              totalCalories,
              totalProtein,
              totalCarbs,
              totalFat,
              totalFiber,
              confidenceMessage: parsed.confidenceMessage || 'Alimentos identificados visualmente por Google Gemini.'
            };
          }
        }
      }
    } catch (e) {
      console.warn('Vision API error:', e);
    }
  }

  return {
    items: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalFiber: 0,
    confidenceMessage: visualAnalysis
      ? `Análise local concluída: ${visualAnalysis.regionCount} região(ões), qualidade ${visualAnalysis.quality}. Configure uma chave de IA para identificar os alimentos sem gerar dados fictícios.`
      : 'Configure uma chave de IA para identificar alimentos por foto.'
  };
}

/**
 * Generate smart personalized nutritionist tips for the Coach tab
 */
export function generateCoachAdvice(todayLog: DayLog, profile: UserProfile): {
  greeting: string;
  calorieStatus: string;
  macroAdvice: string;
  waterAdvice: string;
  fastingAdvice: string;
  recommendations: string[];
} {
  const eatenCalories = Object.values(todayLog.meals).reduce(
    (acc, meal) => acc + meal.items.reduce((mAcc, i) => mAcc + i.calories * i.servingsCount, 0),
    0
  );

  const leftCalories = Math.max(0, profile.dailyCaloriesTarget - eatenCalories);

  // Total protein eaten
  const eatenProtein = Object.values(todayLog.meals).reduce(
    (acc, meal) => acc + meal.items.reduce((mAcc, i) => mAcc + i.protein * i.servingsCount, 0),
    0
  );

  const proteinLeft = Math.max(0, profile.targetMacros.proteinGrams - eatenProtein);

  let calorieStatus = '';
  if (eatenCalories === 0) {
    calorieStatus = `Você ainda tem ${profile.dailyCaloriesTarget} kcal disponíveis para hoje. Bom momento para um café da manhã equilibrado!`;
  } else if (leftCalories > 0) {
    calorieStatus = `Você consumiu ${Math.round(eatenCalories)} kcal. Ainda restam ${Math.round(leftCalories)} kcal para atingir sua meta diária de emagrecimento saudável.`;
  } else {
    calorieStatus = `Você atingiu sua meta diária de ${profile.dailyCaloriesTarget} kcal. Mantenha-se hidratado pelo restante do dia!`;
  }

  let macroAdvice = '';
  if (proteinLeft > 30) {
    macroAdvice = `Faltam cerca de ${Math.round(proteinLeft)}g de proteína para atingir a meta ideal de preservação muscular. Priorize fontes como frango, ovos, iogurte grego ou whey protein.`;
  } else {
    macroAdvice = `Ótimo aporte de proteínas hoje (${Math.round(eatenProtein)}g ingeridos). Isso manterá sua saciedade alta e ajudará na recuperação física!`;
  }

  const waterMissing = (profile.dailyCaloriesTarget ? 1.5 : 2.0) - todayLog.water.consumedLiters;
  let waterAdvice = '';
  if (todayLog.water.consumedLiters >= 1.5) {
    waterAdvice = '🎉 Parabéns! Meta de hidratação de 1,5L concluída com sucesso!';
  } else {
    waterAdvice = `Você bebeu ${todayLog.water.consumedLiters} L até agora. Beba mais ${Math.max(0, waterMissing).toFixed(1)} L para otimizar o metabolismo.`;
  }

  const fastingAdvice = todayLog.fasting.isActive
    ? 'Seu jejum está ativo. Seu corpo está estabilizando os níveis de glicose e iniciando o uso de gordura como fonte de energia primária.'
    : 'Você não está em jejum no momento. Faça refeições ricas em fibras e nutrientes.';

  const recommendations = [
    'Adicione fontes de fibras (aveia, chia, legumes) para reduzir picos glicêmicos.',
    'Beba um copo de água 15 minutos antes da sua próxima refeição principal.',
    'Mantenha seu registro diário consistente para acompanhar seu gráfico de evolução.'
  ];

  return {
    greeting: `Olá, ${profile.name}! Aqui está o seu relatório nutricional inteligente de hoje:`,
    calorieStatus,
    macroAdvice,
    waterAdvice,
    fastingAdvice,
    recommendations
  };
}

/**
 * Interactive Coach chat with configured AI Provider (Gemini, OpenRouter or OpenAI)
 * Falls back gracefully to heuristic nutritionist responses if no key or error occurs.
 */
export interface CoachHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Interactive Coach chat with configured AI Provider (Gemini, OpenRouter or OpenAI)
 * Supports multi-turn history, anti-hallucination scientific boundaries,
 * workout proposal generation with structured JSON, and varied heuristic fallbacks.
 */
export async function askCoachAI(
  userMessage: string,
  profile: UserProfile,
  todayLog: DayLog,
  history: CoachHistoryMessage[] = []
): Promise<string> {
  const provider = profile.aiProvider || 'gemini';

  const consumedCalories = Object.values(todayLog.meals).reduce(
    (acc, meal) => acc + meal.items.reduce((mAcc, i) => mAcc + i.calories * i.servingsCount, 0),
    0
  );

  const systemPrompt = `Você é o Coach Esportivo e Nutricional do aplicativo NutriFam.
Suas respostas devem ser científicas, acolhedoras, objetivas e práticas (baseadas no ACSM, ISSN e SBAN).
NÃO ALUCINE: Nunca invente dados que o usuário não forneceu. Se faltar informação relevante, peça educadamente.

DADOS DO USUÁRIO:
- Nome: ${profile.name}
- Peso Atual: ${profile.currentWeightKg} kg | Meta: ${profile.goalWeightKg} kg | Objetivo: ${profile.goalType}
- Meta Diária: ${profile.dailyCaloriesTarget} kcal (Proteína: ${profile.targetMacros.proteinGrams}g, Carboidrato: ${profile.targetMacros.carbsGrams}g, Gordura: ${profile.targetMacros.fatGrams}g)
- Hoje consumiu: ${consumedCalories} kcal | Água: ${todayLog.water.consumedLiters}L

DIRETRIZES DE RESPOSTA:
1. Responda em português claro, empático e encorajador.
2. Seja conciso e direto. Varie suas respostas conforme o que o usuário perguntou.
3. Se o usuário pedir RECEITAS, DICAS DE RECEITAS ou ideias de preparo: elabore a explicação, modo de preparo e adicione no final da mensagem OBRIGATORIAMENTE o bloco estruturado exatamente assim:
\`\`\`recipe_proposal
{
  "name": "Nome da Receita (ex: Panqueca de Aveia e Banana)",
  "portions": 1,
  "calories": 280,
  "protein": 15,
  "carbs": 35,
  "fat": 9,
  "fiber": 4,
  "instructions": "Amasse a banana, misture os ovos e aveia, e doure na frigideira untada por 2 minutos de cada lado.",
  "ingredients": [
    {
      "foodId": "banana",
      "name": "Banana Nanica",
      "grams": 100,
      "calories": 89,
      "protein": 1.1,
      "carbs": 22.8,
      "fat": 0.3,
      "servingUnitName": "1 unidade média"
    },
    {
      "foodId": "egg",
      "name": "Ovos de Galinha",
      "grams": 100,
      "calories": 140,
      "protein": 12.5,
      "carbs": 1.0,
      "fat": 9.8,
      "servingUnitName": "2 unidades"
    },
    {
      "foodId": "oat_flour",
      "name": "Farinha de Aveia",
      "grams": 30,
      "calories": 110,
      "protein": 4.2,
      "carbs": 18.0,
      "fat": 2.1,
      "servingUnitName": "2 colheres de sopa"
    }
  ]
}
\`\`\`
4. Se o usuário pedir para MONTAR UM TREINO ou fichas de exercícios: elabore a sugestão explicativa e adicione no final da mensagem OBRIGATORIAMENTE o bloco estruturado exatamente assim:
\`\`\`workout_proposal
{
  "title": "Nome do Treino (ex: Treino A - Peitoral e Tríceps)",
  "description": "Foco em hipertrofia e estímulo mecânico",
  "category": "push",
  "exercises": [
    {
      "exerciseId": "chest_bench_press_barbell",
      "exerciseName": "Supino Reto com Barra",
      "category": "chest",
      "targetSets": 4,
      "targetReps": "8-10",
      "restSeconds": 90
    }
  ]
}
\`\`\`
Valores aceitos para category: "push", "pull", "legs", "upper", "lower", "fullbody", "custom".`;

  // 1. OpenRouter
  if (provider === 'openrouter' && profile.openrouterApiKey?.trim()) {
    try {
      const targetModel = profile.openrouterModel || 'openrouter/free';
      const messagesPayload = [
        { role: 'system', content: systemPrompt },
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: 'user', content: userMessage }
      ];

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${profile.openrouterApiKey.trim()}`,
          'HTTP-Referer': 'https://nutrifam.app',
          'X-Title': 'NutriFam'
        },
        body: JSON.stringify({
          model: targetModel,
          messages: messagesPayload,
          max_tokens: 600
        })
      });
      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply?.trim()) return reply.trim();
      }
    } catch (e) {
      console.warn('OpenRouter coach chat failed:', e);
    }
  }

  // 2. OpenAI
  if (provider === 'openai' && profile.openaiApiKey?.trim()) {
    try {
      const messagesPayload = [
        { role: 'system', content: systemPrompt },
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: 'user', content: userMessage }
      ];

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${profile.openaiApiKey.trim()}`
        },
        body: JSON.stringify({
          model: profile.openaiModel || 'gpt-4o-mini',
          messages: messagesPayload,
          max_tokens: 600
        })
      });
      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply?.trim()) return reply.trim();
      }
    } catch (e) {
      console.warn('OpenAI coach chat failed:', e);
    }
  }

  // 3. Google Gemini
  if (provider === 'gemini' && profile.geminiApiKey?.trim()) {
    try {
      const contentsPayload = [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nHistórico da conversa:\n${history.map((h) => `${h.role}: ${h.content}`).join('\n')}\n\nNova pergunta do usuário: ${userMessage}` }]
        }
      ];

      const res = await callGeminiApi(
        profile.geminiApiKey.trim(),
        { contents: contentsPayload },
        profile.geminiModel || 'gemini-3.5-flash-lite'
      );
      if (res.ok) {
        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply?.trim()) return reply.trim();
      }
    } catch (e) {
      console.warn('Gemini coach chat failed:', e);
    }
  }

  // 4. Enhanced Contextual Heuristics Fallback (Rich, varied, anti-repetition)
  const lower = userMessage.toLowerCase();

  // Workout Generation Intent
  if (
    lower.includes('treino') ||
    lower.includes('ficha') ||
    lower.includes('musculação') ||
    lower.includes('exercício') ||
    lower.includes('push') ||
    lower.includes('pull') ||
    lower.includes('legs')
  ) {
    if (lower.includes('costas') || lower.includes('pull') || lower.includes('biceps') || lower.includes('bíceps')) {
      return `Aqui está uma excelente periodização para Dorsais e Bíceps focada em hipertrofia e amplitude completa! Descanse de 60 a 90 segundos entre as séries para recuperação adequada do ATP muscular.

\`\`\`workout_proposal
{
  "title": "Treino B - Dorsais & Bíceps (Pull)",
  "description": "Foco em largura e espessura das costas com pico de contração em bíceps",
  "category": "pull",
  "exercises": [
    {
      "exerciseId": "back_lat_pulldown_wide",
      "exerciseName": "Puxada Frontal Aberta (Pulldown)",
      "category": "back",
      "targetSets": 4,
      "targetReps": "8-10",
      "restSeconds": 90
    },
    {
      "exerciseId": "back_barbell_bent_over_row",
      "exerciseName": "Remada Curvada com Barra",
      "category": "back",
      "targetSets": 4,
      "targetReps": "8-10",
      "restSeconds": 90
    },
    {
      "exerciseId": "shoulders_face_pull",
      "exerciseName": "Face Pull na Polia",
      "category": "shoulders",
      "targetSets": 3,
      "targetReps": "12-15",
      "restSeconds": 60
    },
    {
      "exerciseId": "biceps_barbell_curl",
      "exerciseName": "Rosca Direta com Barra",
      "category": "biceps",
      "targetSets": 3,
      "targetReps": "10-12",
      "restSeconds": 60
    },
    {
      "exerciseId": "biceps_hammer_curl",
      "exerciseName": "Rosca Martelo com Halteres",
      "category": "biceps",
      "targetSets": 3,
      "targetReps": "10-12",
      "restSeconds": 60
    }
  ]
}
\`\`\`
Você pode salvar essa ficha clicando no botão abaixo!`;
    }

    if (lower.includes('perna') || lower.includes('legs') || lower.includes('gluteo') || lower.includes('quadriceps')) {
      return `Excelente iniciativa! Treinar pernas com intensidade gera alta demanda metabólica e queima calórica prolongada (EPOC). Preparei esta rotina completa:

\`\`\`workout_proposal
{
  "title": "Treino C - Pernas Completo (Legs)",
  "description": "Estímulo equilibrado em quadríceps, posteriores e panturrilhas",
  "category": "legs",
  "exercises": [
    {
      "exerciseId": "legs_barbell_squat",
      "exerciseName": "Agachamento Livre com Barra",
      "category": "legs",
      "targetSets": 4,
      "targetReps": "8-10",
      "restSeconds": 120
    },
    {
      "exerciseId": "legs_leg_press_45",
      "exerciseName": "Leg Press 45°",
      "category": "legs",
      "targetSets": 3,
      "targetReps": "10-12",
      "restSeconds": 90
    },
    {
      "exerciseId": "legs_romanian_deadlift",
      "exerciseName": "Stiff / Levantamento Romeno (RDL)",
      "category": "legs",
      "targetSets": 3,
      "targetReps": "10-12",
      "restSeconds": 90
    },
    {
      "exerciseId": "calves_standing_raise_machine",
      "exerciseName": "Panturrilha em Pé na Máquina",
      "category": "calves",
      "targetSets": 4,
      "targetReps": "15-20",
      "restSeconds": 60
    }
  ]
}
\`\`\`
Clique abaixo para salvar diretamente na sua área de treinos!`;
    }

    // Default Push routine
    return `Montei uma ficha de treino clássica e eficiente de Push (Peitoral, Ombros e Tríceps), ideal para progressão de cargas sem sobrecarregar as articulações:

\`\`\`workout_proposal
{
  "title": "Treino A - Peitoral, Ombros & Tríceps (Push)",
  "description": "Foco em empurrar com sobrecarga progressiva em exercícios compostos",
  "category": "push",
  "exercises": [
    {
      "exerciseId": "chest_bench_press_barbell",
      "exerciseName": "Supino Reto com Barra",
      "category": "chest",
      "targetSets": 4,
      "targetReps": "8-10",
      "restSeconds": 90
    },
    {
      "exerciseId": "chest_incline_bench_press_dumbbell",
      "exerciseName": "Supino Inclinado com Halteres",
      "category": "chest",
      "targetSets": 3,
      "targetReps": "10-12",
      "restSeconds": 75
    },
    {
      "exerciseId": "shoulders_dumbbell_shoulder_press",
      "exerciseName": "Desenvolvimento com Halteres",
      "category": "shoulders",
      "targetSets": 3,
      "targetReps": "10-12",
      "restSeconds": 75
    },
    {
      "exerciseId": "shoulders_lateral_raise_dumbbell",
      "exerciseName": "Elevação Lateral com Halteres",
      "category": "shoulders",
      "targetSets": 4,
      "targetReps": "12-15",
      "restSeconds": 60
    },
    {
      "exerciseId": "triceps_rope_pushdown",
      "exerciseName": "Tríceps Corda na Polia",
      "category": "triceps",
      "targetSets": 3,
      "targetReps": "12-15",
      "restSeconds": 60
    }
  ]
}
\`\`\`
Deseja salvar essa ficha na sua lista de treinos?`;
  }

  // Recipes Intent
  if (lower.includes('receita') || lower.includes('cozinhar') || lower.includes('preparar') || lower.includes('lanche')) {
    if (lower.includes('doce') || lower.includes('sobremesa') || lower.includes('banana')) {
      return `Aqui está uma receita incrível de **Panqueca Fit de Banana com Aveia e Canela**:
- 1 banana madura amassada
- 2 ovos inteiros
- 2 colheres de sopa de farinha de aveia (30g)
- 1 pitada de canela em pó

Misture tudo com um garfo e doure em frigideira antiaderente levemente untada por 2 minutos de cada lado.
Macros: ~280 kcal | 15g proteína | 35g carbo | 9g gordura. Saciedade alta e zero açúcar adicionado!

\`\`\`recipe_proposal
{
  "name": "Panqueca Fit de Banana e Aveia",
  "portions": 1,
  "calories": 280,
  "protein": 15,
  "carbs": 35,
  "fat": 9,
  "fiber": 4,
  "instructions": "Amasse a banana, adicione os ovos batidos e a farinha de aveia. Cozinhe em fogo baixo em frigideira untada por 2 min de cada lado.",
  "ingredients": [
    {
      "foodId": "banana",
      "name": "Banana Nanica",
      "grams": 100,
      "calories": 89,
      "protein": 1.1,
      "carbs": 22.8,
      "fat": 0.3,
      "servingUnitName": "1 unidade média"
    },
    {
      "foodId": "egg",
      "name": "Ovos de Galinha",
      "grams": 100,
      "calories": 140,
      "protein": 12.5,
      "carbs": 1.0,
      "fat": 9.8,
      "servingUnitName": "2 unidades"
    },
    {
      "foodId": "oat_flour",
      "name": "Farinha de Aveia",
      "grams": 30,
      "calories": 110,
      "protein": 4.2,
      "carbs": 18.0,
      "fat": 2.1,
      "servingUnitName": "2 colheres de sopa"
    }
  ]
}
\`\`\`
Você pode salvar esta receita diretamente na sua aba de Receitas clicando abaixo!`;
    }

    if (lower.includes('proteico') || lower.includes('proteína') || lower.includes('pos treino') || lower.includes('pós-treino')) {
      return `Experimente este **Creme Proteico de Frutas Vermelhas**:
- 1 pote de iogurte natural desnatado (160g)
- 1 scoop (30g) de Whey Protein
- 50g de morangos picados
- 1 colher de sopa de sementes de chia (10g)

Misture o iogurte e o whey até homogeneizar e finalize com as frutas e a chia.
Macros: ~220 kcal | 32g proteína | 14g carbo | 3g gordura boa.

\`\`\`recipe_proposal
{
  "name": "Creme Proteico de Frutas Vermelhas",
  "portions": 1,
  "calories": 220,
  "protein": 32,
  "carbs": 14,
  "fat": 3,
  "fiber": 4,
  "instructions": "Misture vigorosamente o iogurte desnatado com o scoop de whey até obter consistência de mousse. Adicione os morangos e sementes de chia no topo.",
  "ingredients": [
    {
      "foodId": "yogurt_greek_nonfat",
      "name": "Iogurte Natural Desnatado",
      "grams": 160,
      "calories": 90,
      "protein": 14.0,
      "carbs": 8.0,
      "fat": 0.5,
      "servingUnitName": "1 pote (160g)"
    },
    {
      "foodId": "whey_protein",
      "name": "Whey Protein Concentrado/Isolado",
      "grams": 30,
      "calories": 120,
      "protein": 24.0,
      "carbs": 2.0,
      "fat": 1.5,
      "servingUnitName": "1 scoop (30g)"
    },
    {
      "foodId": "strawberries",
      "name": "Morangos Frescos",
      "grams": 50,
      "calories": 16,
      "protein": 0.3,
      "carbs": 3.8,
      "fat": 0.1,
      "servingUnitName": "3 unidades"
    }
  ]
}
\`\`\`
Clique abaixo para salvar na sua aba de Receitas!`;
    }

    return `Uma das melhores refeições práticas para sua meta é o **Omelete Rápido NutriFam**:
- 3 ovos inteiros
- 2 colheres de sopa de queijo cottage ou ricota (40g)
- Tomate picado e orégano a gosto

Bata os ovos, despeje na frigideira antiaderente em fogo brando, adicione o cottage e dobre.
Macros: ~230 kcal | 23g proteína | 3g carbo | 13g gordura boa.

\`\`\`recipe_proposal
{
  "name": "Omelete Rápido com Cottage e Ervas",
  "portions": 1,
  "calories": 230,
  "protein": 23,
  "carbs": 3,
  "fat": 13,
  "fiber": 1,
  "instructions": "Bata os ovos com uma pitada de sal e orégano. Despeje na frigideira pré-aquecida, recheie com o queijo cottage e dobre em meia-lua.",
  "ingredients": [
    {
      "foodId": "egg",
      "name": "Ovos de Galinha",
      "grams": 150,
      "calories": 195,
      "protein": 18.0,
      "carbs": 1.5,
      "fat": 13.5,
      "servingUnitName": "3 unidades"
    },
    {
      "foodId": "cottage_cheese",
      "name": "Queijo Cottage",
      "grams": 40,
      "calories": 38,
      "protein": 4.5,
      "carbs": 1.2,
      "fat": 1.5,
      "servingUnitName": "2 colheres de sopa"
    },
    {
      "foodId": "tomato",
      "name": "Tomate Fresco em Cubos",
      "grams": 50,
      "calories": 9,
      "protein": 0.4,
      "carbs": 1.9,
      "fat": 0.1,
      "servingUnitName": "1/2 unidade"
    }
  ]
}
\`\`\`
Deseja salvar essa receita no seu banco de receitas?`;
  }

  // Supplements Intent
  if (lower.includes('creatina') || lower.includes('whey') || lower.includes('suplement')) {
    if (lower.includes('creatina')) {
      return `A **Creatina Monoidratada** é o suplemento com maior comprovação científica do mundo. Ela atua na regeneração rápida de ATP celular, aumentando força e hipertrofia. A recomendação padrão é de 3g a 5g todos os dias (inclusive nos dias sem treino), consumida preferencialmente com uma fonte de carboidrato para otimizar a absorção.`;
    }
    return `O **Whey Protein** é basicamente uma proteína de altíssimo valor biológico extraída do soro do leite. Ele não tem nada de "mágico", mas é uma ferramenta imbatível de conveniência para bater seus ${profile.targetMacros.proteinGrams}g diários sem ter que preparar carne ou ovos toda hora!`;
  }

  // Specific Diets & Fasting
  if (lower.includes('jejum') || lower.includes('fasting')) {
    return `O jejum intermitente é uma ferramenta válida para controle de janelas alimentares, mas o que determina a perda de peso real é o balanço energético total (déficit calórico). O mais importante é garantir que na sua janela de alimentação você atinja seus ${profile.targetMacros.proteinGrams}g de proteína para preservar sua massa magra.`;
  }

  // Evening / Dinner
  if (lower.includes('jantar') || lower.includes('noite') || lower.includes('dinner')) {
    return `Para o jantar, uma combinação impecável com alta saciedade e poucas calorias é filé de frango grelhado (150g) acompanhado de salada verde colorida e uma porção moderada de abóbora cabotiá ou batata cozida. Isso fornece ~40g de proteína sem estourar as calorias antes de dormir.`;
  }

  // General Adaptive Motivation
  const tips = [
    `Para alcançar seus ${profile.goalWeightKg} kg de forma consistente, a regularidade vence a perfeição. Mantenha os treinos anotados e procure progredir 1 repetição ou 1 kg a cada semana!`,
    `Lembre-se que cada grama de proteína ajuda a preservar a massa magra durante o emagrecimento e eleva a queima energética pela termogênese dos alimentos (TEF). Você já está no caminho certo!`,
    `Hoje você já registrou ${consumedCalories} kcal das suas ${profile.dailyCaloriesTarget} kcal diárias. Se sentir fome entre as refeições, frutas com casca ou vegetais crus são seus maiores aliados em volume com baixa densidade calórica.`
  ];

  return tips[Math.floor(Math.random() * tips.length)];
}

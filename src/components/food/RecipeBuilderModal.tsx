import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  ChefHat,
  Search,
  Check,
  Sparkles
} from 'lucide-react';
import { FoodItem } from '../../types';
import {
  searchLocalBrazilianFoods,
  normalizeSearchString
} from '../../services/foodApiService';
import { useTheme } from '../../services/themeService';

interface RecipeIngredientEntry {
  foodId: string;
  name: string;
  brand?: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingUnitName?: string;
  baseGrams: number;
  baseCalories: number;
  baseProtein: number;
  baseCarbs: number;
  baseFat: number;
  baseFiber: number;
}

interface RecipeBuilderModalProps {
  customFoods: FoodItem[];
  onClose: () => void;
  onSaveRecipe: (recipe: FoodItem) => void;
}

export const RecipeBuilderModal: React.FC<RecipeBuilderModalProps> = ({
  customFoods,
  onClose,
  onSaveRecipe
}) => {
  const { activeColor } = useTheme();
  const [recipeName, setRecipeName] = useState('');
  const [yieldPortions, setYieldPortions] = useState(2);
  const [yieldUnitName, setYieldUnitName] = useState('porção');
  const [ingredients, setIngredients] = useState<RecipeIngredientEntry[]>([]);

  // Search state for adding ingredients
  const [isSearchingIngredient, setIsSearchingIngredient] = useState(false);
  const [ingredientQuery, setIngredientQuery] = useState('');

  // Search results
  const searchResults = useMemo(() => {
    const norm = normalizeSearchString(ingredientQuery);
    if (!norm || norm.length < 2) return [];

    const queryTokens = norm.split(' ').filter(Boolean);

    // 1. Search in custom foods
    const customMatches = customFoods.filter((f) => {
      const text = normalizeSearchString(`${f.name} ${f.brand || ''}`);
      return queryTokens.every((tok) => text.includes(tok));
    });

    // 2. Search in Brazilian brands & TACO
    const localMatches = searchLocalBrazilianFoods(ingredientQuery);

    const keys = new Set(customMatches.map((c) => normalizeSearchString(`${c.name} ${c.brand || ''}`)));
    return [...customMatches, ...localMatches.filter((m) => !keys.has(normalizeSearchString(`${m.name} ${m.brand || ''}`)))].slice(0, 15);
  }, [ingredientQuery, customFoods]);

  const handleAddIngredient = (food: FoodItem) => {
    const baseG = food.servingGrams || 100;
    const newEntry: RecipeIngredientEntry = {
      foodId: food.id,
      name: food.name,
      brand: food.brand,
      grams: baseG,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      servingUnitName: food.servingUnitName || 'porção',
      baseGrams: baseG,
      baseCalories: food.calories,
      baseProtein: food.protein,
      baseCarbs: food.carbs,
      baseFat: food.fat,
      baseFiber: food.fiber
    };

    setIngredients((prev) => [...prev, newEntry]);
    setIsSearchingIngredient(false);
    setIngredientQuery('');
  };

  const handleUpdateIngredientGrams = (index: number, newGrams: number) => {
    const safeGrams = Math.max(1, newGrams);
    setIngredients((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const multiplier = safeGrams / item.baseGrams;
        return {
          ...item,
          grams: safeGrams,
          calories: Math.round(item.baseCalories * multiplier),
          protein: Number((item.baseProtein * multiplier).toFixed(1)),
          carbs: Number((item.baseCarbs * multiplier).toFixed(1)),
          fat: Number((item.baseFat * multiplier).toFixed(1)),
          fiber: Number((item.baseFiber * multiplier).toFixed(1))
        };
      })
    );
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Recipe totals
  const totalWeight = ingredients.reduce((acc, it) => acc + it.grams, 0);
  const totalCal = ingredients.reduce((acc, it) => acc + it.calories, 0);
  const totalProt = Number(ingredients.reduce((acc, it) => acc + it.protein, 0).toFixed(1));
  const totalCarb = Number(ingredients.reduce((acc, it) => acc + it.carbs, 0).toFixed(1));
  const totalFat = Number(ingredients.reduce((acc, it) => acc + it.fat, 0).toFixed(1));
  const totalFib = Number(ingredients.reduce((acc, it) => acc + it.fiber, 0).toFixed(1));

  // Per portion values
  const safePortions = Math.max(1, yieldPortions);
  const perPortionGrams = Math.round(totalWeight / safePortions);
  const perPortionCal = Math.round(totalCal / safePortions);
  const perPortionProt = Number((totalProt / safePortions).toFixed(1));
  const perPortionCarb = Number((totalCarb / safePortions).toFixed(1));
  const perPortionFat = Number((totalFat / safePortions).toFixed(1));
  const perPortionFib = Number((totalFib / safePortions).toFixed(1));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeName.trim() || ingredients.length === 0) return;

    const recipeFoodItem: FoodItem = {
      id: 'recipe_' + Date.now(),
      name: recipeName.trim(),
      brand: 'Minha Receita Caseira',
      calories: perPortionCal,
      servingSize: `1 ${yieldUnitName} (${perPortionGrams} g)`,
      servingGrams: perPortionGrams,
      servingUnitName: yieldUnitName,
      protein: perPortionProt,
      carbs: perPortionCarb,
      fat: perPortionFat,
      fiber: perPortionFib,
      category: 'Recipe',
      isFavorite: true,
      colorDot: '#10b981',
      novaGroup: 2,
      healthScore: 92,
      preservativesCount: 0,
      isRecipe: true,
      recipeYieldPortions: safePortions,
      recipeIngredients: ingredients.map((it) => ({
        foodId: it.foodId,
        name: it.name,
        grams: it.grams,
        calories: it.calories,
        protein: it.protein,
        carbs: it.carbs,
        fat: it.fat,
        servingUnitName: it.servingUnitName
      }))
    };

    onSaveRecipe(recipeFoodItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md h-full sm:h-[94vh] sm:max-h-[850px] sm:rounded-[32px] bg-[#F7F4EE] dark:bg-[#18201D] flex flex-col overflow-hidden shadow-2xl relative border border-[#AEBDB5]/20 dark:border-[#394842]">
        {/* Header */}
        <div className="px-5 py-4 bg-white dark:bg-[#232D29] border-b border-[#AEBDB5]/20 dark:border-[#394842] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: activeColor.primary }}
            >
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight text-[#3F4B46] dark:text-[#EDF2EF]">
                Criador de Receitas
              </h3>
              <p className="text-[11px] text-[#6F7C76] dark:text-[#A8B8B1]">
                Agrupe ingredientes com cálculo automático por porção
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F7F4EE] dark:bg-[#18201D] text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 select-none pb-28">
          {/* Recipe Name & Yield row */}
          <div className="bg-white dark:bg-[#232D29] p-4 rounded-2xl border border-[#AEBDB5]/30 dark:border-[#394842] space-y-3">
            <div>
              <label className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">
                Nome da Receita *
              </label>
              <input
                type="text"
                required
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                placeholder="Ex: Panqueca de Banana com Aveia e Whey"
                className="w-full px-3.5 py-2.5 bg-[#F7F4EE] dark:bg-[#18201D] rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] placeholder-[#6F7C76]/60 dark:placeholder-[#A8B8B1]/60 focus:outline-none focus:border-[#6F7C76] shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">
                  Rendimento (Porções)
                </label>
                <div className="flex items-center bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-xl px-3 py-1.5 shadow-2xs">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={yieldPortions}
                    onChange={(e) => setYieldPortions(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full text-center font-black text-sm text-[#3F4B46] dark:text-[#EDF2EF] bg-transparent focus:outline-none"
                  />
                  <span className="text-xs font-bold text-[#6F7C76] dark:text-[#A8B8B1] ml-1">porções</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">
                  Nome da Porção
                </label>
                <input
                  type="text"
                  value={yieldUnitName}
                  onChange={(e) => setYieldUnitName(e.target.value)}
                  placeholder="Ex: porção, fatia, pote"
                  className="w-full px-3 py-2 bg-[#F7F4EE] dark:bg-[#18201D] rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] placeholder-[#6F7C76]/60 dark:placeholder-[#A8B8B1]/60 focus:outline-none focus:border-[#6F7C76] shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Ingredients List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] uppercase tracking-wide">
                Ingredientes ({ingredients.length})
              </h4>
              <button
                type="button"
                onClick={() => setIsSearchingIngredient(true)}
                className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border border-[#AEBDB5]/30 dark:border-[#394842] transition-transform active:scale-95 text-white"
                style={{ backgroundColor: activeColor.primary }}
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Adicionar Ingrediente</span>
              </button>
            </div>

            {ingredients.length === 0 ? (
              <div className="p-6 border-2 border-dashed border-[#AEBDB5]/30 dark:border-[#394842] rounded-2xl text-center text-xs text-[#6F7C76] dark:text-[#A8B8B1]">
                <ChefHat className="w-8 h-8 mx-auto text-[#6F7C76]/50 dark:text-[#A8B8B1]/50 mb-2" />
                <span>Nenhum ingrediente adicionado ainda.</span>
                <p className="text-[11px] text-[#6F7C76]/70 dark:text-[#A8B8B1]/70 mt-1">
                  Toque em "+ Adicionar Ingrediente" para buscar na base brasileira ou UNICAMP.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {ingredients.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-2xl shadow-2xs flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] truncate capitalize">
                        {item.name}
                      </h5>
                      {item.brand && (
                        <span className="text-[10px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] uppercase tracking-wide block truncate">
                          {item.brand}
                        </span>
                      )}
                      <div className="flex items-center gap-2 text-[11px] text-[#6F7C76] dark:text-[#A8B8B1] font-medium mt-0.5">
                        <span className="font-bold text-[#3F4B46] dark:text-[#EDF2EF]">{item.calories} Cal</span>
                        <span>• P: {item.protein}g</span>
                        <span>• C: {item.carbs}g</span>
                        <span>• G: {item.fat}g</span>
                      </div>
                    </div>

                    {/* Grams stepper */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex items-center bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-xl px-2 py-1">
                        <input
                          type="number"
                          min={1}
                          max={5000}
                          value={item.grams}
                          onChange={(e) =>
                            handleUpdateIngredientGrams(idx, parseInt(e.target.value, 10) || 0)
                          }
                          className="w-14 text-center text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] bg-transparent focus:outline-none"
                        />
                        <span className="text-[10px] font-bold text-[#6F7C76] dark:text-[#A8B8B1]">g</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        className="p-1.5 text-[#6F7C76] hover:text-rose-500 transition-colors"
                        title="Remover ingrediente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Recipe Summary (Total vs Per Portion) */}
          {ingredients.length > 0 && (
            <div className="bg-[#ECEFE7] dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#AEBDB5]/20 dark:border-[#394842]">
                <span className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: activeColor.primary }} />
                  Resumo Nutricional por Porção (1/{safePortions})
                </span>
                <span className="text-[11px] font-bold text-[#6F7C76] dark:text-[#A8B8B1]">
                  Peso: {perPortionGrams}g
                </span>
              </div>

              {/* Per Portion Macros */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white dark:bg-[#18201D] p-2 rounded-xl border border-[#AEBDB5]/20 dark:border-[#394842] shadow-2xs">
                  <span className="text-[10px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] block">Calorias</span>
                  <span className="text-sm font-black text-[#3F4B46] dark:text-[#EDF2EF]">{perPortionCal}</span>
                </div>
                <div className="bg-white dark:bg-[#18201D] p-2 rounded-xl border border-[#AEBDB5]/20 dark:border-[#394842] shadow-2xs">
                  <span className="text-[10px] font-bold text-[#4A90E2] block">Proteína</span>
                  <span className="text-sm font-black text-[#3F4B46] dark:text-[#EDF2EF]">{perPortionProt}g</span>
                </div>
                <div className="bg-white dark:bg-[#18201D] p-2 rounded-xl border border-[#AEBDB5]/20 dark:border-[#394842] shadow-2xs">
                  <span className="text-[10px] font-bold text-[#9B51E0] block">Carbo</span>
                  <span className="text-sm font-black text-[#3F4B46] dark:text-[#EDF2EF]">{perPortionCarb}g</span>
                </div>
                <div className="bg-white dark:bg-[#18201D] p-2 rounded-xl border border-[#AEBDB5]/20 dark:border-[#394842] shadow-2xs">
                  <span className="text-[10px] font-bold text-[#E5A93C] block">Gordura</span>
                  <span className="text-sm font-black text-[#3F4B46] dark:text-[#EDF2EF]">{perPortionFat}g</span>
                </div>
              </div>

              {/* Total Recipe footprint */}
              <div className="text-[11px] text-[#6F7C76] dark:text-[#A8B8B1] font-medium flex justify-between pt-1">
                <span>Receita Inteira ({totalWeight}g):</span>
                <span className="font-bold text-[#3F4B46] dark:text-[#EDF2EF]">
                  {totalCal} kcal • {totalProt}g Prot • {totalCarb}g Carb • {totalFat}g Gord
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Save Button */}
        <div className="absolute bottom-0 inset-x-0 bg-white/95 dark:bg-[#232D29]/95 backdrop-blur-md p-4 border-t border-[#AEBDB5]/20 dark:border-[#394842] flex justify-center z-20">
          <button
            type="button"
            onClick={handleSave}
            disabled={!recipeName.trim() || ingredients.length === 0}
            className={`w-full py-3.5 rounded-full font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all ${
              !recipeName.trim() || ingredients.length === 0
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'text-white active:scale-98'
            }`}
            style={
              !recipeName.trim() || ingredients.length === 0
                ? undefined
                : { backgroundColor: activeColor.primary }
            }
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>Salvar Receita ({perPortionCal} kcal / porção)</span>
          </button>
        </div>

        {/* Modal for Searching & Picking Ingredients */}
        {isSearchingIngredient && (
          <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-[#232D29] w-full max-w-sm rounded-[32px] p-4 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden border border-[#AEBDB5]/20 dark:border-[#394842]">
              <div className="flex items-center justify-between pb-2 border-b border-[#AEBDB5]/20 dark:border-[#394842] shrink-0">
                <h4 className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF] text-sm">
                  Escolher Ingrediente
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchingIngredient(false);
                    setIngredientQuery('');
                  }}
                  className="w-7 h-7 rounded-full bg-[#F7F4EE] dark:bg-[#18201D] text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search input */}
              <div className="relative my-3 shrink-0">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6F7C76] dark:text-[#A8B8B1]" />
                <input
                  type="text"
                  value={ingredientQuery}
                  onChange={(e) => setIngredientQuery(e.target.value)}
                  placeholder="Ex: Ovo, Aveia, Frango, Banana..."
                  className="w-full pl-9 pr-3 py-2 bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-xl text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] placeholder-[#6F7C76]/60 dark:placeholder-[#A8B8B1]/60 focus:outline-none"
                  autoFocus
                />
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#AEBDB5]/15 dark:divide-[#394842]/60 pr-1">
                {searchResults.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#6F7C76] dark:text-[#A8B8B1]">
                    {ingredientQuery.length < 2
                      ? 'Digite ao menos 2 letras para buscar.'
                      : 'Nenhum ingrediente encontrado.'}
                  </div>
                ) : (
                  searchResults.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => handleAddIngredient(f)}
                      className="py-2.5 px-2 flex items-center justify-between hover:bg-[#ECEFE7]/50 dark:hover:bg-[#18201D]/60 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="flex-1 pr-2">
                        <div className="font-bold text-xs text-[#3F4B46] dark:text-[#EDF2EF] capitalize">
                          {f.name}
                        </div>
                        {f.brand && (
                          <div className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] font-semibold uppercase">
                            {f.brand}
                          </div>
                        )}
                        <div className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] mt-0.5">
                          {f.calories} Cal • {f.servingSize}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="w-7 h-7 rounded-full text-white flex items-center justify-center shadow-xs shrink-0"
                        style={{ backgroundColor: activeColor.primary }}
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Search, Plus, ChefHat, Utensils, X, Check } from 'lucide-react';
import { FoodItem } from '../../types';
import { RecipeBuilderModal } from './RecipeBuilderModal';
import { useTheme } from '../../services/themeService';

interface MyFoodsViewProps {
  customFoods: FoodItem[];
  onAddFood: (food: FoodItem) => void;
  onCreateFood: (food: FoodItem) => void;
}

export const MyFoodsView: React.FC<MyFoodsViewProps> = ({
  customFoods,
  onAddFood,
  onCreateFood
}) => {
  const { activeColor } = useTheme();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Food' | 'Recipe' | 'Meal'>('All');
  const [isCreatingFood, setIsCreatingFood] = useState(false);
  const [isCreatingRecipe, setIsCreatingRecipe] = useState(false);
  const [selectedRecipeForPortion, setSelectedRecipeForPortion] = useState<FoodItem | null>(null);
  const [consumedPortions, setConsumedPortions] = useState(1);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // New Food Form State
  const [newName, setNewName] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newCalories, setNewCalories] = useState('');
  const [newServing, setNewServing] = useState('1 porção (100 g)');
  const [newServingGrams, setNewServingGrams] = useState(100);
  const [newServingUnit, setNewServingUnit] = useState('porção');
  const [newProtein, setNewProtein] = useState('');
  const [newCarbs, setNewCarbs] = useState('');
  const [newFat, setNewFat] = useState('');

  const filtered = customFoods.filter((f) => {
    const matchesQuery =
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      (f.brand && f.brand.toLowerCase().includes(query.toLowerCase()));
    const matchesCat =
      activeCategory === 'All'
        ? true
        : activeCategory === 'Recipe'
        ? f.category === 'Recipe' || Boolean(f.isRecipe)
        : f.category === activeCategory;
    return matchesQuery && matchesCat;
  });

  const handleSaveNewFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCalories) return;

    const food: FoodItem = {
      id: 'custom_' + Date.now(),
      name: newName.trim(),
      brand: newBrand.trim() || 'Criado por mim',
      calories: Number(newCalories),
      servingSize: newServing.trim() || `${newServingGrams} g`,
      servingGrams: Number(newServingGrams) || 100,
      servingUnitName: newServingUnit.trim() || 'porção',
      protein: Number(newProtein) || 0,
      carbs: Number(newCarbs) || 0,
      fat: Number(newFat) || 0,
      fiber: 1,
      colorDot: '#14b8a6',
      category: activeCategory === 'All' ? 'Food' : activeCategory,
      isFavorite: true
    };

    onCreateFood(food);
    setIsCreatingFood(false);
    setNewName('');
    setNewBrand('');
    setNewCalories('');
    setNewProtein('');
    setNewCarbs('');
    setNewFat('');
  };

  const handleAddRecipeWithPortion = () => {
    if (!selectedRecipeForPortion) return;

    const recipe = selectedRecipeForPortion;
    const factor = consumedPortions;
    const effectiveCal = Math.round(recipe.calories * factor);
    const effectiveProt = Number((recipe.protein * factor).toFixed(1));
    const effectiveCarb = Number((recipe.carbs * factor).toFixed(1));
    const effectiveFat = Number((recipe.fat * factor).toFixed(1));
    const effectiveFib = Number((recipe.fiber * factor).toFixed(1));
    const effectiveGrams = Math.round(recipe.servingGrams * factor);

    const unit = recipe.servingUnitName || 'porção';
    const scaledItem: FoodItem = {
      ...recipe,
      calories: effectiveCal,
      protein: effectiveProt,
      carbs: effectiveCarb,
      fat: effectiveFat,
      fiber: effectiveFib,
      servingSize: `${consumedPortions} ${unit}${consumedPortions > 1 ? 'ões' : ''} (${effectiveGrams}g)`,
      servingGrams: effectiveGrams
    };

    onAddFood(scaledItem);
    setRecentlyAddedId(recipe.id);
    setSelectedRecipeForPortion(null);
    setTimeout(() => setRecentlyAddedId(null), 900);
  };

  return (
    <div className="flex-1 min-h-0 h-full flex flex-col px-4 pt-3 pb-0 overflow-hidden relative bg-[#F7F4EE] dark:bg-[#18201D] transition-colors">
      {/* Search Input */}
      <div className="relative mb-2.5 shrink-0">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[#6F7C76] dark:text-[#A8B8B1]">
          <Search className="w-4 h-4 stroke-[2.5]" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar nos meus itens e receitas..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-full text-xs font-semibold text-[#3F4B46] dark:text-[#EDF2EF] placeholder-[#6F7C76]/60 dark:placeholder-[#A8B8B1]/60 focus:outline-none focus:border-[#6F7C76] shadow-2xs transition-colors"
        />
      </div>

      {/* Creation Action Bar: Recipe Builder or Simple Food */}
      <div className="grid grid-cols-2 gap-2 mb-3 shrink-0">
        <button
          type="button"
          onClick={() => setIsCreatingRecipe(true)}
          className="p-3 bg-[#ECEFE7] dark:bg-[#232D29] hover:bg-[#C8E6C9]/40 dark:hover:bg-[#2B3732] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-2xl flex items-center justify-between transition-transform active:scale-98 shadow-2xs text-left"
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl text-white flex items-center justify-center text-xs shadow-xs shrink-0"
              style={{ backgroundColor: activeColor.primary }}
            >
              <ChefHat className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-[#3F4B46] dark:text-[#EDF2EF] block leading-tight">
                Criar Receita
              </span>
              <span className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] font-medium">
                Agrupar alimentos
              </span>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setIsCreatingFood(true)}
          className="p-3 bg-white dark:bg-[#232D29] hover:bg-[#ECEFE7] dark:hover:bg-[#2B3732] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-2xl flex items-center justify-between transition-transform active:scale-98 shadow-2xs text-left"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F7F4EE] dark:bg-[#18201D] text-[#3F4B46] dark:text-[#EDF2EF] border border-[#AEBDB5]/30 dark:border-[#394842] flex items-center justify-center text-xs shadow-xs shrink-0">
              <Utensils className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-xs text-[#3F4B46] dark:text-[#EDF2EF] block leading-tight">
                Novo Alimento
              </span>
              <span className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] font-medium">
                Alimento avulso
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Sort row */}
      <div className="flex items-center justify-between text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] mb-2 shrink-0 px-1">
        <div className="flex items-center gap-1">
          <span className="text-[#6F7C76] dark:text-[#A8B8B1] text-sm">⇅</span>
          <span>Itens salvos:</span>
          <span className="font-semibold text-[#6F7C76] dark:text-[#A8B8B1]">{filtered.length}</span>
        </div>
      </div>

      {/* Foods List */}
      <div
        className="flex-1 min-h-0 h-full overflow-y-auto overflow-x-hidden divide-y divide-[#AEBDB5]/15 dark:divide-[#394842]/60 pb-28 touch-pan-y pr-1"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[#6F7C76] dark:text-[#A8B8B1] text-xs">
            <ChefHat className="w-10 h-10 mx-auto text-[#6F7C76]/50 dark:text-[#A8B8B1]/50 mb-2" />
            <span>Nenhum item salvo nesta categoria.</span>
            <p className="text-[11px] text-[#6F7C76]/70 dark:text-[#A8B8B1]/70 mt-1">
              Crie uma receita agrupando alimentos ou adicione um alimento novo acima!
            </p>
          </div>
        ) : (
          filtered.map((food) => {
            const isAdded = recentlyAddedId === food.id;
            const isRecipe = food.isRecipe || food.category === 'Recipe';

            return (
              <div
                key={food.id}
                className="py-3 flex items-center justify-between hover:bg-[#ECEFE7]/50 dark:hover:bg-[#232D29]/60 px-2 rounded-xl transition-colors"
              >
                <div
                  className="flex-1 pr-3 cursor-pointer"
                  onClick={() => {
                    if (isRecipe) {
                      setSelectedRecipeForPortion(food);
                      setConsumedPortions(1);
                    } else {
                      onAddFood(food);
                    }
                  }}
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-sm leading-tight">
                      {food.name}
                    </h4>

                    {isRecipe && (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#ECEFE7] dark:bg-[#2B3732] text-[#3F4B46] dark:text-[#C9D9C8] border border-[#AEBDB5]/30 dark:border-[#394842] flex items-center gap-1">
                        <ChefHat className="w-3 h-3" />
                        Rende {food.recipeYieldPortions || 1} {food.servingUnitName || 'porções'}
                      </span>
                    )}
                  </div>

                  {food.brand && (
                    <span className="text-[11px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] uppercase tracking-wide block mt-0.5">
                      {food.brand}
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 mt-1 text-xs text-[#6F7C76] dark:text-[#A8B8B1] font-medium">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: food.colorDot || activeColor.primary }}
                    />
                    <span className="font-bold text-[#3F4B46] dark:text-[#EDF2EF]">
                      {food.calories} Cal
                    </span>
                    <span>• {food.servingSize}</span>
                    {food.recipeIngredients && (
                      <span className="text-[10px] text-[#6F7C76]/70 dark:text-[#A8B8B1]/70">
                        • {food.recipeIngredients.length} ingredientes
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (isRecipe) {
                      setSelectedRecipeForPortion(food);
                      setConsumedPortions(1);
                    } else {
                      onAddFood(food);
                      setRecentlyAddedId(food.id);
                      setTimeout(() => setRecentlyAddedId(null), 900);
                    }
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-2xs shrink-0 ${
                    isAdded
                      ? 'text-white'
                      : 'bg-white dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] text-[#3F4B46] dark:text-[#EDF2EF]'
                  }`}
                  style={isAdded ? { backgroundColor: activeColor.primary } : undefined}
                  aria-label={`Adicionar ${food.name}`}
                >
                  {isAdded ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Filter Pills */}
      <div className="absolute bottom-2 inset-x-4 flex justify-between bg-white/95 dark:bg-[#232D29]/95 backdrop-blur-sm p-1.5 rounded-full shadow-md border border-[#AEBDB5]/30 dark:border-[#394842] z-10">
        {(['All', 'Food', 'Recipe', 'Meal'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeCategory === cat
                ? 'text-white shadow-xs'
                : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]'
            }`}
            style={activeCategory === cat ? { backgroundColor: activeColor.primary } : undefined}
          >
            {cat === 'All' ? 'Todos' : cat === 'Food' ? 'Alimentos' : cat === 'Recipe' ? 'Receitas' : 'Refeições'}
          </button>
        ))}
      </div>

      {/* Recipe Builder Modal */}
      {isCreatingRecipe && (
        <RecipeBuilderModal
          customFoods={customFoods}
          onClose={() => setIsCreatingRecipe(false)}
          onSaveRecipe={(newRecipe) => {
            onCreateFood(newRecipe);
          }}
        />
      )}

      {/* Recipe Portion Log Modal (When adding a recipe to a meal) */}
      {selectedRecipeForPortion && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#232D29] max-w-xs w-full rounded-[28px] p-5 shadow-2xl space-y-4 border border-[#AEBDB5]/20 dark:border-[#394842]">
            <div className="flex items-center justify-between pb-2 border-b border-[#AEBDB5]/20 dark:border-[#394842]">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5" style={{ color: activeColor.primary }} />
                <h4 className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF] text-sm truncate">
                  {selectedRecipeForPortion.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedRecipeForPortion(null)}
                className="w-7 h-7 rounded-full bg-[#F7F4EE] dark:bg-[#18201D] text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-3 bg-[#ECEFE7] dark:bg-[#18201D] rounded-2xl border border-[#AEBDB5]/30 dark:border-[#394842]">
              <span className="text-[11px] font-bold text-[#3F4B46] dark:text-[#EDF2EF] block">
                Quantas porções você consumiu?
              </span>
              <div className="flex items-center justify-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setConsumedPortions((prev) => Math.max(0.25, Number((prev - 0.5).toFixed(2))))}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] font-black text-lg text-[#3F4B46] dark:text-[#EDF2EF] shadow-2xs active:scale-95 transition-transform"
                >
                  -
                </button>
                <div className="text-xl font-black text-[#3F4B46] dark:text-[#EDF2EF]">
                  {consumedPortions}{' '}
                  <span className="text-xs text-[#6F7C76] dark:text-[#A8B8B1] font-bold">
                    de {selectedRecipeForPortion.recipeYieldPortions || 1}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setConsumedPortions((prev) => Number((prev + 0.5).toFixed(2)))}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] font-black text-lg text-[#3F4B46] dark:text-[#EDF2EF] shadow-2xs active:scale-95 transition-transform"
                >
                  +
                </button>
              </div>

              <div className="mt-2 text-xs font-black text-[#3F4B46] dark:text-[#EDF2EF]">
                {Math.round(selectedRecipeForPortion.calories * consumedPortions)} kcal calculadas
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddRecipeWithPortion}
              className="w-full py-3.5 text-white font-bold text-xs rounded-full shadow-sm transition-all active:scale-98"
              style={{ backgroundColor: activeColor.primary }}
            >
              Adicionar à Refeição
            </button>
          </div>
        </div>
      )}

      {/* Simple Food Creator Modal */}
      {isCreatingFood && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-[#232D29] w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto border border-[#AEBDB5]/20 dark:border-[#394842]">
            <div className="flex items-center justify-between pb-3 border-b border-[#AEBDB5]/20 dark:border-[#394842]">
              <h4 className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF] text-base">Novo Alimento Simples</h4>
              <button
                onClick={() => setIsCreatingFood(false)}
                className="w-8 h-8 rounded-full bg-[#F7F4EE] dark:bg-[#18201D] text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewFood} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">Nome do alimento *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Iogurte Proteico Caseiro"
                  className="w-full p-2.5 rounded-xl bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] text-[#3F4B46] dark:text-[#EDF2EF] placeholder-[#6F7C76]/60 dark:placeholder-[#A8B8B1]/60 focus:outline-none focus:border-[#6F7C76] font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">Marca ou Criador</label>
                <input
                  type="text"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  placeholder="Ex: Caseiro, Minha Cozinha, etc."
                  className="w-full p-2.5 rounded-xl bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] text-[#3F4B46] dark:text-[#EDF2EF] placeholder-[#6F7C76]/60 dark:placeholder-[#A8B8B1]/60 focus:outline-none focus:border-[#6F7C76]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">Calorias (kcal) *</label>
                  <input
                    type="number"
                    required
                    value={newCalories}
                    onChange={(e) => setNewCalories(e.target.value)}
                    placeholder="Ex: 180"
                    className="w-full p-2.5 rounded-xl bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] text-[#3F4B46] dark:text-[#EDF2EF] placeholder-[#6F7C76]/60 dark:placeholder-[#A8B8B1]/60 focus:outline-none focus:border-[#6F7C76] font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">Peso da Porção (g)</label>
                  <input
                    type="number"
                    value={newServingGrams}
                    onChange={(e) => setNewServingGrams(parseInt(e.target.value, 10) || 100)}
                    placeholder="100"
                    className="w-full p-2.5 rounded-xl bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] text-[#3F4B46] dark:text-[#EDF2EF] placeholder-[#6F7C76]/60 dark:placeholder-[#A8B8B1]/60 focus:outline-none focus:border-[#6F7C76] font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">Nome da Porção</label>
                  <input
                    type="text"
                    value={newServingUnit}
                    onChange={(e) => setNewServingUnit(e.target.value)}
                    placeholder="Ex: fatia, scoop, copo"
                    className="w-full p-2.5 rounded-xl bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] text-[#3F4B46] dark:text-[#EDF2EF] placeholder-[#6F7C76]/60 dark:placeholder-[#A8B8B1]/60 focus:outline-none focus:border-[#6F7C76]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">Descrição</label>
                  <input
                    type="text"
                    value={newServing}
                    onChange={(e) => setNewServing(e.target.value)}
                    placeholder="Ex: 1 fatia (80 g)"
                    className="w-full p-2.5 rounded-xl bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] text-[#3F4B46] dark:text-[#EDF2EF] placeholder-[#6F7C76]/60 dark:placeholder-[#A8B8B1]/60 focus:outline-none focus:border-[#6F7C76]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">Proteína (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newProtein}
                    onChange={(e) => setNewProtein(e.target.value)}
                    placeholder="0"
                    className="w-full p-2 rounded-xl bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] text-[#4A90E2] font-bold focus:outline-none focus:border-[#4A90E2]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">Carboidrato (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newCarbs}
                    onChange={(e) => setNewCarbs(e.target.value)}
                    placeholder="0"
                    className="w-full p-2 rounded-xl bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] text-[#9B51E0] font-bold focus:outline-none focus:border-[#9B51E0]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">Gordura (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFat}
                    onChange={(e) => setNewFat(e.target.value)}
                    placeholder="0"
                    className="w-full p-2 rounded-xl bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] text-[#E5A93C] font-bold focus:outline-none focus:border-[#E5A93C]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 text-white font-bold py-3.5 rounded-full shadow-sm transition-all active:scale-98"
                style={{ backgroundColor: activeColor.primary }}
              >
                Salvar Alimento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

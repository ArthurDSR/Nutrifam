import React, { useState, useMemo } from 'react';
import { Search, Plus, Check, Loader2, Sparkles, X, Wand2, Database } from 'lucide-react';
import { FoodItem } from '../../types';
import { useTranslation } from '../../services/i18n';
import { useTheme } from '../../services/themeService';
import {
  searchLocalBrazilianFoods,
  getPopularFoodsByCategory,
  classifyFoodCategory,
  normalizeSearchString,
  estimateFoodWithAI,
  FoodCategoryKey,
  OnlineFoodItem
} from '../../services/foodApiService';

interface FoodSearchViewProps {
  foods: FoodItem[];
  onAddFood: (food: FoodItem) => void;
  onSelectProductForDetails?: (food: FoodItem) => void;
  aiProvider?: 'gemini' | 'openai' | 'openrouter';
  geminiApiKey?: string;
  geminiModel?: string;
  openaiApiKey?: string;
  openaiModel?: string;
  openrouterApiKey?: string;
  openrouterModel?: string;
}

const CATEGORIES: { key: FoodCategoryKey; label: string; icon: string }[] = [
  { key: 'all', label: 'Todos', icon: '🔥' },
  { key: 'protein', label: 'Proteínas', icon: '🥩' },
  { key: 'carb', label: 'Carbos & Grãos', icon: '🍚' },
  { key: 'fruit_veg', label: 'Frutas & Saladas', icon: '🍎' },
  { key: 'dairy_drink', label: 'Laticínios & Bebidas', icon: '🥛' },
  { key: 'snack_treat', label: 'Lanches & Doces', icon: '🥪' },
];

export const FoodSearchView: React.FC<FoodSearchViewProps> = ({
  foods,
  onAddFood,
  onSelectProductForDetails,
  aiProvider = 'openrouter',
  geminiApiKey,
  geminiModel,
  openaiApiKey,
  openaiModel,
  openrouterApiKey,
  openrouterModel
}) => {
  const { t } = useTranslation();
  const { activeColor } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategoryKey>('all');
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [aiEstimatedItems, setAiEstimatedItems] = useState<OnlineFoodItem[]>([]);
  const [isEstimatingAi, setIsEstimatingAi] = useState(false);

  // Instant local results (Custom Foods + Brazilian Brands + TACO)
  const localResults = useMemo(() => {
    const norm = normalizeSearchString(query);

    // When query is empty or 1 letter: return popular categorized foods + custom foods
    if (!norm || norm.length < 2) {
      const popular = getPopularFoodsByCategory(selectedCategory);
      
      const filteredCustom = foods.filter((f) => {
        if (selectedCategory === 'all') return true;
        return classifyFoodCategory(f) === selectedCategory;
      });

      const customKeys = new Set(
        filteredCustom.map((c) => normalizeSearchString(`${c.name} ${c.brand || ''}`))
      );

      return [
        ...filteredCustom,
        ...popular.filter(
          (p) => !customKeys.has(normalizeSearchString(`${p.name} ${p.brand || ''}`))
        )
      ];
    }

    const queryTokens = norm.split(' ').filter(Boolean);

    // 1. Filter user's custom foods
    const filteredCustom = foods.filter((f) => {
      if (selectedCategory !== 'all' && classifyFoodCategory(f) !== selectedCategory) {
        return false;
      }
      const text = normalizeSearchString(`${f.name} ${f.brand || ''}`);
      return queryTokens.every((tok) => text.includes(tok));
    });

    // 2. Instant search in Brazilian Brands & TACO staples with category filter
    const brazilianAndTaco = searchLocalBrazilianFoods(query, selectedCategory);

    // Merge custom with verified Brazilian items avoiding duplicates
    const customKeys = new Set(
      filteredCustom.map((c) => normalizeSearchString(`${c.name} ${c.brand || ''}`))
    );

    const merged = [
      ...filteredCustom,
      ...brazilianAndTaco.filter(
        (b) => !customKeys.has(normalizeSearchString(`${b.name} ${b.brand || ''}`))
      )
    ];

    return merged;
  }, [query, selectedCategory, foods]);

  // 1-Tap AI Nutrition Estimation
  const handleEstimateWithAi = async () => {
    const trimmed = query.trim();
    if (!trimmed || isEstimatingAi) return;

    setIsEstimatingAi(true);
    try {
      const estimated = await estimateFoodWithAI(
        trimmed,
        aiProvider,
        geminiApiKey,
        openaiApiKey,
        openaiModel,
        openrouterApiKey,
        openrouterModel,
        geminiModel
      );

      if (estimated) {
        setAiEstimatedItems((prev) => [estimated, ...prev]);
        if (onSelectProductForDetails) {
          onSelectProductForDetails(estimated);
        }
      }
    } catch (err) {
      console.error('Failed to estimate food with AI:', err);
    } finally {
      setIsEstimatingAi(false);
    }
  };

  const handleAdd = (food: FoodItem, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddFood(food);
    setRecentlyAddedId(food.id);
    setTimeout(() => {
      setRecentlyAddedId(null);
    }, 900);
  };

  // AI estimates are explicit; catalog results always come from local data.
  const combinedResults: (FoodItem & {
    isOnlineResult?: boolean;
    isBrazilianBrand?: boolean;
    isTacoResult?: boolean;
    isAiResult?: boolean;
    imageUrl?: string;
  })[] = [...aiEstimatedItems, ...localResults];

  return (
    <div className="flex-1 min-h-0 h-full flex flex-col px-4 pt-3 pb-0 overflow-hidden">
      {/* Search Input */}
      <div className="relative mb-2 shrink-0">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[#6F7C76] dark:text-[#A8B8B1]">
          <Search className="w-4 h-4 stroke-[2.5]" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('food.searchPlaceholder') || 'Buscar alimento, marca, prato ou porção...'}
          className="w-full pl-10 pr-16 py-2.5 bg-white dark:bg-[#232D29] border border-[#AEBDB5]/40 dark:border-[#394842] rounded-full text-xs font-semibold text-[#3F4B46] dark:text-[#EDF2EF] placeholder-[#6F7C76]/70 dark:placeholder-[#A8B8B1]/60 focus:outline-none focus:border-[#5B8273] shadow-xs"
          autoFocus
        />
        <div className="absolute inset-y-0 right-3.5 flex items-center gap-1.5">
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF] p-0.5 rounded-full transition-colors"
              aria-label="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills (Quick Browsing & Filtering) */}
      <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1 mb-2 shrink-0 touch-pan-x">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'text-white shadow-xs'
                  : 'bg-[#ECEFE7] dark:bg-[#232D29] text-[#6F7C76] dark:text-[#A8B8B1] hover:bg-white dark:hover:bg-[#253933] border border-[#AEBDB5]/30 dark:border-[#394842]'
              }`}
              style={isSelected ? { backgroundColor: activeColor.primary } : undefined}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Status & Results Summary Bar */}
      <div className="flex items-center justify-between px-1 mb-2 text-[11px] text-[#6F7C76] dark:text-[#A8B8B1] font-medium shrink-0">
        <span className="flex items-center gap-1 text-[#3F4B46] dark:text-[#EDF2EF] font-semibold truncate pr-2">
          <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: activeColor.primary }} />
          <span className="truncate">
            {query.trim().length >= 2
              ? `${combinedResults.length} resultado(s) para "${query}"`
              : `${combinedResults.length} alimentos em ${CATEGORIES.find((c) => c.key === selectedCategory)?.label}`}
          </span>
        </span>
        <span className="flex items-center gap-1 text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] shrink-0">
          <Database className="w-3 h-3 shrink-0" style={{ color: activeColor.primary }} /> Catálogo local
        </span>
      </div>

      {/* AI Smart Estimator Quick Action Bar when user is searching */}
      {query.trim().length >= 3 && (
        <div className="mb-2 shrink-0">
          <button
            type="button"
            onClick={handleEstimateWithAi}
            disabled={isEstimatingAi}
            className="w-full py-2 px-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/30 hover:from-purple-100 dark:hover:from-purple-900/50 hover:to-indigo-100 border border-purple-200/80 dark:border-purple-800/40 rounded-xl text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center justify-between transition-all shadow-2xs active:scale-[0.99]"
          >
            <span className="flex items-center gap-2 truncate">
              {isEstimatingAi ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-600 dark:text-purple-400 shrink-0" />
              ) : (
                <Wand2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              )}
              <span className="truncate">
                {isEstimatingAi
                  ? 'Calculando nutrição com IA...'
                  : `Calcular "${query}" com IA`}
              </span>
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wide bg-purple-200/70 dark:bg-purple-900/60 text-purple-900 dark:text-purple-100 px-2 py-0.5 rounded-full shrink-0 ml-2">
              Estimar
            </span>
          </button>
        </div>
      )}

      {/* Foods List with Guaranteed Hardware Smooth Scroll */}
      <div
        className="flex-1 min-h-0 h-full overflow-y-auto overflow-x-hidden divide-y divide-slate-100/90 pb-28 touch-pan-y pr-1"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {combinedResults.length === 0 ? (
          <div className="text-center py-8 px-4 text-slate-400 text-xs">
              <div className="flex flex-col items-center justify-center gap-3">
                <p className="text-slate-500 font-medium">
                  Nenhum alimento pré-cadastrado encontrado para "{query}".
                </p>
                <button
                  type="button"
                  onClick={handleEstimateWithAi}
                  disabled={isEstimatingAi}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
                >
                  {isEstimatingAi ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>Calcular "{query}" com IA</span>
                </button>
              </div>
          </div>
        ) : (
          combinedResults.map((food) => {
            const isAdded = recentlyAddedId === food.id;
            const isTaco = food.isTacoResult || food.brand?.includes('TACO');
            const isBrBrand = food.isBrazilianBrand;
            const isAi = food.isAiResult || food.brand?.includes('IA');

            return (
              <div
                key={food.id}
                onClick={() => onSelectProductForDetails && onSelectProductForDetails(food)}
                className={`py-3 flex items-center justify-between hover:bg-white/80 dark:hover:bg-[#232D29]/80 px-2 rounded-xl transition-colors cursor-pointer ${
                  isAi ? 'bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/40 my-1' : ''
                }`}
              >
                {/* Optional locally catalogued product thumbnail */}
                {food.imageUrl && (
                  <img
                    src={food.imageUrl}
                    alt={food.name}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-[#18201D] border border-slate-200 dark:border-[#394842] shrink-0 mr-3"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}

                <div className="flex-1 pr-3 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-sm leading-tight capitalize truncate">
                      {food.name}
                    </h4>

                    {isAi ? (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800/40">
                        <Sparkles className="w-2.5 h-2.5" />
                        IA Nutricional
                      </span>
                    ) : isTaco ? (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                        🌱 TACO
                      </span>
                    ) : isBrBrand ? (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/40">
                        🇧🇷 {food.brand}
                      </span>
                    ) : null}
                  </div>

                  {food.brand && !isTaco && !isBrBrand && !isAi && (
                    <span className="text-[11px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] uppercase tracking-wide block mt-0.5 truncate">
                      {food.brand}
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 mt-1 text-xs text-[#6F7C76] dark:text-[#A8B8B1] font-medium flex-wrap">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: food.colorDot || activeColor.primary }}
                    />
                    <span className="font-bold text-[#3F4B46] dark:text-[#EDF2EF]">
                      {food.calories} Cal
                    </span>
                    <span>• {food.servingSize}</span>
                    {food.protein > 0 && (
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-bold">
                        • {food.protein}g prot
                      </span>
                    )}
                    {food.carbs > 0 && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                        • {food.carbs}g carb
                      </span>
                    )}
                    {food.fat > 0 && (
                      <span className="text-[10px] text-orange-600 dark:text-orange-400 font-mono">
                        • {food.fat}g gord
                      </span>
                    )}
                  </div>
                </div>

                {/* Circular '+' Button */}
                <button
                  type="button"
                  onClick={(e) => handleAdd(food, e)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-xs shrink-0 ${
                    isAdded
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white dark:bg-[#232D29] border-2 border-[#AEBDB5]/60 dark:border-[#394842] hover:bg-[#ECEFE7] dark:hover:bg-[#253933] text-[#3F4B46] dark:text-[#EDF2EF]'
                  }`}
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
    </div>
  );
};

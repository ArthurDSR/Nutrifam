import React, { useState } from 'react';
import {
  ArrowLeft,
  X,
  Star,
  Check,
  Sprout,
  ShieldCheck,
  Flame,
  Sparkles,
  Scale,
  Utensils
} from 'lucide-react';
import { FoodItem } from '../../types';
import { useTheme } from '../../services/themeService';

interface FoodDetailModalProps {
  food: FoodItem;
  mealTargetCalories?: number;
  onClose: () => void;
  onAddFood: (food: FoodItem, grams: number) => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  food,
  mealTargetCalories = 500,
  onClose,
  onAddFood
}) => {
  const { activeColor } = useTheme();
  const baseGrams = food.servingGrams || 100;
  
  // Extract unit name from food definition or string
  const servingUnit = food.servingUnitName || (
    food.servingSize.toLowerCase().includes('scoop') ? 'scoop' :
    food.servingSize.toLowerCase().includes('dosador') ? 'dosador' :
    food.servingSize.toLowerCase().includes('fatia') ? 'fatia' :
    food.servingSize.toLowerCase().includes('colher') ? 'colher de sopa' :
    food.servingSize.toLowerCase().includes('unidade') ? 'unidade' :
    food.servingSize.toLowerCase().includes('copo') ? 'copo' :
    food.servingSize.toLowerCase().includes('concha') ? 'concha' :
    food.servingSize.toLowerCase().includes('lata') ? 'lata' :
    food.servingSize.toLowerCase().includes('barra') ? 'barra' :
    food.servingSize.toLowerCase().includes('pote') ? 'pote' :
    'porção'
  );

  const [unitMode, setUnitMode] = useState<'portion' | 'grams'>('portion');
  const [portions, setPortions] = useState(1);
  const [grams, setGrams] = useState(baseGrams);
  const [activeTab, setActiveTab] = useState<'nutrition' | 'processing'>('nutrition');
  const [isFavorite, setIsFavorite] = useState(Boolean(food.isFavorite));
  const [isAdded, setIsAdded] = useState(false);

  // Calculate effective grams based on current unit mode
  const effectiveGrams = unitMode === 'portion' ? Math.round(portions * baseGrams) : grams;

  // Scale multiplier based on effective grams
  const multiplier = Math.max(0.05, effectiveGrams / baseGrams);

  const cal = Math.round(food.calories * multiplier);
  const prot = Number((food.protein * multiplier).toFixed(1));
  const carb = Number((food.carbs * multiplier).toFixed(1));
  const fat = Number((food.fat * multiplier).toFixed(1));
  const fib = Number((food.fiber * multiplier).toFixed(1));

  // Remaining calories for meal
  const calLeft = Math.max(0, mealTargetCalories - cal);

  // Micronutrients (scaled)
  const satFat = Number((fat * 0.3).toFixed(1));
  const monoFat = Number((fat * 0.4).toFixed(1));
  const polyFat = Number((fat * 0.3).toFixed(1));
  const sugar = Number((carb * 0.1).toFixed(1));
  const sodium = Number((35 * multiplier).toFixed(0));

  // Determine NOVA group & processing metrics
  const novaGroup: 1 | 2 | 3 | 4 = food.novaGroup || (
    food.calories > 350 && fat > 15 ? 4 :
    food.fiber >= 2 || prot > 10 ? 1 : 2
  );

  const healthScore = food.healthScore || (
    novaGroup === 1 ? 92 :
    novaGroup === 2 ? 80 :
    novaGroup === 3 ? 65 : 38
  );

  const preservativesCount = food.preservativesCount ?? (
    novaGroup === 4 ? 3 : novaGroup === 3 ? 1 : 0
  );

  const additives = food.additives || (
    novaGroup === 4
      ? ['Emulsificante INS 471', 'Aromatizante sintético idêntico ao natural', 'Conservador Sorbato de Potássio (INS 202)']
      : novaGroup === 3
      ? ['Antioxidante Ácido Cítrico (INS 330)']
      : ['Livre de aditivos artificiais e conservantes químicos']
  );

  const healthyAlternative = food.healthyAlternative || (
    novaGroup === 4
      ? 'Considere substituir por uma opção in natura rica em fibras e sem açúcares adicionados.'
      : undefined
  );

  const quickPortionPresets = [0.5, 1, 1.5, 2, 3];
  const quickGramsPresets = [50, 100, 150, 200];

  const handleUnitModeToggle = (mode: 'portion' | 'grams') => {
    if (mode === 'grams') {
      setGrams(Math.round(portions * baseGrams));
    } else {
      setPortions(Number((grams / baseGrams).toFixed(1)) || 1);
    }
    setUnitMode(mode);
  };

  const handleAdd = () => {
    const pluralSuffix = portions > 1 && !servingUnit.endsWith('s') && !servingUnit.includes(' ') ? 's' : '';
    const formattedServingSize =
      unitMode === 'portion'
        ? `${portions} ${servingUnit}${pluralSuffix} (${effectiveGrams} g)`
        : `${effectiveGrams} g`;

    onAddFood(
      {
        ...food,
        calories: cal,
        protein: prot,
        carbs: carb,
        fat: fat,
        fiber: fib,
        servingSize: formattedServingSize,
        servingGrams: effectiveGrams,
        servingUnitName: servingUnit,
        novaGroup,
        healthScore,
        preservativesCount
      },
      effectiveGrams
    );
    setIsAdded(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-center items-stretch sm:items-center animate-in fade-in duration-150">
      <div className="w-full max-w-md h-full sm:h-[94vh] sm:max-h-[850px] sm:rounded-[32px] bg-white dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] flex flex-col overflow-hidden shadow-cozy relative transition-colors">
        {/* Top Hero Image */}
        <div className="relative h-52 bg-[#18201D] shrink-0 select-none">
          <img
            src={
              food.imageUrl ||
              'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80'
            }
            alt={food.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

          {/* Floating Controls */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/90 dark:bg-[#232D29]/90 hover:bg-white dark:hover:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF] flex items-center justify-center shadow-xs transition-transform active:scale-95 border border-[#AEBDB5]/30 dark:border-[#394842]"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="w-10 h-10 rounded-full bg-white/90 dark:bg-[#232D29]/90 hover:bg-white dark:hover:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF] flex items-center justify-center shadow-xs transition-transform active:scale-95 border border-[#AEBDB5]/30 dark:border-[#394842]"
                aria-label="Favoritar"
              >
                <Star className={`w-5 h-5 ${isFavorite ? 'fill-amber-400 text-amber-500' : 'text-[#6F7C76] dark:text-[#A8B8B1]'}`} />
              </button>

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/90 dark:bg-[#232D29]/90 hover:bg-white dark:hover:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF] flex items-center justify-center shadow-xs transition-transform active:scale-95 border border-[#AEBDB5]/30 dark:border-[#394842]"
                aria-label="Fechar"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Title & Brand Over Image */}
          <div className="absolute bottom-3 left-5 right-5 text-white drop-shadow-md">
            <h1 className="text-xl font-bold capitalize leading-tight text-white">
              {food.name}
            </h1>
            <p className="text-xs font-semibold text-white/90 uppercase tracking-wider mt-0.5">
              {food.brand || 'Alimento Verificado'} • Padrão: {food.servingSize || `${baseGrams}g`}
            </p>
          </div>
        </div>

        {/* Scrollable Center Body */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-[#232D29] px-5 pt-3 pb-28 select-none transition-colors">
          {/* Summary Badges Bar: Calories + Health Score + NOVA Group */}
          <div className="flex items-center justify-between gap-2 py-2 border-b border-[#AEBDB5]/20 dark:border-[#394842]">
            <div className="flex items-center gap-1.5 font-bold text-xl text-[#3F4B46] dark:text-[#EDF2EF]">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
              <span>{cal} kcal</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Health Score Pill */}
              <div
                className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-2xs ${
                  healthScore >= 75
                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                    : healthScore >= 50
                    ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                    : 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40'
                }`}
              >
                <span>Nota: {healthScore}/100</span>
              </div>

              {/* NOVA Badge */}
              <div
                className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-2xs ${
                  novaGroup === 1
                    ? 'bg-emerald-600 text-white'
                    : novaGroup === 2
                    ? 'bg-sky-600 text-white'
                    : novaGroup === 3
                    ? 'bg-amber-500 text-white'
                    : 'bg-rose-600 text-white'
                }`}
                title={`Classificação NOVA Grupo ${novaGroup}`}
              >
                <span>NOVA {novaGroup}</span>
              </div>
            </div>
          </div>

          {/* DUAL UNIT SELECTOR CARD: Porção do Fabricante vs Gramas */}
          <div className="mt-3 bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-2xl p-3.5 transition-colors">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-[#ECEFE7] dark:bg-[#2B3732] p-1 rounded-xl mb-3 border border-[#AEBDB5]/20 dark:border-[#394842]">
              <button
                type="button"
                onClick={() => handleUnitModeToggle('portion')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  unitMode === 'portion'
                    ? 'bg-white dark:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF] shadow-xs'
                    : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" style={{ color: activeColor.primary }} />
                <span>Porção ({servingUnit})</span>
              </button>

              <button
                type="button"
                onClick={() => handleUnitModeToggle('grams')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  unitMode === 'grams'
                    ? 'bg-white dark:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF] shadow-xs'
                    : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]'
                }`}
              >
                <Scale className="w-3.5 h-3.5" style={{ color: activeColor.primary }} />
                <span>Gramas (g)</span>
              </button>
            </div>

            {/* Stepper & Input based on Mode */}
            {unitMode === 'portion' ? (
              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF]">
                  <span>Quantidade de {servingUnit}s:</span>
                  <span className="text-[#6F7C76] dark:text-[#A8B8B1] text-[11px] font-semibold">
                    1 {servingUnit} = {baseGrams}g
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPortions((prev) => Math.max(0.25, Number((prev - 0.5).toFixed(2))))}
                    className="w-11 h-11 rounded-xl bg-white dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] text-[#3F4B46] dark:text-[#EDF2EF] font-bold text-xl flex items-center justify-center active:scale-95 shadow-2xs"
                  >
                    -
                  </button>

                  <div className="flex-1 bg-white dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-xl px-3 py-1.5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="flex items-baseline gap-1">
                      <input
                        type="number"
                        step="0.25"
                        min={0.25}
                        max={50}
                        value={portions}
                        onChange={(e) => setPortions(Math.max(0.1, parseFloat(e.target.value) || 0))}
                        className="w-16 text-center text-xl font-bold text-[#3F4B46] dark:text-[#EDF2EF] focus:outline-none bg-transparent"
                      />
                      <span className="font-bold text-[#6F7C76] dark:text-[#A8B8B1] text-sm">{servingUnit}{portions > 1 && !servingUnit.endsWith('s') && !servingUnit.includes(' ') ? 's' : ''}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#6F7C76] dark:text-[#A8B8B1]">
                      = {effectiveGrams} gramas no total
                    </span>
                  </div>

                  <button
                    onClick={() => setPortions((prev) => Number((prev + 0.5).toFixed(2)))}
                    className="w-11 h-11 rounded-xl bg-white dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] text-[#3F4B46] dark:text-[#EDF2EF] font-bold text-xl flex items-center justify-center active:scale-95 shadow-2xs"
                  >
                    +
                  </button>
                </div>

                {/* Quick Portions Presets */}
                <div className="flex items-center gap-1.5 mt-2.5">
                  {quickPortionPresets.map((pr) => (
                    <button
                      key={pr}
                      type="button"
                      onClick={() => setPortions(pr)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        portions === pr
                          ? 'text-white shadow-xs'
                          : 'bg-white dark:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF] border border-[#AEBDB5]/30 dark:border-[#394842]'
                      }`}
                      style={{
                        backgroundColor: portions === pr ? activeColor.primary : undefined
                      }}
                    >
                      {pr}x
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF]">
                  <span>Peso em Gramas (g):</span>
                  <span className="text-[#6F7C76] dark:text-[#A8B8B1] text-[11px] font-semibold">
                    ≈ {(effectiveGrams / baseGrams).toFixed(1)} {servingUnit}s
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGrams((prev) => Math.max(5, prev - 25))}
                    className="w-11 h-11 rounded-xl bg-white dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] text-[#3F4B46] dark:text-[#EDF2EF] font-bold text-xl flex items-center justify-center active:scale-95 shadow-2xs"
                  >
                    -
                  </button>

                  <div className="flex-1 bg-white dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-xl px-3 py-1.5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="flex items-baseline gap-1">
                      <input
                        type="number"
                        min={1}
                        max={3000}
                        value={grams}
                        onChange={(e) => setGrams(Math.max(1, parseInt(e.target.value, 10) || 0))}
                        className="w-20 text-center text-xl font-bold text-[#3F4B46] dark:text-[#EDF2EF] focus:outline-none bg-transparent"
                      />
                      <span className="font-bold text-[#6F7C76] dark:text-[#A8B8B1] text-sm">gramas</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#6F7C76] dark:text-[#A8B8B1]">
                      ≈ {(grams / baseGrams).toFixed(1)} {servingUnit}
                    </span>
                  </div>

                  <button
                    onClick={() => setGrams((prev) => prev + 25)}
                    className="w-11 h-11 rounded-xl bg-white dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] text-[#3F4B46] dark:text-[#EDF2EF] font-bold text-xl flex items-center justify-center active:scale-95 shadow-2xs"
                  >
                    +
                  </button>
                </div>

                {/* Quick Grams Presets */}
                <div className="flex items-center gap-1.5 mt-2.5">
                  {quickGramsPresets.map((pr) => (
                    <button
                      key={pr}
                      type="button"
                      onClick={() => setGrams(pr)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        grams === pr
                          ? 'text-white shadow-xs'
                          : 'bg-white dark:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF] border border-[#AEBDB5]/30 dark:border-[#394842]'
                      }`}
                      style={{
                        backgroundColor: grams === pr ? activeColor.primary : undefined
                      }}
                    >
                      {pr}g
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setGrams(baseGrams)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      grams === baseGrams
                        ? 'text-white shadow-xs'
                        : 'bg-white dark:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF] border border-[#AEBDB5]/30 dark:border-[#394842]'
                    }`}
                    style={{
                      backgroundColor: grams === baseGrams ? activeColor.primary : undefined
                    }}
                  >
                    Padrão ({baseGrams}g)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Unified 2 Subtabs */}
          <div className="flex border-b border-[#AEBDB5]/20 dark:border-[#394842] mt-4 mb-3 text-xs font-bold">
            <button
              onClick={() => setActiveTab('nutrition')}
              className={`pb-2.5 px-4 flex items-center gap-1.5 transition-colors relative flex-1 justify-center ${
                activeTab === 'nutrition'
                  ? 'border-b-2 font-bold'
                  : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]'
              }`}
              style={{
                borderColor: activeTab === 'nutrition' ? activeColor.primary : 'transparent',
                color: activeTab === 'nutrition' ? activeColor.primary : undefined
              }}
            >
              <Sprout className="w-4 h-4" />
              <span>Nutrição & Macros</span>
            </button>

            <button
              onClick={() => setActiveTab('processing')}
              className={`pb-2.5 px-4 flex items-center gap-1.5 transition-colors relative flex-1 justify-center ${
                activeTab === 'processing'
                  ? 'border-b-2 font-bold'
                  : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]'
              }`}
              style={{
                borderColor: activeTab === 'processing' ? activeColor.primary : 'transparent',
                color: activeTab === 'processing' ? activeColor.primary : undefined
              }}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Processamento (NOVA)</span>
            </button>
          </div>

          {/* TAB 1: Nutrição & Micronutrientes */}
          {activeTab === 'nutrition' && (
            <div className="space-y-4">
              {/* Macros Summary Grid */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 rounded-2xl">
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block">Proteína</span>
                  <span className="text-base font-bold text-[#3F4B46] dark:text-[#EDF2EF]">{prot}g</span>
                </div>
                <div className="p-2.5 bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-900/40 rounded-2xl">
                  <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 block">Carboidrato</span>
                  <span className="text-base font-bold text-[#3F4B46] dark:text-[#EDF2EF]">{carb}g</span>
                </div>
                <div className="p-2.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl">
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">Gordura</span>
                  <span className="text-base font-bold text-[#3F4B46] dark:text-[#EDF2EF]">{fat}g</span>
                </div>
                <div className="p-2.5 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 rounded-2xl">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">Fibras</span>
                  <span className="text-base font-bold text-[#3F4B46] dark:text-[#EDF2EF]">{fib}g</span>
                </div>
              </div>

              {/* Calories Target Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] mb-1">
                  <span>Calorias da Refeição</span>
                  <span>{cal} / {mealTargetCalories} kcal</span>
                </div>
                <div className="h-2 bg-[#ECEFE7] dark:bg-[#18201D] rounded-full overflow-hidden border border-[#AEBDB5]/30 dark:border-[#394842]">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: activeColor.primary,
                      width: `${Math.min(100, (cal / mealTargetCalories) * 100)}%`
                    }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-[#6F7C76] dark:text-[#A8B8B1] block text-right mt-0.5">
                  {calLeft} kcal restantes nesta refeição
                </span>
              </div>

              {/* Sub-nutrients Breakdown */}
              <div className="bg-[#F7F4EE] dark:bg-[#18201D] rounded-2xl p-3.5 border border-[#AEBDB5]/30 dark:border-[#394842] space-y-2 text-xs">
                <h4 className="font-bold text-[#3F4B46] dark:text-[#EDF2EF]">Detalhamento Nutricional ({effectiveGrams}g)</h4>
                <div className="flex justify-between py-1 border-b border-[#AEBDB5]/20 dark:border-[#394842] text-[#6F7C76] dark:text-[#A8B8B1]">
                  <span>Gorduras Saturadas</span>
                  <span className="font-bold text-[#3F4B46] dark:text-[#EDF2EF]">{satFat}g</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#AEBDB5]/20 dark:border-[#394842] text-[#6F7C76] dark:text-[#A8B8B1]">
                  <span>Gorduras Monoinsaturadas</span>
                  <span className="font-bold text-[#3F4B46] dark:text-[#EDF2EF]">{monoFat}g</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#AEBDB5]/20 dark:border-[#394842] text-[#6F7C76] dark:text-[#A8B8B1]">
                  <span>Gorduras Poli-insaturadas</span>
                  <span className="font-bold text-[#3F4B46] dark:text-[#EDF2EF]">{polyFat}g</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#AEBDB5]/20 dark:border-[#394842] text-[#6F7C76] dark:text-[#A8B8B1]">
                  <span>Açúcares</span>
                  <span className="font-bold text-[#3F4B46] dark:text-[#EDF2EF]">{sugar}g</span>
                </div>
                <div className="flex justify-between py-1 text-[#6F7C76] dark:text-[#A8B8B1]">
                  <span>Sódio Estimado</span>
                  <span className="font-bold text-[#3F4B46] dark:text-[#EDF2EF]">{sodium}mg</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Qualidade & Processamento (NOVA) */}
          {activeTab === 'processing' && (
            <div className="space-y-3.5">
              {/* NOVA Official Classification Card */}
              <div className="p-4 rounded-2xl border border-[#AEBDB5]/30 dark:border-[#394842] bg-[#F7F4EE] dark:bg-[#18201D]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">
                    {novaGroup === 1 ? '🌿' : novaGroup === 2 ? '🧂' : novaGroup === 3 ? '🥫' : '🏭'}
                  </span>
                  <div>
                    <h4 className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-sm leading-tight">
                      {novaGroup === 1 && 'Grupo 1: Alimento In Natura'}
                      {novaGroup === 2 && 'Grupo 2: Ingrediente Culinário'}
                      {novaGroup === 3 && 'Grupo 3: Alimento Processado'}
                      {novaGroup === 4 && 'Grupo 4: Alimento Ultraprocessado'}
                    </h4>
                    <span className="text-[11px] font-semibold text-[#6F7C76] dark:text-[#A8B8B1]">
                      Classificação Oficial Ministério da Saúde / USP
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1] leading-relaxed mt-2">
                  {novaGroup === 1 &&
                    'Obtido diretamente de plantas ou animais sem alteração química. Rico em nutrientes integrais e livre de substâncias sintéticas.'}
                  {novaGroup === 2 &&
                    'Substâncias extraídas de alimentos in natura (como azeites, manteigas, sal) usadas no preparo culinário.'}
                  {novaGroup === 3 &&
                    'Fabricado pela indústria com a adição de sal, açúcar ou óleo para aumentar a durabilidade (ex: conservas simples, queijos).'}
                  {novaGroup === 4 &&
                    'Formulação industrial composta predominantemente por ingredientes refinados e aditivos químicos (corantes, emulsificantes, conservantes).'}
                </p>
              </div>

              {/* Preservatives & Additives Card */}
              <div className="p-4 rounded-2xl border border-[#AEBDB5]/30 dark:border-[#394842] bg-white dark:bg-[#232D29] shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Conservantes e Aditivos</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      preservativesCount === 0
                        ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {preservativesCount === 0 ? 'Livre de Conservantes' : `${preservativesCount} detectados`}
                  </span>
                </div>

                <div className="space-y-1.5 mt-2">
                  {additives.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs text-[#3F4B46] dark:text-[#EDF2EF] bg-[#F7F4EE] dark:bg-[#18201D] p-2 rounded-xl border border-[#AEBDB5]/20 dark:border-[#394842]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6F7C76] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Healthy Alternative Suggestion (if applicable) */}
              {healthyAlternative && (
                <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Dica de Substituição Saudável</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-200">
                    {healthyAlternative}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fixed Bottom Action: Add this food */}
        <div className="absolute bottom-0 inset-x-0 bg-white/95 dark:bg-[#232D29]/95 backdrop-blur-md p-4 border-t border-[#AEBDB5]/20 dark:border-[#394842] flex justify-center z-20">
          <button
            onClick={handleAdd}
            disabled={isAdded}
            className="w-full py-3.5 rounded-full font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all text-white active:scale-95"
            style={{
              backgroundColor: isAdded ? '#10b981' : activeColor.primary
            }}
          >
            {isAdded ? (
              <>
                <Check className="w-5 h-5 stroke-[3]" />
                <span>Adicionado à refeição!</span>
              </>
            ) : (
              <span>Adicionar Alimento ({cal} kcal)</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

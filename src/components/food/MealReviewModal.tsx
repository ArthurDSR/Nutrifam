import React, { useState } from 'react';
import {
  Star,
  ChevronUp,
  Trash2,
  Barcode,
  Search,
  Camera,
  Sparkles,
  Utensils,
  ShieldCheck,
  AlertTriangle,
  X
} from 'lucide-react';
import { Meal, MealType, LoggedFoodItem, AddFoodSubTab } from '../../types';
import { useTheme } from '../../services/themeService';

interface MealReviewModalProps {
  meal: Meal;
  onClose: () => void;
  onOpenAddTab: (subTab: AddFoodSubTab) => void;
  onRemoveItem: (mealType: MealType, loggedId: string) => void;
}

export const MealReviewModal: React.FC<MealReviewModalProps> = ({
  meal,
  onClose,
  onOpenAddTab,
  onRemoveItem
}) => {
  const { activeColor } = useTheme();
  const [isStarred, setIsStarred] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Compute meal macros
  const totalCal = Math.round(
    meal.items.reduce((acc, it) => acc + it.calories * it.servingsCount, 0)
  );
  const totalProt = Number(
    meal.items.reduce((acc, it) => acc + it.protein * it.servingsCount, 0).toFixed(1)
  );
  const totalCarb = Number(
    meal.items.reduce((acc, it) => acc + it.carbs * it.servingsCount, 0).toFixed(1)
  );
  const totalFat = Number(
    meal.items.reduce((acc, it) => acc + it.fat * it.servingsCount, 0).toFixed(1)
  );
  const totalFib = Number(
    meal.items.reduce((acc, it) => acc + it.fiber * it.servingsCount, 0).toFixed(1)
  );

  const calLeft = Math.max(0, meal.targetCalories - totalCal);
  const protTarget = 36;
  const carbTarget = 64;
  const fatTarget = 11;
  const fibTarget = 5;

  // Meal Processing Analysis (NOVA & Preservatives)
  const itemsCount = meal.items.length;
  let inNaturaCount = 0;
  let processedCount = 0;
  let ultraProcessedCount = 0;
  let totalHealthScore = 0;
  let totalAdditivesCount = 0;
  const identifiedAdditives: string[] = [];

  meal.items.forEach((it) => {
    const nova = it.novaGroup || (it.calories > 350 && it.fat > 15 ? 4 : it.fiber >= 2 || it.protein > 10 ? 1 : 2);
    const score = it.healthScore || (nova === 1 ? 92 : nova === 2 ? 80 : nova === 3 ? 65 : 38);
    const presCount = it.preservativesCount ?? (nova === 4 ? 3 : nova === 3 ? 1 : 0);

    if (nova === 1 || nova === 2) inNaturaCount++;
    else if (nova === 3) processedCount++;
    else if (nova === 4) ultraProcessedCount++;

    totalHealthScore += score;
    totalAdditivesCount += presCount;

    if (it.additives && it.additives.length > 0) {
      it.additives.forEach((add) => {
        if (!identifiedAdditives.includes(add) && add !== 'Livre de aditivos artificiais e conservantes químicos') {
          identifiedAdditives.push(add);
        }
      });
    }
  });

  const avgHealthScore = itemsCount > 0 ? Math.round(totalHealthScore / itemsCount) : 85;
  const inNaturaPercent = itemsCount > 0 ? Math.round((inNaturaCount / itemsCount) * 100) : 100;
  const ultraProcessedPercent = itemsCount > 0 ? Math.round((ultraProcessedCount / itemsCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex justify-center items-stretch sm:items-center animate-in fade-in duration-150">
      <div className="w-full max-w-md h-full sm:h-[94vh] sm:max-h-[850px] sm:rounded-[32px] bg-white dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] flex flex-col overflow-hidden shadow-cozy relative transition-colors">
        {/* Top action header */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between select-none shrink-0 border-b border-[#AEBDB5]/20 dark:border-[#394842]">
          <button
            onClick={() => onOpenAddTab('search')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F7F4EE] dark:bg-[#18201D] hover:bg-[#ECEFE7] dark:hover:bg-[#2B3732] text-[#3F4B46] dark:text-[#EDF2EF] text-xs font-bold transition-all active:scale-95 border border-[#AEBDB5]/30 dark:border-[#394842] shadow-2xs"
          >
            <ChevronUp className="w-4 h-4" />
            <span>Adicionar alimentos</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full text-white text-xs font-bold transition-all active:scale-95 shadow-xs"
              style={{ backgroundColor: activeColor.primary }}
            >
              Concluído
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#F7F4EE] dark:bg-[#18201D] hover:bg-[#ECEFE7] dark:hover:bg-[#2B3732] text-[#3F4B46] dark:text-[#EDF2EF] flex items-center justify-center transition-colors border border-[#AEBDB5]/30 dark:border-[#394842]"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 pt-2 pb-24 select-none">
          {/* Meal Title with Star */}
          <div className="text-center mt-1">
            <div className="inline-flex items-center gap-1.5">
              <h1 className="text-xl font-bold text-[#3F4B46] dark:text-[#EDF2EF]">
                {meal.title}
              </h1>
              <button onClick={() => setIsStarred(!isStarred)}>
                <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400 text-amber-500' : 'text-[#6F7C76] dark:text-[#A8B8B1]'}`} />
              </button>
            </div>

            <p className="text-xs font-bold text-[#6F7C76] dark:text-[#A8B8B1] mt-0.5">
              {totalCal} / {meal.targetCalories} kcal ({calLeft} kcal restantes)
            </p>

            <div className="w-48 h-2 bg-[#ECEFE7] dark:bg-[#18201D] rounded-full mx-auto mt-2 overflow-hidden border border-[#AEBDB5]/30 dark:border-[#394842]">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  backgroundColor: activeColor.primary,
                  width: `${Math.min(100, (totalCal / (meal.targetCalories || 1)) * 100)}%`
                }}
              />
            </div>
          </div>

          {/* 4 Macro Rings */}
          <div className="grid grid-cols-4 gap-2 mt-5 text-center">
            {/* Fat ring */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-4 border-amber-300 dark:border-amber-500/40 flex flex-col items-center justify-center bg-white dark:bg-[#232D29] shadow-xs">
                <span className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] leading-none">{Math.round(totalFat)}</span>
                <span className="text-[9px] font-bold text-[#6F7C76] dark:text-[#A8B8B1]">/{fatTarget}g</span>
              </div>
              <span className="text-xs font-bold text-[#6F7C76] dark:text-[#A8B8B1] mt-1.5">Gordura</span>
            </div>

            {/* Protein ring */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-4 border-rose-300 dark:border-rose-500/40 flex flex-col items-center justify-center bg-white dark:bg-[#232D29] shadow-xs">
                <span className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] leading-none">{Math.round(totalProt)}</span>
                <span className="text-[9px] font-bold text-[#6F7C76] dark:text-[#A8B8B1]">/{protTarget}g</span>
              </div>
              <span className="text-xs font-bold text-[#6F7C76] dark:text-[#A8B8B1] mt-1.5">Proteína</span>
            </div>

            {/* Carbs ring */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-4 border-sky-300 dark:border-sky-500/40 flex flex-col items-center justify-center bg-white dark:bg-[#232D29] shadow-xs">
                <span className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] leading-none">{Math.round(totalCarb)}</span>
                <span className="text-[9px] font-bold text-[#6F7C76] dark:text-[#A8B8B1]">/{carbTarget}g</span>
              </div>
              <span className="text-xs font-bold text-[#6F7C76] dark:text-[#A8B8B1] mt-1.5">Carbos</span>
            </div>

            {/* Fiber ring */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-4 border-emerald-400 dark:border-emerald-500/40 flex flex-col items-center justify-center bg-white dark:bg-[#232D29] shadow-xs">
                <span className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] leading-none">{Math.round(totalFib)}</span>
                <span className="text-[9px] font-bold text-[#6F7C76] dark:text-[#A8B8B1]">/{fibTarget}g</span>
              </div>
              <span className="text-xs font-bold text-[#6F7C76] dark:text-[#A8B8B1] mt-1.5">Fibras</span>
            </div>
          </div>

          {/* Grau de Processamento & Qualidade dos Alimentos (NOVA) */}
          {meal.items.length > 0 && (
            <div className="mt-5 p-4 rounded-2xl bg-[#ECEFE7] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] shadow-2xs transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-xs">
                  <ShieldCheck className="w-4 h-4" style={{ color: activeColor.primary }} />
                  <span>Grau de Processamento dos Alimentos</span>
                </div>
                <span
                  className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] text-[#3F4B46] dark:text-[#EDF2EF]"
                >
                  Índice de Qualidade: {avgHealthScore}/100
                </span>
              </div>

              {/* Distribution Bar */}
              <div className="space-y-1 mt-2">
                <div className="flex justify-between text-[11px] font-bold text-[#6F7C76] dark:text-[#A8B8B1]">
                  <span>In Natura / Minimamente: {inNaturaPercent}%</span>
                  <span>Ultraprocessado: {ultraProcessedPercent}%</span>
                </div>
                <div className="h-2.5 w-full bg-white dark:bg-[#232D29] rounded-full overflow-hidden flex border border-[#AEBDB5]/30 dark:border-[#394842]">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${inNaturaPercent}%` }}
                    title={`In Natura: ${inNaturaPercent}%`}
                  />
                  <div
                    className="h-full bg-rose-400 transition-all duration-300"
                    style={{ width: `${ultraProcessedPercent}%` }}
                    title={`Ultraprocessado: ${ultraProcessedPercent}%`}
                  />
                </div>
              </div>

              {/* Additives Summary */}
              <div className="mt-2.5 pt-2 border-t border-[#AEBDB5]/20 dark:border-[#394842] flex items-center justify-between text-[11px]">
                <span className="text-[#6F7C76] dark:text-[#A8B8B1] font-semibold">Conservantes e Aditivos:</span>
                <span
                  className={`font-bold ${
                    totalAdditivesCount === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {totalAdditivesCount === 0 ? '0 (Refeição Natural e Limpa)' : `${totalAdditivesCount} aditivo(s) detectado(s)`}
                </span>
              </div>
            </div>
          )}

          {/* Logged Foods List */}
          <div className="mt-5 divide-y divide-[#AEBDB5]/20 dark:divide-[#394842] border-t border-b border-[#AEBDB5]/20 dark:border-[#394842]">
            {meal.items.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#6F7C76] dark:text-[#A8B8B1]">
                Nenhum alimento adicionado nesta refeição ainda.
              </div>
            ) : (
              meal.items.map((it: LoggedFoodItem) => {
                const nova = it.novaGroup || (it.calories > 350 && it.fat > 15 ? 4 : it.fiber >= 2 || it.protein > 10 ? 1 : 2);
                const score = it.healthScore || (nova === 1 ? 92 : nova === 2 ? 80 : nova === 3 ? 65 : 38);
                const pres = it.preservativesCount ?? (nova === 4 ? 3 : nova === 3 ? 1 : 0);

                return (
                  <div key={it.loggedId} className="py-3 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-sm capitalize truncate">
                          {it.name}
                        </h4>
                        {/* NOVA Badge */}
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                            nova === 1
                              ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                              : nova === 2
                              ? 'bg-sky-100 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300'
                              : nova === 3
                              ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          NOVA {nova}
                        </span>
                        <span className="text-[9px] font-bold text-[#6F7C76] dark:text-[#A8B8B1]">
                          {score}/100
                        </span>
                      </div>

                      {it.brand && (
                        <span className="text-[10px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] uppercase tracking-wide block truncate mt-0.5">
                          {it.brand}
                        </span>
                      )}

                      <div className="flex items-center gap-2 text-xs text-[#6F7C76] dark:text-[#A8B8B1] mt-1 font-medium flex-wrap">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: it.colorDot || activeColor.primary }}
                        />
                        <span>
                          {Math.round(it.calories * it.servingsCount)} kcal • {it.servingSize}
                        </span>
                        <span className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1]">
                          {pres === 0 ? '🛡️ Sem conservantes' : `⚠️ ${pres} conservantes`}
                        </span>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => onRemoveItem(meal.type, it.loggedId)}
                      className="bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/40 p-2 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[9px] font-bold shadow-2xs active:scale-95 transition-all shrink-0"
                      title="Excluir item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* "Rating of your meal" card */}
          {meal.items.length > 0 && (
            <div className="mt-6 bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-3xl p-5 flex items-center justify-between shadow-2xs transition-colors">
              <div className="flex-1 pr-2">
                <h3 className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-base leading-tight">
                  Classificação da Refeição
                </h3>
                <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1] mt-1 leading-snug">
                  {ultraProcessedPercent > 30
                    ? 'Esta refeição contém itens ultraprocessados. Veja dicas de melhoria!'
                    : 'Excelente composição rica em nutrientes naturais e baixa em conservantes!'}
                </p>
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="mt-3 px-5 py-2 rounded-full text-white text-xs font-bold transition-all active:scale-95 shadow-xs"
                  style={{ backgroundColor: activeColor.primary }}
                >
                  Ver Análise Completa
                </button>
              </div>

              {/* Cute salad illustration */}
              <div className="relative w-24 h-20 shrink-0 flex items-center justify-center">
                <div className="text-4xl absolute -top-1 left-2">🥗</div>
                <div className="text-xl absolute top-0 right-1 animate-bounce duration-1000">😃</div>
                <div className="text-base absolute bottom-1 left-0">✨</div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom 5 subtabs bar */}
        <div className="absolute bottom-0 inset-x-0 bg-white dark:bg-[#232D29] border-t border-[#AEBDB5]/30 dark:border-[#394842] px-3 py-2 flex items-center justify-between shadow-cozy select-none z-30 transition-colors">
          <button
            onClick={() => onOpenAddTab('barcode')}
            className="flex flex-col items-center gap-1 flex-1 py-1 text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF] text-[10px] font-bold"
          >
            <div className="w-10 h-8 rounded-xl bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] flex items-center justify-center">
              <Barcode className="w-4 h-4" />
            </div>
            <span>Código</span>
          </button>

          <button
            onClick={() => onOpenAddTab('search')}
            className="flex flex-col items-center gap-1 flex-1 py-1 text-[10px] font-bold"
            style={{ color: activeColor.primary }}
          >
            <div
              className="w-10 h-8 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: activeColor.bgTintLight,
                borderColor: activeColor.border,
                color: activeColor.primary
              }}
            >
              <Search className="w-4 h-4" />
            </div>
            <span>Busca</span>
          </button>

          <button
            onClick={() => onOpenAddTab('photo')}
            className="flex flex-col items-center gap-1 flex-1 py-1 text-[10px] font-bold transition-all active:scale-95"
            style={{ color: activeColor.primary }}
          >
            <div
              className="w-10 h-8 rounded-xl flex items-center justify-center border transition-all"
              style={{
                backgroundColor: activeColor.bgTintLight,
                borderColor: activeColor.border,
                color: activeColor.primary
              }}
            >
              <Camera className="w-4 h-4" />
            </div>
            <span>Foto</span>
          </button>

          <button
            onClick={() => onOpenAddTab('quick_add')}
            className="flex flex-col items-center gap-1 flex-1 py-1 text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF] text-[10px] font-bold"
          >
            <div className="w-10 h-8 rounded-xl bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>Rápido</span>
          </button>

          <button
            onClick={() => onOpenAddTab('my_foods')}
            className="flex flex-col items-center gap-1 flex-1 py-1 text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF] text-[10px] font-bold"
          >
            <div className="w-10 h-8 rounded-xl bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <span>Meus itens</span>
          </button>
        </div>

        {/* Detailed Rating and NOVA Explanation Modal */}
        {showRatingModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-[#232D29] max-w-sm w-full rounded-[32px] p-5 shadow-cozy border border-[#AEBDB5]/30 dark:border-[#394842] text-left space-y-3 relative max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-[#AEBDB5]/20 dark:border-[#394842]">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🥗</span>
                  <h3 className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-base">Relatório NOVA da Refeição</h3>
                </div>
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="w-8 h-8 rounded-full bg-[#F7F4EE] dark:bg-[#18201D] hover:bg-[#ECEFE7] dark:hover:bg-[#2B3732] text-[#3F4B46] dark:text-[#EDF2EF] flex items-center justify-center border border-[#AEBDB5]/30 dark:border-[#394842]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-[#ECEFE7] dark:bg-[#18201D] rounded-2xl border border-[#AEBDB5]/30 dark:border-[#394842]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#6F7C76] dark:text-[#A8B8B1]">Índice de Saudabilidade:</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{avgHealthScore} / 100</span>
                </div>
                <p className="text-[11px] text-[#6F7C76] dark:text-[#A8B8B1]">
                  {inNaturaPercent >= 70
                    ? 'Excelente! Mais de 70% dos alimentos desta refeição são in natura ou minimamente processados.'
                    : 'Atenção ao consumo frequente de itens ultraprocessados com aditivos e conservantes.'}
                </p>
              </div>

              {identifiedAdditives.length > 0 && (
                <div className="p-3 bg-rose-50/80 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/40">
                  <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300 mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Aditivos Identificados nos Ingredientes:</span>
                  </h4>
                  <ul className="text-[11px] text-rose-800 dark:text-rose-300 space-y-1 list-disc pl-4">
                    {identifiedAdditives.map((add, i) => (
                      <li key={i}>{add}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2 text-xs text-[#6F7C76] dark:text-[#A8B8B1]">
                <h4 className="font-bold text-[#3F4B46] dark:text-[#EDF2EF]">Recomendações Nutricionais:</h4>
                <p className="text-[11px] leading-relaxed">
                  • Priorize a base alimentar em alimentos in natura (arroz, feijão, ovos, carnes magras, verduras).
                </p>
                <p className="text-[11px] leading-relaxed">
                  • Evite refeições compostas unicamente por alimentos do Grupo 4 (ultraprocessados), que contêm emulsificantes e açúcares ocultos.
                </p>
              </div>

              <button
                onClick={() => setShowRatingModal(false)}
                className="w-full py-3 rounded-full text-white font-bold text-xs shadow-xs mt-2"
                style={{ backgroundColor: activeColor.primary }}
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

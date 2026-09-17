import React, { useState } from 'react';
import { ArrowLeft, Bookmark, Share2, ChevronDown, ChevronUp, Plus, Check } from 'lucide-react';
import { ProductEvaluation, FoodItem } from '../../types';
import { useTheme } from '../../services/themeService';

interface ProductDetailModalProps {
  product: ProductEvaluation;
  onClose: () => void;
  onAddFoodToMeal: (food: FoodItem) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddFoodToMeal
}) => {
  const { activeColor } = useTheme();
  const [activeSubTab, setActiveSubTab] = useState<'avaliacao' | 'match' | 'alternativas'>('avaliacao');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('nutrientes');
  const [isAdded, setIsAdded] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleAdd = () => {
    const foodItem: FoodItem = {
      id: 'prod_' + product.barcode + '_' + Date.now(),
      name: product.name,
      brand: product.brand,
      calories: product.nutrients.calories,
      servingSize: product.portion,
      servingGrams: 100,
      protein: product.nutrients.protein,
      carbs: Number((100 - product.nutrients.protein - product.nutrients.fat).toFixed(1)),
      fat: product.nutrients.fat,
      fiber: product.nutrients.fiber,
      colorDot: product.scoreColor === 'green' ? '#10b981' : product.scoreColor === 'yellow' ? '#f59e0b' : '#ef4444',
      barcode: product.barcode,
      imageUrl: product.imageUrl
    };
    onAddFoodToMeal(foodItem);
    setIsAdded(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F7F4EE] dark:bg-[#18201D] flex flex-col overflow-y-auto animate-in slide-in-from-bottom duration-200 transition-colors">
      {/* Top Image & Header */}
      <div className="relative h-64 bg-[#18201D] overflow-hidden shrink-0">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover opacity-85"
        />

        {/* Top Floating Buttons */}
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
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="w-10 h-10 rounded-full bg-white/90 dark:bg-[#232D29]/90 hover:bg-white dark:hover:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF] flex items-center justify-center shadow-xs transition-transform active:scale-95 border border-[#AEBDB5]/30 dark:border-[#394842]"
              aria-label="Favoritar"
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: product.name, text: `Confira ${product.name} no NutriFam` });
                }
              }}
              className="w-10 h-10 rounded-full bg-white/90 dark:bg-[#232D29]/90 hover:bg-white dark:hover:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF] flex items-center justify-center shadow-xs transition-transform active:scale-95 border border-[#AEBDB5]/30 dark:border-[#394842]"
              aria-label="Compartilhar"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Information Card */}
      <div className="flex-1 bg-white dark:bg-[#232D29] px-5 pt-5 pb-24 -mt-4 rounded-t-[32px] shadow-cozy border-t border-[#AEBDB5]/30 dark:border-[#394842] transition-colors">
        {/* Title and Brand */}
        <h1 className="text-xl font-bold text-[#3F4B46] dark:text-[#EDF2EF] leading-tight">
          {product.name}
        </h1>
        <p className="text-sm font-semibold text-[#6F7C76] dark:text-[#A8B8B1] mt-1">
          {product.brand} • {product.portion}
        </p>

        {/* Nutri-Score Badge */}
        <div className="mt-3">
          <span
            className={`inline-flex items-center justify-center w-12 h-9 rounded-xl font-bold text-white text-lg shadow-2xs ${
              product.overallScore >= 70
                ? 'bg-[#10b981]'
                : product.overallScore >= 50
                ? 'bg-[#f59e0b]'
                : product.overallScore >= 35
                ? 'bg-[#f97316]'
                : 'bg-[#ef4444]'
            }`}
          >
            {product.overallScore}
          </span>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#AEBDB5]/20 dark:border-[#394842] mt-5 mb-4 text-sm font-bold select-none">
          <button
            onClick={() => setActiveSubTab('avaliacao')}
            className={`pb-2.5 px-3 relative transition-colors ${
              activeSubTab === 'avaliacao'
                ? 'border-b-2 font-bold'
                : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]'
            }`}
            style={{
              borderColor: activeSubTab === 'avaliacao' ? activeColor.primary : 'transparent',
              color: activeSubTab === 'avaliacao' ? activeColor.primary : undefined
            }}
          >
            Avaliação
          </button>
          <button
            onClick={() => setActiveSubTab('match')}
            className={`pb-2.5 px-3 relative transition-colors ${
              activeSubTab === 'match'
                ? 'border-b-2 font-bold'
                : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]'
            }`}
            style={{
              borderColor: activeSubTab === 'match' ? activeColor.primary : 'transparent',
              color: activeSubTab === 'match' ? activeColor.primary : undefined
            }}
          >
            Match com você
          </button>
          <button
            onClick={() => setActiveSubTab('alternativas')}
            className={`pb-2.5 px-3 relative transition-colors ${
              activeSubTab === 'alternativas'
                ? 'border-b-2 font-bold'
                : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]'
            }`}
            style={{
              borderColor: activeSubTab === 'alternativas' ? activeColor.primary : 'transparent',
              color: activeSubTab === 'alternativas' ? activeColor.primary : undefined
            }}
          >
            Alternativas
          </button>
        </div>

        {/* Sub-tab 1: Avaliação */}
        {activeSubTab === 'avaliacao' && (
          <div className="space-y-3.5">
            {/* Card 1: PROCESSAMENTO */}
            <div className="bg-[#F7F4EE] dark:bg-[#18201D] rounded-2xl p-4 border border-[#AEBDB5]/30 dark:border-[#394842] transition-colors">
              <span className="text-[11px] font-bold tracking-wider text-[#3F4B46] dark:text-[#EDF2EF] uppercase block mb-2">
                PROCESSAMENTO
              </span>
              {/* Gradient Slider */}
              <div className="relative my-2">
                <div className="h-3 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 relative">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white dark:bg-[#232D29] border-[3px] border-[#3F4B46] dark:border-[#EDF2EF] shadow-md transform -translate-x-1/2 transition-all duration-500"
                    style={{ left: `${product.processing.score}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-[11px] font-medium text-[#6F7C76] dark:text-[#A8B8B1] mt-2">
                <span>Mais processado</span>
                <span>Menos processado</span>
              </div>

              {expandedSection === 'processamento' && (
                <div className="mt-3 pt-2 text-xs text-[#6F7C76] dark:text-[#A8B8B1] border-t border-[#AEBDB5]/20 dark:border-[#394842] leading-relaxed">
                  {product.processing.label}
                </div>
              )}

              <button
                onClick={() => toggleSection('processamento')}
                className="w-full flex items-center justify-center gap-1 text-[11px] font-bold text-[#6F7C76] hover:text-[#3F4B46] dark:text-[#A8B8B1] dark:hover:text-[#EDF2EF] mt-2 pt-1"
              >
                <span>Ver mais</span>
                {expandedSection === 'processamento' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Card 2: NUTRIENTES */}
            <div className="bg-[#F7F4EE] dark:bg-[#18201D] rounded-2xl p-4 border border-[#AEBDB5]/30 dark:border-[#394842] transition-colors">
              <span className="text-[11px] font-bold tracking-wider text-[#3F4B46] dark:text-[#EDF2EF] uppercase block mb-2">
                NUTRIENTES
              </span>
              {/* Gradient Slider */}
              <div className="relative my-2">
                <div className="h-3 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 relative">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white dark:bg-[#232D29] border-[3px] border-[#3F4B46] dark:border-[#EDF2EF] shadow-md transform -translate-x-1/2 transition-all duration-500"
                    style={{ left: `${product.nutrients.score}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-[11px] font-medium text-[#6F7C76] dark:text-[#A8B8B1] mt-2">
                <span>Menos equilibrado</span>
                <span>Mais equilibrado</span>
              </div>

              {expandedSection === 'nutrientes' && (
                <div className="mt-3 pt-2 text-xs text-[#6F7C76] dark:text-[#A8B8B1] border-t border-[#AEBDB5]/20 dark:border-[#394842] leading-relaxed space-y-1.5">
                  <p className="font-bold text-[#3F4B46] dark:text-[#EDF2EF]">{product.nutrients.label}</p>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div className="bg-white dark:bg-[#232D29] p-2 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842]">
                      Calorias: <strong className="text-[#3F4B46] dark:text-[#EDF2EF]">{product.nutrients.calories} kcal</strong>
                    </div>
                    <div className="bg-white dark:bg-[#232D29] p-2 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842]">
                      Gorduras: <strong className="text-[#3F4B46] dark:text-[#EDF2EF]">{product.nutrients.fat}g</strong>
                    </div>
                    <div className="bg-white dark:bg-[#232D29] p-2 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842]">
                      Proteínas: <strong className="text-[#3F4B46] dark:text-[#EDF2EF]">{product.nutrients.protein}g</strong>
                    </div>
                    <div className="bg-white dark:bg-[#232D29] p-2 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842]">
                      Fibras: <strong className="text-[#3F4B46] dark:text-[#EDF2EF]">{product.nutrients.fiber}g</strong>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => toggleSection('nutrientes')}
                className="w-full flex items-center justify-center gap-1 text-[11px] font-bold text-[#6F7C76] hover:text-[#3F4B46] dark:text-[#A8B8B1] dark:hover:text-[#EDF2EF] mt-2 pt-1"
              >
                <span>Ver mais</span>
                {expandedSection === 'nutrientes' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Card 3: ADITIVOS */}
            <div className="bg-[#F7F4EE] dark:bg-[#18201D] rounded-2xl p-4 border border-[#AEBDB5]/30 dark:border-[#394842] transition-colors">
              <span className="text-[11px] font-bold tracking-wider text-[#3F4B46] dark:text-[#EDF2EF] uppercase block mb-2">
                ADITIVOS
              </span>
              {/* Gradient Slider */}
              <div className="relative my-2">
                <div className="h-3 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 relative">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white dark:bg-[#232D29] border-[3px] border-[#3F4B46] dark:border-[#EDF2EF] shadow-md transform -translate-x-1/2 transition-all duration-500"
                    style={{ left: `${product.additives.score}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-[11px] font-medium text-[#6F7C76] dark:text-[#A8B8B1] mt-2">
                <span>Mais risco</span>
                <span>Menos risco</span>
              </div>

              {expandedSection === 'aditivos' && (
                <div className="mt-3 pt-2 text-xs text-[#6F7C76] dark:text-[#A8B8B1] border-t border-[#AEBDB5]/20 dark:border-[#394842] leading-relaxed">
                  <p className="font-bold text-[#3F4B46] dark:text-[#EDF2EF]">{product.additives.label}</p>
                  {product.additives.items.length > 0 && (
                    <ul className="list-disc list-inside mt-1 text-[11px] text-[#6F7C76] dark:text-[#A8B8B1]">
                      {product.additives.items.map((it, idx) => (
                        <li key={idx}>{it}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <button
                onClick={() => toggleSection('aditivos')}
                className="w-full flex items-center justify-center gap-1 text-[11px] font-bold text-[#6F7C76] hover:text-[#3F4B46] dark:text-[#A8B8B1] dark:hover:text-[#EDF2EF] mt-2 pt-1"
              >
                <span>Ver mais</span>
                {expandedSection === 'aditivos' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Lista de ingredientes */}
            <div className="pt-2">
              <h2 className="text-base font-bold text-[#3F4B46] dark:text-[#EDF2EF] mb-2">
                Lista de ingredientes
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {product.ingredients.map((ing, index) => (
                  <span
                    key={index}
                    className="bg-[#ECEFE7] dark:bg-[#18201D] text-[#3F4B46] dark:text-[#EDF2EF] border border-[#AEBDB5]/30 dark:border-[#394842] text-xs px-2.5 py-1 rounded-full font-medium"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sub-tab 2: Match com você */}
        {activeSubTab === 'match' && (
          <div className="p-4 bg-[#ECEFE7] dark:bg-[#18201D] rounded-2xl border border-[#AEBDB5]/30 dark:border-[#394842] space-y-3 text-xs text-[#3F4B46] dark:text-[#EDF2EF]">
            <div className="font-bold text-sm" style={{ color: activeColor.primary }}>Compatibilidade com seu plano</div>
            <p>
              Seu objetivo atual é <strong>Lose weight</strong> (1700 kcal/dia).
            </p>
            <p>
              Este alimento fornece <strong>{product.nutrients.calories} kcal</strong> por porção ({product.portion}), representando cerca de{' '}
              {Math.round((product.nutrients.calories / 1700) * 100)}% da sua cota diária.
            </p>
            <div className="bg-white dark:bg-[#232D29] p-3 rounded-xl border border-[#AEBDB5]/20 dark:border-[#394842]">
              💡 <strong>Recomendação IA:</strong> Consuma com moderação como sobremesa ou lanche pré-treino devido ao cacau e aos antioxidantes naturais.
            </div>
          </div>
        )}

        {/* Sub-tab 3: Alternativas */}
        {activeSubTab === 'alternativas' && (
          <div className="space-y-2.5">
            {product.alternatives && product.alternatives.length > 0 ? (
              product.alternatives.map((alt, idx) => (
                <div key={idx} className="p-3 bg-white dark:bg-[#232D29] rounded-2xl border border-[#AEBDB5]/30 dark:border-[#394842] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block">{alt.name}</span>
                    <span className="text-[#6F7C76] dark:text-[#A8B8B1]">{alt.brand} • {alt.calories} kcal</span>
                  </div>
                  <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-lg text-xs">
                    Score {alt.score}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1] text-center py-4">Nenhuma alternativa mais saudável sugerida no momento.</p>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button at Bottom */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 dark:bg-[#232D29]/95 backdrop-blur-md p-4 border-t border-[#AEBDB5]/20 dark:border-[#394842] flex justify-center z-20">
        <button
          onClick={handleAdd}
          disabled={isAdded}
          className="w-full max-w-sm py-3.5 rounded-full font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 text-white"
          style={{
            backgroundColor: isAdded ? '#10b981' : activeColor.primary
          }}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Adicionado à refeição!</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Adicionar à refeição</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

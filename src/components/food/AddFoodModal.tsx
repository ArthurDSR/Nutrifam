import React, { useState } from 'react';
import { X, ScanBarcode, Search, Camera, Sparkles, Utensils } from 'lucide-react';
import { Meal, MealType, FoodItem, AddFoodSubTab, ProductEvaluation } from '../../types';
import { FoodSearchView } from './FoodSearchView';
import { BarcodeScannerView } from './BarcodeScannerView';
import { QuickAddView } from './QuickAddView';
import { PhotoScannerView } from './PhotoScannerView';
import { MyFoodsView } from './MyFoodsView';
import { FoodDetailModal } from './FoodDetailModal';
import { useTranslation } from '../../services/i18n';
import { useTheme } from '../../services/themeService';

interface AddFoodModalProps {
  meal: Meal;
  allFoods: FoodItem[];
  customFoods: FoodItem[];
  initialSubTab?: AddFoodSubTab;
  onClose: () => void;
  onAddFoodToMeal: (mealType: MealType, food: FoodItem) => void;
  onAddMultipleFoodsToMeal: (mealType: MealType, foods: FoodItem[]) => void;
  onCreateCustomFood: (food: FoodItem) => void;
  onOpenMealReview?: () => void;
  aiProvider?: 'gemini' | 'openai' | 'openrouter';
  geminiApiKey?: string;
  openaiApiKey?: string;
  openaiModel?: string;
  openrouterApiKey?: string;
  openrouterModel?: string;
  onOpenSettings?: () => void;
}

export const AddFoodModal: React.FC<AddFoodModalProps> = ({
  meal,
  allFoods,
  customFoods,
  initialSubTab = 'search',
  onClose,
  onAddFoodToMeal,
  onAddMultipleFoodsToMeal,
  onCreateCustomFood,
  onOpenMealReview,
  aiProvider = 'openrouter',
  geminiApiKey,
  openaiApiKey,
  openaiModel,
  openrouterApiKey,
  openrouterModel,
  onOpenSettings
}) => {
  const { t } = useTranslation();
  const { isDark, activeColor } = useTheme();
  const [activeTab, setActiveTab] = useState<AddFoodSubTab>(initialSubTab);
  const [selectedFoodForDetail, setSelectedFoodForDetail] = useState<FoodItem | null>(null);

  const eatenCalories = Math.round(
    meal.items.reduce((acc, it) => acc + it.calories * it.servingsCount, 0)
  );

  const progressPercent = Math.min(100, (eatenCalories / (meal.targetCalories || 1)) * 100);

  const getMealTitle = () => {
    switch (meal.type) {
      case 'breakfast':
        return t('meal.breakfast');
      case 'lunch':
        return t('meal.lunch');
      case 'dinner':
        return t('meal.dinner');
      case 'snacks':
        return t('meal.snacks');
      default:
        return meal.title;
    }
  };

  const renderMealHeaderIcon = () => {
    switch (meal.type) {
      case 'breakfast':
        return <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-xs">☕</div>;
      case 'lunch':
        return <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-xs">🍽️</div>;
      case 'dinner':
        return <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-xs">🍲</div>;
      case 'snacks':
        return <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-xs">🥣</div>;
    }
  };

  const handleSelectFoodItem = (food: FoodItem) => {
    setSelectedFoodForDetail(food);
  };

  const handleBarcodeProductFound = (product: ProductEvaluation) => {
    const foodItem: FoodItem = {
      id: 'prod_' + product.barcode + '_' + Date.now(),
      name: product.name,
      brand: product.brand,
      calories: product.nutrients.calories,
      servingSize: product.portion || '100 g',
      servingGrams: 100,
      protein: product.nutrients.protein,
      carbs: Number((100 - product.nutrients.protein - product.nutrients.fat).toFixed(1)),
      fat: product.nutrients.fat,
      fiber: product.nutrients.fiber,
      colorDot: product.scoreColor === 'green' ? '#10b981' : product.scoreColor === 'yellow' ? '#f59e0b' : '#ef4444',
      barcode: product.barcode,
      imageUrl: product.imageUrl,
      novaGroup: (product.processing?.novaGroup as 1 | 2 | 3 | 4) || 3,
      healthScore: product.overallScore || 70,
      preservativesCount: product.additives?.count || 0,
      additives: product.additives?.items || ['Sem aditivos artificiais'],
      healthyAlternative: product.alternatives?.[0]?.name
    };
    setSelectedFoodForDetail(foodItem);
  };

  const handleFoodDetailAdded = (scaledFood: FoodItem) => {
    onAddFoodToMeal(meal.type, scaledFood);
    setSelectedFoodForDetail(null);
    if (onOpenMealReview) {
      onOpenMealReview();
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex justify-center items-stretch sm:items-center">
      <div className="w-full max-w-md h-full sm:h-[92vh] sm:max-h-[850px] sm:rounded-3xl bg-white dark:bg-[#18201D] flex flex-col overflow-hidden shadow-2xl relative border-0 sm:border border-[#AEBDB5]/30 dark:border-[#394842] animate-in fade-in duration-150">
        {/* Top Wellness Header */}
        <div
          className="px-5 pt-4 pb-4 select-none shrink-0 text-white shadow-sm transition-colors"
          style={{ backgroundColor: activeColor.primary }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {renderMealHeaderIcon()}
              <div>
                <h2 className="font-black text-lg leading-tight tracking-tight">
                  {getMealTitle()}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs font-semibold text-white/90">
                    {eatenCalories} / {meal.targetCalories} kcal
                  </p>
                  <div className="w-24 h-1.5 bg-white/25 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(5, progressPercent)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {meal.items.length > 0 && onOpenMealReview && (
                <button
                  onClick={onOpenMealReview}
                  className="px-3 py-1 rounded-xl bg-white/90 hover:bg-white text-[#3F4B46] text-xs font-extrabold shadow-xs transition-all active:scale-95"
                >
                  {meal.items.length} itens
                </button>
              )}

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-2xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* 5 Subtabs Selector */}
        <div className="bg-[#F7F4EE] dark:bg-[#232D29] border-b border-[#AEBDB5]/30 dark:border-[#394842] px-2 py-2 flex items-center justify-between select-none shadow-2xs shrink-0 gap-1">
          {/* Barcode */}
          <button
            onClick={() => setActiveTab('barcode')}
            className={`flex flex-col items-center gap-1 flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === 'barcode' ? 'font-black' : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF] font-semibold'
            }`}
            style={activeTab === 'barcode' ? { color: isDark ? activeColor.darkText : activeColor.primary } : undefined}
          >
            <div
              className="w-11 h-9 rounded-xl flex items-center justify-center transition-all border"
              style={{
                backgroundColor: activeTab === 'barcode' ? (isDark ? activeColor.darkBg : activeColor.bgTintLight) : 'transparent',
                borderColor: activeTab === 'barcode' ? (isDark ? activeColor.darkBorder : activeColor.border) : 'transparent',
                color: activeTab === 'barcode' ? activeColor.primary : 'inherit'
              }}
            >
              <ScanBarcode className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-[10px] truncate max-w-[65px]">{t('food.barcodeTab')}</span>
          </button>

          {/* Search */}
          <button
            onClick={() => setActiveTab('search')}
            className={`flex flex-col items-center gap-1 flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === 'search' ? 'font-black' : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF] font-semibold'
            }`}
            style={activeTab === 'search' ? { color: isDark ? activeColor.darkText : activeColor.primary } : undefined}
          >
            <div
              className="w-11 h-9 rounded-xl flex items-center justify-center transition-all border"
              style={{
                backgroundColor: activeTab === 'search' ? (isDark ? activeColor.darkBg : activeColor.bgTintLight) : 'transparent',
                borderColor: activeTab === 'search' ? (isDark ? activeColor.darkBorder : activeColor.border) : 'transparent',
                color: activeTab === 'search' ? activeColor.primary : 'inherit'
              }}
            >
              <Search className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-[10px] truncate max-w-[65px]">{t('food.searchTab')}</span>
          </button>

          {/* Photo */}
          <button
            onClick={() => setActiveTab('photo')}
            className={`flex flex-col items-center gap-1 flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === 'photo' ? 'font-black' : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF] font-semibold'
            }`}
            style={activeTab === 'photo' ? { color: isDark ? activeColor.darkText : activeColor.primary } : undefined}
          >
            <div
              className="w-11 h-9 rounded-xl flex items-center justify-center transition-all border"
              style={{
                backgroundColor: activeTab === 'photo' ? (isDark ? activeColor.darkBg : activeColor.bgTintLight) : 'transparent',
                borderColor: activeTab === 'photo' ? (isDark ? activeColor.darkBorder : activeColor.border) : 'transparent',
                color: activeTab === 'photo' ? activeColor.primary : 'inherit'
              }}
            >
              <Camera className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-[10px] truncate max-w-[65px]">{t('food.photoTab')}</span>
          </button>

          {/* Quick Add */}
          <button
            onClick={() => setActiveTab('quick_add')}
            className={`flex flex-col items-center gap-1 flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === 'quick_add' ? 'font-black' : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF] font-semibold'
            }`}
            style={activeTab === 'quick_add' ? { color: isDark ? activeColor.darkText : activeColor.primary } : undefined}
          >
            <div
              className="w-11 h-9 rounded-xl flex items-center justify-center transition-all border"
              style={{
                backgroundColor: activeTab === 'quick_add' ? (isDark ? activeColor.darkBg : activeColor.bgTintLight) : 'transparent',
                borderColor: activeTab === 'quick_add' ? (isDark ? activeColor.darkBorder : activeColor.border) : 'transparent',
                color: activeTab === 'quick_add' ? activeColor.primary : 'inherit'
              }}
            >
              <Sparkles className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-[10px] truncate max-w-[65px]">{t('food.quickTab')}</span>
          </button>

          {/* My foods */}
          <button
            onClick={() => setActiveTab('my_foods')}
            className={`flex flex-col items-center gap-1 flex-1 py-1.5 rounded-xl transition-all ${
              activeTab === 'my_foods' ? 'font-black' : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF] font-semibold'
            }`}
            style={activeTab === 'my_foods' ? { color: isDark ? activeColor.darkText : activeColor.primary } : undefined}
          >
            <div
              className="w-11 h-9 rounded-xl flex items-center justify-center transition-all border"
              style={{
                backgroundColor: activeTab === 'my_foods' ? (isDark ? activeColor.darkBg : activeColor.bgTintLight) : 'transparent',
                borderColor: activeTab === 'my_foods' ? (isDark ? activeColor.darkBorder : activeColor.border) : 'transparent',
                color: activeTab === 'my_foods' ? activeColor.primary : 'inherit'
              }}
            >
              <Utensils className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-[10px] truncate max-w-[65px]">{t('food.myFoodsTab')}</span>
          </button>
        </div>

      {/* Subtab Body Container with Guaranteed Hardware Smooth Scroll */}
      <div className="flex-1 min-h-0 h-full flex flex-col overflow-hidden bg-[#F7F4EE] dark:bg-[#18201D]">
        {activeTab === 'search' && (
          <FoodSearchView
            foods={allFoods}
            onAddFood={(food) => onAddFoodToMeal(meal.type, food)}
            onSelectProductForDetails={handleSelectFoodItem}
            aiProvider={aiProvider}
            geminiApiKey={geminiApiKey}
            openaiApiKey={openaiApiKey}
            openaiModel={openaiModel}
            openrouterApiKey={openrouterApiKey}
            openrouterModel={openrouterModel}
          />
        )}

        {activeTab === 'barcode' && (
          <BarcodeScannerView
            onProductFound={handleBarcodeProductFound}
          />
        )}

        {activeTab === 'quick_add' && (
          <QuickAddView
            onAddMultipleFoods={(foods) => onAddMultipleFoodsToMeal(meal.type, foods)}
            aiProvider={aiProvider}
            geminiApiKey={geminiApiKey}
            openaiApiKey={openaiApiKey}
            openaiModel={openaiModel}
            openrouterApiKey={openrouterApiKey}
            openrouterModel={openrouterModel}
            onOpenSettings={onOpenSettings}
          />
        )}

        {activeTab === 'photo' && (
          <PhotoScannerView
            onAddMultipleFoods={(foods) => onAddMultipleFoodsToMeal(meal.type, foods)}
            aiProvider={aiProvider}
            geminiApiKey={geminiApiKey}
            openaiApiKey={openaiApiKey}
            openaiModel={openaiModel}
            openrouterApiKey={openrouterApiKey}
            openrouterModel={openrouterModel}
            onOpenSettings={onOpenSettings}
          />
        )}

        {activeTab === 'my_foods' && (
          <MyFoodsView
            customFoods={customFoods}
            onAddFood={(food) => onAddFoodToMeal(meal.type, food)}
            onCreateFood={onCreateCustomFood}
          />
        )}
      </div>

      {/* Unified Standardized Food Detail Modal */}
      {selectedFoodForDetail && (
        <FoodDetailModal
          food={selectedFoodForDetail}
          mealTargetCalories={meal.targetCalories}
          onClose={() => setSelectedFoodForDetail(null)}
          onAddFood={handleFoodDetailAdded}
        />
      )}
      </div>
    </div>
  );
};

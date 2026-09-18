import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, Loader2, Plus, Check } from 'lucide-react';
import { analyzeFoodPhotoWithAI, ParsedFoodResult } from '../../services/aiService';
import { FoodItem } from '../../types';
import { useTheme } from '../../services/themeService';

interface PhotoScannerViewProps {
  onAddMultipleFoods: (foods: FoodItem[]) => void;
  aiProvider?: 'gemini' | 'openai' | 'openrouter';
  geminiApiKey?: string;
  geminiModel?: string;
  openaiApiKey?: string;
  openaiModel?: string;
  openrouterApiKey?: string;
  openrouterModel?: string;
  onOpenSettings?: () => void;
}

export const PhotoScannerView: React.FC<PhotoScannerViewProps> = ({
  onAddMultipleFoods,
  aiProvider = 'openrouter',
  geminiApiKey,
  geminiModel,
  openaiApiKey,
  openaiModel,
  openrouterApiKey,
  openrouterModel,
  onOpenSettings
}) => {
  const { activeColor, isDark } = useTheme();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ParsedFoodResult | null>(null);
  const [isDone, setIsDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeApiKey =
    aiProvider === 'openrouter'
      ? openrouterApiKey
      : aiProvider === 'openai'
      ? openaiApiKey
      : geminiApiKey;
  const activeModel =
    aiProvider === 'openrouter'
      ? (openrouterModel || 'openrouter/free')
      : aiProvider === 'openai'
      ? (openaiModel || 'gpt-4o-mini')
      : (geminiModel || 'gemini-3.5-flash-lite');
  const hasCustomKey = Boolean(activeApiKey && activeApiKey.trim() !== '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setSelectedImage(base64);
      runAnalysis(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async (imageBase64: string, mimeType: string) => {
    setIsAnalyzing(true);
    setResult(null);
    try {
      const res = await analyzeFoodPhotoWithAI(
        imageBase64,
        mimeType,
        activeApiKey,
        aiProvider,
        activeModel
      );
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddFoods = () => {
    if (!result) return;
    const items: FoodItem[] = result.items.map((it, idx) => ({
      ...it,
      id: 'photo_' + Date.now() + '_' + idx
    }));
    onAddMultipleFoods(items);
    setIsDone(true);
    setTimeout(() => {
      setSelectedImage(null);
      setResult(null);
      setIsDone(false);
    }, 1200);
  };

  return (
    <div
      className="flex-1 min-h-0 h-full flex flex-col px-4 pt-3 pb-24 overflow-y-auto touch-pan-y bg-[#F7F4EE] dark:bg-[#18201D] transition-colors"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* AI Key Status Indicator */}
      <div className="flex items-center justify-between p-2.5 mb-3 rounded-2xl bg-white dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] text-[11px] shrink-0 shadow-2xs">
        <div className="flex items-center gap-1.5 font-medium text-[#3F4B46] dark:text-[#EDF2EF]">
          <Sparkles className="w-3.5 h-3.5" style={{ color: activeColor.primary }} />
          <span>
            {hasCustomKey
              ? aiProvider === 'openrouter'
                ? `Visão IA: OpenRouter (${openrouterModel || 'openrouter/free'})`
                : aiProvider === 'openai'
                ? `Visão IA: OpenAI (${openaiModel || 'gpt-4o-mini'})`
                : `Visão IA: Gemini (${geminiModel || 'gemini-3.5-flash-lite'})`
              : 'Modo Local (Simulação de Prato Equilibrado)'}
          </span>
        </div>
        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="text-[10px] font-bold underline ml-2 text-[#3F4B46] dark:text-[#EDF2EF]"
          >
            {hasCustomKey ? 'Alterar' : 'Configurar Chave'}
          </button>
        )}
      </div>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Image Upload / Capture Area */}
      {!selectedImage ? (
        <div
          className="flex flex-col items-center justify-center p-8 bg-white dark:bg-[#232D29] border-2 border-dashed rounded-3xl text-center space-y-4 shadow-2xs"
          style={{ borderColor: isDark ? activeColor.darkBorder : activeColor.border }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xs"
            style={{ backgroundColor: activeColor.primary }}
          >
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF] text-sm">Fotografar seu prato</h4>
            <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1] mt-1 max-w-xs">
              A inteligência artificial analisa os alimentos, calcula as porções aproximadas e estima os macronutrientes.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 text-white rounded-full text-xs font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-1.5"
              style={{ backgroundColor: activeColor.primary }}
            >
              <Upload className="w-4 h-4" />
              <span>Tirar foto ou Enviar</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview image */}
          <div
            className="relative h-48 rounded-2xl overflow-hidden shadow-md bg-slate-900 border-2"
            style={{ borderColor: activeColor.primary }}
          >
            <img src={selectedImage} alt="Foto da refeição" className="w-full h-full object-cover" />
            <button
              onClick={() => {
                setSelectedImage(null);
                setResult(null);
              }}
              className="absolute top-2 right-2 bg-black/60 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm"
            >
              Trocar foto
            </button>
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin text-mint-400 mb-2" />
                <span className="text-xs font-bold">Identificando alimentos com IA...</span>
              </div>
            )}
          </div>

          {/* Results */}
          {result && (
            <div className="bg-[#ECEFE7] dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-2xl p-4 shadow-sm animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-[#AEBDB5]/20 dark:border-[#394842]">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#3F4B46] dark:text-[#EDF2EF]">
                  <Sparkles className="w-4 h-4" style={{ color: activeColor.primary }} />
                  <span>Alimentos Detectados na Foto</span>
                </div>
                <span className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF] text-sm">
                  {result.totalCalories} Cal
                </span>
              </div>

              <div className="mt-3 space-y-1.5">
                {result.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-[#18201D] p-2.5 rounded-xl flex items-center justify-between text-xs border border-[#AEBDB5]/20 dark:border-[#394842] shadow-2xs"
                  >
                    <div>
                      <span className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block">{it.name}</span>
                      <span className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1]">{it.servingSize}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block">{it.calories} Cal</span>
                      <span className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] font-mono">
                        P: {it.protein}g | C: {it.carbs}g | G: {it.fat}g
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddFoods}
                disabled={isDone}
                className="w-full mt-3 py-3 rounded-full font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all text-white active:scale-95"
                style={{ backgroundColor: activeColor.primary }}
              >
                {isDone ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Adicionado à refeição!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Adicionar todos os itens ({result.totalCalories} Cal)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

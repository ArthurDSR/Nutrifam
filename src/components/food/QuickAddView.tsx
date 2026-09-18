import React, { useState } from 'react';
import { Plus, Mic, MicOff, Sparkles, Loader2, Check } from 'lucide-react';
import { parseQuickAddWithAI, ParsedFoodResult } from '../../services/aiService';
import { FoodItem } from '../../types';
import { useTheme } from '../../services/themeService';

interface QuickAddViewProps {
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

export const QuickAddView: React.FC<QuickAddViewProps> = ({
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
  const { activeColor } = useTheme();
  const [description, setDescription] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedFoodResult | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

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

  const sampleChips = [
    '2 ovos cozidos, arroz e suco de laranja natural',
    '35g de proteína de whey e 140 calorias',
    '2 fatias de pão integral com ovo mexido e café'
  ];

  // Speech to text support (Web Speech API)
  const handleToggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Reconhecimento de voz não suportado neste navegador. Digite sua descrição no campo.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleProcessAI = async (textToProcess?: string) => {
    const targetText = textToProcess || description;
    if (!targetText.trim()) return;

    setIsLoading(true);
    setParsedResult(null);

    try {
      const result = await parseQuickAddWithAI(
        targetText,
        activeApiKey,
        aiProvider,
        activeModel
      );
      setParsedResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAdd = () => {
    if (!parsedResult) return;

    const foods: FoodItem[] = parsedResult.items.map((item, index) => ({
      ...item,
      id: 'quick_' + Date.now() + '_' + index
    }));

    onAddMultipleFoods(foods);
    setIsSuccess(true);
    setTimeout(() => {
      setDescription('');
      setParsedResult(null);
      setIsSuccess(false);
    }, 1200);
  };

  return (
    <div
      className="flex-1 min-h-0 h-full flex flex-col px-4 pt-3 pb-24 overflow-y-auto touch-pan-y bg-[#F7F4EE] dark:bg-[#18201D] transition-colors"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* AI Key Status Indicator */}
      <div className="flex items-center justify-between p-2.5 mb-2 rounded-2xl bg-[#ECEFE7] dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] text-[11px] transition-colors">
        <div className="flex items-center gap-1.5 font-bold text-[#3F4B46] dark:text-[#EDF2EF]">
          <Sparkles className="w-3.5 h-3.5" style={{ color: activeColor.primary }} />
          <span>
            {hasCustomKey
              ? aiProvider === 'openrouter'
                ? `IA Ativa: OpenRouter (${openrouterModel || 'openrouter/free'})`
                : aiProvider === 'openai'
                ? `IA Ativa: OpenAI (${openaiModel || 'gpt-4o-mini'})`
                : `IA Ativa: Gemini (${geminiModel || 'gemini-3.5-flash-lite'})`
              : 'Modo Local (Estimativa Rápida)'}
          </span>
        </div>
        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="text-[10px] font-bold underline ml-2 hover:opacity-80"
            style={{ color: activeColor.primary }}
          >
            {hasCustomKey ? 'Alterar' : 'Configurar Chave'}
          </button>
        )}
      </div>

      {/* Suggestion Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none shrink-0">
        {sampleChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDescription(chip);
              handleProcessAI(chip);
            }}
            className="bg-white dark:bg-[#232D29] hover:bg-[#ECEFE7] dark:hover:bg-[#2B3732] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-2xl px-4 py-2 text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] shadow-2xs shrink-0 max-w-[240px] text-left transition-transform active:scale-95 leading-snug"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className="mt-3 bg-white dark:bg-[#232D29] rounded-2xl border border-[#AEBDB5]/30 dark:border-[#394842] p-3.5 focus-within:border-[#6F7C76] transition-colors shadow-2xs">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva o que você comeu (ex: 2 ovos com tapioca e queijo branco)"
          rows={3}
          className="w-full text-sm font-semibold text-[#3F4B46] dark:text-[#EDF2EF] placeholder-[#6F7C76]/60 dark:placeholder-[#A8B8B1]/60 focus:outline-none resize-none bg-transparent"
        />

        {/* Action icons row inside input container */}
        <div className="flex items-center justify-between pt-2 border-t border-[#AEBDB5]/20 dark:border-[#394842]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleProcessAI()}
              disabled={isLoading || !description.trim()}
              className="w-9 h-9 rounded-full bg-[#F7F4EE] dark:bg-[#18201D] hover:bg-[#ECEFE7] dark:hover:bg-[#2B3732] text-[#3F4B46] dark:text-[#EDF2EF] flex items-center justify-center transition-transform active:scale-90 disabled:opacity-40 border border-[#AEBDB5]/30 dark:border-[#394842]"
              title="Calcular com IA"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: activeColor.primary }} />
              ) : (
                <Plus className="w-5 h-5 stroke-[2.5]" />
              )}
            </button>

            <button
              type="button"
              onClick={handleToggleVoice}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-[#F7F4EE] dark:bg-[#18201D] hover:bg-[#ECEFE7] dark:hover:bg-[#2B3732] text-[#3F4B46] dark:text-[#EDF2EF] border border-[#AEBDB5]/30 dark:border-[#394842]'
              }`}
              title={isListening ? 'Parar gravação' : 'Falar por voz'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={() => handleProcessAI()}
            disabled={isLoading || !description.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white font-bold text-xs shadow-xs transition-transform active:scale-95 disabled:opacity-40"
            style={{ backgroundColor: activeColor.primary }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Calcular Macros</span>
          </button>
        </div>
      </div>

      {/* AI Processed Preview Card */}
      {parsedResult && (
        <div className="mt-4 bg-[#ECEFE7] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-2xl p-4 shadow-2xs animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-[#AEBDB5]/20 dark:border-[#394842]">
            <div className="flex items-center gap-1.5 font-bold text-xs" style={{ color: activeColor.primary }}>
              <Sparkles className="w-4 h-4" />
              <span>Resultado da Análise IA</span>
            </div>
            <span className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-sm">
              {parsedResult.totalCalories} kcal
            </span>
          </div>

          <p className="text-[11px] text-[#6F7C76] dark:text-[#A8B8B1] mt-2 font-medium">
            {parsedResult.confidenceMessage}
          </p>

          {/* Parsed Items List */}
          <div className="mt-3 space-y-1.5">
            {parsedResult.items.map((it, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#232D29] p-2.5 rounded-xl flex items-center justify-between text-xs border border-[#AEBDB5]/20 dark:border-[#394842] shadow-2xs"
              >
                <div>
                  <span className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block">{it.name}</span>
                  <span className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1]">{it.servingSize}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block">{it.calories} kcal</span>
                  <span className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] font-mono">
                    P: {it.protein}g | C: {it.carbs}g | G: {it.fat}g
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Macro Summary Pills */}
          <div className="grid grid-cols-4 gap-1.5 mt-3 text-center text-[10px] font-bold">
            <div className="bg-white dark:bg-[#232D29] p-1.5 rounded-lg text-[#3F4B46] dark:text-[#EDF2EF] border border-[#AEBDB5]/20 dark:border-[#394842]">
              Prot: <span className="text-indigo-500 font-bold">{parsedResult.totalProtein}g</span>
            </div>
            <div className="bg-white dark:bg-[#232D29] p-1.5 rounded-lg text-[#3F4B46] dark:text-[#EDF2EF] border border-[#AEBDB5]/20 dark:border-[#394842]">
              Carb: <span className="text-amber-500 font-bold">{parsedResult.totalCarbs}g</span>
            </div>
            <div className="bg-white dark:bg-[#232D29] p-1.5 rounded-lg text-[#3F4B46] dark:text-[#EDF2EF] border border-[#AEBDB5]/20 dark:border-[#394842]">
              Gord: <span className="text-rose-500 font-bold">{parsedResult.totalFat}g</span>
            </div>
            <div className="bg-white dark:bg-[#232D29] p-1.5 rounded-lg text-[#3F4B46] dark:text-[#EDF2EF] border border-[#AEBDB5]/20 dark:border-[#394842]">
              Fibra: <span className="text-emerald-500 font-bold">{parsedResult.totalFiber}g</span>
            </div>
          </div>

          {/* Add All Button */}
          <button
            onClick={handleConfirmAdd}
            disabled={isSuccess}
            className="w-full mt-3 py-3 rounded-full font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all text-white active:scale-95"
            style={{
              backgroundColor: isSuccess ? '#10b981' : activeColor.primary
            }}
          >
            {isSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Alimentos adicionados com sucesso!</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Adicionar à refeição</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

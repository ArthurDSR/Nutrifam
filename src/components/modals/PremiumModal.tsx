import React from 'react';
import { X, Star, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PremiumModalProps {
  onClose: () => void;
  onActivate: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ onClose, onActivate }) => {
  const perks = [
    'Leitor de código de barras ilimitado com Nutri-Score instantâneo',
    'Reconhecimento fotográfico por IA com detecção de porções',
    'Quick Add inteligente via voz e texto em linguagem natural',
    'Gráficos avançados de evolução física e relatórios de macronutrientes',
    'Sincronização com Apple Health e Google Fit',
    'Coach nutricional IA com respostas personalizadas para seu objetivo'
  ];

  const handleSubscribe = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch {}
    onActivate();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200 text-slate-800">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center -mt-2">
          <div className="w-14 h-14 rounded-3xl bg-amber-100 text-amber-500 mx-auto flex items-center justify-center shadow-sm">
            <Star className="w-8 h-8 fill-amber-400" />
          </div>
          <h3 className="text-xl font-black mt-3">NutriFam Premium</h3>
          <p className="text-xs text-slate-500 mt-1">
            Desbloqueie todo o poder da inteligência artificial para sua dieta e evolução.
          </p>
        </div>

        {/* Perks list */}
        <div className="mt-5 space-y-2.5">
          {perks.map((p, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span className="font-medium">{p}</span>
            </div>
          ))}
        </div>

        {/* Plan card */}
        <div className="mt-5 p-3.5 bg-slate-50 rounded-2xl border-2 border-mint-400 flex items-center justify-between">
          <div>
            <span className="font-bold text-xs text-slate-800 block">Plano Anual Especial</span>
            <span className="text-[11px] text-emerald-600 font-bold">7 dias grátis para testar</span>
          </div>
          <div className="text-right">
            <span className="text-base font-black text-slate-900">R$ 14,90</span>
            <span className="text-[10px] text-slate-400 block">/mês</span>
          </div>
        </div>

        <button
          onClick={handleSubscribe}
          className="w-full mt-4 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-black text-sm shadow-md transition-transform active:scale-98 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-slate-900" />
          <span>Experimentar Grátis por 7 Dias</span>
        </button>
      </div>
    </div>
  );
};

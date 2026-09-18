import React from 'react';
import { X, Smartphone, ShieldCheck, Heart, Footprints, Flame, Scale, Sparkles } from 'lucide-react';
import { useTheme } from '../../services/themeService';
import { FoodBudMascot } from '../pet/FoodBudMascot';

interface NativeHealthNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddActivity?: () => void;
}

export const NativeHealthNoticeModal: React.FC<NativeHealthNoticeModalProps> = ({
  isOpen,
  onClose,
  onOpenAddActivity
}) => {
  const { isDark, activeColor } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div
        className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl border transition-all animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto ${
          isDark
            ? 'bg-[#1D2622] text-[#EDF2EF] border-[#394842]'
            : 'bg-[#FFFCF7] text-[#3F4B46] border-[#D8DED9]'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#AEBDB5]/20 dark:border-[#394842]">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: isDark ? activeColor.darkBg : activeColor.pastel,
                border: `1px solid ${isDark ? activeColor.darkBorder : activeColor.border}`
              }}
            >
              <Smartphone className="w-4 h-4" style={{ color: activeColor.primary }} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm leading-tight text-[#3F4B46] dark:text-[#EDF2EF]">
                Apple & Android Health
              </h3>
              <p className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1]">
                Dispositivos de Saúde & Sensores
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#6F7C76] hover:text-[#3F4B46] dark:text-[#A8B8B1] dark:hover:text-[#EDF2EF] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mascot Highlight Banner */}
        <div
          className="mt-3.5 p-3 rounded-2xl border flex items-center gap-3.5"
          style={{
            background: isDark
              ? `linear-gradient(135deg, ${activeColor.darkBg} 0%, #15201C 100%)`
              : `linear-gradient(135deg, ${activeColor.pastel} 0%, ${activeColor.bgTintLight} 100%)`,
            borderColor: isDark ? activeColor.darkBorder : activeColor.border
          }}
        >
          <div className="w-14 h-14 shrink-0 flex items-center justify-center relative">
            <FoodBudMascot mood="happy" className="w-full h-full drop-shadow-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-extrabold tracking-wide uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 mb-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Exclusivo do App Mobile</span>
            </div>
            <p className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] leading-snug">
              Disponível no app oficial iOS e Android
            </p>
          </div>
        </div>

        {/* Explanatory Message */}
        <div className="mt-3 space-y-2 text-[11.5px] text-[#6F7C76] dark:text-[#A8B8B1] leading-relaxed">
          <p>
            Por exigências estritas de privacidade e segurança da Apple e do Google, a sincronização de dados biométricos com o <strong>Apple Health (HealthKit)</strong> e <strong>Android Health Connect</strong> só pode ser realizada através do <strong>aplicativo mobile instalado no celular</strong>.
          </p>
          <p>
            A versão Web e PWA de navegador não possui permissão dos sistemas operacionais para acessar esses sensores em segundo plano.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mt-3 space-y-1.5">
          <p className="text-[10px] font-bold text-[#3F4B46] dark:text-[#EDF2EF] uppercase tracking-wider">
            O que sincroniza no App Mobile:
          </p>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {/* Steps & Watches */}
            <div className="p-2.5 rounded-xl bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/25 dark:border-[#394842] flex items-start gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <Footprints className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF]">Passos Reais</p>
                <p className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] leading-tight">Apple Watch & Galaxy Watch</p>
              </div>
            </div>

            {/* Calories Burned */}
            <div className="p-2.5 rounded-xl bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/25 dark:border-[#394842] flex items-start gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF]">Calorias Ativas</p>
                <p className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] leading-tight">Treinos e caminhadas</p>
              </div>
            </div>

            {/* Smart Scale */}
            <div className="p-2.5 rounded-xl bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/25 dark:border-[#394842] flex items-start gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                <Scale className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF]">Balança Smart</p>
                <p className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] leading-tight">Peso e gordura corporal</p>
              </div>
            </div>

            {/* Privacy */}
            <div className="p-2.5 rounded-xl bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/25 dark:border-[#394842] flex items-start gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF]">100% Seguro</p>
                <p className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] leading-tight">Capacitor local seguro</p>
              </div>
            </div>
          </div>
        </div>

        {/* Capacitor Porting Notice */}
        <div className="mt-3 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[10.5px] text-amber-800 dark:text-amber-200 leading-snug">
          📱 <strong>Portando para App Store & Google Play</strong>: O NutriFam está sendo portado com tecnologia <strong>Capacitor</strong> para publicação nativa nas lojas, onde a sincronização contínua estará disponível para você!
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-98"
            style={{ backgroundColor: activeColor.primary }}
          >
            <span>Entendi</span>
          </button>

          {onOpenAddActivity && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAddActivity();
              }}
              className="w-full py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-[#AEBDB5]/40 dark:border-[#394842] text-[#3F4B46] dark:text-[#EDF2EF] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Registrar Treino Manualmente</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

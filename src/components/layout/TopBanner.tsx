import React from 'react';
import { Star } from 'lucide-react';

interface TopBannerProps {
  onGoPremium: () => void;
}

export const TopBanner: React.FC<TopBannerProps> = ({ onGoPremium }) => {
  return (
    <div className="bg-[#3F4B46] dark:bg-[#2B3732] px-5 py-2.5 flex items-center justify-between text-white select-none border-b border-white/10">
      <span className="text-[13px] font-medium tracking-tight text-white/95">
        Conheça todos os recursos
      </span>
      <button
        onClick={onGoPremium}
        className="flex items-center gap-1.5 bg-[#F3EBDD] hover:bg-[#E9DDCA] text-[#4D4A43] text-[12px] font-bold px-3 py-1 rounded-full shadow-sm transition-all active:scale-95"
      >
        <Star className="w-3.5 h-3.5 text-[#9A8250] fill-[#D9C48F]" />
        <span>Ver Premium</span>
      </button>
    </div>
  );
};

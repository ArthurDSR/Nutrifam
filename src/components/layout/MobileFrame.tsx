import React, { useEffect } from 'react';
import { useTheme } from '../../services/themeService';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const { isDark } = useTheme();

  // Sync dark class on document root as well for system modals & browser controls
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className={`fixed inset-0 w-full h-[100dvh] flex justify-center selection:bg-[#C9D9C8] selection:text-[#3F4B46] overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-[#101613]' : 'bg-[#E9E6DF]'
    }`}>
      <div
        className={`w-full max-w-md h-full flex flex-col relative shadow-xl sm:border-x overflow-hidden transition-colors duration-200 pt-safe ${
          isDark
            ? 'bg-[#18201D] text-[#EDF2EF] border-[#394842]'
            : 'bg-[#F7F4EE] text-[#3F4B46] border-[#D8DED9]'
        }`}
        style={{
          backgroundColor: isDark ? '#18201D' : '#F7F4EE',
          paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)'
        }}
      >
        {children}
      </div>
    </div>
  );
};

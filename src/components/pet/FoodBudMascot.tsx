import React from 'react';

export type FoodBudMood = 'happy' | 'love' | 'eating' | 'sleeping' | 'playing';

interface FoodBudMascotProps {
  mood: FoodBudMood;
  petLevel: number;
  equippedCap: string | null;
  equippedGlasses: string | null;
  equippedClothes: string | null;
  capColor: string;
  capDarker: string;
}

export const FoodBudMascot: React.FC<FoodBudMascotProps> = ({
  mood,
  petLevel,
  equippedCap,
  equippedGlasses,
  equippedClothes,
  capColor,
  capDarker
}) => {
  const clothingColor = equippedClothes === 'clothes_hoodie_emerald'
    ? '#668C78'
    : equippedClothes === 'clothes_vest_puffer'
      ? '#C78354'
      : equippedClothes === 'clothes_shirt_striped'
        ? '#E9E4D8'
        : null;

  return (
    <svg
      viewBox="0 0 180 190"
      className="relative z-10 w-[178px] h-[188px] overflow-visible drop-shadow-[0_12px_9px_rgba(61,72,64,0.18)]"
      role="img"
      aria-label="FoodBud, um filhote de guaxinim marrom com boné lilás"
    >
      <ellipse cx="90" cy="176" rx="52" ry="8" fill="#6F8175" opacity="0.28" />

      {/* Low curved tail, like the reference illustration */}
      <path d="M128 143c26-5 41-26 36-51-3-15-12-25-22-25-9 0-13 9-9 19 6 14 0 32-16 42Z" fill="#8C6549" />
      <path d="M145 119c8-8 13-18 14-29-5-7-12-10-20-8 2 10 1 19-4 27Z" fill="#604536" />
      <path d="M155 82c-4-9-10-15-17-15-4 0-7 2-8 5 10 3 17 9 22 18Z" fill="#604536" />
      <path d="M130 137c7-3 14-7 19-12l-10-12c-5 6-12 11-20 14Z" fill="#604536" />

      {/* Plump pear-shaped body */}
      <path d="M90 73c31 0 48 31 46 65-1 28-17 39-46 39s-45-11-46-39c-2-34 15-65 46-65Z" fill="#8C6549" />
      <ellipse cx="90" cy="135" rx="29" ry="32" fill="#DCC29A" />

      {clothingColor && (
        <g>
          <path d="M50 111c4-23 18-37 40-37s36 14 40 37l5 30c-14 14-76 14-90 0Z" fill={clothingColor} />
          {equippedClothes === 'clothes_shirt_striped' && (
            <g fill="none" stroke="#7E91A3" strokeWidth="4">
              <path d="M48 117q42 11 84 0" /><path d="M46 130q44 11 88 0" /><path d="M45 143q45 10 90 0" />
            </g>
          )}
          {equippedClothes === 'clothes_hoodie_emerald' && (
            <><path d="M90 82v69" stroke="#E6EEE9" strokeWidth="2" /><path d="M70 139h40l-5 16H75Z" fill="#527463" /></>
          )}
        </g>
      )}

      {equippedClothes === 'clothes_bandana_gold' && (
        <path d="M56 99q34 17 68 0l-34 39Z" fill="#D8B75B" />
      )}

      {!equippedClothes && petLevel >= 2 && (
        <path d="M57 97q33 12 66 0l2 8q-35 14-70 0Z" fill="#B86870" />
      )}
      {!equippedClothes && petLevel >= 3 && <circle cx="90" cy="112" r="7" fill="#D9B854" />}

      {/* Small rounded feet and paws */}
      <ellipse cx="66" cy="169" rx="16" ry="10" fill="#75513E" />
      <ellipse cx="114" cy="169" rx="16" ry="10" fill="#75513E" />
      <ellipse cx="65" cy="128" rx="10" ry="8" fill="#75513E" />
      <ellipse cx="115" cy="128" rx="10" ry="8" fill="#75513E" />

      {/* Rounded ears behind the head */}
      <ellipse cx="52" cy="54" rx="19" ry="24" fill="#74513E" />
      <ellipse cx="128" cy="54" rx="19" ry="24" fill="#74513E" />
      <ellipse cx="53" cy="55" rx="10" ry="14" fill="#BE9475" />
      <ellipse cx="127" cy="55" rx="10" ry="14" fill="#BE9475" />

      {/* Compact head */}
      <ellipse cx="90" cy="72" rx="45" ry="39" fill="#8C6549" />
      <ellipse cx="67" cy="72" rx="22" ry="18" fill="#513B35" transform="rotate(-9 67 72)" />
      <ellipse cx="113" cy="72" rx="22" ry="18" fill="#513B35" transform="rotate(9 113 72)" />
      <path d="M55 57q12-8 24 1" fill="none" stroke="#D6B587" strokeWidth="7" strokeLinecap="round" />
      <path d="M101 58q12-9 24-1" fill="none" stroke="#D6B587" strokeWidth="7" strokeLinecap="round" />

      {mood === 'sleeping' ? (
        <g fill="none" stroke="#2F2530" strokeWidth="3" strokeLinecap="round">
          <path d="M59 73q8 7 16 0" /><path d="M105 73q8 7 16 0" />
        </g>
      ) : mood === 'love' ? (
        <g fill="none" stroke="#2F2530" strokeWidth="3" strokeLinecap="round">
          <path d="M59 76q8-9 16 0" /><path d="M105 76q8-9 16 0" />
        </g>
      ) : (
        <g fill="#2F2530">
          <circle cx="68" cy="72" r="6" /><circle cx="112" cy="72" r="6" />
          <circle cx="66" cy="70" r="1.8" fill="#FFFDF8" /><circle cx="110" cy="70" r="1.8" fill="#FFFDF8" />
        </g>
      )}

      {/* Cream muzzle with a simple button nose */}
      <ellipse cx="90" cy="88" rx="22" ry="16" fill="#E1CBA7" />
      <ellipse cx="90" cy="84" rx="6" ry="4.5" fill="#2E2320" />
      {mood === 'eating' ? (
        <ellipse cx="90" cy="94" rx="4" ry="5" fill="#8F4B47" />
      ) : (
        <path d="M83 93q7 7 14 0" fill="none" stroke="#4B352B" strokeWidth="2.2" strokeLinecap="round" />
      )}

      {mood === 'love' && (
        <g fill="#DFA5A2" opacity="0.75"><ellipse cx="55" cy="88" rx="7" ry="4" /><ellipse cx="125" cy="88" rx="7" ry="4" /></g>
      )}

      {mood === 'eating' && (
        <g><circle cx="90" cy="126" r="9" fill="#D95D59" /><path d="M90 117q4-7 8-4" fill="none" stroke="#6C774A" strokeWidth="2" /></g>
      )}
      {mood === 'playing' && (
        <g><circle cx="90" cy="128" r="10" fill="#D9B850" /><path d="M84 120q7 8 0 16M96 120q-7 8 0 16" fill="none" stroke="#FFF8DD" strokeWidth="1.5" /></g>
      )}

      {/* Accessories stay compatible with the existing inventory */}
      {equippedCap && equippedCap !== 'cap_gold' && (
        <g>
          <path d="M57 43c1-20 17-30 33-30s32 10 33 30Z" fill={capColor} />
          <path d="M50 43q39 15 78 0-8-8-27-9H67q-10 1-17 9Z" fill={capDarker} />
          <path d="M90 15v27" stroke="#6E4B78" strokeWidth="1.5" opacity="0.55" />
          <circle cx="90" cy="15" r="3.5" fill={capDarker} />
        </g>
      )}

      {equippedCap === 'cap_gold' && (
        <path d="M58 45 52 22l18 11 20-21 20 21 18-11-6 23Z" fill="#D6AE42" stroke="#9D7825" strokeWidth="2" />
      )}

      {equippedGlasses && (
        equippedGlasses === 'glasses_round' ? (
          <g fill="#FFF" fillOpacity="0.18" stroke="#463A38" strokeWidth="2.5">
            <circle cx="68" cy="72" r="11" /><circle cx="112" cy="72" r="11" /><path d="M79 72h22" />
          </g>
        ) : (
          <g fill="#2E3031" stroke="#202222" strokeWidth="2">
            <path d="M56 65h24v8c0 10-24 10-24 0Z" /><path d="M100 65h24v8c0 10-24 10-24 0Z" /><path d="M80 69h20" />
          </g>
        )
      )}
    </svg>
  );
};


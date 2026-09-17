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
      viewBox="0 0 190 210"
      className="relative z-10 w-[170px] h-[188px] overflow-visible drop-shadow-[0_9px_7px_rgba(61,72,64,0.16)]"
      role="img"
      aria-label="FoodBud, um filhote de guaxinim marrom com barriga clara, cauda listrada e boné lilás"
    >
      {/* Contact shadow sits directly under the feet. */}
      <ellipse cx="92" cy="199" rx="48" ry="8" fill="#6D7F73" opacity="0.28" />

      {/* Attached low tail with broad rounded stripes, matching the reference silhouette. */}
      <path d="M126 163c27 5 52-9 59-32 6-20-2-39-14-44-10-4-19 3-16 15 5 17-4 31-27 39Z" fill="#8D6548" />
      <path d="M166 121c6-10 7-20 3-30 8 1 14 7 17 16 0 10-3 19-8 27Z" fill="#604537" />
      <path d="M151 148c10-4 19-11 25-20l-15-11c-5 8-13 14-23 18Z" fill="#604537" />
      <path d="M127 163c9 1 18-1 26-5l-10-16c-7 4-13 6-21 6Z" fill="#604537" />

      {/* Narrow shoulders and a large pear-shaped lower body. */}
      <path d="M92 84c28 0 44 21 47 56 4 38-10 56-47 56s-51-18-47-56c3-35 19-56 47-56Z" fill="#8D6548" />

      {clothingColor ? (
        <g>
          <path d="M53 118c6-22 19-34 39-34s33 12 39 34l5 39c-13 22-75 22-88 0Z" fill={clothingColor} />
          {equippedClothes === 'clothes_shirt_striped' && (
            <g fill="none" stroke="#8495A3" strokeWidth="4">
              <path d="M51 128q41 10 82 0" /><path d="M49 142q43 10 86 0" /><path d="M49 157q43 9 86 0" />
            </g>
          )}
          {equippedClothes === 'clothes_hoodie_emerald' && (
            <><path d="M92 91v76" stroke="#E8EFEA" strokeWidth="2" /><path d="M72 153h40l-5 17H77Z" fill="#527463" /></>
          )}
        </g>
      ) : (
        <ellipse cx="92" cy="158" rx="34" ry="37" fill="#DFC79F" />
      )}

      {equippedClothes === 'clothes_bandana_gold' && <path d="M58 105q34 16 68 0l-34 37Z" fill="#D8B75B" />}
      {!equippedClothes && petLevel >= 2 && <path d="M58 104q34 12 68 0l2 8q-36 14-72 0Z" fill="#B86870" />}
      {!equippedClothes && petLevel >= 3 && <circle cx="92" cy="119" r="7" fill="#D9B854" />}

      {/* Rounded arms overlap the cream belly just like the supplied character. */}
      <ellipse cx="64" cy="153" rx="11" ry="9" fill="#75513F" transform="rotate(16 64 153)" />
      <ellipse cx="120" cy="153" rx="11" ry="9" fill="#75513F" transform="rotate(-16 120 153)" />

      {/* Feet touch both the shadow and the body with no floating gap. */}
      <ellipse cx="67" cy="190" rx="18" ry="10" fill="#75513F" />
      <ellipse cx="117" cy="190" rx="18" ry="10" fill="#75513F" />

      {/* Tall rounded ears and compact head. */}
      <path d="M56 83c-14 0-23-12-21-28 1-14 9-24 19-23 11 1 17 13 15 28-1 13-5 23-13 23Z" fill="#765240" />
      <path d="M128 83c14 0 23-12 21-28-1-14-9-24-19-23-11 1-17 13-15 28 1 13 5 23 13 23Z" fill="#765240" />
      <path d="M55 69c-7 0-11-7-10-15 1-8 5-13 10-12 6 1 8 8 7 16-1 7-3 11-7 11Z" fill="#BC9477" />
      <path d="M129 69c7 0 11-7 10-15-1-8-5-13-10-12-6 1-8 8-7 16 1 7 3 11 7 11Z" fill="#BC9477" />
      <ellipse cx="92" cy="82" rx="43" ry="36" fill="#8D6548" />

      {/* Cream brows and the characteristic dark raccoon mask. */}
      <path d="M55 69q14-14 29-3" fill="none" stroke="#D7B88B" strokeWidth="7" strokeLinecap="round" />
      <path d="M100 66q15-11 29 3" fill="none" stroke="#D7B88B" strokeWidth="7" strokeLinecap="round" />
      <path d="M51 80c8-18 25-23 39-8-2 18-21 28-36 17Z" fill="#503A35" />
      <path d="M133 80c-8-18-25-23-39-8 2 18 21 28 36 17Z" fill="#503A35" />

      {mood === 'sleeping' ? (
        <g fill="none" stroke="#2F2527" strokeWidth="3" strokeLinecap="round">
          <path d="M61 81q8 6 16 0" /><path d="M107 81q8 6 16 0" />
        </g>
      ) : mood === 'love' ? (
        <g fill="none" stroke="#2F2527" strokeWidth="3" strokeLinecap="round">
          <path d="M61 84q8-9 16 0" /><path d="M107 84q8-9 16 0" />
        </g>
      ) : (
        <g>
          <circle cx="69" cy="81" r="6" fill="#2F2527" /><circle cx="115" cy="81" r="6" fill="#2F2527" />
          <circle cx="67" cy="79" r="1.8" fill="#FFFDFC" /><circle cx="113" cy="79" r="1.8" fill="#FFFDFC" />
        </g>
      )}

      {/* Small oval muzzle and button nose. */}
      <ellipse cx="92" cy="99" rx="21" ry="15" fill="#E2CCA7" />
      <ellipse cx="92" cy="95" rx="6" ry="4.5" fill="#2D2320" />
      {mood === 'eating'
        ? <ellipse cx="92" cy="104" rx="4" ry="5" fill="#8F4B47" />
        : <path d="M85 104q7 7 14 0" fill="none" stroke="#4B352B" strokeWidth="2.2" strokeLinecap="round" />}

      {mood === 'love' && (
        <g fill="#DFA5A2" opacity="0.72"><ellipse cx="55" cy="97" rx="7" ry="4" /><ellipse cx="129" cy="97" rx="7" ry="4" /></g>
      )}
      {mood === 'eating' && <g><circle cx="92" cy="151" r="9" fill="#D95D59" /><path d="M92 142q4-7 8-4" fill="none" stroke="#6C774A" strokeWidth="2" /></g>}
      {mood === 'playing' && <g><circle cx="92" cy="153" r="10" fill="#D9B850" /><path d="M86 145q7 8 0 16M98 145q-7 8 0 16" fill="none" stroke="#FFF8DD" strokeWidth="1.5" /></g>}

      {/* Low lilac cap with a short brim, as in the original illustration. */}
      {equippedCap && equippedCap !== 'cap_gold' && (
        <g>
          <path d="M61 57c1-19 15-28 31-28s30 9 31 28Z" fill={capColor} />
          <path d="M55 58q35 8 74 0-7-9-26-10H73q-11 1-18 10Z" fill={capDarker} />
          <path d="M92 31v25" stroke={capDarker} strokeWidth="1.5" opacity="0.55" />
          <circle cx="92" cy="31" r="3.5" fill={capDarker} />
        </g>
      )}
      {equippedCap === 'cap_gold' && <path d="M59 59 53 35l18 11 21-22 21 22 18-11-6 24Z" fill="#D6AE42" stroke="#9D7825" strokeWidth="2" />}

      {equippedGlasses && (equippedGlasses === 'glasses_round' ? (
        <g fill="#FFF" fillOpacity="0.18" stroke="#463A38" strokeWidth="2.5">
          <circle cx="69" cy="81" r="11" /><circle cx="115" cy="81" r="11" /><path d="M80 81h24" />
        </g>
      ) : (
        <g fill="#2E3031" stroke="#202222" strokeWidth="2">
          <path d="M57 74h24v8c0 10-24 10-24 0Z" /><path d="M103 74h24v8c0 10-24 10-24 0Z" /><path d="M81 78h22" />
        </g>
      ))}
    </svg>
  );
};

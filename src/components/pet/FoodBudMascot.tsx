import React from 'react';

export type FoodBudMood = 'happy' | 'love' | 'eating' | 'sleeping' | 'playing';

export interface FoodBudMascotProps {
  mood?: FoodBudMood;
  petLevel?: number;
  equippedCap?: string | null;
  equippedGlasses?: string | null;
  equippedClothes?: string | null;
  capColor?: string;
  capDarker?: string;
  className?: string;
  headOnly?: boolean;
  isBlinking?: boolean;
  isHappyBlink?: boolean;
}

export const FoodBudMascot: React.FC<FoodBudMascotProps> = ({
  mood = 'happy',
  petLevel = 1,
  equippedCap = 'cap_lilac',
  equippedGlasses = null,
  equippedClothes = null,
  capColor = '#DAB5DE',
  capDarker = '#B88EC0',
  className = 'w-[175px] h-[195px]',
  headOnly = false,
  isBlinking = false,
  isHappyBlink = false
}) => {
  // Clothing color resolution
  const clothingColor =
    equippedClothes === 'clothes_hoodie_emerald'
      ? '#487A63'
      : equippedClothes === 'clothes_vest_puffer'
      ? '#EA580C'
      : equippedClothes === 'clothes_shirt_striped'
      ? '#F8FAFC'
      : null;

  const isLilacCap = !equippedCap || equippedCap === 'cap_lilac';
  const isGoldCrown = equippedCap === 'cap_gold';
  const isBeanie = equippedCap === 'cap_beanie';
  const isHeadband = equippedCap === 'cap_headband';

  const isEyesClosed = isBlinking || mood === 'sleeping';
  const isJoyful = isHappyBlink || mood === 'love';

  return (
    <svg
      viewBox={headOnly ? '32 18 136 102' : '0 0 200 220'}
      className={`relative z-10 overflow-visible select-none ${className}`}
      role="img"
      aria-label="FoodBud, guaxinim fofo com boné lilás, máscara escura, barriguinha clara e cauda listrada"
    >
      <defs>
        {/* Soft ground contact shadow */}
        <radialGradient id="mascotShadowGradNew" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#46584D" stopOpacity="0.32" />
          <stop offset="70%" stopColor="#46584D" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#46584D" stopOpacity="0" />
        </radialGradient>

        {/* Tail stripe clip */}
        <clipPath id="tailClipNew">
          <path d="M 125 160 C 146 163 168 148 174 128 C 180 108 175 88 162 82 C 152 77 141 84 144 98 C 147 114 141 128 121 136 Z" />
        </clipPath>
      </defs>

      {!headOnly && (
        <>
          {/* 1. Ground Contact Shadow */}
          <ellipse cx="100" cy="204" rx="52" ry="9" fill="url(#mascotShadowGradNew)" />

          {/* 2. Striped Tail (Curving upward on the right side) */}
          <g>
            <path
              d="M 125 160 C 146 163 168 148 174 128 C 180 108 175 88 162 82 C 152 77 141 84 144 98 C 147 114 141 128 121 136 Z"
              fill="#AB7A5A"
            />
            <g clipPath="url(#tailClipNew)">
              {/* Tip dark band */}
              <ellipse cx="160" cy="86" rx="16" ry="11" fill="#80563E" transform="rotate(-25 160 86)" />
              {/* Middle band 1 */}
              <path d="M 148 102 C 158 100 170 106 174 114 L 166 126 C 158 118 148 114 144 116 Z" fill="#80563E" />
              {/* Middle band 2 */}
              <path d="M 136 124 C 148 122 162 128 168 136 L 158 148 C 148 138 136 136 130 138 Z" fill="#80563E" />
              {/* Base band */}
              <path d="M 120 144 C 132 142 146 148 152 156 L 140 166 C 130 156 120 154 116 156 Z" fill="#80563E" />
            </g>
          </g>

          {/* 3. Chubby Pear-Shaped Body */}
          <path
            d="M 100 95 C 135 95 162 118 166 154 C 168 184 148 202 100 202 C 52 202 32 184 34 154 C 38 118 65 95 100 95 Z"
            fill="#AB7A5A"
          />

          {/* 4. Large Cream Belly (or Full Torso Clothing) */}
          {clothingColor ? (
            <g>
              {/* Full Torso Clothing Base fitting the chubby raccoon body */}
              <path
                d="M 100 95 C 135 95 162 118 166 154 C 168 184 148 202 100 202 C 52 202 32 184 34 154 C 38 118 65 95 100 95 Z"
                fill={clothingColor}
              />

              {/* A. Striped Shirt details */}
              {equippedClothes === 'clothes_shirt_striped' && (
                <g>
                  {/* Rounded collar neckline */}
                  <path d="M 76 96 C 84 104 116 104 124 96" stroke="#2563EB" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  {/* Horizontal sailor stripes spanning full body width */}
                  <g fill="none" stroke="#2563EB" strokeWidth="4.5" strokeLinecap="round">
                    <path d="M 50 118 Q 100 128 150 118" />
                    <path d="M 40 136 Q 100 146 160 136" />
                    <path d="M 36 154 Q 100 164 164 154" />
                    <path d="M 40 172 Q 100 182 160 172" />
                    <path d="M 52 188 Q 100 196 148 188" />
                  </g>
                  {/* Hem trim */}
                  <path d="M 58 196 Q 100 202 142 196" stroke="#1D4ED8" strokeWidth="2.5" fill="none" />
                </g>
              )}

              {/* B. Emerald Hoodie details */}
              {equippedClothes === 'clothes_hoodie_emerald' && (
                <g>
                  {/* Hood collar fold around neck */}
                  <path
                    d="M 68 95 C 76 106 124 106 132 95 C 138 104 130 113 100 113 C 70 113 62 104 68 95 Z"
                    fill="#3B6451"
                  />
                  {/* Central zipper */}
                  <line x1="100" y1="106" x2="100" y2="156" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Drawstrings */}
                  <path d="M 93 109 L 91 130" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="91" cy="131" r="1.5" fill="#CBD5E1" />
                  <path d="M 107 109 L 109 130" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="109" cy="131" r="1.5" fill="#CBD5E1" />
                  {/* Kangaroo front pouch pocket */}
                  <path
                    d="M 66 156 H 134 L 126 188 H 74 Z"
                    fill="#3B6451"
                    stroke="#2D4E3F"
                    strokeWidth="1.5"
                  />
                  {/* Pocket opening cuts */}
                  <path d="M 66 156 L 74 188" stroke="#487A63" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 134 156 L 126 188" stroke="#487A63" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Bottom ribbed waistband */}
                  <path
                    d="M 48 190 C 64 200 136 200 152 190 L 146 198 C 130 204 70 204 54 198 Z"
                    fill="#3B6451"
                  />
                </g>
              )}

              {/* C. Puffer Vest details */}
              {equippedClothes === 'clothes_vest_puffer' && (
                <g>
                  {/* Puffy high neck collar */}
                  <path d="M 68 95 C 78 103 122 103 132 95 L 136 103 C 124 112 76 112 64 103 Z" fill="#9A3412" />
                  {/* Quilted puffy horizontal section seams spanning full torso */}
                  <g fill="none" stroke="#9A3412" strokeWidth="3" strokeLinecap="round">
                    <path d="M 48 120 Q 100 130 152 120" />
                    <path d="M 38 142 Q 100 152 162 142" />
                    <path d="M 36 164 Q 100 174 164 164" />
                    <path d="M 45 184 Q 100 194 155 184" />
                  </g>
                  {/* Dark heavy front zipper */}
                  <line x1="100" y1="98" x2="100" y2="198" stroke="#1C1917" strokeWidth="3" />
                  <circle cx="100" cy="104" r="3" fill="#D4D4D8" stroke="#0F172A" strokeWidth="1" />
                </g>
              )}
            </g>
          ) : (
            /* Natural soft cream belly */
            <ellipse cx="100" cy="164" rx="40" ry="30" fill="#E7CB9C" />
          )}

          {/* Gold Bandana / Red Winter Scarf */}
          {equippedClothes === 'clothes_bandana_gold' && (
            <g>
              {/* Golden neck collar band */}
              <path d="M 52 100 Q 100 116 148 100 L 144 110 Q 100 126 56 110 Z" fill="#CA8A04" />
              {/* Main triangular drape */}
              <path
                d="M 56 106 Q 100 122 144 106 L 100 162 Z"
                fill="#EAB308"
                stroke="#CA8A04"
                strokeWidth="1.8"
              />
              <path d="M 72 112 Q 100 128 128 112" stroke="#FDE047" strokeWidth="2" fill="none" />
              <circle cx="100" cy="132" r="4.5" fill="#EF4444" stroke="#991B1B" strokeWidth="1" />
              <path d="M 100 124 L 100 140 M 92 132 L 108 132" stroke="#FDE047" strokeWidth="1.2" />
            </g>
          )}
          {equippedClothes === 'clothes_scarf_red' && (
            <g>
              {/* Plush Winter Red Scarf wrapped around neck */}
              <path
                d="M 52 100 C 64 120 136 120 148 100 C 154 112 146 126 134 130 C 112 136 88 136 66 130 C 56 126 46 112 52 100 Z"
                fill="#DC2626"
                stroke="#991B1B"
                strokeWidth="2"
              />
              <ellipse cx="80" cy="118" rx="7" ry="5.5" fill="#B91C1C" />
              <path d="M 74 120 L 68 174 C 68 180 86 180 86 174 L 88 124 Z" fill="#B91C1C" stroke="#991B1B" strokeWidth="1" />
              <path d="M 84 122 L 80 164 C 80 169 96 169 96 164 L 98 124 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1" />
              <line x1="71" y1="174" x2="71" y2="182" stroke="#F87171" strokeWidth="2" strokeLinecap="round" />
              <line x1="76" y1="175" x2="76" y2="183" stroke="#F87171" strokeWidth="2" strokeLinecap="round" />
              <line x1="81" y1="175" x2="81" y2="183" stroke="#F87171" strokeWidth="2" strokeLinecap="round" />
              <line x1="84" y1="164" x2="84" y2="171" stroke="#F87171" strokeWidth="2" strokeLinecap="round" />
              <line x1="89" y1="165" x2="89" y2="172" stroke="#F87171" strokeWidth="2" strokeLinecap="round" />
              <line x1="93" y1="164" x2="93" y2="171" stroke="#F87171" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}

          {/* Level Badges on Chest when not wearing full clothes */}
          {!equippedClothes && petLevel >= 2 && (
            <path d="M 70 114 Q 100 126 130 114 L 132 122 Q 100 134 68 122 Z" fill="#B86870" />
          )}
          {!equippedClothes && petLevel >= 3 && (
            <circle cx="100" cy="128" r="6" fill="#D9B854" stroke="#B89B38" strokeWidth="1" />
          )}

          {/* 5. Dark Paws Resting on Belly (Exact placement from reference photo) */}
          <ellipse cx="74" cy="153" rx="9.5" ry="7" fill="#80563E" transform="rotate(14 74 153)" />
          <ellipse cx="126" cy="153" rx="9.5" ry="7" fill="#80563E" transform="rotate(-14 126 153)" />

          {/* 6. Dark Feet at Bottom */}
          <ellipse cx="73" cy="198" rx="15" ry="8" fill="#80563E" />
          <ellipse cx="127" cy="198" rx="15" ry="8" fill="#80563E" />
        </>
      )}

      {/* 7. Rounded Ears (With Cream Inner) */}
      {/* Left Ear */}
      <path
        d="M 64 76 C 50 76 41 62 43 45 C 45 29 54 20 64 20 C 74 20 81 31 80 48 C 79 64 74 76 64 76 Z"
        fill="#80563E"
      />
      <path
        d="M 64 67 C 55 67 49 57 50 45 C 52 35 57 28 64 28 C 71 28 75 35 74 46 C 73 57 70 67 64 67 Z"
        fill="#E7CB9C"
      />

      {/* Right Ear */}
      <path
        d="M 136 76 C 150 76 159 62 157 45 C 155 29 146 20 136 20 C 126 20 119 31 120 48 C 121 64 126 76 136 76 Z"
        fill="#80563E"
      />
      <path
        d="M 136 67 C 145 67 151 57 150 45 C 148 35 143 28 136 28 C 129 28 125 35 126 46 C 127 57 130 67 136 67 Z"
        fill="#E7CB9C"
      />

      {/* 8. Round Head Base */}
      <ellipse cx="100" cy="84" rx="54" ry="34" fill="#AB7A5A" />

      {/* 9. Separate Dark Raccoon Eye Mask Patches */}
      <path
        d="M 63 78 C 52 82 48 90 48 98 C 48 104 51 108 55 110 C 62 112 72 111 78 106 C 81 103 82 98 84 94 C 88 94 92 90 91 85 C 90 80 84 76 74 76 C 69 76 66 77 63 78 Z"
        fill="#80563E"
      />
      <path
        d="M 137 78 C 148 82 152 90 152 98 C 152 104 149 108 145 110 C 138 112 128 111 122 106 C 119 103 118 98 116 94 C 112 94 108 90 109 85 C 110 80 116 76 126 76 C 131 76 134 77 137 78 Z"
        fill="#80563E"
      />

      {/* 10. Light Cream Eyebrow Marks */}
      <ellipse cx="68" cy="73" rx="7" ry="3.5" fill="#E7CB9C" transform="rotate(-12 68 73)" />
      <ellipse cx="132" cy="73" rx="7" ry="3.5" fill="#E7CB9C" transform="rotate(12 132 73)" />

      {/* 11. Cream Snout & Dark Button Nose */}
      <ellipse cx="100" cy="108" rx="20.5" ry="8.5" fill="#E7CB9C" />
      <ellipse cx="100" cy="104" rx="6" ry="4.2" fill="#3A2D32" />

      {/* 12. Mouth / Expression */}
      {mood === 'eating' ? (
        <ellipse cx="100" cy="112" rx="4" ry="4.5" fill="#8F4B47" />
      ) : isJoyful ? (
        <path d="M 95 110 Q 100 114 105 110" fill="none" stroke="#3A2D32" strokeWidth="1.8" strokeLinecap="round" />
      ) : null}

      {/* 13. Rosy Cheeks when in Love / Joyful */}
      {isJoyful && (
        <g fill="#F472B6" opacity="0.65">
          <ellipse cx="58" cy="98" rx="7" ry="4.5" />
          <ellipse cx="142" cy="98" rx="7" ry="4.5" />
        </g>
      )}

      {/* 14. Eyes & Expressions */}
      {isEyesClosed ? (
        /* Peaceful Sleeping / Blinking Arcs */
        <g fill="none" stroke="#3A2D32" strokeWidth="3" strokeLinecap="round">
          <path d="M 64 91 Q 71 97 78 91" />
          <path d="M 122 91 Q 129 97 136 91" />
        </g>
      ) : isJoyful ? (
        /* Happy squinty curved arcs */
        <g fill="none" stroke="#3A2D32" strokeWidth="3" strokeLinecap="round">
          <path d="M 64 93 Q 71 87 78 93" />
          <path d="M 122 93 Q 129 87 136 93" />
        </g>
      ) : (
        /* Adorable Solid Dark Bead Eyes from Reference Image (NO white glare) */
        <g>
          <circle cx="71" cy="91" r="5.3" fill="#3A2D32" />
          <circle cx="129" cy="91" r="5.3" fill="#3A2D32" />
        </g>
      )}

      {/* 15. Action props (Food when eating, Ball when playing) */}
      {!headOnly && mood === 'eating' && (
        <g>
          <circle cx="100" cy="150" r="9" fill="#DC2626" />
          <path d="M 100 141 Q 104 134 108 137" fill="none" stroke="#65A30D" strokeWidth="2" />
        </g>
      )}
      {!headOnly && mood === 'playing' && (
        <g>
          <circle cx="100" cy="152" r="10" fill="#EAB308" />
          <path d="M 94 144 Q 101 152 94 160 M 106 144 Q 99 152 106 160" fill="none" stroke="#FEF08A" strokeWidth="1.5" />
        </g>
      )}

      {/* 16. HEADWEAR / HATS */}
      {/* A. Lilac Cap (Default or equipped, matching the reference photo) */}
      {isLilacCap && (
        <g>
          {/* Cap Crown / Dome */}
          <path
            d="M 70 54 C 71 33 83 23 100 23 C 117 23 129 33 130 54 Z"
            fill={capColor}
          />
          {/* Panel seam lines */}
          <path d="M 100 23 L 100 48" stroke="#A277AB" strokeWidth="1.5" opacity="0.6" />
          {/* Cap Top Button */}
          <ellipse cx="100" cy="23" rx="3.5" ry="2.2" fill={capDarker} />
          {/* Cap Visor / Brim turned backwards */}
          <path
            d="M 65 54 C 76 61 124 61 135 54 C 129 48 116 45 100 45 C 84 45 71 48 65 54 Z"
            fill={capDarker}
          />
        </g>
      )}

      {/* B. Colored Sports Caps (Blue / Green) */}
      {equippedCap && (equippedCap === 'cap_blue' || equippedCap === 'cap_green') && (
        <g>
          <path d="M 70 54 C 71 33 83 23 100 23 C 117 23 129 33 130 54 Z" fill={capColor} />
          <line x1="100" y1="23" x2="100" y2="48" stroke={capDarker} strokeWidth="1.5" opacity="0.6" />
          <circle cx="100" cy="23" r="3" fill={capDarker} />
          <path d="M 65 54 C 76 61 124 61 135 54 C 129 48 116 45 100 45 C 84 45 71 48 65 54 Z" fill={capDarker} />
        </g>
      )}

      {/* C. Winter Beanie with Pom-pom */}
      {isBeanie && (
        <g>
          <path d="M 66 54 C 68 30 82 20 100 20 C 118 20 132 30 134 54 Z" fill="#2563EB" />
          <path d="M 62 55 Q 100 62 138 55 L 136 47 Q 100 54 64 47 Z" fill="#1D4ED8" />
          <line x1="84" y1="26" x2="84" y2="48" stroke="#1D4ED8" strokeWidth="1.5" opacity="0.7" />
          <line x1="100" y1="20" x2="100" y2="50" stroke="#1D4ED8" strokeWidth="1.5" opacity="0.7" />
          <line x1="116" y1="26" x2="116" y2="48" stroke="#1D4ED8" strokeWidth="1.5" opacity="0.7" />
          <circle cx="100" cy="16" r="7.5" fill="#F8FAFC" />
          <circle cx="97" cy="14" r="6" fill="#F1F5F9" />
        </g>
      )}

      {/* D. Athletic Headband */}
      {isHeadband && (
        <g>
          <path d="M 58 56 Q 100 64 142 56 L 140 48 Q 100 56 60 48 Z" fill="#10B981" />
          <line x1="60" y1="52" x2="140" y2="52" stroke="#ECFDF5" strokeWidth="1.5" />
        </g>
      )}

      {/* E. Golden Crown of Champion */}
      {isGoldCrown && (
        <g>
          <path
            d="M 68 53 L 62 26 L 80 38 L 100 14 L 120 38 L 138 26 L 132 53 Z"
            fill="#F59E0B"
            stroke="#B45309"
            strokeWidth="1.8"
          />
          <rect x="66" y="47" width="68" height="6" rx="3" fill="#D97706" stroke="#92400E" strokeWidth="1" />
          <circle cx="100" cy="14" r="3.5" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1" />
          <circle cx="62" cy="26" r="2.8" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
          <circle cx="138" cy="26" r="2.8" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
          <circle cx="80" cy="38" r="2.5" fill="#10B981" stroke="#047857" strokeWidth="1" />
          <circle cx="120" cy="38" r="2.5" fill="#10B981" stroke="#047857" strokeWidth="1" />
        </g>
      )}

      {/* 17. EYEWEAR / GLASSES */}
      {equippedGlasses && (
        <g>
          {equippedGlasses === 'glasses_sun' && (
            /* Retro Sunglasses */
            <g fill="#0F172A" stroke="#020617" strokeWidth="2">
              <path d="M 58 85 H 84 V 97 C 84 105 58 105 58 97 Z" />
              <path d="M 116 85 H 142 V 97 C 142 105 116 105 116 97 Z" />
              <line x1="84" y1="89" x2="116" y2="89" stroke="#020617" strokeWidth="2.5" />
              <line x1="62" y1="88" x2="72" y2="98" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
              <line x1="120" y1="88" x2="130" y2="98" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
            </g>
          )}

          {equippedGlasses === 'glasses_round' && (
            /* Round Reader Glasses */
            <g fill="#FFFFFF" fillOpacity="0.2" stroke="#451A03" strokeWidth="2.2">
              <circle cx="71" cy="91" r="11" />
              <circle cx="129" cy="91" r="11" />
              <path d="M 82 91 H 118" />
              <path d="M 66 87 L 72 93" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
              <path d="M 124 87 L 130 93" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
            </g>
          )}

          {equippedGlasses === 'glasses_modern' && (
            /* Modern Urban Square Shades */
            <g fill="#1E293B" stroke="#0F172A" strokeWidth="2">
              <rect x="58" y="84" width="26" height="16" rx="4" />
              <rect x="116" y="84" width="26" height="16" rx="4" />
              <line x1="84" y1="91" x2="116" y2="91" stroke="#0F172A" strokeWidth="2.5" />
              <line x1="61" y1="87" x2="78" y2="87" stroke="#38BDF8" strokeWidth="1.2" opacity="0.7" />
              <line x1="119" y1="87" x2="136" y2="87" stroke="#38BDF8" strokeWidth="1.2" opacity="0.7" />
            </g>
          )}
        </g>
      )}
    </svg>
  );
};

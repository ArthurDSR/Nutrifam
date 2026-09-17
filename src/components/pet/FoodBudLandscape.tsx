import React from 'react';

export type LandscapeSeason = 'spring' | 'summer' | 'autumn' | 'winter';
export type LandscapeTime = 'day' | 'sunset' | 'night';

interface FoodBudLandscapeProps {
  season: LandscapeSeason;
  timeOfDay: LandscapeTime;
}

const SCENE_PALETTES: Record<LandscapeTime, {
  skyTop: string;
  skyBottom: string;
  meadowTop: string;
  meadowBottom: string;
  cloud: string;
}> = {
  day: { skyTop: '#A9D4E7', skyBottom: '#E5EFE7', meadowTop: '#B8C8BB', meadowBottom: '#A9BAAD', cloud: '#FFFDFC' },
  sunset: { skyTop: '#B9AED0', skyBottom: '#EBC6A9', meadowTop: '#AAB7A6', meadowBottom: '#93A496', cloud: '#FFF4E9' },
  night: { skyTop: '#22333D', skyBottom: '#445A5A', meadowTop: '#465B51', meadowBottom: '#34493F', cloud: '#B9C4C5' }
};

const SEASON_COLORS: Record<LandscapeSeason, {
  left: string;
  leftDark: string;
  right: string;
  rightDark: string;
  fruit: string;
}> = {
  spring: { left: '#A9C88A', leftDark: '#8EAC70', right: '#D5A1AD', rightDark: '#BF8795', fruit: '#E68B83' },
  summer: { left: '#A4C47F', leftDark: '#86A866', right: '#A2BB75', rightDark: '#829B5C', fruit: '#F0A04B' },
  autumn: { left: '#B8C477', leftDark: '#98A35D', right: '#D88D42', rightDark: '#B97031', fruit: '#F29A45' },
  winter: { left: '#B1C978', leftDark: '#91AD60', right: '#DB9841', rightDark: '#BC7930', fruit: '#F49A40' }
};

export const FoodBudLandscape: React.FC<FoodBudLandscapeProps> = ({ season, timeOfDay }) => {
  const palette = SCENE_PALETTES[timeOfDay];
  const colors = SEASON_COLORS[season];
  const isWinter = season === 'winter';
  const isNight = timeOfDay === 'night';

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <svg viewBox="0 0 400 600" preserveAspectRatio="none" className="block w-full h-full">
        <defs>
          <linearGradient id="foodbudSkyFull" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.skyTop} />
            <stop offset="100%" stopColor={palette.skyBottom} />
          </linearGradient>
          <linearGradient id="foodbudGroundFull" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.meadowTop} />
            <stop offset="100%" stopColor={palette.meadowBottom} />
          </linearGradient>
          <radialGradient id="foodbudSunGlow">
            <stop offset="0%" stopColor="#FFF8A9" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFF8A9" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* The sky is the base layer for the complete FoodBud screen. */}
        <rect width="400" height="600" fill="url(#foodbudSkyFull)" />

        {isNight ? (
          <g>
            <g fill="#F7EDC0" opacity="0.85">
              <circle cx="42" cy="144" r="1.5" /><circle cx="106" cy="183" r="1" />
              <circle cx="177" cy="129" r="1.3" /><circle cx="245" cy="172" r="1.1" />
              <circle cx="352" cy="133" r="1.5" /><circle cx="304" cy="210" r="1" />
            </g>
            <path d="M332 134a19 19 0 1 0 22 29 23 23 0 1 1-22-29Z" fill="#F2DFA0" />
          </g>
        ) : (
          <>
            {/* Friendly sun from the supplied reference: round face with a tiny blue flower. */}
            <g transform="translate(337 150)">
              <circle r="37" fill="url(#foodbudSunGlow)" />
              <circle r="18" fill="#F8DD66" />
              <ellipse cx="-5.5" cy="-1" rx="1.4" ry="2" fill="#7B6B43" />
              <ellipse cx="5.5" cy="-1" rx="1.4" ry="2" fill="#7B6B43" />
              <path d="M-3 6q3 2 6 0" fill="none" stroke="#B49143" strokeWidth="1.3" strokeLinecap="round" />
              <g transform="translate(-12 -13)">
                <circle cx="-3" cy="0" r="3" fill="#76BFD2" />
                <circle cx="3" cy="0" r="3" fill="#76BFD2" />
                <circle cy="-3" r="3" fill="#8DCBDA" />
                <circle cy="3" r="3" fill="#8DCBDA" />
                <circle r="2" fill="#E8B64E" />
                <path d="M3 4q5 3 4 8" fill="none" stroke="#79A06A" strokeWidth="1.5" />
              </g>
            </g>

            <g fill={palette.cloud} opacity="0.97">
              <path d="M12 176c1-10 11-16 21-12 6-16 28-17 36-2 13-6 28 2 29 14Z" />
              <path d="M91 216c1-7 9-12 16-9 5-11 21-12 27-1 9-4 19 2 20 10Z" />
              <path d="M238 205c1-9 11-15 20-11 6-15 27-16 35-2 11-5 25 2 26 13Z" />
            </g>
          </>
        )}

        {/* Ground reaches the very bottom, including the area behind the controls. */}
        <path d="M0 314Q95 300 200 310T400 304V600H0Z" fill="url(#foodbudGroundFull)" />

        {/* Fence sits behind the mascot and remains above the control dock. */}
        <g opacity="0.97">
          <rect x="0" y="354" width="400" height="5" rx="2" fill="#FFFDFC" />
          <rect x="0" y="372" width="400" height="5" rx="2" fill="#FFFDFC" />
          {Array.from({ length: 24 }, (_, index) => {
            const x = index * 18 - 8;
            return <path key={x} d={`M${x} 348l5-8 5 8v37H${x}Z`} fill="#FFFDFC" />;
          })}
        </g>

        {/* Tall fruit tree, kept fully to the left of the mascot. */}
        <g transform="translate(0 72)">
          <path d="M65 366c5-65 4-135 7-210h11c3 73 2 145 8 210Z" fill="#7B5939" />
          <path d="M77 276 47 225M78 300l35-49M77 239l-18-39" fill="none" stroke="#7B5939" strokeWidth="6" strokeLinecap="round" />
          <ellipse cx="78" cy="213" rx="47" ry="72" fill={colors.left} />
          <ellipse cx="42" cy="257" rx="25" ry="19" fill={colors.leftDark} />
          <ellipse cx="115" cy="244" rx="24" ry="18" fill={colors.leftDark} />
          <ellipse cx="119" cy="300" rx="28" ry="20" fill={colors.left} />
          {isWinter && (
            <g fill="#FFFDFC">
              <path d="M31 199c3-25 25-40 47-38 24 1 42 16 45 38-11 10-24 4-35 10-13-7-25 5-38-3-8 4-15 1-19-7Z" />
              <path d="M17 252c3-13 16-21 29-20 13 0 24 7 27 20-9 7-18 2-26 8-10-6-20 3-30-3Z" />
              <path d="M92 293c3-13 16-20 29-19 13 0 24 7 27 19-9 8-18 3-27 8-9-5-20 3-29-2Z" />
            </g>
          )}
          <circle cx="50" cy="276" r="7" fill={colors.fruit} /><path d="M49 268q6-5 10 0" fill="none" stroke="#728B55" strokeWidth="2" />
          <circle cx="118" cy="315" r="7" fill="#D95D59" /><path d="M116 307q6-5 10 0" fill="none" stroke="#728B55" strokeWidth="2" />
        </g>

        {/* Broad ochre tree, roots visible above the interaction controls. */}
        <g transform="translate(191 84)">
          <path d="M119 345c6-48 5-80 10-106 13-12 27-22 45-30-11 15-23 28-37 39 0 28 4 61 10 97Z" fill="#765035" />
          <path d="M132 258c-16-17-38-28-59-33M134 279c17-15 37-22 56-23" fill="none" stroke="#765035" strokeWidth="8" strokeLinecap="round" />
          <ellipse cx="68" cy="201" rx="48" ry="35" fill={colors.right} />
          <ellipse cx="38" cy="245" rx="37" ry="29" fill={colors.rightDark} />
          <ellipse cx="130" cy="238" rx="72" ry="47" fill={colors.right} />
          <ellipse cx="85" cy="283" rx="51" ry="34" fill={colors.rightDark} />
          <ellipse cx="181" cy="280" rx="47" ry="32" fill={colors.rightDark} />
          {isWinter && (
            <g fill="#FFFDFC">
              <path d="M20 193c6-24 28-35 50-34 25 0 43 13 47 34-13 10-25 4-36 10-13-7-26 2-39-4-9 3-16 0-22-6Z" />
              <path d="M75 224c8-30 43-45 75-43 31 1 54 17 59 43-16 11-33 5-48 12-19-8-37 3-53-4-14 4-24 1-33-8Z" />
              <path d="M38 271c5-19 26-28 47-27 20 0 37 10 41 27-12 8-23 3-33 9-13-6-26 3-37-3-8 3-14 0-18-6Z" />
              <path d="M151 270c5-18 25-27 45-26 19 0 35 10 39 26-11 8-21 3-31 8-12-6-24 3-34-3-8 2-14 0-19-5Z" />
            </g>
          )}
          {[[49,258], [99,274], [151,250], [188,291]].map(([cx, cy]) => (
            <g key={`${cx}-${cy}`}><circle cx={cx} cy={cy} r="7" fill={colors.fruit} /><path d={`M${cx - 2} ${cy - 7}q5-5 10 0`} fill="none" stroke="#71814C" strokeWidth="2" /></g>
          ))}
        </g>

        {/* Small decorations stay in the visible side pockets, never under the buttons. */}
        {isWinter ? (
          <g transform="translate(57 445)">
            <ellipse cy="16" rx="12" ry="13" fill="#FFFDFC" /><circle r="9" fill="#FFFDFC" />
            <circle cx="-3" cy="-2" r="1.4" fill="#38342F" /><circle cx="3" cy="-2" r="1.4" fill="#38342F" />
            <path d="M0 0l-8 3h8Z" fill="#E68B3B" /><path d="M-8 7q8 6 16 0" fill="none" stroke="#B54D4D" strokeWidth="4" />
          </g>
        ) : null}
        <g transform="translate(348 397)" fill="#FFFDFC">
          <circle cx="-6" r="6" /><circle cx="6" r="6" /><circle cy="-6" r="6" /><circle cy="6" r="6" />
          <circle r="4.5" fill="#E4B64C" />
        </g>
      </svg>
    </div>
  );
};

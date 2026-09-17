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
  day: {
    skyTop: '#B9DCEB',
    skyBottom: '#E8F0E8',
    meadowTop: '#B7C7BA',
    meadowBottom: '#AABBAE',
    cloud: '#FFFDF8'
  },
  sunset: {
    skyTop: '#C6B5CF',
    skyBottom: '#EAC7AE',
    meadowTop: '#AAB6A4',
    meadowBottom: '#91A294',
    cloud: '#FFF4E9'
  },
  night: {
    skyTop: '#23323C',
    skyBottom: '#435557',
    meadowTop: '#455A50',
    meadowBottom: '#34493F',
    cloud: '#AEBCC0'
  }
};

const SEASON_COLORS: Record<LandscapeSeason, {
  leftTree: string;
  leftTreeDark: string;
  rightTree: string;
  rightTreeDark: string;
  fruit: string;
}> = {
  spring: {
    leftTree: '#A9C58B',
    leftTreeDark: '#91AE75',
    rightTree: '#D6A6AE',
    rightTreeDark: '#C28E98',
    fruit: '#E78D83'
  },
  summer: {
    leftTree: '#9FBE7D',
    leftTreeDark: '#86A667',
    rightTree: '#9DB873',
    rightTreeDark: '#829D5E',
    fruit: '#F1A34E'
  },
  autumn: {
    leftTree: '#B8BF76',
    leftTreeDark: '#9CA45E',
    rightTree: '#D38B42',
    rightTreeDark: '#B97232',
    fruit: '#F29A45'
  },
  winter: {
    leftTree: '#AFC779',
    leftTreeDark: '#92AD61',
    rightTree: '#D99A43',
    rightTreeDark: '#BD7D31',
    fruit: '#F49B42'
  }
};

export const FoodBudLandscape: React.FC<FoodBudLandscapeProps> = ({ season, timeOfDay }) => {
  const palette = SCENE_PALETTES[timeOfDay];
  const seasonColor = SEASON_COLORS[season];
  const isWinter = season === 'winter';
  const isNight = timeOfDay === 'night';

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <defs>
          <linearGradient id="foodbudSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.skyTop} />
            <stop offset="100%" stopColor={palette.skyBottom} />
          </linearGradient>
          <linearGradient id="foodbudMeadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.meadowTop} />
            <stop offset="100%" stopColor={palette.meadowBottom} />
          </linearGradient>
        </defs>

        <rect width="400" height="500" fill="url(#foodbudSky)" />

        {isNight ? (
          <g fill="#F5E9B8" opacity="0.8">
            <circle cx="42" cy="65" r="1.5" />
            <circle cx="106" cy="104" r="1" />
            <circle cx="176" cy="52" r="1.3" />
            <circle cx="242" cy="96" r="1.1" />
            <circle cx="337" cy="61" r="1.5" />
            <path d="M326 34a17 17 0 1 0 19 26 20 20 0 1 1-19-26Z" fill="#F2DF9F" />
          </g>
        ) : (
          <g fill={palette.cloud} opacity="0.96">
            <path d="M17 111c1-9 10-14 18-11 5-14 25-15 32-2 11-5 25 2 26 13Z" />
            <path d="M99 137c1-7 8-11 15-9 5-10 20-10 25 0 8-3 17 2 18 9Z" />
            <path d="M242 112c1-8 10-13 18-10 6-13 24-14 31-2 10-4 22 2 23 12Z" />
            <path d="M185 164c1-6 7-9 13-7 4-9 17-10 22-1 7-3 16 2 16 8Z" />
          </g>
        )}

        <g transform="translate(0 6)">
          <path d="M0 250H400V500H0Z" fill="url(#foodbudMeadow)" />

          <g opacity="0.96">
            <rect x="0" y="244" width="400" height="5" rx="2" fill="#FFFDF8" />
            <rect x="0" y="258" width="400" height="5" rx="2" fill="#FFFDF8" />
            {Array.from({ length: 24 }, (_, index) => {
              const x = index * 18 - 7;
              return <path key={x} d={`M${x} 239l5-7 5 7v29H${x}Z`} fill="#FFFDF8" />;
            })}
          </g>

          {/* Tall green fruit tree from the reference */}
          <g transform="translate(8 -5)">
            <path d="M63 287c4-52 3-105 6-154h10c3 50 2 102 7 154Z" fill="#795A3A" />
            <path d="M74 207 48 170M75 225l30-39M74 183l-15-28" fill="none" stroke="#795A3A" strokeWidth="5" strokeLinecap="round" />
            <ellipse cx="74" cy="157" rx="43" ry="59" fill={seasonColor.leftTree} />
            <ellipse cx="44" cy="188" rx="23" ry="17" fill={seasonColor.leftTreeDark} />
            <ellipse cx="108" cy="179" rx="22" ry="16" fill={seasonColor.leftTreeDark} />
            <ellipse cx="111" cy="222" rx="25" ry="18" fill={seasonColor.leftTree} />
            {isWinter && (
              <g fill="#FFFDF8">
                <path d="M34 145c3-22 22-35 41-33 21 1 36 14 39 33-10 9-22 3-31 9-12-7-23 4-34-3-7 3-12 1-15-6Z" />
                <path d="M20 183c3-12 14-18 26-17 11 0 21 6 23 17-8 7-15 2-23 7-8-5-17 3-26-2Z" />
                <path d="M88 215c3-12 14-18 25-17 12 0 21 6 24 17-8 7-16 2-23 7-9-5-18 3-26-2Z" />
              </g>
            )}
            <circle cx="50" cy="204" r="7" fill={seasonColor.fruit} />
            <path d="M49 196q6-5 9 0" fill="none" stroke="#728B55" strokeWidth="2" />
            <circle cx="110" cy="234" r="7" fill="#D85C59" />
            <path d="M108 226q6-5 9 0" fill="none" stroke="#728B55" strokeWidth="2" />
          </g>

          {/* Wide ochre orchard tree from the reference */}
          <g transform="translate(195 8)">
            <path d="M116 286c5-38 4-61 8-82 12-10 24-19 40-25-10 12-20 22-32 31 0 23 3 49 8 76Z" fill="#745035" />
            <path d="M128 219c-14-14-34-23-52-27M129 236c15-12 32-18 49-19" fill="none" stroke="#745035" strokeWidth="7" strokeLinecap="round" />
            <ellipse cx="69" cy="171" rx="46" ry="33" fill={seasonColor.rightTree} />
            <ellipse cx="42" cy="208" rx="35" ry="27" fill={seasonColor.rightTreeDark} />
            <ellipse cx="124" cy="204" rx="69" ry="43" fill={seasonColor.rightTree} />
            <ellipse cx="84" cy="239" rx="48" ry="31" fill={seasonColor.rightTreeDark} />
            <ellipse cx="174" cy="238" rx="45" ry="30" fill={seasonColor.rightTreeDark} />
            {isWinter && (
              <g fill="#FFFDF8">
                <path d="M24 162c5-22 26-32 47-31 23 0 40 12 44 31-13 9-23 4-34 9-11-6-24 2-36-4-8 2-15 0-21-5Z" />
                <path d="M73 192c7-27 39-41 70-39 28 1 50 15 55 39-15 10-31 4-44 11-18-7-34 3-49-4-13 4-22 1-32-7Z" />
                <path d="M38 228c5-17 24-25 43-24 18 0 34 9 38 24-11 8-21 3-30 8-12-6-24 3-34-3-7 2-12 0-17-5Z" />
                <path d="M145 228c5-16 23-24 41-23 17 0 31 8 35 23-10 7-19 3-28 7-11-5-22 2-31-3-7 2-12 0-17-4Z" />
              </g>
            )}
            {[['53','216'], ['96','229'], ['142','210'], ['176','246']].map(([cx, cy]) => (
              <g key={`${cx}-${cy}`}>
                <circle cx={cx} cy={cy} r="7" fill={seasonColor.fruit} />
                <path d={`M${Number(cx) - 2} ${Number(cy) - 7}q5-5 9 0`} fill="none" stroke="#71814C" strokeWidth="2" />
              </g>
            ))}
          </g>

          {isWinter ? (
            <g transform="translate(57 350)">
              <ellipse cx="0" cy="18" rx="12" ry="13" fill="#FFFDF8" />
              <circle cy="1" r="9" fill="#FFFDF8" />
              <circle cx="-3" cy="-1" r="1.4" fill="#38342F" />
              <circle cx="3" cy="-1" r="1.4" fill="#38342F" />
              <path d="M0 1l-8 3h8Z" fill="#E68B3B" />
              <path d="M-8 8q8 6 16 0" fill="none" stroke="#B54D4D" strokeWidth="4" />
            </g>
          ) : (
            <g transform="translate(58 365)" fill="#FFFDF8">
              <circle cx="-5" r="6" /><circle cx="5" r="6" /><circle cy="-5" r="6" /><circle cy="5" r="6" />
              <circle r="4" fill="#E4B64C" />
            </g>
          )}

          <g transform="translate(338 352)" fill="#FFFDF8">
            <circle cx="-6" r="6" /><circle cx="6" r="6" /><circle cy="-6" r="6" /><circle cy="6" r="6" />
            <circle r="4.5" fill="#E4B64C" />
          </g>
        </g>
      </svg>
    </div>
  );
};


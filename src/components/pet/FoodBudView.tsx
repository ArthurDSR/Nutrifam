import React, { useState, useEffect } from 'react';
import {
  X,
  Gem,
  Heart,
  Apple,
  Check,
  Moon,
  Sun,
  Sparkles,
  Smile,
  ArrowRight,
  Pencil
} from 'lucide-react';
import { useTheme } from '../../services/themeService';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type TimeOfDay = 'day' | 'sunset' | 'night';

// Calendário Oficial das Estações do Ano no Brasil (Hemisfério Sul)
const getCalendarSeason = (date: Date = new Date()): Season => {
  const month = date.getMonth(); // 0 a 11
  const day = date.getDate();
  const mmdd = (month + 1) * 100 + day;

  // Outono: 20 de Março a 20 de Junho
  if (mmdd >= 320 && mmdd <= 620) return 'autumn';
  // Inverno: 21 de Junho a 21 de Setembro
  if (mmdd >= 621 && mmdd <= 921) return 'winter';
  // Primavera: 22 de Setembro a 20 de Dezembro
  if (mmdd >= 922 && mmdd <= 1220) return 'spring';
  // Verão: 21 de Dezembro a 19 de Março
  return 'summer';
};

// Detecção Dinâmica do Período do Dia pelo Horário Local
const getTimeOfDay = (date: Date = new Date()): TimeOfDay => {
  const hours = date.getHours() + date.getMinutes() / 60;
  // Entardecer / Pôr do Sol: 17h30 às 18h45
  if (hours >= 17.5 && hours < 18.75) return 'sunset';
  // Dia: 06h00 às 17h30
  if (hours >= 6 && hours < 17.5) return 'day';
  // Noite: 18h45 às 06h00
  return 'night';
};

interface FoodBudViewProps {
  gems: number;
  petLevel?: number;
  petXp?: number;
  inventory?: string[];
  equippedCap?: string | null;
  equippedGlasses?: string | null;
  equippedClothes?: string | null;
  petName?: string;
  onSpendGems: (amount: number) => void;
  onUpdatePetProfile?: (updates: {
    inventory?: string[];
    equippedCap?: string | null;
    equippedGlasses?: string | null;
    equippedClothes?: string | null;
    petName?: string;
  }) => void;
  onNavigateToQuests?: () => void;
}

interface ShopItem {
  id: string;
  name: string;
  cost: number;
  type: 'cap' | 'glasses' | 'clothes';
  color?: string;
  darkColor?: string;
  icon: string;
  description: string;
}

export const FoodBudView: React.FC<FoodBudViewProps> = ({
  gems,
  petLevel = 1,
  petXp = 35,
  inventory: propInventory = ['cap_lilac'],
  equippedCap: propEquippedCap = 'cap_lilac',
  equippedGlasses: propEquippedGlasses = null,
  equippedClothes: propEquippedClothes = null,
  petName: propPetName,
  onSpendGems,
  onUpdatePetProfile,
  onNavigateToQuests
}) => {
  const { isDark, activeColor } = useTheme();

  // Manual interaction tracker
  const [hasManuallyInteracted, setHasManuallyInteracted] = useState(false);

  // Local mood state (by default at night, pet is peacefully sleeping!)
  const [mood, setMood] = useState<'happy' | 'love' | 'eating' | 'sleeping' | 'playing'>(() => {
    return getTimeOfDay() === 'night' ? 'sleeping' : 'happy';
  });
  const [petActionEffect, setPetActionEffect] = useState<string | null>(null);

  // Live Shop Preview / Provador Virtual state
  const [previewItem, setPreviewItem] = useState<ShopItem | null>(null);

  // Equipment state synced with props
  const [inventory, setInventory] = useState<string[]>(propInventory);
  const [equippedCap, setEquippedCap] = useState<string | null>(propEquippedCap);
  const [equippedGlasses, setEquippedGlasses] = useState<string | null>(propEquippedGlasses);
  const [equippedClothes, setEquippedClothes] = useState<string | null>(propEquippedClothes || null);

  // Pet Naming state
  const [petName, setPetName] = useState<string>(propPetName || '');
  const [showNamingModal, setShowNamingModal] = useState<boolean>(!propPetName || propPetName.trim() === '');
  const [namingInput, setNamingInput] = useState<string>('');

  // Wardrobe Fitting Room & Category state
  const [wardrobePreviewCap, setWardrobePreviewCap] = useState<string | null>(propEquippedCap);
  const [wardrobePreviewGlasses, setWardrobePreviewGlasses] = useState<string | null>(propEquippedGlasses);
  const [wardrobePreviewClothes, setWardrobePreviewClothes] = useState<string | null>(propEquippedClothes || null);
  const [wardrobeCategory, setWardrobeCategory] = useState<'all' | 'cap' | 'glasses' | 'clothes'>('all');

  useEffect(() => {
    setInventory(propInventory);
  }, [propInventory]);

  useEffect(() => {
    setEquippedCap(propEquippedCap);
    setWardrobePreviewCap(propEquippedCap);
  }, [propEquippedCap]);

  useEffect(() => {
    setEquippedGlasses(propEquippedGlasses);
    setWardrobePreviewGlasses(propEquippedGlasses);
  }, [propEquippedGlasses]);

  useEffect(() => {
    setEquippedClothes(propEquippedClothes || null);
    setWardrobePreviewClothes(propEquippedClothes || null);
  }, [propEquippedClothes]);

  useEffect(() => {
    if (propPetName) {
      setPetName(propPetName);
    }
  }, [propPetName]);

  // Modals
  const [showShop, setShowShop] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [showSeasonModal, setShowSeasonModal] = useState(false);

  // Day/Night & Season States (Synchronized with local clock and Brazilian calendar)
  const [isAutoTime, setIsAutoTime] = useState(true);
  const [currentSeason, setCurrentSeason] = useState<Season>(() => getCalendarSeason());
  const [currentTimeOfDay, setCurrentTimeOfDay] = useState<TimeOfDay>(() => getTimeOfDay());
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState<string>('');

  // Clock sync ticker (checks time every 30s in auto mode)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeFormatted(
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      );
      if (isAutoTime) {
        setCurrentSeason(getCalendarSeason(now));
        setCurrentTimeOfDay(getTimeOfDay(now));
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, [isAutoTime]);

  // Synchronize pet sleep state at night if user hasn't explicitly interacted
  useEffect(() => {
    if (!hasManuallyInteracted) {
      if (currentTimeOfDay === 'night') {
        setMood('sleeping');
      } else if (mood === 'sleeping') {
        setMood('happy');
      }
    }
  }, [currentTimeOfDay, hasManuallyInteracted]);

  // Floating particles
  const [floatingParticles, setFloatingParticles] = useState<{ id: number; text: string; x: number }[]>([]);

  // Shop Catalog (Focused on accessories & cosmetics)
  const shopCatalog: ShopItem[] = [
    {
      id: 'cap_blue',
      name: 'Boné Azul Esportivo',
      cost: 100,
      type: 'cap',
      color: '#0284c7',
      darkColor: '#0369a1',
      icon: '🧢',
      description: 'Boné aba curva estilizado para o Guaxinim atleta'
    },
    {
      id: 'cap_gold',
      name: 'Coroa Dourada de Campeão',
      cost: 250,
      type: 'cap',
      color: '#f59e0b',
      darkColor: '#d97706',
      icon: '👑',
      description: 'Coroa real cravejada com pedras preciosas'
    },
    {
      id: 'cap_green',
      name: 'Boné Verde Floresta',
      cost: 120,
      type: 'cap',
      color: '#16a34a',
      darkColor: '#15803d',
      icon: '🌿',
      description: 'Boné esportivo camuflagem para trilhas'
    },
    {
      id: 'cap_lilac',
      name: 'Boné Lilás Clássico',
      cost: 100,
      type: 'cap',
      color: '#A875B7',
      darkColor: '#9B66AA',
      icon: '🧢',
      description: 'Boné lilás tradicional com aba frontal e costura'
    },
    {
      id: 'glasses_sun',
      name: 'Óculos de Sol Retrô',
      cost: 150,
      type: 'glasses',
      icon: '🕶️',
      description: 'Proteção estilosa com lentes pretas'
    },
    {
      id: 'glasses_round',
      name: 'Óculos Redondos Intelectual',
      cost: 120,
      type: 'glasses',
      icon: '👓',
      description: 'Armação fina com lentes de leitura'
    },
    {
      id: 'clothes_hoodie_emerald',
      name: 'Moletom Esmeralda Fit',
      cost: 160,
      type: 'clothes',
      color: '#059669',
      darkColor: '#047857',
      icon: '🧥',
      description: 'Moletom quentinho com zíper e capuz esportivo'
    },
    {
      id: 'clothes_shirt_striped',
      name: 'Camisa Listrada Casual',
      cost: 140,
      type: 'clothes',
      color: '#3b82f6',
      darkColor: '#1d4ed8',
      icon: '👕',
      description: 'Camisa listrada clássica de algodão macio'
    },
    {
      id: 'clothes_vest_puffer',
      name: 'Colete Acolchoado Puffer',
      cost: 180,
      type: 'clothes',
      color: '#ea580c',
      darkColor: '#c2410c',
      icon: '🦺',
      description: 'Colete puffer aventureiro na cor laranja outono'
    },
    {
      id: 'clothes_bandana_gold',
      name: 'Bandana Real Ouro Imperial',
      cost: 130,
      type: 'clothes',
      color: '#eab308',
      darkColor: '#ca8a04',
      icon: '🧣',
      description: 'Bandana nobre de cetim com detalhes dourados'
    }
  ];

  const spawnParticle = (emoji: string) => {
    const id = Date.now() + Math.random();
    const x = Math.random() * 80 - 40;
    setFloatingParticles((prev) => [...prev, { id, text: emoji, x }]);
    setTimeout(() => {
      setFloatingParticles((prev) => prev.filter((p) => p.id !== id));
    }, 1200);
  };

  // Interactions (Zero XP exploits: XP comes exclusively from Quests!)
  const handlePetCarinho = () => {
    setHasManuallyInteracted(true);
    setMood('love');
    spawnParticle('❤️');
    spawnParticle('💖');
    setPetActionEffect('Você fez carinho no Guaxinim! 🥰');
    setTimeout(() => {
      setMood('happy');
      setPetActionEffect(null);
    }, 1800);
  };

  const handlePlayPet = () => {
    setHasManuallyInteracted(true);
    setMood('playing');
    spawnParticle('🎾');
    spawnParticle('✨');
    spawnParticle('⭐');
    const wasSleeping = mood === 'sleeping';
    setPetActionEffect(
      wasSleeping || currentTimeOfDay === 'night'
        ? 'O Guaxinim acordou animado para brincar com você! 🎾'
        : 'O Guaxinim deu pulos de alegria brincando com a bolinha! 🎾'
    );
    setTimeout(() => {
      setMood('happy');
      setPetActionEffect(null);
    }, 2400);
  };

  const handleFeedHealthy = () => {
    setHasManuallyInteracted(true);
    setMood('eating');
    spawnParticle('🍎');
    spawnParticle('🫐');
    setPetActionEffect('Nham nham! Fruta fresca deliciosa!');
    setTimeout(() => {
      setMood('happy');
      setPetActionEffect(null);
    }, 2000);
  };

  const handleToggleSleep = () => {
    setHasManuallyInteracted(true);
    if (mood === 'sleeping') {
      setMood('happy');
      spawnParticle('☀️');
      setPetActionEffect('O Guaxinim acordou cheio de energia!');
      setTimeout(() => setPetActionEffect(null), 1600);
    } else {
      setMood('sleeping');
      spawnParticle('💤');
      setPetActionEffect('Shhh... Guaxinim descansando 💤');
      setTimeout(() => setPetActionEffect(null), 1600);
    }
  };

  const handleBuyItem = (item: ShopItem) => {
    if (gems < item.cost) {
      alert('Gemas insuficientes! Complete missões diárias de alimentação e água para ganhar mais gemas.');
      return;
    }

    onSpendGems(item.cost);

    let nextInv = inventory;
    if (!inventory.includes(item.id)) {
      nextInv = [...inventory, item.id];
      setInventory(nextInv);
    }

    let nextCap = equippedCap;
    let nextGlasses = equippedGlasses;
    let nextClothes = equippedClothes;

    if (item.type === 'cap') {
      nextCap = item.id;
      setEquippedCap(item.id);
    }
    if (item.type === 'glasses') {
      nextGlasses = item.id;
      setEquippedGlasses(item.id);
    }
    if (item.type === 'clothes') {
      nextClothes = item.id;
      setEquippedClothes(item.id);
    }

    spawnParticle('✨');
    onUpdatePetProfile?.({
      inventory: nextInv,
      equippedCap: nextCap,
      equippedGlasses: nextGlasses,
      equippedClothes: nextClothes
    });
  };

  const handleToggleCap = (capId: string | null) => {
    const next = equippedCap === capId ? null : capId;
    setEquippedCap(next);
    setWardrobePreviewCap(next);
    onUpdatePetProfile?.({ equippedCap: next });
  };

  const handleToggleGlasses = (glassesId: string | null) => {
    const next = equippedGlasses === glassesId ? null : glassesId;
    setEquippedGlasses(next);
    setWardrobePreviewGlasses(next);
    onUpdatePetProfile?.({ equippedGlasses: next });
  };

  const handleToggleClothes = (clothesId: string | null) => {
    const next = equippedClothes === clothesId ? null : clothesId;
    setEquippedClothes(next);
    setWardrobePreviewClothes(next);
    onUpdatePetProfile?.({ equippedClothes: next });
  };

  const handleSavePetName = (name: string) => {
    const trimmed = name.trim().slice(0, 14);
    if (!trimmed) return;
    setPetName(trimmed);
    setShowNamingModal(false);
    onUpdatePetProfile?.({ petName: trimmed });
    spawnParticle('🎉');
    spawnParticle('✨');
    setPetActionEffect(`Seu parceiro agora se chama ${trimmed}! 🦝❤️`);
    setTimeout(() => setPetActionEffect(null), 3000);
  };

  // Stage title based on Level
  const getLevelBadge = (lvl: number) => {
    switch (lvl) {
      case 1:
        return { title: 'Nível 1: Filhote', shortTitle: 'Nv. 1 Filhote', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 2:
        return { title: 'Nível 2: Aventureiro', shortTitle: 'Nv. 2 Aventureiro', badge: 'bg-sky-100 text-sky-800 border-sky-200' };
      case 3:
        return { title: 'Nível 3: Mestre Fit', shortTitle: 'Nv. 3 Mestre Fit', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      default:
        return { title: 'Nível 4: Guardião', shortTitle: 'Nv. 4 Guardião', badge: 'bg-amber-100 text-amber-900 border-amber-300' };
    }
  };

  const levelInfo = getLevelBadge(petLevel);

  // Dynamic Environment Configuration (Day/Night cycle + 4 Seasons)
  const getEnvironmentConfig = (season: Season, timeOfDay: TimeOfDay) => {
    const isNight = timeOfDay === 'night';
    const isSunset = timeOfDay === 'sunset';
    const isDay = timeOfDay === 'day';

    const seasonLabels: Record<Season, { name: string; icon: string; desc: string }> = {
      spring: { name: 'Primavera', icon: '🌸', desc: 'Flores de cerejeira & brisa suave' },
      summer: { name: 'Verão', icon: '☀️', desc: 'Dias radiantes & colheita de frutas' },
      autumn: { name: 'Outono', icon: '🍂', desc: 'Folhas douradas & clima acolhedor' },
      winter: { name: 'Inverno', icon: '❄️', desc: 'Colinas nevadas & noites estreladas' }
    };

    const timeLabels: Record<TimeOfDay, { name: string; icon: string }> = {
      day: { name: 'Dia', icon: '☀️' },
      sunset: { name: 'Entardecer', icon: '🌅' },
      night: { name: 'Noite', icon: '🌙' }
    };

    // Continuous Screen Background Gradient
    let bgGradient = isDark
      ? 'from-[#17211F] via-[#22302D] via-45% via-[#2D3B35] to-[#26342E]'
      : 'from-[#C6E0EA] via-[#E7F0ED] via-45% via-[#CCD8CD] to-[#B7C6B8]';
    if (isNight) {
      if (season === 'winter') {
        bgGradient = 'from-[#020617] via-[#0b132b] via-25% via-[#1c2541] via-50% via-[#0f2922] to-[#0a1914]';
      } else if (season === 'autumn') {
        bgGradient = 'from-[#201C1A] via-[#302923] via-25% via-[#493326] via-50% via-[#34271F] to-[#1D1B1A]';
      } else if (season === 'spring') {
        bgGradient = 'from-[#182026] via-[#29283A] via-25% via-[#373047] via-50% via-[#254038] to-[#1B2E29]';
      } else {
        bgGradient = 'from-[#020617] via-[#0f172a] via-25% via-[#1e293b] via-50% via-[#064e3b] to-[#052e16]';
      }
    } else if (isSunset) {
      if (season === 'winter') {
        bgGradient = 'from-[#55556F] via-[#777A96] via-25% via-[#B58C9E] via-50% via-[#727C83] to-[#3C464B]';
      } else if (season === 'autumn') {
        bgGradient = 'from-[#604C68] via-[#8B5E68] via-25% via-[#B77B5A] via-50% via-[#806947] to-[#493B2D]';
      } else if (season === 'spring') {
        bgGradient = 'from-[#68698B] via-[#9B87AA] via-25% via-[#C48F98] via-50% via-[#78A493] to-[#496F68]';
      } else {
        bgGradient = 'from-[#74658E] via-[#A56E87] via-25% via-[#C88B63] via-50% via-[#6E9273] to-[#49694F]';
      }
    } else {
      if (season === 'winter') {
        bgGradient = 'from-[#C6E0EA] via-[#E4EFF2] via-25% via-[#F4F4F0] via-50% via-[#B9C5C7] to-[#7F9093]';
      } else if (season === 'autumn') {
        bgGradient = 'from-[#E8C9AA] via-[#EFE1B4] via-25% via-[#DCCB8D] via-50% via-[#B79C65] to-[#796044]';
      } else if (season === 'spring') {
        bgGradient = 'from-[#C2DEE8] via-[#E3EFF0] via-25% via-[#F0E5E9] via-50% via-[#AFC9B0] to-[#668272]';
      }
    }

    // Hill Gradients
    let distantHill = { start: '#a7f3d0', end: '#6ee7b7' };
    let midHill = { start: '#6ee7b7', end: '#34d399' };
    let foreHill = { start: '#52b788', mid: '#40916c', end: '#2d6a4f', highlight: '#6ee7b7' };

    if (isNight) {
      if (season === 'winter') {
        distantHill = { start: '#1e293b', end: '#0f172a' };
        midHill = { start: '#0f172a', end: '#091e18' };
        foreHill = { start: '#1e293b', mid: '#0f2922', end: '#0a1914', highlight: '#38bdf8' };
      } else if (season === 'autumn') {
        distantHill = { start: '#3f2510', end: '#291508' };
        midHill = { start: '#291508', end: '#1c1917' };
        foreHill = { start: '#3b200c', mid: '#261408', end: '#18181b', highlight: '#d97706' };
      } else {
        distantHill = { start: '#164e63', end: '#064e3b' };
        midHill = { start: '#064e3b', end: '#065f46' };
        foreHill = { start: '#0f3826', mid: '#064e3b', end: '#022c22', highlight: '#34d399' };
      }
    } else if (isSunset) {
      if (season === 'winter') {
        distantHill = { start: '#818cf8', end: '#64748b' };
        midHill = { start: '#64748b', end: '#475569' };
        foreHill = { start: '#64748b', mid: '#334155', end: '#1e293b', highlight: '#f472b6' };
      } else if (season === 'autumn') {
        distantHill = { start: '#d97706', end: '#b45309' };
        midHill = { start: '#b45309', end: '#854d0e' };
        foreHill = { start: '#9a3412', mid: '#7c2d12', end: '#451a03', highlight: '#fb923c' };
      } else {
        distantHill = { start: '#f472b6', end: '#10b981' };
        midHill = { start: '#34d399', end: '#059669' };
        foreHill = { start: '#10b981', mid: '#047857', end: '#134e4a', highlight: '#fda4af' };
      }
    } else {
      if (season === 'winter') {
        distantHill = { start: '#f1f5f9', end: '#cbd5e1' };
        midHill = { start: '#cbd5e1', end: '#94a3b8' };
        foreHill = { start: '#e2e8f0', mid: '#94a3b8', end: '#475569', highlight: '#ffffff' };
      } else if (season === 'autumn') {
        distantHill = { start: '#fde047', end: '#facc15' };
        midHill = { start: '#f59e0b', end: '#d97706' };
        foreHill = { start: '#d97706', mid: '#b45309', end: '#713f12', highlight: '#fde047' };
      } else if (season === 'spring') {
        distantHill = { start: '#bbf7d0', end: '#86efac' };
        midHill = { start: '#86efac', end: '#4ade80' };
        foreHill = { start: '#4ade80', mid: '#22c55e', end: '#15803d', highlight: '#bbf7d0' };
      }
    }

    // Tree Foliage Colors
    let treeCanopy = {
      back: '#10b981',
      mid: '#34d399',
      front: '#6ee7b7',
      highlight: '#a7f3d0'
    };

    if (season === 'spring') {
      treeCanopy = isNight
        ? { back: '#831843', mid: '#9d174d', front: '#be185d', highlight: '#f472b6' }
        : { back: '#f472b6', mid: '#f472b6', front: '#ec4899', highlight: '#fbcfe8' };
    } else if (season === 'autumn') {
      treeCanopy = isNight
        ? { back: '#7c2d12', mid: '#9a3412', front: '#b45309', highlight: '#ea580c' }
        : { back: '#ea580c', mid: '#d97706', front: '#f59e0b', highlight: '#fde047' };
    } else if (season === 'winter') {
      treeCanopy = isNight
        ? { back: '#064e3b', mid: '#065f46', front: '#047857', highlight: '#e2e8f0' }
        : { back: '#166534', mid: '#15803d', front: '#16a34a', highlight: '#ffffff' };
    }

    return {
      isNight,
      isSunset,
      isDay,
      seasonMeta: seasonLabels[season],
      timeMeta: timeLabels[timeOfDay],
      bgGradient,
      distantHill,
      midHill,
      foreHill,
      treeCanopy
    };
  };

  const theme = getEnvironmentConfig(currentSeason, currentTimeOfDay);

  // Helper colors for caps
  const activeCapItem = shopCatalog.find((i) => i.id === equippedCap);
  const capColor = activeCapItem?.color || '#9333ea';
  const capDarker = activeCapItem?.darkColor || '#7e22ce';

  // Render visual SVG thumbnail for shop items
  const renderItemThumbnail = (it: ShopItem) => {
    if (it.id === 'cap_gold') {
      return (
        <svg viewBox="20 10 90 40" className="w-8 h-8 shrink-0">
          <path
            d="M 35 40 C 33 30, 28 22, 32 20 C 35 18, 39 24, 45 27 C 52 18, 57 14, 65 14 C 73 14, 78 18, 85 27 C 91 24, 95 18, 98 20 C 102 22, 97 30, 95 40 Z"
            fill="#f59e0b"
            stroke="#b45309"
            strokeWidth="1.5"
          />
          <circle cx="65" cy="14" r="3" fill="#3b82f6" />
          <circle cx="32" cy="20" r="2.5" fill="#ef4444" />
          <circle cx="98" cy="20" r="2.5" fill="#ef4444" />
          <circle cx="45" cy="27" r="2" fill="#10b981" />
          <circle cx="85" cy="27" r="2" fill="#10b981" />
        </svg>
      );
    }
    if (it.type === 'cap') {
      return (
        <svg viewBox="25 15 80 40" className="w-8 h-8 shrink-0">
          <path d="M 35 38 C 35 20, 85 20, 85 38 Z" fill={it.color || '#9333ea'} stroke="#1e293b" strokeWidth="1.5" />
          <circle cx="60" cy="21" r="2.5" fill="#1e293b" />
          <path d="M 28 38 C 38 46, 82 46, 92 38 C 84 33, 36 33, 28 38 Z" fill={it.darkColor || it.color || '#7e22ce'} stroke="#1e293b" strokeWidth="1.5" />
          <circle cx="60" cy="30" r="3" fill="#ffffff" />
        </svg>
      );
    }
    if (it.id === 'glasses_sun') {
      return (
        <svg viewBox="30 40 70 30" className="w-8 h-8 shrink-0">
          <path d="M 35 48 L 55 48 C 55 58, 52 62, 45 62 C 38 62, 35 58, 35 48 Z" fill="#020617" stroke="#1e293b" strokeWidth="1.5" />
          <line x1="55" y1="52" x2="68" y2="52" stroke="#020617" strokeWidth="2" />
          <path d="M 68 48 L 88 48 C 88 58, 85 62, 78 62 C 71 62, 68 58, 68 48 Z" fill="#020617" stroke="#1e293b" strokeWidth="1.5" />
          <line x1="39" y1="51" x2="48" y2="59" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          <line x1="72" y1="51" x2="81" y2="59" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        </svg>
      );
    }
    if (it.type === 'glasses') {
      return (
        <svg viewBox="30 40 70 30" className="w-8 h-8 shrink-0">
          <circle cx="46" cy="54" r="8" fill="rgba(255,255,255,0.4)" stroke="#0f172a" strokeWidth="1.8" />
          <line x1="54" y1="54" x2="69" y2="54" stroke="#0f172a" strokeWidth="1.8" />
          <circle cx="77" cy="54" r="8" fill="rgba(255,255,255,0.4)" stroke="#0f172a" strokeWidth="1.8" />
          <path d="M 42 50 L 48 56" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
          <path d="M 73 50 L 79 56" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
        </svg>
      );
    }
    // Clothes thumbnails
    if (it.id === 'clothes_hoodie_emerald') {
      return (
        <svg viewBox="30 20 70 50" className="w-8 h-8 shrink-0">
          <path d="M 38 32 C 38 24, 92 24, 92 32 L 88 62 C 72 65, 58 65, 42 62 Z" fill="#059669" stroke="#047857" strokeWidth="1.5" />
          <line x1="65" y1="30" x2="65" y2="60" stroke="#f1f5f9" strokeWidth="1.5" />
          <path d="M 52 48 L 78 48 L 74 58 L 56 58 Z" fill="#047857" />
        </svg>
      );
    }
    if (it.id === 'clothes_shirt_striped') {
      return (
        <svg viewBox="30 20 70 50" className="w-8 h-8 shrink-0">
          <path d="M 38 32 C 38 24, 92 24, 92 32 L 88 62 C 72 65, 58 65, 42 62 Z" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
          <line x1="40" y1="38" x2="90" y2="38" stroke="#3b82f6" strokeWidth="2.5" />
          <line x1="41" y1="46" x2="89" y2="46" stroke="#3b82f6" strokeWidth="2.5" />
          <line x1="43" y1="54" x2="87" y2="54" stroke="#3b82f6" strokeWidth="2.5" />
        </svg>
      );
    }
    if (it.id === 'clothes_vest_puffer') {
      return (
        <svg viewBox="30 20 70 50" className="w-8 h-8 shrink-0">
          <path d="M 40 32 C 40 25, 90 25, 90 32 L 87 62 C 72 65, 58 65, 43 62 Z" fill="#ea580c" stroke="#c2410c" strokeWidth="1.5" />
          <line x1="42" y1="41" x2="88" y2="41" stroke="#c2410c" strokeWidth="2" />
          <line x1="43" y1="50" x2="87" y2="50" stroke="#c2410c" strokeWidth="2" />
          <line x1="65" y1="30" x2="65" y2="62" stroke="#0f172a" strokeWidth="1.5" />
        </svg>
      );
    }
    return (
      <svg viewBox="30 20 70 50" className="w-8 h-8 shrink-0">
        <path d="M 42 30 C 52 36, 78 36, 88 30 L 65 58 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
        <circle cx="65" cy="34" r="3" fill="#ef4444" />
      </svg>
    );
  };

  // Render fitting room preview raccoon avatar
  const renderFittingRoomRaccoon = (
    previewCap: string | null,
    previewGlasses: string | null,
    previewClothes?: string | null
  ) => {
    const itemCap = shopCatalog.find((i) => i.id === previewCap);
    const pCapColor = itemCap?.color || '#9333ea';
    const pCapDarker = itemCap?.darkColor || '#7e22ce';

    return (
      <svg viewBox="15 10 100 115" className="w-20 h-24 filter drop-shadow-sm select-none">
        {/* Ears */}
        <path d="M 28 50 C 22 30, 30 15, 42 15 C 53 15, 58 29, 58 38 Z" fill="#9E6E49" stroke="#744B2D" strokeWidth="1.5" />
        <path d="M 33 46 C 30 29, 36 21, 42 21 C 48 21, 52 30, 51 38 Z" fill="#5C3B24" />
        <path d="M 36 43 C 34 32, 38 26, 42 26 C 46 26, 48 33, 47 38 Z" fill="#EED9BD" />
        <path d="M 102 50 C 108 30, 100 15, 88 15 C 77 15, 72 29, 72 38 Z" fill="#9E6E49" stroke="#744B2D" strokeWidth="1.5" />
        <path d="M 97 46 C 100 29, 94 21, 88 21 C 82 21, 78 30, 79 38 Z" fill="#5C3B24" />
        <path d="M 94 43 C 96 32, 92 26, 88 26 C 84 26, 82 33, 83 38 Z" fill="#EED9BD" />

        {/* Body Base */}
        <ellipse cx="65" cy="85" rx="32" ry="25" fill="#9E6E49" stroke="#744B2D" strokeWidth="1.5" />
        <ellipse cx="65" cy="88" rx="20" ry="17" fill="#EED9BD" />

        {/* Clothes in Fitting Room */}
        {previewClothes === 'clothes_hoodie_emerald' && (
          <g className="filter drop-shadow-xs">
            <path
              d="M 38 72 C 34 80, 36 94, 38 104 C 50 107, 80 107, 92 104 C 94 94, 96 80, 92 72 C 84 70, 46 70, 38 72 Z"
              fill="#059669"
              stroke="#047857"
              strokeWidth="1.5"
            />
            <line x1="65" y1="72" x2="65" y2="105" stroke="#f1f5f9" strokeWidth="1.5" />
            <path d="M 52 90 L 78 90 L 75 101 L 55 101 Z" fill="#047857" stroke="#065f46" strokeWidth="1" />
            <path d="M 59 73 Q 58 83 60 85" stroke="#ffffff" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M 71 73 Q 72 83 70 85" stroke="#ffffff" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </g>
        )}

        {previewClothes === 'clothes_shirt_striped' && (
          <g className="filter drop-shadow-xs">
            <path
              d="M 38 72 C 34 80, 36 94, 38 104 C 50 107, 80 107, 92 104 C 94 94, 96 80, 92 72 C 84 70, 46 70, 38 72 Z"
              fill="#ffffff"
              stroke="#1e3a8a"
              strokeWidth="1.5"
            />
            <path d="M 38 78 Q 65 84 92 78" stroke="#2563eb" strokeWidth="2.5" fill="none" />
            <path d="M 37 86 Q 65 92 93 86" stroke="#2563eb" strokeWidth="2.5" fill="none" />
            <path d="M 38 94 Q 65 100 92 94" stroke="#2563eb" strokeWidth="2.5" fill="none" />
            <path d="M 40 102 Q 65 106 90 102" stroke="#2563eb" strokeWidth="2" fill="none" />
          </g>
        )}

        {previewClothes === 'clothes_vest_puffer' && (
          <g className="filter drop-shadow-xs">
            <path
              d="M 40 72 C 38 80, 39 94, 40 104 C 52 107, 78 107, 90 104 C 91 94, 92 80, 90 72 C 82 70, 48 70, 40 72 Z"
              fill="#ea580c"
              stroke="#c2410c"
              strokeWidth="1.5"
            />
            <path d="M 40 79 Q 65 85 90 79" stroke="#9a3412" strokeWidth="1.8" fill="none" />
            <path d="M 39 88 Q 65 94 91 88" stroke="#9a3412" strokeWidth="1.8" fill="none" />
            <path d="M 40 97 Q 65 102 90 97" stroke="#9a3412" strokeWidth="1.8" fill="none" />
            <line x1="65" y1="71" x2="65" y2="105" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        )}

        {previewClothes === 'clothes_bandana_gold' && (
          <g className="filter drop-shadow-xs">
            <path
              d="M 44 70 C 55 76, 75 76, 86 70 L 65 96 Z"
              fill="#eab308"
              stroke="#ca8a04"
              strokeWidth="1.5"
            />
            <circle cx="65" cy="74" r="3.5" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
            <line x1="52" y1="74" x2="60" y2="84" stroke="#ca8a04" strokeWidth="1" strokeDasharray="1 1" />
            <line x1="78" y1="74" x2="70" y2="84" stroke="#ca8a04" strokeWidth="1" strokeDasharray="1 1" />
          </g>
        )}

        {/* Paws */}
        <ellipse cx="50" cy="85" rx="5" ry="4" fill="#744B2D" stroke="#5C3B24" strokeWidth="1" />
        <ellipse cx="80" cy="85" rx="5" ry="4" fill="#744B2D" stroke="#5C3B24" strokeWidth="1" />

        {/* Head */}
        <ellipse cx="65" cy="54" rx="38" ry="30" fill="#9E6E49" stroke="#744B2D" strokeWidth="1.8" />
        <path d="M 26 55 C 22 59, 23 66, 31 68 C 35 69, 36 68, 38 69 C 34 64, 30 58, 26 55 Z" fill="#EED9BD" />
        <path d="M 104 55 C 108 59, 107 66, 99 68 C 95 69, 94 68, 92 69 C 96 64, 100 58, 104 55 Z" fill="#EED9BD" />

        {/* Mask */}
        <path d="M 32 50 C 42 46, 54 48, 65 53 C 76 48, 88 46, 98 50 C 102 58, 94 66, 84 66 C 74 66, 70 60, 65 60 C 60 60, 56 66, 46 66 C 36 66, 28 58, 32 50 Z" fill="#5C3B24" />
        <path d="M 42 45 Q 48 41 54 46" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 76 46 Q 82 41 88 45" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Snout & Nose */}
        <ellipse cx="65" cy="64" rx="14" ry="10" fill="#EED9BD" />
        <ellipse cx="65" cy="62.5" rx="4.5" ry="3.2" fill="#24160E" />
        <ellipse cx="63.8" cy="61.5" rx="1.5" ry="0.9" fill="#ffffff" opacity="0.8" />
        <path d="M 60 67 Q 62.5 70 65 67 Q 67.5 70 70 67" stroke="#24160E" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Whiskers */}
        <line x1="45" y1="62" x2="30" y2="60" stroke="#EED9BD" strokeWidth="1" strokeLinecap="round" />
        <line x1="45" y1="65" x2="32" y2="67" stroke="#EED9BD" strokeWidth="1" strokeLinecap="round" />
        <line x1="85" y1="62" x2="100" y2="60" stroke="#EED9BD" strokeWidth="1" strokeLinecap="round" />
        <line x1="85" y1="65" x2="98" y2="67" stroke="#EED9BD" strokeWidth="1" strokeLinecap="round" />

        {/* Eyes */}
        <ellipse cx="47" cy="54" rx="4.5" ry="5" fill="#1A110B" />
        <circle cx="45.5" cy="52.5" r="1.5" fill="#ffffff" />
        <ellipse cx="83" cy="54" rx="4.5" ry="5" fill="#1A110B" />
        <circle cx="81.5" cy="52.5" r="1.5" fill="#ffffff" />

        {/* Cap Preview */}
        {previewCap && previewCap !== 'cap_gold' && (
          <g className="filter drop-shadow-sm">
            <path d="M 40 40 C 40 18, 90 18, 90 40 Z" fill={pCapColor} stroke="#1e293b" strokeWidth="1.8" />
            <path d="M 53 19 Q 54 39 55 40" stroke={pCapDarker} strokeWidth="1" fill="none" opacity="0.6" />
            <path d="M 65 18 L 65 40" stroke={pCapDarker} strokeWidth="1" fill="none" opacity="0.6" />
            <path d="M 77 19 Q 76 39 75 40" stroke={pCapDarker} strokeWidth="1" fill="none" opacity="0.6" />
            <circle cx="65" cy="21" r="3" fill="#1e293b" />
            <path d="M 33 40 C 44 49, 86 49, 97 40 C 89 34, 41 34, 33 40 Z" fill={pCapDarker} stroke="#1e293b" strokeWidth="1.5" />
            <circle cx="65" cy="31" r="4" fill="#ffffff" />
            <circle cx="65" cy="31" r="2" fill="#1e293b" />
          </g>
        )}

        {/* Crown Preview */}
        {previewCap === 'cap_gold' && (
          <g className="filter drop-shadow-md">
            <path
              d="M 40 42 C 38 33, 34 24, 37 22 C 40 20, 44 26, 49 29 C 55 20, 60 16, 65 16 C 70 16, 75 20, 81 29 C 86 26, 90 20, 93 22 C 96 24, 92 33, 90 42 Z"
              fill="#f59e0b"
              stroke="#b45309"
              strokeWidth="1.8"
            />
            <rect x="39" y="38" width="52" height="6" rx="3" fill="#d97706" stroke="#92400e" strokeWidth="1" />
            <circle cx="65" cy="16" r="3.5" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" />
            <circle cx="37" cy="22" r="2.8" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
            <circle cx="93" cy="22" r="2.8" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
            <circle cx="49" cy="29" r="2.4" fill="#10b981" stroke="#047857" strokeWidth="1" />
            <circle cx="81" cy="29" r="2.4" fill="#10b981" stroke="#047857" strokeWidth="1" />
          </g>
        )}

        {/* Glasses Preview */}
        {previewGlasses && (
          <g className="filter drop-shadow-xs">
            {previewGlasses === 'glasses_round' ? (
              <>
                <circle cx="47" cy="54" r="9" fill="rgba(255,255,255,0.3)" stroke="#0f172a" strokeWidth="2" />
                <line x1="56" y1="54" x2="74" y2="54" stroke="#0f172a" strokeWidth="2" />
                <circle cx="83" cy="54" r="9" fill="rgba(255,255,255,0.3)" stroke="#0f172a" strokeWidth="2" />
                <path d="M 43 50 L 51 58" stroke="#ffffff" strokeWidth="1.2" opacity="0.7" strokeLinecap="round" />
                <path d="M 79 50 L 87 58" stroke="#ffffff" strokeWidth="1.2" opacity="0.7" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M 37 47 L 57 47 C 57 58, 54 63, 47 63 C 40 63, 37 58, 37 47 Z" fill="#020617" stroke="#1e293b" strokeWidth="2" />
                <line x1="57" y1="51" x2="73" y2="51" stroke="#020617" strokeWidth="2.5" />
                <path d="M 73 47 L 93 47 C 93 58, 90 63, 83 63 C 76 63, 73 58, 73 47 Z" fill="#020617" stroke="#1e293b" strokeWidth="2" />
                <line x1="41" y1="50" x2="52" y2="60" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
                <line x1="77" y1="50" x2="88" y2="60" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
              </>
            )}
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className={`flex-1 flex flex-col relative select-none overflow-hidden pb-3 bg-gradient-to-b ${theme.bgGradient} transition-colors duration-700`}>
      {/* Top Status Header - Redesigned Clean HUD */}
      <div className="px-4 pt-3.5 z-10 space-y-2">
        {/* Tier 1: Identity & Currency Bar */}
        <div
          className={`backdrop-blur-md rounded-2xl px-3.5 py-2 flex items-center justify-between shadow-2xs border transition-colors duration-300 ${
            isDark
              ? 'bg-[#232D29]/90 text-[#EDF2EF] border-[#394842]'
              : 'bg-white/95 text-[#3F4B46] border-[#AEBDB5]/30'
          }`}
        >
          {/* Left: Pet Avatar, Name & Edit Button */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              onClick={() => {
                setNamingInput(petName || '');
                setShowNamingModal(true);
              }}
              className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 cursor-pointer shadow-2xs hover:scale-105 transition-all"
              style={{
                backgroundColor: isDark ? activeColor.darkBg : activeColor.bgTintLight,
                borderColor: isDark ? activeColor.darkBorder : activeColor.border
              }}
              title="Clique para renomear seu Guaxinim"
            >
              <span className="text-xl leading-none">🦝</span>
            </div>

            <div className="flex flex-col min-w-0">
              <div
                onClick={() => {
                  setNamingInput(petName || '');
                  setShowNamingModal(true);
                }}
                className="flex items-center gap-1.5 cursor-pointer group"
                title="Clique para alterar o nome"
              >
                <span className={`font-black text-xs sm:text-sm tracking-tight truncate max-w-[120px] sm:max-w-[150px] ${isDark ? 'text-[#EDF2EF]' : 'text-[#3F4B46]'}`}>
                  {petName || 'FoodBud'}
                </span>
                <Pencil className="w-2.5 h-2.5 text-[#6F7C76] dark:text-[#A8B8B1] group-hover:opacity-80 transition-opacity shrink-0" />
              </div>

              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md mt-0.5 w-fit border ${levelInfo.badge}`}>
                {levelInfo.shortTitle}
              </span>
            </div>
          </div>

          {/* Right: Gems balance & Season button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Gems balance */}
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-black text-xs border shadow-2xs ${
              isDark
                ? 'bg-[#183328] text-[#A7F3D0] border-[#2A5442]'
                : 'bg-[#F0FDF4] text-[#065F46] border-[#A7F3D0]'
            }`}>
              <Gem className="w-3.5 h-3.5 fill-emerald-500 text-emerald-600 shrink-0" />
              <span>{gems}</span>
            </div>

            {/* Season & Time of Day button */}
            <button
              onClick={() => setShowSeasonModal(true)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black border transition-all active:scale-95 shadow-2xs ${
                isDark
                  ? 'bg-[#232D29] text-[#EDF2EF] border-[#394842] hover:bg-[#283D36]'
                  : 'bg-white text-[#3F4B46] border-[#AEBDB5]/30 hover:bg-[#F7F4EE]'
              }`}
              title="Ajustar ou visualizar clima e estação"
            >
              <span>{theme.timeMeta.icon}</span>
              <span>{theme.seasonMeta.icon}</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Level Progress & Quests Callout Bar */}
        <div
          className={`backdrop-blur-xs rounded-2xl px-3.5 py-2 border shadow-2xs transition-colors duration-300 ${
            isDark
              ? 'bg-[#232D29]/85 text-[#EDF2EF] border-[#394842]'
              : 'bg-white/90 text-[#3F4B46] border-[#AEBDB5]/30'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-extrabold mb-1">
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Evolução:</span>
              <span style={{ color: activeColor.primary }}>
                {petXp}/100 XP
              </span>
            </div>

            {onNavigateToQuests && (
              <button
                onClick={onNavigateToQuests}
                className="flex items-center gap-0.5 font-black hover:underline"
                style={{ color: activeColor.primary }}
              >
                <span>Ver Missões</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            )}
          </div>

          <div className={`w-full h-2 rounded-full overflow-hidden p-0.5 ${isDark ? 'bg-[#18201D]' : 'bg-[#ECEFE7]'}`}>
            <div
              className="h-full rounded-full transition-all duration-500 shadow-2xs"
              style={{
                width: `${Math.min(100, Math.max(0, petXp))}%`,
                backgroundColor: activeColor.primary
              }}
            />
          </div>
        </div>
      </div>

      {/* Scenic Nature Garden with FoodBud & Unified Controls */}
      <div className="flex-1 relative flex flex-col justify-between overflow-hidden">
        {/* SKY: DYNAMIC CELESTIAL BODIES (DAY, NIGHT) */}
        {(isDark || theme.isNight) ? (
          <>
            {/* Twinkling Stars in Night Sky */}
            <div className="absolute top-4 left-8 text-xs text-amber-200 animate-pulse pointer-events-none">✨</div>
            <div className="absolute top-12 left-1/4 text-xs text-indigo-100 pointer-events-none">⭐</div>
            <div className="absolute top-6 left-1/2 text-xs text-amber-100 animate-ping pointer-events-none" style={{ animationDuration: '3.5s' }}>✨</div>
            <div className="absolute top-16 right-20 text-xs text-indigo-200 pointer-events-none">⭐</div>
            <div className="absolute top-22 right-1/3 text-xs text-yellow-200 animate-pulse pointer-events-none">✨</div>
            <div className="absolute top-10 right-12 text-[10px] text-cyan-200 pointer-events-none">⭐</div>

            {/* Glowing Fireflies (Vaga-lumes) over the meadow */}
            <div className="absolute bottom-32 left-10 w-2 h-2 rounded-full bg-lime-300 shadow-[0_0_12px_rgba(190,242,100,0.9)] animate-bounce pointer-events-none" style={{ animationDuration: '2.4s' }} />
            <div className="absolute bottom-40 right-14 w-1.5 h-1.5 rounded-full bg-yellow-300 shadow-[0_0_10px_rgba(253,224,71,0.9)] animate-pulse pointer-events-none" />
            <div className="absolute bottom-24 right-1/3 w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)] animate-bounce pointer-events-none" style={{ animationDuration: '3.1s' }} />

            {/* Glowing Crescent Moon with soft craters & lunar aura */}
            <div className="absolute top-4 right-8 pointer-events-none z-0">
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-indigo-300/15 blur-xl animate-pulse" />
                <svg width="44" height="44" viewBox="0 0 44 44" className="drop-shadow-[0_0_14px_rgba(254,240,138,0.45)]">
                  <path
                    d="M 26 6 C 16 6 8 15 8 25 C 8 35 16 43 26 43 C 31 43 35 41 38 38 C 25 36 17 25 19 12 C 22 8 24 6 26 6 Z"
                    fill="#fef08a"
                  />
                  <circle cx="18" cy="22" r="2.2" fill="#fde047" opacity="0.45" />
                  <circle cx="16" cy="30" r="1.6" fill="#fde047" opacity="0.4" />
                  <circle cx="24" cy="33" r="2" fill="#fde047" opacity="0.4" />
                </svg>
              </div>
            </div>
          </>
        ) : null}

        {/* Floating Seasonal Atmospheric Particles */}
        <div className="absolute inset-x-0 top-10 pointer-events-none z-10 flex justify-around opacity-75">
          {currentSeason === 'spring' && (
            <>
              <span className="text-base animate-bounce" style={{ animationDuration: '4s' }}>🌸</span>
              <span className="text-xs animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '0.8s' }}>🌸</span>
              <span className="text-sm animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}>🌸</span>
            </>
          )}
          {currentSeason === 'autumn' && (
            <>
              <span className="text-base animate-bounce" style={{ animationDuration: '4.2s' }}>🍂</span>
              <span className="text-sm animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>🍁</span>
              <span className="text-xs animate-bounce" style={{ animationDuration: '4.8s', animationDelay: '1.8s' }}>🍂</span>
            </>
          )}
          {currentSeason === 'winter' && (
            <>
              <span className="text-sm animate-bounce" style={{ animationDuration: '3.8s' }}>❄️</span>
              <span className="text-xs animate-bounce" style={{ animationDuration: '3s', animationDelay: '0.7s' }}>❄️</span>
              <span className="text-base animate-bounce" style={{ animationDuration: '4.4s', animationDelay: '1.4s' }}>❄️</span>
            </>
          )}
        </div>

        {/* Action toast feedback */}
        {petActionEffect && (
          <div className="absolute top-4 inset-x-0 flex justify-center z-30">
            <span className="bg-slate-900/95 text-white backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black shadow-xl animate-in zoom-in-95 duration-150 border border-slate-700">
              {petActionEffect}
            </span>
          </div>
        )}

        {/* Full-bleed Layered Storybook Landscape matching reference image */}
        <div className="absolute inset-x-0 bottom-0 top-0 pointer-events-none overflow-hidden z-0">
          <svg viewBox="0 0 400 500" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isDark ? '#0E1922' : '#B5D6E8'} />
                <stop offset="100%" stopColor={isDark ? '#192C38' : '#E3EFF4'} />
              </linearGradient>
              <linearGradient id="meadowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isDark ? '#23362E' : '#B6C6B9'} />
                <stop offset="100%" stopColor={isDark ? '#1B2A24' : '#A6B9A8'} />
              </linearGradient>
            </defs>

            {/* 1. Serene Sky */}
            <rect x="0" y="0" width="400" height="268" fill="url(#skyGradient)" />

            {/* 2. Soft White Puffy Clouds */}
            {/* Top-left cloud */}
            <g opacity={isDark ? 0.35 : 0.95}>
              <path
                d="M 18 120 C 18 112 26 106 34 108 C 38 100 50 98 58 104 C 64 98 76 100 80 108 C 88 108 94 114 94 120 Z"
                fill="#ffffff"
              />
            </g>
            {/* Mid-left cloud behind tree */}
            <g opacity={isDark ? 0.3 : 0.85}>
              <path
                d="M 102 138 C 102 132 108 128 114 129 C 117 124 125 123 130 127 C 134 124 141 125 144 129 C 149 130 153 134 153 138 Z"
                fill="#ffffff"
              />
            </g>
            {/* Top-right cloud */}
            <g opacity={isDark ? 0.35 : 0.95}>
              <path
                d="M 244 116 C 244 109 252 103 260 105 C 264 97 276 95 284 101 C 290 96 301 98 304 105 C 311 106 316 111 316 116 Z"
                fill="#ffffff"
              />
            </g>
            {/* Mid-sky cloud */}
            <g opacity={isDark ? 0.3 : 0.9}>
              <path
                d="M 186 156 C 186 151 192 147 197 148 C 200 142 209 141 214 145 C 218 142 225 143 228 148 C 233 148 237 152 237 156 Z"
                fill="#ffffff"
              />
            </g>

            {/* 3. White Wooden Picket Fence along Horizon */}
            <g opacity={isDark ? 0.75 : 0.95}>
              {/* Horizontal rails */}
              <rect x="0" y="244" width="400" height="3" fill="#ffffff" stroke="#CAD7DE" strokeWidth="0.5" />
              <rect x="0" y="254" width="400" height="3" fill="#ffffff" stroke="#CAD7DE" strokeWidth="0.5" />
              {/* Vertical pointed pickets */}
              {[-4, 12, 28, 44, 60, 76, 92, 108, 124, 140, 156, 172, 188, 204, 220, 236, 252, 268, 284, 300, 316, 332, 348, 364, 380, 396].map((px) => (
                <polygon
                  key={px}
                  points={`${px},240 ${px + 4.5},234 ${px + 9},240 ${px + 9},262 ${px},262`}
                  fill="#ffffff"
                  stroke="#CBD5E1"
                  strokeWidth="0.6"
                />
              ))}
            </g>

            {/* 4. Left Tree (Snow-dusted Green Fruit Tree) */}
            <g>
              {/* Trunk and Branches */}
              <path
                d="M 70 285 C 71 250 72 210 74 150 C 76 210 78 250 80 285 Z"
                fill="#845D3B"
                stroke="#6E492B"
                strokeWidth="1"
              />
              <path d="M 73 205 Q 60 195 50 190" stroke="#845D3B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d="M 76 215 Q 92 205 102 200" stroke="#845D3B" strokeWidth="3" strokeLinecap="round" fill="none" />

              {/* Foliage Clusters */}
              <ellipse cx="75" cy="180" rx="36" ry="46" fill="#A3C683" stroke="#8FAF72" strokeWidth="1" />
              <ellipse cx="50" cy="190" rx="18" ry="14" fill="#95B975" stroke="#83A664" strokeWidth="1" />
              <ellipse cx="102" cy="185" rx="16" ry="13" fill="#ADC98B" stroke="#9AB779" strokeWidth="1" />
              <ellipse cx="106" cy="215" rx="18" ry="14" fill="#A3C683" stroke="#8FAF72" strokeWidth="1" />

              {/* Pillowy Snow Blankets */}
              <path
                d="M 44 165 C 44 138 106 138 106 165 C 101 174 92 170 85 174 C 76 170 65 173 57 169 C 48 174 44 170 44 165 Z"
                fill="#ffffff"
              />
              <path
                d="M 33 186 C 33 177 67 177 67 186 C 60 191 54 188 47 191 C 39 188 33 190 33 186 Z"
                fill="#ffffff"
              />
              <path
                d="M 89 211 C 89 203 123 203 123 211 C 117 215 110 213 103 216 C 96 213 89 215 89 211 Z"
                fill="#ffffff"
              />

              {/* Hanging Fruits with Stems */}
              {/* Peach / Orange */}
              <path d="M 48 198 Q 48 206 46 210" stroke="#6E492B" strokeWidth="1.2" fill="none" />
              <circle cx="45" cy="214" r="5" fill="#FA9858" stroke="#E07937" strokeWidth="0.8" />
              <path d="M 47 206 Q 51 204 50 208 Z" fill="#78A55A" />

              {/* Red Apple */}
              <path d="M 106 224 Q 106 230 108 233" stroke="#6E492B" strokeWidth="1.2" fill="none" />
              <circle cx="108" cy="237" r="5.5" fill="#E24B4B" stroke="#B83232" strokeWidth="0.8" />
              <path d="M 106 229 Q 102 227 103 231 Z" fill="#78A55A" />
            </g>

            {/* 5. Right Tree (Snow-dusted Autumn Ochre Tree) */}
            <g>
              {/* Spreading Trunk and Branches */}
              <path
                d="M 314 295 C 316 265 319 252 322 245 C 316 235 300 230 286 235 C 288 239 308 245 320 252 C 322 258 323 275 326 295 Z"
                fill="#744C2C"
                stroke="#5E3A1F"
                strokeWidth="1"
              />
              <path
                d="M 324 246 C 332 238 344 235 358 240 C 356 244 340 242 328 250 Z"
                fill="#744C2C"
                stroke="#5E3A1F"
                strokeWidth="1"
              />
              <path d="M 320 250 L 324 220 L 328 250 Z" fill="#744C2C" />

              {/* Autumn Foliage Clusters */}
              <ellipse cx="260" cy="195" rx="34" ry="24" fill="#E29E40" stroke="#C88427" strokeWidth="1" />
              <ellipse cx="240" cy="218" rx="28" ry="20" fill="#D28630" stroke="#B86F20" strokeWidth="1" />
              <ellipse cx="325" cy="210" rx="55" ry="32" fill="#E08C36" stroke="#C77320" strokeWidth="1" />
              <ellipse cx="275" cy="245" rx="36" ry="24" fill="#D9812E" stroke="#BC6818" strokeWidth="1" />
              <ellipse cx="375" cy="248" rx="34" ry="23" fill="#CB7224" stroke="#AE5912" strokeWidth="1" />
              <ellipse cx="365" cy="218" rx="26" ry="19" fill="#D9812E" stroke="#BC6818" strokeWidth="1" />

              {/* Snow Blankets on Autumn Tree */}
              <path
                d="M 276 198 C 276 172 374 172 374 198 C 364 207 350 203 338 208 C 324 203 310 207 298 203 C 286 208 276 204 276 198 Z"
                fill="#ffffff"
              />
              <path
                d="M 230 185 C 230 168 290 168 290 185 C 280 191 270 188 260 192 C 248 188 238 191 230 185 Z"
                fill="#ffffff"
              />
              <path
                d="M 244 235 C 244 220 306 220 306 235 C 296 241 286 238 276 242 C 264 238 254 241 244 235 Z"
                fill="#ffffff"
              />
              <path
                d="M 345 238 C 345 224 405 224 405 238 C 395 244 385 241 375 245 C 365 241 355 244 345 238 Z"
                fill="#ffffff"
              />

              {/* Hanging Fruits */}
              {/* Bright Oranges / Persimmons */}
              <circle cx="266" cy="255" r="5.5" fill="#EA7525" stroke="#C05814" strokeWidth="0.8" />
              <path d="M 264 249 L 268 249 L 266 246 Z" fill="#4B8232" />

              <circle cx="333" cy="242" r="5.5" fill="#EA7525" stroke="#C05814" strokeWidth="0.8" />
              <path d="M 331 236 L 335 236 L 333 233 Z" fill="#4B8232" />

              <circle cx="386" cy="260" r="5.5" fill="#EA7525" stroke="#C05814" strokeWidth="0.8" />
              <path d="M 384 254 L 388 254 L 386 251 Z" fill="#4B8232" />

              {/* Golden Yellow Lemons */}
              <circle cx="254" cy="226" r="5" fill="#F5C738" stroke="#D19E15" strokeWidth="0.8" />
              <path d="M 252 221 L 256 221 L 254 218 Z" fill="#4B8232" />

              <circle cx="256" cy="186" r="5" fill="#F5C738" stroke="#D19E15" strokeWidth="0.8" />
              <path d="M 254 181 L 258 181 L 256 178 Z" fill="#4B8232" />
            </g>

            {/* 6. Foreground Calming Sage Meadow */}
            <path
              d="M 0 252 Q 200 248 400 252 L 400 500 L 0 500 Z"
              fill="url(#meadowGradient)"
            />
            <path
              d="M 0 252 Q 200 248 400 252"
              stroke={isDark ? '#2E473D' : '#C7D8CB'}
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />

            {/* 7. Adorable Mini Snowman on Left Meadow */}
            <g transform="translate(56, 335)">
              <circle cx="0" cy="15" r="11" fill="#ffffff" stroke="#CBD5E1" strokeWidth="0.8" />
              <circle cx="0" cy="0" r="8" fill="#ffffff" stroke="#CBD5E1" strokeWidth="0.8" />
              <circle cx="-2.5" cy="-2" r="1" fill="#1E293B" />
              <circle cx="2.5" cy="-2" r="1" fill="#1E293B" />
              <polygon points="0,0 -6,2 0,3" fill="#F97316" />
              <path d="M -7 5 C -3 8 3 8 7 5 L 7 9 C 3 12 -3 12 -7 9 Z" fill="#EF4444" />
              <rect x="-4" y="8" width="3.5" height="7" rx="1" fill="#EF4444" />
            </g>

            {/* 8. Sweet White Daisy Flower on Right Meadow */}
            <g transform="translate(330, 328)">
              <circle cx="-5" cy="0" r="3.8" fill="#ffffff" stroke="#CBD5E1" strokeWidth="0.5" />
              <circle cx="5" cy="0" r="3.8" fill="#ffffff" stroke="#CBD5E1" strokeWidth="0.5" />
              <circle cx="0" cy="-5" r="3.8" fill="#ffffff" stroke="#CBD5E1" strokeWidth="0.5" />
              <circle cx="0" cy="5" r="3.8" fill="#ffffff" stroke="#CBD5E1" strokeWidth="0.5" />
              <circle cx="3.5" cy="-3.5" r="3.8" fill="#ffffff" stroke="#CBD5E1" strokeWidth="0.5" />
              <circle cx="-3.5" cy="3.5" r="3.8" fill="#ffffff" stroke="#CBD5E1" strokeWidth="0.5" />
              <circle cx="0" cy="0" r="3.8" fill="#F59E0B" stroke="#D97706" strokeWidth="0.5" />
            </g>
          </svg>
        </div>

        {/* Center: FoodBud Mascot Sitting in Meadow */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 pt-4 pb-1">
          {/* Guaxinim Container (Clickable affection interaction) */}
          <div
            onClick={handlePetCarinho}
            className={`relative flex flex-col items-center cursor-pointer transition-all duration-300 group ${
              mood === 'playing' ? 'animate-bounce' : 'active:scale-95'
            }`}
            title="Clique no Guaxinim para fazer carinho!"
          >
            {/* Floating particles */}
            {floatingParticles.map((p) => (
              <div
                key={p.id}
                className="absolute text-2xl pointer-events-none animate-bounce"
                style={{
                  top: '-40px',
                  transform: `translateX(${p.x}px)`,
                  transition: 'all 1s ease-out',
                  zIndex: 40
                }}
              >
                {p.text}
              </div>
            ))}

            {/* Level 4 Legendary Halo */}
            {petLevel >= 4 && (
              <div className="absolute -top-10 inset-x-0 flex justify-center pointer-events-none z-30">
                <div className="w-24 h-7 rounded-full border-2 border-amber-300/90 bg-amber-200/25 shadow-[0_0_18px_rgba(251,191,36,0.9)] animate-pulse" />
              </div>
            )}

            {/* Sleeping Zzz Indicator at Night */}
            {mood === 'sleeping' && (
              <div className="absolute -top-7 right-3 bg-indigo-950/85 backdrop-blur-xs text-indigo-200 border border-indigo-400/40 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-lg animate-pulse flex items-center gap-1 z-30">
                <span>💤 Zzz...</span>
              </div>
            )}

            {/* GUAXINIM (RACCOON) FULL VECTOR SYSTEM (Curved rounded friendly contours) */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg width="168" height="158" viewBox="0 0 160 150" className="relative z-10 overflow-visible drop-shadow-[0_10px_10px_rgba(59,72,65,0.16)]" aria-label="FoodBud, um filhote de guaxinim com boné lilás">
                {/* 0. SOFT CONTACT SHADOW ON MEADOW */}
                <ellipse cx="65" cy="132" rx="38" ry="7" fill="rgba(56, 73, 65, 0.2)" />

                {/* 1. TAIL ATTACHED DIRECTLY TO HIP (Seamless, never detached!) */}
                <g className="transition-transform duration-500 origin-[105px_105px]">
                  {/* Tail Base coming smoothly from behind the right hip */}
                  <path
                    d="M 100 102 C 120 100, 142 85, 146 55 C 148 35, 138 18, 126 15 C 114 12, 108 26, 112 45 C 115 58, 108 85, 96 98 Z"
                    fill="#8F684D"
                    stroke="#6B4934"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  {/* Tail Stripe 1 (Espresso Dark) */}
                  <path
                    d="M 106 82 C 116 80, 130 75, 135 60 C 137 54, 138 48, 138 42 C 128 45, 118 52, 113 65 Z"
                    fill="#5A3E2F"
                  />
                  {/* Tail Stripe 2 (Espresso Dark) */}
                  <path
                    d="M 118 42 C 125 40, 138 35, 140 28 C 138 23, 134 20, 129 18 C 124 24, 118 30, 115 36 Z"
                    fill="#5A3E2F"
                  />
                  {/* Tail Tip (Espresso Dark) */}
                  <path
                    d="M 129 18 C 134 20, 138 23, 140 28 C 144 22, 138 15, 126 15 C 125 15, 124 16, 123 16 C 125 17, 127 17, 129 18 Z"
                    fill="#5A3E2F"
                  />
                </g>

                {/* 2. EARS - ADORABLE ROUNDED EARS */}
                {/* Left Ear */}
                <path
                  d="M 28 50 C 22 30, 30 15, 42 15 C 53 15, 58 29, 58 38 Z"
                  fill="#9E6E49"
                  stroke="#744B2D"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M 33 46 C 30 29, 36 21, 42 21 C 48 21, 52 30, 51 38 Z"
                  fill="#5C3B24"
                />
                <path
                  d="M 36 43 C 34 32, 38 26, 42 26 C 46 26, 48 33, 47 38 Z"
                  fill="#EED9BD"
                />

                {/* Right Ear */}
                <path
                  d="M 102 50 C 108 30, 100 15, 88 15 C 77 15, 72 29, 72 38 Z"
                  fill="#9E6E49"
                  stroke="#744B2D"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M 97 46 C 100 29, 94 21, 88 21 C 82 21, 78 30, 79 38 Z"
                  fill="#5C3B24"
                />
                <path
                  d="M 94 43 C 96 32, 92 26, 88 26 C 84 26, 82 33, 83 38 Z"
                  fill="#EED9BD"
                />

                {/* 3. BODY */}
                <ellipse cx="65" cy="96" rx="40" ry="37" fill="#8F684D" stroke="#6B4934" strokeWidth="1.8" />
                {/* Cream Belly Patch */}
                <ellipse cx="65" cy="100" rx="25" ry="26" fill="#DCC39D" />

                {/* CLOTHES LAYER */}
                {equippedClothes === 'clothes_hoodie_emerald' && (
                  <g className="filter drop-shadow-sm">
                    <path
                      d="M 30 78 C 24 88, 26 108, 30 120 C 46 126, 84 126, 100 120 C 104 108, 106 88, 100 78 C 88 74, 42 74, 30 78 Z"
                      fill="#059669"
                      stroke="#047857"
                      strokeWidth="2"
                    />
                    <line x1="65" y1="76" x2="65" y2="122" stroke="#f1f5f9" strokeWidth="2" />
                    <path d="M 48 102 L 82 102 L 78 116 L 52 116 Z" fill="#047857" stroke="#065f46" strokeWidth="1" />
                    <path d="M 58 77 Q 56 90 59 93" stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    <path d="M 72 77 Q 74 90 71 93" stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </g>
                )}

                {equippedClothes === 'clothes_shirt_striped' && (
                  <g className="filter drop-shadow-sm">
                    <path
                      d="M 30 78 C 24 88, 26 108, 30 120 C 46 126, 84 126, 100 120 C 104 108, 106 88, 100 78 C 88 74, 42 74, 30 78 Z"
                      fill="#ffffff"
                      stroke="#1e3a8a"
                      strokeWidth="2"
                    />
                    <path d="M 28 85 Q 65 93 102 85" stroke="#2563eb" strokeWidth="3" fill="none" />
                    <path d="M 27 95 Q 65 103 103 95" stroke="#2563eb" strokeWidth="3" fill="none" />
                    <path d="M 28 105 Q 65 113 102 105" stroke="#2563eb" strokeWidth="3" fill="none" />
                    <path d="M 31 115 Q 65 121 99 115" stroke="#2563eb" strokeWidth="2.5" fill="none" />
                  </g>
                )}

                {equippedClothes === 'clothes_vest_puffer' && (
                  <g className="filter drop-shadow-sm">
                    <path
                      d="M 33 78 C 29 88, 30 108, 33 120 C 48 126, 82 126, 97 120 C 100 108, 101 88, 97 78 C 85 74, 45 74, 33 78 Z"
                      fill="#ea580c"
                      stroke="#c2410c"
                      strokeWidth="2"
                    />
                    <path d="M 32 87 Q 65 95 98 87" stroke="#9a3412" strokeWidth="2.2" fill="none" />
                    <path d="M 31 98 Q 65 106 99 98" stroke="#9a3412" strokeWidth="2.2" fill="none" />
                    <path d="M 33 109 Q 65 116 97 109" stroke="#9a3412" strokeWidth="2.2" fill="none" />
                    <line x1="65" y1="76" x2="65" y2="122" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
                  </g>
                )}

                {equippedClothes === 'clothes_bandana_gold' && (
                  <g className="filter drop-shadow-sm">
                    <path
                      d="M 38 75 C 55 82, 75 82, 92 75 L 65 110 Z"
                      fill="#eab308"
                      stroke="#ca8a04"
                      strokeWidth="2"
                    />
                    <circle cx="65" cy="80" r="4.5" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
                    <line x1="48" y1="80" x2="59" y2="94" stroke="#ca8a04" strokeWidth="1.2" strokeDasharray="2 2" />
                    <line x1="82" y1="80" x2="71" y2="94" stroke="#ca8a04" strokeWidth="1.2" strokeDasharray="2 2" />
                  </g>
                )}

                {/* Level 2 Explorer Bandana (only if no custom clothes equipped) */}
                {petLevel >= 2 && !equippedClothes && (
                  <path
                    d="M 42 74 C 55 80, 75 80, 88 74 L 90 79 C 75 87, 55 87, 40 79 Z"
                    fill="#e11d48"
                  />
                )}
                {/* Level 3 Fit Gold Medal (only if no custom clothes equipped) */}
                {petLevel >= 3 && !equippedClothes && (
                  <circle cx="65" cy="84" r="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
                )}

                {/* 4. HEAD BASE */}
                <ellipse cx="65" cy="54" rx="38" ry="30" fill="#8F684D" stroke="#6B4934" strokeWidth="1.8" />

                {/* Raccoon Cheek White/Cream Fluff */}
                <path
                  d="M 26 55 C 22 59, 23 66, 31 68 C 35 69, 36 68, 38 69 C 34 64, 30 58, 26 55 Z"
                  fill="#EED9BD"
                />
                <path
                  d="M 104 55 C 108 59, 107 66, 99 68 C 95 69, 94 68, 92 69 C 96 64, 100 58, 104 55 Z"
                  fill="#EED9BD"
                />

                {/* 5. RACCOON BANDIT MASK */}
                <path
                  d="M 32 50 C 42 46, 54 48, 65 53 C 76 48, 88 46, 98 50 C 102 58, 94 66, 84 66 C 74 66, 70 60, 65 60 C 60 60, 56 66, 46 66 C 36 66, 28 58, 32 50 Z"
                  fill="#513B35"
                />

                {/* Soft tan brow markings from the reference character */}
                <path d="M 40 45 Q 48 39 56 45" stroke="#D8BB8C" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M 74 45 Q 82 39 90 45" stroke="#D8BB8C" strokeWidth="4" fill="none" strokeLinecap="round" />

                {/* Muzzle (Snout) Cream Patch */}
                <ellipse cx="65" cy="65" rx="15" ry="11" fill="#E2CDAA" />

                {/* Cute Button Nose (Smooth, rounded, with cute highlight) */}
                <ellipse cx="65" cy="62.5" rx="4.5" ry="3.2" fill="#24160E" />
                <ellipse cx="63.8" cy="61.5" rx="1.5" ry="0.9" fill="#ffffff" opacity="0.8" />

                {/* Mouth Expressions */}
                {mood === 'eating' ? (
                  <ellipse cx="65" cy="69" rx="3" ry="4" fill="#b91c1c" />
                ) : mood === 'love' ? (
                  <path d="M 61 67 Q 65 71 69 67" stroke="#24160E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                ) : mood === 'sleeping' ? (
                  <line x1="62" y1="68" x2="68" y2="68" stroke="#24160E" strokeWidth="1.5" strokeLinecap="round" />
                ) : (
                  /* Cute Cat/Raccoon smile 'w' */
                  <path d="M 60 67 Q 62.5 70 65 67 Q 67.5 70 70 67" stroke="#24160E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                )}

                {/* Rosy Cheeks when in Love */}
                {mood === 'love' && (
                  <>
                    <ellipse cx="38" cy="62" rx="4" ry="2.5" fill="#fbcfe8" opacity="0.9" />
                    <ellipse cx="92" cy="62" rx="4" ry="2.5" fill="#fbcfe8" opacity="0.9" />
                  </>
                )}

                {/* Whiskers */}
                <line x1="45" y1="62" x2="30" y2="60" stroke="#EED9BD" strokeWidth="1" strokeLinecap="round" />
                <line x1="45" y1="65" x2="32" y2="67" stroke="#EED9BD" strokeWidth="1" strokeLinecap="round" />
                <line x1="85" y1="62" x2="100" y2="60" stroke="#EED9BD" strokeWidth="1" strokeLinecap="round" />
                <line x1="85" y1="65" x2="98" y2="67" stroke="#EED9BD" strokeWidth="1" strokeLinecap="round" />

                {/* Eyes State */}
                {mood === 'sleeping' ? (
                  <>
                    <path d="M 42 55 Q 47 59 52 55" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M 78 55 Q 83 59 88 55" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </>
                ) : mood === 'love' ? (
                  <>
                    <path d="M 42 56 Q 47 51 52 56" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <path d="M 78 56 Q 83 51 88 56" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    {/* Glossy Black Eyes with Circular Highlights */}
                    <ellipse cx="47" cy="55" rx="5" ry="5.6" fill="#2C2430" />
                    <circle cx="45.5" cy="52.5" r="1.6" fill="#ffffff" />

                    <ellipse cx="83" cy="55" rx="5" ry="5.6" fill="#2C2430" />
                    <circle cx="81.5" cy="52.5" r="1.6" fill="#ffffff" />
                  </>
                )}

                {/* 6. AUTHENTIC HATS SYSTEM (Sitting snugly directly on Raccoon's Head!) */}
                {equippedCap && equippedCap !== 'cap_gold' && (
                  <g className="filter drop-shadow-sm">
                    {/* Baseball Cap Crown */}
                    <path
                      d="M 40 40 C 40 18, 90 18, 90 40 Z"
                      fill={capColor}
                      stroke="#1e293b"
                      strokeWidth="1.5"
                    />
                    {/* Cap Stitching / Seams */}
                    <path d="M 65 21 L 65 38" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />
                    <path d="M 65 21 Q 50 28 43 38" stroke="rgba(0,0,0,0.2)" strokeWidth="1.2" fill="none" />
                    <path d="M 65 21 Q 80 28 87 38" stroke="rgba(0,0,0,0.2)" strokeWidth="1.2" fill="none" />

                    {/* Cap Squatchee Button */}
                    <circle cx="65" cy="21" r="3" fill="#1e293b" />

                    {/* Curved Visor / Brim sticking forward */}
                    <path
                      d="M 33 40 C 44 49, 86 49, 97 40 C 89 34, 41 34, 33 40 Z"
                      fill={capDarker}
                      stroke="#1e293b"
                      strokeWidth="1.5"
                    />
                    <path d="M 37 41 C 48 47, 82 47, 93 41" stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.4" />

                    {/* Athletic Emblem Badge on Front (Soft rounded dot emblem) */}
                    <circle cx="65" cy="31" r="4" fill="#ffffff" />
                    <circle cx="65" cy="31" r="2" fill="#1e293b" />
                  </g>
                )}

                {/* 7. GOLDEN ROYAL CROWN (Rounded scalloped arches with royal jewels) */}
                {equippedCap === 'cap_gold' && (
                  <g className="filter drop-shadow-md">
                    {/* Rounded scalloped crown base */}
                    <path
                      d="M 40 42 C 38 33, 34 24, 37 22 C 40 20, 44 26, 49 29 C 55 20, 60 16, 65 16 C 70 16, 75 20, 81 29 C 86 26, 90 20, 93 22 C 96 24, 92 33, 90 42 Z"
                      fill="#f59e0b"
                      stroke="#b45309"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    {/* Embossed Crown Base Rim */}
                    <rect x="39" y="38" width="52" height="6" rx="3" fill="#d97706" stroke="#92400e" strokeWidth="1" />
                    <line x1="41" y1="41" x2="89" y2="41" stroke="#fef08a" strokeWidth="1" opacity="0.8" strokeLinecap="round" />

                    {/* Round Jewels on Spires */}
                    <circle cx="65" cy="16" r="3.5" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" />
                    <circle cx="37" cy="22" r="2.8" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
                    <circle cx="93" cy="22" r="2.8" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
                    <circle cx="49" cy="29" r="2.4" fill="#10b981" stroke="#047857" strokeWidth="1" />
                    <circle cx="81" cy="29" r="2.4" fill="#10b981" stroke="#047857" strokeWidth="1" />

                    {/* Sparkling diamonds on base */}
                    <circle cx="51" cy="41" r="1.5" fill="#ffffff" />
                    <circle cx="65" cy="41" r="1.8" fill="#ffffff" />
                    <circle cx="79" cy="41" r="1.5" fill="#ffffff" />
                  </g>
                )}

                {/* 8. GLASSES (Fitted over masked face) */}
                {equippedGlasses && (
                  <g className="filter drop-shadow-xs">
                    {equippedGlasses === 'glasses_round' ? (
                      /* Round Reading Glasses */
                      <>
                        <circle cx="47" cy="54" r="9" fill="rgba(255,255,255,0.3)" stroke="#0f172a" strokeWidth="2" />
                        <line x1="56" y1="54" x2="74" y2="54" stroke="#0f172a" strokeWidth="2" />
                        <circle cx="83" cy="54" r="9" fill="rgba(255,255,255,0.3)" stroke="#0f172a" strokeWidth="2" />
                        {/* Lens Glare */}
                        <path d="M 43 50 L 51 58" stroke="#ffffff" strokeWidth="1.2" opacity="0.7" strokeLinecap="round" />
                        <path d="M 79 50 L 87 58" stroke="#ffffff" strokeWidth="1.2" opacity="0.7" strokeLinecap="round" />
                      </>
                    ) : (
                      /* Retro Dark Sunglasses */
                      <>
                        <path
                          d="M 37 47 L 57 47 C 57 58, 54 63, 47 63 C 40 63, 37 58, 37 47 Z"
                          fill="#020617"
                          stroke="#1e293b"
                          strokeWidth="2"
                        />
                        <line x1="57" y1="51" x2="73" y2="51" stroke="#020617" strokeWidth="2.5" />
                        <path
                          d="M 73 47 L 93 47 C 93 58, 90 63, 83 63 C 76 63, 73 58, 73 47 Z"
                          fill="#020617"
                          stroke="#1e293b"
                          strokeWidth="2"
                        />
                        {/* White reflection glare on sunglasses */}
                        <line x1="41" y1="50" x2="52" y2="60" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
                        <line x1="77" y1="50" x2="88" y2="60" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
                      </>
                    )}
                  </g>
                )}

                {/* 9. PAWS & SNACKS */}
                {/* Left Paw */}
                <ellipse cx="48" cy="94" rx="7" ry="5.5" fill="#744B2D" stroke="#5C3B24" strokeWidth="1" />
                {/* Right Paw */}
                <ellipse cx="82" cy="94" rx="7" ry="5.5" fill="#744B2D" stroke="#5C3B24" strokeWidth="1" />

                {/* Eating Apple in Paws */}
                {mood === 'eating' && (
                  <g>
                    <circle cx="65" cy="90" r="7" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
                    <path d="M 65 83 Q 68 80 66 77" stroke="#78350f" strokeWidth="1.2" fill="none" />
                    <path d="M 66 79 Q 70 79 69 81 Z" fill="#22c55e" />
                  </g>
                )}

                {/* Playing Tennis Ball Bouncing in front of paws */}
                {mood === 'playing' && (
                  <g className="animate-pulse">
                    <circle cx="65" cy="88" r="8" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
                    <path d="M 59 84 C 63 88, 63 92, 59 96" stroke="#ffffff" strokeWidth="1.2" fill="none" />
                    <path d="M 71 84 C 67 88, 67 92, 71 96" stroke="#ffffff" strokeWidth="1.2" fill="none" />
                  </g>
                )}

                {/* Feet */}
                <ellipse cx="48" cy="125" rx="10" ry="6" fill="#744B2D" stroke="#5C3B24" strokeWidth="1" />
                <ellipse cx="82" cy="125" rx="10" ry="6" fill="#744B2D" stroke="#5C3B24" strokeWidth="1" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom Controls Area (Floating harmoniously on the lush meadow) */}
        <div className="relative z-20 flex flex-col gap-2.5 px-5 pb-3">
          {/* Direct Interactive Action Bar with elevated shadow dock */}
          <div className="flex items-center justify-center">
            <div
              className={`${
                isDark
                  ? 'bg-[#232D29]/90 text-[#EDF2EF] border-[#394842]'
                  : 'bg-white/95 text-[#3F4B46] border-[#AEBDB5]/30'
              } shadow-cozy backdrop-blur-md px-3.5 py-2 rounded-full border flex items-center gap-2 transition-colors duration-300`}
            >
              <button
                onClick={handlePetCarinho}
                className={`px-3.5 py-2 rounded-full ${
                  isDark
                    ? 'bg-[#18201D] hover:bg-rose-950/40 text-[#EDF2EF] border-[#394842]'
                    : 'bg-[#F7F4EE] hover:bg-rose-50 text-[#3F4B46] border-[#AEBDB5]/30'
                } text-xs font-black shadow-2xs flex items-center gap-1.5 transition-all active:scale-95 border`}
                title="Fazer Carinho no Guaxinim"
              >
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>Carinho</span>
              </button>

              <button
                onClick={handlePlayPet}
                className={`px-3.5 py-2 rounded-full ${
                  isDark
                    ? 'bg-[#18201D] hover:bg-sky-950/40 text-[#EDF2EF] border-[#394842]'
                    : 'bg-[#F7F4EE] hover:bg-sky-50 text-[#3F4B46] border-[#AEBDB5]/30'
                } text-xs font-black shadow-2xs flex items-center gap-1.5 transition-all active:scale-95 border`}
                title="Brincar com o Guaxinim"
              >
                <Smile className="w-4 h-4 text-sky-500" />
                <span>Brincar</span>
              </button>

              <button
                onClick={handleFeedHealthy}
                className={`px-3.5 py-2 rounded-full ${
                  isDark
                    ? 'bg-[#18201D] hover:bg-emerald-950/40 text-[#EDF2EF] border-[#394842]'
                    : 'bg-[#F7F4EE] hover:bg-emerald-50 text-[#3F4B46] border-[#AEBDB5]/30'
                } text-xs font-black shadow-2xs flex items-center gap-1.5 transition-all active:scale-95 border`}
                title="Alimentar com fruta"
              >
                <Apple className="w-4 h-4 text-emerald-500" />
                <span>Alimentar</span>
              </button>

              <button
                onClick={handleToggleSleep}
                className={`p-2 rounded-full ${
                  isDark
                    ? 'bg-[#18201D] hover:bg-[#2B3732] text-amber-300 border-[#394842]'
                    : 'bg-[#F7F4EE] hover:bg-[#ECEFE7] text-[#3F4B46] border-[#AEBDB5]/30'
                } shadow-2xs flex items-center justify-center transition-all active:scale-95 border`}
                title={mood === 'sleeping' ? 'Acordar' : 'Dormir'}
              >
                {mood === 'sleeping' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400" />
                )}
              </button>
            </div>
          </div>

          {/* Bottom Action Cards: Shop & My Items */}
          <div className="flex gap-3 select-none">
            {/* Shop Card */}
            <button
              onClick={() => setShowShop(true)}
              className={`flex-1 ${
                isDark
                  ? 'bg-[#232D29]/90 hover:bg-[#232D29] border-[#394842] text-[#EDF2EF]'
                  : 'bg-white/95 hover:bg-white border-[#AEBDB5]/30 text-[#3F4B46]'
              } border rounded-3xl p-3 flex flex-col items-center justify-center transition-all active:scale-95 relative shadow-cozy backdrop-blur-md`}
            >
              <div className="text-2xl mb-1">🏬</div>
              <span className="font-black text-xs">
                Loja de Acessórios
              </span>
            </button>

            {/* My Items Card */}
            <button
              onClick={() => setShowItems(true)}
              className={`flex-1 ${
                isDark
                  ? 'bg-[#232D29]/90 hover:bg-[#232D29] border-[#394842] text-[#EDF2EF]'
                  : 'bg-white/95 hover:bg-white border-[#AEBDB5]/30 text-[#3F4B46]'
              } border rounded-3xl p-3 flex flex-col items-center justify-center transition-all active:scale-95 shadow-cozy backdrop-blur-md`}
            >
              <div className="text-2xl mb-1">🧺</div>
              <span className="font-black text-xs">
                Personalizar Guaxinim
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Shop Modal */}
      {showShop && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#232D29] w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#AEBDB5]/30 dark:border-[#394842] animate-in slide-in-from-bottom duration-200 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#394842]">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏬</span>
                <h4 className="font-black text-slate-800 dark:text-[#EDF2EF] text-base">Loja do Guaxinim</h4>
              </div>
              <button
                onClick={() => setShowShop(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#18201D] hover:bg-slate-200 dark:hover:bg-[#20332D] text-slate-700 dark:text-[#EDF2EF] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between py-2 text-xs font-bold text-slate-600 dark:text-[#A7C2B7]">
              <span>Seu saldo:</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black">
                <Gem className="w-3.5 h-3.5 fill-emerald-500" />
                {gems} Gemas
              </span>
            </div>

            {/* Provador Virtual (Live Fitting Room) */}
            <div className="my-2 p-2.5 bg-gradient-to-r from-slate-50 to-emerald-50/60 dark:from-[#18201D] dark:to-[#1B2F27] rounded-2xl border border-slate-200/90 dark:border-[#394842] shadow-2xs flex items-center gap-3">
              {/* Live Preview Avatar */}
              <div className="w-20 h-20 bg-white dark:bg-[#18201D] rounded-2xl border border-slate-200/80 dark:border-[#394842] flex items-center justify-center shadow-xs overflow-hidden shrink-0">
                {renderFittingRoomRaccoon(
                  previewItem?.type === 'cap' ? previewItem.id : equippedCap,
                  previewItem?.type === 'glasses' ? previewItem.id : equippedGlasses,
                  previewItem?.type === 'clothes' ? previewItem.id : equippedClothes
                )}
              </div>

              {/* Preview Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  <span>Provador do Guaxinim</span>
                </div>

                {previewItem ? (
                  <div className="mt-0.5">
                    <span className="font-black text-slate-800 dark:text-[#EDF2EF] text-xs block truncate">
                      {previewItem.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-[#A8B8B1] block truncate">
                      {previewItem.description}
                    </span>

                    <div className="flex items-center gap-1.5 mt-1.5">
                      {inventory.includes(previewItem.id) ? (
                        <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                          Já Adquirido
                        </span>
                      ) : (
                        <button
                          onClick={() => handleBuyItem(previewItem)}
                          className="px-2.5 py-1 rounded-lg text-white font-black text-[10px] flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                          style={{ backgroundColor: activeColor.primary }}
                        >
                          <span>Comprar ({previewItem.cost} 💎)</span>
                        </button>
                      )}

                      <button
                        onClick={() => setPreviewItem(null)}
                        className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-[#283D36] hover:bg-slate-300 dark:hover:bg-[#324C43] text-slate-700 dark:text-[#EDF2EF] font-bold text-[10px] transition-colors"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 dark:text-[#A8B8B1] mt-0.5 leading-snug">
                    Toque em <strong className="text-slate-700 dark:text-[#EDF2EF]">"Provar"</strong> para ver qualquer item no Guaxinim antes de comprar!
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-0.5">
              {shopCatalog.map((it) => {
                const isOwned = inventory.includes(it.id);
                const isPreviewing = previewItem?.id === it.id;

                return (
                  <div
                    key={it.id}
                    className={`p-2.5 rounded-2xl flex items-center justify-between text-xs border transition-all gap-2 ${
                      isPreviewing
                        ? 'bg-emerald-50/80 dark:bg-[#1E3D31] border-emerald-300 dark:border-[#3E7561] shadow-xs'
                        : 'bg-slate-50 dark:bg-[#182622] hover:bg-slate-100/60 dark:hover:bg-[#20332D] border-slate-200/70 dark:border-[#394842]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#18201D] border border-slate-200/80 dark:border-[#394842] flex items-center justify-center shrink-0 shadow-2xs">
                        {renderItemThumbnail(it)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-black text-slate-800 dark:text-[#EDF2EF] block truncate text-xs">{it.name}</span>
                        <span className="text-[10px] text-slate-500 dark:text-[#A8B8B1] block truncate">{it.description}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setPreviewItem(isPreviewing ? null : it)}
                        className={`px-2 py-1.5 rounded-xl font-black text-[10px] transition-all active:scale-95 border ${
                          isPreviewing
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-white dark:bg-[#18201D] hover:bg-slate-100 dark:hover:bg-[#20332D] text-slate-700 dark:text-[#EDF2EF] border-slate-200 dark:border-[#394842]'
                        }`}
                        title="Experimentar no Guaxinim"
                      >
                        {isPreviewing ? 'Provando ✨' : 'Provar'}
                      </button>

                      {isOwned ? (
                        <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-1 rounded-xl shrink-0">
                          Comprado
                        </span>
                      ) : (
                        <button
                          onClick={() => handleBuyItem(it)}
                          className="px-2.5 py-1.5 rounded-xl text-white font-black text-[11px] flex items-center gap-1 shrink-0 active:scale-95 shadow-2xs transition-all"
                          style={{ backgroundColor: activeColor.primary }}
                        >
                          <span>{it.cost} 💎</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Inventory & Customization Modal (Guarda-Roupa com Provador Virtual) */}
      {showItems && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#232D29] w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#AEBDB5]/30 dark:border-[#394842] animate-in slide-in-from-bottom duration-200 text-xs max-h-[92vh] flex flex-col transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#394842] shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧺</span>
                <div>
                  <h4 className="font-black text-slate-800 dark:text-[#EDF2EF] text-base leading-tight">
                    Guarda-Roupa de {petName || 'FoodBud'}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-[#A8B8B1] font-medium">
                    Personalize o visual do seu Guaxinim em tempo real
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowItems(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#18201D] hover:bg-slate-200 dark:hover:bg-[#20332D] text-slate-700 dark:text-[#EDF2EF] flex items-center justify-center shrink-0 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Provador Virtual ao Vivo no Guarda-Roupa */}
            <div className="my-2.5 p-2.5 bg-gradient-to-r from-slate-50 via-emerald-50/50 to-teal-50/50 dark:from-[#18201D] dark:via-[#1A2E26] dark:to-[#172B26] rounded-2xl border border-slate-200/90 dark:border-[#394842] shadow-2xs flex items-center gap-3 shrink-0">
              {/* Live Preview Avatar */}
              <div className="w-20 h-24 bg-white dark:bg-[#18201D] rounded-2xl border border-slate-200/80 dark:border-[#394842] flex items-center justify-center shadow-xs overflow-hidden shrink-0">
                {renderFittingRoomRaccoon(wardrobePreviewCap, wardrobePreviewGlasses, wardrobePreviewClothes)}
              </div>

              {/* Preview Controls & Status */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  <span>Provador do Guarda-Roupa</span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-[#A7C2B7] font-semibold mt-0.5 leading-snug">
                  Toque em <strong className="text-slate-800 dark:text-[#EDF2EF]">"Provar"</strong> nos itens abaixo para testar diferentes combinações!
                </p>

                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {(wardrobePreviewCap !== equippedCap ||
                    wardrobePreviewGlasses !== equippedGlasses ||
                    wardrobePreviewClothes !== equippedClothes) ? (
                    <>
                      <button
                        onClick={() => {
                          setEquippedCap(wardrobePreviewCap);
                          setEquippedGlasses(wardrobePreviewGlasses);
                          setEquippedClothes(wardrobePreviewClothes);
                          onUpdatePetProfile?.({
                            equippedCap: wardrobePreviewCap,
                            equippedGlasses: wardrobePreviewGlasses,
                            equippedClothes: wardrobePreviewClothes
                          });
                          spawnParticle('✨');
                          spawnParticle('🦝');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] shadow-xs active:scale-95 transition-all"
                      >
                        Equipar Este Look
                      </button>
                      <button
                        onClick={() => {
                          setWardrobePreviewCap(equippedCap);
                          setWardrobePreviewGlasses(equippedGlasses);
                          setWardrobePreviewClothes(equippedClothes);
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-[#283D36] hover:bg-slate-300 dark:hover:bg-[#324C43] text-slate-700 dark:text-[#EDF2EF] font-bold text-[10px] transition-colors"
                      >
                        Resetar
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      Visual Atual Equipado ✓
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-[#18201D] rounded-xl mb-2 shrink-0 border border-transparent dark:border-[#394842]">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'cap', label: 'Bonés' },
                { id: 'glasses', label: 'Óculos' },
                { id: 'clothes', label: 'Roupas' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setWardrobeCategory(cat.id as any)}
                  className={`py-1 rounded-lg text-[10px] font-black transition-all ${
                    wardrobeCategory === cat.id
                      ? 'bg-white dark:bg-[#232D29] text-slate-800 dark:text-[#EDF2EF] shadow-xs'
                      : 'text-slate-500 dark:text-[#A8B8B1] hover:text-slate-700 dark:hover:text-[#EDF2EF]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Wardrobe Items Scrollable List */}
            <div className="space-y-2 overflow-y-auto flex-1 pr-0.5">
              {/* Reset to None actions when filtering or in all */}
              {(wardrobeCategory === 'all' || wardrobeCategory === 'cap') && (
                <div
                  onClick={() => {
                    handleToggleCap(null);
                    setWardrobePreviewCap(null);
                  }}
                  className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    equippedCap === null
                      ? 'bg-emerald-50/70 dark:bg-[#1E3D31] border-emerald-300 dark:border-[#3E7561] font-black'
                      : 'bg-slate-50 dark:bg-[#182622] border-slate-200/80 dark:border-[#394842]'
                  }`}
                >
                  <span className="font-bold text-slate-700 dark:text-[#EDF2EF]">🧢 Sem Boné</span>
                  {equippedCap === null && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                </div>
              )}

              {(wardrobeCategory === 'all' || wardrobeCategory === 'glasses') && (
                <div
                  onClick={() => {
                    handleToggleGlasses(null);
                    setWardrobePreviewGlasses(null);
                  }}
                  className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    equippedGlasses === null
                      ? 'bg-emerald-50/70 dark:bg-[#1E3D31] border-emerald-300 dark:border-[#3E7561] font-black'
                      : 'bg-slate-50 dark:bg-[#182622] border-slate-200/80 dark:border-[#394842]'
                  }`}
                >
                  <span className="font-bold text-slate-700 dark:text-[#EDF2EF]">👓 Sem Óculos</span>
                  {equippedGlasses === null && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                </div>
              )}

              {(wardrobeCategory === 'all' || wardrobeCategory === 'clothes') && (
                <div
                  onClick={() => {
                    handleToggleClothes(null);
                    setWardrobePreviewClothes(null);
                  }}
                  className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    equippedClothes === null
                      ? 'bg-emerald-50/70 dark:bg-[#1E3D31] border-emerald-300 dark:border-[#3E7561] font-black'
                      : 'bg-slate-50 dark:bg-[#182622] border-slate-200/80 dark:border-[#394842]'
                  }`}
                >
                  <span className="font-bold text-slate-700 dark:text-[#EDF2EF]">👕 Sem Roupa</span>
                  {equippedClothes === null && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                </div>
              )}

              {/* Owned Items */}
              {shopCatalog
                .filter((item) => inventory.includes(item.id))
                .filter((item) => wardrobeCategory === 'all' || item.type === wardrobeCategory)
                .map((it) => {
                  const isEquipped =
                    (it.type === 'cap' && equippedCap === it.id) ||
                    (it.type === 'glasses' && equippedGlasses === it.id) ||
                    (it.type === 'clothes' && equippedClothes === it.id);

                  const isPreviewingThis =
                    (it.type === 'cap' && wardrobePreviewCap === it.id) ||
                    (it.type === 'glasses' && wardrobePreviewGlasses === it.id) ||
                    (it.type === 'clothes' && wardrobePreviewClothes === it.id);

                  return (
                    <div
                      key={it.id}
                      className={`p-2.5 rounded-2xl flex items-center justify-between text-xs border transition-all gap-2 ${
                        isEquipped
                          ? 'bg-emerald-50/90 dark:bg-[#1E3D31] border-emerald-300 dark:border-[#3E7561] shadow-2xs'
                          : isPreviewingThis
                          ? 'bg-teal-50/60 dark:bg-[#193B33] border-teal-300 dark:border-[#2E6B5D] shadow-2xs'
                          : 'bg-slate-50 dark:bg-[#182622] hover:bg-slate-100/60 dark:hover:bg-[#20332D] border-slate-200/80 dark:border-[#394842]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#18201D] border border-slate-200/80 dark:border-[#394842] flex items-center justify-center shrink-0 shadow-2xs">
                          {renderItemThumbnail(it)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-black text-slate-800 dark:text-[#EDF2EF] block truncate text-xs">
                            {it.name}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-[#A8B8B1] block truncate">
                            {it.description}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            if (it.type === 'cap') {
                              setWardrobePreviewCap(wardrobePreviewCap === it.id ? null : it.id);
                            } else if (it.type === 'glasses') {
                              setWardrobePreviewGlasses(wardrobePreviewGlasses === it.id ? null : it.id);
                            } else if (it.type === 'clothes') {
                              setWardrobePreviewClothes(wardrobePreviewClothes === it.id ? null : it.id);
                            }
                          }}
                          className={`px-2 py-1.5 rounded-xl font-black text-[10px] transition-all active:scale-95 border ${
                            isPreviewingThis
                              ? 'bg-teal-600 text-white border-teal-600'
                              : 'bg-white dark:bg-[#18201D] hover:bg-slate-100 dark:hover:bg-[#20332D] text-slate-700 dark:text-[#EDF2EF] border-slate-200 dark:border-[#394842]'
                          }`}
                          title="Experimentar no Provador"
                        >
                          {isPreviewingThis ? 'Provando ✨' : 'Provar'}
                        </button>

                        <button
                          onClick={() => {
                            if (it.type === 'cap') {
                              handleToggleCap(it.id);
                            } else if (it.type === 'glasses') {
                              handleToggleGlasses(it.id);
                            } else if (it.type === 'clothes') {
                              handleToggleClothes(it.id);
                            }
                          }}
                          className={`px-2.5 py-1.5 rounded-full font-bold text-[10px] flex items-center gap-1 transition-all active:scale-95 ${
                            isEquipped
                              ? 'bg-[#C9D9C8] dark:bg-[#2e473e] text-[#3F4B46] dark:text-[#EDF2EF] border border-[#6F7C76] dark:border-[#527768] shadow-2xs'
                              : 'bg-[#3F4B46] dark:bg-[#284037] hover:opacity-90 text-white'
                          }`}
                        >
                          {isEquipped ? 'Equipado ✓' : 'Equipar'}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* First-time Pet Naming Modal */}
      {showNamingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#232D29] w-full max-w-sm rounded-3xl p-6 shadow-cozy border border-[#AEBDB5]/30 dark:border-[#394842] animate-in zoom-in-95 duration-200 text-center relative overflow-hidden transition-colors">
            <div className="w-20 h-20 bg-[#ECEFE7] dark:bg-[#243730] rounded-full mx-auto flex items-center justify-center border-2 border-[#AEBDB5]/40 dark:border-[#394842] shadow-2xs mb-3">
              <span className="text-4xl">🦝</span>
            </div>

            <h3 className="text-base font-extrabold text-[#3F4B46] dark:text-[#EDF2EF]">
              Como você quer chamar seu Guaxinim?
            </h3>
            <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1] mt-1 leading-relaxed">
              Dê um nome carinhoso ao seu novo parceiro de hábitos, treinos e nutrição saudável!
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSavePetName(namingInput || 'FoodBud');
              }}
              className="mt-4 space-y-3"
            >
              <div className="relative">
                <input
                  type="text"
                  value={namingInput}
                  onChange={(e) => setNamingInput(e.target.value.slice(0, 14))}
                  placeholder="Ex: Fred, Pipoca, Bandit, Rocket..."
                  maxLength={14}
                  autoFocus
                  className="w-full text-center py-2.5 px-4 rounded-xl border-2 border-[#AEBDB5]/40 dark:border-[#394842] focus:outline-none focus:border-[#5B8273] font-bold text-sm text-[#3F4B46] dark:text-[#EDF2EF] placeholder:text-[#6F7C76]/60 placeholder:font-normal bg-[#F7F4EE] dark:bg-[#18201D]"
                />
                <div className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] font-medium text-right mt-1">
                  {namingInput.length}/14 caracteres
                </div>
              </div>

              <button
                type="submit"
                disabled={!namingInput.trim()}
                className="w-full py-3 bg-[#C9D9C8] hover:bg-[#C8E6C9] dark:bg-[#2e473e] disabled:opacity-50 text-[#3F4B46] dark:text-[#EDF2EF] border-2 border-[#6F7C76] dark:border-[#527768] font-bold text-xs rounded-full shadow-xs transition-all active:scale-98"
              >
                Confirmar Nome
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Season & Time of Day Controller Modal */}
      {showSeasonModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#232D29] w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 shadow-cozy border border-[#AEBDB5]/30 dark:border-[#394842] animate-in slide-in-from-bottom duration-200 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-[#AEBDB5]/20 dark:border-[#394842]">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌍</span>
                <div>
                  <h4 className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF] text-base leading-tight">Estação & Horário</h4>
                  <p className="text-[11px] text-[#6F7C76] dark:text-[#A8B8B1] font-medium">
                    {currentTimeFormatted ? `Relógio local: ${currentTimeFormatted}` : 'Sincronia em tempo real'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSeasonModal(false)}
                className="w-8 h-8 rounded-full bg-[#F7F4EE] dark:bg-[#18201D] hover:bg-[#ECEFE7] dark:hover:bg-[#233730] text-[#6F7C76] dark:text-[#A8B8B1] flex items-center justify-center transition-colors border border-[#AEBDB5]/20 dark:border-[#394842]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-4 max-h-80 overflow-y-auto">
              {/* Auto Sync Toggle Card */}
              <div className="p-3 bg-[#F7F4EE] dark:bg-[#18201D] rounded-2xl border border-[#AEBDB5]/20 dark:border-[#394842] flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF]">Sincronização Real</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAutoTime ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {isAutoTime ? 'Automático' : 'Modo Manual'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] mt-0.5">
                    Usa a hora e o calendário astronômico brasileiro oficial.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const next = !isAutoTime;
                    setIsAutoTime(next);
                    if (next) {
                      const now = new Date();
                      setCurrentSeason(getCalendarSeason(now));
                      setCurrentTimeOfDay(getTimeOfDay(now));
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 active:scale-95 border ${
                    isAutoTime
                      ? 'bg-[#C9D9C8] hover:bg-[#C8E6C9] dark:bg-[#2e473e] text-[#3F4B46] dark:text-[#EDF2EF] border-[#6F7C76] dark:border-[#527768] shadow-2xs'
                      : 'bg-[#ECEFE7] dark:bg-[#233730] hover:bg-[#d8ebd9] text-[#6F7C76] dark:text-[#A8B8B1] border-[#AEBDB5]/30 dark:border-[#394842]'
                  }`}
                >
                  {isAutoTime ? 'Ativo ✓' : 'Ativar'}
                </button>
              </div>

              {/* Time of Day Picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF]">Período do Dia:</span>
                  <span className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] font-medium">Céu & Iluminação</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: 'day' as TimeOfDay, name: 'Dia', icon: '☀️', hours: '06h - 17h30' },
                      { id: 'sunset' as TimeOfDay, name: 'Pôr do Sol', icon: '🌇', hours: '17h30 - 18h45' },
                      { id: 'night' as TimeOfDay, name: 'Noite', icon: '🌙', hours: '18h45 - 06h' }
                    ] as const
                  ).map((tod) => {
                    const active = currentTimeOfDay === tod.id;
                    return (
                      <button
                        key={tod.id}
                        onClick={() => {
                          setIsAutoTime(false);
                          setCurrentTimeOfDay(tod.id);
                        }}
                        className={`p-2 rounded-xl text-center border transition-all ${
                          active
                            ? 'bg-[#C9D9C8] dark:bg-[#2e473e] text-[#3F4B46] dark:text-[#EDF2EF] border-[#6F7C76] dark:border-[#527768] shadow-xs font-bold'
                            : 'bg-[#F7F4EE] dark:bg-[#18201D] hover:bg-[#ECEFE7] dark:hover:bg-[#233730] text-[#6F7C76] dark:text-[#A8B8B1] border-[#AEBDB5]/20 dark:border-[#394842]'
                        }`}
                      >
                        <div className="text-lg">{tod.icon}</div>
                        <div className="text-xs font-bold">{tod.name}</div>
                        <div
                          className={`text-[9px] ${
                            active ? 'text-[#3F4B46]/80 dark:text-[#EDF2EF]/80' : 'text-[#6F7C76] dark:text-[#A8B8B1]'
                          } font-medium mt-0.5`}
                        >
                          {tod.hours}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Calendar Season Picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF]">Estação do Ano:</span>
                  <span className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] font-medium">Clima & Decorações</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      {
                        id: 'spring' as Season,
                        name: 'Primavera',
                        icon: '🌸',
                        period: '22/09 a 20/12',
                        decor: 'Flores & Cerejeira'
                      },
                      {
                        id: 'summer' as Season,
                        name: 'Verão',
                        icon: '☀️',
                        period: '21/12 a 19/03',
                        decor: 'Frutas & Vagalumes'
                      },
                      {
                        id: 'autumn' as Season,
                        name: 'Outono',
                        icon: '🍂',
                        period: '20/03 a 20/06',
                        decor: 'Folhas Douradas & Abóbora'
                      },
                      {
                        id: 'winter' as Season,
                        name: 'Inverno',
                        icon: '❄️',
                        period: '21/06 a 21/09',
                        decor: 'Neve & Boneco de Neve'
                      }
                    ] as const
                  ).map((s) => {
                    const active = currentSeason === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          setIsAutoTime(false);
                          setCurrentSeason(s.id);
                        }}
                        className={`p-2.5 rounded-xl text-left border transition-all ${
                          active
                            ? 'bg-[#C9D9C8] dark:bg-[#2e473e] text-[#3F4B46] dark:text-[#EDF2EF] border-[#6F7C76] dark:border-[#527768] shadow-xs'
                            : 'bg-[#F7F4EE] dark:bg-[#18201D] hover:bg-[#ECEFE7] dark:hover:bg-[#233730] text-[#6F7C76] dark:text-[#A8B8B1] border-[#AEBDB5]/20 dark:border-[#394842]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-base">{s.icon}</span>
                          <span className="text-xs font-bold">{s.name}</span>
                        </div>
                        <div
                          className={`text-[10px] font-semibold ${
                            active ? 'text-[#3F4B46]/80 dark:text-[#EDF2EF]/80' : 'text-[#6F7C76] dark:text-[#A8B8B1]'
                          }`}
                        >
                          {s.period}
                        </div>
                        <div
                          className={`text-[9px] ${
                            active ? 'text-[#3F4B46]/70 dark:text-[#EDF2EF]/70' : 'text-[#6F7C76]/80 dark:text-[#A8B8B1]/80'
                          } mt-0.5 truncate`}
                        >
                          {s.decor}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#AEBDB5]/20 dark:border-[#394842] text-center">
              <button
                onClick={() => setShowSeasonModal(false)}
                className="w-full py-3 bg-[#C9D9C8] hover:bg-[#C8E6C9] dark:bg-[#2e473e] text-[#3F4B46] dark:text-[#EDF2EF] border-2 border-[#6F7C76] dark:border-[#527768] text-xs font-bold rounded-full transition-all shadow-xs active:scale-98"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

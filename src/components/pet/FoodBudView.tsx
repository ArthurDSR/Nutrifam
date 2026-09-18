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
  Pencil
} from 'lucide-react';
import { useTheme } from '../../services/themeService';
import { DayLog } from '../../types';
import { FoodBudLandscape } from './FoodBudLandscape';
import { FoodBudMascot } from './FoodBudMascot';
import { SeasonalParticles } from './SeasonalParticles';
import { QuestsView, calculateUnclaimedQuests } from '../quests/QuestsView';

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
  dayLog?: DayLog;
  onClaimQuest?: (questId: string, rewardGems: number, rewardPetXp: number) => void;
  onSpendGems: (amount: number) => void;
  onUpdatePetProfile?: (updates: {
    inventory?: string[];
    equippedCap?: string | null;
    equippedGlasses?: string | null;
    equippedClothes?: string | null;
    petName?: string;
  }) => void;
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
  dayLog,
  onClaimQuest,
  onSpendGems,
  onUpdatePetProfile
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
  const [shopCategory, setShopCategory] = useState<'all' | 'cap' | 'glasses' | 'clothes'>('all');

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
  const [showQuestsModal, setShowQuestsModal] = useState(false);

  // Unclaimed Quests calculation for notification badge
  const unclaimedQuestsCount = dayLog ? calculateUnclaimedQuests(dayLog) : 0;

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
      id: 'cap_lilac',
      name: 'Boné Lilás Clássico',
      cost: 100,
      type: 'cap',
      color: '#AC82C7',
      darkColor: '#8958A6',
      icon: '🧢',
      description: 'Boné lilás virado para trás, assinatura do FoodBud'
    },
    {
      id: 'cap_beanie',
      name: 'Gorro de Inverno com Pompom',
      cost: 140,
      type: 'cap',
      color: '#2563eb',
      darkColor: '#1d4ed8',
      icon: '❄️',
      description: 'Gorro quentinho de lã com pompom felpudo'
    },
    {
      id: 'cap_headband',
      name: 'Faixa Esportiva NutriFit',
      cost: 90,
      type: 'cap',
      color: '#10b981',
      darkColor: '#059669',
      icon: '🏃',
      description: 'Faixa atlética elástica para corridas e treinos'
    },
    {
      id: 'cap_blue',
      name: 'Boné Azul Esportivo',
      cost: 100,
      type: 'cap',
      color: '#0284c7',
      darkColor: '#0369a1',
      icon: '🧢',
      description: 'Boné aba curva esportivo para o Guaxinim atleta'
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
      id: 'glasses_sun',
      name: 'Óculos de Sol Retrô',
      cost: 150,
      type: 'glasses',
      icon: '🕶️',
      description: 'Proteção estilosa com lentes escuras'
    },
    {
      id: 'glasses_round',
      name: 'Óculos Redondos Intelectual',
      cost: 120,
      type: 'glasses',
      icon: '👓',
      description: 'Armação fina dourada com lentes de leitura'
    },
    {
      id: 'glasses_modern',
      name: 'Óculos Escuros Urbanos',
      cost: 130,
      type: 'glasses',
      icon: '🕶️',
      description: 'Armação quadrada moderna com lentes escuras'
    },
    {
      id: 'clothes_scarf_red',
      name: 'Cachecol Vermelho de Inverno',
      cost: 120,
      type: 'clothes',
      color: '#dc2626',
      darkColor: '#991b1b',
      icon: '🧣',
      description: 'Cachecol quentinho idêntico ao do boneco de neve'
    },
    {
      id: 'clothes_hoodie_emerald',
      name: 'Moletom Esmeralda Fit',
      cost: 160,
      type: 'clothes',
      color: '#487A63',
      darkColor: '#3B6451',
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

  // Metadados do ambiente. A paleta do cenário vive em FoodBudLandscape e
  // não depende do tema claro/escuro da interface.
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

    return {
      isNight,
      isSunset,
      isDay,
      seasonMeta: seasonLabels[season],
      timeMeta: timeLabels[timeOfDay]
    };
  };

  const theme = getEnvironmentConfig(currentSeason, currentTimeOfDay);

  // Helper colors for caps
  const activeCapItem = shopCatalog.find((i) => i.id === equippedCap);
  const capColor = activeCapItem?.color || '#9333ea';
  const capDarker = activeCapItem?.darkColor || '#7e22ce';

  // Render visual SVG thumbnail for shop items
  const renderItemThumbnail = (it: ShopItem) => {
    // 1. CAPS & HEADWEAR
    if (it.id === 'cap_lilac') {
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 shrink-0">
          {/* Backwards Lilac Cap Dome */}
          <path d="M 11 25 C 11 14 17 9 20 9 C 23 9 29 14 29 25 Z" fill="#AC82C7" />
          {/* Center seam */}
          <path d="M 20 9 L 20 22" stroke="#8958A6" strokeWidth="1" opacity="0.6" />
          {/* Top button */}
          <ellipse cx="20" cy="9" rx="2" ry="1.2" fill="#8958A6" />
          {/* Backwards curved visor / brim */}
          <path d="M 8 25 C 13 29 27 29 32 25 C 29 21 24 20 20 20 C 16 20 11 21 8 25 Z" fill="#8958A6" />
        </svg>
      );
    }
    if (it.id === 'cap_blue') {
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 shrink-0">
          <path d="M 11 23 C 12 13 18 9 22 9 C 26 9 32 13 32 23 Z" fill="#0284C7" />
          <line x1="22" y1="9" x2="22" y2="22" stroke="#0369A1" strokeWidth="1" opacity="0.5" />
          <circle cx="22" cy="9" r="1.5" fill="#0369A1" />
          <path d="M 7 24 C 11 20 17 22 25 22 C 29 22 33 23 33 24 C 26 28 13 28 7 24 Z" fill="#0369A1" />
        </svg>
      );
    }
    if (it.id === 'cap_green') {
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 shrink-0">
          <path d="M 11 23 C 12 13 18 9 22 9 C 26 9 32 13 32 23 Z" fill="#16A34A" />
          <line x1="22" y1="9" x2="22" y2="22" stroke="#15803D" strokeWidth="1" opacity="0.5" />
          <circle cx="22" cy="9" r="1.5" fill="#15803D" />
          <path d="M 7 24 C 11 20 17 22 25 22 C 29 22 33 23 33 24 C 26 28 13 28 7 24 Z" fill="#15803D" />
        </svg>
      );
    }
    if (it.id === 'cap_beanie') {
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 shrink-0">
          {/* Beanie Dome */}
          <path d="M 11 26 C 11 15 16 11 20 11 C 24 11 29 15 29 26 Z" fill="#2563EB" />
          {/* Knit ribs */}
          <line x1="16" y1="13" x2="16" y2="25" stroke="#1D4ED8" strokeWidth="1" opacity="0.6" />
          <line x1="20" y1="11" x2="20" y2="25" stroke="#1D4ED8" strokeWidth="1" opacity="0.6" />
          <line x1="24" y1="13" x2="24" y2="25" stroke="#1D4ED8" strokeWidth="1" opacity="0.6" />
          {/* Fold cuff */}
          <rect x="9" y="24" width="22" height="6" rx="2.5" fill="#1D4ED8" />
          {/* White Pom-pom */}
          <circle cx="20" cy="9" r="4.5" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.8" />
        </svg>
      );
    }
    if (it.id === 'cap_headband') {
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 shrink-0">
          <path d="M 6 22 Q 20 27 34 22 L 33 16 Q 20 21 7 16 Z" fill="#10B981" stroke="#059669" strokeWidth="1" />
          <line x1="7" y1="19" x2="33" y2="19" stroke="#ECFDF5" strokeWidth="1.8" />
        </svg>
      );
    }
    if (it.id === 'cap_gold') {
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 shrink-0">
          <path
            d="M 8 28 L 6 15 L 13 21 L 20 10 L 27 21 L 34 15 L 32 28 Z"
            fill="#F59E0B"
            stroke="#B45309"
            strokeWidth="1.2"
          />
          <rect x="7" y="25" width="26" height="4" rx="2" fill="#D97706" stroke="#92400E" strokeWidth="0.8" />
          <circle cx="20" cy="10" r="2" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="0.6" />
          <circle cx="6" cy="15" r="1.6" fill="#EF4444" stroke="#B91C1C" strokeWidth="0.6" />
          <circle cx="34" cy="15" r="1.6" fill="#EF4444" stroke="#B91C1C" strokeWidth="0.6" />
          <circle cx="13" cy="21" r="1.4" fill="#10B981" stroke="#047857" strokeWidth="0.6" />
          <circle cx="27" cy="21" r="1.4" fill="#10B981" stroke="#047857" strokeWidth="0.6" />
        </svg>
      );
    }
    if (it.type === 'cap') {
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 shrink-0">
          <path d="M 11 23 C 12 13 18 9 22 9 C 26 9 32 13 32 23 Z" fill={it.color || '#AC82C7'} />
          <circle cx="22" cy="9" r="1.5" fill={it.darkColor || '#8958A6'} />
          <path d="M 7 24 C 11 20 17 22 25 22 C 29 22 33 23 33 24 C 26 28 13 28 7 24 Z" fill={it.darkColor || '#8958A6'} />
        </svg>
      );
    }

    // 2. GLASSES & EYEWEAR
    if (it.id === 'glasses_sun') {
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 shrink-0">
          <path d="M 6 15 H 18 V 22 C 18 26 6 26 6 22 Z" fill="#0F172A" stroke="#020617" strokeWidth="1.5" />
          <path d="M 22 15 H 34 V 22 C 34 26 22 26 22 22 Z" fill="#0F172A" stroke="#020617" strokeWidth="1.5" />
          <line x1="18" y1="18" x2="22" y2="18" stroke="#020617" strokeWidth="2" />
          <line x1="8" y1="17" x2="14" y2="23" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          <line x1="24" y1="17" x2="30" y2="23" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        </svg>
      );
    }
    if (it.id === 'glasses_round') {
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 shrink-0">
          <circle cx="13" cy="20" r="7" fill="rgba(255,255,255,0.2)" stroke="#D97706" strokeWidth="1.8" />
          <circle cx="27" cy="20" r="7" fill="rgba(255,255,255,0.2)" stroke="#D97706" strokeWidth="1.8" />
          <line x1="19" y1="20" x2="21" y2="20" stroke="#D97706" strokeWidth="1.8" />
          <path d="M 10 17 L 14 21" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          <path d="M 24 17 L 28 21" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
        </svg>
      );
    }
    if (it.id === 'glasses_modern') {
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 shrink-0">
          <rect x="6" y="14" width="12" height="11" rx="2.5" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
          <rect x="22" y="14" width="12" height="11" rx="2.5" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
          <line x1="18" y1="18" x2="22" y2="18" stroke="#0F172A" strokeWidth="2" />
          <line x1="8" y1="17" x2="16" y2="17" stroke="#38BDF8" strokeWidth="1.2" opacity="0.8" strokeLinecap="round" />
          <line x1="24" y1="17" x2="32" y2="17" stroke="#38BDF8" strokeWidth="1.2" opacity="0.8" strokeLinecap="round" />
        </svg>
      );
    }
    if (it.type === 'glasses') {
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 shrink-0">
          <circle cx="13" cy="20" r="7" fill="rgba(255,255,255,0.3)" stroke="#0F172A" strokeWidth="1.8" />
          <circle cx="27" cy="20" r="7" fill="rgba(255,255,255,0.3)" stroke="#0F172A" strokeWidth="1.8" />
          <line x1="20" y1="20" x2="20" y2="20" stroke="#0F172A" strokeWidth="2" />
          <path d="M 10 18 L 14 22" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
        </svg>
      );
    }

    // 3. CLOTHES & WEARABLES
    if (it.id === 'clothes_scarf_red') {
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 shrink-0">
          <path d="M 8 16 C 12 21 28 21 32 16 C 34 20 30 24 20 24 C 10 24 6 20 8 16 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1.2" />
          <ellipse cx="16" cy="20" rx="3" ry="2.5" fill="#B91C1C" />
          <path d="M 14 21 L 12 33 C 12 35 18 35 18 33 L 19 22 Z" fill="#B91C1C" />
          <path d="M 18 22 L 17 30 C 17 31 22 31 22 30 L 23 22 Z" fill="#DC2626" />
          <line x1="13" y1="33" x2="13" y2="35.5" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="15" y1="33" x2="15" y2="35.5" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="17" y1="33" x2="17" y2="35.5" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    }
    if (it.id === 'clothes_hoodie_emerald') {
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 shrink-0">
          <path d="M 11 14 C 14 11 26 11 29 14 L 33 22 L 29 23 L 28 32 C 24 33 16 33 12 32 L 11 23 L 7 22 Z" fill="#487A63" stroke="#3B6451" strokeWidth="1.2" />
          <path d="M 14 13 C 17 16 23 16 26 13 Z" fill="#3B6451" />
          <line x1="20" y1="14" x2="20" y2="24" stroke="#F1F5F9" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M 15 24 H 25 L 24 29 H 16 Z" fill="#3B6451" stroke="#2D4E3F" strokeWidth="0.8" />
        </svg>
      );
    }
    if (it.id === 'clothes_shirt_striped') {
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 shrink-0">
          <path d="M 12 13 C 15 11 25 11 28 13 L 32 21 L 28 22 L 28 32 C 24 33 16 33 12 32 L 12 22 L 8 21 Z" fill="#F8FAFC" stroke="#2563EB" strokeWidth="1.2" />
          <path d="M 16 12 C 18 15 22 15 24 12" stroke="#2563EB" strokeWidth="1.5" fill="none" />
          <line x1="10" y1="18" x2="30" y2="18" stroke="#2563EB" strokeWidth="1.8" />
          <line x1="12" y1="22" x2="28" y2="22" stroke="#2563EB" strokeWidth="1.8" />
          <line x1="12" y1="26" x2="28" y2="26" stroke="#2563EB" strokeWidth="1.8" />
          <line x1="13" y1="30" x2="27" y2="30" stroke="#2563EB" strokeWidth="1.8" />
        </svg>
      );
    }
    if (it.id === 'clothes_vest_puffer') {
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 shrink-0">
          <path d="M 13 13 C 16 11 24 11 27 13 L 29 18 L 28 32 C 24 33 16 33 12 32 L 11 18 Z" fill="#EA580C" stroke="#C2410C" strokeWidth="1.2" />
          <path d="M 14 13 C 17 15 23 15 26 13" stroke="#9A3412" strokeWidth="2" fill="none" />
          <path d="M 12 18 Q 20 20 28 18" stroke="#C2410C" strokeWidth="1.5" fill="none" />
          <path d="M 12 23 Q 20 25 28 23" stroke="#C2410C" strokeWidth="1.5" fill="none" />
          <path d="M 12 28 Q 20 30 28 28" stroke="#C2410C" strokeWidth="1.5" fill="none" />
          <line x1="20" y1="13" x2="20" y2="32" stroke="#1C1917" strokeWidth="1.5" />
        </svg>
      );
    }
    if (it.id === 'clothes_bandana_gold') {
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 shrink-0">
          <path d="M 8 16 Q 20 21 32 16 L 30 19 Q 20 23 10 19 Z" fill="#CA8A04" />
          <path d="M 10 18 Q 20 22 30 18 L 20 33 Z" fill="#EAB308" stroke="#CA8A04" strokeWidth="1.2" />
          <path d="M 13 20 Q 20 25 27 20" stroke="#FDE047" strokeWidth="1.4" fill="none" />
          <circle cx="20" cy="24" r="2" fill="#EF4444" stroke="#991B1B" strokeWidth="0.6" />
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 40 40" className="w-8 h-8 shrink-0">
        <path d="M 10 18 Q 20 22 30 18 L 20 33 Z" fill="#EAB308" stroke="#CA8A04" strokeWidth="1.2" />
        <circle cx="20" cy="24" r="2" fill="#EF4444" />
      </svg>
    );
  };

  // Render fitting room preview raccoon avatar using the official mascot component
  const renderFittingRoomRaccoon = (
    previewCap: string | null,
    previewGlasses: string | null,
    previewClothes?: string | null
  ) => {
    const itemCap = shopCatalog.find((i) => i.id === previewCap);
    const pCapColor = itemCap?.color || '#AC82C7';
    const pCapDarker = itemCap?.darkColor || '#8958A6';

    return (
      <div className="w-full h-full flex items-center justify-center p-0.5 overflow-hidden">
        <FoodBudMascot
          mood="happy"
          petLevel={petLevel}
          equippedCap={previewCap}
          equippedGlasses={previewGlasses}
          equippedClothes={previewClothes || null}
          capColor={pCapColor}
          capDarker={pCapDarker}
          className="w-20 h-24 scale-95"
        />
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col relative select-none overflow-hidden pb-1 bg-[#B7C7BA]">
      <FoodBudLandscape season={currentSeason} timeOfDay={currentTimeOfDay} />
      <SeasonalParticles season={currentSeason} />

      {/* Top Status Header - Unified Minimalist Glass HUD */}
      <div className="px-3.5 pt-3 z-10">
        <div
          className={`backdrop-blur-md rounded-2xl px-3 py-2 flex items-center justify-between shadow-2xs border transition-colors duration-300 ${
            isDark
              ? 'bg-[#232D29]/90 text-[#EDF2EF] border-[#394842]'
              : 'bg-white/95 text-[#3F4B46] border-[#AEBDB5]/30'
          }`}
        >
          {/* Left: Pet Avatar, Name & Level/XP progress */}
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
              <div className="w-6 h-6 flex items-center justify-center">
                <FoodBudMascot headOnly className="w-full h-full" mood="happy" petLevel={petLevel} />
              </div>
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
                <span className={`font-black text-xs sm:text-sm tracking-tight truncate max-w-[110px] sm:max-w-[140px] ${isDark ? 'text-[#EDF2EF]' : 'text-[#3F4B46]'}`}>
                  {petName || 'FoodBud'}
                </span>
                <Pencil className="w-2.5 h-2.5 text-[#6F7C76] dark:text-[#A8B8B1] group-hover:opacity-80 transition-opacity shrink-0" />
              </div>

              {/* Mini level badge and subtle XP bar */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border leading-tight ${levelInfo.badge}`}>
                  {levelInfo.shortTitle}
                </span>
                <div
                  className={`w-14 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-[#18201D]' : 'bg-[#ECEFE7]'}`}
                  title={`Progresso: ${petXp}/100 XP`}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, petXp))}%`,
                      backgroundColor: activeColor.primary
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Quests link + Gems balance + Weather/Season button */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quests inside Pet screen */}
            {dayLog && (
              <button
                onClick={() => setShowQuestsModal(true)}
                className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-all active:scale-95 shadow-2xs font-black text-xs ${
                  unclaimedQuestsCount > 0
                    ? 'bg-rose-500 text-white border-rose-600 shadow-md animate-pulse'
                    : isDark
                    ? 'bg-[#18201D] text-amber-300 border-[#394842] hover:bg-[#20332D]'
                    : 'bg-[#F7F4EE] text-amber-700 border-[#AEBDB5]/30 hover:bg-[#ECEFE7]'
                }`}
                title="Missões Diárias do Pet"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">Missões</span>
                {unclaimedQuestsCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-white text-rose-600 text-[9.5px] font-black leading-tight">
                    {unclaimedQuestsCount}
                  </span>
                )}
              </button>
            )}

            {/* Gems balance */}
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl font-black text-xs border shadow-2xs"
              style={{
                backgroundColor: isDark ? activeColor.darkBg : activeColor.pastel,
                borderColor: isDark ? activeColor.darkBorder : activeColor.border,
                color: isDark ? activeColor.darkText : activeColor.textDark
              }}
            >
              <Gem className="w-3.5 h-3.5 shrink-0" style={{ color: activeColor.primary }} />
              <span>{gems}</span>
            </div>

            {/* Season & Time of Day button */}
            <button
              onClick={() => setShowSeasonModal(true)}
              className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-black border transition-all active:scale-95 shadow-2xs ${
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
      </div>

      {/* Scenic Nature Garden with FoodBud & Decluttered Atmosphere */}
      <div className="flex-1 relative flex flex-col justify-between overflow-hidden">
        {/* Action toast feedback */}
        {petActionEffect && (
          <div className="absolute top-3 inset-x-0 flex justify-center z-30">
            <span className="bg-slate-900/95 text-white backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black shadow-xl animate-in zoom-in-95 duration-150 border border-slate-700">
              {petActionEffect}
            </span>
          </div>
        )}

        {/* Mascot sits naturally in the spacious meadow without crowding */}
        <div className="absolute inset-x-0 bottom-[110px] z-10 flex justify-center pointer-events-none">
          {/* Guaxinim Container (Clickable affection interaction) */}
          <div
            onClick={handlePetCarinho}
            className={`relative flex flex-col items-center cursor-pointer pointer-events-auto transition-all duration-300 group ${
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

            <FoodBudMascot
              mood={mood}
              petLevel={petLevel}
              equippedCap={equippedCap}
              equippedGlasses={equippedGlasses}
              equippedClothes={equippedClothes}
              capColor={capColor}
              capDarker={capDarker}
            />
          </div>
        </div>

        {/* Bottom Controls Area: Streamlined & Balanced */}
        <div className="relative z-20 flex flex-col items-center gap-2 px-4 pb-2 mt-auto">
          {/* Care Action Bar */}
          <div
            className={`${
              isDark
                ? 'bg-[#232D29]/90 text-[#EDF2EF] border-[#394842]'
                : 'bg-white/95 text-[#3F4B46] border-[#AEBDB5]/30'
            } shadow-cozy backdrop-blur-md px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-colors duration-300`}
          >
            <button
              onClick={handlePetCarinho}
              className={`px-3 py-1.5 rounded-full ${
                isDark
                  ? 'bg-[#18201D] hover:bg-rose-950/40 text-[#EDF2EF] border-[#394842]'
                  : 'bg-[#F7F4EE] hover:bg-rose-50 text-[#3F4B46] border-[#AEBDB5]/30'
              } text-xs font-black shadow-2xs flex items-center gap-1.5 transition-all active:scale-95 border`}
              title="Fazer Carinho no Guaxinim"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Carinho</span>
            </button>

            <button
              onClick={handlePlayPet}
              className={`px-3 py-1.5 rounded-full ${
                isDark
                  ? 'bg-[#18201D] hover:bg-sky-950/40 text-[#EDF2EF] border-[#394842]'
                  : 'bg-[#F7F4EE] hover:bg-sky-50 text-[#3F4B46] border-[#AEBDB5]/30'
              } text-xs font-black shadow-2xs flex items-center gap-1.5 transition-all active:scale-95 border`}
              title="Brincar com o Guaxinim"
            >
              <Smile className="w-3.5 h-3.5 text-sky-500" />
              <span>Brincar</span>
            </button>

            <button
              onClick={handleFeedHealthy}
              className={`px-3 py-1.5 rounded-full ${
                isDark
                  ? 'bg-[#18201D] hover:bg-emerald-950/40 text-[#EDF2EF] border-[#394842]'
                  : 'bg-[#F7F4EE] hover:bg-emerald-50 text-[#3F4B46] border-[#AEBDB5]/30'
              } text-xs font-black shadow-2xs flex items-center gap-1.5 transition-all active:scale-95 border`}
              title="Alimentar com fruta"
            >
              <Apple className="w-3.5 h-3.5 text-emerald-500" />
              <span>Alimentar</span>
            </button>

            <button
              onClick={handleToggleSleep}
              className={`p-1.5 rounded-full ${
                isDark
                  ? 'bg-[#18201D] hover:bg-[#2B3732] text-amber-300 border-[#394842]'
                  : 'bg-[#F7F4EE] hover:bg-[#ECEFE7] text-[#3F4B46] border-[#AEBDB5]/30'
              } shadow-2xs flex items-center justify-center transition-all active:scale-95 border`}
              title={mood === 'sleeping' ? 'Acordar' : 'Dormir'}
            >
              {mood === 'sleeping' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
              )}
            </button>
          </div>

          {/* Compact Loja & Guarda-Roupa Actions */}
          <div className="flex items-center gap-2 w-full max-w-xs">
            <button
              onClick={() => setShowShop(true)}
              className={`flex-1 ${
                isDark
                  ? 'bg-[#232D29]/90 hover:bg-[#283D36] border-[#394842] text-[#EDF2EF]'
                  : 'bg-white/95 hover:bg-[#F7F4EE] border-[#AEBDB5]/30 text-[#3F4B46]'
              } border rounded-2xl py-2 px-3 flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-cozy backdrop-blur-md`}
            >
              <span className="text-base leading-none">🏬</span>
              <span className="font-black text-xs">Loja</span>
            </button>

            <button
              onClick={() => setShowItems(true)}
              className={`flex-1 ${
                isDark
                  ? 'bg-[#232D29]/90 hover:bg-[#283D36] border-[#394842] text-[#EDF2EF]'
                  : 'bg-white/95 hover:bg-[#F7F4EE] border-[#AEBDB5]/30 text-[#3F4B46]'
              } border rounded-2xl py-2 px-3 flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-cozy backdrop-blur-md`}
            >
              <span className="text-base leading-none">🧺</span>
              <span className="font-black text-xs">Guarda-Roupa</span>
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
              <span
                className="flex items-center gap-1 font-black"
                style={{ color: isDark ? activeColor.darkText : activeColor.textDark }}
              >
                <Gem className="w-3.5 h-3.5" style={{ color: activeColor.primary }} />
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
                  onClick={() => setShopCategory(cat.id as any)}
                  className={`py-1 rounded-lg text-[10px] font-black transition-all ${
                    shopCategory === cat.id
                      ? 'bg-white dark:bg-[#232D29] text-slate-800 dark:text-[#EDF2EF] shadow-xs'
                      : 'text-slate-500 dark:text-[#A8B8B1] hover:text-slate-700 dark:hover:text-[#EDF2EF]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-0.5">
              {shopCatalog
                .filter((it) => shopCategory === 'all' || it.type === shopCategory)
                .map((it) => {
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
            <div className="w-20 h-20 bg-[#ECEFE7] dark:bg-[#243730] rounded-full mx-auto flex items-center justify-center border-2 border-[#AEBDB5]/40 dark:border-[#394842] shadow-2xs mb-3 p-2">
              <FoodBudMascot headOnly className="w-full h-full" mood="happy" petLevel={petLevel} />
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

      {/* Quests Inside Pet Screen Modal */}
      {showQuestsModal && dayLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#1E2623] rounded-3xl max-h-[90vh] flex flex-col shadow-2xl border border-[#AEBDB5]/20 dark:border-[#394842] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#AEBDB5]/20 dark:border-[#394842] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-[#18201D] dark:text-white">
                  Missões do FoodBud
                </h3>
              </div>
              <button
                onClick={() => setShowQuestsModal(false)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#6F7C76] dark:text-[#A8B8B1]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <QuestsView
                dayLog={dayLog}
                currentGems={gems}
                petLevel={petLevel}
                petXp={petXp}
                petName={petName}
                onClaimQuest={(qId, g, xp) => {
                  if (onClaimQuest) {
                    onClaimQuest(qId, g, xp);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

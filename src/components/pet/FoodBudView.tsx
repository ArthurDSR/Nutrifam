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
import { FoodBudLandscape } from './FoodBudLandscape';
import { FoodBudMascot } from './FoodBudMascot';

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
    <div className="flex-1 flex flex-col relative select-none overflow-hidden pb-3 bg-[#B7C7BA]">
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

        <FoodBudLandscape season={currentSeason} timeOfDay={currentTimeOfDay} />

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

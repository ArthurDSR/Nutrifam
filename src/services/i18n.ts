import { useState, useEffect } from 'react';

export type Language = 'pt' | 'en' | 'es';

const LANGUAGE_STORAGE_KEY = 'nutrifam_app_language';

const translations = {
  pt: {
    // Navigation
    'nav.coach': 'Coach',
    'nav.journal': 'Diário',
    'nav.quests': 'Missões',
    'nav.foodbud': 'FoodBud',
    'nav.profile': 'Perfil',

    // Journal - Top Calorie Ring
    'journal.eaten': 'Consumidas',
    'journal.burned': 'Queimadas',
    'journal.remaining': 'Restantes',
    'journal.over': 'Excedente',
    'journal.calories': 'Calorias',
    'journal.target': 'Meta',
    'journal.macros': 'Macronutrientes',
    'journal.protein': 'Proteína',
    'journal.carbs': 'Carboidratos',
    'journal.fat': 'Gorduras',
    'journal.fiber': 'Fibras',
    'journal.details': 'Ver Detalhes',
    'journal.hideDetails': 'Ocultar Detalhes',

    // Journal - Date Navigator
    'date.today': 'Hoje',
    'date.yesterday': 'Ontem',
    'date.tomorrow': 'Amanhã',
    'date.resetDay': 'Zerar Registros do Dia',
    'date.resetDayTitle': 'Zerar Dia',
    'date.resetDayConfirm': 'Deseja zerar as calorias, refeições e garrafas de água deste dia para recomeçar do zero?',
    'date.resetDaySuccess': 'Consumo e calorias do dia zerados com sucesso! 💧🥗',
    'date.resetCancel': 'Cancelar',
    'date.resetConfirmBtn': 'Sim, Zerar',

    // Journal - Meals
    'meal.breakfast': 'Café da Manhã',
    'meal.lunch': 'Almoço',
    'meal.dinner': 'Jantar',
    'meal.snacks': 'Lanches',
    'meal.addFood': 'Adicionar Alimento',
    'meal.review': 'Auditoria Nutricional',
    'meal.empty': 'Nenhum alimento registrado ainda.',
    'meal.servings': 'porção',
    'meal.servingsPlural': 'porções',

    // Journal - Hydration
    'water.title': 'Desafio da Água',
    'water.goal': 'Meta atingida!',
    'water.glasses': 'garrafinhas',
    'water.drinkCup': 'Bebi +250ml',
    'water.undoCup': 'Desfazer 250ml',
    'water.target': 'Meta Diária',

    // Journal - Fasting
    'fasting.title': 'Jejum Intermitente',
    'fasting.active': 'Em jejum',
    'fasting.inactive': 'Alimentação livre',
    'fasting.pause': 'Pausar',
    'fasting.resume': 'Retomar',
    'fasting.cancel': 'Encerrar',
    'fasting.start': 'Iniciar Jejum',
    'fasting.elapsed': 'Tempo decorrido',
    'fasting.stage': 'Fase Metabólica',

    // Journal - Activities
    'activity.title': 'Atividades Físicas',
    'activity.burned': 'Cal Queimadas',
    'activity.add': 'Registrar Exercício',
    'activity.sync': 'Sincronizar Saúde',
    'activity.empty': 'Caminhe ou adicione um exercício para contar calorias queimadas.',
    'activity.duration': 'Duração',

    // Journal - Notes & Diary
    'notes.title': 'Notas do Dia',
    'notes.placeholder': 'Como você se sentiu hoje? Energia, digestão, sono...',
    'notes.saved': 'Nota salva!',

    // Profile - Stats & Tabs
    'profile.title': 'Meu Perfil',
    'profile.tabWeight': 'Peso & Metas',
    'profile.tabNutrition': 'Análise Nutricional',
    'profile.startWeight': 'Peso Inicial',
    'profile.currentWeight': 'Peso Atual',
    'profile.goalWeight': 'Peso Meta',
    'profile.addWeight': 'Registrar Pesagem',
    'profile.bmi': 'IMC',
    'profile.bmiUnder': 'Abaixo do peso',
    'profile.bmiNormal': 'Peso saudável',
    'profile.bmiOver': 'Sobrepeso',
    'profile.bmiObese': 'Obesidade',
    'profile.weightHistory': 'Histórico de Pesagens',
    'profile.noWeights': 'Nenhuma pesagem registrada ainda.',

    // Profile - Nutrition Studio
    'nutrition.macroRatio': 'Distribuição Calórica',
    'nutrition.novaAudit': 'Auditoria de Processamento (NOVA)',
    'nutrition.inNatura': 'In Natura / Mínimo',
    'nutrition.culinary': 'Ingredientes Culinários',
    'nutrition.processed': 'Processados',
    'nutrition.ultraProcessed': 'Ultraprocessados',

    // Profile - Account & Health
    'account.guest': 'Modo Convidado',
    'account.guestDesc': 'Crie uma conta gratuita para salvar seus dados na nuvem com segurança.',
    'account.login': 'Entrar / Criar Conta',
    'account.logout': 'Sair da Conta',
    'account.twoFactor': 'Autenticação em 2 Fatores (A2F)',
    'account.active': 'Conta Ativa',

    // Food Modal
    'food.modalTitle': 'Adicionar ao',
    'food.searchTab': 'Buscar',
    'food.barcodeTab': 'Código de Barras',
    'food.photoTab': 'Foto IA',
    'food.quickTab': 'Rápido',
    'food.myFoodsTab': 'Meus Alimentos',
    'food.searchPlaceholder': 'Buscar por alimento ou marca (ex: Tapioca, Whey Growth...)',
    'food.all': 'Tudo',
    'food.proteins': 'Proteínas',
    'food.fruits': 'Frutas & Vegetais',
    'food.dairy': 'Laticínios',
    'food.brands': 'Marcas Brasileiras',
    'food.recipes': 'Receitas',
    'food.inNatura': 'In Natura',
    'food.ultra': 'Ultraprocessado',
    'food.score': 'Nota',
    'food.grams': 'Gramas (g)',
    'food.portion': 'Porção do Fabricante',
    'food.addBtn': 'Adicionar ao Diário',
    'food.createCustom': '+ Criar Alimento',

    // Quests
    'quests.title': 'Missões Diárias',
    'quests.subtitle': 'Cumpra suas metas para ganhar Gemas e evoluir o Guaxinim!',
    'quests.gems': 'Suas Gemas',
    'quests.petLvl': 'Nível do FoodBud',
    'quests.claim': 'Resgatar',
    'quests.claimed': 'Resgatado ✓',

    // Settings
    'settings.title': 'Configurações',
    'settings.language': 'Idioma do Aplicativo',
    'settings.languageDesc': 'Escolha o idioma de exibição do NutriFam.',
    'settings.aiProvider': 'Inteligência Artificial (Coach Nutricional)',
    'settings.supabase': 'Nuvem Supabase',
    'settings.supabaseDesc': 'Sincronização em nuvem do perfil, FoodBud, refeições diárias e pesagens.',
    'settings.testDb': 'Testar Conexão com o Banco',
    'settings.health': 'Dispositivos de Saúde',
    'settings.account': 'Segurança da Conta',
    'settings.close': 'Fechar',
    'settings.save': 'Salvar Preferências',
    'settings.restoreDemo': 'Restaurar Dados de Demonstração',
    'settings.restoreConfirm': 'Deseja restaurar os dados de demonstração originais?',

    // Account in Settings
    'account.title': 'Conta & Autenticação',
    'account.offline': 'Modo Offline',
    'account.linkedEmail': 'E-mail Vinculado',
    'account.twoFactorTitle': 'Dois Fatores (A2F)',
    'account.twoFactorActive': 'Ativo com código OTP',
    'account.twoFactorDisabled': 'Não configurado',
    'account.twoFactorConfigure': 'Configurar',
    'account.twoFactorIsActive': 'Ativo ✓',
    'account.guestTitle': 'Você está como Convidado',
    'account.guestSubtitle': 'Faça login com criptografia para sincronizar',
    'account.loginBtn': 'Entrar',

    // Health in Settings
    'health.title': 'Saúde & Dispositivos',
    'health.linked': 'Vinculado',
    'health.disconnected': 'Desconectado',
    'health.desc': 'Importe seus treinos e calorias gastas do Apple Health (iOS) ou Android Health Connect / Google Fit.',
    'health.syncBtn': 'Sincronizar Atividades e Calorias',

    // Splash toggle in Settings
    'splash.title': 'Animação de Abertura',
    'splash.desc': 'Exibir o Guaxinim animado subindo e piscando ao iniciar o aplicativo.',
    'splash.enabled': 'Ativada',
    'splash.disabled': 'Desativada',

    // AI in Settings
    'ai.title': 'Coach Nutricional (IA)',
    'ai.desc': 'Escolha seu provedor de IA para cálculo automático de macronutrientes e análise por foto.',
    'ai.providerLabel': 'Provedor de Inteligência Artificial',
    'ai.keyLabel': 'Chave de API',
    'ai.modelLabel': 'Modelo',
    'ai.testBtn': 'Testar Conexão IA',
    'ai.testSuccess': 'Conexão estabelecida com sucesso!',
    'ai.testError': 'Falha ao conectar com a IA.',
    'ai.freeModelNotice': 'Gratuito e Ilimitado',
    'ai.modelOpenRouter': 'Modelo OpenRouter (Grátis)',
    'ai.modelOpenAI': 'Modelo OpenAI',
    'ai.freeOpenRouter': 'OpenRouter (Grátis)',
    'ai.openAiGpt': 'OpenAI ChatGPT',
    'ai.geminiStudio': 'Google Gemini',
    'ai.keyOpenRouterLabel': 'Chave de API OpenRouter (sk-or-v1-...)',
    'ai.keyOpenAiLabel': 'Chave de API OpenAI (sk-...)',
    'ai.keyGeminiLabel': 'Chave de API Google Gemini',
    'ai.createKeyFree': 'Criar chave grátis →',
    'ai.createKeyOpenAi': 'Criar chave na OpenAI →',
    'ai.createKeyGemini': 'Obter chave gratuita no Google AI Studio →',
    'ai.geminiModelNotice': 'Modelo: gemini-1.5-flash (Visão multimodal e respostas instantâneas)',
    'ai.testKeyWith': 'Testar Chave',

    // Pet Naming & Wardrobe
    'pet.nameTitle': 'Como você quer chamar seu Guaxinim?',
    'pet.nameSubtitle': 'Dê um nome carinhoso ao seu novo parceiro de hábitos e nutrição!',
    'pet.namePlaceholder': 'Ex: Fred, Pipoca, Bandit, Rocket...',
    'pet.nameConfirm': 'Confirmar Nome',
    'pet.wardrobeTitle': 'Guarda-Roupa do FoodBud',
    'pet.livePreview': 'Provador Virtual ao Vivo',
    'pet.caps': 'Bonés & Coroas',
    'pet.glasses': 'Óculos',
    'pet.clothes': 'Roupas & Trajes',
    'pet.equip': 'Equipar',
    'pet.equipped': 'Equipado ✓',
    'pet.preview': 'Provar',
    'pet.unequip': 'Remover',
    'pet.noItems': 'Nenhum item nesta categoria ainda.',
    'journal.criticalOver': 'Excesso Crítico'
  },
  en: {
    // Navigation
    'nav.coach': 'Coach',
    'nav.journal': 'Journal',
    'nav.quests': 'Quests',
    'nav.foodbud': 'FoodBud',
    'nav.profile': 'Profile',

    // Journal - Top Calorie Ring
    'journal.eaten': 'Eaten',
    'journal.burned': 'Burned',
    'journal.remaining': 'Remaining',
    'journal.over': 'Over target',
    'journal.calories': 'Calories',
    'journal.target': 'Target',
    'journal.macros': 'Macronutrients',
    'journal.protein': 'Protein',
    'journal.carbs': 'Carbs',
    'journal.fat': 'Fat',
    'journal.fiber': 'Fiber',
    'journal.details': 'View Details',
    'journal.hideDetails': 'Hide Details',

    // Journal - Date Navigator
    'date.today': 'Today',
    'date.yesterday': 'Yesterday',
    'date.tomorrow': 'Tomorrow',
    'date.resetDay': 'Reset Day Records',
    'date.resetDayTitle': 'Reset Day',
    'date.resetDayConfirm': 'Do you want to reset calories, meals and water bottles for this day back to zero?',
    'date.resetDaySuccess': 'Day consumption and calories successfully reset! 💧🥗',
    'date.resetCancel': 'Cancel',
    'date.resetConfirmBtn': 'Yes, Reset',

    // Journal - Meals
    'meal.breakfast': 'Breakfast',
    'meal.lunch': 'Lunch',
    'meal.dinner': 'Dinner',
    'meal.snacks': 'Snacks',
    'meal.addFood': 'Add Food',
    'meal.review': 'Nutritional Audit',
    'meal.empty': 'No foods logged yet.',
    'meal.servings': 'serving',
    'meal.servingsPlural': 'servings',

    // Journal - Hydration
    'water.title': 'Hydration Goal',
    'water.goal': 'Goal reached!',
    'water.glasses': 'bottles',
    'water.drinkCup': 'Drink +250ml',
    'water.undoCup': 'Undo 250ml',
    'water.target': 'Daily Target',

    // Journal - Fasting
    'fasting.title': 'Intermittent Fasting',
    'fasting.active': 'Fasting active',
    'fasting.inactive': 'Eating window',
    'fasting.pause': 'Pause',
    'fasting.resume': 'Resume',
    'fasting.cancel': 'End Fast',
    'fasting.start': 'Start Fast',
    'fasting.elapsed': 'Elapsed Time',
    'fasting.stage': 'Metabolic Stage',

    // Journal - Activities
    'activity.title': 'Physical Activities',
    'activity.burned': 'Cal Burned',
    'activity.add': 'Log Exercise',
    'activity.sync': 'Sync Health',
    'activity.empty': 'Walk or log an exercise to track active calories burned.',
    'activity.duration': 'Duration',

    // Journal - Notes & Diary
    'notes.title': 'Daily Notes',
    'notes.placeholder': 'How did you feel today? Energy levels, digestion, sleep...',
    'notes.saved': 'Note saved!',

    // Profile - Stats & Tabs
    'profile.title': 'My Profile',
    'profile.tabWeight': 'Weight & Goals',
    'profile.tabNutrition': 'Nutrition Audit',
    'profile.startWeight': 'Start Weight',
    'profile.currentWeight': 'Current Weight',
    'profile.goalWeight': 'Goal Weight',
    'profile.addWeight': 'Log Weight',
    'profile.bmi': 'BMI',
    'profile.bmiUnder': 'Underweight',
    'profile.bmiNormal': 'Healthy weight',
    'profile.bmiOver': 'Overweight',
    'profile.bmiObese': 'Obesity',
    'profile.weightHistory': 'Weight History',
    'profile.noWeights': 'No weights logged yet.',

    // Profile - Nutrition Studio
    'nutrition.macroRatio': 'Calorie Distribution',
    'nutrition.novaAudit': 'Food Processing Audit (NOVA)',
    'nutrition.inNatura': 'Whole Foods / Minimally Processed',
    'nutrition.culinary': 'Culinary Ingredients',
    'nutrition.processed': 'Processed',
    'nutrition.ultraProcessed': 'Ultra-Processed',

    // Profile - Account & Health
    'account.guest': 'Guest Mode',
    'account.guestDesc': 'Create a free account to securely sync your data to the cloud.',
    'account.login': 'Log In / Sign Up',
    'account.logout': 'Sign Out',
    'account.twoFactor': 'Two-Factor Authentication (2FA)',
    'account.active': 'Active Account',

    // Food Modal
    'food.modalTitle': 'Add to',
    'food.searchTab': 'Search',
    'food.barcodeTab': 'Barcode',
    'food.photoTab': 'AI Photo',
    'food.quickTab': 'Quick Add',
    'food.myFoodsTab': 'My Foods',
    'food.searchPlaceholder': 'Search by food or brand (e.g., Oatmeal, Whey, Greek Yogurt...)',
    'food.all': 'All',
    'food.proteins': 'Proteins',
    'food.fruits': 'Fruits & Veggies',
    'food.dairy': 'Dairy',
    'food.brands': 'Popular Brands',
    'food.recipes': 'Recipes',
    'food.inNatura': 'Whole Food',
    'food.ultra': 'Ultra-Processed',
    'food.score': 'Score',
    'food.grams': 'Grams (g)',
    'food.portion': 'Manufacturer Serving',
    'food.addBtn': 'Log to Diary',
    'food.createCustom': '+ Create Food',

    // Quests
    'quests.title': 'Daily Quests',
    'quests.subtitle': 'Reach your daily targets to earn Gems and level up FoodBud!',
    'quests.gems': 'Your Gems',
    'quests.petLvl': 'FoodBud Level',
    'quests.claim': 'Claim',
    'quests.claimed': 'Claimed ✓',

    // Settings
    'settings.title': 'Settings',
    'settings.language': 'App Language',
    'settings.languageDesc': 'Choose your preferred language for NutriFam.',
    'settings.aiProvider': 'AI Nutritional Coach Provider',
    'settings.supabase': 'Supabase Cloud',
    'settings.supabaseDesc': 'Cloud sync for user profile, FoodBud, daily logs and weight entries.',
    'settings.testDb': 'Test Database Connection',
    'settings.health': 'Health Devices',
    'settings.account': 'Account Security',
    'settings.close': 'Close',
    'settings.save': 'Save Preferences',
    'settings.restoreDemo': 'Restore Demo Data',
    'settings.restoreConfirm': 'Do you want to restore original demo data?',

    // Account in Settings
    'account.title': 'Account & Security',
    'account.offline': 'Offline Mode',
    'account.linkedEmail': 'Linked Email',
    'account.twoFactorTitle': 'Two-Factor Auth (2FA)',
    'account.twoFactorActive': 'Active with OTP code',
    'account.twoFactorDisabled': 'Not configured',
    'account.twoFactorConfigure': 'Configure',
    'account.twoFactorIsActive': 'Active ✓',
    'account.guestTitle': 'You are in Guest Mode',
    'account.guestSubtitle': 'Log in with encryption to sync your data',
    'account.loginBtn': 'Sign In',

    // Health in Settings
    'health.title': 'Health & Devices',
    'health.linked': 'Connected',
    'health.disconnected': 'Disconnected',
    'health.desc': 'Import your workouts and burned calories from Apple Health (iOS) or Android Health Connect / Google Fit.',
    'health.syncBtn': 'Sync Workouts and Calories',

    // Splash toggle in Settings
    'splash.title': 'Launch Splash Animation',
    'splash.desc': 'Show the animated raccoon climbing and blinking when opening the app.',
    'splash.enabled': 'Enabled',
    'splash.disabled': 'Disabled',

    // AI in Settings
    'ai.title': 'Nutritional AI Coach',
    'ai.desc': 'Choose your AI provider for automatic macronutrient calculation and photo analysis.',
    'ai.providerLabel': 'AI Provider',
    'ai.keyLabel': 'API Key',
    'ai.modelLabel': 'Model',
    'ai.testBtn': 'Test AI Connection',
    'ai.testSuccess': 'Connection established successfully!',
    'ai.testError': 'Failed to connect to AI.',
    'ai.freeModelNotice': 'Free & Unlimited',
    'ai.modelOpenRouter': 'OpenRouter Model (Free)',
    'ai.modelOpenAI': 'OpenAI Model',
    'ai.freeOpenRouter': 'OpenRouter (Free)',
    'ai.openAiGpt': 'OpenAI ChatGPT',
    'ai.geminiStudio': 'Google Gemini',
    'ai.keyOpenRouterLabel': 'OpenRouter API Key (sk-or-v1-...)',
    'ai.keyOpenAiLabel': 'OpenAI API Key (sk-...)',
    'ai.keyGeminiLabel': 'Google Gemini API Key',
    'ai.createKeyFree': 'Create free key →',
    'ai.createKeyOpenAi': 'Create key on OpenAI →',
    'ai.createKeyGemini': 'Get free key at Google AI Studio →',
    'ai.geminiModelNotice': 'Model: gemini-1.5-flash (Multimodal vision and instant responses)',
    'ai.testKeyWith': 'Test Key',

    // Pet Naming & Wardrobe
    'pet.nameTitle': 'What is your Raccoon\'s name?',
    'pet.nameSubtitle': 'Give a lovely name to your new health and nutrition buddy!',
    'pet.namePlaceholder': 'E.g., Rocket, Bandit, Peanut, Rocky...',
    'pet.nameConfirm': 'Confirm Name',
    'pet.wardrobeTitle': 'FoodBud Wardrobe',
    'pet.livePreview': 'Live Fitting Room',
    'pet.caps': 'Hats & Crowns',
    'pet.glasses': 'Glasses',
    'pet.clothes': 'Clothes & Outfits',
    'pet.equip': 'Equip',
    'pet.equipped': 'Equipped ✓',
    'pet.preview': 'Try On',
    'pet.unequip': 'Unequip',
    'pet.noItems': 'No items in this category yet.',
    'journal.criticalOver': 'Critical Excess'
  },
  es: {
    // Navigation
    'nav.coach': 'Coach',
    'nav.journal': 'Diario',
    'nav.quests': 'Misiones',
    'nav.foodbud': 'FoodBud',
    'nav.profile': 'Perfil',

    // Journal - Top Calorie Ring
    'journal.eaten': 'Consumidas',
    'journal.burned': 'Quemadas',
    'journal.remaining': 'Restantes',
    'journal.over': 'Excedente',
    'journal.calories': 'Calorías',
    'journal.target': 'Objetivo',
    'journal.macros': 'Macronutrientes',
    'journal.protein': 'Proteína',
    'journal.carbs': 'Carbohidratos',
    'journal.fat': 'Grasas',
    'journal.fiber': 'Fibra',
    'journal.details': 'Ver Detalles',
    'journal.hideDetails': 'Ocultar Detalles',

    // Journal - Date Navigator
    'date.today': 'Hoy',
    'date.yesterday': 'Ayer',
    'date.tomorrow': 'Mañana',
    'date.resetDay': 'Reiniciar Registros del Día',
    'date.resetDayTitle': 'Reiniciar Día',
    'date.resetDayConfirm': '¿Deseas reiniciar las calorías, comidas y botellas de agua de este día a cero?',
    'date.resetDaySuccess': '¡Consumo y calorías del día reiniciados con éxito! 💧🥗',
    'date.resetCancel': 'Cancelar',
    'date.resetConfirmBtn': 'Sí, Reiniciar',

    // Journal - Meals
    'meal.breakfast': 'Desayuno',
    'meal.lunch': 'Almuerzo',
    'meal.dinner': 'Cena',
    'meal.snacks': 'Snacks',
    'meal.addFood': 'Añadir Alimento',
    'meal.review': 'Auditoría Nutricional',
    'meal.empty': 'No hay alimentos registrados todavía.',
    'meal.servings': 'porción',
    'meal.servingsPlural': 'porciones',

    // Journal - Hydration
    'water.title': 'Desafío de Hidratación',
    'water.goal': '¡Meta alcanzada!',
    'water.glasses': 'botellas',
    'water.drinkCup': 'Bebí +250ml',
    'water.undoCup': 'Deshacer 250ml',
    'water.target': 'Meta Diaria',

    // Journal - Fasting
    'fasting.title': 'Ayuno Intermitente',
    'fasting.active': 'En ayuno',
    'fasting.inactive': 'Ventana de alimentación',
    'fasting.pause': 'Pausar',
    'fasting.resume': 'Reanudar',
    'fasting.cancel': 'Finalizar',
    'fasting.start': 'Iniciar Ayuno',
    'fasting.elapsed': 'Tiempo transcurrido',
    'fasting.stage': 'Fase Metabólica',

    // Journal - Activities
    'activity.title': 'Actividades Físicas',
    'activity.burned': 'Cal Quemadas',
    'activity.add': 'Registrar Ejercicio',
    'activity.sync': 'Sincronizar Salud',
    'activity.empty': 'Camina o añade un ejercicio para registrar calorías quemadas.',
    'activity.duration': 'Duración',

    // Journal - Notes & Diary
    'notes.title': 'Notas del Día',
    'notes.placeholder': '¿Cómo te sentiste hoy? Energía, digestión, sueño...',
    'notes.saved': '¡Nota guardada!',

    // Profile - Stats & Tabs
    'profile.title': 'Mi Perfil',
    'profile.tabWeight': 'Peso y Metas',
    'profile.tabNutrition': 'Análisis Nutricional',
    'profile.startWeight': 'Peso Inicial',
    'profile.currentWeight': 'Peso Actual',
    'profile.goalWeight': 'Peso Meta',
    'profile.addWeight': 'Registrar Peso',
    'profile.bmi': 'IMC',
    'profile.bmiUnder': 'Bajo peso',
    'profile.bmiNormal': 'Peso saludable',
    'profile.bmiOver': 'Sobrepeso',
    'profile.bmiObese': 'Obesidad',
    'profile.weightHistory': 'Historial de Peso',
    'profile.noWeights': 'No hay registros de peso aún.',

    // Profile - Nutrition Studio
    'nutrition.macroRatio': 'Distribución Calórica',
    'nutrition.novaAudit': 'Auditoría de Procesamiento (NOVA)',
    'nutrition.inNatura': 'Natural / Mínimamente Procesado',
    'nutrition.culinary': 'Ingredientes Culinarios',
    'nutrition.processed': 'Procesados',
    'nutrition.ultraProcessed': 'Ultraprocesados',

    // Profile - Account & Health
    'account.guest': 'Modo Invitado',
    'account.guestDesc': 'Crea una cuenta gratuita para sincronizar tus datos en la nube.',
    'account.login': 'Iniciar Sesión / Registrarse',
    'account.logout': 'Cerrar Sesión',
    'account.twoFactor': 'Autenticación de 2 Factores (2FA)',
    'account.active': 'Cuenta Activa',

    // Food Modal
    'food.modalTitle': 'Añadir a',
    'food.searchTab': 'Buscar',
    'food.barcodeTab': 'Código de Barras',
    'food.photoTab': 'Foto IA',
    'food.quickTab': 'Rápido',
    'food.myFoodsTab': 'Mis Alimentos',
    'food.searchPlaceholder': 'Buscar alimento o marca (ej: Avena, Proteína, Manzana...)',
    'food.all': 'Todo',
    'food.proteins': 'Proteínas',
    'food.fruits': 'Frutas y Verduras',
    'food.dairy': 'Lácteos',
    'food.brands': 'Marcas Populares',
    'food.recipes': 'Recetas',
    'food.inNatura': 'Natural',
    'food.ultra': 'Ultraprocesado',
    'food.score': 'Puntaje',
    'food.grams': 'Gramos (g)',
    'food.portion': 'Porción del Fabricante',
    'food.addBtn': 'Añadir al Diario',
    'food.createCustom': '+ Crear Alimento',

    // Quests
    'quests.title': 'Misiones Diarias',
    'quests.subtitle': '¡Cumple tus objetivos diarios para ganar Gemas y subir de nivel a FoodBud!',
    'quests.gems': 'Tus Gemas',
    'quests.petLvl': 'Nivel de FoodBud',
    'quests.claim': 'Reclamar',
    'quests.claimed': 'Reclamado ✓',

    // Settings
    'settings.title': 'Configuración',
    'settings.language': 'Idioma de la App',
    'settings.languageDesc': 'Elige el idioma preferido para NutriFam.',
    'settings.aiProvider': 'Proveedor del Coach Nutricional IA',
    'settings.supabase': 'Nube Supabase',
    'settings.supabaseDesc': 'Sincronización en la nube de perfil, FoodBud, registros diarios y peso.',
    'settings.testDb': 'Probar Conexión con la Base de Datos',
    'settings.health': 'Dispositivos de Salud',
    'settings.account': 'Seguridad de la Cuenta',
    'settings.close': 'Cerrar',
    'settings.save': 'Guardar Preferencias',
    'settings.restoreDemo': 'Restaurar Datos de Demostración',
    'settings.restoreConfirm': '¿Deseas restaurar los datos de demostración originales?',

    // Account in Settings
    'account.title': 'Cuenta y Autenticación',
    'account.offline': 'Modo Offline',
    'account.linkedEmail': 'Correo Vinculado',
    'account.twoFactorTitle': 'Dos Factores (2FA)',
    'account.twoFactorActive': 'Activo con código OTP',
    'account.twoFactorDisabled': 'No configurado',
    'account.twoFactorConfigure': 'Configurar',
    'account.twoFactorIsActive': 'Activo ✓',
    'account.guestTitle': 'Estás como Invitado',
    'account.guestSubtitle': 'Inicia sesión con cifrado para sincronizar tus datos',
    'account.loginBtn': 'Entrar',

    // Health in Settings
    'health.title': 'Salud y Dispositivos',
    'health.linked': 'Conectado',
    'health.disconnected': 'Desconectado',
    'health.desc': 'Importa tus entrenamientos y calorías quemadas de Apple Health (iOS) o Android Health Connect / Google Fit.',
    'health.syncBtn': 'Sincronizar Actividades y Calorías',

    // Splash toggle in Settings
    'splash.title': 'Animación de Inicio',
    'splash.desc': 'Mostrar el Mapache animado subiendo y parpadeando al iniciar la app.',
    'splash.enabled': 'Activada',
    'splash.disabled': 'Desactivada',

    // AI in Settings
    'ai.title': 'Coach Nutricional (IA)',
    'ai.desc': 'Elige tu proveedor de IA para cálculo automático de macronutrientes y análisis por foto.',
    'ai.providerLabel': 'Proveedor de Inteligencia Artificial',
    'ai.keyLabel': 'Clave de API',
    'ai.modelLabel': 'Modelo',
    'ai.testBtn': 'Probar Conexión IA',
    'ai.testSuccess': '¡Conexión establecida con éxito!',
    'ai.testError': 'Error al conectar con la IA.',
    'ai.freeModelNotice': 'Gratis e Ilimitado',
    'ai.modelOpenRouter': 'Modelo OpenRouter (Gratis)',
    'ai.modelOpenAI': 'Modelo OpenAI',
    'ai.freeOpenRouter': 'OpenRouter (Gratis)',
    'ai.openAiGpt': 'OpenAI ChatGPT',
    'ai.geminiStudio': 'Google Gemini',
    'ai.keyOpenRouterLabel': 'Clave de API OpenRouter (sk-or-v1-...)',
    'ai.keyOpenAiLabel': 'Clave de API OpenAI (sk-...)',
    'ai.keyGeminiLabel': 'Clave de API Google Gemini',
    'ai.createKeyFree': 'Crear clave gratis →',
    'ai.createKeyOpenAi': 'Crear clave en OpenAI →',
    'ai.createKeyGemini': 'Obtener clave gratis en Google AI Studio →',
    'ai.geminiModelNotice': 'Modelo: gemini-1.5-flash (Visión multimodal y respuestas instantáneas)',
    'ai.testKeyWith': 'Probar Clave',

    // Pet Naming & Wardrobe
    'pet.nameTitle': '¿Cómo quieres llamar a tu Mapache?',
    'pet.nameSubtitle': '¡Ponle un nombre cariñoso a tu nuevo compañero de hábitos y nutrición!',
    'pet.namePlaceholder': 'Ej: Bandido, Pancho, Rocket, Chispa...',
    'pet.nameConfirm': 'Confirmar Nombre',
    'pet.wardrobeTitle': 'Armario de FoodBud',
    'pet.livePreview': 'Probador Virtual en Vivo',
    'pet.caps': 'Gorras y Coronas',
    'pet.glasses': 'Gafas',
    'pet.clothes': 'Ropa y Trajes',
    'pet.equip': 'Equipar',
    'pet.equipped': 'Equipado ✓',
    'pet.preview': 'Probar',
    'pet.unequip': 'Quitar',
    'pet.noItems': 'No hay artículos en esta categoría aún.',
    'journal.criticalOver': 'Exceso Crítico'
  }
};

export type TranslationKey = keyof typeof translations.pt;

type LanguageListener = (lang: Language) => void;
const listeners = new Set<LanguageListener>();

export function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
    if (stored && (stored === 'pt' || stored === 'en' || stored === 'es')) {
      return stored;
    }
  } catch {}
  return 'pt';
}

let currentLanguage: Language = getInitialLanguage();

export function setAppLanguage(lang: Language): void {
  currentLanguage = lang;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {}
  listeners.forEach((listener) => listener(lang));
}

export function getCurrentLanguage(): Language {
  return currentLanguage;
}

export function t(key: TranslationKey, fallback?: string): string {
  const dict = translations[currentLanguage] || translations.pt;
  return (dict as any)[key] || fallback || key;
}

export function useTranslation() {
  const [lang, setLang] = useState<Language>(currentLanguage);

  useEffect(() => {
    const handleUpdate = (newLang: Language) => {
      setLang(newLang);
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return {
    language: lang,
    setLanguage: setAppLanguage,
    t: (key: TranslationKey, fallback?: string) => t(key, fallback)
  };
}

import { Exercise, MuscleCategory } from '../types/workout';
import { EXERCISE_GIF_MAP } from './exerciseGifMap';
import { loadExercisesFromSupabase } from './supabaseClient';

export const EXERCISE_DATABASE: Exercise[] = [
  {
    id: 'chest_bench_press_barbell',
    name: 'Supino Reto com Barra',
    nameEn: 'Barbell Bench Press',
    category: 'chest',
    equipment: 'barbell',
    targetMuscle: 'Peitoral Maior (Geral)',
    secondaryMuscles: ["Tríceps Braquial","Deltoide Anterior"],
    instructions: 'Deite-se no banco reto com os pés firmes no chão. Segure a barra um pouco mais largo que os ombros. Desça a barra de forma controlada até tocar suavemente o meio do peito e empurre para cima.',
    tips: 'Apoie bem as escápulas no banco e mantenha os pés firmes no chão para base estável.',
    difficulty: 'intermediate',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/barbell-bench-press.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/barbell-bench-press.gif'
  },
  {
    id: 'chest_incline_bench_press_barbell',
    name: 'Supino Inclinado com Barra',
    nameEn: 'Incline Barbell Bench Press',
    category: 'chest',
    equipment: 'barbell',
    targetMuscle: 'Peitoral Superior (Clavicular)',
    secondaryMuscles: ["Deltoide Anterior","Tríceps"],
    instructions: 'No banco a 30-45 graus, abaixe a barra até a parte superior do peito com controle, mantendo escápulas retraídas.',
    tips: 'Banco regulado entre 30° e 45° para foco clavicular sem sobrecarregar a articulação do ombro.',
    difficulty: 'intermediate',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/barbell-incline-bench-press.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/barbell-incline-bench-press.gif'
  },
  {
    id: 'chest_bench_press_dumbbell',
    name: 'Supino Reto com Halteres',
    nameEn: 'Dumbbell Bench Press',
    category: 'chest',
    equipment: 'dumbbell',
    targetMuscle: 'Peitoral Maior',
    secondaryMuscles: ["Tríceps","Deltoide Anterior"],
    instructions: 'Deite-se com um halter em cada mão. Desça os halteres abrindo o peito até sentir bom alongamento e empurre aproximando-os no topo.',
    tips: 'Permite maior amplitude de movimento e trabalho estabilizador independente para cada braço.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/dumbbell-bench-press.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/dumbbell-bench-press.gif'
  },
  {
    id: 'chest_incline_bench_press_dumbbell',
    name: 'Supino Inclinado com Halteres',
    nameEn: 'Incline Dumbbell Bench Press',
    category: 'chest',
    equipment: 'dumbbell',
    targetMuscle: 'Peitoral Superior',
    secondaryMuscles: ["Deltoide Anterior","Tríceps"],
    instructions: 'Banco a 30-45 graus. Desça os halteres lateralmente com amplitude controlada e empurre convergindo sem bater os pesos.',
    tips: 'Desça abrindo os cotovelos a 45-60 graus do tronco para preservar o manguito rotador.',
    difficulty: 'intermediate',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/dumbbell-incline-bench-press.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/dumbbell-incline-bench-press.gif'
  },
  {
    id: 'chest_decline_press_dumbbell',
    name: 'Supino Declinado com Halteres',
    nameEn: 'Decline Dumbbell Press',
    category: 'chest',
    equipment: 'dumbbell',
    targetMuscle: 'Peitoral Inferior',
    secondaryMuscles: ["Tríceps","Deltoide Anterior"],
    instructions: 'Em banco declinado, posicione as pernas fixas. Empurre os halteres verticalmente focando na contração da porção inferior do peito.',
    tips: 'Foco na porção esternal e inferior do peitoral, mantendo o abdômen contraído.',
    difficulty: 'intermediate',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/dumbbell-decline-bench-press.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/dumbbell-decline-bench-press.gif'
  },
  {
    id: 'chest_dumbbell_fly',
    name: 'Crucifixo Reto com Halteres',
    nameEn: 'Dumbbell Fly',
    category: 'chest',
    equipment: 'dumbbell',
    targetMuscle: 'Peitoral Maior (Foco em Alongamento)',
    secondaryMuscles: ["Deltoide Anterior"],
    instructions: 'Deitado de costas, abra os braços mantendo leve flexão nos cotovelos. Alongue o peitoral e retorne abraçando o ar.',
    tips: 'Mantenha os cotovelos levemente flexionados durante todo o movimento sem bater os pesos no topo.',
    difficulty: 'intermediate',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/dumbbell-fly.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/dumbbell-fly.gif'
  },
  {
    id: 'chest_incline_dumbbell_fly',
    name: 'Crucifixo Inclinado com Halteres',
    nameEn: 'Incline Dumbbell Fly',
    category: 'chest',
    equipment: 'dumbbell',
    targetMuscle: 'Peitoral Superior',
    secondaryMuscles: ["Deltoide Anterior"],
    instructions: 'Em banco a 30-45 graus, abra os braços em arco suave sentindo o alongamento da porção clavicular.',
    tips: 'Excelente para alongar as fibras superiores do peitoral com controle de cadência.',
    difficulty: 'intermediate',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/dumbbell-incline-fly.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/dumbbell-incline-fly.gif'
  },
  {
    id: 'chest_cable_crossover_high',
    name: 'Crossover Polia Alta',
    nameEn: 'High Cable Crossover',
    category: 'chest',
    equipment: 'cable',
    targetMuscle: 'Peitoral Inferior e Esterno',
    secondaryMuscles: ["Deltoide Anterior","Core"],
    instructions: 'Com os cabos na altura máxima, dê um passo à frente e puxe os cabos para baixo e para frente cruzando as mãos levemente.',
    tips: 'Incline ligeiramente o tronco e aperte o peitoral por 1 segundo no ponto de pico de contração.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/cable-standing-up-straight-crossovers.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/cable-standing-up-straight-crossovers.gif'
  },
  {
    id: 'chest_cable_crossover_low',
    name: 'Crossover Polia Baixa',
    nameEn: 'Low Cable Crossover',
    category: 'chest',
    equipment: 'cable',
    targetMuscle: 'Peitoral Superior',
    secondaryMuscles: ["Deltoide Anterior (Clavicular)"],
    instructions: 'Com os cabos no ponto mais baixo, puxe para cima e para o centro até a linha do queixo.',
    tips: 'Puxe de baixo para cima convergindo as mãos na altura do peito/queixo com tensão contínua.',
    difficulty: 'intermediate',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/cable-upper-chest-crossovers.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/cable-upper-chest-crossovers.gif'
  },
  {
    id: 'chest_machine_chest_press',
    name: 'Supino na Máquina (Chest Press)',
    nameEn: 'Machine Chest Press',
    category: 'chest',
    equipment: 'machine',
    targetMuscle: 'Peitoral Maior',
    secondaryMuscles: ["Tríceps","Deltoide Anterior"],
    instructions: 'Ajuste o assento para que as manoplas fiquem na linha do peito. Empurre mantendo os cotovelos ligeiramente abaixo dos ombros.',
    tips: 'Ideal para séries de falha e drop sets com total segurança articular na trajetória guiada.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/lever-chest-press.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/lever-chest-press.gif'
  },
  {
    id: 'chest_pec_deck',
    name: 'Voador / Pec Deck',
    nameEn: 'Pec Deck Machine',
    category: 'chest',
    equipment: 'machine',
    targetMuscle: 'Peitoral Maior e Miolo do Peito',
    secondaryMuscles: ["Deltoide Anterior"],
    instructions: 'Sente com as costas apoiadas. Feche os braços contraindo o peito no centro por 1 segundo antes de abrir devagar.',
    tips: 'Ajuste a altura do banco para que os cotovelos fiquem na mesma linha do peitoral médio.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/lever-seated-fly.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/lever-seated-fly.gif'
  },
  {
    id: 'chest_push_up',
    name: 'Flexão de Braço (Push-Up)',
    nameEn: 'Push-Up',
    category: 'chest',
    equipment: 'bodyweight',
    targetMuscle: 'Peitoral, Tríceps e Core',
    secondaryMuscles: ["Tríceps Braquial","Core","Deltoides"],
    instructions: 'Corpo reto em prancha, mãos na largura dos ombros. Desça até o peito quase tocar o chão e empurre com força.',
    tips: 'Não deixe o quadril descer nem a coluna arquear; o corpo deve descer como uma prancha rígida.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/push-up.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/push-up.gif'
  },
  {
    id: 'back_lat_pulldown_wide',
    name: 'Puxada Frontal Aberta (Pulldown)',
    nameEn: 'Wide-Grip Lat Pulldown',
    category: 'back',
    equipment: 'cable',
    targetMuscle: 'Latíssimo do Dorso (Dorsal)',
    secondaryMuscles: ["Bíceps","Redondo Maior","Rombóides"],
    instructions: 'Segure a barra com pegada pronada aberta. Puxe em direção à parte superior do peito puxando com os cotovelos para baixo.',
    tips: 'Inicie o movimento puxando as escápulas para baixo antes de dobrar os cotovelos.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/lats/cable-bar-lateral-pulldown.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/lats/cable-bar-lateral-pulldown.gif'
  },
  {
    id: 'back_lat_pulldown_close_vbar',
    name: 'Puxada Triângulo / Pegada Fechada',
    nameEn: 'Close-Grip Lat Pulldown',
    category: 'back',
    equipment: 'cable',
    targetMuscle: 'Latíssimo do Dorso e Redondo Maior',
    secondaryMuscles: ["Bíceps Braquial","Braquial","Rombóides"],
    instructions: 'Use o puxador triângulo. Incline o tronco sutilmente para trás e puxe o triângulo até o esterno.',
    tips: 'Pegada neutra permite maior amplitude de alongamento dorsal no topo do movimento.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/lats/cable-lateral-pulldown-with-v-bar.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/lats/cable-lateral-pulldown-with-v-bar.gif'
  },
  {
    id: 'back_barbell_bent_over_row',
    name: 'Remada Curvada com Barra',
    nameEn: 'Bent-Over Barbell Row',
    category: 'back',
    equipment: 'barbell',
    targetMuscle: 'Dorsais, Trapézio Médio e Rombóides',
    secondaryMuscles: ["Bíceps","Trapézio","Eretores da Espinha"],
    instructions: 'Tronco inclinado a 45 graus, coluna neutra. Puxe a barra em direção ao umbigo espremendo as escápulas.',
    tips: 'Mantenha a lombar firme e travada em neutro; puxe a barra na direção do umbigo.',
    difficulty: 'intermediate',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/upper-back/barbell-bent-over-row.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/upper-back/barbell-bent-over-row.gif'
  },
  {
    id: 'back_seated_cable_row',
    name: 'Remada Baixa Sentada (Triângulo)',
    nameEn: 'Seated Cable Row',
    category: 'back',
    equipment: 'cable',
    targetMuscle: 'Espessura das Costas e Rombóides',
    secondaryMuscles: ["Bíceps","Trapézio Médio","Rombóides"],
    instructions: 'Sente-se com as pernas levemente flexionadas. Puxe o triângulo até o abdômen sem jogar o tronco excessivamente para trás.',
    tips: 'Mantenha o peito estufado e evite balançar excessivamente o tronco para trás ao puxar.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/upper-back/cable-seated-row.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/upper-back/cable-seated-row.gif'
  },
  {
    id: 'back_one_arm_dumbbell_row',
    name: 'Remada Unilateral com Halter (Serrote)',
    nameEn: 'One-Arm Dumbbell Row',
    category: 'back',
    equipment: 'dumbbell',
    targetMuscle: 'Latíssimo do Dorso',
    secondaryMuscles: ["Bíceps Braquial","Rombóides"],
    instructions: 'Apoie um joelho e a mão no banco. Com o outro braço, puxe o halter apontando o cotovelo em direção ao quadril.',
    tips: 'Puxe com o cotovelo guiando o movimento em direção ao quadril, não em direção ao ombro.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/upper-back/dumbbell-one-arm-bent-over-row.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/upper-back/dumbbell-one-arm-bent-over-row.gif'
  },
  {
    id: 'back_deadlift',
    name: 'Levantamento Terra (Deadlift)',
    nameEn: 'Barbell Deadlift',
    category: 'back',
    equipment: 'barbell',
    targetMuscle: 'Cadeia Posterior, Eretores e Trapézio',
    secondaryMuscles: ["Glúteos","Isquiotibiais","Trapézio","Core"],
    instructions: 'Barra sobre o meio do pé, quadril posicionado, peito estufado. Puxe estendendo joelhos e quadris simultaneamente.',
    tips: 'A barra deve subir rente às canelas e coxas; ative a dorsal como se quisesse quebrar a barra.',
    difficulty: 'advanced',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/barbell-deadlift.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/barbell-deadlift.gif'
  },
  {
    id: 'back_pull_up',
    name: 'Barra Fixa (Pull-Up)',
    nameEn: 'Pull-Up',
    category: 'back',
    equipment: 'bodyweight',
    targetMuscle: 'Latíssimo do Dorso e Bíceps',
    secondaryMuscles: ["Bíceps","Redondo Maior","Core"],
    instructions: 'Pegada pronada aberta. Puxe seu próprio corpo até que o queixo ultrapasse a linha da barra.',
    tips: 'Puxe até passar o queixo da barra e desça estendendo quase que completamente os braços.',
    difficulty: 'advanced',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/lats/pull-up.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/lats/pull-up.gif'
  },
  {
    id: 'back_straight_arm_pulldown',
    name: 'Pulldown com Braços Estendidos',
    nameEn: 'Straight-Arm Cable Pulldown',
    category: 'back',
    equipment: 'cable',
    targetMuscle: 'Latíssimo do Dorso (Isolamento)',
    secondaryMuscles: ["Tríceps (Cabeça Longa)","Redondo Maior"],
    instructions: 'Braços quase retos, tronco inclinado 30 graus. Puxe a barra ou corda em arco até encostar nas coxas.',
    tips: 'Mantenha os cotovelos fixos com leve flexão para isolar totalmente as grandes dorsais.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/lats/cable-straight-arm-pulldown.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/lats/cable-straight-arm-pulldown.gif'
  },
  {
    id: 'back_machine_row',
    name: 'Remada Articulada na Máquina',
    nameEn: 'Machine Low Row',
    category: 'back',
    equipment: 'machine',
    targetMuscle: 'Costas Geral e Trapézio',
    secondaryMuscles: ["Bíceps","Trapézio","Rombóides"],
    instructions: 'Ajuste o apoio do peito para total amplitude. Puxe as manoplas com foco em fechar as escápulas.',
    tips: 'Apoie o peito na almofada e concentre-se na adução total das escápulas ao final do puxão.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/upper-back/lever-seated-row.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/upper-back/lever-seated-row.gif'
  },
  {
    id: 'legs_barbell_squat',
    name: 'Agachamento Livre com Barra',
    nameEn: 'Barbell Back Squat',
    category: 'legs',
    equipment: 'barbell',
    targetMuscle: 'Quadríceps, Glúteos e Core',
    secondaryMuscles: ["Glúteo Máximo","Isquiotibiais","Core Lombar"],
    instructions: 'Barra apoiada sobre o trapézio. Desça o quadril abaixo da linha dos joelhos mantendo o peito ereto e empurre pelo calcanhar.',
    tips: 'Mantenha os joelhos alinhados com a ponta dos pés e empurre o chão através dos calcanhares.',
    difficulty: 'intermediate',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/barbell-full-squat.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/barbell-full-squat.gif'
  },
  {
    id: 'legs_front_squat',
    name: 'Agachamento Frontal',
    nameEn: 'Barbell Front Squat',
    category: 'legs',
    equipment: 'barbell',
    targetMuscle: 'Quadríceps e Core Frontal',
    secondaryMuscles: ["Core Reto","Glúteos"],
    instructions: 'Barra apoiada sobre os deltoides anteriores, cotovelos altos apontados para frente. Agache mantendo a coluna vertical.',
    tips: 'Mantenha os cotovelos altos apontados para frente para a barra não rolar dos ombros.',
    difficulty: 'advanced',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/barbell-front-squat.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/barbell-front-squat.gif'
  },
  {
    id: 'legs_leg_press_45',
    name: 'Leg Press 45°',
    nameEn: '45-Degree Leg Press',
    category: 'legs',
    equipment: 'machine',
    targetMuscle: 'Quadríceps e Glúteos',
    secondaryMuscles: ["Glúteos","Isquiotibiais"],
    instructions: 'Pés na largura dos ombros na plataforma. Destrave a máquina e desça até 90 graus sem arredondar a lombar.',
    tips: 'Nunca estenda totalmente (trave) os joelhos no topo; mantenha a lombar colada no encosto.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/sled-45-leg-press.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/sled-45-leg-press.gif'
  },
  {
    id: 'legs_hack_squat',
    name: 'Hack Squat',
    nameEn: 'Hack Squat Machine',
    category: 'legs',
    equipment: 'machine',
    targetMuscle: 'Quadríceps',
    secondaryMuscles: ["Glúteo Máximo"],
    instructions: 'Costas bem apoiadas no encosto. Desça com controle mantendo os pés firmes e empurre na subida.',
    tips: 'Excelente estabilização para descer fundo e enfatizar o vasto lateral e reto femoral.',
    difficulty: 'intermediate',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/sled-hack-squat.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/sled-hack-squat.gif'
  },
  {
    id: 'legs_leg_extension',
    name: 'Cadeira Extensora',
    nameEn: 'Leg Extension',
    category: 'legs',
    equipment: 'machine',
    targetMuscle: 'Quadríceps (Isolamento)',
    secondaryMuscles: ["Reto Femoral"],
    instructions: 'Ajuste a almofada sobre os tornozelos. Estenda as pernas totalmente segurando a contração no topo por 1 segundo.',
    tips: 'Segure 1 segundo no ponto de extensão máxima para estresse metabólico nos quadríceps.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/quads/lever-leg-extension.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/quads/lever-leg-extension.gif'
  },
  {
    id: 'legs_seated_leg_curl',
    name: 'Cadeira Flexora',
    nameEn: 'Seated Leg Curl',
    category: 'legs',
    equipment: 'machine',
    targetMuscle: 'Posteriores de Coxa (Isquiotibiais)',
    secondaryMuscles: ["Gastrocnêmio"],
    instructions: 'Apoio sobre as coxas travado. Flexione as pernas para baixo contraindo os posteriores de coxa com controle.',
    tips: 'Mantenha a almofada sobre as coxas bem firme para isolar a flexão dos isquiotibiais.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/hamstrings/lever-seated-leg-curl.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/hamstrings/lever-seated-leg-curl.gif'
  },
  {
    id: 'legs_lying_leg_curl',
    name: 'Mesa Flexora',
    nameEn: 'Lying Leg Curl',
    category: 'legs',
    equipment: 'machine',
    targetMuscle: 'Posteriores de Coxa',
    secondaryMuscles: ["Glúteos"],
    instructions: 'Deite de bruços no aparelho com o rolete atrás do tendão de Aquiles. Flexione as pernas trazendo os calcanhares em direção aos glúteos.',
    tips: 'Evite tirar o quadril do banco durante a flexão das pernas.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/hamstrings/lever-lying-leg-curl.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/hamstrings/lever-lying-leg-curl.gif'
  },
  {
    id: 'legs_romanian_deadlift',
    name: 'Stiff / Levantamento Romeno (RDL)',
    nameEn: 'Romanian Deadlift (RDL)',
    category: 'legs',
    equipment: 'barbell',
    targetMuscle: 'Posteriores de Coxa e Glúteos',
    secondaryMuscles: ["Glúteos","Eretores da Espinha"],
    instructions: 'Joelhos levemente destravados, empurre o quadril para trás enquanto desce a barra colada nas pernas sentindo o estiramento posterior.',
    tips: 'Pense em empurrar o bumbum para a parede de trás com joelhos quase imóveis.',
    difficulty: 'intermediate',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/barbell-romanian-deadlift.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/barbell-romanian-deadlift.gif'
  },
  {
    id: 'legs_bulgarian_split_squat',
    name: 'Agachamento Búlgaro',
    nameEn: 'Bulgarian Split Squat',
    category: 'legs',
    equipment: 'dumbbell',
    targetMuscle: 'Quadríceps e Glúteos Unilateral',
    secondaryMuscles: ["Glúteo Médio","Estabilizadores"],
    instructions: 'Apoie um pé atrás em um banco e o outro à frente. Desça o joelho de trás em direção ao solo mantendo o tronco firme.',
    tips: 'Mantenha o peso no calcanhar da perna da frente e desça o joelho de trás verticalmente.',
    difficulty: 'intermediate',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/quads/dumbbell-single-leg-split-squat.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/quads/dumbbell-single-leg-split-squat.gif'
  },
  {
    id: 'legs_walking_lunge',
    name: 'Passada / Avanço com Halteres',
    nameEn: 'Dumbbell Walking Lunge',
    category: 'legs',
    equipment: 'dumbbell',
    targetMuscle: 'Pernas Completas e Glúteos',
    secondaryMuscles: ["Isquiotibiais","Core"],
    instructions: 'Dê passos largos à frente flexionando ambos os joelhos a 90 graus de maneira alternada e fluida.',
    tips: 'Dê passos suficientemente longos para manter o joelho da frente a 90° ao tocar o solo.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/walking-lunge.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/walking-lunge.gif'
  },
  {
    id: 'legs_hip_thrust',
    name: 'Elevação Pélvica com Barra (Hip Thrust)',
    nameEn: 'Barbell Hip Thrust',
    category: 'legs',
    equipment: 'barbell',
    targetMuscle: 'Glúteo Máximo',
    secondaryMuscles: ["Isquiotibiais","Core"],
    instructions: 'Costas apoiadas no banco, barra acolchoada sobre o quadril. Empurre o quadril para cima até alinhar com o tronco e segure.',
    tips: 'No topo, contraia o glúteo com força e mantenha o queixo apontando para o peito.',
    difficulty: 'intermediate',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/barbell-glute-bridge-two-legs-on-bench-male.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/barbell-glute-bridge-two-legs-on-bench-male.gif'
  },
  {
    id: 'legs_hip_abduction_machine',
    name: 'Cadeira Abdutora',
    nameEn: 'Hip Abduction Machine',
    category: 'legs',
    equipment: 'machine',
    targetMuscle: 'Glúteo Médio e Mínimo',
    secondaryMuscles: ["Glúteo Mínimo","Tensor da Fáscia Lata"],
    instructions: 'Abra as pernas contra a resistência da almofada, segurando a contração máxima antes de retornar devagar.',
    tips: 'Excelente para estabilidade do quadril e preenchimento lateral dos glúteos.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abductors/lever-seated-hip-abduction.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abductors/lever-seated-hip-abduction.gif'
  },
  {
    id: 'legs_hip_adduction_machine',
    name: 'Cadeira Adutora',
    nameEn: 'Hip Adduction Machine',
    category: 'legs',
    equipment: 'machine',
    targetMuscle: 'Adutores da Coxa',
    secondaryMuscles: ["Grácil","Pectíneo"],
    instructions: 'Feche as pernas unindo as almofadas no centro, concentrando a força na parte interna da coxa.',
    tips: 'Controle a fase excêntrica de abertura para não sofrer estiramento excessivo na virilha.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/adductors/lever-seated-hip-adduction.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/adductors/lever-seated-hip-adduction.gif'
  },
  {
    id: 'shoulders_overhead_press_barbell',
    name: 'Desenvolvimento Militar com Barra',
    nameEn: 'Overhead Barbell Press',
    category: 'shoulders',
    equipment: 'barbell',
    targetMuscle: 'Deltoide Anterior e Lateral',
    secondaryMuscles: ["Tríceps","Trapézio Superior","Core"],
    instructions: 'Em pé ou sentado, segure a barra na altura do queixo. Empurre reto para cima até estender os braços acima da cabeça.',
    tips: 'Mantenha o abdômen e glúteos contraídos para proteger a lombar durante o desenvolvimento.',
    difficulty: 'intermediate',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/delts/barbell-seated-overhead-press.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/delts/barbell-seated-overhead-press.gif'
  },
  {
    id: 'shoulders_dumbbell_shoulder_press',
    name: 'Desenvolvimento com Halteres',
    nameEn: 'Seated Dumbbell Shoulder Press',
    category: 'shoulders',
    equipment: 'dumbbell',
    targetMuscle: 'Deltoides Anterior e Lateral',
    secondaryMuscles: ["Tríceps Braquial","Trapézio"],
    instructions: 'Sentado com apoio 90 graus, empurre os halteres para cima mantendo os cotovelos levemente à frente do plano coronal.',
    tips: 'Não bata os halteres no topo; mantenha os cotovelos levemente anteriorizados.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/delts/dumbbell-seated-shoulder-press.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/delts/dumbbell-seated-shoulder-press.gif'
  },
  {
    id: 'shoulders_lateral_raise_dumbbell',
    name: 'Elevação Lateral com Halteres',
    nameEn: 'Dumbbell Lateral Raise',
    category: 'shoulders',
    equipment: 'dumbbell',
    targetMuscle: 'Deltoide Lateral (Ombro Médio)',
    secondaryMuscles: ["Trapézio Superior"],
    instructions: 'Com os braços semiflexionados, eleve os halteres lateralmente até a linha dos ombros sem dar tranco com o corpo.',
    tips: 'Incline ligeiramente o tronco à frente e erga guiando com os cotovelos, sem balanço.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/delts/dumbbell-lateral-raise.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/delts/dumbbell-lateral-raise.gif'
  },
  {
    id: 'shoulders_lateral_raise_cable',
    name: 'Elevação Lateral na Polia',
    nameEn: 'Cable Lateral Raise',
    category: 'shoulders',
    equipment: 'cable',
    targetMuscle: 'Deltoide Lateral (Tensão Contínua)',
    secondaryMuscles: ["Manguito Rotador"],
    instructions: 'Passe o cabo por trás ou pela frente do corpo e eleve a manopla lateralmente sentindo tensão constante em todo o arco.',
    tips: 'A polia garante resistência contínua até o início do arco, maximizando hipertrofia lateral.',
    difficulty: 'intermediate',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/delts/cable-lateral-raise.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/delts/cable-lateral-raise.gif'
  },
  {
    id: 'shoulders_front_raise_dumbbell',
    name: 'Elevação Frontal com Halteres',
    nameEn: 'Dumbbell Front Raise',
    category: 'shoulders',
    equipment: 'dumbbell',
    targetMuscle: 'Deltoide Anterior',
    secondaryMuscles: ["Peitoral Superior"],
    instructions: 'Eleve os halteres à frente do corpo até a linha dos olhos, mantendo o abdômen contraído.',
    tips: 'Erga até a linha dos olhos com pegada pronada ou neutra de forma estritamente controlada.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/delts/dumbbell-front-raise.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/delts/dumbbell-front-raise.gif'
  },
  {
    id: 'shoulders_reverse_fly_machine',
    name: 'Crucifixo Inverso / Peck Deck Invertido',
    nameEn: 'Reverse Pec Deck Fly',
    category: 'shoulders',
    equipment: 'machine',
    targetMuscle: 'Deltoide Posterior',
    secondaryMuscles: ["Rombóides","Trapézio Médio"],
    instructions: 'Sente de frente para o aparelho. Abra os braços para trás contraindo a porção posterior dos ombros.',
    tips: 'Foque em abrir com a força da parte posterior do ombro sem dar impulso com o tronco.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/delts/lever-seated-reverse-fly.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/delts/lever-seated-reverse-fly.gif'
  },
  {
    id: 'shoulders_face_pull',
    name: 'Face Pull na Polia',
    nameEn: 'Cable Face Pull',
    category: 'shoulders',
    equipment: 'cable',
    targetMuscle: 'Deltoide Posterior, Manguito e Trapézio',
    secondaryMuscles: ["Manguito Rotador","Trapézio Médio e Superior"],
    instructions: 'Polia na altura do rosto com corda. Puxe separando as pontas em direção às orelhas e rodando os ombros externamente.',
    tips: 'Puxe a corda em direção aos olhos/orelhas fazendo rotação externa dos polegares para trás.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/delts/cable-standing-rear-delt-row-with-rope.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/delts/cable-standing-rear-delt-row-with-rope.gif'
  },
  {
    id: 'shoulders_dumbbell_shrug',
    name: 'Encolhimento com Halteres (Trapézio)',
    nameEn: 'Dumbbell Shrug',
    category: 'shoulders',
    equipment: 'dumbbell',
    targetMuscle: 'Trapézio Superior',
    secondaryMuscles: ["Levantador da Escápula","Antebraço"],
    instructions: 'Com halteres ao lado do corpo, eleve os ombros em direção às orelhas sem rodá-los. Segure no topo por 1 segundo.',
    tips: 'Suba em linha reta em direção às orelhas; nunca faça giros ou rotações circulares com os ombros.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/traps/dumbbell-shrug.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/traps/dumbbell-shrug.gif'
  },
  {
    id: 'biceps_barbell_curl',
    name: 'Rosca Direta com Barra',
    nameEn: 'Barbell Bicep Curl',
    category: 'biceps',
    equipment: 'barbell',
    targetMuscle: 'Bíceps Braquial',
    secondaryMuscles: ["Braquial","Antebraço"],
    instructions: 'Cotovelos colados ao tronco. Flexione os braços trazendo a barra ao peito sem balançar o corpo.',
    tips: 'Mantenha os cotovelos fixados ao lado do corpo e evite usar o impulso da coluna.',
    difficulty: 'intermediate',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/barbell-curl.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/barbell-curl.gif'
  },
  {
    id: 'biceps_ez_bar_curl',
    name: 'Rosca Direta com Barra W',
    nameEn: 'EZ-Bar Curl',
    category: 'biceps',
    equipment: 'barbell',
    targetMuscle: 'Bíceps Braquial e Braquiorradial',
    secondaryMuscles: ["Braquiorradial","Braquial"],
    instructions: 'Pegada semi-supinada na curvatura da barra W para conforto das articulações do punho.',
    tips: 'A barra W reduz o torque e alivia a pressão na articulação dos punhos.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/ez-barbell-curl.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/ez-barbell-curl.gif'
  },
  {
    id: 'biceps_dumbbell_curl_alternating',
    name: 'Rosca Alternada com Halteres',
    nameEn: 'Alternating Dumbbell Curl',
    category: 'biceps',
    equipment: 'dumbbell',
    targetMuscle: 'Bíceps Braquial com Supinação',
    secondaryMuscles: ["Braquial","Antebraço"],
    instructions: 'Suba um halter por vez, girando o punho para fora (supinação) no topo do movimento.',
    tips: 'Inicie com pegada neutra e supine o punho (palma virada para cima) a partir do meio da subida.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/dumbbell-biceps-curl.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/dumbbell-biceps-curl.gif'
  },
  {
    id: 'biceps_hammer_curl',
    name: 'Rosca Martelo com Halteres',
    nameEn: 'Hammer Curl',
    category: 'biceps',
    equipment: 'dumbbell',
    targetMuscle: 'Braquial e Braquiorradial (Antebraço)',
    secondaryMuscles: ["Braquiorradial","Braquial"],
    instructions: 'Pegada neutra (palmas viradas uma para a outra). Flexione os antebraços mantendo a pegada firme.',
    tips: 'Pegada neutra o tempo todo. Excelente para aumentar a densidade e largura do braço.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/dumbbell-hammer-curl.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/dumbbell-hammer-curl.gif'
  },
  {
    id: 'biceps_incline_dumbbell_curl',
    name: 'Rosca Inclinada no Banco 45°',
    nameEn: 'Incline Dumbbell Curl',
    category: 'biceps',
    equipment: 'dumbbell',
    targetMuscle: 'Cabeça Longa do Bíceps (Pico)',
    secondaryMuscles: ["Braquial"],
    instructions: 'Deite-se no banco a 45 graus com os braços pendurados para trás. Flexione aproveitando o grande alongamento inicial.',
    tips: 'Banco a 45°. O estiramento inicial da cabeça longa proporciona estímulo hipertrófico diferenciado.',
    difficulty: 'intermediate',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/dumbbell-incline-biceps-curl.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/dumbbell-incline-biceps-curl.gif'
  },
  {
    id: 'biceps_scott_curl',
    name: 'Rosca Scott (Banco Scott)',
    nameEn: 'Preacher Curl',
    category: 'biceps',
    equipment: 'barbell',
    targetMuscle: 'Bíceps (Isolamento Cabeça Curta)',
    secondaryMuscles: ["Braquial"],
    instructions: 'Braços repousados na almofada inclinada. Flexione até o topo sem desencostar os tríceps do apoio.',
    tips: 'Apoie completamente os tríceps na almofada para impossibilitar o uso de impulso corporal.',
    difficulty: 'intermediate',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/barbell-preacher-curl.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/barbell-preacher-curl.gif'
  },
  {
    id: 'biceps_concentration_curl',
    name: 'Rosca Concentrada',
    nameEn: 'Concentration Curl',
    category: 'biceps',
    equipment: 'dumbbell',
    targetMuscle: 'Pico do Bíceps',
    secondaryMuscles: ["Braquiorradial"],
    instructions: 'Sentado, apoie o cotovelo na face interna da coxa e flexione o halter de forma isolada.',
    tips: 'Apoie o cotovelo na parte interna da coxa e sinta o pico de contração do bíceps.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/dumbbell-concentration-curl.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/dumbbell-concentration-curl.gif'
  },
  {
    id: 'biceps_cable_curl',
    name: 'Rosca na Polia Baixa',
    nameEn: 'Standing Cable Curl',
    category: 'biceps',
    equipment: 'cable',
    targetMuscle: 'Bíceps com Tensão Contínua',
    secondaryMuscles: ["Braquial"],
    instructions: 'Puxe a barra reta ou barra W conectada à polia baixa mantendo tensão constante durante toda a subida e descida.',
    tips: 'Tensão constante em todas as fases da repetição, ideal para séries até a exaustão.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/cable-curl.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/cable-curl.gif'
  },
  {
    id: 'triceps_rope_pushdown',
    name: 'Tríceps Corda na Polia',
    nameEn: 'Cable Rope Triceps Pushdown',
    category: 'triceps',
    equipment: 'cable',
    targetMuscle: 'Tríceps (Cabeça Lateral e Medial)',
    secondaryMuscles: ["Ancôneo"],
    instructions: 'Empurre a corda para baixo abrindo as pontas no final do movimento para contração máxima.',
    tips: 'Abra as pontas da corda na base do movimento para contração máxima da cabeça lateral.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/triceps/cable-pushdown-with-rope-attachment.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/triceps/cable-pushdown-with-rope-attachment.gif'
  },
  {
    id: 'triceps_straight_bar_pushdown',
    name: 'Tríceps Pulley com Barra Reta/V',
    nameEn: 'Cable Bar Triceps Pushdown',
    category: 'triceps',
    equipment: 'cable',
    targetMuscle: 'Tríceps Braquial',
    secondaryMuscles: ["Ancôneo"],
    instructions: 'Cotovelos junto às costelas. Empurre a barra até estender completamente os braços.',
    tips: 'Mantenha os cotovelos colados ao tronco e empurre estendendo totalmente os braços.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/triceps/cable-triceps-pushdown-v-bar.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/triceps/cable-triceps-pushdown-v-bar.gif'
  },
  {
    id: 'triceps_skull_crusher',
    name: 'Tríceps Testa com Barra W',
    nameEn: 'Lying Triceps Extension (Skull Crusher)',
    category: 'triceps',
    equipment: 'barbell',
    targetMuscle: 'Cabeça Longa do Tríceps',
    secondaryMuscles: ["Cabeça Medial e Lateral"],
    instructions: 'Deitado no banco reto, flexione os cotovelos descendo a barra até a testa e estenda novamente.',
    tips: 'Incline os braços ligeiramente para trás da cabeça para manter tensão constante no topo.',
    difficulty: 'intermediate',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/triceps/barbell-lying-triceps-extension-skull-crusher.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/triceps/barbell-lying-triceps-extension-skull-crusher.gif'
  },
  {
    id: 'triceps_overhead_cable_extension',
    name: 'Tríceps Francês na Polia (Corda)',
    nameEn: 'Overhead Cable Triceps Extension',
    category: 'triceps',
    equipment: 'cable',
    targetMuscle: 'Cabeça Longa do Tríceps (Alongamento)',
    secondaryMuscles: ["Ancôneo"],
    instructions: 'De costas para a polia, incline o corpo à frente e estenda a corda para a diagonal superior mantendo cotovelos firmes.',
    tips: 'Enfatiza a cabeça longa do tríceps em posição alongada; mantenha cotovelos fechados.',
    difficulty: 'intermediate',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/triceps/cable-overhead-triceps-extension-rope-attachment.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/triceps/cable-overhead-triceps-extension-rope-attachment.gif'
  },
  {
    id: 'triceps_overhead_dumbbell_extension',
    name: 'Tríceps Francês com Halter',
    nameEn: 'Overhead Dumbbell Triceps Extension',
    category: 'triceps',
    equipment: 'dumbbell',
    targetMuscle: 'Cabeça Longa do Tríceps',
    secondaryMuscles: ["Cabeça Lateral"],
    instructions: 'Segure um halter com ambas as mãos atrás da cabeça e estenda verticalmente.',
    tips: 'Segure a anilha superior do halter com as duas mãos e desça profundamente atrás da cabeça.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/triceps/dumbbell-seated-triceps-extension.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/triceps/dumbbell-seated-triceps-extension.gif'
  },
  {
    id: 'triceps_dips_parallel_bars',
    name: 'Paralelas para Tríceps (Dips)',
    nameEn: 'Triceps Dips',
    category: 'triceps',
    equipment: 'bodyweight',
    targetMuscle: 'Tríceps e Peitoral Inferior',
    secondaryMuscles: ["Peitoral Inferior","Deltoide Anterior"],
    instructions: 'Nas barras paralelas com tronco mais ereto, desça até 90 graus nos cotovelos e empurre com os braços.',
    tips: 'Mantenha o tronco mais ereto e os cotovelos apontados para trás para focar no tríceps.',
    difficulty: 'advanced',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/triceps/triceps-dip.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/triceps/triceps-dip.gif'
  },
  {
    id: 'triceps_bench_dips',
    name: 'Tríceps no Banco (Mergulho)',
    nameEn: 'Bench Dips',
    category: 'triceps',
    equipment: 'bodyweight',
    targetMuscle: 'Tríceps Braquial',
    secondaryMuscles: ["Deltoide Anterior"],
    instructions: 'Mãos apoiadas na borda do banco e pés à frente. Desça o quadril próximo ao banco flexionando os cotovelos.',
    tips: 'Mantenha as costas rente ao banco durante a descida para poupar a articulação dos ombros.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/triceps/weighted-three-bench-dips.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/triceps/weighted-three-bench-dips.gif'
  },
  {
    id: 'triceps_kickback_cable',
    name: 'Tríceps Coice na Polia ou Halter',
    nameEn: 'Triceps Kickback',
    category: 'triceps',
    equipment: 'cable',
    targetMuscle: 'Tríceps (Contração de Pico)',
    secondaryMuscles: ["Ancôneo"],
    instructions: 'Tronco paralelo ao chão, cotovelo alto fixo. Estenda o antebraço para trás e esprema o tríceps.',
    tips: 'Mantenha o braço estático paralelo ao chão e movimente apenas o antebraço contraindo no final.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/triceps/cable-kickback.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/triceps/cable-kickback.gif'
  },
  {
    id: 'calves_standing_raise_machine',
    name: 'Panturrilha em Pé na Máquina',
    nameEn: 'Standing Calf Raise',
    category: 'calves',
    equipment: 'machine',
    targetMuscle: 'Gastrocnêmio',
    secondaryMuscles: ["Sóleo"],
    instructions: 'Com a ponta dos pés no degrau, desça para o alongamento total e suba na ponta dos pés segurando 1s no topo.',
    tips: 'Faça uma pausa de 1 segundo no alongamento inferior e outra pausa de 1 segundo na contração máxima.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/calves/lever-standing-calf-raise.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/calves/lever-standing-calf-raise.gif'
  },
  {
    id: 'calves_seated_raise_machine',
    name: 'Gêmeos / Panturrilha Sentado',
    nameEn: 'Seated Calf Raise',
    category: 'calves',
    equipment: 'machine',
    targetMuscle: 'Sóleo',
    secondaryMuscles: ["Tibial Posterior"],
    instructions: 'Com as pernas dobradas a 90 graus sob as almofadas, flexione os tornozelos com amplitude completa.',
    tips: 'Com os joelhos flexionados a 90°, o músculo sóleo assume quase todo o trabalho mecânico.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/calves/lever-seated-calf-raise.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/calves/lever-seated-calf-raise.gif'
  },
  {
    id: 'calves_leg_press_raise',
    name: 'Panturrilha no Leg Press',
    nameEn: 'Leg Press Calf Press',
    category: 'calves',
    equipment: 'machine',
    targetMuscle: 'Gastrocnêmio e Sóleo',
    secondaryMuscles: ["Sóleo"],
    instructions: 'Apoie a ponta dos pés na borda inferior da plataforma do Leg Press e empurre estendendo os tornozelos.',
    tips: 'Trave os joelhos com leve flexão de segurança e trabalhe exclusivamente a flexão plantar dos tornozelos.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/calves/sled-45-calf-press.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/calves/sled-45-calf-press.gif'
  },
  {
    id: 'abs_crunch_floor',
    name: 'Abdominal Tradicional (Crunch)',
    nameEn: 'Floor Crunch',
    category: 'abs',
    equipment: 'bodyweight',
    targetMuscle: 'Reto Abdominal',
    secondaryMuscles: ["Oblíquos"],
    instructions: 'Deitado no colchonete, flexione a coluna enrolando o abdômen sem puxar o pescoço.',
    tips: 'Foque em aproximar a caixa torácica da pelve soltando o ar no final da contração.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/crunch-floor.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/crunch-floor.gif'
  },
  {
    id: 'abs_hanging_leg_raise',
    name: 'Elevação de Pernas na Barra Fixa',
    nameEn: 'Hanging Leg Raise',
    category: 'abs',
    equipment: 'bodyweight',
    targetMuscle: 'Reto Abdominal Inferior e Flexores',
    secondaryMuscles: ["Flexores do Quadril","Antebraço"],
    instructions: 'Pendurado na barra fixa, eleve os joelhos ou pernas retas até a altura do quadril enrolando a pelve.',
    tips: 'Enrole a bacia para frente ao subir os joelhos ou pernas em vez de só levantar as coxas.',
    difficulty: 'intermediate',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/hanging-leg-raise.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/hanging-leg-raise.gif'
  },
  {
    id: 'abs_plank',
    name: 'Prancha Isométrica',
    nameEn: 'Plank',
    category: 'abs',
    equipment: 'bodyweight',
    targetMuscle: 'Core Geral, Transverso e Lombar',
    secondaryMuscles: ["Transverso Abdominal","Glúteos","Lombar"],
    instructions: 'Apoie antebraços e pontas dos pés no chão. Mantenha o corpo reto e o abdômen rígido pelo tempo determinado.',
    tips: 'Ative glúteos e abdômen simultaneamente sem permitir que a bacia caia ou suba demais.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/weighted-front-plank.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/weighted-front-plank.gif'
  },
  {
    id: 'abs_cable_crunch',
    name: 'Abdominal na Polia Alta (Cable Crunch)',
    nameEn: 'Kneeling Cable Crunch',
    category: 'abs',
    equipment: 'cable',
    targetMuscle: 'Reto Abdominal com Carga',
    secondaryMuscles: ["Oblíquos"],
    instructions: 'De joelhos segurando a corda atrás da cabeça, enrole a coluna levando os cotovelos em direção aos joelhos.',
    tips: 'Mantenha a distância entre quadril e calcanhares fixa; flexione apenas a coluna lombar e torácica.',
    difficulty: 'intermediate',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/cable-kneeling-crunch.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/cable-kneeling-crunch.gif'
  },
  {
    id: 'abs_wheel_rollout',
    name: 'Roda Abdominal (Ab Wheel)',
    nameEn: 'Ab Wheel Rollout',
    category: 'abs',
    equipment: 'other',
    targetMuscle: 'Core Completo e Anti-extensão',
    secondaryMuscles: ["Dorsais","Tríceps","Lombar"],
    instructions: 'De joelhos, empurre a roda para frente mantendo o abdômen firme sem deixar a lombar arquear, e retorne.',
    tips: 'Excelente trabalho anti-extensão; vá apenas até onde conseguir manter a coluna em neutro.',
    difficulty: 'advanced',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/wheel-rollerout.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/wheel-rollerout.gif'
  },
  {
    id: 'abs_russian_twist',
    name: 'Russian Twist',
    nameEn: 'Russian Twist',
    category: 'abs',
    equipment: 'dumbbell',
    targetMuscle: 'Oblíquos e Core Rotacional',
    secondaryMuscles: ["Reto Abdominal","Flexores do Quadril"],
    instructions: 'Sentado com os pés elevados, rotacione o tronco de um lado para o outro controladamente segurando um halter ou anilha.',
    tips: 'Rotacione os ombros e a caixa torácica de um lado a outro, não apenas os braços.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/russian-twist.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/russian-twist.gif'
  },
  {
    id: 'cardio_treadmill_running',
    name: 'Corrida na Esteira',
    nameEn: 'Treadmill Running',
    category: 'cardio',
    equipment: 'machine',
    targetMuscle: 'Sistema Cardiovascular e Membros Inferiores',
    secondaryMuscles: ["Quadríceps","Glúteos","Panturrilhas"],
    instructions: 'Corrida com ritmo constante ou intervalado na esteira para queima calórica e condicionamento.',
    tips: 'Mantenha a postura ereta e a passada cadenciada com aterrissagem sobre o médio pé.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/cardio/run.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/cardio/run.gif'
  },
  {
    id: 'cardio_incline_treadmill_walk',
    name: 'Caminhada Inclinada na Esteira',
    nameEn: 'Incline Treadmill Walk',
    category: 'cardio',
    equipment: 'machine',
    targetMuscle: 'Glúteos, Panturrilhas e Cardiovascular',
    secondaryMuscles: ["Glúteos","Panturrilhas"],
    instructions: 'Velocidade moderada (4.5 a 6 km/h) com inclinação entre 8% e 15% para queima de gordura de baixo impacto.',
    tips: 'Não segure nos apoios da esteira para preservar o recrutamento muscular e gasto calórico real.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/cardio/walking-on-incline-treadmill.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/cardio/walking-on-incline-treadmill.gif'
  },
  {
    id: 'cardio_stationary_bike',
    name: 'Bicicleta Ergométrica',
    nameEn: 'Stationary Cycling',
    category: 'cardio',
    equipment: 'machine',
    targetMuscle: 'Cardiovascular e Quadríceps',
    secondaryMuscles: ["Quadríceps","Isquiotibiais"],
    instructions: 'Pedal moderado a intenso mantendo cadência entre 70 e 90 RPM com resistência ajustada.',
    tips: 'Ajuste a altura do banco para que o joelho mantenha uma leve flexão no ponto mais baixo do pedal.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/cardio/stationary-bike-walk.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/cardio/stationary-bike-walk.gif'
  },
  {
    id: 'cardio_elliptical',
    name: 'Elíptico',
    nameEn: 'Elliptical Trainer',
    category: 'cardio',
    equipment: 'machine',
    targetMuscle: 'Cardiovascular de Baixo Impacto',
    secondaryMuscles: ["Braços","Pernas Inteiras"],
    instructions: 'Movimento contínuo sincronizado de braços e pernas suave para as articulações.',
    tips: 'Ideal para treinos aeróbicos com impacto mínimo nas articulações dos joelhos e tornozelos.',
    difficulty: 'beginner',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/cardio/walk-elliptical-cross-trainer.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/cardio/walk-elliptical-cross-trainer.gif'
  },
  {
    id: 'cardio_stairmaster',
    name: 'Simulador de Escada',
    nameEn: 'StairMaster / StepMill',
    category: 'cardio',
    equipment: 'machine',
    targetMuscle: 'Glúteos, Pernas e Resistência Cardíaca',
    secondaryMuscles: ["Glúteo Máximo","Quadríceps","Panturrilhas"],
    instructions: 'Suba os degraus sem apoiar todo o peso do corpo nos corrimãos, mantendo postura ereta.',
    tips: 'Suba apoiando a planta inteira do pé em cada degrau para ativação ótima de glúteos.',
    difficulty: 'intermediate',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/cardio/walking-on-stepmill.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/cardio/walking-on-stepmill.gif'
  },
  {
    id: 'cardio_jump_rope',
    name: 'Pular Corda',
    nameEn: 'Jump Rope',
    category: 'cardio',
    equipment: 'other',
    targetMuscle: 'Panturrilhas, Coordenação e Cardio',
    secondaryMuscles: ["Panturrilhas","Ombros","Coordenação"],
    instructions: 'Saltos curtos com a ponta dos pés impulsionados pelos punhos de forma ritmada.',
    tips: 'Dê pequenos saltos de apenas 2 a 3 cm do chão rodando a corda apenas pelos punhos.',
    difficulty: 'intermediate',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/cardio/jump-rope.gif',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/cardio/jump-rope.gif'
  }
];

export { EXERCISE_GIF_MAP };

// Cache dinâmico em memória para mesclar catálogo oficial com Supabase e exercícios customizados
let dynamicCatalog: Exercise[] | null = null;

export function getExerciseGifUrl(exerciseId: string): string {
  if (dynamicCatalog) {
    const found = dynamicCatalog.find((e) => e.id === exerciseId);
    if (found?.gifUrl) return found.gifUrl;
  }
  return EXERCISE_GIF_MAP[exerciseId] || '';
}

function enrichExercise(e: Exercise): Exercise {
  const gifUrl = e.gifUrl || EXERCISE_GIF_MAP[e.id] || '';
  return {
    ...e,
    gifUrl,
    thumbnailUrl: e.thumbnailUrl || gifUrl
  };
}

/**
 * Sincroniza o catálogo local com a tabela public.exercises do Supabase
 */
export async function syncExercisesFromSupabase(): Promise<Exercise[]> {
  try {
    const remoteExercises = await loadExercisesFromSupabase();
    if (remoteExercises && remoteExercises.length > 0) {
      // Cria mapa com fallback dos locais + sobrescrita remota
      const mergedMap = new Map<string, Exercise>();
      EXERCISE_DATABASE.forEach((ex) => mergedMap.set(ex.id, enrichExercise(ex)));
      remoteExercises.forEach((ex) => mergedMap.set(ex.id, enrichExercise(ex)));
      dynamicCatalog = Array.from(mergedMap.values());
      return dynamicCatalog;
    }
  } catch (err) {
    console.warn('Falha ao sincronizar catálogo do Supabase, usando catálogo local:', err);
  }
  dynamicCatalog = EXERCISE_DATABASE.map(enrichExercise);
  return dynamicCatalog;
}

export function getAllExercises(): Exercise[] {
  if (dynamicCatalog && dynamicCatalog.length > 0) {
    return dynamicCatalog;
  }
  return EXERCISE_DATABASE.map(enrichExercise);
}

export function getExerciseById(id: string): Exercise | undefined {
  const catalog = dynamicCatalog && dynamicCatalog.length > 0 ? dynamicCatalog : EXERCISE_DATABASE;
  const found = catalog.find((e) => e.id === id);
  return found ? enrichExercise(found) : undefined;
}

export function getExercisesByCategory(category: MuscleCategory): Exercise[] {
  const catalog = dynamicCatalog && dynamicCatalog.length > 0 ? dynamicCatalog : EXERCISE_DATABASE;
  return catalog.filter((e) => e.category === category).map(enrichExercise);
}

export function searchExercises(query: string, category?: MuscleCategory): Exercise[] {
  const cleanQuery = query.toLowerCase().trim();
  const catalog = dynamicCatalog && dynamicCatalog.length > 0 ? dynamicCatalog : EXERCISE_DATABASE;
  return catalog.filter((e) => {
    const matchesCat = !category || e.category === category;
    if (!matchesCat) return false;
    if (!cleanQuery) return true;
    return (
      e.name.toLowerCase().includes(cleanQuery) ||
      (e.nameEn && e.nameEn.toLowerCase().includes(cleanQuery)) ||
      e.targetMuscle.toLowerCase().includes(cleanQuery)
    );
  }).map(enrichExercise);
}

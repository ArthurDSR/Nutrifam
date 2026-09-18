import { Exercise, MuscleCategory } from '../types/workout';
import { EXERCISE_GIF_MAP } from './exerciseGifMap';

export const EXERCISE_DATABASE: Exercise[] = [
  // --- PEITO (CHEST) ---
  {
    id: 'chest_bench_press_barbell',
    name: 'Supino Reto com Barra',
    nameEn: 'Barbell Bench Press',
    category: 'chest',
    equipment: 'barbell',
    targetMuscle: 'Peitoral Maior (Geral)',
    instructions: 'Deite-se no banco reto com os pés firmes no chão. Segure a barra um pouco mais largo que os ombros. Desça a barra de forma controlada até tocar suavemente o meio do peito e empurre para cima.'
  },
  {
    id: 'chest_incline_bench_press_barbell',
    name: 'Supino Inclinado com Barra',
    nameEn: 'Incline Barbell Bench Press',
    category: 'chest',
    equipment: 'barbell',
    targetMuscle: 'Peitoral Superior (Clavicular)',
    instructions: 'No banco a 30-45 graus, abaixe a barra até a parte superior do peito com controle, mantendo escápulas retraídas.'
  },
  {
    id: 'chest_bench_press_dumbbell',
    name: 'Supino Reto com Halteres',
    nameEn: 'Dumbbell Bench Press',
    category: 'chest',
    equipment: 'dumbbell',
    targetMuscle: 'Peitoral Maior',
    instructions: 'Deite-se com um halter em cada mão. Desça os halteres abrindo o peito até sentir bom alongamento e empurre aproximando-os no topo.'
  },
  {
    id: 'chest_incline_bench_press_dumbbell',
    name: 'Supino Inclinado com Halteres',
    nameEn: 'Incline Dumbbell Bench Press',
    category: 'chest',
    equipment: 'dumbbell',
    targetMuscle: 'Peitoral Superior',
    instructions: 'Banco a 30-45 graus. Desça os halteres lateralmente com amplitude controlada e empurre convergindo sem bater os pesos.'
  },
  {
    id: 'chest_decline_press_dumbbell',
    name: 'Supino Declinado com Halteres',
    nameEn: 'Decline Dumbbell Press',
    category: 'chest',
    equipment: 'dumbbell',
    targetMuscle: 'Peitoral Inferior',
    instructions: 'Em banco declinado, posicione as pernas fixas. Empurre os halteres verticalmente focando na contração da porção inferior do peito.'
  },
  {
    id: 'chest_dumbbell_fly',
    name: 'Crucifixo Reto com Halteres',
    nameEn: 'Dumbbell Fly',
    category: 'chest',
    equipment: 'dumbbell',
    targetMuscle: 'Peitoral Maior (Foco em Alongamento)',
    instructions: 'Deitado de costas, abra os braços mantendo leve flexão nos cotovelos. Alongue o peitoral e retorne abraçando o ar.'
  },
  {
    id: 'chest_incline_dumbbell_fly',
    name: 'Crucifixo Inclinado com Halteres',
    nameEn: 'Incline Dumbbell Fly',
    category: 'chest',
    equipment: 'dumbbell',
    targetMuscle: 'Peitoral Superior',
    instructions: 'Em banco a 30-45 graus, abra os braços em arco suave sentindo o alongamento da porção clavicular.'
  },
  {
    id: 'chest_cable_crossover_high',
    name: 'Crossover Polia Alta',
    nameEn: 'High Cable Crossover',
    category: 'chest',
    equipment: 'cable',
    targetMuscle: 'Peitoral Inferior e Esterno',
    instructions: 'Com os cabos na altura máxima, dê um passo à frente e puxe os cabos para baixo e para frente cruzando as mãos levemente.'
  },
  {
    id: 'chest_cable_crossover_low',
    name: 'Crossover Polia Baixa',
    nameEn: 'Low Cable Crossover',
    category: 'chest',
    equipment: 'cable',
    targetMuscle: 'Peitoral Superior',
    instructions: 'Com os cabos no ponto mais baixo, puxe para cima e para o centro até a linha do queixo.'
  },
  {
    id: 'chest_machine_chest_press',
    name: 'Supino na Máquina (Chest Press)',
    nameEn: 'Machine Chest Press',
    category: 'chest',
    equipment: 'machine',
    targetMuscle: 'Peitoral Maior',
    instructions: 'Ajuste o assento para que as manoplas fiquem na linha do peito. Empurre mantendo os cotovelos ligeiramente abaixo dos ombros.'
  },
  {
    id: 'chest_pec_deck',
    name: 'Voador / Pec Deck',
    nameEn: 'Pec Deck Machine',
    category: 'chest',
    equipment: 'machine',
    targetMuscle: 'Peitoral Maior e Miolo do Peito',
    instructions: 'Sente com as costas apoiadas. Feche os braços contraindo o peito no centro por 1 segundo antes de abrir devagar.'
  },
  {
    id: 'chest_push_up',
    name: 'Flexão de Braço (Push-Up)',
    nameEn: 'Push-Up',
    category: 'chest',
    equipment: 'bodyweight',
    targetMuscle: 'Peitoral, Tríceps e Core',
    instructions: 'Corpo reto em prancha, mãos na largura dos ombros. Desça até o peito quase tocar o chão e empurre com força.'
  },

  // --- COSTAS (BACK) ---
  {
    id: 'back_lat_pulldown_wide',
    name: 'Puxada Frontal Aberta (Pulldown)',
    nameEn: 'Wide-Grip Lat Pulldown',
    category: 'back',
    equipment: 'cable',
    targetMuscle: 'Latíssimo do Dorso (Dorsal)',
    instructions: 'Segure a barra com pegada pronada aberta. Puxe em direção à parte superior do peito puxando com os cotovelos para baixo.'
  },
  {
    id: 'back_lat_pulldown_close_vbar',
    name: 'Puxada Triângulo / Pegada Fechada',
    nameEn: 'Close-Grip Lat Pulldown',
    category: 'back',
    equipment: 'cable',
    targetMuscle: 'Latíssimo do Dorso e Redondo Maior',
    instructions: 'Use o puxador triângulo. Incline o tronco sutilmente para trás e puxe o triângulo até o esterno.'
  },
  {
    id: 'back_barbell_bent_over_row',
    name: 'Remada Curvada com Barra',
    nameEn: 'Bent-Over Barbell Row',
    category: 'back',
    equipment: 'barbell',
    targetMuscle: 'Dorsais, Trapézio Médio e Rombóides',
    instructions: 'Tronco inclinado a 45 graus, coluna neutra. Puxe a barra em direção ao umbigo espremendo as escápulas.'
  },
  {
    id: 'back_seated_cable_row',
    name: 'Remada Baixa Sentada (Triângulo)',
    nameEn: 'Seated Cable Row',
    category: 'back',
    equipment: 'cable',
    targetMuscle: 'Espessura das Costas e Rombóides',
    instructions: 'Sente-se com as pernas levemente flexionadas. Puxe o triângulo até o abdômen sem jogar o tronco excessivamente para trás.'
  },
  {
    id: 'back_one_arm_dumbbell_row',
    name: 'Remada Unilateral com Halter (Serrote)',
    nameEn: 'One-Arm Dumbbell Row',
    category: 'back',
    equipment: 'dumbbell',
    targetMuscle: 'Latíssimo do Dorso',
    instructions: 'Apoie um joelho e a mão no banco. Com o outro braço, puxe o halter apontando o cotovelo em direção ao quadril.'
  },
  {
    id: 'back_deadlift',
    name: 'Levantamento Terra (Deadlift)',
    nameEn: 'Barbell Deadlift',
    category: 'back',
    equipment: 'barbell',
    targetMuscle: 'Cadeia Posterior, Eretores e Trapézio',
    instructions: 'Barra sobre o meio do pé, quadril posicionado, peito estufado. Puxe estendendo joelhos e quadris simultaneamente.'
  },
  {
    id: 'back_pull_up',
    name: 'Barra Fixa (Pull-Up)',
    nameEn: 'Pull-Up',
    category: 'back',
    equipment: 'bodyweight',
    targetMuscle: 'Latíssimo do Dorso e Bíceps',
    instructions: 'Pegada pronada aberta. Puxe seu próprio corpo até que o queixo ultrapasse a linha da barra.'
  },
  {
    id: 'back_straight_arm_pulldown',
    name: 'Pulldown com Braços Estendidos',
    nameEn: 'Straight-Arm Cable Pulldown',
    category: 'back',
    equipment: 'cable',
    targetMuscle: 'Latíssimo do Dorso (Isolamento)',
    instructions: 'Braços quase retos, tronco inclinado 30 graus. Puxe a barra ou corda em arco até encostar nas coxas.'
  },
  {
    id: 'back_machine_row',
    name: 'Remada Articulada na Máquina',
    nameEn: 'Machine Low Row',
    category: 'back',
    equipment: 'machine',
    targetMuscle: 'Costas Geral e Trapézio',
    instructions: 'Ajuste o apoio do peito para total amplitude. Puxe as manoplas com foco em fechar as escápulas.'
  },

  // --- PERNAS (LEGS) ---
  {
    id: 'legs_barbell_squat',
    name: 'Agachamento Livre com Barra',
    nameEn: 'Barbell Back Squat',
    category: 'legs',
    equipment: 'barbell',
    targetMuscle: 'Quadríceps, Glúteos e Core',
    instructions: 'Barra apoiada sobre o trapézio. Desça o quadril abaixo da linha dos joelhos mantendo o peito ereto e empurre pelo calcanhar.'
  },
  {
    id: 'legs_front_squat',
    name: 'Agachamento Frontal',
    nameEn: 'Barbell Front Squat',
    category: 'legs',
    equipment: 'barbell',
    targetMuscle: 'Quadríceps e Core Frontal',
    instructions: 'Barra apoiada sobre os deltoides anteriores, cotovelos altos apontados para frente. Agache mantendo a coluna vertical.'
  },
  {
    id: 'legs_leg_press_45',
    name: 'Leg Press 45°',
    nameEn: '45-Degree Leg Press',
    category: 'legs',
    equipment: 'machine',
    targetMuscle: 'Quadríceps e Glúteos',
    instructions: 'Pés na largura dos ombros na plataforma. Destrave a máquina e desça até 90 graus sem arredondar a lombar.'
  },
  {
    id: 'legs_hack_squat',
    name: 'Hack Squat',
    nameEn: 'Hack Squat Machine',
    category: 'legs',
    equipment: 'machine',
    targetMuscle: 'Quadríceps',
    instructions: 'Costas bem apoiadas no encosto. Desça com controle mantendo os pés firmes e empurre na subida.'
  },
  {
    id: 'legs_leg_extension',
    name: 'Cadeira Extensora',
    nameEn: 'Leg Extension',
    category: 'legs',
    equipment: 'machine',
    targetMuscle: 'Quadríceps (Isolamento)',
    instructions: 'Ajuste a almofada sobre os tornozelos. Estenda as pernas totalmente segurando a contração no topo por 1 segundo.'
  },
  {
    id: 'legs_seated_leg_curl',
    name: 'Cadeira Flexora',
    nameEn: 'Seated Leg Curl',
    category: 'legs',
    equipment: 'machine',
    targetMuscle: 'Posteriores de Coxa (Isquiotibiais)',
    instructions: 'Apoio sobre as coxas travado. Flexione as pernas para baixo contraindo os posteriores de coxa com controle.'
  },
  {
    id: 'legs_lying_leg_curl',
    name: 'Mesa Flexora',
    nameEn: 'Lying Leg Curl',
    category: 'legs',
    equipment: 'machine',
    targetMuscle: 'Posteriores de Coxa',
    instructions: 'Deite de bruços no aparelho com o rolete atrás do tendão de Aquiles. Flexione as pernas trazendo os calcanhares em direção aos glúteos.'
  },
  {
    id: 'legs_romanian_deadlift',
    name: 'Stiff / Levantamento Romeno (RDL)',
    nameEn: 'Romanian Deadlift (RDL)',
    category: 'legs',
    equipment: 'barbell',
    targetMuscle: 'Posteriores de Coxa e Glúteos',
    instructions: 'Joelhos levemente destravados, empurre o quadril para trás enquanto desce a barra colada nas pernas sentindo o estiramento posterior.'
  },
  {
    id: 'legs_bulgarian_split_squat',
    name: 'Agachamento Búlgaro',
    nameEn: 'Bulgarian Split Squat',
    category: 'legs',
    equipment: 'dumbbell',
    targetMuscle: 'Quadríceps e Glúteos Unilateral',
    instructions: 'Apoie um pé atrás em um banco e o outro à frente. Desça o joelho de trás em direção ao solo mantendo o tronco firme.'
  },
  {
    id: 'legs_walking_lunge',
    name: 'Passada / Avanço com Halteres',
    nameEn: 'Dumbbell Walking Lunge',
    category: 'legs',
    equipment: 'dumbbell',
    targetMuscle: 'Pernas Completas e Glúteos',
    instructions: 'Dê passos largos à frente flexionando ambos os joelhos a 90 graus de maneira alternada e fluida.'
  },
  {
    id: 'legs_hip_thrust',
    name: 'Elevação Pélvica com Barra (Hip Thrust)',
    nameEn: 'Barbell Hip Thrust',
    category: 'legs',
    equipment: 'barbell',
    targetMuscle: 'Glúteo Máximo',
    instructions: 'Costas apoiadas no banco, barra acolchoada sobre o quadril. Empurre o quadril para cima até alinhar com o tronco e segure.'
  },
  {
    id: 'legs_hip_abduction_machine',
    name: 'Cadeira Abdutora',
    nameEn: 'Hip Abduction Machine',
    category: 'legs',
    equipment: 'machine',
    targetMuscle: 'Glúteo Médio e Mínimo',
    instructions: 'Abra as pernas contra a resistência da almofada, segurando a contração máxima antes de retornar devagar.'
  },
  {
    id: 'legs_hip_adduction_machine',
    name: 'Cadeira Adutora',
    nameEn: 'Hip Adduction Machine',
    category: 'legs',
    equipment: 'machine',
    targetMuscle: 'Adutores da Coxa',
    instructions: 'Feche as pernas unindo as almofadas no centro, concentrando a força na parte interna da coxa.'
  },

  // --- OMBROS (SHOULDERS) ---
  {
    id: 'shoulders_overhead_press_barbell',
    name: 'Desenvolvimento Militar com Barra',
    nameEn: 'Overhead Barbell Press',
    category: 'shoulders',
    equipment: 'barbell',
    targetMuscle: 'Deltoide Anterior e Lateral',
    instructions: 'Em pé ou sentado, segure a barra na altura do queixo. Empurre reto para cima até estender os braços acima da cabeça.'
  },
  {
    id: 'shoulders_dumbbell_shoulder_press',
    name: 'Desenvolvimento com Halteres',
    nameEn: 'Seated Dumbbell Shoulder Press',
    category: 'shoulders',
    equipment: 'dumbbell',
    targetMuscle: 'Deltoides Anterior e Lateral',
    instructions: 'Sentado com apoio 90 graus, empurre os halteres para cima mantendo os cotovelos levemente à frente do plano coronal.'
  },
  {
    id: 'shoulders_lateral_raise_dumbbell',
    name: 'Elevação Lateral com Halteres',
    nameEn: 'Dumbbell Lateral Raise',
    category: 'shoulders',
    equipment: 'dumbbell',
    targetMuscle: 'Deltoide Lateral (Ombro Médio)',
    instructions: 'Com os braços semiflexionados, eleve os halteres lateralmente até a linha dos ombros sem dar tranco com o corpo.'
  },
  {
    id: 'shoulders_lateral_raise_cable',
    name: 'Elevação Lateral na Polia',
    nameEn: 'Cable Lateral Raise',
    category: 'shoulders',
    equipment: 'cable',
    targetMuscle: 'Deltoide Lateral (Tensão Contínua)',
    instructions: 'Passe o cabo por trás ou pela frente do corpo e eleve a manopla lateralmente sentindo tensão constante em todo o arco.'
  },
  {
    id: 'shoulders_front_raise_dumbbell',
    name: 'Elevação Frontal com Halteres',
    nameEn: 'Dumbbell Front Raise',
    category: 'shoulders',
    equipment: 'dumbbell',
    targetMuscle: 'Deltoide Anterior',
    instructions: 'Eleve os halteres à frente do corpo até a linha dos olhos, mantendo o abdômen contraído.'
  },
  {
    id: 'shoulders_reverse_fly_machine',
    name: 'Crucifixo Inverso / Peck Deck Invertido',
    nameEn: 'Reverse Pec Deck Fly',
    category: 'shoulders',
    equipment: 'machine',
    targetMuscle: 'Deltoide Posterior',
    instructions: 'Sente de frente para o aparelho. Abra os braços para trás contraindo a porção posterior dos ombros.'
  },
  {
    id: 'shoulders_face_pull',
    name: 'Face Pull na Polia',
    nameEn: 'Cable Face Pull',
    category: 'shoulders',
    equipment: 'cable',
    targetMuscle: 'Deltoide Posterior, Manguito e Trapézio',
    instructions: 'Polia na altura do rosto com corda. Puxe separando as pontas em direção às orelhas e rodando os ombros externamente.'
  },
  {
    id: 'shoulders_dumbbell_shrug',
    name: 'Encolhimento com Halteres (Trapézio)',
    nameEn: 'Dumbbell Shrug',
    category: 'shoulders',
    equipment: 'dumbbell',
    targetMuscle: 'Trapézio Superior',
    instructions: 'Com halteres ao lado do corpo, eleve os ombros em direção às orelhas sem rodá-los. Segure no topo por 1 segundo.'
  },

  // --- BÍCEPS (BICEPS) ---
  {
    id: 'biceps_barbell_curl',
    name: 'Rosca Direta com Barra',
    nameEn: 'Barbell Bicep Curl',
    category: 'biceps',
    equipment: 'barbell',
    targetMuscle: 'Bíceps Braquial',
    instructions: 'Cotovelos colados ao tronco. Flexione os braços trazendo a barra ao peito sem balançar o corpo.'
  },
  {
    id: 'biceps_ez_bar_curl',
    name: 'Rosca Direta com Barra W',
    nameEn: 'EZ-Bar Curl',
    category: 'biceps',
    equipment: 'barbell',
    targetMuscle: 'Bíceps Braquial e Braquiorradial',
    instructions: 'Pegada semi-supinada na curvatura da barra W para conforto das articulações do punho.'
  },
  {
    id: 'biceps_dumbbell_curl_alternating',
    name: 'Rosca Alternada com Halteres',
    nameEn: 'Alternating Dumbbell Curl',
    category: 'biceps',
    equipment: 'dumbbell',
    targetMuscle: 'Bíceps Braquial com Supinação',
    instructions: 'Suba um halter por vez, girando o punho para fora (supinação) no topo do movimento.'
  },
  {
    id: 'biceps_hammer_curl',
    name: 'Rosca Martelo com Halteres',
    nameEn: 'Hammer Curl',
    category: 'biceps',
    equipment: 'dumbbell',
    targetMuscle: 'Braquial e Braquiorradial (Antebraço)',
    instructions: 'Pegada neutra (palmas viradas uma para a outra). Flexione os antebraços mantendo a pegada firme.'
  },
  {
    id: 'biceps_incline_dumbbell_curl',
    name: 'Rosca Inclinada no Banco 45°',
    nameEn: 'Incline Dumbbell Curl',
    category: 'biceps',
    equipment: 'dumbbell',
    targetMuscle: 'Cabeça Longa do Bíceps (Pico)',
    instructions: 'Deite-se no banco a 45 graus com os braços pendurados para trás. Flexione aproveitando o grande alongamento inicial.'
  },
  {
    id: 'biceps_scott_curl',
    name: 'Rosca Scott (Banco Scott)',
    nameEn: 'Preacher Curl',
    category: 'biceps',
    equipment: 'barbell',
    targetMuscle: 'Bíceps (Isolamento Cabeça Curta)',
    instructions: 'Braços repousados na almofada inclinada. Flexione até o topo sem desencostar os tríceps do apoio.'
  },
  {
    id: 'biceps_concentration_curl',
    name: 'Rosca Concentrada',
    nameEn: 'Concentration Curl',
    category: 'biceps',
    equipment: 'dumbbell',
    targetMuscle: 'Pico do Bíceps',
    instructions: 'Sentado, apoie o cotovelo na face interna da coxa e flexione o halter de forma isolada.'
  },
  {
    id: 'biceps_cable_curl',
    name: 'Rosca na Polia Baixa',
    nameEn: 'Standing Cable Curl',
    category: 'biceps',
    equipment: 'cable',
    targetMuscle: 'Bíceps com Tensão Contínua',
    instructions: 'Puxe a barra reta ou barra W conectada à polia baixa mantendo tensão constante durante toda a subida e descida.'
  },

  // --- TRÍCEPS (TRICEPS) ---
  {
    id: 'triceps_rope_pushdown',
    name: 'Tríceps Corda na Polia',
    nameEn: 'Cable Rope Triceps Pushdown',
    category: 'triceps',
    equipment: 'cable',
    targetMuscle: 'Tríceps (Cabeça Lateral e Medial)',
    instructions: 'Empurre a corda para baixo abrindo as pontas no final do movimento para contração máxima.'
  },
  {
    id: 'triceps_straight_bar_pushdown',
    name: 'Tríceps Pulley com Barra Reta/V',
    nameEn: 'Cable Bar Triceps Pushdown',
    category: 'triceps',
    equipment: 'cable',
    targetMuscle: 'Tríceps Braquial',
    instructions: 'Cotovelos junto às costelas. Empurre a barra até estender completamente os braços.'
  },
  {
    id: 'triceps_skull_crusher',
    name: 'Tríceps Testa com Barra W',
    nameEn: 'Lying Triceps Extension (Skull Crusher)',
    category: 'triceps',
    equipment: 'barbell',
    targetMuscle: 'Cabeça Longa do Tríceps',
    instructions: 'Deitado no banco reto, flexione os cotovelos descendo a barra até a testa e estenda novamente.'
  },
  {
    id: 'triceps_overhead_cable_extension',
    name: 'Tríceps Francês na Polia (Corda)',
    nameEn: 'Overhead Cable Triceps Extension',
    category: 'triceps',
    equipment: 'cable',
    targetMuscle: 'Cabeça Longa do Tríceps (Alongamento)',
    instructions: 'De costas para a polia, incline o corpo à frente e estenda a corda para a diagonal superior mantendo cotovelos firmes.'
  },
  {
    id: 'triceps_overhead_dumbbell_extension',
    name: 'Tríceps Francês com Halter',
    nameEn: 'Overhead Dumbbell Triceps Extension',
    category: 'triceps',
    equipment: 'dumbbell',
    targetMuscle: 'Cabeça Longa do Tríceps',
    instructions: 'Segure um halter com ambas as mãos atrás da cabeça e estenda verticalmente.'
  },
  {
    id: 'triceps_dips_parallel_bars',
    name: 'Paralelas para Tríceps (Dips)',
    nameEn: 'Triceps Dips',
    category: 'triceps',
    equipment: 'bodyweight',
    targetMuscle: 'Tríceps e Peitoral Inferior',
    instructions: 'Nas barras paralelas com tronco mais ereto, desça até 90 graus nos cotovelos e empurre com os braços.'
  },
  {
    id: 'triceps_bench_dips',
    name: 'Tríceps no Banco (Mergulho)',
    nameEn: 'Bench Dips',
    category: 'triceps',
    equipment: 'bodyweight',
    targetMuscle: 'Tríceps Braquial',
    instructions: 'Mãos apoiadas na borda do banco e pés à frente. Desça o quadril próximo ao banco flexionando os cotovelos.'
  },
  {
    id: 'triceps_kickback_cable',
    name: 'Tríceps Coice na Polia ou Halter',
    nameEn: 'Triceps Kickback',
    category: 'triceps',
    equipment: 'cable',
    targetMuscle: 'Tríceps (Contração de Pico)',
    instructions: 'Tronco paralelo ao chão, cotovelo alto fixo. Estenda o antebraço para trás e esprema o tríceps.'
  },

  // --- PANTURRILHAS (CALVES) ---
  {
    id: 'calves_standing_raise_machine',
    name: 'Panturrilha em Pé na Máquina',
    nameEn: 'Standing Calf Raise',
    category: 'calves',
    equipment: 'machine',
    targetMuscle: 'Gastrocnêmio',
    instructions: 'Com a ponta dos pés no degrau, desça para o alongamento total e suba na ponta dos pés segurando 1s no topo.'
  },
  {
    id: 'calves_seated_raise_machine',
    name: 'Gêmeos / Panturrilha Sentado',
    nameEn: 'Seated Calf Raise',
    category: 'calves',
    equipment: 'machine',
    targetMuscle: 'Sóleo',
    instructions: 'Com as pernas dobradas a 90 graus sob as almofadas, flexione os tornozelos com amplitude completa.'
  },
  {
    id: 'calves_leg_press_raise',
    name: 'Panturrilha no Leg Press',
    nameEn: 'Leg Press Calf Press',
    category: 'calves',
    equipment: 'machine',
    targetMuscle: 'Gastrocnêmio e Sóleo',
    instructions: 'Apoie a ponta dos pés na borda inferior da plataforma do Leg Press e empurre estendendo os tornozelos.'
  },

  // --- ABDÔMEN (ABS) ---
  {
    id: 'abs_crunch_floor',
    name: 'Abdominal Tradicional (Crunch)',
    nameEn: 'Floor Crunch',
    category: 'abs',
    equipment: 'bodyweight',
    targetMuscle: 'Reto Abdominal',
    instructions: 'Deitado no colchonete, flexione a coluna enrolando o abdômen sem puxar o pescoço.'
  },
  {
    id: 'abs_hanging_leg_raise',
    name: 'Elevação de Pernas na Barra Fixa',
    nameEn: 'Hanging Leg Raise',
    category: 'abs',
    equipment: 'bodyweight',
    targetMuscle: 'Reto Abdominal Inferior e Flexores',
    instructions: 'Pendurado na barra fixa, eleve os joelhos ou pernas retas até a altura do quadril enrolando a pelve.'
  },
  {
    id: 'abs_plank',
    name: 'Prancha Isométrica',
    nameEn: 'Plank',
    category: 'abs',
    equipment: 'bodyweight',
    targetMuscle: 'Core Geral, Transverso e Lombar',
    instructions: 'Apoie antebraços e pontas dos pés no chão. Mantenha o corpo reto e o abdômen rígido pelo tempo determinado.'
  },
  {
    id: 'abs_cable_crunch',
    name: 'Abdominal na Polia Alta (Cable Crunch)',
    nameEn: 'Kneeling Cable Crunch',
    category: 'abs',
    equipment: 'cable',
    targetMuscle: 'Reto Abdominal com Carga',
    instructions: 'De joelhos segurando a corda atrás da cabeça, enrole a coluna levando os cotovelos em direção aos joelhos.'
  },
  {
    id: 'abs_wheel_rollout',
    name: 'Roda Abdominal (Ab Wheel)',
    nameEn: 'Ab Wheel Rollout',
    category: 'abs',
    equipment: 'other',
    targetMuscle: 'Core Completo e Anti-extensão',
    instructions: 'De joelhos, empurre a roda para frente mantendo o abdômen firme sem deixar a lombar arquear, e retorne.'
  },
  {
    id: 'abs_russian_twist',
    name: 'Russian Twist',
    nameEn: 'Russian Twist',
    category: 'abs',
    equipment: 'dumbbell',
    targetMuscle: 'Oblíquos e Core Rotacional',
    instructions: 'Sentado com os pés elevados, rotacione o tronco de um lado para o outro controladamente segurando um halter ou anilha.'
  },

  // --- CARDIO ---
  {
    id: 'cardio_treadmill_running',
    name: 'Corrida na Esteira',
    nameEn: 'Treadmill Running',
    category: 'cardio',
    equipment: 'machine',
    targetMuscle: 'Sistema Cardiovascular e Membros Inferiores',
    instructions: 'Corrida com ritmo constante ou intervalado na esteira para queima calórica e condicionamento.'
  },
  {
    id: 'cardio_incline_treadmill_walk',
    name: 'Caminhada Inclinada na Esteira',
    nameEn: 'Incline Treadmill Walk',
    category: 'cardio',
    equipment: 'machine',
    targetMuscle: 'Glúteos, Panturrilhas e Cardiovascular',
    instructions: 'Velocidade moderada (4.5 a 6 km/h) com inclinação entre 8% e 15% para queima de gordura de baixo impacto.'
  },
  {
    id: 'cardio_stationary_bike',
    name: 'Bicicleta Ergométrica',
    nameEn: 'Stationary Cycling',
    category: 'cardio',
    equipment: 'machine',
    targetMuscle: 'Cardiovascular e Quadríceps',
    instructions: 'Pedal moderado a intenso mantendo cadência entre 70 e 90 RPM com resistência ajustada.'
  },
  {
    id: 'cardio_elliptical',
    name: 'Elíptico',
    nameEn: 'Elliptical Trainer',
    category: 'cardio',
    equipment: 'machine',
    targetMuscle: 'Cardiovascular de Baixo Impacto',
    instructions: 'Movimento contínuo sincronizado de braços e pernas suave para as articulações.'
  },
  {
    id: 'cardio_stairmaster',
    name: 'Simulador de Escada',
    nameEn: 'StairMaster / StepMill',
    category: 'cardio',
    equipment: 'machine',
    targetMuscle: 'Glúteos, Pernas e Resistência Cardíaca',
    instructions: 'Suba os degraus sem apoiar todo o peso do corpo nos corrimãos, mantendo postura ereta.'
  },
  {
    id: 'cardio_jump_rope',
    name: 'Pular Corda',
    nameEn: 'Jump Rope',
    category: 'cardio',
    equipment: 'other',
    targetMuscle: 'Panturrilhas, Coordenação e Cardio',
    instructions: 'Saltos curtos com a ponta dos pés impulsionados pelos punhos de forma ritmada.'
  }
];

export { EXERCISE_GIF_MAP };

export function getExerciseGifUrl(exerciseId: string): string {
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

export function getAllExercises(): Exercise[] {
  return EXERCISE_DATABASE.map(enrichExercise);
}

export function getExerciseById(id: string): Exercise | undefined {
  const found = EXERCISE_DATABASE.find((e) => e.id === id);
  return found ? enrichExercise(found) : undefined;
}

export function getExercisesByCategory(category: MuscleCategory): Exercise[] {
  return EXERCISE_DATABASE.filter((e) => e.category === category).map(enrichExercise);
}

export function searchExercises(query: string, category?: MuscleCategory): Exercise[] {
  const cleanQuery = query.toLowerCase().trim();
  return EXERCISE_DATABASE.filter((e) => {
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


import type { Exercise } from '../types/workout';

export const ADDITIONAL_EXERCISES: Exercise[] = [
  {
    "id": "chest_incline_pushup",
    "name": "Flexão inclinada no banco",
    "nameEn": "Incline Push-Up",
    "category": "chest",
    "equipment": "bodyweight",
    "targetMuscle": "Peitoral maior",
    "instructions": "Apoie as mãos em um banco firme. Mantenha o corpo alinhado, desça o peito até perto do apoio e empurre até estender os braços."
  },
  {
    "id": "back_chest_supported_dumbbell_row",
    "name": "Remada com halteres e peito apoiado",
    "nameEn": "Chest-Supported Dumbbell Row",
    "category": "back",
    "equipment": "dumbbell",
    "targetMuscle": "Dorsais e romboides",
    "instructions": "Apoie o peito no banco inclinado. Puxe os halteres em direção às costelas e desça sem perder o apoio."
  },
  {
    "id": "back_neutral_grip_pullup",
    "name": "Barra fixa com pegada neutra",
    "nameEn": "Neutral-Grip Pull-Up",
    "category": "back",
    "equipment": "bodyweight",
    "targetMuscle": "Latíssimo do dorso",
    "instructions": "Segure as alças paralelas. Puxe o corpo sem balanço até o queixo chegar à altura das mãos e desça com controle."
  },
  {
    "id": "legs_goblet_squat",
    "name": "Agachamento goblet",
    "nameEn": "Goblet Squat",
    "category": "legs",
    "equipment": "dumbbell",
    "targetMuscle": "Quadríceps e glúteos",
    "instructions": "Segure um halter junto ao peito. Agache mantendo os pés apoiados e volte à posição em pé."
  },
  {
    "id": "legs_dumbbell_step_up",
    "name": "Subida no banco com halteres",
    "nameEn": "Dumbbell Step-Up",
    "category": "legs",
    "equipment": "dumbbell",
    "targetMuscle": "Quadríceps e glúteos",
    "instructions": "Use uma plataforma firme e baixa. Apoie o pé inteiro e suba pela perna da frente. Desça devagar e alterne as pernas."
  },
  {
    "id": "legs_single_leg_rdl",
    "name": "Stiff unilateral com halter",
    "nameEn": "Single-Leg Romanian Deadlift",
    "category": "legs",
    "equipment": "dumbbell",
    "targetMuscle": "Isquiotibiais e glúteos",
    "instructions": "Com o joelho de apoio levemente dobrado, leve o quadril para trás e estenda a outra perna. Retorne sem girar o quadril."
  },
  {
    "id": "legs_single_leg_glute_bridge",
    "name": "Ponte de glúteos unilateral",
    "nameEn": "Single-Leg Glute Bridge",
    "category": "legs",
    "equipment": "bodyweight",
    "targetMuscle": "Glúteo máximo",
    "instructions": "Deite-se com um pé no chão e a outra perna elevada. Eleve a pelve mantendo o quadril nivelado e retorne devagar."
  },
  {
    "id": "legs_reverse_lunge",
    "name": "Avanço reverso com halteres",
    "nameEn": "Dumbbell Reverse Lunge",
    "category": "legs",
    "equipment": "dumbbell",
    "targetMuscle": "Quadríceps e glúteos",
    "instructions": "Dê um passo para trás e dobre os joelhos. Empurre o chão com o pé da frente para voltar e alterne os lados."
  },
  {
    "id": "shoulders_landmine_press",
    "name": "Desenvolvimento unilateral landmine",
    "nameEn": "Single-Arm Landmine Press",
    "category": "shoulders",
    "equipment": "barbell",
    "targetMuscle": "Deltoide anterior",
    "instructions": "Com uma ponta da barra ancorada, segure a outra na altura do ombro. Empurre à frente e para cima mantendo as costelas alinhadas."
  },
  {
    "id": "shoulders_cable_external_rotation",
    "name": "Rotação externa de ombro na polia",
    "nameEn": "Cable External Rotation",
    "category": "shoulders",
    "equipment": "cable",
    "targetMuscle": "Manguito rotador",
    "instructions": "Com carga leve e cotovelo dobrado junto ao tronco, gire o antebraço para fora sem deslocar o cotovelo."
  },
  {
    "id": "biceps_reverse_curl",
    "name": "Rosca inversa com barra W",
    "nameEn": "EZ-Bar Reverse Curl",
    "category": "biceps",
    "equipment": "barbell",
    "targetMuscle": "Braquiorradial e braquial",
    "instructions": "Segure a barra com as palmas para baixo. Flexione os cotovelos sem balançar o tronco e desça com controle."
  },
  {
    "id": "triceps_close_grip_bench_press",
    "name": "Supino com pegada fechada",
    "nameEn": "Close-Grip Bench Press",
    "category": "triceps",
    "equipment": "barbell",
    "targetMuscle": "Tríceps braquial",
    "instructions": "Segure a barra aproximadamente na largura dos ombros. Desça em direção ao peito com os cotovelos próximos ao corpo e empurre."
  },
  {
    "id": "calves_single_leg_raise",
    "name": "Panturrilha unilateral em pé",
    "nameEn": "Single-Leg Calf Raise",
    "category": "calves",
    "equipment": "bodyweight",
    "targetMuscle": "Gastrocnêmio e sóleo",
    "instructions": "Use uma mão para se equilibrar. Eleve o calcanhar de uma perna, faça uma breve pausa e retorne sem quicar."
  },
  {
    "id": "abs_pallof_press",
    "name": "Press Pallof na polia",
    "nameEn": "Cable Pallof Press",
    "category": "abs",
    "equipment": "cable",
    "targetMuscle": "Oblíquos e estabilizadores do tronco",
    "instructions": "Fique de lado para a polia com a alça junto ao peito. Estenda os braços resistindo à rotação e volte."
  },
  {
    "id": "abs_dead_bug",
    "name": "Dead bug",
    "nameEn": "Dead Bug",
    "category": "abs",
    "equipment": "bodyweight",
    "targetMuscle": "Estabilizadores do tronco",
    "instructions": "Deite-se de costas com joelhos e braços elevados. Estenda braço e perna opostos sem arquear a lombar e alterne."
  },
  {
    "id": "abs_bird_dog",
    "name": "Bird dog em quatro apoios",
    "nameEn": "Bird Dog",
    "category": "abs",
    "equipment": "bodyweight",
    "targetMuscle": "Estabilizadores lombares e abdominais",
    "instructions": "Em quatro apoios, estenda braço e perna opostos mantendo a pelve nivelada. Retorne com controle e alterne."
  },
  {
    "id": "abs_side_plank",
    "name": "Prancha lateral",
    "nameEn": "Side Plank",
    "category": "abs",
    "equipment": "bodyweight",
    "targetMuscle": "Oblíquos",
    "instructions": "Apoie o antebraço com o cotovelo abaixo do ombro. Eleve o quadril, mantenha o corpo alinhado e troque o lado."
  },
  {
    "id": "cardio_rowing_ergometer",
    "name": "Remo ergométrico",
    "nameEn": "Rowing Ergometer",
    "category": "cardio",
    "equipment": "machine",
    "targetMuscle": "Cardiovascular e pernas",
    "instructions": "Impulsione primeiro com as pernas, incline levemente o tronco e puxe a alça. Na volta, estenda braços e depois dobre os joelhos."
  }
];

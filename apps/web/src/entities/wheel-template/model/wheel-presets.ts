import type { Locale } from "@/shared/lib/i18n";
import type { WheelPreset, WheelPresetCategory } from "./types";

type LocalizedPreset = Omit<WheelPreset, "id" | "category" | "selectionMode">;

const presetDefinitions: Array<{
  id: string;
  category: WheelPresetCategory;
  selectionMode: WheelPreset["selectionMode"];
  content: Record<Locale, LocalizedPreset>;
}> = [
  {
    id: "where-to-eat",
    category: "friends",
    selectionMode: "REPEAT",
    content: {
      en: {
        name: "Where should we eat?",
        description: "Settle lunch or dinner without a long debate.",
        options: ["Pizza", "Sushi", "Burgers", "Pasta", "Salad", "Street food"],
      },
      ru: {
        name: "Где поесть?",
        description: "Выберите обед или ужин без долгих споров.",
        options: ["Пицца", "Суши", "Бургеры", "Паста", "Салат", "Стритфуд"],
      },
      uk: {
        name: "Де поїсти?",
        description: "Оберіть обід або вечерю без довгих суперечок.",
        options: ["Піца", "Суші", "Бургери", "Паста", "Салат", "Стритфуд"],
      },
      de: {
        name: "Wo sollen wir essen?",
        description: "Entscheidet über Mittag- oder Abendessen ohne lange Debatte.",
        options: ["Pizza", "Sushi", "Burger", "Pasta", "Salat", "Streetfood"],
      },
      zh: {
        name: "去哪里吃？",
        description: "不用争论太久，快速决定午餐或晚餐。",
        options: ["披萨", "寿司", "汉堡", "意面", "沙拉", "街头小吃"],
      },
      es: {
        name: "¿Dónde comemos?",
        description: "Decidan el almuerzo o la cena sin discutir demasiado.",
        options: [
          "Pizza",
          "Sushi",
          "Hamburguesas",
          "Pasta",
          "Ensalada",
          "Comida callejera",
        ],
      },
      pt: {
        name: "Onde vamos comer?",
        description: "Decidam o almoço ou o jantar sem uma longa discussão.",
        options: ["Pizza", "Sushi", "Hambúrgueres", "Massa", "Salada", "Comida de rua"],
      },
      ja: {
        name: "どこで食べる？",
        description: "長く悩まずにランチや夕食を決めましょう。",
        options: ["ピザ", "寿司", "ハンバーガー", "パスタ", "サラダ", "屋台グルメ"],
      },
      "zh-Hant": {
        name: "去哪裡吃？",
        description: "不用長時間討論，快速決定午餐或晚餐。",
        options: ["薄餅", "壽司", "漢堡包", "意大利粉", "沙律", "街頭小食"],
      },
    },
  },
  {
    id: "game-night",
    category: "friends",
    selectionMode: "REPEAT",
    content: {
      en: {
        name: "Game night",
        description: "Pick the format for the next round together.",
        options: [
          "Board game",
          "Quiz",
          "Charades",
          "Video game",
          "Cards",
          "Drawing game",
        ],
      },
      ru: {
        name: "Игровой вечер",
        description: "Вместе выберите формат следующего раунда.",
        options: [
          "Настольная игра",
          "Квиз",
          "Крокодил",
          "Видеоигра",
          "Карты",
          "Рисование",
        ],
      },
      uk: {
        name: "Ігровий вечір",
        description: "Разом оберіть формат наступного раунду.",
        options: [
          "Настільна гра",
          "Квіз",
          "Крокодил",
          "Відеогра",
          "Карти",
          "Малювання",
        ],
      },
      de: {
        name: "Spieleabend",
        description: "Wählt gemeinsam das Format für die nächste Runde.",
        options: [
          "Brettspiel",
          "Quiz",
          "Scharade",
          "Videospiel",
          "Karten",
          "Zeichenspiel",
        ],
      },
      zh: {
        name: "游戏之夜",
        description: "一起选择下一轮的游戏形式。",
        options: ["桌游", "知识问答", "你演我猜", "电子游戏", "纸牌", "绘画游戏"],
      },
      es: {
        name: "Noche de juegos",
        description: "Elijan juntos el formato de la próxima ronda.",
        options: [
          "Juego de mesa",
          "Preguntas y respuestas",
          "Mímica",
          "Videojuego",
          "Cartas",
          "Juego de dibujo",
        ],
      },
      pt: {
        name: "Noite de jogos",
        description: "Escolham juntos o formato da próxima rodada.",
        options: [
          "Jogo de tabuleiro",
          "Quiz",
          "Mímica",
          "Videogame",
          "Cartas",
          "Jogo de desenho",
        ],
      },
      ja: {
        name: "ゲームナイト",
        description: "次のラウンドで遊ぶゲームをみんなで選びます。",
        options: [
          "ボードゲーム",
          "クイズ",
          "ジェスチャーゲーム",
          "テレビゲーム",
          "カードゲーム",
          "お絵描きゲーム",
        ],
      },
      "zh-Hant": {
        name: "遊戲之夜",
        description: "一起選擇下一輪的遊戲形式。",
        options: ["桌上遊戲", "問答遊戲", "你做我猜", "電子遊戲", "紙牌", "繪畫遊戲"],
      },
    },
  },
  {
    id: "icebreaker",
    category: "friends",
    selectionMode: "ELIMINATION",
    content: {
      en: {
        name: "Icebreaker questions",
        description: "Choose a fresh question each round without repeats.",
        options: [
          "A dream trip",
          "An unexpected talent",
          "A favorite tradition",
          "A perfect day off",
          "A recent discovery",
          "A small personal win",
        ],
      },
      ru: {
        name: "Вопросы для знакомства",
        description: "Новый вопрос в каждом раунде без повторов.",
        options: [
          "Путешествие мечты",
          "Неожиданный талант",
          "Любимая традиция",
          "Идеальный выходной",
          "Недавнее открытие",
          "Маленькая личная победа",
        ],
      },
      uk: {
        name: "Питання для знайомства",
        description: "Нове питання в кожному раунді без повторів.",
        options: [
          "Подорож мрії",
          "Неочікуваний талант",
          "Улюблена традиція",
          "Ідеальний вихідний",
          "Нещодавнє відкриття",
          "Маленька особиста перемога",
        ],
      },
      de: {
        name: "Kennenlernfragen",
        description: "In jeder Runde eine neue Frage ohne Wiederholung.",
        options: [
          "Eine Traumreise",
          "Ein unerwartetes Talent",
          "Eine Lieblingstradition",
          "Ein perfekter freier Tag",
          "Eine neue Entdeckung",
          "Ein kleiner persönlicher Erfolg",
        ],
      },
      zh: {
        name: "破冰问题",
        description: "每轮选择一个不重复的新问题。",
        options: [
          "梦想旅行",
          "意外的才能",
          "最喜欢的传统",
          "完美休息日",
          "最近的新发现",
          "小小的个人成就",
        ],
      },
      es: {
        name: "Preguntas para romper el hielo",
        description: "Elijan una pregunta nueva y sin repetir en cada ronda.",
        options: [
          "Un viaje soñado",
          "Un talento inesperado",
          "Una tradición favorita",
          "Un día libre perfecto",
          "Un descubrimiento reciente",
          "Un pequeño logro personal",
        ],
      },
      pt: {
        name: "Perguntas para quebrar o gelo",
        description: "Escolham uma pergunta nova a cada rodada, sem repetir.",
        options: [
          "Uma viagem dos sonhos",
          "Um talento inesperado",
          "Uma tradição favorita",
          "Um dia de folga perfeito",
          "Uma descoberta recente",
          "Uma pequena conquista pessoal",
        ],
      },
      ja: {
        name: "アイスブレイクの質問",
        description: "毎回、重複しない新しい質問を選びます。",
        options: [
          "いつか行きたい旅行先",
          "意外な特技",
          "お気に入りの習慣",
          "理想の休日",
          "最近発見したこと",
          "最近の小さな成功",
        ],
      },
      "zh-Hant": {
        name: "破冰問題",
        description: "每輪選擇一個不重複的新問題。",
        options: [
          "夢想旅程",
          "意想不到的才能",
          "最喜愛的傳統",
          "完美的休息日",
          "最近的新發現",
          "小小的個人成就",
        ],
      },
    },
  },
  {
    id: "retrospective",
    category: "team",
    selectionMode: "ELIMINATION",
    content: {
      en: {
        name: "Retrospective prompts",
        description: "Move through team reflection topics without repeating them.",
        options: [
          "What went well?",
          "What slowed us down?",
          "What should we stop?",
          "What should we start?",
          "Who helped this week?",
          "What will we try next?",
        ],
      },
      ru: {
        name: "Вопросы для ретро",
        description: "Обсудите командные темы без повторов.",
        options: [
          "Что прошло хорошо?",
          "Что нас замедляло?",
          "Что стоит прекратить?",
          "Что стоит начать?",
          "Кто помог на этой неделе?",
          "Что попробуем дальше?",
        ],
      },
      uk: {
        name: "Питання для ретро",
        description: "Обговоріть командні теми без повторів.",
        options: [
          "Що пройшло добре?",
          "Що нас сповільнювало?",
          "Що варто припинити?",
          "Що варто почати?",
          "Хто допоміг цього тижня?",
          "Що спробуємо далі?",
        ],
      },
      de: {
        name: "Retrospektive",
        description: "Besprecht Teamthemen, ohne sie zu wiederholen.",
        options: [
          "Was lief gut?",
          "Was hat uns gebremst?",
          "Was sollten wir stoppen?",
          "Was sollten wir beginnen?",
          "Wer hat diese Woche geholfen?",
          "Was probieren wir als Nächstes?",
        ],
      },
      zh: {
        name: "复盘问题",
        description: "不重复地讨论团队复盘主题。",
        options: [
          "哪些方面做得好？",
          "什么拖慢了我们？",
          "应该停止什么？",
          "应该开始什么？",
          "本周谁提供了帮助？",
          "接下来尝试什么？",
        ],
      },
      es: {
        name: "Preguntas de retrospectiva",
        description: "Recorran los temas de reflexión del equipo sin repetirlos.",
        options: [
          "¿Qué salió bien?",
          "¿Qué nos frenó?",
          "¿Qué deberíamos dejar de hacer?",
          "¿Qué deberíamos empezar a hacer?",
          "¿Quién nos ayudó esta semana?",
          "¿Qué probaremos después?",
        ],
      },
      pt: {
        name: "Perguntas de retrospectiva",
        description: "Percorram os temas de reflexão da equipe sem repeti-los.",
        options: [
          "O que deu certo?",
          "O que nos atrasou?",
          "O que devemos parar de fazer?",
          "O que devemos começar a fazer?",
          "Quem ajudou nesta semana?",
          "O que vamos experimentar depois?",
        ],
      },
      ja: {
        name: "振り返りのテーマ",
        description: "重複なしでチームの振り返りテーマを選びます。",
        options: [
          "うまくいったことは？",
          "進行を妨げたことは？",
          "やめるべきことは？",
          "始めるべきことは？",
          "今週助けてくれた人は？",
          "次に試すことは？",
        ],
      },
      "zh-Hant": {
        name: "回顧問題",
        description: "不重複地討論團隊回顧主題。",
        options: [
          "哪些方面做得好？",
          "甚麼拖慢了我們？",
          "我們應該停止甚麼？",
          "我們應該開始甚麼？",
          "本週誰提供了協助？",
          "接下來要嘗試甚麼？",
        ],
      },
    },
  },
  {
    id: "meeting-focus",
    category: "team",
    selectionMode: "REPEAT",
    content: {
      en: {
        name: "Meeting focus",
        description: "Choose the first topic when everything feels urgent.",
        options: [
          "Priorities",
          "Blockers",
          "Customers",
          "Quality",
          "Delivery",
          "Team health",
        ],
      },
      ru: {
        name: "Фокус встречи",
        description: "Выберите первую тему, когда всё кажется срочным.",
        options: [
          "Приоритеты",
          "Блокеры",
          "Клиенты",
          "Качество",
          "Поставка",
          "Состояние команды",
        ],
      },
      uk: {
        name: "Фокус зустрічі",
        description: "Оберіть першу тему, коли все здається терміновим.",
        options: [
          "Пріоритети",
          "Блокери",
          "Клієнти",
          "Якість",
          "Постачання",
          "Стан команди",
        ],
      },
      de: {
        name: "Meeting-Fokus",
        description: "Wählt das erste Thema, wenn alles dringend wirkt.",
        options: [
          "Prioritäten",
          "Blocker",
          "Kunden",
          "Qualität",
          "Lieferung",
          "Teamgesundheit",
        ],
      },
      zh: {
        name: "会议重点",
        description: "当所有事情都很紧急时，选择第一个议题。",
        options: ["优先事项", "阻碍", "客户", "质量", "交付", "团队状态"],
      },
      es: {
        name: "Prioridad de la reunión",
        description: "Elijan el primer tema cuando todo parece urgente.",
        options: [
          "Prioridades",
          "Bloqueos",
          "Clientes",
          "Calidad",
          "Entrega",
          "Bienestar del equipo",
        ],
      },
      pt: {
        name: "Foco da reunião",
        description: "Escolham o primeiro assunto quando tudo parece urgente.",
        options: [
          "Prioridades",
          "Impedimentos",
          "Clientes",
          "Qualidade",
          "Entrega",
          "Bem-estar da equipe",
        ],
      },
      ja: {
        name: "ミーティングの優先事項",
        description: "すべてが緊急に思えるとき、最初の議題を選びます。",
        options: ["優先事項", "障害", "顧客", "品質", "リリース", "チームの状態"],
      },
      "zh-Hant": {
        name: "會議重點",
        description: "當所有事情都很緊急時，選擇第一個議題。",
        options: ["優先事項", "阻礙", "客戶", "品質", "交付", "團隊狀態"],
      },
    },
  },
  {
    id: "class-activity",
    category: "classroom",
    selectionMode: "REPEAT",
    content: {
      en: {
        name: "Class activity",
        description: "Randomly choose a lesson format for each round.",
        options: [
          "Pair discussion",
          "Quick quiz",
          "Mini presentation",
          "Silent writing",
          "Group challenge",
          "Explain an example",
        ],
      },
      ru: {
        name: "Задание для занятия",
        description: "Случайно выбирайте формат занятия для каждого раунда.",
        options: [
          "Обсуждение в парах",
          "Быстрый квиз",
          "Мини-презентация",
          "Письменный ответ",
          "Групповая задача",
          "Объяснить пример",
        ],
      },
      uk: {
        name: "Завдання для заняття",
        description: "Випадково обирайте формат заняття для кожного раунду.",
        options: [
          "Обговорення в парах",
          "Швидкий квіз",
          "Мініпрезентація",
          "Письмова відповідь",
          "Групове завдання",
          "Пояснити приклад",
        ],
      },
      de: {
        name: "Unterrichtsaktivität",
        description: "Wählt für jede Runde zufällig ein Unterrichtsformat.",
        options: [
          "Partnergespräch",
          "Schnelles Quiz",
          "Kurzpräsentation",
          "Stilles Schreiben",
          "Gruppenaufgabe",
          "Ein Beispiel erklären",
        ],
      },
      zh: {
        name: "课堂活动",
        description: "每轮随机选择一种课堂形式。",
        options: [
          "两人讨论",
          "快速问答",
          "迷你演讲",
          "安静写作",
          "小组挑战",
          "讲解示例",
        ],
      },
      es: {
        name: "Actividad de clase",
        description: "Elijan al azar un formato de clase para cada ronda.",
        options: [
          "Debate en parejas",
          "Prueba rápida",
          "Minipresentación",
          "Escritura en silencio",
          "Reto en grupo",
          "Explicar un ejemplo",
        ],
      },
      pt: {
        name: "Atividade de aula",
        description: "Escolham aleatoriamente um formato de aula para cada rodada.",
        options: [
          "Discussão em duplas",
          "Quiz rápido",
          "Minipresentação",
          "Escrita silenciosa",
          "Desafio em grupo",
          "Explicar um exemplo",
        ],
      },
      ja: {
        name: "授業のアクティビティ",
        description: "ラウンドごとに授業形式をランダムに選びます。",
        options: [
          "ペアで話し合う",
          "クイッククイズ",
          "ミニプレゼン",
          "静かに書く",
          "グループ課題",
          "例を説明する",
        ],
      },
      "zh-Hant": {
        name: "課堂活動",
        description: "每輪隨機選擇一種課堂形式。",
        options: [
          "二人討論",
          "快速問答",
          "迷你簡報",
          "安靜寫作",
          "小組挑戰",
          "講解例子",
        ],
      },
    },
  },
];

const categoryLabels: Record<Locale, Record<WheelPresetCategory, string>> = {
  en: { friends: "Friends", team: "Team", classroom: "Classroom" },
  ru: { friends: "Для друзей", team: "Для команды", classroom: "Для занятий" },
  uk: { friends: "Для друзів", team: "Для команди", classroom: "Для занять" },
  de: { friends: "Freunde", team: "Team", classroom: "Unterricht" },
  zh: { friends: "朋友", team: "团队", classroom: "课堂" },
  es: { friends: "Amigos", team: "Equipo", classroom: "Clase" },
  pt: { friends: "Amigos", team: "Equipe", classroom: "Sala de aula" },
  ja: { friends: "友達", team: "チーム", classroom: "授業" },
  "zh-Hant": { friends: "朋友", team: "團隊", classroom: "課堂" },
};

export function getWheelPresets(locale: Locale): WheelPreset[] {
  return presetDefinitions.map(({ content, ...preset }) => ({
    ...preset,
    ...content[locale],
  }));
}

export function getWheelPresetCategoryLabel(
  locale: Locale,
  category: WheelPresetCategory,
): string {
  return categoryLabels[locale][category];
}

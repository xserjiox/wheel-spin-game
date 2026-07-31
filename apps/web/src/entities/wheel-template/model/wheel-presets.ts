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
    },
  },
  {
    id: "class-activity",
    category: "classroom",
    selectionMode: "ELIMINATION",
    content: {
      en: {
        name: "Class activity",
        description: "Rotate through lesson formats without using one twice.",
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
        description: "Чередуйте форматы урока без повторов.",
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
        description: "Чергуйте формати уроку без повторів.",
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
        description: "Wechselt Unterrichtsformate ohne Wiederholungen ab.",
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
        description: "轮换课堂形式，避免重复。",
        options: [
          "两人讨论",
          "快速问答",
          "迷你演讲",
          "安静写作",
          "小组挑战",
          "讲解示例",
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

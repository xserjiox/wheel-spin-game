import type { Locale } from "@/shared/lib/i18n";

type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

export type LegalDocument = {
  eyebrow: string;
  title: string;
  summary: string;
  effectiveDateLabel: string;
  controllerTitle: string;
  contactLabel: string;
  sections: LegalSection[];
};

const privacyEn: LegalDocument = {
  eyebrow: "LEGAL",
  title: "Privacy Policy",
  summary:
    "This policy explains what personal data Wheel Spin processes when you create or join a shared room.",
  effectiveDateLabel: "Effective date",
  controllerTitle: "1. Controller",
  contactLabel: "Privacy contact",
  sections: [
    {
      title: "2. Data we process",
      items: [
        "Information you provide: display name, room title, wheel choices, suggestions, and an optional room password. The password is stored only as a one-way Argon2 hash.",
        "Room activity: your role and spin permission, room and participant timestamps, and shared spin results and history.",
        "Session and security data: a random room-session token (only its hash is stored in the database) and the IP address used temporarily in server memory to limit failed join attempts. The hosting service may also create operational HTTP logs. Because the current page loads font files from Google Fonts, your browser also sends Google the IP address and ordinary HTTP request metadata.",
        "Data kept in your browser: language preference; wheel templates you save; and room shortcuts only after you choose “Save room”.",
      ],
    },
    {
      title: "3. Why we process it",
      items: [
        "To create, join, synchronize, and administer the room you requested — necessary to provide the service to you (GDPR Article 6(1)(b)).",
        "To prevent abusive password attempts and keep the service reliable and secure — our legitimate interests in service security (GDPR Article 6(1)(f)).",
        "To load the fonts used by the current interface — our legitimate interest in presenting a consistent interface (GDPR Article 6(1)(f)).",
      ],
      paragraphs: [
        "Wheel Spin does not currently use personal data for advertising, profiling, or analytics.",
      ],
    },
    {
      title: "4. Who can see or receive it",
      items: [
        "People in the same room can see display names, room content, and shared results.",
        "A suggestion is shown to the host and participants without its author’s name. It is not fully anonymous: the backend record remains linked to the participant who submitted it.",
        "Railway processes application, database, and operational data as the hosting provider. Data locations and any international-transfer safeguards depend on the production project configuration and the provider agreement.",
        "Google receives the network request for the font files it serves, including the requesting IP address and ordinary request metadata. Its processing and any international-transfer safeguards are governed by Google’s applicable terms.",
      ],
      paragraphs: [
        "We do not routinely disclose personal data to other recipients unless required by law.",
      ],
    },
    {
      title: "5. How long we keep it",
      items: [
        "A room and its database records expire after seven days without activity and are removed by an hourly cleanup job. A host can delete the room sooner.",
        "The room-session cookie expires after seven days. Deleting your participant data or the room clears the current browser’s corresponding session cookie.",
        "Failed-join rate-limit records are kept only in server memory, not in the application database, and are cleared when the process restarts.",
        "Saved room shortcuts, language preference, and wheel templates remain on the device until you remove or clear them. Expired room shortcuts are removed when the list is read.",
        "Hosting logs and backups follow the retention settings of the production hosting account; the operator must review and configure those settings before launch.",
        "Google controls retention of request data created when it serves the font files under its applicable terms.",
      ],
    },
    {
      title: "6. Your rights",
      paragraphs: [
        "Depending on the GDPR, you may request access, correction, erasure, restriction, or portability of your personal data, and object to processing based on legitimate interests. Use the privacy contact above. You may also complain to the data-protection authority in the country where you live, work, or where the alleged infringement occurred.",
        "Inside a room, Settings lets you download the data linked to your current participant identity. A guest can delete that identity and its suggestions; a host can delete the entire room. These controls require the current room-session cookie.",
      ],
    },
    {
      title: "7. Required data and automated decisions",
      paragraphs: [
        "A display name and the room content needed for the selected feature are required to provide that feature. A room password, saved-room shortcut, and wheel template are optional. Without required room data, the corresponding room cannot be created or joined.",
        "Wheel Spin does not make automated decisions that produce legal or similarly significant effects. A random wheel result is generated only when an authorized participant starts a spin.",
      ],
    },
    {
      title: "8. Changes",
      paragraphs: [
        "If the processing changes, this policy and its effective date will be updated before the new processing is introduced where required.",
      ],
    },
  ],
};

const privacyRu: LegalDocument = {
  eyebrow: "ПРАВОВАЯ ИНФОРМАЦИЯ",
  title: "Политика конфиденциальности",
  summary:
    "Здесь описано, какие персональные данные Wheel Spin обрабатывает, когда вы создаёте общую комнату или входите в неё.",
  effectiveDateLabel: "Дата вступления в силу",
  controllerTitle: "1. Контролёр данных",
  contactLabel: "Контакт по вопросам данных",
  sections: [
    {
      title: "2. Какие данные обрабатываются",
      items: [
        "Введённые вами данные: отображаемое имя, название комнаты, варианты колеса, предложения и необязательный пароль комнаты. Пароль хранится только как односторонний Argon2-хеш.",
        "Действия в комнате: ваша роль и право запускать колесо, время создания и активности комнаты и участника, общие результаты и история вращений.",
        "Сессия и безопасность: случайный токен сессии комнаты (в базе хранится только его хеш) и IP-адрес, временно используемый в памяти сервера для ограничения неудачных попыток входа. Хостинг также может создавать технические HTTP-логи. Поскольку текущая страница загружает файлы шрифтов из Google Fonts, браузер также передаёт Google IP-адрес и обычные метаданные HTTP-запроса.",
        "Данные в браузере: выбор языка, сохранённые вами шаблоны колеса и ссылки на комнаты — только после нажатия «Сохранить комнату».",
      ],
    },
    {
      title: "3. Цели и правовые основания",
      items: [
        "Создание, вход, синхронизация и управление запрошенной вами комнатой — обработка необходима для предоставления сервиса (статья 6(1)(b) GDPR).",
        "Ограничение злоупотреблений с паролем и обеспечение надёжности и безопасности — законный интерес в защите сервиса (статья 6(1)(f) GDPR).",
        "Загрузка шрифтов текущего интерфейса — законный интерес в единообразном отображении сервиса (статья 6(1)(f) GDPR).",
      ],
      paragraphs: [
        "Сейчас Wheel Spin не использует персональные данные для рекламы, профилирования или аналитики.",
      ],
    },
    {
      title: "4. Кто видит или получает данные",
      items: [
        "Люди в одной комнате видят отображаемые имена, содержимое комнаты и общие результаты.",
        "Предложение показывается организатору и участникам без имени автора. Это не полная анонимность: серверная запись остаётся связанной с отправившим её участником.",
        "Railway обрабатывает данные приложения, базы и технические логи как хостинг-провайдер. Регион данных и гарантии международной передачи зависят от настройки production-проекта и договора с провайдером.",
        "Google получает сетевой запрос к предоставляемым им файлам шрифтов, включая IP-адрес и обычные метаданные запроса. Обработка и гарантии международной передачи регулируются применимыми условиями Google.",
      ],
      paragraphs: [
        "Данные обычно не передаются другим получателям, кроме случаев, когда этого требует закон.",
      ],
    },
    {
      title: "5. Сроки хранения",
      items: [
        "Комната и связанные записи базы истекают через семь дней без активности и удаляются ежечасной задачей очистки. Организатор может удалить комнату раньше.",
        "Cookie сессии комнаты действует до семи дней. Удаление данных участника или комнаты очищает соответствующий cookie в текущем браузере.",
        "Записи ограничения неудачных входов находятся только в памяти сервера, не сохраняются в базе приложения и очищаются при перезапуске процесса.",
        "Ссылки на комнаты, выбор языка и шаблоны колеса остаются на устройстве, пока вы их не удалите или не очистите. Истёкшие ссылки удаляются при чтении списка.",
        "Срок хранения логов и резервных копий определяется настройками production-хостинга; оператор должен проверить и настроить их до запуска.",
        "Google самостоятельно определяет срок хранения данных запросов, создаваемых при загрузке файлов шрифтов, согласно своим применимым условиям.",
      ],
    },
    {
      title: "6. Ваши права",
      paragraphs: [
        "В случаях, предусмотренных GDPR, вы можете запросить доступ, исправление, удаление, ограничение или переносимость данных, а также возразить против обработки на основании законного интереса. Используйте контакт выше. Вы также можете обратиться в надзорный орган по защите данных по месту жительства, работы или предполагаемого нарушения.",
        "В разделе «Настройки» комнаты можно скачать данные, связанные с текущей ролью участника. Гость может удалить свою роль и предложения, а организатор — всю комнату. Для этих действий нужен действующий cookie сессии комнаты.",
      ],
    },
    {
      title: "7. Обязательные данные и автоматические решения",
      paragraphs: [
        "Отображаемое имя и содержимое, необходимое выбранной функции комнаты, обязательны для её работы. Пароль комнаты, сохранение ссылки и шаблоны колеса необязательны. Без обязательных данных соответствующую комнату нельзя создать или открыть.",
        "Wheel Spin не принимает автоматических решений с юридическими или сопоставимо значимыми последствиями. Случайный результат создаётся только после запуска колеса уполномоченным участником.",
      ],
    },
    {
      title: "8. Изменения",
      paragraphs: [
        "Если обработка данных изменится, политика и дата её действия будут обновлены до начала новой обработки, когда это требуется.",
      ],
    },
  ],
};

const cookiesEn: LegalDocument = {
  eyebrow: "LEGAL",
  title: "Cookie and Browser Storage Policy",
  summary:
    "Wheel Spin currently uses only storage needed for room sessions and features you explicitly request. It does not use analytics or advertising cookies.",
  effectiveDateLabel: "Effective date",
  controllerTitle: "1. Who provides the service",
  contactLabel: "Privacy contact",
  sections: [
    {
      title: "2. Storage we use",
      items: [
        "wheel-spin_session_<room-code> — an HttpOnly, SameSite=Lax cookie containing a random room-session token. It identifies your participant role and permissions. It lasts up to seven days and is marked Secure in production.",
        "wheel-spin-locale — browser local storage containing the language you selected. It remains until you clear device data.",
        "wheel-spin-rooms — browser local storage containing room shortcuts only after you choose “Save room”. Shortcuts remain until you remove or clear them, and expired entries are removed when read.",
        "wheel-spin-templates — browser local storage containing wheel templates you explicitly save. A template remains until you delete it or clear device data.",
      ],
    },
    {
      title: "3. Why there is no consent banner now",
      paragraphs: [
        "The session cookie is necessary to provide the room you asked to use. The local-storage entries are written only after you select a language or explicitly ask to save a room shortcut or template. Wheel Spin currently sets no analytics, advertising, or cross-site tracking storage.",
        "Because the current storage is necessary for, or activated by, an explicitly requested feature, the app does not show a separate cookie-consent banner. If non-essential analytics or other tracking is introduced, it must remain disabled until the required consent is obtained and this policy is updated.",
      ],
    },
    {
      title: "4. Your controls",
      paragraphs: [
        "Use “Clear data on this device” under My rooms to remove Wheel Spin room shortcuts, templates, and language preference. You can also use your browser settings. This does not delete active server-side room data or every HttpOnly session cookie.",
        "Deleting your participant data or deleting the room in Room Settings removes the corresponding server data and clears that room’s session cookie in the current browser.",
      ],
    },
  ],
};

const cookiesRu: LegalDocument = {
  eyebrow: "ПРАВОВАЯ ИНФОРМАЦИЯ",
  title: "Политика cookies и хранилища браузера",
  summary:
    "Сейчас Wheel Spin использует только хранилище для сессий комнаты и функций, которые вы явно запрашиваете. Аналитических и рекламных cookies нет.",
  effectiveDateLabel: "Дата вступления в силу",
  controllerTitle: "1. Кто предоставляет сервис",
  contactLabel: "Контакт по вопросам данных",
  sections: [
    {
      title: "2. Что хранится",
      items: [
        "wheel-spin_session_<код-комнаты> — HttpOnly-cookie SameSite=Lax со случайным токеном сессии. Он определяет роль и права участника, действует до семи дней и в production помечен Secure.",
        "wheel-spin-locale — выбранный язык в localStorage браузера. Хранится до очистки данных устройства.",
        "wheel-spin-rooms — ссылки на комнаты в localStorage, записываемые только после нажатия «Сохранить комнату». Хранятся до удаления или очистки; истёкшие записи удаляются при чтении.",
        "wheel-spin-templates — явно сохранённые шаблоны колеса в localStorage. Шаблон хранится до его удаления или очистки данных устройства.",
      ],
    },
    {
      title: "3. Почему сейчас нет баннера согласия",
      paragraphs: [
        "Cookie сессии необходим для работы запрошенной комнаты. Записи localStorage создаются только после выбора языка или явной команды сохранить ссылку либо шаблон. Wheel Spin не устанавливает хранилище для аналитики, рекламы или межсайтового отслеживания.",
        "Поскольку текущее хранилище необходимо для явно запрошенной функции или активируется самим запросом пользователя, отдельный баннер согласия не показывается. Если появится необязательная аналитика или другое отслеживание, оно должно оставаться выключенным до получения требуемого согласия и обновления этой политики.",
      ],
    },
    {
      title: "4. Как управлять данными",
      paragraphs: [
        "Кнопка «Очистить данные на этом устройстве» в разделе «Мои комнаты» удаляет ссылки, шаблоны и выбор языка. То же можно сделать в настройках браузера. Это не удаляет серверные данные активных комнат и все HttpOnly-cookies сессий.",
        "Удаление данных участника или комнаты в настройках комнаты удаляет соответствующие данные на сервере и очищает cookie этой комнаты в текущем браузере.",
      ],
    },
  ],
};

export function getLegalDocument(
  locale: Locale,
  kind: "privacy" | "cookies",
): LegalDocument {
  if (locale === "ru") return kind === "privacy" ? privacyRu : cookiesRu;
  return kind === "privacy" ? privacyEn : cookiesEn;
}

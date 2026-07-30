import type { Locale } from "@/shared/lib/i18n";

type LegalLink = {
  label: string;
  href: string;
};

type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
  links?: LegalLink[];
};

export type LegalDocument = {
  eyebrow: string;
  title: string;
  summary: string;
  effectiveDateLabel: string;
  controllerTitle: string;
  contactLabel: string;
  controllerFallback: string;
  sections: LegalSection[];
};

const googleLinks: LegalLink[] = [
  {
    label: "How Google uses data from partner sites",
    href: "https://policies.google.com/technologies/partner-sites",
  },
  {
    label: "Google Privacy Policy",
    href: "https://policies.google.com/privacy",
  },
  {
    label: "Google Ads Data Processing Terms",
    href: "https://business.safety.google/adsprocessorterms/",
  },
];

const documents: Record<Locale, { privacy: LegalDocument; cookies: LegalDocument }> = {
  en: {
    privacy: {
      eyebrow: "LEGAL",
      title: "Privacy Policy",
      summary:
        "This policy explains how GatherWheel processes personal data, including optional Google Analytics data.",
      effectiveDateLabel: "Effective date",
      controllerTitle: "1. Controller and contact",
      contactLabel: "Privacy contact",
      controllerFallback:
        "The service operator is the controller. The production operator must publish its legal name and privacy contact here before launch.",
      sections: [
        {
          title: "2. Data we process",
          items: [
            "Room data you provide: display name, room title, wheel options, suggestions, optional password, permissions, timestamps, and shared spin results. Passwords are stored only as one-way Argon2 hashes.",
            "Session and security data: a random room-session token (only its hash is stored in the database), temporary in-memory IP records used to limit failed joins, and operational HTTP logs that the hosting provider may create.",
            "On-device data: language, saved room shortcuts, wheel templates, and your analytics-consent record.",
            "Google Fonts receives the IP address and ordinary HTTP metadata when your browser requests the interface fonts.",
          ],
        },
        {
          title: "3. Optional Google Analytics",
          items: [
            "Google Analytics 4 is not loaded and receives no analytics request until you actively allow analytics. Rejecting analytics does not restrict the service.",
            "After consent, we send normalized page views and the events room_create, room_join, spin_start, and share_room. Room URLs are replaced with /r/:room; query strings, room codes, names, passwords, wheel content, and event parameters are not sent.",
            "Google may process device/browser information, approximate location derived from the connection, IP address during transmission, referrer information, timestamps, and first-party analytics identifiers stored in _ga cookies.",
            "Advertising storage, ad user data, ad personalization, Google Signals, User-ID, and personalized advertising are disabled in our tag configuration.",
          ],
        },
        {
          title: "4. Purposes and legal bases",
          items: [
            "Provide, synchronize, and administer rooms you request — performance of a contract or pre-contract steps (GDPR Article 6(1)(b)).",
            "Prevent abuse, keep the service reliable, and present a consistent interface including fonts — our legitimate interests (Article 6(1)(f)), balanced against user rights.",
            "Measure aggregate visits and feature use to improve GatherWheel — your consent (Article 6(1)(a) and, where applicable, ePrivacy rules). You may withdraw it at any time.",
          ],
        },
        {
          title: "5. Recipients and international transfers",
          items: [
            "People in the same room see display names, room content, and shared results. Suggestions appear without the author's name, but the backend record remains linked to its participant.",
            "Railway processes application, database, and operational data as hosting provider under the production account configuration.",
            "Google receives font requests and, only after analytics consent, GA4 data as our analytics provider. The applicable Google contracting entity and subprocessors may process data outside the EEA.",
            "Where data leaves the EEA, safeguards may include adequacy decisions, the EU-US Data Privacy Framework where applicable, and the European Commission's Standard Contractual Clauses. You may request information about relevant safeguards from us.",
          ],
          links: googleLinks,
        },
        {
          title: "6. Retention",
          items: [
            "Rooms and related database records expire after seven days without activity and are removed by an hourly cleanup; a host may delete a room sooner. Room-session cookies expire after seven days.",
            "Failed-join records remain only in server memory. Hosting logs and backups follow the configured production-provider retention periods.",
            "Saved room shortcuts, language, and templates remain on the device until removed. The consent record expires after 180 days, after which we ask again.",
            "Analytics cookies are configured for no more than 180 days and do not have their expiry extended on later visits. Revoking consent asks the browser to delete GatherWheel's _ga cookies.",
            "GA4 user- and event-level data is intended to be retained for two months. Google may retain aggregated reports or data it must keep for security or legal reasons for longer under its terms.",
          ],
        },
        {
          title: "7. Your choices and rights",
          paragraphs: [
            "Use “Cookie settings” on any page to reject, allow, or withdraw analytics consent as easily as you gave it. Withdrawal does not affect processing that occurred before it.",
            "Depending on the GDPR, you may request access, correction, erasure, restriction, or portability; object to legitimate-interest processing; and withdraw consent. Contact us above. You may complain to the supervisory authority where you live, work, or believe an infringement occurred.",
            "Room Settings lets the current participant download or delete data tied to that room identity; a host can delete the room. For analytics requests, contact us because the application export does not contain Google Analytics data.",
          ],
        },
        {
          title: "8. Required data, security, and automated decisions",
          paragraphs: [
            "A display name and room content needed for a chosen feature are required to provide it; a password, saved shortcut, template, and analytics consent are optional. We use access tokens, hashing, rate limits, restricted cookies, and time-limited storage, but no online service is risk-free.",
            "GatherWheel does not make decisions producing legal or similarly significant effects. The random result occurs only when an authorized participant starts a spin. We do not sell personal data or use it for advertising or profiling.",
          ],
        },
        {
          title: "9. Changes",
          paragraphs: [
            "We will update this notice and its effective date when processing materially changes and request new consent where required.",
          ],
        },
      ],
    },
    cookies: {
      eyebrow: "LEGAL",
      title: "Cookie Policy",
      summary:
        "This policy lists GatherWheel cookies and browser storage, including optional Google Analytics.",
      effectiveDateLabel: "Effective date",
      controllerTitle: "1. Who operates this storage",
      contactLabel: "Privacy contact",
      controllerFallback:
        "The production operator must publish its legal name and privacy contact here before launch.",
      sections: [
        {
          title: "2. Necessary cookies and local storage",
          items: [
            "gatherwheel_session_<room-code> — secure HttpOnly room access token; strictly necessary; expires after seven days.",
            "gatherwheel-locale — language preference; localStorage; remains until changed or cleared.",
            "gatherwheel-rooms and legacy gatherwheel-host-rooms — room shortcuts saved at your request; localStorage; until removed or the room expires.",
            "gatherwheel-templates — wheel templates saved on this device; localStorage; until removed.",
            "gatherwheel-consent-v1 — analytics choice, decision time, and expiry; strictly necessary localStorage; 180 days.",
          ],
        },
        {
          title: "3. Optional analytics cookies",
          items: [
            "_ga — distinguishes a browser for GA4; first-party cookie; no more than 180 days.",
            "_ga_<container-id> — maintains GA4 session state; first-party cookie; no more than 180 days.",
            "Expiry is configured not to refresh on return visits. Google Analytics is not loaded and these cookies are not set before consent.",
          ],
        },
        {
          title: "4. Consent and deletion",
          paragraphs: [
            "The first banner offers equally available Allow and Reject actions. “Manage preferences” gives a separate analytics switch. Your choice does not block access.",
            "Use the persistent “Cookie settings” button to change or withdraw consent. On withdrawal, analytics is disabled and GatherWheel attempts to delete its _ga cookies. Browser controls can also delete cookies and localStorage, but removing necessary storage may sign you out of rooms or erase saved preferences.",
          ],
        },
        {
          title: "5. Third-party requests",
          paragraphs: [
            "Google Analytics requests occur only after consent. Google Fonts requests are currently necessary for interface fonts and can expose your IP address and request metadata to Google even if analytics is rejected; they do not form part of the GA consent.",
          ],
          links: googleLinks,
        },
      ],
    },
  },
  ru: {
    privacy: {
      eyebrow: "ПРАВОВАЯ ИНФОРМАЦИЯ",
      title: "Политика конфиденциальности",
      summary:
        "Эта политика объясняет обработку персональных данных GatherWheel, включая необязательные данные Google Analytics.",
      effectiveDateLabel: "Дата вступления в силу",
      controllerTitle: "1. Контролёр и контакты",
      contactLabel: "Контакт по вопросам данных",
      controllerFallback:
        "Оператор сервиса является контролёром. До запуска production оператор должен указать здесь юридическое имя и контакт по вопросам данных.",
      sections: [
        {
          title: "2. Какие данные мы обрабатываем",
          items: [
            "Данные комнаты: отображаемое имя, название, варианты колеса, предложения, необязательный пароль, права, временные метки и общие результаты. Пароль хранится только как односторонний Argon2-хеш.",
            "Сессия и безопасность: случайный токен комнаты (в базе — только хеш), временные записи IP в памяти для ограничения неудачных входов и возможные технические HTTP-логи хостинга.",
            "На устройстве: язык, сохранённые ссылки на комнаты, шаблоны колеса и запись о согласии на аналитику.",
            "Google Fonts получает IP-адрес и обычные HTTP-метаданные при запросе шрифтов интерфейса.",
          ],
        },
        {
          title: "3. Необязательная Google Analytics",
          items: [
            "GA4 не загружается и не получает аналитических запросов до вашего явного согласия. Отказ не ограничивает сервис.",
            "После согласия отправляются нормализованные просмотры и события room_create, room_join, spin_start и share_room. URL комнаты заменяется на /r/:room; параметры запроса, коды, имена, пароли, содержимое колеса и параметры событий не отправляются.",
            "Google может обработать данные устройства и браузера, приблизительное местоположение, IP при передаче, источник перехода, время и идентификаторы в first-party cookies _ga.",
            "Рекламное хранилище, рекламные пользовательские данные, персонализация рекламы, Google Signals, User-ID и персонализированная реклама отключены.",
          ],
        },
        {
          title: "4. Цели и правовые основания",
          items: [
            "Создание, синхронизация и управление комнатами — исполнение договора или действия до него (статья 6(1)(b) GDPR).",
            "Защита от злоупотреблений, надёжность и единый интерфейс со шрифтами — законные интересы (статья 6(1)(f)) с учётом прав пользователей.",
            "Оценка общей посещаемости и использования функций для улучшения сервиса — ваше согласие (статья 6(1)(a) GDPR и применимые правила ePrivacy). Его можно отозвать в любое время.",
          ],
        },
        {
          title: "5. Получатели и международные передачи",
          items: [
            "Участники комнаты видят имена, содержимое и результаты. Предложение показывается без имени автора, но серверная запись связана с участником.",
            "Railway обрабатывает приложение, базу и технические данные как хостинг-провайдер.",
            "Google получает запросы шрифтов и, только после согласия, данные GA4. Договорная организация Google и субобработчики могут обрабатывать данные за пределами ЕЭЗ.",
            "Для передач из ЕЭЗ могут применяться решения об адекватности, EU-US Data Privacy Framework и Стандартные договорные положения Еврокомиссии. Информацию о гарантиях можно запросить у нас.",
          ],
          links: googleLinks,
        },
        {
          title: "6. Сроки хранения",
          items: [
            "Комнаты и связанные записи удаляются после семи дней без активности ежечасной очисткой; организатор может удалить раньше. Cookie сессии действует семь дней.",
            "Записи неудачных входов существуют только в памяти. Срок логов и резервных копий определяется production-настройками хостинга.",
            "Язык, ссылки и шаблоны остаются на устройстве до удаления. Согласие хранится 180 дней, затем запрашивается снова.",
            "Аналитические cookies ограничены 180 днями без продления при повторных визитах. При отзыве браузеру даётся команда удалить cookies _ga GatherWheel.",
            "Пользовательские данные и данные событий GA4 предполагается хранить два месяца. Агрегированные отчёты и данные, необходимые Google по закону или для безопасности, могут храниться дольше.",
          ],
        },
        {
          title: "7. Ваш выбор и права",
          paragraphs: [
            "Кнопка «Настройки cookies» на любой странице позволяет разрешить, отклонить или отозвать аналитику так же легко, как дать согласие. Отзыв не влияет на прошлую законную обработку.",
            "По GDPR вы можете запросить доступ, исправление, удаление, ограничение и переносимость; возразить против законного интереса; отозвать согласие и подать жалобу надзорному органу по месту жительства, работы или предполагаемого нарушения.",
            "В настройках комнаты текущий участник может скачать или удалить свои данные, а организатор — комнату. По данным аналитики обращайтесь по контакту выше: экспорт комнаты их не содержит.",
          ],
        },
        {
          title: "8. Обязательность, безопасность и автоматические решения",
          paragraphs: [
            "Имя и данные выбранной функции нужны для её работы; пароль, сохранение, шаблоны и аналитика необязательны. Используются токены, хеширование, rate limits, защищённые cookies и ограниченные сроки, но полностью безрисковых онлайн-сервисов не бывает.",
            "GatherWheel не принимает решений с юридическими или сходными существенными последствиями. Случайный результат появляется лишь после запуска уполномоченным участником. Данные не продаются и не используются для рекламы или профилирования.",
          ],
        },
        {
          title: "9. Изменения",
          paragraphs: [
            "При существенном изменении обработки мы обновим текст и дату, а при необходимости запросим новое согласие.",
          ],
        },
      ],
    },
    cookies: {
      eyebrow: "ПРАВОВАЯ ИНФОРМАЦИЯ",
      title: "Политика cookies",
      summary:
        "Здесь перечислены cookies и локальное хранилище GatherWheel, включая необязательную Google Analytics.",
      effectiveDateLabel: "Дата вступления в силу",
      controllerTitle: "1. Кто использует хранилище",
      contactLabel: "Контакт по вопросам данных",
      controllerFallback:
        "До запуска production оператор должен указать здесь юридическое имя и контакт по вопросам данных.",
      sections: [
        {
          title: "2. Необходимые cookies и localStorage",
          items: [
            "gatherwheel_session_<room-code> — защищённый HttpOnly-токен доступа к комнате; строго необходим; семь дней.",
            "gatherwheel-locale — выбор языка; localStorage; до изменения или очистки.",
            "gatherwheel-rooms и legacy gatherwheel-host-rooms — сохранённые по вашему запросу ссылки; localStorage; до удаления или истечения комнаты.",
            "gatherwheel-templates — сохранённые на устройстве шаблоны; localStorage; до удаления.",
            "gatherwheel-consent-v1 — выбор аналитики, время и срок; необходимый localStorage; 180 дней.",
          ],
        },
        {
          title: "3. Необязательные аналитические cookies",
          items: [
            "_ga — отличает браузер для GA4; first-party cookie; не более 180 дней.",
            "_ga_<container-id> — состояние сессии GA4; first-party cookie; не более 180 дней.",
            "Срок не продлевается при новых визитах. GA не загружается и cookies не создаются до согласия.",
          ],
        },
        {
          title: "4. Согласие и удаление",
          paragraphs: [
            "Первый баннер одинаково доступно предлагает разрешить или отклонить аналитику; в настройках есть отдельный переключатель. Выбор не блокирует доступ.",
            "Постоянная кнопка «Настройки cookies» позволяет изменить выбор. При отзыве аналитика отключается и GatherWheel пытается удалить свои _ga cookies. Очистка cookies/localStorage в браузере может завершить сессии комнат и удалить настройки.",
          ],
        },
        {
          title: "5. Сторонние запросы",
          paragraphs: [
            "Запросы GA происходят только после согласия. Google Fonts сейчас необходим для шрифтов и передаёт Google IP и метаданные даже при отказе от аналитики; это не часть согласия GA.",
          ],
          links: googleLinks,
        },
      ],
    },
  },
  uk: {
    privacy: {
      eyebrow: "ПРАВОВА ІНФОРМАЦІЯ",
      title: "Політика конфіденційності",
      summary:
        "Політика пояснює обробку персональних даних GatherWheel, включно з необов’язковими даними Google Analytics.",
      effectiveDateLabel: "Дата набрання чинності",
      controllerTitle: "1. Контролер і контакти",
      contactLabel: "Контакт із питань даних",
      controllerFallback:
        "Оператор сервісу є контролером. До production-запуску він має вказати тут юридичне ім’я та контакт.",
      sections: [
        {
          title: "2. Дані, які ми обробляємо",
          items: [
            "Дані кімнати: відображуване ім’я, назва, варіанти, пропозиції, необов’язковий пароль, права, час і спільні результати. Пароль зберігається лише як Argon2-хеш.",
            "Сесія й безпека: випадковий токен (у базі лише хеш), тимчасові IP-записи в пам’яті проти невдалих входів і можливі HTTP-логи хостингу.",
            "На пристрої: мова, збережені кімнати, шаблони та запис згоди. Google Fonts отримує IP й звичайні HTTP-метадані при запиті шрифтів.",
          ],
        },
        {
          title: "3. Необов’язкова Google Analytics",
          items: [
            "GA4 не завантажується до активної згоди; відмова не обмежує сервіс.",
            "Після згоди надсилаються нормалізовані перегляди та room_create, room_join, spin_start, share_room. URL кімнати стає /r/:room; коди, імена, паролі, вміст і параметри подій не передаються.",
            "Google може обробити дані пристрою/браузера, приблизне місце, IP під час передачі, джерело, час та _ga-ідентифікатори. Рекламні режими, Google Signals, User-ID і персоналізацію вимкнено.",
          ],
        },
        {
          title: "4. Цілі та правові підстави",
          items: [
            "Надання й керування кімнатою — договір (стаття 6(1)(b) GDPR).",
            "Безпека, надійність і послідовний інтерфейс — законний інтерес (6(1)(f)).",
            "Вимірювання відвідувань і функцій — згода (6(1)(a) та правила ePrivacy), яку можна відкликати будь-коли.",
          ],
        },
        {
          title: "5. Одержувачі й міжнародні передачі",
          items: [
            "Учасники бачать імена, вміст і результати; пропозиція без імені все одно пов’язана з учасником у backend.",
            "Railway обробляє дані як хостинг. Google отримує запити шрифтів і після згоди GA4; його субобробники можуть працювати поза ЄЕЗ.",
            "Передачі можуть спиратися на рішення про адекватність, EU-US Data Privacy Framework і Стандартні договірні положення Єврокомісії.",
          ],
          links: googleLinks,
        },
        {
          title: "6. Зберігання",
          items: [
            "Кімнати видаляються після семи днів без активності; cookie сесії — сім днів. Логи та backups залежать від production-хостингу.",
            "Локальні налаштування — до видалення; згода — 180 днів. _ga cookies — до 180 днів без поновлення; при відкликанні їх видалення запитується.",
            "Дані користувачів і подій GA4 передбачено зберігати два місяці; агреговані звіти або законні/безпекові записи Google можуть існувати довше.",
          ],
        },
        {
          title: "7. Ваш вибір і права",
          paragraphs: [
            "«Налаштування cookies» дозволяє відмовити, погодитися або відкликати згоду. Ви можете вимагати доступу, виправлення, видалення, обмеження, перенесення, заперечити проти законного інтересу та поскаржитися наглядовому органу.",
            "Налаштування кімнати дає поточному учаснику експорт/видалення, а організатору — видалення кімнати. Щодо GA звертайтеся до контакту вище.",
          ],
        },
        {
          title: "8. Обов’язковість і автоматичні рішення",
          paragraphs: [
            "Ім’я та потрібний вміст необхідні для функції; пароль, збереження й аналітика — ні. Ми застосовуємо токени, хешування, ліміти та строки. Значущих автоматичних рішень, продажу даних, реклами чи профілювання немає.",
          ],
        },
        {
          title: "9. Зміни",
          paragraphs: [
            "Про суттєві зміни повідомимо й за потреби попросимо нову згоду.",
          ],
        },
      ],
    },
    cookies: {
      eyebrow: "ПРАВОВА ІНФОРМАЦІЯ",
      title: "Політика cookies",
      summary:
        "Перелік cookies і локального сховища GatherWheel, включно з необов’язковою Google Analytics.",
      effectiveDateLabel: "Дата набрання чинності",
      controllerTitle: "1. Хто використовує сховище",
      contactLabel: "Контакт із питань даних",
      controllerFallback:
        "До production-запуску оператор має вказати тут юридичне ім’я та контакт.",
      sections: [
        {
          title: "2. Необхідні cookies і localStorage",
          items: [
            "gatherwheel_session_<room-code> — захищений HttpOnly-токен кімнати; необхідний; 7 днів.",
            "gatherwheel-locale — мова; до зміни/очищення. gatherwheel-rooms і legacy gatherwheel-host-rooms — збережені посилання; до видалення/завершення кімнати.",
            "gatherwheel-templates — шаблони до видалення. gatherwheel-consent-v1 — вибір, час і строк; необхідний; 180 днів.",
          ],
        },
        {
          title: "3. Необов’язкові аналітичні cookies",
          items: [
            "_ga розрізняє браузер; _ga_<container-id> зберігає стан GA4. Обидва first-party, до 180 днів без поновлення.",
            "GA не завантажується і не встановлює їх до згоди.",
          ],
        },
        {
          title: "4. Керування",
          paragraphs: [
            "Банер дає рівні дії дозволити/відхилити, а налаштування — окремий перемикач. Постійна кнопка дозволяє відкликати згоду; GA вимикається, а _ga видаляються. Очищення localStorage може стерти налаштування й збережені кімнати.",
          ],
        },
        {
          title: "5. Сторонні запити",
          paragraphs: [
            "GA-запити — лише після згоди. Google Fonts передає IP і метадані для шрифтів навіть без GA та не входить до аналітичної згоди.",
          ],
          links: googleLinks,
        },
      ],
    },
  },
  de: {
    privacy: {
      eyebrow: "RECHTLICHES",
      title: "Datenschutzerklärung",
      summary:
        "Diese Erklärung beschreibt die Datenverarbeitung durch GatherWheel einschließlich optionaler Google-Analytics-Daten.",
      effectiveDateLabel: "Gültig ab",
      controllerTitle: "1. Verantwortlicher und Kontakt",
      contactLabel: "Datenschutzkontakt",
      controllerFallback:
        "Der Dienstbetreiber ist Verantwortlicher und muss vor dem Produktionsstart Namen und Kontakt veröffentlichen.",
      sections: [
        {
          title: "2. Verarbeitete Daten",
          items: [
            "Raumdaten: Anzeigename, Titel, Optionen, Vorschläge, optionales Passwort, Rechte, Zeitpunkte und Ergebnisse. Passwörter werden nur als Argon2-Hash gespeichert.",
            "Sitzung/Sicherheit: zufälliges Token (in der Datenbank nur der Hash), temporäre IP-Einträge gegen Fehlversuche und mögliche Hosting-HTTP-Logs.",
            "Auf dem Gerät: Sprache, gespeicherte Räume, Vorlagen und Einwilligung. Google Fonts erhält beim Schriftabruf IP-Adresse und übliche HTTP-Metadaten.",
          ],
        },
        {
          title: "3. Optionales Google Analytics",
          items: [
            "GA4 wird erst nach aktiver Einwilligung geladen; Ablehnung schränkt den Dienst nicht ein.",
            "Danach senden wir normalisierte Seitenaufrufe sowie room_create, room_join, spin_start und share_room. Raum-URLs werden /r/:room; Codes, Namen, Passwörter, Radinhalte und Ereignisparameter werden nicht gesendet.",
            "Google kann Geräte-/Browserdaten, ungefähren Ort, IP bei Übertragung, Referrer, Zeit und _ga-Kennungen verarbeiten. Werbespeicher, Google Signals, User-ID und Personalisierung sind deaktiviert.",
          ],
        },
        {
          title: "4. Zwecke und Rechtsgrundlagen",
          items: [
            "Bereitstellung und Verwaltung des Raums — Vertrag (Art. 6 Abs. 1 lit. b DSGVO).",
            "Sicherheit, Zuverlässigkeit und konsistente Darstellung — berechtigtes Interesse (lit. f).",
            "Messung von Besuchen und Funktionen — Einwilligung (lit. a und ePrivacy), jederzeit widerrufbar.",
          ],
        },
        {
          title: "5. Empfänger und Übermittlungen",
          items: [
            "Raumteilnehmer sehen Namen, Inhalte und Ergebnisse; ein namenloser Vorschlag bleibt serverseitig seinem Teilnehmer zugeordnet.",
            "Railway verarbeitet als Hoster. Google erhält Schriftanfragen und nach Einwilligung GA4-Daten; Unterauftragsverarbeiter können außerhalb des EWR sitzen.",
            "Übermittlungen können auf Angemessenheitsbeschlüssen, dem EU-US Data Privacy Framework und EU-Standardvertragsklauseln beruhen.",
          ],
          links: googleLinks,
        },
        {
          title: "6. Speicherdauer",
          items: [
            "Räume werden nach sieben inaktiven Tagen gelöscht; Sitzungscookies gelten sieben Tage. Logs/Backups richten sich nach dem Produktionshosting.",
            "Lokale Daten bleiben bis zur Löschung; Einwilligung 180 Tage. _ga-Cookies höchstens 180 Tage ohne Verlängerung und werden beim Widerruf zu löschen versucht.",
            "GA4-Nutzer- und Ereignisdaten sollen zwei Monate gespeichert werden; aggregierte Berichte sowie gesetzlich/sicherheitsbedingt nötige Google-Daten können länger bestehen.",
          ],
        },
        {
          title: "7. Wahlmöglichkeiten und Rechte",
          paragraphs: [
            "Über „Cookie-Einstellungen“ kann Einwilligung erteilt, abgelehnt oder widerrufen werden. Rechte umfassen Auskunft, Berichtigung, Löschung, Einschränkung, Übertragbarkeit, Widerspruch und Beschwerde bei einer Aufsichtsbehörde.",
            "Raumeinstellungen ermöglichen Export/Löschung der aktuellen Identität; Hosts können den Raum löschen. Für GA-Daten bitte den Kontakt oben nutzen.",
          ],
        },
        {
          title: "8. Pflichtangaben und Automatisierung",
          paragraphs: [
            "Name und benötigter Rauminhalt sind erforderlich; Passwort, Speichern und Analytics sind optional. Tokens, Hashing, Limits und Fristen schützen Daten. Es gibt keine rechtlich erheblichen automatisierten Entscheidungen, keinen Verkauf, Werbung oder Profiling.",
          ],
        },
        {
          title: "9. Änderungen",
          paragraphs: [
            "Bei wesentlichen Änderungen aktualisieren wir Datum und Text und holen nötigenfalls neue Einwilligung ein.",
          ],
        },
      ],
    },
    cookies: {
      eyebrow: "RECHTLICHES",
      title: "Cookie-Richtlinie",
      summary:
        "Cookies und Browserspeicher von GatherWheel einschließlich optionalem Google Analytics.",
      effectiveDateLabel: "Gültig ab",
      controllerTitle: "1. Betreiber",
      contactLabel: "Datenschutzkontakt",
      controllerFallback:
        "Vor Produktionsstart muss der Betreiber Namen und Kontakt veröffentlichen.",
      sections: [
        {
          title: "2. Notwendige Cookies und localStorage",
          items: [
            "gatherwheel_session_<room-code> — sicheres HttpOnly-Raumtoken; notwendig; 7 Tage.",
            "gatherwheel-locale — Sprache bis Änderung/Löschung. gatherwheel-rooms und legacy gatherwheel-host-rooms — gespeicherte Räume bis Löschung/Ablauf.",
            "gatherwheel-templates — Vorlagen bis Löschung. gatherwheel-consent-v1 — Wahl, Zeitpunkt, Ablauf; notwendig; 180 Tage.",
          ],
        },
        {
          title: "3. Optionale Analytics-Cookies",
          items: [
            "_ga unterscheidet Browser; _ga_<container-id> hält GA4-Sitzungsstatus. First-party, höchstens 180 Tage ohne Verlängerung.",
            "GA wird vor Einwilligung weder geladen noch setzt es diese Cookies.",
          ],
        },
        {
          title: "4. Steuerung",
          paragraphs: [
            "Das Banner bietet Erlauben und Ablehnen gleichwertig; Einstellungen enthalten einen separaten Schalter. Die dauerhafte Schaltfläche erlaubt Widerruf, deaktiviert GA und löscht möglichst _ga. Browser-Löschung kann Sitzungen und lokale Einstellungen entfernen.",
          ],
        },
        {
          title: "5. Drittanfragen",
          paragraphs: [
            "GA-Anfragen erfolgen nur nach Einwilligung. Google Fonts übermittelt IP und Metadaten für Schriften auch ohne GA und gehört nicht zur Analytics-Einwilligung.",
          ],
          links: googleLinks,
        },
      ],
    },
  },
  zh: {
    privacy: {
      eyebrow: "法律信息",
      title: "隐私政策",
      summary:
        "本政策说明 GatherWheel 如何处理个人数据，包括可选的 Google Analytics 数据。",
      effectiveDateLabel: "生效日期",
      controllerTitle: "1. 控制者与联系方式",
      contactLabel: "隐私联系方式",
      controllerFallback:
        "服务运营者为数据控制者，上线前必须在此公布法定名称和隐私联系方式。",
      sections: [
        {
          title: "2. 我们处理的数据",
          items: [
            "房间数据：显示名、标题、转盘选项、建议、可选密码、权限、时间和共享结果。密码仅保存为单向 Argon2 哈希。",
            "会话与安全：随机房间令牌（数据库仅存哈希）、用于限制失败登录的临时内存 IP 记录，以及托管方可能生成的 HTTP 日志。",
            "设备数据：语言、已保存房间、模板和分析同意记录。浏览器请求界面字体时，Google Fonts 会收到 IP 和常规 HTTP 元数据。",
          ],
        },
        {
          title: "3. 可选 Google Analytics",
          items: [
            "你主动同意前不会加载 GA4，也不会发送分析请求；拒绝不会限制服务。",
            "同意后仅发送标准化页面浏览及 room_create、room_join、spin_start、share_room。房间路径改为 /r/:room；不发送房间代码、姓名、密码、转盘内容、查询参数或事件参数。",
            "Google 可能处理设备/浏览器、连接时 IP、推断的大致位置、来源、时间及 _ga 标识。广告存储、Google Signals、User-ID 和个性化均已关闭。",
          ],
        },
        {
          title: "4. 目的与法律依据",
          items: [
            "提供和管理房间——履行合同（GDPR 第 6(1)(b) 条）。",
            "防滥用、可靠性和一致界面——合法利益（第 6(1)(f) 条）。",
            "衡量访问和功能以改进服务——你的同意（第 6(1)(a) 条及适用 ePrivacy 规则），可随时撤回。",
          ],
        },
        {
          title: "5. 接收方与跨境传输",
          items: [
            "同房间参与者可见姓名、内容和结果；不显示作者姓名的建议在服务器仍与参与者关联。",
            "Railway 作为托管方处理数据。Google 接收字体请求，并仅在同意后接收 GA4 数据；其分处理者可能位于欧洲经济区外。",
            "跨境保障可包括充分性决定、EU-US Data Privacy Framework 和欧盟标准合同条款。",
          ],
          links: googleLinks,
        },
        {
          title: "6. 保留期限",
          items: [
            "房间闲置七天后删除；会话 cookie 七天。日志和备份期限取决于生产托管设置。",
            "本地设置保留至删除；同意记录 180 天。_ga cookies 最长 180 天且回访不延长；撤回时会尝试删除。",
            "GA4 用户和事件级数据计划保留两个月；汇总报告或 Google 因法律/安全需保留的数据可能更久。",
          ],
        },
        {
          title: "7. 你的选择与权利",
          paragraphs: [
            "任何页面的“Cookie 设置”均可允许、拒绝或撤回。你可依法请求访问、更正、删除、限制、可携带、反对合法利益处理，并向所在地监管机构投诉。",
            "房间设置可导出/删除当前身份数据，主持人可删除房间。分析数据请求请使用上方联系方式。",
          ],
        },
        {
          title: "8. 必要性、安全与自动决定",
          paragraphs: [
            "显示名和功能所需内容为必要；密码、保存和分析均可选。我们采用令牌、哈希、限流和期限。不存在产生法律或类似重大影响的自动决定，也不出售数据、不投放广告或进行画像。",
          ],
        },
        {
          title: "9. 变更",
          paragraphs: ["重大处理变化时会更新文本与日期，并在需要时重新征求同意。"],
        },
      ],
    },
    cookies: {
      eyebrow: "法律信息",
      title: "Cookie 政策",
      summary: "列出 GatherWheel 的 cookies 和浏览器存储，包括可选 Google Analytics。",
      effectiveDateLabel: "生效日期",
      controllerTitle: "1. 运营者",
      contactLabel: "隐私联系方式",
      controllerFallback: "上线前，运营者必须在此公布法定名称和隐私联系方式。",
      sections: [
        {
          title: "2. 必要 cookies 与 localStorage",
          items: [
            "gatherwheel_session_<room-code>——安全 HttpOnly 房间令牌；必要；7 天。",
            "gatherwheel-locale——语言，至更改/清除。gatherwheel-rooms 与旧 gatherwheel-host-rooms——主动保存的房间，至删除/过期。",
            "gatherwheel-templates——模板，至删除。gatherwheel-consent-v1——选择、时间与到期；必要；180 天。",
          ],
        },
        {
          title: "3. 可选分析 cookies",
          items: [
            "_ga 用于区分浏览器；_ga_<container-id> 保存 GA4 会话状态。均为第一方，最长 180 天且回访不延长。",
            "同意前不会加载 GA，也不会设置这些 cookies。",
          ],
        },
        {
          title: "4. 管理与删除",
          paragraphs: [
            "横幅同等提供允许和拒绝，设置中有单独开关。常驻按钮可撤回：GA 会停用并尝试删除 _ga。浏览器清除也可删除，但可能退出房间并清除本地设置。",
          ],
        },
        {
          title: "5. 第三方请求",
          paragraphs: [
            "仅同意后发送 GA 请求。Google Fonts 即使在拒绝 GA 时也会为字体接收 IP 和元数据，不属于分析同意。",
          ],
          links: googleLinks,
        },
      ],
    },
  },
};

export function getLegalDocument(
  locale: Locale,
  kind: "privacy" | "cookies",
): LegalDocument {
  return documents[locale][kind];
}

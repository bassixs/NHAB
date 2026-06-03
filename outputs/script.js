const composer = document.querySelector("#composer");
const authScreen = document.querySelector("#authScreen");
const authForm = document.querySelector("#authForm");
const authLogin = document.querySelector("#authLogin");
const authPassword = document.querySelector("#authPassword");
const authError = document.querySelector("#authError");
const passwordToggle = document.querySelector("#passwordToggle");
const textarea = document.querySelector("#query");
const fileInput = document.querySelector("#fileInput");
const fileList = document.querySelector("#fileList");
const chatFeed = document.querySelector("#chatFeed");
const chatEnd = document.querySelector("#chatEnd");
const searchBox = document.querySelector(".search-box");
const animatedPlaceholder = document.querySelector("#animatedPlaceholder");
const modelSelect = document.querySelector("#modelSelect");
const modelButton = document.querySelector(".model-button");
const selectedModel = document.querySelector("#selectedModel");
const modelMenu = document.querySelector(".model-menu");
let modelOptions = document.querySelectorAll(".model-option");
const formatSelect = document.querySelector("#formatSelect");
const formatButton = document.querySelector(".format-button");
const selectedFormat = document.querySelector("#selectedFormat");
const selectedFormatIcon = document.querySelector("#selectedFormatIcon");
const formatOptions = document.querySelectorAll(".format-option");
const videoSettingsPanel = document.querySelector("#videoSettingsPanel");
const videoSettingsToggle = document.querySelector("#videoSettingsToggle");
const videoSettingsChip = document.querySelector("#videoSettingsChip");
const videoSettingsChipText = document.querySelector("#videoSettingsChipText");
const musicSettingsPanel = document.querySelector("#musicSettingsPanel");
const musicSettingsChip = document.querySelector("#musicSettingsChip");
const musicSettingsChipText = document.querySelector("#musicSettingsChipText");
const topNav = document.querySelector(".top-nav");
const topTabs = document.querySelectorAll(".top-tab");
const chatsPopover = document.querySelector("#chatsPopover");
const chatsTrigger = document.querySelector("#chatsTrigger");
const chatsList = document.querySelector("#chatsList");
const newChatButton = document.querySelector("#newChatButton");
const accountPopover = document.querySelector("#accountPopover");
const accountTrigger = document.querySelector("#accountTrigger");
const accountExit = document.querySelector(".account-exit");
const accountName = document.querySelector("#accountName");
const settingsButton = document.querySelector("#settingsButton");
const settingsPage = document.querySelector("#settingsPage");
const settingsClose = document.querySelector("#settingsClose");
const settingsAccountName = document.querySelector("#settingsAccountName");
const themeChoices = document.querySelectorAll(".theme-choice");
const passwordChangeForm = document.querySelector("#passwordChangeForm");
const oldPassword = document.querySelector("#oldPassword");
const newPassword = document.querySelector("#newPassword");
const repeatPassword = document.querySelector("#repeatPassword");
const passwordMessage = document.querySelector("#passwordMessage");
const deleteDialog = document.querySelector("#deleteDialog");
const deleteCancel = document.querySelector("#deleteCancel");
const deleteConfirm = document.querySelector("#deleteConfirm");
const logoutDialog = document.querySelector("#logoutDialog");
const logoutCancel = document.querySelector("#logoutCancel");
const logoutConfirm = document.querySelector("#logoutConfirm");

let attachedFiles = [];
let currentModel = "Chat GPT";
let currentFormat = "16:9";
let currentVideoMode = "";
let currentVideoMotionSource = "Видео";
let currentVideoDuration = 8;
let currentVideoQuality = "1080p";
let currentMusicMode = "Простой";
let currentMusicInstrumental = false;
let currentMusicTitle = "";
let currentMusicStyles = "";
let currentMusicExcludedStyles = "";
let currentMusicVoice = "Artem Nova";
let currentVoiceGender = "Мужчина";
let currentVoiceAge = "Молодой";
let currentVoiceLanguage = "Русский";
let currentVoiceSearch = "";
let activePresetTarget = "";
let activePage = "gpt";
let placeholderIndex = 0;
let conversationMessages = [];
let chats = [];
let activeChatId = null;
let pendingDeleteChatId = null;
let attachmentUrls = [];

const envUsers = Array.isArray(window.NEUROHAB_ENV?.users) ? window.NEUROHAB_ENV.users : [];
const publicUsers = [
  {
    login: "scarrryllkwx@yandex.ru",
    displayName: "User1",
  },
  {
    login: "bassixs",
    displayName: "bassixs",
  },
];
const demoUsers = publicUsers.map((publicUser) => {
  const envUser = envUsers.find((user) => String(user.login || "").toLowerCase() === publicUser.login.toLowerCase()) || {};

  return {
    ...publicUser,
    displayName: envUser.displayName || publicUser.displayName,
    envPassword: typeof envUser.password === "string" ? envUser.password : "",
  };
});

const authStorageKey = "neurohab.authenticated";
const authUserStorageKey = "neurohab.auth.user";
const passwordStorageKey = "neurohab.password";
const userPasswordStoragePrefix = "neurohab.password.";
const themeStorageKey = "neurohab.theme";
const activePageStorageKey = "neurohab.activePage";
const activeChatStoragePrefix = "neurohab.activeChat.";
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: light)");

const pageConfigs = {
  gpt: {
    storageKey: "neurohab.chats.gpt",
    legacyStorageKey: "neurohab.chats",
    defaultModel: "Chat GPT",
    models: ["Chat GPT", "Gemini", "DeepSeek", "Perplexity"],
    placeholders: ["Что у тебя на уме?", "Что ты хочешь узнать?", "Чем я могу помочь сегодня?"],
  },
  images: {
    storageKey: "neurohab.chats.images",
    defaultModel: "NanoBanana 2",
    models: ["NanoBanana 2", "NanoBanana Pro", "GPT Image 2", "Grok Image"],
    placeholders: ["Готов к новым шедеврам?", "Что сгенеририруем сегодня?", "Творчество - это хорошо"],
  },
  video: {
    storageKey: "neurohab.chats.video",
    defaultModel: "Seedance 2.0",
    defaultDuration: 8,
    defaultQuality: "1080p",
    defaultFormat: "16:9",
    models: ["Seedance 2.0", "Veo 3.1", "Grok Image", "Kling Motion", "Kling 3.0", "HappyHorse"],
    placeholders: ["Что у тебя на уме?", "Что ты хочешь узнать?", "Чем я могу помочь сегодня?"],
  },
  music: {
    storageKey: "neurohab.chats.music",
    defaultModel: "Suno 5.5",
    models: ["Suno 5.5", "ElevenLabs"],
    placeholders: ["Опишите трек или текст", "Какое настроение у музыки?", "Что создадим сегодня?"],
  },
};

const storedActivePage = localStorage.getItem(activePageStorageKey);
if (storedActivePage && pageConfigs[storedActivePage]) {
  activePage = storedActivePage;
}

const getPageConfig = () => pageConfigs[activePage] || pageConfigs.gpt;
const getChatsStorageKey = () => getPageConfig().storageKey;
const getActiveChatStorageKey = (page = activePage) => `${activeChatStoragePrefix}${page}`;

const getModelClass = (model) => `model-${model.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
const getFormatClass = (format) => `format-${format.replace(":", "-")}`;
const escapeHtml = (value) =>
  String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const videoModelSettings = {
  "Seedance 2.0": {
    qualities: ["480p", "720p", "1080p"],
    ratios: ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"],
    duration: { type: "range", min: 4, max: 15, default: 8 },
  },
  "Kling 3.0": {
    modes: ["Text to Video", "Image to Video", "Keyframes", "Elements"],
    qualities: ["720p", "1080p", "4K"],
    ratios: ["1:1", "16:9", "9:16"],
    duration: { type: "range", min: 3, max: 15, default: 5 },
  },
  "Kling Motion": {
    motionSources: ["Видео", "Картинка"],
    qualities: ["720p", "1080p"],
    duration: {
      type: "note",
      text: "Длительность вашего референса должна быть от 3 до 15 секунд.",
    },
  },
  "Grok Image": {
    modes: ["Text to Video", "Image to Video"],
    qualities: ["480p", "720p"],
    duration: { type: "fixed", values: [6, 10], default: 6 },
  },
  "Veo 3.1": {
    modes: ["Text to Video", "Image to Video"],
    qualities: ["720p", "1080p", "4K"],
    ratios: ["9:16", "16:9"],
  },
  HappyHorse: {
    modes: ["Text to Video", "First Frame to Video", "Reference to Video", "Video Edit"],
    qualities: ["720p", "1080p"],
    ratios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    ratioModes: ["Text to Video", "Reference to Video"],
    duration: { type: "range", min: 3, max: 15, default: 5, excludedModes: ["Video Edit"] },
  },
};

const musicArtistPresets = [
  "Drake - HipHop, Trap, Male Vocals",
  "The Weeknd - R&B, Synthpop, Male Vocals",
  "Billie Eilish - Alt Pop, Whisper Vocals, Dark",
  "Taylor Swift - Pop, Country Pop, Female Vocals",
  "Kendrick Lamar - Rap, Conscious HipHop, Male Vocals",
  "Dua Lipa - Dance Pop, Disco, Female Vocals",
  "Travis Scott - Trap, Psychedelic, Male Vocals",
  "Ariana Grande - Pop, R&B, Female Vocals",
  "Post Malone - Pop Rap, Melodic, Male Vocals",
  "Lana Del Rey - Cinematic Pop, Dreamy, Female Vocals",
  "Bad Bunny - Reggaeton, Latin Trap, Male Vocals",
  "SZA - Neo Soul, R&B, Female Vocals",
  "Ed Sheeran - Acoustic Pop, Male Vocals",
  "Doja Cat - Pop Rap, Dance, Female Vocals",
  "Bruno Mars - Funk, Pop Soul, Male Vocals",
  "Rosalia - Flamenco Pop, Latin, Female Vocals",
  "Imagine Dragons - Arena Rock, Alternative",
  "Daft Punk - Electronic, French House",
  "Beyonce - R&B, Pop, Female Vocals",
  "Eminem - Rap, Fast Flow, Male Vocals",
];

const musicVoiceGroups = [
  { gender: "Мужчина", age: "Молодой", language: "Русский", names: ["Artem Nova", "Nikita Soft", "Daniil Clear", "Ilya Pulse", "Roman Light"] },
  { gender: "Мужчина", age: "Среднего Возраста", language: "Русский", names: ["Mikhail Prime", "Sergey Deep", "Anton Calm", "Pavel Studio", "Kirill Warm"] },
  { gender: "Мужчина", age: "Старый", language: "Русский", names: ["Viktor Classic", "Boris Velvet", "Leonid Wise", "Yuriy Granite", "Oleg Archive"] },
  { gender: "Женщина", age: "Молодой", language: "Русский", names: ["Alina Air", "Sofia Glow", "Mira Soft", "Kira Bloom", "Vera Spark"] },
  { gender: "Женщина", age: "Среднего Возраста", language: "Русский", names: ["Elena Studio", "Marina Calm", "Irina Velvet", "Natalia Prime", "Olga Clear"] },
  { gender: "Женщина", age: "Старый", language: "Русский", names: ["Nina Classic", "Galina Warm", "Tamara Wise", "Raisa Silver", "Lyudmila Soft"] },
  { gender: "Мужчина", age: "Молодой", language: "Английский", names: ["Ethan Bright", "Noah Pulse", "Liam Clear", "Mason Air", "Logan Studio"] },
  { gender: "Мужчина", age: "Среднего Возраста", language: "Английский", names: ["James Prime", "Daniel Warm", "Thomas Deep", "Henry Calm", "Oliver Slate"] },
  { gender: "Мужчина", age: "Старый", language: "Английский", names: ["Arthur Classic", "George Wise", "Edward Velvet", "Walter Archive", "Richard Stone"] },
  { gender: "Женщина", age: "Молодой", language: "Английский", names: ["Olivia Glow", "Emma Air", "Ava Bloom", "Mia Spark", "Chloe Light"] },
  { gender: "Женщина", age: "Среднего Возраста", language: "Английский", names: ["Grace Studio", "Sophia Prime", "Emily Warm", "Hannah Clear", "Victoria Calm"] },
  { gender: "Женщина", age: "Старый", language: "Английский", names: ["Margaret Classic", "Eleanor Wise", "Diana Velvet", "Rose Silver", "Helen Archive"] },
  { gender: "Мужчина", age: "Молодой", language: "Польский", names: ["Jakub Bright", "Kamil Pulse", "Mateusz Clear", "Adam Air", "Filip Light"] },
  { gender: "Мужчина", age: "Среднего Возраста", language: "Польский", names: ["Tomasz Prime", "Piotr Deep", "Marek Warm", "Pawel Studio", "Michal Calm"] },
  { gender: "Мужчина", age: "Старый", language: "Польский", names: ["Henryk Classic", "Jan Wise", "Witold Velvet", "Kazimierz Stone", "Stanislaw Archive"] },
  { gender: "Женщина", age: "Молодой", language: "Польский", names: ["Zofia Glow", "Maja Air", "Alicja Bloom", "Julia Spark", "Natalia Light"] },
  { gender: "Женщина", age: "Среднего Возраста", language: "Польский", names: ["Ewa Studio", "Anna Prime", "Katarzyna Warm", "Magda Clear", "Monika Calm"] },
  { gender: "Женщина", age: "Старый", language: "Польский", names: ["Irena Classic", "Barbara Wise", "Krystyna Velvet", "Helena Silver", "Teresa Archive"] },
];

const musicVoices = musicVoiceGroups.flatMap((group) =>
  group.names.map((name) => ({
    name,
    gender: group.gender,
    age: group.age,
    language: group.language,
  }))
);

const getPlaceholders = () => {
  if (activePage === "video") {
    return ["Опишите сцену для видео", "Что оживим сегодня?", "Какой ролик создадим?"];
  }

  if (activePage === "music") {
    if (currentModel === "ElevenLabs" && currentMusicMode === "Voice Changer") {
      return ["Прикрепите файл для изменения голоса", "В этом режиме доступна только загрузка файлов", "Добавьте аудио или видео"];
    }

    return currentModel === "ElevenLabs"
      ? ["Введите текст для озвучки", "Что должен сказать голос?", "Добавьте реплику"]
      : ["Опишите музыку или текст", "Какое настроение у трека?", "Что создадим сегодня?"];
  }

  return getPageConfig().placeholders;
};

const getUserByLogin = (login) => demoUsers.find((user) => user.login.toLowerCase() === String(login || "").toLowerCase());
const getActiveUser = () => getUserByLogin(localStorage.getItem(authUserStorageKey)) || demoUsers[0];
const getUserPasswordStorageKey = (login) => `${userPasswordStoragePrefix}${login}`;
const getStoredPassword = (login = getActiveUser().login) => {
  const user = getUserByLogin(login) || demoUsers[0];
  const storedUserPassword = localStorage.getItem(getUserPasswordStorageKey(user.login));

  if (storedUserPassword) {
    return storedUserPassword;
  }

  if (user.login === demoUsers[0].login) {
    return localStorage.getItem(passwordStorageKey) || user.envPassword;
  }

  return user.envPassword;
};

const setStoredPassword = (login, password) => {
  const user = getUserByLogin(login);
  const expectedPassword = user ? getStoredPassword(user.login) : "";

  if (!user) {
    return;
  }

  localStorage.setItem(getUserPasswordStorageKey(user.login), password);

  if (user.login === demoUsers[0].login) {
    localStorage.setItem(passwordStorageKey, password);
  }
};

const syncAccountIdentity = () => {
  const user = getActiveUser();

  accountName.textContent = user.displayName;
  settingsAccountName.textContent = `Аккаунт ${user.displayName}`;
};

const getEffectiveTheme = (choice) => {
  if (choice === "system") {
    return systemThemeQuery.matches ? "light" : "dark";
  }

  return choice;
};

const applyTheme = (choice) => {
  const themeChoice = choice || localStorage.getItem(themeStorageKey) || "system";
  const effectiveTheme = getEffectiveTheme(themeChoice);
  document.body.dataset.theme = effectiveTheme;
  document.body.dataset.themeChoice = themeChoice;

  themeChoices.forEach((button) => {
    const isSelected = button.dataset.themeChoice === themeChoice;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-checked", String(isSelected));
  });
};

const openSettingsPage = () => {
  closeAccountPopover();
  settingsPage.classList.add("is-open");
  settingsPage.setAttribute("aria-hidden", "false");
};

const closeSettingsPage = () => {
  settingsPage.classList.remove("is-open");
  settingsPage.setAttribute("aria-hidden", "true");
};

const unlockApp = ({ animate = true } = {}) => {
  if (!animate) {
    document.body.classList.remove("auth-lock");
    authScreen.remove();
    return;
  }

  authScreen.classList.add("is-unlocking");
  window.setTimeout(() => {
    document.body.classList.remove("auth-lock");
  }, 620);
};

passwordToggle.addEventListener("click", () => {
  const isVisible = authPassword.type === "text";
  authPassword.type = isVisible ? "password" : "text";
  passwordToggle.classList.toggle("is-visible", !isVisible);
  passwordToggle.setAttribute("aria-label", isVisible ? "Показать пароль" : "Скрыть пароль");
});

authForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const login = authLogin.value.trim();
  const password = authPassword.value;
  const user = getUserByLogin(login);

  if (!user || !expectedPassword || password !== expectedPassword) {
    console.warn("NeuroHAB auth failed", { login });
    authError.textContent = "Неверный логин или пароль.";
    return;
  }

  authError.textContent = "";
  localStorage.setItem(authStorageKey, "true");
  localStorage.setItem(authUserStorageKey, user.login);
  syncAccountIdentity();
  console.info("NeuroHAB auth success", { login: user.login, displayName: user.displayName });
  unlockApp();
});

const syncTopIndicator = () => {
  const activeTab = document.querySelector(".top-tab.is-active");

  if (!activeTab) {
    return;
  }

  topNav.style.setProperty("--indicator-left", `${activeTab.offsetLeft}px`);
  topNav.style.setProperty("--indicator-width", `${activeTab.offsetWidth}px`);
};

const loadChats = () => {
  try {
    const config = getPageConfig();
    const storedChats = localStorage.getItem(config.storageKey) || localStorage.getItem(config.legacyStorageKey);
    chats = JSON.parse(storedChats) || [];
  } catch {
    chats = [];
  }
};

const saveChats = () => {
  localStorage.setItem(getChatsStorageKey(), JSON.stringify(chats));
};

const saveActivePage = () => {
  localStorage.setItem(activePageStorageKey, activePage);
};

const saveActiveChatId = () => {
  if (activeChatId) {
    localStorage.setItem(getActiveChatStorageKey(), activeChatId);
  } else {
    localStorage.removeItem(getActiveChatStorageKey());
  }
};

const restoreActiveChat = () => {
  const storedChatId = localStorage.getItem(getActiveChatStorageKey());

  if (storedChatId && chats.some((chat) => chat.id === storedChatId)) {
    loadChat(storedChatId);
    return true;
  }

  activeChatId = null;
  conversationMessages = [];
  document.body.classList.remove("chat-started");
  clearChatFeed();
  renderChatsList();
  localStorage.removeItem(getActiveChatStorageKey());
  return false;
};

const createChatId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createChatTitle = (query) => {
  const words = query.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return words.join(" ") || "Новый чат";
};

const getActiveChat = () => chats.find((chat) => chat.id === activeChatId);

const setCurrentModel = (model) => {
  currentModel = model;
  selectedModel.textContent = currentModel;
  modelSelect.dataset.model = getModelClass(currentModel);

  modelOptions.forEach((item) => {
    const isSelected = item.dataset.model === currentModel;
    item.dataset.modelClass = getModelClass(item.dataset.model);
    item.classList.toggle("is-selected", isSelected);
    item.setAttribute("aria-selected", String(isSelected));
  });
};

const setCurrentFormat = (format) => {
  currentFormat = format;
  selectedFormat.textContent = currentFormat;
  selectedFormatIcon.className = `format-icon ${getFormatClass(currentFormat)}`;

  formatOptions.forEach((item) => {
    const isSelected = item.dataset.format === currentFormat;
    item.classList.toggle("is-selected", isSelected);
    item.setAttribute("aria-selected", String(isSelected));
  });
};

const getVideoSettings = () => ({
  mode: currentVideoMode,
  motionSource: currentVideoMotionSource,
  duration: currentVideoDuration,
  quality: currentVideoQuality,
  format: currentFormat,
});

const getCurrentVideoConfig = () => videoModelSettings[currentModel] || videoModelSettings["Seedance 2.0"];
const getCurrentVideoMode = (config = getCurrentVideoConfig()) => (config.modes ? currentVideoMode : "");
const isVideoRatioAvailable = (config = getCurrentVideoConfig()) =>
  Boolean(config.ratios && (!config.ratioModes || config.ratioModes.includes(getCurrentVideoMode(config))));
const isVideoDurationAvailable = (config = getCurrentVideoConfig()) =>
  Boolean(config.duration && (!config.duration.excludedModes || !config.duration.excludedModes.includes(getCurrentVideoMode(config))));

const getVideoSummaryText = () => {
  const config = getCurrentVideoConfig();
  const parts = [currentModel];

  if (currentVideoMode) {
    parts.push(currentVideoMode);
  }

  if (config.motionSources) {
    parts.push(currentVideoMotionSource);
  }

  if (currentVideoQuality) {
    parts.push(currentVideoQuality);
  }

  if (isVideoRatioAvailable(config) && currentFormat) {
    parts.push(currentFormat);
  }

  if (isVideoDurationAvailable(config) && config.duration?.type !== "note" && currentVideoDuration) {
    parts.push(`${currentVideoDuration} секунд`);
  }

  return parts.join(" · ");
};

const updateVideoDurationPreview = () => {
  const config = getCurrentVideoConfig();
  const summaryText = getVideoSummaryText();
  videoSettingsChipText.textContent = summaryText;
  const panelSummary = videoSettingsPanel.querySelector("#videoSettingsSummary");
  const durationValue = videoSettingsPanel.querySelector("[data-video-duration-value]");

  if (panelSummary) {
    panelSummary.textContent = summaryText;
  }

  if (durationValue && config.duration?.type === "range") {
    durationValue.textContent = `${currentVideoDuration} секунд`;
  }
};

const normalizeVideoSettings = ({ keepMode = true } = {}) => {
  const config = getCurrentVideoConfig();

  if (config.modes) {
    if (!keepMode || !config.modes.includes(currentVideoMode)) {
      currentVideoMode = config.modes[0];
    }
  } else {
    currentVideoMode = "";
  }

  if (config.motionSources && !config.motionSources.includes(currentVideoMotionSource)) {
    currentVideoMotionSource = config.motionSources[0];
  }

  if (config.qualities?.length && !config.qualities.includes(currentVideoQuality)) {
    currentVideoQuality = config.qualities[0];
  }

  if (isVideoRatioAvailable(config) && config.ratios?.length && !config.ratios.includes(currentFormat)) {
    setCurrentFormat(config.ratios[0]);
  }

  if (isVideoDurationAvailable(config) && config.duration) {
    if (config.duration.type === "range") {
      const min = config.duration.min;
      const max = config.duration.max;
      const fallback = config.duration.default || min;
      currentVideoDuration = Math.min(max, Math.max(min, Number(currentVideoDuration) || fallback));
    }

    if (config.duration.type === "fixed") {
      const values = config.duration.values || [];
      if (!values.includes(Number(currentVideoDuration))) {
        currentVideoDuration = config.duration.default || values[0];
      }
    }
  }
};

const createVideoSelect = (label, value, options, key) => `
  <div class="video-select-field">
    <span>${label}</span>
    <button class="video-select-button" type="button" data-video-select-trigger="${key}" aria-expanded="false">
      <span>${value}</span>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m7 10 5 5 5-5"></path>
      </svg>
    </button>
    <div class="video-select-menu" data-video-select-menu="${key}">
      ${options
        .map(
          (option) =>
            `<button class="video-select-option${option === value ? " is-selected" : ""}" type="button" data-video-select-value="${option}" aria-selected="${option === value}">${option}</button>`
        )
        .join("")}
    </div>
  </div>
`;

const createVideoChoiceButtons = (label, values, current, dataKey) => `
  <div class="video-settings-section">
    <span class="video-settings-label">${label}</span>
    <div class="video-choice-row">
      ${values
        .map(
          (value) =>
            `<button class="video-choice${value === current ? " is-selected" : ""}" type="button" data-${dataKey}="${value}" aria-pressed="${value === current}">${value}</button>`
        )
        .join("")}
    </div>
  </div>
`;

const renderVideoSettingsPanel = () => {
  const shouldAnimate = videoSettingsPanel.classList.contains("is-open") && videoSettingsPanel.children.length > 0;
  const previousHeight = shouldAnimate ? videoSettingsPanel.getBoundingClientRect().height : 0;

  if (shouldAnimate) {
    videoSettingsPanel.style.height = `${previousHeight}px`;
  }

  normalizeVideoSettings();
  const config = getCurrentVideoConfig();
  const summaryText = getVideoSummaryText();

  videoSettingsPanel.innerHTML = `
    <div class="video-settings-head">
      <span>Настройки видео</span>
      <span id="videoSettingsSummary">${summaryText}</span>
    </div>

    <div class="video-settings-selects">
      ${createVideoSelect("Модель", currentModel, pageConfigs.video.models, "model")}
      ${config.modes ? createVideoSelect("Режим", currentVideoMode, config.modes, "mode") : ""}
    </div>

    ${config.motionSources ? createVideoChoiceButtons("Ориентация движения соответствует", config.motionSources, currentVideoMotionSource, "motion-source") : ""}
    ${config.qualities ? createVideoChoiceButtons("Качество", config.qualities, currentVideoQuality, "quality") : ""}
    ${isVideoRatioAvailable(config) ? createVideoChoiceButtons("Соотношение сторон", config.ratios, currentFormat, "format") : ""}
    ${
      isVideoDurationAvailable(config) && config.duration?.type === "range"
        ? `<div class="video-settings-section">
            <div class="video-settings-label-row">
              <span class="video-settings-label">Длительность</span>
              <strong data-video-duration-value>${currentVideoDuration} секунд</strong>
            </div>
            <input class="video-duration-slider" type="range" min="${config.duration.min}" max="${config.duration.max}" step="1" value="${currentVideoDuration}" data-video-duration />
          </div>`
        : ""
    }
    ${
      isVideoDurationAvailable(config) && config.duration?.type === "fixed"
        ? createVideoChoiceButtons("Длительность", config.duration.values.map(String), String(currentVideoDuration), "duration")
        : ""
    }
    ${
      isVideoDurationAvailable(config) && config.duration?.type === "note"
        ? `<div class="video-settings-note">${config.duration.text}</div>`
        : ""
    }
  `;

  videoSettingsChipText.textContent = summaryText;

  if (shouldAnimate) {
    const nextHeight = videoSettingsPanel.scrollHeight;
    videoSettingsPanel.style.height = `${previousHeight}px`;
    videoSettingsPanel.offsetHeight;
    videoSettingsPanel.style.height = `${nextHeight}px`;

    window.setTimeout(() => {
      if (videoSettingsPanel.classList.contains("is-open")) {
        videoSettingsPanel.style.height = "";
      }
    }, 240);
  }
};

const syncVideoSettingsSummary = () => {
  renderVideoSettingsPanel();
};

const setVideoSettings = ({ model, mode, motionSource, duration, quality, format } = {}) => {
  if (model) {
    setCurrentModel(model);
    const nextConfig = getCurrentVideoConfig();
    currentVideoQuality = nextConfig.qualities?.[0] || "";
    currentVideoDuration = nextConfig.duration?.default || nextConfig.duration?.values?.[0] || "";
    if (nextConfig.ratios?.[0]) {
      setCurrentFormat(nextConfig.ratios[0]);
    }
    normalizeVideoSettings({ keepMode: false });
  }

  if (mode) {
    currentVideoMode = mode;
    normalizeVideoSettings({ keepMode: true });
  }

  if (motionSource) {
    currentVideoMotionSource = motionSource;
  }

  if (duration !== undefined) {
    currentVideoDuration = Number(duration);
  }

  if (quality) {
    currentVideoQuality = quality;
  }

  if (format) {
    setCurrentFormat(format);
  }

  normalizeVideoSettings();
  renderVideoSettingsPanel();
};

const resetVideoSettings = () => {
  const config = pageConfigs.video;
  setVideoSettings({
    model: config.defaultModel,
    mode: "",
    motionSource: "Видео",
    duration: config.defaultDuration,
    quality: config.defaultQuality,
    format: config.defaultFormat,
  });
};

const getMusicSettings = () => ({
  mode: currentMusicMode,
  instrumental: currentMusicInstrumental,
  title: currentMusicTitle,
  styles: currentMusicStyles,
  excludedStyles: currentMusicExcludedStyles,
  voice: currentMusicVoice,
  voiceGender: currentVoiceGender,
  voiceAge: currentVoiceAge,
  voiceLanguage: currentVoiceLanguage,
});

const getMusicSummaryText = () => {
  if (currentModel === "ElevenLabs") {
    return `ElevenLabs · ${currentMusicMode} · ${currentMusicVoice}`;
  }

  const parts = ["Suno 5.5", currentMusicMode];
  if (currentMusicMode === "Простой" && currentMusicInstrumental) {
    parts.push("Инструментал");
  }
  return parts.join(" · ");
};

const normalizeMusicSettings = () => {
  if (currentModel === "ElevenLabs") {
    if (!["Dialogue/Speech", "Voice Changer"].includes(currentMusicMode)) {
      currentMusicMode = "Dialogue/Speech";
    }
  } else {
    if (!["Простой", "Свой"].includes(currentMusicMode)) {
      currentMusicMode = "Простой";
    }
  }

  const voiceExists = musicVoices.some((voice) => voice.name === currentMusicVoice);
  if (!voiceExists) {
    currentMusicVoice = musicVoices[0].name;
  }
};

const getFilteredVoices = () => {
  const search = currentVoiceSearch.trim().toLowerCase();

  return musicVoices.filter((voice) => {
    const matchesSearch = !search || voice.name.toLowerCase().includes(search);
    return (
      matchesSearch &&
      voice.gender === currentVoiceGender &&
      voice.age === currentVoiceAge &&
      voice.language === currentVoiceLanguage
    );
  });
};

const createPresetButton = (target) => `
  <button class="music-presets-button" type="button" data-music-presets="${target}">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 7h14M7 12h10M9 17h6"></path>
      <path d="M4 4h16v16H4z"></path>
    </svg>
    <span>Пресеты</span>
  </button>
`;

const createMusicPresetList = (target) => `
  <div class="music-presets-list" data-preset-list="${target}">
    ${musicArtistPresets
      .map(
        (preset) =>
          `<button class="music-preset-option" type="button" data-preset-target="${target}" data-preset-value="${preset}">${preset}</button>`
      )
      .join("")}
  </div>
`;

const createMusicModeButtons = (values) => `
  <div class="video-choice-row music-mode-row">
    ${values
      .map(
        (value) =>
          `<button class="video-choice music-mode-choice${value === currentMusicMode ? " is-selected" : ""}" type="button" data-music-mode="${value}" aria-pressed="${value === currentMusicMode}">${value}</button>`
      )
      .join("")}
  </div>
`;

const createSunoSettings = () => `
  <div class="video-settings-section">
    <span class="video-settings-label">Режим</span>
    ${createMusicModeButtons(["Простой", "Свой"])}
  </div>

  ${
    currentMusicMode === "Простой"
      ? `<div class="music-toggle-row">
          <span>Инструментал</span>
          <button class="music-toggle${currentMusicInstrumental ? " is-on" : ""}" type="button" data-music-instrumental aria-pressed="${currentMusicInstrumental}">
            <i></i>
          </button>
        </div>`
      : `<div class="music-field-grid">
          <label class="music-field">
            <span>Заголовок песни</span>
            <input class="music-text-input" type="text" value="${escapeHtml(currentMusicTitle)}" data-music-title />
          </label>

          <label class="music-field">
            <span>Стили</span>
            <textarea class="music-textarea" rows="4" data-music-styles>${escapeHtml(currentMusicStyles)}</textarea>
          </label>
          ${createPresetButton("styles")}
          ${activePresetTarget === "styles" ? createMusicPresetList("styles") : ""}

          <label class="music-field">
            <span>Исключенные стили</span>
            <textarea class="music-textarea" rows="4" data-music-excluded>${escapeHtml(currentMusicExcludedStyles)}</textarea>
          </label>
          ${createPresetButton("excluded")}
          ${activePresetTarget === "excluded" ? createMusicPresetList("excluded") : ""}
        </div>`
  }
`;

const createVoiceSettings = () => {
  const voices = getFilteredVoices();

  return `
    <div class="video-settings-section">
      <span class="video-settings-label">Режим</span>
      ${createMusicModeButtons(["Dialogue/Speech", "Voice Changer"])}
    </div>

    <div class="music-voice-panel">
      <div class="music-voice-head">
        <label class="music-voice-search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m21 21-4.35-4.35"></path>
            <circle cx="11" cy="11" r="7"></circle>
          </svg>
          <input type="search" value="${escapeHtml(currentVoiceSearch)}" placeholder="Поиск голоса" data-voice-search />
        </label>
      </div>

      <div class="video-settings-selects music-voice-filters">
        ${createVideoSelect("Пол", currentVoiceGender, ["Мужчина", "Женщина"], "voice-gender")}
        ${createVideoSelect("Возраст", currentVoiceAge, ["Молодой", "Среднего Возраста", "Старый"], "voice-age")}
        ${createVideoSelect("Язык", currentVoiceLanguage, ["Русский", "Английский", "Польский"], "voice-language")}
      </div>

      ${
        voices.length > 0
          ? `<div class="music-voice-select">${createVideoSelect("Голос", currentMusicVoice, voices.map((voice) => voice.name), "voice-name")}</div>`
          : `<div class="music-empty">Голосов по таким фильтрам пока нет.</div>`
      }
    </div>

    ${
      currentMusicMode === "Voice Changer"
        ? `<div class="video-settings-note">В режиме Voice Changer строка ввода отключена. Можно только прикрепить аудио, видео или другой файл.</div>`
        : ""
    }
  `;
};

const renderMusicSettingsPanel = () => {
  const shouldAnimate = musicSettingsPanel.classList.contains("is-open") && musicSettingsPanel.children.length > 0;
  const previousHeight = shouldAnimate ? musicSettingsPanel.getBoundingClientRect().height : 0;

  if (shouldAnimate) {
    musicSettingsPanel.style.height = `${previousHeight}px`;
  }

  normalizeMusicSettings();
  const summaryText = getMusicSummaryText();

  musicSettingsPanel.innerHTML = `
    <div class="video-settings-head">
      <span>Настройки музыки</span>
      <span>${summaryText}</span>
    </div>

    <div class="video-settings-selects music-model-selects">
      ${createVideoSelect("Модель", currentModel, pageConfigs.music.models, "music-model")}
    </div>

    ${currentModel === "ElevenLabs" ? createVoiceSettings() : createSunoSettings()}
  `;

  musicSettingsChipText.textContent = summaryText;

  if (shouldAnimate) {
    const nextHeight = musicSettingsPanel.scrollHeight;
    musicSettingsPanel.style.height = `${previousHeight}px`;
    musicSettingsPanel.offsetHeight;
    musicSettingsPanel.style.height = `${nextHeight}px`;

    window.setTimeout(() => {
      if (musicSettingsPanel.classList.contains("is-open")) {
        musicSettingsPanel.style.height = "";
      }
    }, 240);
  }
};

const syncMusicComposerAvailability = () => {
  const isVoiceChanger = activePage === "music" && currentModel === "ElevenLabs" && currentMusicMode === "Voice Changer";
  textarea.disabled = isVoiceChanger;
  searchBox.classList.toggle("is-input-disabled", isVoiceChanger);

  if (isVoiceChanger) {
    textarea.value = "";
  }

  animatedPlaceholder.textContent = getPlaceholders()[placeholderIndex] || getPlaceholders()[0];
  resizeTextarea();
  syncPlaceholderVisibility();
};

const setMusicSettings = ({
  model,
  mode,
  instrumental,
  title,
  styles,
  excludedStyles,
  voice,
  voiceGender,
  voiceAge,
  voiceLanguage,
  voiceSearch,
} = {}) => {
  if (model) {
    setCurrentModel(model);
    currentMusicMode = model === "ElevenLabs" ? "Dialogue/Speech" : "Простой";
    activePresetTarget = "";
  }

  if (mode) {
    currentMusicMode = mode;
    activePresetTarget = "";
  }

  if (instrumental !== undefined) {
    currentMusicInstrumental = Boolean(instrumental);
  }

  if (title !== undefined) {
    currentMusicTitle = title;
  }

  if (styles !== undefined) {
    currentMusicStyles = styles;
  }

  if (excludedStyles !== undefined) {
    currentMusicExcludedStyles = excludedStyles;
  }

  if (voiceGender) {
    currentVoiceGender = voiceGender;
  }

  if (voiceAge) {
    currentVoiceAge = voiceAge;
  }

  if (voiceLanguage) {
    currentVoiceLanguage = voiceLanguage;
  }

  if (voiceSearch !== undefined) {
    currentVoiceSearch = voiceSearch;
  }

  if (voice) {
    currentMusicVoice = voice;
  }

  normalizeMusicSettings();
  const availableVoices = getFilteredVoices();
  if (currentModel === "ElevenLabs" && availableVoices.length > 0 && !availableVoices.some((item) => item.name === currentMusicVoice)) {
    currentMusicVoice = availableVoices[0].name;
  }

  renderMusicSettingsPanel();
  syncMusicComposerAvailability();
};

const resetMusicSettings = () => {
  setMusicSettings({
    model: pageConfigs.music.defaultModel,
    mode: "Простой",
    instrumental: false,
    title: "",
    styles: "",
    excludedStyles: "",
    voice: "Artem Nova",
    voiceGender: "Мужчина",
    voiceAge: "Молодой",
    voiceLanguage: "Русский",
    voiceSearch: "",
  });
};

const renderModelOptions = () => {
  modelMenu.innerHTML = "";

  getPageConfig().models.forEach((model, index) => {
    const option = document.createElement("button");
    option.className = `model-option${index === 0 ? " is-selected" : ""}`;
    option.type = "button";
    option.role = "option";
    option.dataset.model = model;
    option.dataset.modelClass = getModelClass(model);
    option.setAttribute("aria-selected", String(index === 0));
    option.textContent = model;
    modelMenu.append(option);
  });

  modelOptions = document.querySelectorAll(".model-option");
  setCurrentModel(getPageConfig().defaultModel);
  if (activePage === "video") {
    resetVideoSettings();
  }
  if (activePage === "music") {
    resetMusicSettings();
  }
};

const syncActiveTopTab = () => {
  topTabs.forEach((tab) => {
    tab.classList.toggle("is-active", (tab.dataset.page || "gpt") === activePage);
  });
};

const resizeTextarea = () => {
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
};

const syncPlaceholderVisibility = () => {
  searchBox.classList.toggle("has-text", textarea.value.length > 0);
};

const renderFiles = () => {
  attachmentUrls.forEach((url) => URL.revokeObjectURL(url));
  attachmentUrls = [];
  fileList.innerHTML = "";
  composer.classList.toggle("has-attachments", attachedFiles.length > 0);

  attachedFiles.forEach((file, index) => {
    const isPreviewable = file.type.startsWith("image/") || file.type.startsWith("video/");
    const item = document.createElement("div");
    item.className = isPreviewable ? "media-preview" : "file-chip";

    if (isPreviewable) {
      const url = URL.createObjectURL(file);
      attachmentUrls.push(url);

      if (file.type.startsWith("image/")) {
        const image = document.createElement("img");
        image.src = url;
        image.alt = "";
        item.append(image);
      } else {
        const video = document.createElement("video");
        video.src = url;
        video.muted = true;
        video.playsInline = true;
        video.preload = "metadata";
        item.append(video);
      }
    } else {
      const fileName = document.createElement("span");
      fileName.title = file.name;
      fileName.textContent = file.name;
      item.append(fileName);
    }

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.setAttribute("aria-label", `Удалить ${file.name}`);
    removeButton.textContent = "×";
    removeButton.addEventListener("click", () => {
      attachedFiles = attachedFiles.filter((_, fileIndex) => fileIndex !== index);
      renderFiles();
    });

    item.append(removeButton);
    fileList.append(item);
  });
};

const addFiles = (files) => {
  const incoming = Array.from(files);
  attachedFiles = [...attachedFiles, ...incoming].slice(0, 12);
  renderFiles();
};

const fileToAttachment = (file) =>
  new Promise((resolve) => {
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      resolve({
        name: file.name,
        type: "file",
        src: "",
      });
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      resolve({
        name: file.name,
        type: file.type.startsWith("video/") ? "video" : "image",
        src: reader.result,
      });
    });
    reader.addEventListener("error", () => resolve(null));
    reader.readAsDataURL(file);
  });

const createMessage = (role, text, model = "", attachments = []) => {
  const message = document.createElement("article");
  message.className = `chat-message ${role}`;

  const meta = document.createElement("div");
  meta.className = "message-meta";
  meta.textContent = role === "user" ? "Вы" : model;

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.textContent = text;

  let mediaList = null;

  if (attachments.length > 0) {
    mediaList = document.createElement("div");
    mediaList.className = "message-media-list";

    attachments.forEach((attachment) => {
      const media = document.createElement("div");
      media.className = "message-media";

      if (attachment.type === "video") {
        const video = document.createElement("video");
        video.src = attachment.src;
        video.controls = true;
        video.playsInline = true;
        media.append(video);
      } else if (attachment.type === "image") {
        const image = document.createElement("img");
        image.src = attachment.src;
        image.alt = attachment.name || "";
        media.append(image);
      } else {
        media.classList.add("is-file");
        const fileIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        fileIcon.setAttribute("viewBox", "0 0 24 24");
        fileIcon.setAttribute("aria-hidden", "true");
        const filePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        filePath.setAttribute("d", "M7 3h7l5 5v13H7z");
        const foldPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        foldPath.setAttribute("d", "M14 3v6h6");
        fileIcon.append(filePath, foldPath);
        const fileLabel = document.createElement("span");
        fileLabel.textContent = attachment.name || "Файл";
        media.append(fileIcon, fileLabel);
      }

      mediaList.append(media);
    });

  }

  const actions = document.createElement("div");
  actions.className = "message-actions";

  const copyButton = document.createElement("button");
  copyButton.className = "message-action";
  copyButton.type = "button";
  copyButton.setAttribute("aria-label", "Скопировать сообщение");
  copyButton.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="8" y="8" width="11" height="11" rx="2.2"></rect>
      <rect x="4" y="4" width="11" height="11" rx="2.2"></rect>
    </svg>
  `;

  copyButton.addEventListener("click", async () => {
    const messageText = bubble.textContent;

    try {
      await navigator.clipboard.writeText(messageText);
      copyButton.classList.add("is-copied");
      copyButton.setAttribute("aria-label", "Скопировано");
      window.setTimeout(() => {
        copyButton.classList.remove("is-copied");
        copyButton.setAttribute("aria-label", "Скопировать сообщение");
      }, 1200);
    } catch {
      const fallbackInput = document.createElement("textarea");
      fallbackInput.value = messageText;
      fallbackInput.setAttribute("readonly", "");
      fallbackInput.style.position = "fixed";
      fallbackInput.style.opacity = "0";
      document.body.append(fallbackInput);
      fallbackInput.select();
      document.execCommand("copy");
      fallbackInput.remove();
    }
  });

  actions.append(copyButton);

  if (role === "assistant") {
    const moreWrap = document.createElement("div");
    moreWrap.className = "message-more";

    const moreButton = document.createElement("button");
    moreButton.className = "message-action";
    moreButton.type = "button";
    moreButton.setAttribute("aria-label", "Еще действия");
    moreButton.innerHTML = `
      <svg class="more-dots-icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="6.5" cy="12" r="1.55"></circle>
        <circle cx="12" cy="12" r="1.55"></circle>
        <circle cx="17.5" cy="12" r="1.55"></circle>
      </svg>
    `;

    const menu = document.createElement("div");
    menu.className = "message-menu";
    menu.innerHTML = `
      <div class="message-menu-time">сегодня, ${new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</div>
      <button class="message-menu-row" type="button">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 6.5c2.2 0 4 .7 5.5 2v10c-1.5-1.3-3.3-2-5.5-2V6.5Z"></path>
          <path d="M19 6.5c-2.2 0-4 .7-5.5 2v10c1.5-1.3 3.3-2 5.5-2V6.5Z"></path>
        </svg>
        <span>Посмотреть источники</span>
      </button>
      <button class="message-menu-row" type="button">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12h8M13 12l-3-3M13 12l-3 3"></path>
          <path d="M16 6h3v3M19 6l-6 6"></path>
        </svg>
        <span>Ветка в новом чате</span>
      </button>
    `;

    moreButton.addEventListener("click", (event) => {
      event.stopPropagation();
      document.querySelectorAll(".message-more.is-open").forEach((item) => {
        if (item !== moreWrap) {
          item.classList.remove("is-open");
        }
      });
      moreWrap.classList.toggle("is-open");
    });

    menu.addEventListener("mouseleave", () => {
      moreWrap.classList.remove("is-open");
    });

    moreWrap.append(moreButton, menu);
    actions.append(moreWrap);
  }

  message.append(meta);

  if (mediaList) {
    message.append(mediaList);
  }

  message.append(bubble, actions);
  return message;
};

const setMessageText = (message, text) => {
  message.querySelector(".message-bubble").textContent = text;
};

const appendChatMessage = (message) => {
  chatFeed.insertBefore(message, chatEnd);
};

const clearChatFeed = () => {
  chatFeed.querySelectorAll(".chat-message").forEach((message) => message.remove());
};

const renderConversation = () => {
  clearChatFeed();

  conversationMessages.forEach((item) => {
    appendChatMessage(createMessage(item.role, item.content, item.model || currentModel, item.attachments || []));
  });
};

const updateActiveChat = () => {
  const activeChat = getActiveChat();

  if (!activeChat) {
    return;
  }

  activeChat.model = currentModel;
  if (activePage === "video") {
    activeChat.videoSettings = getVideoSettings();
  }
  if (activePage === "music") {
    activeChat.musicSettings = getMusicSettings();
  }
  activeChat.messages = conversationMessages;
  activeChat.updatedAt = Date.now();
  saveActiveChatId();
  saveChats();
  renderChatsList();
};

const openDeleteDialog = (chatId) => {
  pendingDeleteChatId = chatId;
  deleteDialog.classList.add("is-open");
  deleteDialog.setAttribute("aria-hidden", "false");
};

const closeDeleteDialog = () => {
  pendingDeleteChatId = null;
  deleteDialog.classList.remove("is-open");
  deleteDialog.setAttribute("aria-hidden", "true");
};

const openLogoutDialog = () => {
  logoutDialog.classList.add("is-open");
  logoutDialog.setAttribute("aria-hidden", "false");
};

const closeLogoutDialog = () => {
  logoutDialog.classList.remove("is-open");
  logoutDialog.setAttribute("aria-hidden", "true");
};

const renderChatsList = () => {
  chatsList.innerHTML = "";

  if (chats.length === 0) {
    const empty = document.createElement("div");
    empty.className = "chats-empty";
    empty.textContent = "Здесь появятся ваши чаты после первого сообщения.";
    chatsList.append(empty);
    return;
  }

  chats
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .forEach((chat) => {
      const item = document.createElement("div");
      item.className = "chat-list-item";

      const chatButton = document.createElement("button");
      chatButton.className = `chat-row${chat.id === activeChatId ? " is-current" : ""}`;
      chatButton.type = "button";
      const title = document.createElement("span");
      title.className = "chat-title";
      title.textContent = chat.title;

      const preview = document.createElement("span");
      preview.className = "chat-preview";

      const model = document.createElement("span");
      model.className = `chat-model ${getModelClass(chat.model)}`;
      model.textContent = chat.model;

      preview.append(model, ` · ${chat.messages.at(-1)?.content || "Пустой чат"}`);
      chatButton.append(title, preview);
      chatButton.addEventListener("click", () => {
        loadChat(chat.id);
        closeChatsPopover();
      });

      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-chat-button";
      deleteButton.type = "button";
      deleteButton.setAttribute("aria-label", `Удалить чат ${chat.title}`);
      deleteButton.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h16"></path>
          <path d="M10 11v6"></path>
          <path d="M14 11v6"></path>
          <path d="M6 7l1 14h10l1-14"></path>
          <path d="M9 7V4h6v3"></path>
        </svg>
      `;
      deleteButton.addEventListener("click", (event) => {
        event.stopPropagation();
        openDeleteDialog(chat.id);
      });

      item.append(chatButton, deleteButton);
      chatsList.append(item);
    });
};

const loadChat = (chatId) => {
  const chat = chats.find((item) => item.id === chatId);

  if (!chat) {
    return;
  }

  activeChatId = chat.id;
  saveActiveChatId();
  conversationMessages = [...chat.messages];
  setCurrentModel(chat.model);
  if (activePage === "video") {
    setVideoSettings({
      model: chat.model,
      ...(chat.videoSettings || {}),
    });
  }
  if (activePage === "music") {
    setMusicSettings({
      model: chat.model,
      ...(chat.musicSettings || {}),
    });
  }
  document.body.classList.add("chat-started");
  searchBox.dataset.state = "";
  textarea.value = "";
  attachedFiles = [];
  renderFiles();
  resizeTextarea();
  syncPlaceholderVisibility();
  renderConversation();
  renderChatsList();
  scrollToLatest("auto");
};

const startNewChat = () => {
  activeChatId = null;
  saveActiveChatId();
  conversationMessages = [];
  attachedFiles = [];
  textarea.value = "";
  document.body.classList.remove("chat-started");
  if (activePage === "video") {
    resetVideoSettings();
  }
  if (activePage === "music") {
    resetMusicSettings();
  } else {
    syncMusicComposerAvailability();
  }
  clearChatFeed();
  renderFiles();
  resizeTextarea();
  syncPlaceholderVisibility();
  closeChatsPopover();
  closeModelMenu();
  closeVideoSettings();
  closeMusicSettings();
  renderChatsList();
};

const deleteChat = (chatId) => {
  chats = chats.filter((chat) => chat.id !== chatId);

  if (activeChatId === chatId) {
    startNewChat();
  } else if (localStorage.getItem(getActiveChatStorageKey()) === chatId) {
    localStorage.removeItem(getActiveChatStorageKey());
  }

  saveChats();
  renderChatsList();
};

const switchPage = (page) => {
  if (activePage === page) {
    return;
  }

  composer.classList.add("is-switching-out");

  window.setTimeout(() => {
  activePage = page;
  saveActivePage();
  document.body.dataset.page = activePage;
  syncActiveTopTab();
  syncTopIndicator();
  activeChatId = null;
  conversationMessages = [];
  attachedFiles = [];
  textarea.value = "";
  placeholderIndex = 0;
  animatedPlaceholder.textContent = getPlaceholders()[placeholderIndex];
  animatedPlaceholder.classList.remove("is-leaving", "is-entering");
  document.body.classList.remove("chat-started");
  clearChatFeed();
  renderFiles();
  resizeTextarea();
  syncPlaceholderVisibility();
  closeModelMenu();
  closeFormatMenu();
  closeVideoSettings();
  closeMusicSettings();
  closeChatsPopover();
  closeMessageMenus();
  renderModelOptions();
  loadChats();
  if (!restoreActiveChat()) {
    renderChatsList();
  }
  syncMusicComposerAvailability();
  composer.classList.remove("is-switching-out");
  composer.classList.add("is-switching-in");

  window.setTimeout(() => {
    composer.classList.remove("is-switching-in");
  }, 520);
  }, 260);
};

const scrollToLatest = (behavior = "smooth") => {
  const scroll = () => {
    chatEnd.scrollIntoView({ behavior, block: "end" });
    chatFeed.scrollTop = chatFeed.scrollHeight;
  };

  requestAnimationFrame(scroll);
  window.setTimeout(scroll, 90);
};

const createMockAnswer = (query, model) => {
  if (activePage === "video") {
    return `${model} · тестовый режим\n\nВидео-запрос принят: «${query}».\n\nНастройки ролика: ${currentVideoDuration} сек · ${currentVideoQuality} · ${currentFormat}. Пока это локальный mock-ответ без генерации видео, но интерфейс уже сохраняет модель, длительность, качество, формат и историю именно для вкладки «Видео».`;
  }

  if (activePage === "music") {
    if (model === "ElevenLabs") {
      const action = currentMusicMode === "Voice Changer" ? "файл для изменения голоса" : "текст для озвучки";
      return `${model} · тестовый режим\n\nПринял ${action}: «${query}».\n\nНастройки: ${getMusicSummaryText()}. Пока это локальный mock-ответ, но вкладка «Музыка» уже хранит свои чаты, режимы, голос и фильтры отдельно от остальных разделов.`;
    }

    return `${model} · тестовый режим\n\nМузыкальный запрос принят: «${query}».\n\nНастройки: ${getMusicSummaryText()}. ${currentMusicMode === "Свой" ? `Заголовок: ${currentMusicTitle || "не задан"}. Стили: ${currentMusicStyles || "не заданы"}.` : "Можно включать инструментал или перейти в режим «Свой» для детального промпта."}`;
  }

  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes("сайт") || lowerQuery.includes("дизайн")) {
    return `${model} · тестовый режим\n\nЯ бы предложил двигаться так: сначала закрепить главный сценарий, потом настроить визуальные состояния, а после этого подключать реальные модели. Сейчас это mock-ответ, но интерфейс уже ведет себя как разговорный чат.`;
  }

  if (lowerQuery.includes("привет") || lowerQuery.includes("здравств")) {
    return `${model} · тестовый режим\n\nПривет. Я локальный тестовый ассистент для проверки чата без API. Можешь писать вопросы, отправлять через Enter и смотреть, как будет выглядеть диалог.`;
  }

  return `${model} · тестовый режим\n\nЯ получил запрос: «${query}».\n\nПока это локальный mock-ответ без подключения к API. Он нужен, чтобы проверить механику чата, анимацию, расположение сообщений и общий UX.`;
};

textarea.addEventListener("input", () => {
  resizeTextarea();
  syncPlaceholderVisibility();
});

textarea.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    composer.requestSubmit();
  }
});

textarea.addEventListener("paste", (event) => {
  const pastedFiles = Array.from(event.clipboardData?.files || []).filter((file) =>
    file.type.startsWith("image/") || file.type.startsWith("video/")
  );

  if (pastedFiles.length > 0) {
    event.preventDefault();
    addFiles(pastedFiles);
  }
});

composer.addEventListener("paste", (event) => {
  if (event.target === textarea) {
    return;
  }

  const pastedFiles = Array.from(event.clipboardData?.files || []).filter((file) =>
    file.type.startsWith("image/") || file.type.startsWith("video/")
  );

  if (pastedFiles.length > 0) {
    event.preventDefault();
    addFiles(pastedFiles);
  }
});

setInterval(() => {
  if (document.body.classList.contains("chat-started")) {
    return;
  }

  const placeholders = getPlaceholders();
  placeholderIndex = (placeholderIndex + 1) % placeholders.length;
  animatedPlaceholder.classList.remove("is-entering");
  animatedPlaceholder.classList.add("is-leaving");

  window.setTimeout(() => {
    animatedPlaceholder.textContent = placeholders[placeholderIndex];
    animatedPlaceholder.classList.remove("is-leaving");
    animatedPlaceholder.classList.add("is-entering");
  }, 280);
}, 5000);

fileInput.addEventListener("change", (event) => {
  addFiles(event.target.files);
  fileInput.value = "";
});

searchBox.addEventListener("dragover", (event) => {
  event.preventDefault();
  searchBox.classList.add("is-dragover");
});

searchBox.addEventListener("dragleave", () => {
  searchBox.classList.remove("is-dragover");
});

searchBox.addEventListener("drop", (event) => {
  event.preventDefault();
  searchBox.classList.remove("is-dragover");
  addFiles(event.dataTransfer.files);
});

const closeChatsPopover = () => {
  chatsPopover.classList.remove("is-open");
  chatsTrigger.setAttribute("aria-expanded", "false");
};

const toggleChatsPopover = () => {
  closeAccountPopover();
  const isOpen = chatsPopover.classList.toggle("is-open");
  chatsTrigger.setAttribute("aria-expanded", String(isOpen));
};

const closeAccountPopover = () => {
  accountPopover.classList.remove("is-open");
  accountTrigger.setAttribute("aria-expanded", "false");
};

const toggleAccountPopover = () => {
  closeChatsPopover();
  const isOpen = accountPopover.classList.toggle("is-open");
  accountTrigger.setAttribute("aria-expanded", String(isOpen));
};

const closeMessageMenus = () => {
  document.querySelectorAll(".message-more.is-open").forEach((item) => {
    item.classList.remove("is-open");
  });
};

const closeModelMenu = () => {
  modelSelect.classList.remove("is-open");
  modelButton.setAttribute("aria-expanded", "false");
};

const closeFormatMenu = () => {
  formatSelect.classList.remove("is-open");
  formatSelect.classList.remove("opens-up");
  formatButton.setAttribute("aria-expanded", "false");
};

const closeVideoSettings = () => {
  videoSettingsPanel.classList.remove("is-open");
  videoSettingsPanel.setAttribute("aria-hidden", "true");
  videoSettingsToggle.setAttribute("aria-expanded", "false");
};

const closeMusicSettings = () => {
  musicSettingsPanel.classList.remove("is-open");
  musicSettingsPanel.setAttribute("aria-hidden", "true");
  videoSettingsToggle.setAttribute("aria-expanded", "false");
};

const toggleVideoSettings = () => {
  if (activePage !== "video") {
    return;
  }

  closeModelMenu();
  closeFormatMenu();
  closeMusicSettings();
  const isOpen = videoSettingsPanel.classList.toggle("is-open");
  videoSettingsPanel.setAttribute("aria-hidden", String(!isOpen));
  videoSettingsToggle.setAttribute("aria-expanded", String(isOpen));
};

const toggleMusicSettings = () => {
  if (activePage !== "music") {
    return;
  }

  closeModelMenu();
  closeFormatMenu();
  closeVideoSettings();
  const isOpen = musicSettingsPanel.classList.toggle("is-open");
  musicSettingsPanel.setAttribute("aria-hidden", String(!isOpen));
  videoSettingsToggle.setAttribute("aria-expanded", String(isOpen));
};

const openFormatMenu = () => {
  if (activePage !== "images") {
    return;
  }

  const buttonRect = formatButton.getBoundingClientRect();
  const menuHeight = 230;
  const spaceBelow = window.innerHeight - buttonRect.bottom;
  const spaceAbove = buttonRect.top;
  formatSelect.classList.toggle("opens-up", spaceBelow < menuHeight && spaceAbove > spaceBelow);
  formatSelect.classList.add("is-open");
  formatButton.setAttribute("aria-expanded", "true");
};

const openModelMenu = () => {
  if (document.body.classList.contains("chat-started") || activePage === "video" || activePage === "music") {
    return;
  }

  modelSelect.classList.add("is-open");
  modelButton.setAttribute("aria-expanded", "true");
};

modelButton.addEventListener("click", () => {
  if (modelSelect.classList.contains("is-open")) {
    closeModelMenu();
  } else {
    openModelMenu();
  }
});

videoSettingsToggle.addEventListener("click", () => {
  if (activePage === "music") {
    toggleMusicSettings();
  } else {
    toggleVideoSettings();
  }
});

videoSettingsPanel.addEventListener("click", (event) => {
  event.stopPropagation();
});

videoSettingsPanel.addEventListener("pointerdown", (event) => {
  event.stopPropagation();
});

musicSettingsPanel.addEventListener("click", (event) => {
  event.stopPropagation();
});

musicSettingsPanel.addEventListener("pointerdown", (event) => {
  event.stopPropagation();
});

videoSettingsPanel.addEventListener("change", (event) => {
  const select = event.target.closest("[data-video-select]");

  if (!select) {
    const slider = event.target.closest("[data-video-duration]");

    if (slider) {
      setVideoSettings({ duration: slider.value });
      updateActiveChat();
    }

    return;
  }

  const key = select.dataset.videoSelect;

  if (key === "model") {
    setVideoSettings({ model: select.value });
  }

  if (key === "mode") {
    setVideoSettings({ mode: select.value });
  }

  updateActiveChat();
});

videoSettingsPanel.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-video-select-trigger]");

  if (!trigger) {
    return;
  }

  const field = trigger.closest(".video-select-field");
  const wasOpen = field.classList.contains("is-open");
  videoSettingsPanel.querySelectorAll(".video-select-field.is-open").forEach((item) => {
    item.classList.remove("is-open");
    item.querySelector("[data-video-select-trigger]")?.setAttribute("aria-expanded", "false");
  });

  field.classList.toggle("is-open", !wasOpen);
  trigger.setAttribute("aria-expanded", String(!wasOpen));
});

videoSettingsPanel.addEventListener("click", (event) => {
  const option = event.target.closest("[data-video-select-value]");

  if (!option) {
    return;
  }

  const field = option.closest(".video-select-field");
  const trigger = field.querySelector("[data-video-select-trigger]");
  const key = trigger.dataset.videoSelectTrigger;
  const value = option.dataset.videoSelectValue;

  if (key === "model") {
    setVideoSettings({ model: value });
  }

  if (key === "mode") {
    setVideoSettings({ mode: value });
  }

  updateActiveChat();
});

videoSettingsPanel.addEventListener("input", (event) => {
  const slider = event.target.closest("[data-video-duration]");

  if (!slider) {
    return;
  }

  currentVideoDuration = Number(slider.value);
  normalizeVideoSettings();
  updateVideoDurationPreview();
});

videoSettingsPanel.addEventListener("click", (event) => {
  const choice = event.target.closest(".video-choice");

  if (!choice) {
    return;
  }

  if (choice.dataset.quality) {
    setVideoSettings({ quality: choice.dataset.quality });
  }

  if (choice.dataset.format) {
    setVideoSettings({ format: choice.dataset.format });
  }

  if (choice.dataset.duration) {
    setVideoSettings({ duration: choice.dataset.duration });
  }

  if (choice.dataset.motionSource) {
    setVideoSettings({ motionSource: choice.dataset.motionSource });
  }

  updateActiveChat();
});

musicSettingsPanel.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-video-select-trigger]");

  if (!trigger) {
    return;
  }

  const field = trigger.closest(".video-select-field");
  const wasOpen = field.classList.contains("is-open");
  musicSettingsPanel.querySelectorAll(".video-select-field.is-open").forEach((item) => {
    item.classList.remove("is-open");
    item.querySelector("[data-video-select-trigger]")?.setAttribute("aria-expanded", "false");
  });

  field.classList.toggle("is-open", !wasOpen);
  trigger.setAttribute("aria-expanded", String(!wasOpen));
});

musicSettingsPanel.addEventListener("click", (event) => {
  const option = event.target.closest("[data-video-select-value]");

  if (!option) {
    return;
  }

  const field = option.closest(".video-select-field");
  const trigger = field.querySelector("[data-video-select-trigger]");
  const key = trigger.dataset.videoSelectTrigger;
  const value = option.dataset.videoSelectValue;

  if (key === "music-model") {
    setMusicSettings({ model: value });
  }

  if (key === "voice-gender") {
    setMusicSettings({ voiceGender: value });
  }

  if (key === "voice-age") {
    setMusicSettings({ voiceAge: value });
  }

  if (key === "voice-language") {
    setMusicSettings({ voiceLanguage: value });
  }

  if (key === "voice-name") {
    setMusicSettings({ voice: value });
  }

  updateActiveChat();
});

musicSettingsPanel.addEventListener("click", (event) => {
  const mode = event.target.closest("[data-music-mode]");
  const toggle = event.target.closest("[data-music-instrumental]");
  const presets = event.target.closest("[data-music-presets]");
  const preset = event.target.closest("[data-preset-value]");

  if (mode) {
    setMusicSettings({ mode: mode.dataset.musicMode });
    updateActiveChat();
    return;
  }

  if (toggle) {
    setMusicSettings({ instrumental: !currentMusicInstrumental });
    updateActiveChat();
    return;
  }

  if (presets) {
    activePresetTarget = activePresetTarget === presets.dataset.musicPresets ? "" : presets.dataset.musicPresets;
    renderMusicSettingsPanel();
    return;
  }

  if (preset) {
    const target = preset.dataset.presetTarget;
    const value = preset.dataset.presetValue;
    if (target === "styles") {
      currentMusicStyles = currentMusicStyles ? `${currentMusicStyles}, ${value}` : value;
    }
    if (target === "excluded") {
      currentMusicExcludedStyles = currentMusicExcludedStyles ? `${currentMusicExcludedStyles}, ${value}` : value;
    }
    activePresetTarget = "";
    renderMusicSettingsPanel();
    updateActiveChat();
    return;
  }

  if (activePresetTarget) {
    activePresetTarget = "";
    renderMusicSettingsPanel();
  }
});

musicSettingsPanel.addEventListener("input", (event) => {
  const title = event.target.closest("[data-music-title]");
  const styles = event.target.closest("[data-music-styles]");
  const excluded = event.target.closest("[data-music-excluded]");
  const search = event.target.closest("[data-voice-search]");

  if (title) {
    currentMusicTitle = title.value;
    updateActiveChat();
  }

  if (styles) {
    currentMusicStyles = styles.value;
    updateActiveChat();
  }

  if (excluded) {
    currentMusicExcludedStyles = excluded.value;
    updateActiveChat();
  }

  if (search) {
    const cursorPosition = search.selectionStart;
    setMusicSettings({ voiceSearch: search.value });
    const nextSearch = musicSettingsPanel.querySelector("[data-voice-search]");
    if (nextSearch) {
      nextSearch.focus();
      nextSearch.setSelectionRange(cursorPosition, cursorPosition);
    }
  }
});

formatButton.addEventListener("click", () => {
  if (formatSelect.classList.contains("is-open")) {
    closeFormatMenu();
  } else {
    openFormatMenu();
  }
});

formatOptions.forEach((option) => {
  option.addEventListener("click", () => {
    setCurrentFormat(option.dataset.format);
    closeFormatMenu();
  });
});

modelMenu.addEventListener("click", (event) => {
  const option = event.target.closest(".model-option");

  if (!option || document.body.classList.contains("chat-started")) {
    return;
  }

  setCurrentModel(option.dataset.model);
  closeModelMenu();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".message-more")) {
    closeMessageMenus();
  }

  if (!modelSelect.contains(event.target)) {
    closeModelMenu();
  }

  if (!formatSelect.contains(event.target)) {
    closeFormatMenu();
  }

  if (!videoSettingsPanel.contains(event.target) && !videoSettingsToggle.contains(event.target)) {
    closeVideoSettings();
  }

  if (!musicSettingsPanel.contains(event.target) && !videoSettingsToggle.contains(event.target)) {
    closeMusicSettings();
  }

  if (!chatsPopover.contains(event.target)) {
    closeChatsPopover();
  }

  if (!accountPopover.contains(event.target)) {
    closeAccountPopover();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModelMenu();
    closeFormatMenu();
    closeChatsPopover();
    closeAccountPopover();
    closeVideoSettings();
    closeMusicSettings();
    closeMessageMenus();
    closeDeleteDialog();
    closeLogoutDialog();
    closeSettingsPage();
  }
});

chatsTrigger.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleChatsPopover();
});

newChatButton.addEventListener("click", (event) => {
  event.stopPropagation();
  startNewChat();
});

accountTrigger.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleAccountPopover();
});

settingsButton.addEventListener("click", openSettingsPage);

settingsClose.addEventListener("click", closeSettingsPage);

settingsPage.addEventListener("click", (event) => {
  if (event.target === settingsPage) {
    closeSettingsPage();
  }
});

themeChoices.forEach((button) => {
  button.addEventListener("click", () => {
    const choice = button.dataset.themeChoice;
    localStorage.setItem(themeStorageKey, choice);
    applyTheme(choice);
  });
});

systemThemeQuery.addEventListener("change", () => {
  if ((localStorage.getItem(themeStorageKey) || "system") === "system") {
    applyTheme("system");
  }
});

passwordChangeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  passwordMessage.classList.remove("is-success");
  const activeUser = getActiveUser();

  if (oldPassword.value !== getStoredPassword(activeUser.login)) {
    passwordMessage.textContent = "Старый пароль введен неверно.";
    return;
  }

  if (!newPassword.value) {
    passwordMessage.textContent = "Введите новый пароль.";
    return;
  }

  if (newPassword.value !== repeatPassword.value) {
    passwordMessage.textContent = "Новые пароли не совпадают.";
    return;
  }

  setStoredPassword(activeUser.login, newPassword.value);
  passwordMessage.textContent = "Пароль успешно поменян.";
  passwordMessage.classList.add("is-success");
  passwordChangeForm.reset();
});

accountExit.addEventListener("click", () => {
  closeAccountPopover();
  openLogoutDialog();
});

logoutCancel.addEventListener("click", () => {
  closeLogoutDialog();
  closeAccountPopover();
});

logoutConfirm.addEventListener("click", () => {
  localStorage.removeItem(authStorageKey);
  localStorage.removeItem(authUserStorageKey);
  window.location.reload();
});

logoutDialog.addEventListener("click", (event) => {
  if (event.target === logoutDialog) {
    closeLogoutDialog();
  }
});

deleteCancel.addEventListener("click", closeDeleteDialog);

deleteConfirm.addEventListener("click", () => {
  if (pendingDeleteChatId) {
    deleteChat(pendingDeleteChatId);
  }

  closeDeleteDialog();
});

deleteDialog.addEventListener("click", (event) => {
  if (event.target === deleteDialog) {
    closeDeleteDialog();
  }
});

topTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    switchPage(tab.dataset.page || "gpt");
  });
});

window.addEventListener("resize", syncTopIndicator);

renderVideoSettingsPanel();
syncActiveTopTab();
renderModelOptions();
document.body.dataset.page = activePage;
setCurrentFormat(currentFormat);
applyTheme();
syncAccountIdentity();
loadChats();
if (!restoreActiveChat()) {
  renderChatsList();
}
syncTopIndicator();

if (localStorage.getItem(authStorageKey) === "true") {
  unlockApp({ animate: false });
} else {
  authLogin.focus();
}

composer.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = textarea.value.trim();
  if (!query && attachedFiles.length === 0) {
    searchBox.dataset.state = currentModel;
    return;
  }

  const outgoingAttachments = (await Promise.all(attachedFiles.map(fileToAttachment))).filter(Boolean);
  const messageText = query || "Медиа";

  if (!activeChatId) {
    const newChat = {
      id: createChatId(),
      title: createChatTitle(messageText),
      model: currentModel,
      videoSettings: activePage === "video" ? getVideoSettings() : undefined,
      musicSettings: activePage === "music" ? getMusicSettings() : undefined,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    chats.push(newChat);
    activeChatId = newChat.id;
  }

  document.body.classList.add("chat-started");
  closeModelMenu();
  searchBox.dataset.state = "";
  appendChatMessage(createMessage("user", messageText, "", outgoingAttachments));
  const assistantMessage = createMessage("assistant", "Думаю...", currentModel);
  appendChatMessage(assistantMessage);
  conversationMessages.push({ role: "user", content: messageText, attachments: outgoingAttachments });
  updateActiveChat();

  textarea.value = "";
  attachedFiles = [];
  renderFiles();
  resizeTextarea();
  syncPlaceholderVisibility();
  scrollToLatest();

  if (window.location.protocol === "file:") {
    window.setTimeout(() => {
      const answer = createMockAnswer(messageText, currentModel);
      setMessageText(assistantMessage, answer);
      conversationMessages.push({ role: "assistant", content: answer, model: currentModel });
      updateActiveChat();
      scrollToLatest();
    }, 550);
    return;
  }

  fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: currentModel,
      videoSettings: activePage === "video" ? getVideoSettings() : undefined,
      musicSettings: activePage === "music" ? getMusicSettings() : undefined,
      messages: conversationMessages,
    }),
  })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Не удалось получить ответ модели.");
      }
      return data;
    })
    .then((data) => {
      const answer = data.text || "Модель вернула пустой ответ.";
      setMessageText(assistantMessage, answer);
      conversationMessages.push({ role: "assistant", content: answer, model: currentModel });
      updateActiveChat();
      scrollToLatest();
    })
    .catch((error) => {
      setMessageText(assistantMessage, error.message);
      conversationMessages.push({ role: "assistant", content: error.message, model: currentModel });
      updateActiveChat();
    });
});

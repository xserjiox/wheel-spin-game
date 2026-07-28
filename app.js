"use strict";

// Wheel colors and local persistence keys.
const COLORS = ["#ff7957", "#826ff2", "#f7c84b", "#63b9e8", "#68c99c", "#ef8eae", "#d7ff44"];
const STORAGE_KEY = "kruti-options-v2";
const TITLE_STORAGE_KEY = "kruti-title-v2";
const DEFAULT_TITLE = "Кому повезёт?";
const DEFAULT_OPTIONS = ["Пицца", "Суши", "Бургеры", "Паста", "Салат"];

const wheel = document.querySelector("#wheel");
const ctx = wheel.getContext("2d");
const wheelWrap = document.querySelector("#wheelWrap");
const optionsList = document.querySelector("#optionsList");
const optionInput = document.querySelector("#optionInput");
const addForm = document.querySelector("#addForm");
const countBadge = document.querySelector("#countBadge");
const probabilityText = document.querySelector("#probabilityText");
const titleInput = document.querySelector("#titleInput");
const wheelTitle = document.querySelector("#wheel-title");
const customTime = document.querySelector("#customTime");
const spinButton = document.querySelector("#spinButton");
const spinCenter = document.querySelector("#spinCenter");
const statusText = document.querySelector("#statusText");
const spinStatus = document.querySelector(".spin-status");
const resultModal = document.querySelector("#resultModal");
const resultName = document.querySelector("#resultName");
const spinAgain = document.querySelector("#spinAgain");
const timeChips = [...document.querySelectorAll(".time-chip")];

let options = loadOptions();
let wheelTitleText = loadTitle();
let rotation = 0;
let isSpinning = false;
let countdownFrame = 0;

function loadOptions() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.every((item) => typeof item === "string")) {
      return saved;
    }
  } catch (_) {
    // Local storage is optional; defaults keep the app usable in private mode.
  }
  return [...DEFAULT_OPTIONS];
}

function saveOptions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
  } catch (_) {
    // The wheel still works when storage is unavailable.
  }
}

function loadTitle() {
  try {
    return localStorage.getItem(TITLE_STORAGE_KEY) ?? DEFAULT_TITLE;
  } catch (_) {
    return DEFAULT_TITLE;
  }
}

function updateTitle(value) {
  wheelTitleText = value.slice(0, 60);
  const visibleTitle = wheelTitleText.trim() || DEFAULT_TITLE;
  wheelTitle.textContent = visibleTitle;
  document.title = `${visibleTitle} — Крути`;

  try {
    localStorage.setItem(TITLE_STORAGE_KEY, wheelTitleText);
  } catch (_) {
    // The title remains editable even when storage is unavailable.
  }
}

function addOption(name) {
  const cleanName = name.trim();
  if (!cleanName || isSpinning) return;
  options.push(cleanName);
  saveOptions();
  render();
}

function removeOption(index) {
  if (isSpinning) return;
  options.splice(index, 1);
  saveOptions();
  render();
}

function render() {
  renderOptions();
  drawWheel();
  const count = options.length;
  countBadge.textContent = String(count);
  probabilityText.textContent = count > 0
    ? `Шанс каждого варианта: ${(100 / count).toLocaleString("ru-RU", { maximumFractionDigits: 2 })}%`
    : "Добавьте хотя бы 2 варианта";
  updateControls();
}

function renderOptions() {
  optionsList.replaceChildren();

  options.forEach((name, index) => {
    const row = document.createElement("div");
    row.className = "option-row";

    const color = document.createElement("span");
    color.className = "option-color";
    color.style.backgroundColor = COLORS[index % COLORS.length];

    const label = document.createElement("span");
    label.className = "option-name";
    label.textContent = name;
    label.title = name;

    const remove = document.createElement("button");
    remove.className = "remove-option";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Удалить ${name}`);
    remove.disabled = isSpinning;
    remove.addEventListener("click", () => removeOption(index));

    row.append(color, label, remove);
    optionsList.append(row);
  });
}

function drawWheel() {
  const rect = wheel.getBoundingClientRect();
  const cssSize = Math.max(280, Math.round(rect.width || 570));
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  wheel.width = cssSize * ratio;
  wheel.height = cssSize * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, cssSize, cssSize);

  const center = cssSize / 2;
  const radius = center;

  if (options.length === 0) {
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#e5e1d8";
    ctx.fill();
    ctx.fillStyle = "#767970";
    ctx.font = `700 ${Math.max(13, cssSize * 0.032)}px Manrope, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Добавьте варианты", center, center - radius * 0.27);
    return;
  }

  const arc = (Math.PI * 2) / options.length;
  options.forEach((name, index) => {
    const start = -Math.PI / 2 + index * arc;
    const end = start + arc;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = COLORS[index % COLORS.length];
    ctx.fill();
    ctx.strokeStyle = "#1d211b";
    ctx.lineWidth = Math.max(1, cssSize * 0.003);
    ctx.stroke();

    drawSegmentLabel(name, index, arc, center, radius, cssSize);
  });

  ctx.beginPath();
  ctx.arc(center, center, radius - 3, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawSegmentLabel(name, index, arc, center, radius, size) {
  const angle = -Math.PI / 2 + (index + 0.5) * arc;
  const manySegments = options.length > 12;
  const fontSize = Math.max(8, Math.min(15, size * 0.035, arc * radius * 0.19));
  const maxLength = manySegments ? 12 : 20;
  const label = name.length > maxLength ? `${name.slice(0, maxLength - 1)}…` : name;

  ctx.save();
  ctx.translate(center, center);
  ctx.rotate(angle);
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#1d211b";
  ctx.font = `800 ${fontSize}px Manrope, sans-serif`;
  ctx.fillText(label, radius * 0.83, 0, radius * 0.6);
  ctx.restore();
}

function getRandomIndex(max) {
  if (max <= 0) return 0;
  if (window.crypto?.getRandomValues) {
    const range = 0x100000000;
    const limit = range - (range % max);
    const value = new Uint32Array(1);
    do {
      crypto.getRandomValues(value);
    } while (value[0] >= limit);
    return value[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function getDuration() {
  const raw = Number(customTime.value);
  return Math.min(300, Math.max(1, Number.isFinite(raw) ? Math.round(raw) : 20));
}

function spin() {
  if (isSpinning || options.length < 2) return;

  const duration = getDuration();
  customTime.value = String(duration);
  const winnerIndex = getRandomIndex(options.length);
  const segmentDegrees = 360 / options.length;
  const targetMod = ((-(winnerIndex + 0.5) * segmentDegrees) % 360 + 360) % 360;
  const currentMod = ((rotation % 360) + 360) % 360;
  const alignment = (targetMod - currentMod + 360) % 360;
  const turns = Math.max(5, Math.ceil(duration * 0.65));
  rotation += turns * 360 + alignment;

  isSpinning = true;
  updateControls();
  spinStatus.classList.add("spinning");
  wheelWrap.style.transition = `transform ${duration}s cubic-bezier(0.12, 0.72, 0.08, 1)`;

  requestAnimationFrame(() => {
    wheelWrap.style.transform = `rotate(${rotation}deg)`;
  });

  startCountdown(duration);

  const finish = () => {
    wheelWrap.removeEventListener("transitionend", finish);
    cancelAnimationFrame(countdownFrame);
    isSpinning = false;
    spinStatus.classList.remove("spinning");
    statusText.textContent = `Выпало: ${options[winnerIndex]}`;
    resultName.textContent = options[winnerIndex];
    resultModal.hidden = false;
    document.body.style.overflow = "hidden";
    updateControls();
  };

  wheelWrap.addEventListener("transitionend", finish, { once: true });
}

function startCountdown(duration) {
  const endTime = performance.now() + duration * 1000;

  const update = (now) => {
    const left = Math.max(0, Math.ceil((endTime - now) / 1000));
    statusText.textContent = left > 0 ? `Вращение · осталось ${left} сек` : "Определяем результат…";
    if (left > 0) countdownFrame = requestAnimationFrame(update);
  };

  countdownFrame = requestAnimationFrame(update);
}

function updateControls() {
  const cannotSpin = isSpinning || options.length < 2;
  spinButton.disabled = cannotSpin;
  spinCenter.disabled = cannotSpin;
  optionInput.disabled = isSpinning;
  customTime.disabled = isSpinning;
  timeChips.forEach((chip) => { chip.disabled = isSpinning; });
}

function closeModal() {
  resultModal.hidden = true;
  document.body.style.overflow = "";
}

addForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addOption(optionInput.value);
  optionInput.value = "";
  optionInput.focus();
});

timeChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    customTime.value = chip.dataset.time;
    timeChips.forEach((item) => item.classList.toggle("active", item === chip));
  });
});

customTime.addEventListener("input", () => {
  timeChips.forEach((chip) => chip.classList.toggle("active", chip.dataset.time === customTime.value));
});

customTime.addEventListener("change", () => {
  customTime.value = String(getDuration());
});

titleInput.addEventListener("input", () => updateTitle(titleInput.value));

spinButton.addEventListener("click", spin);
spinCenter.addEventListener("click", spin);
spinAgain.addEventListener("click", () => {
  closeModal();
  spin();
});

document.querySelectorAll("[data-close-modal]").forEach((element) => {
  element.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !resultModal.hidden) closeModal();
});

window.addEventListener("resize", drawWheel);
document.fonts?.ready.then(drawWheel);
titleInput.value = wheelTitleText;
updateTitle(wheelTitleText);
render();

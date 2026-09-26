document.querySelector('[data-screen="home"]').append(document.querySelector(".stageActions"));
// Shared journey navigation; opening settings never rebuilds the current drive.
let pageName = "home",
  expandedPreview = false,
  settingsReturnFocus = null;
const pageOrder = ["home", "vehicle", "maps", "weather", "mode", "ready"];
const roadDetails = {
  country: ["Countryside", "Rolling fields and sweeping country bends."],
  desert: ["Desert highway", "Wide horizons and a gentle, sun-baked highway."],
  suburbs: ["Suburban avenue", "Tree-lined streets, houses and crossings."],
  city: ["City boulevard", "A city drive through towers and busy avenues."],
  mountains: ["Mountain pass", "Climb an elevated road with winding turns."],
  forest: ["Forest trail", "A twisting route through deep green woodland."],
  canyon: [
    "Red rock canyon",
    "Follow the curves between warm red rock formations.",
  ],
};
const weatherDetails = {
  sunny: ["\u2600 Sunny day", "Clear skies and long views."],
  rain: ["\u2602 Rain + storm", "Wet roads, rainfall and lightning."],
  snow: ["\u2744 Snowy day", "Falling snow and a white landscape."],
  night: ["\u263e Night drive", "Stars above. Headlights on."],
};
const modeNames = {
  free: "Free ride",
  race: "30-second race",
  roam: "Open roam",
};
const roadKeys = Object.keys(roadDetails),
  weatherKeys = Object.keys(weatherDetails),
  modeKeys = Object.keys(modeNames);
function showPage(name) {
  if (state !== "lobby") return;
  pageName = pageOrder.includes(name) ? name : "home";
  document.body.dataset.page = pageName;
  const step = pageOrder.indexOf(pageName);
  $("#stepLabel").textContent = step
    ? "BUILD YOUR JOURNEY / " + String(step).padStart(2, "0") + " OF 05"
    : "ROAD CLUB / YOUR LOBBY";
  document
    .querySelectorAll("[data-page]")
    .forEach((b) =>
      b.classList.toggle("complete", pageOrder.indexOf(b.dataset.page) < step),
    );
  $("#nextHint").textContent = {
    home: "YOUR VEHICLE. YOUR ROAD. YOUR RULES.",
    vehicle: "UP NEXT / CHOOSE YOUR ROAD",
    maps: "UP NEXT / SET THE WEATHER",
    weather: "UP NEXT / FIND YOUR GAME MODE",
    mode: "UP NEXT / REVIEW YOUR JOURNEY",
    ready: "ALL SET / YOUR SELECTED JOURNEY IS READY",
  }[pageName];
  document
    .querySelectorAll("[data-screen]")
    .forEach((el) => (el.hidden = el.dataset.screen !== pageName));
  document.querySelectorAll("[data-page]").forEach((el) => {
    el.classList.toggle("active", el.dataset.page === pageName);
    if (el.dataset.page === pageName) el.setAttribute("aria-current", "step");
    else el.removeAttribute("aria-current");
  });
  $("#backBtn").hidden = pageName === "home";
  $("#nextBtn").hidden = pageName === "ready";
  $("#startBtn").hidden = pageName !== "ready";
  $("#nextBtn").textContent =
    pageName === "home" ? "START GAME \u2192" : "NEXT \u2192";
  $(".formOptions").scrollTop = 0;
  syncJourney();
  const heading = document.querySelector('[data-screen="' + pageName + '"] h2');
  if (heading) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
}
function syncJourney() {
  $("#lobbyMapValue").textContent = roadDetails[settings.road][0];
  $("#lobbyWeatherValue").textContent = weatherDetails[settings.weather][0];
  $("#lobbyModeValue").textContent = modeNames[settings.mode];
  for (const [id, label, value] of [
    ["mapsBtn", "map", roadDetails[settings.road][0]],
    ["lobbyWeatherBtn", "weather", weatherDetails[settings.weather][0]],
    ["lobbyModeBtn", "game mode", modeNames[settings.mode]],
  ])
    $("#" + id).setAttribute(
      "aria-label",
      "Next " + label + ". Current: " + value,
    );
  updateLobbyPreview();
  $("#homeVehicle").textContent = carNames[settings.car];
  $("#homeSummary").textContent =
    roadDetails[settings.road][0] +
    " \u00b7 " +
    weatherDetails[settings.weather][0] +
    " \u00b7 " +
    modeNames[settings.mode];
  $("#vehicleCount").textContent =
    settings.car +
    1 +
    " / " +
    carNames.length +
    " / " +
    vehicleCatalogue[settings.car].type.toUpperCase() +
    " / IN-GAME PERFORMANCE";
  $("#riderOptions").hidden = !isBike;
  $("#roadTitle").textContent = roadDetails[settings.road][0];
  $("#roadCount").textContent =
    roadKeys.indexOf(settings.road) + 1 + " / 7 roads";
  $("#roadDescription").textContent = roadDetails[settings.road][1];
  $("#weatherTitle").textContent = weatherDetails[settings.weather][0];
  $("#weatherDescription").textContent = weatherDetails[settings.weather][1];
  document.querySelectorAll(".mapPreview").forEach((preview) => {
    preview.dataset.road = settings.road;
    preview.dataset.weather = settings.weather;
    preview.setAttribute(
      "aria-label",
      roadDetails[settings.road][0] +
        " with " +
        weatherDetails[settings.weather][0],
    );
  });
  $("#weatherMapBadge").textContent = roadDetails[settings.road][0];
  $("#mapPreview").setAttribute(
    "aria-label",
    roadDetails[settings.road][0] +
      " with " +
      weatherDetails[settings.weather][0],
  );
  $("#mapBadge").textContent = roadDetails[settings.road][0];
  const summary = $("#journeySummary");
  summary.replaceChildren();
  for (const [label, value] of [
    ["Vehicle", carNames[settings.car]],
    ["Road", roadDetails[settings.road][0]],
    ["Weather", weatherDetails[settings.weather][0]],
    ["Game mode", modeNames[settings.mode]],
  ]) {
    const row = document.createElement("p"),
      key = document.createElement("span"),
      val = document.createElement("strong");
    key.textContent = label;
    val.textContent = value;
    const edit = document.createElement("button");
    edit.className = "summaryEdit";
    edit.textContent = "Edit";
    edit.setAttribute("aria-label", "Edit " + label.toLowerCase());
    edit.onclick = () =>
      showPage(
        {
          Vehicle: "vehicle",
          Road: "maps",
          Weather: "weather",
          "Game mode": "mode",
        }[label],
      );
    row.append(key, val, edit);
    summary.append(row);
  }
  $("#startBtn").textContent = "GO \u2192";
  syncExperience();
}
function selectVehicle(index) {
  if (state !== "lobby") return;
  settings.car = (index + carNames.length) % carNames.length;
  markButtons("[data-car]", "car", settings.car);
  rebuildCar();
  resetGarageView();
  syncJourney();
}
function cycle(property, values, delta) {
  settings[property] =
    values[
      (values.indexOf(settings[property]) + delta + values.length) %
        values.length
    ];
  syncJourney();
}
function setExpanded(value) {
  expandedPreview = value;
  document.body.classList.toggle("previewExpanded", value);
  $("#expandPreview").textContent = value
    ? "\u2199 Close full screen"
    : "\u26f6 Full screen";
  $("#expandPreview").setAttribute("aria-pressed", String(value));
  $("#expandPreview").setAttribute(
    "aria-label",
    value ? "Close full screen preview" : "Expand vehicle preview",
  );
  orbit.pointers.clear();
}
$("#expandPreview").onclick = () => setExpanded(!expandedPreview);
$("#rotateLeft").onclick = () => {
  orbit.auto = false;
  lobbyAngle -= Math.PI / 6;
};
$("#rotateRight").onclick = () => {
  orbit.auto = false;
  lobbyAngle += Math.PI / 6;
};
$("#zoomIn").onclick = () => {
  orbit.zoom = Math.max(0.7, orbit.zoom - 0.15);
};
$("#zoomOut").onclick = () => {
  orbit.zoom = Math.min(1.65, orbit.zoom + 0.15);
};
$("#prevVehicle").onclick = () => selectVehicle(settings.car - 1);
$("#nextVehicle").onclick = () => selectVehicle(settings.car + 1);
$("#prevRoad").onclick = () => cycle("road", roadKeys, -1);
$("#nextRoad").onclick = () => cycle("road", roadKeys, 1);
$("#prevWeather").onclick = () => cycle("weather", weatherKeys, -1);
$("#nextWeather").onclick = () => cycle("weather", weatherKeys, 1);
$("#selectVehicleBtn").onclick = () => showPage("vehicle");
$("#mapsBtn").onclick = () => cycle("road", roadKeys, 1);
$("#lobbyWeatherBtn").onclick = () => cycle("weather", weatherKeys, 1);
$("#lobbyModeBtn").onclick = () => cycle("mode", modeKeys, 1);
$("#nextBtn").onclick = () =>
  showPage(pageOrder[pageOrder.indexOf(pageName) + 1]);
$("#backBtn").onclick = () =>
  showPage(pageOrder[pageOrder.indexOf(pageName) - 1]);
document
  .querySelectorAll("[data-page]")
  .forEach((b) => (b.onclick = () => showPage(b.dataset.page)));
document
  .querySelectorAll("[data-car]")
  .forEach((b) => (b.onclick = () => selectVehicle(Number(b.dataset.car))));
document.querySelectorAll("[data-mode]").forEach(
  (b) =>
    (b.onclick = () => {
      settings.mode = b.dataset.mode;
      markButtons("[data-mode]", "mode", settings.mode);
      syncJourney();
    }),
);
document.addEventListener("vehiclechange", syncJourney);
document.addEventListener("journeychange", syncJourney);
function goHome() {
  setExpanded(false);
  $("#settingsOverlay").hidden = true;
  returnLobby();
  showPage("home");
  queueMicrotask(() => $("#selectVehicleBtn").focus());
}
function beginDrive() {
  setExpanded(false);
  $("#settingsOverlay").hidden = true;
  startGame();
  document.activeElement?.blur();
}
function resumeDrive() {
  if (state !== "paused" || !$("#settingsOverlay").hidden) return;
  clock.getDelta();
  state = "play";
  $("#pauseOverlay").hidden = true;
  ensureAudio();
  document.activeElement?.blur();
}
$("#startBtn").onclick = beginDrive;
$("#againBtn").onclick = beginDrive;
$("#restartBtn").onclick = beginDrive;
$("#lobbyBtn").onclick = pauseGame;
$("#resumeBtn").onclick = resumeDrive;
$("#pauseHomeBtn").onclick = goHome;
$("#resultGarageBtn").onclick = goHome;
function openSettings() {
  if (state !== "lobby" && state !== "paused") return;
  settingsReturnFocus = document.activeElement;
  $("#settingsContext").textContent =
    state === "paused"
      ? "Your drive stays paused. Save to return to the pause menu, then resume from the same place."
      : "Set up your sound, camera and graphics.";
  $("#soundSetting").checked = preferences.sound;
  $("#qualitySetting").value = preferences.quality;
  $("#cameraSetting").replaceChildren(
    ...cameraNames.map((name, i) => {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = name;
      return option;
    }),
  );
  $("#cameraSetting").value = cameraMode;
  $("#settingsOverlay").hidden = false;
  $("#soundSetting").focus();
}
function closeSettings() {
  preferences.sound = $("#soundSetting").checked;
  preferences.quality = $("#qualitySetting").value;
  cameraMode = Number($("#cameraSetting").value);
  resize();
  if (state === "paused") cameraPose(0, true);
  updateAudio();
  $("#settingsOverlay").hidden = true;
  queueMicrotask(() => settingsReturnFocus?.focus());
  saveJourney();
}
$("#pauseSettingsBtn").onclick = openSettings;
$("#homeSettingsBtn").onclick = openSettings;
$("#closeSettingsBtn").onclick = closeSettings;
addEventListener("keydown", (e) => {
  if (!$("#settingsOverlay").hidden) {
    if (e.code === "Escape") {
      e.preventDefault();
      closeSettings();
    }
    if (e.code === "Tab") {
      const controls = [
        ...$("#settingsOverlay").querySelectorAll("input,select,button"),
      ];
      const first = controls[0],
        last = controls.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    return;
  }
  if (e.code === "Escape" && state === "lobby") {
    e.preventDefault();
    if (expandedPreview) setExpanded(false);
    else if (pageName !== "home")
      showPage(pageOrder[pageOrder.indexOf(pageName) - 1]);
  }
});
// Small interface helpers keep the game engine independent from the menu.
const storageKey = "road-club-journey-v1";
let savedJourney = null;
try {
  savedJourney = JSON.parse(localStorage.getItem(storageKey));
} catch {
  /* Offline storage is optional. */
}
const routeArt = {
  country: "M110 260C80 200 370 180 270 115L239 80",
  desert: "M200 260L250 80",
  suburbs: "M180 260L180 180Q180 160 220 160L260 160L260 80",
  city: "M230 260L230 80",
  mountains: "M130 260C40 190 410 210 300 155S140 130 250 80",
  forest: "M140 260C320 220 90 180 270 145S310 105 250 80",
  canyon: "M140 260C90 190 365 200 310 145S210 115 250 80",
};
function saveJourney() {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ settings, preferences, cameraMode }),
    );
  } catch {
    /* Private browsing can disable local storage. */
  }
}
for (const road of roadKeys) {
  const b = document.createElement("button");
  b.className = "pick";
  b.dataset.roadChoice = road;
  b.textContent = roadDetails[road][0];
  b.onclick = () => {
    settings.road = road;
    syncJourney();
  };
  $("#roadChoices").append(b);
}
const weatherTags = {
  sunny: "CLEAR SKIES",
  rain: "RAIN & LIGHTNING",
  snow: "WINTER SCENERY",
  night: "STARS & HEADLIGHTS",
};
for (const [weather, details] of Object.entries(weatherDetails)) {
  const b = document.createElement("button");
  b.className = "pick";
  b.dataset.weatherChoice = weather;
  const icon = document.createElement("span"),
    text = document.createElement("span"),
    title = document.createElement("strong"),
    tag = document.createElement("small");
  icon.className = "weatherIcon";
  icon.textContent = details[0].split(" ")[0];
  icon.setAttribute("aria-hidden", "true");
  title.textContent = details[0].substring(2);
  tag.textContent = weatherTags[weather];
  text.append(title, tag);
  b.append(icon, text);
  b.onclick = () => {
    settings.weather = weather;
    syncJourney();
  };
  $("#weatherChoices").append(b);
}
function syncExperience() {
  $("#riderPreview").hidden = !isBike;
  $("#riderPreview").setAttribute(
    "aria-pressed",
    String(preferences.riderPreview),
  );
  const stats = $("#vehicleStats");
  stats.replaceChildren();
  $("#carSpec").textContent = specs[settings.car];
  for (const [label, value] of [
    [
      "TOP SPEED",
      Math.round(vehiclePerformance[settings.car].speed * 3.6) + " KM/H",
    ],
    [
      "ACCELERATION",
      vehiclePerformance[settings.car].acceleration + " M/S\u00b2",
    ],
    [
      "HANDLING",
      vehiclePerformance[settings.car].handling >= 1.3
        ? "Agile"
        : vehiclePerformance[settings.car].handling >= 1.05
          ? "Balanced"
          : "Steady",
    ],
    [
      "TURBO",
      Math.round(vehiclePerformance[settings.car].speed * 1.45 * 3.6) + " KM/H",
    ],
  ]) {
    const item = document.createElement("div"),
      small = document.createElement("small"),
      strong = document.createElement("strong");
    small.textContent = label;
    strong.textContent = value;
    item.append(small, strong);
    stats.append(item);
  }
  markButtons("[data-road-choice]", "roadChoice", settings.road);
  markButtons("[data-weather-choice]", "weatherChoice", settings.weather);
  document
    .querySelectorAll(".mapPreview svg > path[stroke]")
    .forEach((path) => path.setAttribute("d", routeArt[settings.road]));
  $("#autoRotate").setAttribute("aria-pressed", String(orbit.auto));
  saveJourney();
}
$("#riderPreview").onclick = () => {
  preferences.riderPreview = !preferences.riderPreview;
  $("#riderPreview").setAttribute(
    "aria-pressed",
    String(preferences.riderPreview),
  );
  saveJourney();
};
$("#quickDriveBtn").onclick = () => showPage("ready");
for (const road of roadKeys) {
  const option = document.createElement("option");
  option.value = road;
  option.textContent = roadDetails[road][0];
  $("#liveMapSelect").append(option);
}
$("#liveMapSelect").onchange = (e) => {
  changeLiveMap(e.target.value);
  e.target.blur();
};
$("#autoRotate").onclick = () => {
  orbit.auto = !orbit.auto;
  $("#autoRotate").setAttribute("aria-pressed", String(orbit.auto));
};
for (const name of ["pointerdown", "wheel"])
  renderer.domElement.addEventListener(name, () =>
    $("#autoRotate").setAttribute("aria-pressed", String(orbit.auto)),
  );
for (const id of ["rotateLeft", "rotateRight", "garageReset"])
  $("#" + id).addEventListener("click", () =>
    $("#autoRotate").setAttribute("aria-pressed", String(orbit.auto)),
  );
document.addEventListener("input", (e) => {
  if (e.target.id === "customColor") saveJourney();
});
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-color],[data-rider]")) saveJourney();
});
function activeDialog() {
  return !$("#settingsOverlay").hidden
    ? $("#settingsOverlay")
    : !$("#results").hidden
      ? $("#results")
      : !$("#pauseOverlay").hidden
        ? $("#pauseOverlay")
        : null;
}
function syncDialogs() {
  const dialog = activeDialog();
  $("#lobby").inert = Boolean(dialog);
  $("#hud").inert = Boolean(dialog);
  $("#pauseOverlay").inert = Boolean(dialog && dialog !== $("#pauseOverlay"));
  $("#results").inert = Boolean(dialog && dialog !== $("#results"));
  if (!$("#pauseOverlay").hidden)
    $("#pauseSummary").textContent =
      carNames[settings.car] +
      " / " +
      roadDetails[settings.road][0] +
      " / " +
      modeNames[settings.mode];
  if (dialog && !dialog.contains(document.activeElement))
    dialog.querySelector("input,select,button")?.focus();
}
const dialogObserver = new MutationObserver(syncDialogs);
for (const id of ["pauseOverlay", "settingsOverlay", "results"])
  dialogObserver.observe($("#" + id), {
    attributes: true,
    attributeFilter: ["hidden"],
  });
addEventListener(
  "keydown",
  (e) => {
    const dialog = activeDialog();
    if (dialog && e.code === "Tab") {
      const nodes = [...dialog.querySelectorAll("input,select,button")].filter(
        (el) => !el.disabled && !el.hidden,
      );
      const first = nodes[0],
        last = nodes.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        e.stopImmediatePropagation();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        e.stopImmediatePropagation();
        first.focus();
      }
      return;
    }
    if (dialog === $("#pauseOverlay") && e.code === "Escape") {
      e.preventDefault();
      e.stopImmediatePropagation();
      resumeDrive();
      return;
    }
    if (
      state !== "lobby" ||
      dialog ||
      expandedPreview ||
      e.repeat ||
      e.altKey ||
      e.ctrlKey ||
      e.metaKey
    )
      return;
    if (e.target.closest("input,select,button,a")) return;
    if (e.code === "Enter") {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (pageName === "ready") beginDrive();
      else showPage(pageOrder[pageOrder.indexOf(pageName) + 1]);
      return;
    }
    if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
      const delta = e.code === "ArrowLeft" ? -1 : 1;
      if (pageName === "vehicle") selectVehicle(settings.car + delta);
      else if (pageName === "maps") cycle("road", roadKeys, delta);
      else if (pageName === "weather") cycle("weather", weatherKeys, delta);
      else if (pageName === "mode") {
        cycle("mode", modeKeys, delta);
        markButtons("[data-mode]", "mode", settings.mode);
      } else return;
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  },
  true,
);
if (savedJourney && typeof savedJourney === "object") {
  const saved = savedJourney.settings || {};
  if (
    Number.isInteger(saved.car) &&
    saved.car >= 0 &&
    saved.car < vehicleCatalogue.length
  )
    settings.car = saved.car;
  if (Number.isInteger(saved.rider) && saved.rider >= 0 && saved.rider < 3)
    settings.rider = saved.rider;
  if (/^#[0-9a-f]{6}$/i.test(saved.color)) settings.color = saved.color;
  if (Object.hasOwn(roadDetails, saved.road)) settings.road = saved.road;
  if (Object.hasOwn(weatherDetails, saved.weather))
    settings.weather = saved.weather;
  if (Object.hasOwn(modeNames, saved.mode)) settings.mode = saved.mode;
  if (typeof savedJourney.preferences?.riderPreview === "boolean")
    preferences.riderPreview = savedJourney.preferences.riderPreview;
  if (typeof savedJourney.preferences?.sound === "boolean")
    preferences.sound = savedJourney.preferences.sound;
  if (["high", "low"].includes(savedJourney.preferences?.quality))
    preferences.quality = savedJourney.preferences.quality;
  if (
    Number.isInteger(savedJourney.cameraMode) &&
    savedJourney.cameraMode >= 0 &&
    savedJourney.cameraMode < cameraNames.length
  )
    cameraMode = savedJourney.cameraMode;
}
const entryVehicle = new URLSearchParams(location.search).get("vehicle");
if (entryVehicle === "bike") settings.car = 4;
else if (entryVehicle === "car") settings.car = 0;
rebuildCar();
resize();
setPaint(
  settings.color,
  document.querySelector('[data-color="' + settings.color + '"]')?.dataset
    .name || "Custom finish",
);
orbit.auto = !matchMedia("(prefers-reduced-motion: reduce)").matches;
for (const [selector, property] of [
  ["[data-car]", "car"],
  ["[data-mode]", "mode"],
  ["[data-rider]", "rider"],
])
  markButtons(selector, property, settings[property]);

showPage("home");

// Icon-only compact controls retain their accessible action names.
for (const [id, icon, label] of [
  ["cameraBtn", "?", "Change camera"], ["sceneBtn", "?", "Change weather"],
  ["resetBtn", "?", "Center vehicle"], ["lobbyBtn", "?", "Pause"],
  ["horn", "?", "Horn"], ["auto", "A", "Automatic drive"],
  ["turbo", "?", "Hold turbo"], ["reverse", "?", "Reverse"],
  ["brake", "?", "Brake"], ["accel", "?", "Accelerate"],
  ["expandPreview", "?", "Expand preview"], ["garageReset", "?", "Reset view"],
  ["autoRotate", "?", "Automatic rotation"], ["riderPreview", "?", "Show rider"]
]) {
  const el = document.getElementById(id);
  el.dataset.icon = icon;
  el.setAttribute("aria-label", label);
  el.title = label;
}
for (const el of document.querySelectorAll("#steps button")) {
  el.dataset.icon = {home:"?", vehicle:"?", maps:"?", weather:"?", mode:"?", ready:"?"}[el.dataset.page];
  el.setAttribute("aria-label", el.textContent.trim());
  el.title = el.textContent.trim();
}

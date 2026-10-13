// Drone Border Surveillance System
// Educational demo using simulated data only.
// No real drone, camera, GPS, or sensor connection.

"use strict";

const $ = (id) => document.getElementById(id);

const elements = {
  status: $("system-status"),
  monitoringValue: $("monitoring-value"),
  monitoringFoot: $("monitoring-foot"),
  eventsCount: $("events-count"),
  riskValue: $("risk-value"),
  riskFoot: $("risk-foot"),
  uptimeValue: $("uptime-value"),
  start: $("start-monitoring"),
  stop: $("stop-monitoring"),
  reset: $("reset-monitoring"),
  message: $("monitoring-message"),
  dot: $("status-dot"),
  select: $("intruder-select"),
  detectedTime: $("detected-time"),
  zone: $("border-zone"),
  exactLocation: $("exact-location"),
  currentLocation: $("current-location"),
  riskScore: $("risk-score"),
  riskBar: $("risk-bar"),
  riskDescription: $("risk-description"),
  graphCaption: $("graph-caption"),
  canvas: $("movement-chart"),
  map: $("surveillance-map"),
  drone: $("drone-marker"),
  intruder: $("intruder-marker"),
  mapCaption: $("map-caption"),
  alertList: $("alert-list"),
  alertCount: $("alert-count"),
  export: $("export-events")
};

const requiredIds = [
  "system-status", "monitoring-value", "monitoring-foot",
  "events-count", "risk-value", "risk-foot", "uptime-value",
  "start-monitoring", "stop-monitoring", "reset-monitoring",
  "monitoring-message", "status-dot", "intruder-select",
  "detected-time", "border-zone", "exact-location",
  "current-location", "risk-score", "risk-bar",
  "risk-description", "graph-caption", "movement-chart",
  "surveillance-map", "drone-marker", "intruder-marker",
  "map-caption", "alert-list", "alert-count", "export-events"
];

const missingIds = requiredIds.filter((id) => !$(id));

if (missingIds.length) {
  console.error("Dashboard elements missing:", missingIds.join(", "));
  throw new Error("Please check that index.html matches the dashboard version.");
}

const ctx = elements.canvas.getContext("2d");

const state = {
  running: false,
  timer: null,
  startedAt: null,
  elapsedBeforePause: 0,
  ticks: 0,
  events: [],
  selectedId: "",
  readings: [],
  lastRisk: 0
};

const zones = ["Zone Alpha", "Zone Bravo", "Zone Charlie"];
const simulatedPositions = [
  "Sector A-04",
  "Sector B-07",
  "Sector C-02",
  "Sector A-09",
  "Sector B-03",
  "Sector C-08"
];

function timeNow() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function riskLevel(score) {
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}

function setText(element, value) {
  element.textContent = value;
}

function createSimulatedEvent() {
  const score = randomBetween(15, 95);
  const id = `SIM-${String(state.events.length + 1).padStart(3, "0")}`;

  return {
    id,
    time: new Date(),
    zone: zones[randomBetween(0, zones.length - 1)],
    origin: simulatedPositions[randomBetween(0, simulatedPositions.length - 1)],
    current: simulatedPositions[randomBetween(0, simulatedPositions.length - 1)],
    risk: score,
    level: riskLevel(score)
  };
}

function renderEventOptions() {
  const previous = state.selectedId;
  elements.select.replaceChildren();

  if (!state.events.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No events yet";
    elements.select.appendChild(option);
    elements.select.disabled = true;
    return;
  }

  elements.select.disabled = false;

  state.events.forEach((event) => {
    const option = document.createElement("option");
    option.value = event.id;
    option.textContent = `${event.id} · ${event.level} · ${event.zone}`;
    elements.select.appendChild(option);
  });

  const stillExists = state.events.some((event) => event.id === previous);
  state.selectedId = stillExists ? previous : state.events[0].id;
  elements.select.value = state.selectedId;
}

function renderSelectedEvent() {
  const event = state.events.find((item) => item.id === state.selectedId);

  if (!event) {
    setText(elements.detectedTime, "--");
    setText(elements.zone, "--");
    setText(elements.exactLocation, "--");
    setText(elements.currentLocation, "--");
    return;
  }

  setText(elements.detectedTime, event.time.toLocaleTimeString());
  setText(elements.zone, event.zone);
  setText(elements.exactLocation, event.origin);
  setText(elements.currentLocation, event.current);
  setText(elements.riskScore, `${event.risk}/100`);
  setText(elements.riskDescription, `${event.level} simulated risk level`);
  elements.riskBar.style.width = `${event.risk}%`;

  moveMarkers(event);
}

function moveMarkers(event) {
  const positions = {
    "Sector A-04": [20, 28],
    "Sector B-07": [47, 55],
    "Sector C-02": [76, 29],
    "Sector A-09": [28, 68],
    "Sector B-03": [56, 34],
    "Sector C-08": [75, 68]
  };

  const origin = positions[event.origin] || [20, 28];
  const current = positions[event.current] || [75, 55];

  elements.drone.style.left = `${origin[0]}%`;
  elements.drone.style.top = `${origin[1]}%`;
  elements.intruder.style.left = `${current[0]}%`;
  elements.intruder.style.top = `${current[1]}%`;

  setText(
    elements.mapCaption,
    `${event.id}: simulated movement from ${event.origin} to ${event.current}.`
  );
}

function addAlert(event) {
  const empty = elements.alertList.querySelector(".empty-state");
  if (empty) empty.remove();

  const item = document.createElement("div");
  item.className = `alert-item ${event.level.toLowerCase()}`;

  const heading = document.createElement("div");
  heading.className = "alert-title";

  const title = document.createElement("span");
  title.textContent = `${event.id} · ${event.level} RISK`;

  const time = document.createElement("span");
  time.textContent = event.time.toLocaleTimeString();

  heading.append(title, time);

  const description = document.createElement("p");
  description.className = "alert-description";
  description.textContent = `${event.zone} · ${event.origin} → ${event.current}`;

  item.append(heading, description);
  elements.alertList.prepend(item);

  // Keep the visible activity feed compact.
  while (elements.alertList.children.length > 12) {
    elements.alertList.lastElementChild.remove();
  }

  setText(elements.alertCount, `${state.events.length} EVENTS`);
}

function updateStatistics() {
  setText(elements.eventsCount, String(state.events.length));
  setText(elements.riskValue, riskLevel(state.lastRisk));
  setText(
    elements.riskFoot,
    state.lastRisk >= 70
      ? "High simulated risk"
      : state.lastRisk >= 40
        ? "Moderate simulated risk"
        : "Low simulated risk"
  );

  setText(
    elements.monitoringValue,
    state.running ? "ACTIVE" : state.elapsedBeforePause > 0 ? "PAUSED" : "STANDBY"
  );

  setText(
    elements.monitoringFoot,
    state.running ? "Simulation running" :
      state.elapsedBeforePause > 0 ? "Session paused" : "Awaiting activation"
  );

  elements.status.classList.toggle("active", state.running);
  setText(elements.status, state.running ? "● Simulation Active" : "● Simulation Standby");

  elements.dot.classList.toggle("active", state.running);
  elements.dot.classList.toggle("stopped", !state.running && state.elapsedBeforePause > 0);

  setText(
    elements.message,
    state.running
      ? "Monitoring simulation is running."
      : state.elapsedBeforePause > 0
        ? "Monitoring is paused. Resume when ready."
        : "Simulation is ready to start."
  );

  elements.start.disabled = state.running;
  elements.stop.disabled = !state.running;
}

function elapsedSeconds() {
  const currentRun = state.running && state.startedAt
    ? Math.floor((Date.now() - state.startedAt) / 1000)
    : 0;

  return state.elapsedBeforePause + currentRun;
}

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateUptime() {
  setText(elements.uptimeValue, formatDuration(elapsedSeconds()));
}

function addReading() {
  const risk = randomBetween(10, 95);
  const distance = randomBetween(10, 100);

  state.lastRisk = risk;
  state.readings.push({
    label: timeNow(),
    risk,
    distance
  });

  if (state.readings.length > 12) state.readings.shift();

  drawGraph();
}

function drawGraph() {
  const canvas = elements.canvas;
  const rect = canvas.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;
  const width = Math.max(300, rect.width);
  const height = Math.max(200, rect.height || 300);

  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const padding = { left: 42, right: 16, top: 24, bottom: 38 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  ctx.font = "11px Inter, sans-serif";
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(156,174,204,0.15)";
  ctx.fillStyle = "#9caecc";

  for (let value = 0; value <= 100; value += 25) {
    const y = padding.top + graphHeight * (1 - value / 100);

    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    ctx.textAlign = "right";
    ctx.fillText(String(value), padding.left - 8, y + 4);
  }

  ctx.textAlign = "left";
  ctx.fillText("Risk / Distance", padding.left, 13);

  if (!state.readings.length) {
    ctx.textAlign = "center";
    ctx.fillStyle = "#9caecc";
    ctx.fillText("Start monitoring to generate simulated readings", width / 2, height / 2);
    return;
  }

  const drawLine = (key, stroke, dashed = false) => {
    if (!state.readings.length) return;

    ctx.beginPath();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2.5;
    ctx.setLineDash(dashed ? [5, 4] : []);

    state.readings.forEach((reading, index) => {
      const x = padding.left +
        (state.readings.length === 1
          ? graphWidth / 2
          : index * graphWidth / (state.readings.length - 1));

      const y = padding.top + graphHeight * (1 - reading[key] / 100);

      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
    ctx.setLineDash([]);

    state.readings.forEach((reading, index) => {
      const x = padding.left +
        (state.readings.length === 1
          ? graphWidth / 2
          : index * graphWidth / (state.readings.length - 1));
      const y = padding.top + graphHeight * (1 - reading[key] / 100);

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = stroke;
      ctx.fill();
    });
  };

  drawLine("risk", "#ff5876");
  drawLine("distance", "#26c8ff", true);

  ctx.textAlign = "left";
  ctx.fillStyle = "#ff5876";
  ctx.fillText("— Risk", padding.left, height - 10);
  ctx.fillStyle = "#26c8ff";
  ctx.fillText("- - Distance", padding.left + 75, height - 10);
}

function tick() {
  if (!state.running) return;

  state.ticks += 1;
  addReading();

  // Generate a sample event every third tick.
  if (state.ticks % 3 === 0) {
    const event = createSimulatedEvent();

    state.events.unshift(event);

    // Retain a bounded session history.
    if (state.events.length > 100) state.events.pop();

    state.selectedId = event.id;
    renderEventOptions();
    renderSelectedEvent();
    addAlert(event);
  }

  updateStatistics();
  updateUptime();
}

function startMonitoring() {
  if (state.running) return;

  state.running = true;
  state.startedAt = Date.now();
  updateStatistics();

  if (state.readings.length === 0) addReading();

  tick();
  state.timer = window.setInterval(tick, 2000);
}

function stopMonitoring() {
  if (!state.running) return;

  state.elapsedBeforePause += Math.floor((Date.now() - state.startedAt) / 1000);
  state.running = false;
  state.startedAt = null;

  if (state.timer !== null) {
    window.clearInterval(state.timer);
    state.timer = null;
  }

  updateStatistics();
  updateUptime();
}

function resetMonitoring() {
  if (state.timer !== null) {
    window.clearInterval(state.timer);
    state.timer = null;
  }

  state.running = false;
  state.startedAt = null;
  state.elapsedBeforePause = 0;
  state.ticks = 0;
  state.events = [];
  state.selectedId = "";
  state.readings = [];
  state.lastRisk = 0;

  renderEventOptions();
  renderSelectedEvent();

  elements.alertList.replaceChildren();
  const empty = document.createElement("p");
  empty.className = "empty-state";
  empty.textContent = "No alerts yet. Start monitoring to generate demo events.";
  elements.alertList.appendChild(empty);

  setText(elements.alertCount, "0 EVENTS");
  setText(elements.riskScore, "0/100");
  setText(elements.riskDescription, "Start the simulation to generate sample readings.");
  elements.riskBar.style.width = "0%";
  setText(elements.graphCaption, "The graph will update when monitoring starts.");
  setText(elements.mapCaption, "No active simulated movement.");
  elements.drone.style.left = "18%";
  elements.drone.style.top = "25%";
  elements.intruder.style.left = "72%";
  elements.intruder.style.top = "57%";

  drawGraph();
  updateStatistics();
  updateUptime();
}

function exportEvents() {
  if (!state.events.length) {
    window.alert("No simulated events to export yet. Start monitoring first.");
    return;
  }

  const rows = [
    ["Event ID", "Detected Time", "Zone", "Origin", "Current Position", "Risk Score", "Risk Level"],
    ...state.events.map((event) => [
      event.id,
      event.time.toLocaleString(),
      event.zone,
      event.origin,
      event.current,
      event.risk,
      event.level
    ])
  ];

  const csv = rows.map((row) =>
    row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
  ).join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "dbss-simulated-event-log.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

elements.start.addEventListener("click", startMonitoring);
elements.stop.addEventListener("click", stopMonitoring);
elements.reset.addEventListener("click", resetMonitoring);
elements.export.addEventListener("click", exportEvents);

elements.select.addEventListener("change", () => {
  state.selectedId = elements.select.value;
  renderSelectedEvent();
});

window.addEventListener("resize", drawGraph);

renderEventOptions();
drawGraph();
updateStatistics();
updateUptime();

console.log("DBSS simulation ready. All monitoring data is simulated.");

const intruderEvents = [
  {
    id: "INTR-2041",
    detectedTime: "2026-05-03 04:18 UTC",
    borderZone: "Northern Sector A1",
    exactLocation: "27.9839° N, 86.9226° E (Fence Marker A1-44)",
    currentLocation: "27.9912° N, 86.9370° E (Moving East, 22 km/h)",
    graphCaption: "Movement distance (km) and risk score over last 60 minutes",
    timeline: ["04:18", "04:28", "04:38", "04:48", "04:58", "05:08", "05:18"],
    distance: [0.4, 0.8, 1.3, 1.9, 2.4, 2.8, 3.1],
    risk: [38, 42, 55, 62, 70, 74, 79]
  },
  {
    id: "INTR-1987",
    detectedTime: "2026-05-03 01:55 UTC",
    borderZone: "Western Sector C2",
    exactLocation: "31.5300° N, 74.3500° E (Checkpoint C2-09)",
    currentLocation: "31.5418° N, 74.3622° E (Stationary, Thermal Signature Active)",
    graphCaption: "Track displacement and threat escalation over last 60 minutes",
    timeline: ["01:55", "02:05", "02:15", "02:25", "02:35", "02:45", "02:55"],
    distance: [0.2, 0.6, 1.1, 1.4, 1.6, 1.7, 1.7],
    risk: [30, 35, 44, 57, 61, 68, 72]
  },
  {
    id: "INTR-2120",
    detectedTime: "2026-05-02 23:40 UTC",
    borderZone: "Eastern Sector B4",
    exactLocation: "26.8467° N, 80.9462° E (Border Post B4-31)",
    currentLocation: "26.8594° N, 80.9635° E (Moving North-East, 18 km/h)",
    graphCaption: "Intruder drift trajectory and risk index over last 60 minutes",
    timeline: ["23:40", "23:50", "00:00", "00:10", "00:20", "00:30", "00:40"],
    distance: [0.5, 0.9, 1.5, 2.1, 2.6, 3.0, 3.4],
    risk: [41, 48, 53, 60, 66, 72, 76]
  }
];

const selectEl = document.getElementById("intruder-select");
const detectedTimeEl = document.getElementById("detected-time");
const borderZoneEl = document.getElementById("border-zone");
const exactLocationEl = document.getElementById("exact-location");
const currentLocationEl = document.getElementById("current-location");
const graphCaptionEl = document.getElementById("graph-caption");
const canvas = document.getElementById("movement-chart");
const ctx = canvas.getContext("2d");

function populateSelect() {
  intruderEvents.forEach((event, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${event.id} • ${event.borderZone}`;
    selectEl.appendChild(option);
  });
}

function drawChart(eventData) {
  const { timeline, distance, risk } = eventData;
  const width = canvas.width;
  const height = canvas.height;
  const padding = 40;

  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(159, 178, 220, 0.22)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i += 1) {
    const y = padding + (i * (height - padding * 2)) / 5;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  const maxDistance = Math.max(...distance) + 0.5;
  const maxRisk = 100;

  const xStep = (width - padding * 2) / (timeline.length - 1);

  const plotLine = (values, color, maxY) => {
    ctx.beginPath();
    values.forEach((value, i) => {
      const x = padding + i * xStep;
      const y = height - padding - (value / maxY) * (height - padding * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();

    values.forEach((value, i) => {
      const x = padding + i * xStep;
      const y = height - padding - (value / maxY) * (height - padding * 2);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  plotLine(distance, "#26c8ff", maxDistance);
  plotLine(risk, "#00ffc6", maxRisk);

  ctx.fillStyle = "#9caecc";
  ctx.font = "12px Inter, sans-serif";
  timeline.forEach((label, i) => {
    const x = padding + i * xStep;
    ctx.fillText(label, x - 12, height - 14);
  });

  ctx.fillStyle = "#26c8ff";
  ctx.fillText("Distance (km)", padding, 20);
  ctx.fillStyle = "#00ffc6";
  ctx.fillText("Risk Score", padding + 110, 20);
}

function renderEvent(index) {
  const eventData = intruderEvents[index];
  detectedTimeEl.textContent = eventData.detectedTime;
  borderZoneEl.textContent = eventData.borderZone;
  exactLocationEl.textContent = eventData.exactLocation;
  currentLocationEl.textContent = eventData.currentLocation;
  graphCaptionEl.textContent = eventData.graphCaption;
  drawChart(eventData);
}

selectEl.addEventListener("change", (event) => {
  renderEvent(Number(event.target.value));
});

populateSelect();
renderEvent(0);

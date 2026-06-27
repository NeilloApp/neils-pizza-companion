const $ = (id) => document.getElementById(id);

const yeastTable = {
  24: { summer: 0.0008, mild: 0.0010, winter: 0.0012 },
  48: { summer: 0.0011, mild: 0.0014, winter: 0.0016 },
  72: { summer: 0.0008, mild: 0.0010, winter: 0.0012 }
};

function round(value, decimals = 1) {
  return Number(value).toFixed(decimals);
}

function calculateDough() {
  const balls = Number($("balls").value);
  const ballWeight = Number($("ballWeight").value);
  const hydration = Number($("hydration").value) / 100;
  const ferment = $("ferment").value;
  const temp = $("temperature").value;

  const saltPct = 0.026;
  const oilPct = 0.02;
  const sugarPct = 0.015;
  const yeastPct = yeastTable[ferment][temp];

  const totalDough = balls * ballWeight;
  const flour = totalDough / (1 + hydration + saltPct + oilPct + sugarPct + yeastPct);
  const water = flour * hydration;
  const salt = flour * saltPct;
  const oil = flour * oilPct;
  const sugar = flour * sugarPct;
  const yeast = flour * yeastPct;

  $("ingredients").innerHTML = `
    <div class="result-row"><span>Total dough</span><strong>${round(totalDough, 0)} g</strong></div>
    <div class="result-row"><span>Flour</span><strong>${round(flour, 0)} g</strong></div>
    <div class="result-row"><span>Water</span><strong>${round(water, 0)} g</strong></div>
    <div class="result-row"><span>Salt</span><strong>${round(salt, 1)} g</strong></div>
    <div class="result-row"><span>Olive oil</span><strong>${round(oil, 1)} g</strong></div>
    <div class="result-row"><span>Sugar</span><strong>${round(sugar, 1)} g</strong></div>
    <div class="result-row"><span>Instant yeast</span><strong>${round(yeast, 2)} g</strong></div>
    <div class="result-row"><span>Dough balls</span><strong>${balls} x ${ballWeight} g</strong></div>
  `;
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function formatDateTime(date) {
  return date.toLocaleString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit"
  });
}

function buildTimeline() {
  const date = $("pizzaDate").value;
  const time = $("pizzaTime").value;
  const ferment = Number($("ferment").value);

  if (!date || !time) {
    $("timeline").innerHTML = `<p>Please choose a pizza date and time.</p>`;
    return;
  }

  const pizzaTime = new Date(`${date}T${time}`);
  const mixTime = addHours(pizzaTime, -ferment);
  const removeTime = addHours(pizzaTime, -4.5);
  const preheatTime = addHours(pizzaTime, -1);
  const stretchTime = addHours(pizzaTime, -0.25);

  const items = [
    [mixTime, "Mix dough: flour, water, sugar and yeast first."],
    [addHours(mixTime, 0.33), "Add salt, then knead."],
    [addHours(mixTime, 0.5), "Add olive oil and knead until smooth."],
    [addHours(mixTime, 0.85), "Divide, ball, oil containers and refrigerate."],
    [removeTime, "Remove dough from fridge."],
    [preheatTime, "Preheat Ovana oven."],
    [stretchTime, "Stretch first pizza."],
    [pizzaTime, "Launch first pizza."]
  ];

  $("timeline").innerHTML = items.map(([when, text]) => `
    <div class="timeline-item">
      <div class="timeline-time">${formatDateTime(when)}</div>
      <div class="timeline-text">${text}</div>
    </div>
  `).join("");
}

function saveJournal() {
  const text = $("journalText").value.trim();

  if (!text) return;

  const entries = JSON.parse(localStorage.getItem("pizzaJournal") || "[]");

  entries.unshift({
    date: new Date().toLocaleString("en-AU"),
    text
  });

  localStorage.setItem("pizzaJournal", JSON.stringify(entries));
  $("journalText").value = "";
  renderJournal();
}

function renderJournal() {
  const entries = JSON.parse(localStorage.getItem("pizzaJournal") || "[]");

  if (entries.length === 0) {
    $("journalEntries").innerHTML = `<p>No journal entries yet.</p>`;
    return;
  }

  $("journalEntries").innerHTML = entries.map(entry => `
    <div class="journal-entry">
      <strong>${entry.date}</strong>
      <p>${entry.text}</p>
    </div>
  `).join("");
}

function setDefaultDate() {
  const today = new Date();
  today.setDate(today.getDate() + 2);
  $("pizzaDate").value = today.toISOString().split("T")[0];
}

$("calculateBtn").addEventListener("click", calculateDough);
$("timelineBtn").addEventListener("click", buildTimeline);
$("saveJournalBtn").addEventListener("click", saveJournal);

setDefaultDate();
calculateDough();
buildTimeline();
renderJournal();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

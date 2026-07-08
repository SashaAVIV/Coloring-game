/* ============================================================
   app.js — Dashboard bootstrapping
   ============================================================ */

const riskLevel = (score) => {
  if (score >= 85) return { label: "מלחמה אזורית",       color: "#dc2626", bg: "rgba(220,38,38,0.18)" };
  if (score >= 70) return { label: "מלחמה מוגבלת פעילה", color: "#ef4444", bg: "rgba(239,68,68,0.15)" };
  if (score >= 55) return { label: "מלחמת פרוקסי חמה",   color: "#fb923c", bg: "rgba(251,146,60,0.15)" };
  if (score >= 40) return { label: "מתח מוגבר",          color: "#fbbf24", bg: "rgba(251,191,36,0.15)" };
  if (score >= 20) return { label: "מתח קר",             color: "#84cc16", bg: "rgba(132,204,22,0.15)" };
  return            { label: "רגיעה",                    color: "#34d399", bg: "rgba(52,211,153,0.15)" };
};

const scoreColor = (score) => {
  if (score >= 80) return "#ef4444";
  if (score >= 65) return "#fb923c";
  if (score >= 45) return "#fbbf24";
  if (score >= 25) return "#84cc16";
  return "#34d399";
};

const formatTime = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const formatDate = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}`;
};

/* ---------- Gauge ---------- */
function renderGauge(score) {
  const arcLen = 251.2;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const arc = document.getElementById("gauge-arc");
  arc.style.strokeDashoffset = String(arcLen * (1 - pct));

  const needle = document.getElementById("gauge-needle");
  const angle = -90 + pct * 180;
  needle.setAttribute("transform", `rotate(${angle} 100 110)`);

  const probEl = document.getElementById("probability");
  animateNumber(probEl, parseInt(probEl.textContent) || 0, score, 900);

  const level = riskLevel(score);
  const lvlEl = document.getElementById("risk-level");
  lvlEl.textContent = `רמת סיכון: ${level.label}`;
  lvlEl.style.color = level.color;
  lvlEl.style.background = level.bg;
}

function animateNumber(el, from, to, duration) {
  const start = performance.now();
  const step = (t) => {
    const p = Math.min(1, (t - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- Delta ---------- */
function renderDelta(delta) {
  const arrow = document.getElementById("delta-arrow");
  const val = document.getElementById("delta-value");
  if (delta > 0) {
    arrow.textContent = "▲";
    arrow.style.color = "#ef4444";
    val.textContent = `+${delta}`;
    val.style.color = "#ef4444";
  } else if (delta < 0) {
    arrow.textContent = "▼";
    arrow.style.color = "#34d399";
    val.textContent = String(delta);
    val.style.color = "#34d399";
  } else {
    arrow.textContent = "·";
    arrow.style.color = "#8a95a8";
    val.textContent = "0";
    val.style.color = "#e6edf5";
  }
}

/* ---------- Headline & top drivers ---------- */
function renderHeadline(data) {
  document.getElementById("hero-headline").textContent = data.headline;

  const top = [...data.factors]
    .map(f => ({ ...f, contrib: f.score * f.weight }))
    .sort((a, b) => b.contrib - a.contrib)
    .slice(0, 3);

  const ul = document.getElementById("top-drivers");
  ul.innerHTML = top.map(f => `
    <li>
      <span class="driver-name">${f.name}</span>
      <span class="driver-contrib" style="color:${scoreColor(f.score)}">${f.score}</span>
    </li>
  `).join("");
}

/* ---------- Factors ---------- */
function renderFactors(factors) {
  const container = document.getElementById("factor-rows");
  container.innerHTML = factors.map(f => `
    <div class="factor-row">
      <div class="factor-name">
        ${f.name}
        <span class="factor-desc">${f.desc}</span>
      </div>
      <div class="factor-bar-wrap">
        <div class="factor-bar" style="width:${f.score}%; background:${scoreColor(f.score)}"></div>
      </div>
      <div class="factor-score" style="color:${scoreColor(f.score)}">${f.score}</div>
      <div class="factor-weight">משקל ${Math.round(f.weight * 100)}%</div>
    </div>
  `).join("");
}

/* ---------- Map ---------- */
let mapInstance = null;
let mapLayers = [];

function renderMap(assets) {
  if (!mapInstance) {
    mapInstance = L.map("map", {
      center: [25.5, 51],
      zoom: 5,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false,
    });
    // tiles disabled for offline preview

    // Iran outline approximation polygon
    L.polygon([
      [25.0, 61.8], [25.3, 58.3], [25.4, 56.2], [26.5, 54.5],
      [27.9, 51.0], [30.3, 49.0], [31.5, 48.0], [32.5, 47.8],
      [34.5, 45.4], [37.6, 44.5], [39.7, 44.5], [39.3, 48.2],
      [38.4, 50.1], [37.4, 53.9], [37.8, 58.0], [35.1, 61.2],
      [34.0, 60.9], [31.4, 61.7], [29.3, 62.6], [25.0, 61.8]
    ], {
      color: "#ef4444",
      weight: 2,
      fillColor: "#ef4444",
      fillOpacity: 0.08,
      dashArray: "4 6",
    }).addTo(mapInstance).bindPopup("<strong>איראן</strong>");
  }

  // clear existing markers
  mapLayers.forEach(l => mapInstance.removeLayer(l));
  mapLayers = [];

  const labelFor = (t) => ({ carrier: "CV", ddg: "DDG", amph: "LHD", base: "AB", strike: "✕" }[t] || "");
  const typeHe = (t) => ({ carrier: "נושאת", ddg: "משחתת", amph: "נחיתה", base: "בסיס", strike: "מטרה שנפגעה" }[t] || "");

  assets.forEach(a => {
    const icon = L.divIcon({
      className: "",
      html: `<div class="asset-marker ${a.type}">${labelFor(a.type)}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    const m = L.marker([a.lat, a.lng], { icon }).addTo(mapInstance);
    m.bindPopup(`
      <strong>${a.hebName}</strong><br/>
      <span style="color:#8a95a8;font-size:11px">${a.name}</span><br/>
      <div style="margin-top:6px;font-size:12px">${typeHe(a.type)}${a.crew ? ` · ${a.crew.toLocaleString()} אנשי צוות` : ""}</div>
      <div style="margin-top:4px;font-size:12px;color:#cbd5e1">${a.note || ""}</div>
    `);
    mapLayers.push(m);
  });
}

/* ---------- Air activity ---------- */
function renderAir(air) {
  const grid = document.getElementById("air-grid");
  const items = Object.entries(air);
  const trendSym = { up: "▲ מעל ממוצע", down: "▼ מתחת לממוצע", flat: "● רגיל" };
  grid.innerHTML = items.map(([k, v]) => `
    <div class="air-item">
      <div class="label">${v.label}</div>
      <div class="value">${v.value}<span class="unit">${v.unit}</span></div>
      <div class="trend ${v.trend}">${trendSym[v.trend]}</div>
    </div>
  `).join("");
}

let tankerChart = null;
function renderTankerSpark(history) {
  const ctx = document.getElementById("tanker-spark");
  if (tankerChart) tankerChart.destroy();
  tankerChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: history.map((_, i) => `-${history.length - i}ד׳`),
      datasets: [{
        data: history,
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56,189,248,0.15)",
        fill: true,
        tension: 0.38,
        pointRadius: 0,
        borderWidth: 2,
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: { display: false, beginAtZero: false },
      },
      animation: { duration: 600 },
      maintainAspectRatio: false,
    }
  });
}

/* ---------- Oil ---------- */
function renderOil(oil) {
  const fmt = (v) => `$${v.toFixed(2)}`;
  const fmtChange = (c) => (c > 0 ? "+" : "") + c.toFixed(2) + "%";

  document.getElementById("brent-price").textContent = fmt(oil.brent);
  document.getElementById("wti-price").textContent = fmt(oil.wti);
  document.getElementById("ovx-price").textContent = oil.ovx.toFixed(2);

  const setChange = (elId, val) => {
    const el = document.getElementById(elId);
    el.textContent = fmtChange(val);
    el.className = "c " + (val >= 0 ? "up" : "down");
  };
  setChange("brent-change", oil.brentChange);
  setChange("wti-change", oil.wtiChange);
  setChange("ovx-change", oil.ovxChange);

  const pill = document.getElementById("oil-pill");
  const avg = (oil.brentChange + oil.wtiChange) / 2;
  if (avg > 0.5) {
    pill.textContent = "פרמיית סיכון עולה";
    pill.className = "pill up";
  } else if (avg < -0.5) {
    pill.textContent = "פרמיית סיכון יורדת";
    pill.className = "pill down";
  } else {
    pill.textContent = "שוק יציב";
    pill.className = "pill flat";
  }
}

let oilChartObj = null;
function renderOilChart(history) {
  const ctx = document.getElementById("oil-chart");
  if (oilChartObj) oilChartObj.destroy();

  const labels = history.map((_, i) => `-${history.length - i - 1}י׳`);
  oilChartObj = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Brent $/brl",
        data: history,
        borderColor: "#fbbf24",
        backgroundColor: "rgba(251,191,36,0.12)",
        fill: true,
        tension: 0.32,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#131a24",
          titleColor: "#e6edf5",
          bodyColor: "#e6edf5",
          borderColor: "#1f2a3a",
          borderWidth: 1,
        }
      },
      scales: {
        x: { ticks: { color: "#5b6676", font: { size: 10 } }, grid: { display: false } },
        y: {
          ticks: { color: "#5b6676", font: { size: 10 }, callback: (v) => "$" + v },
          grid: { color: "rgba(255,255,255,0.04)" }
        },
      },
      maintainAspectRatio: false,
      animation: { duration: 800 },
    }
  });
}

/* ---------- Proxy ---------- */
function renderProxies(proxies) {
  const grid = document.getElementById("proxy-grid");
  grid.innerHTML = proxies.map(p => `
    <div class="proxy-item">
      <div class="name">${p.name}</div>
      <div class="region">${p.region}</div>
      <div class="metric">
        <span>${p.metric}</span>
        <strong>${p.value}</strong>
      </div>
      <span class="level ${p.level}">${
        p.level === "CRIT" ? "קריטי" :
        p.level === "HIGH" ? "גבוה" :
        p.level === "MED"  ? "מוגבר" : "נמוך"
      }</span>
    </div>
  `).join("");
}

/* ---------- News ---------- */
function renderNews(news) {
  const list = document.getElementById("news-list");
  const tagLabel = { hawk: "הסלמה", dove: "הרגעה", neutral: "ניטרלי" };
  list.innerHTML = news.map(n => `
    <li class="news-item">
      <span class="time">${n.time}</span>
      <span class="title">${n.title}</span>
      <span class="tag ${n.tag}">${tagLabel[n.tag]}</span>
    </li>
  `).join("");
}

/* ---------- Hormuz Status ---------- */
function renderHormuz(stats, stuckShips) {
  const grid = document.getElementById("hormuz-stats");
  grid.innerHTML = stats.map(s => `
    <div class="nuke-stat">
      <div class="k">${s.k}</div>
      <div class="v">${s.v}</div>
    </div>
  `).join("");

  const pct = Math.min(100, (stuckShips / 120) * 100);
  document.getElementById("stuck-bar").style.width = pct + "%";
  document.getElementById("stuck-val").textContent = `${stuckShips} / 120`;
}

/* ---------- History ---------- */
let historyChart = null;
function renderHistory(history, events) {
  const ctx = document.getElementById("history-chart");
  const labels = history.map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (history.length - 1 - i));
    return formatDate(d);
  });

  const colors = history.map(v => scoreColor(v));

  if (historyChart) historyChart.destroy();
  historyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "ציון סיכון",
        data: history,
        borderColor: "#ef4444",
        backgroundColor: (ctx) => {
          const c = ctx.chart.ctx;
          const g = c.createLinearGradient(0, 0, 0, 200);
          g.addColorStop(0, "rgba(239,68,68,0.4)");
          g.addColorStop(1, "rgba(239,68,68,0.02)");
          return g;
        },
        fill: true,
        tension: 0.3,
        pointRadius: (c) => c.dataIndex === history.length - 1 ? 5 : 0,
        pointBackgroundColor: colors,
        pointBorderColor: "#fff",
        borderWidth: 2,
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#131a24",
          titleColor: "#e6edf5",
          bodyColor: "#e6edf5",
          borderColor: "#1f2a3a",
          borderWidth: 1,
          callbacks: {
            label: (c) => `ציון: ${c.parsed.y}`
          }
        }
      },
      scales: {
        x: { ticks: { color: "#5b6676", font: { size: 10 }, maxTicksLimit: 10 }, grid: { display: false } },
        y: {
          min: 0, max: 100,
          ticks: { color: "#5b6676", font: { size: 10 } },
          grid: { color: "rgba(255,255,255,0.04)" }
        },
      },
      maintainAspectRatio: false,
      animation: { duration: 900 },
    }
  });

  const eventsEl = document.getElementById("history-events");
  eventsEl.innerHTML = events.map(e => `<span class="event-chip">${e}</span>`).join("");
}

/* ---------- Full render ---------- */
function render() {
  const data = DATA();
  document.getElementById("last-update").textContent =
    `עדכון אחרון: ${formatTime(data.timestamp)}`;

  renderGauge(data.overallScore);
  renderDelta(data.delta);
  renderHeadline(data);
  renderFactors(data.factors);
  renderMap(data.navalAssets);
  renderAir(data.airActivity);
  renderTankerSpark(data.tankerHistory);
  renderOil(data.oil);
  renderOilChart(data.oil.history);
  renderProxies(data.proxies);
  renderNews(data.news);
  renderHormuz(data.hormuzStats, data.stuckShips);
  renderHistory(data.history, data.historyEvents);
}

/* Init + refresh loop */
document.addEventListener("DOMContentLoaded", () => {
  render();
  setInterval(render, 60_000);
});

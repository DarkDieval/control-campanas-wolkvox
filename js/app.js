// ─── Configuración ────────────────────────────────────────────────────────────
const BASE = ""; // vacío = usa el mismo servidor (funciona en local y en Railway)

// ─── Datos de operaciones ─────────────────────────────────────────────────────
const OPERACIONES = [
  { key: "colombia",       nombre: "Colombia",       op: "ars-colombia",       flag: "🇨🇴", activo: true  },
  { key: "ecuador",        nombre: "Ecuador",        op: "ars-ecuador",        flag: "🇪🇨", activo: true  },
  { key: "panama_compras", nombre: "Panamá Compras", op: "aros-ba-compras",    flag: "🇵🇦", activo: true  },
  { key: "guatemala",      nombre: "Guatemala",      op: "ars-guatemala",      flag: "🇬🇹", activo: true  },
  { key: "honduras",       nombre: "Honduras",       op: "ars-honduras",       flag: "🇭🇳", activo: true  },
  { key: "panama_bge",     nombre: "Panamá BGE",     op: "aros-banco-general", flag: "🇵🇦", activo: true  },
  { key: "nicaragua",      nombre: "Nicaragua",      op: "ars-col-nicaragua",  flag: "🇳🇮", activo: false },
];

// ─── Construir tarjetas ───────────────────────────────────────────────────────
function construirTarjetas() {
  const grid = document.getElementById("grid");

  OPERACIONES.forEach(op => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-header">
        <span class="flag">${op.flag}</span>
        <div>
          <div class="card-title">${op.nombre}</div>
          <div class="card-op">${op.op}</div>
        </div>
      </div>
      <span class="badge ${op.activo ? "activo" : "pendiente"}">
        ${op.activo ? "Activo" : "Token pendiente"}
      </span>
      <input
        type="text"
        id="input-${op.key}"
        placeholder="ID de campaña"
        ${!op.activo ? "disabled" : ""}
      />
      <div class="btn-row">
        <button
          class="btn btn-start"
          onclick="accion('${op.key}', 'encender')"
          ${!op.activo ? "disabled" : ""}
        >▶ Encender</button>
        <button
          class="btn btn-stop"
          onclick="accion('${op.key}', 'detener')"
          ${!op.activo ? "disabled" : ""}
        >⏹ Detener</button>
      </div>
      <div class="resultado" id="res-${op.key}"></div>
    `;
    grid.appendChild(card);
  });
}

// ─── Acción encender / detener ────────────────────────────────────────────────
async function accion(operacionKey, tipo) {
  const input = document.getElementById(`input-${operacionKey}`);
  const resEl = document.getElementById(`res-${operacionKey}`);
  const id    = input.value.trim();

  if (!id) {
    mostrarToast("⚠️ Ingresa un ID de campaña", "err");
    input.focus();
    return;
  }

  const endpoint = tipo === "encender" ? "/campana/encender" : "/campana/detener";

  resEl.className  = "resultado visible";
  resEl.textContent = "Enviando...";

  try {
    const res = await fetch(`${BASE}${endpoint}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ campana_id: id, operacion: operacionKey })
    });

    const data  = await res.json();
    const label = tipo === "encender" ? "encendida" : "detenida";

    if (data.error) {
      resEl.className   = "resultado visible err";
      resEl.textContent = `✗ ${data.error}`;
      mostrarToast(`Error: ${data.error}`, "err");
    } else {
      resEl.className   = "resultado visible ok";
      resEl.textContent = `✓ ${data.msg || JSON.stringify(data)}`;
      mostrarToast(`Campaña ${label} correctamente ✓`, "ok");
    }
  } catch (err) {
    resEl.className   = "resultado visible err";
    resEl.textContent = `✗ ${err.message}`;
    mostrarToast("Error de conexión con el servidor", "err");
  }
}

// ─── Toast ────────────────────────────────────────────────────────────────────
let toastTimer;

function mostrarToast(msg, tipo) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className   = `show ${tipo}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = ""; }, 3000);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", construirTarjetas);
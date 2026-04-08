const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); 

// --- Operaciones por país ---
const OPERACIONES = {
    ecuador: {
        nombre: "Ecuador",
        server: "0004",
        token: "7b69645f6469737472697d2d3230323530373033313133353231"
    },
    nicaragua: {
        nombre: "Nicaragua",
        server: "0033",
        token: "PENDIENTE"
    },
    panama_bge: {  
        nombre: "Panamá BGE",
        server: "0005",
        token: "0000"
    },
    colombia: {
        nombre: "Colombia",
        server: "0014",
        token: "7b69645f6469737472697d2d3230323530373033313133313032"
    },
    honduras: {
        nombre: "Honduras",
        server: "0004",
        token: "7b69645f6469737472697d2d3230323530373033313134313339"
    },
    guatemala: {
        nombre: "Guatemala",
        server: "0004",
        token: "7b69645f6469737472697d2d3230323530373033313134363439"
    },
    panama_compras: {
        nombre: "Panamá Compras",
        server: "0005",
        token: "7b69645f6469737472697d2d3230323530373033313133343435"
    }
};

// --- Helper: llamada a Wolkvox ---
async function llamarWolkvox(operacionKey, campana_id, accion) {
    const op = OPERACIONES[operacionKey];

    if (!op) {
        throw new Error(`Operación "${operacionKey}" no encontrada`);
    }
    if (op.token === "PENDIENTE") {
        throw new Error(`El token de ${op.nombre} aún está pendiente de configuración`);
    }

    const url = `https://wv${op.server}.wolkvox.com/api/v2/campaign.php?api=${accion}&campaign_id=${campana_id}`;
    console.log(`[${op.nombre}] ${accion.toUpperCase()} campaña ${campana_id}`);

    const response = await fetch(url, {
        method: "PUT",
        headers: { "wolkvox-token": op.token }
    });

    const texto = await response.text();
    console.log(`[${op.nombre}] Respuesta:`, texto);
    return JSON.parse(texto);
}

// --- Rutas ---
app.post("/campana/encender", async (req, res) => {
    const { campana_id, operacion } = req.body;
    try {
        const data = await llamarWolkvox(operacion, campana_id, "start");
        res.json(data);
    } catch (err) {
        console.error("Error encender:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post("/campana/detener", async (req, res) => {
    const { campana_id, operacion } = req.body;
    try {
        const data = await llamarWolkvox(operacion, campana_id, "stop");
        res.json(data);
    } catch (err) {
        console.error("Error detener:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- Ruta para servir index.html ---
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// --- Iniciar servidor ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
    console.log(`📱 Abre en navegador: http://localhost:${PORT}`);
});
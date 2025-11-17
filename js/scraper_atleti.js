// scraper_atleti.js

import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { load } from "cheerio";
import { fileURLToPath } from "url";

// ==== RUTA CORRECTA A data.json ====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, "../data/data.json");

// ==== URL de Transfermarkt ====
const TM_URL =
  "https://www.transfermarkt.es/atletico-madrid/startseite/verein/13/saison_id/2024";

// ID inicial
const START_ID = 100044;

// Limpieza básica
function limpiar(texto) {
  return texto?.trim().replace(/\s+/g, " ") ?? "";
}

// Descargar página con headers reales
async function fetchPage(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
    },
  });

  return load(await res.text());
}

// Scraper REAL para Transfermarkt (2024)
async function scrapePlayers() {
  const $ = await fetchPage(TM_URL);

  const jugadores = [];

  // Cada jugador está dentro de la tabla .items
  $("table.items tbody tr").each((i, tr) => {
    const row = $(tr);

    const nombre = limpiar(row.find("td.hauptlink a").text());
    if (!nombre) return;

    // Posición aparece en un td.posrela
    const posicion = limpiar(row.find("td.posrela").text());

    // Nacionalidad (tooltip del icono)
    const nacionalidad =
      row.find("td.zentriert img.flaggenrahmen").attr("title") || "";

    // Imagen del jugador
    const foto =
      row.find("img.bilderrahmen").attr("data-src") ||
      row.find("img.bilderrahmen").attr("src") ||
      "";

    jugadores.push({
      nombre,
      posiciones: posicion ? [posicion] : [],
      nacionalidad,
      imagen_url: foto,
    });
  });

  return jugadores;
}

async function main() {
  const lista = await scrapePlayers();

  console.log("✔ Jugadores encontrados:", lista.length);

  // Cargar JSON base
  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));

  // Generar IDs incrementales
  let id = START_ID;

  const nuevos = lista.map((j) => ({
    id: id++,
    nombre: j.nombre,

    fecha_nacimiento: "",
    lugar_nacimiento: "",
    nacionalidad: j.nacionalidad,
    numero_camiseta: "",
    posiciones: j.posiciones,
    estado: "activo",
    altura: "",
    peso: "",

    equipos_historial: [],

    estadisticas: {
      club: { partidos: 0, goles: 0, asistencias: 0 },
      seleccion: { partidos: 0, goles: 0 },
    },

    imagen_url: j.imagen_url,
  }));

  // Añadir jugadores al JSON global
  data.jugadores.push(...nuevos);

  // Buscar Atlético dentro de data.json
  const atleti = data.equipos.find(
    (e) => e.nombre.toLowerCase() === "atlético de madrid" ||
            e.nombre.toLowerCase() === "atletico de madrid"
  );

  if (atleti) {
    atleti.jugadores.push(...nuevos.map((j) => j.id));
    console.log("✔ IDs añadidos al Atlético de Madrid.");
  } else {
    console.log("⚠ No encontré al Atlético de Madrid en data.json");
  }

  // Guardar cambios
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

  console.log("🎉 Listo. Jugadores insertados:", nuevos.length);
}

main();

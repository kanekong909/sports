// asignar_ids_selecciones.js
import fs from "fs";
import path from "path";

const dataPath = path.join(process.cwd(), "data", "data.json");

// Leer JSON
const raw = fs.readFileSync(dataPath, "utf8");
const data = JSON.parse(raw);

console.log("🔎 Cargando selecciones…");

// Ubicar fútbol → selecciones
const deporteFutbol = data.deportes.find(
  d => d.nombre.toLowerCase().includes("futbol") || d.nombre.toLowerCase().includes("fútbol")
);

if (!deporteFutbol || !Array.isArray(deporteFutbol.selecciones)) {
  console.error("❌ No se encontraron selecciones en el archivo JSON");
  process.exit(1);
}

let contador = 1;

deporteFutbol.selecciones = deporteFutbol.selecciones.map(sel => ({
  ...sel,
  id: `SEL_${contador++}`
}));

console.log(`✅ IDs asignados correctamente (${contador - 1} selecciones)`);

// Guardar archivo modificado
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf8");

console.log("💾 Archivo data.json actualizado con éxito.\n");

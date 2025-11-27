const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment'); // Para fechas flexibles

const DATA_PATH = path.join(__dirname, 'data', 'data.json');
const FLASHSCORE_URL = 'https://www.flashscore.co/equipo/afganistan/4M0iRO5p/resultados/';

// Función para generar ID único
function generarIdPartido() {
  return `PART_${Date.now()}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
}

// Función para parsear fecha flexible (evita Invalid time value)
function parsearFecha(fechaStr) {
  if (!fechaStr || fechaStr.trim() === '') return null;
  const fecha = moment(fechaStr, ['DD MMM YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'MMM DD, YYYY'], 'es'); // Soporta formatos españoles/ingleses
  return fecha.isValid() ? fecha.format('YYYY-MM-DD') : null;
}

// Función para extraer datos de un partido (con chequeos null y try-catch)
async function extraerPartido(page, elemento) {
  try {
    // Fecha
    const fechaEl = await elemento.$('.event__time');
    let fecha = null;
    if (fechaEl) {
      fecha = await fechaEl.evaluate(el => el.textContent.trim());
      fecha = parsearFecha(fecha);
      if (!fecha) {
        console.warn('⚠️ Fecha inválida, saltando partido:', fecha);
        return null;
      }
    } else {
      console.warn('⚠️ No se encontró elemento de fecha');
      return null;
    }

    // Tipo de competición
    const tipoEl = await elemento.$('.event__league');
    const tipo = tipoEl ? await tipoEl.evaluate(el => el.textContent.trim()) : 'Desconocida';

    // Equipos
    const equiposEls = await elemento.$$('.event__participant');
    if (equiposEls.length < 2) {
      console.warn('⚠️ No se encontraron equipos suficientes');
      return null;
    }
    const equipoLocal = await equiposEls[0].evaluate(el => el.textContent.trim());
    const equipoVisitante = await equiposEls[1].evaluate(el => el.textContent.trim());

    // Goles (pueden ser en .event__score o subelementos)
    const golesEls = await elemento.$$('.event__score');
    let golesLocal = 0, golesVisitante = 0;
    if (golesEls.length >= 2) {
      golesLocal = parseInt(await golesEls[0].evaluate(el => el.textContent.trim()) || '0');
      golesVisitante = parseInt(await golesEls[1].evaluate(el => el.textContent.trim()) || '0');
    } else {
      // Fallback: buscar en texto del partido
      const scoreText = await elemento.evaluate(el => el.textContent.match(/(\d+)-(\d+)/));
      if (scoreText) {
        golesLocal = parseInt(scoreText[1]);
        golesVisitante = parseInt(scoreText[2]);
      }
    }

    // Estadio y ciudad (en .event__venue si existe)
    let estadio = '', ciudad = '';
    const venueEl = await elemento.$('.event__venue');
    if (venueEl) {
      const venueText = await venueEl.evaluate(el => el.textContent.trim());
      // Split si hay "Estadio, Ciudad"
      const parts = venueText.split(', ');
      estadio = parts[0] || '';
      ciudad = parts[1] || '';
    }

    // Goleadores (intenta expandir detalles)
    const goleadores = [];
    try {
      const detallesBtn = await elemento.$('.event__more, .event__header__more'); // Selector alternativo
      if (detallesBtn) {
        await detallesBtn.click({ delay: 500 });
        await page.waitForTimeout(1000); // Espera carga
        const golesDetails = await page.$$('.event__goal, .lineup__goal');
        for (let golEl of golesDetails) {
          const jugador = await golEl.$eval('.event__goal--scorer', el => el.textContent.trim());
          const minuto = await golEl.$eval('.event__goal--time', el => el.textContent.trim());
          const equipo = await golEl.$eval('.event__goal--team', el => el.getAttribute('data-team') || 'unknown');
          if (jugador && jugador !== '-') {
            goleadores.push({ 
              jugador, 
              minuto, 
              equipo: equipo === 'home' ? 'SEL_local' : 'SEL_visitante' // Placeholder, mapear después
            });
          }
        }
        // Cerrar detalles
        await detallesBtn.click();
      }
    } catch (golError) {
      console.warn('⚠️ Error extrayendo goleadores:', golError.message);
    }

    return {
      id: generarIdPartido(),
      fecha,
      tipo,
      estadio,
      ciudad,
      equipo_local: equipoLocal, // Mapear a SEL_XXX si tienes mapa
      equipo_visitante: equipoVisitante,
      goles_local: golesLocal,
      goles_visitante: golesVisitante,
      goleadores
    };
  } catch (error) {
    console.error('❌ Error general extrayendo partido:', error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Iniciando extracción de partidos de Afganistán...');

  // Leer JSON actual
  let data;
  try {
    data = await fs.readJson(DATA_PATH);
  } catch (error) {
    console.error('❌ Error leyendo JSON:', error.message);
    return;
  }

  const deportes = data.deportes[0] || { partidos: [] };
  const partidosExistentes = deportes.partidos || [];

  // Set de fechas existentes para evitar duplicados
  const fechasExistentes = new Set(partidosExistentes.map(p => p.fecha));

  // Lanzar navegador (headless: false para debug)
  const browser = await puppeteer.launch({ headless: false, slowMo: 500 }); // Cambia a true para prod
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  await page.goto(FLASHSCORE_URL, { waitUntil: 'networkidle2', timeout: 30000 });

  // Esperar carga de partidos (selector actualizado)
  await page.waitForSelector('.event__match', { timeout: 15000 });
  console.log('✅ Página cargada, esperando elementos...');

  // Scroll para cargar más partidos si es lazy-load
  await page.evaluate(async () => {
    for (let i = 0; i < 5; i++) {
      window.scrollBy(0, window.innerHeight);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  });

  // Extraer partidos
  const elementosPartidos = await page.$$('.event__match');
  console.log(`📊 Encontrados ${elementosPartidos.length} partidos.`);

  let nuevosPartidos = 0;
  for (let i = 0; i < Math.min(50, elementosPartidos.length); i++) { // Limita a 50
    const elemento = elementosPartidos[i];
    const partido = await extraerPartido(page, elemento);
    if (partido && !fechasExistentes.has(partido.fecha)) {
      partidosExistentes.push(partido);
      nuevosPartidos++;
      console.log(`✅ Nuevo: ${partido.equipo_local} ${partido.goles_local}-${partido.goles_visitante} ${partido.equipo_visitante} (${partido.fecha})`);
    }
  }

  await browser.close();

  if (nuevosPartidos === 0) {
    console.log('ℹ️ No hay partidos nuevos.');
    return;
  }

  // Guardar
  deportes.partidos = partidosExistentes;
  data.deportes[0] = deportes;
  await fs.writeJson(DATA_PATH, data, { spaces: 2 });
  console.log(`💾 Guardados ${nuevosPartidos} partidos nuevos. Total: ${partidosExistentes.length}`);
}

main().catch(error => {
  console.error('❌ Error fatal:', error.message);
  process.exit(1);
});
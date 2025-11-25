const params = new URLSearchParams(window.location.search);
const nombreEquipo = params.get("equipo");
let dataGlobal = null;

const contenedor = document.getElementById("jugadoresContainer");
const titulo = document.getElementById("tituloEquipo");

fetch("./../data/data.json")
  .then((res) => res.json())
  .then((data) => {
    dataGlobal = data;
    const equipo = dataGlobal.equipos.find((e) => e.nombre === nombreEquipo);

    // Obtener ligas de fútbol
    const futbol = dataGlobal.deportes.find(
      d => d.nombre.toLowerCase() === "fútbol" || d.nombre.toLowerCase() === "futbol"
    );
    const ligasFutbol = futbol ? futbol.ligas : [];

    if (!equipo) {
      contenedor.innerHTML =
        '<div class="mensaje">⚠️ No se encontró el equipo</div>';
      return;
    }

    titulo.textContent = equipo.nombre + " - Jugadores";

    const jugadoresIds = equipo.jugadores || [];
    const jugadores = jugadoresIds
      .map((id) => data.jugadores.find((j) => j.id === id))
      .filter(Boolean);

    if (!jugadores.length) {
      contenedor.innerHTML =
        '<div class="mensaje">Este equipo no tiene jugadores registrados</div>';
      return;
    }

    contenedor.innerHTML = "";

    // Categorizar jugadores por posición
    const categorias = {
      Porteros: [],
      Defensas: [],
      Mediocampistas: [],
      Delanteros: [],
    };

    // Función para determinar la categoría de un jugador
    function obtenerCategoria(posiciones) {
      if (!posiciones || posiciones.length === 0) return "Delanteros";

      const posicion = posiciones[0].toLowerCase();

      if (posicion.includes("portero")) return "Porteros";
      if (
        posicion.includes("lateral") ||
        posicion.includes("central") ||
        posicion.includes("defensa")
      )
        return "Defensas";
      if (
        posicion.includes("mediocentro") ||
        posicion.includes("mediocampista") ||
        posicion.includes("centrocampista")
      )
        return "Mediocampistas";
      if (posicion.includes("delantero") || posicion.includes("extremo"))
        return "Delanteros";

      return "Delanteros"; // Default
    }

    // Asignar jugadores a categorías
    jugadores.forEach((j) => {
      const categoria = obtenerCategoria(j.posiciones);
      categorias[categoria].push(j);
    });

    // Crear secciones para cada categoría
    let totalIndex = 0;
    Object.entries(categorias).forEach(([categoria, jugadoresCategoria]) => {
      if (jugadoresCategoria.length === 0) return;

      // Crear contenedor de sección
      const seccion = document.createElement("div");
      seccion.classList.add("categoria-seccion");

      // Título de la categoría
      const tituloCategoria = document.createElement("h2");
      tituloCategoria.classList.add("categoria-titulo");
      tituloCategoria.textContent = categoria;
      seccion.appendChild(tituloCategoria);

      // Contenedor de scroll horizontal para esta categoría
      const scrollContainer = document.createElement("div");
      scrollContainer.classList.add("scroll-horizontal");

      // Crear tarjetas de jugadores
      jugadoresCategoria.forEach((j, index) => {
        const card = document.createElement("div");
        card.classList.add("player-card");
        card.style.animationDelay = `${totalIndex * 0.1}s`;

        card.innerHTML = `
            <img src="${
              j.imagen_url || "../assets/img/default_player.png"
            }" alt="${j.nombre}" />
            <h4>${j.nombre}</h4>
            <span class="numero_camiseta">${j.numero_camiseta}</span>
            <small>${
              j.posiciones ? j.posiciones.join(", ") : "Sin posición"
            }</small>
        `;

        card.addEventListener("click", () => {
          abrirModal(j, { ligas: ligasFutbol, equipos: dataGlobal.equipos, selecciones: dataGlobal.selecciones });
        });

        scrollContainer.appendChild(card);
        totalIndex++;
      });

      seccion.appendChild(scrollContainer);
      contenedor.appendChild(seccion);
    });
  })
  .catch((error) => {
    contenedor.innerHTML =
      '<div class="mensaje">❌ Error al cargar los datos</div>';
    console.error("Error:", error);
  });

// === BUSCADOR DE JUGADORES ===
const buscador = document.getElementById("buscadorJugadores");

function quitarTildes(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

buscador.addEventListener("input", () => {
  const texto = quitarTildes(buscador.value.toLowerCase().trim());
  const cards = document.querySelectorAll(".player-card");

  cards.forEach(card => {
    const nombre = quitarTildes(card.querySelector("h4").textContent.toLowerCase());
    const posicion = quitarTildes(card.querySelector("small").textContent.toLowerCase());
    const nacionalidad = quitarTildes(card.getAttribute("data-nacionalidad")?.toLowerCase() || "");
    const edad = quitarTildes(card.getAttribute("data-edad")?.toLowerCase() || "");
    const numero = quitarTildes(card.getAttribute("data-numero")?.toLowerCase() || "");

    const coincide =
      nombre.includes(texto) ||
      posicion.includes(texto) ||
      nacionalidad.includes(texto) ||
      edad.includes(texto) ||
      numero.includes(texto);

    card.style.display = coincide ? "flex" : "none";
  });

  // Ocultar secciones vacías
  document.querySelectorAll(".categoria-seccion").forEach(seccion => {
    const visibles = seccion.querySelectorAll(".player-card:not([style*='display: none'])");
    seccion.style.display = visibles.length ? "block" : "none";
  });
});


const modal = document.getElementById("playerModal");
const closeModal = document.getElementById("closeModal");

// Función para obtener el código ISO del país
function obtenerCodigoPais(nacionalidad) {
  const paises = {
    España: "ES",
    México: "MX",
    Argentina: "AR",
    Brasil: "BR",
    Colombia: "CO",
    Chile: "CL",
    Perú: "PE",
    Uruguay: "UY",
    Paraguay: "PY",
    Ecuador: "EC",
    Venezuela: "VE",
    Bolivia: "BO",
    "Costa Rica": "CR",
    Panamá: "PA",
    Honduras: "HN",
    "El Salvador": "SV",
    Guatemala: "GT",
    Nicaragua: "NI",
    "Estados Unidos": "US",
    Canadá: "CA",
    Inglaterra: "GB",
    Francia: "FR",
    Alemania: "DE",
    Italia: "IT",
    Portugal: "PT",
    "Países Bajos": "NL",
    Bélgica: "BE",
    Suiza: "CH",
    Austria: "AT",
    Suecia: "SE",
    Noruega: "NO",
    Dinamarca: "DK",
    Finlandia: "FI",
    Islandia: "IS",
    Irlanda: "IE",
    Gales: "GB",
    Escocia: "GB",
    Polonia: "PL",
    "República Checa": "CZ",
    Eslovaquia: "SK",
    Hungría: "HU",
    Rumania: "RO",
    Bulgaria: "BG",
    Grecia: "GR",
    Turquía: "TR",
    Rusia: "RU",
    Ucrania: "UA",
    Croacia: "HR",
    Serbia: "RS",
    "Bosnia y Herzegovina": "BA",
    Eslovenia: "SI",
    Montenegro: "ME",
    "Macedonia del Norte": "MK",
    Albania: "AL",
    Ghana: "GH",
    Nigeria: "NG",
    Senegal: "SN",
    "Costa de Marfil": "CI",
    Camerún: "CM",
    Argelia: "DZ",
    Marruecos: "MA",
    Túnez: "TN",
    Egipto: "EG",
    Sudáfrica: "ZA",
    Japón: "JP",
    "Corea del Sur": "KR",
    China: "CN",
    Australia: "AU",
    "Nueva Zelanda": "NZ",
  };

  return paises[nacionalidad] || "XX"; // XX para desconocido
}

function obtenerEstadisticas(historial) {
  let club = { partidos: 0, goles: 0, asistencias: 0 };
  let seleccion = { partidos: 0, goles: 0, asistencias: 0 };

  historial.forEach(item => {
    const p = isNaN(item.partidos) ? 0 : Number(item.partidos);
    const g = isNaN(item.goles) ? 0 : Number(item.goles);
    const a = isNaN(item.asistencias) ? 0 : Number(item.asistencias);

    // Es CLUB si tiene equipo_id
    if (item.equipo_id) {
      club.partidos += p;
      club.goles += g;
      club.asistencias += a;
    }

    // Es SELECCIÓN si tiene seleccion_id
    if (item.seleccion_id) {
      seleccion.partidos += p;
      seleccion.goles += g;
      seleccion.asistencias += a;
    }
  });

  return { club, seleccion };
}

function mostrarHistorialTabla(historial, jugador) {
  const tbody = document.getElementById("tablaHistorialBody");
  tbody.innerHTML = "";

  if (!historial?.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:1rem;">Sin registro</td></tr>`;
    return;
  }

  // --- DETECTAR SI ES PORTERO ---
  const esPortero = jugador.posiciones?.some(pos => 
    pos.toLowerCase().includes("portero") || pos.toLowerCase().includes("goalkeeper")
  );

  // --- CAMBIAR ENCABEZADO (ahora sí funciona porque tiene ID) ---
  const headerColumna = document.getElementById("header-ultima-columna");
  if (headerColumna) {
    headerColumna.textContent = esPortero ? "Porterias a cero" : "Asistencias";
  }

  // Datos del JSON
  const ligas = dataGlobal.deportes[0]?.ligas || [];
  const equipos = dataGlobal.equipos || [];
  const selecciones = dataGlobal.deportes[0]?.selecciones || [];

  const mapaLigas = {}; ligas.forEach(l => mapaLigas[l.id] = l.nombre);
  const mapaEquipos = {}; equipos.forEach(eq => mapaEquipos[eq.id] = eq);
  const mapaSelecciones = {}; selecciones.forEach(sel => mapaSelecciones[sel.id] = sel);

  // Ordenar por temporada
  historial.sort((a, b) => {
    const getYear = t => t ? parseInt(String(t).match(/\d{4}/)?.[0] || 0) : 0;
    return getYear(b.temporada) - getYear(a.temporada);
  });

  historial.forEach(h => {
    // LIGA
    let nombreLiga = typeof h.liga === "number" 
      ? (mapaLigas[h.liga] || `Liga ID ${h.liga}`)
      : (h.liga || "Competición");

    // === ENTIDAD (CLUB O SELECCIÓN) - SOPORTA CLUB_XXXX y SEL_XXXX ===
    let entidadHTML = "";

    if (h.equipo_id && h.equipo_id !== "") {
      let nombreEquipo = "Club";
      let escudo = "";

      // Caso 1: Formato nuevo → CLUB_1011 (string)
      if (typeof h.equipo_id === "string" && h.equipo_id.startsWith("CLUB_")) {
        const eq = mapaEquipos[h.equipo_id];
        if (eq) {
          nombreEquipo = eq.nombre;
          escudo = eq.escudo_url || "";
        } else {
          nombreEquipo = h.equipo_id.replace("CLUB_", "Club #"); // fallback bonito
        }
      }
      // Caso 2: Número antiguo (por si queda alguno)
      else if (!isNaN(h.equipo_id)) {
        const eq = mapaEquipos[Number(h.equipo_id)];
        if (eq) {
          nombreEquipo = eq.nombre;
          escudo = eq.escudo_url || "";
        }
      }
      // Caso 3: Texto plano (ej: "Juvenil A", "Barakaldo CF")
      else if (typeof h.equipo_id === "string") {
        nombreEquipo = h.equipo_id;
      }

      entidadHTML = escudo
        ? `<img src="${escudo}" class="escudo-tabla" alt="${nombreEquipo}"> ${nombreEquipo}`
        : `${nombreEquipo}`;

    } 
    else if (h.seleccion_id && h.seleccion_id !== "") {
      let nombreSeleccion = "Selección";
      let imagen = "";

      // Caso 1: Formato nuevo → SEL_18 (string)
      if (typeof h.seleccion_id === "string" && h.seleccion_id.startsWith("SEL_")) {
        const sel = mapaSelecciones[h.seleccion_id];
        if (sel) {
          nombreSeleccion = sel.nombre;
          imagen = sel.imagen || sel.escudo_url || "";
        } else {
          nombreSeleccion = h.seleccion_id.replace("SEL_", "Sel. #");
        }
      }
      // Caso 2: Número antiguo (por compatibilidad)
      else if (!isNaN(h.seleccion_id)) {
        const sel = mapaSelecciones[parseInt(h.seleccion_id)];
        if (sel) {
          nombreSeleccion = sel.nombre;
          imagen = sel.imagen || sel.escudo_url || "";
        }
      }

      // Mostrar escudo o bandera
      if (imagen) {
        entidadHTML = `<img src="${imagen}" class="escudo-tabla" alt="${nombreSeleccion}"> ${nombreSeleccion}`;
      } else {
        const codigo = mapaSelecciones[h.seleccion_id]?.codigo_fifa?.toLowerCase() || 
                      (typeof h.seleccion_id === "string" ? h.seleccion_id.replace("SEL_", "").toLowerCase() : "");
        if (codigo && codigo.length === 3) {
          entidadHTML = `<img src="https://flagcdn.com/48x36/${codigo}.png" class="bandera-tabla" alt="${nombreSeleccion}"> ${nombreSeleccion}`;
        } else {
          entidadHTML = `Mundo ${nombreSeleccion}`;
        }
      }
    } 
    else {
      entidadHTML = "—";
    }

    // ESTADÍSTICAS
    const partidos = h.partidos ?? "-";
    const goles = h.goles ?? "-";
    const ultimoCampo = esPortero 
      ? (h.porterias_a_cero ?? "-")
      : (h.asistencias ?? "-");

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${nombreLiga}</td>
      <td>${h.temporada || "-"}</td>
      <td class="entidad-col">${entidadHTML}</td>
      <td class="centrado">${partidos}</td>
      <td class="centrado">${goles}</td>
      <td class="centrado">${ultimoCampo}</td>
    `;
    tbody.appendChild(tr);
  });

  // BUSCADOR TABLA

  // Después de generar todas las filas en tbody...
  const filas = tbody.querySelectorAll("tr");

  // Añadir data-search a cada fila para búsquedas rápidas (opcional pero más rápido)
  filas.forEach(tr => {
    const celdas = tr.querySelectorAll("td");
    const texto = Array.from(celdas)
      .map(td => td.textContent || td.innerText)
      .join(" ")
      .toLowerCase();
    tr.dataset.search = texto;
  });

  // BUSCADOR EN TIEMPO REAL
  const inputBuscar = document.getElementById("buscarHistorial");
  if (inputBuscar) {
    inputBuscar.addEventListener("input", () => {
      const texto = inputBuscar.value.trim().toLowerCase();
      let visibles = 0;

      filas.forEach(tr => {
        if (texto === "") {
          tr.classList.remove("tr-oculta");
          visibles++;
        } else if (tr.dataset.search.includes(texto)) {
          tr.classList.remove("tr-oculta");
          visibles++;
        } else {
          tr.classList.add("tr-oculta");
        }
      });

      // Mostrar mensaje si no hay resultados
      let mensaje = tbody.querySelector(".no-resultados");
      if (visibles === 0 && texto !== "") {
        if (!mensaje) {
          mensaje = document.createElement("tr");
          mensaje.className = "no-resultados";
          mensaje.innerHTML = `<td colspan="6">No se encontraron resultados para "${inputBuscar.value}"</td>`;
          tbody.appendChild(mensaje);
        }
      } else if (mensaje) {
        mensaje.remove();
      }
    });
  }

  // Limpiar buscador al cerrar modal (opcional)
  closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
    if (inputBuscar) inputBuscar.value = "";
    document.querySelectorAll(".tr-oculta").forEach(tr => tr.classList.remove("tr-oculta"));
    document.querySelectorAll(".no-resultados").forEach(m => m.remove());
  });
}

function abrirModal(j, data) {
  // Imagen y datos básicos
  document.getElementById("modalImg").src =
    j.imagen_url || "../assets/img/default_player.png";
  document.getElementById("modalNombre").textContent = j.nombre;
  document.getElementById("modalPos").textContent =
    j.posiciones?.join(", ") || "Sin posición";
  document.getElementById("numeroCam").textContent = `#${j.numero_camiseta}`;
  document.getElementById("modalLug").textContent = j.lugar_nacimiento || "N/A";

  // Nacionalidad + Bandera
  const nacionalidadElement = document.getElementById("modalNac");
  const nacionalidad = j.nacionalidad || "N/A";
  const codigoPais = obtenerCodigoPais(nacionalidad);

  if (codigoPais !== "XX" && nacionalidad !== "N/A") {
    nacionalidadElement.innerHTML = `
      <img class="flag-icon" src="https://flagcdn.com/w40/${codigoPais.toLowerCase()}.png" alt="${nacionalidad}" />
      ${nacionalidad}
    `;
  } else {
    nacionalidadElement.textContent = nacionalidad;
  }

  // Datos generales
  document.getElementById("modalFecha").textContent = j.fecha_nacimiento || "N/A";
  document.getElementById("modalEstado").textContent = j.estado || "N/A";
  document.getElementById("modalAltura").textContent = j.altura || "N/A";

  // ---- NUEVO: Estadísticas desde equipos_historial ----
  const { club, seleccion } = obtenerEstadisticas(j.equipos_historial || []);

  // CLUB
  document.getElementById("modalPartidosClub").textContent = club.partidos;
  document.getElementById("modalGolesClub").textContent = club.goles;
  document.getElementById("modalAsistClub").textContent = club.asistencias;

  // SELECCIÓN
  document.getElementById("modalPartidosSel").textContent = seleccion.partidos;
  document.getElementById("modalGolesSel").textContent = seleccion.goles;
  document.getElementById("modalAsistSel").textContent = seleccion.asistencias;

  // Llenar tabla de historial
  mostrarHistorialTabla(j.equipos_historial || [], j);

  // Mostrar modal
  modal.classList.remove("hidden");
}

closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});

// Boton de volver
document.getElementById("volverBtn").addEventListener("click", () => {
  window.history.back();
});

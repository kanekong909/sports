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

function mostrarHistorialTabla(historial, data) {
  const tbody = document.getElementById("tablaHistorialBody");
  tbody.innerHTML = "";

  if (!historial?.length) {
    tbody.innerHTML = `
      <tr><td colspan="6" style="text-align:center; padding:1rem;">Sin registro</td></tr>
    `;
    return;
  }

  const ligas = data.ligas || [];
  const equipos = data.equipos || [];
  const selecciones = data.selecciones || [];

  historial.forEach(h => {
    let nombreLiga;

    if (typeof h.liga === "number") {
      nombreLiga = ligas.find(l => l.id === h.liga)?.nombre || "N/A";
    } else {
      nombreLiga = h.liga || "N/A";
    }

    const nombreEntidad = h.equipo_id
      ? (equipos.find(e => e.id === h.equipo_id)?.nombre || "Club")
      : h.seleccion_id
      ? (selecciones.find(s => s.id === h.seleccion_id)?.nombre || "Selección")
      : "N/A";

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${nombreLiga}</td>
      <td>${h.temporada || "N/A"}</td>
      <td>${nombreEntidad}</td>
      <td>${isNaN(h.partidos) ? 0 : h.partidos}</td>
      <td>${isNaN(h.goles) ? 0 : h.goles}</td>
      <td>${isNaN(h.asistencias) ? 0 : h.asistencias}</td>
    `;
    tbody.appendChild(fila);
  });
}


function abrirModal(j, data) {
  // Imagen y datos básicos
  document.getElementById("modalImg").src =
    j.imagen_url || "../assets/img/default_player.png";
  document.getElementById("modalNombre").textContent = j.nombre;
  document.getElementById("modalPos").textContent =
    j.posiciones?.join(", ") || "Sin posición";

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
  document.getElementById("modalNum").textContent = j.numero_camiseta || "N/A";
  document.getElementById("modalEstado").textContent = j.estado || "N/A";
  document.getElementById("modalAltura").textContent = j.altura || "N/A";
  document.getElementById("modalPeso").textContent = j.peso || "N/A";

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
  mostrarHistorialTabla(j.equipos_historial || [], data);

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

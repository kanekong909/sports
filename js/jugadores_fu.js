const params = new URLSearchParams(window.location.search);
const nombreEquipo = params.get("equipo");

const contenedor = document.getElementById("jugadoresContainer");
const titulo = document.getElementById("tituloEquipo");

fetch("./../data/data.json")
  .then((res) => res.json())
  .then((data) => {
    const equipo = data.equipos.find((e) => e.nombre === nombreEquipo);

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
          abrirModal(j);
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

function abrirModal(j) {
  document.getElementById("modalImg").src =
    j.imagen_url || "../assets/img/default_player.png";
  document.getElementById("modalNombre").textContent = j.nombre;
  document.getElementById("modalPos").textContent =
    j.posiciones?.join(", ") || "Sin posición";

  // Actualizar nacionalidad con bandera
  const nacionalidadElement = document.getElementById("modalNac");
  const nacionalidad = j.nacionalidad || "N/A";
  const codigoPais = obtenerCodigoPais(nacionalidad);

  if (codigoPais !== "XX" && nacionalidad !== "N/A") {
    nacionalidadElement.innerHTML = `<img class="flag-icon" src="https://flagcdn.com/w40/${codigoPais.toLowerCase()}.png" alt="${nacionalidad}" class="flag-icon" /> ${nacionalidad}`;
  } else {
    nacionalidadElement.textContent = nacionalidad;
  }
  document.getElementById("modalFecha").textContent =
    j.fecha_nacimiento || "N/A";
  document.getElementById("modalNum").textContent = j.numero_camiseta || "N/A";
  document.getElementById("modalEstado").textContent = j.estado || "N/A";
  document.getElementById("modalAltura").textContent = j.altura || "N/A";
  document.getElementById("modalPeso").textContent = j.peso || "N/A";

  document.getElementById("modalPartidosClub").textContent =
    j.estadisticas?.club?.partidos ?? "0";
  document.getElementById("modalGolesClub").textContent =
    j.estadisticas?.club?.goles ?? "0";
  document.getElementById("modalAsistClub").textContent =
    j.estadisticas?.club?.asistencias ?? "0";

  document.getElementById("modalPartidosSel").textContent =
    j.estadisticas?.seleccion?.partidos ?? "0";
  document.getElementById("modalGolesSel").textContent =
    j.estadisticas?.seleccion?.goles ?? "0";

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

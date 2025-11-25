let dataGlobal = null; // Variable global para usar en todo el script

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("./../data/data.json");
    const data = await res.json();

    // Guardar datos globalmente
    dataGlobal = data;

    const futbol = data.deportes.find(d => 
      d.nombre.toLowerCase().includes("futbol") || d.nombre.toLowerCase().includes("fútbol")
    );

    if (!futbol || !futbol.selecciones) {
      document.getElementById("contenedorSelecciones").innerHTML = 
        '<div class="sin-resultados">Error cargando selecciones</div>';
      return;
    }

    let selecciones = [...futbol.selecciones];
    selecciones.sort((a, b) => a.nombre.localeCompare(b.nombre));

    const contenedor = document.getElementById("contenedorSelecciones");
    const filtroConf = document.getElementById("filtroConfederacion");
    const buscador = document.getElementById("buscador");

    function aplicarFiltros() {
      let filtradas = [...selecciones];

      if (filtroConf.value !== "TODAS") {
        filtradas = filtradas.filter(s => s.confederacion === filtroConf.value);
      }

      const texto = buscador.value.trim().toLowerCase();
      if (texto) {
        filtradas = filtradas.filter(s =>
          s.nombre.toLowerCase().includes(texto) ||
          s.codigo_fifa.toLowerCase().includes(texto)
        );
      }

      mostrarSelecciones(filtradas);
    }

    function mostrarSelecciones(lista) {
      contenedor.innerHTML = "";

      if (lista.length === 0) {
        contenedor.innerHTML = `
          <div class="sin-resultados">
            <p>No se encontraron selecciones</p>
            <small>Prueba con otro nombre o confederación</small>
          </div>`;
        return;
      }

      lista.forEach((sel, index) => {
        const card = document.createElement("div");
        card.className = "card";
        card.style.animationDelay = `${index * 0.05}s`;

        // Imagen: escudo propio o bandera
        let imgHTML = "";
        if (sel.imagen && sel.imagen.trim() !== "") {
          imgHTML = `<img src="${sel.imagen}" alt="${sel.nombre}" loading="lazy">`;
        } else if (sel.codigo_fifa) {
          const code = sel.codigo_fifa.toLowerCase();
          imgHTML = `<img src="https://flagcdn.com/120x90/${code}.png" 
                           srcset="https://flagcdn.com/240x180/${code}.png 2x" 
                           alt="${sel.nombre}" loading="lazy">`;
        } else {
          imgHTML = `<div class="placeholder-flag">?</div>`;
        }

        card.innerHTML = `
          ${imgHTML}
          <div class="info">
            <div class="nombre">${sel.nombre}</div>
            <div class="codigo">${sel.codigo_fifa}</div>
            <div class="confederacion">${sel.confederacion}</div>
          </div>
        `;

        // CLIC EN LA SELECCIÓN → ABRIR HISTORIAL
        card.addEventListener("click", () => {
          abrirHistorialPartidos(sel.id, sel.nombre, obtenerEscudoSeleccion(sel));
        });

        contenedor.appendChild(card);
      });
    }

    // Eventos
    filtroConf.addEventListener("change", aplicarFiltros);
    buscador.addEventListener("input", aplicarFiltros);
    mostrarSelecciones(selecciones);

  } catch (error) {
    console.error("Error:", error);
    document.getElementById("contenedorSelecciones").innerHTML = 
      '<div class="sin-resultados">Error al cargar los datos</div>';
  }
});

// === FUNCIÓN PARA ABRIR EL MODAL DE PARTIDOS ===
let partidosFiltrados = []; // Para guardar los partidos filtrados

function abrirHistorialPartidos(seleccionId, nombre, escudoUrl) {
  const modal = document.getElementById("modalPartidos");
  const lista = document.getElementById("listaPartidos");
  const sinPartidos = document.getElementById("sinPartidos");
  const tituloEscudo = document.getElementById("escudoModalPartidos");
  const tituloNombre = document.getElementById("nombreEquipoModal");

  // Reset filtros
  document.getElementById("buscarPartido").value = "";
  document.getElementById("filtroTipo").value = "TODOS";
  document.getElementById("filtroResultado").value = "TODOS";

  tituloEscudo.src = escudoUrl;
  tituloNombre.textContent = nombre;

  // Todos los partidos de esta selección
  const todosLosPartidos = (dataGlobal.deportes[0].partidos || []).filter(p =>
    String(p.equipo_local) === String(seleccionId) || 
    String(p.equipo_visitante) === String(seleccionId)
  );

  partidosFiltrados = [...todosLosPartidos]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  // Actualizar contador total
  document.getElementById("contadorTotal").textContent = partidosFiltrados.length;

  function renderizarPartidos() {
    lista.innerHTML = "";
    const texto = document.getElementById("buscarPartido").value.toLowerCase();
    const tipo = document.getElementById("filtroTipo").value;
    const resultado = document.getElementById("filtroResultado").value;

    const filtrados = partidosFiltrados.filter(p => {
      const local = obtenerInfoEquipo(p.equipo_local);
      const visitante = obtenerInfoEquipo(p.equipo_visitante);
      const rival = String(p.equipo_local) === String(seleccionId) ? visitante.nombre : local.nombre;

      // Filtro búsqueda
      if (texto && !rival.toLowerCase().includes(texto) && 
          !(p.estadio?.toLowerCase().includes(texto)) && 
          !(p.ciudad?.toLowerCase().includes(texto))) return false;

      // FILTRO POR TIPO DE PARTIDO (inteligente)
      if (tipo !== "TODOS") {
        const tipoTexto = (p.tipo || "").toLowerCase();
        let coincide = false;

        switch(tipo) {
          case "Amistoso":
            coincide = tipoTexto.includes("amistoso");
            break;
          case "Clasificación":
            coincide = tipoTexto.includes("clasificación") || 
                      tipoTexto.includes("eliminatoria") || 
                      tipoTexto.includes("preliminar") || 
                      tipoTexto.includes("qualifying");
            break;
          case "Nations League":
            coincide = tipoTexto.includes("nations league") || 
                      tipoTexto.includes("liga de naciones");
            break;
          case "Eurocopa":
            coincide = tipoTexto.includes("eurocopa") || tipoTexto.includes("euro");
            break;
          case "Mundial":
            coincide = tipoTexto.includes("mundial") || tipoTexto.includes("copa del mundo");
            break;
          case "Copa América":
            coincide = tipoTexto.includes("copa américa") || tipoTexto.includes("copa america");
            break;
          case "Copa Africana":
            coincide = tipoTexto.includes("africa") || tipoTexto.includes("afcon");
            break;
          case "Copa Asia":
            coincide = tipoTexto.includes("asia") || tipoTexto.includes("afc");
            break;
        }

        if (!coincide) return false;
      }

      // Filtro resultado
      if (resultado !== "TODOS") {
        const esLocal = String(p.equipo_local) === String(seleccionId);
        const gLocal = p.goles_local || 0;
        const gVisitante = p.goles_visitante || 0;
        const gano = esLocal ? gLocal > gVisitante : gVisitante > gLocal;
        const empato = gLocal === gVisitante;

        if (resultado === "V" && !gano) return false;
        if (resultado === "E" && !empato) return false;
        if (resultado === "D" && (gano || empato)) return false;
      }

      return true;
    });

    document.getElementById("contadorMostrar").textContent = filtrados.length;

    if (filtrados.length === 0) {
      sinPartidos.style.display = "block";
      return;
    }

    sinPartidos.style.display = "none";

    filtrados.forEach(p => {
      const local = obtenerInfoEquipo(p.equipo_local);
      const visitante = obtenerInfoEquipo(p.equipo_visitante);
      const esLocal = String(p.equipo_local) === String(seleccionId);
      const resultado = `${p.goles_local || 0} - ${p.goles_visitante || 0}`;

      // Goleadores alineados
      const golesLocal = (p.goleadores || [])
        .filter(g => g.jugador && String(g.equipo) === String(p.equipo_local))
        .map(g => `<div class="goleador-item local"> ${g.jugador} ${g.minuto ? `<small>(${g.minuto}')</small>` : ""}</div>`)
        .join("");

      const golesVisitante = (p.goleadores || [])
        .filter(g => g.jugador && String(g.equipo) === String(p.equipo_visitante))
        .map(g => `<div class="goleador-item visitante">${g.jugador} ${g.minuto ? `<small>(${g.minuto}')</small>` : ""} </div>`)
        .join("");

      const goleadoresHTML = golesLocal || golesVisitante ? `
        <div class="goleadores-container">
          <div class="goleadores-local">${golesLocal}</div>
          <div class="goleadores-visitante">${golesVisitante}</div>
        </div>
      ` : "";

      const card = document.createElement("div");
      card.className = "partido-card";
      card.innerHTML = `
        <div class="partido-header">
          <div class="partido-fecha">${formatearFecha(p.fecha)}</div>
          <div class="partido-tipo">${p.tipo || "Amistoso"}</div>
        </div>
        <div class="partido-equipos">
          <div class="equipo-partido ${esLocal ? 'destacado' : ''}">
            <img src="${local.escudo}" alt="${local.nombre}">
            <span class="equipo-nombre">${local.nombre}</span>
          </div>
          <div class="resultado">${resultado}</div>
          <div class="equipo-partido ${!esLocal ? 'destacado' : ''}">
            <img src="${visitante.escudo}" alt="${visitante.nombre}">
            <span class="equipo-nombre">${visitante.nombre}</span>
          </div>
        </div>
        ${p.estadio ? `<div class="estadio-info">${p.estadio} • ${p.ciudad || ""}</div>` : ""}
        ${goleadoresHTML}
      `;
      lista.appendChild(card);
    });
  }

  // Eventos de filtros (en tiempo real)
  const inputs = ["buscarPartido", "filtroTipo", "filtroResultado"];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    el.oninput = el.onchange = renderizarPartidos;
  });

  renderizarPartidos();
  modal.classList.add("active");
}

// === HELPERS ===
function obtenerInfoEquipo(id) {
  if (!id) return { nombre: "Desconocido", escudo: "../assets/img/default_team.png" };

  const sel = dataGlobal.deportes[0].selecciones.find(s => String(s.id) === String(id));
  if (sel) {
    const escudo = sel.imagen || (sel.codigo_fifa ? `https://flagcdn.com/84x63/${sel.codigo_fifa.toLowerCase()}.png` : "../assets/img/default_team.png");
    return { nombre: sel.nombre, escudo };
  }

  const club = dataGlobal.equipos?.find(e => String(e.id) === String(id));
  if (club) {
    return { nombre: club.nombre, escudo: club.escudo_url || "../assets/img/default_team.png" };
  }

  return { nombre: `Equipo ${id}`, escudo: "../assets/img/default_team.png" };
}

function obtenerEscudoSeleccion(sel) {
  return sel.imagen && sel.imagen.trim() !== "" 
    ? sel.imagen 
    : `https://flagcdn.com/120x90/${sel.codigo_fifa.toLowerCase()}.png`;
}

function formatearFecha(str) {
  const date = new Date(str);
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

// === CERRAR MODAL ===
document.getElementById("cerrarModalPartidos")?.addEventListener("click", () => {
  document.getElementById("modalPartidos").classList.remove("active");
});

document.getElementById("modalPartidos")?.addEventListener("click", (e) => {
  if (e.target.id === "modalPartidos") {
    document.getElementById("modalPartidos").classList.remove("active");
  }
});

// Botón volver
document.getElementById('volverBtn')?.addEventListener('click', () => {
  window.history.back();
});
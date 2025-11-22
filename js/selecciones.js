document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("./../data/data.json");
    const data = await res.json();

    const futbol = data.deportes.find(d => 
      d.nombre.toLowerCase().includes("futbol") || d.nombre.toLowerCase().includes("fútbol")
    );

    if (!futbol || !futbol.selecciones) {
      document.getElementById("contenedorSelecciones").innerHTML = 
        '<div class="sin-resultados">Error cargando selecciones</div>';
      return;
    }

    let selecciones = [...futbol.selecciones];

    // Orden alfabético
    selecciones.sort((a, b) => a.nombre.localeCompare(b.nombre));

    const contenedor = document.getElementById("contenedorSelecciones");
    const filtroConf = document.getElementById("filtroConfederacion");
    const buscador = document.getElementById("buscador");

    function aplicarFiltros() {
      let filtradas = [...selecciones];

      // Filtro confederación
      if (filtroConf.value !== "TODAS") {
        filtradas = filtradas.filter(s => s.confederacion === filtroConf.value);
      }

      // Búsqueda
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
            <p>🔍 No se encontraron selecciones</p>
            <small>Prueba con otro nombre o confederación</small>
          </div>`;
        return;
      }

      lista.forEach((sel, index) => {
        const card = document.createElement("div");
        card.className = "card";
        card.style.animationDelay = `${index * 0.05}s`; // Animación escalonada perfecta

        // BANDERA PRIORIDAD: 1. imagen propia → 2. flagcdn → 3. placeholder
        let imgHTML = "";
        if (sel.imagen && sel.imagen.trim() !== "") {
          imgHTML = `<img src="${sel.imagen}" alt="${sel.nombre}">`;
        } else if (sel.codigo_fifa && sel.codigo_fifa.trim() !== "") {
          const code = sel.codigo_fifa.toLowerCase();
          imgHTML = `<img src="https://flagcdn.com/120x90/${code}.png" 
                           srcset="https://flagcdn.com/240x180/${code}.png 2x" 
                           alt="${sel.nombre}">`;
        } else {
          imgHTML = `<div style="width:120px;height:80px;background:#334155;display:flex;align-items:center;justify-content:center;font-size:3rem;opacity:0.3;">?</div>`;
        }

        card.innerHTML = `
          ${imgHTML}
          <div class="nombre">${sel.nombre}</div>
          <div class="codigo">${sel.codigo_fifa}</div>
          <div>${sel.confederacion}</div>
        `;

        contenedor.appendChild(card);
      });
    }

    // Eventos
    filtroConf.addEventListener("change", aplicarFiltros);
    buscador.addEventListener("input", aplicarFiltros);

    // Cargar todas al inicio
    mostrarSelecciones(selecciones);

  } catch (error) {
    console.error("Error:", error);
    document.getElementById("contenedorSelecciones").innerHTML = 
      '<div class="sin-resultados">Error cargando datos</div>';
  }
});

// Botón volver
document.getElementById('volverBtn').addEventListener('click', () => {
  window.history.back();
});
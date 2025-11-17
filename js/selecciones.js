document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("./../data/data.json");
    const data = await res.json();

    // OBTENER EL DEPORTE FUTBOL
    const futbol = data.deportes[0]; // 0 = Fútbol
    const selecciones = futbol.selecciones;

    mostrarSelecciones(selecciones);

    const filtroConf = document.getElementById("filtroConfederacion");
    const buscador = document.getElementById("buscador");

    // FUNCIÓN PRINCIPAL DE FILTRO/BÚSQUEDA
    function aplicarFiltros() {
      const texto = buscador.value.toLowerCase();
      const conf = filtroConf.value;

      let resultado = selecciones;

      // FILTRO POR CONFEDERACIÓN
      if (conf !== "TODAS") {
        resultado = resultado.filter(s => s.confederacion === conf);
      }

      // BUSCADOR
      if (texto.trim() !== "") {
        resultado = resultado.filter(s =>
          s.nombre.toLowerCase().includes(texto)
        );
      }

      mostrarSelecciones(resultado);
    }

    // EVENTOS
    filtroConf.addEventListener("change", aplicarFiltros);
    buscador.addEventListener("input", aplicarFiltros);

  } catch (error) {
    console.error("Error cargando data.json", error);
  }
});

function mostrarSelecciones(lista) {
  const contenedor = document.getElementById("contenedorSelecciones");
  contenedor.innerHTML = "";

  if (lista.length === 0) {
    contenedor.innerHTML = '<div class="sin-resultados">No se encontraron selecciones</div>';
    return;
  }

  lista.forEach(sel => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${sel.imagen || 'https://via.placeholder.com/80x50'}" alt="${sel.nombre}">
      <div class="nombre">${sel.nombre}</div>
      <div class="codigo">${sel.codigo_fifa}</div>
      <div>${sel.confederacion}</div>
    `;

    contenedor.appendChild(card);
  });
}

// Volver a las ligas
document.getElementById('volverBtn').addEventListener('click', () => {
    window.location.href = '../templates/futbol.html';
});

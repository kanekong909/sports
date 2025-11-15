async function cargarDatos() {
  try {
    const res = await fetch('./data/data.json');
    if (!res.ok) throw new Error("Error al cargar el JSON");

    const data = await res.json();
    const contenedor = document.getElementById('contenedor');

    console.log(data);
    
    // recorrer los deportes
    data.deportes.forEach(deporte => {
      const tituloDep = document.createElement('h2');
      tituloDep.textContent = deporte.nombre;
      contenedor.appendChild(tituloDep);

      // recorrer las ligas
      deporte.ligas.forEach(liga => {
        const divLiga = document.createElement('div');
        divLiga.classList.add('liga');
        divLiga.innerHTML = `<h3>${liga.nombre} (${liga.pais})</h3>`;

        // recorrer los equipos
        // recorrer los equipos
        liga.equipos.forEach(eq => {
        const divEquipo = document.createElement('div');
        divEquipo.classList.add('equipo');
        divEquipo.innerHTML = `
            <img src="${eq.escudo_url}" alt="${eq.nombre}">
            <div>
            <strong>${eq.nombre}</strong><br>
            <small>Fundado: ${eq.fundacion || 'N/A'}</small>
            </div>
        `;
        divLiga.appendChild(divEquipo);
        });


        contenedor.appendChild(divLiga);
      });
    });

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

cargarDatos();

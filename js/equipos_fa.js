const params = new URLSearchParams(window.location.search);
const nombreConferencia = params.get("conferencia");
const nombreDivision = params.get("division");

fetch('./../data/data.json')
    .then(res => res.json())
    .then(data => {

    const contenedor = document.getElementById("equiposContainer");
    const titulo = document.getElementById("tituloDivision");

    // Buscar el deporte Fútbol Americano
    const nflData = data.deportes.find(d =>
        d.nombre.toLowerCase() === "futbol americano" ||
        d.nombre.toLowerCase() === "fútbol americano"
    );

    if (!nflData) {
        contenedor.innerHTML = "<p>No se encontró información de NFL.</p>";
        return;
    }

    // Acceder a la liga NFL
    const ligaNFL = nflData.ligas?.[0];
    if (!ligaNFL) {
        contenedor.innerHTML = "<p>No se encontró información de la liga NFL.</p>";
        return;
    }

    // Buscar conferencia
    const conferencia = ligaNFL.conferencias.find(c => c.nombre === nombreConferencia);
    if (!conferencia) {
        contenedor.innerHTML = `<p>Conferencia no encontrada: ${nombreConferencia}</p>`;
        return;
    }

    // Buscar división
    const division = conferencia.divisiones.find(d => d.nombre === nombreDivision);
    if (!division) {
        contenedor.innerHTML = `<p>División no encontrada: ${nombreDivision}</p>`;
        return;
    }

    titulo.textContent = `${nombreDivision} (${nombreConferencia})`;

    // Renderizar equipos (LLEGAN COMO IDS)
    contenedor.innerHTML = "";

    division.equipos.forEach(id => {

        const equipo = data.equipos.find(e => e.id === id);

        if (!equipo) return;

        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
        <img src="${equipo.escudo_url || '../assets/img/default_team.png'}" alt="${equipo.nombre}">
        <div class="card-info">
            <h2>${equipo.nombre}</h2>
            <p>${equipo.entrenador || "Entrenador no disponible"}</p>
        </div>
        `;

        card.addEventListener("click", () => {
        const query = new URLSearchParams({ equipo: equipo.nombre }).toString();
        window.location.href = `equipo.html?${query}`;
        });

        contenedor.appendChild(card);
    });

    });

document.getElementById("volverBtn").addEventListener("click", () => {
    window.history.back();
});
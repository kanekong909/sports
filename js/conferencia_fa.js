const params = new URLSearchParams(window.location.search);
const nombreConferencia = params.get("conferencia");

fetch('./../data/data.json')
    .then(res => res.json())
    .then(data => {

    // Buscar fútbol americano
    const nflData = data.deportes.find(d =>
        d.nombre.toLowerCase() === "futbol americano" ||
        d.nombre.toLowerCase() === "fútbol americano"
    );

    const contenedor = document.getElementById("divisionesContainer");
    const titulo = document.getElementById("tituloConferencia");

    titulo.textContent = nombreConferencia;

    if (!nflData) {
        contenedor.innerHTML = "<p>No se encontró información de Fútbol Americano.</p>";
        return;
    }

    // Acceder a la liga NFL
    const ligaNFL = nflData.ligas?.[0];
        if (!ligaNFL) {
            contenedor.innerHTML = "<p>No se encontró información de la NFL.</p>";
            return;
    }

    // Acceder a conferencias
    const conferencia = ligaNFL.conferencias.find(c => c.nombre === nombreConferencia);

    if (!conferencia) {
        contenedor.innerHTML = `<p>No se encontró la conferencia "${nombreConferencia}".</p>`;
        return;
    }

    // Renderizar divisiones
    conferencia.divisiones.forEach(div => {
        const divCard = document.createElement("div");
        divCard.classList.add("continente-item");

        divCard.innerHTML = `
            <h2>${div.nombre}</h2>
            <button class="liga-item">Ver equipos</button>
        `;

        divCard.querySelector("button").addEventListener("click", () => {
            const query = new URLSearchParams({
                conferencia: nombreConferencia,
                division: div.nombre
            }).toString();

            window.location.href = `equipos_fa.html?${query}`;
        });

        contenedor.appendChild(divCard);
    });

});

document.getElementById("volverBtn").addEventListener("click", () => {
    window.history.back();
});
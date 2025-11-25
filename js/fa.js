fetch('./../data/data.json')
    .then(res => res.json())
    .then(data => {

        const container = document.getElementById("conferenciasContainer");
        container.innerHTML = "";

        // Buscar deporte Fútbol Americano
        const nfl = data.deportes.find(d =>
            d.nombre.toLowerCase() === "fútbol americano" ||
            d.nombre.toLowerCase() === "futbol americano"
        );

        if (!nfl) {
            container.innerHTML = `<p>No se encontró información de Fútbol Americano.</p>`;
            return;
        }

        // Acceder a la liga NFL
        const ligaNFL = nfl.ligas?.[0];
        if (!ligaNFL) {
            container.innerHTML = `<p>No se encontró la liga NFL.</p>`;
            return;
        }

        // Acceder a conferencias
        const conferencias = ligaNFL.conferencias;
        if (!conferencias) {
            container.innerHTML = `<p>No se encontraron conferencias.</p>`;
            return;
        }

        // Renderizar tarjetas de conferencias
        conferencias.forEach(conf => {
            const card = document.createElement("div");
            card.classList.add("card");

            const clase = conf.nombre === "AFC" ? "afc" : "nfc";
            card.innerHTML = `
                <div class="card-info">
                <h2>${conf.nombre}</h2>
                <p>Divisiones disponibles</p>
                </div>
            `;
            card.classList.add(clase);


            card.addEventListener("click", () => {
                const params = new URLSearchParams({ conferencia: conf.nombre }).toString();
                window.location.href = `conferencia_fa.html?${params}`;
            });

            container.appendChild(card);
        });

    });

// Botón volver
document.getElementById("volverBtn").addEventListener("click", () => {
    window.location.href = "../index.html";
});
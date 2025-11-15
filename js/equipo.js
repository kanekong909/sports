const params = new URLSearchParams(window.location.search);
const nombreLiga = params.get("liga");

fetch("./../data/data.json")
  .then((res) => res.json())
  .then((data) => {
    const contenedor = document.getElementById("equiposContainer");
    const titulo = document.getElementById("nombreLiga");
    const logoLiga = document.getElementById("logoLiga");

    const futbol = data.deportes.find(
      (d) =>
        d.nombre.toLowerCase() === "fútbol" ||
        d.nombre.toLowerCase() === "futbol"
    );
    if (!futbol) {
      contenedor.innerHTML = "<p>No se encontró el deporte Fútbol.</p>";
      return;
    }

    const liga = futbol.ligas.find(
      (l) => l.nombre.toLowerCase() === nombreLiga.toLowerCase()
    );
    if (!liga) {
      contenedor.innerHTML = `<p>No se encontró información para la liga: ${nombreLiga}</p>`;
      return;
    }

    // 🏆 Actualizar título y logo
    titulo.textContent = liga.nombre;
    logoLiga.src = liga.imagen_url || "../assets/img/default_league.png";
    logoLiga.alt = liga.nombre;

    // ⚽ Mostrar equipos
    const equipos = liga.equipos
      .map((id) => data.equipos.find((eq) => eq.id === id))
      .filter(Boolean);
    
    // Mostrar total de equipos
    document.getElementById("totalEquipos").textContent = `Equipos: ${equipos.length}`;

    if (!equipos.length) {
      contenedor.innerHTML =
        "<p>No hay equipos registrados para esta liga.</p>";
      return;
    }

    equipos.forEach((eq) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <img src="${eq.escudo_url || "../assets/img/default_team.png"}" alt="${
        eq.nombre
      }">
        <div class="card-info">
        <h2>${eq.nombre}</h2>
        <p>${eq.estadio || ""}</p>
        </div>
    `;
      card.addEventListener("click", () => {
        const query = new URLSearchParams({ equipo: eq.nombre }).toString();
        window.location.href = `jugadores_fu.html?${query}`;
      });

      contenedor.appendChild(card);
    });
  })
  .catch((err) => console.error("Error cargando equipos:", err));

const buscador = document.getElementById("buscadorEquipos");

buscador.addEventListener("input", () => {
  const texto = buscador.value.toLowerCase().trim();
  const cards = document.querySelectorAll("#equiposContainer .card");

  let visibles = 0;

  cards.forEach(card => {
    const nombre = card.querySelector("h2").textContent.toLowerCase();
    if (nombre.includes(texto)) {
      card.style.display = "";
      visibles++;
    } else {
      card.style.display = "none";
    }
  });

  document.getElementById("totalEquipos").textContent =
    `Equipos: ${visibles}`;
});


document.getElementById("volverBtn").addEventListener("click", function () {
  window.location.href = "./futbol.html";
});

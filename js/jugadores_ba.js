document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const equipoId = params.get("equipo_id");
  const equipoNombre = params.get("equipo");

  if (!equipoId && !equipoNombre) {
    document.body.innerHTML = "<h1 style='text-align:center;color:var(--text);margin-top:5rem;'>Equipo no encontrado</h1>";
    return;
  }

  let graficoActual = null;

  try {
    const res = await fetch("./../data/data.json");
    const data = await res.json();

    const basket = data.deportes.find(d => d.nombre.toLowerCase().includes("baloncesto"));
    if (!basket) throw new Error("Deporte Baloncesto no encontrado");

    // Buscar equipo
    let equipo = data.equipos.find(e => e.id === parseInt(equipoId));
    if (!equipo && equipoNombre) {
      equipo = data.equipos.find(e => e.nombre === decodeURIComponent(equipoNombre));
    }
    if (!equipo) throw new Error("Equipo no encontrado");

    // Header
    document.getElementById("nombreEquipo").textContent = equipo.nombre;
    document.getElementById("escudoEquipo").src = equipo.escudo_url || "../assets/img/default_team.png";

    const contenedor = document.getElementById("contenedorJugadores");
    const buscador = document.getElementById("buscadorJugadores");

    // === OBTENER JUGADORES ===
    let jugadoresEquipo = [];
    if (equipo.jugadores && Array.isArray(equipo.jugadores) && equipo.jugadores.length > 0) {
      equipo.jugadores.forEach(idJugador => {
        const jugador = data.jugadores.find(j => j.id === idJugador);
        if (jugador) jugadoresEquipo.push(jugador);
      });
    }

    // === CALCULAR EDAD ===
    function calcularEdad(fechaNacimiento) {
      if (!fechaNacimiento) return "??";
      const [dia, mes, año] = fechaNacimiento.split("-");
      const nacimiento = new Date(`${año}-${mes}-${dia}`);
      const hoy = new Date();
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const m = hoy.getMonth() - nacimiento.getMonth();
      if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
      return edad;
    }

    // === MOSTRAR TARJETAS ===
    function mostrarJugadores(lista) {
      contenedor.innerHTML = "";
      if (lista.length === 0) {
        contenedor.innerHTML = `
          <div class="sin-resultados">
            <p>No hay jugadores registrados</p>
            <small>Próximamente disponibles</small>
          </div>`;
        return;
      }

      lista.forEach((jugador, i) => {
        const card = document.createElement("div");
        card.className = "card-jugador";
        card.style.animationDelay = `${i * 0.05}s`;
        card.style.cursor = "pointer";

        const posiciones = Array.isArray(jugador.posiciones)
          ? jugador.posiciones.join(" / ")
          : (jugador.posicion || "Sin posición");

        const foto = jugador.imagen_url || jugador.foto || "../assets/img/default_player.png";

        card.innerHTML = `
          <img src="${foto}" alt="${jugador.nombre}" onerror="this.src='../assets/img/default_player.png'" />
          <div class="info">
            <h3>${jugador.nombre}</h3>
            <p class="posicion">${posiciones}</p>
            <div class="stats">
              <span>Edad: ${calcularEdad(jugador.fecha_nacimiento)}</span>
              <span>•</span>
              <span>${jugador.nacionalidad || "Desconocida"}</span>
            </div>
            <div class="numero">#${jugador.numero_camiseta || "--"}</div>
          </div>
        `;

        card.addEventListener("click", () => abrirModalJugador(jugador));
        contenedor.appendChild(card);
      });
    }

    // === MODAL DEL JUGADOR ===
    function abrirModalJugador(jugador) {
      document.getElementById("modalNombre").textContent = jugador.nombre;
      document.getElementById("modalDorsal").textContent = `#${jugador.numero_camiseta || "--"}`;
      document.getElementById("modalPosicion").textContent = Array.isArray(jugador.posiciones)
        ? jugador.posiciones.join(" / ")
        : "Sin posición";
      document.getElementById("modalEdad").textContent = calcularEdad(jugador.fecha_nacimiento) + " años";
      document.getElementById("modalAltura").textContent = jugador.altura || "??";
      document.getElementById("modalPeso").textContent = jugador.peso || "??";
      document.getElementById("modalNacionalidad").textContent = jugador.nacionalidad || "Desconocida";

      // Bandera simple (puedes mejorarla con un objeto de códigos ISO después)
      const codigo = jugador.nacionalidad?.toLowerCase().includes("estado") ? "us" : "us";
      document.getElementById("modalBandera").src = `https://flagcdn.com/48x36/${codigo}.png`;

      document.getElementById("modalFoto").src = jugador.imagen_url || jugador.foto || "../assets/img/default_player.png";

      // Estadísticas carrera
      const stats = jugador.estadisticas_carrera || {};
      document.getElementById("modalPartidos").textContent = stats.partidos_jugados || "0";
      document.getElementById("modalPuntos").textContent = stats.promedio_puntos?.toFixed(1) || "0.0";
      document.getElementById("modalRebotes").textContent = stats.promedio_rebotes?.toFixed(1) || "0.0";
      document.getElementById("modalAsistencias").textContent = stats.promedio_asistencias?.toFixed(1) || "0.0";

      // Gráfico CORREGIDO (sin coma extra)
      if (graficoActual) graficoActual.destroy();
      const ctx = document.getElementById("graficoPuntos").getContext("2d");
      const temporadas = [...(jugador.historial_temporadas || [])].sort((a, b) => 
        b.temporada.localeCompare(a.temporada)
      );

      graficoActual = new Chart(ctx, {
        type: "line",
        data: {
          labels: temporadas.map(t => t.temporada),
          datasets: [{
            label: "Puntos",
            data: temporadas.map(t => t.puntos_pp || 0),
            borderColor: "#6366f1",
            backgroundColor: "rgba(99, 102, 241, 0.2)",
            tension: 0.4,
            fill: true,
            pointBackgroundColor: "#ec4899",
            pointRadius: 6,
            pointHoverRadius: 9
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: "rgba(255,255,255,0.05)" }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });

      // Tabla temporadas
      const tabla = document.getElementById("tablaTemporadas");
      if (temporadas.length === 0) {
        tabla.innerHTML = "<p style='text-align:center;color:var(--text-muted);padding:2rem;'>No hay historial</p>";
      } else {
        tabla.innerHTML = `
          <table>
            <thead><tr>
              <th>Temporada</th><th>Equipo</th><th>PTS</th><th>REB</th><th>AST</th><th>STL</th><th>3PM</th>
            </tr></thead>
            <tbody>
              ${temporadas.map(t => `
                <tr>
                  <td><strong>${t.temporada}</strong></td>
                  <td>${t.equipo}</td>
                  <td>${t.puntos_pp || "-"}</td>
                  <td>${t.rebotes_pp || "-"}</td>
                  <td>${t.asistencias_pp || "-"}</td>
                  <td>${t.robos_pp || "-"}</td>
                  <td>${t.triples_pp || "-"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        `;
      }

      document.getElementById("modalJugador").classList.add("active");
    }

    // Cerrar modal
    document.getElementById("cerrarModalJugador").addEventListener("click", () => {
      document.getElementById("modalJugador").classList.remove("active");
      if (graficoActual) graficoActual.destroy();
    });

    document.getElementById("modalJugador").addEventListener("click", e => {
      if (e.target === document.getElementById("modalJugador")) {
        document.getElementById("modalJugador").classList.remove("active");
        if (graficoActual) graficoActual.destroy();
      }
    });

    // Búsqueda
    buscador.addEventListener("input", () => {
      const texto = buscador.value.trim().toLowerCase();
      if (!texto) return mostrarJugadores(jugadoresEquipo);
      const filtrados = jugadoresEquipo.filter(j => {
        const nombre = j.nombre.toLowerCase();
        const pos = Array.isArray(j.posiciones) ? j.posiciones.join(" ").toLowerCase() : "";
        const nac = (j.nacionalidad || "").toLowerCase();
        return nombre.includes(texto) || pos.includes(texto) || nac.includes(texto);
      });
      mostrarJugadores(filtrados);
    });

    // Carga inicial
    mostrarJugadores(jugadoresEquipo);

  } catch (err) {
    console.error(err);
    document.getElementById("contenedorJugadores").innerHTML = `<div class="sin-resultados">Error cargando datos</div>`;
  }
});

// Volver atrás
document.getElementById("volverBtn").addEventListener("click", () => window.history.back());
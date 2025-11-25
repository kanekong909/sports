fetch('./../data/data.json')
    .then(res => res.json())
    .then(data => {
    const contenedor = document.querySelector('.conferencias');
    contenedor.innerHTML = '';

    // 🔹 Buscar el deporte Baloncesto
    const basket = data.deportes.find(d =>
        d.nombre.toLowerCase() === 'baloncesto' || d.nombre.toLowerCase() === 'basketball'
    );

    if (!basket || !Array.isArray(basket.conferencias)) {
        contenedor.innerHTML = '<p>No se encontraron conferencias registradas.</p>';
        return;
    }

    // 🔹 Mostrar cada conferencia (Este / Oeste)
    basket.conferencias.forEach(conf => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('continente-item'); // reutilizamos estilos visuales

        const titulo = document.createElement('h2');
        titulo.textContent = conf.nombre;
        wrapper.appendChild(titulo);

        const listaLigas = document.createElement('div');
        listaLigas.classList.add('ligas-continente');

        conf.ligas.forEach(liga => {
        const ligaElemento = document.createElement('button');
        ligaElemento.type = 'button';
        ligaElemento.classList.add('liga-item');

        // Si solo hay una liga (como NBA), no necesitamos mostrar el nombre dos veces
        const nombreLiga = document.createElement('span');
        nombreLiga.textContent = liga.nombre;
        ligaElemento.appendChild(nombreLiga);

        // ✅ Al hacer clic, abrir conferencia.html
        ligaElemento.addEventListener('click', () => {
            const query = new URLSearchParams({
            conferencia: conf.nombre,
            liga: liga.nombre
            }).toString();
            window.location.href = `conferencia.html?${query}`;
        });

        listaLigas.appendChild(ligaElemento);
        });

        wrapper.appendChild(listaLigas);
        contenedor.appendChild(wrapper);
    });
    })
    .catch(err => console.error('Error al cargar el baloncesto:', err));

// 🔙 Botón de regreso al inicio
document.getElementById('volverBtn').addEventListener('click', () => {
    window.location.href = '../index.html';
});
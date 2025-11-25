const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'data.json');

// Leer el archivo
let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

let contador = 0;

// Cambiar el id de todos los equipos a string con prefijo CLUB_
data.equipos = data.equipos.map(equipo => {
  const nuevoId = `CLUB_${equipo.id}`;
  contador++;
  return {
    ...equipo,
    id: nuevoId
  };
});

// Guardar el archivo actualizado
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

console.log(`Listo! ${contador} equipos ahora tienen ID con prefijo CLUB_`);
console.log('Ejemplo:', data.equipos[0].id);

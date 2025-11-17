const fs = require('fs');
const XLSX = require('xlsx');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('./data/data.json', 'utf8'));

// Extract the selecciones array
const selecciones = data.deportes[0].selecciones;

// Create a new workbook
const workbook = XLSX.utils.book_new();

// Convert the array to a worksheet
const worksheet = XLSX.utils.json_to_sheet(selecciones);

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Selecciones');

// Write the workbook to a file
XLSX.writeFile(workbook, 'selecciones.xlsx');

console.log('Excel file created: selecciones.xlsx');
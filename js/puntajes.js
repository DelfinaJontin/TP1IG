// Datos de cada juego: la clave con la que se guarda, cómo se llama
// la unidad del puntaje y a qué página lleva el enlace "¡Jugá una!".
const JUEGOS = [
  { clave: 'dados',  unidad: 'puntos',   pagina: 'dados.html' },
  { clave: 'cartas', unidad: 'fichas',   pagina: 'cartas.html' },
  { clave: 'trivia', unidad: 'aciertos', pagina: 'api.html' },
];
 
// Crea la tabla con las partidas de un juego
function crearTabla(lista, unidad) {
  const tabla = document.createElement('table');
  tabla.className = 'records-table';
 
  // Encabezado
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>#</th><th>Puntaje</th><th>Detalle</th><th>Fecha</th></tr>';
  tabla.appendChild(thead);
 
  // Una fila por partida
  const tbody = document.createElement('tbody');
  lista.forEach((partida, i) => {
    const fila = document.createElement('tr');
    const datos = [i + 1, `${partida.puntaje} ${unidad}`, partida.detalle, partida.fecha];
    datos.forEach(dato => {
      const celda = document.createElement('td');
      celda.textContent = dato;
      fila.appendChild(celda);
    });
    tbody.appendChild(fila);
  });
  tabla.appendChild(tbody);
 
  return tabla;
}
 
// Dibuja los récords de los 3 juegos
function mostrarRecords() {
  const records = leerRecords();
 
  JUEGOS.forEach(juego => {
    const lista = records[juego.clave];
    const contenedor = document.getElementById('records-' + juego.clave);
    const mejor = document.getElementById('best-' + juego.clave);
 
    contenedor.innerHTML = ''; // limpia lo que hubiera antes
 
    // Si todavía no hay partidas guardadas, muestra un mensaje
    if (lista.length === 0) {
      mejor.textContent = '-';
      const vacio = document.createElement('p');
      vacio.className = 'records-vacio';
      vacio.innerHTML = `Todavía no hay partidas. <a href="${juego.pagina}">¡Jugá una!</a>`;
      contenedor.appendChild(vacio);
      return;
    }
 
    // La lista ya viene ordenada: el primero es el mejor
    mejor.textContent = `${lista[0].puntaje} ${juego.unidad}`;
    contenedor.appendChild(crearTabla(lista, juego.unidad));
  });
}
 
// Botón para borrar todo, con confirmación antes
document.getElementById('btnBorrar').addEventListener('click', () => {
  const seguro = confirm('¿Seguro que querés borrar todos los récords? No se puede deshacer.');
  if (seguro) {
    borrarRecords();
    mostrarRecords();
  }
});
 
// Inicio
mostrarRecords();
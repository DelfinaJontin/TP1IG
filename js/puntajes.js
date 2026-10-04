// =========================================================
// puntajes.js
// Muestra en puntajes.html los récords guardados de cada juego.
// Usa las funciones leerRecords() y borrarRecords() de records.js.
// =========================================================

// Datos de cada juego: la clave con la que se guarda, cómo se llama
// la unidad del puntaje y a qué página lleva el enlace "¡Jugá una!".
const JUEGOS = [
  { clave: 'dados',  unidad: 'puntos',   pagina: 'dados.html' },
  { clave: 'cartas', unidad: 'fichas',   pagina: 'cartas.html' },
  { clave: 'trivia', unidad: 'aciertos', pagina: 'api.html' },
];

// Crea la lista numerada (<ol>) con las partidas de un juego
function crearLista(lista, unidad) {
  const ol = document.createElement('ol');
  ol.classList.add('records-list');

  lista.forEach((partida, i) => {
    const li = document.createElement('li');
    li.innerText = `${partida.puntaje} ${unidad} - ${partida.detalle}`;

    // El primero de la lista es el récord: lo marcamos con una clase
    if (i === 0) {
      li.classList.add('records-mejor');
    }

    ol.appendChild(li);
  });

  return ol;
}

// los récords de los 3 juegos
function mostrarRecords() {
  const records = leerRecords();

  JUEGOS.forEach(juego => {
    const lista = records[juego.clave];
    const contenedor = document.querySelector('#records-' + juego.clave);
    const mejor = document.querySelector('#best-' + juego.clave);

    // Si la tarjeta de este juego no está en el HTML, pasa al siguiente
    if (contenedor === null || mejor === null) {
      return;
    }

    contenedor.innerHTML = ''; // limpia lo que hubiera antes

    // Si todavía no hay partidas guardadas, muestra un mensaje
    if (lista.length === 0) {
      mejor.innerText = '-';
      contenedor.innerHTML = `<p class="records-vacio">Todavía no hay partidas. <a href="${juego.pagina}">¡Jugá una!</a></p>`;
      return;
    }

    mejor.innerText = `${lista[0].puntaje} ${juego.unidad}`;
    contenedor.appendChild(crearLista(lista, juego.unidad));
  });
}

// Botón para borrar todo, con confirmación antes
document.querySelector('#btnBorrar').addEventListener('click', () => {
  const seguro = confirm('¿Seguro que querés borrar todos los récords? No se puede deshacer.');
  if (seguro) {
    borrarRecords();
    mostrarRecords();
  }
});

// Inicio
mostrarRecords();
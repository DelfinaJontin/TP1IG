// =========================================================
// Funciones para guardar y leer los récords de los 3 juegos.
// Se usa en dados.html, cartas.html, api.html y puntajes.html.
// =========================================================

const RECORDS_KEY = 'zonaJuegosRecords'; 
const MAX_RECORDS = 5;                  

// Devuelve el objeto con los récords de los 3 juegos.
// Si todavía no hay nada guardado, devuelve listas vacías.
function leerRecords() {
  const guardado = localStorage.getItem(RECORDS_KEY);

  if (guardado === null) {
    return { dados: [], cartas: [], trivia: [] };
  }

  const datos = JSON.parse(guardado); // de texto JSON a objeto
  return {
    dados: datos.dados || [],
    cartas: datos.cartas || [],
    trivia: datos.trivia || [],
  };
}

// Guarda una partida en la lista de un juego, ordenada de mayor a menor puntaje.
// juego:   'dados', 'cartas' o 'trivia'
// partida: { id, puntaje, detalle }
function guardarPuntaje(juego, partida) {
  const records = leerRecords();
  const lista = records[juego];

  const nueva = {
    id: partida.id,
    puntaje: partida.puntaje,
    detalle: partida.detalle,
  };

  // 1) Si esta partida ya estaba guardada (mismo id), la sacamos.
  //    Lo usa el Blackjack, que actualiza su puntaje mano a mano.
  for (let i = 0; i < lista.length; i++) {
    if (lista[i].id === partida.id) {
      lista.splice(i, 1);
      break;
    }
  }

  // 2) Buscamos dónde va: antes del primer puntaje más bajo que el nuevo.
  //    Si no hay ninguno más bajo, va al final.
  let posicion = lista.length;
  for (let i = 0; i < lista.length; i++) {
    if (nueva.puntaje > lista[i].puntaje) {
      posicion = i;
      break;
    }
  }

  // 3) La insertamos en esa posición, así la lista queda ordenada.
  lista.splice(posicion, 0, nueva);

  // 4) Nos quedamos solo con los mejores.
  records[juego] = lista.slice(0, MAX_RECORDS);

  localStorage.setItem(RECORDS_KEY, JSON.stringify(records)); // de objeto a texto JSON
}

// Borra todos los récords de los 3 juegos.
function borrarRecords() {
  localStorage.removeItem(RECORDS_KEY);
}
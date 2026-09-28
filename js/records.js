const RECORDS_KEY = 'zonaJuegosRecorrds'; // nombre con el que se guarda en localStorage
const MAX_RECORDS = 5;  // cuántos récords se guardan por juego

// Devuelve el objeto con los récords de los 3 juegos.
// Si no hay nada guardado (o el dato está roto), devuelve listas vacías.

function leerRecords () {
    const vacio = { dados: [], cartas: [], trivia: [] };
    try { 
        const guardado = localStorage.getItem(RECORDS_KEY);
        if (!guardado) return vacio;
        const datos = JSON.parse(guardado); // de texto JSON a objeto
        return {
            dados: datos.dados || [],
            cartas: datos.cartas || [],
            trivia: datos.trivia || [],
    };
    }   catch (error) {
        return vacio; 
    }
}

// Guarda una partida en la lista de un juego.
// juego:   'dados', 'cartas' o 'trivia'
// partida: { id, puntaje, detalle }
// Si ya existe una partida con el mismo id, la actualiza.
function guardarPuntaje (juego, partida) {
    const records = leerRecords();
    const lista = records[juego];
}
const nueva = {
    id: partida.id,
    puntaje: partida.puntaje,
    detalle: partida.detalle,
    fecha: new Date(). toLocaleDateString('es-AR')
};
const posicion = lista.findIndex(p=> p.id === partida.id);
if (posicion >= 0) {
    lista[posicion] = nueva;   // ya estaba: se actualiza
  } else {
    lista.push(nueva);         // es nueva: se agrega
  }
  // Ordena de mayor a menor puntaje y se queda con los mejores
  lista.sort((a, b) => b.puntaje - a.puntaje);
  records[juego] = lista.slice(0, MAX_RECORDS);
 
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records)); // de objeto a texto JSON
  } catch (error) {
    console.error('No se pudieron guardar los récords:', error);
  }
 
// Borra todos los récords de los 3 juegos.
function borrarRecords() {
  try {
    localStorage.removeItem(RECORDS_KEY);
  } catch (error) {
    console.error('No se pudieron borrar los récords:', error);
  }
}


# TP1IG

Sitio web con tres minijuegos interactivos: 10000 (dados), Blackjack (cartas) y una Trivia con preguntas obtenidas de una API pública.

Sitio publicado: https://delfinajontin.github.io/TP1IG/
Repositorio: https://github.com/DelfinaJontin/TP1IG
Integrantes
Jontin Delfina
Roberto Ambar

Datos de la materia
Materia: Informática General 2026
Cátedra: Valeria Drelichman, Pedro Paleo, Leonardo Nadel, Norma Morales
Trabajo: Trabajo Práctico 1

Descripción general:
Zona juegos es un sitio de nueve páginas HTML con tres juegos contra la computadora. Desde la página de inicio se accede a cada juego, y un menú de navegación presente en todas las páginas permite recorrer el sitio completo.
Cada juego tiene un objetivo claro, reglas visibles, mensajes que indican qué hacer en cada momento, un historial de lo que pasó en la partida y la posibilidad de empezar una partida nueva. Los mejores puntajes de cada juego se guardan en el navegador (localStorage) y se muestran en la página de puntajes.

Organización de archivos y carpetas;
TP1IG/
├── index.html            Página de inicio
├── README.md             Este documento
├── css/
│   └── style.css         Única hoja de estilos del sitio
├── html/
│   ├── dados.html        Juego 10000
│   ├── cartas.html       Juego Blackjack
│   ├── api.html          Juego Trivia
│   ├── instdados.html    Guía de juego de 10000
│   ├── instcartas.html   Guía de juego de Blackjack
│   ├── puntajes.html     Tabla de récords
│   └── integrantes.html  Integrantes y desarrollo del proyecto
├── js/
│   ├── dados.js          Lógica del juego 10000
│   ├── cartas.js         Lógica del Blackjack
│   ├── trivia.js         Lógica de la Trivia y consulta a la API
│   ├── records.js        Funciones para guardar y leer récords (compartido)
│   └── puntajes.js       Muestra los récords en la página de puntajes
└── multimedia/
    └── fondo.png.jpeg    Imagen de fondo de la página de inicio

    Tecnologías utilizadas
HTML5 
CSS 
JavaScript 
API publica
localStorage y JSON para guardar los récords.
Google Fonts (Permanent Marker y Rubik) para las tipografías.
Visual Studio Code, Git, GitHub, GitHub Desktop y GitHub Pages.

Principales funcionalidades:
Menú de navegación en todas las páginas, con la página actual resaltada.
Tres juegos completos, con turnos, cálculo de puntajes, condiciones de victoria y opción de partida nueva.
Historial de cada partida, que se genera dinámicamente con JavaScript.
Mensajes de estado y de error: qué hacer en cada momento, selecciones de dados que no puntúan, apuestas inválidas, errores de conexión con la API.
Temporizador de 10 segundos por pregunta en la trivia, hecho con setInterval y clearInterval.
Récords: cada juego guarda sus partidas en localStorage y la página de puntajes muestra los 5 mejores de cada uno, con un botón para borrarlos.
Guías de juego con las reglas de 10000 y Blackjack.
Diseño adaptable: las columnas y tarjetas se acomodan solas en pantallas chicas.

Pruebas realizadas
Navegación entre todas las páginas desde el menú.
Partidas completas de los tres juegos, incluyendo victoria, derrota y empate.
Selecciones de dados que no puntúan y apuestas inválidas (vacías, negativas, mayores a las fichas, con decimales).
Temporizador de la trivia: dejar que se acabe el tiempo sin responder.
Guardado de récords y que aparezcan en la página de puntajes; botón de borrar récords.
Funcionamiento del sitio publicado en GitHub Pages.
Corroboracion del funcionamiento de cada juego con personas externas al trabajo. 

Declaración de uso de IA
Herramientas utilizadas: Claude 
Etapas en las que se usó: revisión de código, diseño visual (CSS), corrección de errores, revisión del código contra los contenidos de la cursada y documentación.
Principales usos y ejemplos de aportes:
Revisión del HTML del Blackjack: detectó errores como type="numbre" en el campo de apuesta y un atributo id con una comilla sin cerrar, que hacía que el JavaScript no encontrara el campo y el juego no arrancara.
Organización del CSS: separamos los estilos que estaban escritos dentro de los HTML y los pasamos a una única hoja externa, organizada en bloques por página, como pide la consigna.
Página de puntajes y récords: propuso la estructura de records.js y puntajes.js para guardar y mostrar los récords con localStorage.
Diagnóstico de errores: ayudó a encontrar por qué la página de puntajes no guardaba datos (una llave mal ubicada en records.js) y por qué el sitio publicado no mostraba los últimos cambios.
Adaptación a los contenidos de la cursada: comparamos el código con el temario de las clases y reemplazamos lo que no habíamos visto por herramientas de la cursada 

Modificaciones, correcciones y decisiones del grupo:.
Revisamos que el CSS no tuviera estilos para clases que no existían en nuestro código, y los eliminamos.
Detectamos que la página publicada no se actualizaba y comprobamos, comparando el código fuente del navegador con el del editor, que el problema era la publicación y no el código.
La IA propuso reemplazar los dados y las cartas por imágenes; decidimos mantenerlos dibujados con HTML y CSS.

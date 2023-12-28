const idPartida = obtenerValorParametro("id");
const JoinButton = document.querySelector("#JoinButton");
const nombreJugador = document.querySelector("#jugador");
const main = document.querySelector(".main");
const tiempoMaximoEspera = 90000; // 90 segundos
const textomodal = document.querySelector("#textomodal");

// Conectar al servidor de Socket.IO
const socket = io();

// Evento para unirse a la partida
function unirsePartida(partida) {
  // Enviar información al servidor

  const nombreJugadorActual = nombreJugador.value;
  console.log(nombreJugadorActual);
  socket.emit("unirsePartida", { partida, nombreJugadorActual });

  setTimeout(() => {
    // Oculta el spinner (cambia esta lógica según tu implementación específica)
    quitarSpinner();
  }, tiempoMaximoEspera);
}

JoinButton.addEventListener("click", () => {
  joinGame();
});

function obtenerValorParametro(parametro) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(parametro);
}

async function cargarPartida(idPartida) {
  // Cargar el archivo JSON local
  fetch("json/partidas.json")
    .then((response) => response.json())
    .then((data) => {
      // Buscar la partida por ID
      const partidaEncontrada = data.partidas.find(
        (partida) => partida.id == idPartida
      );
      return partidaEncontrada;
    })
    .catch((error) => console.error("Error al cargar el JSON:", error));
}

async function joinGame() {
  const archivo = "json/partidas.json";
  // Ajustar la duración del temporizador según tus necesidades (en segundos)
  const resultado = await fetch(archivo);
  const datos = await resultado.json();
  const partidaActual = datos.partidas.find(
    (partida) => partida.id == idPartida
  );
  console.log(partidaActual);
  if (partidaActual) {
    // Acceder a los demás valores de la partida
    const jugadores = partidaActual.jugadores;
    const impostores = partidaActual.impostores;
    const tematica = partidaActual.tematica;
    console.log(
      `ID: ${idPartida}, Jugadores: ${jugadores}, Impostores: ${impostores}, Tematica: ${tematica} el jugador que se va a unir es ${nombreJugador.value}`
    );
    unirsePartida(partidaActual);
  } else {
    console.log(`No se encontró ninguna partida con el ID: ${idPartida}`);
  }

  //await registrarJugadorPartida();
}

function mostrarSpinner(spinner) {
  // Muestra el spinner (cambia esta lógica según tu implementación específica)
  nombreJugador.readOnly = true;
  JoinButton.disabled = true;
  main.classList.add("opacidad");
  document.getElementById("modal").style.display = "flex";
  if (spinner) {
    document.getElementById("spinner").style.display = "flex";
  } else {
    document.getElementById("spinner").style.display = "none";
  }
}

function quitarSpinner() {
  nombreJugador.readOnly = false;
  JoinButton.disabled = false;
  main.classList.remove("opacidad");
  document.getElementById("modal").style.display = "none";
}

function cerrarModal() {
  quitarSpinner();
}

socket.on("todosConectados", (data) => {
  console.log(data.mensaje);
  textomodal.innerHTML = data.mensaje;
  mostrarSpinner(false);
});

// Escuchar el evento "jugadorUnido"
socket.on("jugadorUnido", (data) => {
  // Aquí puedes manejar la información recibida del servidor
  console.log("Nuevo jugador unido:", data.nuevoJugador.nombre);
  console.log(
    `Lista de jugadores conectados a la partida:${data.jugadoresConectadosActuales.map(jugador => `- ${jugador.nombre}`)}`
  );
  textomodal.innerHTML = `
  Cuando la sala se complete con ${data.partida.jugadores} jugadores, comenzamos:<br>
  <ul class="lista-jugadores">
    ${data.jugadoresConectadosActuales.map(jugador => `<li>${jugador.nombre}</li>`).join('')}
  </ul>
`;

  mostrarSpinner(true);
  // Puedes realizar otras acciones en respuesta a este evento
  // por ejemplo, actualizar la interfaz de usuario con la nueva información.
});


// Escuchar el evento "comenzarPartida"
socket.on("comenzarPartida", (data) => {
    // Aquí puedes manejar la información recibida del servidor
    console.log(data.mensaje);
    textomodal.innerHTML = `${data.mensaje}`;
    mostrarSpinner(false);
    // Puedes realizar otras acciones en respuesta a este evento
    // por ejemplo, actualizar la interfaz de usuario con la nueva información.
  });

const idPartida = obtenerValorParametro("id");
const JoinButton = document.querySelector("#JoinButton");
const nombreJugador = document.querySelector("#jugador");
const main = document.querySelector(".main");
const tiempoMaximoEspera = 90000; // 90 segundos
const textomodal = document.querySelector("#textomodal");
let partidaCargada = null;

// Conectar al servidor de Socket.IO
const socket = io();

document.addEventListener("DOMContentLoaded", function () {
  console.log("Id de la partida: " + idPartida);
});

JoinButton.addEventListener("click", () => {
  joinGameBBDD();
});

function obtenerValorParametro(parametro) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(parametro);
}

function generateGuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generarAleatorio(maximo) {
  // Aseguramos que maximo sea un número positivo
  maximo = Math.abs(Math.floor(maximo));

  // Generamos un número aleatorio entre 0 (inclusive) y 1 (exclusivo)
  const numeroAleatorio = Math.random();

  // Escalamos el número aleatorio al rango [0, maximo) y redondeamos
  const numeroFinal = Math.floor(numeroAleatorio * (maximo));

  return numeroFinal;
}

function addTextoModal(mensaje){
  textomodal.innerHTML += "\n" + mensaje;
  console.log(textomodal.innerHTML);
}

// Evento para unirse a la partida
async function unirsePartida(partidaCargada, jugadoresConectadosEnPartida) {
  //Conectamos a la partida al jugador, agregamos el jugador a la BBDD
  const nombreJugadorActual = nombreJugador.value;
  console.log("Usuario que se unira a la partida:" + nombreJugadorActual);
  //INSERT del jugador en la BBDD
  // Verificar que aún hay espacio para más jugadores
  console.log(`Jugadores conectados en partida ${jugadoresConectadosEnPartida.length}`)
  console.log(`Jugadores totales de la partida ${partidaCargada.jugadores}`)
  if (jugadoresConectadosEnPartida.length < partidaCargada.jugadores) {
    const nuevoJugador = {
      id: generateGuid(),
      partida_id: partidaCargada.id,
      nombre: nombreJugadorActual,
      impostor: false,
      socket_id: "",
      es_primero: false,
    };
    console.log(await insertJugador(nuevoJugador));

    //Añadimos el jugador a la room con id_partida del socket y recibimos el socket_id
    socket.emit("unirsePartida", { nuevoJugador });

    //Comprobamos si la sala esta completa, si esta completa y es el jugador+1 en entrar, se envia mensaje de "sala completa"
    //Si no esta llena, mostramos los usuarios que se van conectando
    //cuando esten todos dentro de la sala, generamos aleatoriamente el impostor y el que comienza y lanzamos los mensajes a cada jugador
    await comprobarSala(partidaCargada);


    
  } else {
    console.log(
      `La partida ${partidaCargada.id} esta llena, hay ${partidaCargada.jugadores} jugadores conectados`
    );
    textomodal.innerHTML = `La partida esta llena, hay ${partidaCargada.jugadores} jugadores conectados`;
    mostrarSpinner(false);
  }

  

  setTimeout(() => {
    // Oculta el spinner (cambia esta lógica según tu implementación específica)
    quitarSpinner();
  }, tiempoMaximoEspera);
}

async function comprobarSala(partidaCargada){
  let jugadoresConectados = await jugadoresConectadosPartida(
    partidaCargada.id
  );
  if (jugadoresConectados.length == partidaCargada.jugadores){
    //Comprobamos que estan todos los jugadores conectados
    
    //   const socketIdSala = io.sockets.adapter.rooms.get(partidaCargada.id);
    //metodo que genera aleatoriamente el impostor
    const numAleatorioImpostor = generarAleatorio(jugadoresConectados.length);
    const numAleatorioComenzar = generarAleatorio(jugadoresConectados.length);
    await Promise.all([asignarImpostor(jugadoresConectados[numAleatorioImpostor]), asignarComienzo(jugadoresConectados[numAleatorioComenzar])]);
    console.log(`Impostor y primer jugador asignados`)
    addTextoModal(`Impostor y primer jugador asignados`);

    jugadoresConectados = await jugadoresConectadosPartida(partidaCargada.id);
    console.log(JSON.stringify(jugadoresConectados));
    comenzarPartida(jugadoresConectados, partidaCargada);

    //const socketIdSala = io.sockets.adapter.rooms.get(partidaCargada.id);
     
 }else{
  console.log(
    `La partida ${partidaCargada.id} aun no esta completa, faltan ${partidaCargada.jugadores - jugadoresConectados.length} jugador(es) para empezar`
  );
 }
}

async function comenzarPartida(jugadoresConectados, partidaCargada){
  //Enviamos mensaje al servidor para que comience la partida con los jugadores conectados
  socket.emit("comenzarPartida", { jugadoresConectados, partidaCargada });
}

async function asignarImpostor(jugadorImpostor){
  //modificamos en bbdd al jugador impostor
  return new Promise((resolve, reject) => {
    fetch(`/updateJugador`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: jugadorImpostor.id, 
        columna: "impostor", 
        valor: true
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error),
        console.error("Error al agregar el jugador:", error)
        }
      );
  });
}

async function asignarComienzo(primerJugador){
  return new Promise((resolve, reject) => {
    fetch(`/updateJugador`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: primerJugador.id, 
        columna: "es_primero", 
        valor: true
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error),
        console.error("Error al agregar el jugador:", error)
        }
      );
  });
}

async function jugadoresConectadosPartida(idPartida) {
  return new Promise((resolve, reject) => {
    const endpoint = `/getJugadorById?partida_id=${idPartida}`;
    fetch(endpoint)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        resolve(data.jugadoresConectados);
      })
      .catch((error) => {
        // Rechaza la promesa con el error si ocurre alguno
        reject(error);
      });
  });
}

async function joinGameBBDD() {
  //Primero recogemos la informacion de la partida que se esta jugando
  partidaCargada = await getPartida();
  partidaCargada.forEach((partida) => {
    console.log(
      `Partida cargada --> ID: ${partida.id}, Jugadores: ${partida.jugadores}, Impostores: ${partida.impostores}, Tematica: ${partida.tematica}`
    );
  });

  //Segundo, vemos si hay algun jugador conectado
  const jugadoresConectados = await jugadoresConectadosPartida(
    partidaCargada[0].id
  );
  console.log(
    `Hay ${jugadoresConectados.length} jugadores conectados a la partida ${partidaCargada[0].id}`
  );
  jugadoresConectados.forEach((jugador, indice) => {
    console.log(
      `Jugador ${indice + 1} \nNombre: ${jugador.nombre}, Impostor: ${
        jugador.impostor
      }`
    );
  });
  console.log(`Conectandose a la partida ${partidaCargada[0].id}...`);

  //Cuando tenemos la partida, conectamos al jugador actual a la partida en curso
  unirsePartida(partidaCargada[0], jugadoresConectados);
}

async function insertJugador(jugador) {
  return new Promise((resolve, reject) => {
    fetch(`/RegistroJugador`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jugador
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error),
        console.error("Error al agregar el jugador:", error)
        }
      );
  });
}

async function getPartida() {
  return new Promise((resolve, reject) => {
    const endpoint = `/getPartidaById?id=${idPartida}`;
    fetch(endpoint)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        resolve(data.partidas);
      })
      .catch((error) => {
        // Rechaza la promesa con el error si ocurre alguno
        reject(error);
      });
  });
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

socket.on("jugadorUnido", (data) => {
  // Aquí puedes manejar la información recibida del servidor
  console.log("Nuevo jugador unido:", data.nuevoJugador.nombre);
  jugadorUnido(data.nuevoJugador);
});

// Escuchar el evento "jugadorUnido"
async function jugadorUnido(nuevoJugador) {
  const jugadoresConectados = await jugadoresConectadosPartida(nuevoJugador.partida_id);
  if(jugadoresConectados.length )
  console.log(
    `Lista de jugadores conectados a la partida:${jugadoresConectados.map(
      (jugador) => `- ${jugador.nombre}`
    )}`
  );
  textomodal.innerHTML = `Cuando la sala se complete comenzamos:<br>
    <ul class="lista-jugadores">
    ${jugadoresConectados
      .map((jugador) => `<li>${jugador.nombre}</li>`)
      .join("")}
    </ul>`;
  mostrarSpinner(true);
}

// Escuchar el evento "comenzarPartida"
socket.on("sendAllMessage", (data) => {
  // Aquí puedes manejar la información recibida del servidor
  console.log(data.mensaje);
  textomodal.innerHTML = `${data.mensaje}`;
  mostrarSpinner(false);
});

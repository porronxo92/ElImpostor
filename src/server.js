const express = require("express");
const http = require("http");
const fs = require("fs");
const path = require("path"); // Módulo para trabajar con rutas de archivos
const socketIO = require("socket.io"); // modulo para importar sockets

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000; // Puedes cambiar el puerto según tu preferencia
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, "public")));

// Ruta para registrar partidas
app.post("/RegistroPartida", (req, res) => {
  const { id, jugadores, impostores, tematica, jugadoresConectados } = req.body;

  // Leer el archivo JSON actual
  const jsonData = fs.readFileSync(
    path.join(__dirname, "public", "json/partidas.json"),
    "utf-8"
  );
  const partidas = JSON.parse(jsonData);

  // Generar un ID único para la nueva partida
  const nuevaPartida = {
    id: id, // Usando la marca de tiempo como ID (puedes usar un método más robusto en producción)
    jugadores: jugadores,
    impostores: impostores,
    tematica: tematica,
    jugadoresConectados: [],
  };

  // Agregar la nueva partida al arreglo
  partidas.partidas.push(nuevaPartida);

  // Escribir el arreglo actualizado de partidas de vuelta al archivo JSON
  fs.writeFileSync(
    path.join(__dirname, "public", "json/partidas.json"),
    JSON.stringify(partidas, null, 2)
  );

  // Enviar una respuesta al cliente
  res.json({
    success: true,
    mensaje: "Partida registrada exitosamente",
    partida: nuevaPartida,
  });
});

// Ruta para registrar tematicas
app.post("/RegistroTematica", (req, res) => {
  const { id, tematica } = req.body;

  // Leer el archivo JSON actual
  const jsonData = fs.readFileSync(
    path.join(__dirname, "public", "json/tematica.json"),
    "utf-8"
  );
  const tematicas = JSON.parse(jsonData);

  // Generar un ID único para la nueva partida
  const nuevaTematica = {
    id: id, // Usando la marca de tiempo como ID (puedes usar un método más robusto en producción)
    tematica: tematica,
  };

  // Agregar la nueva partida al arreglo
  tematicas.tematicas.push(nuevaTematica);

  // Escribir el arreglo actualizado de partidas de vuelta al archivo JSON
  fs.writeFileSync(
    path.join(__dirname, "public", "json/tematica.json"),
    JSON.stringify(tematicas, null, 2)
  );

  // Enviar una respuesta al cliente
  res.json({
    success: true,
    mensaje: "Tematica registrada exitosamente",
    tematica: nuevaTematica,
  });
});

//Ruta para acceder a la pantalla de administracion
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// La lógica para registrar a un usuario en una partida podría ser algo así
io.on("connection", (socket) => {
  console.log("Socket levantado: " + socket.id);

  // Evento para unirse a una partida
  socket.on("unirsePartida", ({ partida, nombreJugadorActual }) => {
    // Verificar que aún hay espacio para más jugadores
    if (partida.jugadoresConectados.length < partida.jugadores) {
      //agregar jugador al JSON de la partida
      const nuevoJugador = {
        nombre: nombreJugadorActual,
        impostor: false,
        socketId: socket.id,
      };
      agregarJugador(partida.id, nuevoJugador);
      //añadir el nombre del jugador a la lista de jugadores que estan conectados
      partida.jugadoresConectados.push(nuevoJugador);
      const jugadoresConectadosActuales = partida.jugadoresConectados;
      console.log(
        "Lista de jugadores conectados a la partida: ",
        jugadoresConectadosActuales
      );
      //añadir socket del jugador a la sala
      socket.join(partida.id);
      // Emitir a todos los clientes en la misma partida que se ha unido un jugador
      io.to(partida.id).emit("jugadorUnido", {
        partida,
        nuevoJugador,
        jugadoresConectadosActuales,
      });

      console.log(
        `Jugador ${nuevoJugador.nombre} se ha unido a la partida ${partida.id}`
      );
      //Comprobamos que estan todos los jugadores conectados
      if (jugadoresConectadosActuales.length == partida.jugadores) {
        const socketIdSala = io.sockets.adapter.rooms.get(partida.id);
        //metodo que genera aleatoriamente el impostor
        const partidaBarajada = asignarImpostores(partida);
        actualizarPartida(partidaBarajada);
        //Lógica para enviar mensajes a cada jugador
        const primerJugador = numeroAleatorioHasta(partida.jugadores);
        partida.jugadoresConectados.forEach((jugador, indice) => enviarMensajeJugadores(jugador, partida.tematica, indice, primerJugador));
        // const mensajePersonalizado = `La tematica es: ${partida.tematica}`;
        // enviarMensajeJugadores(socketIdSala, mensajePersonalizado);
      }
    } else {
      // Informar al cliente que la partida está llena
      socket.emit("todosConectados", {
        mensaje:
          "La partida está llena, hay " +
          partida.jugadores +
          " jugadores conectados",
      });
      console.log(
        `La partida ${partida.id} esta llena, hay ${partida.jugadoresConectados.length} jugadores conectados`
      );
    }

    //isSocketinRoom(partida.id, socket.id);
  });
  // Resto de la lógica...

  //   // Manejar la desconexión del usuario
  //   socket.on("disconnect", () => {
  //     console.log("Socket desconectado");
  //     // Puedes agregar lógica adicional aquí, por ejemplo, eliminar al usuario de la partida
  //   });
});

function leerJSONPArtidas() {
  // Lee el contenido actual del archivo JSON
  const contenidoJSON = fs.readFileSync(
    path.join(__dirname, "public", "json/partidas.json"),
    "utf-8"
  );

  // Parsea el contenido JSON para manipularlo como un objeto JavaScript
  return JSON.parse(contenidoJSON);
}

function agregarJugador(partidaId, nuevoJugador) {
  const data = leerJSONPArtidas();
  // Encuentra la partida específica en el array
  const partida = data.partidas.find((p) => p.id == partidaId);

  // Asegúrate de que la partida exista
  if (partida) {
    // Agrega el jugador a la matriz de jugadoresConectados
    partida.jugadoresConectados.push(nuevoJugador);

    // Escribe los cambios de vuelta al archivo JSON
    fs.writeFileSync(
      path.join(__dirname, "public", "json/partidas.json"),
      JSON.stringify(data, null, 2)
    );
    console.log(
      `El jugador ${nuevoJugador.nombre} se ha añadido a la lista de conectados`
    );
  } else {
    console.error("No se encontró la partida con el ID especificado");
  }
}

function actualizarPartida(partidaBarajada) {
  const data = leerJSONPArtidas();
  const partidaActualizada = data.partidas.find(
    (p) => p.id == partidaBarajada.id
  );

  if (partidaActualizada) {
    // Realizar las modificaciones necesarias (en este caso, barajar los jugadores)
    partidaActualizada.jugadoresConectados =
      partidaBarajada.jugadoresConectados;

    // Actualizar el archivo JSON con la nueva información
    // Escribe los cambios de vuelta al archivo JSON
    fs.writeFileSync(
      path.join(__dirname, "public", "json/partidas.json"),
      JSON.stringify(data, null, 2)
    );

    console.log("Partida actualizada correctamente.");
  } else {
    console.error("Partida no encontrada.");
  }
}

function enviarMensajeJugadores(jugador, tematica, indice, primerJugador) {
  console.log("ID de socket en la sala:", jugador.socketId);
  if (jugador.impostor)
    mensajePersonalizado = "Eres el impostor. ¡Engaña a los demás!";
  else mensajePersonalizado = `La temática es: ${tematica}`;

  if (indice == primerJugador) mensajePersonalizado += "\nTu empiezas. ¡Es el azar!";

  console.log(`Jugador ${jugador.nombre}, impostor ${jugador.impostor} con id ${jugador.socketId}`);
  console.log(mensajePersonalizado);

  io.to(jugador.socketId).emit("comenzarPartida", {
    mensaje: mensajePersonalizado,
  });
}

// Rutas y lógica de tu aplicación irán aquí
//const PORT = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

server.on("close", () => {
  io.close(() => {
    console.log("Los sockets se cerraron correctamente.");
  });
  console.log("El servidor se cerro correctamente.");
});

function asignarImpostores(partida) {
  const numImpostores = parseInt(partida.impostores, 10);
  const maxJugadores = parseInt(partida.jugadores, 10);

  // Crea un array con todos los jugadores posibles
  const jugadoresPosibles = partida.jugadoresConectados;

  // Baraja el array de jugadores posibles de manera aleatoria
  const jugadoresBarajados = jugadoresPosibles.sort(() => Math.random() - 0.5);

  // Asigna como impostores los primeros N jugadores barajados
  const impostores = jugadoresBarajados.slice(0, numImpostores);

  // Actualiza el estado de impostor en el array original
  jugadoresPosibles.forEach((jugador, index) => {
    jugador.impostor = impostores.some(
      (impostor) => impostor.nombre === jugador.nombre
    );
  });

  // Actualiza el array de jugadoresConectados en la partida
  partida.jugadoresConectados = jugadoresPosibles;

  return partida;
}

function numeroAleatorioHasta(maximo) {
    // Aseguramos que maximo sea un número positivo
    maximo = Math.abs(Math.floor(maximo));
  
    // Generamos un número aleatorio entre 0 (inclusive) y 1 (exclusivo)
    const numeroAleatorio = Math.random();
  
    // Escalamos el número aleatorio al rango [0, maximo) y redondeamos
    const numeroFinal = Math.floor(numeroAleatorio * (maximo + 1));
  
    return numeroFinal;
  }

function enviarMensajeComienzo(jugador){
    io.to(jugador.socketId).emit("comenzarPartida", {
        mensaje: mensajePersonalizado,
      });
}

const express = require("express");
const http = require("http");
const fs = require("fs");
const path = require("path"); // Módulo para trabajar con rutas de archivos
const socketIO = require("socket.io"); // modulo para importar sockets
const bbdd = require("./db/bbdd");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000; // Puedes cambiar el puerto según tu preferencia
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, "public")));

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
// Ruta para registrar partidas
app.post("/RegistroPartida", (req, res) => {
  const { id, jugadores, impostores, tematica } = req.body;

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

// Ruta para registrar partidas en BBDD
app.post("/RegistroPartidaBBDD", (req, res) => {
  const nuevaPartida = req.body;
  bbdd
    .insertarPartida(nuevaPartida)
    .then((rowCount) => {
      escribirLog(`${rowCount} fila(s) insertada(s)`, obtenerUbicacionLlamada());
      escribirLog(`${nuevaPartida} registrada correctamente en la BBDD`, obtenerUbicacionLlamada());
      // Enviar una respuesta al cliente
      res.json({
        success: true,
        mensaje: "Partida registrada exitosamente",
        partida: nuevaPartida,
      });
    })
    .catch((error) => {
      console.error("Error al insertar partida:", error);
      res.json({error});
    });
});
// Ruta para registrar partidas en BBDD
app.post("/RegistroTematicaBBDD", (req, res) => {
  const nuevaTematica = req.body;
  bbdd
    .insertarTematica(nuevaTematica)
    .then((rowCount) => {
      escribirLog(`${rowCount} fila(s) insertada(s)`, obtenerUbicacionLlamada());
      escribirLog(`${nuevaTematica} registrada correctamente en la BBDD`, obtenerUbicacionLlamada());
      // Enviar una respuesta al cliente
      res.json({
        success: true,
        mensaje: "Tematica registrada exitosamente",
        tematica: nuevaTematica,
      });
    })
    .catch((error) => {
      console.error("Error al insertar partida:", error);
      res.json({error});
    });
});
// Ruta para registrar partidas en BBDD
app.post("/RegistroJugador", (req, res) => {
  const nuevoJugador = req.body.jugador;
  bbdd
    .insertarJugadorPartida(nuevoJugador)
    .then((rowCount) => {
      escribirLog(`${rowCount} fila(s) insertada(s)`, obtenerUbicacionLlamada());
      escribirLog(`${JSON.stringify({nuevoJugador})} registrado correctamente en la BBDD`, obtenerUbicacionLlamada());
      // Enviar una respuesta al cliente
      res.json({
        success: true,
        mensaje: "Jugador registrado exitosamente",
        jugador: nuevoJugador,
      });
    })
    .catch((error) => {
      console.error("Error al insertar partida:", error);
      res.json({error});
    });
});

// Ruta para obtener partidas en BBDD
app.get("/getPartidaById", (req, res) => {
  const id = req.query.id;
  bbdd
    .obtenerPartidas(id)
    .then((rows) => {
      escribirLog(`${rows.length} partida(s) encontrada(s) en la BBDD con el id: ${id}`, obtenerUbicacionLlamada());
      // Enviar una respuesta al cliente
      res.json({
        success: true,
        mensaje: `${rows.length} partida(s) encontrada(s) en la BBDD con el id: ${id}`,
        partidas: rows
      });
    })
    .catch((error) => {
      console.error("Error al consultar partida:", error);
      res.json({error});
    });
});
// Ruta para obtener tematicas en BBDD por id
app.get("/getTematicaById", (req, res) => {
  const id = req.query.id;
  bbdd
    .obtenerTematicas(id)
    .then((rows) => {
      escribirLog(`${rows.length} tematica(s) encontrada(s) en la BBDD con el id: ${id}`, obtenerUbicacionLlamada());
      // Enviar una respuesta al cliente
      res.json({
        success: true,
        mensaje: `${rows.length} tematica(s) encontrada(s) en la BBDD con el id: ${id}`,
        tematica: rows[0].tematica
      });
    })
    .catch((error) => {
      console.error("Error al consultar partida:", error);
      res.json({error});
    });
});
// Ruta para obtener todas las tematicas en BBDD
app.get("/getTematicas", (req, res) => {
  bbdd.getAllTematicas()
    .then((rows) => {
      escribirLog(`${rows.length} tematica(s) encontrada(s) en la BBDD`, "/getTematicas");
      // Enviar una respuesta al cliente
      res.json({
        success: true,
        mensaje: `${rows.length} tematica(s) encontrada(s) en la BBDD`,
        tematicas: rows
      });
    })
    .catch((error) => {
      console.error("Error al consultar partida:", error);
      res.json({error});
    });
});
// Ruta para obtener partidas en BBDD
app.get("/getJugadorById", (req, res) => {
  const partida_id = req.query.partida_id;
  bbdd
    .obtenerJugadoresPartida(partida_id)
    .then((rows) => {
      escribirLog(`${rows.length} jugador(es) conectado(s) a la partida con el id: ${partida_id}`, obtenerUbicacionLlamada());
      // Enviar una respuesta al cliente
      res.json({
        success: true,
        mensaje: `${rows.length} jugador(es) conectado(s) a la partida con el id: ${partida_id}`,
        jugadoresConectados: rows
      });
    })
    .catch((error) => {
      console.error("Error al consultar partida:", error);
      res.json({error});
    });
});

// Ruta para actualizar partidas en BBDD
app.put("/updatePartida", (req, res) => {
  const nuevaPartida = req.body;
  bbdd
    .updatePartida(nuevaPartida)
    .then((rows) => {
      escribirLog(`${rows} partida actualizada`, obtenerUbicacionLlamada());
      // Enviar una respuesta al cliente
      res.json({
        success: true,
        mensaje: `${rows} partida actualizada`,
      });
    })
    .catch((error) => {
      console.error("Error al consultar partida:", error);
      res.json({error});
    });
});
// Ruta para actualizar tematicas en BBDD
app.put("/updateTematica", (req, res) => {
  const nuevaTematica = req.body;
  bbdd
    .updatePartida(nuevaTematica)
    .then((rows) => {
      escribirLog(`${rows} tematica actualizada`, obtenerUbicacionLlamada());
      // Enviar una respuesta al cliente
      res.json({
        success: true,
        mensaje: `${rows} tematica actualizada`,
      });
    })
    .catch((error) => {
      console.error("Error al consultar partida:", error);
      res.json({error});
    });
});
// Ruta para actualizar partidas en BBDD
app.put("/updateJugador", (req, res) => {
  const peticion = req.body;
  bbdd
    .updateCampoJugador(peticion.id, peticion.columna, peticion.valor)
    .then((rows) => {
      escribirLog(`${rows} jugador actualizado`, obtenerUbicacionLlamada());
      // Enviar una respuesta al cliente
      res.json({
        success: true,
        mensaje: `${rows} jugador actualizado`,
      });
    })
    .catch((error) => {
      console.error("Error al consultar partida:", error);
      res.json({error});
    });
});

//Ruta para acceder a la pantalla de administracion
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// La lógica para registrar a un usuario en una partida con socket
io.on("connection", (socket) => {
  const socket_id = socket.id
  escribirLog("Socket levantado: " + socket_id, obtenerUbicacionLlamada());

  // Evento para unirse a una partida
  socket.on("unirsePartida", ({ nuevoJugador }) => {
      //agregr jugador al JSON de la partida
      nuevoJugador.socket_id = socket_id;
      actualizarJugador(nuevoJugador);
      //añadir socket del jugador a la sala
      socket.join(nuevoJugador.partida_id);
     
      // Emitir a todos los clientes en la misma partida que se ha unido un jugador
      io.to(nuevoJugador.partida_id).emit("jugadorUnido", {
        nuevoJugador
      });

      escribirLog(
        `Jugador "${nuevoJugador.nombre}" se ha unido a la partida ${nuevoJugador.partida_id}`, obtenerUbicacionLlamada()
      );     
  });

  socket.on("comenzarPartida", ({ jugadoresConectados, tematica_cargada }) => {
    escribirLog("Comenzar partida ", obtenerUbicacionLlamada())
    jugadoresConectados.forEach((jugadorConectado) => { 
      let mensaje = `¡A jugar <strong>${jugadorConectado.nombre}</strong>!<br>La tematica es: <strong> ${tematica_cargada} </strong>`
      if(jugadorConectado.impostor) mensaje = `¡Eres el impostor ${jugadorConectado.nombre} que no te pillen!`
      if(jugadorConectado.es_primero) mensaje += `<br>¡Eres el primero ${jugadorConectado.nombre} empiezas tu!`
      enviarMensajeComienzo(jugadorConectado, mensaje);
    });
  });
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

async function actualizarJugador(nuevoJugador){
  bbdd
    .updateCampoJugador(nuevoJugador.id, "socket_id", nuevoJugador.socket_id)
    .then((rowCount) => {
      escribirLog(`${rowCount} fila(s) actualizada(s)`, obtenerUbicacionLlamada());
      escribirLog(`${JSON.stringify(nuevoJugador, null, 2)} registrado correctamente en la BBDD`, obtenerUbicacionLlamada());
    })
    .catch((error) => {
      console.error("Error al actualizar jugador:", error);
    });
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
    escribirLog(
      `El jugador ${nuevoJugador.nombre} se ha añadido a la lista de conectados`, obtenerUbicacionLlamada()
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

    escribirLog("Partida actualizada correctamente.", obtenerUbicacionLlamada());
  } else {
    console.error("Partida no encontrada.");
  }
}

// Rutas y lógica de tu aplicación irán aquí
//const PORT = process.env.PORT || 3000;
server.listen(port, () => {
  escribirLog(`Servidor escuchando en el puerto ${port}`, obtenerUbicacionLlamada());
});

server.on("close", () => {
  io.close(() => {
    escribirLog("Los sockets se cerraron correctamente.", obtenerUbicacionLlamada());
  });
  escribirLog("El servidor se cerro correctamente.", obtenerUbicacionLlamada());
});

function enviarMensajeComienzo(jugador, mensaje) {
  io.to(jugador.socket_id).emit("sendAllMessage", {
    mensaje: mensaje
  });
}

function obtenerUbicacionLlamada() {
  // Captura la pila de llamadas para obtener información sobre el archivo y la línea
  const stackTrace = new Error().stack.split('\n');
  // La tercera línea contiene la información de la ubicación
  const ubicacionLlamada = stackTrace[2].trim();
  const regex = /at (\S+) \(([^)]+)\)/; 
  const matchResult = regex.exec(ubicacionLlamada);
  if (matchResult) {
    // Extrae solo el nombre del método y la parte de la ruta del archivo y la línea
    const [, metodo, rutaYLinea] = matchResult;
    return metodo && rutaYLinea ? `Method: ${metodo} - ${rutaYLinea.trim()}` : 'Ubicación desconocida';
  }

  return 'Ubicación desconocida';
}

function escribirLog(mensaje, metodo) {
  const nivel = "info";
  // Obtener la fecha y hora actual
  const fechaHora = new Date().toISOString();
  // Obtener información sobre la ubicación de la llamada
  //const ubicacionLlamada = obtenerUbicacionLlamada();

  // Crear el mensaje de log con el formato deseado
  const log = `[${nivel.toUpperCase()}] [${fechaHora}] - ${mensaje} (${metodo})`;

  // Escribir en la consola
  if (nivel === 'info') {
    console.log(log);
  } else if (nivel === 'warn') {
    console.warn(log);
  } else if (nivel === 'error') {
    console.error(log);
  }
}

const express = require("express");
const http = require("http");
const fs = require("fs");
const path = require("path"); // Módulo para trabajar con rutas de archivos
const socketIO = require("socket.io"); // modulo para importar sockets
const bbdd = require("./db/bbdd");
const utils = require("./db/utils");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000; // Puedes cambiar el puerto según tu preferencia
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, "public")));


/* POST BBDD */
// Ruta para registrar partidas en BBDD
app.post("/RegistroPartidaBBDD", (req, res) => {
  const nuevaPartida = req.body;
  bbdd
    .insertarPartida(nuevaPartida)
    .then((rowCount) => {
      // Enviar una respuesta al cliente
      res.json({
        success: true,
        mensaje: "Partida registrada exitosamente",
        partida: nuevaPartida,
      });
    })
    .catch((error) => {
      utils.escribirLog("Error al insertar partida:"+ error, 2);
      res.json({error});
    });
});
// Ruta para registrar partidas en BBDD
app.post("/RegistroTematicaBBDD", (req, res) => {
  const nuevaTematica = req.body;
  bbdd
    .insertarTematica(nuevaTematica)
    .then((rowCount) => {
      // Enviar una respuesta al cliente
      res.json({
        success: true,
        mensaje: "Tematica registrada exitosamente",
        tematica: nuevaTematica,
      });
    })
    .catch((error) => {
      utils.escribirLog("Error al insertar tematica "+ error, 2);
      res.json({error});
    });
});
// Ruta para registrar partidas en BBDD
app.post("/RegistroJugador", (req, res) => {
  const nuevoJugador = req.body.jugador;
  bbdd
    .insertarJugadorPartida(nuevoJugador)
    .then((rowCount) => {
      // Enviar una respuesta al cliente
      res.json({
        success: true,
        mensaje: "Jugador registrado exitosamente",
        jugador: nuevoJugador,
      });
    })
    .catch((error) => {
      utils.escribirLog("Error al insertar partida:"+ error, 2);
      res.json({error});
    });
});


/* GET BBDD */
// Ruta para obtener partidas en BBDD
app.get("/getPartidaById", (req, res) => {
  const id = req.query.id;
  bbdd
    .obtenerPartidas(id)
    .then((rows) => {
      // Enviar una respuesta al cliente
      res.json({
        success: true,
        mensaje: `${rows.length} partida(s) encontrada(s) en la BBDD con el id: ${id}`,
        partidas: rows
      });
    })
    .catch((error) => {
      utils.escribirLog("Error al consultar partida:"+ error, 2);
      res.json({error});
    });
});
// Ruta para obtener tematicas en BBDD por id
app.get("/getTematicaById", (req, res) => {
  const id = req.query.id;
  bbdd
    .obtenerTematicas(id)
    .then((rows) => {
      
      // Enviar una respuesta al cliente
      res.json({
        success: true,
        mensaje: `${rows.length} tematica(s) encontrada(s) en la BBDD con el id: ${id}`,
        tematica: rows[0].tematica
      });
    })
    .catch((error) => {
      utils.escribirLog("Error al consultar partida:"+ error, 2);
      res.json({error});
    });
});
// Ruta para obtener todas las tematicas en BBDD
app.get("/getTematicas", (req, res) => {
  bbdd.getAllTematicas()
    .then((rows) => {
      // Enviar una respuesta al cliente
      res.json({
        success: true,
        mensaje: `${rows.length} tematica(s) en la lista`,
        tematicas: rows
      });
    })
    .catch((error) => {
      utils.escribirLog("Error al consultar partida:"+ error, 2);
      res.json({error});
    });
});
// Ruta para obtener partidas en BBDD
app.get("/getJugadorById", (req, res) => {
  const partida_id = req.query.partida_id;
  bbdd
    .obtenerJugadoresPartida(partida_id)
    .then((rows) => {
      // Enviar una respuesta al cliente
      res.json({
        success: true,
        mensaje: `${rows.length} jugador(es) conectado(s) a la partida con el id: ${partida_id}`,
        jugadoresConectados: rows
      });
    })
    .catch((error) => {
      utils.escribirLog("Error al consultar partida:"+ error, 2);
      res.json({error});
    });
});


/* UPDATE BBDD */
// Ruta para actualizar partidas en BBDD
app.put("/updatePartida", (req, res) => {
  const nuevaPartida = req.body;
  bbdd
    .updatePartida(nuevaPartida)
    .then((rows) => {
      utils.escribirLog(`${rows} partida actualizada`);
      // Enviar una respuesta al cliente
      res.json({
        success: true,
        mensaje: `${rows} partida actualizada`,
      });
    })
    .catch((error) => {
      utils.escribirLog("Error al consultar partida:"+ error, 2);
      res.json({error});
    });
});
// Ruta para actualizar tematicas en BBDD
app.put("/updateTematica", (req, res) => {
  const nuevaTematica = req.body;
  bbdd
    .updatePartida(nuevaTematica)
    .then((rows) => {
      utils.escribirLog(`${rows} tematica actualizada`);
      // Enviar una respuesta al cliente
      res.json({
        success: true,
        mensaje: `${rows} tematica actualizada`,
      });
    })
    .catch((error) => {
      utils.escribirLog("Error al consultar partida:"+ error, 2);
      res.json({error});
    });
});
// Ruta para actualizar partidas en BBDD
app.put("/updateJugador", (req, res) => {
  const peticion = req.body;
  bbdd
    .updateCampoJugador(peticion.id, peticion.columna, peticion.valor)
    .then((rows) => {
      utils.escribirLog(`${rows} jugador actualizado`);
      // Enviar una respuesta al cliente
      res.json({
        success: true,
        mensaje: `${rows} jugador actualizado`,
      });
    })
    .catch((error) => {
      utils.escribirLog("Error al consultar partida:"+ error, 2);
      res.json({error});
    });
});

//Ruta para acceder a la pantalla de administracion
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Socket
io.on("connection", (socket) => {
  const socket_id = socket.id
  utils.escribirLog("Socket levantado: " + socket_id);

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

      utils.escribirLog(
        `Jugador "${nuevoJugador.nombre}" se ha unido a la partida ${nuevoJugador.partida_id}`
      );     
  });

  //Evento que comienza la partida
  socket.on("comenzarPartida", ({ jugadoresConectados, tematica_cargada }) => {
    utils.escribirLog("Comenzar partida ")
    jugadoresConectados.forEach((jugadorConectado) => { 
      let mensaje = `¡A jugar <strong>${jugadorConectado.nombre}</strong>!<br>La tematica es: <strong> ${tematica_cargada} </strong>`
      if(jugadorConectado.impostor) mensaje = `¡Eres el impostor ${jugadorConectado.nombre} que no te pillen!`
      if(jugadorConectado.es_primero) mensaje += `<br>¡Empiezas tú, ${jugadorConectado.nombre}!`
      enviarMensajeComienzo(jugadorConectado, mensaje);
    });
  });
});


// Metodos server
server.listen(port, () => {
  utils.escribirLog(`Servidor escuchando en el puerto ${port}`, 0);
});

server.on("close", () => {
  io.close(() => {
    utils.escribirLog("Los sockets se cerraron correctamente.");
  });
  utils.escribirLog("El servidor se cerro correctamente.");
});

/* Metodos y funcionalidades servidor */
async function actualizarJugador(nuevoJugador){
  bbdd
    .updateCampoJugador(nuevoJugador.id, "socket_id", nuevoJugador.socket_id)
    .then((rowCount) => {
      res.json({
        success: true,
        mensaje: `${rows} usuario actualizado`,
      });
    })
    .catch((error) => {
      utils.escribirLog("Error al actualizar jugador:"+ error, 2);
    });
}

function enviarMensajeComienzo(jugador, mensaje) {
  io.to(jugador.socket_id).emit("sendAllMessage", {
    mensaje: mensaje
  });
}


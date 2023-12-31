const { Pool } = require("pg");
const fs = require("fs");
const DATABASE_URL_LOCAL = 'postgres://user_root:ruben.2409@localhost:5432/impostor_db_local';
const DATABASE_ELEPHANTSQL = 'postgres://tcexqjal:GvdOPSNNW5BY1MD_PQ-e2-U0tXk3gZPb@mel.db.elephantsql.com/tcexqjal';

const DATABASE_URL = process.env.DATABASE_URL || DATABASE_URL_LOCAL
console.log("URL Base de datos: " + DATABASE_URL)
const pool = new Pool({
  connectionString: DATABASE_URL,
});

// Métodos para interactuar con la base de datos
// Método para obtener las partidas por id
async function obtenerPartidas(id) {
  const result = await pool.query(`SELECT * FROM partidas where id='${id}'`);
  return result.rows;
}
// Método para obtener las tematicas por id
async function obtenerTematicas(id) {
  const result = await pool.query(`SELECT * FROM tematicas where id='${id}'`);
  return result.rows;
}
// Método para obtener las tematicas por id
async function getAllTematicas() {
  const result = await pool.query(`SELECT * FROM tematicas`);
  return result.rows;
}
// Método para obtener los jugadores conectados a una partida
async function obtenerJugadoresPartida(partida_id) {
  const result = await pool.query(`SELECT * FROM jugadores_conectados where partida_id='${partida_id}'`);
  return result.rows;
}

// Método para insertar una nueva partida
async function insertarPartida(partida) {
  const { id, jugadores, impostores, tematica } = partida;
  const result = await pool.query(
    "INSERT INTO partidas (id, jugadores, impostores, tematica) VALUES ($1, $2, $3, $4)",
    [id, jugadores, impostores, tematica]
  );
  return result.rowCount;
}
// Método para insertar una nueva tematica
async function insertarTematica(nuevaTematica) {
  const { id, tematica } = nuevaTematica;
  const result = await pool.query(
    "INSERT INTO tematicas (id, tematica) VALUES ($1, $2)",
    [id, tematica]
  );
  return result.rowCount;
}
// Método para insertar un jugador en la partida
async function insertarJugadorPartida(jugador) {
  const { id, partida_id, nombre, impostor, socket_id, es_primero } = jugador;
  const result = await pool.query(
    "INSERT INTO jugadores_conectados (id, partida_id, nombre, impostor, socket_id, es_primero) VALUES ($1, $2, $3, $4, $5, $6)",
    [id, partida_id, nombre, impostor, socket_id, es_primero]
  );
  return result.rowCount;
}

// Método para actualizar una partida
async function updatePartida(partida) {
  const { id, jugadores, impostores, tematica } = partida;
  const result = await pool.query(
    "UPDATE partidas SET jugadores = $2, impostores = $3, tematica = $4 WHERE id = $1",
    [id, jugadores, impostores, tematica]
  );
  return result.rowCount;
}
// Método para actualizar una partida
async function updateCampoJugador(id, columna, valor) {
  
  // Construir la consulta dinámicamente
  const query = `UPDATE jugadores_conectados SET ${columna} = $1 WHERE id = $2`;
  // Ejecutar la consulta
  const result = await pool.query(query, [valor, id]);
  return result.rowCount;
}

// Método para actualizar una tematica
async function updateTematica(nuevaTematica) {
  const { id, tematica } = nuevaTematica;
  const result = await pool.query(
    "UPDATE tematicas SET tematica = $2 WHERE id = $1",
    [id, tematica]
  );
  return result.rowCount;
}
// Método para actualizar una jugador
async function updateJugador(jugador) {
  const id = jugador.id;
  const impostor = jugador.impostor;
  const result = await pool.query(
    "UPDATE jugadores_conectados SET impostor = $2 WHERE id = $1",
    [id, impostor]
  );
  return result.rowCount;
}


// Otros métodos según tus necesidades (actualización, eliminación, etc.)

// Exportar los métodos para que estén disponibles en otros archivos
module.exports = {
  obtenerPartidas,
  obtenerTematicas,
  obtenerJugadoresPartida,
  insertarPartida,
  insertarTematica,
  insertarJugadorPartida,
  updatePartida,
  updateJugador,
  updateTematica,
  getAllTematicas,
  updateCampoJugador
  // Agrega más métodos según tus necesidades
};

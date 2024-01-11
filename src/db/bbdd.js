const { Pool } = require("pg");
const fs = require("fs");
const utils = require("./utils");
const DATABASE_URL_LOCAL = 'postgres://user_root:ruben.2409@localhost:5432/impostor_db_local';

const DATABASE_URL = process.env.DATABASE_URL || DATABASE_URL_LOCAL

const pool = new Pool({
  connectionString: DATABASE_URL,
});

// Métodos para interactuar con la base de datos
//INSERT BBDD// 
// Método para insertar una nueva partida
async function insertarPartida(partida) {
  const { id, jugadores, impostores, tematica } = partida;
  const result = await pool.query(
    "INSERT INTO partidas (id, jugadores, impostores, tematica_id) VALUES ($1, $2, $3, $4)",
    [id, jugadores, impostores, tematica]
  );
  utils.escribirLog(`${result.rowCount} fila(s) insertada(s)`);
  utils.escribirLog(`PARTIDA: ${JSON.stringify({partida})} registrada correctamente en la BBDD`);
  return result.rowCount;
}
// Método para insertar una nueva tematica
async function insertarTematica(nuevaTematica) {
  const { id, tematica } = nuevaTematica;
  const result = await pool.query(
    "INSERT INTO tematicas (id, tematica) VALUES ($1, $2)",
    [id, tematica]
  );
  utils.escribirLog(`${result.rowCount} fila(s) insertada(s)`);
  utils.escribirLog(`TEMATICA: ${JSON.stringify({nuevaTematica})} registrada correctamente en la BBDD`);
  return result.rowCount;
}
// Método para insertar un jugador en la partida
async function insertarJugadorPartida(jugador) {
  const { id, partida_id, nombre, impostor, socket_id, es_primero } = jugador;
  const result = await pool.query(
    "INSERT INTO jugadores_conectados (id, partida_id, nombre, impostor, socket_id, es_primero) VALUES ($1, $2, $3, $4, $5, $6)",
    [id, partida_id, nombre, impostor, socket_id, es_primero]
  );
  utils.escribirLog(`${result.rowCount} fila(s) insertada(s)`);
  utils.escribirLog(`JUGADOR: ${JSON.stringify({jugador})} registrado correctamente en la BBDD`);
  return result.rowCount;
}

//SELECT BBDD// 
// Método para obtener las partidas por id
async function obtenerPartidas(id) {
  const result = await pool.query(`SELECT * FROM partidas where id='${id}'`);
  utils.escribirLog(`${result.rows.length} partida encontrada en la BBDD con id: ${id}`);
  const partida_encontrada = result.rows
  utils.escribirLog(`${JSON.stringify({partida_encontrada})}`);
  return result.rows;
}
// Método para obtener las tematicas por id
async function obtenerTematicas(id) {
  const result = await pool.query(`SELECT tematica FROM tematicas t INNER JOIN partidas p ON p.tematica_id = t.id WHERE p.id ='${id}'`);
  utils.escribirLog(`${result.rows.length} tematica encontrada en la BBDD con id: ${id}`);
  const tematica_encontrada = result.rows
  utils.escribirLog(`${JSON.stringify({tematica_encontrada})}`);
  return result.rows;
}
// Método para obtener las tematicas por id
async function getAllTematicas() {
  const result = await pool.query(`SELECT * FROM tematicas`);
  utils.escribirLog(`${result.rows.length} tematica(s) encontrada(s) en la BBDD`);
  return result.rows;
}
// Método para obtener los jugadores conectados a una partida
async function obtenerJugadoresPartida(partida_id) {
  const result = await pool.query(`SELECT * FROM jugadores_conectados where partida_id='${partida_id}'`);
  utils.escribirLog(`${result.rows.length} jugador(es) encontrado(s) en la BBDD con id_partida: ${partida_id}`);
  const jugadores_encontrados = result.rows;
  utils.escribirLog(`${JSON.stringify({jugadores_encontrados})}`);
  return result.rows;
}

//UPDATE BBDD 

// Método para actualizar una partida
async function updatePartida(partida) {
  const { id, jugadores, impostores, tematica } = partida;
  const result = await pool.query(
    "UPDATE partidas SET jugadores = $2, impostores = $3, tematica = $4 WHERE id = $1",
    [id, jugadores, impostores, tematica]
  );
  utils.escribirLog(`Partida ${id} actualizada en la BBDD`);
  utils.escribirLog(`${JSON.stringify({partida})}`);
  return result.rowCount;
}
// Método para actualizar una partida
async function updateCampoJugador(id, columna, valor) {
  
  // Construir la consulta dinámicamente
  const query = `UPDATE jugadores_conectados SET ${columna} = $1 WHERE id = $2`;
  // Ejecutar la consulta
  const result = await pool.query(query, [valor, id]);
  utils.escribirLog(`Se ha actualizado la columna "${columna}" con valor "${valor}" para el jugador "${id}" en la BBDD`);
  return result.rowCount;
}

// Método para actualizar una tematica
async function updateTematica(nuevaTematica) {
  const { id, tematica } = nuevaTematica;
  const result = await pool.query(
    "UPDATE tematicas SET tematica = $2 WHERE id = $1",
    [id, tematica]
  );
  utils.escribirLog(`Se ha actualizado la tematica ${id} en la BBDD`);
  return result.rowCount;
}


// Exportar los métodos para que estén disponibles en otros archivos
module.exports = {
  obtenerPartidas,
  obtenerTematicas,
  obtenerJugadoresPartida,
  insertarPartida,
  insertarTematica,
  insertarJugadorPartida,
  updatePartida,
  updateTematica,
  getAllTematicas,
  updateCampoJugador
  // Agrega más métodos según tus necesidades
};

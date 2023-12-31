CREATE TABLE partidas (
  id VARCHAR(255) PRIMARY KEY,
  jugadores INT,
  impostores INT,
  tematica VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jugadores_conectados (
  id VARCHAR(255) PRIMARY KEY,
  partida_id VARCHAR(255),
  nombre VARCHAR(255),
  impostor BOOLEAN,
  socket_id VARCHAR(255),
  es_primero BOOLEAN,
  FOREIGN KEY (partida_id) REFERENCES partidas(id)
);

CREATE TABLE tematicas (
  id VARCHAR(255) PRIMARY KEY,
  tematica VARCHAR(255)
);

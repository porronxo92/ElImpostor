const fs = require("fs");
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
  
  function escribirLog(mensaje, nivel) {
    switch (nivel){
    case 0: 
      nivel = "info"
      break;
    case 1:
      nivel = "debug"
      break;
    case 2:
      nivel = "error"
      break;
    case 3:
      nivel = "warn"
      break;
    default:
      nivel = "info";
      break;
    }
    // Obtener la fecha y hora actual
    const fechaHora = new Date().toLocaleString();
    // Obtener información sobre la ubicación de la llamada
    //const ubicacionLlamada = obtenerUbicacionLlamada();
  
    // Crear el mensaje de log con el formato deseado
    const log = `[${nivel.toUpperCase()}] [${fechaHora}] - ${mensaje}`;
  
    // Escribir en la consola
    if (nivel === 'info') {
      console.log(log);
    } else if (nivel === 'warn') {
      console.warn(log);
    } else if (nivel === 'error') {
      console.error(log);
    } else if (nivel === 'debug') {
      console.debug(log);
    }
  }

// Exportar los métodos para que estén disponibles en otros archivos
module.exports = {
    escribirLog,
    obtenerUbicacionLlamada
    // Agrega más métodos según tus necesidades
  };
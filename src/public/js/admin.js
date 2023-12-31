const contJugador = document.getElementById("contJugador");
const contImpostor = document.getElementById("contImpostor");
const tematicasSelect = document.getElementById("listado_tematica");
const btnPartida = document.querySelector("#btnPartida");
const btnTematica = document.querySelector("#btnTematica");
const textoError = document.querySelector("#texto_error");
const nuevaTematicaInput = document.getElementById("nuevaTematica");
// Obtén tu dirección IP local y reemplaza 'TU_IP_LOCAL' con tu dirección IP
const tuIpLocal = "192.168.1.43";
let idTematica = 0;

function incrementarContadorJugador() {
  contJugador.textContent = parseInt(contJugador.textContent) + 1;
}
function decrementarContadorJugador() {
  const valorActual = parseInt(contJugador.textContent);
  if (valorActual > 0) {
    contJugador.textContent = valorActual - 1;
  }
}
function incrementarContadorImpostor() {
  contImpostor.textContent = parseInt(contImpostor.textContent) + 1;
}
function decrementarContadorImpostor() {
  const valorActual = parseInt(contImpostor.textContent);
  if (valorActual > 0) {
    contImpostor.textContent = valorActual - 1;
  }
}
function cerrarModal() {
  document.getElementById("modal").style.display = "none";
}
document.addEventListener("DOMContentLoaded", function () {
  getTematicas();
});

async function getTematicas() {
  // Realizar la solicitud fetch y resolver o rechazar la promesa según la respuesta
  fetch("/getTematicas")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      tematicasSelect.innerHTML = "";
      data.tematicas.forEach((tematica) => {
        const option = document.createElement("option");
        option.value = tematica.tematica;
        option.text = tematica.tematica;
        tematicasSelect.appendChild(option);
      });
      idTematica = data.tematicas.length;
      console.log("Tematicas en BBDD -> " + idTematica);
    });
}

async function agregarTematica() {
  try {
    // Obtener el valor del nuevo tema del input
    const nuevaTematica = nuevaTematicaInput.value.trim();
    console.log("Tematicas en BBDD: " + idTematica);
    idTematica += 1;
    console.log("Id tematica: " + idTematica);
    // Verificar que no esté vacío
    if (nuevaTematica !== "") {
      textoError.innerHTML = "";
      textoError.classList.display = "none";
      // Cargar el archivo JSON local
      // Realizar la solicitud POST con los parámetros
      fetch(`/RegistroTematicaBBDD`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: idTematica,
          tematica: nuevaTematica,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          // Limpiar el input y volver a cargar las temáticas
          console.log(data);
          nuevaTematicaInput.value = "";
          nuevaTematicaInput.classList.add("tematica--texto");
          getTematicas();
        })
        .catch((error) =>
          console.error("Error al agregar la temática:", error)
        );
    } else {
      console.log("Campo vacio");
      textoError.innerHTML = "Campo vacio. Debes escribir una tematica.";
      textoError.classList.display = "block";
    }
  } catch (error) {
    console.log(error);
  }
}

function generarPartida() {
  // Obtener los valores de los contadores y la temática seleccionada
  const numJugadores = document.getElementById("contJugador").textContent;
  const numImpostores = document.getElementById("contImpostor").textContent;
  const tematicaSeleccionada =
    document.getElementById("listado_tematica").value;
  const qrelement = document.getElementById("codigoQR");
  const idPartida = Date.now();

  if (
    comprobarImpostores(numJugadores, numImpostores) &&
    comprobarTematica(tematicaSeleccionada)
  ) {
    textoError.style.display = "none";
    // Realizar la solicitud POST con los parámetros
    fetch(`/RegistroPartidaBBDD`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: idPartida,
        jugadores: numJugadores,
        impostores: numImpostores,
        tematica: tematicaSeleccionada,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // Crear la URL con los parámetros
        const url = `${window.location.origin}/index.html?id=${idPartida}`;
        console.log(url);
        // Crear el código QR
        const qr = new QRious({
          element: qrelement,
          value: url,
          size: 200,
        });

        // Crear un enlace (<a>) con la misma URL
        const enlace = document.querySelector("#partida_nueva");
        enlace.href = url;

        // Mostrar la modal
        document.getElementById("modal").style.display = "flex";
      })
      .catch((error) => console.error("Error en la solicitud POST:", error));
  } else{
    textoError.style.display = "block";
  }
}

btnPartida.addEventListener("click", () => {
  generarPartida();
});
btnTematica.addEventListener("click", () => {
  agregarTematica();
});

function comprobarImpostores(jugadores, impostores) {
  // Calcular el 50% del número de jugadores
  const limiteImpostores = jugadores / 2;
  // Comprobar si el número de impostores supera el límite
  if (impostores > limiteImpostores) {
    textoError.innerText +=
      "El número de impostores no puede ser más del 50% del número de jugadores. ";
    return false; // Indica que la comprobación ha fallado
  }
  return true; // Indica que la comprobación ha pasado
}

function comprobarTematica(tematicaSeleccionada) {
  if (tematicaSeleccionada == "") {
    textoError.innerText += "Debes seleccionar una tematica de la lista. ";
    return false;
  }
  return true; // Indica que la comprobación ha pasado
}

const contJugador = document.getElementById("contJugador");
const contImpostor = document.getElementById("contImpostor");
// Obtén tu dirección IP local y reemplaza 'TU_IP_LOCAL' con tu dirección IP
const tuIpLocal = "192.168.1.43";
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

document.addEventListener("DOMContentLoaded", function () {
  cargarTematicas();
});

async function cargarTematicas() {
  // Cargar el archivo JSON local

  fetch("json/tematica.json")
    .then((response) => response.json())
    .then((data) => {
      // Obtener el elemento select
      const tematicasSelect = document.getElementById("listado_tematica");
      tematicasSelect.innerHTML = "";
      // Recorrer las temáticas y agregarlas como opciones al select
      data.tematicas.forEach((tematica) => {
        const option = document.createElement("option");
        option.value = tematica.tematica;
        option.text = tematica.tematica;
        tematicasSelect.appendChild(option);
      });
    })
    .catch((error) => console.error("Error al cargar el JSON:", error));
}

async function idUltimaTematica() {
  // Cargar el archivo JSON local
  fetch("json/tematica.json")
    .then((response) => response.json())
    .then((data) => {
      // Obtener el valor del id del último elemento
      const listaTematica = data.tematicas;
      const ultimoId =
        listaTematica.length > 0
          ? listaTematica[listaTematica.length - 1].id
          : null;

      // Sumar uno al último ID (si existe)
      const nuevoId = ultimoId !== null ? ultimoId + 1 : 1;

      console.log("ID TEMATICA Nueva: " + nuevoId);
      agregarTematica(nuevoId);
    })
    .catch((error) => console.error("Error al cargar el JSON:", error));
}

async function agregarTematicaBoton() {
  await idUltimaTematica();
}

async function agregarTematica(id) {
  try {
    // Obtener el valor del nuevo tema del input
    const nuevaTematicaInput = document.getElementById("nuevaTematica");
    const nuevaTematica = nuevaTematicaInput.value.trim();
    console.log("Id tematica despues await: " + id);
    // Verificar que no esté vacío
    if (nuevaTematica !== "") {
      // Cargar el archivo JSON local
      // Realizar la solicitud POST con los parámetros
      fetch(`http://${tuIpLocal}:3000/RegistroTematica`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          tematica: nuevaTematica,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          // Limpiar el input y volver a cargar las temáticas
          console.log(data);
          nuevaTematicaInput.value = "";
          nuevaTematicaInput.classList.add("tematica--texto");
        })
        .catch((error) =>
          console.error("Error al agregar la temática:", error)
        );
    } else {
      console.log("Campo vacio");
      nuevaTematicaInput.classList.add("tematica--texto__error");
    }
    await cargarTematicas();
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
  // Realizar la solicitud POST con los parámetros
  fetch(`http://${tuIpLocal}:3000/RegistroPartida`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: idPartida,
      jugadores: numJugadores,
      impostores: numImpostores,
      tematica: tematicaSeleccionada,
      jugadoresConectados: []
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      // Crear la URL con los parámetros
      const url = `http://${tuIpLocal}:3000/index.html?id=${idPartida}`;
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
}

function cerrarModal() {
  document.getElementById("modal").style.display = "none";
}


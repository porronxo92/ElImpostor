const contJugador = document.getElementById("contJugador");
const contImpostor = document.getElementById("contImpostor");
const tematicasSelect = document.getElementById("listado_tematica");
const btnPartida = document.querySelector("#btnPartida");
const btnTematica = document.querySelector("#btnTematica");
const textoError = document.querySelector("#texto_error");
const iconWhatsApp = document.querySelector("#share_WhatsApp");
const iconCopy = document.querySelector("#copy_icon");
const enlace = document.querySelector("#partida_nueva");
const nuevaTematicaInput = document.getElementById("nuevaTematica");
let idTematica = 0;

// Inicializa Tippy para el botón de información
tippy("#copy_icon", {
  content: `Enlace copiado`,
  placement: "top-end", // Puedes ajustar la posición del tooltip según tus necesidades
  arrow: false,
  trigger: 'click',
  onShow(instance) {
    setTimeout(() => {
      instance.hide();
    }, 2000);
  }
});

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
        option.value = tematica.id;
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
          textoError.innerHTML = "Nueva tematica añadida. Revise el listado.";
          textoError.classList.add("correcto");
          textoError.style.display = "block";
        })
        .catch((error) =>
          console.error("Error al agregar la temática:", error)
        );
    } else {
      console.log("Campo vacio");
      textoError.innerHTML = "Campo vacio. Debes escribir una tematica.";
      textoError.style.display = "block";
    }
    setTimeout(function () {
      textoError.style.display = "none";
    }, 4000);
  } catch (error) {
    console.log(error);
  }
}

function generarPartida() {
  // Obtener los valores de los contadores y la temática seleccionada
  const numJugadores = document.getElementById("contJugador").textContent;
  const numImpostores = document.getElementById("contImpostor").textContent;
  const tematicaSeleccionada = tematicasSelect.value;
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
        enlace.href = url;
        // Mostrar la modal
        document.getElementById("modal").style.display = "flex";
      })
      .catch((error) => console.error("Error en la solicitud POST:", error));
  } else {
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
  const limiteImpostores = Math.floor(jugadores / 2);
  // Comprobar si el número de impostores supera el límite
  if (jugadores < 2 || impostores < 1) {
    textoError.innerText =
      "Debes asignar al menos 2 jugadores y 1 impostor para jugar. ";
    return false; // Indica que la comprobación ha fallado
  } else if (impostores > limiteImpostores) {
    textoError.innerText = `El número de impostores no puede ser mayor que ${limiteImpostores}. `;
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

iconCopy.addEventListener("click", () => {
  escribirClipboard(enlace.href);
});

iconWhatsApp.addEventListener("click", () => {
  shareWhatsapp(enlace.href);
});

async function escribirClipboard(texto) {
  try {
    // Verificar si el documento está enfocado
    if (!document.hasFocus()) {
      // Enfocar el documento
      window.focus();
    }
    // Intentar escribir en el portapapeles
    await navigator.clipboard.writeText(texto);
    
    console.log("Texto copiado al portapapeles: ", texto);
  } catch (err) {
    console.error("Error al copiar al portapapeles:", err);
  }
}

async function leerClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    console.log("Texto leido del portapapeles:", text);
  } catch (err) {
    console.error("Error al leer del portapapeles:", err);
  }
}
function shareWhatsapp(texto) {
  // Verificar si el enlace existe
  if (texto) {
    // Obtener el texto y reemplazar espacios con %20 para el formato de URL
    const enlace = encodeURIComponent(texto);
    const mensaje = `Únete a la partida de "El impostor" a traves de este enlace: *${enlace}*`
    // Crear el enlace de WhatsApp con el número y mensaje
    const enlaceWhatsApp = `https://wa.me/?text=${mensaje}`;

    // Abrir una nueva ventana o pestaña con el enlace de WhatsApp
    window.open(enlaceWhatsApp, "");
  } else {
    console.error("El enlace no existe");
  }
}

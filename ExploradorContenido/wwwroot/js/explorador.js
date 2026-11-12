// Explorador de contenido aleatorio
// Cada seccion consulta su propia API con fetch + async/await
// y solo actualiza su propia tarjeta (sin recargar la pagina).

const URL_CITAS = "https://dummyjson.com/quotes/random";
const URL_PERROS = "https://dog.ceo/api/breeds/image/random";
const URL_GATOS_JSON = "https://cataas.com/cat?json=true";
const URL_BASE_GATOS = "https://cataas.com";
const URL_DATOS = "https://uselessfacts.jsph.pl/api/v2/facts/random?language=en";

// ---------------------------------------------------------------
// Utilidades comunes
// ---------------------------------------------------------------

// Hace una peticion GET, verifica response.ok y devuelve el JSON.
async function consultarJson(url) {
    // cache: "no-store" para que cada clic haga una consulta nueva
    const respuesta = await fetch(url, { cache: "no-store" });

    if (!respuesta.ok) {
        throw new Error(`La API respondió con el estado ${respuesta.status}`);
    }

    return await respuesta.json();
}

// Descarga una imagen y espera a que termine de cargar.
// Si la URL esta rota, la promesa se rechaza y se maneja como cualquier otro error.
function cargarImagen(urlImagen) {
    return new Promise((resolve, reject) => {
        const imagenTemporal = new Image();
        imagenTemporal.onload = () => resolve(urlImagen);
        imagenTemporal.onerror = () => reject(new Error("No se pudo cargar la imagen"));
        imagenTemporal.src = urlImagen;
    });
}

function mostrarCargando(seccion) {
    const estado = seccion.querySelector("[data-estado]");
    estado.innerHTML = `
        <div class="text-muted">
            <div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
            <span>Cargando…</span>
        </div>`;
    seccion.querySelector("[data-contenido]").hidden = true;
}

function mostrarContenido(seccion) {
    seccion.querySelector("[data-estado]").innerHTML = "";
    seccion.querySelector("[data-contenido]").hidden = false;
}

function mostrarError(seccion, mensaje, funcionReintentar) {
    const estado = seccion.querySelector("[data-estado]");
    seccion.querySelector("[data-contenido]").hidden = true;

    const alerta = document.createElement("div");
    alerta.className = "alert alert-danger";
    alerta.setAttribute("role", "alert");

    const texto = document.createElement("p");
    texto.className = "mb-2";
    texto.textContent = mensaje;

    const botonReintentar = document.createElement("button");
    botonReintentar.type = "button";
    botonReintentar.className = "btn btn-outline-danger btn-sm";
    botonReintentar.textContent = "Reintentar";
    botonReintentar.addEventListener("click", funcionReintentar);

    alerta.append(texto, botonReintentar);
    estado.replaceChildren(alerta);
}

// ---------------------------------------------------------------
// 1. Citas y autores — DummyJSON
// ---------------------------------------------------------------
async function obtenerCita() {
    const seccion = document.getElementById("seccion-cita");
    const boton = document.getElementById("boton-cita");

    boton.disabled = true;
    mostrarCargando(seccion);

    try {
        const datos = await consultarJson(URL_CITAS);

        document.getElementById("texto-cita").textContent = `“${datos.quote}”`;
        document.getElementById("autor-cita").textContent = datos.author;
        mostrarContenido(seccion);
    } catch (error) {
        console.error("Error al obtener la cita:", error);
        mostrarError(seccion, "No se pudo obtener una cita. Revisa tu conexión e inténtalo de nuevo.", obtenerCita);
    } finally {
        boton.disabled = false;
    }
}

// ---------------------------------------------------------------
// 2. Imagenes de perros — Dog CEO
// ---------------------------------------------------------------
async function obtenerPerro() {
    const seccion = document.getElementById("seccion-perro");
    const boton = document.getElementById("boton-perro");
    const imagenPerro = document.getElementById("imagen-perro");

    boton.disabled = true;
    mostrarCargando(seccion);

    try {
        const datos = await consultarJson(URL_PERROS);

        if (datos.status !== "success" || !datos.message) {
            throw new Error("La respuesta de Dog CEO no trae una imagen");
        }

        const urlImagen = await cargarImagen(datos.message);
        imagenPerro.src = urlImagen;
        imagenPerro.alt = "Foto aleatoria de un perro";
        mostrarContenido(seccion);
    } catch (error) {
        console.error("Error al obtener el perro:", error);
        mostrarError(seccion, "No se pudo mostrar la imagen del perro. Inténtalo de nuevo.", obtenerPerro);
    } finally {
        boton.disabled = false;
    }
}

// ---------------------------------------------------------------
// 3. Imagenes de gatos — CATAAS
// ---------------------------------------------------------------
// https://cataas.com/cat?json=true devuelve un JSON con el identificador
// de la imagen (campo "id" o "_id" segun la version) y una "url".
// Con el id se arma https://cataas.com/cat/{id}, que si devuelve la imagen
// directamente (por eso esa URL NO se procesa con response.json()).
function construirUrlGato(datos) {
    const idGato = datos.id ?? datos._id;

    if (idGato) {
        return `${URL_BASE_GATOS}/cat/${encodeURIComponent(idGato)}`;
    }

    if (datos.url) {
        // La url puede venir completa o relativa ("/cat/...")
        return datos.url.startsWith("http") ? datos.url : `${URL_BASE_GATOS}${datos.url}`;
    }

    throw new Error("La respuesta de CATAAS no trae id ni url");
}

async function obtenerGato() {
    const seccion = document.getElementById("seccion-gato");
    const boton = document.getElementById("boton-gato");
    const imagenGato = document.getElementById("imagen-gato");

    boton.disabled = true;
    mostrarCargando(seccion);

    try {
        const datos = await consultarJson(URL_GATOS_JSON);
        const urlImagen = await cargarImagen(construirUrlGato(datos));

        imagenGato.src = urlImagen;
        imagenGato.alt = "Foto aleatoria de un gato";
        mostrarContenido(seccion);
    } catch (error) {
        console.error("Error al obtener el gato:", error);
        mostrarError(seccion, "No se pudo mostrar la imagen del gato. Inténtalo de nuevo.", obtenerGato);
    } finally {
        boton.disabled = false;
    }
}

// ---------------------------------------------------------------
// 4. Datos curiosos — Useless Facts
// ---------------------------------------------------------------
async function obtenerDatoCurioso() {
    const seccion = document.getElementById("seccion-dato");
    const boton = document.getElementById("boton-dato");

    boton.disabled = true;
    mostrarCargando(seccion);

    try {
        const datos = await consultarJson(URL_DATOS);

        document.getElementById("texto-dato").textContent = datos.text;
        mostrarContenido(seccion);
    } catch (error) {
        console.error("Error al obtener el dato curioso:", error);
        mostrarError(seccion, "No se pudo obtener un dato curioso. Revisa tu conexión e inténtalo de nuevo.", obtenerDatoCurioso);
    } finally {
        boton.disabled = false;
    }
}

// ---------------------------------------------------------------
// Inicio: botones + primera carga de las cuatro secciones
// ---------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("boton-cita").addEventListener("click", obtenerCita);
    document.getElementById("boton-perro").addEventListener("click", obtenerPerro);
    document.getElementById("boton-gato").addEventListener("click", obtenerGato);
    document.getElementById("boton-dato").addEventListener("click", obtenerDatoCurioso);

    // Se llaman sin await entre ellas: cargan en paralelo y
    // el fallo de una no detiene a las demas.
    obtenerCita();
    obtenerPerro();
    obtenerGato();
    obtenerDatoCurioso();
});

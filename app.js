const express = require("express");
const app = express();
const path = require("path");
const PORT = 3000;

const DATA_DIR = "./data";
const LOG_DIR = "./logs";
const DATA_FILE = `${DATA_DIR}/usuarios.json`;
const LOG_FILE = `${LOG_DIR}/app.log`;
const ERROR_LOG_FILE = `${LOG_DIR}/error.log`;

// módulo File System
// callbacks 
const fs = require('fs');
// promesas
const fsp = require('fs/promises');

// librería para fechas
const dayjs = require("dayjs");
require("dayjs/locale/es");
dayjs.locale("es");

// librería para cookies
const cookieParser = require("cookie-parser");

// librería para sesiones
const session = require("express-session");

// layouts
const expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);
// layout por defecto
app.set("layout", "layouts/main");

//motor de plantillas ejs
app.set("view engine", "ejs");

// carpeta de vistas
app.set('views', path.join(__dirname, "views"));

// ---------------------------------------------------------
//   MIDDLEWARES
// ---------------------------------------------------------

// para acceder a public
app.use(express.static(path.join(__dirname, "public")));

// para analizar los datos enviados por formularios HTML y hacerlos accesibles en req.body
app.use(express.urlencoded({ extended: true }));

// para procesar peticiones de json
app.use(express.json());

// para manejar cookies en las peticiones HTTP.
app.use(cookieParser());

// para manejar sesiones de usuario.
app.use(session({
    secret: "mi_secreto", // clave secreta para firmar cookie de sesión
    resave: false, // no guardar sesión si no ha habido cambios
    saveUninitialized: true, // guardar sesiones nuevas aunque no se modifiquen
    cookie: {
        httpOnly: true, // la cookie no es accesible desde JavaScript del cliente
        maxAge: 1000 * 60 * 30 // (1min * 60seg) * 30 = 30min, duración de la cookie en ms
    }
}));

// datos disponibles para todas las páginas
app.use((req, res, next) => {
    res.locals.tema = req.cookies.tema || "dark";
    res.locals.currentPath = req.path;
    res.locals.title = null;
    next();
});

function requiereAuth(req, res, next) {
    //si existe un usuario -> devuelveme next
    if (req.session.user) return next();
    //si no hay usuario activo, llévale a login para que se loguee.
    res.redirect("/login");
};

function noAuth(req, res, next) {
    //si no existe un usuario -> devuelveme next
    if (!req.session.user) return next();
    //si hay usuario activo, llévale a perfil.
    res.redirect("/perfil");
};

function validarEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    // valido que cumple el patrón
    return regex.test(email);
}

function formatoFecha(fecha) {
        const partes = fecha.split('-');
        const [dia, mes, ano] = [partes[2], partes[1], partes[0].slice(2)];
        return `${dia} / ${mes} / ${ano}`;
    };

function logInfo(mensaje) {
    // creo directorio si no existe, si existe lo respeto
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, {recursive:true});
    }
    //creo la línea
    const lineaLog = `[${new Date().toISOString()}] - INFO: ${mensaje}\n`;
    // añado la línea al archivo
    fs.appendFile(LOG_FILE, lineaLog, "utf-8", (error) => { 
        if (error) {
            console.error("Error al escribir el infoLog:", error);
        }
    });
}

function logError(error) {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, {recursive:true});
    }
    const lineaLog = `[${new Date().toISOString()}] - ERROR: ${error.stack || error} \n`;
    fs.appendFile(ERROR_LOG_FILE, lineaLog, "utf-8", (error) => { 
        if (error) {
            console.error("Error al escribir el errorLog:", error);
        }
    });
}

async function existeArchivo(rutaArchivo){
    try {
        // compruebo si el archivo existe
        await fsp.access(rutaArchivo);
        return true;
    } catch (error) {
        return false
    }
}

async function guardarJSON(nuevoRegistro) {
    try {
        let registros = [];
        
        // creo directorio si no existe, si existe lo respeto
        await fsp.mkdir(DATA_DIR, { 
            recursive: true
        });

        if ((await existeArchivo(DATA_FILE))) {
            const contenido = await fsp.readFile(DATA_FILE, "utf8");
            if (contenido.trim() !== "") {
                // añado registros existentes al array
                registros = JSON.parse(contenido);
            }
        }

        // añado nuevo registro al array
        registros.push(nuevoRegistro);

        // escribo los registros (array) en el archivo
        await fsp.writeFile(
            DATA_FILE, 
            JSON.stringify(registros, null, 2), 
            "utf-8"
        );
        logInfo(`Registro guardado correctamente en ${DATA_FILE} - ${nuevoRegistro.useremail}`);

    } catch (error) {
        logError(error);
        throw error;
    }
}

async function existeEmail(email) {
    try {
        if (!(await existeArchivo(DATA_FILE))) return false;

        const contenido = await fsp.readFile(DATA_FILE, "utf8");
        if (contenido.trim() === "") return false;

        const registros = JSON.parse(contenido);
        return registros.some(registro => registro.useremail === email);

    } catch (error) {
        logError(error);
        throw error;
    }
}

async function getDatosUsuario(email) {
    try {
        if (!(await existeArchivo(DATA_FILE))) return null;

        const contenido = await fsp.readFile(DATA_FILE, "utf8");
        if (contenido.trim() === "") return null;

        const registros = JSON.parse(contenido);
        return registros.find(registro => registro.useremail === email);

    } catch (error) {
        logError(error);
        throw error;
    }
}


// ---------------------------------------------------------
//   GET
// ---------------------------------------------------------

app.get("/", (req,res) => {
    res.render('index', {
        title: ' | Inicio'
    });
});

app.get("/preferencias", (req,res) => {
    res.render('preferencias', {
        title: ' | Preferencias'
    });
});

app.get("/tema/:modo", (req,res) => {
    const modo = req.params.modo;
    res.cookie("tema", modo, {
        // aquí permito el acceso desde js cliente
        httpOnly: false,
        maxAge: 1000 * 60 * 60 * 24 * 7
    });
    res.redirect(req.get("referer") || "/");
});

app.get("/login", noAuth, (req, res) => {
    res.render("login", {
        error: null,
        title: ' | Login'
    })
});

app.get("/registro", noAuth, (req, res) => {
    // paso valores iniciales vacíos.
    res.render("registro", {
        nombre: "",
        useremail: "",
        edad: "",
        ciudad: "",
        intereses: [],   // array vacío (sin checkboxes marcados)
        title: ' | Registro'
    });
});

app.get("/perfil", requiereAuth, (req, res) => {
    const user = req.session.user;
    const datosUsuario = user.datosUsuario;

    // mapeo de intereses (clave --> texto visible)
    const mapIntereses = {
        meditacion: "Meditación profunda",
        oracion: "Oración devota",
        conexion: "Conexión astrológica",
        ecm: "Experiencias cercanas a la muerte"
    };

    const interesesLegibles = (datosUsuario.intereses || [])
        .map(interes => mapIntereses[interes])
        .filter(interes => Boolean(interes));

    // renderizamos pagina y variable user
    res.render("perfil", {
        user: datosUsuario,
        intereses: interesesLegibles,
        title: " | Perfil"
    });
});

app.get("/recomendaciones", requiereAuth, (req, res) => {
    const user = req.session.user;
    let sesionesRecomendadas = [];
    
    const intereses = user.datosUsuario?.intereses;
    const sesiones = require('./data/sesiones.json');
    
    const mapIntereses = {
        meditacion: "Meditación profunda",
        oracion: "Oración devota",
        conexion: "Conexión astrológica",
        ecm: "Experiencias cercanas a la muerte"
    };

    if (intereses && intereses.length > 0) {
        // filtro json sesiones
        sesionesRecomendadas = sesiones.filter(sesion =>
            // si mapIntereses value === sesion.categoria --> true
            intereses.some(interes =>
                mapIntereses[interes] === sesion.categoria
            )
        );
    };

    const sesionesFormateadas = sesionesRecomendadas.map(sesion => ({
        ...sesion,
        fecha: formatoFecha(sesion.fecha)
    }));

    //le pasamos pagina y variables
    res.render("recomendaciones", {
        user,
        sesionesRecomendadas: sesionesFormateadas,
        title: ' | Recomendaciones'
    });
});

app.get("/contacto", (req, res) => {
    const user = req.session.user;
    const infoContacto = {
        email : 'supraconciencia@suenosvalenti.com',
        tlf : '+34 666 666 666',
        direccion: 'Calle Falsa 1234, Springfield'
    }

    //le pasamos pagina y variable user
    res.render("contacto", {
        user: user,
        infoContacto : infoContacto,
        title: ' | Contacto'
    });
});

// ---------------------------------------------------------
//   POST
// ---------------------------------------------------------

app.post("/registro", async (req, res) => {

    try {
        // Extraemos los datos enviados desde el formulario de registro.
        const { nombre, useremail, edad, ciudad } = req.body;

        let intereses = req.body.intereses || [];
        if (!Array.isArray(intereses)) {
            intereses = [intereses];
        }

        // Array errores del formulario
        let errores = [];

        //  Nombre obligatorio
        if (!nombre) {
            errores.push("El nombre es obligatorio.");
        }

        //  Edad mayor que 0 y obligatoria
        if (!edad || Number(edad) < 1) {
            errores.push("Debes cubrir el campo edad y debe ser mayor que 0.");
        }


        //  Email obligatorio y válido
        if (!useremail || !(validarEmail(useremail))) {
            errores.push("Debes cubrir el campo email con un email válido.");
        }

        // Si hay errores
        if (errores.length) {
            return res.status(400)
                .render("registro", { 
                    nombre,
                    useremail,
                    edad,
                    ciudad,
                    intereses,
                    errores
                });
        }

        // Si no hay errores
        const nuevoUsuario = {
            nombre: nombre,
            useremail: useremail,
            edad: edad,
            ciudad: ciudad,
            intereses: intereses.length > 0 ? intereses : []
        }

        // guardamos los datos en nuestro archivo json
        await guardarJSON(nuevoUsuario);
        
        // renderizamos una pagina nueva
        res.render("registro-realizado", { nombre: nuevoUsuario.nombre });

    } catch (error) {
        logError(error);
        res.status(500).render("error", {
            mensaje: "Error interno guardando el registro"
        });
    }

});

app.post("/login", async (req, res) => {

    try {
        const { username, password } = req.body;
        const emailExiste = await existeEmail(username);
        //simular comprobación credenciales
        if (emailExiste && password === "1234") {
            const usuarioEncontrado = await getDatosUsuario(username);
            
            //creo la sesión del usuario
            req.session.user = { datosUsuario: usuarioEncontrado };
            logInfo(`Login realizado con éxito - ${username}`);
            return res.redirect("/perfil");
        }
        
        // enviamos codigo de auth erroneo si es "unauthorized"
        res.status(401).render("login", {
            error: "Usuario o contraseña incorrectos"
        });
    } catch (error) {
        logError(new Error(`Error de autenticación: ${error.message}`));
        res.status(500).render("error", {
            mensaje: "Error interno de autenticación"
        });
    }

});

app.post("/logout", (req, res) => {
    logInfo(`Usuario cierra sesión.`);
    
    /**
     * test para comprobar la creación del archivo error.log
    try {
        logInfo('El usuario está cerrando sesión...');
        throw new Error("Error de prueba al cerrar sesión");
    } catch (error) {
        logError(error);
        res.status(500).send("Error interno");
    }
    */

    // borro sesión y redirijo al login
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
})
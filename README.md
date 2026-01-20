
# Proyecto Entorno Servidor 01

Este proyecto es una web con servidor backend construido con Node.js y Express. Su objetivo principal es servir páginas dinámicas utilizando EJS como motor de plantillas y administrar recursos estáticos (CSS, JS, imágenes) a través de la carpeta public. El servidor también incluye estructuras para manejo de datos, registros (logs) y rutas configuradas para las vistas existentes.


## Tecnologías utilizadas

Este proyecto ha sido desarrollado utilizando las siguientes tecnologías y herramientas:

- Node.js
Entorno de ejecución para JavaScript en el servidor, utilizado como base del backend.

- Express.js
Framework web para Node.js que facilita la creación y gestión del servidor, rutas y middleware.

- EJS (Embedded JavaScript Templates)
Motor de plantillas empleado para generar vistas dinámicas en el servidor.

- HTML5 / CSS3
Lenguajes de marcado y estilos utilizados en la estructura y presentación de las vistas.

- JavaScript
Lenguaje principal del proyecto, tanto para la lógica del servidor como para interacciones en el cliente.

- npm (Node Package Manager)
Gestor de dependencias utilizado para instalar y administrar los paquetes del proyecto.

- Git & GitHub
Control de versiones y alojamiento del repositorio.
## Estructura

| Elemento        | Descripción                                              |
|-----------------|----------------------------------------------------------|
| /               | Directorio raíz del proyecto                             |
| data/           | Datos persistentes o configuraciones del servidor        |
| logs/           | Archivos de registro generados por el servidor           |
| public/         | Recursos estáticos (CSS, JavaScript, imágenes)           |
| views/          | Plantillas EJS para vistas dinámicas                     |
| app.js          | Archivo principal de la aplicación                       |
| package.json    | Dependencias y scripts del proyecto                      |




## Rutas

| Ruta                 | Autenticación  | Propósito                                                     |
|----------------------|----------------|----------------------------------------------------------------|
| /                   | noAuth         | Formulario de login                                           |
| /registro            | noAuth         | Formulario de registro                                        |
| /perfil              | requiereAuth  | Perfil de usuario con intereses mapeados                      |
| /recomendaciones     | requiereAuth  | Recomendaciones de sesiones según los intereses               |
| /contacto            | -             | Información de contacto                                       |
| /preferencias        | -             | Página de preferencias de tema                                |
| /tema/:modo          | -             | Establece la cookie de tema                                   |



## Despliegue

La aplicación está desplegada en Render utilizando el plan gratuito.
Debido a las limitaciones propias de este tipo de servicio (como la hibernación del servidor tras periodos de inactividad), es posible que la aplicación experimente cierta lentitud en la primera carga o tiempos de respuesta más elevados de lo habitual.

https://ent-servidor.onrender.com/
## Requisitos

Antes de comenzar, asegúrate de tener lo siguiente instalado en tu sistema:

- Node.js (>= 14.x)
- npm (viene con Node.js)

## Instalación

Clona este repositorio:

git clone https://github.com/angeland-ou/ent-servidor.git

cd ent-servidor

Instala las dependencias:
npm install
## Ejecución

Para iniciar el servidor:
- npm start

Por defecto, el servidor escuchará en el puerto 3000

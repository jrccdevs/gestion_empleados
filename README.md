# API RESTful de Gestión de Empleados

Este proyecto es una API RESTful para la gestión de empleados y departamentos dentro de una organización. Permite realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para departamentos y empleados, así como la gestión de usuarios con autenticación JWT basada en roles (`admin`, `empleado`). También incluye funcionalidades avanzadas como la asignación de jefes de departamento y un reporte de la estructura jerárquica de los empleados.

## Características Principales

* **Autenticación y Autorización:**
    * Registro y login de usuarios con JWT.
    * Roles de usuario (`admin`, `empleado`).
    * Protección de rutas basada en roles.
* **Gestión de Departamentos:**
    * CRUD completo de departamentos.
    * Asignación de un empleado como jefe de departamento, con validaciones (debe pertenecer al departamento, no puede ser jefe de múltiples departamentos).
* **Gestión de Empleados:**
    * CRUD completo de empleados.
    * Filtrado de empleados por múltiples criterios (nombre, apellido, email, puesto, estado, departamento, rango de fechas de ingreso).
    * Asignación de supervisor (relación jerárquica).
* **Reporte Jerárquico:**
    * Endpoint para obtener la estructura organizacional de un departamento, mostrando la cadena de mando desde el jefe del departamento hasta los subordinados.
* **Base de Datos:**
    * MySQL con Sequelize ORM.
    * Migraciones para la gestión del esquema de la base de datos.
    * Seeders y Factories para generar datos de prueba.

## Tecnologías Utilizadas

* **Backend:** Node.js, Express.js
* **Base de Datos:** MySQL
* **ORM:** Sequelize
* **Autenticación:** JWT (JSON Web Tokens), bcryptjs
* **Validación/Generación de Datos:** @faker-js/faker

## Requisitos Previos

* Node.js (versión 20.x o superior)
* npm (generalmente incluido con Node.js)
* MySQL Server (local o remoto)


## Configuración del Entorno

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/jrccdevs/gestion_empleados.git)
    cd empleados-api
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz del proyecto y añade las siguientes variables:
    ```dotenv
    NODE_ENV=development
    PORT=3000

    DB_USER=root
    DB_PASSWORD=your_mysql_password
    DB_NAME=gestion_empleados_db
    DB_HOST=localhost # O la IP de tu servidor MySQL
    DB_PORT=3306

    JWT_SECRET=a_very_secure_random_string_for_jwt_signing
    JWT_EXPIRES_IN=1h
    ```
    **Importante:** Asegúrate de que `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_HOST`, `DB_PORT` coincidan con tu configuración de MySQL.
    Reemplaza `your_mysql_password` y `a_very_secure_random_string_for_jwt_signing` con valores seguros.

4.  **Crear la base de datos MySQL:**
    Si no la tienes creada, accede a tu cliente MySQL y crea la base de datos:
    ```sql
    CREATE DATABASE gestion_empleados_db;
    ```
    Asegúrate de que el usuario `DB_USER` tenga permisos para acceder a esta base de datos.

## Ejecución del Proyecto

### Opción 1: Ejecución Local (sin Docker)

1.  **Ejecutar migraciones de la base de datos:**
    Esto creará las tablas necesarias.
    ```bash
    npm run migrate
    ```

2.  **Poblar la base de datos con datos de prueba (opcional pero recomendado):**
    Esto insertará un usuario `admin` y datos de departamentos/empleados.
    ```bash
    npm run seed:all
    ```

3.  **Iniciar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    La API estará disponible en `http://localhost:3000`.



4.  **Ejecutar migraciones y seeders dentro del contenedor (Solo la primera vez o para actualizar la DB):**
    Una vez que los contenedores estén levantados, ejecuta estos comandos para configurar la DB dentro del contenedor `app`:


## Uso de la API

**Para probar la API, puedes usar Postman, Insomnia o un cliente HTTP similar.**

### Ejemplo de flujo de autenticación:

1.  **Registro de usuario (si no usaste seeders para el admin):**
    `POST /api/auth/register`
    ```json
    {
        "email": "nuevo.usuario@empresa.com",
        "contrasena": "passwordseguro",
        "rol": "empleado"
    }
    ```
    (Para roles de `admin`, el seeder ya crea `admin@empresa.com` con `admin123`)

2.  **Login de usuario:**
    `POST /api/auth/login`
    ```json
    {
        "email": "admin@empresa.com",
        "contrasena": "admin123"
    }
    ```
    Obtendrás un token JWT en la respuesta. Usa este token en el header `Authorization` (ej. `Bearer <tu_token_jwt>`) para todas las solicitudes a rutas protegidas.

## Comandos Útiles de Sequelize CLI

Si ejecutas localmente:
* `npm run migrate` - Ejecuta todas las migraciones pendientes.
* `npm run migrate:undo` - Deshace la última migración.
* `npm run migrate:undo:all` - Deshace todas las migraciones.
* `npm run migration:create -- name-of-migration` - Genera un nuevo archivo de migración.
* `npm run seed:all` - Ejecuta todos los seeders.
* `npm run seed:undo:all` - Deshace todos los seeders.
* `npm run seeder:create -- name-of-seeder` - Genera un nuevo archivo de seeder.

## Pruebas (Opcional - si implementas Jest/Mocha)

(Aquí podrías añadir instrucciones sobre cómo ejecutar tus pruebas unitarias/de integración si las implementaste, ej. `npm test`)

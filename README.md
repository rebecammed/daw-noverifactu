# Proyecto No Verifactu – DAW

Aplicación web desarrollada como proyecto del ciclo **Desarrollo de Aplicaciones Web (DAW)**.
El sistema permite gestionar facturación y validación de datos, con un **frontend en JavaScript** y un **backend con Node.js y Express**.

---

## Tecnologías utilizadas

* Node.js
* Express
* JavaScript
* React / Vite (frontend)
* MySQL
* XAMPP
* API de Google (Google Generative AI)

---

## Estructura del proyecto

```
proyectoNoVeri
│
├── noverifactu-back      # Backend (API y lógica del servidor)
├── noverifactu-front     # Frontend de la aplicación
├── database
│   └── noverifactu.sql   # Script de la base de datos
└── README.md
```

---

## Requisitos

* Node.js instalado
* XAMPP o servidor MySQL
* Git

---

## Instalación

1. Clonar el repositorio:

```
git clone https://github.com/rebecammed/daw-noverifactu
```

2. Crear la base de datos en MySQL.

3. Importar el archivo:

```
database/noverifactu.sql
```

usando phpMyAdmin.

---

## Configuración

En la carpeta del backend crear un archivo `.env` con el siguiente contenido:

```
GOOGLE_API_KEY=tu_api_key
```

Este archivo **no se incluye en el repositorio por seguridad**.

---

## Ejecutar el backend

Entrar en la carpeta:

```
cd noverifactu-back
```

Instalar dependencias:

```
npm install
```

Iniciar servidor:

```
node index.js
```

---

## Ejecutar el frontend

Entrar en la carpeta:

```
cd noverifactu-front
```

Instalar dependencias:

```
npm install
```

Iniciar la aplicación:

```
npm run dev
```

---

## Rebeca

Proyecto desarrollado por **Rebeca**
Ciclo: Desarrollo de Aplicaciones Web (DAW)

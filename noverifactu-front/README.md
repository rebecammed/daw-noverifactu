## Estructura del proyecto

proyectoNoVerifactu/
----noverifactu-back/ <- backend (Node.js + Express)
----noverifactu-front/ <- frontend (React + Vite)

## Instalación del backend

- Acceder a la carpeta del backend e instalar npm
  npm install
- Ejecutarlo:
  node index.js
- Si todo es correcto, aparecerá:
  Backend escuchando en puerto 3000
- El backend quedará disponible en:
  http://localhost:3000

## Instalación del frontend

- Acceder a la carpeta del frontend e instalar dependencias
  npm install
- Ejecutar el frontend:
  npm run dev
- Si se inicia correctamente, vite mostrará algo así:
  Local: http://localhost:5173/

## Cómo probar la aplicación

1. Abrir el frontend en el navegador (http://localhost:5173).
2. Subir un archivo PDF de factura (preferiblemente generado digitalmente, no escaneado). Actualmente el contenido del PDF subido es irrelevante
3. Introducir o revisar los datos de la factura en el formulario.
4. Enviar el formulario.

Si los datos son correctos:

- El backend valida la información.
- Se genera un XML.
- El XML se valida contra el XSD.
- El archivo XML se guarda en la carpeta:

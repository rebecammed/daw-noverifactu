import { generarHashRegistro } from "./src/core/hashEngine.js";
import { generarHashEvento } from "./src/core/hashEngineEventos.js";
import { iniciarNuevaCadenaEventos } from "./src/core/reiniciarCadenaEventos.js";

import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import AdmZip from "adm-zip";
import { GoogleGenerativeAI } from "@google/generative-ai";

import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { HASH_GENESIS } from "./src/config/hashing.js";
import { comprobarIntegridad } from "./src/core/comprobarIntegridad.js";
import { extraerDatosDesdeXML } from "./src/core/extraerDatosDesdeXML.js";
import { extraerCamposDesdeJSON } from "./src/core/extraerCamposDesdeJSON.js";
import { comprobarSuscripcion } from "./middleware/comprobarSuscripcion.js";
import { comprobarIntegridadEventos } from "./src/core/integridadEventos.js";
import { desbloquearPDF } from "./pdf/pdfUnlocker.js";

dotenv.config();

import auth from "./middleware/auth.js";
import requireAdmin from "./middleware/requireAdmin.js";
import pool from "./db/db.js";

import { extraerTextoPDF } from "./pdf/extraerTextoPDF.js";
import parsearFactura from "./pdf/parseFactura.js";
import validarFacturaAlta from "./validators/facturaAlta.js";
import normalizarFacturaAlta from "./normalizers/facturaAlta.js";
import generarFacturaAltaXML from "./xml/generarFacturaAltaxml.js";
import validarFacturaAltaXSD from "./xml/validarFacturaAltaxsd.js";
import generarFacturaAltaPDF from "./pdf/generarFacturaAltaPDF.js";
import generarFacturaRectificativaXML from "./xml/generarFacturaRectificativaxml.js";
import validarFacturaRectificativaXSD from "./xml/validarFacturaRectificativaxsd.js";
import generarFacturaAnulacionXML from "./xml/generarFacturaAnulacionxml.js";
import validarFacturaAnulacionXSD from "./xml/validarFacturaAnulacionxsd.js";
import { estamparSobreCopia } from "./pdf/estamparSobreCopia.js";
import {
  activarMantenimiento,
  desactivarMantenimiento,
  estaEnMantenimiento,
} from "./src/core/systemState.js";
import checkMantenimiento from "./middleware/checkMantenimiento.js";
import { verificarDatosFiscales } from "./middleware/verificarDatosFiscales.js";

import speakeasy from "speakeasy";
import QRCode from "qrcode";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

const genAI = new GoogleGenerativeAI("YOUR-API-KEY");

const upload = multer({ dest: "uploads/" });
const storageLogos = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join("uploads", "logos");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now(); // timestamp único
    cb(null, `logo_${req.usuario.id}_${unique}${ext}`);
  },
});

const uploadLogo = multer({ storage: storageLogos });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

async function registrarEvento(usuarioId, tipoEvento, descripcion) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [SIF] = await connection.query(
      `SELECT nombre 
      FROM sif_configuracion
      WHERE activo = 1 AND es_global = 1`,
    );

    const [ultimo] = await connection.query(
      `
      SELECT hash_evento, num_evento
      FROM log_eventos
      WHERE usuario_id = ?
      ORDER BY num_evento DESC
      LIMIT 1
      FOR UPDATE
      `,
      [usuarioId],
    );

    const hashEventoAnterior =
      ultimo.length > 0 ? ultimo[0].hash_evento : HASH_GENESIS;

    const numEventoAnterior = ultimo.length > 0 ? ultimo[0].num_evento : 0;

    const numEventoActual = numEventoAnterior + 1;

    const fechaHoraEvento = new Date().toISOString();
    const SIF_ID = SIF[0].nombre;

    const hashEventoActual = generarHashEvento({
      SIF_ID,
      usuarioId,
      tipoEvento,
      descripcion,
      fechaHoraEvento,
      numEventoAnterior,
      numEventoActual,
      hashAnterior: hashEventoAnterior,
    });

    await connection.query(
      `
      INSERT INTO log_eventos
      (
        usuario_id,
        tipo_evento,
        descripcion,
        fecha_evento,
        hash_evento,
        hash_evento_anterior,
        num_evento
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        usuarioId,
        tipoEvento,
        descripcion,
        fechaHoraEvento,
        hashEventoActual,
        hashEventoAnterior,
        numEventoActual,
      ],
    );

    await connection.commit();
  } catch (e) {
    await connection.rollback();
    throw e;
  } finally {
    connection.release();
  }
}

async function procesarPDF({
  pdf,
  baseDir,
  facturaId,
  connection,
  qrData,
  hashActual,
  generarPDFManual,
}) {
  let rutaSellado = null;

  if (pdf) {
    // 🔹 1. Guardar original
    const rutaOriginal = path.join(baseDir, "original.pdf");
    fs.renameSync(pdf.path, rutaOriginal);

    await connection.query(`UPDATE facturas SET ruta_pdf = ? WHERE id = ?`, [
      rutaOriginal,
      facturaId,
    ]);

    // 🔹 2. Intentar desbloquear
    let rutaPDFProcesable = rutaOriginal;

    try {
      const rutaDesbloqueado = await desbloquearPDF(rutaOriginal);

      if (fs.existsSync(rutaDesbloqueado)) {
        rutaPDFProcesable = rutaDesbloqueado;
      }
    } catch (err) {
      console.log("PDF protegido con contraseña o no desbloqueable.");
      // Seguimos con original
    }

    // 🔹 3. Intentar estampar QR
    try {
      const pdfSellado = await estamparSobreCopia(
        rutaOriginal,
        qrData,
        hashActual,
      );

      rutaSellado = path.join(baseDir, "sellado.pdf");
      fs.writeFileSync(rutaSellado, pdfSellado);
    } catch (err) {
      console.log(
        "No se pudo estampar sobre el PDF original. Generando manual.",
      );

      // 🔹 Fallback seguro
      const pdfNuevo = await generarPDFManual();
      rutaSellado = path.join(baseDir, "sellado.pdf");
      fs.writeFileSync(rutaSellado, pdfNuevo);
    }
  } else {
    // 🔹 Caso sin PDF externo
    const pdfNuevo = await generarPDFManual();
    rutaSellado = path.join(baseDir, "sellado.pdf");
    fs.writeFileSync(rutaSellado, pdfNuevo);
  }

  // 🔹 4. Guardar ruta final
  await connection.query(
    `UPDATE facturas SET pdf_generado_path = ? WHERE id = ?`,
    [rutaSellado, facturaId],
  );

  return rutaSellado;
}

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña obligatorios" });
  }

  const [rows] = await pool.query(
    `
    SELECT id, email, nombre, password_hash, activo, twofa_enabled, rol, email_verificado
    FROM usuarios
    WHERE email = ?
    `,
    [email],
  );

  if (rows.length === 0) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  const usuario = rows[0];
  if (!usuario.email_verificado) {
    return res.status(403).json({
      error: "Debes verificar tu email antes de iniciar sesión",
      codigo: "EMAIL_NO_VERIFICADO",
    });
  }
  if (!usuario.activo) {
    return res.status(403).json({ error: "Usuario desactivado" });
  }

  const passwordOk = await bcrypt.compare(password, usuario.password_hash);

  if (!passwordOk) {
    await registrarEvento(
      usuario.id,
      "LOGIN_FALLIDO",
      `Intento de inicio de sesión fallido para ${usuario.email}`,
    );

    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  // 🔐 SI LA CONTRASEÑA ES CORRECTA Y TIENE 2FA → PEDIR 2FA
  if (usuario.twofa_enabled) {
    await registrarEvento(
      usuario.id,
      "LOGIN_2FA_REQUERIDO",
      "Credenciales correctas, se requiere 2FA",
    );

    return res.json({
      twofaRequired: true,
      tempUserId: usuario.id,
    });
  }

  // ✅ LOGIN NORMAL (sin 2FA)
  await registrarEvento(
    usuario.id,
    "LOGIN_OK",
    `Inicio de sesión correcto de ${usuario.email}`,
  );

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: "8h" },
  );

  res.json({
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    },
  });
});

app.post("/api/auth/login/2fa", async (req, res) => {
  const { userId, token2fa } = req.body;

  if (!userId || !token2fa) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const [rows] = await pool.query(
    "SELECT id, email, nombre, twofa_secret, rol FROM usuarios WHERE id = ?",
    [userId],
  );

  if (rows.length === 0) {
    return res.status(400).json({ error: "Usuario no encontrado" });
  }

  const usuario = rows[0];

  const valido = speakeasy.totp.verify({
    secret: usuario.twofa_secret,
    encoding: "base32",
    token: token2fa,
    window: 1,
  });

  if (!valido) {
    await registrarEvento(
      usuario.id,
      "LOGIN_2FA_FALLIDO",
      "Código 2FA incorrecto",
    );
    return res.status(401).json({ error: "Código incorrecto" });
  }

  await registrarEvento(usuario.id, "LOGIN_2FA_OK", "Login con 2FA correcto");

  // 🔐 GENERAR TOKEN NORMAL (NO generarJWT)
  const token = jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: "8h" },
  );

  res.json({
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    },
  });
});

app.post("/api/2fa/setup", auth, async (req, res) => {
  const secret = speakeasy.generateSecret();

  const otpauthUrl = `otpauth://totp/NoVerifactu:${req.usuario.email}?secret=${secret.base32}&issuer=NoVerifactu`;
  // Guardas temporalmente el secreto (sin activar aún)
  await pool.query("UPDATE usuarios SET twofa_secret = ? WHERE id = ?", [
    secret.base32,
    req.usuario.id,
  ]);

  await registrarEvento(
    req.usuario.id,
    "INTENTO_ACTIVAR_2FA",
    "Inicio del proceso de activación de 2FA",
  );

  const qr = await QRCode.toDataURL(otpauthUrl);

  res.json({ qr });
});

app.post("/api/2fa/verify", auth, async (req, res) => {
  const { token } = req.body;

  const [[user]] = await pool.query(
    "SELECT twofa_secret FROM usuarios WHERE id = ?",
    [req.usuario.id],
  );

  const verified = speakeasy.totp.verify({
    secret: user.twofa_secret,
    encoding: "base32",
    token,
  });

  if (!verified) {
    await registrarEvento(
      req.usuario.id,
      "FALLO_ACTIVAR_2FA",
      "Código incorrecto al activar 2FA",
    );
    return res.status(400).json({ error: "Código incorrecto" });
  }

  await pool.query("UPDATE usuarios SET twofa_enabled = true WHERE id = ?", [
    req.usuario.id,
  ]);

  await registrarEvento(
    req.usuario.id,
    "ACTIVAR_2FA",
    "Autenticación en dos factores activada",
  );

  res.json({ ok: true });
});

app.get("/api/2fa/status", auth, async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      "SELECT twofa_enabled FROM usuarios WHERE id = ?",
      [req.usuario.id],
    );

    const enabled = usuarios[0].twofa_enabled !== 0;

    res.json({ enabled });
  } catch (error) {
    res.status(500).json({ error: "Error al consultar estado" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    let { email, password, nombre, aceptaPrivacidad } = req.body;
    if (!req.body.aceptaPrivacidad) {
      return res.status(400).json({
        error: "Debes aceptar la política de privacidad.",
      });
    }

    const errores = [];

    if (!email || !password || !nombre) {
      return res.status(400).json({
        error: "Nombre, email y contraseña son obligatorios",
      });
    }

    email = email.toLowerCase().trim();

    // 🔎 Validación email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errores.push("El formato del email no es válido");
    }

    // 🔎 Validación contraseña detallada
    const erroresPassword = [];
    console.log("Validando contraseña...");

    if (password.length < 8) {
      erroresPassword.push("Debe tener al menos 8 caracteres");
    }

    if (!/[A-Z]/.test(password)) {
      erroresPassword.push("Debe incluir al menos una letra mayúscula");
    }

    if (!/[0-9]/.test(password)) {
      erroresPassword.push("Debe incluir al menos un número");
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-+=\\[\]\/`~;]/.test(password)) {
      erroresPassword.push("Debe incluir al menos un carácter especial");
    }

    if (erroresPassword.length > 0) {
      return res.status(400).json({
        error: "Contraseña inválida",
        detalles: erroresPassword,
      });
    }

    if (errores.length > 0) {
      return res.status(400).json({ error: errores.join(". ") });
    }

    // 🔎 ¿Existe ya el usuario?
    const [existente] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email],
    );

    if (existente.length > 0) {
      return res.status(400).json({
        error: "El email ya está registrado",
      });
    }

    // 🔐 Hash contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // 🔑 Generar token de verificación
    const tokenPlano = crypto.randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(tokenPlano, 10);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // 🆕 Insert usuario
    const [result] = await pool.query(
      `
  INSERT INTO usuarios 
  (email, password_hash, nombre, activo, fecha_creacion, suscripcion, email_verificado, token_verificacion, token_expiracion)
  VALUES (?, ?, ?, 1, NOW(6), 'GRATUITO', 0, ?, ?)
  `,
      [email, passwordHash, nombre, tokenHash, expires],
    );

    const usuarioId = result.insertId;
    const enlace = `http://localhost:5173/verificar-email?token=${tokenPlano}`;

    console.log(`
======================================
📩 CONFIRMACIÓN DE CUENTA – INALTERA
Para: ${email}

Hola ${nombre},

Confirma tu cuenta haciendo clic aquí:

${enlace}

Este enlace caduca en 24 horas.

======================================
`);

    await registrarEvento(
      usuarioId,
      "REGISTRO_USUARIO",
      `Registro del usuario con email: ${email}`,
    );

    return res.json({
      ok: true,
      mensaje: "Registro correcto. Revisa tu correo para verificar tu cuenta.",
    });
  } catch (error) {
    console.error("Error registro:", error);
    res.status(500).json({ error: "Error registrando usuario" });
  }
});
app.post("/api/auth/resend-verification", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email obligatorio" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, email FROM usuarios WHERE email = ?",
      [email],
    );
    if (rows.length > 0 && rows[0].email_verificado) {
      return res.json(respuestaGenerica);
    }
    // 🔐 Siempre respondemos lo mismo (evita enumeración de usuarios)
    const respuestaGenerica = {
      mensaje: "Si el email existe, se ha enviado un enlace de verificación",
    };

    if (rows.length === 0) {
      return res.json(respuestaGenerica);
    }

    const usuario = rows[0];

    // 🔑 Generar token
    const tokenPlano = crypto.randomBytes(32).toString("hex");

    // 🔒 Hashearlo
    const tokenHash = await bcrypt.hash(tokenPlano, 10);

    // ⏳ Expira en 24h
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
      `
      UPDATE usuarios 
      SET token_verificacion = ?, token_expiracion = ?
      WHERE id = ?
      `,
      [tokenHash, expires, usuario.id],
    );

    await registrarEvento(
      usuario.id,
      "VERIFICACIÓN_EMAIL",
      `Solicitud de verificación para el email: ${usuario.email}`,
    );

    // 🔗 Enlace (mock email)
    const enlace = `http://localhost:5173/verificar-email?token=${tokenPlano}`;

    console.log("======================================");
    console.log("📩 ENLACE VERIFICACIÓN EMAIL:");
    console.log(enlace);
    console.log("======================================");

    return res.json(respuestaGenerica);
  } catch (error) {
    console.error("ERROR FORGOT PASSWORD:", error);
    return res.status(500).json({
      error: "Error procesando solicitud",
    });
  }
});
app.get("/api/auth/verificar-email", async (req, res) => {
  const { token } = req.query;
  console.log("TOKEN RECIBIDO:", token);
  if (!token) {
    return res.status(400).json({ error: "Token requerido" });
  }

  try {
    const [usuarios] = await pool.query(
      "SELECT * FROM usuarios WHERE token_expiracion > NOW()",
    );

    console.log("Usuarios con token activo:", usuarios.length);

    let usuarioValido = null;

    for (const usuario of usuarios) {
      const match = await bcrypt.compare(token, usuario.token_verificacion);

      if (usuario.token_verificacion && match) {
        usuarioValido = usuario; // ✅ guardamos el objeto completo
        break;
      }
    }

    if (usuarioValido == null) {
      console.log("NO SE ENCONTRÓ USUARIO VÁLIDO");
      return res.status(400).json({ error: "Token inválido o expirado" });
    }

    await pool.query(
      `
      UPDATE usuarios 
      SET email_verificado = 1,
          token_verificacion = NULL,
          token_expiracion = NULL
      WHERE id = ?
      `,
      [usuarioValido.id],
    );

    await registrarEvento(
      usuarioValido.id,
      "EMAIL_VERIFICADO",
      `Email verificado: ${usuarioValido.email}`,
    );

    return res.json({ ok: true, mensaje: "Email verificado correctamente" });
  } catch (error) {
    console.error("ERROR VERIFY EMAIL:", error);
    return res.status(500).json({ error: "Error verificando email" });
  }
});

app.get("/api/usuarios/me", auth, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const [[usuario]] = await pool.query(
      `
      SELECT
        id,
        nombre,
        email,
        rol,
        suscripcion,
        estado_suscripcion
      FROM usuarios
      WHERE id = ?
      `,
      [usuarioId],
    );

    res.json(usuario);
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    res.status(500).json({
      error: "Error obteniendo datos del usuario",
    });
  }
});
app.post("/api/usuarios/cambiar-password", auth, async (req, res) => {
  const idUsuario = req.usuario.id;
  const { passwordActual, nuevaPassword, repetirPassword } = req.body;

  if (!passwordActual || !nuevaPassword || !repetirPassword) {
    return res.status(400).json({
      error: "Todos los campos son obligatorios",
    });
  }

  if (nuevaPassword !== repetirPassword) {
    return res.status(400).json({
      error: "Las nuevas contraseñas no coinciden",
    });
  }

  // 🔐 Validaciones de seguridad
  const erroresPassword = [];

  if (nuevaPassword.length < 8) {
    erroresPassword.push("Debe tener al menos 8 caracteres");
  }

  if (!/[A-Z]/.test(nuevaPassword)) {
    erroresPassword.push("Debe incluir al menos una letra mayúscula");
  }

  if (!/[0-9]/.test(nuevaPassword)) {
    erroresPassword.push("Debe incluir al menos un número");
  }

  if (!/[!@#$%^&*(),.?":{}|<>_\-+=\\[\]\/`~;]/.test(nuevaPassword)) {
    erroresPassword.push("Debe incluir al menos un carácter especial");
  }

  if (erroresPassword.length > 0) {
    return res.status(400).json({
      error: "La contraseña no cumple los requisitos",
      detalles: erroresPassword,
    });
  }

  try {
    const [[usuario]] = await pool.query(
      "SELECT password_hash FROM usuarios WHERE id = ?",
      [idUsuario],
    );

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const coincide = await bcrypt.compare(
      passwordActual,
      usuario.password_hash,
    );

    if (!coincide) {
      return res.status(400).json({
        error: "La contraseña actual es incorrecta",
      });
    }

    const mismaPassword = await bcrypt.compare(
      nuevaPassword,
      usuario.password_hash,
    );

    if (mismaPassword) {
      return res.status(400).json({
        error: "La nueva contraseña no puede ser igual a la actual",
      });
    }

    const nuevaHash = await bcrypt.hash(nuevaPassword, 10);

    await pool.query("UPDATE usuarios SET password_hash = ? WHERE id = ?", [
      nuevaHash,
      idUsuario,
    ]);

    await registrarEvento(
      idUsuario,
      "CAMBIO_PASSWORD",
      "El usuario cambió su contraseña",
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error("ERROR CAMBIO PASSWORD:", err);
    return res.status(500).json({
      error: "Error al cambiar la contraseña",
    });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email obligatorio" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, email FROM usuarios WHERE email = ?",
      [email],
    );

    // 🔐 Siempre respondemos lo mismo (evita enumeración de usuarios)
    const respuestaGenerica = {
      mensaje: "Si el email existe, se ha enviado un enlace de recuperación",
    };

    if (rows.length === 0) {
      return res.json(respuestaGenerica);
    }

    const usuario = rows[0];

    // 🔑 Generar token seguro
    const tokenPlano = crypto.randomBytes(32).toString("hex");

    // 🔒 Hashearlo antes de guardar
    const tokenHash = await bcrypt.hash(tokenPlano, 10);

    // ⏳ Expiración 15 minutos
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      `
      UPDATE usuarios 
      SET reset_token_hash = ?, reset_token_expires = ?
      WHERE id = ?
      `,
      [tokenHash, expires, usuario.id],
    );

    await registrarEvento(
      usuario.id,
      "SOLICITUD_RESET_PASSWORD",
      `Solicitud de recuperación para ${usuario.email}`,
    );

    // 🔗 Enlace (mock email)
    const enlace = `http://localhost:5173/reset-password?token=${tokenPlano}`;

    console.log("🔐 ENLACE RECUPERACIÓN:");
    console.log(enlace);

    return res.json(respuestaGenerica);
  } catch (error) {
    console.error("ERROR FORGOT PASSWORD:", error);
    return res.status(500).json({
      error: "Error procesando solicitud",
    });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  const { token, nuevaPassword, repetirPassword } = req.body;

  console.log("TOKEN RECIBIDO:", token);
  console.log("BODY COMPLETO:", req.body);

  if (!token || !nuevaPassword || !repetirPassword) {
    return res.status(400).json({
      error: "Datos incompletos",
    });
  }

  if (nuevaPassword !== repetirPassword) {
    return res.status(400).json({
      error: "Las contraseñas no coinciden",
    });
  }

  // 🔐 Validaciones de seguridad
  const erroresPassword = [];

  if (nuevaPassword.length < 8)
    erroresPassword.push("Debe tener al menos 8 caracteres");

  if (!/[A-Z]/.test(nuevaPassword))
    erroresPassword.push("Debe incluir al menos una mayúscula");

  if (!/[0-9]/.test(nuevaPassword))
    erroresPassword.push("Debe incluir al menos un número");

  if (!/[!@#$%^&*(),.?":{}|<>_\-+=\\[\]\/`~;]/.test(nuevaPassword))
    erroresPassword.push("Debe incluir un carácter especial");

  if (erroresPassword.length > 0) {
    return res.status(400).json({
      error: "La contraseña no cumple requisitos",
      detalles: erroresPassword,
    });
  }

  try {
    const [usuarios] = await pool.query(
      `
      SELECT id, reset_token_hash, reset_token_expires 
      FROM usuarios
      WHERE reset_token_hash IS NOT NULL
      `,
    );

    let usuarioEncontrado = null;

    // 🔍 Buscar usuario cuyo hash coincida
    for (const u of usuarios) {
      const coincide = await bcrypt.compare(token, u.reset_token_hash);
      if (coincide) {
        usuarioEncontrado = u;
        break;
      }
    }
    console.log("USUARIO ENCONTRADO:", usuarioEncontrado);
    if (!usuarioEncontrado) {
      return res.status(400).json({
        error: "Token inválido",
      });
    }

    // ⏳ Verificar expiración
    if (new Date() > new Date(usuarioEncontrado.reset_token_expires)) {
      return res.status(400).json({
        error: "El token ha expirado",
      });
    }

    // 🔐 Generar nuevo hash de contraseña
    const nuevoHash = await bcrypt.hash(nuevaPassword, 10);

    console.log("NUEVO HASH:", nuevoHash);
    await pool.query(
      `
      UPDATE usuarios
      SET password_hash = ?,
          reset_token_hash = NULL,
          reset_token_expires = NULL
      WHERE id = ?
      `,
      [nuevoHash, usuarioEncontrado.id],
    );

    await registrarEvento(
      usuarioEncontrado.id,
      "RESET_PASSWORD_OK",
      "Contraseña restablecida correctamente",
    );

    return res.json({
      mensaje: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error("ERROR RESET PASSWORD:", error);
    return res.status(500).json({
      error: "Error procesando reset",
    });
  }
});

app.post(
  "/api/facturas/preview",
  upload.single("pdf"),
  auth,
  checkMantenimiento,
  verificarDatosFiscales,
  //comprobarSuscripcion,
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ mensaje: "Archivo no recibido" });
    }

    const rutaTemporal = req.file.path;

    try {
      // 1. Preparar el modelo
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      // 2. Leer archivo y convertir a Base64 para la IA
      const dataArchivo = {
        inlineData: {
          data: Buffer.from(fs.readFileSync(rutaTemporal)).toString("base64"),
          mimeType: req.file.mimetype,
        },
      };

      // 3. Prompt estricto para Verifactu
      // En tu endpoint /api/facturas/preview
      const prompt = `Analiza esta factura y extrae los datos. 
Responde ÚNICAMENTE con un JSON:
{
  "numeroFactura": "string",
  "fechaExpedicion": "YYYY-MM-DDTHH:mm",
  "receptor": {
    "nif": "string",
    "nombre": "string",
    "direccion": "string",
    "codigo_postal": "string",
    "ciudad": "string",
    "pais": "string"
  },
  "conceptos": [
    {"descripcion": "string", "cantidad": number, "precioUnitario": number, "tipoImpositivo": number, "tipoImpuesto": "IVA"}
  ]
    }
      Si un dato no existe, usa cadena vacía o 0. No incluyas markdown ni texto extra.`;

      const result = await model.generateContent([prompt, dataArchivo]);
      const response = await result.response;
      let textoLimpio = response
        .text()
        .replace(/```json|```/g, "")
        .trim();

      const datosIA = JSON.parse(textoLimpio);

      // 4. Normalización final (tu lógica original adaptada)
      const datosDetectados = {
        ...datosIA,
        conceptos: (datosIA.conceptos || []).map((c) => ({
          descripcion: c.descripcion || "",
          cantidad: Number(c.cantidad) || 1,
          precioUnitario: Number(c.precioUnitario) || 0,
          tipoImpositivo: Number(c.tipoImpositivo) || 21,
          tipoImpuesto: c.tipoImpuesto || "IVA",
        })),
      };

      // 5. Validación Verifactu (tu función existente)
      const erroresPreliminares = validarFacturaAlta(
        datosDetectados,
        new Date(),
      );

      fs.unlinkSync(rutaTemporal);

      return res.json({
        mensaje: "Datos extraídos por IA correctamente",
        datosDetectados,
        erroresPreliminares,
      });
    } catch (error) {
      if (fs.existsSync(rutaTemporal)) fs.unlinkSync(rutaTemporal);
      console.error("Error IA Preview:", error);
      return res.status(500).json({
        mensaje: "Error en el análisis de IA",
        detalle: error.message,
      });
    }
  },
);

app.post(
  "/api/facturas/confirm",
  upload.single("pdf"),
  auth,
  checkMantenimiento,
  verificarDatosFiscales,
  //comprobarSuscripcion,
  async (req, res) => {
    const connection = await pool.getConnection();
    const usuarioId = req.usuario.id;
    const pdf = req.file || null;

    try {
      if (!req.body.metadata) {
        return res.status(400).json({ mensaje: "Metadatos no recibidos" });
      }

      let metadata;
      try {
        metadata = JSON.parse(req.body.metadata);
      } catch {
        return res.status(400).json({ mensaje: "Metadatos mal formados" });
      }

      const errores = validarFacturaAlta(metadata, new Date());
      if (errores.length > 0) {
        return res.status(400).json({ errores });
      }

      const datosNormalizados = normalizarFacturaAlta(metadata);

      await connection.beginTransaction();

      // ==========================
      // EMISOR
      // ==========================
      const [[emisor]] = await connection.query(
        `SELECT nif, razon_social, direccion, codigo_postal, ciudad, pais
         FROM datos_fiscales WHERE usuario_id = ?`,
        [usuarioId],
      );

      if (!emisor) {
        throw new Error("Datos fiscales no configurados");
      }

      const nifEmisor = emisor.nif;

      // ==========================
      // IMPORTES DESDE CONCEPTOS
      // ==========================
      if (
        !metadata.conceptos ||
        !Array.isArray(metadata.conceptos) ||
        metadata.conceptos.length === 0
      ) {
        throw new Error("La factura debe contener al menos un concepto");
      }
      // ==========================
      // PROCESAR CONCEPTOS
      // ==========================

      const conceptosProcesados = datosNormalizados.conceptos.map((c) => {
        const cantidad = Number(c.cantidad);
        const precio = Number(c.precioUnitario);
        const tipo = Number(c.tipoImpositivo);

        const base = Number((cantidad * precio).toFixed(2));
        const cuotaCalculada = Number((base * (tipo / 100)).toFixed(2));

        const cuotaFinal =
          c.tipoImpuesto === "IRPF"
            ? -cuotaCalculada // 🔥 IRPF en negativo
            : cuotaCalculada;

        return {
          descripcion: c.descripcion,
          cantidad,
          precioUnitario: precio,
          tipoImpuesto: c.tipoImpuesto,
          tipoImpositivo: tipo,
          base,
          cuota: cuotaFinal,
        };
      });

      // ==========================
      // AGRUPAR IMPUESTOS DESDE CONCEPTOS
      // ==========================

      const resumenImpuestos = {};

      for (const c of conceptosProcesados) {
        const clave = `${c.tipoImpuesto}-${c.tipoImpositivo}`;

        if (!resumenImpuestos[clave]) {
          resumenImpuestos[clave] = {
            tipoImpuesto: c.tipoImpuesto,
            tipoImpositivo: c.tipoImpositivo,
            base: 0,
            cuota: 0,
          };
        }

        resumenImpuestos[clave].base += c.base;
        resumenImpuestos[clave].cuota += c.cuota;
      }

      // ==========================
      // CALCULAR TOTALES DESDE RESUMEN
      // ==========================

      let baseTotal = 0;
      let cuotaTotal = 0;
      let cuotaIVA = 0;

      for (const key in resumenImpuestos) {
        const r = resumenImpuestos[key];

        baseTotal += r.base;
        cuotaTotal += r.cuota;

        if (r.tipoImpuesto === "IVA") {
          cuotaIVA += r.cuota;
        }
      }

      baseTotal = Number(baseTotal.toFixed(2));
      cuotaTotal = Number(cuotaTotal.toFixed(2));
      cuotaIVA = Number(cuotaIVA.toFixed(2));

      const importeTotal = Number((baseTotal + cuotaTotal).toFixed(2));

      // ==========================
      // DUPLICADO
      // ==========================
      const [existe] = await connection.query(
        `SELECT id FROM facturas
         WHERE usuario_id = ? AND numero_factura = ?
         LIMIT 1`,
        [usuarioId, datosNormalizados.numeroFactura],
      );

      if (existe.length > 0) {
        throw new Error("Ya existe una factura con ese número");
      }

      // ==========================
      // CADENA
      // ==========================
      const [ultimoRegistro] = await connection.query(
        `SELECT hash_registro_actual, num_registro
         FROM registros_facturacion
         WHERE usuario_id = ?
         ORDER BY num_registro DESC
         LIMIT 1
         FOR UPDATE`,
        [usuarioId],
      );

      const numRegistroAnterior =
        ultimoRegistro.length > 0 ? ultimoRegistro[0].num_registro : 0;

      const hashAnterior =
        ultimoRegistro.length > 0
          ? ultimoRegistro[0].hash_registro_actual
          : HASH_GENESIS;

      const numRegistroActual = numRegistroAnterior + 1;

      // ==========================
      // SIF
      // ==========================
      const [[sif]] = await connection.query(
        `SELECT id, nombre, nif, version, fecha_declaracion_responsable
         FROM sif_configuracion
         WHERE id = ?`,
        [metadata.sifConfigId],
      );

      if (!sif) {
        throw new Error("SIF no válido");
      }

      const fechaEmision = new Date(
        datosNormalizados.fechaExpedicion,
      ).toISOString();

      const hashActual = generarHashRegistro({
        sifId: sif.nombre,
        nifEmisor,
        numeroFacturaCompleto: datosNormalizados.numeroFactura,
        fechaHoraEmision: fechaEmision,
        importeTotal,
        numRegistroAnterior,
        numRegistroActual,
        hashAnterior,
      });

      // ==========================
      // CLIENTE (guardar y obtener id + datos)
      // ==========================
      let clienteFinalId;
      let receptor;

      if (metadata.usarClienteExistente && metadata.clienteId) {
        const [[cliente]] = await connection.query(
          `SELECT * FROM clientes WHERE id = ? AND usuario_id = ?`,
          [metadata.clienteId, usuarioId],
        );

        if (!cliente) throw new Error("Cliente no encontrado");

        clienteFinalId = cliente.id;
        receptor = cliente; // 👈 AQUÍ tienes el nif
      } else {
        const [insertCliente] = await connection.query(
          `INSERT INTO clientes
     (usuario_id, nif, nombre, direccion, codigo_postal, ciudad, pais, email, telefono)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            usuarioId,
            metadata.clienteNuevo.nif,
            metadata.clienteNuevo.nombre,
            metadata.clienteNuevo.direccion,
            metadata.clienteNuevo.codigo_postal,
            metadata.clienteNuevo.ciudad,
            metadata.clienteNuevo.pais,
            metadata.clienteNuevo.email,
            metadata.clienteNuevo.telefono,
          ],
        );

        clienteFinalId = insertCliente.insertId;

        // 👇 El receptor en este caso es lo que viene del formulario
        receptor = metadata.clienteNuevo;
      }

      // ==========================
      // XML (🔥 CORREGIDO receptor)
      // ==========================
      const impuestosXML = Object.values(resumenImpuestos).map((r) => ({
        base: Number(r.base.toFixed(2)),
        tipoImpositivo: r.tipoImpositivo,
        cuota: Number(r.cuota.toFixed(2)),
        tipoImpuesto: r.tipoImpuesto,
      }));

      const impuestosPDF = Object.values(resumenImpuestos).map((r) => ({
        base: Number(r.base.toFixed(2)),
        tipoImpositivo: r.tipoImpositivo,
        cuota: Number(r.cuota.toFixed(2)),
        tipoImpuesto: r.tipoImpuesto,
      }));

      const datosFacturaXML = {
        cabecera: {
          nifEmisor,
          nifReceptor: receptor.nif, // 🔥 CORREGIDO
          versionSIF: sif.version,
        },
        datosFactura: {
          numeroFactura: datosNormalizados.numeroFactura,
          fechaExpedicion: fechaEmision,
          tipoFactura: datosNormalizados.tipoFactura,
          importeTotal,
        },
        desgloseFiscal: {
          impuestos: impuestosXML,
        },
        trazabilidad: {
          numRegAnt: numRegistroAnterior,
          numRegAct: numRegistroActual,
          hashAnterior,
          hashPropio: hashActual,
          identificacionSIF: {
            idSw: sif.nombre,
            nifDev: sif.nif,
            fechaDeclaracionResponsable: new Date(
              sif.fecha_declaracion_responsable,
            ).toISOString(),
          },
        },
      };

      const xmlFactura = generarFacturaAltaXML(datosFacturaXML);

      // ==========================
      // INSERT REGISTRO
      // ==========================

      const fechaGeneracion = new Date().toISOString();
      const [registroResult] = await connection.query(
        `INSERT INTO registros_facturacion
         (usuario_id, fecha_hora_generacion, contenido_registro,
          hash_registro_anterior, hash_registro_actual,
          estado, num_registro, sif_config_id)
         VALUES (?, ?, ?, ?, ?, 'ALTA', ?, ?)`,
        [
          usuarioId,
          fechaGeneracion,
          xmlFactura,
          hashAnterior,
          hashActual,
          numRegistroActual,
          sif.id,
        ],
      );

      const registroId = registroResult.insertId;

      // ==========================
      // INSERT FACTURA (🔥 ampliado)
      // ==========================
      const [facturaResult] = await connection.query(
        `INSERT INTO facturas
         (usuario_id, registro_id, numero_factura,
          fecha_expedicion, tipo_factura,
          importe_total, 
          ruta_pdf, cliente_id, pdf_generado_path, xml_generado_path)
         VALUES (?, ?, ?, ?, ?, ?, NULL, ?, NULL, NULL)`,
        [
          usuarioId,
          registroId,
          datosNormalizados.numeroFactura,
          fechaEmision,
          datosNormalizados.tipoFactura,
          importeTotal,
          clienteFinalId,
        ],
      );

      const facturaId = facturaResult.insertId;

      // ==========================
      // INSERT CONCEPTOS
      // ==========================
      for (const c of conceptosProcesados) {
        await connection.query(
          `
    INSERT INTO factura_conceptos
    (factura_id, descripcion, cantidad, precio_unitario,
     tipo_impositivo, tipo_impuesto, base, cuota)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
          [
            facturaId,
            c.descripcion,
            c.cantidad,
            c.precioUnitario,
            c.tipoImpositivo,
            c.tipoImpuesto,
            c.base,
            c.cuota,
          ],
        );
      }
      for (const r of Object.values(resumenImpuestos)) {
        await connection.query(
          `
    INSERT INTO factura_impuestos
    (factura_id, base_imponible, tipo_impositivo, cuota, tipo_impuesto)
    VALUES (?, ?, ?, ?, ?)
    `,
          [
            facturaId,
            Number(r.base.toFixed(2)),
            r.tipoImpositivo,
            Number(r.cuota.toFixed(2)),
            r.tipoImpuesto,
          ],
        );
      }

      // ==========================
      // STORAGE
      // ==========================
      const baseDir = path.join(
        process.cwd(),
        "storage",
        "usuarios",
        String(usuarioId),
        "facturas",
        String(facturaId),
      );

      fs.mkdirSync(baseDir, { recursive: true });

      // 🔥 Guardar XML
      const rutaXML = path.join(baseDir, "factura.xml");
      fs.writeFileSync(rutaXML, xmlFactura, "utf8");

      await connection.query(
        `UPDATE facturas SET xml_generado_path = ? WHERE id = ?`,
        [rutaXML, facturaId],
      );

      let rutaOriginal = null;

      const baseUrl =
        "https://www2.agenciatributaria.gob.es/wlpl/AVAC-HACI/VerificaFactura";
      const qrData =
        `${baseUrl}` +
        `?nif=${nifEmisor}` +
        `&num=${datosNormalizados.numeroFactura}` +
        `&fecha=${fechaEmision}` +
        `&cuotaIVA=${cuotaIVA.toFixed(2)}` +
        `&importe=${importeTotal.toFixed(2)}` +
        `&hashPropio=${hashActual}`;

      await procesarPDF({
        pdf,
        baseDir,
        facturaId,
        connection,
        qrData,
        hashActual,
        generarPDFManual: async () => {
          return await generarFacturaAltaPDF({
            tipoDocumento: "ALTA",
            cabecera: {
              logoPath,
              emisor,
              receptor,
            },
            datosFactura: {
              numeroFactura: datosNormalizados.numeroFactura,
              fechaExpedicion: datosNormalizados.fechaExpedicion,
              tipoFactura: datosNormalizados.tipoFactura,
              importeTotal,
            },
            conceptos: conceptosProcesados,
            desgloseFiscal: { impuestos: impuestosPDF },
            trazabilidad: datosFacturaXML.trazabilidad,
            qrData,
          });
        },
      });

      await connection.commit();

      await registrarEvento(
        usuarioId,
        "FACTURA_REGISTRADA",
        `Factura ${datosNormalizados.numeroFactura} registrada`,
      );

      return res.json({
        ok: true,
        facturaId,
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error confirmando factura:", error);
      return res.status(500).json({
        mensaje: "Error registrando la factura",
      });
    } finally {
      connection.release();
    }
  },
);

app.post(
  "/api/facturas/preview-rectificativa",
  upload.single("pdf"),
  auth,
  checkMantenimiento,
  verificarDatosFiscales,
  //comprobarSuscripcion,
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ mensaje: "Archivo no recibido" });
    }

    const { facturaOrigenId } = req.body;
    const idUsuario = req.usuario.id;

    if (!facturaOrigenId) {
      return res.status(400).json({ mensaje: "Falta facturaOrigenId" });
    }

    const rutaTemporal = req.file.path;
    const connection = await pool.getConnection();

    try {
      // =====================================================
      // 1️⃣ Verificar que la factura origen existe y es del usuario
      // =====================================================

      const [facturaRows] = await connection.query(
        `SELECT id 
         FROM facturas 
         WHERE id = ? AND usuario_id = ?`,
        [facturaOrigenId, idUsuario],
      );

      if (!facturaRows.length) {
        fs.unlinkSync(rutaTemporal);
        return res
          .status(404)
          .json({ mensaje: "Factura origen no encontrada" });
      }

      // =====================================================
      // 2️⃣ Cargar conceptos originales
      // =====================================================

      const [conceptosOriginales] = await connection.query(
        `SELECT id, descripcion, cantidad, precio_unitario, tipo_impositivo, tipo_impuesto
         FROM factura_conceptos
         WHERE factura_id = ?`,
        [facturaOrigenId],
      );

      // =====================================================
      // 3️⃣ Llamada a IA
      // =====================================================

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const dataArchivo = {
        inlineData: {
          data: Buffer.from(fs.readFileSync(rutaTemporal)).toString("base64"),
          mimeType: req.file.mimetype,
        },
      };

      const prompt = `
Analiza esta factura RECTIFICATIVA y extrae los datos.

IMPORTANTE:
Si un concepto aparece con importe negativo o total negativo,
la cantidad debe ser negativa.

Responde ÚNICAMENTE con un JSON:

{
  "fechaExpedicion": "YYYY-MM-DDTHH:mm",
  "tipoRectificacion": "DIFERENCIAS o SUSTITUCION",
  "cliente": {
    "nif": "string",
    "nombre": "string",
    "direccion": "string",
    "codigo_postal": "string",
    "ciudad": "string",
    "pais": "string",
    "email": "string",
    "telefono": "string"
  },
  "conceptos": [
    {
      "descripcion": "string",
      "cantidad": number,   // negativa si el importe es negativo
      "precioUnitario": number,
      "tipoImpositivo": number,
      "tipoImpuesto": "IVA | IRPF | IGIC | IPSI"
    }
  ]
}

No incluyas markdown ni texto extra.
`;

      const result = await model.generateContent([prompt, dataArchivo]);
      const response = await result.response;

      let textoLimpio = response
        .text()
        .replace(/```json|```/g, "")
        .trim();

      const datosIA = JSON.parse(textoLimpio);

      console.log(datosIA.conceptos);

      let clienteProcesado = null;

      if (datosIA.cliente && datosIA.cliente.nif) {
        const [clienteExistente] = await connection.query(
          `SELECT id FROM clientes 
     WHERE usuario_id = ? AND nif = ?`,
          [idUsuario, datosIA.cliente.nif],
        );

        if (clienteExistente.length > 0) {
          clienteProcesado = {
            esNuevo: false,
            id: clienteExistente[0].id,
          };
        } else {
          clienteProcesado = {
            esNuevo: true,
            datos: datosIA.cliente,
          };
        }
      }

      function normalizarTexto(t) {
        return (t || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, " ")
          .trim();
      }

      let originalesDisponibles = [...conceptosOriginales];

      function buscarMatchPorDescripcion(nuevo) {
        const descNuevo = normalizarTexto(nuevo.descripcion);

        const index = originalesDisponibles.findIndex(
          (o) => normalizarTexto(o.descripcion) === descNuevo,
        );

        if (index !== -1) {
          const match = originalesDisponibles[index];

          // 🔥 Eliminamos del pool para no reutilizarlo
          originalesDisponibles.splice(index, 1);

          return match;
        }

        return null;
      }

      // =====================================================
      // 4️⃣ RECONSTRUCCIÓN ESTADO FINAL (MODELO A)
      // =====================================================

      // 1️⃣ Construimos estado base con originales
      let estadoFinal = conceptosOriginales.map((o) => ({
        idOriginal: o.id,
        descripcion: o.descripcion,
        cantidad: Number(o.cantidad),
        precioUnitario: Number(o.precio_unitario),
        tipoImpositivo: Number(o.tipo_impositivo),
        tipoImpuesto: o.tipo_impuesto,
        estadoCambio: "sin_cambios",
      }));

      // 2️⃣ Detectar si parece DELTA (heurística simple)
      const totalOriginal = conceptosOriginales.reduce((acc, o) => {
        return acc + Number(o.cantidad) * Number(o.precio_unitario);
      }, 0);

      const totalPDF = (datosIA.conceptos || []).reduce((acc, c) => {
        return acc + Number(c.cantidad || 0) * Number(c.precioUnitario || 0);
      }, 0);

      const pareceDelta =
        totalOriginal !== 0 &&
        Math.abs(totalPDF) < Math.abs(totalOriginal) &&
        Math.abs(totalPDF) !== Math.abs(totalOriginal);

      // 3️⃣ Aplicar cada línea del PDF
      for (const lineaPDF of datosIA.conceptos || []) {
        const nuevo = {
          descripcion: lineaPDF.descripcion || "",
          cantidad: Number(lineaPDF.cantidad) || 1,
          precioUnitario: Number(lineaPDF.precioUnitario) || 0,
          tipoImpositivo: Number(lineaPDF.tipoImpositivo) || 0,
          tipoImpuesto: lineaPDF.tipoImpuesto || "IVA",
        };

        if (lineaPDF.total && Number(lineaPDF.total) < 0) {
          nuevo.cantidad = -Math.abs(nuevo.cantidad);
        }

        const match = buscarMatchPorDescripcion(nuevo);

        if (match) {
          const lineaEstado = estadoFinal.find(
            (l) => l.idOriginal === match.id,
          );

          const esDeltaLinea = nuevo.cantidad < 0 || nuevo.precioUnitario < 0;

          if (lineaEstado) {
            if (esDeltaLinea || pareceDelta) {
              // Si precio unitario coincide → sumar cantidad
              if (
                Number(lineaEstado.precioUnitario) ===
                Number(nuevo.precioUnitario)
              ) {
                lineaEstado.cantidad =
                  Number(lineaEstado.cantidad) + Number(nuevo.cantidad);
              } else {
                // Si cambia precio → tratar como estado final directo
                lineaEstado.cantidad = nuevo.cantidad;
                lineaEstado.precioUnitario = nuevo.precioUnitario;
              }
            }

            lineaEstado.estadoCambio = "modificado";

            if (lineaEstado.cantidad === 0) {
              lineaEstado.estadoCambio = "eliminado";
            }
          }
        } else {
          // Nueva línea
          estadoFinal.push({
            idOriginal: null,
            ...nuevo,
            estadoCambio: "nuevo",
          });
        }
      }

      // =====================================================
      // 5️⃣ Limpieza y respuesta
      // =====================================================

      fs.unlinkSync(rutaTemporal);

      return res.json({
        mensaje: "Preview rectificativa generado correctamente",
        datosDetectados: {
          fechaExpedicion: datosIA.fechaExpedicion || "",
          tipoRectificacion:
            datosIA.tipoRectificacion === "SUSTITUCION"
              ? "SUSTITUCION"
              : "DIFERENCIAS",
          cliente: clienteProcesado,
          conceptos: estadoFinal,
        },
      });
    } catch (error) {
      if (fs.existsSync(rutaTemporal)) {
        fs.unlinkSync(rutaTemporal);
      }

      console.error("Error IA Preview Rectificativa:", error);

      return res.status(500).json({
        mensaje: "Error en análisis IA rectificativa",
        detalle: error.message,
      });
    } finally {
      connection.release();
    }
  },
);

app.post(
  "/api/facturas/rectificar",
  upload.single("pdf"),
  auth,
  checkMantenimiento,
  verificarDatosFiscales,
  //comprobarSuscripcion,
  async (req, res) => {
    const idUsuario = req.usuario.id;
    const pdf = req.file || null;
    const connection = await pool.getConnection();

    try {
      const data = JSON.parse(req.body.data);

      const {
        facturaOrigenId,
        fechaExpedicion,
        tipoRectificacion,
        cliente,
        conceptos,
      } = data;
      let conceptosParsed = conceptos;

      if (typeof conceptos === "string") {
        conceptosParsed = JSON.parse(conceptos);
      }
      if (
        !facturaOrigenId ||
        !fechaExpedicion ||
        !tipoRectificacion ||
        !Array.isArray(conceptos) ||
        conceptos.length === 0
      ) {
        return res.status(400).json({
          error: "Faltan datos obligatorios para la rectificación",
        });
      }

      await connection.beginTransaction();

      // 🔹 1. Cargar factura original
      const [facturas] = await connection.query(
        `
      SELECT 
        f.numero_factura,
        f.fecha_expedicion,
        f.importe_total,
        f.cliente_id,
        f.estado,
        f.tipo_factura,
        r.hash_registro_actual
      FROM facturas f
      INNER JOIN registros_facturacion r ON r.id = f.registro_id
      WHERE f.id = ? AND f.usuario_id = ?
      `,
        [facturaOrigenId, idUsuario],
      );

      if (!facturas.length) {
        await connection.rollback();
        return res.status(404).json({
          error: "Factura original no encontrada",
        });
      }

      const factura = facturas[0];

      // ❌ No permitir rectificar facturas anuladas
      if (factura.estado === "ANULADA") {
        await connection.rollback();
        return res.status(400).json({
          error: "No se puede rectificar una factura anulada.",
        });
      }

      // ❌ No permitir rectificar una rectificativa
      if (factura.tipo_factura === "RECTIFICATIVA") {
        await connection.rollback();
        return res.status(400).json({
          error: "No se puede rectificar una factura rectificativa.",
        });
      }

      const [impuestosOriginales] = await connection.query(
        `
      SELECT base_imponible, tipo_impositivo, tipo_impuesto
      FROM factura_impuestos
      WHERE factura_id = ?
      `,
        [facturaOrigenId],
      );

      // 🔹 Obtener conceptos originales para comparación línea a línea
      const [conceptosOriginales] = await connection.query(
        `
  SELECT id, descripcion, cantidad, precio_unitario, tipo_impositivo, tipo_impuesto
  FROM factura_conceptos
  WHERE factura_id = ?
  `,
        [facturaOrigenId],
      );
      // 🔹 2. Numeración rectificativa
      const [rectificativas] = await connection.query(
        `
      SELECT COUNT(*) as total
      FROM facturas
      WHERE usuario_id = ?
        AND tipo_factura = 'RECTIFICATIVA'
        AND factura_origen_id = ?
      `,
        [idUsuario, facturaOrigenId],
      );

      // 🔹 Comprobar si ya existe rectificativa activa
      const [rectificativasActivas] = await connection.query(
        `
  SELECT id
  FROM facturas
  WHERE usuario_id = ?
    AND tipo_factura = 'RECTIFICATIVA'
    AND factura_origen_id = ?
    AND estado != 'ANULADA'
  `,
        [idUsuario, facturaOrigenId],
      );

      if (rectificativasActivas.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          error:
            "Esta factura ya ha sido rectificada. Debe anular la rectificativa existente antes de crear una nueva.",
        });
      }

      const numeroRectificativa = `${factura.numero_factura}-R${
        rectificativas[0].total + 1
      }`;

      // 🔹 3. NIF emisor y receptor
      let datosReceptorFinal = {};
      let clienteIdParaFactura;
      if (tipoRectificacion === "SUSTITUCION") {
        if (cliente.esNuevo) {
          // El usuario ha creado un cliente nuevo sobre la marcha
          const d = cliente.datos;
          if (cliente.esNuevo) {
            const d = cliente.datos;
            if (!d || !d.nif || !d.nombre) {
              throw new Error(
                "Faltan datos obligatorios para el nuevo cliente",
              );
            }
            // ... resto del insert
          }
          const [resNuevo] = await connection.query(
            `INSERT INTO clientes 
      (usuario_id, nif, nombre, direccion, codigo_postal, ciudad, pais, email, telefono) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              idUsuario,
              d.nif,
              d.nombre,
              d.direccion,
              d.codigo_postal,
              d.ciudad,
              d.pais,
              d.email,
              d.telefono,
            ],
          );

          clienteIdParaFactura = resNuevo.insertId;

          // Preparamos los datos para el XML y PDF con lo que acabamos de insertar
          datosReceptorFinal = { ...d, id: clienteIdParaFactura };
        } else {
          // El usuario ha seleccionado un cliente de la lista
          // Buscamos sus datos actuales en la DB para el XML/PDF
          const [[clienteDB]] = await connection.query(
            `SELECT id, nif, nombre, direccion, codigo_postal, ciudad, pais FROM clientes WHERE id = ? AND usuario_id = ?`,
            [cliente.id, idUsuario],
          );

          if (!clienteDB) throw new Error("El cliente seleccionado no existe");

          clienteIdParaFactura = clienteDB.id;
          datosReceptorFinal = clienteDB;
        }
      } else {
        // CASO POR DIFERENCIAS: Usamos exactamente el mismo cliente de la factura original
        const [[clienteOriginal]] = await connection.query(
          `SELECT id, nif, nombre, direccion, codigo_postal, ciudad, pais FROM clientes WHERE id = ?`,
          [factura.cliente_id],
        );

        clienteIdParaFactura = factura.cliente_id;
        datosReceptorFinal = clienteOriginal;
      }

      // 🔹 Recuperar datos del emisor (se mantiene igual)
      const [[emisor]] = await connection.query(
        `SELECT nif, razon_social, direccion, codigo_postal, ciudad, pais, logo_path FROM datos_fiscales WHERE usuario_id = ?`,
        [idUsuario],
      );

      if (!datosReceptorFinal || !emisor) {
        throw new Error("Datos fiscales del receptor o emisor no encontrados");
      }

      // =====================================================
      // 🔹 4. PROCESAR CONCEPTOS Y AGRUPAR IMPUESTOS
      // =====================================================

      let conceptosProcesados = [];
      let mapaImpuestos = {};
      let cuotaRetenciones = 0;
      let baseConceptos = 0;

      for (const c of conceptos) {
        const cantidad = Number(c.cantidad);
        const precio = Number(c.precioUnitario);
        const tipo = Number(c.tipoImpositivo);

        const base = Number((cantidad * precio).toFixed(2));
        const cuota = Number((base * (tipo / 100)).toFixed(2));

        baseConceptos += base;

        const key = `${c.tipoImpuesto}-${tipo}`;

        if (!mapaImpuestos[key]) {
          mapaImpuestos[key] = {
            tipoImpuesto: c.tipoImpuesto,
            tipoImpositivo: tipo,
            base: 0,
          };
        }

        mapaImpuestos[key].base += base;

        if (c.tipoImpuesto === "IRPF") {
          cuotaRetenciones += Math.abs(cuota);
        }

        conceptosProcesados.push({
          idOriginal: c.idOriginal || null,
          descripcion: c.descripcion,
          cantidad,
          precioUnitario: precio,
          tipoImpuesto: c.tipoImpuesto,
          tipoImpositivo: tipo,
          base,
          cuota,
        });
      }

      // Normalizar bases agrupadas
      Object.values(mapaImpuestos).forEach((imp) => {
        imp.base = Number(imp.base.toFixed(2));
      });

      let impuestosProcesados = [];
      if (tipoRectificacion === "DIFERENCIAS") {
        const lineasRectificativas = [];

        // 🔹 1. Detectar añadidos o modificaciones
        for (const nuevo of conceptosProcesados) {
          const original = conceptosOriginales.find(
            (o) => o.id === nuevo.idOriginal,
          );

          const baseOriginal = original
            ? Number(original.cantidad) * Number(original.precio_unitario)
            : 0;

          const deltaBase = Number((nuevo.base - baseOriginal).toFixed(2));

          if (deltaBase !== 0) {
            const cuotaDelta = Number(
              (deltaBase * (nuevo.tipoImpositivo / 100)).toFixed(2),
            );

            lineasRectificativas.push({
              descripcion: `${nuevo.descripcion} (ajuste)`,
              cantidad: 1,
              precioUnitario: deltaBase,
              tipoImpuesto: nuevo.tipoImpuesto,
              tipoImpositivo: nuevo.tipoImpositivo,
              base: deltaBase,
              cuota: cuotaDelta,
            });
          }
        }

        // 🔹 2. Detectar eliminaciones
        for (const original of conceptosOriginales) {
          const existe = conceptosProcesados.some(
            (n) => n.idOriginal === original.id,
          );

          if (!existe) {
            const baseOriginal =
              Number(original.cantidad) * Number(original.precio_unitario);

            const cuotaOriginal =
              baseOriginal * (Number(original.tipo_impositivo) / 100);

            lineasRectificativas.push({
              descripcion: `${original.descripcion} (eliminado)`,
              cantidad: 1,
              precioUnitario: -baseOriginal,
              tipoImpuesto: original.tipo_impuesto,
              tipoImpositivo: original.tipo_impositivo,
              base: -baseOriginal,
              cuota: -cuotaOriginal,
            });
          }
        }

        // 🔹 Sustituimos conceptosProcesados por los deltas reales
        conceptosProcesados = lineasRectificativas;

        // 🔹 Recalcular impuestosProcesados en base a los deltas de línea
        mapaImpuestos = {};

        for (const c of conceptosProcesados) {
          const key = `${c.tipoImpuesto}-${c.tipoImpositivo}`;

          if (!mapaImpuestos[key]) {
            mapaImpuestos[key] = {
              tipoImpuesto: c.tipoImpuesto,
              tipoImpositivo: c.tipoImpositivo,
              base: 0,
            };
          }

          mapaImpuestos[key].base += c.base;
        }

        impuestosProcesados = Object.values(mapaImpuestos).map((imp) => ({
          tipoImpuesto: imp.tipoImpuesto,
          tipoImpositivo: imp.tipoImpositivo,
          base: Number(imp.base.toFixed(2)),
        }));
      } else {
        // SUSTITUCION → usamos directamente los nuevos agrupados
        impuestosProcesados = Object.values(mapaImpuestos);
      }
      /* if (tipoRectificacion === "DIFERENCIAS") {
        const nuevos = Object.values(mapaImpuestos);

        // Comparar contra originales
        for (const impNuevo of nuevos) {
          const original = impuestosOriginales.find(
            (impOrig) =>
              impOrig.tipo_impuesto === impNuevo.tipoImpuesto &&
              Number(impOrig.tipo_impositivo) ===
                Number(impNuevo.tipoImpositivo),
          );

          const baseOriginal = original ? Number(original.base_imponible) : 0;

          const deltaBase = Number((impNuevo.base - baseOriginal).toFixed(2));

          if (deltaBase !== 0) {
            impuestosProcesados.push({
              tipoImpuesto: impNuevo.tipoImpuesto,
              tipoImpositivo: impNuevo.tipoImpositivo,
              base: deltaBase,
            });
          }
        }

        // Detectar impuestos eliminados
        for (const impOrig of impuestosOriginales) {
          const existe = nuevos.some(
            (impNuevo) =>
              impNuevo.tipoImpuesto === impOrig.tipo_impuesto &&
              Number(impNuevo.tipoImpositivo) ===
                Number(impOrig.tipo_impositivo),
          );

          if (!existe) {
            impuestosProcesados.push({
              tipoImpuesto: impOrig.tipo_impuesto,
              tipoImpositivo: impOrig.tipo_impositivo,
              base: -Number(impOrig.base_imponible),
            });
          }
        }
      }*/

      // 🔹 Totales finales
      let baseRectificativa = 0;
      let cuotaRectificativa = 0;

      for (const imp of impuestosProcesados) {
        baseRectificativa += imp.base;

        const cuota =
          imp.tipoImpuesto === "IRPF"
            ? -Math.abs(imp.base * (imp.tipoImpositivo / 100))
            : imp.base * (imp.tipoImpositivo / 100);

        cuotaRectificativa += cuota;
      }

      const importeTotal = Number(
        (baseRectificativa + cuotaRectificativa).toFixed(2),
      );

      let cuotaIVA = 0;

      for (const imp of impuestosProcesados) {
        if (imp.tipoImpuesto === "IVA") {
          cuotaIVA += imp.base * (imp.tipoImpositivo / 100);
        }
      }

      cuotaIVA = Number(cuotaIVA.toFixed(2));

      // 🔹 5. Cadena facturación (LOCK)
      const [ultimoRegistro] = await connection.query(
        `
      SELECT hash_registro_actual, num_registro
      FROM registros_facturacion
      WHERE usuario_id = ?
      ORDER BY num_registro DESC
      LIMIT 1
      FOR UPDATE
      `,
        [idUsuario],
      );

      const numRegistroAnterior =
        ultimoRegistro.length > 0 ? ultimoRegistro[0].num_registro : 0;

      const numRegistroActual = numRegistroAnterior + 1;

      const hashAnterior =
        ultimoRegistro.length > 0
          ? ultimoRegistro[0].hash_registro_actual
          : HASH_GENESIS;

      // 🔹 6. SIF (propio o global)
      let sif;

      const [propio] = await connection.query(
        `
      SELECT id, nombre, nif, version, fecha_declaracion_responsable
      FROM sif_configuracion
      WHERE usuario_id = ? AND activo = 1
      LIMIT 1
      `,
        [idUsuario],
      );

      if (propio.length) {
        sif = propio[0];
      } else {
        const [global] = await connection.query(
          `
        SELECT id, nombre, nif, version, fecha_declaracion_responsable
        FROM sif_configuracion
        WHERE es_global = 1
        LIMIT 1
        `,
        );

        if (!global.length) {
          throw new Error("No hay SIF configurado en el sistema");
        }

        sif = global[0];
      }

      // 🔹 7. Fecha consistente (sin milisegundos)
      const fechaNormalizada = new Date(fechaExpedicion).toISOString();

      const fechaOriginal = new Date(factura.fecha_expedicion).toISOString();

      const fechaGeneracion = new Date().toISOString();

      // 🔹 8. Hash
      const hashActual = generarHashRegistro({
        sifId: sif.nombre,
        nifEmisor: emisor.nif,
        numeroFacturaCompleto: numeroRectificativa,
        fechaHoraEmision: fechaNormalizada,
        importeTotal,
        numRegistroAnterior,
        numRegistroActual,
        hashAnterior,
      });

      // 🔹 9. Construcción XML
      const datosRectificativa = {
        cabecera: {
          tipoRegistro: "RECTIFICATIVA",
          nifEmisor: emisor.nif,
          nifReceptor: datosReceptorFinal.nif,
          versionSIF: sif.version,
        },
        datosFacturaRectificativa: {
          numeroFactura: numeroRectificativa,
          fechaHoraExpedicion: fechaNormalizada,
          tipoRectificacion,
          importeTotal,
        },
        referenciaFacturaOriginal: {
          numeroFacturaOriginal: factura.numero_factura,
          fechaHoraExpedicionOriginal: fechaOriginal,
          hashRegistroFacturaOriginal: factura.hash_registro_actual,
        },
        desgloseFiscal: {
          impuestos: impuestosProcesados.map((imp) => ({
            base: imp.base,
            tipoImpositivo: imp.tipoImpositivo,
            cuota:
              imp.tipoImpuesto === "IRPF"
                ? -Math.abs(imp.base * (imp.tipoImpositivo / 100))
                : imp.base * (imp.tipoImpositivo / 100),
            tipoImpuesto: imp.tipoImpuesto,
          })),
        },
        trazabilidad: {
          numRegAnt: numRegistroAnterior,
          numRegAct: numRegistroActual,
          hashAnterior,
          hashPropio: hashActual,
          identificacionSIF: {
            idSw: sif.nombre,
            nifDev: sif.nif,
            fechaDeclaracionResponsable: new Date(
              sif.fecha_declaracion_responsable,
            ).toISOString(),
          },
        },
      };

      const xml = generarFacturaRectificativaXML(datosRectificativa);

      const resultado = validarFacturaRectificativaXSD(xml);
      if (!resultado.esValido) {
        await connection.rollback();
        return res.status(400).json({
          mensaje: "XML inválido",
          errores: resultado.errores,
        });
      }

      // 🔹 10. Insertar registro facturación
      const [registroResult] = await connection.query(
        `
      INSERT INTO registros_facturacion
      (
        usuario_id,
        fecha_hora_generacion,
        contenido_registro,
        hash_registro_anterior,
        hash_registro_actual,
        estado,
        num_registro,
        sif_config_id
      )
      VALUES (?, ?, ?, ?, ?, 'RECTIFICATIVA', ?, ?)
      `,
        [
          idUsuario,
          fechaGeneracion,
          xml,
          hashAnterior,
          hashActual,
          numRegistroActual,
          sif.id,
        ],
      );

      const idRegistro = registroResult.insertId;

      // 🔹 11. Insertar factura rectificativa
      const [facturaResult] = await connection.query(
        `
      INSERT INTO facturas
      (usuario_id, registro_id, numero_factura, fecha_expedicion, tipo_factura, importe_total, factura_origen_id, tipo_rectificacion, cliente_id)
      VALUES (?, ?, ?, ?, 'RECTIFICATIVA', ?, ?, ?, ?)
      `,
        [
          idUsuario,
          idRegistro,
          numeroRectificativa,
          fechaNormalizada,
          importeTotal,
          facturaOrigenId,
          tipoRectificacion,
          clienteIdParaFactura,
        ],
      );

      const facturaId = facturaResult.insertId;
      if (tipoRectificacion === "SUSTITUCION") {
        await connection.query(
          `UPDATE facturas
     SET estado = 'ANULADA'
     WHERE id = ? AND usuario_id = ?
    `,
          [facturaOrigenId, idUsuario],
        );
      }

      for (const imp of impuestosProcesados) {
        const base = Number(imp.base);
        const tipo = Number(imp.tipoImpositivo);
        const cuota = base * (tipo / 100);

        await connection.query(
          `
        INSERT INTO factura_impuestos
        (factura_id, base_imponible, tipo_impositivo, cuota, tipo_impuesto)
        VALUES (?, ?, ?, ?, ?)
        `,
          [facturaId, base, tipo, cuota, imp.tipoImpuesto],
        );
      }

      // 🔹 Insertar conceptos

      for (const c of conceptosProcesados) {
        await connection.query(
          `
    INSERT INTO factura_conceptos
    (factura_id, descripcion, cantidad, precio_unitario, base, tipo_impositivo, cuota, tipo_impuesto)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
          [
            facturaId,
            c.descripcion,
            c.cantidad,
            c.precioUnitario,
            c.base,
            c.tipoImpositivo,
            c.cuota,
            c.tipoImpuesto,
          ],
        );
      }

      // ==========================
      // STORAGE RECTIFICATIVA
      // ==========================
      const baseDir = path.join(
        process.cwd(),
        "storage",
        "usuarios",
        String(idUsuario),
        "facturas",
        String(facturaId),
      );

      fs.mkdirSync(baseDir, { recursive: true });

      // 🔹 Guardar XML
      const rutaXML = path.join(baseDir, "factura_rectificativa.xml");
      fs.writeFileSync(rutaXML, xml, "utf8");

      await connection.query(
        `UPDATE facturas SET xml_generado_path = ? WHERE id = ?`,
        [rutaXML, facturaId],
      );

      // 🔹 Generar QR
      const baseUrl =
        "https://www2.agenciatributaria.gob.es/wlpl/AVAC-HACI/VerificaFactura";
      const qrData =
        `${baseUrl}` +
        `?nif=${emisor.nif}` +
        `&num=${numeroRectificativa}` +
        `&fecha=${fechaNormalizada}` +
        `&cuotaIVA=${cuotaIVA.toFixed(2)}` +
        `&importe=${importeTotal.toFixed(2)}` +
        `&hashPropio=${hashActual}`;

      // 🔹 Obtener logo y datos completos emisor
      const [[datosEmisorCompletos]] = await connection.query(
        `SELECT nif, razon_social, direccion, codigo_postal, ciudad, pais, logo_path
   FROM datos_fiscales WHERE usuario_id = ?`,
        [idUsuario],
      );

      let logoPath = null;

      if (datosEmisorCompletos.logo_path) {
        const posibleRuta = path.resolve(
          process.cwd(),
          datosEmisorCompletos.logo_path,
        );

        if (fs.existsSync(posibleRuta)) {
          logoPath = posibleRuta;
        }
      }

      // 🔹 Obtener datos completos receptor
      const [[datosReceptor]] = await connection.query(
        `SELECT nif, nombre, direccion, codigo_postal, ciudad, pais
   FROM clientes WHERE id = ?`,
        [clienteIdParaFactura],
      );
      /*let conceptosParaPDF = [];

      if (tipoRectificacion === "DIFERENCIAS") {
        conceptosParaPDF = conceptosProcesados.map((c) => ({
          descripcion: `${c.descripcion} (ajuste)`,
          cantidad: c.cantidad,
          precioUnitario: c.precioUnitario,
          tipoImpositivo: c.tipoImpositivo,
          tipoImpuesto: c.tipoImpuesto,
        }));
      } else {
        // En SUSTITUCIÓN, enviamos todos los conceptos nuevos (la factura completa)
        conceptosParaPDF = conceptosProcesados;
      }*/

      // 🔹 Preparar impuestos para PDF
      const impuestosPDF = impuestosProcesados.map((imp) => {
        const base = Number(imp.base);
        const tipo = Number(imp.tipoImpositivo);
        const cuota = base * (tipo / 100);

        return {
          baseImponible: base,
          tipoImpositivo: tipo,
          cuota,
          tipoImpuesto: imp.tipoImpuesto,
        };
      });

      await procesarPDF({
        pdf,
        baseDir,
        facturaId,
        connection,
        qrData,
        hashActual,
        generarPDFManual: async () => {
          return await generarFacturaAltaPDF({
            tipoDocumento: "RECTIFICATIVA",
            cabecera: {
              logoPath,
              emisor,
              receptor,
            },
            datosFactura: {
              numeroFactura: numeroRectificativa,
              fechaExpedicion: fechaNormalizada,
              tipoRectificacion,
              importeTotal,
            },
            conceptos: conceptosProcesados,
            desgloseFiscal: { impuestos: impuestosPDF },
            trazabilidad: datosFacturaXML.trazabilidad,
            qrData,
          });
        },
      });

      await connection.commit();

      // 🔹 Registrar evento fuera de la transacción
      await registrarEvento(
        idUsuario,
        "FACTURA_RECTIFICADA",
        `Factura ${numeroRectificativa} rectificada`,
      );

      return res.status(201).json({
        mensaje: "Factura rectificativa creada correctamente",
      });
    } catch (e) {
      await connection.rollback();
      console.error("ERROR EN TRANSACCIÓN RECTIFICATIVA:", e);
      return res.status(500).json({
        error: "Error guardando la factura rectificativa",
        detalle: e.message,
      });
    } finally {
      connection.release();
    }
  },
);

app.post(
  "/api/facturas/:id/anulacion",
  auth,
  checkMantenimiento,
  verificarDatosFiscales,
  //comprobarSuscripcion,
  async (req, res) => {
    const facturaOrigenId = req.params.id;
    const usuarioId = req.usuario.id;

    const connection = await pool.getConnection();

    try {
      const { motivo } = req.body;

      if (!motivo) {
        return res.status(400).json({
          error: "El motivo es obligatorio para la anulación",
        });
      }

      await connection.beginTransaction();

      // 🔹 1. Cargar factura original
      const [facturas] = await connection.query(
        `
      SELECT 
        f.numero_factura,
        f.fecha_expedicion,
        f.importe_total,
        r.hash_registro_actual
      FROM facturas f
      JOIN registros_facturacion r ON r.id = f.registro_id
      WHERE f.id = ? AND f.usuario_id = ?
      `,
        [facturaOrigenId, usuarioId],
      );

      if (!facturas.length) {
        await connection.rollback();
        return res.status(404).json({ error: "Factura no encontrada" });
      }

      const factura = facturas[0];

      // 🔹 2. Comprobar que no esté ya anulada
      const [estadoActual] = await connection.query(
        `SELECT estado FROM facturas WHERE id = ?`,
        [facturaOrigenId],
      );

      if (estadoActual[0].estado === "ANULADA") {
        await connection.rollback();
        return res.status(400).json({
          error: "La factura ya está anulada",
        });
      }

      // 🔹 3. NIF emisor
      const [[emisor]] = await connection.query(
        `SELECT nif FROM datos_fiscales WHERE usuario_id = ?`,
        [usuarioId],
      );

      if (!emisor) {
        throw new Error("No existen datos fiscales del usuario");
      }

      // 🔹 4. SIF activo
      const [[sif]] = await connection.query(
        `
      SELECT id, nombre, nif, version, fecha_declaracion_responsable
      FROM sif_configuracion
      WHERE usuario_id = ? AND activo = 1 OR es_global = 1
      LIMIT 1
      `,
        [usuarioId],
      );

      if (!sif) {
        throw new Error("No hay SIF activo configurado");
      }

      // 🔹 5. Cadena de registros (LOCK)
      const [ultimoRegistro] = await connection.query(
        `
      SELECT hash_registro_actual, num_registro
      FROM registros_facturacion
      WHERE usuario_id = ?
      ORDER BY num_registro DESC
      LIMIT 1
      FOR UPDATE
      `,
        [usuarioId],
      );

      const numRegistroAnterior =
        ultimoRegistro.length > 0 ? ultimoRegistro[0].num_registro : 0;

      const numRegistroActual = numRegistroAnterior + 1;

      const hashAnterior =
        ultimoRegistro.length > 0
          ? ultimoRegistro[0].hash_registro_actual
          : HASH_GENESIS;

      // 🔹 6. Fecha normalizada
      const ahora = new Date().toISOString();
      const fechaOriginal = new Date(factura.fecha_expedicion).toISOString();

      // 🔹 7. Generar hash
      const hashActual = generarHashRegistro({
        sifId: sif.nombre,
        nifEmisor: emisor.nif,
        numeroFacturaCompleto: factura.numero_factura,
        fechaHoraEmision: ahora,
        importeTotal: 0,
        numRegistroAnterior,
        numRegistroActual,
        hashAnterior,
      });

      // 🔹 8. Generar XML de anulación
      const xml = generarFacturaAnulacionXML({
        cabecera: {
          nifEmisor: emisor.nif,
          versionSIF: sif.version,
          fhAn: ahora,
        },
        refAn: {
          numeroFacturaOr: factura.numero_factura,
          fechaHoraExpedicionOr: fechaOriginal,
          hashAnulado: factura.hash_registro_actual,
          motivo,
        },
        tr: {
          numRegAnt: numRegistroAnterior,
          numRegAct: numRegistroActual,
          hashAnterior,
          hashPropio: hashActual,
          sif: {
            idSw: sif.nombre,
            nifDev: sif.nif,
            fechaDeclaracionResponsable: new Date(
              sif.fecha_declaracion_responsable,
            ).toISOString(),
          },
        },
      });

      // 🔹 9. Insertar solo registro de facturación
      await connection.query(
        `
      INSERT INTO registros_facturacion
      (
        usuario_id,
        fecha_hora_generacion,
        contenido_registro,
        hash_registro_anterior,
        hash_registro_actual,
        estado,
        num_registro,
        sif_config_id
      )
      VALUES (?, ?, ?, ?, ?, 'ANULACION', ?, ?)
      `,
        [
          usuarioId,
          ahora,
          xml,
          hashAnterior,
          hashActual,
          numRegistroActual,
          sif.id,
        ],
      );

      // 🔹 10. Marcar factura como anulada
      await connection.query(
        `
      UPDATE facturas
      SET estado = 'ANULADA'
      WHERE id = ?
      `,
        [facturaOrigenId],
      );

      const baseDir = path.join(
        process.cwd(),
        "storage",
        "usuarios",
        String(usuarioId),
        "facturas",
        String(facturaOrigenId),
      );

      fs.mkdirSync(baseDir, { recursive: true });

      const rutaXMLAnulacion = path.join(baseDir, "anulacion.xml");

      fs.writeFileSync(rutaXMLAnulacion, xml, "utf8");

      await connection.commit();

      await registrarEvento(
        usuarioId,
        "FACTURA_ANULADA",
        `Factura ${factura.numero_factura} anulada`,
      );

      res.status(201).json({
        mensaje: "Anulación registrada correctamente",
      });
    } catch (error) {
      await connection.rollback();
      console.error("ERROR ANULACIÓN:", error);
      res.status(500).json({
        error: error.message || "Error registrando anulación",
      });
    } finally {
      connection.release();
    }
  },
);

app.get("/api/facturas/:id/rectificativas", auth, async (req, res) => {
  const facturaOrigenId = req.params.id;
  const usuarioId = req.usuario.id;

  try {
    // Comprobar que la factura original existe
    const [original] = await pool.query(
      `
      SELECT id
      FROM facturas
      WHERE id = ?
        AND usuario_id = ?
        AND tipo_factura = 'ORIGINAL'
      `,
      [facturaOrigenId, usuarioId],
    );

    if (original.length === 0) {
      return res.status(404).json({
        mensaje: "Factura original no encontrada",
      });
    }

    // Obtener rectificativas asociadas
    const [rectificativas] = await pool.query(
      `
      SELECT
        id,
        numero_factura,
        fecha_expedicion,
        tipo_rectificacion,
        cuota_total,
        importe_total,
        estado
      FROM facturas
      WHERE factura_origen_id = ?
        AND usuario_id = ?
      ORDER BY fecha_expedicion ASC
      `,
      [facturaOrigenId, usuarioId],
    );

    return res.json({
      facturaOrigenId,
      rectificativas,
    });
  } catch (error) {
    console.error("Error obteniendo rectificativas:", error);
    return res.status(500).json({
      mensaje: "Error obteniendo rectificativas",
    });
  }
});

app.get("/api/facturas/:id/pdf-original", auth, async (req, res) => {
  const usuarioId = req.usuario.id;
  const facturaId = req.params.id;

  const [rows] = await pool.query(
    `
    SELECT ruta_pdf, numero_factura
    FROM facturas
    WHERE id = ? AND usuario_id = ?
    `,
    [facturaId, usuarioId],
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "No existe el PDF" });
  }

  const rutaPDF = rows[0].ruta_pdf;

  if (!rutaPDF) {
    return res
      .status(404)
      .json({ error: "Esta factura no tiene PDF original" });
  }

  // 🧠 Soporta rutas antiguas y nuevas
  const rutaAbsoluta = path.isAbsolute(rutaPDF)
    ? rutaPDF
    : path.join(process.cwd(), rutaPDF);

  if (!fs.existsSync(rutaAbsoluta)) {
    return res.status(404).json({
      error: "El archivo original no se encuentra en el sistema",
    });
  }

  // 🧾 Log de evento
  await registrarEvento(
    usuarioId,
    "DESCARGA_PDF_ORIGINAL",
    `Descarga de documento PDF original de la factura número ${rows[0].numero_factura}`,
  );

  res.sendFile(path.resolve(rutaAbsoluta));
});

app.get("/api/facturas/:id/pdf", auth, async (req, res) => {
  try {
    const facturaId = req.params.id;
    const usuarioId = req.usuario.id;

    const [rows] = await pool.query(
      `
      SELECT numero_factura
      FROM facturas
      WHERE id = ? AND usuario_id = ?
      `,
      [facturaId, usuarioId],
    );

    if (!rows.length) {
      return res.status(404).json({ mensaje: "Factura no encontrada" });
    }

    const numeroFactura = rows[0].numero_factura;

    const baseDir = path.join(
      process.cwd(),
      "storage",
      "usuarios",
      String(usuarioId),
      "facturas",
      String(facturaId),
    );

    const rutaSellado = path.join(baseDir, "sellado.pdf");
    const rutaRectificativa = path.join(baseDir, "sellado_rectificativa.pdf");

    let rutaFinal = null;

    if (fs.existsSync(rutaSellado)) {
      rutaFinal = rutaSellado;
    } else if (fs.existsSync(rutaRectificativa)) {
      rutaFinal = rutaRectificativa;
    }
    if (!rutaFinal) {
      return res.status(404).json({
        mensaje: "No existe PDF sellado para esta factura",
      });
    }

    await registrarEvento(
      usuarioId,
      "DESCARGA_PDF",
      `Descarga de PDF sellado de la factura ${numeroFactura}`,
    );

    return res.sendFile(path.resolve(rutaFinal));
  } catch (error) {
    console.error("Error obteniendo PDF:", error);
    return res.status(500).json({
      mensaje: "Error obteniendo PDF",
    });
  }
});

app.get("/api/facturas/:id/xml", auth, async (req, res) => {
  try {
    const facturaId = req.params.id;
    const usuarioId = req.usuario.id;
    const tipo = req.query.tipo; // undefined | "anulacion"

    // 1️⃣ Comprobar que existe y pertenece al usuario
    const [rows] = await pool.query(
      `
      SELECT numero_factura, tipo_factura
      FROM facturas
      WHERE id = ? AND usuario_id = ?
      `,
      [facturaId, usuarioId],
    );

    if (!rows.length) {
      return res.status(404).json({ mensaje: "Factura no encontrada" });
    }

    const { numero_factura, tipo_factura } = rows[0];

    // 2️⃣ Ruta base
    const baseDir = path.join(
      process.cwd(),
      "storage",
      "usuarios",
      String(usuarioId),
      "facturas",
      String(facturaId),
    );

    // 3️⃣ Determinar nombre archivo
    let nombreArchivo = "factura.xml";

    if (tipo === "anulacion") {
      nombreArchivo = "anulacion.xml";
    } else if (tipo_factura === "RECTIFICATIVA") {
      nombreArchivo = "factura_rectificativa.xml";
    }

    const rutaXML = path.join(baseDir, nombreArchivo);

    // 4️⃣ Comprobar existencia
    if (!fs.existsSync(rutaXML)) {
      return res.status(404).json({
        mensaje: "XML no encontrado",
      });
    }

    // 5️⃣ Registrar evento
    await registrarEvento(
      usuarioId,
      "DESCARGA_XML",
      `Descarga XML (${tipo || tipo_factura}) factura ${numero_factura}`,
    );

    // 6️⃣ Enviar archivo
    res.setHeader("Content-Type", "application/xml");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${nombreArchivo}`,
    );

    return res.sendFile(path.resolve(rutaXML));
  } catch (error) {
    console.error("Error descargando XML:", error);
    return res.status(500).json({ mensaje: "Error descargando XML" });
  }
});

app.get("/api/facturas/:id", auth, async (req, res) => {
  try {
    const facturaId = req.params.id;
    const usuarioId = req.usuario.id;

    const [facturas] = await pool.query(
      `
      SELECT 
        f.*,
        r.contenido_registro AS registro,
        r.invalido AS registro_invalido,
        r.estado AS tipo_registro,
        c.id AS cliente_id,
        c.nif AS cliente_nif,
        c.nombre AS cliente_nombre,
        c.direccion AS cliente_direccion
      FROM facturas f
      LEFT JOIN registros_facturacion r 
        ON r.id = f.registro_id
       AND r.invalido = 0
      LEFT JOIN clientes c 
        ON c.id = f.cliente_id
      WHERE f.id = ? 
        AND f.usuario_id = ?
      `,
      [facturaId, usuarioId],
    );

    if (facturas.length === 0) {
      return res.status(404).json({
        mensaje: "Factura no encontrada",
      });
    }

    const factura = facturas[0];

    // ==========================
    // IMPUESTOS
    // ==========================
    const [impuestos] = await pool.query(
      `
      SELECT * FROM factura_impuestos
      WHERE factura_id = ?
      `,
      [facturaId],
    );

    // ==========================
    // CONCEPTOS (🔥 AÑADIDO)
    // ==========================
    const [conceptos] = await pool.query(
      `
      SELECT 
        id,
        descripcion,
        cantidad,
        precio_unitario,
        base,
        tipo_impositivo,
        cuota,
        tipo_impuesto
      FROM factura_conceptos
      WHERE factura_id = ?
      ORDER BY id ASC
      `,
      [facturaId],
    );

    // ==========================
    // RECTIFICACIONES
    // ==========================
    const [rectificaciones] = await pool.query(
      `
      SELECT 
        f.id, 
        f.numero_factura, 
        f.fecha_expedicion, 
        f.importe_total, 
        f.tipo_rectificacion, 
        f.estado,
        r.contenido_registro AS rregistro
      FROM facturas f
      JOIN registros_facturacion r ON r.id = f.registro_id
      WHERE f.factura_origen_id = ?
        AND r.invalido = 0
      ORDER BY f.fecha_expedicion ASC
      `,
      [facturaId],
    );

    const rutaAnulacion = path.join(
      process.cwd(),
      "storage",
      "usuarios",
      String(usuarioId),
      "facturas",
      String(facturaId),
      "anulacion.xml",
    );

    const tieneXmlAnulacion = fs.existsSync(rutaAnulacion);

    return res.json({
      ...factura,
      impuestos,
      conceptos, // 🔥 ahora el front puede precargar líneas
      rectificaciones,
      tieneXmlAnulacion,
      estadoReal: factura.estado,
      cliente: {
        id: factura.cliente_id,
        nif: factura.cliente_nif,
        nombre: factura.cliente_nombre,
        direccion: factura.cliente_direccion,
      },
    });
  } catch (error) {
    console.error("ERROR GET FACTURA:", error);
    return res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
});

app.get("/api/facturas", auth, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const {
      fechaInicio,
      fechaFin,
      q,
      orden,
      cliente,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const params = [usuarioId];

    let sql = `
  SELECT
    f.id,
    f.numero_factura,
    f.fecha_expedicion,
    f.tipo_factura,
    f.importe_total,
    f.estado,
    c.nif AS cliente_nif,
    c.nombre AS cliente_nombre
  FROM facturas f
  JOIN registros_facturacion rf
    ON rf.id = f.registro_id
   AND rf.invalido = 0
  LEFT JOIN clientes c ON c.id = f.cliente_id
  WHERE f.usuario_id = ?
`;

    if (fechaInicio && fechaFin) {
      sql += ` AND f.fecha_expedicion BETWEEN ? AND ?`;
      params.push(fechaInicio, fechaFin);
    } else if (fechaInicio) {
      sql += ` AND f.fecha_expedicion >= ?`;
      params.push(fechaInicio);
    } else if (fechaFin) {
      sql += ` AND f.fecha_expedicion <= ?`;
      params.push(fechaFin);
    }

    if (cliente) {
      sql += ` AND f.cliente_id = ?`;
      params.push(cliente);
    }

    if (q) {
      sql += `
        AND (
          f.numero_factura LIKE ?
          OR c.nif LIKE ?
          OR c.nombre LIKE ?
          OR f.tipo_factura LIKE ?
          OR CAST(f.importe_total AS CHAR) LIKE ?
          OR f.estado LIKE ?
          OR EXISTS (
            SELECT 1
            FROM factura_conceptos fc
            WHERE fc.factura_id = f.id
            AND fc.descripcion LIKE ?
          )
        )
      `;
      const like = `%${q}%`;
      params.push(like, like, like, like, like, like, like);
    }

    const ordenSQL = orden === "asc" ? "ASC" : "DESC";

    sql += ` ORDER BY f.fecha_expedicion ${ordenSQL}`;
    sql += ` LIMIT ? OFFSET ?`;

    params.push(limitNum, offset);

    const [rows] = await pool.query(sql, params);

    // contar total para la paginación
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM facturas WHERE usuario_id = ?`,
      [usuarioId],
    );

    res.json({
      facturas: rows,
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    console.error("Error listando facturas:", error);
    res.status(500).json({
      mensaje: "Error obteniendo facturas",
    });
  }
});

app.put("/api/clientes/:id", auth, checkMantenimiento, async (req, res) => {
  const usuarioId = req.usuario.id;
  const clienteId = req.params.id;
  const { nombre, direccion, codigo_postal, ciudad, pais, email, telefono } =
    req.body;

  await pool.query(
    `
    UPDATE clientes
    SET nombre = ?, direccion = ?, codigo_postal = ?, ciudad = ?, pais = ?, email = ?, telefono = ?
    WHERE id = ? AND usuario_id = ?
    `,
    [
      nombre,
      direccion,
      codigo_postal,
      ciudad,
      pais,
      email,
      telefono,
      clienteId,
      usuarioId,
    ],
  );

  res.json({ ok: true });
});

app.get("/api/clientes/buscar", auth, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { q = "" } = req.query;

    const like = `%${q}%`;

    const [rows] = await pool.query(
      `
      SELECT id, nombre, nif
      FROM clientes
      WHERE usuario_id = ?
      AND (
        nombre LIKE ?
        OR nif LIKE ?
      )
      ORDER BY nombre
      LIMIT 20
      `,
      [usuarioId, like, like],
    );

    res.json({ clientes: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error buscando clientes" });
  }
});

app.get("/api/clientes", auth, async (req, res) => {
  const usuarioId = req.usuario.id;

  const [rows] = await pool.query(
    `
    SELECT id, nif, nombre, direccion, codigo_postal, ciudad, pais, email, telefono
    FROM clientes
    WHERE usuario_id = ?
    ORDER BY nombre ASC
    `,
    [usuarioId],
  );

  res.json({ clientes: rows });
});

app.post("/api/clientes", auth, checkMantenimiento, async (req, res) => {
  const { nif, nombre, direccion, email } = req.body;
  const usuarioId = req.usuario.id;

  if (!nif) return res.status(400).json({ error: "NIF obligatorio" });

  const [existente] = await pool.query(
    `SELECT id FROM clientes WHERE usuario_id = ? AND nif = ?`,
    [usuarioId, nif],
  );

  if (existente.length) {
    return res.json({ id: existente[0].id, reutilizado: true });
  }

  const [result] = await pool.query(
    `INSERT INTO clientes (usuario_id, nif, nombre, direccion, email)
     VALUES (?, ?, ?, ?, ?)`,
    [usuarioId, nif, nombre || null, direccion || null, email || null],
  );

  res.json({ id: result.insertId, creado: true });
});

app.patch(
  "/api/admin/usuarios/:id/estado",
  auth,
  requireAdmin,
  async (req, res) => {
    try {
      const adminId = req.usuario.id;
      const usuarioId = req.params.id;
      const { activo } = req.body;

      if (typeof activo !== "boolean") {
        return res.status(400).json({
          mensaje: "Debe indicarse activo: true o false",
        });
      }

      // 1️⃣ Comprobar que el usuario existe
      const [usuarios] = await pool.query(
        "SELECT id, rol, activo FROM usuarios WHERE id = ?",
        [usuarioId],
      );

      if (!usuarios.length) {
        return res.status(404).json({
          mensaje: "Usuario no encontrado",
        });
      }

      const usuarioObjetivo = usuarios[0];

      // 2️⃣ No permitir que un admin se desactive a sí mismo
      if (adminId == usuarioId && activo === false) {
        return res.status(400).json({
          mensaje: "No puedes desactivarte a ti mismo",
        });
      }

      // 3️⃣ Si es admin y se intenta desactivar → comprobar que no sea el último
      if (usuarioObjetivo.rol === "ADMIN" && activo === false) {
        const [adminsActivos] = await pool.query(
          "SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'ADMIN' AND activo = 1",
        );

        if (adminsActivos[0].total <= 1) {
          return res.status(400).json({
            mensaje: "No se puede desactivar el último administrador activo",
          });
        }
      }

      // 4️⃣ Actualizar estado
      await pool.query("UPDATE usuarios SET activo = ? WHERE id = ?", [
        activo ? 1 : 0,
        usuarioId,
      ]);

      // 5️⃣ Registrar auditoría
      await registrarEvento(
        adminId,
        "ADMIN_CAMBIO_ESTADO_USUARIO",
        `Usuario ${usuarioId} cambiado a estado ${activo ? "ACTIVO" : "INACTIVO"}`,
      );

      return res.json({
        mensaje: "Estado actualizado correctamente",
      });
    } catch (error) {
      console.error("Error cambiando estado usuario:", error);
      return res.status(500).json({
        mensaje: "Error interno del servidor",
      });
    }
  },
);

app.patch(
  "/api/admin/usuarios/:id/reset-2fa",
  auth,
  requireAdmin,
  async (req, res) => {
    try {
      const adminId = req.usuario.id;
      const usuarioId = req.params.id;

      // 1️⃣ Comprobar que existe
      const [usuarios] = await pool.query(
        "SELECT id, twofa_enabled FROM usuarios WHERE id = ?",
        [usuarioId],
      );

      if (!usuarios.length) {
        return res.status(404).json({
          mensaje: "Usuario no encontrado",
        });
      }

      // 2️⃣ No permitir que el admin se resetee a sí mismo
      if (adminId === usuarioId) {
        return res.status(400).json({
          mensaje: "No puedes resetear tu propio 2FA desde este endpoint",
        });
      }

      // 3️⃣ Si ya está desactivado
      if (!usuarios[0].twofa_enabled) {
        return res.status(400).json({
          mensaje: "El usuario no tiene 2FA activo",
        });
      }

      // 4️⃣ Reset real
      await pool.query(
        `
        UPDATE usuarios
        SET twofa_enabled = 0,
            twofa_secret = NULL
        WHERE id = ?
        `,
        [usuarioId],
      );

      // 5️⃣ Auditoría
      await registrarEvento(
        adminId,
        "ADMIN_RESET_2FA",
        `Reset de 2FA ejecutado sobre usuario ${usuarioId}`,
      );

      await registrarEvento(
        usuarioId,
        "2FA_RESET_BY_ADMIN",
        `El administrador ${adminId} ha reseteado tu 2FA`,
      );

      return res.json({
        mensaje: "2FA reseteado correctamente",
      });
    } catch (error) {
      console.error("Error reseteando 2FA:", error);
      return res.status(500).json({
        mensaje: "Error interno del servidor",
      });
    }
  },
);

app.get("/api/productos", auth, async (req, res) => {
  const usuarioId = req.usuario.id;

  const [rows] = await pool.query(
    `
    SELECT id, nombre, descripcion, precio, tipo_iva
    FROM productos
    WHERE usuario_id = ?
    ORDER BY nombre ASC
    `,
    [usuarioId],
  );

  res.json({ productos: rows });
});

app.post("/api/productos", auth, checkMantenimiento, async (req, res) => {
  const usuarioId = req.usuario.id;
  const { nombre, descripcion, precio, tipo_iva } = req.body;

  if (!nombre || !precio) {
    return res.status(400).json({ error: "Nombre y precio obligatorios" });
  }

  const [result] = await pool.query(
    `
    INSERT INTO productos (usuario_id, nombre, descripcion, precio, tipo_iva)
    VALUES (?, ?, ?, ?, ?)
    `,
    [usuarioId, nombre, descripcion || null, precio, tipo_iva || 21],
  );

  res.json({ id: result.insertId });
});

app.put("/api/productos/:id", auth, checkMantenimiento, async (req, res) => {
  const usuarioId = req.usuario.id;
  const productoId = req.params.id;

  const { nombre, descripcion, precio, tipo_iva } = req.body;

  await pool.query(
    `
    UPDATE productos
    SET nombre = ?, descripcion = ?, precio = ?, tipo_iva = ?
    WHERE id = ? AND usuario_id = ?
    `,
    [nombre, descripcion, precio, tipo_iva, productoId, usuarioId],
  );

  res.json({ ok: true });
});

app.get("/api/productos/buscar", auth, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { q = "" } = req.query;

    const like = `%${q}%`;

    const [rows] = await pool.query(
      `
      SELECT id, nombre, precio, tipo_iva, unidad
      FROM productos
      WHERE usuario_id = ?
      AND nombre LIKE ?
      ORDER BY nombre
      LIMIT 20
      `,
      [usuarioId, like],
    );

    res.json({ productos: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error buscando productos" });
  }
});

app.get("/api/admin/usuarios", auth, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
        SELECT 
          u.id,
          u.nombre,
          u.email,
          u.activo,
          u.twofa_enabled,
          COUNT(DISTINCT f.id) AS total_facturas,
          MAX(CASE 
             WHEN l.tipo_evento IN ('LOGIN_OK','LOGIN_2FA_OK') 
             THEN l.fecha_evento 
          END) AS ultimo_login
        FROM usuarios u
        LEFT JOIN facturas f 
          ON f.usuario_id = u.id
        LEFT JOIN log_eventos l
          ON l.usuario_id = u.id
        GROUP BY u.id
        ORDER BY u.id ASC
      `);

    return res.json({ usuarios: rows });
  } catch (error) {
    console.error("Error listando usuarios:", error);
    return res.status(500).json({
      mensaje: "Error obteniendo usuarios",
    });
  }
});

app.get("/api/user/datos-fiscales", auth, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const [rows] = await pool.query(
      `
      SELECT
        razon_social,
        nif,
        direccion,
        codigo_postal,
        ciudad,
        pais,
        logo_path
      FROM datos_fiscales
      WHERE usuario_id = ?
      `,
      [usuarioId],
    );

    if (rows.length === 0) {
      return res.json({ datos: null });
    }

    return res.json({ datos: rows[0] });
  } catch (error) {
    console.error("Error obteniendo datos fiscales:", error);
    res.status(500).json({ error: "Error obteniendo datos fiscales" });
  }
});

app.post(
  "/api/user/datos-fiscales",
  auth,
  checkMantenimiento,
  uploadLogo.single("logo"),
  async (req, res) => {
    try {
      const usuarioId = req.usuario.id;
      const { razon_social, nif, direccion, codigo_postal, ciudad, pais } =
        req.body;

      if (!razon_social || !nif) {
        return res
          .status(400)
          .json({ error: "Razón social y NIF son obligatorios" });
      }

      // 🔎 Buscar datos existentes
      const [existentes] = await pool.query(
        "SELECT logo_path FROM datos_fiscales WHERE usuario_id = ?",
        [usuarioId],
      );

      let logoPath = null;

      if (req.file) {
        logoPath = `/uploads/logos/${req.file.filename}`;

        // 🔥 Si había logo anterior, borrarlo
        if (existentes.length > 0 && existentes[0].logo_path) {
          const rutaAnterior = path.join(
            process.cwd(),
            existentes[0].logo_path.replace(/^\/+/, ""),
          );

          if (fs.existsSync(rutaAnterior)) {
            fs.unlinkSync(rutaAnterior);
          }
        }
      } else if (existentes.length > 0) {
        // Mantener logo anterior si no se sube uno nuevo
        logoPath = existentes[0].logo_path;
      }

      if (existentes.length === 0) {
        // INSERT
        await pool.query(
          `
          INSERT INTO datos_fiscales
          (usuario_id, razon_social, nif, direccion, codigo_postal, ciudad, pais, logo_path)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            usuarioId,
            razon_social,
            nif,
            direccion,
            codigo_postal,
            ciudad,
            pais,
            logoPath,
          ],
        );

        await registrarEvento(
          usuarioId,
          "DATOS_FISCALES_CREADOS",
          `Primer registro de los datos fiscales del usuario ${usuarioId}`,
        );
      } else {
        // UPDATE
        await pool.query(
          `
          UPDATE datos_fiscales
          SET
            razon_social = ?,
            nif = ?,
            direccion = ?,
            codigo_postal = ?,
            ciudad = ?,
            pais = ?,
            logo_path = ?
          WHERE usuario_id = ?
          `,
          [
            razon_social,
            nif,
            direccion,
            codigo_postal,
            ciudad,
            pais,
            logoPath,
            usuarioId,
          ],
        );

        await registrarEvento(
          usuarioId,
          "DATOS_FISCALES_MODIFICADOS",
          `Modificación de los datos fiscales del usuario ${usuarioId}`,
        );
      }

      res.json({ ok: true });
    } catch (error) {
      console.error("Error guardando datos fiscales:", error);
      res.status(500).json({ error: "Error guardando datos fiscales" });
    }
  },
);

app.get("/api/user/subscription/status", auth, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const PLANES = {
      GRATUITO: {
        limite: 5,
      },
      BASICO: {
        limite: 10,
      },
      PRO: {
        limite: 20,
      },
    };
    const [[usuario]] = await pool.query(
      "SELECT suscripcion, estado_suscripcion FROM usuarios WHERE id = ?",
      [usuarioId],
    );
    const plan = usuario.suscripcion || "GRATUITO";
    const estado = usuario.estado_suscripcion || "ACTIVA";
    const limite = PLANES[plan].limite;

    // 🔹 Contar facturas del mes actual
    const [rows] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM registros_facturacion
      WHERE usuario_id = ?
        AND YEAR(fecha_hora_generacion) = YEAR(CURRENT_DATE())
        AND MONTH(fecha_hora_generacion) = MONTH(CURRENT_DATE())
      `,
      [usuarioId],
    );

    const facturasEsteMes = rows[0].total;
    // 🔹 Plan actual (mock de momento)

    res.json({
      plan,
      estadoSuscripcion: estado,
      limite,
      facturasEsteMes,
    });
  } catch (error) {
    console.error("Error obteniendo estado de suscripción:", error);
    res.status(500).json({ error: "Error obteniendo estado de suscripción" });
  }
});

app.post(
  "/api/user/subscription/state",
  auth,
  checkMantenimiento,
  async (req, res) => {
    try {
      const usuarioId = req.usuario.id;
      const { estado } = req.body;

      const ESTADOS_VALIDOS = ["ACTIVA", "PENDIENTE", "VENCIDA"];

      if (!ESTADOS_VALIDOS.includes(estado)) {
        return res.status(400).json({ error: "Estado no válido" });
      }

      await pool.query(
        "UPDATE usuarios SET estado_suscripcion = ? WHERE id = ?",
        [estado, usuarioId],
      );

      await registrarEvento(
        usuarioId,
        "CAMBIO_ESTADO_SUSCRIPCION",
        `Estado cambiado a ${estado}`,
      );

      res.json({ ok: true, estado });
    } catch (error) {
      console.error("Error cambiando estado:", error);
      res.status(500).json({ error: "Error cambiando estado" });
    }
  },
);

app.post(
  "/api/user/subscription/change",
  auth,
  checkMantenimiento,
  async (req, res) => {
    try {
      const usuarioId = req.usuario.id;
      const { plan } = req.body;

      const PLANES = {
        GRATUITO: {
          nombre: "0–5 facturas",
          limite: 5,
          precio: 0,
        },
        BASICO: {
          nombre: "6–10 facturas",
          limite: 10,
          precio: 9,
        },
        PRO: {
          nombre: "11–20 facturas",
          limite: 20,
          precio: 15,
        },
      };

      if (!PLANES[plan]) {
        return res.status(400).json({ error: "Plan no válido" });
      }

      await pool.query("UPDATE usuarios SET suscripcion = ? WHERE id = ?", [
        plan,
        usuarioId,
      ]);

      await registrarEvento(
        usuarioId,
        "CAMBIO_SUSCRIPCION",
        `Cambio de la suscripción del usuario ${usuarioId}`,
      );

      res.json({
        ok: true,
        plan,
        limite: PLANES[plan].limite,
      });
    } catch (error) {
      console.error("Error cambiando plan:", error);
      res.status(500).json({ error: "Error cambiando plan" });
    }
  },
);

app.get("/api/sif", auth, async (req, res) => {
  const usuarioId = req.usuario.id;

  try {
    const [rows] = await pool.query(
      `
      SELECT
        id,
        nombre,
        nif,
        version,
        fecha_declaracion_responsable,
        activo,
        created_at
      FROM sif_configuracion
      WHERE usuario_id = ? OR es_global = 1
      ORDER BY activo DESC, created_at DESC
      `,
      [usuarioId],
    );
    const sifActivo = rows.find((s) => s.activo === 1);
    res.json({
      ok: true,
      sifs: rows,
      sifActivo,
    });
  } catch (error) {
    console.error("Error obteniendo SIF:", error);
    res.status(500).json({
      ok: false,
      error: "Error obteniendo los SIF",
    });
  }
});

app.post("/api/sif", auth, checkMantenimiento, async (req, res) => {
  const usuarioId = req.usuario.id;
  const { nombre, nif, version, fecha_declaracion_responsable } = req.body;

  if (!nombre || !nif || !version || !fecha_declaracion_responsable) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    // desactivar los anteriores
    await pool.query(
      "UPDATE sif_configuracion SET activo = 0 WHERE usuario_id = ?",
      [usuarioId],
    );

    const [result] = await pool.query(
      `
      INSERT INTO sif_configuracion
      (usuario_id, nombre, nif, version, fecha_declaracion_responsable, activo, created_at)
      VALUES (?, ?, ?, ?, ?, 1, NOW())
      `,
      [usuarioId, nombre, nif, version, fecha_declaracion_responsable],
    );

    await registrarEvento(
      usuarioId,
      "SIF_CREADO",
      `Alta de SIF ${nombre} v${version}`,
    );

    res.json({ ok: true, id: result.insertId });
  } catch (e) {
    console.error("Error creando SIF:", e);
    res.status(500).json({ error: "Error creando SIF" });
  }
});

app.post("/api/sif/:id/activar", auth, checkMantenimiento, async (req, res) => {
  const usuarioId = req.usuario.id;
  const sifId = req.params.id;

  try {
    await pool.query(
      "UPDATE sif_configuracion SET activo = 0 WHERE usuario_id = ?",
      [usuarioId],
    );

    const [r] = await pool.query(
      "UPDATE sif_configuracion SET activo = 1 WHERE id = ? AND usuario_id = ?",
      [sifId, usuarioId],
    );

    if (r.affectedRows === 0) {
      return res.status(404).json({ error: "SIF no encontrado" });
    }

    await registrarEvento(
      usuarioId,
      "SIF_ACTIVADO",
      `Activación de SIF id ${sifId}`,
    );

    res.json({ ok: true });
  } catch (e) {
    console.error("Error activando SIF:", e);
    res.status(500).json({ error: "Error activando SIF" });
  }
});

app.post("/api/verificar-documento", auth, async (req, res) => {
  try {
    const { documentos } = req.body;

    if (!Array.isArray(documentos) || documentos.length === 0) {
      return res
        .status(400)
        .json({ error: "Debes enviar un array de documentos" });
    }

    if (documentos.length > 20) {
      return res
        .status(400)
        .json({ error: "Máximo 20 documentos por verificación" });
    }

    function detectarFormato(texto) {
      if (typeof texto !== "string") throw new Error("Documento inválido");
      const t = texto.trim();
      if (t.startsWith("<")) return "XML";
      if (t.startsWith("{")) return "JSON";
      throw new Error("Formato no soportado");
    }

    const resultados = [];

    for (const doc of documentos) {
      try {
        let datos;
        const formato = detectarFormato(doc);

        if (formato === "XML") {
          datos = extraerDatosDesdeXML(doc);
        } else {
          const json = JSON.parse(doc);
          datos = extraerCamposDesdeJSON(json);
        }

        // 🔹 Normalizaciones defensivas
        const hashDocumento = String(datos.hashDocumento || "")
          .trim()
          .toLowerCase();

        const hashAnterior = String(datos.hashAnterior || "")
          .trim()
          .toLowerCase();

        const importeTotal = Number(datos.importeTotal).toFixed(2);

        const numRegAnt = Number(datos.numRegAnt);
        const numRegAct = Number(datos.numRegAct);

        // ==============================
        // 1️⃣ VERIFICACIÓN OFFLINE
        // ==============================
        const hashRecalculado = generarHashRegistro({
          sifId: datos.sifId,
          nifEmisor: datos.nifEmisor,
          numeroFacturaCompleto: datos.numeroFacturaCompleto,
          fechaHoraEmision: datos.fechaHoraExpedicion,
          importeTotal: importeTotal,
          numRegistroAnterior: numRegAnt,
          numRegistroActual: numRegAct,
          hashAnterior: hashAnterior,
        });

        const integridadValida =
          hashRecalculado.toLowerCase() === hashDocumento;

        // Si no es íntegro, no seguimos con BD
        if (!integridadValida) {
          resultados.push({
            documento: datos.numeroFacturaCompleto,
            integridad: false,
            perteneceAlSistema: false,
            mensajeIntegridad:
              "El documento ha sido alterado o no sigue el algoritmo esperado",
            mensajePertenencia: "No evaluado por falta de integridad",
          });
          continue;
        }

        // ==============================
        // 2️⃣ COMPROBAR PERTENENCIA
        // ==============================
        const [rows] = await pool.query(
          `
          SELECT id
          FROM registros_facturacion
          WHERE hash_registro_actual = ?
          AND usuario_id = ?
          `,
          [hashDocumento, req.usuario.id],
        );

        const pertenece = rows.length > 0;

        resultados.push({
          documento: datos.numeroFacturaCompleto,
          integridad: true,
          perteneceAlSistema: pertenece,
          mensajeIntegridad: "Documento íntegro",
          mensajePertenencia: pertenece
            ? "El documento pertenece a este sistema"
            : "El documento no pertenece a este sistema",
        });
      } catch (e) {
        resultados.push({
          documento: null,
          integridad: false,
          perteneceAlSistema: false,
          mensajeIntegridad: "Error procesando documento",
          mensajePertenencia: e.message,
        });
      }
    }

    return res.json({ resultados });
  } catch (e) {
    console.error("Error verificando documentos:", e);
    return res.status(500).json({ error: "Error verificando documentos" });
  }
});

app.get("/api/integridad", auth, async (req, res) => {
  const usuarioId = req.usuario.id;
  const [rows] = await pool.query(
    ` SELECT r.*, s.nombre AS sif_nombre FROM registros_facturacion r LEFT JOIN sif_configuracion s ON r.sif_config_id = s.id WHERE r.usuario_id = ? AND r.invalido = 0 ORDER BY r.num_registro ASC `,
    [usuarioId],
  );
  if (!rows.length) {
    return res.json({ ok: true, mensaje: "No hay registros" });
  }
  const errores = comprobarIntegridad(rows);
  if (errores.length > 0) {
    return res.json({ ok: false, errores });
  }
  return res.json({ ok: true, mensaje: "Integridad correcta" });
});

app.get("/api/integridad-eventos", auth, async (req, res) => {
  const usuarioId = req.usuario.id;

  try {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM log_eventos
      WHERE usuario_id = ?
      ORDER BY num_evento ASC
      `,
      [usuarioId],
    );

    if (!rows.length) {
      return res.json({
        ok: true,
        mensaje: "No hay eventos registrados",
      });
    }

    const errores = await comprobarIntegridadEventos(rows);

    return res.json({
      ok: errores.length === 0,
      errores,
    });
  } catch (error) {
    console.error("ERROR INTEGRIDAD EVENTOS:", error);
    return res.status(500).json({
      mensaje: "Error comprobando integridad del log de eventos",
    });
  }
});

app.get("/api/admin/integridad", auth, requireAdmin, async (req, res) => {
  try {
    const adminId = req.usuario.id;

    // 1️⃣ Obtener todos los usuarios activos
    const [usuarios] = await pool.query(`
        SELECT id, email
        FROM usuarios
        WHERE activo = 1
      `);

    const resultadoGlobal = [];

    for (const u of usuarios) {
      const [rows] = await pool.query(
        `
          SELECT r.*, s.nombre AS sif_nombre
          FROM registros_facturacion r
          LEFT JOIN sif_configuracion s 
            ON r.sif_config_id = s.id
          WHERE r.usuario_id = ?
            AND r.invalido = 0
          ORDER BY r.num_registro ASC
          `,
        [u.id],
      );

      let errores = [];

      if (rows.length > 0) {
        errores = comprobarIntegridad(rows);
      }

      resultadoGlobal.push({
        usuario_id: u.id,
        email: u.email,
        ok: errores.length === 0,
        errores: errores.length > 0 ? errores : null,
      });
    }

    const todoOk = resultadoGlobal.every((u) => u.ok);

    // 🔐 Registrar auditoría
    await registrarEvento(
      adminId,
      "ADMIN_VERIFICACION_GLOBAL",
      "Verificación global de integridad ejecutada",
    );

    return res.json({
      ok: todoOk,
      detalle: resultadoGlobal,
    });
  } catch (error) {
    console.error("ERROR INTEGRIDAD ADMIN:", error);
    return res.status(500).json({
      mensaje: "Error comprobando integridad",
    });
  }
});

app.get(
  "/api/admin/integridad/:usuarioId",
  auth,
  requireAdmin,
  async (req, res) => {
    try {
      const adminId = req.usuario.id;
      const usuarioObjetivoId = req.params.usuarioId;

      // 1️⃣ Comprobar que el usuario existe
      const [usuarios] = await pool.query(
        "SELECT id, email FROM usuarios WHERE id = ?",
        [usuarioObjetivoId],
      );

      if (!usuarios.length) {
        return res.status(404).json({
          mensaje: "Usuario no encontrado",
        });
      }

      // 2️⃣ Cargar registros del usuario objetivo
      const [rows] = await pool.query(
        `
        SELECT r.*, s.nombre AS sif_nombre
        FROM registros_facturacion r
        LEFT JOIN sif_configuracion s 
          ON r.sif_config_id = s.id
        WHERE r.usuario_id = ?
          AND r.invalido = 0
        ORDER BY r.num_registro ASC
        `,
        [usuarioObjetivoId],
      );

      let resultado;

      if (!rows.length) {
        resultado = {
          ok: true,
          mensaje: "No hay registros",
        };
      } else {
        const errores = comprobarIntegridad(rows);

        resultado = {
          ok: errores.length === 0,
          errores,
        };
      }

      // 3️⃣ 🔐 Registrar evento de auditoría
      await registrarEvento(
        adminId,
        "ADMIN_VERIFICACION_INTEGRIDAD",
        `Verificación de integridad ejecutada sobre usuario ${usuarioObjetivoId}`,
      );

      return res.json(resultado);
    } catch (error) {
      console.error("Error verificación admin:", error);
      return res.status(500).json({
        mensaje: "Error interno del servidor",
      });
    }
  },
);

app.get(
  "/api/admin/integridad-eventos",
  auth,
  requireAdmin,
  async (req, res) => {
    try {
      const [usuarios] = await pool.query(`
      SELECT DISTINCT usuario_id 
      FROM log_eventos
    `);

      const resultadoGlobal = [];

      for (const u of usuarios) {
        const [rows] = await pool.query(
          `
        SELECT *
        FROM log_eventos
        WHERE usuario_id = ?
        ORDER BY num_evento ASC
        `,
          [u.usuario_id],
        );

        const errores = await comprobarIntegridadEventos(rows);

        resultadoGlobal.push({
          usuario_id: u.usuario_id,
          ok: errores.length === 0,
          errores,
        });
      }

      const todoOk = resultadoGlobal.every((u) => u.ok);

      return res.json({
        ok: todoOk,
        detalle: resultadoGlobal,
      });
    } catch (error) {
      console.error("ERROR INTEGRIDAD EVENTOS ADMIN:", error);
      return res.status(500).json({
        mensaje: "Error comprobando integridad global del log de eventos",
      });
    }
  },
);
app.get("/api/admin/logs-resumen", auth, requireAdmin, async (req, res) => {
  try {
    const [usuarios] = await pool.query(`
      SELECT u.id, u.email
      FROM usuarios u
    `);

    const resultado = [];

    for (const u of usuarios) {
      const [eventos] = await pool.query(
        `SELECT *
         FROM log_eventos
         WHERE usuario_id = ?
         ORDER BY num_evento ASC`,
        [u.id],
      );

      const errores = await comprobarIntegridadEventos(eventos);

      resultado.push({
        usuario_id: u.id,
        email: u.email,
        total_eventos: eventos.length,
        ultimo_evento:
          eventos.length > 0 ? eventos[eventos.length - 1].tipo_evento : null,
        integridad_ok: errores.length === 0,
      });
    }

    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo resumen de logs" });
  }
});

app.get("/api/admin/logs/:usuarioId", auth, requireAdmin, async (req, res) => {
  const { usuarioId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT *
       FROM log_eventos
       WHERE usuario_id = ?
       ORDER BY num_evento ASC`,
      [usuarioId],
    );

    const errores = await comprobarIntegridadEventos(rows);

    const eventosConEstado = rows.map((e) => ({
      ...e,
      integridad_ok: !errores.find((err) => err.num_evento === e.id),
    }));

    res.json({ eventos: eventosConEstado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo logs" });
  }
});

app.post(
  "/api/admin/usuarios/:usuarioId/reset-cadena-eventos",
  auth,
  requireAdmin,
  async (req, res) => {
    const adminId = req.usuario.id;
    const { usuarioId } = req.params;

    try {
      // 1️⃣ Comprobamos que el usuario existe
      const [rows] = await pool.query("SELECT id FROM usuarios WHERE id = ?", [
        usuarioId,
      ]);

      if (rows.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      // 2️⃣ Iniciamos nueva cadena para ESE usuario
      await iniciarNuevaCadenaEventos(usuarioId);

      // 3️⃣ Registramos evento en la cadena del ADMIN
      await registrarEvento(
        adminId,
        "ADMIN_RESET_CADENA_EVENTOS",
        `El admin ${adminId} reinició la cadena de eventos del usuario ${usuarioId}`,
      );

      return res.json({
        ok: true,
        mensaje: "Cadena de eventos reiniciada correctamente",
      });
    } catch (error) {
      console.error("Error reseteando cadena:", error);
      return res.status(500).json({
        error: "Error reiniciando cadena de eventos",
      });
    }
  },
);

app.get(
  "/api/admin/backups",
  auth,
  requireAdmin,
  checkMantenimiento,
  async (req, res) => {
    try {
      const backupsPath = path.join(process.cwd(), "backups");

      if (!fs.existsSync(backupsPath)) {
        return res.json({ backups: [] });
      }

      const carpetas = fs.readdirSync(backupsPath);

      const backups = carpetas.map((nombre) => {
        const backupDir = path.join(backupsPath, nombre);

        const dbPath = path.join(backupDir, "database.sql");
        const storagePath = path.join(backupDir, "storage.zip");

        let tamañoDB = 0;
        let tamañoStorage = 0;

        if (fs.existsSync(dbPath)) {
          tamañoDB = fs.statSync(dbPath).size;
        }

        if (fs.existsSync(storagePath)) {
          tamañoStorage = fs.statSync(storagePath).size;
        }

        const tamañoTotal = tamañoDB + tamañoStorage;

        return {
          nombre,
          tamañoTotal,
          tamañoDB,
          tamañoStorage,
          fecha: new Date(nombre.replace(/-/g, ":")).toISOString(),
        };
      });

      // Ordenar más reciente primero
      backups.sort((a, b) => b.nombre.localeCompare(a.nombre));

      res.json({ backups });
    } catch (error) {
      console.error("Error listando backups:", error);
      res.status(500).json({ mensaje: "Error listando backups" });
    }
  },
);

app.post(
  "/api/admin/backups",
  auth,
  requireAdmin,
  checkMantenimiento,
  async (req, res) => {
    try {
      // 1. Crear directorio con fecha
      const fecha = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 16);
      const backupDir = path.join(process.cwd(), "backups", fecha);

      if (!fs.existsSync(backupDir))
        fs.mkdirSync(backupDir, { recursive: true });

      // 2. Configurar Backup de Base de Datos
      const dbFile = path.join(backupDir, "database.sql"); // Ruta real del archivo
      const mysqldumpPath = process.env.DB_DUMP_PATH;
      const dbUser = process.env.DB_USER;
      const dbPass = process.env.DB_PASS;
      const dbName = process.env.DB_NAME;

      // El password va pegado al flag -p (ejemplo: -proot)
      const passwordFlag = dbPass ? `-p${dbPass}` : "";

      // USAMOS dbFile para que se guarde en la carpeta con la fecha
      const dumpCommand = `"${mysqldumpPath}" -u ${dbUser} ${passwordFlag} ${dbName} > "${dbFile}"`;

      await new Promise((resolve, reject) => {
        exec(dumpCommand, (error) => (error ? reject(error) : resolve()));
      });

      // 3. Backup de archivos (Storage)
      const zip = new AdmZip();
      const storagePath = path.join(process.cwd(), "storage");

      if (fs.existsSync(storagePath)) {
        zip.addLocalFolder(storagePath);
        zip.writeZip(path.join(backupDir, "storage.zip"));
      }

      await registrarEvento(
        req.usuario.id,
        "BACKUP_EJECUTADO",
        `Backup generado en ${fecha}`,
      );

      res.json({ ok: true, mensaje: "Backup generado correctamente", fecha });
    } catch (error) {
      console.error("ERROR BACKUP:", error);
      res
        .status(500)
        .json({ mensaje: "Error generando backup", detalle: error.message });
    }
  },
);

app.get(
  "/api/admin/backups/:fecha/descargar",
  auth,
  requireAdmin,
  async (req, res) => {
    try {
      const { fecha } = req.params;
      const backupPath = path.join(process.cwd(), "backups", fecha);

      if (!fs.existsSync(backupPath)) {
        return res.status(404).json({ mensaje: "Backup no encontrado" });
      }

      // Creamos un ZIP al vuelo que contenga la carpeta del backup (SQL + Storage.zip)
      const zip = new AdmZip();
      zip.addLocalFolder(backupPath);
      const buffer = zip.toBuffer();

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=backup-${fecha}.zip`,
      );
      res.setHeader("Content-Type", "application/zip");

      await registrarEvento(
        req.usuario.id,
        "BACKUP_DESCARGADO",
        `Backup ${fecha} descargado`,
      );

      res.send(buffer);
    } catch (error) {
      console.error("ERROR DESCARGANDO:", error);
      res.status(500).json({ mensaje: "Error al preparar la descarga" });
    }
  },
);

app.delete(
  "/api/admin/backups/:fecha",
  auth,
  requireAdmin,
  async (req, res) => {
    try {
      const { fecha } = req.params;

      // 🔒 Validación básica (evita path traversal)
      if (!/^[0-9\-]+$/.test(fecha)) {
        return res.status(400).json({
          mensaje: "Nombre de backup inválido",
        });
      }

      const backupPath = path.join(process.cwd(), "backups", fecha);

      if (!fs.existsSync(backupPath)) {
        return res.status(404).json({
          mensaje: "Backup no encontrado",
        });
      }

      // ⚠️ Seguridad extra: asegurarnos de que está dentro de /backups
      const backupsRoot = path.join(process.cwd(), "backups");
      if (!backupPath.startsWith(backupsRoot)) {
        return res.status(403).json({
          mensaje: "Acceso no permitido",
        });
      }

      // 🗑 Eliminamos carpeta completa
      fs.rmSync(backupPath, { recursive: true, force: true });

      // 📝 Registramos evento
      await registrarEvento(
        req.usuario.id,
        "BACKUP_ELIMINADO",
        `Backup ${fecha} eliminado`,
      );

      res.json({
        ok: true,
        mensaje: "Backup eliminado correctamente",
      });
    } catch (error) {
      console.error("ERROR ELIMINANDO BACKUP:", error);
      res.status(500).json({
        mensaje: "Error eliminando backup",
      });
    }
  },
);

app.post(
  "/api/admin/backups/:fecha/restaurar",
  auth,
  requireAdmin,
  async (req, res) => {
    const { fecha } = req.params;
    const backupPath = path.join(process.cwd(), "backups", fecha);
    const dbFile = path.join(backupPath, "database.sql");
    const storageZip = path.join(backupPath, "storage.zip");

    if (!fs.existsSync(dbFile) || !fs.existsSync(storageZip)) {
      return res
        .status(404)
        .json({ mensaje: "Backup incompleto o inexistente" });
    }

    try {
      activarMantenimiento();

      // 1️⃣ RESTAURAR BASE DE DATOS
      const mysqlPath = `"C:\\xampp\\mysql\\bin\\mysql.exe"`;
      const comando = `${mysqlPath} -u "${process.env.DB_USER}" "${process.env.DB_NAME}" < "${dbFile}"`;
      await new Promise((resolve, reject) => {
        exec(comando, (error) => (error ? reject(error) : resolve()));
      });

      // 2️⃣ RESTAURAR STORAGE (CORREGIDO con AdmZip)
      const storagePath = path.join(process.cwd(), "storage");
      fs.rmSync(storagePath, { recursive: true, force: true });

      const zip = new AdmZip(storageZip);
      zip.extractAllTo(storagePath, true);

      await registrarEvento(
        req.usuario.id,
        "BACKUP_RESTAURADO",
        `Sistema restaurado desde backup ${fecha}`,
      );

      desactivarMantenimiento();
      res.json({ ok: true, mensaje: "Sistema restaurado correctamente" });
    } catch (error) {
      console.error("ERROR RESTAURANDO:", error);
      desactivarMantenimiento();
      res.status(500).json({ mensaje: "Error restaurando backup" });
    }
  },
);

app.get("/api/status", (req, res) => {
  res.json({
    mantenimiento: estaEnMantenimiento(),
  });
});

app.post(
  "/api/admin/mantenimiento/activar",
  auth,
  requireAdmin,
  async (req, res) => {
    activarMantenimiento();

    await registrarEvento(
      req.usuario.id,
      "MODO_MANTENIMIENTO_ACTIVADO",
      "Modo mantenimiento activado por admin",
    );

    res.json({ ok: true });
  },
);

app.post(
  "/api/admin/mantenimiento/desactivar",
  auth,
  requireAdmin,
  async (req, res) => {
    desactivarMantenimiento();

    await registrarEvento(
      req.usuario.id,
      "MODO_MANTENIMIENTO_DESACTIVADO",
      "Modo mantenimiento desactivado por admin",
    );

    res.json({ ok: true });
  },
);

app.get(
  "/api/admin/backups/verificar-integridad",
  auth,
  requireAdmin,
  async (req, res) => {
    try {
      // 1. Obtener registros de facturación (ordenados por número de registro para la cadena)
      const [facturas] = await pool.query(
        "SELECT * FROM registros_facturacion ORDER BY num_registro ASC",
      );

      // 2. Obtener eventos (ordenados por número de evento)
      const [eventos] = await pool.query(
        "SELECT * FROM log_eventos ORDER BY num_evento ASC",
      );

      // 3. Ejecutar tus funciones
      const erroresFacturas = comprobarIntegridad(facturas);
      const erroresEventos = comprobarIntegridadEventos(eventos);

      const integridadOk =
        erroresFacturas.length === 0 && erroresEventos.length === 0;

      // Registrar el resultado de la verificación en el log de eventos
      await registrarEvento(
        req.usuario.id,
        "VERIFICACION_INTEGRIDAD_POST_RESTORE",
        integridadOk
          ? "Integridad verificada con éxito"
          : `Fallos detectados: ${erroresFacturas.length} facturas, ${erroresEventos.length} eventos`,
      );

      res.json({
        ok: true,
        integridadOk,
        detalles: {
          facturas: erroresFacturas,
          eventos: erroresEventos,
        },
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ mensaje: "Error durante la verificación de integridad" });
    }
  },
);

app.get("/api/admin/facturas", auth, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      usuarioId,
      estado,
      fechaInicio,
      fechaFin,
      q,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let where = "WHERE 1=1";
    const params = [];

    if (usuarioId) {
      where += " AND f.usuario_id = ?";
      params.push(usuarioId);
    }

    if (estado) {
      where += " AND f.estado = ?";
      params.push(estado);
    }

    if (fechaInicio && fechaFin) {
      where += " AND f.fecha_expedicion BETWEEN ? AND ?";
      params.push(fechaInicio, fechaFin);
    } else if (fechaInicio) {
      where += " AND f.fecha_expedicion >= ?";
      params.push(fechaInicio);
    } else if (fechaFin) {
      where += " AND f.fecha_expedicion <= ?";
      params.push(fechaFin);
    }

    if (q) {
      where += `
        AND (
          f.numero_factura LIKE ?
          OR u.email LIKE ?
          OR CAST(f.importe_total AS CHAR) LIKE ?
        )
      `;
      const like = `%${q}%`;
      params.push(like, like, like);
    }

    // 🔹 Total
    const [[{ total }]] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM facturas f
      JOIN usuarios u ON u.id = f.usuario_id
      ${where}
      `,
      params,
    );

    // 🔹 Datos paginados
    const [rows] = await pool.query(
      `
      SELECT 
        f.id,
        f.numero_factura,
        f.fecha_expedicion,
        f.tipo_factura,
        f.importe_total,
        f.estado,
        u.email,
        u.id AS usuario_id
      FROM facturas f
      JOIN usuarios u ON u.id = f.usuario_id
      ${where}
      ORDER BY f.fecha_expedicion DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limitNum, offset],
    );

    res.json({
      facturas: rows,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("Error listando facturas globales:", error);
    res.status(500).json({ mensaje: "Error obteniendo facturas" });
  }
});

app.get("/api/admin/sif", auth, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, nombre, version, es_global, usuario_id
      FROM sif_configuracion
      ORDER BY id ASC
    `);

    res.json({ sif: rows });
  } catch (error) {
    console.error("Error obteniendo SIF:", error);
    res.status(500).json({ mensaje: "Error obteniendo configuraciones SIF" });
  }
});

app.patch("/api/admin/sif/:id/global", auth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const adminId = req.usuario.id;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Comprobamos que existe
    const [rows] = await connection.query(
      "SELECT id FROM sif_configuracion WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Configuración no encontrada" });
    }

    // 1️⃣ Quitamos global a todos
    await connection.query("UPDATE sif_configuracion SET es_global = 0");

    // 2️⃣ Marcamos el nuevo
    await connection.query(
      "UPDATE sif_configuracion SET es_global = 1 WHERE id = ?",
      [id],
    );

    await connection.commit();

    await registrarEvento(
      adminId,
      "ADMIN_CAMBIO_SIF_GLOBAL",
      `SIF ${id} marcado como global`,
    );

    res.json({ ok: true });
  } catch (error) {
    await connection.rollback();
    console.error("Error cambiando SIF global:", error);
    res.status(500).json({ mensaje: "Error actualizando SIF global" });
  } finally {
    connection.release();
  }
});

app.post("/api/admin/sif/versionar", auth, requireAdmin, async (req, res) => {
  const { id_base, nueva_version, nombre_base } = req.body;
  const adminId = req.usuario.id;

  if (!id_base || !nueva_version) {
    return res.status(400).json({ mensaje: "Datos incompletos" });
  }
  if (!nombre_base || !/^[A-Z0-9\-]+$/.test(nombre_base)) {
    return res.status(400).json({
      mensaje: "Nombre base inválido. Usa mayúsculas, números y guiones.",
    });
  }
  // Validar formato semántico tipo 1.0.0
  const versionRegex = /^\d+\.\d+\.\d+$/;

  if (!versionRegex.test(nueva_version)) {
    return res.status(400).json({
      mensaje: "La versión debe tener formato X.Y.Z (ej: 2.0.1)",
    });
  }
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Obtener los datos del SIF que queremos evolucionar
    const [rows] = await connection.query(
      "SELECT * FROM sif_configuracion WHERE id = ?",
      [id_base],
    );

    if (rows.length === 0) throw new Error("SIF base no encontrado");
    const base = rows[0];
    const [existe] = await pool.query(
      "SELECT id FROM sif_configuracion WHERE version = ? AND es_global = 1",
      [nueva_version],
    );

    if (existe.length > 0) {
      return res.status(400).json({
        mensaje: "Ya existe un SIF global con esa versión",
      });
    }
    // 2. Desactivar el flag global de TODOS los registros existentes
    await connection.query("UPDATE sif_configuracion SET es_global = 0");

    // 3. Insertar la nueva versión
    const nombreFinal = `${nombre_base}-${nueva_version}`;
    // Copiamos los campos técnicos pero actualizamos versión y flag global
    const [result] = await connection.query(
      `INSERT INTO sif_configuracion 
      (nombre, usuario_id, nif, version, activo, es_global, fecha_declaracion_responsable) 
      VALUES (?, ?, ?, ?, 1, 1, NOW())`,
      [nombreFinal, adminId, base.nif, nueva_version],
    );

    const nuevoId = result.insertId;

    await connection.commit();

    await registrarEvento(
      adminId,
      "SIF_VERSIONADO",
      `Nueva versión global ${nueva_version} (ID: ${nuevoId}) creada desde ID: ${id_base}`,
    );

    res.status(201).json({ ok: true, id: nuevoId });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ mensaje: "Error al crear nueva versión" });
  } finally {
    connection.release();
  }
});

app.listen(3000, () => {
  console.log("Backend escuchando en puerto 3000");
});

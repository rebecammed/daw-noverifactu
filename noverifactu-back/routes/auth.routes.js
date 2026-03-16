import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/db.js";
import auth from "../middleware/auth.js";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import crypto from "crypto";
import { registrarEvento } from "../utils/eventos.js";

const router = express.Router();

router.post("/auth/login", async (req, res) => {
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

router.post("/auth/login/2fa", async (req, res) => {
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

router.post("/2fa/setup", auth, async (req, res) => {
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

router.post("/2fa/verify", auth, async (req, res) => {
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

router.get("/2fa/status", auth, async (req, res) => {
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

router.post("/auth/register", async (req, res) => {
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
    const enlace = `http://daw-noverifactu.vercel.app/verificar-email?token=${tokenPlano}`;

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
router.post("/auth/resend-verification", async (req, res) => {
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
    const enlace = `http://daw-noverifactu.vercel.app/verificar-email?token=${tokenPlano}`;

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
router.get("/auth/verificar-email", async (req, res) => {
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

router.post("/usuarios/cambiar-password", auth, async (req, res) => {
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

router.post("/auth/forgot-password", async (req, res) => {
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

router.post("/auth/reset-password", async (req, res) => {
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
export default router;

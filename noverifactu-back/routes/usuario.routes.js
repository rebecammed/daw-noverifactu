import express from "express";
import pool from "../db/db.js";
import auth from "../middleware/auth.js";
import checkMantenimiento from "../middleware/checkMantenimiento.js";
import { registrarEvento } from "../utils/eventos.js";
import fs from "fs";
import { uploadLogo } from "../middleware/upload.js";
import { PLANES } from "../utils/planes.js";
import { r2 } from "../utils/r2.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

const router = express.Router();

router.get("/user/me", auth, async (req, res) => {
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
router.get("/user/datos-fiscales", auth, async (req, res) => {
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

router.post(
  "/user/datos-fiscales",
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
        const keyLogo = `usuarios/${usuarioId}/logo/${req.file.filename}`;

        // 🔹 subir a R2
        await r2.send(
          new PutObjectCommand({
            Bucket: process.env.R2_BUCKET,
            Key: keyLogo,
            Body: fs.readFileSync(req.file.path),
            ContentType: req.file.mimetype,
          }),
        );

        logoPath = keyLogo;

        // 🔹 borrar archivo temporal de multer
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        // 🔹 borrar logo anterior (solo en DB, no en R2 todavía)
        if (existentes.length > 0 && existentes[0].logo_path) {
          await r2.send(
            new DeleteObjectCommand({
              Bucket: process.env.R2_BUCKET,
              Key: existentes[0].logo_path,
            }),
          );
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

router.get("/user/subscription/status", auth, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

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

router.post(
  "/user/subscription/state",
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

router.post(
  "/user/subscription/change",
  auth,
  checkMantenimiento,
  async (req, res) => {
    try {
      const usuarioId = req.usuario.id;
      const { plan } = req.body;

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

export default router;

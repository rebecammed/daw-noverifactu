import express from "express";
import pool from "../../db/db.js";
import auth from "../../middleware/auth.js";
import { registrarEvento } from "../../utils/eventos.js";
import { r2 } from "../../utils/r2.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const router = express.Router();

router.get("/:id/pdf-original", auth, async (req, res) => {
  try {
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
    const key = rows[0].ruta_pdf;

    if (!key) {
      return res.status(404).json({ mensaje: "Archivo no disponible" });
    }

    const file = await r2.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
      }),
    );

    try {
      // 🧾 Log de evento
      await registrarEvento(
        usuarioId,
        "DESCARGA_PDF_ORIGINAL",
        `Descarga de documento PDF original de la factura número ${rows[0].numero_factura}`,
      );
    } catch (logError) {
      console.error("Error registrando evento de descarga:", logError);
    }

    res.setHeader("Content-Type", "application/pdf");
    file.Body.pipe(res);
  } catch (error) {
    console.error("Error descargando PDF original:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

router.get("/:id/pdf", auth, async (req, res) => {
  try {
    const facturaId = req.params.id;
    const usuarioId = req.usuario.id;

    const [rows] = await pool.query(
      `
      SELECT numero_factura, pdf_generado_path
      FROM facturas
      WHERE id = ? AND usuario_id = ?
      `,
      [facturaId, usuarioId],
    );

    if (!rows.length) {
      return res.status(404).json({ mensaje: "Factura no encontrada" });
    }

    const numeroFactura = rows[0].numero_factura;

    const key = rows[0].pdf_generado_path;

    if (!key) {
      return res.status(404).json({ mensaje: "Archivo no disponible" });
    }

    const file = await r2.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
      }),
    );

    await registrarEvento(
      usuarioId,
      "DESCARGA_PDF",
      `Descarga de PDF sellado de la factura ${numeroFactura}`,
    );
    res.setHeader("Content-Type", "application/pdf");
    file.Body.pipe(res);
  } catch (error) {
    console.error("Error obteniendo PDF:", error);
    return res.status(500).json({
      mensaje: "Error obteniendo PDF",
    });
  }
});

router.get("/:id/xml", auth, async (req, res) => {
  try {
    const facturaId = req.params.id;
    const usuarioId = req.usuario.id;
    const tipo = req.query.tipo; // undefined | "anulacion"

    // 1️⃣ Comprobar que existe y pertenece al usuario
    const [rows] = await pool.query(
      `
      SELECT numero_factura, tipo_factura, xml_generado_path
      FROM facturas
      WHERE id = ? AND usuario_id = ?
      `,
      [facturaId, usuarioId],
    );

    if (!rows.length || !rows[0].xml_generado_path) {
      return res.status(404).json({ mensaje: "Factura no encontrada" });
    }

    const { numero_factura, tipo_factura } = rows[0];

    // 2️⃣ Ruta base

    const nombreArchivo =
      tipo === "anulacion"
        ? "anulacion.xml"
        : rows[0].tipo_factura === "RECTIFICATIVA"
          ? "factura_rectificativa.xml"
          : "factura.xml";

    const key = rows[0].xml_generado_path;

    if (!key) {
      return res.status(404).json({ mensaje: "Archivo no disponible" });
    }

    const file = await r2.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
      }),
    );

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
    file.Body.pipe(res);
  } catch (error) {
    console.error("Error descargando XML:", error);
    return res.status(500).json({ mensaje: "Error descargando XML" });
  }
});
export default router;

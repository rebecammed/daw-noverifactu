import express from "express";
import fs from "fs";
import path from "path";
import pool from "../../db/db.js";
import auth from "../../middleware/auth.js";
import { registrarEvento } from "../../utils/eventos.js";

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
    res.sendFile(path.resolve(rutaAbsoluta));
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
    console.log("Contenido carpeta:", fs.readdirSync(baseDir));
    let rutaFinal = null;
    console.log("Buscando PDF en:", rutaSellado);
    console.log("Buscando PDF rectificativa en:", rutaRectificativa);

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
    res.setHeader("Content-Type", "application/pdf");
    return res.sendFile(path.resolve(rutaFinal));
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
export default router;

import express from "express";
import pool from "../db/db.js";
import auth from "../middleware/auth.js";
import { comprobarIntegridad } from "../src/core/comprobarIntegridad.js";
import { comprobarIntegridadEventos } from "../src/core/integridadEventos.js";
import { generarHashRegistro } from "../src/core/hashEngine.js";
import { extraerDatosDesdeXML } from "../src/core/extraerDatosDesdeXML.js";
import { extraerCamposDesdeJSON } from "../src/core/extraerCamposDesdeJSON.js";

const router = express.Router();

router.get("/verificar-factura", async (req, res) => {
  try {
    const { nif, num, fecha, importe, hash, ver } = req.query;

    const [rows] = await pool.query(
      `
      SELECT 
  f.numero_factura,
  f.fecha_expedicion,
  f.importe_total,
  df.nif,
  rf.hash_registro_actual
FROM facturas f
JOIN datos_fiscales df 
  ON f.usuario_id = df.id
JOIN registros_facturacion rf
  ON rf.id = f.registro_id
WHERE f.numero_factura = ?
      `,
      [num],
    );

    if (!rows.length) {
      return res.json({
        existe: false,
      });
    }

    const factura = rows[0];

    const datosCoinciden =
      factura.nif === nif &&
      factura.numero_factura === num &&
      new Date(factura.fecha_expedicion).toISOString().slice(0, 10) === fecha &&
      Number(factura.importe_total).toFixed(2) === Number(importe).toFixed(2);

    const hashValido = factura.hash_registro_actual === hash;

    res.json({
      existe: true,
      datosCoinciden,
      hashValido,
      factura: {
        nif: factura.nif,
        numero: factura.numero_factura,
        fecha: factura.fecha_expedicion,
        importe: factura.importe_total,
      },
    });
  } catch (error) {
    console.error("Error verificación:", error);
    res.status(500).json({ mensaje: "Error verificando factura" });
  }
});

router.post("/verificar-documento", async (req, res) => {
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
        let pertenece = false;
        const usuarioId = req.usuario?.id || null;
        if (usuarioId) {
          const [rows] = await pool.query(
            `
    SELECT id
    FROM registros_facturacion
    WHERE hash_registro_actual = ?
    AND usuario_id = ?
    `,
            [hashDocumento, usuarioId],
          );

          pertenece = rows.length > 0;
        }

        resultados.push({
          documento: datos.numeroFacturaCompleto,
          integridad: true,
          perteneceAlSistema: pertenece,
          mensajeIntegridad: "Documento íntegro",
          mensajePertenencia: req.usuario
            ? pertenece
              ? "El documento pertenece a este sistema"
              : "El documento no pertenece a este sistema"
            : "No evaluado (usuario no autenticado)",
        });
      } catch (e) {
        console.error("ERROR PROCESANDO DOCUMENTO:", e);

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

router.get("/integridad", auth, async (req, res) => {
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

router.get("/integridad-eventos", auth, async (req, res) => {
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

export default router;

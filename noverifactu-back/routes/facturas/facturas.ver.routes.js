import express from "express";
import fs from "fs";
import path from "path";
import pool from "../../db/db.js";
import auth from "../../middleware/auth.js";

const router = express.Router();

router.get("/:id/rectificativas", auth, async (req, res) => {
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

router.get("/:id", auth, async (req, res) => {
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

router.get("/facturas", auth, async (req, res) => {
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
      `SELECT COUNT(*) as total FROM facturas f JOIN registros_facturacion rf
  ON rf.id = f.registro_id
 AND rf.invalido = 0
LEFT JOIN clientes c ON c.id = f.cliente_id
WHERE f.usuario_id = ?`,
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
export default router;

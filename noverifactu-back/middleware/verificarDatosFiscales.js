import pool from "../db/db.js";
export async function verificarDatosFiscales(req, res, next) {
  const usuarioId = req.usuario.id;

  const [rows] = await pool.query(
    `
      SELECT razon_social, nif, direccion, codigo_postal, ciudad, pais
      FROM datos_fiscales
      WHERE usuario_id = ?
      `,
    [usuarioId],
  );

  if (rows.length === 0) {
    return res.status(403).json({
      error: "Debes completar tus datos fiscales antes de crear facturas.",
    });
  }

  const datos = rows[0];

  if (
    !datos ||
    !datos.razon_social ||
    !datos.nif ||
    !datos.direccion ||
    !datos.codigo_postal ||
    !datos.ciudad ||
    !datos.pais
  ) {
    return res.status(403).json({
      error: "Debes completar tus datos fiscales antes de crear facturas.",
    });
  }

  next();
}

import pool from "../db/db.js";

export async function comprobarSuscripcion(req, res, next) {
  const usuarioId = req.usuario.id;

  const PLANES = {
    GRATUITO: { limite: 5 },
    BASICO: { limite: 10 },
    PRO: { limite: 20 },
  };

  // 1️⃣ Obtener suscripción del usuario
  const [[usuario]] = await pool.query(
    "SELECT suscripcion, estado_suscripcion FROM usuarios WHERE id = ?",
    [usuarioId],
  );

  if (!usuario) {
    return res.status(403).json({ error: "Usuario no encontrado" });
  }

  const plan = usuario.suscripcion || "GRATUITO";
  const estado = usuario.estado_suscripcion || "ACTIVA";

  // 2️⃣ Comprobar estado
  if (estado !== "ACTIVA") {
    return res.status(403).json({
      error: "Suscripción no activa",
      estado,
    });
  }

  const limite = PLANES[plan]?.limite;

  if (!limite) {
    return res.status(500).json({ error: "Plan inválido" });
  }

  // 3️⃣ Contar facturas del mes actual (REGISTROS)
  const [[{ total }]] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM registros_facturacion
    WHERE usuario_id = ?
      AND YEAR(fecha_hora_generacion) = YEAR(CURRENT_DATE())
      AND MONTH(fecha_hora_generacion) = MONTH(CURRENT_DATE())
    `,
    [usuarioId],
  );

  // 4️⃣ Comprobar límite
  if (total >= limite) {
    return res.status(403).json({
      error: "Límite mensual alcanzado",
      limite,
      usadas: total,
    });
  }

  // 5️⃣ Todo OK
  next();
}

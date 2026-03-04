import { estaEnMantenimiento } from "../src/core/systemState.js";

export default function checkMantenimiento(req, res, next) {
  if (!estaEnMantenimiento()) {
    return next();
  }

  // Permitimos admin durante mantenimiento
  if (req.usuario?.rol === "ADMIN") {
    return next();
  }

  return res.status(503).json({
    mensaje: "Sistema en mantenimiento. Inténtelo más tarde.",
  });
}

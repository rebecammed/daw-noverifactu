export default function requireAdmin(req, res, next) {
  if (req.usuario.rol !== "ADMIN") {
    return res.status(403).json({
      error: "Acceso solo para administradores",
    });
  }
  next();
}

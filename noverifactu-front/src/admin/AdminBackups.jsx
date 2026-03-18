import { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";
import {
  Box,
  Typography,
  Button,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Alert,
} from "@mui/material";

function AdminBackups() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restaurando, setRestaurando] = useState(false);
  const [resultadoIntegridad, setResultadoIntegridad] = useState(null);

  useEffect(() => {
    cargarBackups();
  }, []);

  async function cargarBackups() {
    const res = await authFetch("/api/admin/backups");
    const data = await res.json();
    setBackups(data.backups || []);
  }

  function formatearBytes(bytes) {
    if (!bytes) return "0 MB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  async function generarBackup() {
    if (!window.confirm("¿Seguro que quieres generar un backup?")) return;

    setLoading(true);

    const res = await authFetch("/api/admin/backups", {
      method: "POST",
    });

    setLoading(false);

    if (!res.ok) {
      alert("Error generando backup");
      return;
    }

    alert("Backup generado correctamente");
    cargarBackups();
  }

  async function restaurarBackup(nombre) {
    const confirmar1 = window.confirm(
      `⚠️ ATENCIÓN ⚠️\n\nVas a restaurar el sistema completo desde el backup ${nombre}.\n\nEsto sobrescribirá base de datos y documentos actuales.\n\n¿Deseas continuar?`,
    );

    if (!confirmar1) return;

    const texto = window.prompt(
      "Para confirmar escribe exactamente: RESTAURAR",
    );

    if (texto !== "RESTAURAR") {
      alert("Confirmación incorrecta. Restauración cancelada.");
      return;
    }

    try {
      setRestaurando(true);
      // Reiniciamos el estado de integridad antes de empezar
      setResultadoIntegridad(null);

      // 1️⃣ Ejecutar la restauración física (Archivos y SQL)
      const res = await authFetch(`/api/admin/backups/${nombre}/restaurar`, {
        method: "POST",
      });

      if (!res.ok) {
        setRestaurando(false);
        alert("Error restaurando backup");
        return;
      }

      // 2️⃣ Una vez restaurado, disparamos la comprobación de integridad
      // Este endpoint es el que usa tus funciones comprobarIntegridad()
      const resVerif = await authFetch(
        "/api/admin/backups/verificar-integridad",
      );
      const dataVerif = await resVerif.json();

      setResultadoIntegridad(dataVerif);
      setRestaurando(false);

      if (dataVerif.integridadOk) {
        alert(
          "✅ Sistema restaurado correctamente.\n\n" +
            "Prueba de integridad: PASADA (La cadena de hashes es válida).\n" +
            "Se recomienda reiniciar el servidor para aplicar cambios.",
        );
      } else {
        alert(
          "⚠️ Sistema restaurado con ADVERTENCIAS.\n\n" +
            "La comprobación de integridad detectó fallos en los hashes de facturas o eventos.\n" +
            "Revisa el informe de errores en pantalla.",
        );
      }

      cargarBackups();
    } catch (error) {
      setRestaurando(false);
      console.error("Error en el proceso de restauración:", error);
      alert("Error crítico durante la restauración y verificación.");
    }
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, md: 5 },
        borderRadius: 4,
        border: "1px solid #eee",
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Backups del sistema
      </Typography>

      <Button
        variant="contained"
        sx={{
          px: 4,
          py: 1.5,
          fontSize: "1rem",
          bgcolor: "#1a73e8",
          fontWeight: 600,
          textTransform: "none",
          transition: "all 0.2s ease",

          "&:hover": {
            bgcolor: "#155ec0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
        }}
        onClick={generarBackup}
        disabled={loading || restaurando}
      >
        {loading ? "Generando..." : "Generar nuevo backup"}
      </Button>

      <Typography variant="h6" sx={{ mt: 4, fontWeight: 600, mb: 3 }}>
        Backups existentes
      </Typography>

      {backups.length === 0 && <p>No hay backups generados</p>}

      {backups.length > 0 && (
        <TableContainer
          component={Paper}
          sx={{
            mt: 2,
            borderRadius: 4,
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <Table
            sx={{
              "& td, & th": {
                fontSize: { xs: "0.85rem", md: "1rem" },
              },
            }}
          >
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.100" }}>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "1rem",
                      fontWeight: "550",
                      color: "#374151",
                    }}
                  >
                    Fecha
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "1rem",
                      fontWeight: "550",
                      color: "#374151",
                    }}
                  >
                    Tamaño total
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "1rem",
                      fontWeight: "550",
                      color: "#374151",
                    }}
                  >
                    Base de datos
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "1rem",
                      fontWeight: "550",
                      color: "#374151",
                    }}
                  >
                    Storage
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "1rem",
                      fontWeight: "550",
                      color: "#374151",
                    }}
                  >
                    Acciones
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {backups.map((b) => (
                <TableRow key={b.nombre}>
                  <TableCell>{b.nombre}</TableCell>
                  <TableCell>{formatearBytes(b.tamañoTotal)}</TableCell>
                  <TableCell>{formatearBytes(b.tamañoDB)}</TableCell>
                  <TableCell>{formatearBytes(b.tamañoStorage)}</TableCell>
                  <TableCell>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={1}
                      alignItems="flex-start"
                    >
                      {/* DESCARGAR */}
                      <Button
                        variant="contained"
                        sx={{
                          px: { xs: 1.5, md: 2 },
                          "&:hover": {
                            bgcolor: "#155ec0",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          },
                        }}
                        size="small"
                        disabled={restaurando}
                        onClick={async () => {
                          try {
                            const res = await authFetch(
                              `/api/admin/backups/${b.nombre}/descargar`,
                            );

                            if (!res.ok) {
                              alert("Error descargando backup");
                              return;
                            }

                            const blob = await res.blob();
                            const url = window.URL.createObjectURL(blob);

                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `backup-${b.nombre}.zip`;
                            a.click();

                            window.URL.revokeObjectURL(url);
                          } catch {
                            alert("Error descargando backup");
                          }
                        }}
                      >
                        Descargar
                      </Button>

                      {/* ELIMINAR */}
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        disabled={restaurando}
                        sx={{
                          px: { xs: 1.5, md: 2 },
                          "&:hover": {
                            bgcolor: "#c62828",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          },
                        }}
                        onClick={async () => {
                          const confirmar = window.confirm(
                            `¿Seguro que quieres eliminar el backup ${b.nombre}?\n\nEsta acción es irreversible.`,
                          );

                          if (!confirmar) return;

                          try {
                            const res = await authFetch(
                              `/api/admin/backups/${b.nombre}`,
                              { method: "DELETE" },
                            );

                            if (!res.ok) {
                              alert("Error eliminando backup");
                              return;
                            }

                            alert("Backup eliminado correctamente");
                            cargarBackups();
                          } catch {
                            alert("Error eliminando backup");
                          }
                        }}
                      >
                        Eliminar
                      </Button>

                      {/* RESTAURAR (DOBLE CONFIRMACIÓN) */}
                      <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        disabled={restaurando}
                        sx={{
                          px: { xs: 1.5, md: 2 },
                          "&:hover": {
                            bgcolor: "#e65100",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          },
                        }}
                        onClick={() => restaurarBackup(b.nombre)}
                      >
                        {restaurando ? "Restaurando..." : "Restaurar"}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {resultadoIntegridad && !resultadoIntegridad.integridadOk && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            border: "2px solid #dc2626",
            backgroundColor: "#fef2f2",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ color: "#991b1b", marginTop: 0 }}>
            Informe de Fallos de Integridad
          </h3>
          <p>
            Se han detectado alteraciones en los siguientes registros
            restaurados:
          </p>

          {resultadoIntegridad.detalles.facturas.length > 0 && (
            <div>
              <strong>Facturas (Cadena rota):</strong>
              <ul>
                {resultadoIntegridad.detalles.facturas.map((err, i) => (
                  <li key={i}>
                    ID Registro: {err.registro} - Error: {err.tipo}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resultadoIntegridad.detalles.eventos.length > 0 && (
            <div>
              <strong>Eventos (Log manipulado):</strong>
              <ul>
                {resultadoIntegridad.detalles.eventos.map((err, i) => (
                  <li key={i}>
                    ID Evento: {err.num_evento} - Error: {err.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Paper>
  );
}

export default AdminBackups;

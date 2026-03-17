import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ShieldAlert,
  Database,
  History,
  RefreshCcw,
} from "lucide-react";
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

const AdminIntegridad = () => {
  const [loading, setLoading] = useState({ facturas: false, eventos: false });
  const [resFacturas, setResFacturas] = useState(null);
  const [resEventos, setResEventos] = useState(null);
  const [usuariosRotos, setUsuariosRotos] = useState([]);
  const navigate = useNavigate();
  const verificarFacturas = async () => {
    setLoading({ ...loading, facturas: true });
    try {
      const res = await authFetch("/api/admin/integridad");
      if (!res.ok) throw new Error("Error en la autenticación");
      const data = await res.json();
      setResFacturas(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading((prev) => ({ ...prev, facturas: false }));
    }
  };

  const verificarEventos = async () => {
    setLoading({ ...loading, eventos: true });
    try {
      const res = await authFetch("/api/admin/integridad-eventos");
      if (!res.ok) throw new Error("Error en la autenticación");
      const data = await res.json();
      setResEventos(data);
      if (!res.ok) return;

      if (!data.ok) {
        const usuariosRotos = data.detalle.filter((u) => !u.ok);
        setUsuariosRotos(usuariosRotos);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading((prev) => ({ ...prev, eventos: false }));
    }
  };
  const activarMantenimiento = async () => {
    const confirmar = window.confirm(
      "⚠️ Esto activará el modo mantenimiento.\n\nSe bloquearán acciones sensibles.\n\n¿Deseas continuar?",
    );

    if (!confirmar) return;

    try {
      const res = await authFetch("/api/admin/mantenimiento/activar", {
        method: "POST",
      });

      if (!res.ok) {
        alert("Error activando modo mantenimiento");
        return;
      }

      alert("Modo mantenimiento activado correctamente");

      // Opcional: recargar estado o refrescar página
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Error activando modo mantenimiento");
    }
  };
  const hayErrores =
    (resFacturas && !resFacturas.ok) || (resEventos && !resEventos.ok);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 5 },
        borderRadius: 4,
        border: "1px solid #eee",
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        Auditoría de Integridad
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Verificación del encadenamiento VeriFactu y trazabilidad de eventos.
      </Typography>

      {/* ============================ */}
      {/* BLOQUES DE VERIFICACIÓN */}
      {/* ============================ */}

      <Box sx={{ display: "grid", gap: 4 }}>
        {/* FACTURACIÓN */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid #eee",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Registros de Facturación
          </Typography>

          <Button
            variant="contained"
            onClick={verificarFacturas}
            disabled={loading.facturas}
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
          >
            {loading.facturas ? "Analizando..." : "Ejecutar Verificación"}
          </Button>

          {resFacturas && (
            <>
              <Alert
                severity={resFacturas.ok ? "success" : "error"}
                sx={{ mb: 2 }}
              >
                {resFacturas.ok
                  ? "Sistema íntegro"
                  : "Error de integridad detectado"}
              </Alert>

              {resFacturas.detalle && resFacturas.detalle.length > 0 ? (
                <Stack spacing={1}>
                  {resFacturas.detalle.map((u) => (
                    <Box
                      key={u.usuario_id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #f0f0f0",
                        py: 1,
                      }}
                    >
                      <Typography variant="body2">
                        {u.email || `ID: ${u.usuario_id}`}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: u.ok ? "success.main" : "error.main",
                        }}
                      >
                        {u.ok ? "OK" : "ALTERADO"}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay registros de facturación para validar.
                </Typography>
              )}
            </>
          )}
        </Paper>

        {/* EVENTOS */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid #eee",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Logs de Eventos
          </Typography>

          <Button
            variant="contained"
            onClick={verificarEventos}
            disabled={loading.eventos}
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
          >
            {loading.eventos ? "Analizando..." : "Verificar Trazabilidad"}
          </Button>

          {resEventos && (
            <>
              <Alert
                severity={resEventos.ok ? "success" : "error"}
                sx={{ mb: 2 }}
              >
                {resEventos.ok ? "Logs validados" : "Logs corruptos"}
              </Alert>

              {resEventos.detalle && resEventos.detalle.length > 0 ? (
                <Stack spacing={1}>
                  {resEventos.detalle.map((u) => (
                    <Box
                      key={u.usuario_id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #f0f0f0",
                        py: 1,
                      }}
                    >
                      <Typography variant="body2">
                        ID Usuario: {u.usuario_id}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: u.ok ? "success.main" : "error.main",
                        }}
                      >
                        {u.ok ? "Íntegro" : "Roto"}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  El log de eventos está vacío.
                </Typography>
              )}
            </>
          )}
        </Paper>
      </Box>

      {/* ============================ */}
      {/* PROTOCOLO DE SEGURIDAD */}
      {/* ============================ */}

      {hayErrores && (
        <Alert severity="error" sx={{ mt: 4 }}>
          <Typography sx={{ fontWeight: 600, mb: 1 }}>
            Protocolo de seguridad activado
          </Typography>
          Se han detectado discrepancias en los hashes del sistema. Se
          recomienda revisar logs detallados o acudir a backups.
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                navigate("/admin/logs?estado=rotos");
              }}
            >
              Revisar Logs
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={activarMantenimiento}
            >
              Bloquear Sistema
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                navigate("/admin/backups");
              }}
            >
              Ir a Backups
            </Button>
          </Stack>
        </Alert>
      )}
    </Paper>
  );
};
export default AdminIntegridad;

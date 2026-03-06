import { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";
import { Paper, Typography, Button, Stack, Alert } from "@mui/material";

function IntegridadEventos() {
  const [estado, setEstado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarEstado() {
      try {
        const res = await authFetch("/api/integridad-eventos");
        const data = await res.json();
        setEstado(data);
      } catch {
        setError("Error comprobando la integridad de la cadena de eventos");
      } finally {
        setCargando(false);
      }
    }

    cargarEstado();
  }, []);

  async function iniciarCadena() {
    const confirmar = window.confirm(
      "Esta acción inicia una nueva cadena de auditoría. Las cadenas anteriores no se eliminan. ¿Deseas continuar?",
    );

    if (!confirmar) return;

    try {
      const res = await authFetch("/api/admin/iniciar-cadena-eventos", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error iniciando la nueva cadena");
        return;
      }

      setMensaje("Nueva cadena de auditoría iniciada correctamente");
      setEstado({ iniciada: true });
    } catch {
      setError("Error de conexión con el servidor");
    }
  }

  if (cargando) return <Typography>Comprobando integridad…</Typography>;

  return (
    <Paper
      elevation={3}
      sx={{
        mt: 4,
        p: 4,
        borderRadius: 4,
        border: "1px solid #eee",
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Integridad y auditoría
      </Typography>

      <Stack spacing={2}>
        {estado?.ok && (
          <Alert severity="success">Cadena de eventos íntegra</Alert>
        )}

        {estado && estado.ok === false && (
          <Alert severity="error">La cadena presenta inconsistencias</Alert>
        )}

        <Button
          onClick={iniciarCadena}
          sx={{
            alignSelf: "flex-start",
            px: 4,
            py: 1.5,
            fontSize: "0.95rem",
            bgcolor: "#dc2626",
            fontWeight: 600,
            textTransform: "none",
            transition: "all 0.2s ease",

            "&:hover": {
              bgcolor: "#b91c1c",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            },
          }}
        >
          Iniciar nueva cadena de auditoría
        </Button>

        <Typography variant="body2" color="text.secondary">
          Esta acción se utiliza únicamente ante cambios técnicos o correcciones
          del sistema.
        </Typography>

        {mensaje && <Alert severity="success">{mensaje}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </Paper>
  );
}

export default IntegridadEventos;

import { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";
import {
  Button,
  Box,
  Paper,
  Alert,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
} from "@mui/material";
function Tarifas() {
  const [estadoSuscripcion, setEstadoSuscripcion] = useState(null);
  useEffect(() => {
    async function cargarSuscripcion() {
      try {
        const res = await authFetch(
          "http://localhost:3000/api/user/subscription/status",
        );
        const data = await res.json();
        setEstadoSuscripcion(data);
      } catch {
        setError("Error cargando suscripción");
      }
    }

    cargarSuscripcion();
  }, []);
  async function cambiarEstado(estado) {
    try {
      const res = await authFetch(
        "http://localhost:3000/api/user/subscription/state",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error cambiando estado");
        return;
      }

      setEstadoSuscripcion((prev) => ({
        ...prev,
        estadoSuscripcion: estado,
      }));
    } catch {
      alert("Error de conexión");
    }
  }

  async function cambiarPlan(plan) {
    try {
      const res = await authFetch(
        "http://localhost:3000/api/user/subscription/change",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error cambiando plan");
        return;
      }

      setEstadoSuscripcion((prev) => ({
        ...prev,
        plan,
        limite: data.limite,
      }));
    } catch {
      alert("Error de conexión");
    }
  }
  if (!estadoSuscripcion) {
    return <p>Cargando datos de suscripción...</p>;
  }
  return (
    <Grid container spacing={4} alignItems="stretch">
      <Grid
        item
        xs={12}
        md={4.8} // 4.8 / 12 es exactamente el 40%
        sx={{
          display: "flex",
          flexBasis: { md: "40%" }, // Forzamos el 40% en pantallas medianas+
          maxWidth: { md: "40%" },
        }}
      >
        <Paper
          sx={{
            flex: 1,
            p: 4,
            borderRadius: 4,
            boxShadow: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h4" gutterBottom>
            Tu suscripción
          </Typography>

          <Chip label="ACTIVA" color="success" sx={{ mb: 3 }} />

          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {estadoSuscripcion.facturasEsteMes} / {estadoSuscripcion.limite}
          </Typography>

          <LinearProgress
            variant="determinate"
            value={
              (estadoSuscripcion.facturasEsteMes / estadoSuscripcion.limite) *
              100
            }
            sx={{ mt: 2, height: 8, borderRadius: 5 }}
          />

          <Box sx={{ mt: 3 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "1rem" }}
            >
              Se reinicia el día 1 de cada mes
            </Typography>
          </Box>
          {estadoSuscripcion.estadoSuscripcion !== "ACTIVA" && (
            <p style={{ color: "red" }}>
              Tu suscripción no está activa. No puedes registrar nuevas
              facturas.
            </p>
          )}
          {estadoSuscripcion &&
            estadoSuscripcion.facturasEsteMes >= estadoSuscripcion.limite && (
              <p style={{ color: "red" }}>
                Has alcanzado el límite de tu plan actual.
              </p>
            )}
          {estadoSuscripcion &&
            estadoSuscripcion.facturasEsteMes >= estadoSuscripcion.limite - 1 &&
            estadoSuscripcion.facturasEsteMes < estadoSuscripcion.limite && (
              <p style={{ color: "orange" }}>
                Estás a punto de alcanzar el límite mensual.
              </p>
            )}
          {/*<div>
      <h2>Gestión de tarifas</h2>
      <h3>Planes disponibles</h3>
      {estadoSuscripcion && (
        <p>
          Facturas registradas este mes:{" "}
          <strong>
            {estadoSuscripcion.facturasEsteMes} / {estadoSuscripcion.limite}
          </strong>
        </p>
      )}
      <p>
        Estado de la suscripción:{" "}
        <strong>{estadoSuscripcion.estadoSuscripcion}</strong>
      </p>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => cambiarEstado("ACTIVA")}
        sx={{ mr: 1 }}
      >
        Activa
      </Button>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => cambiarEstado("PENDIENTE")}
        sx={{ mr: 1 }}
      >
        Pendiente
      </Button>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => cambiarEstado("VENCIDA")}
        sx={{ mr: 1 }}
      >
        Vencida
      </Button>
      */}
        </Paper>
      </Grid>
      <Grid
        item
        xs={12}
        md={7.2} // 7.2 / 12 es exactamente el 60%
        sx={{
          display: "flex",
          flexBasis: { md: "57%" }, // Forzamos el 60% en pantallas medianas+
          maxWidth: { md: "60%" },
        }}
      >
        <Paper sx={{ flex: 1, p: 4, borderRadius: 4, boxShadow: 1 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Planes disponibles
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 3 }}>
            <Table>
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
                      Plan
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
                      Precio
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
                      Acción
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>0–5 facturas </TableCell>
                  <TableCell>Gratuito </TableCell>
                  <TableCell>
                    {estadoSuscripcion.plan === "GRATUITO" ? (
                      <Button variant="contained" disabled size="small">
                        Activo
                      </Button>
                    ) : (
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
                        size="small"
                        onClick={() => cambiarPlan("GRATUITO")}
                      >
                        Cambiar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>6–10 facturas </TableCell>
                  <TableCell>9 € </TableCell>
                  <TableCell>
                    {estadoSuscripcion.plan === "BASICO" ? (
                      <Button variant="contained" disabled size="small">
                        Activo
                      </Button>
                    ) : (
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
                        size="small"
                        onClick={() => cambiarPlan("BASICO")}
                      >
                        Cambiar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>11–20 facturas </TableCell>
                  <TableCell>15 € </TableCell>
                  <TableCell>
                    {estadoSuscripcion.plan === "PRO" ? (
                      <Button variant="contained" disabled size="small">
                        Activo
                      </Button>
                    ) : (
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
                        size="small"
                        onClick={() => cambiarPlan("PRO")}
                      >
                        Cambiar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Tarifas;

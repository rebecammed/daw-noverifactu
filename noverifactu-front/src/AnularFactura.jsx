import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authFetch } from "./utils/authFetch";

import {
  Paper,
  Typography,
  Box,
  Grid,
  Stack,
  TextField,
  Button,
  Alert,
} from "@mui/material";
function AnularFactura() {
  const { id } = useParams();
  const facturaOrigenId = Number(id);
  const navigate = useNavigate();
  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [motivo, setMotivo] = useState("");
  const [anulada, setAnulada] = useState(false);
  const [errores, setErrores] = useState([]);

  useEffect(() => {
    if (anulada) {
      navigate("/registro");
    }
  }, [anulada, navigate]);

  useEffect(() => {
    if (!facturaOrigenId) {
      setErrores(["ID de factura no válido"]);
      setLoading(false);
      return;
    }

    authFetch(`/api/facturas/${facturaOrigenId}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setFactura(data);
        setLoading(false);
      })
      .catch(() => {
        setErrores(["No se pudo cargar la factura"]);
        setLoading(false);
      });
  }, [facturaOrigenId]);

  async function enviarAnulacion(e) {
    e.preventDefault();
    setErrores([]);

    try {
      const res = await authFetch(
        `/api/facturas/${facturaOrigenId}/anulacion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ motivo }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrores(data.error ? [data.error] : ["Error anulando factura"]);
        return;
      }

      // 🔹 NO necesitas data aquí
      alert("Factura anulada correctamente");
      setAnulada(true);
    } catch (error) {
      setErrores(["Error de conexión con el servidor"]);
    }
  }

  if (loading) return <p>Cargando factura original...</p>;
  if (errores.length) return <p>Error: {errores.join(", ")}</p>;
  if (!factura) return <p>No hay datos</p>;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 4 },
        borderRadius: 4,
        border: "1px solid #eee",
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>
        Anular factura
      </Typography>

      {/* ========================= */}
      {/* FACTURA ORIGINAL */}
      {/* ========================= */}

      <Box sx={{ mb: 5 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Factura original
        </Typography>

        <Grid container columnSpacing={4}>
          <Grid item xs={12} md="auto">
            <Stack spacing={1}>
              <Typography>
                <strong>ID:</strong> {facturaOrigenId}
              </Typography>

              <Typography>
                <strong>Número:</strong> {factura.numero_factura}
              </Typography>

              <Typography>
                <strong>Fecha:</strong>{" "}
                {new Date(factura.fecha_expedicion).toLocaleString()}
              </Typography>

              <Typography>
                <strong>Importe total:</strong>{" "}
                {Number(factura.importe_total).toFixed(2)} €
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* ========================= */}
      {/* FORMULARIO ANULACIÓN */}
      {/* ========================= */}

      <Box component="form" onSubmit={enviarAnulacion}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Datos de la anulación
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Motivo de la anulación"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </Grid>
        </Grid>

        {/* ========================= */}
        {/* ERRORES */}
        {/* ========================= */}

        {errores.length > 0 && (
          <Box sx={{ mt: 3 }}>
            {errores.map((e, i) => (
              <Alert severity="error" key={i} sx={{ mb: 1 }}>
                {e}
              </Alert>
            ))}
          </Box>
        )}

        {/* ========================= */}
        {/* BOTONES */}
        {/* ========================= */}

        <Stack
          direction="row"
          spacing={3}
          justifyContent="flex-end"
          sx={{ mt: 4 }}
        >
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => navigate(`/registro/${facturaOrigenId}`)}
          >
            Cancelar
          </Button>

          <Button type="submit" variant="contained" color="error">
            Registrar anulación
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}

export default AnularFactura;

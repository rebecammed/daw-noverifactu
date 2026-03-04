import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function Dashboard({ usuario }) {
  const [suscripcion, setSuscripcion] = useState(null);
  const [sifActivo, setSifActivo] = useState(false);
  const [usuarioData, setUsuarioData] = useState(null);
  const [totales, setTotales] = useState({
    facturasMes: 0,
    totalFacturas: 0,
    totalFacturado: 0,
  });

  console.log(usuario);

  const [grafico, setGrafico] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const userRes = await authFetch("/api/usuarios/me");

      const userData = await userRes.json();
      setUsuarioData(userData);
      console.log(userData);
      const subRes = await authFetch("/api/user/subscription/status");
      const subData = await subRes.json();
      setSuscripcion(subData);

      const factRes = await authFetch("/api/facturas?limit=1000");
      const factData = await factRes.json();

      const lista = factData.facturas || [];

      let totalFacturado = 0;

      const facturasPorMes = {};

      lista.forEach((f) => {
        const importe = Number(f.importe_total);
        totalFacturado += importe;

        const fecha = new Date(f.fecha_expedicion);
        const mes = fecha.toLocaleString("es-ES", { month: "short" });

        if (!facturasPorMes[mes]) facturasPorMes[mes] = 0;
        facturasPorMes[mes] += importe;
      });

      const graficoData = Object.keys(facturasPorMes).map((mes) => ({
        mes,
        total: facturasPorMes[mes],
      }));

      setGrafico(graficoData);

      setTotales({
        facturasMes: subData.facturasEsteMes,
        totalFacturas: lista.length,
        totalFacturado,
      });

      const sifRes = await authFetch("/api/sif");
      const sifData = await sifRes.json();

      setSifActivo(sifData.sifActivo);
    } catch (err) {
      console.error("Error cargando dashboard", err);
    }
  }

  if (!suscripcion) return null;

  return (
    <Box p={3} sx={{ flexGrow: 1 }}>
      {/* BIENVENIDA */}
      <Typography variant="h4" mb={4}>
        Bienvenido, {usuarioData?.nombre || "usuario"}
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          mb: 4,
          width: "100%",
        }}
      >
        <Card
          sx={{
            flex: 1,
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <CardContent>
            <Typography variant="h6">Facturas este mes</Typography>
            <Typography variant="h4">{totales.facturasMes}</Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: 1,
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <CardContent>
            <Typography variant="h6">Facturas totales</Typography>
            <Typography variant="h4">{totales.totalFacturas}</Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: 1,
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <CardContent>
            <Typography variant="h6">Total facturado</Typography>
            <Typography variant="h4">
              {totales.totalFacturado.toFixed(2)} €
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* GRÁFICO */}

      {/* SUSCRIPCIÓN */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          width: "100%",
        }}
      >
        <Card
          sx={{
            flex: 1,
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Estado de suscripción
            </Typography>

            <Chip
              label={`${suscripcion.plan} - ${suscripcion.estadoSuscripcion}`}
              color={
                suscripcion.estadoSuscripcion === "ACTIVA" ? "success" : "error"
              }
              sx={{ mb: 2 }}
            />

            <Typography variant="h4">
              {suscripcion.facturasEsteMes} / {suscripcion.limite}
            </Typography>

            <LinearProgress
              variant="determinate"
              value={(suscripcion.facturasEsteMes / suscripcion.limite) * 100}
              sx={{ mt: 2, height: 8, borderRadius: 5 }}
            />

            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 500,
                color: "text.secondary",
                mt: 2,
                display: "block",
              }}
            >
              El contador se reinicia el día 1 de cada mes
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: 1,
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <CardContent>
            <Typography variant="h6">Software de facturación (SIF)</Typography>

            {sifActivo ? (
              <>
                <Chip
                  label="SIF ACTIVO"
                  color="success"
                  sx={{ mt: 2, mb: 2 }}
                />

                <Typography
                  sx={{
                    fontSize: "1rem",
                    fontWeight: 500,
                    color: "text.secondary",
                  }}
                >
                  Nombre: {sifActivo.nombre}
                </Typography>
              </>
            ) : (
              <Chip label="NO CONFIGURADO" color="warning" sx={{ mt: 2 }} />
            )}
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ mb: 4 }}>
        <Card
          sx={{
            flex: 1,
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Facturación mensual
            </Typography>

            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={grafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#1976d2"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default Dashboard;

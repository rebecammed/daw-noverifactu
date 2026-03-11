import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  TextField,
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

  const [filtroMes, setFiltroMes] = useState("");
  const [filtroAnio, setFiltroAnio] = useState("");

  const [facturas, setFacturas] = useState([]);
  const [mediaFacturasMes, setMediaFacturasMes] = useState(0);

  const [totales, setTotales] = useState({
    facturasMes: 0,
    facturasAnio: 0,
    totalFacturas: 0,
  });

  const [grafico, setGrafico] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    calcularEstadisticas();
  }, [facturas, filtroMes, filtroAnio]);

  async function cargarDatos() {
    try {
      const userRes = await authFetch("/api/user/me");
      const userData = await userRes.json();
      setUsuarioData(userData);

      const subRes = await authFetch("/api/user/subscription/status");
      const subData = await subRes.json();
      setSuscripcion(subData);

      const factRes = await authFetch("/api/facturas?limit=1000");
      const factData = await factRes.json();

      const lista = factData.facturas || [];
      setFacturas(lista);

      const sifRes = await authFetch("/api/sif");
      const sifData = await sifRes.json();
      setSifActivo(sifData.sifActivo);
    } catch (err) {
      console.error("Error cargando dashboard", err);
    }
  }

  function calcularEstadisticas() {
    let lista = [...facturas];

    if (filtroAnio) {
      lista = lista.filter(
        (f) =>
          new Date(f.fecha_expedicion).getFullYear() === Number(filtroAnio),
      );
    }

    if (filtroMes) {
      lista = lista.filter(
        (f) =>
          new Date(f.fecha_expedicion).getMonth() + 1 === Number(filtroMes),
      );
    }

    const ahora = new Date();

    let facturasMes = 0;
    let facturasAnio = 0;

    const facturasPorMes = {};
    const mesesUnicos = new Set();

    lista.forEach((f) => {
      const fecha = new Date(f.fecha_expedicion);

      const mes = fecha.getMonth();
      const anio = fecha.getFullYear();
      const mesNombre = fecha.toLocaleString("es-ES", { month: "short" });

      if (!facturasPorMes[mesNombre]) facturasPorMes[mesNombre] = 0;
      facturasPorMes[mesNombre]++;

      if (mes === ahora.getMonth() && anio === ahora.getFullYear()) {
        facturasMes++;
      }

      if (anio === ahora.getFullYear()) {
        facturasAnio++;
      }

      const key = `${anio}-${mes}`;
      mesesUnicos.add(key);
    });

    const totalFacturas = lista.length;

    const media = mesesUnicos.size > 0 ? totalFacturas / mesesUnicos.size : 0;

    const graficoData = Object.keys(facturasPorMes).map((mes) => ({
      mes,
      total: facturasPorMes[mes],
    }));

    setGrafico(graficoData);

    setTotales({
      facturasMes,
      facturasAnio,
      totalFacturas,
    });

    setMediaFacturasMes(media);
  }

  if (!suscripcion) return null;

  return (
    <Box p={3} sx={{ flexGrow: 1 }}>
      <Typography variant="h4" mb={4}>
        Bienvenido, {usuarioData?.nombre || "usuario"}
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Año"
          type="number"
          value={filtroAnio}
          onChange={(e) => setFiltroAnio(e.target.value)}
        />

        <TextField
          label="Mes"
          type="number"
          value={filtroMes}
          onChange={(e) => setFiltroMes(e.target.value)}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          mb: 4,
          width: "100%",
        }}
      >
        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6">Facturas / mes</Typography>
            <Typography variant="h4">{totales.facturasMes}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6">Facturas / año</Typography>
            <Typography variant="h4">{totales.facturasAnio}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6">Facturas totales</Typography>
            <Typography variant="h4">{totales.totalFacturas}</Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: "flex", gap: 3, width: "100%" }}>
        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6">Suscripción</Typography>

              <Chip
                label={`${suscripcion.plan}-${suscripcion.estadoSuscripcion}`}
                color={
                  suscripcion.estadoSuscripcion === "ACTIVA"
                    ? "success"
                    : "error"
                }
              />
            </Box>

            <Typography sx={{ mt: 2 }}>
              Media facturas / mes: {mediaFacturasMes.toFixed(1)}
            </Typography>

            <Typography variant="h4">
              {suscripcion.facturasEsteMes} / {suscripcion.limite}
            </Typography>

            <LinearProgress
              variant="determinate"
              value={(suscripcion.facturasEsteMes / suscripcion.limite) * 100}
              sx={{ mt: 2, height: 8, borderRadius: 5 }}
            />

            <Typography sx={{ mt: 2, color: "text.secondary" }}>
              El contador se reinicia el día 1 de cada mes
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6">Software de facturación (SIF)</Typography>

            {sifActivo ? (
              <>
                <Chip
                  label="SIF ACTIVO"
                  color="success"
                  sx={{ mt: 2, mb: 2 }}
                />

                <Typography color="text.secondary">
                  Nombre: {sifActivo.nombre}
                </Typography>
              </>
            ) : (
              <Chip label="NO CONFIGURADO" color="warning" sx={{ mt: 2 }} />
            )}
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Card sx={{ borderRadius: 3 }}>
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

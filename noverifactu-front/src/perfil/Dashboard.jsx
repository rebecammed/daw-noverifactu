import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
} from "@mui/material";
import { useEffect, useState, useMemo } from "react";
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

const MESES = [
  { value: 1, label: "Ene" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Abr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Ago" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dic" },
];

function Dashboard({ usuario }) {
  const [suscripcion, setSuscripcion] = useState(null);
  const [sifActivo, setSifActivo] = useState(false);
  const [usuarioData, setUsuarioData] = useState(null);

  const [facturas, setFacturas] = useState([]);
  const hoy = new Date();
  const anioActual = hoy.getFullYear();
  const mesActual = hoy.getMonth() + 1;
  const [filtroMes, setFiltroMes] = useState(mesActual);
  const [filtroAnio, setFiltroAnio] = useState(anioActual);

  useEffect(() => {
    cargarDatos();
  }, []);

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

      setFacturas(factData.facturas || []);

      const sifRes = await authFetch("/api/sif");
      const sifData = await sifRes.json();
      setSifActivo(sifData.sifActivo);
    } catch (err) {
      console.error("Error cargando dashboard", err);
    }
  }
  const aniosDisponibles = useMemo(() => {
    const set = new Set();
    facturas.forEach((f) => {
      const anio = new Date(f.fecha_expedicion).getFullYear();
      set.add(anio);
    });
    if (set.size === 0) {
      set.add(anioActual);
    }
    return Array.from(set).sort((a, b) => b - a);
  }, [facturas]);

  const totalFacturas = facturas.length;
  const facturasPorAnio = useMemo(() => {
    return facturas.filter(
      (f) => new Date(f.fecha_expedicion).getFullYear() === filtroAnio,
    ).length;
  }, [facturas, filtroAnio]);
  const facturasPorMes = useMemo(() => {
    return facturas.filter((f) => {
      const fecha = new Date(f.fecha_expedicion);
      return (
        fecha.getFullYear() === filtroAnio && fecha.getMonth() + 1 === filtroMes
      );
    }).length;
  }, [facturas, filtroAnio, filtroMes]);

  const mediaFacturasMes = useMemo(() => {
    let lista = facturas;
    if (filtroAnio) {
      lista = facturas.filter(
        (f) => new Date(f.fecha_expedicion).getFullYear() === filtroAnio,
      );
    }
    const meses = new Set();
    lista.forEach((f) => {
      const d = new Date(f.fecha_expedicion);
      meses.add(`${d.getFullYear()}-${d.getMonth()}`);
    });
    return meses.size ? lista.length / meses.size : 0;
  }, [facturas, filtroAnio]);

  /*const grafico = useMemo(() => {
    const datos = {};
    facturas.forEach((f) => {
      const fecha = new Date(f.fecha_expedicion);
      const anio = fecha.getFullYear();
      if (anio !== filtroAnio) return;
      const mes = fecha.getMonth() + 1;
      if (!datos[mes]) datos[mes] = 0;
      datos[mes]++;
    });
    return MESES.map((m) => ({ mes: m.label, total: datos[m.value] || 0 }));
  }, [facturas, filtroAnio]);*/
  const grafico = useMemo(() => {
    const datos = {};

    facturas.forEach((f) => {
      const fecha = new Date(f.fecha_expedicion);
      const anio = fecha.getFullYear();

      if (anio !== filtroAnio) return;

      const mes = fecha.getMonth() + 1;

      if (!datos[mes]) datos[mes] = 0;
      datos[mes]++;
    });

    const hoy = new Date();
    const resultado = [];

    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const mes = fecha.getMonth() + 1;

      resultado.push({
        mes: MESES[mes - 1].label,
        total: datos[mes] || 0,
      });
    }

    return resultado;
  }, [facturas, filtroAnio]);
  function limpiarFiltros() {
    setFiltroAnio(anioActual);
    setFiltroMes(mesActual);
  }

  if (!suscripcion) return null;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, flexGrow: 1 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
          mb: 4,
        }}
      >
        <Typography variant="h4" mb={4}>
          Bienvenido, {usuarioData?.nombre || "usuario"}
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            mb: 4,
            flexDirection: { xs: "row", md: "row" },
            flexWrap: { xs: "wrap", md: "nowrap" },
            alignItems: "center",
            justifyContent: { xs: "flex-start", md: "flex-end" },
          }}
        >
          <FormControl
            size="small"
            sx={{
              minWidth: { xs: "48%", md: 160 },
            }}
          >
            <InputLabel>Mes</InputLabel>
            <Select
              value={filtroMes}
              label="Mes"
              onChange={(e) => setFiltroMes(Number(e.target.value))}
            >
              {MESES.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: { xs: "48%", sm: 140 } }}>
            <InputLabel>Año</InputLabel>
            <Select
              value={filtroAnio}
              label="Año"
              onChange={(e) => setFiltroAnio(Number(e.target.value))}
            >
              {aniosDisponibles.map((a) => (
                <MenuItem key={a} value={a}>
                  {a}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={limpiarFiltros}>
            Limpiar
          </Button>
        </Box>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6">Facturas / mes</Typography>
              <Typography variant="h4">{facturasPorMes}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6">Facturas / año</Typography>
              <Typography variant="h4">{facturasPorAnio}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6">Facturas totales</Typography>
              <Typography variant="h4">{totalFacturas}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: { xs: 1, md: 0 } }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
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
                Media facturas / mes: {Math.floor(mediaFacturasMes)}
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
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ flex: 1, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6">
                Software de facturación (SIF)
              </Typography>

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
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, width: "100%" }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ px: { xs: 2, md: 2 } }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Facturación mensual
            </Typography>

            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={grafico}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#1976d2"
                  strokeWidth={3}
                  dot={{ r: 4 }}
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

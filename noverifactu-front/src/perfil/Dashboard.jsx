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
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
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
    return MESES.map((m) => ({ mes: m.label, total: datos[m.value] || 0 }));
  }, [facturas, filtroAnio]);
  function limpiarFiltros() {
    setFiltroAnio(anioActual);
    setFiltroMes(mesActual);
  }

  if (!suscripcion) return null;

  return (
    <Box p={3} sx={{ flexGrow: 1 }}>
      <Typography variant="h4" mb={4}>
        Bienvenido, {usuarioData?.nombre || "usuario"}
      </Typography>

      <Box
        display="flex"
        gap={2}
        mb={4}
        alignItems="center"
        justifyContent="flex-end"
      >
        <FormControl sx={{ minWidth: 160 }}>
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
        <FormControl sx={{ minWidth: 140 }}>
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
            <Typography variant="h4">{facturasPorMes}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6">Facturas / año</Typography>
            <Typography variant="h4">{facturasPorAnio}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6">Facturas totales</Typography>
            <Typography variant="h4">{totalFacturas}</Typography>
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

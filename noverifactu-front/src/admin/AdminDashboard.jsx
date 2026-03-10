import { Box, Typography, Card, CardContent, Chip, Paper } from "@mui/material";

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
const API_URL = import.meta.env.VITE_API_URL;
function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [sifGlobal, setSifGlobal] = useState(null);
  const [estadoSistema, setEstadoSistema] = useState(null);

  const [integridadFacturacion, setIntegridadFacturacion] = useState(null);
  const [integridadEventos, setIntegridadEventos] = useState(null);

  const [ultimoBackup, setUltimoBackup] = useState(null);

  const [logs, setLogs] = useState([]);
  const [grafico, setGrafico] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      // Stats
      const statsRes = await authFetch("/api/admin/stats");
      const statsData = await statsRes.json();
      setStats(statsData);

      // Facturación mensual
      const grafRes = await authFetch("/api/admin/facturacion-mensual");

      if (!grafRes.ok) {
        console.error("Error cargando gráfico");
        setGrafico([]);
      } else {
        const grafData = await grafRes.json();
        setGrafico(Array.isArray(grafData) ? grafData : []);
      }

      // SIF
      const sifRes = await authFetch("/api/admin/sif");
      const sifData = await sifRes.json();

      const global = sifData.sif?.find((s) => s.es_global === 1);
      setSifGlobal(global);

      // Estado sistema
      const statusRes = await fetch(`${API_URL}/api/status`);
      const statusData = await statusRes.json();
      setEstadoSistema(statusData);

      // Integridad facturación
      const intRes = await authFetch("/api/admin/integridad");
      const intData = await intRes.json();
      setIntegridadFacturacion(intData);

      // Integridad eventos
      const intEvRes = await authFetch("/api/admin/integridad-eventos");
      const intEvData = await intEvRes.json();
      setIntegridadEventos(intEvData);

      // Backups
      const backupsRes = await authFetch("/api/admin/backups");
      const backupsData = await backupsRes.json();

      if (backupsData.backups?.length > 0) {
        setUltimoBackup(backupsData.backups[0]);
      }

      // Logs recientes
      const logsRes = await authFetch("/api/admin/logs-recientes");
      const logsData = await logsRes.json();
      setLogs(logsData);
    } catch (err) {
      console.error("Error cargando dashboard admin", err);
    }
  }

  if (!stats) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 5 },
        borderRadius: 4,
        border: "1px solid #eee",
      }}
    >
      <Box p={3} sx={{ flexGrow: 1 }}>
        {/* TÍTULO */}

        <Typography variant="h4" mb={4}>
          Dashboard Administración
        </Typography>

        {/* MÉTRICAS */}

        <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
          <Card
            sx={{
              flex: 1,
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <CardContent>
              <Typography variant="h6">Usuarios activos</Typography>
              <Typography variant="h4">{stats.usuarios}</Typography>
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
              <Typography variant="h4">{stats.facturas}</Typography>
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
              <Typography variant="h6">Facturación total</Typography>
              <Typography variant="h4">
                {Number(stats.totalFacturado).toFixed(2)} €
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* SISTEMA + SIF */}

        <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
          <Card
            sx={{
              flex: 1,
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estado del sistema
              </Typography>

              {estadoSistema?.mantenimiento ? (
                <Chip
                  label="MODO MANTENIMIENTO"
                  color="warning"
                  sx={{ mt: 2 }}
                />
              ) : (
                <Chip label="SISTEMA ACTIVO" color="success" sx={{ mt: 2 }} />
              )}
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
              <Typography variant="h6">
                Software de facturación (SIF)
              </Typography>

              {sifGlobal ? (
                <>
                  <Chip
                    label="SIF GLOBAL"
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
                    Nombre: {sifGlobal.nombre}
                  </Typography>

                  <Typography
                    sx={{ fontSize: "0.9rem", color: "text.secondary" }}
                  >
                    Versión: {sifGlobal.version}
                  </Typography>
                </>
              ) : (
                <Chip label="NO CONFIGURADO" color="warning" sx={{ mt: 2 }} />
              )}
            </CardContent>
          </Card>
        </Box>

        {/* INTEGRIDAD Y BACKUPS */}

        <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
          <Card
            sx={{
              flex: 1,
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Integridad del sistema
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 6,
                  mt: 2,
                  alignItems: "center",
                }}
              >
                {/* FACTURACIÓN */}
                <Box>
                  <Typography sx={{ mb: 1 }}>Facturación</Typography>

                  <Chip
                    label={integridadFacturacion?.ok ? "OK" : "ERROR"}
                    color={integridadFacturacion?.ok ? "success" : "error"}
                    size="small"
                  />
                </Box>

                {/* EVENTOS */}
                <Box>
                  <Typography sx={{ mb: 1 }}>Eventos</Typography>

                  <Chip
                    label={integridadEventos?.ok ? "OK" : "ERROR"}
                    color={integridadEventos?.ok ? "success" : "error"}
                    size="small"
                  />
                </Box>
              </Box>
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
              <Typography variant="h6" gutterBottom>
                Último backup
              </Typography>

              {ultimoBackup ? (
                <>
                  <Chip
                    label="BACKUP DISPONIBLE"
                    color="success"
                    sx={{ mt: 2, mb: 2 }}
                  />

                  <Typography sx={{ fontSize: "1rem", fontWeight: 500 }}>
                    {new Date(ultimoBackup.fecha).toLocaleString()}
                  </Typography>

                  <Typography
                    sx={{ fontSize: "0.9rem", color: "text.secondary" }}
                  >
                    {(ultimoBackup.tamañoTotal / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </>
              ) : (
                <Chip label="SIN BACKUPS" color="warning" sx={{ mt: 2 }} />
              )}
            </CardContent>
          </Card>
        </Box>

        {/* ACTIVIDAD */}

        <Card
          sx={{
            borderRadius: 3,
            mb: 4,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Actividad reciente
            </Typography>

            {logs.length === 0 && (
              <Typography color="text.secondary">
                No hay actividad reciente
              </Typography>
            )}

            {logs.map((log, i) => (
              <Typography key={i}>
                • {log.tipo_evento} —{" "}
                {new Date(log.fecha_evento).toLocaleString()}
              </Typography>
            ))}
          </CardContent>
        </Card>

        {/* GRÁFICO */}

        <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Facturación mensual global
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
    </Paper>
  );
}

export default AdminDashboard;

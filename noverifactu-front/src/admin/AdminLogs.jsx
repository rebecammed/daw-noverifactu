import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Select,
  MenuItem,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  Stack,
} from "@mui/material";
import { authFetch } from "../utils/authFetch";

function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const estadoParam = searchParams.get("estado");

    if (estadoParam === "rotos") {
      setFiltroEstado("ROTOS");
    } else if (estadoParam === "integros") {
      setFiltroEstado("INTEGROS");
    } else {
      setFiltroEstado("TODOS");
    }
  }, [searchParams]);

  useEffect(() => {
    cargarResumen();
  }, []);

  async function cargarResumen() {
    try {
      const res = await authFetch("/api/admin/logs-resumen");

      if (!res.ok) {
        console.error("Error cargando logs resumen");
        return;
      }

      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error("Error conexión logs:", error);
    }
  }

  const logsFiltrados = logs.filter((l) => {
    if (filtroEstado === "ROTOS" && l.integridad_ok) return false;
    if (filtroEstado === "INTEGROS" && !l.integridad_ok) return false;

    if (busqueda && !l.email.toLowerCase().includes(busqueda.toLowerCase()))
      return false;

    return true;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Auditoría de Logs
        </Typography>

        <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
          <Select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <MenuItem value="TODOS">Todos</MenuItem>
            <MenuItem value="INTEGROS">Íntegros</MenuItem>
            <MenuItem value="ROTOS">Rotos</MenuItem>
          </Select>

          <TextField
            placeholder="Buscar por email"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </Stack>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Eventos</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Último Evento</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logsFiltrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No se encontraron resultados
                </TableCell>
              </TableRow>
            )}
            {logsFiltrados.map((l) => (
              <TableRow key={l.usuario_id}>
                <TableCell>{l.usuario_id}</TableCell>
                <TableCell>{l.email}</TableCell>
                <TableCell>{l.total_eventos}</TableCell>
                <TableCell>
                  {l.integridad_ok ? (
                    <Chip label="Íntegro" color="success" />
                  ) : (
                    <Chip label="Roto" color="error" />
                  )}
                </TableCell>
                <TableCell>{l.ultimo_evento}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/admin/logs/${l.usuario_id}`)}
                  >
                    Ver detalle
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}

export default AdminLogs;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Box,
  Button,
} from "@mui/material";
import { authFetch } from "../utils/authFetch";

function AdminLogsUsuario() {
  const { usuarioId } = useParams();
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    cargarEventos();
  }, [usuarioId]);

  async function cargarEventos() {
    const res = await authFetch(`/api/admin/logs/${usuarioId}`);
    const data = await res.json();
    setEventos(data.eventos);
  }
  async function resetearCadenaEventos(id) {
    const confirmar = window.confirm(
      "⚠️ Esta acción iniciará una NUEVA cadena de eventos para este usuario.\n\nEsta operación no elimina eventos anteriores pero crea un nuevo tramo de auditoría.\n\n¿Deseas continuar?",
    );

    if (!confirmar) return;

    try {
      const res = await authFetch(
        `/api/admin/usuarios/${id}/reset-cadena-eventos`,
        {
          method: "POST",
        },
      );

      if (!res.ok) {
        alert("Error reiniciando la cadena de eventos");
        return;
      }

      alert("Nueva cadena de eventos iniciada correctamente");
      await cargarEventos();
    } catch {
      alert("Error reiniciando la cadena de eventos");
    }
  }
  const cadenaIntegra = eventos.every((e) => e.integridad_ok);
  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Logs del usuario {usuarioId}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => resetearCadenaEventos(usuarioId)}
            disabled={cadenaIntegra}
          >
            Reset cadena eventos
          </Button>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {eventos.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Este usuario no tiene eventos registrados
                </TableCell>
              </TableRow>
            )}
            {eventos.map((e) => (
              <TableRow
                key={e.id}
                sx={{
                  backgroundColor:
                    e.tipo_evento === "INICIO_NUEVA_CADENA_EVENTOS"
                      ? "rgba(0,0,255,0.05)"
                      : e.integridad_ok
                        ? "inherit"
                        : "rgba(255,0,0,0.05)",
                }}
              >
                <TableCell>{e.num_evento}</TableCell>
                <TableCell>
                  {e.tipo_evento === "INICIO_NUEVA_CADENA_EVENTOS" ? (
                    <Chip label="INICIO NUEVA CADENA" color="primary" />
                  ) : (
                    e.tipo_evento
                  )}
                </TableCell>
                <TableCell>{e.fecha_evento}</TableCell>
                <TableCell>
                  {e.integridad_ok ? (
                    <Chip label="Íntegro" color="success" />
                  ) : (
                    <Chip label="Corrupto" color="error" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}

export default AdminLogsUsuario;

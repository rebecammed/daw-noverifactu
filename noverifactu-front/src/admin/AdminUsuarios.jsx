import { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";
import {
  Box,
  Typography,
  Button,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Autocomplete,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [estado, setEstado] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarUsuarios();
  }, [estado, empresa]);

  /*async function cargarUsuarios() {
    try {
      const res = await authFetch("/api/admin/usuarios");

      if (!res.ok) {
        throw new Error("Error cargando usuarios");
      }

      const data = await res.json();
      setUsuarios(data.usuarios || []);
      setLoading(false);
    } catch (e) {
      setError("Error cargando usuarios");
      setLoading(false);
    }
  }*/
  async function cargarUsuarios() {
    try {
      const params = new URLSearchParams();

      if (estado) params.append("estado", estado);
      if (empresa) params.append("empresa", empresa);

      const res = await authFetch(`/api/admin/usuarios?${params.toString()}`);

      if (!res.ok) {
        throw new Error("Error cargando usuarios");
      }

      const data = await res.json();
      setUsuarios(data.usuarios || []);
      setLoading(false);
    } catch (e) {
      setError("Error cargando usuarios");
      setLoading(false);
    }
  }

  async function toggleActivo(id, activoActual) {
    if (!window.confirm("¿Seguro que quieres cambiar el estado del usuario?"))
      return;

    try {
      const res = await authFetch(`/api/admin/usuarios/${id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !activoActual }),
      });

      if (!res.ok) {
        alert("Error actualizando usuario");
        return;
      }

      cargarUsuarios();
    } catch {
      alert("Error actualizando usuario");
    }
  }

  async function resetear2FA(id) {
    if (!window.confirm("¿Seguro que quieres resetear el 2FA del usuario?"))
      return;

    try {
      const res = await authFetch(`/api/admin/usuarios/${id}/reset-2fa`, {
        method: "PATCH",
      });

      const data = await res.json(); // Leemos la respuesta del servidor

      if (!res.ok) {
        // Ahora el alert nos dirá exactamente qué falló (ej: "Usuario no encontrado")
        alert(data.mensaje || "Error reseteando 2FA");
        return;
      }

      alert(data.mensaje);
      cargarUsuarios();
    } catch (error) {
      alert("Error de conexión con el servidor");
    }
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
    } catch {
      alert("Error reiniciando la cadena de eventos");
    }
  }

  if (loading) return <p>Cargando usuarios...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 5 },
        borderRadius: 4,
        border: "1px solid #eee",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Gestión de usuarios</Typography>

        <Box display="flex" gap={2} alignItems="center">
          {/* FILTRO ESTADO */}

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={estado}
              label="Estado"
              onChange={(e) => setEstado(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="activo">Activos</MenuItem>
              <MenuItem value="inactivo">Inactivos</MenuItem>
            </Select>
          </FormControl>

          {/* FILTRO EMPRESA */}

          <Autocomplete
            options={[
              ...new Set(usuarios.map((u) => u.razon_social).filter(Boolean)),
            ]}
            getOptionLabel={(option) => option || ""}
            sx={{ width: 260 }}
            value={empresa}
            onChange={(_, newValue) => setEmpresa(newValue || "")}
            renderInput={(params) => <TextField {...params} label="Empresa" />}
          />
        </Box>
        <Button
          variant="outlined"
          onClick={() => {
            setEstado("");
            setEmpresa("");
          }}
        >
          Limpiar
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          mt: 2,
          borderRadius: 4,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.100" }}>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "1rem", fontWeight: "550", color: "#374151" }}
                >
                  ID
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "1rem", fontWeight: "550", color: "#374151" }}
                >
                  Email
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "1rem", fontWeight: "550", color: "#374151" }}
                >
                  Nombre
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "1rem", fontWeight: "550", color: "#374151" }}
                >
                  Razón social
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "1rem", fontWeight: "550", color: "#374151" }}
                >
                  Activo
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "1rem", fontWeight: "550", color: "#374151" }}
                >
                  Facturas / mes
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "1rem", fontWeight: "550", color: "#374151" }}
                >
                  Último login
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "1rem", fontWeight: "550", color: "#374151" }}
                >
                  2FA
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "1rem", fontWeight: "550", color: "#374151" }}
                >
                  Acciones
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.id}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.nombre}</TableCell>
                <TableCell>{u.razon_social}</TableCell>
                <TableCell>
                  {u.activo ? (
                    <span style={{ color: "green" }}>Activo</span>
                  ) : (
                    <span style={{ color: "red" }}>Desactivado</span>
                  )}
                </TableCell>
                <TableCell>{u.media_facturas_mes}</TableCell>
                <TableCell>
                  {u.ultimo_login
                    ? new Date(u.ultimo_login).toLocaleString()
                    : "—"}
                </TableCell>
                <TableCell>
                  {u.twofa_enabled ? (
                    <span style={{ color: "green" }}>Activo</span>
                  ) : (
                    <span style={{ color: "gray" }}>No</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: "1rem",
                      borderColor: "#1a73e8",
                      color: "#1a73e8",
                      fontWeight: 600,
                      textTransform: "none",
                      transition: "all 0.2s ease",

                      "&:hover": {
                        bgcolor: "rgba(26,115,232,0.08)",
                        borderColor: "#155ec0",
                      },
                    }}
                    size="small"
                    onClick={() => toggleActivo(u.id, u.activo)}
                  >
                    {u.activo ? "Desactivar" : "Activar"}
                  </Button>

                  {u.twofa_enabled && (
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
                      onClick={() => resetear2FA(u.id)}
                    >
                      Reset 2FA
                    </Button>
                  )}

                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => resetearCadenaEventos(u.id)}
                    style={{
                      marginLeft: "5px",
                    }}
                  >
                    Reset cadena eventos
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default AdminUsuarios;

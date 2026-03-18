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
  TextField,
} from "@mui/material";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState(null);
  const [erroresValidacion, setErroresValidacion] = useState({});

  useEffect(() => {
    cargarClientes();
  }, []);

  async function cargarClientes() {
    try {
      const res = await authFetch("/api/clientes");
      const data = await res.json();
      setClientes(data.clientes || []);
    } catch {
      setError("Error cargando clientes");
    }
  }

  function editar(cliente) {
    setClienteEditando(cliente.id);
    setForm(cliente);
  }

  function cancelar() {
    setClienteEditando(null);
    setForm({});
  }

  async function guardar() {
    const nuevosErrores = {};

    if (!validarNIF(form.nif)) {
      nuevosErrores.nif = "NIF/CIF no válido";
    }

    if (!validarCodigoPostal(form.codigo_postal)) {
      nuevosErrores.codigo_postal = "Código postal no válido";
    }

    if (form.telefono && !validarTelefono(form.telefono)) {
      nuevosErrores.telefono = "Teléfono no válido (9 dígitos)";
    }

    if (form.email && !validarEmail(form.email)) {
      nuevosErrores.email = "Email no válido";
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErroresValidacion(nuevosErrores);
      return;
    }

    async function desactivarCliente(id) {
      const confirmar = window.confirm(
        "¿Seguro que deseas desactivar este cliente?",
      );

      if (!confirmar) return;

      try {
        const res = await authFetch(`/api/clientes/${id}/desactivar`, {
          method: "PATCH",
        });

        if (!res.ok) {
          alert("Error desactivando cliente");
          return;
        }

        await cargarClientes();
      } catch {
        alert("Error desactivando cliente");
      }
    }
    async function reactivarCliente(id) {
      try {
        const res = await authFetch(`/api/clientes/${id}/reactivar`, {
          method: "PATCH",
        });

        if (!res.ok) {
          alert("Error reactivando cliente");
          return;
        }

        await cargarClientes();
      } catch {
        alert("Error reactivando cliente");
      }
    }

    setErroresValidacion({});
    try {
      const res = await authFetch(`/api/clientes/${clienteEditando}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const text = await res.text();
        alert("Error guardando: " + text);
        return;
      }

      await cargarClientes();
      cancelar();
      alert("Cliente actualizado");
    } catch {
      alert("Error guardando cliente");
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  function validarNIF(nif) {
    if (!nif) return false;

    const nifRegex = /^[0-9]{8}[A-Z]$/i;
    const cifRegex = /^[A-HJNP-SUVW][0-9]{7}[0-9A-J]$/i;
    const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/i;

    return nifRegex.test(nif) || cifRegex.test(nif) || nieRegex.test(nif);
  }

  function validarCodigoPostal(cp) {
    return /^[0-9]{5}$/.test(cp);
  }

  function validarTelefono(tel) {
    return /^[0-9]{9}$/.test(tel);
  }

  function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  return (
    <Paper
      elevation={0}
      sx={{ p: { xs: 2, md: 5 }, borderRadius: 4, border: "1px solid #eee" }}
    >
      <Box>
        <Typography variant="h4">Clientes</Typography>
      </Box>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <TableContainer
        component={Paper}
        sx={{
          mt: 2,
          borderRadius: 4,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          overflowX: "auto",
        }}
      >
        <Table
          sx={{
            minWidth: 1100,
            "& td, & th": {
              fontSize: { xs: "0.8rem", md: "1rem" },
              whiteSpace: "nowrap",
            },
          }}
        >
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.100" }}>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "1rem", fontWeight: "550", color: "#374151" }}
                >
                  NIF
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
                  Dirección
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "1rem", fontWeight: "550", color: "#374151" }}
                >
                  Código postal
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "1rem", fontWeight: "550", color: "#374151" }}
                >
                  Ciudad
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "1rem", fontWeight: "550", color: "#374151" }}
                >
                  País
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
                  Teléfono
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
            {clientes.map((c) => (
              <TableRow key={c.id} sx={{ opacity: c.activo ? 1 : 0.5 }}>
                {/* NIF */}
                <TableCell>
                  {clienteEditando === c.id ? (
                    <TextField
                      size="small"
                      name="nif"
                      value={form.nif || ""}
                      onChange={handleChange}
                      error={!!erroresValidacion.nif}
                      helperText={erroresValidacion.nif}
                    />
                  ) : (
                    c.nif
                  )}
                </TableCell>

                {/* Nombre */}
                <TableCell>
                  {clienteEditando === c.id ? (
                    <TextField
                      size="small"
                      name="nombre"
                      value={form.nombre || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    c.nombre
                  )}
                </TableCell>

                {/* Dirección */}
                <TableCell>
                  {clienteEditando === c.id ? (
                    <TextField
                      size="small"
                      name="direccion"
                      value={form.direccion || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    c.direccion
                  )}
                </TableCell>

                {/* Código Postal */}
                <TableCell>
                  {clienteEditando === c.id ? (
                    <TextField
                      size="small"
                      name="codigo_postal"
                      value={form.codigo_postal || ""}
                      onChange={handleChange}
                      error={!!erroresValidacion.codigo_postal}
                      helperText={erroresValidacion.codigo_postal}
                    />
                  ) : (
                    c.codigo_postal
                  )}
                </TableCell>

                {/* Ciudad */}
                <TableCell>
                  {clienteEditando === c.id ? (
                    <TextField
                      size="small"
                      name="ciudad"
                      value={form.ciudad || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    c.ciudad
                  )}
                </TableCell>

                {/* País */}
                <TableCell>
                  {clienteEditando === c.id ? (
                    <TextField
                      size="small"
                      name="pais"
                      value={form.pais || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    c.pais
                  )}
                </TableCell>

                {/* Email */}
                <TableCell>
                  {clienteEditando === c.id ? (
                    <TextField
                      size="small"
                      name="email"
                      value={form.email || ""}
                      onChange={handleChange}
                      error={!!erroresValidacion.email}
                      helperText={erroresValidacion.email}
                    />
                  ) : (
                    c.email
                  )}
                </TableCell>

                {/* Teléfono */}
                <TableCell>
                  {clienteEditando === c.id ? (
                    <TextField
                      size="small"
                      name="telefono"
                      value={form.telefono || ""}
                      onChange={handleChange}
                      error={!!erroresValidacion.telefono}
                      helperText={erroresValidacion.telefono}
                    />
                  ) : (
                    c.telefono
                  )}
                </TableCell>

                {/* Acciones */}
                <TableCell>
                  {clienteEditando === c.id ? (
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={guardar}
                        sx={{
                          height: 28,
                          px: 1.5,
                          fontSize: "0.75rem",
                          minWidth: "auto",
                          bgcolor: "#1a73e8",
                          fontWeight: 600,
                          textTransform: "none",
                          borderRadius: 2,

                          "&:hover": {
                            bgcolor: "#155ec0",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                          },
                        }}
                      >
                        Guardar
                      </Button>

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={cancelar}
                        sx={{
                          height: 28,
                          px: 1.5,
                          fontSize: "0.75rem",
                          minWidth: "auto",
                          color: "#dc2626",
                          borderColor: "#dc2626",
                          fontWeight: 600,
                          textTransform: "none",
                          borderRadius: 2,

                          "&:hover": {
                            bgcolor: "rgba(220,38,38,0.08)",
                            borderColor: "#b91c1c",
                          },
                        }}
                      >
                        Cancelar
                      </Button>
                    </Stack>
                  ) : c.activo ? (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => editar(c)}
                        sx={{
                          height: 30,
                          px: 2,
                          fontSize: "0.8rem",
                          minWidth: 70,
                          color: "#1a73e8",
                          borderColor: "#1a73e8",
                          fontWeight: 600,
                          textTransform: "none",
                          borderRadius: 2,

                          "&:hover": {
                            bgcolor: "rgba(26,115,232,0.08)",
                            borderColor: "#155ec0",
                          },
                        }}
                      >
                        Editar
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => desactivarCliente(c.id)}
                        sx={{
                          height: 28,
                          px: 1.5,
                          fontSize: "0.75rem",
                          minWidth: "auto",
                          color: "#dc2626",
                          borderColor: "#dc2626",
                          fontWeight: 600,
                          textTransform: "none",
                          borderRadius: 2,

                          "&:hover": {
                            bgcolor: "rgba(220,38,38,0.08)",
                            borderColor: "#b91c1c",
                          },
                        }}
                      >
                        Desactivar
                      </Button>
                    </Stack>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => reactivarCliente(c.id)}
                      sx={{
                        height: 28,
                        px: 1.5,
                        fontSize: "0.75rem",
                        minWidth: "auto",
                        color: "#16a34a",
                        borderColor: "#16a34a",
                        fontWeight: 600,
                        textTransform: "none",
                        borderRadius: 2,

                        "&:hover": {
                          bgcolor: "rgba(22,163,74,0.08)",
                          borderColor: "#15803d",
                        },
                      }}
                    >
                      Reactivar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {clientes.length === 0 && (
              <TableRow>
                <TableCell colSpan="9">No hay clientes</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default Clientes;

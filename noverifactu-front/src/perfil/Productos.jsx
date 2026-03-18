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

function Productos() {
  const [productos, setProductos] = useState([]);
  const [productoEditando, setProductoEditando] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => {
    cargarProductos();
  }, []);

  async function cargarProductos() {
    const res = await authFetch("/api/productos");
    const data = await res.json();
    setProductos(data.productos || []);
  }

  function editar(p) {
    setProductoEditando(p.id);
    setForm(p);
  }

  function cancelar() {
    setProductoEditando(null);
    setForm({});
  }

  async function guardar() {
    await authFetch(`/api/productos/${productoEditando}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    await cargarProductos();
    cancelar();
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function desactivarProducto(id) {
    const confirmar = window.confirm(
      "¿Seguro que deseas desactivar este producto?",
    );

    if (!confirmar) return;

    try {
      const res = await authFetch(`/api/productos/${id}/desactivar`, {
        method: "PATCH",
      });

      if (!res.ok) {
        alert("Error desactivando producto");
        return;
      }

      await cargarProductos();
    } catch {
      alert("Error desactivando producto");
    }
  }

  async function reactivarProducto(id) {
    try {
      const res = await authFetch(`/api/productos/${id}/reactivar`, {
        method: "PATCH",
      });

      if (!res.ok) {
        alert("Error reactivando producto");
        return;
      }
      await cargarProductos();
    } catch {
      alert("Error reactivando producto");
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{ p: { xs: 2, md: 5 }, borderRadius: 4, border: "1px solid #eee" }}
    >
      <Box>
        <Typography variant="h4">Productos</Typography>
      </Box>

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
                  sx={{ fontSize: "1rem", fontWeight: 550, color: "#374151" }}
                >
                  Descripción
                </Typography>
              </TableCell>

              <TableCell>
                <Typography
                  sx={{ fontSize: "1rem", fontWeight: 550, color: "#374151" }}
                >
                  Precio
                </Typography>
              </TableCell>

              <TableCell>
                <Typography
                  sx={{ fontSize: "1rem", fontWeight: 550, color: "#374151" }}
                >
                  IVA
                </Typography>
              </TableCell>

              <TableCell>
                <Typography
                  sx={{ fontSize: "1rem", fontWeight: 550, color: "#374151" }}
                >
                  Acciones
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {productos.map((p) => (
              <TableRow key={p.id} sx={{ opacity: p.activo ? 1 : 0.5 }}>
                {/* Descripción */}
                <TableCell>
                  {productoEditando === p.id ? (
                    <TextField
                      size="small"
                      name="descripcion"
                      value={form.nombre || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    p.nombre
                  )}
                </TableCell>

                {/* Precio */}
                <TableCell>
                  {productoEditando === p.id ? (
                    <TextField
                      size="small"
                      name="precio"
                      type="number"
                      value={form.precio || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    p.precio + " €"
                  )}
                </TableCell>

                {/* IVA */}
                <TableCell>
                  {productoEditando === p.id ? (
                    <TextField
                      size="small"
                      name="tipo_iva"
                      type="number"
                      value={form.tipo_iva || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    p.tipo_iva + "%"
                  )}
                </TableCell>

                <TableCell>
                  {productoEditando === p.id ? (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Button
                        size="small"
                        variant="contained"
                        onClick={guardar}
                        sx={{
                          height: 30,
                          px: 2,
                          fontSize: "0.8rem",
                          minWidth: 70,
                          bgcolor: "#1a73e8",
                          fontWeight: 600,
                          textTransform: "none",
                          borderRadius: 2,
                          transition: "all 0.2s ease",

                          "&:hover": {
                            bgcolor: "#155ec0",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                          },
                        }}
                      >
                        Guardar
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={cancelar}
                        sx={{
                          height: 30,
                          px: 2,
                          fontSize: "0.8rem",
                          minWidth: 70,
                          color: "#dc2626",
                          borderColor: "#dc2626",
                          fontWeight: 600,
                          textTransform: "none",
                          borderRadius: 2,
                          transition: "all 0.2s ease",

                          "&:hover": {
                            bgcolor: "rgba(220,38,38,0.08)",
                            borderColor: "#b91c1c",
                          },
                        }}
                      >
                        Cancelar
                      </Button>
                    </Stack>
                  ) : p.activo ? (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => editar(p)}
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
                          transition: "all 0.2s ease",

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
                        onClick={() => desactivarProducto(p.id)}
                        sx={{
                          height: 30,
                          px: 2,
                          fontSize: "0.8rem",
                          minWidth: 70,
                          color: "#dc2626",
                          borderColor: "#dc2626",
                          fontWeight: 600,
                          textTransform: "none",
                          borderRadius: 2,
                          transition: "all 0.2s ease",

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
                      onClick={() => reactivarProducto(p.id)}
                      sx={{
                        height: 30,
                        px: 2,
                        fontSize: "0.8rem",
                        minWidth: 70,
                        color: "#16a34a",
                        borderColor: "#16a34a",
                        fontWeight: 600,
                        textTransform: "none",
                        borderRadius: 2,
                        transition: "all 0.2s ease",

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
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default Productos;

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

  return (
    <Paper
      elevation={0}
      sx={{ p: { xs: 2, md: 5 }, borderRadius: 4, border: "1px solid #eee" }}
    >
      <Box>
        <Typography variant="h4">Productos</Typography>
      </Box>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>IVA</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {productos.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {productoEditando === p.id ? (
                    <TextField
                      name="nombre"
                      value={form.nombre || ""}
                      onChange={handleChange}
                      size="small"
                    />
                  ) : (
                    p.nombre
                  )}
                </TableCell>

                <TableCell>
                  {productoEditando === p.id ? (
                    <TextField
                      name="descripcion"
                      value={form.descripcion || ""}
                      onChange={handleChange}
                      size="small"
                    />
                  ) : (
                    p.descripcion
                  )}
                </TableCell>

                <TableCell>
                  {productoEditando === p.id ? (
                    <TextField
                      name="precio"
                      type="number"
                      value={form.precio || ""}
                      onChange={handleChange}
                      size="small"
                    />
                  ) : (
                    p.precio + " €"
                  )}
                </TableCell>

                <TableCell>
                  {productoEditando === p.id ? (
                    <TextField
                      name="tipo_iva"
                      type="number"
                      value={form.tipo_iva || ""}
                      onChange={handleChange}
                      size="small"
                    />
                  ) : (
                    p.tipo_iva + "%"
                  )}
                </TableCell>

                <TableCell>
                  {productoEditando === p.id ? (
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={guardar}
                      >
                        Guardar
                      </Button>
                      <Button size="small" onClick={cancelar}>
                        Cancelar
                      </Button>
                    </Stack>
                  ) : (
                    <Button size="small" onClick={() => editar(p)}>
                      Editar
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

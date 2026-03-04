import { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";
import { useSystem } from "../context/SystemContext";
import {
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Typography,
  Container,
  Box,
} from "@mui/material";

function GestionSIF() {
  const [sifs, setSifs] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    nif: "",
    version: "",
    fecha_declaracion_responsable: "",
  });
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const { mantenimiento } = useSystem();

  useEffect(() => {
    cargarSIF();
  }, []);

  async function cargarSIF() {
    const res = await authFetch("/api/sif");
    const data = await res.json();
    setSifs(data.sifs || []);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function crearSIF(e) {
    e.preventDefault();
    setError("");
    setMensaje("");

    const res = await authFetch("/api/sif", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Error creando SIF");
      return;
    }

    setMensaje("SIF creado y activado");
    setForm({
      nombre: "",
      nif: "",
      version: "",
      fecha_declaracion_responsable: "",
    });
    cargarSIF();
  }

  async function activarSIF(id) {
    await authFetch(`/api/sif/${id}/activar`, { method: "POST" });
    cargarSIF();
  }

  return (
    <div>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
          Gestión de SIF
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" sx={{ mt: 5, mb: 2, fontWeight: 500 }}>
          SIF registrados
        </Typography>
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
                  Nombre
                </Typography>
              </TableCell>
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
                  Versión
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "1rem", fontWeight: "550", color: "#374151" }}
                >
                  Declaración responsable
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
                  Acción
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sifs.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.nombre}</TableCell>
                <TableCell>{s.nif}</TableCell>
                <TableCell>{s.version}</TableCell>
                <TableCell>{s.fecha_declaracion_responsable}</TableCell>
                <TableCell>{s.activo ? "Sí" : "No"}</TableCell>
                <TableCell>
                  {!s.activo && (
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{ borderRadius: 2, px: 4 }}
                      onClick={() => activarSIF(s.id)}
                      disabled={mantenimiento}
                    >
                      Activar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box>
        <Typography variant="h6" sx={{ mt: 5, mb: 2, fontWeight: 500 }}>
          Nuevo SIF
        </Typography>
      </Box>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          border: "1px solid #eee",
          bgcolor: "#fafafa",
        }}
      >
        <form onSubmit={crearSIF}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr) auto" },
              gap: 2,
              alignItems: "end",
            }}
          >
            {[
              { label: "ID software", name: "nombre", type: "text" },
              { label: "NIF desarrollador", name: "nif", type: "text" },
              { label: "Versión", name: "version", type: "text" },
              {
                label: "Fecha declaración",
                name: "fecha_declaracion_responsable",
                type: "date",
              },
            ].map((input) => (
              <Box
                key={input.name}
                sx={{ display: "flex", flexDirection: "column" }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    ml: 0.5,
                    mb: 1,
                    fontWeight: "550",
                    color: "#374151", // Un gris oscuro (Slate 700) que se lee mucho mejor
                    fontSize: "1rem",
                  }}
                >
                  {input.label}
                </Typography>
                <input
                  name={input.name}
                  type={input.type}
                  value={form[input.name]}
                  onChange={handleChange}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid #ccc",
                    outline: "none",
                    fontSize: "0.9rem",
                    backgroundColor: "white",
                  }}
                />
              </Box>
            ))}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ borderRadius: 2, px: 4 }}
              disabled={mantenimiento}
            >
              Crear SIF
            </Button>
          </Box>
        </form>
      </Paper>

      {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default GestionSIF;

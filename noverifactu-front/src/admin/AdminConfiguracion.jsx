import { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";
import {
  Box,
  Paper,
  MenuItem,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Stack,
  Button,
} from "@mui/material";

function AdminConfiguracion() {
  const [sif, setSif] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mantenimientoActivo, setMantenimientoActivo] = useState(false);
  const [loadingMantenimiento, setLoadingMantenimiento] = useState(true);
  const [versionInput, setVersionInput] = useState("");
  const [errorVersion, setErrorVersion] = useState("");
  const [nombreBaseInput, setNombreBaseInput] = useState("");
  const sifPreview =
    nombreBaseInput && versionInput ? `${nombreBaseInput}-${versionInput}` : "";

  useEffect(() => {
    cargarSif();
  }, []);
  useEffect(() => {
    const global = sif.find((s) => s.es_global);
    if (global) {
      const partes = global.nombre.split("-");
      partes.pop();
      setNombreBaseInput(partes.join("-"));
    }
  }, [sif]);
  useEffect(() => {
    cargarEstadoMantenimiento();
  }, []);

  async function cargarEstadoMantenimiento() {
    try {
      const res = await authFetch("/api/status");
      const data = await res.json();
      setMantenimientoActivo(data.mantenimiento);
    } catch {
      alert("Error cargando estado del sistema");
    } finally {
      setLoadingMantenimiento(false);
    }
  }
  async function cargarSif() {
    try {
      const res = await authFetch("/api/admin/sif");
      const data = await res.json();
      setSif(data.sif || []);
      setLoading(false);
    } catch {
      setLoading(false);
      alert("Error cargando configuraciones SIF");
    }
  }

  async function cambiarGlobal(id) {
    const confirmar = window.confirm(
      "¿Seguro que quieres marcar esta configuración como SIF global?",
    );

    if (!confirmar) return;

    try {
      const res = await authFetch(`/api/admin/sif/${id}/global`, {
        method: "PATCH",
      });

      if (!res.ok) {
        alert("Error actualizando configuración");
        return;
      }

      alert("SIF global actualizado correctamente");
      cargarSif();
    } catch {
      alert("Error actualizando configuración");
    }
  }

  function validarVersion(value) {
    const regex = /^\d+\.\d+\.\d+$/;

    if (!regex.test(value)) {
      setErrorVersion("Formato inválido. Usa X.Y.Z (ej: 2.0.1)");
      return false;
    }

    setErrorVersion("");
    return true;
  }

  async function confirmarNuevaVersion() {
    if (!validarVersion(versionInput)) return;

    const globalActual = sif.find((s) => s.es_global);

    if (!globalActual) {
      alert("No existe un SIF global base para versionar.");
      return;
    }

    const confirmar = window.confirm(
      `Se creará una nueva versión global:\n\n${sifPreview}\n\n¿Deseas continuar?`,
    );

    if (!confirmar) return;

    try {
      const res = await authFetch("/api/admin/sif/versionar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_base: globalActual.id,
          nueva_version: versionInput,
          nombre_base: nombreBaseInput,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.mensaje || "Error creando nueva versión");
        return;
      }

      alert("Nueva versión global desplegada correctamente");

      setVersionInput("");
      cargarSif();
    } catch {
      alert("Error al versionar el SIF");
    }
  }
  async function activarMantenimiento() {
    const confirmar = window.confirm(
      "⚠ Esto activará el modo mantenimiento.\n\nSe bloquearán acciones sensibles.\n\n¿Continuar?",
    );
    if (!confirmar) return;

    try {
      const res = await authFetch("/api/admin/mantenimiento/activar", {
        method: "POST",
      });

      if (!res.ok) {
        alert("Error activando mantenimiento");
        return;
      }

      setMantenimientoActivo(true);
    } catch {
      alert("Error activando mantenimiento");
    }
  }

  async function desactivarMantenimiento() {
    const confirmar = window.confirm(
      "¿Seguro que deseas desactivar el modo mantenimiento?",
    );
    if (!confirmar) return;

    try {
      const res = await authFetch("/api/admin/mantenimiento/desactivar", {
        method: "POST",
      });

      if (!res.ok) {
        alert("Error desactivando mantenimiento");
        return;
      }

      setMantenimientoActivo(false);
    } catch {
      alert("Error desactivando mantenimiento");
    }
  }
  if (loading) return <p>Cargando configuraciones...</p>;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 5 },
        borderRadius: 4,
        border: "1px solid #eee",
      }}
    >
      {/* ============================ */}
      {/* ESTADO DEL SISTEMA */}
      {/* ============================ */}

      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Estado del Sistema
      </Typography>

      {loadingMantenimiento ? (
        <Typography>Cargando estado...</Typography>
      ) : (
        <Stack direction="row" spacing={3} alignItems="center">
          <Typography
            sx={{
              fontWeight: 600,
              color: mantenimientoActivo ? "error.main" : "success.main",
            }}
          >
            {mantenimientoActivo
              ? "🔴 Sistema en Mantenimiento"
              : "🟢 Sistema Operativo"}
          </Typography>

          {mantenimientoActivo ? (
            <Button
              variant="contained"
              color="success"
              onClick={desactivarMantenimiento}
            >
              Desactivar Mantenimiento
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              onClick={activarMantenimiento}
            >
              Activar Mantenimiento
            </Button>
          )}
        </Stack>
      )}
      <Typography variant="h4" sx={{ fontWeight: 600, mt: 5, mb: 4 }}>
        Configuración SIF Global
      </Typography>

      {sif.length === 0 && (
        <Typography color="text.secondary">
          No hay configuraciones registradas.
        </Typography>
      )}

      {sif.length > 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.100" }}>
                {["ID", "Nombre", "Versión", "Ámbito", "Acciones"].map(
                  (col) => (
                    <TableCell key={col}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "1rem",
                          fontWeight: 550,
                          color: "#374151",
                        }}
                      >
                        {col}
                      </Typography>
                    </TableCell>
                  ),
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {sif.map((config) => (
                <TableRow key={config.id}>
                  <TableCell>{config.id}</TableCell>

                  <TableCell>{config.nombre}</TableCell>

                  <TableCell>{config.version}</TableCell>

                  <TableCell>
                    {config.es_global ? (
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "success.main",
                        }}
                      >
                        GLOBAL
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Usuario #{config.usuario_id}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    {!config.es_global && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => cambiarGlobal(config.id)}
                      >
                        Marcar como global
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="h6" sx={{ mt: 5, mb: 2 }}>
        Desplegar nueva versión global
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
        <TextField
          size="small"
          label="Nombre base del SIF"
          value={nombreBaseInput}
          onChange={(e) => setNombreBaseInput(e.target.value)}
          sx={{ width: 220 }}
        />

        <TextField
          size="small"
          label="Nueva versión (ej: 2.0.0)"
          value={versionInput}
          onChange={(e) => {
            setVersionInput(e.target.value);
            validarVersion(e.target.value);
          }}
          error={!!errorVersion}
          helperText={errorVersion}
          sx={{ width: 180 }}
        />

        <Button
          variant="contained"
          onClick={confirmarNuevaVersion}
          disabled={!nombreBaseInput || !versionInput || !!errorVersion}
        >
          Desplegar versión
        </Button>
      </Stack>

      {sifPreview && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          SIF_ID resultante: <strong>{sifPreview}</strong>
        </Typography>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        ⚠ El identificador usado en el hash será nombre-base + "-" + versión.
      </Typography>
    </Paper>
  );
}

export default AdminConfiguracion;

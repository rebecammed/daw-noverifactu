import { useState } from "react";
import { authFetch } from "./utils/authFetch";
import { useSystem } from "./context/SystemContext";
import { Typography, Box, Button, Paper, Stack } from "@mui/material";
// Importamos un icono para que el drag & drop sea más intuitivo
import UploadFileIcon from "@mui/icons-material/UploadFile";

function VerificadorFactura() {
  const { mantenimiento } = useSystem();
  const [archivosVerificacion, setArchivosVerificacion] = useState([]);
  const [resultadosVerificacion, setResultadosVerificacion] = useState([]);
  const [verificando, setVerificando] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  function manejarArchivos(files) {
    if (files.length > 20) {
      alert("Máximo 20 documentos por verificación");
      return;
    }
    setArchivosVerificacion(files);
  }

  // Manejadores para el Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      manejarArchivos(Array.from(e.dataTransfer.files));
    }
  };

  async function verificarDocumento(e) {
    e.preventDefault();
    if (!archivosVerificacion.length) {
      alert("Debes subir al menos un archivo XML o JSON");
      return;
    }

    try {
      setVerificando(true);
      setResultadosVerificacion([]);
      const textos = await Promise.all(
        archivosVerificacion.map((file) => file.text()),
      );

      const res = await authFetch("/api/verificar-documento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentos: textos }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error verificando documentos");
        return;
      }
      setResultadosVerificacion(data.resultados);
    } catch (err) {
      alert("Error verificando documentos");
    } finally {
      setVerificando(false);
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 4,
          border: "1px solid #eee",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h4"
          sx={{ mb: 3, fontWeight: 600, color: "#374151" }}
        >
          Verificación de registros XML/JSON
        </Typography>

        <form onSubmit={verificarDocumento}>
          <Stack spacing={3} alignItems="center">
            {/* ÁREA DRAG & DROP */}
            <Box
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              sx={{
                width: "100%",
                minHeight: "150px",
                border: "2px dashed",
                borderColor: dragActive ? "#1a237e" : "#ccc",
                borderRadius: 4,
                bgcolor: dragActive ? "#f0f2ff" : "#fafafa",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                cursor: "pointer",
                position: "relative",
                p: 3,
              }}
              component="label"
            >
              <input
                type="file"
                hidden
                accept=".xml,.json"
                multiple
                onChange={(e) => manejarArchivos(Array.from(e.target.files))}
                disabled={mantenimiento}
              />
              <UploadFileIcon sx={{ fontSize: 40, color: "#9ca3af", mb: 1 }} />
              <Typography
                variant="body1"
                sx={{ fontWeight: 500, color: "#4b5563" }}
              >
                {archivosVerificacion.length > 0
                  ? `${archivosVerificacion.length} archivos seleccionados`
                  : "Arrastra tus archivos aquí o haz clic para seleccionar"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Máximo 20 archivos (XML o JSON)
              </Typography>
            </Box>

            {/* BOTÓN VERIFICAR (Más pequeño y discreto) */}
            <Button
              type="submit"
              variant="contained"
              disabled={
                verificando ||
                mantenimiento ||
                archivosVerificacion.length === 0
              }
              sx={{
                bgcolor: "#1a237e",
                borderRadius: 2.5,
                px: 6, // Un poco más estrecho
                py: 1,
                textTransform: "none",
                fontWeight: "bold",
                fontSize: "0.9rem",
                "&:hover": { bgcolor: "#0d47a1" },
              }}
            >
              {verificando ? "Verificando..." : "Verificar documentos"}
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* RESULTADOS (Manteniendo tu lógica pero con el estilo de texto mejorado) */}
      {resultadosVerificacion.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, ml: 1 }}>
            Resultados de la verificación
          </Typography>

          <Stack spacing={2}>
            {resultadosVerificacion.map((r, i) => (
              <Paper
                key={i}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: r.integridad ? "success.main" : "error.main",
                  backgroundColor: r.integridad ? "#f0fdf4" : "#fef2f2",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Documento: {r.documento || "Desconocido"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: r.integridad ? "success.dark" : "error.dark",
                    fontWeight: 600,
                  }}
                >
                  Integridad: {r.integridad ? "Válida ✅" : "No válida ❌"}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {r.mensajeIntegridad}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

export default VerificadorFactura;

/*import { useState } from "react";
import { authFetch } from "./utils/authFetch";
import { useSystem } from "./context/SystemContext";

import { Typography, Box, Button, Alert, Paper, Stack } from "@mui/material";

function VerificadorFactura() {
  const { mantenimiento } = useSystem();

  const [archivosVerificacion, setArchivosVerificacion] = useState([]);
  const [resultadosVerificacion, setResultadosVerificacion] = useState([]);
  const [verificando, setVerificando] = useState(false);

  function manejarArchivos(e) {
    const files = Array.from(e.target.files);

    if (files.length > 20) {
      alert("Máximo 20 documentos por verificación");
      return;
    }

    setArchivosVerificacion(files);
  }

  async function verificarDocumento(e) {
    e.preventDefault();

    if (!archivosVerificacion.length) {
      alert("Debes subir al menos un archivo XML o JSON");
      return;
    }

    try {
      setVerificando(true);
      setResultadosVerificacion([]);

      const textos = await Promise.all(
        archivosVerificacion.map((file) => file.text()),
      );

      const res = await authFetch("/api/verificar-documento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentos: textos }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error verificando documentos");
        return;
      }

      setResultadosVerificacion(data.resultados);
    } catch (err) {
      alert("Error verificando documentos");
    } finally {
      setVerificando(false);
    }
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Verificación de registros XML/JSON
        </Typography>
        <form onSubmit={verificarDocumento}>
          <Stack spacing={2}>
            <Button
              variant="outlined"
              component="label"
              disabled={mantenimiento}
            >
              Seleccionar XML / JSON
              <input
                type="file"
                hidden
                accept=".xml,.json"
                multiple
                onChange={manejarArchivos}
              />
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={verificando || mantenimiento}
            >
              {verificando ? "Verificando..." : "Verificar documentos"}
            </Button>
          </Stack>
        </form>
      </Paper>

      {resultadosVerificacion.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Resultados
          </Typography>

          <Stack spacing={2}>
            {resultadosVerificacion.map((r, i) => (
              <Paper
                key={i}
                sx={{
                  p: 2,
                  backgroundColor: r.integridad
                    ? "success.light"
                    : "error.light",
                }}
              >
                <Typography>
                  <strong>Documento:</strong> {r.documento || "Desconocido"}
                </Typography>

                <Typography>
                  <strong>Integridad:</strong>{" "}
                  {r.integridad ? "Válida" : "No válida"}
                </Typography>

                <Typography>
                  <strong>Pertenece al sistema:</strong>{" "}
                  {r.perteneceAlSistema ? "Sí" : "No"}
                </Typography>

                <Typography>{r.mensajeIntegridad}</Typography>
                <Typography>{r.mensajePertenencia}</Typography>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

export default VerificadorFactura;
*/

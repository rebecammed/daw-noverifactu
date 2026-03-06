import { useState } from "react";
import { authFetch } from "../utils/authFetch";
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

function CambiarPassword() {
  const [passwordActual, setPasswordActual] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [repetirPassword, setRepetirPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [erroresDetalle, setErroresDetalle] = useState([]);
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarRepetir, setMostrarRepetir] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMensaje("");
    setErroresDetalle([]);

    try {
      const res = await authFetch("/api/usuarios/cambiar-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passwordActual,
          nuevaPassword,
          repetirPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error cambiando contraseña");
        if (data.detalles) {
          setErroresDetalle(data.detalles);
        }
        return;
      }

      setMensaje("✅ Contraseña actualizada correctamente");
      setPasswordActual("");
      setNuevaPassword("");
      setRepetirPassword("");
    } catch (err) {
      setError("Error de conexión con el servidor");
    }
  }

  return (
    <section style={{ marginTop: "40px" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 500 }}>
          Cambiar contraseña
        </Typography>
      </Box>

      <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
        {/* Usamos un Box por cada fila para controlar el espaciado y alineación */}
        {[
          {
            label: "Contraseña actual",
            value: passwordActual,
            setter: setPasswordActual,
            visible: mostrarActual,
            setVisible: setMostrarActual,
          },
          {
            label: "Nueva contraseña",
            value: nuevaPassword,
            setter: setNuevaPassword,
            visible: mostrarNueva,
            setVisible: setMostrarNueva,
          },
          {
            label: "Repetir nueva contraseña",
            value: repetirPassword,
            setter: setRepetirPassword,
            visible: mostrarRepetir,
            setVisible: setMostrarRepetir,
          },
        ].map((campo, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2, // Separación entre filas
              position: "relative",
            }}
          >
            <input
              type={campo.visible ? "text" : "password"}
              placeholder={campo.label}
              value={campo.value}
              onChange={(e) => campo.setter(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 100px 12px 15px", // Padding a la derecha para que el texto no choque con el botón
                borderRadius: "12px", // Bordes más redondeados
                border: "1px solid #ccc",
                outline: "none",
                fontSize: "1rem",
              }}
            />
            <Button
              type="button"
              variant="text" // Variant text lo hace mucho más discreto (sin bordes)
              size="small"
              onClick={() => campo.setVisible(!campo.visible)}
              sx={{
                position: "absolute",
                right: "12px", // Separado de la derecha del input
                textTransform: "none", // Evita las mayúsculas agresivas
                color: "text.secondary",
                fontSize: "0.75rem",
                "&:hover": { bgcolor: "transparent", color: "primary.main" },
              }}
            >
              {campo.visible ? "Ocultar" : "Mostrar"}
            </Button>
          </Box>
        ))}

        <Button
          type="submit"
          variant="contained"
          sx={{
            px: 4,
            py: 1.2,
            mt: 1,
            width: { xs: "100%", sm: "auto" },
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
        >
          Actualizar contraseña
        </Button>
      </form>

      {mensaje && (
        <Typography sx={{ color: "green", mt: 2 }}>{mensaje}</Typography>
      )}
      {error && <Typography sx={{ color: "red", mt: 2 }}>{error}</Typography>}

      {erroresDetalle.length > 0 && (
        <ul style={{ color: "red", marginTop: "10px" }}>
          {erroresDetalle.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default CambiarPassword;

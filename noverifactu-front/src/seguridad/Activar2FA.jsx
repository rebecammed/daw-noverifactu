import { useState, useEffect } from "react";
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

function Activar2FA() {
  const [qr, setQr] = useState(null);
  const [codigo, setCodigo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [activado, setActivado] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch("/api/2fa/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.enabled) setActivado(true);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function generarQR() {
    setError("");
    try {
      const res = await authFetch("/api/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error generando QR");

      setQr(data.qr); // Al setear el QR, el botón desaparecerá por la condición del render
    } catch (e) {
      setError(e.message);
    }
  }

  async function verificarCodigo(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await authFetch("/api/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: codigo }),
      });
      if (!res.ok) throw new Error("Código incorrecto");

      setActivado(true);
      setQr(null); // Proceso terminado, limpiamos el QR
      setMensaje("✅ Configuración completada con éxito.");
    } catch (e) {
      setError(e.message);
    }
  }

  if (loading) return <p>Cargando configuración...</p>;

  return (
    <div>
      <Box>
        <Typography variant="h4">
          Activación del doble factor de autenticación (2FA)
        </Typography>
      </Box>

      {/* 1. ESTADO: YA ACTIVADO */}
      {activado && (
        <div style={{ marginBottom: "20px" }}>
          <p style={{ color: "#2e7d32", fontWeight: "bold" }}>
            El doble factor de autenticación ya está activo para este usuario.
          </p>
          <Button disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>
            2FA Activado
          </Button>
        </div>
      )}

      {/* 2. ESTADO: INICIAL (Ni activado, ni mostrando QR) */}
      {!activado && !qr && (
        <Button
          type="submit"
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
          onClick={generarQR}
        >
          Activar 2FA
        </Button>
      )}

      {/* 3. ESTADO: PROCESO DE ACTIVACIÓN (Se muestra QR, desaparece el botón anterior) */}
      {qr && !activado && (
        <div
          style={{
            marginTop: "20px",
            border: "1px solid #ccc",
            padding: "15px",
          }}
        >
          <p>Escanea este código QR con Google Authenticator:</p>
          <img src={qr} alt="QR 2FA" />

          <form onSubmit={verificarCodigo} style={{ marginTop: "15px" }}>
            <input
              type="text"
              placeholder="Código de 6 dígitos"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
              style={{ padding: "5px", marginRight: "10px" }}
            />
            <Button
              type="submit"
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
            >
              Verificar código
            </Button>
          </form>
          <Button
            type="submit"
            variant="contained"
            color="error"
            sx={{ mt: 2 }}
            onClick={() => setQr(null)}
          >
            Cancelar
          </Button>
        </div>
      )}

      {mensaje && (
        <p style={{ color: "green", marginTop: "10px" }}>{mensaje}</p>
      )}
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
}

export default Activar2FA;

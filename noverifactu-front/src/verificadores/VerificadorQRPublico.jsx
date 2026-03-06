import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Stack,
  Divider,
} from "@mui/material";
import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
function VerificadorQRPublico() {
  const navigate = useNavigate();
  const scannerRef = useRef(null);

  const [urlManual, setUrlManual] = useState("");
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // ===============================
  // ESCÁNER DE CÁMARA
  // ===============================

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: 250,
      },
      false,
    );

    scanner.render(
      (decodedText) => {
        redirigir(decodedText);
      },
      () => {},
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  // ===============================
  // REDIRECCIÓN
  // ===============================

  function redirigir(textoQR) {
    try {
      const url = new URL(textoQR);

      if (!url.pathname.includes("/verificadores/qr")) {
        setError("El QR no corresponde a una factura válida");
        return;
      }

      navigate(url.pathname + url.search);
    } catch {
      setError("El QR no contiene una URL válida");
    }
  }

  // ===============================
  // SUBIR IMAGEN
  // ===============================

  async function procesarFactura(file) {
    if (file.type === "application/pdf") {
      leerQRdesdePDF(file);
    } else if (file.type.startsWith("image/")) {
      leerQRdesdeImagen(file);
    } else {
      setError("Formato no soportado");
    }
  }
  async function leerQRdesdeImagen(file) {
    try {
      const qr = new Html5Qrcode("qr-reader");

      const texto = await qr.scanFile(file, true);

      redirigir(texto);
    } catch {
      setError("No se pudo detectar el QR en el documento");
    }
  }
  async function leerQRdesdePDF(file) {
    const data = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({ data }).promise;

    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );

    leerQRdesdeImagen(blob);
  }
  // ===============================
  // VERIFICAR URL MANUAL
  // ===============================

  function verificarURLManual() {
    if (!urlManual) return;

    redirigir(urlManual);
  }

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      procesarFactura(e.dataTransfer.files[0]);
    }
  }

  return (
    <Box sx={{ maxWidth: 700, mx: "auto" }}>
      <Paper
        elevation={3}
        sx={{
          p: 5,
          borderRadius: 4,
          border: "1px solid #eee",
        }}
      >
        <Typography variant="h4" mb={3} textAlign="center">
          Verificación pública de facturas
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          mb={4}
        >
          Escanea el código QR de una factura o introduce la URL del código para
          verificar su autenticidad.
        </Typography>

        {/* ========================= */}
        {/* ESCÁNER CÁMARA */}
        {/* ========================= */}

        <Box mb={5}>
          <Typography variant="h6" mb={2}>
            Escanear QR con cámara
          </Typography>

          <Box
            id="qr-reader"
            sx={{
              width: "100%",
            }}
          />
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* ========================= */}
        {/* SUBIR IMAGEN */}
        {/* ========================= */}

        <Box mb={4}>
          <Typography variant="h6" mb={2}>
            Subir factura (PDF o imagen)
          </Typography>

          <Box
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            component="label"
            sx={{
              width: "100%",
              minHeight: 140,
              border: "2px dashed",
              borderColor: dragActive ? "#1a237e" : "#ccc",
              borderRadius: 3,
              bgcolor: dragActive ? "#f0f2ff" : "#fafafa",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              textAlign: "center",
              p: 3,
            }}
          >
            <input
              hidden
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => {
                if (e.target.files[0]) {
                  procesarFactura(e.target.files[0]);
                }
              }}
            />

            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Arrastra tu factura aquí
            </Typography>

            <Typography variant="caption" color="text.secondary">
              o haz clic para seleccionar un PDF o imagen
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* ========================= */}
        {/* URL MANUAL */}
        {/* ========================= */}

        <Box>
          <Typography variant="h6" mb={2}>
            Introducir URL del QR
          </Typography>

          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              placeholder="Pega aquí la URL del QR"
              value={urlManual}
              onChange={(e) => setUrlManual(e.target.value)}
            />

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
              onClick={verificarURLManual}
            >
              Verificar
            </Button>
          </Stack>
        </Box>

        {/* ========================= */}
        {/* ERROR */}
        {/* ========================= */}

        {error && (
          <Typography color="error" mt={3} textAlign="center">
            {error}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

export default VerificadorQRPublico;

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
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const scannerRef = useRef(null);

  const [urlManual, setUrlManual] = useState("");
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // ===============================
  // REDIRECCIÓN
  // ===============================

  function redirigir(textoQR) {
    try {
      const url = new URL(textoQR);

      if (!url.pathname.includes("/verificar-qr")) {
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
    try {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        await leerQRdesdePDF(file);
      } else if (file.type.startsWith("image/")) {
        await leerQRdesdeImagen(file);
      } else {
        setError("Formato no soportado");
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo analizar el documento");
    }
  }
  async function leerQRdesdeImagen(file) {
    try {
      const qr = new Html5Qrcode("qr-reader");

      const texto = await qr.scanFile(file, true);

      await qr.clear();

      redirigir(texto);
    } catch {
      throw new Error("QR no detectado");
    }
  }
  async function leerQRdesdePDF(file) {
    try {
      const data = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data }).promise;

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);

        const viewport = page.getViewport({ scale: 3 });

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

        try {
          await leerQRdesdeImagen(blob);
          return; // QR encontrado → paramos
        } catch {
          // seguimos con la siguiente página
        }
      }

      setError("No se pudo detectar el QR en el documento");
    } catch (err) {
      console.error(err);
      setError("No se pudo analizar el documento");
    }
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
      <div id="qr-reader" style={{ display: "none" }}></div>

      <Paper
        elevation={3}
        sx={{
          p: 5,
          borderRadius: 4,
          border: "1px solid #eee",
        }}
      ></Paper>
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
        {/* SUBIR IMAGEN */}
        {/* ========================= */}

        <Box mb={4}>
          <Typography variant="h6" mb={2}>
            Subir factura (PDF o imagen)
          </Typography>

          <Box
            onClick={() => fileInputRef.current.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
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
              ref={fileInputRef}
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

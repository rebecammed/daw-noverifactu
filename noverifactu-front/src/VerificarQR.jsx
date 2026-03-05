import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Chip,
  Card,
  CardContent,
} from "@mui/material";

function VerificarQR() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const datos = {
    nif: params.get("nif"),
    num: params.get("num"),
    fecha: params.get("fecha"),
    cuotaIVA: params.get("cuotaIVA"),
    importe: params.get("importe"),
    hash: params.get("hash"),
  };

  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    verificarFactura();
  }, []);

  async function verificarFactura() {
    try {
      const res = await fetch(`/api/verificar-factura${search}`);
      const data = await res.json();
      setResultado(data);
    } catch (err) {
      console.error("Error verificando factura", err);
    }
  }
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 5 },
        borderRadius: 4,
        border: "1px solid #eee",
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" mb={4}>
          Verificación de factura
        </Typography>

        {/* CONTENEDOR PRINCIPAL */}

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            width: "100%",
          }}
        >
          {/* DATOS QR */}

          <Card
            sx={{
              flex: 2,
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <CardContent>
              <Typography variant="h6" mb={2}>
                Datos del QR
              </Typography>

              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <b>NIF emisor</b>
                    </TableCell>
                    <TableCell>{datos.nif}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <b>Número factura</b>
                    </TableCell>
                    <TableCell>{datos.num}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <b>Fecha</b>
                    </TableCell>
                    <TableCell>{datos.fecha}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <b>Cuota IVA</b>
                    </TableCell>
                    <TableCell>{datos.cuotaIVA} €</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <b>Importe total</b>
                    </TableCell>
                    <TableCell>{datos.importe} €</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <b>Hash</b>
                    </TableCell>
                    <TableCell sx={{ wordBreak: "break-all" }}>
                      {datos.hash}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* RESULTADO */}

          <Card
            sx={{
              flex: 1,
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <CardContent>
              <Typography variant="h6" mb={2}>
                Resultado de verificación
              </Typography>

              {!resultado && (
                <Typography color="text.secondary">
                  Verificando factura...
                </Typography>
              )}

              {resultado && !resultado.existe && (
                <Chip label="Factura no encontrada" color="error" />
              )}

              {resultado && resultado.existe && (
                <Box display="flex" flexDirection="column" gap={1}>
                  <Chip label="Factura registrada" color="success" />

                  <Chip
                    label={
                      resultado.datosCoinciden
                        ? "Datos coinciden"
                        : "Datos no coinciden"
                    }
                    color={resultado.datosCoinciden ? "success" : "error"}
                  />

                  <Chip
                    label={
                      resultado.hashValido ? "Hash válido" : "Hash inválido"
                    }
                    color={resultado.hashValido ? "success" : "error"}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Paper>
  );
}

export default VerificarQR;

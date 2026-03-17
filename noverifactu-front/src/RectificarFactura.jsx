import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authFetch } from "./utils/authFetch";
import {
  Paper,
  Box,
  Grid,
  Stack,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Divider,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
function RectificarFactura() {
  const { facturaId } = useParams();
  const navigate = useNavigate();
  const facturaOrigenId = Number(facturaId);
  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errores, setErrores] = useState([]);
  const [rectificativaCreada, setRectificativaCreada] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fechaExpedicion, setFechaExpedicion] = useState("");
  const [tipoRectificacion, setTipoRectificacion] = useState("DIFERENCIAS");

  const [usarClienteExistente, setUsarClienteExistente] = useState(true);
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [clientes, setClientes] = useState([]);
  const [clienteNuevo, setClienteNuevo] = useState({
    nif: "",
    nombre: "",
    direccion: "",
    codigo_postal: "",
    ciudad: "",
    pais: "",
    email: "",
    telefono: "",
  });

  const [conceptos, setConceptos] = useState([]);
  const [modoEntrada, setModoEntrada] = useState(null);
  // null | "manual" | "pdf"

  const [pdfFile, setPdfFile] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (rectificativaCreada) {
      navigate("/registro");
    }
  }, [rectificativaCreada, navigate]);

  useEffect(() => {
    if (!facturaOrigenId) {
      setErrores(["ID de factura no válido"]);
      setLoading(false);
      return;
    }

    Promise.all([
      authFetch(`/api/facturas/${facturaOrigenId}`).then((res) => res.json()),
      authFetch(`/api/clientes`).then((res) => res.json()),
    ])
      .then(([dataFactura, dataClientes]) => {
        // 1. Guardamos la factura completa para mostrar el "Resumen Original" arriba
        setFactura(dataFactura);
        setClientes(dataClientes.clientes);

        // 3. AUTOCOMPLETADO DEL CLIENTE (Vínculo por ID)
        if (dataFactura.cliente_id) {
          setClienteSeleccionado(dataFactura.cliente_id);
        }

        // 4. AUTOCOMPLETADO DE CONCEPTOS
        if (dataFactura.conceptos && Array.isArray(dataFactura.conceptos)) {
          setConceptos(
            dataFactura.conceptos.map((c) => ({
              idOriginal: c.id, // 🔥 IMPORTANTE
              descripcion: c.descripcion || "",
              cantidad: c.cantidad || 1,
              precioUnitario: c.precio_unitario || 0,
              tipoImpositivo: c.tipo_impositivo || 0,
              tipoImpuesto: c.tipo_impuesto || "IVA",
              estadoCambio: "sin_cambios",
            })),
          );
        }
        setLoading(false);
      })
      .catch(() => {
        setErrores(["No se pudo cargar la factura original"]);
        setLoading(false);
      });
  }, [facturaOrigenId]);
  useEffect(() => {
    if (
      tipoRectificacion === "SUSTITUCION" &&
      !clienteSeleccionado &&
      factura?.cliente_id
    ) {
      setClienteSeleccionado(String(factura.cliente_id));
    }
  }, [tipoRectificacion, factura]);

  async function analizarPDF() {
    if (!pdfFile) {
      setErrores(["Debes seleccionar un PDF"]);
      return;
    }

    setPreviewLoading(true);
    setErrores([]);

    const formData = new FormData();
    formData.append("pdf", pdfFile);
    formData.append("facturaOrigenId", facturaOrigenId);

    try {
      const response = await authFetch("/api/facturas/preview-rectificativa", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setErrores([data?.mensaje || "Error analizando PDF"]);
        return;
      }

      const { fechaExpedicion, tipoRectificacion, conceptos, cliente } =
        data.datosDetectados;
      if (cliente) {
        if (cliente.esNuevo) {
          setUsarClienteExistente(false);
          setClienteNuevo(cliente.datos);
        } else {
          setUsarClienteExistente(true);
          setClienteSeleccionado(cliente.id);
        }
      }

      if (fechaExpedicion) setFechaExpedicion(fechaExpedicion);
      if (tipoRectificacion) setTipoRectificacion(tipoRectificacion);

      if (conceptos?.length) {
        setConceptos(
          conceptos.map((c) => ({
            ...c,
            estadoCambio: c.estadoCambio || "modificado",
          })),
        );
      }

      // Mostrar formulario después del análisis
      setModoEntrada("manual");
    } catch {
      setErrores(["Error enviando PDF"]);
    } finally {
      setPreviewLoading(false);
    }
  }

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
      const file = e.dataTransfer.files[0];

      if (file.type === "application/pdf") {
        setPdfFile(file);
      } else {
        alert("Solo se permiten archivos PDF");
      }
    }
  };

  function validarNIF(nif) {
    if (!nif) return false;

    const nifRegex = /^[0-9]{8}[A-Z]$/i;
    const cifRegex = /^[A-HJNP-SUVW][0-9]{7}[0-9A-J]$/i;
    const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/i;

    return nifRegex.test(nif) || cifRegex.test(nif) || nieRegex.test(nif);
  }

  function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validarTelefono(tel) {
    return /^[0-9]{9}$/.test(tel);
  }

  function validarCodigoPostal(cp) {
    return /^[0-9]{5}$/.test(cp);
  }
  async function enviarRectificativa(e) {
    e.preventDefault();
    setErrores([]);

    const formData = new FormData();

    const payload = {
      facturaOrigenId,
      fechaExpedicion,
      tipoRectificacion,
      conceptos,
    };
    if (!fechaExpedicion) {
      setErrores(["La fecha de expedición es obligatoria"]);
      return;
    }

    if (conceptos.length === 0) {
      setErrores(["Debe existir al menos un concepto"]);
      return;
    }
    if (tipoRectificacion === "SUSTITUCION") {
      let infoCliente = null;

      if (usarClienteExistente) {
        if (!clienteSeleccionado) {
          setErrores(["Debes seleccionar un cliente existente"]);
          return;
        }

        infoCliente = {
          esNuevo: false,
          id: clienteSeleccionado,
        };
      } else {
        if (!clienteNuevo.nif || !validarNIF(clienteNuevo.nif)) {
          setErrores(["NIF del cliente no válido"]);
          return;
        }

        if (!clienteNuevo.nombre?.trim()) {
          setErrores(["El nombre del cliente es obligatorio"]);
          return;
        }

        if (
          !clienteNuevo.codigo_postal ||
          !validarCodigoPostal(clienteNuevo.codigo_postal)
        ) {
          setErrores(["Código postal no válido (5 dígitos)"]);
          return;
        }

        if (clienteNuevo.email && !validarEmail(clienteNuevo.email)) {
          setErrores(["Email del cliente no válido"]);
          return;
        }

        if (clienteNuevo.telefono && !validarTelefono(clienteNuevo.telefono)) {
          setErrores(["Teléfono no válido (9 dígitos)"]);
          return;
        }

        infoCliente = {
          esNuevo: true,
          datos: clienteNuevo,
        };
      }

      payload.cliente = infoCliente;
    }

    // 🔥 AÑADIMOS JSON
    formData.append("data", JSON.stringify(payload));

    // 🔥 AÑADIMOS PDF SI EXISTE
    if (pdfFile) {
      formData.append("pdf", pdfFile);
    }

    try {
      const response = await authFetch("/api/facturas/rectificar", {
        method: "POST",
        body: formData, // 🔥 sin headers
      });

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data?.errores)) {
          setErrores(data.errores);
        } else if (data?.error) {
          setErrores([data.error]);
        } else {
          setErrores(["Error desconocido"]);
        }
        return;
      }

      alert("Factura rectificativa creada correctamente");
      setRectificativaCreada(true);
    } catch {
      setErrores(["Error enviando rectificativa"]);
    }
  }

  if (loading) return <p>Cargando factura original...</p>;
  if (errores.length) return <p>Error: {errores.join(", ")}</p>;
  if (!factura) return <p>No hay datos</p>;

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, md: 4 },
        borderRadius: 4,
        border: "1px solid #eee",
      }}
    >
      {/* ================================= */}
      {/* FACTURA ORIGINAL */}
      {/* ================================= */}

      <Typography variant="h5" sx={{ fontWeight: 600, mb: 4 }}>
        Factura original
      </Typography>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <Typography>
              <strong>Número:</strong> {factura.numero_factura}
            </Typography>
            <Typography>
              <strong>Fecha:</strong>{" "}
              {new Date(factura.fecha_expedicion).toLocaleString()}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
      {tipoRectificacion === "SUSTITUCION" && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            CLIENTE
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Cliente existente</InputLabel>
            <Select
              value={clienteSeleccionado || ""}
              label="Cliente existente"
              onChange={(e) => {
                setClienteSeleccionado(e.target.value);
                setUsarClienteExistente(true);
              }}
            >
              {clientes.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.nombre} ({c.nif})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="body2" sx={{ mb: 2 }}>
            o crear cliente nuevo
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="NIF"
                value={clienteNuevo.nif}
                onChange={(e) =>
                  setClienteNuevo({ ...clienteNuevo, nif: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                size="small"
                label="Nombre"
                value={clienteNuevo.nombre}
                onChange={(e) =>
                  setClienteNuevo({ ...clienteNuevo, nombre: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Dirección"
                value={clienteNuevo.direccion}
                onChange={(e) =>
                  setClienteNuevo({
                    ...clienteNuevo,
                    direccion: e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Código postal"
                value={clienteNuevo.codigo_postal}
                onChange={(e) =>
                  setClienteNuevo({
                    ...clienteNuevo,
                    codigo_postal: e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Ciudad"
                value={clienteNuevo.ciudad}
                onChange={(e) =>
                  setClienteNuevo({ ...clienteNuevo, ciudad: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </Box>
      )}
      {/* ================================= */}
      {/* CONCEPTOS ORIGINALES */}
      {/* ================================= */}

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Conceptos originales
      </Typography>

      {factura.conceptos?.length ? (
        <TableContainer component={Paper} sx={{ borderRadius: 3, mb: 5 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.100" }}>
                {["Descripción", "Cantidad", "Precio", "Base", "Impuesto"].map(
                  (col) => (
                    <TableCell key={col}>
                      <Typography sx={{ fontWeight: 550 }}>{col}</Typography>
                    </TableCell>
                  ),
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {factura.conceptos.map((c, i) => (
                <TableRow key={i}>
                  <TableCell>{c.descripcion}</TableCell>
                  <TableCell>{c.cantidad}</TableCell>
                  <TableCell>{c.unidad}</TableCell>
                  <TableCell>{c.precio_unitario} €</TableCell>
                  <TableCell>{c.base} €</TableCell>
                  <TableCell>
                    {c.tipo_impuesto} ({c.tipo_impositivo}%)
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography color="text.secondary" sx={{ mb: 5 }}>
          No hay conceptos disponibles
        </Typography>
      )}

      {/* ================================= */}
      {/* RESUMEN */}
      {/* ================================= */}

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Resumen fiscal
      </Typography>

      <Stack spacing={1} sx={{ mb: 6 }}>
        {factura.impuestos?.map((imp, i) => (
          <Typography key={i}>
            <strong>
              {imp.tipo_impuesto} {imp.tipo_impositivo}%:
            </strong>{" "}
            Base {imp.base_imponible} € — Cuota {imp.cuota} €
          </Typography>
        ))}
      </Stack>

      <Divider sx={{ mb: 5 }} />

      {/* ================================= */}
      {/* SELECCIÓN DE MODO */}
      {/* ================================= */}

      {!modoEntrada && (
        <Stack direction="row" spacing={3} sx={{ mb: 5 }}>
          <Button variant="contained" onClick={() => setModoEntrada("manual")}>
            Introducir manualmente
          </Button>

          <Button variant="outlined" onClick={() => setModoEntrada("pdf")}>
            Importar desde PDF
          </Button>
        </Stack>
      )}

      {/* ================================= */}
      {/* MODO PDF */}
      {/* ================================= */}

      {modoEntrada === "pdf" && (
        <Box sx={{ mb: 5 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Importar rectificativa desde PDF
          </Typography>

          {/* DRAG & DROP */}
          <Box
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() =>
              document.getElementById("pdf-rectificativa-upload").click()
            }
            sx={{
              border: "2px dashed",
              borderColor: dragActive ? "primary.main" : "#d0d5dd",
              borderRadius: 3,
              bgcolor: dragActive ? "rgba(25,118,210,0.05)" : "#fafafa",
              p: 6,
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              textAlign: "center",
            }}
          >
            <input
              id="pdf-rectificativa-upload"
              hidden
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && file.type === "application/pdf") {
                  setPdfFile(file);
                } else {
                  alert("Solo se permiten archivos PDF");
                }
              }}
            />

            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {pdfFile
                ? "PDF seleccionado:"
                : "Arrastra tu factura rectificativa aquí"}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {pdfFile
                ? pdfFile.name
                : "o haz clic para seleccionar un archivo PDF"}
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={analizarPDF}
              disabled={!pdfFile || previewLoading}
            >
              {previewLoading ? "Analizando..." : "Comenzar análisis"}
            </Button>

            <Button
              color="error"
              onClick={() => {
                setModoEntrada(null);
                setPdfFile(null);
              }}
            >
              Cancelar
            </Button>
          </Stack>
        </Box>
      )}

      {/* ================================= */}
      {/* FORMULARIO RECTIFICACIÓN */}
      {/* ================================= */}

      {modoEntrada === "manual" && (
        <Box component="form" onSubmit={enviarRectificativa}>
          {/* FECHA + TIPO */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Fecha de expedición"
                value={fechaExpedicion}
                onChange={(e) => setFechaExpedicion(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de rectificación</InputLabel>
                <Select
                  value={tipoRectificacion}
                  label="Tipo de rectificación"
                  onChange={(e) => setTipoRectificacion(e.target.value)}
                >
                  <MenuItem value="DIFERENCIAS">Diferencias</MenuItem>
                  <MenuItem value="SUSTITUCION">Sustitución</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          {/* ================================= */}
          {/* CLIENTE */}
          {/* ================================= */}

          {tipoRectificacion === "SUSTITUCION" && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                CLIENTE
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Cliente existente</InputLabel>
                <Select
                  value={clienteSeleccionado || ""}
                  label="Cliente existente"
                  onChange={(e) => {
                    setClienteSeleccionado(e.target.value);
                    setUsarClienteExistente(true);
                  }}
                >
                  {clientes.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.nombre} ({c.nif})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="body2" sx={{ mb: 2 }}>
                o crear cliente nuevo
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="NIF"
                    value={clienteNuevo.nif}
                    onChange={(e) =>
                      setClienteNuevo({ ...clienteNuevo, nif: e.target.value })
                    }
                  />
                </Grid>

                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Nombre"
                    value={clienteNuevo.nombre}
                    onChange={(e) =>
                      setClienteNuevo({
                        ...clienteNuevo,
                        nombre: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Dirección"
                    value={clienteNuevo.direccion}
                    onChange={(e) =>
                      setClienteNuevo({
                        ...clienteNuevo,
                        direccion: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Código postal"
                    value={clienteNuevo.codigo_postal}
                    onChange={(e) =>
                      setClienteNuevo({
                        ...clienteNuevo,
                        codigo_postal: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Ciudad"
                    value={clienteNuevo.ciudad}
                    onChange={(e) =>
                      setClienteNuevo({
                        ...clienteNuevo,
                        ciudad: e.target.value,
                      })
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          )}
          {/* ================================= */}
          {/* CONCEPTOS EDITABLES */}
          {/* ================================= */}

          <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 600 }}>
            CONCEPTOS
          </Typography>

          {conceptos.map((c, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Descripción"
                  value={c.descripcion}
                  onChange={(e) => {
                    const copia = [...conceptos];
                    copia[index].descripcion = e.target.value;
                    setConceptos(copia);
                  }}
                />
              </Grid>

              <Grid item xs={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Cantidad"
                  value={c.cantidad}
                  onChange={(e) => {
                    const copia = [...conceptos];
                    copia[index].cantidad = e.target.value;
                    setConceptos(copia);
                  }}
                />
              </Grid>

              <Grid item xs={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Unidad"
                  value={c.unidad}
                  onChange={(e) => {
                    const copia = [...conceptos];
                    copia[index].unidad = e.target.value;
                    setConceptos(copia);
                  }}
                />
              </Grid>

              <Grid item xs={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Precio"
                  value={c.precioUnitario}
                  onChange={(e) => {
                    const copia = [...conceptos];
                    copia[index].precioUnitario = e.target.value;
                    setConceptos(copia);
                  }}
                />
              </Grid>

              <Grid item xs={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="% Impuesto"
                  value={c.tipoImpositivo}
                  onChange={(e) => {
                    const copia = [...conceptos];
                    copia[index].tipoImpositivo = e.target.value;
                    setConceptos(copia);
                  }}
                />
              </Grid>

              <Grid item xs={6} md={2}>
                <Button
                  color="error"
                  onClick={() =>
                    setConceptos(conceptos.filter((_, i) => i !== index))
                  }
                >
                  Quitar
                </Button>
              </Grid>
            </Grid>
          ))}

          <Button
            variant="outlined"
            fullWidth
            sx={{ borderStyle: "dashed", mb: 4 }}
            onClick={() =>
              setConceptos([
                ...conceptos,
                {
                  descripcion: "",
                  cantidad: 1,
                  precioUnitario: "",
                  tipoImpositivo: "",
                  tipoImpuesto: "IVA",
                },
              ])
            }
          >
            + Añadir nuevo concepto
          </Button>

          {/* ERRORES */}
          {errores.length > 0 && (
            <Box sx={{ mb: 3 }}>
              {errores.map((e, i) => (
                <Alert severity="error" key={i} sx={{ mb: 1 }}>
                  {e}
                </Alert>
              ))}
            </Box>
          )}

          <Stack direction="row" spacing={3} justifyContent="flex-end">
            <Button type="submit" variant="contained">
              Crear rectificativa
            </Button>
          </Stack>
        </Box>
      )}
    </Paper>
  );
}

export default RectificarFactura;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Autocomplete from "@mui/material/Autocomplete";
import { authFetch } from "./utils/authFetch";
import { useSubscription } from "./context/SubscriptionContext";
import { useSystem } from "./context/SystemContext";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Stack,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider,
  Grid,
} from "@mui/material";

function SubidaFactura() {
  const navigate = useNavigate();
  // =========================
  // Estados
  // =========================
  const { estadoSuscripcion, loading, setEstadoSuscripcion } =
    useSubscription();
  const [modo, setModo] = useState(null); // "PDF" | "MANUAL"
  const [pdf, setPdf] = useState(null);
  const [pdfAnalizado, setPdfAnalizado] = useState(false);
  const [facturaConfirmada, setFacturaConfirmada] = useState(false);
  const [facturaId, setFacturaId] = useState(null);
  const [datosFiscales, setDatosFiscales] = useState(null);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [usarClienteExistente, setUsarClienteExistente] = useState(true);
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [sifs, setSifs] = useState([]);
  const [sifSeleccionado, setSifSeleccionado] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState({});
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
  const [formData, setFormData] = useState({
    nifReceptor: "",
    numeroFactura: "",
    fechaExpedicion: "",
    tipoFactura: "ORDINARIA",
    conceptos: [
      {
        descripcion: "",
        cantidad: "",
        unidad: "ud",
        precioUnitario: "",
        tipoImpositivo: "",
        tipoImpuesto: "IVA",
      },
    ],
  });

  const [productosOpciones, setProductosOpciones] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [busquedaProducto, setBusquedaProducto] = useState("");

  const [errores, setErrores] = useState([]);
  const { mantenimiento } = useSystem();
  const [analizando, setAnalizando] = useState(false);
  // =========================
  // Cargar clientes
  // =========================
  useEffect(() => {
    cargarClientes();
  }, []);
  useEffect(() => {
    cargarProductos();
  }, []);
  useEffect(() => {
    async function cargarSifs() {
      try {
        const res = await authFetch("/api/sif");
        const data = await res.json();

        const lista = data.sifs || [];
        setSifs(lista);

        // 🔥 Seleccionar automáticamente el SIF activo
        const sifActivo = lista.find((s) => s.activo === 1) || lista[0];

        if (sifActivo) {
          setSifSeleccionado(String(sifActivo.id));
        }
      } catch (e) {
        console.error("Error cargando SIF", e);
      }
    }
    cargarSifs();
  }, []);
  useEffect(() => {
    async function cargarDatosFiscales() {
      try {
        const res = await authFetch("/api/user/datos-fiscales");

        const data = await res.json();
        setDatosFiscales(data.datos); // puede ser null
      } catch (error) {
        console.error("Error cargando datos fiscales", error);
      } finally {
        setCargandoDatos(false);
      }
    }

    cargarDatosFiscales();
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      buscarProductos(busquedaProducto);
    }, 300);

    return () => clearTimeout(timer);
  }, [busquedaProducto]);

  async function cargarClientes() {
    try {
      const res = await authFetch("/api/clientes");
      const data = await res.json();
      setClientes(data.clientes || []);
    } catch (e) {
      console.error("Error cargando clientes", e);
    }
  }

  async function cargarProductos() {
    try {
      const res = await authFetch("/api/productos");
      const data = await res.json();
      setProductos(data.productos || []);
    } catch (e) {
      console.error("Error cargando productos", e);
    }
  }
  // =========================
  // Manejo genérico de inputs
  // =========================
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // =========================
  // Seleccionar cliente
  // =========================
  function seleccionarCliente(id) {
    setClienteSeleccionado(id);

    const cliente = clientes.find((c) => c.id === Number(id));
    if (cliente) {
      setFormData((prev) => ({
        ...prev,
        nifReceptor: cliente.nif,
      }));
    }
  }

  // =========================
  // Paso 1: Analizar PDF
  // =========================

  async function analizarPDF(e) {
    e.preventDefault();
    setErrores([]);
    if (!pdf) return;
    setAnalizando(true);

    try {
      const data = new FormData();
      data.append("pdf", pdf);

      const res = await authFetch("/api/facturas/preview", {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (result.datosDetectados) {
        const datos = result.datosDetectados;

        // 1. Normalizar Fecha para el input datetime-local
        if (datos.fechaExpedicion) {
          if (datos.fechaExpedicion.length === 10) {
            datos.fechaExpedicion += "T09:00";
          } else {
            // Nos aseguramos de que solo tenga 16 caracteres (YYYY-MM-DDTHH:mm)
            datos.fechaExpedicion = datos.fechaExpedicion.slice(0, 16);
          }
        }

        // 2. Lógica de Cliente (Existente vs Nuevo)
        const nifDetectado = datos.receptor?.nif?.toUpperCase();
        const clienteExistente = clientes.find(
          (c) => c.nif?.toUpperCase() === nifDetectado,
        );

        if (clienteExistente) {
          setUsarClienteExistente(true);
          setClienteSeleccionado(String(clienteExistente.id));

          // Actualizamos formData con los datos de la factura + NIF del cliente guardado
          setFormData((prev) => ({
            ...prev,
            ...datos,
            nifReceptor: clienteExistente.nif,
          }));
        } else {
          setUsarClienteExistente(false);
          setClienteNuevo({
            nif: nifDetectado || "",
            nombre: datos.receptor?.nombre || "",
            direccion: datos.receptor?.direccion || "",
            codigo_postal: datos.receptor?.codigo_postal || "",
            ciudad: datos.receptor?.ciudad || "",
            pais: datos.receptor?.pais || "España",
            email: "",
            telefono: "",
          });

          // Actualizamos formData con los datos de la factura + NIF detectado
          setFormData((prev) => ({
            ...prev,
            ...datos,
            nifReceptor: nifDetectado || "",
          }));
        }

        // 3. Manejo de errores que vienen del backend
        if (result.erroresPreliminares?.length > 0) {
          setErrores(result.erroresPreliminares);
        }

        setPdfAnalizado(true);
      }
    } catch (error) {
      console.error("Error analizando PDF:", error);
      setErrores(["Error conectando con el servicio de IA"]);
    } finally {
      setAnalizando(false);
    }
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
      const file = e.dataTransfer.files[0];

      if (file.type !== "application/pdf") {
        setErrores(["Solo se permiten archivos PDF"]);
        return;
      }

      setPdf(file);
    }
  }
  function limpiarFormulario() {
    setPdf(null);
    setPdfAnalizado(false);
    setModo(null); // Vuelve a mostrar los botones "PDF" o "Manual"
    setErrores([]);
    setFormData({
      nifReceptor: "",
      numeroFactura: "",
      fechaExpedicion: "",
      tipoFactura: "ORDINARIA",
      conceptos: [
        {
          descripcion: "",
          cantidad: "",
          precioUnitario: "",
          tipoImpositivo: "",
          tipoImpuesto: "IVA",
        },
      ],
    });
  }
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
  // =========================
  // Validación final formulario
  // =========================
  function validarFormulario() {
    const nuevosErrores = [];

    if (!formData.numeroFactura) {
      nuevosErrores.push("Número de factura obligatorio");
    }

    if (!formData.fechaExpedicion) {
      nuevosErrores.push("Fecha de expedición con formato inválido");
    }

    if (
      formData.nifReceptor &&
      !/^[A-Z]{1}[0-9]{8}$|^[0-9]{8}[A-Z]{1}$/i.test(formData.nifReceptor)
    ) {
      nuevosErrores.push("NIF del receptor no válido");
    }
    if (!usarClienteExistente) {
      if (!clienteNuevo.nif || !validarNIF(clienteNuevo.nif)) {
        nuevosErrores.push("NIF del cliente nuevo no válido");
      }

      if (!clienteNuevo.nombre?.trim()) {
        nuevosErrores.push("Nombre del cliente obligatorio");
      }

      if (
        !clienteNuevo.codigo_postal ||
        !validarCodigoPostal(clienteNuevo.codigo_postal)
      ) {
        nuevosErrores.push("Código postal del cliente no válido");
      }

      if (clienteNuevo.email && !validarEmail(clienteNuevo.email)) {
        nuevosErrores.push("Email del cliente no válido");
      }

      if (clienteNuevo.telefono && !validarTelefono(clienteNuevo.telefono)) {
        nuevosErrores.push("Teléfono del cliente no válido (9 dígitos)");
      }
    }
    formData.conceptos.forEach((c, index) => {
      if (!c.descripcion.trim()) {
        nuevosErrores.push(`Descripción obligatoria en concepto ${index + 1}`);
      }

      if (isNaN(c.cantidad) || Number(c.cantidad) <= 0) {
        nuevosErrores.push(`Cantidad no válida en concepto ${index + 1}`);
      }

      if (isNaN(c.precioUnitario) || Number(c.precioUnitario) < 0) {
        nuevosErrores.push(
          `Precio unitario no válido en concepto ${index + 1}`,
        );
      }

      if (isNaN(c.tipoImpositivo) || Number(c.tipoImpositivo) < 0) {
        nuevosErrores.push(
          `Tipo impositivo no válido en concepto ${index + 1}`,
        );
      }
    });

    setErrores(nuevosErrores);
    return nuevosErrores.length === 0;
  }

  // =========================
  // Paso 2: Confirmar factura
  // =========================
  async function confirmarFactura(e) {
    e.preventDefault();

    if (enviando) return; // 🔒 anti doble click
    if (!validarFormulario()) return;

    setEnviando(true);
    // 🔹 Detectar productos nuevos
    const productosNuevos = new Map();

    formData.conceptos.forEach((c) => {
      if (!c.descripcion?.trim()) return;

      const nombreNormalizado = c.descripcion.toLowerCase().trim();

      // comprobar si ya existe en catálogo
      const existeEnCatalogo = productos.some(
        (p) => p.nombre.toLowerCase().trim() === nombreNormalizado,
      );

      // comprobar si ya lo vamos a crear en esta factura
      const yaEnLista = productosNuevos.has(nombreNormalizado);

      if (!existeEnCatalogo && !yaEnLista) {
        productosNuevos.set(nombreNormalizado, {
          nombre: c.descripcion.trim(),
          precio: c.precioUnitario,
          tipo_iva: c.tipoImpositivo,
          unidad: c.unidad || "ud",
        });
      }
    });

    // 🔹 Crear productos en catálogo
    if (productosNuevos.size > 0) {
      await Promise.all(
        [...productosNuevos.values()].map((p) =>
          authFetch("/api/productos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(p),
          }),
        ),
      );
    }

    const data = new FormData();
    if (modo === "PDF" && pdf) {
      data.append("pdf", pdf);
    }

    const fechaISO = new Date(formData.fechaExpedicion).toISOString();

    const metadataFinal = {
      ...formData,
      fechaExpedicion: fechaISO,
      usarClienteExistente,
      clienteId: clienteSeleccionado,
      clienteNuevo,
      sifConfigId: sifSeleccionado,
    };

    data.append("metadata", JSON.stringify(metadataFinal));

    try {
      const res = await authFetch("/api/facturas/confirm", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        const error = await res.json();
        setErrores(
          error.errores || [error.mensaje || "Error confirmando factura"],
        );
        return;
      }
      // devolver PDF sellado
      /*const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `factura_${formData.numeroFactura}_sellada.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);*/
      const responseData = await res.json();

      if (!responseData.ok) {
        setErrores(["Error confirmando factura"]);
        return;
      }

      const nuevaFacturaId = responseData.facturaId;

      // 🔽 Descarga usando tu endpoint existente
      const pdfRes = await authFetch(`/api/facturas/${nuevaFacturaId}/pdf`);

      if (pdfRes.ok) {
        const blob = await pdfRes.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `factura_${formData.numeroFactura}.pdf`;
        a.click();

        window.URL.revokeObjectURL(url);
      }

      // 🔥 Redirigir al detalle
      navigate(`/registro/${nuevaFacturaId}`);

      setModo(null);
      setPdf(null);
      setPdfAnalizado(false);
      setFormData({
        nifReceptor: "",
        numeroFactura: "",
        fechaExpedicion: "",
        tipoFactura: "ORDINARIA",
        conceptos: [
          {
            descripcion: "",
            cantidad: "",
            precioUnitario: "",
            tipoImpositivo: "",
            tipoImpuesto: "IVA",
          },
        ],
      });

      alert("Factura registrada correctamente");
    } catch (error) {
      console.error("Error confirmando factura:", error);
      setErrores(["Error confirmando la factura"]);
    } finally {
      setEnviando(false); // 🔓 se desbloquea siempre
    }
  }
  async function buscarProductos(texto = "") {
    try {
      setLoadingProductos(true);

      const res = await authFetch(`/api/productos/buscar?q=${texto}`);
      const data = await res.json();

      setProductosOpciones(data.productos || []);
    } catch {
      setProductosOpciones([]);
    } finally {
      setLoadingProductos(false);
    }
  }

  function añadirConcepto() {
    setFormData((prev) => ({
      ...prev,
      conceptos: [
        ...prev.conceptos,
        {
          descripcion: "",
          cantidad: "",
          unidad: "ud",
          precioUnitario: "",
          tipoImpositivo: "",
          tipoImpuesto: "IVA",
        },
      ],
    }));
  }

  function eliminarConcepto(index) {
    setFormData((prev) => ({
      ...prev,
      conceptos: prev.conceptos.filter((_, i) => i !== index),
    }));
  }

  function actualizarConcepto(index, campo, valor) {
    setFormData((prev) => {
      const nuevos = [...prev.conceptos];
      nuevos[index] = {
        ...nuevos[index],
        [campo]: valor,
      };
      return { ...prev, conceptos: nuevos };
    });
  }

  const subtotal = formData.conceptos.reduce((acc, c) => {
    const cantidad = Number(c.cantidad) || 0;
    const precio = Number(c.precioUnitario) || 0;
    return acc + cantidad * precio;
  }, 0);

  const totalIVA = formData.conceptos.reduce((acc, c) => {
    const cantidad = Number(c.cantidad) || 0;
    const precio = Number(c.precioUnitario) || 0;
    const iva = Number(c.tipoImpositivo) || 0;

    const base = cantidad * precio;
    return acc + base * (iva / 100);
  }, 0);

  const totalFactura = subtotal + totalIVA;

  if (loading) return <p>Cargando...</p>;
  /*
  const suscripcionActiva = estadoSuscripcion?.estadoSuscripcion === "ACTIVA";

  const limiteAlcanzado =
    estadoSuscripcion &&
    estadoSuscripcion.facturasEsteMes >= estadoSuscripcion.limite;

  if (!suscripcionActiva || limiteAlcanzado) {
    return (
      <div style={{ color: "red" }}>
        {!suscripcionActiva && (
          <p>
            Tu suscripción está {estadoSuscripcion?.estadoSuscripcion}. No
            puedes registrar facturas.
          </p>
        )}

        {suscripcionActiva && limiteAlcanzado && (
          <p>
            Has alcanzado el límite mensual de tu plan (
            {estadoSuscripcion.limite} facturas).
          </p>
        )}
      </div>
    );
  }
*/
  function datosIncompletos() {
    if (!datosFiscales) return true;

    const { razon_social, nif, direccion, codigo_postal, ciudad, pais } =
      datosFiscales;

    return (
      !razon_social || !nif || !direccion || !codigo_postal || !ciudad || !pais
    );
  }
  return (
    <Paper
      elevation={3}
      sx={{ p: { xs: 2, md: 5 }, borderRadius: 4, border: "1px solid #eee" }}
    >
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>
        Crear Factura
      </Typography>

      {!modo && (
        <Stack direction="row" spacing={3}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 2 }}
            onClick={() => setModo("PDF")}
            disabled={datosIncompletos()}
          >
            Desde PDF (IA)
          </Button>
          <Button
            type="submit"
            variant="outlined"
            color="primary"
            size="large"
            sx={{ mt: 2 }}
            onClick={() => {
              setModo("MANUAL");
              setPdfAnalizado(true);
            }}
            disabled={datosIncompletos()}
          >
            Entrada Manual
          </Button>
        </Stack>
      )}

      {modo === "PDF" && !pdfAnalizado && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Subir factura en PDF
          </Typography>

          {/* Drag & Drop ancho completo */}
          <Box
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById("pdf-upload").click()}
            sx={{
              border: "2px dashed",
              borderColor: dragActive ? "primary.main" : "#d0d5dd",
              borderRadius: 3,
              bgcolor: dragActive ? "rgba(25,118,210,0.05)" : "#fafafa",
              p: 5,
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              width: "100%",
            }}
          >
            <input
              type="file"
              id="pdf-upload"
              hidden
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && file.type === "application/pdf") {
                  setPdf(file);
                } else {
                  setErrores(["Solo se permiten archivos PDF"]);
                }
              }}
            />

            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {pdf ? "PDF seleccionado:" : "Arrastra tu factura aquí"}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {pdf ? pdf.name : "o haz clic para seleccionar un archivo PDF"}
            </Typography>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={analizarPDF}
              disabled={!pdf || analizando}
              sx={{ px: 4 }}
            >
              {analizando ? "Analizando con IA..." : "Comenzar análisis"}
            </Button>
            <Button
              variant="outlined"
              color="error"
              sx={{ px: 5 }}
              onClick={limpiarFormulario}
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      )}

      {pdfAnalizado && (
        <Box component="form" onSubmit={confirmarFactura}>
          {/* ========================= */}
          {/* FILA 1 → Nº + FECHA */}
          {/* ========================= */}
          <Grid item>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Número de Factura"
                      name="numeroFactura"
                      value={formData.numeroFactura}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="datetime-local"
                      label="Fecha de Expedición"
                      name="fechaExpedicion"
                      value={formData.fechaExpedicion}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* ========================= */}
          {/* FILA 2 → DATOS CLIENTE */}
          {/* ========================= */}
          <Grid item xs={12}>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mt: 4, mb: 3, fontWeight: 600, letterSpacing: 0.5 }}
              >
                DATOS DEL CLIENTE
              </Typography>

              <RadioGroup
                row
                value={usarClienteExistente}
                onChange={(e) =>
                  setUsarClienteExistente(e.target.value === "true")
                }
                sx={{ mb: 2 }}
              >
                <FormControlLabel
                  value={true}
                  control={<Radio />}
                  label="Cliente existente"
                />
                <FormControlLabel
                  value={false}
                  control={<Radio />}
                  label="Cliente nuevo"
                />
              </RadioGroup>

              {usarClienteExistente ? (
                <FormControl fullWidth>
                  <InputLabel>Seleccionar Cliente</InputLabel>
                  <Select
                    value={clienteSeleccionado}
                    label="Seleccionar Cliente"
                    onChange={(e) => seleccionarCliente(e.target.value)}
                  >
                    {clientes.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.nombre} ({c.nif})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="NIF"
                      value={clienteNuevo.nif}
                      onChange={(e) =>
                        setClienteNuevo({
                          ...clienteNuevo,
                          nif: e.target.value,
                        })
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      label="Nombre / Razón Social"
                      value={clienteNuevo.nombre}
                      onChange={(e) =>
                        setClienteNuevo({
                          ...clienteNuevo,
                          nombre: e.target.value,
                        })
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
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

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Código Postal"
                      value={clienteNuevo.codigo_postal}
                      onChange={(e) =>
                        setClienteNuevo({
                          ...clienteNuevo,
                          codigo_postal: e.target.value,
                        })
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
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

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="País"
                      value={clienteNuevo.pais}
                      onChange={(e) =>
                        setClienteNuevo({
                          ...clienteNuevo,
                          pais: e.target.value,
                        })
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={clienteNuevo.email}
                      onChange={(e) =>
                        setClienteNuevo({
                          ...clienteNuevo,
                          email: e.target.value,
                        })
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Teléfono"
                      value={clienteNuevo.telefono}
                      onChange={(e) =>
                        setClienteNuevo({
                          ...clienteNuevo,
                          telefono: e.target.value,
                        })
                      }
                    />
                  </Grid>
                </Grid>
              )}
            </Box>
          </Grid>

          {/* ========================= */}
          {/* FILA 3 → CONCEPTOS */}
          {/* ========================= */}
          <Grid item xs={12} rowSpacing={6} columnSpacing={3}>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mt: 4, mb: 3, fontWeight: 600, letterSpacing: 0.5 }}
              >
                CONCEPTOS
              </Typography>
              <Grid container spacing={2}>
                {formData.conceptos.map((c, index) => (
                  <Grid item xs={12}>
                    <Grid
                      container
                      spacing={2}
                      sx={{
                        mb: 2,
                        display: "flex",
                        flexWrap: "nowrap",
                        alignItems: "center",
                      }}
                    >
                      <Grid item sx={{ flex: 1, minWidth: 300 }}>
                        <Autocomplete
                          fullWidth
                          sx={{ minWidth: 0 }}
                          freeSolo
                          options={productosOpciones}
                          loading={loadingProductos}
                          getOptionLabel={(option) =>
                            typeof option === "string" ? option : option.nombre
                          }
                          onChange={(event, value) => {
                            if (!value) return;

                            if (typeof value === "string") {
                              actualizarConcepto(index, "descripcion", value);
                            } else {
                              actualizarConcepto(
                                index,
                                "descripcion",
                                value.nombre,
                              );
                              actualizarConcepto(
                                index,
                                "precioUnitario",
                                value.precio,
                              );
                              actualizarConcepto(
                                index,
                                "tipoImpositivo",
                                value.tipo_iva,
                              );
                              actualizarConcepto(
                                index,
                                "unidad",
                                value.unidad || "ud",
                              );
                            }
                          }}
                          onInputChange={(event, value) => {
                            setBusquedaProducto(value);
                            actualizarConcepto(index, "descripcion", value);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Descripción"
                              size="small"
                            />
                          )}
                        />
                      </Grid>

                      <Grid item sx={{ width: 120 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Cantidad"
                          value={c.cantidad}
                          onChange={(e) =>
                            actualizarConcepto(
                              index,
                              "cantidad",
                              e.target.value,
                            )
                          }
                        />
                      </Grid>
                      <Grid item sx={{ width: 150 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Unidad"
                          value={c.unidad}
                          onChange={(e) =>
                            actualizarConcepto(index, "unidad", e.target.value)
                          }
                        />
                      </Grid>
                      <Grid item sx={{ width: 150 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Precio"
                          value={c.precioUnitario}
                          onChange={(e) =>
                            actualizarConcepto(
                              index,
                              "precioUnitario",
                              e.target.value,
                            )
                          }
                        />
                      </Grid>

                      <Grid item sx={{ width: 120 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="% IVA"
                          value={c.tipoImpositivo}
                          onChange={(e) =>
                            actualizarConcepto(
                              index,
                              "tipoImpositivo",
                              e.target.value,
                            )
                          }
                        />
                      </Grid>

                      <Grid item sx={{ width: 150 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Importe"
                          value={(
                            (Number(c.cantidad) || 0) *
                            (Number(c.precioUnitario) || 0)
                          ).toFixed(2)}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>

                      <Grid item sx={{ width: 200 }}>
                        {formData.conceptos.length > 1 && (
                          <Button
                            color="error"
                            onClick={() => eliminarConcepto(index)}
                            sx={{ height: "100%" }}
                          >
                            Quitar concepto
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                ))}
              </Grid>
              <Button
                variant="outlined"
                fullWidth
                sx={{ borderStyle: "dashed", mt: 1 }}
                onClick={añadirConcepto}
              >
                + Añadir nuevo concepto
              </Button>
            </Box>
            <Box
              sx={{
                mt: 4,
                maxWidth: 300,
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                p: 2,
              }}
            >
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2">
                    {subtotal.toFixed(2)} €
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">IVA</Typography>
                  <Typography variant="body2">
                    {totalIVA.toFixed(2)} €
                  </Typography>
                </Stack>

                <Divider />

                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontWeight: 600 }}>Total</Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    {totalFactura.toFixed(2)} €
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Grid>

          {/* ========================= */}
          {/* FILA 4 → SIF */}
          {/* ========================= */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Divider sx={{ mb: 4 }} />

            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Software Emisor (SIF)
            </Typography>

            <Box sx={{ maxWidth: 400 }}>
              <FormControl fullWidth>
                <Select
                  value={sifSeleccionado}
                  onChange={(e) => setSifSeleccionado(e.target.value)}
                >
                  {sifs.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>

          {/* ========================= */}
          {/* FILA 5 → BOTONES */}
          {/* ========================= */}
          <Grid item xs={12} sx={{ mt: 4 }}>
            <Stack direction="row" spacing={3} justifyContent="flex-end">
              <Button type="submit" variant="contained" sx={{ px: 5 }}>
                Confirmar y Generar Sello
              </Button>

              <Button
                variant="outlined"
                color="error"
                sx={{ px: 5 }}
                onClick={limpiarFormulario}
              >
                Cancelar
              </Button>
            </Stack>
          </Grid>
        </Box>
      )}

      {errores.length > 0 && (
        <Box sx={{ mt: 3 }}>
          {errores.map((err, i) => (
            <Alert severity="error" key={i} sx={{ mb: 1 }}>
              {err}
            </Alert>
          ))}
        </Box>
      )}
    </Paper>
  );
}

export default SubidaFactura;

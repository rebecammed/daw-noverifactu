import express from "express";
import fs from "fs";
import path from "path";
import pool from "../../db/db.js";
import auth from "../../middleware/auth.js";
import checkMantenimiento from "../../middleware/checkMantenimiento.js";
import { verificarDatosFiscales } from "../../middleware/verificarDatosFiscales.js";
import { upload } from "../../middleware/upload.js";
import { procesarPDF } from "../../utils/procesarPDF.js";
import { registrarEvento } from "../../utils/eventos.js";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import validarFacturaAlta from "../../validators/facturaAlta.js";
import normalizarFacturaAlta from "../../normalizers/facturaAlta.js";
import { generarHashRegistro } from "../../src/core/hashEngine.js";
import generarFacturaAltaXML from "../../xml/generarFacturaAltaxml.js";
import generarFacturaRectificativaXML from "../../xml/generarFacturaRectificativaxml.js";
import generarFacturaAnulacionXML from "../../xml/generarFacturaAnulacionxml.js";
import validarFacturaAltaXSD from "../../xml/validarFacturaAltaxsd.js";
import validarFacturaRectificativaXSD from "../../xml/validarFacturaRectificativaxsd.js";
import validarFacturaAnulacionXSD from "../../xml/validarFacturaAnulacionxsd.js";
import generarFacturaAltaPDF from "../../pdf/generarFacturaAltaPDF.js";

dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const router = express.Router();

router.post(
  "/preview",
  upload.single("pdf"),
  auth,
  checkMantenimiento,
  verificarDatosFiscales,
  //comprobarSuscripcion,
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ mensaje: "Archivo no recibido" });
    }

    const rutaTemporal = req.file.path;

    try {
      // 1. Preparar el modelo
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      // 2. Leer archivo y convertir a Base64 para la IA
      const dataArchivo = {
        inlineData: {
          data: Buffer.from(fs.readFileSync(rutaTemporal)).toString("base64"),
          mimeType: req.file.mimetype,
        },
      };

      // 3. Prompt estricto para Verifactu
      // En tu endpoint /api/facturas/preview
      const prompt = `Analiza esta factura y extrae los datos. 
Responde ÚNICAMENTE con un JSON:
{
  "numeroFactura": "string",
  "fechaExpedicion": "YYYY-MM-DDTHH:mm",
  "receptor": {
    "nif": "string",
    "nombre": "string",
    "direccion": "string",
    "codigo_postal": "string",
    "ciudad": "string",
    "pais": "string"
  },
  "conceptos": [
    {"descripcion": "string", "cantidad": number, "precioUnitario": number, "tipoImpositivo": number, "tipoImpuesto": "IVA"}
  ]
    }
      Si un dato no existe, usa cadena vacía o 0. No incluyas markdown ni texto extra.`;

      const result = await model.generateContent([prompt, dataArchivo]);
      const response = await result.response;
      let textoLimpio = response
        .text()
        .replace(/```json|```/g, "")
        .trim();

      const datosIA = JSON.parse(textoLimpio);

      // 4. Normalización final (tu lógica original adaptada)
      const datosDetectados = {
        ...datosIA,
        conceptos: (datosIA.conceptos || []).map((c) => ({
          descripcion: c.descripcion || "",
          cantidad: Number(c.cantidad) || 1,
          precioUnitario: Number(c.precioUnitario) || 0,
          tipoImpositivo: Number(c.tipoImpositivo) || 21,
          tipoImpuesto: c.tipoImpuesto || "IVA",
        })),
      };

      // 5. Validación Verifactu (tu función existente)
      const erroresPreliminares = validarFacturaAlta(
        datosDetectados,
        new Date(),
      );

      fs.unlinkSync(rutaTemporal);

      return res.json({
        mensaje: "Datos extraídos por IA correctamente",
        datosDetectados,
        erroresPreliminares,
      });
    } catch (error) {
      if (fs.existsSync(rutaTemporal)) fs.unlinkSync(rutaTemporal);
      console.error("Error IA Preview:", error);
      return res.status(500).json({
        mensaje: "Error en el análisis de IA",
        detalle: error.message,
      });
    }
  },
);

router.post(
  "/confirm",
  upload.single("pdf"),
  auth,
  checkMantenimiento,
  verificarDatosFiscales,
  //comprobarSuscripcion,
  async (req, res) => {
    const connection = await pool.getConnection();
    const usuarioId = req.usuario.id;
    const pdf = req.file || null;

    try {
      if (!req.body.metadata) {
        return res.status(400).json({ mensaje: "Metadatos no recibidos" });
      }

      let metadata;
      try {
        metadata = JSON.parse(req.body.metadata);
      } catch {
        return res.status(400).json({ mensaje: "Metadatos mal formados" });
      }

      const errores = validarFacturaAlta(metadata, new Date());
      if (errores.length > 0) {
        return res.status(400).json({ errores });
      }

      const datosNormalizados = normalizarFacturaAlta(metadata);

      await connection.beginTransaction();

      // ==========================
      // EMISOR
      // ==========================
      const [[emisor]] = await connection.query(
        `SELECT nif, razon_social, direccion, codigo_postal, ciudad, pais
         FROM datos_fiscales WHERE usuario_id = ?`,
        [usuarioId],
      );

      if (!emisor) {
        throw new Error("Datos fiscales no configurados");
      }

      const nifEmisor = emisor.nif;

      // ==========================
      // IMPORTES DESDE CONCEPTOS
      // ==========================
      if (
        !metadata.conceptos ||
        !Array.isArray(metadata.conceptos) ||
        metadata.conceptos.length === 0
      ) {
        throw new Error("La factura debe contener al menos un concepto");
      }
      // ==========================
      // PROCESAR CONCEPTOS
      // ==========================

      const conceptosProcesados = datosNormalizados.conceptos.map((c) => {
        const cantidad = Number(c.cantidad);
        const precio = Number(c.precioUnitario);
        const tipo = Number(c.tipoImpositivo);

        const base = Number((cantidad * precio).toFixed(2));
        const cuotaCalculada = Number((base * (tipo / 100)).toFixed(2));

        const cuotaFinal =
          c.tipoImpuesto === "IRPF"
            ? -cuotaCalculada // 🔥 IRPF en negativo
            : cuotaCalculada;

        return {
          descripcion: c.descripcion,
          cantidad,
          precioUnitario: precio,
          tipoImpuesto: c.tipoImpuesto,
          tipoImpositivo: tipo,
          base,
          cuota: cuotaFinal,
        };
      });

      // ==========================
      // AGRUPAR IMPUESTOS DESDE CONCEPTOS
      // ==========================

      const resumenImpuestos = {};

      for (const c of conceptosProcesados) {
        const clave = `${c.tipoImpuesto}-${c.tipoImpositivo}`;

        if (!resumenImpuestos[clave]) {
          resumenImpuestos[clave] = {
            tipoImpuesto: c.tipoImpuesto,
            tipoImpositivo: c.tipoImpositivo,
            base: 0,
            cuota: 0,
          };
        }

        resumenImpuestos[clave].base += c.base;
        resumenImpuestos[clave].cuota += c.cuota;
      }

      // ==========================
      // CALCULAR TOTALES DESDE RESUMEN
      // ==========================

      let baseTotal = 0;
      let cuotaTotal = 0;
      let cuotaIVA = 0;

      for (const key in resumenImpuestos) {
        const r = resumenImpuestos[key];

        baseTotal += r.base;
        cuotaTotal += r.cuota;

        if (r.tipoImpuesto === "IVA") {
          cuotaIVA += r.cuota;
        }
      }

      baseTotal = Number(baseTotal.toFixed(2));
      cuotaTotal = Number(cuotaTotal.toFixed(2));
      cuotaIVA = Number(cuotaIVA.toFixed(2));

      const importeTotal = Number((baseTotal + cuotaTotal).toFixed(2));

      // ==========================
      // DUPLICADO
      // ==========================
      const [existe] = await connection.query(
        `SELECT id FROM facturas
         WHERE usuario_id = ? AND numero_factura = ?
         LIMIT 1`,
        [usuarioId, datosNormalizados.numeroFactura],
      );

      if (existe.length > 0) {
        throw new Error("Ya existe una factura con ese número");
      }

      // ==========================
      // CADENA
      // ==========================
      const [ultimoRegistro] = await connection.query(
        `SELECT hash_registro_actual, num_registro
         FROM registros_facturacion
         WHERE usuario_id = ?
         ORDER BY num_registro DESC
         LIMIT 1
         FOR UPDATE`,
        [usuarioId],
      );

      const numRegistroAnterior =
        ultimoRegistro.length > 0 ? ultimoRegistro[0].num_registro : 0;

      const hashAnterior =
        ultimoRegistro.length > 0
          ? ultimoRegistro[0].hash_registro_actual
          : HASH_GENESIS;

      const numRegistroActual = numRegistroAnterior + 1;

      // ==========================
      // SIF
      // ==========================
      const [[sif]] = await connection.query(
        `SELECT id, nombre, nif, version, fecha_declaracion_responsable
         FROM sif_configuracion
         WHERE id = ?`,
        [metadata.sifConfigId],
      );

      if (!sif) {
        throw new Error("SIF no válido");
      }

      const fechaEmision = new Date(
        datosNormalizados.fechaExpedicion,
      ).toISOString();

      const hashActual = generarHashRegistro({
        sifId: sif.nombre,
        nifEmisor,
        numeroFacturaCompleto: datosNormalizados.numeroFactura,
        fechaHoraEmision: fechaEmision,
        importeTotal,
        numRegistroAnterior,
        numRegistroActual,
        hashAnterior,
      });

      // ==========================
      // CLIENTE (guardar y obtener id + datos)
      // ==========================
      let clienteFinalId;
      let receptor;

      if (metadata.usarClienteExistente && metadata.clienteId) {
        const [[cliente]] = await connection.query(
          `SELECT * FROM clientes WHERE id = ? AND usuario_id = ?`,
          [metadata.clienteId, usuarioId],
        );

        if (!cliente) throw new Error("Cliente no encontrado");

        clienteFinalId = cliente.id;
        receptor = cliente; // 👈 AQUÍ tienes el nif
      } else {
        const [insertCliente] = await connection.query(
          `INSERT INTO clientes
     (usuario_id, nif, nombre, direccion, codigo_postal, ciudad, pais, email, telefono)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            usuarioId,
            metadata.clienteNuevo.nif,
            metadata.clienteNuevo.nombre,
            metadata.clienteNuevo.direccion,
            metadata.clienteNuevo.codigo_postal,
            metadata.clienteNuevo.ciudad,
            metadata.clienteNuevo.pais,
            metadata.clienteNuevo.email,
            metadata.clienteNuevo.telefono,
          ],
        );

        clienteFinalId = insertCliente.insertId;

        // 👇 El receptor en este caso es lo que viene del formulario
        receptor = metadata.clienteNuevo;
      }

      // ==========================
      // XML (🔥 CORREGIDO receptor)
      // ==========================
      const impuestosXML = Object.values(resumenImpuestos).map((r) => ({
        base: Number(r.base.toFixed(2)),
        tipoImpositivo: r.tipoImpositivo,
        cuota: Number(r.cuota.toFixed(2)),
        tipoImpuesto: r.tipoImpuesto,
      }));

      const impuestosPDF = Object.values(resumenImpuestos).map((r) => ({
        base: Number(r.base.toFixed(2)),
        tipoImpositivo: r.tipoImpositivo,
        cuota: Number(r.cuota.toFixed(2)),
        tipoImpuesto: r.tipoImpuesto,
      }));

      const datosFacturaXML = {
        cabecera: {
          nifEmisor,
          nifReceptor: receptor.nif, // 🔥 CORREGIDO
          versionSIF: sif.version,
        },
        datosFactura: {
          numeroFactura: datosNormalizados.numeroFactura,
          fechaExpedicion: fechaEmision,
          tipoFactura: datosNormalizados.tipoFactura,
          importeTotal,
        },
        desgloseFiscal: {
          impuestos: impuestosXML,
        },
        trazabilidad: {
          numRegAnt: numRegistroAnterior,
          numRegAct: numRegistroActual,
          hashAnterior,
          hashPropio: hashActual,
          identificacionSIF: {
            idSw: sif.nombre,
            nifDev: sif.nif,
            fechaDeclaracionResponsable: new Date(
              sif.fecha_declaracion_responsable,
            ).toISOString(),
          },
        },
      };

      const xmlFactura = generarFacturaAltaXML(datosFacturaXML);
      await validarFacturaAltaXSD(xmlFactura);

      // ==========================
      // INSERT REGISTRO
      // ==========================

      const fechaGeneracion = new Date().toISOString();
      const [registroResult] = await connection.query(
        `INSERT INTO registros_facturacion
         (usuario_id, fecha_hora_generacion, contenido_registro,
          hash_registro_anterior, hash_registro_actual,
          estado, num_registro, sif_config_id)
         VALUES (?, ?, ?, ?, ?, 'ALTA', ?, ?)`,
        [
          usuarioId,
          fechaGeneracion,
          xmlFactura,
          hashAnterior,
          hashActual,
          numRegistroActual,
          sif.id,
        ],
      );

      const registroId = registroResult.insertId;

      // ==========================
      // INSERT FACTURA (🔥 ampliado)
      // ==========================
      const [facturaResult] = await connection.query(
        `INSERT INTO facturas
         (usuario_id, registro_id, numero_factura,
          fecha_expedicion, tipo_factura,
          importe_total, 
          ruta_pdf, cliente_id, pdf_generado_path, xml_generado_path)
         VALUES (?, ?, ?, ?, ?, ?, NULL, ?, NULL, NULL)`,
        [
          usuarioId,
          registroId,
          datosNormalizados.numeroFactura,
          fechaEmision,
          datosNormalizados.tipoFactura,
          importeTotal,
          clienteFinalId,
        ],
      );

      const facturaId = facturaResult.insertId;

      // ==========================
      // INSERT CONCEPTOS
      // ==========================
      for (const c of conceptosProcesados) {
        await connection.query(
          `
    INSERT INTO factura_conceptos
    (factura_id, descripcion, cantidad, precio_unitario,
     tipo_impositivo, tipo_impuesto, base, cuota)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
          [
            facturaId,
            c.descripcion,
            c.cantidad,
            c.precioUnitario,
            c.tipoImpositivo,
            c.tipoImpuesto,
            c.base,
            c.cuota,
          ],
        );
      }
      for (const r of Object.values(resumenImpuestos)) {
        await connection.query(
          `
    INSERT INTO factura_impuestos
    (factura_id, base_imponible, tipo_impositivo, cuota, tipo_impuesto)
    VALUES (?, ?, ?, ?, ?)
    `,
          [
            facturaId,
            Number(r.base.toFixed(2)),
            r.tipoImpositivo,
            Number(r.cuota.toFixed(2)),
            r.tipoImpuesto,
          ],
        );
      }

      // ==========================
      // STORAGE
      // ==========================
      const baseDir = path.join(
        process.cwd(),
        "storage",
        "usuarios",
        String(usuarioId),
        "facturas",
        String(facturaId),
      );

      fs.mkdirSync(baseDir, { recursive: true });

      // 🔥 Guardar XML
      const rutaXML = path.join(baseDir, "factura.xml");
      fs.writeFileSync(rutaXML, xmlFactura, "utf8");

      await connection.query(
        `UPDATE facturas SET xml_generado_path = ? WHERE id = ?`,
        [rutaXML, facturaId],
      );
      let logoPath = null;

      if (emisor.logo_path) {
        const posibleRuta = path.resolve(process.cwd(), emisor.logo_path);

        if (fs.existsSync(posibleRuta)) {
          logoPath = posibleRuta;
        }
      }
      let rutaOriginal = null;

      const baseUrl = "https://daw-noverifactu.vercel.app/verificar-qr";
      const qrData =
        `${baseUrl}` +
        `?nif=${nifEmisor}` +
        `&num=${datosNormalizados.numeroFactura}` +
        `&fecha=${fechaEmision}` +
        `&importe=${importeTotal.toFixed(2)}` +
        `&cuotaIVA=${cuotaIVA.toFixed(2)}` +
        `&hash=${hashActual}` +
        `&ver=1`;

      await procesarPDF({
        pdf,
        baseDir,
        facturaId,
        connection,
        qrData,
        hashActual,
        generarPDFManual: async () => {
          return await generarFacturaAltaPDF({
            tipoDocumento: "ALTA",
            cabecera: {
              logoPath,
              emisor,
              receptor,
            },
            datosFactura: {
              numeroFactura: datosNormalizados.numeroFactura,
              fechaExpedicion: datosNormalizados.fechaExpedicion,
              tipoFactura: datosNormalizados.tipoFactura,
              importeTotal,
            },
            conceptos: conceptosProcesados,
            desgloseFiscal: { impuestos: impuestosPDF },
            trazabilidad: datosFacturaXML.trazabilidad,
            qrData,
          });
        },
      });

      await connection.commit();

      await registrarEvento(
        usuarioId,
        "FACTURA_REGISTRADA",
        `Factura ${datosNormalizados.numeroFactura} registrada`,
      );

      return res.json({
        ok: true,
        facturaId,
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error confirmando factura:", error);
      return res.status(500).json({
        mensaje: "Error registrando la factura",
      });
    } finally {
      connection.release();
    }
  },
);

router.post(
  "/preview-rectificativa",
  upload.single("pdf"),
  auth,
  checkMantenimiento,
  verificarDatosFiscales,
  //comprobarSuscripcion,
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ mensaje: "Archivo no recibido" });
    }

    const { facturaOrigenId } = req.body;
    const idUsuario = req.usuario.id;

    if (!facturaOrigenId) {
      return res.status(400).json({ mensaje: "Falta facturaOrigenId" });
    }

    const rutaTemporal = req.file.path;
    const connection = await pool.getConnection();

    try {
      // =====================================================
      // 1️⃣ Verificar que la factura origen existe y es del usuario
      // =====================================================

      const [facturaRows] = await connection.query(
        `SELECT id 
         FROM facturas 
         WHERE id = ? AND usuario_id = ?`,
        [facturaOrigenId, idUsuario],
      );

      if (!facturaRows.length) {
        fs.unlinkSync(rutaTemporal);
        return res
          .status(404)
          .json({ mensaje: "Factura origen no encontrada" });
      }

      // =====================================================
      // 2️⃣ Cargar conceptos originales
      // =====================================================

      const [conceptosOriginales] = await connection.query(
        `SELECT id, descripcion, cantidad, precio_unitario, tipo_impositivo, tipo_impuesto
         FROM factura_conceptos
         WHERE factura_id = ?`,
        [facturaOrigenId],
      );

      // =====================================================
      // 3️⃣ Llamada a IA
      // =====================================================

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const dataArchivo = {
        inlineData: {
          data: Buffer.from(fs.readFileSync(rutaTemporal)).toString("base64"),
          mimeType: req.file.mimetype,
        },
      };

      const prompt = `
Analiza esta factura RECTIFICATIVA y extrae los datos.

IMPORTANTE:
Si un concepto aparece con importe negativo o total negativo,
la cantidad debe ser negativa.

Responde ÚNICAMENTE con un JSON:

{
  "fechaExpedicion": "YYYY-MM-DDTHH:mm",
  "tipoRectificacion": "DIFERENCIAS o SUSTITUCION",
  "cliente": {
    "nif": "string",
    "nombre": "string",
    "direccion": "string",
    "codigo_postal": "string",
    "ciudad": "string",
    "pais": "string",
    "email": "string",
    "telefono": "string"
  },
  "conceptos": [
    {
      "descripcion": "string",
      "cantidad": number,   // negativa si el importe es negativo
      "precioUnitario": number,
      "tipoImpositivo": number,
      "tipoImpuesto": "IVA | IRPF | IGIC | IPSI"
    }
  ]
}

No incluyas markdown ni texto extra.
`;

      const result = await model.generateContent([prompt, dataArchivo]);
      const response = await result.response;

      let textoLimpio = response
        .text()
        .replace(/```json|```/g, "")
        .trim();

      const datosIA = JSON.parse(textoLimpio);

      console.log(datosIA.conceptos);

      let clienteProcesado = null;

      if (datosIA.cliente && datosIA.cliente.nif) {
        const [clienteExistente] = await connection.query(
          `SELECT id FROM clientes 
     WHERE usuario_id = ? AND nif = ?`,
          [idUsuario, datosIA.cliente.nif],
        );

        if (clienteExistente.length > 0) {
          clienteProcesado = {
            esNuevo: false,
            id: clienteExistente[0].id,
          };
        } else {
          clienteProcesado = {
            esNuevo: true,
            datos: datosIA.cliente,
          };
        }
      }

      function normalizarTexto(t) {
        return (t || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, " ")
          .trim();
      }

      let originalesDisponibles = [...conceptosOriginales];

      function buscarMatchPorDescripcion(nuevo) {
        const descNuevo = normalizarTexto(nuevo.descripcion);

        const index = originalesDisponibles.findIndex(
          (o) => normalizarTexto(o.descripcion) === descNuevo,
        );

        if (index !== -1) {
          const match = originalesDisponibles[index];

          // 🔥 Eliminamos del pool para no reutilizarlo
          originalesDisponibles.splice(index, 1);

          return match;
        }

        return null;
      }

      // =====================================================
      // 4️⃣ RECONSTRUCCIÓN ESTADO FINAL (MODELO A)
      // =====================================================

      // 1️⃣ Construimos estado base con originales
      let estadoFinal = conceptosOriginales.map((o) => ({
        idOriginal: o.id,
        descripcion: o.descripcion,
        cantidad: Number(o.cantidad),
        precioUnitario: Number(o.precio_unitario),
        tipoImpositivo: Number(o.tipo_impositivo),
        tipoImpuesto: o.tipo_impuesto,
        estadoCambio: "sin_cambios",
      }));

      // 2️⃣ Detectar si parece DELTA (heurística simple)
      const totalOriginal = conceptosOriginales.reduce((acc, o) => {
        return acc + Number(o.cantidad) * Number(o.precio_unitario);
      }, 0);

      const totalPDF = (datosIA.conceptos || []).reduce((acc, c) => {
        return acc + Number(c.cantidad || 0) * Number(c.precioUnitario || 0);
      }, 0);

      const pareceDelta =
        totalOriginal !== 0 &&
        Math.abs(totalPDF) < Math.abs(totalOriginal) &&
        Math.abs(totalPDF) !== Math.abs(totalOriginal);

      // 3️⃣ Aplicar cada línea del PDF
      for (const lineaPDF of datosIA.conceptos || []) {
        const nuevo = {
          descripcion: lineaPDF.descripcion || "",
          cantidad: Number(lineaPDF.cantidad) || 1,
          precioUnitario: Number(lineaPDF.precioUnitario) || 0,
          tipoImpositivo: Number(lineaPDF.tipoImpositivo) || 0,
          tipoImpuesto: lineaPDF.tipoImpuesto || "IVA",
        };

        if (lineaPDF.total && Number(lineaPDF.total) < 0) {
          nuevo.cantidad = -Math.abs(nuevo.cantidad);
        }

        const match = buscarMatchPorDescripcion(nuevo);

        if (match) {
          const lineaEstado = estadoFinal.find(
            (l) => l.idOriginal === match.id,
          );

          const esDeltaLinea = nuevo.cantidad < 0 || nuevo.precioUnitario < 0;

          if (lineaEstado) {
            if (esDeltaLinea || pareceDelta) {
              // Si precio unitario coincide → sumar cantidad
              if (
                Number(lineaEstado.precioUnitario) ===
                Number(nuevo.precioUnitario)
              ) {
                lineaEstado.cantidad =
                  Number(lineaEstado.cantidad) + Number(nuevo.cantidad);
              } else {
                // Si cambia precio → tratar como estado final directo
                lineaEstado.cantidad = nuevo.cantidad;
                lineaEstado.precioUnitario = nuevo.precioUnitario;
              }
            }

            lineaEstado.estadoCambio = "modificado";

            if (lineaEstado.cantidad === 0) {
              lineaEstado.estadoCambio = "eliminado";
            }
          }
        } else {
          // Nueva línea
          estadoFinal.push({
            idOriginal: null,
            ...nuevo,
            estadoCambio: "nuevo",
          });
        }
      }

      // =====================================================
      // 5️⃣ Limpieza y respuesta
      // =====================================================

      fs.unlinkSync(rutaTemporal);

      return res.json({
        mensaje: "Preview rectificativa generado correctamente",
        datosDetectados: {
          fechaExpedicion: datosIA.fechaExpedicion || "",
          tipoRectificacion:
            datosIA.tipoRectificacion === "SUSTITUCION"
              ? "SUSTITUCION"
              : "DIFERENCIAS",
          cliente: clienteProcesado,
          conceptos: estadoFinal,
        },
      });
    } catch (error) {
      if (fs.existsSync(rutaTemporal)) {
        fs.unlinkSync(rutaTemporal);
      }

      console.error("Error IA Preview Rectificativa:", error);

      return res.status(500).json({
        mensaje: "Error en análisis IA rectificativa",
        detalle: error.message,
      });
    } finally {
      connection.release();
    }
  },
);

router.post(
  "/rectificar",
  upload.single("pdf"),
  auth,
  checkMantenimiento,
  verificarDatosFiscales,
  //comprobarSuscripcion,
  async (req, res) => {
    const idUsuario = req.usuario.id;
    const pdf = req.file || null;
    const connection = await pool.getConnection();

    try {
      const data = JSON.parse(req.body.data);

      const {
        facturaOrigenId,
        fechaExpedicion,
        tipoRectificacion,
        cliente,
        conceptos,
      } = data;
      let conceptosParsed = conceptos;

      if (typeof conceptos === "string") {
        conceptosParsed = JSON.parse(conceptos);
      }
      if (
        !facturaOrigenId ||
        !fechaExpedicion ||
        !tipoRectificacion ||
        !Array.isArray(conceptos) ||
        conceptos.length === 0
      ) {
        return res.status(400).json({
          error: "Faltan datos obligatorios para la rectificación",
        });
      }

      await connection.beginTransaction();

      // 🔹 1. Cargar factura original
      const [facturas] = await connection.query(
        `
      SELECT 
        f.numero_factura,
        f.fecha_expedicion,
        f.importe_total,
        f.cliente_id,
        f.estado,
        f.tipo_factura,
        r.hash_registro_actual
      FROM facturas f
      INNER JOIN registros_facturacion r ON r.id = f.registro_id
      WHERE f.id = ? AND f.usuario_id = ?
      `,
        [facturaOrigenId, idUsuario],
      );

      if (!facturas.length) {
        await connection.rollback();
        return res.status(404).json({
          error: "Factura original no encontrada",
        });
      }

      const factura = facturas[0];

      // ❌ No permitir rectificar facturas anuladas
      if (factura.estado === "ANULADA") {
        await connection.rollback();
        return res.status(400).json({
          error: "No se puede rectificar una factura anulada.",
        });
      }

      // ❌ No permitir rectificar una rectificativa
      if (factura.tipo_factura === "RECTIFICATIVA") {
        await connection.rollback();
        return res.status(400).json({
          error: "No se puede rectificar una factura rectificativa.",
        });
      }

      const [impuestosOriginales] = await connection.query(
        `
      SELECT base_imponible, tipo_impositivo, tipo_impuesto
      FROM factura_impuestos
      WHERE factura_id = ?
      `,
        [facturaOrigenId],
      );

      // 🔹 Obtener conceptos originales para comparación línea a línea
      const [conceptosOriginales] = await connection.query(
        `
  SELECT id, descripcion, cantidad, precio_unitario, tipo_impositivo, tipo_impuesto
  FROM factura_conceptos
  WHERE factura_id = ?
  `,
        [facturaOrigenId],
      );
      // 🔹 2. Numeración rectificativa
      const [rectificativas] = await connection.query(
        `
      SELECT COUNT(*) as total
      FROM facturas
      WHERE usuario_id = ?
        AND tipo_factura = 'RECTIFICATIVA'
        AND factura_origen_id = ?
      `,
        [idUsuario, facturaOrigenId],
      );

      // 🔹 Comprobar si ya existe rectificativa activa
      const [rectificativasActivas] = await connection.query(
        `
  SELECT id
  FROM facturas
  WHERE usuario_id = ?
    AND tipo_factura = 'RECTIFICATIVA'
    AND factura_origen_id = ?
    AND estado != 'ANULADA'
  `,
        [idUsuario, facturaOrigenId],
      );

      if (rectificativasActivas.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          error:
            "Esta factura ya ha sido rectificada. Debe anular la rectificativa existente antes de crear una nueva.",
        });
      }

      const numeroRectificativa = `${factura.numero_factura}-R${
        rectificativas[0].total + 1
      }`;

      // 🔹 3. NIF emisor y receptor
      let datosReceptorFinal = {};
      let clienteIdParaFactura;
      if (tipoRectificacion === "SUSTITUCION") {
        if (cliente.esNuevo) {
          // El usuario ha creado un cliente nuevo sobre la marcha
          const d = cliente.datos;
          if (cliente.esNuevo) {
            const d = cliente.datos;
            if (!d || !d.nif || !d.nombre) {
              throw new Error(
                "Faltan datos obligatorios para el nuevo cliente",
              );
            }
            // ... resto del insert
          }
          const [resNuevo] = await connection.query(
            `INSERT INTO clientes 
      (usuario_id, nif, nombre, direccion, codigo_postal, ciudad, pais, email, telefono) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              idUsuario,
              d.nif,
              d.nombre,
              d.direccion,
              d.codigo_postal,
              d.ciudad,
              d.pais,
              d.email,
              d.telefono,
            ],
          );

          clienteIdParaFactura = resNuevo.insertId;

          // Preparamos los datos para el XML y PDF con lo que acabamos de insertar
          datosReceptorFinal = { ...d, id: clienteIdParaFactura };
        } else {
          // El usuario ha seleccionado un cliente de la lista
          // Buscamos sus datos actuales en la DB para el XML/PDF
          const [[clienteDB]] = await connection.query(
            `SELECT id, nif, nombre, direccion, codigo_postal, ciudad, pais FROM clientes WHERE id = ? AND usuario_id = ?`,
            [cliente.id, idUsuario],
          );

          if (!clienteDB) throw new Error("El cliente seleccionado no existe");

          clienteIdParaFactura = clienteDB.id;
          datosReceptorFinal = clienteDB;
        }
      } else {
        // CASO POR DIFERENCIAS: Usamos exactamente el mismo cliente de la factura original
        const [[clienteOriginal]] = await connection.query(
          `SELECT id, nif, nombre, direccion, codigo_postal, ciudad, pais FROM clientes WHERE id = ?`,
          [factura.cliente_id],
        );

        clienteIdParaFactura = factura.cliente_id;
        datosReceptorFinal = clienteOriginal;
      }

      // 🔹 Recuperar datos del emisor (se mantiene igual)
      const [[emisor]] = await connection.query(
        `SELECT nif, razon_social, direccion, codigo_postal, ciudad, pais, logo_path FROM datos_fiscales WHERE usuario_id = ?`,
        [idUsuario],
      );

      if (!datosReceptorFinal || !emisor) {
        throw new Error("Datos fiscales del receptor o emisor no encontrados");
      }

      // =====================================================
      // 🔹 4. PROCESAR CONCEPTOS Y AGRUPAR IMPUESTOS
      // =====================================================

      let conceptosProcesados = [];
      let mapaImpuestos = {};
      let cuotaRetenciones = 0;
      let baseConceptos = 0;

      for (const c of conceptos) {
        const cantidad = Number(c.cantidad);
        const precio = Number(c.precioUnitario);
        const tipo = Number(c.tipoImpositivo);

        const base = Number((cantidad * precio).toFixed(2));
        const cuota = Number((base * (tipo / 100)).toFixed(2));

        baseConceptos += base;

        const key = `${c.tipoImpuesto}-${tipo}`;

        if (!mapaImpuestos[key]) {
          mapaImpuestos[key] = {
            tipoImpuesto: c.tipoImpuesto,
            tipoImpositivo: tipo,
            base: 0,
          };
        }

        mapaImpuestos[key].base += base;

        if (c.tipoImpuesto === "IRPF") {
          cuotaRetenciones += Math.abs(cuota);
        }

        conceptosProcesados.push({
          idOriginal: c.idOriginal || null,
          descripcion: c.descripcion,
          cantidad,
          precioUnitario: precio,
          tipoImpuesto: c.tipoImpuesto,
          tipoImpositivo: tipo,
          base,
          cuota,
        });
      }

      // Normalizar bases agrupadas
      Object.values(mapaImpuestos).forEach((imp) => {
        imp.base = Number(imp.base.toFixed(2));
      });

      let impuestosProcesados = [];
      if (tipoRectificacion === "DIFERENCIAS") {
        const lineasRectificativas = [];

        // 🔹 1. Detectar añadidos o modificaciones
        for (const nuevo of conceptosProcesados) {
          const original = conceptosOriginales.find(
            (o) => o.id === nuevo.idOriginal,
          );

          const baseOriginal = original
            ? Number(original.cantidad) * Number(original.precio_unitario)
            : 0;

          const deltaBase = Number((nuevo.base - baseOriginal).toFixed(2));

          if (deltaBase !== 0) {
            const cuotaDelta = Number(
              (deltaBase * (nuevo.tipoImpositivo / 100)).toFixed(2),
            );

            lineasRectificativas.push({
              descripcion: `${nuevo.descripcion} (ajuste)`,
              cantidad: 1,
              precioUnitario: deltaBase,
              tipoImpuesto: nuevo.tipoImpuesto,
              tipoImpositivo: nuevo.tipoImpositivo,
              base: deltaBase,
              cuota: cuotaDelta,
            });
          }
        }

        // 🔹 2. Detectar eliminaciones
        for (const original of conceptosOriginales) {
          const existe = conceptosProcesados.some(
            (n) => n.idOriginal === original.id,
          );

          if (!existe) {
            const baseOriginal =
              Number(original.cantidad) * Number(original.precio_unitario);

            const cuotaOriginal =
              baseOriginal * (Number(original.tipo_impositivo) / 100);

            lineasRectificativas.push({
              descripcion: `${original.descripcion} (eliminado)`,
              cantidad: 1,
              precioUnitario: -baseOriginal,
              tipoImpuesto: original.tipo_impuesto,
              tipoImpositivo: original.tipo_impositivo,
              base: -baseOriginal,
              cuota: -cuotaOriginal,
            });
          }
        }

        // 🔹 Sustituimos conceptosProcesados por los deltas reales
        conceptosProcesados = lineasRectificativas;

        // 🔹 Recalcular impuestosProcesados en base a los deltas de línea
        mapaImpuestos = {};

        for (const c of conceptosProcesados) {
          const key = `${c.tipoImpuesto}-${c.tipoImpositivo}`;

          if (!mapaImpuestos[key]) {
            mapaImpuestos[key] = {
              tipoImpuesto: c.tipoImpuesto,
              tipoImpositivo: c.tipoImpositivo,
              base: 0,
            };
          }

          mapaImpuestos[key].base += c.base;
        }

        impuestosProcesados = Object.values(mapaImpuestos).map((imp) => ({
          tipoImpuesto: imp.tipoImpuesto,
          tipoImpositivo: imp.tipoImpositivo,
          base: Number(imp.base.toFixed(2)),
        }));
      } else {
        // SUSTITUCION → usamos directamente los nuevos agrupados
        impuestosProcesados = Object.values(mapaImpuestos);
      }
      /* if (tipoRectificacion === "DIFERENCIAS") {
        const nuevos = Object.values(mapaImpuestos);

        // Comparar contra originales
        for (const impNuevo of nuevos) {
          const original = impuestosOriginales.find(
            (impOrig) =>
              impOrig.tipo_impuesto === impNuevo.tipoImpuesto &&
              Number(impOrig.tipo_impositivo) ===
                Number(impNuevo.tipoImpositivo),
          );

          const baseOriginal = original ? Number(original.base_imponible) : 0;

          const deltaBase = Number((impNuevo.base - baseOriginal).toFixed(2));

          if (deltaBase !== 0) {
            impuestosProcesados.push({
              tipoImpuesto: impNuevo.tipoImpuesto,
              tipoImpositivo: impNuevo.tipoImpositivo,
              base: deltaBase,
            });
          }
        }

        // Detectar impuestos eliminados
        for (const impOrig of impuestosOriginales) {
          const existe = nuevos.some(
            (impNuevo) =>
              impNuevo.tipoImpuesto === impOrig.tipo_impuesto &&
              Number(impNuevo.tipoImpositivo) ===
                Number(impOrig.tipo_impositivo),
          );

          if (!existe) {
            impuestosProcesados.push({
              tipoImpuesto: impOrig.tipo_impuesto,
              tipoImpositivo: impOrig.tipo_impositivo,
              base: -Number(impOrig.base_imponible),
            });
          }
        }
      }*/

      // 🔹 Totales finales
      let baseRectificativa = 0;
      let cuotaRectificativa = 0;

      for (const imp of impuestosProcesados) {
        baseRectificativa += imp.base;

        const cuota =
          imp.tipoImpuesto === "IRPF"
            ? -Math.abs(imp.base * (imp.tipoImpositivo / 100))
            : imp.base * (imp.tipoImpositivo / 100);

        cuotaRectificativa += cuota;
      }

      const importeTotal = Number(
        (baseRectificativa + cuotaRectificativa).toFixed(2),
      );

      let cuotaIVA = 0;

      for (const imp of impuestosProcesados) {
        if (imp.tipoImpuesto === "IVA") {
          cuotaIVA += imp.base * (imp.tipoImpositivo / 100);
        }
      }

      cuotaIVA = Number(cuotaIVA.toFixed(2));

      // 🔹 5. Cadena facturación (LOCK)
      const [ultimoRegistro] = await connection.query(
        `
      SELECT hash_registro_actual, num_registro
      FROM registros_facturacion
      WHERE usuario_id = ?
      ORDER BY num_registro DESC
      LIMIT 1
      FOR UPDATE
      `,
        [idUsuario],
      );

      const numRegistroAnterior =
        ultimoRegistro.length > 0 ? ultimoRegistro[0].num_registro : 0;

      const numRegistroActual = numRegistroAnterior + 1;

      const hashAnterior =
        ultimoRegistro.length > 0
          ? ultimoRegistro[0].hash_registro_actual
          : HASH_GENESIS;

      // 🔹 6. SIF (propio o global)
      let sif;

      const [propio] = await connection.query(
        `
      SELECT id, nombre, nif, version, fecha_declaracion_responsable
      FROM sif_configuracion
      WHERE usuario_id = ? AND activo = 1
      LIMIT 1
      `,
        [idUsuario],
      );

      if (propio.length) {
        sif = propio[0];
      } else {
        const [global] = await connection.query(
          `
        SELECT id, nombre, nif, version, fecha_declaracion_responsable
        FROM sif_configuracion
        WHERE es_global = 1
        LIMIT 1
        `,
        );

        if (!global.length) {
          throw new Error("No hay SIF configurado en el sistema");
        }

        sif = global[0];
      }

      // 🔹 7. Fecha consistente (sin milisegundos)
      const fechaNormalizada = new Date(fechaExpedicion).toISOString();

      const fechaOriginal = new Date(factura.fecha_expedicion).toISOString();

      const fechaGeneracion = new Date().toISOString();

      // 🔹 8. Hash
      const hashActual = generarHashRegistro({
        sifId: sif.nombre,
        nifEmisor: emisor.nif,
        numeroFacturaCompleto: numeroRectificativa,
        fechaHoraEmision: fechaNormalizada,
        importeTotal,
        numRegistroAnterior,
        numRegistroActual,
        hashAnterior,
      });

      // 🔹 9. Construcción XML
      const datosRectificativa = {
        cabecera: {
          tipoRegistro: "RECTIFICATIVA",
          nifEmisor: emisor.nif,
          nifReceptor: datosReceptorFinal.nif,
          versionSIF: sif.version,
        },
        datosFacturaRectificativa: {
          numeroFactura: numeroRectificativa,
          fechaHoraExpedicion: fechaNormalizada,
          tipoRectificacion,
          importeTotal,
        },
        referenciaFacturaOriginal: {
          numeroFacturaOriginal: factura.numero_factura,
          fechaHoraExpedicionOriginal: fechaOriginal,
          hashRegistroFacturaOriginal: factura.hash_registro_actual,
        },
        desgloseFiscal: {
          impuestos: impuestosProcesados.map((imp) => ({
            base: imp.base,
            tipoImpositivo: imp.tipoImpositivo,
            cuota:
              imp.tipoImpuesto === "IRPF"
                ? -Math.abs(imp.base * (imp.tipoImpositivo / 100))
                : imp.base * (imp.tipoImpositivo / 100),
            tipoImpuesto: imp.tipoImpuesto,
          })),
        },
        trazabilidad: {
          numRegAnt: numRegistroAnterior,
          numRegAct: numRegistroActual,
          hashAnterior,
          hashPropio: hashActual,
          identificacionSIF: {
            idSw: sif.nombre,
            nifDev: sif.nif,
            fechaDeclaracionResponsable: new Date(
              sif.fecha_declaracion_responsable,
            ).toISOString(),
          },
        },
      };

      const xml = generarFacturaRectificativaXML(datosRectificativa);

      const resultado = validarFacturaRectificativaXSD(xml);
      if (!resultado.esValido) {
        await connection.rollback();
        return res.status(400).json({
          mensaje: "XML inválido",
          errores: resultado.errores,
        });
      }

      // 🔹 10. Insertar registro facturación
      const [registroResult] = await connection.query(
        `
      INSERT INTO registros_facturacion
      (
        usuario_id,
        fecha_hora_generacion,
        contenido_registro,
        hash_registro_anterior,
        hash_registro_actual,
        estado,
        num_registro,
        sif_config_id
      )
      VALUES (?, ?, ?, ?, ?, 'RECTIFICATIVA', ?, ?)
      `,
        [
          idUsuario,
          fechaGeneracion,
          xml,
          hashAnterior,
          hashActual,
          numRegistroActual,
          sif.id,
        ],
      );

      const idRegistro = registroResult.insertId;

      // 🔹 11. Insertar factura rectificativa
      const [facturaResult] = await connection.query(
        `
      INSERT INTO facturas
      (usuario_id, registro_id, numero_factura, fecha_expedicion, tipo_factura, importe_total, factura_origen_id, tipo_rectificacion, cliente_id)
      VALUES (?, ?, ?, ?, 'RECTIFICATIVA', ?, ?, ?, ?)
      `,
        [
          idUsuario,
          idRegistro,
          numeroRectificativa,
          fechaNormalizada,
          importeTotal,
          facturaOrigenId,
          tipoRectificacion,
          clienteIdParaFactura,
        ],
      );

      const facturaId = facturaResult.insertId;
      if (tipoRectificacion === "SUSTITUCION") {
        await connection.query(
          `UPDATE facturas
     SET estado = 'ANULADA'
     WHERE id = ? AND usuario_id = ?
    `,
          [facturaOrigenId, idUsuario],
        );
      }

      for (const imp of impuestosProcesados) {
        const base = Number(imp.base);
        const tipo = Number(imp.tipoImpositivo);
        const cuota = base * (tipo / 100);

        await connection.query(
          `
        INSERT INTO factura_impuestos
        (factura_id, base_imponible, tipo_impositivo, cuota, tipo_impuesto)
        VALUES (?, ?, ?, ?, ?)
        `,
          [facturaId, base, tipo, cuota, imp.tipoImpuesto],
        );
      }

      // 🔹 Insertar conceptos

      for (const c of conceptosProcesados) {
        await connection.query(
          `
    INSERT INTO factura_conceptos
    (factura_id, descripcion, cantidad, precio_unitario, base, tipo_impositivo, cuota, tipo_impuesto)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
          [
            facturaId,
            c.descripcion,
            c.cantidad,
            c.precioUnitario,
            c.base,
            c.tipoImpositivo,
            c.cuota,
            c.tipoImpuesto,
          ],
        );
      }

      // ==========================
      // STORAGE RECTIFICATIVA
      // ==========================
      const baseDir = path.join(
        process.cwd(),
        "storage",
        "usuarios",
        String(idUsuario),
        "facturas",
        String(facturaId),
      );

      fs.mkdirSync(baseDir, { recursive: true });

      // 🔹 Guardar XML
      const rutaXML = path.join(baseDir, "factura_rectificativa.xml");
      fs.writeFileSync(rutaXML, xml, "utf8");

      await connection.query(
        `UPDATE facturas SET xml_generado_path = ? WHERE id = ?`,
        [rutaXML, facturaId],
      );

      // 🔹 Generar QR
      const baseUrl = "https://daw-noverifactu.vercel.app/verificar-qr";
      const qrData =
        `${baseUrl}` +
        `?nif=${emisor.nif}` +
        `&num=${numeroRectificativa}` +
        `&fecha=${fechaNormalizada}` +
        `&importe=${importeTotal.toFixed(2)}` +
        `&cuotaIVA=${cuotaIVA.toFixed(2)}` +
        `&hash=${hashActual}` +
        `&ver=1`;

      // 🔹 Obtener logo y datos completos emisor
      const [[datosEmisorCompletos]] = await connection.query(
        `SELECT nif, razon_social, direccion, codigo_postal, ciudad, pais, logo_path
   FROM datos_fiscales WHERE usuario_id = ?`,
        [idUsuario],
      );

      let logoPath = null;

      if (datosEmisorCompletos.logo_path) {
        const posibleRuta = path.resolve(
          process.cwd(),
          datosEmisorCompletos.logo_path,
        );

        if (fs.existsSync(posibleRuta)) {
          logoPath = posibleRuta;
        }
      }

      // 🔹 Obtener datos completos receptor
      const [[datosReceptor]] = await connection.query(
        `SELECT nif, nombre, direccion, codigo_postal, ciudad, pais
   FROM clientes WHERE id = ?`,
        [clienteIdParaFactura],
      );
      /*let conceptosParaPDF = [];

      if (tipoRectificacion === "DIFERENCIAS") {
        conceptosParaPDF = conceptosProcesados.map((c) => ({
          descripcion: `${c.descripcion} (ajuste)`,
          cantidad: c.cantidad,
          precioUnitario: c.precioUnitario,
          tipoImpositivo: c.tipoImpositivo,
          tipoImpuesto: c.tipoImpuesto,
        }));
      } else {
        // En SUSTITUCIÓN, enviamos todos los conceptos nuevos (la factura completa)
        conceptosParaPDF = conceptosProcesados;
      }*/

      // 🔹 Preparar impuestos para PDF
      const impuestosPDF = impuestosProcesados.map((imp) => {
        const base = Number(imp.base);
        const tipo = Number(imp.tipoImpositivo);
        const cuota = base * (tipo / 100);

        return {
          baseImponible: base,
          tipoImpositivo: tipo,
          cuota,
          tipoImpuesto: imp.tipoImpuesto,
        };
      });

      await procesarPDF({
        pdf,
        baseDir,
        facturaId,
        connection,
        qrData,
        hashActual,
        generarPDFManual: async () => {
          return await generarFacturaAltaPDF({
            tipoDocumento: "RECTIFICATIVA",
            cabecera: {
              logoPath,
              emisor,
              receptor,
            },
            datosFactura: {
              numeroFactura: numeroRectificativa,
              fechaExpedicion: fechaNormalizada,
              tipoRectificacion,
              importeTotal,
            },
            conceptos: conceptosProcesados,
            desgloseFiscal: { impuestos: impuestosPDF },
            trazabilidad: datosFacturaXML.trazabilidad,
            qrData,
          });
        },
      });

      await connection.commit();

      // 🔹 Registrar evento fuera de la transacción
      await registrarEvento(
        idUsuario,
        "FACTURA_RECTIFICADA",
        `Factura ${numeroRectificativa} rectificada`,
      );

      return res.status(201).json({
        mensaje: "Factura rectificativa creada correctamente",
      });
    } catch (e) {
      await connection.rollback();
      console.error("ERROR EN TRANSACCIÓN RECTIFICATIVA:", e);
      return res.status(500).json({
        error: "Error guardando la factura rectificativa",
        detalle: e.message,
      });
    } finally {
      connection.release();
    }
  },
);

router.post(
  "/:id/anulacion",
  auth,
  checkMantenimiento,
  verificarDatosFiscales,
  //comprobarSuscripcion,
  async (req, res) => {
    const facturaOrigenId = req.params.id;
    const usuarioId = req.usuario.id;

    const connection = await pool.getConnection();

    try {
      const { motivo } = req.body;

      if (!motivo) {
        return res.status(400).json({
          error: "El motivo es obligatorio para la anulación",
        });
      }

      await connection.beginTransaction();

      // 🔹 1. Cargar factura original
      const [facturas] = await connection.query(
        `
      SELECT 
        f.numero_factura,
        f.fecha_expedicion,
        f.importe_total,
        r.hash_registro_actual
      FROM facturas f
      JOIN registros_facturacion r ON r.id = f.registro_id
      WHERE f.id = ? AND f.usuario_id = ?
      `,
        [facturaOrigenId, usuarioId],
      );

      if (!facturas.length) {
        await connection.rollback();
        return res.status(404).json({ error: "Factura no encontrada" });
      }

      const factura = facturas[0];

      // 🔹 2. Comprobar que no esté ya anulada
      const [estadoActual] = await connection.query(
        `SELECT estado FROM facturas WHERE id = ?`,
        [facturaOrigenId],
      );

      if (estadoActual[0].estado === "ANULADA") {
        await connection.rollback();
        return res.status(400).json({
          error: "La factura ya está anulada",
        });
      }

      // 🔹 3. NIF emisor
      const [[emisor]] = await connection.query(
        `SELECT nif FROM datos_fiscales WHERE usuario_id = ?`,
        [usuarioId],
      );

      if (!emisor) {
        throw new Error("No existen datos fiscales del usuario");
      }

      // 🔹 4. SIF activo
      const [[sif]] = await connection.query(
        `
      SELECT id, nombre, nif, version, fecha_declaracion_responsable
      FROM sif_configuracion
      WHERE usuario_id = ? AND activo = 1 OR es_global = 1
      LIMIT 1
      `,
        [usuarioId],
      );

      if (!sif) {
        throw new Error("No hay SIF activo configurado");
      }

      // 🔹 5. Cadena de registros (LOCK)
      const [ultimoRegistro] = await connection.query(
        `
      SELECT hash_registro_actual, num_registro
      FROM registros_facturacion
      WHERE usuario_id = ?
      ORDER BY num_registro DESC
      LIMIT 1
      FOR UPDATE
      `,
        [usuarioId],
      );

      const numRegistroAnterior =
        ultimoRegistro.length > 0 ? ultimoRegistro[0].num_registro : 0;

      const numRegistroActual = numRegistroAnterior + 1;

      const hashAnterior =
        ultimoRegistro.length > 0
          ? ultimoRegistro[0].hash_registro_actual
          : HASH_GENESIS;

      // 🔹 6. Fecha normalizada
      const ahora = new Date().toISOString();
      const fechaOriginal = new Date(factura.fecha_expedicion).toISOString();

      // 🔹 7. Generar hash
      const hashActual = generarHashRegistro({
        sifId: sif.nombre,
        nifEmisor: emisor.nif,
        numeroFacturaCompleto: factura.numero_factura,
        fechaHoraEmision: ahora,
        importeTotal: 0,
        numRegistroAnterior,
        numRegistroActual,
        hashAnterior,
      });

      // 🔹 8. Generar XML de anulación
      const xml = generarFacturaAnulacionXML({
        cabecera: {
          nifEmisor: emisor.nif,
          versionSIF: sif.version,
          fhAn: ahora,
        },
        refAn: {
          numeroFacturaOr: factura.numero_factura,
          fechaHoraExpedicionOr: fechaOriginal,
          hashAnulado: factura.hash_registro_actual,
          motivo,
        },
        tr: {
          numRegAnt: numRegistroAnterior,
          numRegAct: numRegistroActual,
          hashAnterior,
          hashPropio: hashActual,
          sif: {
            idSw: sif.nombre,
            nifDev: sif.nif,
            fechaDeclaracionResponsable: new Date(
              sif.fecha_declaracion_responsable,
            ).toISOString(),
          },
        },
      });

      await validarFacturaAnulacionXSD(xml);
      // 🔹 9. Insertar solo registro de facturación
      await connection.query(
        `
      INSERT INTO registros_facturacion
      (
        usuario_id,
        fecha_hora_generacion,
        contenido_registro,
        hash_registro_anterior,
        hash_registro_actual,
        estado,
        num_registro,
        sif_config_id
      )
      VALUES (?, ?, ?, ?, ?, 'ANULACION', ?, ?)
      `,
        [
          usuarioId,
          ahora,
          xml,
          hashAnterior,
          hashActual,
          numRegistroActual,
          sif.id,
        ],
      );

      // 🔹 10. Marcar factura como anulada
      await connection.query(
        `
      UPDATE facturas
      SET estado = 'ANULADA'
      WHERE id = ?
      `,
        [facturaOrigenId],
      );

      const baseDir = path.join(
        process.cwd(),
        "storage",
        "usuarios",
        String(usuarioId),
        "facturas",
        String(facturaOrigenId),
      );

      fs.mkdirSync(baseDir, { recursive: true });

      const rutaXMLAnulacion = path.join(baseDir, "anulacion.xml");

      fs.writeFileSync(rutaXMLAnulacion, xml, "utf8");

      await connection.commit();

      await registrarEvento(
        usuarioId,
        "FACTURA_ANULADA",
        `Factura ${factura.numero_factura} anulada`,
      );

      res.status(201).json({
        mensaje: "Anulación registrada correctamente",
      });
    } catch (error) {
      await connection.rollback();
      console.error("ERROR ANULACIÓN:", error);
      res.status(500).json({
        error: error.message || "Error registrando anulación",
      });
    } finally {
      connection.release();
    }
  },
);

export default router;

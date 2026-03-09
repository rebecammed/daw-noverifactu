import express from "express";
import pool from "../db/db.js";
import auth from "../middleware/auth.js";
import requireAdmin from "../middleware/requireAdmin.js";
import { registrarEvento } from "../utils/eventos.js";
import { iniciarNuevaCadenaEventos } from "../src/core/reiniciarCadenaEventos.js";
import {
  activarMantenimiento,
  desactivarMantenimiento,
} from "../src/core/systemState.js";
import checkMantenimiento from "../middleware/checkMantenimiento.js";
import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { comprobarIntegridad } from "../src/core/comprobarIntegridad.js";
import { comprobarIntegridadEventos } from "../src/core/integridadEventos.js";
import AdmZip from "adm-zip";

const router = express.Router();

router.patch(
  "/admin/usuarios/:id/estado",
  auth,
  requireAdmin,
  async (req, res) => {
    try {
      const adminId = req.usuario.id;
      const usuarioId = req.params.id;
      const { activo } = req.body;

      if (typeof activo !== "boolean") {
        return res.status(400).json({
          mensaje: "Debe indicarse activo: true o false",
        });
      }

      // 1️⃣ Comprobar que el usuario existe
      const [usuarios] = await pool.query(
        "SELECT id, rol, activo FROM usuarios WHERE id = ?",
        [usuarioId],
      );

      if (!usuarios.length) {
        return res.status(404).json({
          mensaje: "Usuario no encontrado",
        });
      }

      const usuarioObjetivo = usuarios[0];

      // 2️⃣ No permitir que un admin se desactive a sí mismo
      if (adminId == usuarioId && activo === false) {
        return res.status(400).json({
          mensaje: "No puedes desactivarte a ti mismo",
        });
      }

      // 3️⃣ Si es admin y se intenta desactivar → comprobar que no sea el último
      if (usuarioObjetivo.rol === "ADMIN" && activo === false) {
        const [adminsActivos] = await pool.query(
          "SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'ADMIN' AND activo = 1",
        );

        if (adminsActivos[0].total <= 1) {
          return res.status(400).json({
            mensaje: "No se puede desactivar el último administrador activo",
          });
        }
      }

      // 4️⃣ Actualizar estado
      await pool.query("UPDATE usuarios SET activo = ? WHERE id = ?", [
        activo ? 1 : 0,
        usuarioId,
      ]);

      // 5️⃣ Registrar auditoría
      await registrarEvento(
        adminId,
        "ADMIN_CAMBIO_ESTADO_USUARIO",
        `Usuario ${usuarioId} cambiado a estado ${activo ? "ACTIVO" : "INACTIVO"}`,
      );

      return res.json({
        mensaje: "Estado actualizado correctamente",
      });
    } catch (error) {
      console.error("Error cambiando estado usuario:", error);
      return res.status(500).json({
        mensaje: "Error interno del servidor",
      });
    }
  },
);

router.patch(
  "/admin/usuarios/:id/reset-2fa",
  auth,
  requireAdmin,
  async (req, res) => {
    try {
      const adminId = req.usuario.id;
      const usuarioId = req.params.id;

      // 1️⃣ Comprobar que existe
      const [usuarios] = await pool.query(
        "SELECT id, twofa_enabled FROM usuarios WHERE id = ?",
        [usuarioId],
      );

      if (!usuarios.length) {
        return res.status(404).json({
          mensaje: "Usuario no encontrado",
        });
      }

      // 2️⃣ No permitir que el admin se resetee a sí mismo
      if (adminId === usuarioId) {
        return res.status(400).json({
          mensaje: "No puedes resetear tu propio 2FA desde este endpoint",
        });
      }

      // 3️⃣ Si ya está desactivado
      if (!usuarios[0].twofa_enabled) {
        return res.status(400).json({
          mensaje: "El usuario no tiene 2FA activo",
        });
      }

      // 4️⃣ Reset real
      await pool.query(
        `
        UPDATE usuarios
        SET twofa_enabled = 0,
            twofa_secret = NULL
        WHERE id = ?
        `,
        [usuarioId],
      );

      // 5️⃣ Auditoría
      await registrarEvento(
        adminId,
        "ADMIN_RESET_2FA",
        `Reset de 2FA ejecutado sobre usuario ${usuarioId}`,
      );

      await registrarEvento(
        usuarioId,
        "2FA_RESET_BY_ADMIN",
        `El administrador ${adminId} ha reseteado tu 2FA`,
      );

      return res.json({
        mensaje: "2FA reseteado correctamente",
      });
    } catch (error) {
      console.error("Error reseteando 2FA:", error);
      return res.status(500).json({
        mensaje: "Error interno del servidor",
      });
    }
  },
);

router.get("/admin/usuarios", auth, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
        SELECT 
          u.id,
          u.nombre,
          u.email,
          u.activo,
          u.twofa_enabled,
          COUNT(DISTINCT f.id) AS total_facturas,
          MAX(CASE 
             WHEN l.tipo_evento IN ('LOGIN_OK','LOGIN_2FA_OK') 
             THEN l.fecha_evento 
          END) AS ultimo_login
        FROM usuarios u
        LEFT JOIN facturas f 
          ON f.usuario_id = u.id
        LEFT JOIN log_eventos l
          ON l.usuario_id = u.id
        GROUP BY u.id
        ORDER BY u.id ASC
      `);

    return res.json({ usuarios: rows });
  } catch (error) {
    console.error("Error listando usuarios:", error);
    return res.status(500).json({
      mensaje: "Error obteniendo usuarios",
    });
  }
});

router.get("/admin/integridad", auth, requireAdmin, async (req, res) => {
  try {
    const adminId = req.usuario.id;

    // 1️⃣ Obtener todos los usuarios activos
    const [usuarios] = await pool.query(`
        SELECT id, email
        FROM usuarios
        WHERE activo = 1
      `);

    const resultadoGlobal = [];

    for (const u of usuarios) {
      const [rows] = await pool.query(
        `
          SELECT r.*, s.nombre AS sif_nombre
          FROM registros_facturacion r
          LEFT JOIN sif_configuracion s 
            ON r.sif_config_id = s.id
          WHERE r.usuario_id = ?
            AND r.invalido = 0
          ORDER BY r.num_registro ASC
          `,
        [u.id],
      );

      let errores = [];

      if (rows.length > 0) {
        errores = comprobarIntegridad(rows);
      }

      resultadoGlobal.push({
        usuario_id: u.id,
        email: u.email,
        ok: errores.length === 0,
        errores: errores.length > 0 ? errores : null,
      });
    }

    const todoOk = resultadoGlobal.every((u) => u.ok);

    // 🔐 Registrar auditoría
    await registrarEvento(
      adminId,
      "ADMIN_VERIFICACION_GLOBAL",
      "Verificación global de integridad ejecutada",
    );

    return res.json({
      ok: todoOk,
      detalle: resultadoGlobal,
    });
  } catch (error) {
    console.error("ERROR INTEGRIDAD ADMIN:", error);
    return res.status(500).json({
      mensaje: "Error comprobando integridad",
    });
  }
});

router.get(
  "/admin/integridad/:usuarioId",
  auth,
  requireAdmin,
  async (req, res) => {
    try {
      const adminId = req.usuario.id;
      const usuarioObjetivoId = req.params.usuarioId;

      // 1️⃣ Comprobar que el usuario existe
      const [usuarios] = await pool.query(
        "SELECT id, email FROM usuarios WHERE id = ?",
        [usuarioObjetivoId],
      );

      if (!usuarios.length) {
        return res.status(404).json({
          mensaje: "Usuario no encontrado",
        });
      }

      // 2️⃣ Cargar registros del usuario objetivo
      const [rows] = await pool.query(
        `
        SELECT r.*, s.nombre AS sif_nombre
        FROM registros_facturacion r
        LEFT JOIN sif_configuracion s 
          ON r.sif_config_id = s.id
        WHERE r.usuario_id = ?
          AND r.invalido = 0
        ORDER BY r.num_registro ASC
        `,
        [usuarioObjetivoId],
      );

      let resultado;

      if (!rows.length) {
        resultado = {
          ok: true,
          mensaje: "No hay registros",
        };
      } else {
        const errores = comprobarIntegridad(rows);

        resultado = {
          ok: errores.length === 0,
          errores,
        };
      }

      // 3️⃣ 🔐 Registrar evento de auditoría
      await registrarEvento(
        adminId,
        "ADMIN_VERIFICACION_INTEGRIDAD",
        `Verificación de integridad ejecutada sobre usuario ${usuarioObjetivoId}`,
      );

      return res.json(resultado);
    } catch (error) {
      console.error("Error verificación admin:", error);
      return res.status(500).json({
        mensaje: "Error interno del servidor",
      });
    }
  },
);
router.get(
  "/admin/integridad-eventos",
  auth,
  requireAdmin,
  async (req, res) => {
    try {
      const [usuarios] = await pool.query(
        `SELECT DISTINCT usuario_id FROM log_eventos`,
      );
      const resultadoGlobal = [];
      for (const u of usuarios) {
        const [rows] = await pool.query(
          `SELECT * FROM log_eventos WHERE usuario_id = ? ORDER BY num_evento ASC `,
          [u.usuario_id],
        );
        const errores = await comprobarIntegridadEventos(rows);
        resultadoGlobal.push({
          usuario_id: u.usuario_id,
          ok: errores.length === 0,
          errores,
        });
      }
      const todoOk = resultadoGlobal.every((u) => u.ok);
      return res.json({ ok: todoOk, detalle: resultadoGlobal });
    } catch (error) {
      console.error("ERROR INTEGRIDAD EVENTOS ADMIN:", error);
      return res.status(500).json({
        mensaje: "Error comprobando integridad global del log de eventos",
      });
    }
  },
);
router.get("/admin/logs-resumen", auth, requireAdmin, async (req, res) => {
  try {
    const [usuarios] = await pool.query(`
      SELECT u.id, u.email
      FROM usuarios u
    `);

    const resultado = [];

    for (const u of usuarios) {
      const [eventos] = await pool.query(
        `SELECT *
         FROM log_eventos
         WHERE usuario_id = ?
         ORDER BY num_evento ASC`,
        [u.id],
      );

      const errores = await comprobarIntegridadEventos(eventos);

      resultado.push({
        usuario_id: u.id,
        email: u.email,
        total_eventos: eventos.length,
        ultimo_evento:
          eventos.length > 0 ? eventos[eventos.length - 1].tipo_evento : null,
        integridad_ok: errores.length === 0,
      });
    }

    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo resumen de logs" });
  }
});

router.get("/admin/logs/:usuarioId", auth, requireAdmin, async (req, res) => {
  const { usuarioId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT *
       FROM log_eventos
       WHERE usuario_id = ?
       ORDER BY num_evento ASC`,
      [usuarioId],
    );

    const errores = await comprobarIntegridadEventos(rows);

    const eventosConEstado = rows.map((e) => ({
      ...e,
      //integridad_ok: !errores.find((err) => err.num_evento === e.id),
      integridad_ok: !errores.find((err) => err.num_evento === e.num_evento),
    }));

    res.json({ eventos: eventosConEstado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo logs" });
  }
});

router.post(
  "/admin/usuarios/:usuarioId/reset-cadena-eventos",
  auth,
  requireAdmin,
  async (req, res) => {
    const adminId = req.usuario.id;
    const { usuarioId } = req.params;

    try {
      // 1️⃣ Comprobamos que el usuario existe
      const [rows] = await pool.query("SELECT id FROM usuarios WHERE id = ?", [
        usuarioId,
      ]);

      if (rows.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      // 2️⃣ Iniciamos nueva cadena para ESE usuario
      await iniciarNuevaCadenaEventos(usuarioId);

      // 3️⃣ Registramos evento en la cadena del ADMIN
      await registrarEvento(
        adminId,
        "ADMIN_RESET_CADENA_EVENTOS",
        `El admin ${adminId} reinició la cadena de eventos del usuario ${usuarioId}`,
      );

      return res.json({
        ok: true,
        mensaje: "Cadena de eventos reiniciada correctamente",
      });
    } catch (error) {
      console.error("Error reseteando cadena:", error);
      return res.status(500).json({
        error: "Error reiniciando cadena de eventos",
      });
    }
  },
);

router.get(
  "/admin/backups",
  auth,
  requireAdmin,
  checkMantenimiento,
  async (req, res) => {
    try {
      const backupsPath = path.join(process.cwd(), "backups");

      if (!fs.existsSync(backupsPath)) {
        return res.json({ backups: [] });
      }

      const carpetas = fs.readdirSync(backupsPath);

      const backups = carpetas.map((nombre) => {
        const backupDir = path.join(backupsPath, nombre);

        const dbPath = path.join(backupDir, "database.sql");
        const storagePath = path.join(backupDir, "storage.zip");

        let tamañoDB = 0;
        let tamañoStorage = 0;

        if (fs.existsSync(dbPath)) {
          tamañoDB = fs.statSync(dbPath).size;
        }

        if (fs.existsSync(storagePath)) {
          tamañoStorage = fs.statSync(storagePath).size;
        }

        const tamañoTotal = tamañoDB + tamañoStorage;

        return {
          nombre,
          tamañoTotal,
          tamañoDB,
          tamañoStorage,
          fecha: new Date(nombre.replace(/-/g, ":")).toISOString(),
        };
      });

      // Ordenar más reciente primero
      backups.sort((a, b) => b.nombre.localeCompare(a.nombre));

      res.json({ backups });
    } catch (error) {
      console.error("Error listando backups:", error);
      res.status(500).json({ mensaje: "Error listando backups" });
    }
  },
);

router.post(
  "/admin/backups",
  auth,
  requireAdmin,
  checkMantenimiento,
  async (req, res) => {
    try {
      // 1. Crear directorio con fecha
      const fecha = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 16);
      const backupDir = path.join(process.cwd(), "backups", fecha);

      if (!fs.existsSync(backupDir))
        fs.mkdirSync(backupDir, { recursive: true });

      // 2. Configurar Backup de Base de Datos
      const dbFile = path.join(backupDir, "database.sql"); // Ruta real del archivo
      const mysqldumpPath = process.env.DB_DUMP_PATH;
      const dbUser = process.env.DB_USER;
      const dbPass = process.env.DB_PASS;
      const dbName = process.env.DB_NAME;

      const args = ["-u", dbUser];

      if (dbPass) args.push(`-p${dbPass}`);

      args.push(dbName);

      // USAMOS dbFile para que se guarde en la carpeta con la fecha
      await new Promise((resolve, reject) => {
        execFile(mysqldumpPath, args, (error, stdout, stderr) => {
          if (error) {
            return reject(error);
          }
          if (stderr) {
            console.warn("mysqldump warning:", stderr);
          }
          fs.writeFileSync(dbFile, stdout);
          resolve();
        });
      });
      // 3. Backup de archivos (Storage)
      const zip = new AdmZip();
      const storagePath = path.join(process.cwd(), "storage");

      if (fs.existsSync(storagePath)) {
        zip.addLocalFolder(storagePath);
        zip.writeZip(path.join(backupDir, "storage.zip"));
      }

      await registrarEvento(
        req.usuario.id,
        "BACKUP_EJECUTADO",
        `Backup generado en ${fecha}`,
      );

      res.json({ ok: true, mensaje: "Backup generado correctamente", fecha });
    } catch (error) {
      console.error("ERROR BACKUP:", error);
      res
        .status(500)
        .json({ mensaje: "Error generando backup", detalle: error.message });
    }
  },
);

router.get(
  "/admin/backups/:fecha/descargar",
  auth,
  requireAdmin,
  async (req, res) => {
    try {
      const { fecha } = req.params;
      const backupPath = path.join(process.cwd(), "backups", fecha);

      if (!fs.existsSync(backupPath)) {
        return res.status(404).json({ mensaje: "Backup no encontrado" });
      }

      // Creamos un ZIP al vuelo que contenga la carpeta del backup (SQL + Storage.zip)
      const zip = new AdmZip();
      zip.addLocalFolder(backupPath);
      const buffer = zip.toBuffer();

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=backup-${fecha}.zip`,
      );
      res.setHeader("Content-Type", "application/zip");

      await registrarEvento(
        req.usuario.id,
        "BACKUP_DESCARGADO",
        `Backup ${fecha} descargado`,
      );

      res.send(buffer);
    } catch (error) {
      console.error("ERROR DESCARGANDO:", error);
      res.status(500).json({ mensaje: "Error al preparar la descarga" });
    }
  },
);

router.delete("/admin/backups/:fecha", auth, requireAdmin, async (req, res) => {
  try {
    const { fecha } = req.params;

    // 🔒 Validación básica (evita path traversal)
    if (!/^[0-9\-]+$/.test(fecha)) {
      return res.status(400).json({
        mensaje: "Nombre de backup inválido",
      });
    }

    const backupPath = path.join(process.cwd(), "backups", fecha);

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({
        mensaje: "Backup no encontrado",
      });
    }

    // ⚠️ Seguridad extra: asegurarnos de que está dentro de /backups
    const backupsRoot = path.join(process.cwd(), "backups");
    if (!backupPath.startsWith(backupsRoot)) {
      return res.status(403).json({
        mensaje: "Acceso no permitido",
      });
    }

    // 🗑 Eliminamos carpeta completa
    fs.rmSync(backupPath, { recursive: true, force: true });

    // 📝 Registramos evento
    await registrarEvento(
      req.usuario.id,
      "BACKUP_ELIMINADO",
      `Backup ${fecha} eliminado`,
    );

    res.json({
      ok: true,
      mensaje: "Backup eliminado correctamente",
    });
  } catch (error) {
    console.error("ERROR ELIMINANDO BACKUP:", error);
    res.status(500).json({
      mensaje: "Error eliminando backup",
    });
  }
});

router.post(
  "/admin/backups/:fecha/restaurar",
  auth,
  requireAdmin,
  async (req, res) => {
    const { fecha } = req.params;
    const backupPath = path.join(process.cwd(), "backups", fecha);
    const dbFile = path.join(backupPath, "database.sql");
    const storageZip = path.join(backupPath, "storage.zip");

    if (!fs.existsSync(dbFile) || !fs.existsSync(storageZip)) {
      return res
        .status(404)
        .json({ mensaje: "Backup incompleto o inexistente" });
    }

    try {
      activarMantenimiento();

      // 1️⃣ RESTAURAR BASE DE DATOS
      const mysqlPath = `"C:\\xampp\\mysql\\bin\\mysql.exe"`;
      const comando = `${mysqlPath} -u "${process.env.DB_USER}" "${process.env.DB_NAME}" < "${dbFile}"`;
      await new Promise((resolve, reject) => {
        exec(comando, (error) => (error ? reject(error) : resolve()));
      });

      // 2️⃣ RESTAURAR STORAGE (CORREGIDO con AdmZip)
      const storagePath = path.join(process.cwd(), "storage");
      fs.rmSync(storagePath, { recursive: true, force: true });

      const zip = new AdmZip(storageZip);
      zip.extractAllTo(storagePath, true);

      await registrarEvento(
        req.usuario.id,
        "BACKUP_RESTAURADO",
        `Sistema restaurado desde backup ${fecha}`,
      );

      desactivarMantenimiento();
      res.json({ ok: true, mensaje: "Sistema restaurado correctamente" });
    } catch (error) {
      console.error("ERROR RESTAURANDO:", error);
      desactivarMantenimiento();
      res.status(500).json({ mensaje: "Error restaurando backup" });
    }
  },
);

router.post(
  "/admin/mantenimiento/activar",
  auth,
  requireAdmin,
  async (req, res) => {
    activarMantenimiento();

    await registrarEvento(
      req.usuario.id,
      "MODO_MANTENIMIENTO_ACTIVADO",
      "Modo mantenimiento activado por admin",
    );

    res.json({ ok: true });
  },
);

router.post(
  "/admin/mantenimiento/desactivar",
  auth,
  requireAdmin,
  async (req, res) => {
    desactivarMantenimiento();

    await registrarEvento(
      req.usuario.id,
      "MODO_MANTENIMIENTO_DESACTIVADO",
      "Modo mantenimiento desactivado por admin",
    );

    res.json({ ok: true });
  },
);

router.get(
  "/admin/backups/verificar-integridad",
  auth,
  requireAdmin,
  async (req, res) => {
    try {
      // 1. Obtener registros de facturación (ordenados por número de registro para la cadena)
      const [facturas] = await pool.query(
        "SELECT * FROM registros_facturacion ORDER BY num_registro ASC",
      );

      // 2. Obtener eventos (ordenados por número de evento)
      const [eventos] = await pool.query(
        "SELECT * FROM log_eventos ORDER BY num_evento ASC",
      );

      // 3. Ejecutar tus funciones
      const erroresFacturas = comprobarIntegridad(facturas);
      const erroresEventos = comprobarIntegridadEventos(eventos);

      const integridadOk =
        erroresFacturas.length === 0 && erroresEventos.length === 0;

      // Registrar el resultado de la verificación en el log de eventos
      await registrarEvento(
        req.usuario.id,
        "VERIFICACION_INTEGRIDAD_POST_RESTORE",
        integridadOk
          ? "Integridad verificada con éxito"
          : `Fallos detectados: ${erroresFacturas.length} facturas, ${erroresEventos.length} eventos`,
      );

      res.json({
        ok: true,
        integridadOk,
        detalles: {
          facturas: erroresFacturas,
          eventos: erroresEventos,
        },
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ mensaje: "Error durante la verificación de integridad" });
    }
  },
);

router.get("/admin/facturas", auth, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      usuarioId,
      estado,
      fechaInicio,
      fechaFin,
      q,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let where = "WHERE 1=1";
    const params = [];

    if (usuarioId) {
      where += " AND f.usuario_id = ?";
      params.push(usuarioId);
    }

    if (estado) {
      where += " AND f.estado = ?";
      params.push(estado);
    }

    if (fechaInicio && fechaFin) {
      where += " AND f.fecha_expedicion BETWEEN ? AND ?";
      params.push(fechaInicio, fechaFin);
    } else if (fechaInicio) {
      where += " AND f.fecha_expedicion >= ?";
      params.push(fechaInicio);
    } else if (fechaFin) {
      where += " AND f.fecha_expedicion <= ?";
      params.push(fechaFin);
    }

    if (q) {
      where += `
        AND (
          f.numero_factura LIKE ?
          OR u.email LIKE ?
          OR CAST(f.importe_total AS CHAR) LIKE ?
        )
      `;
      const like = `%${q}%`;
      params.push(like, like, like);
    }

    // 🔹 Total
    const [[{ total }]] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM facturas f
      JOIN usuarios u ON u.id = f.usuario_id
      ${where}
      `,
      params,
    );

    // 🔹 Datos paginados
    const [rows] = await pool.query(
      `
      SELECT 
        f.id,
        f.numero_factura,
        f.fecha_expedicion,
        f.tipo_factura,
        f.importe_total,
        f.estado,
        u.email,
        u.id AS usuario_id
      FROM facturas f
      JOIN usuarios u ON u.id = f.usuario_id
      ${where}
      ORDER BY f.fecha_expedicion DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limitNum, offset],
    );

    res.json({
      facturas: rows,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("Error listando facturas globales:", error);
    res.status(500).json({ mensaje: "Error obteniendo facturas" });
  }
});

router.get("/admin/sif", auth, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, nombre, version, es_global, usuario_id
      FROM sif_configuracion
      ORDER BY id ASC
    `);

    res.json({ sif: rows });
  } catch (error) {
    console.error("Error obteniendo SIF:", error);
    res.status(500).json({ mensaje: "Error obteniendo configuraciones SIF" });
  }
});

router.patch("/admin/sif/:id/global", auth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const adminId = req.usuario.id;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Comprobamos que existe
    const [rows] = await connection.query(
      "SELECT id FROM sif_configuracion WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Configuración no encontrada" });
    }

    // 1️⃣ Quitamos global a todos
    await connection.query("UPDATE sif_configuracion SET es_global = 0");

    // 2️⃣ Marcamos el nuevo
    await connection.query(
      "UPDATE sif_configuracion SET es_global = 1 WHERE id = ?",
      [id],
    );

    await connection.commit();

    await registrarEvento(
      adminId,
      "ADMIN_CAMBIO_SIF_GLOBAL",
      `SIF ${id} marcado como global`,
    );

    res.json({ ok: true });
  } catch (error) {
    await connection.rollback();
    console.error("Error cambiando SIF global:", error);
    res.status(500).json({ mensaje: "Error actualizando SIF global" });
  } finally {
    connection.release();
  }
});

router.post("/admin/sif/versionar", auth, requireAdmin, async (req, res) => {
  const { id_base, nueva_version, nombre_base } = req.body;
  const adminId = req.usuario.id;

  if (!id_base || !nueva_version) {
    return res.status(400).json({ mensaje: "Datos incompletos" });
  }
  if (!nombre_base || !/^[A-Z0-9\-]+$/.test(nombre_base)) {
    return res.status(400).json({
      mensaje: "Nombre base inválido. Usa mayúsculas, números y guiones.",
    });
  }
  // Validar formato semántico tipo 1.0.0
  const versionRegex = /^\d+\.\d+\.\d+$/;

  if (!versionRegex.test(nueva_version)) {
    return res.status(400).json({
      mensaje: "La versión debe tener formato X.Y.Z (ej: 2.0.1)",
    });
  }
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Obtener los datos del SIF que queremos evolucionar
    const [rows] = await connection.query(
      "SELECT * FROM sif_configuracion WHERE id = ?",
      [id_base],
    );

    if (rows.length === 0) throw new Error("SIF base no encontrado");
    const base = rows[0];
    const [existe] = await pool.query(
      "SELECT id FROM sif_configuracion WHERE version = ? AND es_global = 1",
      [nueva_version],
    );

    if (existe.length > 0) {
      return res.status(400).json({
        mensaje: "Ya existe un SIF global con esa versión",
      });
    }
    // 2. Desactivar el flag global de TODOS los registros existentes
    await connection.query("UPDATE sif_configuracion SET es_global = 0");

    // 3. Insertar la nueva versión
    const nombreFinal = `${nombre_base}-${nueva_version}`;
    // Copiamos los campos técnicos pero actualizamos versión y flag global
    const [result] = await connection.query(
      `INSERT INTO sif_configuracion 
      (nombre, usuario_id, nif, version, activo, es_global, fecha_declaracion_responsable) 
      VALUES (?, ?, ?, ?, 1, 1, NOW())`,
      [nombreFinal, adminId, base.nif, nueva_version],
    );

    const nuevoId = result.insertId;

    await connection.commit();

    await registrarEvento(
      adminId,
      "SIF_VERSIONADO",
      `Nueva versión global ${nueva_version} (ID: ${nuevoId}) creada desde ID: ${id_base}`,
    );

    res.status(201).json({ ok: true, id: nuevoId });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ mensaje: "Error al crear nueva versión" });
  } finally {
    connection.release();
  }
});

router.get("/admin/stats", auth, requireAdmin, async (req, res) => {
  try {
    const [[usuarios]] = await pool.query(`
      SELECT COUNT(*) as total
      FROM usuarios
      WHERE activo = 1
    `);

    const [[facturas]] = await pool.query(`
      SELECT COUNT(*) as total,
             COALESCE(SUM(importe_total),0) as totalFacturado
      FROM facturas
    `);

    res.json({
      usuarios: usuarios.total,
      facturas: facturas.total,
      totalFacturado: facturas.totalFacturado,
    });
  } catch (error) {
    console.error("Error stats admin:", error);
    res.status(500).json({ mensaje: "Error obteniendo estadísticas" });
  }
});

router.get(
  "/admin/facturacion-mensual",
  auth,
  requireAdmin,
  async (req, res) => {
    try {
      const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(fecha_expedicion,'%b') as mes,
        SUM(importe_total) as total
      FROM facturas
      GROUP BY MONTH(fecha_expedicion)
      ORDER BY MONTH(fecha_expedicion)
    `);

      res.json(rows);
    } catch (error) {
      console.error("Error facturación mensual:", error);
      res.status(500).json({ mensaje: "Error obteniendo gráfico" });
    }
  },
);

router.get("/admin/logs-recientes", auth, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT tipo_evento, descripcion, fecha_evento
      FROM log_eventos
      ORDER BY fecha_evento DESC
      LIMIT 10
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error logs admin:", error);
    res.status(500).json({ mensaje: "Error obteniendo logs" });
  }
});
export default router;

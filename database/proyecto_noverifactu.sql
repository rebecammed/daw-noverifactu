-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-03-2026 a las 09:39:29
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12
USE railway;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `proyecto_noverifactu`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `usuario_id` bigint(20) NOT NULL,
  `nif` varchar(15) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `codigo_postal` varchar(10) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `pais` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `activo` tinyint(4) NOT NULL DEFAULT 1,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id`, `usuario_id`, `nif`, `nombre`, `direccion`, `codigo_postal`, `ciudad`, `pais`, `email`, `telefono`, `created_at`, `activo`, `deleted_at`) VALUES
(1, 2, '71728851Q', 'José Antonio Marqués de Luis', 'C/ Marqués de Pidal 13 2ºD', '33004', 'Oviedo', 'España', 'joseantonio@noverifactu.local', '666222888', '2026-02-03 07:42:59', 1, NULL),
(2, 2, '11398800T', 'Ángeles Medina Toro', 'C/Cuba 3 3ºC', '33400', 'Avilés', 'España', 'angelesmedina@noverifactu.local', '600000001', '2026-02-03 07:57:00', 1, NULL),
(3, 4, '71902382N', 'Rebeca', 'C/Marqués de Pidal 13', '33004', 'Oviedo', 'España', 'rebeca@test.local', '622222222', '2026-02-06 15:39:30', 1, NULL),
(4, 2, '76875187X', 'Inventado', 'Calle Test 2', '12345', 'Cuenca', 'España', 'inventado@noveri.local', '611111111', '2026-02-19 07:56:53', 1, NULL),
(5, 4, '87163521F', 'Inventado', 'Calle Marqués de Teverga 1', '33005', 'Oviedo', 'España', 'inventado@teverga.com', '666666661', '2026-02-25 15:24:22', 1, NULL),
(7, 4, 'G33085333', 'CDB OVIEDO RUGBY CLUB', 'JOAQUIN COSTA 48, SÓTANO HOTEL DE ASOCIACIONES \"SANTULLANO\"', '33011', 'OVIEDO', 'ASTURIAS', '', '', '2026-02-26 12:51:31', 1, NULL),
(8, 6, '71902382N', 'Rebeca', 'Calle Marqués de Pidal 13', '33004', 'Oviedo', 'España', 'rebeca@verifactu.es', '622222297', '2026-03-03 10:06:49', 1, NULL),
(9, 6, 'G33085333', 'CDB OVIEDO RUGBY CLUB', 'JOAQUIN COSTA 48, SÓTANO HOTEL DE ASOCIACIONES \"SANTULLANO\"', '33011', 'OVIEDO', 'España', 'cdb@oviedorugby.com', '666666622', '2026-03-03 15:11:56', 1, NULL),
(10, 1, 'G33085333', 'CDB OVIEDO RUGBY CLUB', 'JOAQUIN COSTA 48, SÓTANO HOTEL DE ASOCIACIONES \"SANTULLANO\"', '33011', 'OVIEDO', 'España', 'orc@rugby.es', '666666623', '2026-03-03 15:26:05', 1, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `datos_fiscales`
--

CREATE TABLE `datos_fiscales` (
  `id` bigint(20) NOT NULL,
  `usuario_id` bigint(20) NOT NULL,
  `nif` varchar(9) NOT NULL,
  `razon_social` varchar(100) NOT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `codigo_postal` varchar(5) DEFAULT NULL,
  `ciudad` varchar(30) DEFAULT NULL,
  `pais` varchar(50) DEFAULT NULL,
  `valido_desde` datetime NOT NULL,
  `valido_hasta` datetime DEFAULT NULL,
  `logo_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `datos_fiscales`
--

INSERT INTO `datos_fiscales` (`id`, `usuario_id`, `nif`, `razon_social`, `direccion`, `codigo_postal`, `ciudad`, `pais`, `valido_desde`, `valido_hasta`, `logo_path`) VALUES
(1, 1, '71895310R', 'Rebeca', 'Marqués de Pidal', '33004', 'Oviedo', 'España', '0000-00-00 00:00:00', NULL, NULL),
(2, 2, '71902382N', 'No verifactu', 'González Abarca 23', '33401', 'Avilés', 'España', '0000-00-00 00:00:00', NULL, '/uploads/logos/logo_2_1770814001201.jpg'),
(3, 4, '15845447B', 'EmpresaTest', 'C/de Prueba 7 1ºA', '33001', 'Oviedo', 'España', '0000-00-00 00:00:00', NULL, '/uploads/logos/logo_4_1772105315104.jpg'),
(4, 6, 'B13345678', 'Prueba', 'C/Prueba 1', '33400', 'Avilés', 'España', '0000-00-00 00:00:00', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturas`
--

CREATE TABLE `facturas` (
  `id` bigint(20) NOT NULL,
  `usuario_id` bigint(20) NOT NULL,
  `registro_id` bigint(20) NOT NULL,
  `nif_receptor` varchar(9) NOT NULL,
  `numero_factura` varchar(50) NOT NULL,
  `fecha_expedicion` varchar(24) NOT NULL,
  `tipo_factura` enum('ORDINARIA','SIMPLIFICADA','RECTIFICATIVA','ANULACION') NOT NULL,
  `importe_total` decimal(12,2) NOT NULL,
  `factura_origen_id` bigint(20) DEFAULT NULL,
  `tipo_rectificacion` enum('SUSTITUCION','DIFERENCIAS') DEFAULT NULL,
  `estado` enum('ACTIVA','ANULADA','RECTIFICADA') NOT NULL DEFAULT 'ACTIVA',
  `ruta_pdf` varchar(255) DEFAULT NULL,
  `cliente_id` int(11) DEFAULT NULL,
  `pdf_generado_path` varchar(255) DEFAULT NULL,
  `xml_generado_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `facturas`
--

INSERT INTO `facturas` (`id`, `usuario_id`, `registro_id`, `nif_receptor`, `numero_factura`, `fecha_expedicion`, `tipo_factura`, `importe_total`, `factura_origen_id`, `tipo_rectificacion`, `estado`, `ruta_pdf`, `cliente_id`, `pdf_generado_path`, `xml_generado_path`) VALUES
(206, 2, 239, '', '1', '2026-02-23T11:14:00.000Z', 'ORDINARIA', 60.50, NULL, NULL, 'ACTIVA', NULL, 1, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\206\\sellado.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\206\\factura.xml'),
(207, 2, 240, '', '1-R1', '2026-02-23T11:15:00.000Z', 'RECTIFICATIVA', 54.45, 206, 'DIFERENCIAS', 'ACTIVA', NULL, 1, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\207\\sellado_rectificativa.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\207\\factura_rectificativa.xml'),
(208, 2, 241, '', '2', '2026-02-23T12:09:00.000Z', 'ORDINARIA', 605.00, NULL, NULL, 'ANULADA', NULL, 4, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\208\\sellado.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\208\\factura.xml'),
(210, 2, 243, '', '2-R1', '2026-02-24T14:20:00.000Z', 'RECTIFICATIVA', 605.00, 208, 'SUSTITUCION', 'ACTIVA', NULL, 2, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\210\\sellado_rectificativa.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\210\\factura_rectificativa.xml'),
(211, 2, 244, '', '3', '2026-02-24T14:21:00.000Z', 'ORDINARIA', 423.50, NULL, NULL, 'ACTIVA', NULL, 4, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\211\\sellado.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\211\\factura.xml'),
(212, 2, 245, '', '3-R1', '2026-02-24T14:22:00.000Z', 'RECTIFICATIVA', 60.50, 211, 'DIFERENCIAS', 'ANULADA', NULL, 4, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\212\\sellado_rectificativa.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\212\\factura_rectificativa.xml'),
(214, 2, 248, '', '3-R2', '2026-02-24T15:03:00.000Z', 'RECTIFICATIVA', 484.00, 211, 'DIFERENCIAS', 'ANULADA', NULL, 4, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\214\\sellado_rectificativa.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\214\\factura_rectificativa.xml'),
(215, 2, 250, '', '3-R3', '2026-02-24T15:20:00.000Z', 'RECTIFICATIVA', 60.50, 211, 'DIFERENCIAS', 'ANULADA', NULL, 4, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\215\\sellado_rectificativa.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\215\\factura_rectificativa.xml'),
(216, 2, 252, '', '3-R4', '2026-02-24T15:22:00.000Z', 'RECTIFICATIVA', 60.50, 211, 'DIFERENCIAS', 'ACTIVA', NULL, 4, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\216\\sellado_rectificativa.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\216\\factura_rectificativa.xml'),
(217, 2, 253, '', '4', '2026-02-24T15:23:00.000Z', 'ORDINARIA', 484.00, NULL, NULL, 'ANULADA', NULL, 2, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\217\\sellado.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\217\\factura.xml'),
(218, 2, 254, '', '4-R1', '2026-02-24T15:24:00.000Z', 'RECTIFICATIVA', 302.50, 217, 'SUSTITUCION', 'ACTIVA', NULL, 1, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\218\\sellado_rectificativa.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\218\\factura_rectificativa.xml'),
(219, 4, 255, '', '1', '2026-02-25T09:30:00.000Z', 'ORDINARIA', 701.80, NULL, NULL, 'ANULADA', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\219\\original.pdf', 3, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\219\\sellado.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\219\\factura.xml'),
(220, 4, 256, '', '2', '2026-02-25T14:30:00.000Z', 'ORDINARIA', 459.80, NULL, NULL, 'ACTIVA', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\220\\original.pdf', 3, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\220\\sellado.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\220\\factura.xml'),
(221, 4, 257, '', '1-R1', '2026-02-25T14:30:00.000Z', 'RECTIFICATIVA', 701.80, 219, 'SUSTITUCION', 'ACTIVA', NULL, 5, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\221\\sellado_rectificativa.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\221\\factura_rectificativa.xml'),
(222, 4, 258, '', '2-R1', '2026-02-25T15:20:00.000Z', 'RECTIFICATIVA', -157.30, 220, 'DIFERENCIAS', 'ACTIVA', NULL, 3, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\222\\sellado_rectificativa.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\222\\factura_rectificativa.xml'),
(223, 4, 259, '', '3', '2026-02-26T10:17:00.000Z', 'ORDINARIA', 242.00, NULL, NULL, 'ACTIVA', NULL, 3, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\223\\sellado.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\223\\factura.xml'),
(224, 4, 260, '', '3-R1', '2026-02-26T10:17:00.000Z', 'RECTIFICATIVA', 121.00, 223, 'DIFERENCIAS', 'ANULADA', NULL, 3, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\224\\sellado_rectificativa.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\224\\factura_rectificativa.xml'),
(225, 4, 261, '', '4', '2026-02-26T10:19:00.000Z', 'ORDINARIA', 847.00, NULL, NULL, 'ACTIVA', NULL, 5, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\225\\sellado.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\225\\factura.xml'),
(226, 4, 263, '', '3-R2', '2026-02-26T11:16:00.000Z', 'RECTIFICATIVA', 121.00, 223, 'DIFERENCIAS', 'ANULADA', NULL, 3, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\226\\sellado_rectificativa.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\226\\factura_rectificativa.xml'),
(227, 4, 265, '', '3-R3', '2026-02-26T11:22:00.000Z', 'RECTIFICATIVA', 121.00, 223, 'DIFERENCIAS', 'ANULADA', NULL, 3, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\227\\sellado_rectificativa.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\227\\factura_rectificativa.xml'),
(228, 4, 267, '', '3-R4', '2026-02-26T11:28:00.000Z', 'RECTIFICATIVA', 121.00, 223, 'DIFERENCIAS', 'ACTIVA', NULL, 3, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\228\\sellado_rectificativa.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\228\\factura_rectificativa.xml'),
(229, 4, 268, '', '5', '2026-02-26T11:28:00.000Z', 'ORDINARIA', 121.00, NULL, NULL, 'ACTIVA', NULL, 5, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\229\\sellado.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\229\\factura.xml'),
(230, 4, 269, '', '5-R1', '2026-02-26T11:29:00.000Z', 'RECTIFICATIVA', 60.50, 229, 'DIFERENCIAS', 'ACTIVA', NULL, 5, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\230\\sellado_rectificativa.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\230\\factura_rectificativa.xml'),
(231, 4, 270, '', '6', '2026-02-26T11:51:00.000Z', 'ORDINARIA', 217.80, NULL, NULL, 'ACTIVA', NULL, 3, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\231\\sellado.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\231\\factura.xml'),
(232, 4, 271, '', '6-R1', '2026-02-26T11:52:00.000Z', 'RECTIFICATIVA', -96.80, 231, 'DIFERENCIAS', 'ANULADA', NULL, 3, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\232\\sellado_rectificativa.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\232\\factura_rectificativa.xml'),
(233, 4, 273, '', '6-R2', '2026-02-26T11:52:00.000Z', 'RECTIFICATIVA', -36.30, 231, 'DIFERENCIAS', 'ANULADA', NULL, 3, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\233\\sellado_rectificativa.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\233\\factura_rectificativa.xml'),
(234, 4, 275, '', '6-R3', '2026-02-26T12:02:00.000Z', 'RECTIFICATIVA', -12.10, 231, 'DIFERENCIAS', 'ACTIVA', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\234\\original.pdf', 3, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\234\\sellado.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\234\\factura_rectificativa.xml'),
(236, 4, 277, '', 'F-2026000242', '2026-02-04T23:00:00.000Z', 'ORDINARIA', 145.93, NULL, NULL, 'ACTIVA', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\236\\original.pdf', 7, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\236\\sellado.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\4\\facturas\\236\\factura.xml'),
(237, 6, 278, '', '1', '2026-03-03T09:50:00.000Z', 'ORDINARIA', 459.80, NULL, NULL, 'ACTIVA', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\6\\facturas\\237\\original.pdf', 8, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\6\\facturas\\237\\sellado.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\6\\facturas\\237\\factura.xml'),
(238, 2, 279, '', '5', '2026-03-03T11:37:00.000Z', 'ORDINARIA', 121.00, NULL, NULL, 'ANULADA', NULL, 1, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\238\\sellado.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\238\\factura.xml'),
(241, 6, 282, '', '1-R1', '2026-03-03T13:55:00.000Z', 'RECTIFICATIVA', -36.30, 237, 'DIFERENCIAS', 'ACTIVA', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\6\\facturas\\241\\original.pdf', 8, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\6\\facturas\\241\\sellado.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\6\\facturas\\241\\factura_rectificativa.xml'),
(242, 6, 284, '', 'F-2026000242', '2026-02-04T23:00:00.000Z', 'ORDINARIA', 145.93, NULL, NULL, 'ANULADA', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\6\\facturas\\242\\original.pdf', 9, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\6\\facturas\\242\\sellado.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\6\\facturas\\242\\factura.xml'),
(243, 1, 286, '', 'F-2026000242', '2026-02-04T23:00:00.000Z', 'ORDINARIA', 145.93, NULL, NULL, 'ANULADA', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\1\\facturas\\243\\original.pdf', 10, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\1\\facturas\\243\\sellado.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\1\\facturas\\243\\factura.xml'),
(246, 2, 290, '', '6', '2026-03-05T12:09:00.000Z', 'ORDINARIA', 181.50, NULL, NULL, 'ACTIVA', NULL, 4, 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\246\\sellado.pdf', 'C:\\xampp\\htdocs\\proyectoNoVeri\\noverifactu-back\\storage\\usuarios\\2\\facturas\\246\\factura.xml');

--
-- Disparadores `facturas`
--
DELIMITER $$
CREATE TRIGGER `no_delete_facturas` BEFORE DELETE ON `facturas` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'No se permite borrar facturas. Solo pueden anularse.';
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `no_update_campos_criticos_facturas` BEFORE UPDATE ON `facturas` FOR EACH ROW BEGIN
  IF 
    NEW.registro_id <> OLD.registro_id OR
    NEW.numero_factura <> OLD.numero_factura OR
    NEW.factura_origen_id <> OLD.factura_origen_id OR
    NEW.tipo_factura <> OLD.tipo_factura OR
    NEW.importe_total <> OLD.importe_total
  THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No se permite modificar campos críticos de la factura.';
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura_conceptos`
--

CREATE TABLE `factura_conceptos` (
  `id` bigint(20) NOT NULL,
  `factura_id` bigint(20) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `tipo_impositivo` decimal(5,2) NOT NULL,
  `tipo_impuesto` varchar(20) NOT NULL,
  `base` decimal(15,2) NOT NULL,
  `cuota` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `factura_conceptos`
--

INSERT INTO `factura_conceptos` (`id`, `factura_id`, `descripcion`, `cantidad`, `precio_unitario`, `tipo_impositivo`, `tipo_impuesto`, `base`, `cuota`) VALUES
(22, 206, 'Consulta', 1.00, 50.00, 21.00, 'IVA', 50.00, 10.50),
(23, 207, 'Consulta', 1.00, 50.00, 21.00, 'IVA', 50.00, 10.50),
(24, 207, 'Diseño', 1.00, 45.00, 21.00, 'IVA', 45.00, 9.45),
(25, 208, 'Desarrollo', 1.00, 500.00, 21.00, 'IVA', 500.00, 105.00),
(27, 210, 'Desarrollo', 1.00, 500.00, 21.00, 'IVA', 500.00, 105.00),
(28, 211, 'Consulta', 1.00, 150.00, 21.00, 'IVA', 150.00, 31.50),
(29, 211, 'Diseño', 1.00, 200.00, 21.00, 'IVA', 200.00, 42.00),
(30, 212, 'Consulta', 1.00, 150.00, 21.00, 'IVA', 150.00, 31.50),
(31, 212, 'Diseño', 1.00, 200.00, 21.00, 'IVA', 200.00, 42.00),
(32, 212, 'Materiales', 1.00, 50.00, 21.00, 'IVA', 50.00, 10.50),
(36, 214, 'Consulta (ajuste)', 1.00, 150.00, 21.00, 'IVA', 150.00, 31.50),
(37, 214, 'Diseño (ajuste)', 1.00, 200.00, 21.00, 'IVA', 200.00, 42.00),
(38, 214, 'Material (ajuste)', 1.00, 50.00, 21.00, 'IVA', 50.00, 10.50),
(39, 215, 'Material (ajuste)', 1.00, 50.00, 21.00, 'IVA', 50.00, 10.50),
(40, 216, 'Material (ajuste)', 1.00, 50.00, 21.00, 'IVA', 50.00, 10.50),
(41, 217, 'Material', 2.00, 50.00, 21.00, 'IVA', 100.00, 21.00),
(42, 217, 'Diseño', 2.00, 150.00, 21.00, 'IVA', 300.00, 63.00),
(43, 218, 'Material', 2.00, 50.00, 21.00, 'IVA', 100.00, 21.00),
(44, 218, 'Diseño', 1.00, 150.00, 21.00, 'IVA', 150.00, 31.50),
(45, 219, 'Diseño de página', 1.00, 200.00, 21.00, 'IVA', 200.00, 42.00),
(46, 219, 'Presentación', 1.00, 150.00, 21.00, 'IVA', 150.00, 31.50),
(47, 219, 'Formación', 1.00, 80.00, 21.00, 'IVA', 80.00, 16.80),
(48, 219, 'Recursos', 3.00, 50.00, 21.00, 'IVA', 150.00, 31.50),
(49, 220, 'Diseño de página', 1.00, 200.00, 21.00, 'IVA', 200.00, 42.00),
(50, 220, 'Formación', 1.00, 80.00, 21.00, 'IVA', 80.00, 16.80),
(51, 220, 'Recursos', 2.00, 50.00, 21.00, 'IVA', 100.00, 21.00),
(52, 221, 'Diseño de página', 1.00, 200.00, 21.00, 'IVA', 200.00, 42.00),
(53, 221, 'Presentación', 1.00, 150.00, 21.00, 'IVA', 150.00, 31.50),
(54, 221, 'Formación', 1.00, 80.00, 21.00, 'IVA', 80.00, 16.80),
(55, 221, 'Recursos', 3.00, 50.00, 21.00, 'IVA', 150.00, 31.50),
(56, 222, 'Formación (ajuste)', 1.00, -80.00, 21.00, 'IVA', -80.00, -16.80),
(57, 222, 'Recursos (ajuste)', 1.00, -50.00, 21.00, 'IVA', -50.00, -10.50),
(58, 223, 'Desarrollo', 1.00, 200.00, 21.00, 'IVA', 200.00, 42.00),
(59, 224, 'Pruebas (ajuste)', 1.00, 100.00, 21.00, 'IVA', 100.00, 21.00),
(60, 225, 'Material', 14.00, 50.00, 21.00, 'IVA', 700.00, 147.00),
(61, 226, 'Pruebas (ajuste)', 1.00, 100.00, 21.00, 'IVA', 100.00, 21.00),
(62, 227, 'Pruebas (ajuste)', 1.00, 100.00, 21.00, 'IVA', 100.00, 21.00),
(63, 228, 'Pruebas (ajuste)', 1.00, 100.00, 21.00, 'IVA', 100.00, 21.00),
(64, 229, 'Pruebas', 1.00, 100.00, 21.00, 'IVA', 100.00, 21.00),
(65, 230, 'Presentación (ajuste)', 1.00, 50.00, 21.00, 'IVA', 50.00, 10.50),
(66, 231, 'Formación', 1.00, 80.00, 21.00, 'IVA', 80.00, 16.80),
(67, 231, 'Material', 2.00, 50.00, 21.00, 'IVA', 100.00, 21.00),
(68, 232, 'Formación (ajuste)', 1.00, -80.00, 21.00, 'IVA', -80.00, -16.80),
(69, 233, 'Formación (ajuste)', 1.00, -80.00, 21.00, 'IVA', -80.00, -16.80),
(70, 233, 'Recursos (ajuste)', 1.00, 50.00, 21.00, 'IVA', 50.00, 10.50),
(71, 234, 'Formación (ajuste)', 1.00, -80.00, 21.00, 'IVA', -80.00, -16.80),
(72, 234, 'Recursos (ajuste)', 1.00, 70.00, 21.00, 'IVA', 70.00, 14.70),
(76, 236, 'SANITINA ELASTICA ADHESIVA 10 CM X 4,5 M', 31.00, 4.18, 10.00, 'IVA', 129.58, 12.96),
(77, 236, 'GUANTES DE NITRILO TALLA \"M\" 100 UND', 1.00, 2.80, 21.00, 'IVA', 2.80, 0.59),
(78, 236, 'SANITINA ELASTICA ADHESIVA 10 CM X 4,5 M', 4.00, 0.00, 10.00, 'IVA', 0.00, 0.00),
(79, 237, 'Diseño de página', 1.00, 200.00, 21.00, 'IVA', 200.00, 42.00),
(80, 237, 'Formación', 1.00, 80.00, 21.00, 'IVA', 80.00, 16.80),
(81, 237, 'Recursos', 2.00, 50.00, 21.00, 'IVA', 100.00, 21.00),
(82, 238, 'Consulta', 1.00, 100.00, 21.00, 'IVA', 100.00, 21.00),
(87, 241, 'Formación (ajuste)', 1.00, -80.00, 21.00, 'IVA', -80.00, -16.80),
(88, 241, 'Recursos (ajuste)', 1.00, 50.00, 21.00, 'IVA', 50.00, 10.50),
(89, 242, 'SANITINA ELASTICA ADHESIVA 10 CM X 4,5 M', 31.00, 4.18, 10.00, 'IVA', 129.58, 12.96),
(90, 242, 'GUANTES DE NITRILO TALLA \"M\" 100 UND', 1.00, 2.80, 21.00, 'IVA', 2.80, 0.59),
(91, 242, 'SANITINA ELASTICA ADHESIVA 10 CM X 4,5 M', 4.00, 0.00, 10.00, 'IVA', 0.00, 0.00),
(92, 243, 'SANITINA ELASTICA ADHESIVA 10 CM X 4,5 M', 31.00, 4.18, 10.00, 'IVA', 129.58, 12.96),
(93, 243, 'GUANTES DE NITRILO TALLA \"M\" 100 UND', 1.00, 2.80, 21.00, 'IVA', 2.80, 0.59),
(94, 243, 'SANITINA ELASTICA ADHESIVA 10 CM X 4,5 M', 4.00, 0.00, 10.00, 'IVA', 0.00, 0.00),
(97, 246, 'Consulta', 3.00, 50.00, 21.00, 'IVA', 150.00, 31.50);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura_impuestos`
--

CREATE TABLE `factura_impuestos` (
  `id` bigint(20) NOT NULL,
  `factura_id` bigint(20) NOT NULL,
  `base_imponible` decimal(10,2) NOT NULL,
  `tipo_impositivo` decimal(5,2) NOT NULL,
  `cuota` decimal(10,2) NOT NULL,
  `tipo_impuesto` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `factura_impuestos`
--

INSERT INTO `factura_impuestos` (`id`, `factura_id`, `base_imponible`, `tipo_impositivo`, `cuota`, `tipo_impuesto`) VALUES
(206, 206, 50.00, 21.00, 10.50, 'IVA'),
(207, 207, 45.00, 21.00, 9.45, 'IVA'),
(208, 208, 500.00, 21.00, 105.00, 'IVA'),
(210, 210, 500.00, 21.00, 105.00, 'IVA'),
(211, 211, 350.00, 21.00, 73.50, 'IVA'),
(212, 212, 50.00, 21.00, 10.50, 'IVA'),
(214, 214, 400.00, 21.00, 84.00, 'IVA'),
(215, 215, 50.00, 21.00, 10.50, 'IVA'),
(216, 216, 50.00, 21.00, 10.50, 'IVA'),
(217, 217, 400.00, 21.00, 84.00, 'IVA'),
(218, 218, 250.00, 21.00, 52.50, 'IVA'),
(219, 219, 580.00, 21.00, 121.80, 'IVA'),
(220, 220, 380.00, 21.00, 79.80, 'IVA'),
(221, 221, 580.00, 21.00, 121.80, 'IVA'),
(222, 222, -130.00, 21.00, -27.30, 'IVA'),
(223, 223, 200.00, 21.00, 42.00, 'IVA'),
(224, 224, 100.00, 21.00, 21.00, 'IVA'),
(225, 225, 700.00, 21.00, 147.00, 'IVA'),
(226, 226, 100.00, 21.00, 21.00, 'IVA'),
(227, 227, 100.00, 21.00, 21.00, 'IVA'),
(228, 228, 100.00, 21.00, 21.00, 'IVA'),
(229, 229, 100.00, 21.00, 21.00, 'IVA'),
(230, 230, 50.00, 21.00, 10.50, 'IVA'),
(231, 231, 180.00, 21.00, 37.80, 'IVA'),
(232, 232, -80.00, 21.00, -16.80, 'IVA'),
(233, 233, -30.00, 21.00, -6.30, 'IVA'),
(234, 234, -10.00, 21.00, -2.10, 'IVA'),
(237, 236, 129.58, 10.00, 12.96, 'IVA'),
(238, 236, 2.80, 21.00, 0.59, 'IVA'),
(239, 237, 380.00, 21.00, 79.80, 'IVA'),
(240, 238, 100.00, 21.00, 21.00, 'IVA'),
(243, 241, -30.00, 21.00, -6.30, 'IVA'),
(244, 242, 129.58, 10.00, 12.96, 'IVA'),
(245, 242, 2.80, 21.00, 0.59, 'IVA'),
(246, 243, 129.58, 10.00, 12.96, 'IVA'),
(247, 243, 2.80, 21.00, 0.59, 'IVA'),
(250, 246, 150.00, 21.00, 31.50, 'IVA');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `log_eventos`
--

CREATE TABLE `log_eventos` (
  `id` bigint(20) NOT NULL,
  `usuario_id` bigint(20) NOT NULL,
  `tipo_evento` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_evento` varchar(24) NOT NULL,
  `hash_evento` char(255) NOT NULL,
  `hash_evento_anterior` char(255) NOT NULL,
  `num_evento` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `log_eventos`
--

INSERT INTO `log_eventos` (`id`, `usuario_id`, `tipo_evento`, `descripcion`, `fecha_evento`, `hash_evento`, `hash_evento_anterior`, `num_evento`) VALUES
(98, 2, 'LOGIN_OK', 'Inicio de sesión correcto del usuario rebecamm2495@gmail.com', '2026-01-30 11:07:41.9960', '70ae52818107f14b51fec5fd071f04e1059f4258073c26a7bfe8ff2a043868c8', '0000000000000000000000000000000000000000000000000000000000000000', 1),
(99, 2, 'FACTURA_IMPORTADA', 'Factura 2 IMPORTADA', '2026-01-30 11:07:56.2970', 'b7fc40d7d2f53c1f34b1eba3341b91b27dab1e4636e192b303969d3dc76917ce', '70ae52818107f14b51fec5fd071f04e1059f4258073c26a7bfe8ff2a043868c8', 2),
(100, 2, 'FACTURA_REGISTRADA', 'Factura 4 registrada', '2026-01-30 11:08:49.3220', 'c188e194da44bfa23146e2a414a420aef490bde0748ad1184de19941af742972', 'b7fc40d7d2f53c1f34b1eba3341b91b27dab1e4636e192b303969d3dc76917ce', 3),
(101, 2, 'DESCARGA_PDF', 'Descarga de documento PDF sellado de la factura número 4', '2026-01-30 11:08:51.9130', 'e3fcb949b355045a51d2dde1cdac6eba3d65f33864028837d3954bb00ac7c6c7', 'c188e194da44bfa23146e2a414a420aef490bde0748ad1184de19941af742972', 4),
(102, 2, 'FACTURA_REGISTRADA', 'Factura 4 registrada', '2026-01-30 11:09:31.3180', '4d3297fb4ca84346b4e60c8e36089c4c25a62538ab6b81671d00e09d11184b14', 'e3fcb949b355045a51d2dde1cdac6eba3d65f33864028837d3954bb00ac7c6c7', 5),
(103, 2, 'DESCARGA_PDF', 'Descarga de documento PDF sellado de la factura número 4', '2026-01-30 11:09:33.3960', 'a39ed5e1850e76906e2aa8fb575db24b556a04a76c7072a4ea845da7fc232bbb', '4d3297fb4ca84346b4e60c8e36089c4c25a62538ab6b81671d00e09d11184b14', 6),
(104, 2, 'FACTURA_RECTIFICADA', 'Factura 5 rectificada', '2026-01-30 11:10:44.5910', '67e0867a70b5a531001ef962a43bb5046e8b28a3919022b7d8d0a6be3e62217c', 'a39ed5e1850e76906e2aa8fb575db24b556a04a76c7072a4ea845da7fc232bbb', 7),
(105, 2, 'LOGIN_OK', 'Inicio de sesión correcto del usuario rebecamm2495@gmail.com', '2026-02-03 07:09:43.6760', '608d570e0ab5f869c850a1bdb254fc7cd31ea438ffc437065b4ed9e69a2cf621', '67e0867a70b5a531001ef962a43bb5046e8b28a3919022b7d8d0a6be3e62217c', 8),
(106, 2, 'LOGIN_OK', 'Inicio de sesión correcto del usuario rebecamm2495@gmail.com', '2026-02-03 07:10:25.4510', '2bf64f69b07b6b77d1680541c7d815a8efca61ad136ed7a050ca3968729f4ff9', '608d570e0ab5f869c850a1bdb254fc7cd31ea438ffc437065b4ed9e69a2cf621', 9),
(107, 2, 'FACTURA_REGISTRADA', 'Factura 6 registrada', '2026-02-03 07:42:59.6590', '9e83529bad1a4ba2af7a6885bc123b2c5ed7cbd3b103ebf83c10089df0a9875d', '2bf64f69b07b6b77d1680541c7d815a8efca61ad136ed7a050ca3968729f4ff9', 10),
(108, 2, 'DESCARGA_PDF', 'Descarga de documento PDF sellado de la factura número 6', '2026-02-03 07:43:03.9700', '43a62a5e34ee16800c98cfeb8aa39e33bf9715aaad9138b707d87435c62e4590', '9e83529bad1a4ba2af7a6885bc123b2c5ed7cbd3b103ebf83c10089df0a9875d', 11),
(109, 2, 'DESCARGA_PDF', 'Descarga de documento PDF sellado de la factura número 6', '2026-02-03 07:47:10.4250', 'eb3418af9846ef6e74cbe34204e088921261131e28db5606e314c701538acc16', '43a62a5e34ee16800c98cfeb8aa39e33bf9715aaad9138b707d87435c62e4590', 12),
(110, 2, 'FACTURA_REGISTRADA', 'Factura 7 registrada', '2026-02-03 07:49:46.3870', '237682cfc1be2df511e6f09ab6bc141a1391cfeec6d45dbabfa5688579cdcbe3', 'eb3418af9846ef6e74cbe34204e088921261131e28db5606e314c701538acc16', 13),
(111, 2, 'DESCARGA_PDF', 'Descarga de documento PDF sellado de la factura número 7', '2026-02-03 07:49:50.0500', 'b0e775f70d89e5c4fb29fedafbf94280e6edcd034efc5c1965bce4a5b9511817', '237682cfc1be2df511e6f09ab6bc141a1391cfeec6d45dbabfa5688579cdcbe3', 14),
(112, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 7', '2026-02-03 07:50:10.0270', 'bd8ed825a019be828698bcd79aa44094a093363c1d4857ea19b61fcf4e480de5', 'b0e775f70d89e5c4fb29fedafbf94280e6edcd034efc5c1965bce4a5b9511817', 15),
(113, 2, 'FACTURA_REGISTRADA', 'Factura 8 registrada', '2026-02-03 07:57:00.9590', 'a239fea571a4ec7eda5db0999fad5fd288ee362826ad3552000edeebb13f5024', 'bd8ed825a019be828698bcd79aa44094a093363c1d4857ea19b61fcf4e480de5', 16),
(114, 2, 'DESCARGA_PDF', 'Descarga de documento PDF sellado de la factura número 8', '2026-02-03 07:57:03.1300', '1727ceaf91e5345c666d5bdcaff30d53a921cb4b48ce0f58adb94b0df1f345ff', 'a239fea571a4ec7eda5db0999fad5fd288ee362826ad3552000edeebb13f5024', 17),
(115, 2, 'DESCARGA_PDF', 'Descarga de documento PDF sellado de la factura número 8', '2026-02-03 08:39:58.1680', '94e911ca3895346d635a5d51cb7fb876eb7ed6a009018616bc79941a34241545', '1727ceaf91e5345c666d5bdcaff30d53a921cb4b48ce0f58adb94b0df1f345ff', 18),
(116, 2, 'DATOS_FISCALES_MODIFICADOS', 'Modificación de los datos fiscales del usuario 2', '2026-02-03 08:57:01.5360', 'd55215b2dce416dc6d962275a2b2f68df989bf7900960d6addd79efcb3587da9', '94e911ca3895346d635a5d51cb7fb876eb7ed6a009018616bc79941a34241545', 19),
(117, 2, 'DATOS_FISCALES_MODIFICADOS', 'Modificación de los datos fiscales del usuario 2', '2026-02-03 09:21:48.9300', '5d37d36aeffa6f8cf942572f0a135d8fefe35a74cac6bf13955f0779768efe7c', 'd55215b2dce416dc6d962275a2b2f68df989bf7900960d6addd79efcb3587da9', 20),
(118, 2, 'DESCARGA_PDF', 'Descarga de documento PDF sellado de la factura número 8', '2026-02-03 09:21:58.7250', '4e20a3a9386d278b1c131c000322f0a0b5842eddcc04c0eb56392b44c2e47e4d', '5d37d36aeffa6f8cf942572f0a135d8fefe35a74cac6bf13955f0779768efe7c', 21),
(119, 2, 'DESCARGA_PDF', 'Descarga de documento PDF sellado de la factura número 8', '2026-02-03 10:14:50.3810', 'ed0c0da5470ad3b5c9cc473bd8a57ac529e2cbcdd88aeb37854b34747255aa63', '4e20a3a9386d278b1c131c000322f0a0b5842eddcc04c0eb56392b44c2e47e4d', 22),
(120, 2, 'FACTURA_RECTIFICADA', 'Factura 71 rectificada', '2026-02-03 10:22:59.1780', 'de602c7f07ea0be166d2d7f7acdbf4e893f872215fc4511c47cee35b18a68e37', 'ed0c0da5470ad3b5c9cc473bd8a57ac529e2cbcdd88aeb37854b34747255aa63', 23),
(121, 2, 'FACTURA_IMPORTADA', 'Factura 2 IMPORTADA', '2026-02-03 10:23:22.1870', 'f79c0ac0b6ce43887c12b75f9be7f4552d36b9ab2b4b6f2223dbc64f04dbe2a1', 'de602c7f07ea0be166d2d7f7acdbf4e893f872215fc4511c47cee35b18a68e37', 24),
(122, 2, 'FACTURA_IMPORTADA', 'Factura 2 IMPORTADA', '2026-02-03 10:24:26.4460', '36b2806d2d172bcf8cec82d50081b105a97d80d530b73bd7721db727db3ea711', 'f79c0ac0b6ce43887c12b75f9be7f4552d36b9ab2b4b6f2223dbc64f04dbe2a1', 25),
(123, 2, 'FACTURA_IMPORTADA', 'Factura 2 IMPORTADA', '2026-02-03 10:29:29.0570', '88854711785ac4defff508d0290c1d4d194da5a7677144bcff61c884b1c88d39', '36b2806d2d172bcf8cec82d50081b105a97d80d530b73bd7721db727db3ea711', 26),
(124, 2, 'FACTURA_IMPORTADA', 'Factura 2 IMPORTADA', '2026-02-03 10:35:25.5880', 'a33cd221176ee159b5d7add0c94dbbcfe544f0b27c4e4fb3f484d1bc545bb8fc', '88854711785ac4defff508d0290c1d4d194da5a7677144bcff61c884b1c88d39', 27),
(125, 2, 'FACTURA_IMPORTADA', 'Factura 2 IMPORTADA', '2026-02-03 10:42:21.6250', '06c52e70243ae9d8209aa8e313164a92412c33a2e82478166d59ee7cbaaa3a3b', 'a33cd221176ee159b5d7add0c94dbbcfe544f0b27c4e4fb3f484d1bc545bb8fc', 28),
(126, 2, 'FACTURA_IMPORTADA', 'Factura 2 IMPORTADA', '2026-02-03 10:47:34.7670', '3e85cb94a2ebb14af8c581105b5ec8ca9411eb133552f745e4125ad4254638c3', '06c52e70243ae9d8209aa8e313164a92412c33a2e82478166d59ee7cbaaa3a3b', 29),
(127, 2, 'FACTURA_IMPORTADA', 'Factura 2 IMPORTADA', '2026-02-03 10:47:45.2340', 'e6af814c6a705daf83933e9e6dda014a7f39f221606796f267c1589b76a8301e', '3e85cb94a2ebb14af8c581105b5ec8ca9411eb133552f745e4125ad4254638c3', 30),
(128, 2, 'FACTURA_IMPORTADA', 'Factura 2 IMPORTADA', '2026-02-03 10:49:54.6550', '5d57c66f1b3e8554f930dfded6468980fe469a0c3d0ca0b29a3c6f6c5bbe2402', 'e6af814c6a705daf83933e9e6dda014a7f39f221606796f267c1589b76a8301e', 31),
(129, 2, 'FACTURA_IMPORTADA', 'Factura 2 IMPORTADA', '2026-02-03 10:50:01.7220', '35fd87a26017ab771d163700d58b43491c97502702d0fec182123c99bdd58199', '5d57c66f1b3e8554f930dfded6468980fe469a0c3d0ca0b29a3c6f6c5bbe2402', 32),
(130, 2, 'FACTURA_IMPORTADA', 'Factura 2 IMPORTADA', '2026-02-03 10:50:55.6810', '1448bdc4703921becf1d3938f81e853371876568b69b13f371f6a921d602141f', '35fd87a26017ab771d163700d58b43491c97502702d0fec182123c99bdd58199', 33),
(131, 2, 'FACTURA_IMPORTADA', 'Factura 2 IMPORTADA', '2026-02-03 10:53:17.5070', 'a11f1e938f5c3bbaa5bb717b92b6170abba909ded63f4018189d369f12f954f3', '1448bdc4703921becf1d3938f81e853371876568b69b13f371f6a921d602141f', 34),
(132, 2, 'FACTURA_IMPORTADA', 'Factura 2 IMPORTADA', '2026-02-03 10:53:48.4800', '8ebd316fc5fb5d84c1c9242cd283cca47d5441252608a07d9acb251af36993c1', 'a11f1e938f5c3bbaa5bb717b92b6170abba909ded63f4018189d369f12f954f3', 35),
(133, 2, 'FACTURA_IMPORTADA', 'Factura 2 IMPORTADA', '2026-02-03 10:54:23.3690', '538e50b559fb865827b8f7c5fe28a37e2073f3c816f93f76a04e8a5d7e75a43b', '8ebd316fc5fb5d84c1c9242cd283cca47d5441252608a07d9acb251af36993c1', 36),
(134, 2, 'FACTURA_IMPORTADA', 'Factura 2 IMPORTADA', '2026-02-03 10:54:50.1930', '35d072b53a57af063e7b878b8c52904c99355692cb6cd02aec8015b2b66d4656', '538e50b559fb865827b8f7c5fe28a37e2073f3c816f93f76a04e8a5d7e75a43b', 37),
(135, 2, 'FACTURA_ANULADA', 'Factura 2 anulada', '2026-02-03 11:22:52.6040', '0a1b0051c6f3527adbfb5f06c84657fa61dcf08544a97f9a55f4d14aaa115446', '35d072b53a57af063e7b878b8c52904c99355692cb6cd02aec8015b2b66d4656', 38),
(136, 2, 'CAMBIO_ESTADO_SUSCRIPCION', 'Estado cambiado a VENCIDA', '2026-02-03 11:45:50.7910', '275211ccd9335825a2c0a1d9835147e187097b45be488c0efeb28c798237ce7d', '0a1b0051c6f3527adbfb5f06c84657fa61dcf08544a97f9a55f4d14aaa115446', 39),
(137, 2, 'LOGIN_OK', 'Inicio de sesión correcto del usuario rebecamm2495@gmail.com', '2026-02-03 11:47:14.7710', '87b4bba5b47674915dcb5d634184d7c4e6cdfbd288f956655068639b6d4dd128', '275211ccd9335825a2c0a1d9835147e187097b45be488c0efeb28c798237ce7d', 40),
(138, 2, 'LOGIN_OK', 'Inicio de sesión correcto del usuario rebecamm2495@gmail.com', '2026-02-03 11:58:54.3920', 'f6718ea6d68cf8f00ff07e2f5eda75d1a0fa79d302970fd75202b9e23e142ce3', '87b4bba5b47674915dcb5d634184d7c4e6cdfbd288f956655068639b6d4dd128', 41),
(139, 2, 'CAMBIO_ESTADO_SUSCRIPCION', 'Estado cambiado a ACTIVA', '2026-02-03 12:10:58.8250', '734fbf404c6d179f6ed1cb9571862f47c9db3177e13d1fcd7749f27d2f354c99', 'f6718ea6d68cf8f00ff07e2f5eda75d1a0fa79d302970fd75202b9e23e142ce3', 42),
(140, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 7', '2026-02-03 12:28:05.2120', 'f329b92179f19b80d17ea57c1f9e9a15c1edd28b40dc4d0d509c94081380cd12', '734fbf404c6d179f6ed1cb9571862f47c9db3177e13d1fcd7749f27d2f354c99', 43),
(141, 2, 'DATOS_FISCALES_MODIFICADOS', 'Modificación de los datos fiscales del usuario 2', '2026-02-03 12:39:41.3730', '45dcdf569c00e0199b1407ce92955b16e2f7fcac7070c1182cd31d988d5010d0', 'f329b92179f19b80d17ea57c1f9e9a15c1edd28b40dc4d0d509c94081380cd12', 44),
(142, 2, 'DATOS_FISCALES_MODIFICADOS', 'Modificación de los datos fiscales del usuario 2', '2026-02-03 12:40:54.3240', 'fbdcf4e6758b9f75e39ab4da1cc29adc15f9a71ed2c2645fb500ce6139d9fd07', '45dcdf569c00e0199b1407ce92955b16e2f7fcac7070c1182cd31d988d5010d0', 45),
(143, 2, 'DATOS_FISCALES_MODIFICADOS', 'Modificación de los datos fiscales del usuario 2', '2026-02-03 12:41:00.4720', '79eda9afd9f3d46736138f1b19148ce41e86e3edbe70cc21742a45848390b3f2', 'fbdcf4e6758b9f75e39ab4da1cc29adc15f9a71ed2c2645fb500ce6139d9fd07', 46),
(144, 2, 'DATOS_FISCALES_MODIFICADOS', 'Modificación de los datos fiscales del usuario 2', '2026-02-03 12:45:31.2680', '1400ffd50a16376b75c103b4382e576e303314fa98b68770adc1e22bc023d93d', '79eda9afd9f3d46736138f1b19148ce41e86e3edbe70cc21742a45848390b3f2', 47),
(145, 2, 'CAMBIO_ESTADO_SUSCRIPCION', 'Estado cambiado a ACTIVA', '2026-02-03 13:19:50.0550', 'd06476a9ea0642df154cc52e61989c1300e9c7e30a8e04fe3498562eddf1fcc3', '1400ffd50a16376b75c103b4382e576e303314fa98b68770adc1e22bc023d93d', 48),
(146, 2, 'CAMBIO_ESTADO_SUSCRIPCION', 'Estado cambiado a VENCIDA', '2026-02-03 13:19:50.8290', 'd726041037665b9447212692bd2777ed6f000666cdda3277e61c92054a565a30', 'd06476a9ea0642df154cc52e61989c1300e9c7e30a8e04fe3498562eddf1fcc3', 49),
(147, 2, 'CAMBIO_ESTADO_SUSCRIPCION', 'Estado cambiado a PENDIENTE', '2026-02-03 13:19:51.6240', '23478140422bbca20cfc2cb07b125a01c378604059a34e457a0b62f51caa267e', 'd726041037665b9447212692bd2777ed6f000666cdda3277e61c92054a565a30', 50),
(148, 2, 'CAMBIO_ESTADO_SUSCRIPCION', 'Estado cambiado a ACTIVA', '2026-02-03 13:19:52.6640', '4f112c0d66b6aea6694fc24a8427061fb3be4e7ab9dc1adab4d5923ed9d478cb', '23478140422bbca20cfc2cb07b125a01c378604059a34e457a0b62f51caa267e', 51),
(149, 2, 'CAMBIO_SUSCRIPCION', 'Cambio de la suscripción del usuario 2', '2026-02-03 13:19:56.1020', 'c4dee4df0366838233a4184d3d5c7f8a2daf321f1e184540eb7f1b34da881976', '4f112c0d66b6aea6694fc24a8427061fb3be4e7ab9dc1adab4d5923ed9d478cb', 52),
(150, 2, 'CAMBIO_SUSCRIPCION', 'Cambio de la suscripción del usuario 2', '2026-02-03 13:19:57.1930', 'c2e3326b493bb6dd6313178ee3cc6482f77ccc6ea7edde63f2beac8fafa1c2ae', 'c4dee4df0366838233a4184d3d5c7f8a2daf321f1e184540eb7f1b34da881976', 53),
(151, 2, 'CAMBIO_SUSCRIPCION', 'Cambio de la suscripción del usuario 2', '2026-02-03 13:19:57.9650', '2f92c43b0ad5b15913cd3199933bde3a1d872871fb4786728649d63a06f61831', 'c2e3326b493bb6dd6313178ee3cc6482f77ccc6ea7edde63f2beac8fafa1c2ae', 54),
(152, 2, 'CAMBIO_SUSCRIPCION', 'Cambio de la suscripción del usuario 2', '2026-02-03 13:20:00.1140', 'bb0db840020bdb7a09876a5fbb0d8a1a34994ca7d5c4effce988f75ee36b85d7', '2f92c43b0ad5b15913cd3199933bde3a1d872871fb4786728649d63a06f61831', 55),
(153, 2, 'FACTURA_REGISTRADA', 'Factura 10 registrada', '2026-02-03 13:21:05.4010', '3b770a7bb73344e8357facd4ead9afc82928b08a935043444bf630440ef7ba86', 'bb0db840020bdb7a09876a5fbb0d8a1a34994ca7d5c4effce988f75ee36b85d7', 56),
(154, 2, 'DESCARGA_PDF', 'Descarga de documento PDF sellado de la factura número 10', '2026-02-03 13:21:09.1410', '9b160384b6e42df954e113957614f04fa18f6b36ee2ff75e27aea2304613ed06', '3b770a7bb73344e8357facd4ead9afc82928b08a935043444bf630440ef7ba86', 57),
(155, 2, 'FACTURA_ANULADA', 'Factura 2 anulada', '2026-02-03 13:21:50.6930', 'da97a0f4bb2cd1e35278ccf1ef234bc1c94951e4376b5e70c22e159eaa7aefcf', '9b160384b6e42df954e113957614f04fa18f6b36ee2ff75e27aea2304613ed06', 58),
(156, 2, 'FACTURA_RECTIFICADA', 'Factura 61 rectificada', '2026-02-03 13:27:03.3600', '77a9767301acd34eac7bbf9de73133acef5804cd27944e4d0e277a4815edf97c', 'da97a0f4bb2cd1e35278ccf1ef234bc1c94951e4376b5e70c22e159eaa7aefcf', 59),
(157, 3, 'REGISTRO DE USUARIO', 'Registro del usuario con email:  pruebas@noverifactu.local', '2026-02-03 13:27:42.1710', '2ad795ff31a7d5ff83d80252e38b7ccc967a29b00b51ce19ae8071f2277a62c2', '0000000000000000000000000000000000000000000000000000000000000000', 1),
(158, 2, 'LOGIN_OK', 'Inicio de sesión correcto del usuario rebecamm2495@gmail.com', '2026-02-03 13:28:35.6740', '2da1eba94b3d39e205e50299a043aa4d34642c1ec9ac095f0d77178677591d6d', '77a9767301acd34eac7bbf9de73133acef5804cd27944e4d0e277a4815edf97c', 60),
(159, 2, 'CAMBIO_ESTADO_SUSCRIPCION', 'Estado cambiado a PENDIENTE', '2026-02-03 13:29:03.9090', '4c3cd0f392abdb265127c8e2ff1824e6ff217f2c97927ac23528997d9b767c27', '2da1eba94b3d39e205e50299a043aa4d34642c1ec9ac095f0d77178677591d6d', 61),
(160, 2, 'CAMBIO_ESTADO_SUSCRIPCION', 'Estado cambiado a VENCIDA', '2026-02-03 13:29:05.7040', '4377f1d79df7aed686186854c33c83a36212bdb9aeb8d5c079556a3e0c909220', '4c3cd0f392abdb265127c8e2ff1824e6ff217f2c97927ac23528997d9b767c27', 62),
(161, 2, 'CAMBIO_ESTADO_SUSCRIPCION', 'Estado cambiado a ACTIVA', '2026-02-03 13:29:15.8960', '94e69c3177abb6a6a615840b8d01c911f28ba9d34595e7ec68e87cfe408fe7a7', '4377f1d79df7aed686186854c33c83a36212bdb9aeb8d5c079556a3e0c909220', 63),
(162, 2, 'CAMBIO_SUSCRIPCION', 'Cambio de la suscripción del usuario 2', '2026-02-03 13:29:19.3400', 'b6f01028386e1f496dfdbeaaee49d1abb8b166db6f62ecd5f7fde227a414a7ca', '94e69c3177abb6a6a615840b8d01c911f28ba9d34595e7ec68e87cfe408fe7a7', 64),
(163, 2, 'CAMBIO_SUSCRIPCION', 'Cambio de la suscripción del usuario 2', '2026-02-03 13:29:20.8700', 'e15d7fedd9ac993f5cceacd70042c7add1ae12e782a8d4dd94c829ba20106908', 'b6f01028386e1f496dfdbeaaee49d1abb8b166db6f62ecd5f7fde227a414a7ca', 65),
(164, 2, 'CAMBIO_SUSCRIPCION', 'Cambio de la suscripción del usuario 2', '2026-02-03 13:29:25.5200', 'e9c9f3051c78f65a107f297896655311760723329cf905b49cb9981ce189c0bb', 'e15d7fedd9ac993f5cceacd70042c7add1ae12e782a8d4dd94c829ba20106908', 66),
(165, 2, 'CAMBIO_SUSCRIPCION', 'Cambio de la suscripción del usuario 2', '2026-02-03 13:29:26.2640', '4f25e1d1c7ba08bcae90fe4e83417512930073b44651fc4def07dbaec1f962af', 'e9c9f3051c78f65a107f297896655311760723329cf905b49cb9981ce189c0bb', 67),
(166, 2, 'FACTURA_IMPORTADA', 'Factura 4 IMPORTADA', '2026-02-03 13:29:54.9240', '200f6ed59c7380903910489bccd43e2646118b15fa93e6f7fe52ff26f7ed405f', '4f25e1d1c7ba08bcae90fe4e83417512930073b44651fc4def07dbaec1f962af', 68),
(167, 2, 'DESCARGA_PDF', 'Descarga de documento PDF sellado de la factura número 61', '2026-02-03 13:31:37.5990', '78a830b345f1d88b0b4ccf978bd5ad27705111d0213c39d9f74e5f61f90fe03b', '200f6ed59c7380903910489bccd43e2646118b15fa93e6f7fe52ff26f7ed405f', 69),
(168, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 61', '2026-02-03 13:31:44.1490', '2870f4f3720bfc3f4c2fcf279cae5aa27db5ebd27f2328bd4ad17abb95a771a5', '78a830b345f1d88b0b4ccf978bd5ad27705111d0213c39d9f74e5f61f90fe03b', 70),
(169, 2, 'DATOS_FISCALES_MODIFICADOS', 'Modificación de los datos fiscales del usuario 2', '2026-02-03 13:43:47.1360', '1d319db5f04cfe2a7eb3b63ccc5ebddc15582d4120225271af4e652f06bb098c', '2870f4f3720bfc3f4c2fcf279cae5aa27db5ebd27f2328bd4ad17abb95a771a5', 71),
(170, 2, 'DATOS_FISCALES_MODIFICADOS', 'Modificación de los datos fiscales del usuario 2', '2026-02-03 13:48:39.4030', 'e598c69b21cb1d35bbb04a80a02663b8a72733a50f718a1e337bda454ca704e0', '1d319db5f04cfe2a7eb3b63ccc5ebddc15582d4120225271af4e652f06bb098c', 72),
(171, 2, 'FACTURA_RECTIFICADA', 'Factura 8-R1 rectificada', '2026-02-03 14:05:09.6570', '5f69cb4f283934775c7ea2745291cdd367a7a3a4dab82e0a311caae87f8a4ffb', 'e598c69b21cb1d35bbb04a80a02663b8a72733a50f718a1e337bda454ca704e0', 73),
(172, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 2', '2026-02-03 14:09:52.9460', '889ff4620546258ff35cfed0c7aae4db707b04582a8370edf0e8e962124e6659', '5f69cb4f283934775c7ea2745291cdd367a7a3a4dab82e0a311caae87f8a4ffb', 74),
(173, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 4', '2026-02-03 14:09:54.6640', '876bc0f143237e3cd0470e5f92719e524453f54cef675dc76806bfc85241719a', '889ff4620546258ff35cfed0c7aae4db707b04582a8370edf0e8e962124e6659', 75),
(174, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 4', '2026-02-03 14:09:55.9260', '5cb1efbe7b67782b00b8affe2fe5ca9a8195a85c344a9199d18052f73ccfcea0', '876bc0f143237e3cd0470e5f92719e524453f54cef675dc76806bfc85241719a', 76),
(175, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 4', '2026-02-03 14:09:56.7480', '8f6574f16663c3452ff06e82868c43674cf734eb724040be7073a8371ac64208', '5cb1efbe7b67782b00b8affe2fe5ca9a8195a85c344a9199d18052f73ccfcea0', 77),
(176, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 5', '2026-02-03 14:09:57.3590', '3d5b09d469e9d94781a11357eceb362b4b5de84d4dca966827a25075ffa7cb3e', '8f6574f16663c3452ff06e82868c43674cf734eb724040be7073a8371ac64208', 78),
(177, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 6', '2026-02-03 14:09:57.9520', 'a50a89f91b88796bc392a8061f1e0101efb6768e013a56913cbc4dd180f16aaf', '3d5b09d469e9d94781a11357eceb362b4b5de84d4dca966827a25075ffa7cb3e', 79),
(178, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 7', '2026-02-03 14:09:59.3880', 'b43cc4ba8f8c7b20693464acb509cc0ef23c15a713d98b76df2b08a45061b8ee', 'a50a89f91b88796bc392a8061f1e0101efb6768e013a56913cbc4dd180f16aaf', 80),
(179, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 8', '2026-02-03 14:09:59.9630', '804b5dda479e4b82ee1d9d100a465d3a3738b5505d2c7c53212e69ae11dc8fda', 'b43cc4ba8f8c7b20693464acb509cc0ef23c15a713d98b76df2b08a45061b8ee', 81),
(180, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 71', '2026-02-03 14:10:00.6000', '9482f609061bf51f0319e9c9625a2b2f387405c6fd23ce495b5169ae18f19032', '804b5dda479e4b82ee1d9d100a465d3a3738b5505d2c7c53212e69ae11dc8fda', 82),
(181, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 61', '2026-02-03 14:10:01.2820', '3486f34106d711c3fd8ba9fa4d21da60621c914501573481bd1ef1a47adde050', '9482f609061bf51f0319e9c9625a2b2f387405c6fd23ce495b5169ae18f19032', 83),
(182, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 8-R1', '2026-02-03 14:10:01.9280', 'bba0cfaf2347b998d43d4ff8cf39c70fba4595643383dafd42c1899979c42d97', '3486f34106d711c3fd8ba9fa4d21da60621c914501573481bd1ef1a47adde050', 84),
(183, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 4', '2026-02-03 14:38:44.4020', '297903877d7ed3f3524f05318ba1ee6c79632bb3039cecf82425512a2449e251', 'bba0cfaf2347b998d43d4ff8cf39c70fba4595643383dafd42c1899979c42d97', 85),
(184, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 5', '2026-02-03 14:38:48.5310', '93af8959f97607bcd1480fdf66fcff18a86316b8629108f844d0ae902cd9a308', '297903877d7ed3f3524f05318ba1ee6c79632bb3039cecf82425512a2449e251', 86),
(185, 2, 'CAMBIO_ESTADO_SUSCRIPCION', 'Estado cambiado a VENCIDA', '2026-02-03 14:46:31.7700', '86b3ad223f8fd005abf3692a5f091b088b23354ada7a50e8fbef692e4faebda7', '93af8959f97607bcd1480fdf66fcff18a86316b8629108f844d0ae902cd9a308', 87),
(186, 2, 'CAMBIO_ESTADO_SUSCRIPCION', 'Estado cambiado a VENCIDA', '2026-02-03 15:15:48.0890', '0f44fc8577b298dec0c8b60bb4b2e3138abfd418ca6392d56ccd3a9bbe236ff5', '86b3ad223f8fd005abf3692a5f091b088b23354ada7a50e8fbef692e4faebda7', 88),
(187, 2, 'CAMBIO_ESTADO_SUSCRIPCION', 'Estado cambiado a ACTIVA', '2026-02-03 15:15:48.7550', 'b6eba7d49904e9a4dbd20a33c3853a7a651074b9f3313f1e852cd2b2ad033c54', '0f44fc8577b298dec0c8b60bb4b2e3138abfd418ca6392d56ccd3a9bbe236ff5', 89),
(188, 2, 'CAMBIO_ESTADO_SUSCRIPCION', 'Estado cambiado a VENCIDA', '2026-02-03 15:15:49.4370', '6575b26240f099a1eda6d111a09216081ed80906e32df513f99001e8aecb1694', 'b6eba7d49904e9a4dbd20a33c3853a7a651074b9f3313f1e852cd2b2ad033c54', 90),
(189, 2, 'CAMBIO_SUSCRIPCION', 'Cambio de la suscripción del usuario 2', '2026-02-03 15:16:36.2600', 'af848f15814b056c91d210e5ec9ba7059a83a7691de151884211ffd8748b83c1', '6575b26240f099a1eda6d111a09216081ed80906e32df513f99001e8aecb1694', 91),
(190, 2, 'CAMBIO_ESTADO_SUSCRIPCION', 'Estado cambiado a ACTIVA', '2026-02-03 15:20:57.2940', '8af74df57e3f3e043ef3bdd3dd1cdd0bed83ad4f79de823c193ad921692b1da0', 'af848f15814b056c91d210e5ec9ba7059a83a7691de151884211ffd8748b83c1', 92),
(191, 2, 'LOGIN_OK', 'Inicio de sesión correcto del usuario rebecamm2495@gmail.com', '2026-02-04 07:23:53.4120', '31fec7a76020b8570946f2537e4b978ceecd167eb3089bcaffe88e845c193b29', '8af74df57e3f3e043ef3bdd3dd1cdd0bed83ad4f79de823c193ad921692b1da0', 93),
(192, 2, 'LOGIN_OK', 'Inicio de sesión correcto del usuario rebecamm2495@gmail.com', '2026-02-04 08:04:51.2680', '02eab051afa2dd4a67c8e0f31ad62b7dee60d1f1ce67958292cd564d860ccae7', '31fec7a76020b8570946f2537e4b978ceecd167eb3089bcaffe88e845c193b29', 94),
(193, 2, 'INTENTO_ACTIVAR_2FA', 'Inicio del proceso de activación de 2FA', '2026-02-04 08:11:04.0570', '4c9742f0ff6290ea48b6626ae04d58be7fa104689d1c3d31e383545fb8dd81f1', '02eab051afa2dd4a67c8e0f31ad62b7dee60d1f1ce67958292cd564d860ccae7', 95),
(194, 2, 'LOGIN_OK', 'Inicio de sesión correcto del usuario rebecamm2495@gmail.com', '2026-02-04 08:29:57.7850', '7f40c8ed62b6e12aedd83677c6f7f00254b3c4032d00d31ac76cc1032b23efa1', '4c9742f0ff6290ea48b6626ae04d58be7fa104689d1c3d31e383545fb8dd81f1', 96),
(195, 2, 'INTENTO_ACTIVAR_2FA', 'Inicio del proceso de activación de 2FA', '2026-02-04 08:30:00.5220', 'dbb72fdee4789e73806076276847018900e7ec3ead45a89d3f3eb40a8717070b', '7f40c8ed62b6e12aedd83677c6f7f00254b3c4032d00d31ac76cc1032b23efa1', 97),
(196, 2, 'LOGIN_OK', 'Inicio de sesión correcto del usuario rebecamm2495@gmail.com', '2026-02-04 08:34:41.4480', 'd66e0f10a570367ad8f40fadc7264652305e149131db0d9a94aabfcde9c3fd02', 'dbb72fdee4789e73806076276847018900e7ec3ead45a89d3f3eb40a8717070b', 98),
(197, 2, 'INTENTO_ACTIVAR_2FA', 'Inicio del proceso de activación de 2FA', '2026-02-04 08:34:43.6100', '19b6c5262afc5505f243ec8298cd8d80da4fa84908c1175cde67e9ece3d1f6a2', 'd66e0f10a570367ad8f40fadc7264652305e149131db0d9a94aabfcde9c3fd02', 99),
(198, 2, 'ACTIVAR_2FA', 'Autenticación en dos factores activada', '2026-02-04 08:36:11.6620', '22e34e2ba3dff5cd7c52f64d91c56d5cc633f50e5e1c7fd81b3249af548fe0f4', '19b6c5262afc5505f243ec8298cd8d80da4fa84908c1175cde67e9ece3d1f6a2', 100),
(199, 2, 'LOGIN_OK', 'Inicio de sesión correcto del usuario rebecamm2495@gmail.com', '2026-02-04 08:36:27.8860', '55a1b6645b42853e7526a79ac86dbc4abc17619f1c4347a633bc7e48a832666a', '22e34e2ba3dff5cd7c52f64d91c56d5cc633f50e5e1c7fd81b3249af548fe0f4', 101),
(200, 2, 'LOGIN_OK', 'Inicio de sesión correcto del usuario rebecamm2495@gmail.com', '2026-02-04 08:50:30.4120', '0ef30255a08a0f40384a070df9d7b3bac51452190d8dd80edf0d58c301dd13ec', '55a1b6645b42853e7526a79ac86dbc4abc17619f1c4347a633bc7e48a832666a', 102),
(201, 2, 'LOGIN_OK', 'Inicio de sesión correcto del usuario rebecamm2495@gmail.com', '2026-02-04 08:52:28.2840', 'a6c275c84e70ee9e5ad5b59ef5905764c3dd767c872f62c0042947b1a5149946', '0ef30255a08a0f40384a070df9d7b3bac51452190d8dd80edf0d58c301dd13ec', 103),
(202, 2, 'LOGIN_OK', 'Inicio de sesión correcto del usuario rebecamm2495@gmail.com', '2026-02-04 08:58:28.3180', '92df59aea1190b42485316d181238802784ae4d9eb1b414e94fb5141cb23557f', 'a6c275c84e70ee9e5ad5b59ef5905764c3dd767c872f62c0042947b1a5149946', 104),
(203, 2, 'LOGIN_OK', 'Inicio de sesión correcto del usuario rebecamm2495@gmail.com', '2026-02-04 09:06:54.8780', '8844a73d1707a9e74c40327c9f63b7cac40ff4b05a4eb7bee41a47b97a39b81c', '92df59aea1190b42485316d181238802784ae4d9eb1b414e94fb5141cb23557f', 105),
(204, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-04 09:14:53.7890', '244961e2bd86dda8cd105edd3a15b2d4da2846d6a6ab4674b2b745c8daf909f0', '8844a73d1707a9e74c40327c9f63b7cac40ff4b05a4eb7bee41a47b97a39b81c', 106),
(205, 2, 'LOGIN_2FA_OK', 'Login completado correctamente con 2FA', '2026-02-04 09:15:09.7360', 'fa411337c888e0d218d0d2fd0a986d67e46b915fc77f6bd2106e7d09238a29da', '244961e2bd86dda8cd105edd3a15b2d4da2846d6a6ab4674b2b745c8daf909f0', 107),
(206, 2, 'FALLO_LOGIN_2FA', 'Código 2FA incorrecto en login', '2026-02-04 09:22:17.2460', 'c075ab2d85d831e7c91e46c4010ba151ded7a30023fdf63098e8d16e7bb181da', 'fa411337c888e0d218d0d2fd0a986d67e46b915fc77f6bd2106e7d09238a29da', 108),
(207, 2, 'LOGIN_2FA_OK', 'Login completado correctamente con 2FA', '2026-02-04 09:22:28.0620', '0545c8455fd8372cdae77d858e6311a0153344a4f8b96140cfc10e08209ccdb4', 'c075ab2d85d831e7c91e46c4010ba151ded7a30023fdf63098e8d16e7bb181da', 109),
(208, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-04 09:22:44.6100', '0e0a8a74683cd779ff5b9901811462ca0c5ad598b781f8da05418e6e15fa6fb1', '0545c8455fd8372cdae77d858e6311a0153344a4f8b96140cfc10e08209ccdb4', 110),
(209, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-04 13:36:21.9640', '3c589a6b1edd83a1974a111812bfea683fd9ce4994eef61f8405a646731faec9', '0e0a8a74683cd779ff5b9901811462ca0c5ad598b781f8da05418e6e15fa6fb1', 111),
(210, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-04 13:36:39.8280', '3dfb4dc3c33f2484ba07789e6a8058fb00a40564c4987625501fd5ac079426d2', '3c589a6b1edd83a1974a111812bfea683fd9ce4994eef61f8405a646731faec9', 112),
(211, 2, 'CAMBIO_ESTADO_SUSCRIPCION', 'Estado cambiado a VENCIDA', '2026-02-04 13:37:18.8720', 'f4282fca3bb34ae7399dd49f62e741c774c22c132a45fdbf75df2df6f3cdf7f7', '3dfb4dc3c33f2484ba07789e6a8058fb00a40564c4987625501fd5ac079426d2', 113),
(212, 2, 'CAMBIO_ESTADO_SUSCRIPCION', 'Estado cambiado a ACTIVA', '2026-02-04 13:37:26.0980', '8a95367c6d11247d5e81be80a44f442af5f4b821d11575dd087c5509fd3d8618', 'f4282fca3bb34ae7399dd49f62e741c774c22c132a45fdbf75df2df6f3cdf7f7', 114),
(213, 2, 'CAMBIO_SUSCRIPCION', 'Cambio de la suscripción del usuario 2', '2026-02-04 13:37:28.5440', 'f8ca59bd65fa689457f504bc0e7191f5f430e63878ede477d6d6d28b4e0d56e5', '8a95367c6d11247d5e81be80a44f442af5f4b821d11575dd087c5509fd3d8618', 115),
(214, 2, 'FACTURA_REGISTRADA', 'Factura 9 registrada', '2026-02-04 14:55:20.2190', '2921c0b5a6e7140a9e7336ae1370935e18346a8415cbd76a50be1157b5717bc7', 'f8ca59bd65fa689457f504bc0e7191f5f430e63878ede477d6d6d28b4e0d56e5', 116),
(215, 2, 'DESCARGA_PDF', 'Generación y almacenamiento del PDF de la factura 9', '2026-02-04 15:02:46.1770', '7cfcc4ea52023121f91766413b19287c00f2027de384fc1bfbd0f7a8c9950e40', '2921c0b5a6e7140a9e7336ae1370935e18346a8415cbd76a50be1157b5717bc7', 117),
(216, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-05 07:14:15.8160', 'e93cc7843c9db3a670f874087b8a2b88b9ba412bca94570040139426fd87fabc', '7cfcc4ea52023121f91766413b19287c00f2027de384fc1bfbd0f7a8c9950e40', 118),
(217, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-05 07:14:25.7830', 'e9ea970c6dad1e5ada932cca7c1f1e7bd781b9f1026eef94ff7bf78e4c8af602', 'e93cc7843c9db3a670f874087b8a2b88b9ba412bca94570040139426fd87fabc', 119),
(218, 2, 'DATOS_FISCALES_MODIFICADOS', 'Modificación de los datos fiscales del usuario 2', '2026-02-05 07:17:24.7760', 'f971d0bfe401acbf9b70e69cda54aaf4e1723960f32a5d8d333dbc0882477030', 'e9ea970c6dad1e5ada932cca7c1f1e7bd781b9f1026eef94ff7bf78e4c8af602', 120),
(219, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-05 07:18:51.2610', '999bde68db4afc00beb277641b9b4d32c5176b37f77e5a62d5358c26c7f1a859', 'f971d0bfe401acbf9b70e69cda54aaf4e1723960f32a5d8d333dbc0882477030', 121),
(220, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-05 07:18:58.8460', '7ff1a6200594fa30c753732f15906b1fdda8faece9e99d953ee2a276218a3f6e', '999bde68db4afc00beb277641b9b4d32c5176b37f77e5a62d5358c26c7f1a859', 122),
(221, 2, 'FACTURA_IMPORTADA', 'Factura 2 IMPORTADA', '2026-02-05 07:20:22.2250', '1c27de09385f7269e9a03e6bfae89026cb91e6fa3fbec59123dfd184714c0c98', '7ff1a6200594fa30c753732f15906b1fdda8faece9e99d953ee2a276218a3f6e', 123),
(222, 2, 'FACTURA_IMPORTADA', 'Factura 2 IMPORTADA', '2026-02-05 07:20:41.5150', '034aecd3cee33f0865543a7d706678b4c466a1a757e03632d122aa9c515d1afa', '1c27de09385f7269e9a03e6bfae89026cb91e6fa3fbec59123dfd184714c0c98', 124),
(223, 2, 'INICIO_NUEVA_CADENA_EVENTOS', 'Inicio de nueva cadena por corrección del formato temporal', '2026-02-05T11:05:47.109Z', 'b88631f4c72faacaad571b6bc0c535e137bf7c833b03b0611ae1a7c0c44c67fe', '0000000000000000000000000000000000000000000000000000000000000000', 125),
(224, 2, 'SIF_CREADO', 'Alta de SIF InAltera-0.1 v0.1', '2026-02-05T11:28:07.538Z', '0c4ebc5ef44dc41bdc34ed8ac6c4cb51983efa28dc8297716ae07eb5cb136a9c', 'b88631f4c72faacaad571b6bc0c535e137bf7c833b03b0611ae1a7c0c44c67fe', 126),
(225, 2, 'SIF_ACTIVADO', 'Activación de SIF id 1', '2026-02-05T11:28:18.315Z', '241acd390c3175b7bf81aad85ee4b29ded43a3373b1b93a5f271cf572220b939', '0c4ebc5ef44dc41bdc34ed8ac6c4cb51983efa28dc8297716ae07eb5cb136a9c', 127),
(226, 2, 'INICIO_NUEVA_CADENA_EVENTOS', 'Inicio de nueva cadena por corrección del formato temporal', '2026-02-05T12:04:06.600Z', 'b7debcec7ad3f180fb031135be74d81a6e23c857c91dfe21fed19c9945dd3a28', '0000000000000000000000000000000000000000000000000000000000000000', 128),
(227, 2, 'SIF_ACTIVADO', 'Activación de SIF id 2', '2026-02-05T12:13:11.476Z', '8f341777da264d13571573f4853e3490704538724acd3c0bc82f12f8a0ec5017', '0000000000000000000000000000000000000000000000000000000000000000', 129),
(228, 2, 'FACTURA_IMPORTADA', 'Factura EMISOR IMPORTADA', '2026-02-05T13:08:19.788Z', '90f8dfe28f8b3821342867cf73db82bc3f1d4ceee05104b7308094f43a253007', '8f341777da264d13571573f4853e3490704538724acd3c0bc82f12f8a0ec5017', 130),
(229, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-06T07:48:48.684Z', '95ecbe5f9c1cc3ce73c1cc267804effad566a9cd77dd0b16cc2310b2f4e05e2d', '90f8dfe28f8b3821342867cf73db82bc3f1d4ceee05104b7308094f43a253007', 131),
(230, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-06T07:48:59.565Z', 'c8a55b3a1106c9e2842aacadb3284c585d3eb1379cb9cc290270c8024c17303b', '95ecbe5f9c1cc3ce73c1cc267804effad566a9cd77dd0b16cc2310b2f4e05e2d', 132),
(231, 2, 'SIF_ACTIVADO', 'Activación de SIF id 1', '2026-02-06T07:49:14.794Z', '7868941501a7b920f18bdfc19357e560073f7a3ed905032b757fc017fb3a9a26', 'c8a55b3a1106c9e2842aacadb3284c585d3eb1379cb9cc290270c8024c17303b', 133),
(232, 2, 'SIF_ACTIVADO', 'Activación de SIF id 2', '2026-02-06T07:49:17.218Z', '06316ab2b23ca5e1b618ebfd070ca010e31d27f66c69fc73a2659208ae2899c9', '7868941501a7b920f18bdfc19357e560073f7a3ed905032b757fc017fb3a9a26', 134),
(233, 2, 'FACTURA_IMPORTADA', 'Factura 10 IMPORTADA', '2026-02-06T07:49:27.033Z', '5dde463c2ff582fd72494dd8f457bc58e71a96ec685f8826a2613aae6377556c', '06316ab2b23ca5e1b618ebfd070ca010e31d27f66c69fc73a2659208ae2899c9', 135),
(234, 2, 'FACTURA_REGISTRADA', 'Factura 11 registrada', '2026-02-06T10:56:20.368Z', 'e50fa9b2dc974fa6fa3ac2bce2db62c273ba2476a0db526a7fe64b802da0c330', '5dde463c2ff582fd72494dd8f457bc58e71a96ec685f8826a2613aae6377556c', 136),
(235, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-06T10:56:50.019Z', '8951ef3e38a76d83ec09528c113ec19d0355cc36265a542c2c10d7d14dea6ab5', 'e50fa9b2dc974fa6fa3ac2bce2db62c273ba2476a0db526a7fe64b802da0c330', 137),
(236, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-06T10:56:54.541Z', '99a204acb145d7ce21dccbbda3085f9448f6294fd6d54dd0eed1aba530607437', '8951ef3e38a76d83ec09528c113ec19d0355cc36265a542c2c10d7d14dea6ab5', 138),
(237, 2, 'FACTURA_REGISTRADA', 'Factura 12 registrada', '2026-02-06T11:24:35.193Z', 'f8c4fb10439ada6ec3c98b16e908bc4dd8d30e41c6915787f193f51c6da7ffb4', '99a204acb145d7ce21dccbbda3085f9448f6294fd6d54dd0eed1aba530607437', 139),
(238, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-06T11:26:34.311Z', '7c06aa4550a0ebe390d708c4f0f0b42f6cd75faf1a98c18ac458f5abc88a540f', 'f8c4fb10439ada6ec3c98b16e908bc4dd8d30e41c6915787f193f51c6da7ffb4', 140),
(239, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-06T11:26:39.191Z', '5e751c1cf9ec8faceed337bf393db087a6a82d21d2d121f1a6cbbfc0264cca8d', '7c06aa4550a0ebe390d708c4f0f0b42f6cd75faf1a98c18ac458f5abc88a540f', 141),
(240, 2, 'FACTURA_REGISTRADA', 'Factura 13 registrada', '2026-02-06T12:20:08.338Z', 'c3c9693943c174c1f0187f8641737f588905eea79a7dd7ef0ecd3ddfddd24b7a', '5e751c1cf9ec8faceed337bf393db087a6a82d21d2d121f1a6cbbfc0264cca8d', 142),
(241, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-06T12:25:38.099Z', '651d6b3ebdbb5d879416ba9440d47f4d6ee7512ee4a71f4a16947dc4b006bac5', 'c3c9693943c174c1f0187f8641737f588905eea79a7dd7ef0ecd3ddfddd24b7a', 143),
(242, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-06T12:25:49.228Z', '097042120fc7e1dc84547ffd2590ea2ccbacaa50749669b1b6052db850fe392a', '651d6b3ebdbb5d879416ba9440d47f4d6ee7512ee4a71f4a16947dc4b006bac5', 144),
(243, 2, 'FACTURA_REGISTRADA', 'Factura 14 registrada', '2026-02-06T12:27:49.863Z', '750762a8aa96c09152d9dfe2a6760f1282c093dc14ea9eed96f6440e45ece418', '097042120fc7e1dc84547ffd2590ea2ccbacaa50749669b1b6052db850fe392a', 145),
(244, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-06T12:28:20.698Z', 'c6a6168fc41d9eee64abed8d9aa3e9c3daf771ee1cac06c2ec68e27b12babdb8', '750762a8aa96c09152d9dfe2a6760f1282c093dc14ea9eed96f6440e45ece418', 146),
(245, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-06T12:28:24.816Z', '6dbecb8ead72e6df5147934ba819f9d194670efc9ad6c17ef8c8beea36944123', 'c6a6168fc41d9eee64abed8d9aa3e9c3daf771ee1cac06c2ec68e27b12babdb8', 147),
(246, 2, 'FACTURA_REGISTRADA', 'Factura 15 registrada', '2026-02-06T12:35:31.004Z', '915975a41db77b15b7398ff992228f56b6561046fc8106ddfa9a0dd4c6ead710', '6dbecb8ead72e6df5147934ba819f9d194670efc9ad6c17ef8c8beea36944123', 148),
(247, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-06T12:40:24.600Z', '081f6182817bf5a8290106ca0e125af6496a99b090460882936832f607b9ef00', '915975a41db77b15b7398ff992228f56b6561046fc8106ddfa9a0dd4c6ead710', 149),
(248, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-06T12:40:38.350Z', '23bda273ae06aac1f8ffcd44f4cebbfd02be2722833e3f26fd9c8c92a2f544ef', '081f6182817bf5a8290106ca0e125af6496a99b090460882936832f607b9ef00', 150),
(249, 2, 'FACTURA_REGISTRADA', 'Factura 16 registrada', '2026-02-06T12:40:53.972Z', '3e736f04ffb2dc76b45e2c7b2e8fa7fae7eb877841e37bf4859f045148844c17', '23bda273ae06aac1f8ffcd44f4cebbfd02be2722833e3f26fd9c8c92a2f544ef', 151),
(250, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-06T12:46:53.817Z', '8b2c5d5a13fb77f0d9ad07b89e1496c17d4867ec8d4e88126068456788524a62', '3e736f04ffb2dc76b45e2c7b2e8fa7fae7eb877841e37bf4859f045148844c17', 152),
(251, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-06T12:47:06.497Z', 'f731ea0482752176f5a070b6fe026459264c99fd44d7b69d0693193eaf4afa8a', '8b2c5d5a13fb77f0d9ad07b89e1496c17d4867ec8d4e88126068456788524a62', 153),
(252, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-06T13:57:14.336Z', '3a670bea9dcdddfad90e3a78abde45ed22d1ea197af93e62fd8aec90c77ff0e3', 'f731ea0482752176f5a070b6fe026459264c99fd44d7b69d0693193eaf4afa8a', 154),
(253, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-06T13:57:24.290Z', '033a72a6065b7c92e05d04dd64a7004deef5a28fb7b7984275641b2ce7a740bd', '3a670bea9dcdddfad90e3a78abde45ed22d1ea197af93e62fd8aec90c77ff0e3', 155),
(254, 2, 'SIF_ACTIVADO', 'Activación de SIF id 1', '2026-02-06T13:57:34.417Z', '7210ee7d4bcdf46d4ad1ef6441b6604a774649a527a9e2f876999c5cbdb98622', '033a72a6065b7c92e05d04dd64a7004deef5a28fb7b7984275641b2ce7a740bd', 156),
(255, 2, 'FACTURA_REGISTRADA', 'Factura 17 registrada', '2026-02-06T13:57:59.454Z', '4a06f62eb026b9053c6a9b1231bba291058fb88dcfbd327b35ed9af22d0aaf5d', '7210ee7d4bcdf46d4ad1ef6441b6604a774649a527a9e2f876999c5cbdb98622', 157),
(256, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-06T14:10:04.871Z', '433db46c5a0a28427c26e535fdde7de5b48b5c1659356465f803a594dcfa5c12', '4a06f62eb026b9053c6a9b1231bba291058fb88dcfbd327b35ed9af22d0aaf5d', 158),
(257, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-06T14:10:17.656Z', '2e88428018f1bbd7180da63270d31af334862cc1cc3a2374ddc39b41ce7483cd', '433db46c5a0a28427c26e535fdde7de5b48b5c1659356465f803a594dcfa5c12', 159),
(258, 2, 'FACTURA_REGISTRADA', 'Factura 18 registrada', '2026-02-06T14:11:04.102Z', 'f90ceea6b221d22ad57a8bef428c76ad7b57f95aac5cde187be8e45b1882e7d4', '2e88428018f1bbd7180da63270d31af334862cc1cc3a2374ddc39b41ce7483cd', 160),
(259, 2, 'DESCARGA_PDF', 'Generación y almacenamiento del PDF de la factura 18', '2026-02-06T14:11:04.142Z', '32fa54e66e4e87820147acb8fcbb2f52f28ff386fcfd34f0b67e4fcef17b655c', 'f90ceea6b221d22ad57a8bef428c76ad7b57f95aac5cde187be8e45b1882e7d4', 161),
(260, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-06T14:41:45.035Z', '275684a495e0e61883f9cb6a94546e1988e6118f795c15b519f5544251bdb660', '32fa54e66e4e87820147acb8fcbb2f52f28ff386fcfd34f0b67e4fcef17b655c', 162),
(261, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-06T14:41:52.859Z', '8c2fa229400164ac2c02807c6a485351620976357856b0a30f89f6a0ce2f6eff', '275684a495e0e61883f9cb6a94546e1988e6118f795c15b519f5544251bdb660', 163),
(262, 2, 'FACTURA_REGISTRADA', 'Factura 19 registrada', '2026-02-06T14:42:21.384Z', '7b1e43f08b7bf3a6590ee214a88c226d348b2b2674b946e848ed08f393c50e36', '8c2fa229400164ac2c02807c6a485351620976357856b0a30f89f6a0ce2f6eff', 164),
(263, 2, 'DESCARGA_PDF', 'Generación y almacenamiento del PDF de la factura 19', '2026-02-06T14:42:21.546Z', '84cfbd362d9dbed8bc50920dfb160d8f6dcebcf248b9fee2f3b386bd48fecb8b', '7b1e43f08b7bf3a6590ee214a88c226d348b2b2674b946e848ed08f393c50e36', 165),
(264, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-06T14:52:46.563Z', '6d78b244512613171b1d107f75d4d393ae7e066389a2be12efc017de63580f93', '84cfbd362d9dbed8bc50920dfb160d8f6dcebcf248b9fee2f3b386bd48fecb8b', 166),
(265, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-06T14:52:56.217Z', 'c14214f2558b128ff7738b3db1dc29cd9a8ba161d5a6bb846ea095e9eda4d774', '6d78b244512613171b1d107f75d4d393ae7e066389a2be12efc017de63580f93', 167),
(266, 4, 'REGISTRO DE USUARIO', 'Registro del usuario con email:  test@noveri.local', '2026-02-06T14:53:51.632Z', '55f3b33ab9a1a2f6271a452f11dce3f4881310122d029c7d168b65243b4f6a95', '0000000000000000000000000000000000000000000000000000000000000000', 1),
(267, 4, 'LOGIN_OK', 'Inicio de sesión correcto de test@noveri.local', '2026-02-06T14:54:03.278Z', 'f0f0d2501b6e26582cf93571dce7f120cfcb9f85178aa1e3ce5ae6f2740d1098', '0000000000000000000000000000000000000000000000000000000000000000', 2),
(268, 4, 'LOGIN_OK', 'Inicio de sesión correcto de test@noveri.local', '2026-02-06T14:54:12.428Z', '8a35d38b9b64c996c253fda50a0504cdc68e659f278997d81a7f8dd1c20efc9d', '0000000000000000000000000000000000000000000000000000000000000000', 3),
(269, 4, 'LOGIN_OK', 'Inicio de sesión correcto de test@noveri.local', '2026-02-06T14:55:43.369Z', 'a124d3613104b41fcca4ebb417164155fb171d48e292b417ffe7656cef74d9fe', '0000000000000000000000000000000000000000000000000000000000000000', 4),
(270, 4, 'LOGIN_OK', 'Inicio de sesión correcto de test@noveri.local', '2026-02-06T15:12:10.015Z', 'f08ea9ba947289a8389c764e0132a8ae7b2f929c58742d802d5e6503b9e49f31', '0000000000000000000000000000000000000000000000000000000000000000', 5),
(271, 4, 'DATOS_FISCALES_CREADOS', 'Primer registro de los datos fiscales del usuario 4', '2026-02-06T15:23:32.712Z', 'd2031f1a18d235af861bb2c3e2c43bab9c3bbc7bd47f887d3df469d13b144a07', '0000000000000000000000000000000000000000000000000000000000000000', 6),
(272, 4, 'CAMBIO_SUSCRIPCION', 'Cambio de la suscripción del usuario 4', '2026-02-06T15:23:36.373Z', '7404bad4c3ef177648854936bba875c05c2de06e4f80a67f8aef30e3447336d8', '0000000000000000000000000000000000000000000000000000000000000000', 7),
(273, 4, 'FACTURA_REGISTRADA', 'Factura 1 registrada', '2026-02-06T15:39:30.814Z', '8bbc2f086cfdfbe208bf5e9f19d67571a21b49dbbbe62a46f0b0d6e253e61b1e', '0000000000000000000000000000000000000000000000000000000000000000', 8),
(274, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-09T07:29:01.792Z', 'e1186c2cbabf864126ad030f615cb8b3bde945187c0b9d1049be09afdde33788', 'c14214f2558b128ff7738b3db1dc29cd9a8ba161d5a6bb846ea095e9eda4d774', 168),
(275, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-09T07:29:09.185Z', 'e71dd44492cf4d07e00421fcf8b79444051d7e6c7e5717da5127962b027bf99d', 'e1186c2cbabf864126ad030f615cb8b3bde945187c0b9d1049be09afdde33788', 169),
(276, 2, 'DATOS_FISCALES_MODIFICADOS', 'Modificación de los datos fiscales del usuario 2', '2026-02-09T07:29:25.582Z', '32636c045a1a851a457b328ca5fd5f665a2ed17e6244925410f296121a17c5f3', 'e71dd44492cf4d07e00421fcf8b79444051d7e6c7e5717da5127962b027bf99d', 170),
(277, 2, 'DATOS_FISCALES_MODIFICADOS', 'Modificación de los datos fiscales del usuario 2', '2026-02-09T07:30:18.044Z', '67b8083381a4a9460fe4db1c6c3ec064787a0d4cb787fd71186d8427ebb784ca', '32636c045a1a851a457b328ca5fd5f665a2ed17e6244925410f296121a17c5f3', 171),
(278, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-09T07:32:11.555Z', 'c6e5bd4e61690161d6401d94632094ecb0211fff3ffee64a6ab7b9569503867d', '67b8083381a4a9460fe4db1c6c3ec064787a0d4cb787fd71186d8427ebb784ca', 172),
(279, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-09T07:32:20.737Z', '3a367481006f68a0dd6e47d26c14c806ddc1cc4ad429d7486c9136c82ec4b7c6', 'c6e5bd4e61690161d6401d94632094ecb0211fff3ffee64a6ab7b9569503867d', 173),
(280, 2, 'SIF_CREADO', 'Alta de SIF TercerSW v1.0', '2026-02-09T07:33:21.438Z', '61e10203cb24b658fe54e8790c9a7e70a51512975d3f4df51c9cb6ec7c358120', '3a367481006f68a0dd6e47d26c14c806ddc1cc4ad429d7486c9136c82ec4b7c6', 174),
(281, 4, 'LOGIN_OK', 'Inicio de sesión correcto de test@noveri.local', '2026-02-09T07:40:03.503Z', '733127a37b5e3ca3f19156e1ff520f5d7556fe0bcc7946232ead23fdcc7c3018', '0000000000000000000000000000000000000000000000000000000000000000', 9),
(282, 4, 'CAMBIO_ESTADO_SUSCRIPCION', 'Estado cambiado a VENCIDA', '2026-02-09T07:40:18.942Z', 'e0c320fc3d1f8b8c81c0b40530ec86217b8084b8d7b9099ca70bc195a3693c50', '0000000000000000000000000000000000000000000000000000000000000000', 10),
(283, 4, 'CAMBIO_ESTADO_SUSCRIPCION', 'Estado cambiado a ACTIVA', '2026-02-09T07:40:37.108Z', 'e86d35c743a27e92482011ff2aa218eb237d67646b936ad8a53734842301e4c2', '0000000000000000000000000000000000000000000000000000000000000000', 11),
(284, 4, 'LOGIN_OK', 'Inicio de sesión correcto de test@noveri.local', '2026-02-09T07:45:14.623Z', 'a3753cb103064d2cad6203a034dfa24759880526dc5aba2eeb99944f71a33c4d', '0000000000000000000000000000000000000000000000000000000000000000', 12),
(285, 4, 'FACTURA_RECTIFICADA', 'Factura 1-R1 rectificada', '2026-02-09T08:04:47.105Z', 'c82862def7471fdfef8aaf33b2a30c7a15e6af78e4a3e78552c7b680a626bea5', '0000000000000000000000000000000000000000000000000000000000000000', 13),
(286, 4, 'FACTURA_ANULADA', 'Factura 1-R1 anulada', '2026-02-09T08:15:02.754Z', '97f065de1fb4a753c480594dd972e8aa06c305e7d218ae2a4d9348092fbd2cbe', '0000000000000000000000000000000000000000000000000000000000000000', 14),
(287, 4, 'INICIO_NUEVA_CADENA_EVENTOS', 'Inicio de nueva etapa por corrección estructural del sistema', '2026-02-09T09:40:51.649Z', 'a710fe196751f39abd3d60dea053c63c70533f767d962574a45522708928538e', '0000000000000000000000000000000000000000000000000000000000000000', 15),
(288, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-09T10:09:41.624Z', '2d787e1b55878cd71d072292091477512a21e765dfcba315aef666e4598b0538', '61e10203cb24b658fe54e8790c9a7e70a51512975d3f4df51c9cb6ec7c358120', 175),
(289, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-09T10:09:53.398Z', 'c2a3737897f5e150a6b5bbd479aa4e9da568ab9fdb588cb6a50f9a0b647e2e9b', '2d787e1b55878cd71d072292091477512a21e765dfcba315aef666e4598b0538', 176),
(290, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-09T10:41:45.723Z', '9c1c65222f45d084a3557a07719e86ea01ba06b6ef0a3eb01785b91050f44229', 'c2a3737897f5e150a6b5bbd479aa4e9da568ab9fdb588cb6a50f9a0b647e2e9b', 177),
(291, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-09T10:41:53.360Z', '47f42d45dad3e4d233c84770bd82ca4e9f528c358abe512b53d19471576c0409', '9c1c65222f45d084a3557a07719e86ea01ba06b6ef0a3eb01785b91050f44229', 178),
(292, 2, 'INICIO_NUEVA_CADENA_EVENTOS', 'Inicio de nueva etapa por corrección estructural del sistema', '2026-02-09T10:41:59.797Z', '9fea5da4c55fe329e4818d8df04a7296e6096f83fabbca3f000dd3b15fe55800', '0000000000000000000000000000000000000000000000000000000000000000', 179),
(293, 2, 'LOGIN_FALLIDO', 'Intento de inicio de sesión fallido para rebecamm2495@gmail.com', '2026-02-09T10:42:25.229Z', '188e66faf2936bb9190b3b4ceb8855a3bac8e746f89fb3fd7329ed52748a4c22', '0000000000000000000000000000000000000000000000000000000000000000', 180),
(294, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-09T10:42:33.586Z', '52515781cfcc59bb540da8295c3457ec9ebe225a4d6fc8d0a672cfb4f437b37a', '188e66faf2936bb9190b3b4ceb8855a3bac8e746f89fb3fd7329ed52748a4c22', 181),
(295, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-09T10:42:41.178Z', '89812514b15628d87f12944466f13c98e1b49b6d42315bd4f2d6870adc359794', '52515781cfcc59bb540da8295c3457ec9ebe225a4d6fc8d0a672cfb4f437b37a', 182),
(296, 2, 'INICIO_NUEVA_CADENA_EVENTOS', 'Inicio de nueva etapa por corrección estructural del sistema', '2026-02-09T10:42:45.547Z', '680e224f500f2e1c38f2216000a759fa293bd498c6d22a6fb9b82dfcb3dd971e', '0000000000000000000000000000000000000000000000000000000000000000', 183),
(297, 2, 'FACTURA_REGISTRADA', 'Factura 13 registrada', '2026-02-09T10:45:36.058Z', 'ee4ed87ee7dd121189fd86e58b32f21a1955b5659710eebe363d3de0cc4e4f63', '0000000000000000000000000000000000000000000000000000000000000000', 184),
(298, 2, 'DESCARGA_PDF', 'Generación y almacenamiento del PDF de la factura 13', '2026-02-09T10:45:36.202Z', 'd848e13e60d0b7ad46cc584e6e098783a6d8c1810cf910bf9ea160a01824310e', 'ee4ed87ee7dd121189fd86e58b32f21a1955b5659710eebe363d3de0cc4e4f63', 185),
(299, 2, 'FACTURA_RECTIFICADA', 'Factura 13-R1 rectificada', '2026-02-09T10:45:56.151Z', '7660f64853e9d22dcb1ea30f879269bd13d5c2c22da4f1e3f98ee1bdff919fb6', 'd848e13e60d0b7ad46cc584e6e098783a6d8c1810cf910bf9ea160a01824310e', 186),
(300, 2, 'SIF_ACTIVADO', 'Activación de SIF id 1', '2026-02-09T11:00:05.324Z', '0b7614cb0f152678a793a06254af14ac89e9b3b978c05bb3a2b939e8675fefee', '7660f64853e9d22dcb1ea30f879269bd13d5c2c22da4f1e3f98ee1bdff919fb6', 187),
(301, 2, 'FACTURA_REGISTRADA', 'Factura 12 registrada', '2026-02-09T11:10:40.548Z', '4107a6a94eb56a8c663bfcb2ff499c081efcf38ef6ddd8f4aca4ca18f23db9fe', '0b7614cb0f152678a793a06254af14ac89e9b3b978c05bb3a2b939e8675fefee', 188),
(302, 2, 'DESCARGA_PDF', 'Generación y almacenamiento del PDF de la factura 12', '2026-02-09T11:10:40.756Z', '785a528fb7a9b2b792f909c8ce1a246f41b6506705df5aebe68b1425a8c1392d', '4107a6a94eb56a8c663bfcb2ff499c081efcf38ef6ddd8f4aca4ca18f23db9fe', 189),
(303, 2, 'FACTURA_REGISTRADA', 'Factura 250 registrada', '2026-02-09T11:19:08.555Z', 'b4ba8898669364b13fbff6650f7f841895b37b5a7e8b154147db5f02a1439392', '785a528fb7a9b2b792f909c8ce1a246f41b6506705df5aebe68b1425a8c1392d', 190),
(304, 2, 'DESCARGA_PDF', 'Generación y almacenamiento del PDF de la factura 250', '2026-02-09T11:19:08.597Z', 'f8230b492d3ef892c59d16412759ec4962867a2333093c5c672638462c41016f', 'b4ba8898669364b13fbff6650f7f841895b37b5a7e8b154147db5f02a1439392', 191),
(305, 2, 'FACTURA_REGISTRADA', 'Factura 950 registrada', '2026-02-09T11:20:41.994Z', '632cea506afc73b531ede86ce1ddf9b4577dbd32d997b74933d1edfb9cb5c1f0', 'f8230b492d3ef892c59d16412759ec4962867a2333093c5c672638462c41016f', 192),
(306, 2, 'DESCARGA_PDF', 'Generación y almacenamiento del PDF de la factura 950', '2026-02-09T11:20:42.078Z', '711a9b1abc434e032b69b7db7e45e88e199bd7bdf45cb0b45818f0dec9239798', '632cea506afc73b531ede86ce1ddf9b4577dbd32d997b74933d1edfb9cb5c1f0', 193),
(307, 2, 'INICIO_NUEVA_CADENA_EVENTOS', 'Inicio de nueva etapa por corrección estructural del sistema', '2026-02-09T11:44:46.416Z', 'cd79ef5f75432df7cf029109a3977d73399c4061897f8a234376ddc338a57819', '711a9b1abc434e032b69b7db7e45e88e199bd7bdf45cb0b45818f0dec9239798', 194);
INSERT INTO `log_eventos` (`id`, `usuario_id`, `tipo_evento`, `descripcion`, `fecha_evento`, `hash_evento`, `hash_evento_anterior`, `num_evento`) VALUES
(308, 2, 'INICIO_NUEVA_CADENA_EVENTOS', 'Inicio de nueva etapa por corrección estructural del sistema', '2026-02-09T12:00:45.822Z', 'baf20ef81ec0c747a095dbccef594b971838d018df94b1a8b055a4fde6d175be', 'cd79ef5f75432df7cf029109a3977d73399c4061897f8a234376ddc338a57819', 195),
(309, 2, 'INICIO_NUEVA_CADENA_EVENTOS', 'Inicio de nueva etapa por corrección estructural del sistema', '2026-02-09T12:08:22.872Z', 'a1f2aca32de6ba276286343779904d8736d9fdf350b909ef5f4e888a42b5b61b', '0000000000000000000000000000000000000000000000000000000000000000', 196),
(310, 2, 'INICIO_NUEVA_CADENA_EVENTOS', 'Inicio de nueva etapa por corrección estructural del sistema', '2026-02-09T12:16:58.910Z', 'f895aa1ab582f93e431d626e04472ca1cbda7315112d501e6a99364fb5517b1a', '0000000000000000000000000000000000000000000000000000000000000000', 197),
(311, 2, 'INICIO_NUEVA_CADENA_EVENTOS', 'Inicio de nueva etapa por corrección estructural del sistema', '2026-02-09T12:53:02.566Z', '800f5da08655c123d2582a97c98251d063837a81e41c60e7662def0d5d068d3b', '0000000000000000000000000000000000000000000000000000000000000000', 198),
(312, 2, 'INICIO_NUEVA_CADENA_EVENTOS', 'Inicio de nueva etapa por corrección estructural del sistema', '2026-02-09T13:35:00.366Z', 'ee00ff3d7d11a69718a3122bd736c98d8f6443529a267cd6f2278918bcd114a3', '0000000000000000000000000000000000000000000000000000000000000000', 199),
(313, 2, 'FACTURA_REGISTRADA', 'Factura 1 registrada', '2026-02-09T13:36:03.591Z', '874d4f8b371a7d6c7e7ad055b666724ae25ceb1767fc1ec4debed2fe6d050b38', 'ee00ff3d7d11a69718a3122bd736c98d8f6443529a267cd6f2278918bcd114a3', 200),
(314, 2, 'DESCARGA_PDF', 'Generación y almacenamiento del PDF de la factura 1', '2026-02-09T13:36:03.654Z', '5892e10e8ae94e9ab2ec18a0618f9c3eb7609bf512f80ae9c38c054acf3a94f7', '874d4f8b371a7d6c7e7ad055b666724ae25ceb1767fc1ec4debed2fe6d050b38', 201),
(315, 2, 'FACTURA_RECTIFICADA', 'Factura 1-R1 rectificada', '2026-02-09T13:36:23.746Z', '83f423387710af70edc6821a100ba3d635137f2c60f2492a15ae0f827ced85be', '5892e10e8ae94e9ab2ec18a0618f9c3eb7609bf512f80ae9c38c054acf3a94f7', 202),
(316, 2, 'INICIO_NUEVA_CADENA_EVENTOS', 'Inicio de nueva etapa por corrección estructural del sistema', '2026-02-09T13:58:59.293Z', '2eb80110392f370888e3d5b87cfcc95816a63e77a3f8a9b0c2668c7cf40ab6fa', '0000000000000000000000000000000000000000000000000000000000000000', 203),
(317, 2, 'FACTURA_REGISTRADA', 'Factura 13 registrada', '2026-02-09T13:59:23.763Z', '839f0561dcbbb95e2e37a5530f758edf717454b79dd828c9e2d5b656183217cc', '2eb80110392f370888e3d5b87cfcc95816a63e77a3f8a9b0c2668c7cf40ab6fa', 204),
(318, 2, 'DESCARGA_PDF', 'Generación y almacenamiento del PDF de la factura 13', '2026-02-09T13:59:23.828Z', '961c38753a682d6b29376e110cecfef1a4e2a0ec1950278d3bcfb59892035f52', '839f0561dcbbb95e2e37a5530f758edf717454b79dd828c9e2d5b656183217cc', 205),
(319, 2, 'FACTURA_ANULADA', 'Factura 13 anulada', '2026-02-09T14:32:04.525Z', '1cfa8de05e61c509d947ee4c9b35cdf1cbbdf8b9449884a4922d39e7a0e57df6', '961c38753a682d6b29376e110cecfef1a4e2a0ec1950278d3bcfb59892035f52', 206),
(320, 2, 'FACTURA_REGISTRADA', 'Factura 130 registrada', '2026-02-09T14:32:52.108Z', '0076845057f12866bf192fc828bdf33b1349e8f1b47cecfc41ddbbbaf1292024', '1cfa8de05e61c509d947ee4c9b35cdf1cbbdf8b9449884a4922d39e7a0e57df6', 207),
(321, 2, 'DESCARGA_PDF_ORIGINAL', 'Descarga de documento PDF original de la factura número 130', '2026-02-09T14:32:57.561Z', '3f649233433ab53875ff5a98562e2fe3fc9e80dbd9cf06e61d0a606525c50eb9', '0076845057f12866bf192fc828bdf33b1349e8f1b47cecfc41ddbbbaf1292024', 208),
(322, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 130', '2026-02-09T14:33:03.952Z', '440f0fd93203415134974935ab5cd6e1b672537743665f99ba471a64c34ffcb7', '3f649233433ab53875ff5a98562e2fe3fc9e80dbd9cf06e61d0a606525c50eb9', 209),
(323, 2, 'FACTURA_REGISTRADA', 'Factura 12 registrada', '2026-02-09T15:16:33.951Z', '8647ecabbbf8746a21f3b2b51ac79bd148ccb7004a143166170241ff0724c928', '440f0fd93203415134974935ab5cd6e1b672537743665f99ba471a64c34ffcb7', 210),
(324, 2, 'DESCARGA_PDF_ORIGINAL', 'Descarga de documento PDF original de la factura número 12', '2026-02-09T15:16:39.007Z', 'e59481d0c394212669434bdd8bef528a274c8f8d0114cdf9f216d71007b28d56', '8647ecabbbf8746a21f3b2b51ac79bd148ccb7004a143166170241ff0724c928', 211),
(325, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 12', '2026-02-09T15:16:42.495Z', '649d1fc8c4a81b0a2cc1b06e5560d2c3b2a6a4056fefb534f90cc947f22bf867', 'e59481d0c394212669434bdd8bef528a274c8f8d0114cdf9f216d71007b28d56', 212),
(326, 2, 'FACTURA_REGISTRADA', 'Factura 950 registrada', '2026-02-09T15:26:41.473Z', '9f53af4bfbefd9b5fa690294c691ba8575d1a99d6a2d8b7938f99e9649153cf8', '649d1fc8c4a81b0a2cc1b06e5560d2c3b2a6a4056fefb534f90cc947f22bf867', 213),
(327, 2, 'FACTURA_REGISTRADA', 'Factura 4867845 registrada', '2026-02-09T15:31:32.200Z', '58b6d7bb72bac69b9cdf5e4c50b1c70572ac2c7c91f33cc6f32ce1fb22532fed', '9f53af4bfbefd9b5fa690294c691ba8575d1a99d6a2d8b7938f99e9649153cf8', 214),
(328, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-10T11:02:07.332Z', '2cbd08a3eb10bbcdea2e6136c2b1748ff56fb659da7d1f936999f17845586b74', '58b6d7bb72bac69b9cdf5e4c50b1c70572ac2c7c91f33cc6f32ce1fb22532fed', 215),
(329, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-10T11:02:12.227Z', 'fe7d62867b2e26da96eaecc0d0d13b1d9be78a79a144945c7de6bbfaa516d131', '2cbd08a3eb10bbcdea2e6136c2b1748ff56fb659da7d1f936999f17845586b74', 216),
(330, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 130', '2026-02-10T11:02:27.722Z', '10f9a51b21a0d60005b7e4e55df2f3fe6b5b05f4505911db8891e25267878a79', 'fe7d62867b2e26da96eaecc0d0d13b1d9be78a79a144945c7de6bbfaa516d131', 217),
(331, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 12', '2026-02-10T11:02:40.599Z', '6cbdbbf372560d5499c6ddb4caac3ce71395927a7a085abd97c50e046df9b9df', '10f9a51b21a0d60005b7e4e55df2f3fe6b5b05f4505911db8891e25267878a79', 218),
(332, 2, 'FACTURA_REGISTRADA', 'Factura 1 registrada', '2026-02-10T11:39:24.674Z', 'a09160842cb86432f893c2818153193f7d9143cae37153e8bad38aa07a3c1f0a', '6cbdbbf372560d5499c6ddb4caac3ce71395927a7a085abd97c50e046df9b9df', 219),
(333, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 1', '2026-02-10T11:39:30.330Z', 'e2d3a0a7981995200c3cd02002b33d2af1e7b6cba4caa2776aee59970c1b077d', 'a09160842cb86432f893c2818153193f7d9143cae37153e8bad38aa07a3c1f0a', 220),
(334, 2, 'FACTURA_REGISTRADA', 'Factura 1 registrada', '2026-02-10T12:07:42.450Z', '74429d3f4e60f5525af0e5b29cce129fc3d9e647a011b83b9e4e5515f947d5cf', 'e2d3a0a7981995200c3cd02002b33d2af1e7b6cba4caa2776aee59970c1b077d', 221),
(335, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 1', '2026-02-10T12:08:55.977Z', 'e2c46e0587655e57ee4a926111c6ae5c2175351a9ba50b0cfcaec2a14bcadd08', '74429d3f4e60f5525af0e5b29cce129fc3d9e647a011b83b9e4e5515f947d5cf', 222),
(336, 2, 'FACTURA_REGISTRADA', 'Factura 1 registrada', '2026-02-10T12:11:27.404Z', '3e1754a9ce36840936e081230b7b986d196fdb16df1535cee8ecee67043e6c90', 'e2c46e0587655e57ee4a926111c6ae5c2175351a9ba50b0cfcaec2a14bcadd08', 223),
(337, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 1', '2026-02-10T12:11:31.112Z', 'f9242198da891909a4322e5ceaf6702a9c341635c70a5b15d1562988e2066fa8', '3e1754a9ce36840936e081230b7b986d196fdb16df1535cee8ecee67043e6c90', 224),
(338, 2, 'FACTURA_REGISTRADA', 'Factura 1 registrada', '2026-02-10T12:23:32.947Z', '83ed437522e2dbe1f7ace2dc46d066bbb39447b31afe66a2a3b9bd1cf7539a36', 'f9242198da891909a4322e5ceaf6702a9c341635c70a5b15d1562988e2066fa8', 225),
(339, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 1', '2026-02-10T12:23:36.464Z', 'cfce1cf0bca09adfad2fee0484ae1eac82c26dea0290e3b3791e11ab8d7e2b31', '83ed437522e2dbe1f7ace2dc46d066bbb39447b31afe66a2a3b9bd1cf7539a36', 226),
(340, 2, 'FACTURA_REGISTRADA', 'Factura 1 registrada', '2026-02-10T12:25:36.952Z', '47006841d52d9f373305e99ad4e8bffadf751609553488525d5a661206581f19', 'cfce1cf0bca09adfad2fee0484ae1eac82c26dea0290e3b3791e11ab8d7e2b31', 227),
(341, 2, 'FACTURA_REGISTRADA', 'Factura 1 registrada', '2026-02-10T12:28:07.058Z', '998e545fdee1c9981e1e1b095b3891edd99389d67deba1df9706b217ff39ae66', '47006841d52d9f373305e99ad4e8bffadf751609553488525d5a661206581f19', 228),
(342, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 1', '2026-02-10T12:28:07.077Z', 'e477034e3189b5a8e5a70007bf9c7c0cc3522cd58db245c702f40a1a990cfc50', '998e545fdee1c9981e1e1b095b3891edd99389d67deba1df9706b217ff39ae66', 229),
(343, 2, 'FACTURA_REGISTRADA', 'Factura 1 registrada', '2026-02-10T12:30:38.427Z', '8f3c7b945dd693cf7a4d82d112f266881e9b91c2ad58ffd418bae5bcf0fb0163', 'e477034e3189b5a8e5a70007bf9c7c0cc3522cd58db245c702f40a1a990cfc50', 230),
(344, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 1', '2026-02-10T12:30:38.493Z', '4f561024e6ce2aadd9a46a5ef0cbd2771bb8b853c06b17436be71c03616cfa93', '8f3c7b945dd693cf7a4d82d112f266881e9b91c2ad58ffd418bae5bcf0fb0163', 231),
(345, 2, 'FACTURA_REGISTRADA', 'Factura 1 registrada', '2026-02-10T13:26:58.736Z', '34bf0da50b3538323acc561b1185a20770e5182ea6bbfd5294cf21e363adf19f', '4f561024e6ce2aadd9a46a5ef0cbd2771bb8b853c06b17436be71c03616cfa93', 232),
(346, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 1', '2026-02-10T13:26:58.747Z', 'c01432bf3f17f2f834c574ae238f1c15c7d14da9542c5504da8fdf22d45b4e91', '34bf0da50b3538323acc561b1185a20770e5182ea6bbfd5294cf21e363adf19f', 233),
(347, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 1', '2026-02-10T13:27:35.594Z', '727451fcddbe1dba3aaa2e69037bcf7987bf3f897c447eafdb83a8536ddba6d1', 'c01432bf3f17f2f834c574ae238f1c15c7d14da9542c5504da8fdf22d45b4e91', 234),
(348, 2, 'FACTURA_REGISTRADA', 'Factura 13 registrada', '2026-02-10T13:29:11.912Z', 'a4e383229264e77a5a364f29f53fb63209590d07210995ac372b33d15578434a', '727451fcddbe1dba3aaa2e69037bcf7987bf3f897c447eafdb83a8536ddba6d1', 235),
(349, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 13', '2026-02-10T13:29:11.934Z', 'd209ca768406890fc35052fb09de1e86cdab49b43b527364be982a5f25a43f93', 'a4e383229264e77a5a364f29f53fb63209590d07210995ac372b33d15578434a', 236),
(350, 2, 'DESCARGA_PDF_ORIGINAL', 'Descarga de documento PDF original de la factura número 13', '2026-02-10T13:29:24.530Z', '332c691c3cbed23e2b881e8926d3df049dac32e30b019c730e8faf4a07ec317a', 'd209ca768406890fc35052fb09de1e86cdab49b43b527364be982a5f25a43f93', 237),
(351, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 13', '2026-02-10T13:29:58.730Z', '84048faa54bce5c326bf83d733e87a46972f5c5290e0f924d1a12286c4cbfe4e', '332c691c3cbed23e2b881e8926d3df049dac32e30b019c730e8faf4a07ec317a', 238),
(352, 2, 'FACTURA_REGISTRADA', 'Factura 2 registrada', '2026-02-10T13:30:34.593Z', 'b4251b6ff6df4951119cf3ebbe6844effb332cfea4c1564ffae466bf45c6b4ad', '84048faa54bce5c326bf83d733e87a46972f5c5290e0f924d1a12286c4cbfe4e', 239),
(353, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 2', '2026-02-10T13:30:34.624Z', '48ec98cc682ad97a247a428e73b9232d6cd816e697d5429a5d4eebdd7bfd7f53', 'b4251b6ff6df4951119cf3ebbe6844effb332cfea4c1564ffae466bf45c6b4ad', 240),
(354, 2, 'FACTURA_RECTIFICADA', 'Factura 2-R1 rectificada', '2026-02-10T13:31:04.445Z', 'e88cda314e33af320b7d957844dd85f8e83b2b0fa5b44a248a242113ef4539e7', '48ec98cc682ad97a247a428e73b9232d6cd816e697d5429a5d4eebdd7bfd7f53', 241),
(355, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 2-R1', '2026-02-10T13:31:17.483Z', '065e68b457a1e7123cb801eb5187c6d7da305df3e314c878557298f5c6af0e47', 'e88cda314e33af320b7d957844dd85f8e83b2b0fa5b44a248a242113ef4539e7', 242),
(356, 2, 'FACTURA_ANULADA', 'Factura 2 anulada', '2026-02-10T13:31:41.298Z', 'e15c8196e176a74a7c6e5197089f3da8aac606112227f44c5d0d523f16de7617', '065e68b457a1e7123cb801eb5187c6d7da305df3e314c878557298f5c6af0e47', 243),
(357, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 2', '2026-02-10T13:57:58.107Z', 'd612d245124147c3da93bc1f179adc1b863aa4d2f91a6d34164b8503fc4aa891', 'e15c8196e176a74a7c6e5197089f3da8aac606112227f44c5d0d523f16de7617', 244),
(358, 2, 'DESCARGA_XML', 'Descarga de registro XML de la factura número 2', '2026-02-10T13:57:59.678Z', '7d948c8dcfd458661b8d597a37acb38ec86a03dcbc03c6df91ee4201c6713705', 'd612d245124147c3da93bc1f179adc1b863aa4d2f91a6d34164b8503fc4aa891', 245),
(359, 2, 'FACTURA_REGISTRADA', 'Factura 3 registrada', '2026-02-10T15:00:20.827Z', '3b62acf9ed5762e38364b4eef4b9ae4722e9a954225ef2fa4e427c5c251de240', '7d948c8dcfd458661b8d597a37acb38ec86a03dcbc03c6df91ee4201c6713705', 246),
(360, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 3', '2026-02-10T15:00:20.836Z', '15b851ca16468ec2bf175b11507b0648b23a15d721f0d57b27161e79c31722bb', '3b62acf9ed5762e38364b4eef4b9ae4722e9a954225ef2fa4e427c5c251de240', 247),
(361, 2, 'FACTURA_REGISTRADA', 'Factura 4 registrada', '2026-02-10T15:12:06.019Z', 'ff46b5c669934f1f8eebb40e76e1d63878d3c5ff163940fbad5bf64077f083b2', '15b851ca16468ec2bf175b11507b0648b23a15d721f0d57b27161e79c31722bb', 248),
(362, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 4', '2026-02-10T15:12:06.034Z', 'adf48ff9b450624b43a56d82dbd6a0a918259fba5e33a6ce0d7c2cde32018203', 'ff46b5c669934f1f8eebb40e76e1d63878d3c5ff163940fbad5bf64077f083b2', 249),
(363, 2, 'FACTURA_REGISTRADA', 'Factura 5 registrada', '2026-02-10T15:13:18.109Z', '3ee9467c7d4b2e3f586cb6f3e6afa71010042db318ee6a5a1689ecf9de8b357f', 'adf48ff9b450624b43a56d82dbd6a0a918259fba5e33a6ce0d7c2cde32018203', 250),
(364, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 5', '2026-02-10T15:13:18.121Z', '445509464b597f1075799f46513d7e5adec733594478f9551b17006138234e4b', '3ee9467c7d4b2e3f586cb6f3e6afa71010042db318ee6a5a1689ecf9de8b357f', 251),
(365, 2, 'FACTURA_REGISTRADA', 'Factura 6 registrada', '2026-02-10T15:23:00.061Z', '05d49c32c910e09101b1309094dc65605f7f4d7e20d7dfd463d23aa8d06ea4ac', '445509464b597f1075799f46513d7e5adec733594478f9551b17006138234e4b', 252),
(366, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 6', '2026-02-10T15:23:00.074Z', '83f66eabd28892cfb216d33385e0ba3a93b5dd051cdfd486d95e963cc38aa468', '05d49c32c910e09101b1309094dc65605f7f4d7e20d7dfd463d23aa8d06ea4ac', 253),
(367, 2, 'FACTURA_REGISTRADA', 'Factura 7 registrada', '2026-02-10T15:27:25.255Z', '99e9852594464bbf059219d67858978537b4897a56c96551966f4fdabe20392e', '83f66eabd28892cfb216d33385e0ba3a93b5dd051cdfd486d95e963cc38aa468', 254),
(368, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 7', '2026-02-10T15:27:25.264Z', 'de564880e4b76042cb5de0202489cc1d33974a3c35e85f47833dd40d77300515', '99e9852594464bbf059219d67858978537b4897a56c96551966f4fdabe20392e', 255),
(369, 2, 'FACTURA_REGISTRADA', 'Factura 8 registrada', '2026-02-10T15:31:44.759Z', '455a38b377680fabc7f0ed71494c6c3fa4c2bcda7e7a658a5fcf6dbc06b931da', 'de564880e4b76042cb5de0202489cc1d33974a3c35e85f47833dd40d77300515', 256),
(370, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 8', '2026-02-10T15:31:44.768Z', 'f74ddbee84104bfa000c43334c8084a01298a6102785e14abeaeb68e9826fca6', '455a38b377680fabc7f0ed71494c6c3fa4c2bcda7e7a658a5fcf6dbc06b931da', 257),
(371, 2, 'FACTURA_REGISTRADA', 'Factura 9 registrada', '2026-02-10T15:34:31.824Z', '15df1378dc8272374d321890a44e1956846c873aad5f78be13e6e37104ac1933', 'f74ddbee84104bfa000c43334c8084a01298a6102785e14abeaeb68e9826fca6', 258),
(372, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 9', '2026-02-10T15:34:31.834Z', 'ca497d008a1d595b153da90ea227615658a656317131ccd2b1078ce732b18484', '15df1378dc8272374d321890a44e1956846c873aad5f78be13e6e37104ac1933', 259),
(373, 2, 'FACTURA_REGISTRADA', 'Factura 10 registrada', '2026-02-10T15:35:54.601Z', '9a9471849db3ca7ed39124c44b2d292cf97078bbc40b08fc2001ddb9673796e9', 'ca497d008a1d595b153da90ea227615658a656317131ccd2b1078ce732b18484', 260),
(374, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 10', '2026-02-10T15:35:54.611Z', '814fccd7115421c43f3120af71f6232f4e107053445678bb8394d67d885b6b72', '9a9471849db3ca7ed39124c44b2d292cf97078bbc40b08fc2001ddb9673796e9', 261),
(375, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-11T08:11:39.488Z', '83468ee53660aea1ac4d0eec1289fdecbce8774616298116410a40108d4a35e3', '814fccd7115421c43f3120af71f6232f4e107053445678bb8394d67d885b6b72', 262),
(376, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-11T08:11:59.523Z', '3e96f65da6344bd7354a9feaa1abb1621eb612fb000e19cbb5ca3aacee276e31', '83468ee53660aea1ac4d0eec1289fdecbce8774616298116410a40108d4a35e3', 263),
(377, 2, 'FACTURA_REGISTRADA', 'Factura 11 registrada', '2026-02-11T08:14:15.923Z', '7d4d4edf15e1cf80fe03e88dec00224235cb4dea5b92b51cb30e9376e5444e8b', '3e96f65da6344bd7354a9feaa1abb1621eb612fb000e19cbb5ca3aacee276e31', 264),
(378, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 11', '2026-02-11T08:14:15.934Z', '7797aa2e32334536be9059dce5bdfe79dd0e977678e067d75eb0be21e831d14f', '7d4d4edf15e1cf80fe03e88dec00224235cb4dea5b92b51cb30e9376e5444e8b', 265),
(379, 2, 'FACTURA_REGISTRADA', 'Factura 14 registrada', '2026-02-11T08:17:48.293Z', 'bd17ffaf29f020003245c80ca139389962492e3d37c3773562e4120e7889e3c6', '7797aa2e32334536be9059dce5bdfe79dd0e977678e067d75eb0be21e831d14f', 266),
(380, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 14', '2026-02-11T08:17:48.346Z', 'a2092204b3611849f0bbb2257cd6c9020e026d5e19bc3b963da834af1dd295e1', 'bd17ffaf29f020003245c80ca139389962492e3d37c3773562e4120e7889e3c6', 267),
(381, 2, 'FACTURA_REGISTRADA', 'Factura 15 registrada', '2026-02-11T08:20:33.189Z', '66209a36dbbb965a847819f7398b3993772b1ac9df6ab3a46a132098498e55ce', 'a2092204b3611849f0bbb2257cd6c9020e026d5e19bc3b963da834af1dd295e1', 268),
(382, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 15', '2026-02-11T08:20:33.200Z', 'ff9ddb41a8417b22d772be3ac320dae2f8efe18dcbc6c53010c969b6ea1c707e', '66209a36dbbb965a847819f7398b3993772b1ac9df6ab3a46a132098498e55ce', 269),
(383, 2, 'FACTURA_ANULADA', 'Factura 2-R1 anulada', '2026-02-11T08:43:52.740Z', '308148c84c51d7003ce4197b13c9050282843b0dd32e552fb168f6f0d7bc6e9e', 'ff9ddb41a8417b22d772be3ac320dae2f8efe18dcbc6c53010c969b6ea1c707e', 270),
(384, 2, 'FACTURA_REGISTRADA', 'Factura 16 registrada', '2026-02-11T09:56:55.269Z', '57f11c258be4949a7bfad87c228c1d61b9854cd70979815c02a8974c7c827167', '308148c84c51d7003ce4197b13c9050282843b0dd32e552fb168f6f0d7bc6e9e', 271),
(385, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 16', '2026-02-11T09:56:55.281Z', 'e029168944b132e63c62b1efc7447c7ddf57e59ffce44b499a6c763ece4e7933', '57f11c258be4949a7bfad87c228c1d61b9854cd70979815c02a8974c7c827167', 272),
(386, 2, 'FACTURA_RECTIFICADA', 'Factura 16-R2 rectificada', '2026-02-11T10:22:35.613Z', 'b06350f1c4a6d30c8d83080a04762d3d7c162292d4ff21add4e6830eda7d3997', 'e029168944b132e63c62b1efc7447c7ddf57e59ffce44b499a6c763ece4e7933', 273),
(387, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 16-R2', '2026-02-11T10:31:49.447Z', 'a5f7ba2589968f3212ab6a1f3f3996b1c9469a9880a2b52dd89e90304ecdf364', 'b06350f1c4a6d30c8d83080a04762d3d7c162292d4ff21add4e6830eda7d3997', 274),
(388, 2, 'FACTURA_RECTIFICADA', 'Factura 7-R3 rectificada', '2026-02-11T10:38:19.914Z', '698b0d3554ade9e8cb75b2c5bcb88012648b18edc6ef8b39847855daa52f0d40', 'a5f7ba2589968f3212ab6a1f3f3996b1c9469a9880a2b52dd89e90304ecdf364', 275),
(389, 2, 'FACTURA_ANULADA', 'Factura 7 anulada', '2026-02-11T10:59:13.748Z', '7de3abf5eedb97209b9dba2c6469c6bfa931db8dd422f5dff9bcc9cc22ac7915', '698b0d3554ade9e8cb75b2c5bcb88012648b18edc6ef8b39847855daa52f0d40', 276),
(390, 2, 'DESCARGA_XML', 'Descarga XML (anulacion) factura 7', '2026-02-11T11:40:38.204Z', '859d66a204c431df294c95505bf9cda26b4cc286c9c04c0ae698d1ddf31e05be', '7de3abf5eedb97209b9dba2c6469c6bfa931db8dd422f5dff9bcc9cc22ac7915', 277),
(391, 2, 'FACTURA_RECTIFICADA', 'Factura 10-R1 rectificada', '2026-02-11T11:41:38.622Z', 'a89406f4e8c35f107636ce4fe04d86df1003e9e88256ca8c8beb34695a3625b7', '859d66a204c431df294c95505bf9cda26b4cc286c9c04c0ae698d1ddf31e05be', 278),
(392, 2, 'DATOS_FISCALES_MODIFICADOS', 'Modificación de los datos fiscales del usuario 2', '2026-02-11T12:11:15.700Z', '0cf648c2181992538a4fa041579bb4c5c409c1146d5d0a6dd27c2bad68626f69', 'a89406f4e8c35f107636ce4fe04d86df1003e9e88256ca8c8beb34695a3625b7', 279),
(393, 2, 'DATOS_FISCALES_MODIFICADOS', 'Modificación de los datos fiscales del usuario 2', '2026-02-11T12:23:19.477Z', 'd514a7764ccc60692a0eace48f9b19b306149084105c9e8c98c4431be5ff9909', '0cf648c2181992538a4fa041579bb4c5c409c1146d5d0a6dd27c2bad68626f69', 280),
(394, 2, 'DATOS_FISCALES_MODIFICADOS', 'Modificación de los datos fiscales del usuario 2', '2026-02-11T12:29:37.324Z', '4cb17ae44a3c5d88702280ab1e4a5c56c613b2a0949d7db3a5d38d93cd5233af', 'd514a7764ccc60692a0eace48f9b19b306149084105c9e8c98c4431be5ff9909', 281),
(395, 2, 'DATOS_FISCALES_MODIFICADOS', 'Modificación de los datos fiscales del usuario 2', '2026-02-11T12:45:29.336Z', '983e02ead914a3f8c45d5e45e85abbdd0379be1db725cf0184700372328fb75c', '4cb17ae44a3c5d88702280ab1e4a5c56c613b2a0949d7db3a5d38d93cd5233af', 282),
(396, 2, 'DATOS_FISCALES_MODIFICADOS', 'Modificación de los datos fiscales del usuario 2', '2026-02-11T12:46:41.220Z', 'b636acb14bc250c5730424583ece0779e28f71926261759a1c398fa2bdf2e3f5', '983e02ead914a3f8c45d5e45e85abbdd0379be1db725cf0184700372328fb75c', 283),
(397, 4, 'LOGIN_OK', 'Inicio de sesión correcto de test@noveri.local', '2026-02-11T12:47:19.437Z', '87ccd200dce3c3d02db20b942623d4fff5d9c6bc57686689d25d9a81366cf1d3', 'a710fe196751f39abd3d60dea053c63c70533f767d962574a45522708928538e', 16),
(398, 4, 'INTENTO_ACTIVAR_2FA', 'Inicio del proceso de activación de 2FA', '2026-02-11T12:47:31.036Z', '158a3f271509c3d3d2c7b505cdf6c8e8a84a669f0ad971621ad07087ddad913c', '87ccd200dce3c3d02db20b942623d4fff5d9c6bc57686689d25d9a81366cf1d3', 17),
(399, 4, 'ACTIVAR_2FA', 'Autenticación en dos factores activada', '2026-02-11T12:47:53.450Z', '9f3aed3dae433da0c07cff2424d14193f8fa4bf14659ab4f3d2db8f8cbb947a8', '158a3f271509c3d3d2c7b505cdf6c8e8a84a669f0ad971621ad07087ddad913c', 18),
(400, 4, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-11T12:48:02.420Z', 'e2a55328be0efea4556698a978233e64fe1f0ea7b74bb5897036ff458c3c05bd', '9f3aed3dae433da0c07cff2424d14193f8fa4bf14659ab4f3d2db8f8cbb947a8', 19),
(401, 4, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-11T12:48:07.591Z', 'c06776b618e6e176ca5c9d13a2f1396487c14ab525b4e336ec2228a26de49aef', 'e2a55328be0efea4556698a978233e64fe1f0ea7b74bb5897036ff458c3c05bd', 20),
(402, 5, 'REGISTRO_USUARIO', 'Registro del usuario con email: pepi@gmail.com', '2026-02-11T13:08:04.641Z', 'a69e526d8bd3efe0752d35dd7a40e9319c0a045755c9a0aa94069430b57d7976', '0000000000000000000000000000000000000000000000000000000000000000', 1),
(403, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-11T13:36:59.858Z', '70e1d99267262a5b8355d00aff04d1d18936d22e1994ecd5868f20ac1d74af2f', 'b636acb14bc250c5730424583ece0779e28f71926261759a1c398fa2bdf2e3f5', 284),
(404, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-11T13:37:12.414Z', '5f1c53070edafa841588d2af9a0f5dbc9ff44a4f3688dc2d4e15a8beefeb1a51', '70e1d99267262a5b8355d00aff04d1d18936d22e1994ecd5868f20ac1d74af2f', 285),
(405, 2, 'DESCARGA_XML', 'Descarga XML (RECTIFICATIVA) factura 10-R1', '2026-02-11T13:44:02.508Z', '2f7cc1ccaeafbc1a5c5dea08aba54de979fb0b430028334bb7e820fe6de31f95', '5f1c53070edafa841588d2af9a0f5dbc9ff44a4f3688dc2d4e15a8beefeb1a51', 286),
(406, 2, 'DESCARGA_XML', 'Descarga XML (RECTIFICATIVA) factura 7-R3', '2026-02-11T13:44:09.149Z', 'ca18f7fa2e9fdaf012de2aca2f103aaa5a29c77aed2d253f36eadb2390cf66aa', '2f7cc1ccaeafbc1a5c5dea08aba54de979fb0b430028334bb7e820fe6de31f95', 287),
(407, 2, 'DESCARGA_XML', 'Descarga XML (RECTIFICATIVA) factura 16-R2', '2026-02-11T13:44:10.260Z', '62a51bc0479e6eece5495d12513d70f8b0256759d1a8b904fd0beb9802f539da', 'ca18f7fa2e9fdaf012de2aca2f103aaa5a29c77aed2d253f36eadb2390cf66aa', 288),
(408, 2, 'DESCARGA_XML', 'Descarga XML (ORDINARIA) factura 16', '2026-02-11T13:44:11.635Z', 'bd14b5aa378db74582cce12ec27f499f6c2b3b4eaf9d627abab6edc52a976208', '62a51bc0479e6eece5495d12513d70f8b0256759d1a8b904fd0beb9802f539da', 289),
(409, 2, 'DESCARGA_XML', 'Descarga XML (ORDINARIA) factura 15', '2026-02-11T13:44:12.441Z', '14f3cd12e29829cc2dd1dafed8728bc22320a1cf8c59ef8d5f5f295149c7083d', 'bd14b5aa378db74582cce12ec27f499f6c2b3b4eaf9d627abab6edc52a976208', 290),
(410, 2, 'DESCARGA_XML', 'Descarga XML (ORDINARIA) factura 14', '2026-02-11T13:44:13.313Z', 'aecc5aa9455e8c1e2bd234e47fe9d5ac9f037bf77a184212a675f0e1f7301660', '14f3cd12e29829cc2dd1dafed8728bc22320a1cf8c59ef8d5f5f295149c7083d', 291),
(411, 2, 'DESCARGA_XML', 'Descarga XML (ORDINARIA) factura 11', '2026-02-11T13:44:14.127Z', 'ba4f2bba16ce2f8b8c9e4d141d4678376a1f2bbcfceb10dd5f26c32bb846e78a', 'aecc5aa9455e8c1e2bd234e47fe9d5ac9f037bf77a184212a675f0e1f7301660', 292),
(412, 2, 'DESCARGA_XML', 'Descarga XML (ORDINARIA) factura 9', '2026-02-11T13:44:16.271Z', 'e697c4ad4d5be29bfde3064ec3f7db82861a941ad79ec60b8f18f3d8d9d2fe67', 'ba4f2bba16ce2f8b8c9e4d141d4678376a1f2bbcfceb10dd5f26c32bb846e78a', 293),
(413, 2, 'DESCARGA_XML', 'Descarga XML (ORDINARIA) factura 8', '2026-02-11T13:44:17.163Z', 'db4719c55c206267297ebbdfb0091f428a18a5f63bfe7d06f6089dbe8af7f588', 'e697c4ad4d5be29bfde3064ec3f7db82861a941ad79ec60b8f18f3d8d9d2fe67', 294),
(414, 2, 'DESCARGA_XML', 'Descarga XML (ORDINARIA) factura 6', '2026-02-11T13:44:21.683Z', '4a69b22c65601ad03b05421409a90a08d5948ca814ed21be10ed156f4cf1ff99', 'db4719c55c206267297ebbdfb0091f428a18a5f63bfe7d06f6089dbe8af7f588', 295),
(415, 2, 'DESCARGA_XML', 'Descarga XML (ORDINARIA) factura 5', '2026-02-11T13:44:22.375Z', 'd621ed3afaffcc3dcedd5183adde96741875eb8879651970dfb2e3e2189e7a42', '4a69b22c65601ad03b05421409a90a08d5948ca814ed21be10ed156f4cf1ff99', 296),
(416, 2, 'DESCARGA_XML', 'Descarga XML (ORDINARIA) factura 4', '2026-02-11T13:44:23.016Z', '5329bf74f5693002509b7cf80bd9d21610296ae6070e61a2b1cb30d4c9667d44', 'd621ed3afaffcc3dcedd5183adde96741875eb8879651970dfb2e3e2189e7a42', 297),
(417, 2, 'DESCARGA_XML', 'Descarga XML (ORDINARIA) factura 3', '2026-02-11T13:44:23.706Z', '71af39c63a19e598e252b94a23c22f34fce660599cd2ca7d323c38f2fae11d77', '5329bf74f5693002509b7cf80bd9d21610296ae6070e61a2b1cb30d4c9667d44', 298),
(418, 2, 'DESCARGA_XML', 'Descarga XML (ORDINARIA) factura 1', '2026-02-11T13:44:29.735Z', '0e02db0a965f0df8900cd104b5eb16297f9a67d34d9e61cc77aa2f0c3405bf9c', '71af39c63a19e598e252b94a23c22f34fce660599cd2ca7d323c38f2fae11d77', 299),
(419, 2, 'DESCARGA_XML', 'Descarga XML (ORDINARIA) factura 13', '2026-02-11T13:44:37.401Z', 'f0d6791e710dd9c0f9415eb48f30d43abd26d7c2bf71aa1c2255f88f3b7903fd', '0e02db0a965f0df8900cd104b5eb16297f9a67d34d9e61cc77aa2f0c3405bf9c', 300),
(420, 2, 'FACTURA_REGISTRADA', 'Factura 17 registrada', '2026-02-11T14:08:05.625Z', 'fb427781f89519e784e4dccaa29b09534fcdb8b3c5484c1b0ae31d05dede3f2a', 'f0d6791e710dd9c0f9415eb48f30d43abd26d7c2bf71aa1c2255f88f3b7903fd', 301),
(421, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 17', '2026-02-11T14:08:05.635Z', '50123c5a005d6089948e6f0ef059cda0b869b62f4bccfcd7eaffafa9776e27b2', 'fb427781f89519e784e4dccaa29b09534fcdb8b3c5484c1b0ae31d05dede3f2a', 302),
(422, 2, 'DESCARGA_XML', 'Descarga XML (ORDINARIA) factura 17', '2026-02-11T14:08:12.482Z', 'ebaf6a3323d3d0bc523834f0422779673a119b7b3e255d1406a15cf2da3cb2e0', '50123c5a005d6089948e6f0ef059cda0b869b62f4bccfcd7eaffafa9776e27b2', 303),
(423, 2, 'FACTURA_RECTIFICADA', 'Factura 15-R1 rectificada', '2026-02-11T14:09:21.344Z', '3d9b3d08cc5e51126115bec9daaba248d44b0ac162e37478ebb3ef3fcb35f0f0', 'ebaf6a3323d3d0bc523834f0422779673a119b7b3e255d1406a15cf2da3cb2e0', 304),
(424, 2, 'DESCARGA_XML', 'Descarga XML (RECTIFICATIVA) factura 15-R1', '2026-02-11T14:09:25.335Z', '3bf039c4bc52c104d1238f438826f7a987a4d5a97e5afe415892a6efb8233b0e', '3d9b3d08cc5e51126115bec9daaba248d44b0ac162e37478ebb3ef3fcb35f0f0', 305),
(425, 2, 'DESCARGA_XML', 'Descarga XML (ORDINARIA) factura 3', '2026-02-11T14:09:57.560Z', 'fc5cb9e6f73e66f3be3b313e6c4b186a9eac73a8121c7705b1105b9d4e5c9123', '3bf039c4bc52c104d1238f438826f7a987a4d5a97e5afe415892a6efb8233b0e', 306),
(426, 2, 'FACTURA_REGISTRADA', 'Factura 18 registrada', '2026-02-11T14:10:19.754Z', '0d97bdc46b5bb35592a9ae3052ecd961a2941223538e4ca87b6ec02562d0d7fc', 'fc5cb9e6f73e66f3be3b313e6c4b186a9eac73a8121c7705b1105b9d4e5c9123', 307),
(427, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 18', '2026-02-11T14:10:19.766Z', 'b7359c09cced4fa588d43894144d65427cbe1b216c99db5e79648ede8319d472', '0d97bdc46b5bb35592a9ae3052ecd961a2941223538e4ca87b6ec02562d0d7fc', 308),
(428, 2, 'DESCARGA_XML', 'Descarga XML (ORDINARIA) factura 18', '2026-02-11T14:10:23.076Z', '5cd2580419d2c5b487ecbd004ee2651f631dfc5944ad900522e19e7b44e749cb', 'b7359c09cced4fa588d43894144d65427cbe1b216c99db5e79648ede8319d472', 309),
(429, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-12T08:51:45.672Z', '67ed714f163af5aaa03de4d01a8d881ebecc170329b7e52e9e5383aab90c6fec', '5cd2580419d2c5b487ecbd004ee2651f631dfc5944ad900522e19e7b44e749cb', 310),
(430, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-12T08:51:57.318Z', '14d6fbadbfc7d3c489b0159a6278a30811050b23bc514208a9aacb409b9c1bd4', '67ed714f163af5aaa03de4d01a8d881ebecc170329b7e52e9e5383aab90c6fec', 311),
(431, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 18', '2026-02-12T09:15:46.380Z', 'a32d51d9c499215c257cd059e8bbabf2585e2df6add738689cfb2c5ea0bb2b4a', '14d6fbadbfc7d3c489b0159a6278a30811050b23bc514208a9aacb409b9c1bd4', 312),
(432, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-18T07:55:06.806Z', '4fd1eb811a4b2f2b604e43be86eb637cbe1046bccff8b333eb33065e2be9c7ad', 'a32d51d9c499215c257cd059e8bbabf2585e2df6add738689cfb2c5ea0bb2b4a', 313),
(433, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-18T07:55:16.498Z', '6ffd0ce5763df7eb3a58431c9b5edeb4e83146eab0c4475b4922b525e94e7c71', '4fd1eb811a4b2f2b604e43be86eb637cbe1046bccff8b333eb33065e2be9c7ad', 314),
(434, 2, 'FACTURA_REGISTRADA', 'Factura 19 registrada', '2026-02-18T14:33:05.520Z', 'ee5002ebca38ecf6f7d324caeed8948ad4236c0d507ee1c3f5a9967b554c9a47', '6ffd0ce5763df7eb3a58431c9b5edeb4e83146eab0c4475b4922b525e94e7c71', 315),
(435, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 19', '2026-02-18T14:33:05.533Z', 'c6f60f43626dce36fa19dbddbe08636d13bb1a3329e7d99ec9d801b95ab2c8bd', 'ee5002ebca38ecf6f7d324caeed8948ad4236c0d507ee1c3f5a9967b554c9a47', 316),
(436, 2, 'FACTURA_REGISTRADA', 'Factura 20 registrada', '2026-02-18T15:17:49.813Z', 'eca83d9533f640e185bebda6244580f6a4947fdb4735061f7304d6bca9136cc2', 'c6f60f43626dce36fa19dbddbe08636d13bb1a3329e7d99ec9d801b95ab2c8bd', 317),
(437, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 20', '2026-02-18T15:17:49.823Z', '14a8442512fb516f0558538a670982fc4e046d35f83dc98482cb0104ed19ed3d', 'eca83d9533f640e185bebda6244580f6a4947fdb4735061f7304d6bca9136cc2', 318),
(438, 2, 'FACTURA_REGISTRADA', 'Factura 21 registrada', '2026-02-18T15:21:42.373Z', 'daa3ecfe40f0a464f79a24b66ba617f7f60e3a45fbd76bbf7934e7d83bad8040', '14a8442512fb516f0558538a670982fc4e046d35f83dc98482cb0104ed19ed3d', 319),
(439, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 21', '2026-02-18T15:21:42.383Z', '4d7ca66856af0919837c4d684b95d8eb9a55d23a0a6e85d159fcb658a5882d6f', 'daa3ecfe40f0a464f79a24b66ba617f7f60e3a45fbd76bbf7934e7d83bad8040', 320),
(440, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-19T07:52:27.051Z', '000414cbf29c2b1b2aae728d8c00343f275ef672467065062ba10dd1c46f2721', '4d7ca66856af0919837c4d684b95d8eb9a55d23a0a6e85d159fcb658a5882d6f', 321),
(441, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-19T07:52:37.585Z', 'd045fba65449f3952c03c8dde617214daf97c1151390b009f68bc294f93b36cf', '000414cbf29c2b1b2aae728d8c00343f275ef672467065062ba10dd1c46f2721', 322),
(442, 2, 'FACTURA_ANULADA', 'Factura 19 anulada', '2026-02-19T07:53:07.157Z', '8c85e0b5105dfe47105b281bbf32229145e8306a48afc8048110995c1459c31a', 'd045fba65449f3952c03c8dde617214daf97c1151390b009f68bc294f93b36cf', 323),
(443, 2, 'FACTURA_REGISTRADA', 'Factura 22 registrada', '2026-02-19T07:56:53.991Z', '10789c71b6046c76ec1b9a451cbfcef8f782e2b3cdd8733664d5321cd20b797f', '8c85e0b5105dfe47105b281bbf32229145e8306a48afc8048110995c1459c31a', 324),
(444, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 22', '2026-02-19T07:56:54.000Z', '974c3c9a9696df4d2a1d562559d367071d1373b20393487fe49bb149a21b61c3', '10789c71b6046c76ec1b9a451cbfcef8f782e2b3cdd8733664d5321cd20b797f', 325),
(445, 2, 'FACTURA_RECTIFICADA', 'Factura 22-R1 rectificada', '2026-02-19T07:57:31.208Z', 'fdaac1abe7bc68e79751dc10f89b897b40b113cf67317f6020af8f4fbc80e98b', '974c3c9a9696df4d2a1d562559d367071d1373b20393487fe49bb149a21b61c3', 326),
(446, 2, 'DESCARGA_XML', 'Descarga XML (RECTIFICATIVA) factura 22-R1', '2026-02-19T07:57:35.552Z', '1bbd219cefc34666cf6ade28ed25f4d14b6201a710b3b1bf17ed6bf92f7632f4', 'fdaac1abe7bc68e79751dc10f89b897b40b113cf67317f6020af8f4fbc80e98b', 327),
(447, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 22-R1', '2026-02-19T07:57:45.881Z', 'a588bc9bd0ba4c9257f2e6854cbc912e79a5361365fecb5667dba8d9f8c521ac', '1bbd219cefc34666cf6ade28ed25f4d14b6201a710b3b1bf17ed6bf92f7632f4', 328),
(448, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 22', '2026-02-19T07:59:36.702Z', '8b528090d14a92133d463b31934c7589d063331127119896194dcf89f11cca18', 'a588bc9bd0ba4c9257f2e6854cbc912e79a5361365fecb5667dba8d9f8c521ac', 329),
(449, 2, 'FACTURA_ANULADA', 'Factura 22-R1 anulada', '2026-02-19T08:10:58.334Z', 'e1b3d5d7e6ad0459bc67f035beaf44b01e8faeb510a4fcdfd9514e43747b3d77', '8b528090d14a92133d463b31934c7589d063331127119896194dcf89f11cca18', 330),
(450, 2, 'FACTURA_RECTIFICADA', 'Factura 22-R2 rectificada', '2026-02-19T08:11:12.207Z', '7a6485d49afdb3316e36a0cec9070a1e7fe5e463bbd974af4ecb5c553f37fee6', 'e1b3d5d7e6ad0459bc67f035beaf44b01e8faeb510a4fcdfd9514e43747b3d77', 331),
(451, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 22-R2', '2026-02-19T08:11:15.932Z', '7276161f764fbfd25030aeb3963745d33d149f19c774009d040e7a33062bdbd2', '7a6485d49afdb3316e36a0cec9070a1e7fe5e463bbd974af4ecb5c553f37fee6', 332),
(452, 2, 'DESCARGA_XML', 'Descarga XML (RECTIFICATIVA) factura 22-R2', '2026-02-19T08:14:04.132Z', 'f0a88620718077fafb6e0bac26682e9e55e03b056d41cdb7f83e078bb876f1ce', '7276161f764fbfd25030aeb3963745d33d149f19c774009d040e7a33062bdbd2', 333),
(453, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 22-R1', '2026-02-19T09:03:12.558Z', 'bc82247ed9dbcb8c6968d47d16522c214c7c832a5d684d06db2c0b177bba77be', 'f0a88620718077fafb6e0bac26682e9e55e03b056d41cdb7f83e078bb876f1ce', 334),
(454, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-20T13:43:30.499Z', 'c3c45a593b871f0527d038717649d7ffb50e18e4ef44baa90a7c810f8c64dc66', 'bc82247ed9dbcb8c6968d47d16522c214c7c832a5d684d06db2c0b177bba77be', 335),
(455, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-20T13:43:45.209Z', '5dd589146b29ed54abe30ef7a75c0df10846daa038eaca116dc5b03ec3335515', 'c3c45a593b871f0527d038717649d7ffb50e18e4ef44baa90a7c810f8c64dc66', 336),
(456, 2, 'ADMIN_VERIFICACION_GLOBAL', 'Verificación global de integridad ejecutada', '2026-02-20T14:43:11.813Z', 'c3581db30c943ee34d12343662d0f52d6d2bcd72cced0c028c7a21fde269f479', '5dd589146b29ed54abe30ef7a75c0df10846daa038eaca116dc5b03ec3335515', 337),
(457, 3, 'INICIO_NUEVA_CADENA_EVENTOS', 'Inicio de nueva etapa por corrección estructural del sistema', '2026-02-20T14:43:52.548Z', '224c101b9b45a2f36806c38a589d62f1482ccacc29abef9ad7ecc4b6e9d068a6', '0000000000000000000000000000000000000000000000000000000000000000', 2),
(458, 2, 'ADMIN_RESET_CADENA_EVENTOS', 'El admin 2 reinició la cadena de eventos del usuario 3', '2026-02-20T14:43:52.562Z', 'd06e8f689591dbd1c1077df13666bba2c22a68d9849b662f2d111d94bce18069', 'c3581db30c943ee34d12343662d0f52d6d2bcd72cced0c028c7a21fde269f479', 338),
(459, 4, 'INICIO_NUEVA_CADENA_EVENTOS', 'Inicio de nueva etapa por corrección estructural del sistema', '2026-02-20T14:44:03.227Z', '233c7a4bd80e49a5bc3232e8c6a9b0d246444c545d8805bcf3a6f315622a8336', '0000000000000000000000000000000000000000000000000000000000000000', 21),
(460, 2, 'ADMIN_RESET_CADENA_EVENTOS', 'El admin 2 reinició la cadena de eventos del usuario 4', '2026-02-20T14:44:03.243Z', '1023c347e95a48136f4c1be6c03ff28bf2163da1e7bb096d5f21369f317db9c9', 'd06e8f689591dbd1c1077df13666bba2c22a68d9849b662f2d111d94bce18069', 339),
(461, 5, 'INICIO_NUEVA_CADENA_EVENTOS', 'Inicio de nueva etapa por corrección estructural del sistema', '2026-02-20T14:44:10.793Z', '021774249f38dc50d7a4d6f0542b9ff32a347b2fc7d6865a2babc188b93d3a8c', '0000000000000000000000000000000000000000000000000000000000000000', 2),
(462, 2, 'ADMIN_RESET_CADENA_EVENTOS', 'El admin 2 reinició la cadena de eventos del usuario 5', '2026-02-20T14:44:10.808Z', '8d88d7d76c58bc7f65fca65f5c083217f3abb7fe5ce4d9091ba1aac3af838ab9', '1023c347e95a48136f4c1be6c03ff28bf2163da1e7bb096d5f21369f317db9c9', 340),
(463, 2, 'BACKUP_RESTAURADO', 'Sistema restaurado desde backup 2026-02-20-14-58', '2026-02-23T10:32:35.162Z', 'a55d60c71b3563303970bebabd20c31e4e144d220c910e02e9128fae1c74dc0c', '8d88d7d76c58bc7f65fca65f5c083217f3abb7fe5ce4d9091ba1aac3af838ab9', 341),
(464, 2, 'VERIFICACION_INTEGRIDAD_POST_RESTORE', 'Integridad verificada con éxito', '2026-02-23T10:32:35.236Z', 'a45768c2bab73643ec6fdbd408265e6a7efd3b4521a229faf734b767e5c8a1dd', 'a55d60c71b3563303970bebabd20c31e4e144d220c910e02e9128fae1c74dc0c', 342),
(465, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-23T11:07:51.617Z', '20c836c67cf142d8f29c44e040b36fdbcf90a8fcf6532f91e5e612071c950ce8', 'a45768c2bab73643ec6fdbd408265e6a7efd3b4521a229faf734b767e5c8a1dd', 343),
(466, 2, 'LOGIN_2FA_FALLIDO', 'Código 2FA incorrecto', '2026-02-23T11:08:05.756Z', 'bd47356b541f7135379a2d4210ce3c5296998a250db7da253feed091f1f08554', '20c836c67cf142d8f29c44e040b36fdbcf90a8fcf6532f91e5e612071c950ce8', 344),
(467, 2, 'LOGIN_2FA_FALLIDO', 'Código 2FA incorrecto', '2026-02-23T11:08:08.660Z', '03aee78d5304354e9ebe1e4f3f696cec7a1e12ad365a2b4da8075d57de9adf26', 'bd47356b541f7135379a2d4210ce3c5296998a250db7da253feed091f1f08554', 345),
(468, 2, 'LOGIN_2FA_FALLIDO', 'Código 2FA incorrecto', '2026-02-23T11:08:14.428Z', '73e3b38752495fd5a632270b675f642c589aa0f8c11333acdcd33cbdf6a81be7', '03aee78d5304354e9ebe1e4f3f696cec7a1e12ad365a2b4da8075d57de9adf26', 346),
(469, 2, 'LOGIN_OK', 'Inicio de sesión correcto de rebecamm2495@gmail.com', '2026-02-23T11:09:09.791Z', '71344682344adbe8f60367c984f88c89c34946f5828a6c28c5799d6f399630ba', '73e3b38752495fd5a632270b675f642c589aa0f8c11333acdcd33cbdf6a81be7', 347),
(470, 2, 'FACTURA_REGISTRADA', 'Factura 1 registrada', '2026-02-23T11:14:30.005Z', '7c4452abbe364b8c366a04cd524c2490abb4cfc9112550e7cb1496fcc826c37a', '71344682344adbe8f60367c984f88c89c34946f5828a6c28c5799d6f399630ba', 348),
(471, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 1', '2026-02-23T11:14:30.039Z', '57d95f15df041898206417554424e0a89d27c3d34e8805b17187c129fba4a229', '7c4452abbe364b8c366a04cd524c2490abb4cfc9112550e7cb1496fcc826c37a', 349),
(472, 2, 'FACTURA_RECTIFICADA', 'Factura 1-R1 rectificada', '2026-02-23T11:16:24.062Z', '6d910e38a4fd68582c5bf8207702767c29e74284821d1afda684921ea691c8f2', '57d95f15df041898206417554424e0a89d27c3d34e8805b17187c129fba4a229', 350),
(473, 2, 'ADMIN_VERIFICACION_GLOBAL', 'Verificación global de integridad ejecutada', '2026-02-23T11:20:39.765Z', '5cdccbf472042f4eb2c458ed43707f34d46c2aaa104b55dc967601619d70199d', '6d910e38a4fd68582c5bf8207702767c29e74284821d1afda684921ea691c8f2', 351),
(474, 2, 'FACTURA_REGISTRADA', 'Factura 2 registrada', '2026-02-23T12:09:42.439Z', '8d408cb8c5c0873df1ee231321f85f8b61baa384c2733afe0c4554d04e968f4a', '5cdccbf472042f4eb2c458ed43707f34d46c2aaa104b55dc967601619d70199d', 352),
(475, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 2', '2026-02-23T12:09:42.451Z', '5eb7fe3eb88b327786d412c411e7d983765c496b11c1ce2b574611d299ec5ecb', '8d408cb8c5c0873df1ee231321f85f8b61baa384c2733afe0c4554d04e968f4a', 353),
(476, 2, 'LOGIN_OK', 'Inicio de sesión correcto de rebecamm2495@gmail.com', '2026-02-24T13:53:45.628Z', 'd7e699bfa09123883f30ac62aa279b5127d484cef140c576d34446e5812230a9', '5eb7fe3eb88b327786d412c411e7d983765c496b11c1ce2b574611d299ec5ecb', 354),
(477, 2, 'LOGIN_OK', 'Inicio de sesión correcto de rebecamm2495@gmail.com', '2026-02-24T13:58:42.018Z', '1a7559e3c45e822bceceec6d617585d12f41c60573a9706b45df35d93fee8258', 'd7e699bfa09123883f30ac62aa279b5127d484cef140c576d34446e5812230a9', 355),
(478, 2, 'INTENTO_ACTIVAR_2FA', 'Inicio del proceso de activación de 2FA', '2026-02-24T14:01:35.552Z', 'a879e9284d310dca6a880896089a9ef70189d3fd32b33a7249e21d793944ebcb', '1a7559e3c45e822bceceec6d617585d12f41c60573a9706b45df35d93fee8258', 356),
(479, 2, 'ACTIVAR_2FA', 'Autenticación en dos factores activada', '2026-02-24T14:01:58.131Z', '844e443f9b1d71518a68d68b876e7b3bdb06a717d68b98c6c9e3c99ea2df3d6e', 'a879e9284d310dca6a880896089a9ef70189d3fd32b33a7249e21d793944ebcb', 357),
(480, 2, 'FACTURA_RECTIFICADA', 'Factura 2-R1 rectificada', '2026-02-24T14:20:56.493Z', 'a4a2199b0086b88442d8041ef3a0795d6e74f4081695025886c64cb5a69051e7', '844e443f9b1d71518a68d68b876e7b3bdb06a717d68b98c6c9e3c99ea2df3d6e', 358),
(481, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 2-R1', '2026-02-24T14:21:00.847Z', '36e5bee3b21781e7cf20e9ad4636ff12a81d07b1261957368971d85056b52c88', 'a4a2199b0086b88442d8041ef3a0795d6e74f4081695025886c64cb5a69051e7', 359),
(482, 2, 'FACTURA_REGISTRADA', 'Factura 3 registrada', '2026-02-24T14:22:01.693Z', '761579a0f2be8e391ea08cf38c7a8576ff5a4f3f7c07f90078db918abf506fb3', '36e5bee3b21781e7cf20e9ad4636ff12a81d07b1261957368971d85056b52c88', 360),
(483, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 3', '2026-02-24T14:22:01.711Z', 'b05303f05747d09cab22981391609805e07ef1b2ce8c351d51ff8db92193f93e', '761579a0f2be8e391ea08cf38c7a8576ff5a4f3f7c07f90078db918abf506fb3', 361),
(484, 2, 'FACTURA_RECTIFICADA', 'Factura 3-R1 rectificada', '2026-02-24T14:22:37.613Z', 'c66fd4dabd377c21268dc861f584a04072754b0ec3f06b3d2ecd4615bec5ea63', 'b05303f05747d09cab22981391609805e07ef1b2ce8c351d51ff8db92193f93e', 362),
(485, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 3-R1', '2026-02-24T14:22:41.162Z', '1a044021fb523185aa34e0089bff41a55cf2f78a691561ffdc399a8e4bd08b5b', 'c66fd4dabd377c21268dc861f584a04072754b0ec3f06b3d2ecd4615bec5ea63', 363),
(486, 2, 'FACTURA_ANULADA', 'Factura 3-R1 anulada', '2026-02-24T14:58:36.678Z', '9296b3a22ad5a615c2b80a082c0719b271675278b331c71d5760a053bada2372', '1a044021fb523185aa34e0089bff41a55cf2f78a691561ffdc399a8e4bd08b5b', 364),
(487, 2, 'FACTURA_RECTIFICADA', 'Factura 3-R2 rectificada', '2026-02-24T15:03:52.042Z', 'b8c86856d457f54ca5db3ec8becf8e2c43b683ed0d46a5c25a555c24c63e55f9', '9296b3a22ad5a615c2b80a082c0719b271675278b331c71d5760a053bada2372', 365),
(488, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 3-R2', '2026-02-24T15:03:55.080Z', '5628a4df85e5c8e775d49207b218e274ce8a9ca3489b31e5ec6990fb824f7151', 'b8c86856d457f54ca5db3ec8becf8e2c43b683ed0d46a5c25a555c24c63e55f9', 366),
(489, 2, 'FACTURA_ANULADA', 'Factura 3-R2 anulada', '2026-02-24T15:04:30.619Z', 'd18257ac1379b64d1d2e209501decdbf1cf3379ec0cca71dd55f807b5b16ac80', '5628a4df85e5c8e775d49207b218e274ce8a9ca3489b31e5ec6990fb824f7151', 367),
(490, 2, 'FACTURA_RECTIFICADA', 'Factura 3-R3 rectificada', '2026-02-24T15:20:12.877Z', 'ff308a5138dbd47fdd03600a9254819e4a172c5f839ed7306088456f38fcfd1e', 'd18257ac1379b64d1d2e209501decdbf1cf3379ec0cca71dd55f807b5b16ac80', 368),
(491, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 3-R3', '2026-02-24T15:20:16.527Z', '65eae7b2f50989361ec7efbe0ff9a37271e6bee4b6579ee02aea88ca5440c3c2', 'ff308a5138dbd47fdd03600a9254819e4a172c5f839ed7306088456f38fcfd1e', 369),
(492, 2, 'FACTURA_ANULADA', 'Factura 3-R3 anulada', '2026-02-24T15:20:33.399Z', '5a23b4b650f13ea33bad1fca1753ee162812ee1204aa73a63446f8b48a7fab67', '65eae7b2f50989361ec7efbe0ff9a37271e6bee4b6579ee02aea88ca5440c3c2', 370),
(493, 2, 'FACTURA_RECTIFICADA', 'Factura 3-R4 rectificada', '2026-02-24T15:23:05.063Z', 'f6c0787ffe1caa271404ec6d28b981b2e2600cf281efd4025bd9f76efb0b961d', '5a23b4b650f13ea33bad1fca1753ee162812ee1204aa73a63446f8b48a7fab67', 371),
(494, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 3-R4', '2026-02-24T15:23:07.838Z', 'a1eea6584ba09b1fe6c484f438d99a4d38398cfdccaaa24b290971ec7b84dde2', 'f6c0787ffe1caa271404ec6d28b981b2e2600cf281efd4025bd9f76efb0b961d', 372),
(495, 2, 'FACTURA_REGISTRADA', 'Factura 4 registrada', '2026-02-24T15:24:14.669Z', '904796a6ed5b76393cd5ccf97107b79618ffdabcc632092b2f7e4effcc6de985', 'a1eea6584ba09b1fe6c484f438d99a4d38398cfdccaaa24b290971ec7b84dde2', 373),
(496, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 4', '2026-02-24T15:24:14.689Z', 'f333b652554bce6335e7ed14edf40eb524e531bbe034ef279612aa233b43c4c0', '904796a6ed5b76393cd5ccf97107b79618ffdabcc632092b2f7e4effcc6de985', 374),
(497, 2, 'FACTURA_RECTIFICADA', 'Factura 4-R1 rectificada', '2026-02-24T15:24:41.679Z', '34c768f89926eb9fdbf46a434a6d7a5e3e7f36fba181c8c667e6eed0dbd65b98', 'f333b652554bce6335e7ed14edf40eb524e531bbe034ef279612aa233b43c4c0', 375),
(498, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 4-R1', '2026-02-24T15:24:44.509Z', 'cec6ebabf1d21a0b12ee705d451e56d28455401c3d433f93005b6dcbf0e4e8a3', '34c768f89926eb9fdbf46a434a6d7a5e3e7f36fba181c8c667e6eed0dbd65b98', 376),
(499, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-25T08:25:51.074Z', '32031fe95ac16344fe8efb08477bf061c615e44589d98f8edfabe8e72132492d', 'cec6ebabf1d21a0b12ee705d451e56d28455401c3d433f93005b6dcbf0e4e8a3', 377),
(500, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-25T08:26:02.011Z', 'c33b31da23d93f03610c761eaf5fee1cf694f16a5638d126a07b137735f861de', '32031fe95ac16344fe8efb08477bf061c615e44589d98f8edfabe8e72132492d', 378),
(501, 2, 'CAMBIO_PASSWORD', 'El usuario cambió su contraseña', '2026-02-25T08:33:52.211Z', '6cc4dd0368a363ddb5b7cddf3aaa74ffc02d2042e46b535417eab82c71356346', 'c33b31da23d93f03610c761eaf5fee1cf694f16a5638d126a07b137735f861de', 379),
(502, 4, 'SOLICITUD_RESET_PASSWORD', 'Solicitud de recuperación para test@noveri.local', '2026-02-25T09:29:28.462Z', '28dab0849a86d2597342dffe313170253cc164895d5b54589e0479b375a15f28', '233c7a4bd80e49a5bc3232e8c6a9b0d246444c545d8805bcf3a6f315622a8336', 22),
(503, 4, 'RESET_PASSWORD_OK', 'Contraseña restablecida correctamente', '2026-02-25T09:29:51.900Z', '326c642bc44c3169e7fdeb0dfc9292a44fc621d39b473e05c893d60afc82f3bb', '28dab0849a86d2597342dffe313170253cc164895d5b54589e0479b375a15f28', 23),
(504, 4, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-25T09:30:05.271Z', 'aa25958ce399487735fc1f2f67ad49569b993c32de03802f7aca11ecdf204534', '326c642bc44c3169e7fdeb0dfc9292a44fc621d39b473e05c893d60afc82f3bb', 24),
(505, 4, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-25T09:30:31.638Z', '4dd1d198a354d19a3d244838de334432f7a32e1199091f5158c581e70de8087a', 'aa25958ce399487735fc1f2f67ad49569b993c32de03802f7aca11ecdf204534', 25),
(506, 4, 'FACTURA_REGISTRADA', 'Factura 1 registrada', '2026-02-25T11:33:13.616Z', '3e0395e95249f69f931eced6998bbe0e37c288806fb409c33755ea2d3bad4964', '4dd1d198a354d19a3d244838de334432f7a32e1199091f5158c581e70de8087a', 26),
(507, 4, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 1', '2026-02-25T11:33:13.626Z', 'ff37772ac494bf541c7e19e01933610ef892b365288355c1022c36a0d1ddb7ab', '3e0395e95249f69f931eced6998bbe0e37c288806fb409c33755ea2d3bad4964', 27),
(508, 4, 'FACTURA_REGISTRADA', 'Factura 2 registrada', '2026-02-25T15:21:18.464Z', '0d72af51a892da7ae4bbc1d6e9e3f3b059f00994ba1a473a55e3fa1dc583a7b3', 'ff37772ac494bf541c7e19e01933610ef892b365288355c1022c36a0d1ddb7ab', 28),
(509, 4, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 2', '2026-02-25T15:21:18.475Z', '6868fa598984d710f58b8737ad5f0e8eb94a96a58972f4427c9843cfe864db61', '0d72af51a892da7ae4bbc1d6e9e3f3b059f00994ba1a473a55e3fa1dc583a7b3', 29),
(510, 4, 'FACTURA_RECTIFICADA', 'Factura 1-R1 rectificada', '2026-02-25T15:24:22.282Z', 'e07d92a72ee2d74deeaca1ae65fe13226ceb71de3d0d630bcece9c0799667f6e', '6868fa598984d710f58b8737ad5f0e8eb94a96a58972f4427c9843cfe864db61', 30),
(511, 2, 'LOGIN_FALLIDO', 'Intento de inicio de sesión fallido para rebecamm2495@gmail.com', '2026-02-26T08:07:47.428Z', '817ed5b16db7f14e11dcb39be86f705d286e2c4b57abc0121bfef39120d95bd0', '6cc4dd0368a363ddb5b7cddf3aaa74ffc02d2042e46b535417eab82c71356346', 380),
(512, 2, 'LOGIN_FALLIDO', 'Intento de inicio de sesión fallido para rebecamm2495@gmail.com', '2026-02-26T08:07:56.959Z', '48164c518a48f302e0c49f81f8f3aeb9a397626d6866bd8ba3068c1193657150', '817ed5b16db7f14e11dcb39be86f705d286e2c4b57abc0121bfef39120d95bd0', 381),
(513, 2, 'SOLICITUD_RESET_PASSWORD', 'Solicitud de recuperación para rebecamm2495@gmail.com', '2026-02-26T08:08:05.650Z', 'eb13931fe7f0870921db54e63e7bf16d6538e8f3452a2050b20e375d38c0007e', '48164c518a48f302e0c49f81f8f3aeb9a397626d6866bd8ba3068c1193657150', 382),
(514, 2, 'RESET_PASSWORD_OK', 'Contraseña restablecida correctamente', '2026-02-26T08:11:02.977Z', 'acbcfd5aca3cfd5d9a0f005995f22ec21409af7d8730d99218c33537d8c54eb1', 'eb13931fe7f0870921db54e63e7bf16d6538e8f3452a2050b20e375d38c0007e', 383),
(515, 2, 'LOGIN_FALLIDO', 'Intento de inicio de sesión fallido para rebecamm2495@gmail.com', '2026-02-26T08:12:09.538Z', '8eb55723d27643a6d9bd18be3309f6142d08cda258c1ccb000c6cbd2bd2bed6e', 'acbcfd5aca3cfd5d9a0f005995f22ec21409af7d8730d99218c33537d8c54eb1', 384),
(516, 2, 'LOGIN_FALLIDO', 'Intento de inicio de sesión fallido para rebecamm2495@gmail.com', '2026-02-26T08:12:22.525Z', '2fde92c45ff2dac5f1075dfec0e2ceb42e2deb1b1cbb8ee8aefaeda8bec3a6d3', '8eb55723d27643a6d9bd18be3309f6142d08cda258c1ccb000c6cbd2bd2bed6e', 385),
(517, 2, 'SOLICITUD_RESET_PASSWORD', 'Solicitud de recuperación para rebecamm2495@gmail.com', '2026-02-26T08:12:33.593Z', 'e104ac6805bfffb35f0af58f51a73ac696e1c8647db2c396bfb0346526098415', '2fde92c45ff2dac5f1075dfec0e2ceb42e2deb1b1cbb8ee8aefaeda8bec3a6d3', 386);
INSERT INTO `log_eventos` (`id`, `usuario_id`, `tipo_evento`, `descripcion`, `fecha_evento`, `hash_evento`, `hash_evento_anterior`, `num_evento`) VALUES
(518, 2, 'RESET_PASSWORD_OK', 'Contraseña restablecida correctamente', '2026-02-26T08:12:48.795Z', 'ea73c922d98a03c91eb58fcbd521c6163009efef090f2d2a5af3c197c1ff15b9', 'e104ac6805bfffb35f0af58f51a73ac696e1c8647db2c396bfb0346526098415', 387),
(519, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-26T08:13:02.547Z', 'c929b70e30107f8c15191981636653a3fdeb1a88f317d5a7ee78c8aad2c841db', 'ea73c922d98a03c91eb58fcbd521c6163009efef090f2d2a5af3c197c1ff15b9', 388),
(520, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-26T08:13:12.376Z', 'b4e0209a54e23620791b1b0fc2d2b0ae03384934ef6469d37556b3342adfd74b', 'c929b70e30107f8c15191981636653a3fdeb1a88f317d5a7ee78c8aad2c841db', 389),
(521, 2, 'SOLICITUD_RESET_PASSWORD', 'Solicitud de recuperación para rebecamm2495@gmail.com', '2026-02-26T09:42:21.161Z', '1c997dee6517aeef59f56ce19c6e8b7d685be6ba94917fe715ca42d04bb80eab', 'b4e0209a54e23620791b1b0fc2d2b0ae03384934ef6469d37556b3342adfd74b', 390),
(522, 2, 'RESET_PASSWORD_OK', 'Contraseña restablecida correctamente', '2026-02-26T09:42:44.407Z', '1c468c7e02e722239223beae89632e190d2fa70afb1f86bc7b82cbce43c908ff', '1c997dee6517aeef59f56ce19c6e8b7d685be6ba94917fe715ca42d04bb80eab', 391),
(523, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-26T09:43:14.249Z', 'ca859308655000ccb86db46c038da5187a57b1100e18575a1e8e3648ee657d5b', '1c468c7e02e722239223beae89632e190d2fa70afb1f86bc7b82cbce43c908ff', 392),
(524, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-26T09:43:25.684Z', '61ce7866dfc42e61aeedc1477fa81af26917fd672030127d82cdd19f59fe29b2', 'ca859308655000ccb86db46c038da5187a57b1100e18575a1e8e3648ee657d5b', 393),
(525, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-26T09:44:30.936Z', '0a3d35775341e46214ad434dca79cd900e5c422753187a23c2293d59b45f92ef', '61ce7866dfc42e61aeedc1477fa81af26917fd672030127d82cdd19f59fe29b2', 394),
(526, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-26T09:44:37.624Z', '3f7b3ef870be8e824dd125fe6a38387229cd63966a895f86102b765a3090d0be', '0a3d35775341e46214ad434dca79cd900e5c422753187a23c2293d59b45f92ef', 395),
(527, 4, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-26T10:00:08.805Z', 'f89b8e2c0a4459d94f224b1355e40741bee8363292fa3efd4c93f45ad9587453', 'e07d92a72ee2d74deeaca1ae65fe13226ceb71de3d0d630bcece9c0799667f6e', 31),
(528, 4, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-26T10:00:21.218Z', 'f489c0063135e01009a359aa042b639d78b41d1e988904f50e9fa6164f2bf037', 'f89b8e2c0a4459d94f224b1355e40741bee8363292fa3efd4c93f45ad9587453', 32),
(529, 4, 'FACTURA_RECTIFICADA', 'Factura 2-R1 rectificada', '2026-02-26T10:01:21.494Z', '1208d26491c47a432c71b8ba0980a4e5200566bd0ec6ff1ec4fc7919e2d9a5e7', 'f489c0063135e01009a359aa042b639d78b41d1e988904f50e9fa6164f2bf037', 33),
(530, 4, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 2-R1', '2026-02-26T10:01:25.571Z', 'b6213cf1ec1a613c36eb8bb72f48d1101418cc84c04ab18888f3bfdfab1d94f7', '1208d26491c47a432c71b8ba0980a4e5200566bd0ec6ff1ec4fc7919e2d9a5e7', 34),
(531, 4, 'FACTURA_REGISTRADA', 'Factura 3 registrada', '2026-02-26T10:17:36.033Z', '54bcdfab26575322c73515e1fb08652203d96c58dc0aa78db64310e9c95cc7e8', 'b6213cf1ec1a613c36eb8bb72f48d1101418cc84c04ab18888f3bfdfab1d94f7', 35),
(532, 4, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 3', '2026-02-26T10:17:36.043Z', '9d89aff5076962c6cd233506347f56b900c2d087a40b5f69707d7fc6bcab8206', '54bcdfab26575322c73515e1fb08652203d96c58dc0aa78db64310e9c95cc7e8', 36),
(533, 4, 'FACTURA_RECTIFICADA', 'Factura 3-R1 rectificada', '2026-02-26T10:17:58.925Z', 'b79a96ccee875d9a16008254fd8de16f7955053058e908ff2db8e8948321b086', '9d89aff5076962c6cd233506347f56b900c2d087a40b5f69707d7fc6bcab8206', 37),
(534, 4, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 3-R1', '2026-02-26T10:18:01.376Z', 'efbf95c2c04a1beb4049e21f3becce502f16eeee77438c78810f30b4496a9f7b', 'b79a96ccee875d9a16008254fd8de16f7955053058e908ff2db8e8948321b086', 38),
(535, 4, 'FACTURA_REGISTRADA', 'Factura 4 registrada', '2026-02-26T10:19:19.921Z', 'b2933f736e1959139f200f1970d67278d94a684ee5caf2cd915602948c5ee790', 'efbf95c2c04a1beb4049e21f3becce502f16eeee77438c78810f30b4496a9f7b', 39),
(536, 4, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 4', '2026-02-26T10:19:19.933Z', '3a2683fff5037dce0aabca0246407ce111b291f85a5d0116070ddfc687351a3d', 'b2933f736e1959139f200f1970d67278d94a684ee5caf2cd915602948c5ee790', 40),
(537, 4, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 3-R1', '2026-02-26T11:14:09.554Z', '24b3fc52b076eb90f4b5c39b093b8b3548829ea8ac5bc31823b58960a4a0b6a6', '3a2683fff5037dce0aabca0246407ce111b291f85a5d0116070ddfc687351a3d', 41),
(538, 4, 'FACTURA_ANULADA', 'Factura 3-R1 anulada', '2026-02-26T11:15:44.706Z', 'abfe47a7d9a215fa6e25da60730a74811237ba38076c23273fd8529ce20393a2', '24b3fc52b076eb90f4b5c39b093b8b3548829ea8ac5bc31823b58960a4a0b6a6', 42),
(539, 4, 'FACTURA_RECTIFICADA', 'Factura 3-R2 rectificada', '2026-02-26T11:16:28.532Z', 'dd76d22c6253238c6c5240038bd8e8a9fd047a0e9086b07920128306f5124efe', 'abfe47a7d9a215fa6e25da60730a74811237ba38076c23273fd8529ce20393a2', 43),
(540, 4, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 3-R2', '2026-02-26T11:16:31.609Z', '4c46d3d8a7d876cca83562d19b60a264e681c700eb1a5bbec8ed0886cc135b94', 'dd76d22c6253238c6c5240038bd8e8a9fd047a0e9086b07920128306f5124efe', 44),
(541, 4, 'FACTURA_ANULADA', 'Factura 3-R2 anulada', '2026-02-26T11:22:22.012Z', 'd1cd8fc4ab130cd876eb027c9ac75851a8b432c47a7d702f9b2769fd9ab0818e', '4c46d3d8a7d876cca83562d19b60a264e681c700eb1a5bbec8ed0886cc135b94', 45),
(542, 4, 'FACTURA_RECTIFICADA', 'Factura 3-R3 rectificada', '2026-02-26T11:22:41.268Z', 'cee23b8d81aa11e73d1539f8281527f22e577db7e5e60cec362860ff89e17601', 'd1cd8fc4ab130cd876eb027c9ac75851a8b432c47a7d702f9b2769fd9ab0818e', 46),
(543, 4, 'DATOS_FISCALES_MODIFICADOS', 'Modificación de los datos fiscales del usuario 4', '2026-02-26T11:27:37.795Z', 'a370608b98c9ae567f3c6a5a33df4ae4cb38dd2c703ceb5728f1f249a5557105', 'cee23b8d81aa11e73d1539f8281527f22e577db7e5e60cec362860ff89e17601', 47),
(544, 4, 'FACTURA_ANULADA', 'Factura 3-R3 anulada', '2026-02-26T11:27:56.619Z', '9aab3d2786c901e9cd216cbffcd8bdefda0da97054f646d81219f52192a6b062', 'a370608b98c9ae567f3c6a5a33df4ae4cb38dd2c703ceb5728f1f249a5557105', 48),
(545, 4, 'FACTURA_RECTIFICADA', 'Factura 3-R4 rectificada', '2026-02-26T11:28:15.828Z', '02beba6f70c1d95da5f3d25d6d0209835bc80650775fa521832e91c509bfecc8', '9aab3d2786c901e9cd216cbffcd8bdefda0da97054f646d81219f52192a6b062', 49),
(546, 4, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 3-R4', '2026-02-26T11:28:21.121Z', 'ebb62d377d04d8008dedac33ef732bca3ef17ca6cd018b7d5043e6e257590cc7', '02beba6f70c1d95da5f3d25d6d0209835bc80650775fa521832e91c509bfecc8', 50),
(547, 4, 'DATOS_FISCALES_MODIFICADOS', 'Modificación de los datos fiscales del usuario 4', '2026-02-26T11:28:35.113Z', '4e26bd636bc94c735f2ace66515794b802cdee0feb28b2d34444cc1ba96f1501', 'ebb62d377d04d8008dedac33ef732bca3ef17ca6cd018b7d5043e6e257590cc7', 51),
(548, 4, 'FACTURA_REGISTRADA', 'Factura 5 registrada', '2026-02-26T11:29:04.000Z', 'eb5c645e03e41fa20efd5db6fb0e78bad8142a54f2dbdec683e5832ecfe66c16', '4e26bd636bc94c735f2ace66515794b802cdee0feb28b2d34444cc1ba96f1501', 52),
(549, 4, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 5', '2026-02-26T11:29:04.011Z', 'a6dbfa5c9eaf595766d9a99072b778cf12b001c48ba9406e8a950bc9d4f099a1', 'eb5c645e03e41fa20efd5db6fb0e78bad8142a54f2dbdec683e5832ecfe66c16', 53),
(550, 4, 'FACTURA_RECTIFICADA', 'Factura 5-R1 rectificada', '2026-02-26T11:29:26.885Z', '685cadf6eff2287d1f2beacd6b24c4a24871ea8b158c3ea7ed3558ca44d08390', 'a6dbfa5c9eaf595766d9a99072b778cf12b001c48ba9406e8a950bc9d4f099a1', 54),
(551, 4, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 5-R1', '2026-02-26T11:29:28.997Z', 'b9e9cc5068f94e536d04a2684c1002207c833c1bd66fb30f36ebf8f8c2492819', '685cadf6eff2287d1f2beacd6b24c4a24871ea8b158c3ea7ed3558ca44d08390', 55),
(552, 4, 'FACTURA_REGISTRADA', 'Factura 6 registrada', '2026-02-26T11:52:12.044Z', '6c5cbf27952eee58c97356fbc92532eb1e0e07a703cd2e473ac3d4054d893e83', 'b9e9cc5068f94e536d04a2684c1002207c833c1bd66fb30f36ebf8f8c2492819', 56),
(553, 4, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 6', '2026-02-26T11:52:12.065Z', '90f1ceb8e0f8e6112f28285b32b5fdbff530f718d3622af84a74ec57ced4d39d', '6c5cbf27952eee58c97356fbc92532eb1e0e07a703cd2e473ac3d4054d893e83', 57),
(554, 4, 'FACTURA_RECTIFICADA', 'Factura 6-R1 rectificada', '2026-02-26T12:00:48.978Z', 'a647eca38b3b17c96649f90828cef19e356710b2009ce0c4fd182a8eb92e8044', '90f1ceb8e0f8e6112f28285b32b5fdbff530f718d3622af84a74ec57ced4d39d', 58),
(555, 4, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 6-R1', '2026-02-26T12:00:52.040Z', '4d3bb7ffae963fa94e0f9bff2fae0b4ce0b2eb9fc6d62f4130ee20ee24fae9f5', 'a647eca38b3b17c96649f90828cef19e356710b2009ce0c4fd182a8eb92e8044', 59),
(556, 4, 'FACTURA_ANULADA', 'Factura 6-R1 anulada', '2026-02-26T12:01:16.695Z', 'ac9c1a42a93c56307a7c11667fba52aa2fd68a8465f542571000c757d4dd3a7a', '4d3bb7ffae963fa94e0f9bff2fae0b4ce0b2eb9fc6d62f4130ee20ee24fae9f5', 60),
(557, 4, 'FACTURA_RECTIFICADA', 'Factura 6-R2 rectificada', '2026-02-26T12:09:15.585Z', 'c38ca5a29b1428bce4e54b55c2d92545aaa3a9aaf93ee4bf60ab873090643197', 'ac9c1a42a93c56307a7c11667fba52aa2fd68a8465f542571000c757d4dd3a7a', 61),
(558, 4, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 6-R2', '2026-02-26T12:09:28.002Z', 'd8e724cad86111edbd9061bfdd354d3918ef4337feb97e747dc6c2af29ee1c88', 'c38ca5a29b1428bce4e54b55c2d92545aaa3a9aaf93ee4bf60ab873090643197', 62),
(559, 4, 'FACTURA_ANULADA', 'Factura 6-R2 anulada', '2026-02-26T12:10:31.642Z', '93b213cbc2c10e69eeee2200ceff7fc339e03f78fbe6229b5a67c2086a548030', 'd8e724cad86111edbd9061bfdd354d3918ef4337feb97e747dc6c2af29ee1c88', 63),
(560, 4, 'DESCARGA_XML', 'Descarga XML (RECTIFICATIVA) factura 6-R2', '2026-02-26T12:10:35.237Z', 'c44dfe1a728e0ce97a35b9495060479bb0084598f6c1447a51be1ca1556603dd', '93b213cbc2c10e69eeee2200ceff7fc339e03f78fbe6229b5a67c2086a548030', 64),
(561, 4, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 6-R2', '2026-02-26T12:12:16.470Z', '2c3ccf5a9d81dce87f79a90d0e4411c8abe5a1584f14610317c862939f3205fc', 'c44dfe1a728e0ce97a35b9495060479bb0084598f6c1447a51be1ca1556603dd', 65),
(562, 4, 'FACTURA_RECTIFICADA', 'Factura 6-R3 rectificada', '2026-02-26T12:28:20.784Z', '329033095e5f81ea5391cedfc1cae3bf4a5229d9f13f9862b2300c87925dc86f', '2c3ccf5a9d81dce87f79a90d0e4411c8abe5a1584f14610317c862939f3205fc', 66),
(563, 4, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 6-R3', '2026-02-26T12:28:25.251Z', '2700a2fe1121c747ac1c91e49071329807889ddfc76a8203e49e9702718bd5f0', '329033095e5f81ea5391cedfc1cae3bf4a5229d9f13f9862b2300c87925dc86f', 67),
(564, 4, 'FACTURA_REGISTRADA', 'Factura F-2026000242 registrada', '2026-02-26T12:51:31.860Z', '801e480b0e800ed6644a68de6842ad685ab3d99462c98e1dd2133e07b18459a5', '2700a2fe1121c747ac1c91e49071329807889ddfc76a8203e49e9702718bd5f0', 68),
(565, 4, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura F-2026000242', '2026-02-26T12:51:31.870Z', '6dde595a339d3e9212b016c4653e1732ae93541a5b9d483a84e1686b446cee14', '801e480b0e800ed6644a68de6842ad685ab3d99462c98e1dd2133e07b18459a5', 69),
(566, 4, 'DESCARGA_XML', 'Descarga XML (ORDINARIA) factura F-2026000242', '2026-02-26T12:51:45.996Z', 'aee3f0ef59634b16b1c8a643baa697287fa382e25f24aa2b62181de7e430f468', '6dde595a339d3e9212b016c4653e1732ae93541a5b9d483a84e1686b446cee14', 70),
(567, 4, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura F-2026000242', '2026-02-26T12:52:03.404Z', 'e3153d503bf6ee8bbb17fdc6f95a4b752992e39b192a35c1bb15c229a5e21aa4', 'aee3f0ef59634b16b1c8a643baa697287fa382e25f24aa2b62181de7e430f468', 71),
(568, 4, 'DESCARGA_XML', 'Descarga XML (ORDINARIA) factura F-2026000242', '2026-02-26T12:52:23.951Z', 'd6eb525d1f4170c05b6d7b53eef7135c5275005125685ec2179e84fdaa3bc870', 'e3153d503bf6ee8bbb17fdc6f95a4b752992e39b192a35c1bb15c229a5e21aa4', 72),
(569, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-02-27T07:58:20.671Z', 'ddb34da7a9b1758a76a6f23541aa9483cd1b57b81728bd24ff30599bf3c26b13', '3f7b3ef870be8e824dd125fe6a38387229cd63966a895f86102b765a3090d0be', 396),
(570, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-02-27T07:58:27.483Z', '374262e52b18035b800d7194a22525ae99150c8269f1fce8ac329e359b69548d', 'ddb34da7a9b1758a76a6f23541aa9483cd1b57b81728bd24ff30599bf3c26b13', 397),
(571, 2, 'LOGIN_FALLIDO', 'Intento de inicio de sesión fallido para rebecamm2495@gmail.com', '2026-03-02T08:24:05.266Z', 'de61b06741ea4539a403e1e4db43a0216ccde0112a3a75c720a3d908a61643e0', '374262e52b18035b800d7194a22525ae99150c8269f1fce8ac329e359b69548d', 398),
(572, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-03-02T08:24:10.159Z', 'bb6dfecec7ff881a02b06b65d0bc5e7878553d474f2b972682be02af5518de12', 'de61b06741ea4539a403e1e4db43a0216ccde0112a3a75c720a3d908a61643e0', 399),
(573, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-03-02T08:24:21.670Z', '494cc6714deccd015b96b5f299d283b65b8541b7691a6c2ad2c2d4cb8f85b7c1', 'bb6dfecec7ff881a02b06b65d0bc5e7878553d474f2b972682be02af5518de12', 400),
(574, 2, 'ADMIN_VERIFICACION_GLOBAL', 'Verificación global de integridad ejecutada', '2026-03-02T15:01:38.782Z', '817b7ef200815a55377c1ca7fdede22800b3f31d1176ca5ba1e49733cb8b2990', '494cc6714deccd015b96b5f299d283b65b8541b7691a6c2ad2c2d4cb8f85b7c1', 401),
(575, 6, 'REGISTRO_USUARIO', 'Registro del usuario con email: prueba@inaltera.com', '2026-03-03T09:28:49.374Z', '4a30529e77bbff7432a235c9bf4b7c85fc5cddf16d6cfb6d28990b16c13ff369', '0000000000000000000000000000000000000000000000000000000000000000', 1),
(576, 6, 'VERIFICACIÓN_EMAIL', 'Solicitud de verificación para el email: prueba@inaltera.com', '2026-03-03T09:33:02.665Z', '2f6a9d9af22a16a58b0e9a7fd5a923a8d769f380d891517e2d2b73941acf7773', '4a30529e77bbff7432a235c9bf4b7c85fc5cddf16d6cfb6d28990b16c13ff369', 2),
(577, 6, 'VERIFICACIÓN_EMAIL', 'Solicitud de verificación para el email: prueba@inaltera.com', '2026-03-03T09:34:14.306Z', 'b22a2f49dc4b37a2b253180d62d35123bde8a0cdc5d832fad5befa4f5cb63559', '2f6a9d9af22a16a58b0e9a7fd5a923a8d769f380d891517e2d2b73941acf7773', 3),
(578, 6, 'VERIFICACIÓN_EMAIL', 'Solicitud de verificación para el email: prueba@inaltera.com', '2026-03-03T09:39:12.730Z', '775025e9879251b0767cb23fa671614c12bc53e172c6ce83bd0e8e46c59e848f', 'b22a2f49dc4b37a2b253180d62d35123bde8a0cdc5d832fad5befa4f5cb63559', 4),
(579, 6, 'VERIFICACIÓN_EMAIL', 'Solicitud de verificación para el email: prueba@inaltera.com', '2026-03-03T09:39:40.191Z', '819855d5b716975e3a0207f74bd5602c60e4de44f0a098898e31f1a72bed9535', '775025e9879251b0767cb23fa671614c12bc53e172c6ce83bd0e8e46c59e848f', 5),
(580, 6, 'LOGIN_OK', 'Inicio de sesión correcto de prueba@inaltera.com', '2026-03-03T09:41:19.473Z', '25db736b4830f4c87c03641e12e76add7900551e8b93adfd55f9b563f0cd14cd', '819855d5b716975e3a0207f74bd5602c60e4de44f0a098898e31f1a72bed9535', 6),
(581, 6, 'DATOS_FISCALES_CREADOS', 'Primer registro de los datos fiscales del usuario 6', '2026-03-03T09:46:29.803Z', 'd11a456e516c9a7c39d6938201890693cd0ea7d63a7022c62e800044dd196c35', '25db736b4830f4c87c03641e12e76add7900551e8b93adfd55f9b563f0cd14cd', 7),
(582, 6, 'CAMBIO_SUSCRIPCION', 'Cambio de la suscripción del usuario 6', '2026-03-03T09:46:51.650Z', '941c31a288d20ec88cc56631480a290f3680aea0b0e383b88f91dc22a723159a', 'd11a456e516c9a7c39d6938201890693cd0ea7d63a7022c62e800044dd196c35', 8),
(583, 6, 'CAMBIO_SUSCRIPCION', 'Cambio de la suscripción del usuario 6', '2026-03-03T09:46:52.647Z', '6d70d8a6f0d9882c6543aeb910659789c70450867acb3cb7dc278efcdf57bd62', '941c31a288d20ec88cc56631480a290f3680aea0b0e383b88f91dc22a723159a', 9),
(584, 6, 'CAMBIO_SUSCRIPCION', 'Cambio de la suscripción del usuario 6', '2026-03-03T09:46:53.751Z', '012c9d1197f6c302358d8638b0f4a4d4022b88ae9bcb3d97107e78464cce352b', '6d70d8a6f0d9882c6543aeb910659789c70450867acb3cb7dc278efcdf57bd62', 10),
(585, 6, 'INTENTO_ACTIVAR_2FA', 'Inicio del proceso de activación de 2FA', '2026-03-03T09:48:13.963Z', '1b570e21ca49982cea37aacd20c01b7dc45f52ffc53bacbe200f59c71e29c673', '012c9d1197f6c302358d8638b0f4a4d4022b88ae9bcb3d97107e78464cce352b', 11),
(586, 6, 'ACTIVAR_2FA', 'Autenticación en dos factores activada', '2026-03-03T09:48:37.337Z', '7570322238caba9122ada40d0aa9bae5451be7148ef6586537293aed66db5e83', '1b570e21ca49982cea37aacd20c01b7dc45f52ffc53bacbe200f59c71e29c673', 12),
(587, 6, 'FACTURA_REGISTRADA', 'Factura 1 registrada', '2026-03-03T10:06:49.865Z', '92ea0aeb608198e80020e8d5284cdcaa74884c4d05f48d3c0164f6fb24244da6', '7570322238caba9122ada40d0aa9bae5451be7148ef6586537293aed66db5e83', 13),
(588, 6, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 1', '2026-03-03T10:06:49.888Z', 'eb670694358838e651317687b2566574bfa6d42ecd80ffb3bdc03f268848ee19', '92ea0aeb608198e80020e8d5284cdcaa74884c4d05f48d3c0164f6fb24244da6', 14),
(589, 6, 'DESCARGA_XML', 'Descarga XML (ORDINARIA) factura 1', '2026-03-03T10:08:18.967Z', '6482d1c6c6a134697996bac2cd36416dbbfc84ecf3d1a75e180208cdad1f57ad', 'eb670694358838e651317687b2566574bfa6d42ecd80ffb3bdc03f268848ee19', 15),
(590, 2, 'VERIFICACIÓN_EMAIL', 'Solicitud de verificación para el email: rebecamm2495@gmail.com', '2026-03-03T10:10:15.263Z', 'e61480fe454bfd7ad966ab987e0fa31cbc3627a76ad68998cb9608db33aedffe', '817b7ef200815a55377c1ca7fdede22800b3f31d1176ca5ba1e49733cb8b2990', 402),
(591, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-03-03T10:10:31.544Z', '8380d4fbc37843d3237c4ac75e64a2cdebcc0c3eff4f946016d90894a24d162f', 'e61480fe454bfd7ad966ab987e0fa31cbc3627a76ad68998cb9608db33aedffe', 403),
(592, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-03-03T10:10:42.062Z', '6d3d03e0ac0a7ae9f98e105a87c51220c8731e32d2213965e46fa7be8fa0aaf5', '8380d4fbc37843d3237c4ac75e64a2cdebcc0c3eff4f946016d90894a24d162f', 404),
(593, 6, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-03-03T10:50:58.616Z', 'da5b8b1b71735ac1023c74c247c0bf116961f4b86f509cbfabca4cc965e3b26b', '6482d1c6c6a134697996bac2cd36416dbbfc84ecf3d1a75e180208cdad1f57ad', 16),
(594, 6, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-03-03T10:51:09.551Z', '4c622453a3ce091b41bc29706f9d7bfcb1fb570287200c1a84bef013ec71d078', 'da5b8b1b71735ac1023c74c247c0bf116961f4b86f509cbfabca4cc965e3b26b', 17),
(595, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-03-03T11:01:04.220Z', '10f4d2e3eb9d69f469b1aa82944ae725632e9469f260d9906ccb0cf8e5c131b3', '6d3d03e0ac0a7ae9f98e105a87c51220c8731e32d2213965e46fa7be8fa0aaf5', 405),
(596, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-03-03T11:01:09.273Z', '9b89a578dd657a654fb4cdee3fe2330729ed0606de5e5ae63b10d330003d1bfe', '10f4d2e3eb9d69f469b1aa82944ae725632e9469f260d9906ccb0cf8e5c131b3', 406),
(597, 2, 'ADMIN_VERIFICACION_GLOBAL', 'Verificación global de integridad ejecutada', '2026-03-03T11:03:47.756Z', '7ae06a7247fd866fab644e77f2ac4ae283662eaf0d7840e7d56ff652b2d42a95', '9b89a578dd657a654fb4cdee3fe2330729ed0606de5e5ae63b10d330003d1bfe', 407),
(598, 2, 'BACKUP_EJECUTADO', 'Backup generado en 2026-03-03-11-03', '2026-03-03T11:03:57.508Z', 'eb9ef9d13bdc24d67e265093b60c66e420e1e38662bbfc456d5b02980eaf770e', '7ae06a7247fd866fab644e77f2ac4ae283662eaf0d7840e7d56ff652b2d42a95', 408),
(599, 2, 'FACTURA_REGISTRADA', 'Factura 5 registrada', '2026-03-03T11:38:08.327Z', '3423cb3d17035faf33b3682b906798ddec098f3f1dda93060d82b926c7304a33', 'eb9ef9d13bdc24d67e265093b60c66e420e1e38662bbfc456d5b02980eaf770e', 409),
(600, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 5', '2026-03-03T11:38:08.346Z', '3bb9701a59bb74a958288ed9fcdba85fa76360cdfcb173a04f0d68d8c2f7994f', '3423cb3d17035faf33b3682b906798ddec098f3f1dda93060d82b926c7304a33', 410),
(601, 6, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-03-03T13:53:53.962Z', '059b6e36e8893b8304386008f56eb8a270c644aaff029712bf6f0820a92c5ba5', '4c622453a3ce091b41bc29706f9d7bfcb1fb570287200c1a84bef013ec71d078', 18),
(602, 6, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-03-03T13:54:05.164Z', '380953b39390da36a039f87351b3aa196597ec5c44830cde8340de1ae91769ca', '059b6e36e8893b8304386008f56eb8a270c644aaff029712bf6f0820a92c5ba5', 19),
(603, 6, 'FACTURA_RECTIFICADA', 'Factura 1-R1 rectificada', '2026-03-03T14:16:41.275Z', 'aedaa17e5909a33e25a3bd65a934e44e41fc71b9dd3991429f9a00e4bb1ae23b', '380953b39390da36a039f87351b3aa196597ec5c44830cde8340de1ae91769ca', 20),
(604, 6, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 1-R1', '2026-03-03T14:16:45.042Z', 'cad5fa4a04f5fc232a38d39e7abae3fa082dce7702f8ecb6e9dbe7bd6a78b3af', 'aedaa17e5909a33e25a3bd65a934e44e41fc71b9dd3991429f9a00e4bb1ae23b', 21),
(605, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-03-03T14:17:12.979Z', 'eb86ea4082371096cdf05cd9cc3c777fc1cab84efb3bb1b24d2c396753df5c51', '3bb9701a59bb74a958288ed9fcdba85fa76360cdfcb173a04f0d68d8c2f7994f', 411),
(606, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-03-03T14:17:21.866Z', 'dfde9028a07223282cd2eb087789b62912e366f6994b11f5892135a2b9a4bcec', 'eb86ea4082371096cdf05cd9cc3c777fc1cab84efb3bb1b24d2c396753df5c51', 412),
(607, 2, 'FACTURA_ANULADA', 'Factura 5 anulada', '2026-03-03T14:19:20.366Z', '2640bfbdca60d9813508a7f66bd1955f1062c058c7727b4f5dd1b457bffd1a71', 'dfde9028a07223282cd2eb087789b62912e366f6994b11f5892135a2b9a4bcec', 413),
(608, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-03-03T14:24:54.508Z', 'e9dab58ae505022c761fbf07f856bcbb14d0c0c80eaaf33f62260c152fb34242', '2640bfbdca60d9813508a7f66bd1955f1062c058c7727b4f5dd1b457bffd1a71', 414),
(609, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-03-03T14:25:06.147Z', '792b2be50a4f675adf6338bc5ae98300570a399e8900a19008a810dbc539238b', 'e9dab58ae505022c761fbf07f856bcbb14d0c0c80eaaf33f62260c152fb34242', 415),
(610, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-03-03T14:25:44.930Z', '2714da5fbae7bf64be2278a341fd088513c3bb45f9a5a69a7099a2bf124255c9', '792b2be50a4f675adf6338bc5ae98300570a399e8900a19008a810dbc539238b', 416),
(611, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-03-03T14:25:49.627Z', '0e9ea62dc0d031727b45d8f55429612597e6e652410d927cbc08bbf1070b8ac3', '2714da5fbae7bf64be2278a341fd088513c3bb45f9a5a69a7099a2bf124255c9', 417),
(612, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-03-03T14:26:50.254Z', '6f1e3539b321092c5f4cbbce5abeb6bbad292e8718cb3486cf4ff26888ce419a', '0e9ea62dc0d031727b45d8f55429612597e6e652410d927cbc08bbf1070b8ac3', 418),
(613, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-03-03T14:26:56.113Z', '7170774dffc9edc13154b22419d9813524409d3482a82b71859ae245fdf74782', '6f1e3539b321092c5f4cbbce5abeb6bbad292e8718cb3486cf4ff26888ce419a', 419),
(614, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-03-03T14:29:07.587Z', '088bb254641e1ce72b61ab83d8f2803d6a4fa264194376a76860dd62c9b557aa', '7170774dffc9edc13154b22419d9813524409d3482a82b71859ae245fdf74782', 420),
(615, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-03-03T14:29:13.664Z', 'c5190ee1aba25faaaf46622531d60aa5421529847e00a588be9c5a8491330105', '088bb254641e1ce72b61ab83d8f2803d6a4fa264194376a76860dd62c9b557aa', 421),
(616, 6, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-03-03T15:09:15.362Z', '09722ee96540bff83bf3d5bc958cb3ff44201f32208791c98c5178b164d80b99', 'cad5fa4a04f5fc232a38d39e7abae3fa082dce7702f8ecb6e9dbe7bd6a78b3af', 22),
(617, 6, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-03-03T15:09:26.042Z', '9da398ea18b86d6328032c77c70cb3df3012ca8ae6ef6eee09b9e9ffb22450ca', '09722ee96540bff83bf3d5bc958cb3ff44201f32208791c98c5178b164d80b99', 23),
(618, 6, 'FACTURA_REGISTRADA', 'Factura F-2026000242 registrada', '2026-03-03T15:11:57.200Z', '751e0336bb9cdcb26007216e25cf9b2917f9112398e1b8ac2f60a8e7a431dc5a', '9da398ea18b86d6328032c77c70cb3df3012ca8ae6ef6eee09b9e9ffb22450ca', 24),
(619, 6, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura F-2026000242', '2026-03-03T15:11:57.226Z', 'bd9ee710e770278f44180ed5435fa101b47ee11d65868825d5065af4da170265', '751e0336bb9cdcb26007216e25cf9b2917f9112398e1b8ac2f60a8e7a431dc5a', 25),
(620, 6, 'FACTURA_ANULADA', 'Factura F-2026000242 anulada', '2026-03-03T15:18:01.776Z', 'abf9637a6a3cbee1bc54b148e1aab8cc4dcda0985fa432e419fa08e62a8f77de', 'bd9ee710e770278f44180ed5435fa101b47ee11d65868825d5065af4da170265', 26),
(621, 4, 'VERIFICACIÓN_EMAIL', 'Solicitud de verificación para el email: test@noveri.local', '2026-03-03T15:19:37.120Z', '2ef57c9f8dec9866747a2ac8cc1b74e7a96c23faac7e948034aaee02ff3085f7', 'd6eb525d1f4170c05b6d7b53eef7135c5275005125685ec2179e84fdaa3bc870', 73),
(622, 4, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-03-03T15:20:45.423Z', '785973cb6d02e6aacd9bcb77db00e84ff490f658b9edab68b2aa6a3c97e6b99b', '2ef57c9f8dec9866747a2ac8cc1b74e7a96c23faac7e948034aaee02ff3085f7', 74),
(623, 4, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-03-03T15:20:54.605Z', '710758ff0f62474f93039649194f3d0a8ac0a19414f19a19d75f33508be97f4a', '785973cb6d02e6aacd9bcb77db00e84ff490f658b9edab68b2aa6a3c97e6b99b', 75),
(624, 1, 'SOLICITUD_RESET_PASSWORD', 'Solicitud de recuperación para demo@noverifactu.local', '2026-03-03T15:21:59.118Z', '01948ee820dc129c4161d58e91ee61351ba08c0a0304947b110f41f09bf8d6d9', '0000000000000000000000000000000000000000000000000000000000000000', 1),
(625, 1, 'RESET_PASSWORD_OK', 'Contraseña restablecida correctamente', '2026-03-03T15:22:20.731Z', '179ede2fa9be3e0867c55ebbb570abd3686bd5380d5c1977b0bcb7f5d04b75cb', '01948ee820dc129c4161d58e91ee61351ba08c0a0304947b110f41f09bf8d6d9', 2),
(626, 1, 'VERIFICACIÓN_EMAIL', 'Solicitud de verificación para el email: demo@noverifactu.local', '2026-03-03T15:22:38.949Z', 'aa4fbcc3ac8ef77bceb15e2b73d5235f9773d4ae76446ccf4803a9d9c1e5af6a', '179ede2fa9be3e0867c55ebbb570abd3686bd5380d5c1977b0bcb7f5d04b75cb', 3),
(627, 1, 'LOGIN_FALLIDO', 'Intento de inicio de sesión fallido para demo@noverifactu.local', '2026-03-03T15:25:07.999Z', '307a5ad497efc177c45813ff2a1d5ea9c37a90b449bf94e6a39219ba586a7554', 'aa4fbcc3ac8ef77bceb15e2b73d5235f9773d4ae76446ccf4803a9d9c1e5af6a', 4),
(628, 1, 'LOGIN_OK', 'Inicio de sesión correcto de demo@noverifactu.local', '2026-03-03T15:25:21.536Z', '91de82fcb121e9f14be04919151ddf109ade939e146a8c234d3550d8663d15f6', '307a5ad497efc177c45813ff2a1d5ea9c37a90b449bf94e6a39219ba586a7554', 5),
(629, 1, 'FACTURA_REGISTRADA', 'Factura F-2026000242 registrada', '2026-03-03T15:26:05.488Z', '4e6883e0e3af9427eaf0f5674a9b09dac62db8aff34a4d7bc516017505ea0a8c', '91de82fcb121e9f14be04919151ddf109ade939e146a8c234d3550d8663d15f6', 6),
(630, 1, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura F-2026000242', '2026-03-03T15:26:05.504Z', '13a12f1a755e754a6901d56f23e120504d438d7d5785141eba185588ecf82e4b', '4e6883e0e3af9427eaf0f5674a9b09dac62db8aff34a4d7bc516017505ea0a8c', 7),
(631, 1, 'FACTURA_ANULADA', 'Factura F-2026000242 anulada', '2026-03-03T15:26:23.217Z', '2e8cb152c2f2d45f31cd62f9cca0ae2b56a711a26a6b62b688c8040c7d43401a', '13a12f1a755e754a6901d56f23e120504d438d7d5785141eba185588ecf82e4b', 8),
(632, 5, 'SOLICITUD_RESET_PASSWORD', 'Solicitud de recuperación para pepi@gmail.com', '2026-03-03T15:35:40.198Z', 'b9ca02f0d85a980f66d4e58c13fe1400998f7e5991a626c41bb17a11d8d67cfd', '021774249f38dc50d7a4d6f0542b9ff32a347b2fc7d6865a2babc188b93d3a8c', 3),
(633, 5, 'RESET_PASSWORD_OK', 'Contraseña restablecida correctamente', '2026-03-03T15:36:20.158Z', '7a344f9a277fd5ef6aa42b2cd519e88e6f33727d812e09b9ca0cf63c4ded1d2b', 'b9ca02f0d85a980f66d4e58c13fe1400998f7e5991a626c41bb17a11d8d67cfd', 4),
(634, 5, 'VERIFICACIÓN_EMAIL', 'Solicitud de verificación para el email: pepi@gmail.com', '2026-03-03T15:36:37.469Z', '2de451c22b198c5d5e00e5fed094800e9dbf8e90b3b5a1283a1b385b833135af', '7a344f9a277fd5ef6aa42b2cd519e88e6f33727d812e09b9ca0cf63c4ded1d2b', 5),
(635, 5, 'LOGIN_OK', 'Inicio de sesión correcto de pepi@gmail.com', '2026-03-03T15:36:51.349Z', '4387893d98680771783978df782a09ac6f863486aef8d1209075b935b248a224', '2de451c22b198c5d5e00e5fed094800e9dbf8e90b3b5a1283a1b385b833135af', 6),
(636, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-03-03T15:56:07.906Z', '32e21508f8b955f83d8ea6ce516bf4ac3b6408653d733e834363b499409705ae', 'c5190ee1aba25faaaf46622531d60aa5421529847e00a588be9c5a8491330105', 422),
(637, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-03-03T15:56:16.096Z', '6ef97ada28aa528caa7a4172d70bdb57a4c971f6eec2606472a7b9e6267678ec', '32e21508f8b955f83d8ea6ce516bf4ac3b6408653d733e834363b499409705ae', 423),
(638, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 3', '2026-03-03T16:00:11.227Z', '3503ce997c984ebe81c03a9efc5f61125e0ed30487d42f8f44d30fd1ba5d6a6f', '6ef97ada28aa528caa7a4172d70bdb57a4c971f6eec2606472a7b9e6267678ec', 424),
(639, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 4-R1', '2026-03-03T16:01:58.529Z', 'e16d8f8ae109e375624a836a7ce37bfc526c85a2908be01b504e938ad2f387f7', '3503ce997c984ebe81c03a9efc5f61125e0ed30487d42f8f44d30fd1ba5d6a6f', 425),
(640, 2, 'ADMIN_VERIFICACION_GLOBAL', 'Verificación global de integridad ejecutada', '2026-03-03T16:09:34.638Z', '1728c79b5f462a90bdfd0fb0d83df433e7983c857d77763272b8cad8b7ee3470', 'e16d8f8ae109e375624a836a7ce37bfc526c85a2908be01b504e938ad2f387f7', 426),
(641, 2, 'LOGIN_FALLIDO', 'Intento de inicio de sesión fallido para rebecamm2495@gmail.com', '2026-03-04T08:35:50.088Z', '4cd8888ec70330b8957b0cbe45606a1cbf5744f070a7850646b849573e656b8c', '1728c79b5f462a90bdfd0fb0d83df433e7983c857d77763272b8cad8b7ee3470', 427),
(642, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-03-04T08:36:01.537Z', '6f5467ecdeb7b5d3b15ba80b511d501685469caea0097e03f1b2db5fb8131b0a', '4cd8888ec70330b8957b0cbe45606a1cbf5744f070a7850646b849573e656b8c', 428),
(643, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-03-04T08:36:13.260Z', '1ddf0f6ebf08147bfe5d16a4805fc313634f3814a5cb1d33668b97dd0a9150ed', '6f5467ecdeb7b5d3b15ba80b511d501685469caea0097e03f1b2db5fb8131b0a', 429),
(644, 2, 'BACKUP_DESCARGADO', 'Backup 2026-03-03-11-03 descargado', '2026-03-04T08:45:15.008Z', '86d994b77b159ee14e2d4a16e7256c98be4644ed2c2507ede122343f7085c916', '1ddf0f6ebf08147bfe5d16a4805fc313634f3814a5cb1d33668b97dd0a9150ed', 430),
(645, 2, 'BACKUP_ELIMINADO', 'Backup 2026-02-23-10-26 eliminado', '2026-03-04T08:45:25.039Z', '05ed22d42b6bfb8c245bb54e59797d0f229a9d50bfc8e7e8ccf6e93643145dc3', '86d994b77b159ee14e2d4a16e7256c98be4644ed2c2507ede122343f7085c916', 431),
(646, 2, 'LOGIN_FALLIDO', 'Intento de inicio de sesión fallido para rebecamm2495@gmail.com', '2026-03-05T08:18:33.323Z', '74f818590d10e1c6f25bff308f8b6fa9bb568b412b9b09362a867b11647df69b', '05ed22d42b6bfb8c245bb54e59797d0f229a9d50bfc8e7e8ccf6e93643145dc3', 432),
(647, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-03-05T08:18:48.520Z', 'f168d84c8e72aaed24edc8dd6b1341cad8e4f2d092b88eb59266be56436c5741', '74f818590d10e1c6f25bff308f8b6fa9bb568b412b9b09362a867b11647df69b', 433),
(648, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-03-05T08:19:12.764Z', 'f88635aac2e0b9be3b5863b53870123ca1dd0acaa6e570700d6f7fd01a63f8af', 'f168d84c8e72aaed24edc8dd6b1341cad8e4f2d092b88eb59266be56436c5741', 434),
(649, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-03-05T08:19:21.868Z', '92b2e5022459d35a3f634c4c5213c4d8a07dd0ed7c4fe93d21ce173382b5f112', 'f88635aac2e0b9be3b5863b53870123ca1dd0acaa6e570700d6f7fd01a63f8af', 435),
(650, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-03-05T08:19:35.472Z', 'a83eaae05e8137975eb878a45b670e6280f26a6403691f79e5d9925aba5cbd75', '92b2e5022459d35a3f634c4c5213c4d8a07dd0ed7c4fe93d21ce173382b5f112', 436),
(651, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-03-05T08:27:27.305Z', '0937a81540a80994e5c78884d03e10abaf397eeec8093f3e7a74feaaa86979f0', 'a83eaae05e8137975eb878a45b670e6280f26a6403691f79e5d9925aba5cbd75', 437),
(652, 2, 'ADMIN_VERIFICACION_GLOBAL', 'Verificación global de integridad ejecutada', '2026-03-05T08:57:49.916Z', '2afd540121b8a6af36eed2c9e79e429f7b0e3dca20dde7034ebab5d80b76e0db', '0937a81540a80994e5c78884d03e10abaf397eeec8093f3e7a74feaaa86979f0', 438),
(653, 2, 'ADMIN_VERIFICACION_GLOBAL', 'Verificación global de integridad ejecutada', '2026-03-05T08:58:13.323Z', 'bc47d1779ba495d729ee51a0b52787189198e4a9417abbbf6b05d06c5919ced1', '2afd540121b8a6af36eed2c9e79e429f7b0e3dca20dde7034ebab5d80b76e0db', 439),
(654, 2, 'ADMIN_VERIFICACION_GLOBAL', 'Verificación global de integridad ejecutada', '2026-03-05T09:03:58.375Z', 'd68902a3651f71068a08a814bf518181d4ae0e328b0fc1db77a2d47d5e1f6024', 'bc47d1779ba495d729ee51a0b52787189198e4a9417abbbf6b05d06c5919ced1', 440),
(655, 2, 'ADMIN_VERIFICACION_GLOBAL', 'Verificación global de integridad ejecutada', '2026-03-05T09:10:24.016Z', '75e11d6964869d10d5f3e333608e0f11e7e86f7d4d416a0fe247f4ceb2c642f9', 'd68902a3651f71068a08a814bf518181d4ae0e328b0fc1db77a2d47d5e1f6024', 441),
(656, 2, 'ADMIN_VERIFICACION_GLOBAL', 'Verificación global de integridad ejecutada', '2026-03-05T09:11:42.866Z', '6f6e7324a286eda764110a9a2465a9195f454acc6639f529fedba9c0dc9f589d', '75e11d6964869d10d5f3e333608e0f11e7e86f7d4d416a0fe247f4ceb2c642f9', 442),
(657, 2, 'ADMIN_VERIFICACION_GLOBAL', 'Verificación global de integridad ejecutada', '2026-03-05T09:15:35.653Z', 'fc8451a30462de298f3a4f85d33250e7dd10c8c1f15f8b3b83fa4b02314603a7', '6f6e7324a286eda764110a9a2465a9195f454acc6639f529fedba9c0dc9f589d', 443),
(658, 2, 'ADMIN_VERIFICACION_GLOBAL', 'Verificación global de integridad ejecutada', '2026-03-05T09:15:47.642Z', 'c97d33ed641daec7cb9959e7b65ec36142a1a56e3f969315b6b45bfe398e60d2', 'fc8451a30462de298f3a4f85d33250e7dd10c8c1f15f8b3b83fa4b02314603a7', 444),
(659, 2, 'ADMIN_VERIFICACION_GLOBAL', 'Verificación global de integridad ejecutada', '2026-03-05T09:23:43.480Z', 'd54a3d6e06c06852401ca4e77563447771051807306526aef92969f874936ce7', 'c97d33ed641daec7cb9959e7b65ec36142a1a56e3f969315b6b45bfe398e60d2', 445),
(660, 2, 'ADMIN_VERIFICACION_GLOBAL', 'Verificación global de integridad ejecutada', '2026-03-05T09:23:53.859Z', '1208b5a7edca406c485ec86e9cd17b90262db66d8193c3055e09c66264171b40', 'd54a3d6e06c06852401ca4e77563447771051807306526aef92969f874936ce7', 446),
(661, 2, 'ADMIN_VERIFICACION_GLOBAL', 'Verificación global de integridad ejecutada', '2026-03-05T09:36:23.054Z', 'f836dcd386f89c755a13ac261dd8787044cafeebca6413016f256572b7d2574d', '1208b5a7edca406c485ec86e9cd17b90262db66d8193c3055e09c66264171b40', 447),
(662, 2, 'FACTURA_REGISTRADA', 'Factura 6 registrada', '2026-03-05T12:14:52.163Z', 'd60e462692a6237c97d53daa4c4150b9d4b3593ea3713b49f273baff98b355e8', 'f836dcd386f89c755a13ac261dd8787044cafeebca6413016f256572b7d2574d', 448),
(663, 2, 'DESCARGA_PDF', 'Descarga de PDF sellado de la factura 6', '2026-03-05T12:14:52.178Z', '5eb6859c8875d6bc971923326bcf7e035696ffcb8fc104114987a8a34e3336cd', 'd60e462692a6237c97d53daa4c4150b9d4b3593ea3713b49f273baff98b355e8', 449),
(664, 2, 'DESCARGA_XML', 'Descarga XML (ORDINARIA) factura 6', '2026-03-05T12:29:18.149Z', 'da4cade53a8b2931e121e3d92728bd76391ae7aaf9826b024040dc6548abecac', '5eb6859c8875d6bc971923326bcf7e035696ffcb8fc104114987a8a34e3336cd', 450),
(665, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-03-06T11:21:03.908Z', 'fc020622323fcef687dd25b8f8b9534dfba818db5675406b70c505ffa0449588', 'da4cade53a8b2931e121e3d92728bd76391ae7aaf9826b024040dc6548abecac', 451),
(666, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-03-06T11:21:31.970Z', '0c7bafb1600913c4238fb17d7725d5c67d7bfa54491df1259e01036e969711be', 'fc020622323fcef687dd25b8f8b9534dfba818db5675406b70c505ffa0449588', 452),
(667, 2, 'ADMIN_VERIFICACION_GLOBAL', 'Verificación global de integridad ejecutada', '2026-03-06T12:39:10.780Z', '56c6336541ea25e3c820593d811554a9766460c6172ffa5087cf20e2f4d2e6d7', '0c7bafb1600913c4238fb17d7725d5c67d7bfa54491df1259e01036e969711be', 453),
(668, 2, 'ADMIN_VERIFICACION_GLOBAL', 'Verificación global de integridad ejecutada', '2026-03-06T12:39:16.399Z', '9acee316f9064069c6aef1ea4986bdb96ba44f49e25eff8d57d884f2761c0e63', '56c6336541ea25e3c820593d811554a9766460c6172ffa5087cf20e2f4d2e6d7', 454),
(669, 2, 'LOGIN_2FA_REQUERIDO', 'Credenciales correctas, se requiere 2FA', '2026-03-09T08:10:30.453Z', '2bd0795bc612db094f7d7f9995e43c7b0e65b1f16d3fd5492875eb6c189129cd', '9acee316f9064069c6aef1ea4986bdb96ba44f49e25eff8d57d884f2761c0e63', 455),
(670, 2, 'LOGIN_2FA_OK', 'Login con 2FA correcto', '2026-03-09T08:10:44.691Z', 'cd65bcf481b73e1f60581b3449482696916ea36fe98e1cd5f08cda9d22c9a418', '2bd0795bc612db094f7d7f9995e43c7b0e65b1f16d3fd5492875eb6c189129cd', 456),
(671, 2, 'ADMIN_VERIFICACION_GLOBAL', 'Verificación global de integridad ejecutada', '2026-03-09T08:41:29.560Z', '4b8529560c93f9b3d87fa99ca71a926ffe9ae2804e6b8651596bc75236b20fe3', 'cd65bcf481b73e1f60581b3449482696916ea36fe98e1cd5f08cda9d22c9a418', 457),
(672, 2, 'ADMIN_VERIFICACION_GLOBAL', 'Verificación global de integridad ejecutada', '2026-03-09T08:42:04.156Z', 'c6f5f11973d612c5e40f53a4a9ffe38263148623d1ee1c278a927a0a74331fc9', '4b8529560c93f9b3d87fa99ca71a926ffe9ae2804e6b8651596bc75236b20fe3', 458);

--
-- Disparadores `log_eventos`
--
DELIMITER $$
CREATE TRIGGER `no_delete_eventos` BEFORE DELETE ON `log_eventos` FOR EACH ROW SIGNAL SQLSTATE '45000'
SET MESSAGE_TEXT = 'No se permite borrar el log de eventos'
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `no_update_eventos` BEFORE UPDATE ON `log_eventos` FOR EACH ROW SIGNAL SQLSTATE '45000'
SET MESSAGE_TEXT = 'No se permite modificar el log de eventos'
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `usuario_id` bigint(20) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `tipo_iva` decimal(5,2) DEFAULT 21.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `unidad` varchar(20) NOT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT 1,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `usuario_id`, `nombre`, `descripcion`, `precio`, `tipo_iva`, `created_at`, `unidad`, `activo`, `deleted_at`) VALUES
(1, 2, 'Consulta', NULL, 50.00, 21.00, '2026-03-05 12:09:43', '', 1, NULL),
(2, 2, 'Consulta', NULL, 50.00, 21.00, '2026-03-05 12:13:59', '', 0, NULL),
(3, 2, 'Consulta', NULL, 50.00, 21.00, '2026-03-05 12:14:52', '', 0, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registros_facturacion`
--

CREATE TABLE `registros_facturacion` (
  `id` bigint(20) NOT NULL,
  `usuario_id` bigint(20) NOT NULL,
  `fecha_hora_generacion` varchar(24) NOT NULL,
  `contenido_registro` longtext NOT NULL,
  `hash_registro_actual` char(64) NOT NULL,
  `hash_registro_anterior` char(64) NOT NULL,
  `qr_url` varchar(255) DEFAULT NULL,
  `estado` enum('ALTA','ANULACION','RECTIFICATIVA') NOT NULL,
  `num_registro` int(11) NOT NULL,
  `sif_config_id` int(11) DEFAULT NULL,
  `invalido` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `registros_facturacion`
--

INSERT INTO `registros_facturacion` (`id`, `usuario_id`, `fecha_hora_generacion`, `contenido_registro`, `hash_registro_actual`, `hash_registro_anterior`, `qr_url`, `estado`, `num_registro`, `sif_config_id`, `invalido`) VALUES
(239, 2, '2026-02-23T11:14:29.580Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<FacturaNoVerifactu xmlns=\"https://noverifactu.local/esquema\">\n  <Cabecera>\n    <NIFEmisor>71902382N</NIFEmisor>\n    <NIFReceptor>71728851Q</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFactura>\n    <NumeroFacturaCompleto>1</NumeroFacturaCompleto>\n    <FechaHoraExpedicion>2026-02-23T11:14:00.000Z</FechaHoraExpedicion>\n    <TipoFactura>ORDINARIA</TipoFactura>\n    <ImporteTotalFactura>60.5</ImporteTotalFactura>\n  </DatosFactura>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>50</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>10.5</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>0</NumRegistroAnterior>\n    <NumRegistroActual>1</NumRegistroActual>\n    <HashRegistroAnterior>0000000000000000000000000000000000000000000000000000000000000000</HashRegistroAnterior>\n    <HashRegistroPropio>bc3ffd016809e337cacb00eaab98ba4d0a5131f736339d8019f70997ba195152</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</FacturaNoVerifactu>', 'bc3ffd016809e337cacb00eaab98ba4d0a5131f736339d8019f70997ba195152', '0000000000000000000000000000000000000000000000000000000000000000', NULL, 'ALTA', 1, 1, 0),
(240, 2, '2026-02-23T11:16:23.833Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroFacturaRectificativaNoVerifactu xmlns=\"https://noverifactu.local/esquema/rectificativa\">\n  <Cabecera>\n    <TipoRegistro>RECTIFICATIVA</TipoRegistro>\n    <NIFEmisor>71902382N</NIFEmisor>\n    <NIFReceptor>71728851Q</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFacturaRectificativa>\n    <NumeroFacturaRectificativa>1-R1</NumeroFacturaRectificativa>\n    <FechaHoraExpedicion>2026-02-23T11:15:00.000Z</FechaHoraExpedicion>\n    <TipoRectificacion>DIFERENCIAS</TipoRectificacion>\n    <ImporteTotalRectificativa>54.45</ImporteTotalRectificativa>\n  </DatosFacturaRectificativa>\n  <ReferenciaFacturaOriginal>\n    <NumeroFacturaOriginal>1</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-23T11:14:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroFacturaOriginal>bc3ffd016809e337cacb00eaab98ba4d0a5131f736339d8019f70997ba195152</HashRegistroFacturaOriginal>\n  </ReferenciaFacturaOriginal>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>45</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>9.45</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>1</NumRegistroAnterior>\n    <NumRegistroActual>2</NumRegistroActual>\n    <HashRegistroAnterior>bc3ffd016809e337cacb00eaab98ba4d0a5131f736339d8019f70997ba195152</HashRegistroAnterior>\n    <HashRegistroPropio>b0e0f47e304c35a851df9456632f7fbdb60ed9589aef02682ca1d7f29dd1f03a</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroFacturaRectificativaNoVerifactu>', 'b0e0f47e304c35a851df9456632f7fbdb60ed9589aef02682ca1d7f29dd1f03a', 'bc3ffd016809e337cacb00eaab98ba4d0a5131f736339d8019f70997ba195152', NULL, 'RECTIFICATIVA', 2, 1, 0),
(241, 2, '2026-02-23T12:09:42.347Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<FacturaNoVerifactu xmlns=\"https://noverifactu.local/esquema\">\n  <Cabecera>\n    <NIFEmisor>71902382N</NIFEmisor>\n    <NIFReceptor>76875187X</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFactura>\n    <NumeroFacturaCompleto>2</NumeroFacturaCompleto>\n    <FechaHoraExpedicion>2026-02-23T12:09:00.000Z</FechaHoraExpedicion>\n    <TipoFactura>ORDINARIA</TipoFactura>\n    <ImporteTotalFactura>605</ImporteTotalFactura>\n  </DatosFactura>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>500</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>105</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>2</NumRegistroAnterior>\n    <NumRegistroActual>3</NumRegistroActual>\n    <HashRegistroAnterior>b0e0f47e304c35a851df9456632f7fbdb60ed9589aef02682ca1d7f29dd1f03a</HashRegistroAnterior>\n    <HashRegistroPropio>a18ba101fa07d08ee23bdadf3c7e0905dd0c2d752e90f7b9bbf594d4b94b21f7</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</FacturaNoVerifactu>', 'a18ba101fa07d08ee23bdadf3c7e0905dd0c2d752e90f7b9bbf594d4b94b21f7', 'b0e0f47e304c35a851df9456632f7fbdb60ed9589aef02682ca1d7f29dd1f03a', NULL, 'ALTA', 3, 1, 0),
(243, 2, '2026-02-24T14:20:55.907Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroFacturaRectificativaNoVerifactu xmlns=\"https://noverifactu.local/esquema/rectificativa\">\n  <Cabecera>\n    <TipoRegistro>RECTIFICATIVA</TipoRegistro>\n    <NIFEmisor>71902382N</NIFEmisor>\n    <NIFReceptor>11398800T</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFacturaRectificativa>\n    <NumeroFacturaRectificativa>2-R1</NumeroFacturaRectificativa>\n    <FechaHoraExpedicion>2026-02-24T14:20:00.000Z</FechaHoraExpedicion>\n    <TipoRectificacion>SUSTITUCION</TipoRectificacion>\n    <ImporteTotalRectificativa>605</ImporteTotalRectificativa>\n  </DatosFacturaRectificativa>\n  <ReferenciaFacturaOriginal>\n    <NumeroFacturaOriginal>2</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-23T12:09:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroFacturaOriginal>a18ba101fa07d08ee23bdadf3c7e0905dd0c2d752e90f7b9bbf594d4b94b21f7</HashRegistroFacturaOriginal>\n  </ReferenciaFacturaOriginal>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>500</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>105</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>3</NumRegistroAnterior>\n    <NumRegistroActual>4</NumRegistroActual>\n    <HashRegistroAnterior>a18ba101fa07d08ee23bdadf3c7e0905dd0c2d752e90f7b9bbf594d4b94b21f7</HashRegistroAnterior>\n    <HashRegistroPropio>ebe66775bed31465b830b5a7d88e724f7a3b14a2ca24eb171557e147154ae5d9</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroFacturaRectificativaNoVerifactu>', 'ebe66775bed31465b830b5a7d88e724f7a3b14a2ca24eb171557e147154ae5d9', 'a18ba101fa07d08ee23bdadf3c7e0905dd0c2d752e90f7b9bbf594d4b94b21f7', NULL, 'RECTIFICATIVA', 4, 1, 0),
(244, 2, '2026-02-24T14:22:01.571Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<FacturaNoVerifactu xmlns=\"https://noverifactu.local/esquema\">\n  <Cabecera>\n    <NIFEmisor>71902382N</NIFEmisor>\n    <NIFReceptor>76875187X</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFactura>\n    <NumeroFacturaCompleto>3</NumeroFacturaCompleto>\n    <FechaHoraExpedicion>2026-02-24T14:21:00.000Z</FechaHoraExpedicion>\n    <TipoFactura>ORDINARIA</TipoFactura>\n    <ImporteTotalFactura>423.5</ImporteTotalFactura>\n  </DatosFactura>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>350</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>73.5</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>4</NumRegistroAnterior>\n    <NumRegistroActual>5</NumRegistroActual>\n    <HashRegistroAnterior>ebe66775bed31465b830b5a7d88e724f7a3b14a2ca24eb171557e147154ae5d9</HashRegistroAnterior>\n    <HashRegistroPropio>a51a88a66a6676e562c2b6ef5a485c9e0a660d3006cd9c5aa7b4739da7df4db0</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</FacturaNoVerifactu>', 'a51a88a66a6676e562c2b6ef5a485c9e0a660d3006cd9c5aa7b4739da7df4db0', 'ebe66775bed31465b830b5a7d88e724f7a3b14a2ca24eb171557e147154ae5d9', NULL, 'ALTA', 5, 1, 0),
(245, 2, '2026-02-24T14:22:37.218Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroFacturaRectificativaNoVerifactu xmlns=\"https://noverifactu.local/esquema/rectificativa\">\n  <Cabecera>\n    <TipoRegistro>RECTIFICATIVA</TipoRegistro>\n    <NIFEmisor>71902382N</NIFEmisor>\n    <NIFReceptor>76875187X</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFacturaRectificativa>\n    <NumeroFacturaRectificativa>3-R1</NumeroFacturaRectificativa>\n    <FechaHoraExpedicion>2026-02-24T14:22:00.000Z</FechaHoraExpedicion>\n    <TipoRectificacion>DIFERENCIAS</TipoRectificacion>\n    <ImporteTotalRectificativa>60.5</ImporteTotalRectificativa>\n  </DatosFacturaRectificativa>\n  <ReferenciaFacturaOriginal>\n    <NumeroFacturaOriginal>3</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-24T14:21:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroFacturaOriginal>a51a88a66a6676e562c2b6ef5a485c9e0a660d3006cd9c5aa7b4739da7df4db0</HashRegistroFacturaOriginal>\n  </ReferenciaFacturaOriginal>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>50</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>10.5</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>5</NumRegistroAnterior>\n    <NumRegistroActual>6</NumRegistroActual>\n    <HashRegistroAnterior>a51a88a66a6676e562c2b6ef5a485c9e0a660d3006cd9c5aa7b4739da7df4db0</HashRegistroAnterior>\n    <HashRegistroPropio>fbc46633fb2e279bd5b24fb163df576ed8fce90bb208a8ffedea10d771bbcae1</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroFacturaRectificativaNoVerifactu>', 'fbc46633fb2e279bd5b24fb163df576ed8fce90bb208a8ffedea10d771bbcae1', 'a51a88a66a6676e562c2b6ef5a485c9e0a660d3006cd9c5aa7b4739da7df4db0', NULL, 'RECTIFICATIVA', 6, 1, 0),
(246, 2, '2026-02-24T14:58:36.626Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroAnulacionNoVerifactu xmlns=\"https://noverifactu.local/esquema/anulacion\">\n  <Cabecera>\n    <NIFEmisor>71902382N</NIFEmisor>\n    <VersionSIF>1.0.0</VersionSIF>\n    <FechaHoraAnulacion>2026-02-24T14:58:36.626Z</FechaHoraAnulacion>\n  </Cabecera>\n  <ReferenciaRegistroAnulado>\n    <NumeroFacturaOriginal>3-R1</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-24T14:22:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroAnulado>fbc46633fb2e279bd5b24fb163df576ed8fce90bb208a8ffedea10d771bbcae1</HashRegistroAnulado>\n    <MotivoAnulacion>Modificación PDF</MotivoAnulacion>\n  </ReferenciaRegistroAnulado>\n  <Trazabilidad>\n    <NumRegistroAnterior>6</NumRegistroAnterior>\n    <NumRegistroActual>7</NumRegistroActual>\n    <HashRegistroAnterior>fbc46633fb2e279bd5b24fb163df576ed8fce90bb208a8ffedea10d771bbcae1</HashRegistroAnterior>\n    <HashRegistroPropio>3503f3ffdbdaebb652a0b4b886008836b759c2ea9fd444425d25d00375a97c01</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroAnulacionNoVerifactu>', '3503f3ffdbdaebb652a0b4b886008836b759c2ea9fd444425d25d00375a97c01', 'fbc46633fb2e279bd5b24fb163df576ed8fce90bb208a8ffedea10d771bbcae1', NULL, 'ANULACION', 7, 1, 0),
(248, 2, '2026-02-24T15:03:51.727Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroFacturaRectificativaNoVerifactu xmlns=\"https://noverifactu.local/esquema/rectificativa\">\n  <Cabecera>\n    <TipoRegistro>RECTIFICATIVA</TipoRegistro>\n    <NIFEmisor>71902382N</NIFEmisor>\n    <NIFReceptor>76875187X</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFacturaRectificativa>\n    <NumeroFacturaRectificativa>3-R2</NumeroFacturaRectificativa>\n    <FechaHoraExpedicion>2026-02-24T15:03:00.000Z</FechaHoraExpedicion>\n    <TipoRectificacion>DIFERENCIAS</TipoRectificacion>\n    <ImporteTotalRectificativa>484</ImporteTotalRectificativa>\n  </DatosFacturaRectificativa>\n  <ReferenciaFacturaOriginal>\n    <NumeroFacturaOriginal>3</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-24T14:21:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroFacturaOriginal>a51a88a66a6676e562c2b6ef5a485c9e0a660d3006cd9c5aa7b4739da7df4db0</HashRegistroFacturaOriginal>\n  </ReferenciaFacturaOriginal>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>400</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>84</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>7</NumRegistroAnterior>\n    <NumRegistroActual>8</NumRegistroActual>\n    <HashRegistroAnterior>3503f3ffdbdaebb652a0b4b886008836b759c2ea9fd444425d25d00375a97c01</HashRegistroAnterior>\n    <HashRegistroPropio>17fadba968b8f444b2fda9d7b59c9877c2ba260287e307f9009f9cb5b92eb989</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroFacturaRectificativaNoVerifactu>', '17fadba968b8f444b2fda9d7b59c9877c2ba260287e307f9009f9cb5b92eb989', '3503f3ffdbdaebb652a0b4b886008836b759c2ea9fd444425d25d00375a97c01', NULL, 'RECTIFICATIVA', 8, 1, 0),
(249, 2, '2026-02-24T15:04:30.595Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroAnulacionNoVerifactu xmlns=\"https://noverifactu.local/esquema/anulacion\">\n  <Cabecera>\n    <NIFEmisor>71902382N</NIFEmisor>\n    <VersionSIF>1.0.0</VersionSIF>\n    <FechaHoraAnulacion>2026-02-24T15:04:30.595Z</FechaHoraAnulacion>\n  </Cabecera>\n  <ReferenciaRegistroAnulado>\n    <NumeroFacturaOriginal>3-R2</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-24T15:03:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroAnulado>17fadba968b8f444b2fda9d7b59c9877c2ba260287e307f9009f9cb5b92eb989</HashRegistroAnulado>\n    <MotivoAnulacion>Error en cambios internos</MotivoAnulacion>\n  </ReferenciaRegistroAnulado>\n  <Trazabilidad>\n    <NumRegistroAnterior>8</NumRegistroAnterior>\n    <NumRegistroActual>9</NumRegistroActual>\n    <HashRegistroAnterior>17fadba968b8f444b2fda9d7b59c9877c2ba260287e307f9009f9cb5b92eb989</HashRegistroAnterior>\n    <HashRegistroPropio>fd085478cf1b57e41bf300028af47416042403c746bd388acb88001c4f2780cb</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroAnulacionNoVerifactu>', 'fd085478cf1b57e41bf300028af47416042403c746bd388acb88001c4f2780cb', '17fadba968b8f444b2fda9d7b59c9877c2ba260287e307f9009f9cb5b92eb989', NULL, 'ANULACION', 9, 1, 0),
(250, 2, '2026-02-24T15:20:12.356Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroFacturaRectificativaNoVerifactu xmlns=\"https://noverifactu.local/esquema/rectificativa\">\n  <Cabecera>\n    <TipoRegistro>RECTIFICATIVA</TipoRegistro>\n    <NIFEmisor>71902382N</NIFEmisor>\n    <NIFReceptor>76875187X</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFacturaRectificativa>\n    <NumeroFacturaRectificativa>3-R3</NumeroFacturaRectificativa>\n    <FechaHoraExpedicion>2026-02-24T15:20:00.000Z</FechaHoraExpedicion>\n    <TipoRectificacion>DIFERENCIAS</TipoRectificacion>\n    <ImporteTotalRectificativa>60.5</ImporteTotalRectificativa>\n  </DatosFacturaRectificativa>\n  <ReferenciaFacturaOriginal>\n    <NumeroFacturaOriginal>3</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-24T14:21:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroFacturaOriginal>a51a88a66a6676e562c2b6ef5a485c9e0a660d3006cd9c5aa7b4739da7df4db0</HashRegistroFacturaOriginal>\n  </ReferenciaFacturaOriginal>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>50</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>10.5</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>9</NumRegistroAnterior>\n    <NumRegistroActual>10</NumRegistroActual>\n    <HashRegistroAnterior>fd085478cf1b57e41bf300028af47416042403c746bd388acb88001c4f2780cb</HashRegistroAnterior>\n    <HashRegistroPropio>92c4b3bb1ff6e14c172fd558ad6b1a26d1c1a52e8ef6f4cfb7f5067e642cd86a</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroFacturaRectificativaNoVerifactu>', '92c4b3bb1ff6e14c172fd558ad6b1a26d1c1a52e8ef6f4cfb7f5067e642cd86a', 'fd085478cf1b57e41bf300028af47416042403c746bd388acb88001c4f2780cb', NULL, 'RECTIFICATIVA', 10, 1, 0),
(251, 2, '2026-02-24T15:20:33.380Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroAnulacionNoVerifactu xmlns=\"https://noverifactu.local/esquema/anulacion\">\n  <Cabecera>\n    <NIFEmisor>71902382N</NIFEmisor>\n    <VersionSIF>1.0.0</VersionSIF>\n    <FechaHoraAnulacion>2026-02-24T15:20:33.380Z</FechaHoraAnulacion>\n  </Cabecera>\n  <ReferenciaRegistroAnulado>\n    <NumeroFacturaOriginal>3-R3</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-24T15:20:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroAnulado>92c4b3bb1ff6e14c172fd558ad6b1a26d1c1a52e8ef6f4cfb7f5067e642cd86a</HashRegistroAnulado>\n    <MotivoAnulacion>PDF incoherente</MotivoAnulacion>\n  </ReferenciaRegistroAnulado>\n  <Trazabilidad>\n    <NumRegistroAnterior>10</NumRegistroAnterior>\n    <NumRegistroActual>11</NumRegistroActual>\n    <HashRegistroAnterior>92c4b3bb1ff6e14c172fd558ad6b1a26d1c1a52e8ef6f4cfb7f5067e642cd86a</HashRegistroAnterior>\n    <HashRegistroPropio>c792723eda8ad54743ce4f228393a58c7d0a3444ca67a2e92e145d1e65d8f766</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroAnulacionNoVerifactu>', 'c792723eda8ad54743ce4f228393a58c7d0a3444ca67a2e92e145d1e65d8f766', '92c4b3bb1ff6e14c172fd558ad6b1a26d1c1a52e8ef6f4cfb7f5067e642cd86a', NULL, 'ANULACION', 11, 1, 0),
(252, 2, '2026-02-24T15:23:04.593Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroFacturaRectificativaNoVerifactu xmlns=\"https://noverifactu.local/esquema/rectificativa\">\n  <Cabecera>\n    <TipoRegistro>RECTIFICATIVA</TipoRegistro>\n    <NIFEmisor>71902382N</NIFEmisor>\n    <NIFReceptor>76875187X</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFacturaRectificativa>\n    <NumeroFacturaRectificativa>3-R4</NumeroFacturaRectificativa>\n    <FechaHoraExpedicion>2026-02-24T15:22:00.000Z</FechaHoraExpedicion>\n    <TipoRectificacion>DIFERENCIAS</TipoRectificacion>\n    <ImporteTotalRectificativa>60.5</ImporteTotalRectificativa>\n  </DatosFacturaRectificativa>\n  <ReferenciaFacturaOriginal>\n    <NumeroFacturaOriginal>3</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-24T14:21:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroFacturaOriginal>a51a88a66a6676e562c2b6ef5a485c9e0a660d3006cd9c5aa7b4739da7df4db0</HashRegistroFacturaOriginal>\n  </ReferenciaFacturaOriginal>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>50</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>10.5</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>11</NumRegistroAnterior>\n    <NumRegistroActual>12</NumRegistroActual>\n    <HashRegistroAnterior>c792723eda8ad54743ce4f228393a58c7d0a3444ca67a2e92e145d1e65d8f766</HashRegistroAnterior>\n    <HashRegistroPropio>3dde1f6249a7338662d6e08814f64888e8d491727ccb558b5a29cbdcbfcdb592</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroFacturaRectificativaNoVerifactu>', '3dde1f6249a7338662d6e08814f64888e8d491727ccb558b5a29cbdcbfcdb592', 'c792723eda8ad54743ce4f228393a58c7d0a3444ca67a2e92e145d1e65d8f766', NULL, 'RECTIFICATIVA', 12, 1, 0),
(253, 2, '2026-02-24T15:24:14.530Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<FacturaNoVerifactu xmlns=\"https://noverifactu.local/esquema\">\n  <Cabecera>\n    <NIFEmisor>71902382N</NIFEmisor>\n    <NIFReceptor>11398800T</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFactura>\n    <NumeroFacturaCompleto>4</NumeroFacturaCompleto>\n    <FechaHoraExpedicion>2026-02-24T15:23:00.000Z</FechaHoraExpedicion>\n    <TipoFactura>ORDINARIA</TipoFactura>\n    <ImporteTotalFactura>484</ImporteTotalFactura>\n  </DatosFactura>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>400</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>84</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>12</NumRegistroAnterior>\n    <NumRegistroActual>13</NumRegistroActual>\n    <HashRegistroAnterior>3dde1f6249a7338662d6e08814f64888e8d491727ccb558b5a29cbdcbfcdb592</HashRegistroAnterior>\n    <HashRegistroPropio>4494a98911a23cb9f75cfb0134ab2fac99577bf8b4ebe5d8e205adb661c1f377</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</FacturaNoVerifactu>', '4494a98911a23cb9f75cfb0134ab2fac99577bf8b4ebe5d8e205adb661c1f377', '3dde1f6249a7338662d6e08814f64888e8d491727ccb558b5a29cbdcbfcdb592', NULL, 'ALTA', 13, 1, 0),
(254, 2, '2026-02-24T15:24:41.501Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroFacturaRectificativaNoVerifactu xmlns=\"https://noverifactu.local/esquema/rectificativa\">\n  <Cabecera>\n    <TipoRegistro>RECTIFICATIVA</TipoRegistro>\n    <NIFEmisor>71902382N</NIFEmisor>\n    <NIFReceptor>71728851Q</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFacturaRectificativa>\n    <NumeroFacturaRectificativa>4-R1</NumeroFacturaRectificativa>\n    <FechaHoraExpedicion>2026-02-24T15:24:00.000Z</FechaHoraExpedicion>\n    <TipoRectificacion>SUSTITUCION</TipoRectificacion>\n    <ImporteTotalRectificativa>302.5</ImporteTotalRectificativa>\n  </DatosFacturaRectificativa>\n  <ReferenciaFacturaOriginal>\n    <NumeroFacturaOriginal>4</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-24T15:23:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroFacturaOriginal>4494a98911a23cb9f75cfb0134ab2fac99577bf8b4ebe5d8e205adb661c1f377</HashRegistroFacturaOriginal>\n  </ReferenciaFacturaOriginal>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>250</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>52.5</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>13</NumRegistroAnterior>\n    <NumRegistroActual>14</NumRegistroActual>\n    <HashRegistroAnterior>4494a98911a23cb9f75cfb0134ab2fac99577bf8b4ebe5d8e205adb661c1f377</HashRegistroAnterior>\n    <HashRegistroPropio>ed4a0ab031ccca408cf5934e8d6218b7083f1ecd81b2f210873d96197d47f368</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroFacturaRectificativaNoVerifactu>', 'ed4a0ab031ccca408cf5934e8d6218b7083f1ecd81b2f210873d96197d47f368', '4494a98911a23cb9f75cfb0134ab2fac99577bf8b4ebe5d8e205adb661c1f377', NULL, 'RECTIFICATIVA', 14, 1, 0),
(255, 4, '2026-02-25T11:33:13.494Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<FacturaNoVerifactu xmlns=\"https://noverifactu.local/esquema\">\n  <Cabecera>\n    <NIFEmisor>15845447B</NIFEmisor>\n    <NIFReceptor>71902382N</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFactura>\n    <NumeroFacturaCompleto>1</NumeroFacturaCompleto>\n    <FechaHoraExpedicion>2026-02-25T09:30:00.000Z</FechaHoraExpedicion>\n    <TipoFactura>ORDINARIA</TipoFactura>\n    <ImporteTotalFactura>701.8</ImporteTotalFactura>\n  </DatosFactura>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>580</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>121.8</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>0</NumRegistroAnterior>\n    <NumRegistroActual>1</NumRegistroActual>\n    <HashRegistroAnterior>0000000000000000000000000000000000000000000000000000000000000000</HashRegistroAnterior>\n    <HashRegistroPropio>64a45cb3c5bf8b39ed72bcebec94f3217a60b623b387d5e4d3a6617c49e3d8bc</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</FacturaNoVerifactu>', '64a45cb3c5bf8b39ed72bcebec94f3217a60b623b387d5e4d3a6617c49e3d8bc', '0000000000000000000000000000000000000000000000000000000000000000', NULL, 'ALTA', 1, 1, 0),
(256, 4, '2026-02-25T15:21:18.336Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<FacturaNoVerifactu xmlns=\"https://noverifactu.local/esquema\">\n  <Cabecera>\n    <NIFEmisor>15845447B</NIFEmisor>\n    <NIFReceptor>71902382N</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFactura>\n    <NumeroFacturaCompleto>2</NumeroFacturaCompleto>\n    <FechaHoraExpedicion>2026-02-25T14:30:00.000Z</FechaHoraExpedicion>\n    <TipoFactura>ORDINARIA</TipoFactura>\n    <ImporteTotalFactura>459.8</ImporteTotalFactura>\n  </DatosFactura>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>380</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>79.8</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>1</NumRegistroAnterior>\n    <NumRegistroActual>2</NumRegistroActual>\n    <HashRegistroAnterior>64a45cb3c5bf8b39ed72bcebec94f3217a60b623b387d5e4d3a6617c49e3d8bc</HashRegistroAnterior>\n    <HashRegistroPropio>0ad2985be43c57831dbaf91b6b69d9e5b0507e822cf52ef8ceaef5f78ddfb8f1</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</FacturaNoVerifactu>', '0ad2985be43c57831dbaf91b6b69d9e5b0507e822cf52ef8ceaef5f78ddfb8f1', '64a45cb3c5bf8b39ed72bcebec94f3217a60b623b387d5e4d3a6617c49e3d8bc', NULL, 'ALTA', 2, 1, 0),
(257, 4, '2026-02-25T15:24:22.178Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroFacturaRectificativaNoVerifactu xmlns=\"https://noverifactu.local/esquema/rectificativa\">\n  <Cabecera>\n    <TipoRegistro>RECTIFICATIVA</TipoRegistro>\n    <NIFEmisor>15845447B</NIFEmisor>\n    <NIFReceptor>87163521F</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFacturaRectificativa>\n    <NumeroFacturaRectificativa>1-R1</NumeroFacturaRectificativa>\n    <FechaHoraExpedicion>2026-02-25T14:30:00.000Z</FechaHoraExpedicion>\n    <TipoRectificacion>SUSTITUCION</TipoRectificacion>\n    <ImporteTotalRectificativa>701.8</ImporteTotalRectificativa>\n  </DatosFacturaRectificativa>\n  <ReferenciaFacturaOriginal>\n    <NumeroFacturaOriginal>1</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-25T09:30:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroFacturaOriginal>64a45cb3c5bf8b39ed72bcebec94f3217a60b623b387d5e4d3a6617c49e3d8bc</HashRegistroFacturaOriginal>\n  </ReferenciaFacturaOriginal>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>580</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>121.8</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>2</NumRegistroAnterior>\n    <NumRegistroActual>3</NumRegistroActual>\n    <HashRegistroAnterior>0ad2985be43c57831dbaf91b6b69d9e5b0507e822cf52ef8ceaef5f78ddfb8f1</HashRegistroAnterior>\n    <HashRegistroPropio>ab3f8096b237baa35cd95e986321327b93f6554dfbf5657405b92af0da439117</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroFacturaRectificativaNoVerifactu>', 'ab3f8096b237baa35cd95e986321327b93f6554dfbf5657405b92af0da439117', '0ad2985be43c57831dbaf91b6b69d9e5b0507e822cf52ef8ceaef5f78ddfb8f1', NULL, 'RECTIFICATIVA', 3, 1, 0),
(258, 4, '2026-02-26T10:01:21.369Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroFacturaRectificativaNoVerifactu xmlns=\"https://noverifactu.local/esquema/rectificativa\">\n  <Cabecera>\n    <TipoRegistro>RECTIFICATIVA</TipoRegistro>\n    <NIFEmisor>15845447B</NIFEmisor>\n    <NIFReceptor>71902382N</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFacturaRectificativa>\n    <NumeroFacturaRectificativa>2-R1</NumeroFacturaRectificativa>\n    <FechaHoraExpedicion>2026-02-25T15:20:00.000Z</FechaHoraExpedicion>\n    <TipoRectificacion>DIFERENCIAS</TipoRectificacion>\n    <ImporteTotalRectificativa>-157.3</ImporteTotalRectificativa>\n  </DatosFacturaRectificativa>\n  <ReferenciaFacturaOriginal>\n    <NumeroFacturaOriginal>2</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-25T14:30:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroFacturaOriginal>0ad2985be43c57831dbaf91b6b69d9e5b0507e822cf52ef8ceaef5f78ddfb8f1</HashRegistroFacturaOriginal>\n  </ReferenciaFacturaOriginal>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>-130</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>-27.3</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>3</NumRegistroAnterior>\n    <NumRegistroActual>4</NumRegistroActual>\n    <HashRegistroAnterior>ab3f8096b237baa35cd95e986321327b93f6554dfbf5657405b92af0da439117</HashRegistroAnterior>\n    <HashRegistroPropio>e8b0e3709933594065bc76061658c6dab94c99bec4e846d58f5acd883f57c466</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroFacturaRectificativaNoVerifactu>', 'e8b0e3709933594065bc76061658c6dab94c99bec4e846d58f5acd883f57c466', 'ab3f8096b237baa35cd95e986321327b93f6554dfbf5657405b92af0da439117', NULL, 'RECTIFICATIVA', 4, 1, 0),
(259, 4, '2026-02-26T10:17:35.957Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<FacturaNoVerifactu xmlns=\"https://noverifactu.local/esquema\">\n  <Cabecera>\n    <NIFEmisor>15845447B</NIFEmisor>\n    <NIFReceptor>71902382N</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFactura>\n    <NumeroFacturaCompleto>3</NumeroFacturaCompleto>\n    <FechaHoraExpedicion>2026-02-26T10:17:00.000Z</FechaHoraExpedicion>\n    <TipoFactura>ORDINARIA</TipoFactura>\n    <ImporteTotalFactura>242</ImporteTotalFactura>\n  </DatosFactura>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>200</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>42</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>4</NumRegistroAnterior>\n    <NumRegistroActual>5</NumRegistroActual>\n    <HashRegistroAnterior>e8b0e3709933594065bc76061658c6dab94c99bec4e846d58f5acd883f57c466</HashRegistroAnterior>\n    <HashRegistroPropio>dbc9077ba8b949d871e8299d71fc14f6fc0309673488f74b06bd52723c528114</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</FacturaNoVerifactu>', 'dbc9077ba8b949d871e8299d71fc14f6fc0309673488f74b06bd52723c528114', 'e8b0e3709933594065bc76061658c6dab94c99bec4e846d58f5acd883f57c466', NULL, 'ALTA', 5, 1, 0),
(260, 4, '2026-02-26T10:17:58.869Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroFacturaRectificativaNoVerifactu xmlns=\"https://noverifactu.local/esquema/rectificativa\">\n  <Cabecera>\n    <TipoRegistro>RECTIFICATIVA</TipoRegistro>\n    <NIFEmisor>15845447B</NIFEmisor>\n    <NIFReceptor>71902382N</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFacturaRectificativa>\n    <NumeroFacturaRectificativa>3-R1</NumeroFacturaRectificativa>\n    <FechaHoraExpedicion>2026-02-26T10:17:00.000Z</FechaHoraExpedicion>\n    <TipoRectificacion>DIFERENCIAS</TipoRectificacion>\n    <ImporteTotalRectificativa>121</ImporteTotalRectificativa>\n  </DatosFacturaRectificativa>\n  <ReferenciaFacturaOriginal>\n    <NumeroFacturaOriginal>3</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-26T10:17:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroFacturaOriginal>dbc9077ba8b949d871e8299d71fc14f6fc0309673488f74b06bd52723c528114</HashRegistroFacturaOriginal>\n  </ReferenciaFacturaOriginal>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>100</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>21</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>5</NumRegistroAnterior>\n    <NumRegistroActual>6</NumRegistroActual>\n    <HashRegistroAnterior>dbc9077ba8b949d871e8299d71fc14f6fc0309673488f74b06bd52723c528114</HashRegistroAnterior>\n    <HashRegistroPropio>ca05e6c9ca182c993d6eb90479de1d881edd64f0423309e7bf5f6ce74ab5d0e5</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroFacturaRectificativaNoVerifactu>', 'ca05e6c9ca182c993d6eb90479de1d881edd64f0423309e7bf5f6ce74ab5d0e5', 'dbc9077ba8b949d871e8299d71fc14f6fc0309673488f74b06bd52723c528114', NULL, 'RECTIFICATIVA', 6, 1, 0),
(261, 4, '2026-02-26T10:19:19.809Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<FacturaNoVerifactu xmlns=\"https://noverifactu.local/esquema\">\n  <Cabecera>\n    <NIFEmisor>15845447B</NIFEmisor>\n    <NIFReceptor>87163521F</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFactura>\n    <NumeroFacturaCompleto>4</NumeroFacturaCompleto>\n    <FechaHoraExpedicion>2026-02-26T10:19:00.000Z</FechaHoraExpedicion>\n    <TipoFactura>ORDINARIA</TipoFactura>\n    <ImporteTotalFactura>847</ImporteTotalFactura>\n  </DatosFactura>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>700</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>147</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>6</NumRegistroAnterior>\n    <NumRegistroActual>7</NumRegistroActual>\n    <HashRegistroAnterior>ca05e6c9ca182c993d6eb90479de1d881edd64f0423309e7bf5f6ce74ab5d0e5</HashRegistroAnterior>\n    <HashRegistroPropio>9e373acb5ea63b751b3105bf55415a7d7466e0400a7df96ef7b10b8cd2c721a8</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</FacturaNoVerifactu>', '9e373acb5ea63b751b3105bf55415a7d7466e0400a7df96ef7b10b8cd2c721a8', 'ca05e6c9ca182c993d6eb90479de1d881edd64f0423309e7bf5f6ce74ab5d0e5', NULL, 'ALTA', 7, 1, 0),
(262, 4, '2026-02-26T11:15:44.687Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroAnulacionNoVerifactu xmlns=\"https://noverifactu.local/esquema/anulacion\">\n  <Cabecera>\n    <NIFEmisor>15845447B</NIFEmisor>\n    <VersionSIF>1.0.0</VersionSIF>\n    <FechaHoraAnulacion>2026-02-26T11:15:44.687Z</FechaHoraAnulacion>\n  </Cabecera>\n  <ReferenciaRegistroAnulado>\n    <NumeroFacturaOriginal>3-R1</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-26T10:17:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroAnulado>ca05e6c9ca182c993d6eb90479de1d881edd64f0423309e7bf5f6ce74ab5d0e5</HashRegistroAnulado>\n    <MotivoAnulacion>Error en pdf</MotivoAnulacion>\n  </ReferenciaRegistroAnulado>\n  <Trazabilidad>\n    <NumRegistroAnterior>7</NumRegistroAnterior>\n    <NumRegistroActual>8</NumRegistroActual>\n    <HashRegistroAnterior>9e373acb5ea63b751b3105bf55415a7d7466e0400a7df96ef7b10b8cd2c721a8</HashRegistroAnterior>\n    <HashRegistroPropio>51eff76d221d8117b6a0ae8d27c595cdc563b5e9bcc23cabbe7a4b94705b13ec</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroAnulacionNoVerifactu>', '51eff76d221d8117b6a0ae8d27c595cdc563b5e9bcc23cabbe7a4b94705b13ec', '9e373acb5ea63b751b3105bf55415a7d7466e0400a7df96ef7b10b8cd2c721a8', NULL, 'ANULACION', 8, 1, 0),
(263, 4, '2026-02-26T11:16:28.257Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroFacturaRectificativaNoVerifactu xmlns=\"https://noverifactu.local/esquema/rectificativa\">\n  <Cabecera>\n    <TipoRegistro>RECTIFICATIVA</TipoRegistro>\n    <NIFEmisor>15845447B</NIFEmisor>\n    <NIFReceptor>71902382N</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFacturaRectificativa>\n    <NumeroFacturaRectificativa>3-R2</NumeroFacturaRectificativa>\n    <FechaHoraExpedicion>2026-02-26T11:16:00.000Z</FechaHoraExpedicion>\n    <TipoRectificacion>DIFERENCIAS</TipoRectificacion>\n    <ImporteTotalRectificativa>121</ImporteTotalRectificativa>\n  </DatosFacturaRectificativa>\n  <ReferenciaFacturaOriginal>\n    <NumeroFacturaOriginal>3</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-26T10:17:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroFacturaOriginal>dbc9077ba8b949d871e8299d71fc14f6fc0309673488f74b06bd52723c528114</HashRegistroFacturaOriginal>\n  </ReferenciaFacturaOriginal>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>100</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>21</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>8</NumRegistroAnterior>\n    <NumRegistroActual>9</NumRegistroActual>\n    <HashRegistroAnterior>51eff76d221d8117b6a0ae8d27c595cdc563b5e9bcc23cabbe7a4b94705b13ec</HashRegistroAnterior>\n    <HashRegistroPropio>9d930574de48554fbe9ab8e661b39299eddac596fff4e73b763abc258c304f8b</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroFacturaRectificativaNoVerifactu>', '9d930574de48554fbe9ab8e661b39299eddac596fff4e73b763abc258c304f8b', '51eff76d221d8117b6a0ae8d27c595cdc563b5e9bcc23cabbe7a4b94705b13ec', NULL, 'RECTIFICATIVA', 9, 1, 0),
(264, 4, '2026-02-26T11:22:21.990Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroAnulacionNoVerifactu xmlns=\"https://noverifactu.local/esquema/anulacion\">\n  <Cabecera>\n    <NIFEmisor>15845447B</NIFEmisor>\n    <VersionSIF>1.0.0</VersionSIF>\n    <FechaHoraAnulacion>2026-02-26T11:22:21.990Z</FechaHoraAnulacion>\n  </Cabecera>\n  <ReferenciaRegistroAnulado>\n    <NumeroFacturaOriginal>3-R2</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-26T11:16:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroAnulado>9d930574de48554fbe9ab8e661b39299eddac596fff4e73b763abc258c304f8b</HashRegistroAnulado>\n    <MotivoAnulacion>PDF sin logo</MotivoAnulacion>\n  </ReferenciaRegistroAnulado>\n  <Trazabilidad>\n    <NumRegistroAnterior>9</NumRegistroAnterior>\n    <NumRegistroActual>10</NumRegistroActual>\n    <HashRegistroAnterior>9d930574de48554fbe9ab8e661b39299eddac596fff4e73b763abc258c304f8b</HashRegistroAnterior>\n    <HashRegistroPropio>4903a3cf276c12e0a774447e819d59bb844854636bfa656692e2e08c04afd7a0</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroAnulacionNoVerifactu>', '4903a3cf276c12e0a774447e819d59bb844854636bfa656692e2e08c04afd7a0', '9d930574de48554fbe9ab8e661b39299eddac596fff4e73b763abc258c304f8b', NULL, 'ANULACION', 10, 1, 0),
(265, 4, '2026-02-26T11:22:41.175Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroFacturaRectificativaNoVerifactu xmlns=\"https://noverifactu.local/esquema/rectificativa\">\n  <Cabecera>\n    <TipoRegistro>RECTIFICATIVA</TipoRegistro>\n    <NIFEmisor>15845447B</NIFEmisor>\n    <NIFReceptor>71902382N</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFacturaRectificativa>\n    <NumeroFacturaRectificativa>3-R3</NumeroFacturaRectificativa>\n    <FechaHoraExpedicion>2026-02-26T11:22:00.000Z</FechaHoraExpedicion>\n    <TipoRectificacion>DIFERENCIAS</TipoRectificacion>\n    <ImporteTotalRectificativa>121</ImporteTotalRectificativa>\n  </DatosFacturaRectificativa>\n  <ReferenciaFacturaOriginal>\n    <NumeroFacturaOriginal>3</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-26T10:17:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroFacturaOriginal>dbc9077ba8b949d871e8299d71fc14f6fc0309673488f74b06bd52723c528114</HashRegistroFacturaOriginal>\n  </ReferenciaFacturaOriginal>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>100</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>21</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>10</NumRegistroAnterior>\n    <NumRegistroActual>11</NumRegistroActual>\n    <HashRegistroAnterior>4903a3cf276c12e0a774447e819d59bb844854636bfa656692e2e08c04afd7a0</HashRegistroAnterior>\n    <HashRegistroPropio>00b4e4e5ed89426e234c68168ea0d4e3940f145bc227c3b84714fee6c6eb1219</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroFacturaRectificativaNoVerifactu>', '00b4e4e5ed89426e234c68168ea0d4e3940f145bc227c3b84714fee6c6eb1219', '4903a3cf276c12e0a774447e819d59bb844854636bfa656692e2e08c04afd7a0', NULL, 'RECTIFICATIVA', 11, 1, 0),
(266, 4, '2026-02-26T11:27:56.604Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroAnulacionNoVerifactu xmlns=\"https://noverifactu.local/esquema/anulacion\">\n  <Cabecera>\n    <NIFEmisor>15845447B</NIFEmisor>\n    <VersionSIF>1.0.0</VersionSIF>\n    <FechaHoraAnulacion>2026-02-26T11:27:56.604Z</FechaHoraAnulacion>\n  </Cabecera>\n  <ReferenciaRegistroAnulado>\n    <NumeroFacturaOriginal>3-R3</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-26T11:22:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroAnulado>00b4e4e5ed89426e234c68168ea0d4e3940f145bc227c3b84714fee6c6eb1219</HashRegistroAnulado>\n    <MotivoAnulacion>No sale el logo en el PDF</MotivoAnulacion>\n  </ReferenciaRegistroAnulado>\n  <Trazabilidad>\n    <NumRegistroAnterior>11</NumRegistroAnterior>\n    <NumRegistroActual>12</NumRegistroActual>\n    <HashRegistroAnterior>00b4e4e5ed89426e234c68168ea0d4e3940f145bc227c3b84714fee6c6eb1219</HashRegistroAnterior>\n    <HashRegistroPropio>711ce0dbf4f9073d32161e43b7037231d82f837701c2fda731e2df284798b352</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroAnulacionNoVerifactu>', '711ce0dbf4f9073d32161e43b7037231d82f837701c2fda731e2df284798b352', '00b4e4e5ed89426e234c68168ea0d4e3940f145bc227c3b84714fee6c6eb1219', NULL, 'ANULACION', 12, 1, 0),
(267, 4, '2026-02-26T11:28:15.759Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroFacturaRectificativaNoVerifactu xmlns=\"https://noverifactu.local/esquema/rectificativa\">\n  <Cabecera>\n    <TipoRegistro>RECTIFICATIVA</TipoRegistro>\n    <NIFEmisor>15845447B</NIFEmisor>\n    <NIFReceptor>71902382N</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFacturaRectificativa>\n    <NumeroFacturaRectificativa>3-R4</NumeroFacturaRectificativa>\n    <FechaHoraExpedicion>2026-02-26T11:28:00.000Z</FechaHoraExpedicion>\n    <TipoRectificacion>DIFERENCIAS</TipoRectificacion>\n    <ImporteTotalRectificativa>121</ImporteTotalRectificativa>\n  </DatosFacturaRectificativa>\n  <ReferenciaFacturaOriginal>\n    <NumeroFacturaOriginal>3</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-26T10:17:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroFacturaOriginal>dbc9077ba8b949d871e8299d71fc14f6fc0309673488f74b06bd52723c528114</HashRegistroFacturaOriginal>\n  </ReferenciaFacturaOriginal>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>100</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>21</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>12</NumRegistroAnterior>\n    <NumRegistroActual>13</NumRegistroActual>\n    <HashRegistroAnterior>711ce0dbf4f9073d32161e43b7037231d82f837701c2fda731e2df284798b352</HashRegistroAnterior>\n    <HashRegistroPropio>3441e80b6ee70f4cd6fcaeb62fb059f2d7e40009ae4a677a31cd1a9db102caa1</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroFacturaRectificativaNoVerifactu>', '3441e80b6ee70f4cd6fcaeb62fb059f2d7e40009ae4a677a31cd1a9db102caa1', '711ce0dbf4f9073d32161e43b7037231d82f837701c2fda731e2df284798b352', NULL, 'RECTIFICATIVA', 13, 1, 0);
INSERT INTO `registros_facturacion` (`id`, `usuario_id`, `fecha_hora_generacion`, `contenido_registro`, `hash_registro_actual`, `hash_registro_anterior`, `qr_url`, `estado`, `num_registro`, `sif_config_id`, `invalido`) VALUES
(268, 4, '2026-02-26T11:29:03.959Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<FacturaNoVerifactu xmlns=\"https://noverifactu.local/esquema\">\n  <Cabecera>\n    <NIFEmisor>15845447B</NIFEmisor>\n    <NIFReceptor>87163521F</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFactura>\n    <NumeroFacturaCompleto>5</NumeroFacturaCompleto>\n    <FechaHoraExpedicion>2026-02-26T11:28:00.000Z</FechaHoraExpedicion>\n    <TipoFactura>ORDINARIA</TipoFactura>\n    <ImporteTotalFactura>121</ImporteTotalFactura>\n  </DatosFactura>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>100</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>21</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>13</NumRegistroAnterior>\n    <NumRegistroActual>14</NumRegistroActual>\n    <HashRegistroAnterior>3441e80b6ee70f4cd6fcaeb62fb059f2d7e40009ae4a677a31cd1a9db102caa1</HashRegistroAnterior>\n    <HashRegistroPropio>416259a9d2f517d50d230c5fd993d01bf3f9d6e785c8289b6eaa55ea64ff4dce</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</FacturaNoVerifactu>', '416259a9d2f517d50d230c5fd993d01bf3f9d6e785c8289b6eaa55ea64ff4dce', '3441e80b6ee70f4cd6fcaeb62fb059f2d7e40009ae4a677a31cd1a9db102caa1', NULL, 'ALTA', 14, 1, 0),
(269, 4, '2026-02-26T11:29:26.840Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroFacturaRectificativaNoVerifactu xmlns=\"https://noverifactu.local/esquema/rectificativa\">\n  <Cabecera>\n    <TipoRegistro>RECTIFICATIVA</TipoRegistro>\n    <NIFEmisor>15845447B</NIFEmisor>\n    <NIFReceptor>87163521F</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFacturaRectificativa>\n    <NumeroFacturaRectificativa>5-R1</NumeroFacturaRectificativa>\n    <FechaHoraExpedicion>2026-02-26T11:29:00.000Z</FechaHoraExpedicion>\n    <TipoRectificacion>DIFERENCIAS</TipoRectificacion>\n    <ImporteTotalRectificativa>60.5</ImporteTotalRectificativa>\n  </DatosFacturaRectificativa>\n  <ReferenciaFacturaOriginal>\n    <NumeroFacturaOriginal>5</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-26T11:28:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroFacturaOriginal>416259a9d2f517d50d230c5fd993d01bf3f9d6e785c8289b6eaa55ea64ff4dce</HashRegistroFacturaOriginal>\n  </ReferenciaFacturaOriginal>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>50</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>10.5</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>14</NumRegistroAnterior>\n    <NumRegistroActual>15</NumRegistroActual>\n    <HashRegistroAnterior>416259a9d2f517d50d230c5fd993d01bf3f9d6e785c8289b6eaa55ea64ff4dce</HashRegistroAnterior>\n    <HashRegistroPropio>8adbf89ddd057d89239937749736aa98423df28eee5d18a5d70280875e9604e8</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroFacturaRectificativaNoVerifactu>', '8adbf89ddd057d89239937749736aa98423df28eee5d18a5d70280875e9604e8', '416259a9d2f517d50d230c5fd993d01bf3f9d6e785c8289b6eaa55ea64ff4dce', NULL, 'RECTIFICATIVA', 15, 1, 0),
(270, 4, '2026-02-26T11:52:11.713Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<FacturaNoVerifactu xmlns=\"https://noverifactu.local/esquema\">\n  <Cabecera>\n    <NIFEmisor>15845447B</NIFEmisor>\n    <NIFReceptor>71902382N</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFactura>\n    <NumeroFacturaCompleto>6</NumeroFacturaCompleto>\n    <FechaHoraExpedicion>2026-02-26T11:51:00.000Z</FechaHoraExpedicion>\n    <TipoFactura>ORDINARIA</TipoFactura>\n    <ImporteTotalFactura>217.8</ImporteTotalFactura>\n  </DatosFactura>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>180</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>37.8</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>15</NumRegistroAnterior>\n    <NumRegistroActual>16</NumRegistroActual>\n    <HashRegistroAnterior>8adbf89ddd057d89239937749736aa98423df28eee5d18a5d70280875e9604e8</HashRegistroAnterior>\n    <HashRegistroPropio>38e8035a7a372519ad0c04be2c0bc9cc3285cc4fabb81fbc41cfdeefc7cdbfb7</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</FacturaNoVerifactu>', '38e8035a7a372519ad0c04be2c0bc9cc3285cc4fabb81fbc41cfdeefc7cdbfb7', '8adbf89ddd057d89239937749736aa98423df28eee5d18a5d70280875e9604e8', NULL, 'ALTA', 16, 1, 0),
(271, 4, '2026-02-26T12:00:48.738Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroFacturaRectificativaNoVerifactu xmlns=\"https://noverifactu.local/esquema/rectificativa\">\n  <Cabecera>\n    <TipoRegistro>RECTIFICATIVA</TipoRegistro>\n    <NIFEmisor>15845447B</NIFEmisor>\n    <NIFReceptor>71902382N</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFacturaRectificativa>\n    <NumeroFacturaRectificativa>6-R1</NumeroFacturaRectificativa>\n    <FechaHoraExpedicion>2026-02-26T11:52:00.000Z</FechaHoraExpedicion>\n    <TipoRectificacion>DIFERENCIAS</TipoRectificacion>\n    <ImporteTotalRectificativa>-96.8</ImporteTotalRectificativa>\n  </DatosFacturaRectificativa>\n  <ReferenciaFacturaOriginal>\n    <NumeroFacturaOriginal>6</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-26T11:51:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroFacturaOriginal>38e8035a7a372519ad0c04be2c0bc9cc3285cc4fabb81fbc41cfdeefc7cdbfb7</HashRegistroFacturaOriginal>\n  </ReferenciaFacturaOriginal>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>-80</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>-16.8</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>16</NumRegistroAnterior>\n    <NumRegistroActual>17</NumRegistroActual>\n    <HashRegistroAnterior>38e8035a7a372519ad0c04be2c0bc9cc3285cc4fabb81fbc41cfdeefc7cdbfb7</HashRegistroAnterior>\n    <HashRegistroPropio>a086c38d52e4fcb9217cf41c92f3f015abffb649036864400cc18b24bfa1ba8c</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroFacturaRectificativaNoVerifactu>', 'a086c38d52e4fcb9217cf41c92f3f015abffb649036864400cc18b24bfa1ba8c', '38e8035a7a372519ad0c04be2c0bc9cc3285cc4fabb81fbc41cfdeefc7cdbfb7', NULL, 'RECTIFICATIVA', 17, 1, 0),
(272, 4, '2026-02-26T12:01:16.680Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroAnulacionNoVerifactu xmlns=\"https://noverifactu.local/esquema/anulacion\">\n  <Cabecera>\n    <NIFEmisor>15845447B</NIFEmisor>\n    <VersionSIF>1.0.0</VersionSIF>\n    <FechaHoraAnulacion>2026-02-26T12:01:16.680Z</FechaHoraAnulacion>\n  </Cabecera>\n  <ReferenciaRegistroAnulado>\n    <NumeroFacturaOriginal>6-R1</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-26T11:52:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroAnulado>a086c38d52e4fcb9217cf41c92f3f015abffb649036864400cc18b24bfa1ba8c</HashRegistroAnulado>\n    <MotivoAnulacion>error en lectura pdf</MotivoAnulacion>\n  </ReferenciaRegistroAnulado>\n  <Trazabilidad>\n    <NumRegistroAnterior>17</NumRegistroAnterior>\n    <NumRegistroActual>18</NumRegistroActual>\n    <HashRegistroAnterior>a086c38d52e4fcb9217cf41c92f3f015abffb649036864400cc18b24bfa1ba8c</HashRegistroAnterior>\n    <HashRegistroPropio>e4e2d6d6f7eb7ffb21b2512cc516307732ec35f46fd64260c7f4891f3bd783a1</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroAnulacionNoVerifactu>', 'e4e2d6d6f7eb7ffb21b2512cc516307732ec35f46fd64260c7f4891f3bd783a1', 'a086c38d52e4fcb9217cf41c92f3f015abffb649036864400cc18b24bfa1ba8c', NULL, 'ANULACION', 18, 1, 0),
(273, 4, '2026-02-26T12:09:15.480Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroFacturaRectificativaNoVerifactu xmlns=\"https://noverifactu.local/esquema/rectificativa\">\n  <Cabecera>\n    <TipoRegistro>RECTIFICATIVA</TipoRegistro>\n    <NIFEmisor>15845447B</NIFEmisor>\n    <NIFReceptor>71902382N</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFacturaRectificativa>\n    <NumeroFacturaRectificativa>6-R2</NumeroFacturaRectificativa>\n    <FechaHoraExpedicion>2026-02-26T11:52:00.000Z</FechaHoraExpedicion>\n    <TipoRectificacion>DIFERENCIAS</TipoRectificacion>\n    <ImporteTotalRectificativa>-36.3</ImporteTotalRectificativa>\n  </DatosFacturaRectificativa>\n  <ReferenciaFacturaOriginal>\n    <NumeroFacturaOriginal>6</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-26T11:51:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroFacturaOriginal>38e8035a7a372519ad0c04be2c0bc9cc3285cc4fabb81fbc41cfdeefc7cdbfb7</HashRegistroFacturaOriginal>\n  </ReferenciaFacturaOriginal>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>-30</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>-6.3</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>18</NumRegistroAnterior>\n    <NumRegistroActual>19</NumRegistroActual>\n    <HashRegistroAnterior>e4e2d6d6f7eb7ffb21b2512cc516307732ec35f46fd64260c7f4891f3bd783a1</HashRegistroAnterior>\n    <HashRegistroPropio>cf28ba62c5a8c14ef41b4c1ce69a392a420ed563c88d0c30fe03df2b02677dae</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroFacturaRectificativaNoVerifactu>', 'cf28ba62c5a8c14ef41b4c1ce69a392a420ed563c88d0c30fe03df2b02677dae', 'e4e2d6d6f7eb7ffb21b2512cc516307732ec35f46fd64260c7f4891f3bd783a1', NULL, 'RECTIFICATIVA', 19, 1, 0),
(274, 4, '2026-02-26T12:10:31.628Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroAnulacionNoVerifactu xmlns=\"https://noverifactu.local/esquema/anulacion\">\n  <Cabecera>\n    <NIFEmisor>15845447B</NIFEmisor>\n    <VersionSIF>1.0.0</VersionSIF>\n    <FechaHoraAnulacion>2026-02-26T12:10:31.628Z</FechaHoraAnulacion>\n  </Cabecera>\n  <ReferenciaRegistroAnulado>\n    <NumeroFacturaOriginal>6-R2</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-26T11:52:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroAnulado>cf28ba62c5a8c14ef41b4c1ce69a392a420ed563c88d0c30fe03df2b02677dae</HashRegistroAnulado>\n    <MotivoAnulacion>error</MotivoAnulacion>\n  </ReferenciaRegistroAnulado>\n  <Trazabilidad>\n    <NumRegistroAnterior>19</NumRegistroAnterior>\n    <NumRegistroActual>20</NumRegistroActual>\n    <HashRegistroAnterior>cf28ba62c5a8c14ef41b4c1ce69a392a420ed563c88d0c30fe03df2b02677dae</HashRegistroAnterior>\n    <HashRegistroPropio>2c02b88f4d8b47c86003c2327bf3e316054e1f5b2be739f2beebe93c09ae6673</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroAnulacionNoVerifactu>', '2c02b88f4d8b47c86003c2327bf3e316054e1f5b2be739f2beebe93c09ae6673', 'cf28ba62c5a8c14ef41b4c1ce69a392a420ed563c88d0c30fe03df2b02677dae', NULL, 'ANULACION', 20, 1, 0),
(275, 4, '2026-02-26T12:28:20.667Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroFacturaRectificativaNoVerifactu xmlns=\"https://noverifactu.local/esquema/rectificativa\">\n  <Cabecera>\n    <TipoRegistro>RECTIFICATIVA</TipoRegistro>\n    <NIFEmisor>15845447B</NIFEmisor>\n    <NIFReceptor>71902382N</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFacturaRectificativa>\n    <NumeroFacturaRectificativa>6-R3</NumeroFacturaRectificativa>\n    <FechaHoraExpedicion>2026-02-26T12:02:00.000Z</FechaHoraExpedicion>\n    <TipoRectificacion>DIFERENCIAS</TipoRectificacion>\n    <ImporteTotalRectificativa>-12.1</ImporteTotalRectificativa>\n  </DatosFacturaRectificativa>\n  <ReferenciaFacturaOriginal>\n    <NumeroFacturaOriginal>6</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-26T11:51:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroFacturaOriginal>38e8035a7a372519ad0c04be2c0bc9cc3285cc4fabb81fbc41cfdeefc7cdbfb7</HashRegistroFacturaOriginal>\n  </ReferenciaFacturaOriginal>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>-10</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>-2.1</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>20</NumRegistroAnterior>\n    <NumRegistroActual>21</NumRegistroActual>\n    <HashRegistroAnterior>2c02b88f4d8b47c86003c2327bf3e316054e1f5b2be739f2beebe93c09ae6673</HashRegistroAnterior>\n    <HashRegistroPropio>10aabc3d42790b477782cd1bf33899831c0bf978a470b703a26b46b817824090</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroFacturaRectificativaNoVerifactu>', '10aabc3d42790b477782cd1bf33899831c0bf978a470b703a26b46b817824090', '2c02b88f4d8b47c86003c2327bf3e316054e1f5b2be739f2beebe93c09ae6673', NULL, 'RECTIFICATIVA', 21, 1, 0),
(277, 4, '2026-02-26T12:51:31.768Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<FacturaNoVerifactu xmlns=\"https://noverifactu.local/esquema\">\n  <Cabecera>\n    <NIFEmisor>15845447B</NIFEmisor>\n    <NIFReceptor>G33085333</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFactura>\n    <NumeroFacturaCompleto>F-2026000242</NumeroFacturaCompleto>\n    <FechaHoraExpedicion>2026-02-04T23:00:00.000Z</FechaHoraExpedicion>\n    <TipoFactura>ORDINARIA</TipoFactura>\n    <ImporteTotalFactura>145.93</ImporteTotalFactura>\n  </DatosFactura>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>129.58</BaseImponible>\n        <TipoImpositivo>10</TipoImpositivo>\n        <Cuota>12.96</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n      <Impuesto>\n        <BaseImponible>2.8</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>0.59</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>21</NumRegistroAnterior>\n    <NumRegistroActual>22</NumRegistroActual>\n    <HashRegistroAnterior>10aabc3d42790b477782cd1bf33899831c0bf978a470b703a26b46b817824090</HashRegistroAnterior>\n    <HashRegistroPropio>697c5b82bcdd59d3940ea3ae95148252a28da82daca0bc52180be40a1342516d</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</FacturaNoVerifactu>', '697c5b82bcdd59d3940ea3ae95148252a28da82daca0bc52180be40a1342516d', '10aabc3d42790b477782cd1bf33899831c0bf978a470b703a26b46b817824090', NULL, 'ALTA', 22, 1, 0),
(278, 6, '2026-03-03T10:06:49.393Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<FacturaNoVerifactu xmlns=\"https://noverifactu.local/esquema\">\n  <Cabecera>\n    <NIFEmisor>B13345678</NIFEmisor>\n    <NIFReceptor>71902382N</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFactura>\n    <NumeroFacturaCompleto>1</NumeroFacturaCompleto>\n    <FechaHoraExpedicion>2026-03-03T09:50:00.000Z</FechaHoraExpedicion>\n    <TipoFactura>ORDINARIA</TipoFactura>\n    <ImporteTotalFactura>459.8</ImporteTotalFactura>\n  </DatosFactura>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>380</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>79.8</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>0</NumRegistroAnterior>\n    <NumRegistroActual>1</NumRegistroActual>\n    <HashRegistroAnterior>0000000000000000000000000000000000000000000000000000000000000000</HashRegistroAnterior>\n    <HashRegistroPropio>b4102edecebbe5dd098340de56cc0c44dcf30fcd725f35b63888296193d0c2f9</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</FacturaNoVerifactu>', 'b4102edecebbe5dd098340de56cc0c44dcf30fcd725f35b63888296193d0c2f9', '0000000000000000000000000000000000000000000000000000000000000000', NULL, 'ALTA', 1, 1, 0),
(279, 2, '2026-03-03T11:38:07.976Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<FacturaNoVerifactu xmlns=\"https://noverifactu.local/esquema\">\n  <Cabecera>\n    <NIFEmisor>71902382N</NIFEmisor>\n    <NIFReceptor>71728851Q</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFactura>\n    <NumeroFacturaCompleto>5</NumeroFacturaCompleto>\n    <FechaHoraExpedicion>2026-03-03T11:37:00.000Z</FechaHoraExpedicion>\n    <TipoFactura>ORDINARIA</TipoFactura>\n    <ImporteTotalFactura>121</ImporteTotalFactura>\n  </DatosFactura>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>100</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>21</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>14</NumRegistroAnterior>\n    <NumRegistroActual>15</NumRegistroActual>\n    <HashRegistroAnterior>ed4a0ab031ccca408cf5934e8d6218b7083f1ecd81b2f210873d96197d47f368</HashRegistroAnterior>\n    <HashRegistroPropio>46a7fc3dc7ecf5f3dcaffe645af18e8f2e16c9b7cc4c61e01bd683510e7b2011</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</FacturaNoVerifactu>', '46a7fc3dc7ecf5f3dcaffe645af18e8f2e16c9b7cc4c61e01bd683510e7b2011', 'ed4a0ab031ccca408cf5934e8d6218b7083f1ecd81b2f210873d96197d47f368', NULL, 'ALTA', 15, 1, 0),
(282, 6, '2026-03-03T14:16:40.702Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroFacturaRectificativaNoVerifactu xmlns=\"https://noverifactu.local/esquema/rectificativa\">\n  <Cabecera>\n    <TipoRegistro>RECTIFICATIVA</TipoRegistro>\n    <NIFEmisor>B13345678</NIFEmisor>\n    <NIFReceptor>71902382N</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFacturaRectificativa>\n    <NumeroFacturaRectificativa>1-R1</NumeroFacturaRectificativa>\n    <FechaHoraExpedicion>2026-03-03T13:55:00.000Z</FechaHoraExpedicion>\n    <TipoRectificacion>DIFERENCIAS</TipoRectificacion>\n    <ImporteTotalRectificativa>-36.3</ImporteTotalRectificativa>\n  </DatosFacturaRectificativa>\n  <ReferenciaFacturaOriginal>\n    <NumeroFacturaOriginal>1</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-03-03T09:50:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroFacturaOriginal>b4102edecebbe5dd098340de56cc0c44dcf30fcd725f35b63888296193d0c2f9</HashRegistroFacturaOriginal>\n  </ReferenciaFacturaOriginal>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>-30</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>-6.3</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>1</NumRegistroAnterior>\n    <NumRegistroActual>2</NumRegistroActual>\n    <HashRegistroAnterior>b4102edecebbe5dd098340de56cc0c44dcf30fcd725f35b63888296193d0c2f9</HashRegistroAnterior>\n    <HashRegistroPropio>0826e44821bc80f415679acbcb1cbe460dd425afef6d1d9d894ee8617c215524</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroFacturaRectificativaNoVerifactu>', '0826e44821bc80f415679acbcb1cbe460dd425afef6d1d9d894ee8617c215524', 'b4102edecebbe5dd098340de56cc0c44dcf30fcd725f35b63888296193d0c2f9', NULL, 'RECTIFICATIVA', 2, 1, 0),
(283, 2, '2026-03-03T14:19:20.349Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroAnulacionNoVerifactu xmlns=\"https://noverifactu.local/esquema/anulacion\">\n  <Cabecera>\n    <NIFEmisor>71902382N</NIFEmisor>\n    <VersionSIF>1.0.0</VersionSIF>\n    <FechaHoraAnulacion>2026-03-03T14:19:20.349Z</FechaHoraAnulacion>\n  </Cabecera>\n  <ReferenciaRegistroAnulado>\n    <NumeroFacturaOriginal>5</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-03-03T11:37:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroAnulado>46a7fc3dc7ecf5f3dcaffe645af18e8f2e16c9b7cc4c61e01bd683510e7b2011</HashRegistroAnulado>\n    <MotivoAnulacion>Prueba</MotivoAnulacion>\n  </ReferenciaRegistroAnulado>\n  <Trazabilidad>\n    <NumRegistroAnterior>15</NumRegistroAnterior>\n    <NumRegistroActual>16</NumRegistroActual>\n    <HashRegistroAnterior>46a7fc3dc7ecf5f3dcaffe645af18e8f2e16c9b7cc4c61e01bd683510e7b2011</HashRegistroAnterior>\n    <HashRegistroPropio>f470378777936955f20d81ce26f83b743f589dfb55b46e5b31e8a55bc17ff747</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroAnulacionNoVerifactu>', 'f470378777936955f20d81ce26f83b743f589dfb55b46e5b31e8a55bc17ff747', '46a7fc3dc7ecf5f3dcaffe645af18e8f2e16c9b7cc4c61e01bd683510e7b2011', NULL, 'ANULACION', 16, 1, 0),
(284, 6, '2026-03-03T15:11:56.560Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<FacturaNoVerifactu xmlns=\"https://noverifactu.local/esquema\">\n  <Cabecera>\n    <NIFEmisor>B13345678</NIFEmisor>\n    <NIFReceptor>G33085333</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFactura>\n    <NumeroFacturaCompleto>F-2026000242</NumeroFacturaCompleto>\n    <FechaHoraExpedicion>2026-02-04T23:00:00.000Z</FechaHoraExpedicion>\n    <TipoFactura>ORDINARIA</TipoFactura>\n    <ImporteTotalFactura>145.93</ImporteTotalFactura>\n  </DatosFactura>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>129.58</BaseImponible>\n        <TipoImpositivo>10</TipoImpositivo>\n        <Cuota>12.96</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n      <Impuesto>\n        <BaseImponible>2.8</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>0.59</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>2</NumRegistroAnterior>\n    <NumRegistroActual>3</NumRegistroActual>\n    <HashRegistroAnterior>0826e44821bc80f415679acbcb1cbe460dd425afef6d1d9d894ee8617c215524</HashRegistroAnterior>\n    <HashRegistroPropio>e875c014fcebf89a956655c186c7e8e4ee02bd5b2783e7543ac0dc32ff8f91a1</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</FacturaNoVerifactu>', 'e875c014fcebf89a956655c186c7e8e4ee02bd5b2783e7543ac0dc32ff8f91a1', '0826e44821bc80f415679acbcb1cbe460dd425afef6d1d9d894ee8617c215524', NULL, 'ALTA', 3, 1, 0),
(285, 6, '2026-03-03T15:18:01.740Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroAnulacionNoVerifactu xmlns=\"https://noverifactu.local/esquema/anulacion\">\n  <Cabecera>\n    <NIFEmisor>B13345678</NIFEmisor>\n    <VersionSIF>1.0.0</VersionSIF>\n    <FechaHoraAnulacion>2026-03-03T15:18:01.740Z</FechaHoraAnulacion>\n  </Cabecera>\n  <ReferenciaRegistroAnulado>\n    <NumeroFacturaOriginal>F-2026000242</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-04T23:00:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroAnulado>e875c014fcebf89a956655c186c7e8e4ee02bd5b2783e7543ac0dc32ff8f91a1</HashRegistroAnulado>\n    <MotivoAnulacion>QR no estampado en PDF</MotivoAnulacion>\n  </ReferenciaRegistroAnulado>\n  <Trazabilidad>\n    <NumRegistroAnterior>3</NumRegistroAnterior>\n    <NumRegistroActual>4</NumRegistroActual>\n    <HashRegistroAnterior>e875c014fcebf89a956655c186c7e8e4ee02bd5b2783e7543ac0dc32ff8f91a1</HashRegistroAnterior>\n    <HashRegistroPropio>038b564d9ce423c2ca97ce652b80d7fb30215a36984f9975047698bbff595b0a</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroAnulacionNoVerifactu>', '038b564d9ce423c2ca97ce652b80d7fb30215a36984f9975047698bbff595b0a', 'e875c014fcebf89a956655c186c7e8e4ee02bd5b2783e7543ac0dc32ff8f91a1', NULL, 'ANULACION', 4, 1, 0),
(286, 1, '2026-03-03T15:26:05.088Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<FacturaNoVerifactu xmlns=\"https://noverifactu.local/esquema\">\n  <Cabecera>\n    <NIFEmisor>71895310R</NIFEmisor>\n    <NIFReceptor>G33085333</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFactura>\n    <NumeroFacturaCompleto>F-2026000242</NumeroFacturaCompleto>\n    <FechaHoraExpedicion>2026-02-04T23:00:00.000Z</FechaHoraExpedicion>\n    <TipoFactura>ORDINARIA</TipoFactura>\n    <ImporteTotalFactura>145.93</ImporteTotalFactura>\n  </DatosFactura>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>129.58</BaseImponible>\n        <TipoImpositivo>10</TipoImpositivo>\n        <Cuota>12.96</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n      <Impuesto>\n        <BaseImponible>2.8</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>0.59</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>0</NumRegistroAnterior>\n    <NumRegistroActual>1</NumRegistroActual>\n    <HashRegistroAnterior>0000000000000000000000000000000000000000000000000000000000000000</HashRegistroAnterior>\n    <HashRegistroPropio>f7e1a8ec3a12aa0cfde843e220e54cf4dc8a496e219cd43c95bb81e1434b25cb</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</FacturaNoVerifactu>', 'f7e1a8ec3a12aa0cfde843e220e54cf4dc8a496e219cd43c95bb81e1434b25cb', '0000000000000000000000000000000000000000000000000000000000000000', NULL, 'ALTA', 1, 1, 0),
(287, 1, '2026-03-03T15:26:23.198Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<RegistroAnulacionNoVerifactu xmlns=\"https://noverifactu.local/esquema/anulacion\">\n  <Cabecera>\n    <NIFEmisor>71895310R</NIFEmisor>\n    <VersionSIF>1.0.0</VersionSIF>\n    <FechaHoraAnulacion>2026-03-03T15:26:23.198Z</FechaHoraAnulacion>\n  </Cabecera>\n  <ReferenciaRegistroAnulado>\n    <NumeroFacturaOriginal>F-2026000242</NumeroFacturaOriginal>\n    <FechaHoraExpedicionOriginal>2026-02-04T23:00:00.000Z</FechaHoraExpedicionOriginal>\n    <HashRegistroAnulado>f7e1a8ec3a12aa0cfde843e220e54cf4dc8a496e219cd43c95bb81e1434b25cb</HashRegistroAnulado>\n    <MotivoAnulacion>Solo QR en el PDF sellado</MotivoAnulacion>\n  </ReferenciaRegistroAnulado>\n  <Trazabilidad>\n    <NumRegistroAnterior>1</NumRegistroAnterior>\n    <NumRegistroActual>2</NumRegistroActual>\n    <HashRegistroAnterior>f7e1a8ec3a12aa0cfde843e220e54cf4dc8a496e219cd43c95bb81e1434b25cb</HashRegistroAnterior>\n    <HashRegistroPropio>55de4c1ee7d1c3194bfed5ed23e72affdd7dc3f884a3fff2dee040c10611c335</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</RegistroAnulacionNoVerifactu>', '55de4c1ee7d1c3194bfed5ed23e72affdd7dc3f884a3fff2dee040c10611c335', 'f7e1a8ec3a12aa0cfde843e220e54cf4dc8a496e219cd43c95bb81e1434b25cb', NULL, 'ANULACION', 2, 1, 0),
(290, 2, '2026-03-05T12:14:52.076Z', '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<FacturaNoVerifactu xmlns=\"https://noverifactu.local/esquema\">\n  <Cabecera>\n    <NIFEmisor>71902382N</NIFEmisor>\n    <NIFReceptor>76875187X</NIFReceptor>\n    <VersionSIF>1.0.0</VersionSIF>\n  </Cabecera>\n  <DatosFactura>\n    <NumeroFacturaCompleto>6</NumeroFacturaCompleto>\n    <FechaHoraExpedicion>2026-03-05T12:09:00.000Z</FechaHoraExpedicion>\n    <TipoFactura>ORDINARIA</TipoFactura>\n    <ImporteTotalFactura>181.5</ImporteTotalFactura>\n  </DatosFactura>\n  <DesgloseFiscal>\n    <Impuestos>\n      <Impuesto>\n        <BaseImponible>150</BaseImponible>\n        <TipoImpositivo>21</TipoImpositivo>\n        <Cuota>31.5</Cuota>\n        <Tipo>IVA</Tipo>\n      </Impuesto>\n    </Impuestos>\n  </DesgloseFiscal>\n  <Trazabilidad>\n    <NumRegistroAnterior>16</NumRegistroAnterior>\n    <NumRegistroActual>17</NumRegistroActual>\n    <HashRegistroAnterior>f470378777936955f20d81ce26f83b743f589dfb55b46e5b31e8a55bc17ff747</HashRegistroAnterior>\n    <HashRegistroPropio>4ddd708de505c5c319969e8108a28b0dc7e4d0cec1e3e634978c1f83aaca98ef</HashRegistroPropio>\n    <IdentificacionSIF>\n      <IdSoftware>NOVERIFACTU-DEV-1.0.0</IdSoftware>\n      <NIFDesarrollador>71902382N</NIFDesarrollador>\n      <fechaDeclaracionResponsable>2026-01-22T11:33:32.000Z</fechaDeclaracionResponsable>\n    </IdentificacionSIF>\n  </Trazabilidad>\n</FacturaNoVerifactu>', '4ddd708de505c5c319969e8108a28b0dc7e4d0cec1e3e634978c1f83aaca98ef', 'f470378777936955f20d81ce26f83b743f589dfb55b46e5b31e8a55bc17ff747', NULL, 'ALTA', 17, 1, 0);

--
-- Disparadores `registros_facturacion`
--
DELIMITER $$
CREATE TRIGGER `no_delete_registros_facturacion` BEFORE DELETE ON `registros_facturacion` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'No se permite borrar registros de facturación.';
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `no_update_registros_facturacion` BEFORE UPDATE ON `registros_facturacion` FOR EACH ROW BEGIN
  IF 
    NEW.hash_registro_actual <> OLD.hash_registro_actual OR
    NEW.hash_registro_anterior <> OLD.hash_registro_anterior OR
    NEW.num_registro <> OLD.num_registro OR
    NEW.usuario_id <> OLD.usuario_id OR
    NEW.contenido_registro <> OLD.contenido_registro OR
    NEW.fecha_hora_generacion <> OLD.fecha_hora_generacion OR
    NEW.sif_config_id <> OLD.sif_config_id
  THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No se permite modificar registros de facturación.';
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sif_configuracion`
--

CREATE TABLE `sif_configuracion` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `usuario_id` bigint(11) NOT NULL,
  `nif` varchar(9) DEFAULT NULL,
  `version` varchar(20) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_declaracion_responsable` datetime DEFAULT NULL,
  `fecha_baja` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `es_global` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sif_configuracion`
--

INSERT INTO `sif_configuracion` (`id`, `nombre`, `usuario_id`, `nif`, `version`, `activo`, `fecha_declaracion_responsable`, `fecha_baja`, `created_at`, `es_global`) VALUES
(1, 'NOVERIFACTU-DEV-1.0.0', 2, '71902382N', '1.0.0', 1, '2026-01-22 12:33:32', NULL, '2026-02-04 11:21:29', 1),
(2, 'InAltera-0.1', 2, '71728851Q', '0.1', 0, '2026-02-05 00:00:00', NULL, '2026-02-05 11:28:07', 0),
(3, 'TercerSW', 2, '68798795E', '1.0', 0, '2026-02-09 00:00:00', NULL, '2026-02-09 07:33:21', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` bigint(20) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password_hash` varchar(150) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `suscripcion` enum('GRATUITO','BASICO','PRO') NOT NULL DEFAULT 'GRATUITO',
  `estado_suscripcion` enum('ACTIVA','PENDIENTE','VENCIDA') NOT NULL DEFAULT 'ACTIVA',
  `twofa_secret` varchar(255) DEFAULT NULL,
  `twofa_enabled` tinyint(1) DEFAULT 0,
  `rol` enum('USER','ADMIN') NOT NULL DEFAULT 'USER',
  `reset_token_hash` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `acepta_privacidad` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_aceptacion_privacidad` varchar(24) DEFAULT NULL,
  `version_politica_privacidad` varchar(10) DEFAULT NULL,
  `email_verificado` tinyint(1) DEFAULT 0,
  `token_verificacion` varchar(255) DEFAULT NULL,
  `token_expiracion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `email`, `password_hash`, `nombre`, `activo`, `fecha_creacion`, `suscripcion`, `estado_suscripcion`, `twofa_secret`, `twofa_enabled`, `rol`, `reset_token_hash`, `reset_token_expires`, `acepta_privacidad`, `fecha_aceptacion_privacidad`, `version_politica_privacidad`, `email_verificado`, `token_verificacion`, `token_expiracion`) VALUES
(1, 'demo@noverifactu.local', '$2b$10$TsMhVkcMnDQ2cukzgMBEtewFmLj3lhXonyZ9tHiYXZY1X5RUGHgIu', 'Usuario Demo', 1, '2026-01-19 15:50:57', 'PRO', 'ACTIVA', NULL, 0, 'USER', NULL, NULL, 0, NULL, NULL, 1, NULL, NULL),
(2, 'rebecamm2495@gmail.com', '$2b$10$qlW2sqcNhPQFjqtZEjnqD.fyKtfcWJ5DN4jEPWozVQfZ2j8KNTbh6', 'Rebeca', 1, '2026-01-22 10:29:35', 'PRO', 'ACTIVA', 'NVPDIP33JBSVW3CHGQUF2RTUJNFDKRSTFFAEWTDLH46DSI2JEZBA', 1, 'ADMIN', NULL, NULL, 1, '2026-03-03T9:53:20.000Z', '1.0', 1, NULL, NULL),
(3, 'pruebas@noverifactu.local', '$2b$10$ARu1Lapmg5r9HKD/xbfLiu7e3Ya0qfgXCDYhmHhR4tjG3bK/10Ir6', 'Pruebas', 1, '2026-02-03 14:27:42', 'GRATUITO', 'ACTIVA', NULL, 0, 'USER', NULL, NULL, 0, NULL, NULL, 0, NULL, NULL),
(4, 'test@noveri.local', '$2b$10$7AwgW/Ey0vZquS2WXOIpee8LnI8LtJj2mlZV1mjKmGLPzGSppvtx2', 'Test', 1, '2026-02-06 15:53:51', 'PRO', 'ACTIVA', 'JE6HIWTWFBVW4Y22FBZGONRDGBTVEZR3LNYDUODZLYVDAODXJJEA', 1, 'USER', NULL, NULL, 0, NULL, NULL, 1, NULL, NULL),
(5, 'pepi@gmail.com', '$2b$10$7FPtyoEgnEROfyZfJ9P0HuS2poezU3NrywEfftKyz3/ZtNqBIIAPK', 'Pepita', 1, '2026-02-11 14:08:04', 'GRATUITO', 'ACTIVA', NULL, 0, 'USER', NULL, NULL, 0, NULL, NULL, 1, NULL, NULL),
(6, 'prueba@inaltera.com', '$2b$10$hEeH2XX53SEUZZvlGem4lOMYpDMaOaOOXdb6BP/NtYUANm3OiDOO2', 'Prueba', 1, '2026-03-03 10:28:49', 'GRATUITO', 'ACTIVA', 'MJAFI3LGJE3VQVBQNZIH2VBZGVFFGRZGOI4WQUSMHBRS4LRVMZRQ', 1, 'USER', NULL, NULL, 0, NULL, NULL, 1, NULL, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_id` (`usuario_id`,`nif`);

--
-- Indices de la tabla `datos_fiscales`
--
ALTER TABLE `datos_fiscales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `registro_id` (`registro_id`),
  ADD KEY `fk_factura_origen` (`factura_origen_id`) USING BTREE,
  ADD KEY `cliente_id` (`cliente_id`);

--
-- Indices de la tabla `factura_conceptos`
--
ALTER TABLE `factura_conceptos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `factura_id` (`factura_id`);

--
-- Indices de la tabla `factura_impuestos`
--
ALTER TABLE `factura_impuestos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `factura_id` (`factura_id`);

--
-- Indices de la tabla `log_eventos`
--
ALTER TABLE `log_eventos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `registros_facturacion`
--
ALTER TABLE `registros_facturacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `fk_registros_sif_nuevo` (`sif_config_id`);

--
-- Indices de la tabla `sif_configuracion`
--
ALTER TABLE `sif_configuracion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `id_2` (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `datos_fiscales`
--
ALTER TABLE `datos_fiscales`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `facturas`
--
ALTER TABLE `facturas`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=247;

--
-- AUTO_INCREMENT de la tabla `factura_conceptos`
--
ALTER TABLE `factura_conceptos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=98;

--
-- AUTO_INCREMENT de la tabla `factura_impuestos`
--
ALTER TABLE `factura_impuestos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=251;

--
-- AUTO_INCREMENT de la tabla `log_eventos`
--
ALTER TABLE `log_eventos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=673;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `registros_facturacion`
--
ALTER TABLE `registros_facturacion`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=291;

--
-- AUTO_INCREMENT de la tabla `sif_configuracion`
--
ALTER TABLE `sif_configuracion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD CONSTRAINT `clientes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `datos_fiscales`
--
ALTER TABLE `datos_fiscales`
  ADD CONSTRAINT `datos_fiscales_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD CONSTRAINT `facturas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `facturas_ibfk_2` FOREIGN KEY (`registro_id`) REFERENCES `registros_facturacion` (`id`),
  ADD CONSTRAINT `facturas_ibfk_3` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  ADD CONSTRAINT `fk_factura_origen` FOREIGN KEY (`factura_origen_id`) REFERENCES `facturas` (`id`);

--
-- Filtros para la tabla `factura_conceptos`
--
ALTER TABLE `factura_conceptos`
  ADD CONSTRAINT `factura_conceptos_ibfk_1` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`);

--
-- Filtros para la tabla `factura_impuestos`
--
ALTER TABLE `factura_impuestos`
  ADD CONSTRAINT `factura_impuestos_ibfk_1` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`);

--
-- Filtros para la tabla `log_eventos`
--
ALTER TABLE `log_eventos`
  ADD CONSTRAINT `log_eventos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `registros_facturacion`
--
ALTER TABLE `registros_facturacion`
  ADD CONSTRAINT `fk_registros_sif_nuevo` FOREIGN KEY (`sif_config_id`) REFERENCES `sif_configuracion` (`id`),
  ADD CONSTRAINT `registros_facturacion_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `sif_configuracion`
--
ALTER TABLE `sif_configuracion`
  ADD CONSTRAINT `sif_configuracion_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

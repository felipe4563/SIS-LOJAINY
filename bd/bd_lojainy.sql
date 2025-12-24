-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 24-12-2025 a las 13:17:08
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `bd_lojainy`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id_categoria`, `nombre`) VALUES
(1, 'Blusa'),
(2, 'Blusa Corset'),
(3, 'Blusa corta'),
(4, 'Blusa corta manga larga'),
(5, 'Blusa Halter'),
(6, 'Blusa manga corta'),
(7, 'Blusa manga larga'),
(8, 'Blusa sin mangas'),
(9, 'Body '),
(10, 'Body Lenceria'),
(11, 'Bodys'),
(12, 'Buso'),
(13, 'Camisa'),
(14, 'Camisa corta'),
(15, 'Camisa polo'),
(16, 'Camiseta'),
(17, 'Chaleco '),
(18, 'Chaqueta'),
(19, 'Conjunto'),
(20, 'Conjunto Chaleco y short '),
(21, 'Conjunto chaqueta '),
(22, 'Conjunto de mezclilla top y pantalón corto '),
(23, 'Conjunto Deportivo'),
(24, 'Conjunto top y pantalón '),
(25, 'Corset'),
(26, 'Encaje'),
(27, 'Enterizo'),
(28, 'Enterizo Deportivo'),
(29, 'Falda'),
(30, 'Jeans'),
(31, 'Leggings'),
(32, 'Lenceria'),
(33, 'Mangalarga'),
(34, 'Pantalon'),
(35, 'Pantalón de pijama '),
(36, 'Pantalon pijama'),
(37, 'Polera '),
(38, 'Polera corta'),
(39, 'Polera manga corta'),
(40, 'Polerita'),
(41, 'Sujetador'),
(42, 'Top'),
(43, 'Top Corto'),
(44, 'Vestido Ajustado'),
(45, 'Vestido Corto Ajustado'),
(46, 'Vestidos'),
(47, 'Vestidos Ajustado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id_cliente` int(11) NOT NULL,
  `ci` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id_cliente`, `ci`, `nombre`, `apellido`, `celular`, `fecha_registro`) VALUES
(1, '93989281', 'Felipe', 'Mergas', '89483822', '2025-12-24 05:33:44'),
(2, '9093828', 'Felicitas', 'Vargas', '78473217', '2025-12-24 05:57:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `color`
--

CREATE TABLE `color` (
  `id_color` int(11) NOT NULL,
  `nombre` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `color`
--

INSERT INTO `color` (`id_color`, `nombre`) VALUES
(1, 'Amarillo'),
(2, 'Amarillo Claro'),
(3, 'Amarillo Degradado'),
(4, 'Amarillo suave'),
(5, 'Azul'),
(6, 'Azul Claro'),
(7, 'Azul Degradado'),
(8, 'Azul Marino'),
(9, 'Azul Verdoso'),
(10, 'Beige'),
(11, 'Beige Claro'),
(12, 'Beige fuerte'),
(13, 'Beige Oscuro'),
(14, 'Beige suave '),
(15, 'Beigs'),
(16, 'Blanco'),
(17, 'Cafe'),
(18, 'Cafe claro'),
(19, 'Cafe degradado'),
(20, 'Cafe Suave'),
(21, 'Cebra'),
(22, 'Celeste'),
(23, 'Celeste claro'),
(24, 'Celeste suave'),
(25, 'Crema'),
(26, 'Degradado Blanco Ros'),
(27, 'Gris '),
(28, 'Gris oscuro'),
(29, 'Griss'),
(30, 'Leopardo'),
(31, 'Lila'),
(32, 'Marron'),
(33, 'Naranja claro'),
(34, 'Negro'),
(35, 'Plomo'),
(36, 'Plomo Degradado'),
(37, 'Rojo'),
(38, 'Rosa '),
(39, 'Rosa fuerte'),
(40, 'Rosa Pastel'),
(41, 'Rosa suave'),
(42, 'Rosado'),
(43, 'Verde'),
(44, 'Verde Oscuro');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_venta`
--

CREATE TABLE `detalle_venta` (
  `id_detalle` int(11) NOT NULL,
  `id_venta` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_venta`
--

INSERT INTO `detalle_venta` (`id_detalle`, `id_venta`, `id_producto`, `precio`, `cantidad`) VALUES
(1, 1, 7, 1000.00, 1),
(2, 1, 7, 1000.00, 1),
(3, 2, 8, 900.00, 1),
(4, 2, 8, 900.00, 1),
(5, 2, 7, 1000.00, 1),
(6, 3, 8, 900.00, 1),
(7, 4, 7, 1000.00, 1),
(8, 4, 7, 1000.00, 1),
(9, 5, 7, 1000.00, 2),
(10, 5, 8, 900.00, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `permisos`
--

CREATE TABLE `permisos` (
  `id_permiso` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `permisos`
--

INSERT INTO `permisos` (`id_permiso`, `nombre`) VALUES
(1, 'categorias.manage'),
(10, 'clientes.create'),
(11, 'clientes.read'),
(3, 'colores.manage'),
(14, 'dashboard.read'),
(4, 'productos.create'),
(7, 'productos.delete'),
(5, 'productos.read'),
(6, 'productos.update'),
(15, 'reportes.read'),
(13, 'roles.manage'),
(2, 'tallas.manage'),
(12, 'usuarios.manage'),
(8, 'ventas.create'),
(9, 'ventas.read');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id_producto` int(11) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `stock` int(11) DEFAULT 1,
  `codigo_qr` varchar(50) DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_categoria` int(11) NOT NULL,
  `id_color` int(11) NOT NULL,
  `id_talla` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_producto`, `precio`, `descripcion`, `stock`, `codigo_qr`, `fecha_registro`, `id_categoria`, `id_color`, `id_talla`) VALUES
(7, 1000.00, 'Chaqueta jeans azul con pantalon con detalles de piedreria', 0, 'qr_7.png', '2025-12-24 03:55:16', 2, 1, 1),
(8, 900.00, 'Encaje negro en los hombros', 6, 'qr_8.png', '2025-12-24 05:11:40', 2, 1, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_imagenes`
--

CREATE TABLE `producto_imagenes` (
  `id_imagen` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `imagen` varchar(255) NOT NULL,
  `es_principal` tinyint(1) DEFAULT 0,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto_imagenes`
--

INSERT INTO `producto_imagenes` (`id_imagen`, `id_producto`, `imagen`, `es_principal`, `fecha_registro`) VALUES
(3, 7, '1766548516728.jpg', 1, '2025-12-24 03:55:16'),
(4, 8, '1766553100547.jpg', 1, '2025-12-24 05:11:40');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id_rol` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id_rol`, `nombre`) VALUES
(1, 'administrador'),
(2, 'vendedor');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol_permisos`
--

CREATE TABLE `rol_permisos` (
  `id_rol` int(11) NOT NULL,
  `id_permiso` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol_permisos`
--

INSERT INTO `rol_permisos` (`id_rol`, `id_permiso`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(1, 12),
(1, 13),
(1, 14),
(1, 15),
(2, 5),
(2, 8),
(2, 9),
(2, 10),
(2, 11);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tallas`
--

CREATE TABLE `tallas` (
  `id_talla` int(11) NOT NULL,
  `nombre` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tallas`
--

INSERT INTO `tallas` (`id_talla`, `nombre`) VALUES
(1, '10'),
(2, '2XL'),
(3, 'L'),
(4, 'L/XL'),
(5, 'M'),
(6, 'S'),
(7, 'S/M'),
(8, 'Unica'),
(9, 'X/L'),
(10, 'XL'),
(11, 'XXL');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `usuario` varchar(50) NOT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `ci` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `id_rol` int(11) NOT NULL,
  `activo` tinyint(4) DEFAULT 1,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `apellido`, `usuario`, `correo`, `ci`, `password`, `id_rol`, `activo`, `fecha_registro`) VALUES
(1, 'Ruben', 'Felipe', 'felipe74', 'felipe@lojainy.com', '9391668', '$2b$10$IasIpv5NlQWIKETDy9EdH.rudgMxR2ipbjbgqTmtaVw3XI/6OgFLS', 1, 1, '2025-12-05 14:54:41'),
(2, 'Sara', 'Abigail', 'sabigail29', 'sara@lojainy.com', '93921929', '$2b$10$KHTKOuiFg5VpU7eGYcWspuP9M2ACegt8SHKzjL0lIFzYa7ELgCsVG', 2, 1, '2025-12-05 17:06:38'),
(3, 'Noelia', 'Marquina', 'nmarquina21', 'nmarquina21@lojainy.com', '89843221', '$2b$10$aPRIhz1G/kMToFo67WZ0nuqlnmi0JUOp6LDDWZTGrIsbO.XjHcLNW', 2, 1, '2025-12-16 15:26:07');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

CREATE TABLE `ventas` (
  `id_venta` int(11) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `metodo_pago` enum('efectivo','qr') NOT NULL DEFAULT 'efectivo',
  `total` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ventas`
--

INSERT INTO `ventas` (`id_venta`, `id_usuario`, `id_cliente`, `fecha`, `metodo_pago`, `total`) VALUES
(1, 1, NULL, '2025-12-24 04:48:27', 'efectivo', 2000.00),
(2, 1, NULL, '2025-12-24 05:16:08', 'qr', 2800.00),
(3, 2, NULL, '2025-12-24 05:17:00', 'efectivo', 900.00),
(4, 1, 1, '2025-12-24 05:33:44', 'qr', 2000.00),
(5, 2, 2, '2025-12-24 05:57:10', 'efectivo', 2900.00);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id_categoria`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD UNIQUE KEY `nombre_2` (`nombre`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `ci` (`ci`);

--
-- Indices de la tabla `color`
--
ALTER TABLE `color`
  ADD PRIMARY KEY (`id_color`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `id_venta` (`id_venta`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `permisos`
--
ALTER TABLE `permisos`
  ADD PRIMARY KEY (`id_permiso`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id_producto`),
  ADD UNIQUE KEY `codigo_qr` (`codigo_qr`),
  ADD KEY `fk_talla` (`id_talla`),
  ADD KEY `fk_categoria` (`id_categoria`),
  ADD KEY `fk_color` (`id_color`);

--
-- Indices de la tabla `producto_imagenes`
--
ALTER TABLE `producto_imagenes`
  ADD PRIMARY KEY (`id_imagen`),
  ADD KEY `fk_imagen_producto` (`id_producto`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_rol`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `rol_permisos`
--
ALTER TABLE `rol_permisos`
  ADD PRIMARY KEY (`id_rol`,`id_permiso`),
  ADD KEY `id_permiso` (`id_permiso`);

--
-- Indices de la tabla `tallas`
--
ALTER TABLE `tallas`
  ADD PRIMARY KEY (`id_talla`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `usuario` (`usuario`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD UNIQUE KEY `ci` (`ci`),
  ADD KEY `id_rol` (`id_rol`);

--
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id_venta`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `fk_ventas_cliente` (`id_cliente`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `color`
--
ALTER TABLE `color`
  MODIFY `id_color` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `permisos`
--
ALTER TABLE `permisos`
  MODIFY `id_permiso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `producto_imagenes`
--
ALTER TABLE `producto_imagenes`
  MODIFY `id_imagen` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `tallas`
--
ALTER TABLE `tallas`
  MODIFY `id_talla` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id_venta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD CONSTRAINT `detalle_venta_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`),
  ADD CONSTRAINT `detalle_venta_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`);

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `fk_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`),
  ADD CONSTRAINT `fk_color` FOREIGN KEY (`id_color`) REFERENCES `color` (`id_color`),
  ADD CONSTRAINT `fk_talla` FOREIGN KEY (`id_talla`) REFERENCES `tallas` (`id_talla`);

--
-- Filtros para la tabla `producto_imagenes`
--
ALTER TABLE `producto_imagenes`
  ADD CONSTRAINT `fk_imagen_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE;

--
-- Filtros para la tabla `rol_permisos`
--
ALTER TABLE `rol_permisos`
  ADD CONSTRAINT `rol_permisos_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`),
  ADD CONSTRAINT `rol_permisos_ibfk_2` FOREIGN KEY (`id_permiso`) REFERENCES `permisos` (`id_permiso`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`);

--
-- Filtros para la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD CONSTRAINT `fk_ventas_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  ADD CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

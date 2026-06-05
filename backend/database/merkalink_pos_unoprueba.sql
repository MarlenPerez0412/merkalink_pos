CREATE DATABASE  IF NOT EXISTS `merkalink_ai` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `merkalink_ai`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: merkalink_ai
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alertas`
--

DROP TABLE IF EXISTS `alertas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alertas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `producto_id` int DEFAULT NULL,
  `tipo` varchar(80) NOT NULL,
  `mensaje` text NOT NULL,
  `nivel` enum('Media','Alta','Crítica','Advertencia','Recomendación') DEFAULT 'Media',
  `estado` enum('Pendiente','Revisada','Atendida','Pendiente de compra') DEFAULT 'Pendiente',
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `alertas_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alertas`
--

LOCK TABLES `alertas` WRITE;
/*!40000 ALTER TABLE `alertas` DISABLE KEYS */;
INSERT INTO `alertas` VALUES (19,26,'Producto agotado','Agua natural no tiene stock disponible.','Alta','Pendiente de compra','2026-06-05 11:12:54'),(20,27,'Producto agotado','Refresco cola no tiene stock disponible.','Alta','Pendiente','2026-06-05 11:12:54'),(21,29,'Producto agotado','Pastel de chocolate no tiene stock disponible.','Alta','Pendiente','2026-06-05 11:12:54');
/*!40000 ALTER TABLE `alertas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bitacora_sistema`
--

DROP TABLE IF EXISTS `bitacora_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bitacora_sistema` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `modulo` varchar(80) NOT NULL,
  `accion` varchar(80) NOT NULL,
  `descripcion` text NOT NULL,
  `registro_afectado_id` int DEFAULT NULL,
  `datos_anteriores` text,
  `datos_nuevos` text,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bitacora_modulo` (`modulo`),
  KEY `idx_bitacora_accion` (`accion`),
  KEY `idx_bitacora_usuario` (`usuario_id`),
  KEY `idx_bitacora_fecha` (`fecha`),
  KEY `fk_bitacora_empresa` (`empresa_id`),
  CONSTRAINT `fk_bitacora_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_bitacora_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bitacora_sistema`
--

LOCK TABLES `bitacora_sistema` WRITE;
/*!40000 ALTER TABLE `bitacora_sistema` DISABLE KEYS */;
INSERT INTO `bitacora_sistema` VALUES (1,1,NULL,'Productos','Editar producto','Se edito el producto Refresco cola.',27,'{\"id\":27,\"empresa_id\":1,\"sku\":\"POS-REF-005\",\"codigo_barras\":\"750100000005\",\"nombre\":\"Refresco cola\",\"imagen_url\":null,\"categoria_id\":18,\"precio\":\"25.00\",\"precio_sugerido\":\"26.00\",\"stock\":1,\"demanda\":\"Media\",\"promedio_ventas_diarias\":\"0.00\",\"estado\":\"Stock crítico\",\"fecha_creacion\":\"2026-05-22T13:12:29.000Z\",\"proveedor_id\":null}','{\"id\":27,\"empresa_id\":1,\"sku\":\"POS-REF-005\",\"codigo_barras\":\"750100000005\",\"nombre\":\"Refresco cola\",\"imagen_url\":\"https://www.google.com/imgres?q=refresco%20coca%20cola%20vaso&imgurl=https%3A%2F%2Fpng.pngtree.com%2Fpng-clipart%2F20231005%2Foriginal%2Fpngtree-coke-drink-glass-png-image_13271452.png&imgrefurl=https%3A%2F%2Fes.pngtree.com%2Ffreepng%2Fcoke-drink-glass_13271452.html&docid=9Mymgbf8_n0azM&tbnid=X7TEVChrVkbkzM&vet=12ahUKEwjilZ_uxumUAxUinGoFHYAEBSQQnPAOegQIGBAB..i&w=1200&h=1200&hcb=2&ved=2ahUKEwjilZ_uxumUAxUinGoFHYAEBSQQnPAOegQIGBAB\",\"categoria_id\":18,\"precio\":25,\"precio_sugerido\":26,\"stock\":1,\"demanda\":\"Media\",\"promedio_ventas_diarias\":0,\"estado\":\"Stock critico\",\"fecha_creacion\":\"2026-05-22T13:12:29.000Z\",\"proveedor_id\":null}','2026-06-02 22:00:42'),(2,1,NULL,'Productos','Editar producto','Se edito el producto Refresco cola.',27,'{\"id\":27,\"empresa_id\":1,\"sku\":\"POS-REF-005\",\"codigo_barras\":\"750100000005\",\"nombre\":\"Refresco cola\",\"imagen_url\":\"https://www.google.com/imgres?q=refresco%20coca%20cola%20vaso&imgurl=https%3A%2F%2Fpng.pngtree.com%2Fpng-clipart%2F20231005%2Foriginal%2Fpngtree-coke-drink-glass-png-image_13271452.png&imgrefurl=https%3A%2F%2Fes.pngtree.com%2Ffreepng%2Fcoke-drink-glass_13271452.html&docid=9Mymgbf8_n0azM&tbnid=X7TEVChrVkbkzM&vet=12ahUKEwjilZ_uxumUAxUinGoFHYAEBSQQnPAOegQIGBAB..i&w=1200&h=1200&hcb=2&ved=2ahUKEwjilZ_uxumUAxUinGoFHYAEBSQQnPAOegQIGBAB\",\"categoria_id\":18,\"precio\":\"25.00\",\"precio_sugerido\":\"26.00\",\"stock\":1,\"demanda\":\"Media\",\"promedio_ventas_diarias\":\"0.00\",\"estado\":\"Stock crítico\",\"fecha_creacion\":\"2026-05-22T13:12:29.000Z\",\"proveedor_id\":null}','{\"id\":27,\"empresa_id\":1,\"sku\":\"POS-REF-005\",\"codigo_barras\":\"750100000005\",\"nombre\":\"Refresco cola\",\"imagen_url\":\"https://www.google.com/imgres?q=refresco%20coca%20cola&imgurl=https%3A%2F%2Fcdn.milenio.com%2Fuploads%2Fmedia%2F2020%2F09%2F29%2Fte-gusta-este-refresco-shutterstock.jpg&imgrefurl=https%3A%2F%2Fwww.milenio.com%2Festilo%2Fgastronomia%2Fcoca-cola-de-que-esta-hecha-y-que-es-la-cola&docid=Atw4sx2JWZZ_cM&tbnid=DipRYGc009nqpM&vet=12ahUKEwjhkNaV0emUAxVrnGoFHdvhGS0QnPAOegQIIhAB..i&w=1200&h=747&hcb=2&ved=2ahUKEwjhkNaV0emUAxVrnGoFHdvhGS0QnPAOegQIIhAB\",\"categoria_id\":18,\"precio\":25,\"precio_sugerido\":26,\"stock\":1,\"demanda\":\"Media\",\"promedio_ventas_diarias\":0,\"estado\":\"Stock critico\",\"fecha_creacion\":\"2026-05-22T13:12:29.000Z\",\"proveedor_id\":1}','2026-06-02 22:46:36'),(3,1,NULL,'Productos','Editar producto','Se edito el producto Refresco cola.',27,'{\"id\":27,\"empresa_id\":1,\"sku\":\"POS-REF-005\",\"codigo_barras\":\"750100000005\",\"nombre\":\"Refresco cola\",\"imagen_url\":\"https://www.google.com/imgres?q=refresco%20coca%20cola&imgurl=https%3A%2F%2Fcdn.milenio.com%2Fuploads%2Fmedia%2F2020%2F09%2F29%2Fte-gusta-este-refresco-shutterstock.jpg&imgrefurl=https%3A%2F%2Fwww.milenio.com%2Festilo%2Fgastronomia%2Fcoca-cola-de-que-esta-hecha-y-que-es-la-cola&docid=Atw4sx2JWZZ_cM&tbnid=DipRYGc009nqpM&vet=12ahUKEwjhkNaV0emUAxVrnGoFHdvhGS0QnPAOegQIIhAB..i&w=1200&h=747&hcb=2&ved=2ahUKEwjhkNaV0emUAxVrnGoFHdvhGS0QnPAOegQIIhAB\",\"categoria_id\":18,\"precio\":\"25.00\",\"precio_sugerido\":\"26.00\",\"stock\":1,\"demanda\":\"Media\",\"promedio_ventas_diarias\":\"0.00\",\"estado\":\"Stock crítico\",\"fecha_creacion\":\"2026-05-22T13:12:29.000Z\",\"proveedor_id\":1}','{\"id\":27,\"empresa_id\":1,\"sku\":\"POS-REF-005\",\"codigo_barras\":\"750100000005\",\"nombre\":\"Refresco cola\",\"imagen_url\":\"https://www.google.com/imgres?q=refresco%20coca%20cola%20vaso&imgurl=https%3A%2F%2Fpng.pngtree.com%2Fpng-clipart%2F20231005%2Foriginal%2Fpngtree-coke-drink-glass-png-image_13271452.png&imgrefurl=https%3A%2F%2Fes.pngtree.com%2Ffreepng%2Fcoke-drink-glass_13271452.html&docid=9Mymgbf8_n0azM&tbnid=X7TEVChrVkbkzM&vet=12ahUKEwjilZ_uxumUAxUinGoFHYAEBSQQnPAOegQIGBAB..i&w=1200&h=1200&hcb=2&ved=2ahUKEwjilZ_uxumUAxUinGoFHYAEBSQQnPAOegQIGBAB\",\"categoria_id\":18,\"precio\":25,\"precio_sugerido\":26,\"stock\":1,\"demanda\":\"Media\",\"promedio_ventas_diarias\":0,\"estado\":\"Stock critico\",\"fecha_creacion\":\"2026-05-22T13:12:29.000Z\",\"proveedor_id\":1}','2026-06-02 22:47:02'),(4,1,NULL,'Productos','Editar producto','Se edito el producto Tacos.',32,'{\"id\":32,\"empresa_id\":null,\"sku\":\"POS-NEW-031\",\"codigo_barras\":\"34567890\",\"nombre\":\"Tacos\",\"imagen_url\":\"https://imgs.search.brave.com/l2T0_vTzyrlhQYx8yG7moIF3fuZgKldubVA1lRaNAE8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMjI0/MjI5ODM1MC9waG90/by90d28tZnJpZW5k/cy1nZXR0aW5nLXRv/LWtub3ctbWV4aWNv/LXN0b3AtdG8tZWF0/LXRhY29zLWFsLXBh/c3Rvci1vbi10aGUt/c3RyZWV0LndlYnA_/YT0xJmI9MSZzPTYx/Mng2MTImdz0wJms9/MjAmYz1mcEkzcVlw/djhjSWl4SkppT0dp/VUlvUFM0QV9udjVN/dXd5WmY0bVBzdFZ3/PQ\",\"categoria_id\":12,\"precio\":\"15.00\",\"precio_sugerido\":\"16.00\",\"stock\":22,\"demanda\":\"Media\",\"promedio_ventas_diarias\":\"0.00\",\"estado\":\"Activo\",\"fecha_creacion\":\"2026-05-27T22:37:19.000Z\",\"proveedor_id\":null}','{\"id\":32,\"empresa_id\":null,\"sku\":\"POS-NEW-031\",\"codigo_barras\":\"34567890\",\"nombre\":\"Tacos\",\"imagen_url\":\"https://imgs.search.brave.com/l2T0_vTzyrlhQYx8yG7moIF3fuZgKldubVA1lRaNAE8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMjI0/MjI5ODM1MC9waG90/by90d28tZnJpZW5k/cy1nZXR0aW5nLXRv/LWtub3ctbWV4aWNv/LXN0b3AtdG8tZWF0/LXRhY29zLWFsLXBh/c3Rvci1vbi10aGUt/c3RyZWV0LndlYnA_/YT0xJmI9MSZzPTYx/Mng2MTImdz0wJms9/MjAmYz1mcEkzcVlw/djhjSWl4SkppT0dp/VUlvUFM0QV9udjVN/dXd5WmY0bVBzdFZ3/PQ\",\"categoria_id\":12,\"precio\":15,\"precio_sugerido\":16,\"stock\":22,\"demanda\":\"Media\",\"promedio_ventas_diarias\":0,\"estado\":\"Activo\",\"fecha_creacion\":\"2026-05-27T22:37:19.000Z\",\"proveedor_id\":null}','2026-06-02 22:50:38'),(5,1,NULL,'Usuarios','Crear usuario','Se creo el usuario Cajero 2 con rol Cajero.',11,NULL,'{\"id\":11,\"empresa_id\":null,\"nombre\":\"Cajero 2\",\"correo\":\"cajero2@merkalinkpos.com\",\"rol\":\"Cajero\",\"estado\":\"Activo\",\"canal_id\":6}','2026-06-03 00:17:15'),(6,1,NULL,'Productos','Editar producto','Se edito el producto Agua natural.',26,'{\"id\":26,\"empresa_id\":1,\"sku\":\"POS-AGU-004\",\"codigo_barras\":\"750100000004\",\"nombre\":\"Agua natural\",\"imagen_url\":null,\"categoria_id\":18,\"precio\":\"18.00\",\"precio_sugerido\":\"19.00\",\"stock\":0,\"demanda\":\"Media\",\"promedio_ventas_diarias\":\"0.00\",\"estado\":\"Stock crítico\",\"fecha_creacion\":\"2026-05-22T13:12:29.000Z\",\"proveedor_id\":null}','{\"id\":26,\"empresa_id\":1,\"sku\":\"POS-AGU-004\",\"codigo_barras\":\"750100000004\",\"nombre\":\"Agua natural\",\"imagen_url\":\"https://los40puebla.com/beneficios-del-agua-natural/\",\"categoria_id\":18,\"precio\":18,\"precio_sugerido\":19,\"stock\":0,\"demanda\":\"Media\",\"promedio_ventas_diarias\":0,\"estado\":\"Activo\",\"fecha_creacion\":\"2026-05-22T13:12:29.000Z\",\"proveedor_id\":null}','2026-06-03 00:28:00'),(7,1,NULL,'Productos','Editar producto','Se edito el producto Agua natural.',26,'{\"id\":26,\"empresa_id\":1,\"sku\":\"POS-AGU-004\",\"codigo_barras\":\"750100000004\",\"nombre\":\"Agua natural\",\"imagen_url\":\"https://los40puebla.com/beneficios-del-agua-natural/\",\"categoria_id\":18,\"precio\":\"18.00\",\"precio_sugerido\":\"19.00\",\"stock\":0,\"demanda\":\"Media\",\"promedio_ventas_diarias\":\"0.00\",\"estado\":\"Activo\",\"fecha_creacion\":\"2026-05-22T13:12:29.000Z\",\"proveedor_id\":null}','{\"id\":26,\"empresa_id\":1,\"sku\":\"POS-AGU-004\",\"codigo_barras\":\"750100000004\",\"nombre\":\"Agua natural\",\"imagen_url\":\"/images/productos/agua-1780446498614.jpeg\",\"categoria_id\":18,\"precio\":18,\"precio_sugerido\":19,\"stock\":0,\"demanda\":\"Media\",\"promedio_ventas_diarias\":0,\"estado\":\"Activo\",\"fecha_creacion\":\"2026-05-22T13:12:29.000Z\",\"proveedor_id\":null}','2026-06-03 00:28:20'),(8,1,NULL,'Productos','Editar producto','Se edito el producto Pizza individual.',24,'{\"id\":24,\"empresa_id\":1,\"sku\":\"POS-PIZ-002\",\"codigo_barras\":\"750100000002\",\"nombre\":\"Pizza individual\",\"imagen_url\":null,\"categoria_id\":17,\"precio\":\"99.00\",\"precio_sugerido\":\"99.00\",\"stock\":40,\"demanda\":\"Media\",\"promedio_ventas_diarias\":\"0.00\",\"estado\":\"Activo\",\"fecha_creacion\":\"2026-05-22T13:12:29.000Z\",\"proveedor_id\":null}','{\"id\":24,\"empresa_id\":1,\"sku\":\"POS-PIZ-002\",\"codigo_barras\":\"750100000002\",\"nombre\":\"Pizza individual\",\"imagen_url\":\"http://elrincondejeanne.com/cdn/shop/files/B8214D24-45BA-4AD6-AF1E-F284FE9671BD.jpg?v=1756925010\",\"categoria_id\":17,\"precio\":99,\"precio_sugerido\":104,\"stock\":40,\"demanda\":\"Media\",\"promedio_ventas_diarias\":0,\"estado\":\"Activo\",\"fecha_creacion\":\"2026-05-22T13:12:29.000Z\",\"proveedor_id\":null}','2026-06-03 00:29:03'),(9,1,NULL,'Productos','Editar producto','Se edito el producto Hamburguesa clasica.',23,'{\"id\":23,\"empresa_id\":1,\"sku\":\"POS-HAM-001\",\"codigo_barras\":\"750100000001\",\"nombre\":\"Hamburguesa clasica\",\"imagen_url\":null,\"categoria_id\":17,\"precio\":\"89.00\",\"precio_sugerido\":\"89.00\",\"stock\":50,\"demanda\":\"Media\",\"promedio_ventas_diarias\":\"0.00\",\"estado\":\"Activo\",\"fecha_creacion\":\"2026-05-22T13:12:29.000Z\",\"proveedor_id\":null}','{\"id\":23,\"empresa_id\":1,\"sku\":\"POS-HAM-001\",\"codigo_barras\":\"750100000001\",\"nombre\":\"Hamburguesa clasica\",\"imagen_url\":\"https://barbacoaburger.com/wp-content/uploads/2024/12/HAMBURGUESA-SENCILLA.png\",\"categoria_id\":17,\"precio\":89,\"precio_sugerido\":93,\"stock\":50,\"demanda\":\"Media\",\"promedio_ventas_diarias\":0,\"estado\":\"Activo\",\"fecha_creacion\":\"2026-05-22T13:12:29.000Z\",\"proveedor_id\":null}','2026-06-03 00:29:29'),(10,1,NULL,'Cortes de caja','Crear corte de caja','Se creo el corte de caja CC-000001.',1,NULL,'{\"id\":1,\"folio\":\"CC-000001\",\"usuario_id\":null,\"canal_id\":null,\"turno\":\"Vespertino\",\"fecha\":\"2026-06-02\",\"hora_inicio\":\"08:00\",\"hora_fin\":\"16:00\",\"total_ventas\":45,\"total_efectivo\":45,\"total_tarjeta\":0,\"total_transferencia\":0,\"monto_contado\":0,\"diferencia\":-45,\"ventasIncluidas\":[50]}','2026-06-03 00:30:23'),(11,1,NULL,'Cortes de caja','Generar PDF de corte','Se solicitaron datos completos para generar PDF del corte CC-000001.',1,NULL,'{\"folio\":\"CC-000001\",\"reporte\":true}','2026-06-03 00:30:38'),(12,1,NULL,'Cortes de caja','Crear corte de caja','Se creo el corte de caja CC-000002.',2,NULL,'{\"id\":2,\"folio\":\"CC-000002\",\"usuario_id\":null,\"canal_id\":null,\"turno\":\"Personalizado\",\"fecha\":\"2026-06-02\",\"hora_inicio\":\"08:00\",\"hora_fin\":\"16:00\",\"total_ventas\":45,\"total_efectivo\":45,\"total_tarjeta\":0,\"total_transferencia\":0,\"monto_contado\":0,\"diferencia\":-45,\"ventasIncluidas\":[50]}','2026-06-03 00:31:01'),(13,1,NULL,'Cortes de caja','Generar PDF de corte','Se solicitaron datos completos para generar PDF del corte CC-000002.',2,NULL,'{\"folio\":\"CC-000002\",\"reporte\":true}','2026-06-03 00:31:03'),(14,1,NULL,'Cortes de caja','Generar PDF de corte','Se solicitaron datos completos para generar PDF del corte CC-000002.',2,NULL,'{\"folio\":\"CC-000002\",\"reporte\":true}','2026-06-03 00:38:14'),(15,1,NULL,'Productos','Desactivar producto','Se desactivo el producto Hamburguesa clasica.',23,'{\"id\":23,\"empresa_id\":1,\"sku\":\"POS-HAM-001\",\"codigo_barras\":\"750100000001\",\"nombre\":\"Hamburguesa clasica\",\"imagen_url\":\"https://barbacoaburger.com/wp-content/uploads/2024/12/HAMBURGUESA-SENCILLA.png\",\"categoria_id\":17,\"precio\":\"89.00\",\"precio_sugerido\":\"93.00\",\"stock\":50,\"demanda\":\"Media\",\"promedio_ventas_diarias\":\"0.00\",\"estado\":\"Activo\",\"fecha_creacion\":\"2026-05-22T13:12:29.000Z\",\"proveedor_id\":null}','{\"id\":23,\"empresa_id\":1,\"sku\":\"POS-HAM-001\",\"codigo_barras\":\"750100000001\",\"nombre\":\"Hamburguesa clasica\",\"imagen_url\":\"https://barbacoaburger.com/wp-content/uploads/2024/12/HAMBURGUESA-SENCILLA.png\",\"categoria_id\":17,\"precio\":\"89.00\",\"precio_sugerido\":\"93.00\",\"stock\":50,\"demanda\":\"Media\",\"promedio_ventas_diarias\":\"0.00\",\"estado\":\"Inactivo\",\"fecha_creacion\":\"2026-05-22T13:12:29.000Z\",\"proveedor_id\":null}','2026-06-03 00:48:02'),(16,1,NULL,'Categorias','Desactivar categoria','Se desactivo la categoria General y se movieron 16 productos a Sin categoria.',28,'{\"id\":28,\"nombre\":\"General\",\"activo\":1}','{\"id\":28,\"activo\":0,\"categoriaRespaldoId\":32,\"productosMovidos\":16}','2026-06-03 00:48:16'),(17,1,NULL,'Productos','Agregar producto','Se agrego el producto Agua de horchata.',33,NULL,'{\"id\":33,\"sku\":\"POS-NEW-009\",\"nombre\":\"Agua de horchata\",\"categoria_id\":12,\"precio\":25,\"stock\":13,\"estado\":\"Activo\"}','2026-06-04 23:09:39'),(18,1,NULL,'Productos','Editar producto','Se edito el producto Tacos.',32,'{\"id\":32,\"empresa_id\":null,\"sku\":\"POS-NEW-031\",\"codigo_barras\":\"34567890\",\"nombre\":\"Tacos\",\"imagen_url\":\"https://imgs.search.brave.com/l2T0_vTzyrlhQYx8yG7moIF3fuZgKldubVA1lRaNAE8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMjI0/MjI5ODM1MC9waG90/by90d28tZnJpZW5k/cy1nZXR0aW5nLXRv/LWtub3ctbWV4aWNv/LXN0b3AtdG8tZWF0/LXRhY29zLWFsLXBh/c3Rvci1vbi10aGUt/c3RyZWV0LndlYnA_/YT0xJmI9MSZzPTYx/Mng2MTImdz0wJms9/MjAmYz1mcEkzcVlw/djhjSWl4SkppT0dp/VUlvUFM0QV9udjVN/dXd5WmY0bVBzdFZ3/PQ\",\"categoria_id\":12,\"precio\":\"15.00\",\"precio_sugerido\":\"16.00\",\"stock\":13,\"demanda\":\"Media\",\"promedio_ventas_diarias\":\"0.00\",\"estado\":\"Activo\",\"fecha_creacion\":\"2026-05-27T22:37:19.000Z\",\"proveedor_id\":null}','{\"id\":32,\"empresa_id\":null,\"sku\":\"POS-NEW-031\",\"codigo_barras\":\"34567890\",\"nombre\":\"Tacos\",\"imagen_url\":\"https://imgs.search.brave.com/l2T0_vTzyrlhQYx8yG7moIF3fuZgKldubVA1lRaNAE8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMjI0/MjI5ODM1MC9waG90/by90d28tZnJpZW5k/cy1nZXR0aW5nLXRv/LWtub3ctbWV4aWNv/LXN0b3AtdG8tZWF0/LXRhY29zLWFsLXBh/c3Rvci1vbi10aGUt/c3RyZWV0LndlYnA_/YT0xJmI9MSZzPTYx/Mng2MTImdz0wJms9/MjAmYz1mcEkzcVlw/djhjSWl4SkppT0dp/VUlvUFM0QV9udjVN/dXd5WmY0bVBzdFZ3/PQ\",\"categoria_id\":16,\"precio\":15,\"precio_sugerido\":16,\"stock\":13,\"demanda\":\"Media\",\"promedio_ventas_diarias\":0,\"estado\":\"Activo\",\"fecha_creacion\":\"2026-05-27T22:37:19.000Z\",\"proveedor_id\":null}','2026-06-04 23:10:00'),(19,NULL,NULL,'Categorias','Desactivar categoria','Se desactivo la categoria Aguas y se movieron 1 productos a Sin categoria.',12,'{\"id\":12,\"nombre\":\"Aguas\",\"activo\":1}','{\"id\":12,\"activo\":0,\"categoriaRespaldoId\":32,\"productosMovidos\":1}','2026-06-05 10:10:51'),(20,NULL,NULL,'Productos','Editar producto','Se edito el producto Agua de horchata.',33,'{\"id\":33,\"empresa_id\":1,\"sku\":\"POS-NEW-009\",\"codigo_barras\":\"750100000079\",\"nombre\":\"Agua de horchata\",\"imagen_url\":\"https://mahatmarice.com/wp-content/uploads/2020/04/GettyImages-493110032.jpg\",\"categoria_id\":32,\"precio\":\"25.00\",\"precio_sugerido\":\"26.00\",\"stock\":13,\"demanda\":\"Media\",\"promedio_ventas_diarias\":\"0.00\",\"estado\":\"Activo\",\"fecha_creacion\":\"2026-06-04T23:09:39.000Z\",\"proveedor_id\":1}','{\"id\":33,\"empresa_id\":1,\"sku\":\"POS-NEW-009\",\"codigo_barras\":\"750100000079\",\"nombre\":\"Agua de horchata\",\"imagen_url\":\"https://mahatmarice.com/wp-content/uploads/2020/04/GettyImages-493110032.jpg\",\"categoria_id\":33,\"precio\":25,\"precio_sugerido\":26,\"stock\":13,\"demanda\":\"Media\",\"promedio_ventas_diarias\":0,\"estado\":\"Activo\",\"fecha_creacion\":\"2026-06-04T23:09:39.000Z\",\"proveedor_id\":1}','2026-06-05 10:11:14'),(21,NULL,NULL,'Categorias','Desactivar categoria','Se desactivo la categoria Chocolate y se movieron 0 productos a Sin categoria.',6,'{\"id\":6,\"nombre\":\"Chocolate\",\"activo\":1}','{\"id\":6,\"activo\":0,\"categoriaRespaldoId\":32,\"productosMovidos\":0}','2026-06-05 10:11:27'),(22,NULL,NULL,'Productos','Editar producto','Se edito el producto Cafe americano.',28,'{\"id\":28,\"empresa_id\":1,\"sku\":\"POS-CAF-006\",\"codigo_barras\":\"750100000006\",\"nombre\":\"Cafe americano\",\"imagen_url\":\"/images/productos/cafe-1780424433223.jpeg\",\"categoria_id\":18,\"precio\":\"35.00\",\"precio_sugerido\":\"37.00\",\"stock\":64,\"demanda\":\"Media\",\"promedio_ventas_diarias\":\"0.00\",\"estado\":\"Activo\",\"fecha_creacion\":\"2026-05-22T13:12:29.000Z\",\"proveedor_id\":null}','{\"id\":28,\"empresa_id\":1,\"sku\":\"POS-CAF-006\",\"codigo_barras\":\"750100000006\",\"nombre\":\"Cafe americano\",\"imagen_url\":\"/images/productos/cafe-1780424433223.jpeg\",\"categoria_id\":33,\"precio\":35,\"precio_sugerido\":37,\"stock\":64,\"demanda\":\"Media\",\"promedio_ventas_diarias\":0,\"estado\":\"Activo\",\"fecha_creacion\":\"2026-05-22T13:12:29.000Z\",\"proveedor_id\":null}','2026-06-05 10:11:52'),(23,NULL,NULL,'Productos','Editar producto','Se edito el producto Refresco cola.',27,'{\"id\":27,\"empresa_id\":1,\"sku\":\"POS-REF-005\",\"codigo_barras\":\"750100000005\",\"nombre\":\"Refresco cola\",\"imagen_url\":\"https://www.google.com/imgres?q=refresco%20coca%20cola%20vaso&imgurl=https%3A%2F%2Fpng.pngtree.com%2Fpng-clipart%2F20231005%2Foriginal%2Fpngtree-coke-drink-glass-png-image_13271452.png&imgrefurl=https%3A%2F%2Fes.pngtree.com%2Ffreepng%2Fcoke-drink-glass_13271452.html&docid=9Mymgbf8_n0azM&tbnid=X7TEVChrVkbkzM&vet=12ahUKEwjilZ_uxumUAxUinGoFHYAEBSQQnPAOegQIGBAB..i&w=1200&h=1200&hcb=2&ved=2ahUKEwjilZ_uxumUAxUinGoFHYAEBSQQnPAOegQIGBAB\",\"categoria_id\":18,\"precio\":\"25.00\",\"precio_sugerido\":\"26.00\",\"stock\":0,\"demanda\":\"Media\",\"promedio_ventas_diarias\":\"0.00\",\"estado\":\"Stock crítico\",\"fecha_creacion\":\"2026-05-22T13:12:29.000Z\",\"proveedor_id\":1}','{\"id\":27,\"empresa_id\":1,\"sku\":\"POS-REF-005\",\"codigo_barras\":\"750100000005\",\"nombre\":\"Refresco cola\",\"imagen_url\":\"https://www.google.com/imgres?q=refresco%20coca%20cola%20vaso&imgurl=https%3A%2F%2Fpng.pngtree.com%2Fpng-clipart%2F20231005%2Foriginal%2Fpngtree-coke-drink-glass-png-image_13271452.png&imgrefurl=https%3A%2F%2Fes.pngtree.com%2Ffreepng%2Fcoke-drink-glass_13271452.html&docid=9Mymgbf8_n0azM&tbnid=X7TEVChrVkbkzM&vet=12ahUKEwjilZ_uxumUAxUinGoFHYAEBSQQnPAOegQIGBAB..i&w=1200&h=1200&hcb=2&ved=2ahUKEwjilZ_uxumUAxUinGoFHYAEBSQQnPAOegQIGBAB\",\"categoria_id\":33,\"precio\":25,\"precio_sugerido\":26,\"stock\":0,\"demanda\":\"Media\",\"promedio_ventas_diarias\":0,\"estado\":\"Activo\",\"fecha_creacion\":\"2026-05-22T13:12:29.000Z\",\"proveedor_id\":1}','2026-06-05 10:12:02'),(24,NULL,NULL,'Productos','Editar producto','Se edito el producto Agua natural.',26,'{\"id\":26,\"empresa_id\":1,\"sku\":\"POS-AGU-004\",\"codigo_barras\":\"750100000004\",\"nombre\":\"Agua natural\",\"imagen_url\":\"/images/productos/agua-1780446498614.jpeg\",\"categoria_id\":18,\"precio\":\"18.00\",\"precio_sugerido\":\"19.00\",\"stock\":0,\"demanda\":\"Media\",\"promedio_ventas_diarias\":\"0.00\",\"estado\":\"Activo\",\"fecha_creacion\":\"2026-05-22T13:12:29.000Z\",\"proveedor_id\":null}','{\"id\":26,\"empresa_id\":1,\"sku\":\"POS-AGU-004\",\"codigo_barras\":\"750100000004\",\"nombre\":\"Agua natural\",\"imagen_url\":\"/images/productos/agua-1780446498614.jpeg\",\"categoria_id\":33,\"precio\":18,\"precio_sugerido\":19,\"stock\":0,\"demanda\":\"Media\",\"promedio_ventas_diarias\":0,\"estado\":\"Activo\",\"fecha_creacion\":\"2026-05-22T13:12:29.000Z\",\"proveedor_id\":null}','2026-06-05 10:12:22'),(25,NULL,NULL,'Categorias','Desactivar categoria','Se desactivo la categoria Bebidas simples y se movieron 0 productos a Sin categoria.',18,'{\"id\":18,\"nombre\":\"Bebidas simples\",\"activo\":1}','{\"id\":18,\"activo\":0,\"categoriaRespaldoId\":32,\"productosMovidos\":0}','2026-06-05 10:12:47'),(26,NULL,NULL,'Categorias','Desactivar categoria','Se desactivo la categoria Salsas y se movieron 0 productos a Sin categoria.',34,'{\"id\":34,\"nombre\":\"Salsas\",\"activo\":1}','{\"id\":34,\"activo\":0,\"categoriaRespaldoId\":32,\"productosMovidos\":0}','2026-06-05 10:13:06'),(27,NULL,NULL,'Categorias','Desactivar categoria','Se desactivo la categoria Promociones y se movieron 0 productos a Sin categoria.',29,'{\"id\":29,\"nombre\":\"Promociones\",\"activo\":1}','{\"id\":29,\"activo\":0,\"categoriaRespaldoId\":32,\"productosMovidos\":0}','2026-06-05 10:13:10'),(28,NULL,NULL,'Categorias','Desactivar categoria','Se desactivo la categoria Especialidades y se movieron 0 productos a Sin categoria.',11,'{\"id\":11,\"nombre\":\"Especialidades\",\"activo\":1}','{\"id\":11,\"activo\":0,\"categoriaRespaldoId\":32,\"productosMovidos\":0}','2026-06-05 10:13:15'),(29,NULL,NULL,'Categorias','Desactivar categoria','Se desactivo la categoria Hamburguesas y se movieron 0 productos a Sin categoria.',31,'{\"id\":31,\"nombre\":\"Hamburguesas\",\"activo\":1}','{\"id\":31,\"activo\":0,\"categoriaRespaldoId\":32,\"productosMovidos\":0}','2026-06-05 10:13:18'),(30,NULL,NULL,'Cortes de caja','Crear corte de caja','Se creo el corte de caja CC-000003.',3,NULL,'{\"id\":3,\"folio\":\"CC-000003\",\"usuario_id\":null,\"canal_id\":null,\"turno\":\"Matutino\",\"fecha\":\"2026-06-05\",\"hora_inicio\":\"08:00\",\"hora_fin\":\"16:00\",\"total_ventas\":0,\"total_efectivo\":0,\"total_tarjeta\":0,\"total_transferencia\":0,\"monto_contado\":2000,\"diferencia\":2000,\"ventasIncluidas\":[]}','2026-06-05 10:14:31'),(31,NULL,NULL,'Cortes de caja','Crear corte de caja','Se creo el corte de caja CC-000004.',4,NULL,'{\"id\":4,\"folio\":\"CC-000004\",\"usuario_id\":null,\"canal_id\":null,\"turno\":\"Matutino\",\"fecha\":\"2026-06-05\",\"hora_inicio\":\"08:00\",\"hora_fin\":\"16:00\",\"total_ventas\":0,\"total_efectivo\":0,\"total_tarjeta\":0,\"total_transferencia\":0,\"monto_contado\":1382,\"diferencia\":1382,\"ventasIncluidas\":[]}','2026-06-05 10:15:04'),(32,NULL,NULL,'Cortes de caja','Generar PDF de corte','Se solicitaron datos completos para generar PDF del corte CC-000004.',4,NULL,'{\"folio\":\"CC-000004\",\"reporte\":true}','2026-06-05 10:15:15'),(33,NULL,NULL,'Origen de venta','Reactivar origen','Se reactivo el origen de venta \"Didi Food\".',10,'{\"id\":10,\"empresa_id\":1,\"nombre\":\"Didi Food\",\"tipo\":\"Digital\",\"estado\":\"Inactivo\",\"activo\":0}','{\"id\":10,\"empresa_id\":1,\"nombre\":\"Didi Food\",\"tipo\":\"Digital\",\"estado\":\"Activo\",\"activo\":1}','2026-06-05 10:41:52'),(34,NULL,NULL,'Origen de venta','Editar origen','Se actualizo el origen de venta \"Didi Foods\".',10,'{\"id\":10,\"empresa_id\":1,\"nombre\":\"Didi Food\",\"tipo\":\"Digital\",\"estado\":\"Activo\",\"activo\":1}','{\"id\":10,\"empresa_id\":1,\"nombre\":\"Didi Foods\",\"tipo\":\"Digital\",\"estado\":\"Activo\",\"activo\":1}','2026-06-05 10:42:06'),(35,NULL,NULL,'Cortes de caja','Generar PDF de corte','Se solicitaron datos completos para generar PDF del corte CC-000004.',4,NULL,'{\"folio\":\"CC-000004\",\"reporte\":true}','2026-06-05 11:06:49'),(36,NULL,NULL,'Productos','Editar producto','Se edito el producto Agua natural.',26,'{\"id\":26,\"empresa_id\":1,\"sku\":\"POS-AGU-004\",\"codigo_barras\":\"750100000004\",\"nombre\":\"Agua natural\",\"imagen_url\":\"/images/productos/agua-1780446498614.jpeg\",\"categoria_id\":33,\"precio\":\"18.00\",\"precio_sugerido\":\"19.00\",\"stock\":0,\"demanda\":\"Media\",\"promedio_ventas_diarias\":\"0.00\",\"estado\":\"Activo\",\"fecha_creacion\":\"2026-05-22T13:12:29.000Z\",\"proveedor_id\":null}','{\"id\":26,\"empresa_id\":1,\"sku\":\"POS-AGU-004\",\"codigo_barras\":\"750100000004\",\"nombre\":\"Agua natural\",\"imagen_url\":\"/images/productos/agua-1780446498614.jpeg\",\"categoria_id\":33,\"precio\":18,\"precio_sugerido\":19,\"stock\":0,\"demanda\":\"Media\",\"promedio_ventas_diarias\":0,\"estado\":\"Activo\",\"fecha_creacion\":\"2026-05-22T13:12:29.000Z\",\"proveedor_id\":1}','2026-06-05 11:11:13'),(37,NULL,NULL,'Alertas','Solicitar compra','Se solicito compra para el producto Agua natural al proveedor Marlen.',19,'{\"estado\":\"Pendiente\"}','{\"estado\":\"Pendiente de compra\",\"proveedor\":\"Marlen\",\"proveedorTelefono\":\"7226866255\",\"proveedorCorreo\":\"marlencitlallig18@gmail.com\",\"mensajeCompra\":\"Hola, buen día. Soy de Los Inge. Necesito solicitar reabastecimiento del producto Agua natural. Actualmente tenemos 0 unidades disponibles y el límite configurado es 5. ¿Podría apoyarme con disponibilidad y precio?\",\"whatsappUrl\":\"https://wa.me/527226866255?text=Hola%2C%20buen%20d%C3%ADa.%20Soy%20de%20Los%20Inge.%20Necesito%20solicitar%20reabastecimiento%20del%20producto%20Agua%20natural.%20Actualmente%20tenemos%200%20unidades%20disponibles%20y%20el%20l%C3%ADmite%20configurado%20es%205.%20%C2%BFPodr%C3%ADa%20apoyarme%20con%20disponibilidad%20y%20precio%3F\",\"mailtoUrl\":\"mailto:marlencitlallig18@gmail.com?subject=Solicitud%20de%20reabastecimiento%20-%20Agua%20natural&body=Hola%2C%20buen%20d%C3%ADa.%0A%0ASoy%20de%20Los%20Inge.%20Necesito%20solicitar%20reabastecimiento%20del%20producto%20Agua%20natural.%0A%0AStock%20actual%3A%200%0AL%C3%ADmite%20configurado%3A%205%0A%0A%C2%BFPodr%C3%ADa%20apoyarme%20con%20disponibilidad%2C%20precio%20y%20tiempo%20de%20entrega%3F%0A%0AGracias.\"}','2026-06-05 11:11:21'),(38,NULL,NULL,'Alertas','Solicitar compra','Se solicito compra para el producto Agua natural al proveedor Marlen.',19,'{\"estado\":\"Pendiente\"}','{\"estado\":\"Pendiente de compra\",\"proveedor\":\"Marlen\",\"proveedorTelefono\":\"7226866255\",\"proveedorCorreo\":\"marlencitlallig18@gmail.com\",\"mensajeCompra\":\"Hola, buen día. Soy de Los Inge. Necesito solicitar reabastecimiento del producto Agua natural. Actualmente tenemos 0 unidades disponibles y el límite configurado es 5. ¿Podría apoyarme con disponibilidad y precio?\",\"whatsappUrl\":\"https://wa.me/527226866255?text=Hola%2C%20buen%20d%C3%ADa.%20Soy%20de%20Los%20Inge.%20Necesito%20solicitar%20reabastecimiento%20del%20producto%20Agua%20natural.%20Actualmente%20tenemos%200%20unidades%20disponibles%20y%20el%20l%C3%ADmite%20configurado%20es%205.%20%C2%BFPodr%C3%ADa%20apoyarme%20con%20disponibilidad%20y%20precio%3F\",\"mailtoUrl\":\"mailto:marlencitlallig18@gmail.com?subject=Solicitud%20de%20reabastecimiento%20-%20Agua%20natural&body=Hola%2C%20buen%20d%C3%ADa.%0A%0ASoy%20de%20Los%20Inge.%20Necesito%20solicitar%20reabastecimiento%20del%20producto%20Agua%20natural.%0A%0AStock%20actual%3A%200%0AL%C3%ADmite%20configurado%3A%205%0A%0A%C2%BFPodr%C3%ADa%20apoyarme%20con%20disponibilidad%2C%20precio%20y%20tiempo%20de%20entrega%3F%0A%0AGracias.\"}','2026-06-05 11:12:18'),(39,NULL,4,'Alertas','Solicitar compra','Se solicitó reabastecimiento del producto Agua natural al proveedor Marlen por WhatsApp.',26,'{\"estado\":\"Pendiente\"}','{\"estado\":\"Pendiente de compra\",\"proveedor\":\"Marlen\",\"proveedorTelefono\":\"7226866255\",\"proveedorCorreo\":\"marlencitlallig18@gmail.com\",\"medio\":\"WhatsApp\",\"mensajeCompra\":\"Hola, buen día. Soy de Los Inge. Necesito solicitar reabastecimiento del producto Agua natural. Actualmente tenemos 0 unidades disponibles y el límite configurado es 5. ¿Podría apoyarme con disponibilidad y precio?\",\"whatsappUrl\":\"https://wa.me/527226866255?text=Hola%2C%20buen%20d%C3%ADa.%20Soy%20de%20Los%20Inge.%20Necesito%20solicitar%20reabastecimiento%20del%20producto%20Agua%20natural.%20Actualmente%20tenemos%200%20unidades%20disponibles%20y%20el%20l%C3%ADmite%20configurado%20es%205.%20%C2%BFPodr%C3%ADa%20apoyarme%20con%20disponibilidad%20y%20precio%3F\",\"mailtoUrl\":null}','2026-06-05 12:09:23'),(40,NULL,4,'Alertas','Solicitar compra','Se solicitó reabastecimiento del producto Agua natural al proveedor Marlen por WhatsApp.',26,'{\"estado\":\"Pendiente\"}','{\"estado\":\"Pendiente de compra\",\"proveedor\":\"Marlen\",\"proveedorTelefono\":\"7226866255\",\"proveedorCorreo\":\"marlencitlallig18@gmail.com\",\"medio\":\"WhatsApp\",\"mensajeCompra\":\"Hola, buen día. Soy de Los Inge. Necesito solicitar reabastecimiento del producto Agua natural. Actualmente tenemos 0 unidades disponibles y el límite configurado es 5. ¿Podría apoyarme con disponibilidad y precio?\",\"whatsappUrl\":\"https://wa.me/527226866255?text=Hola%2C%20buen%20d%C3%ADa.%20Soy%20de%20Los%20Inge.%20Necesito%20solicitar%20reabastecimiento%20del%20producto%20Agua%20natural.%20Actualmente%20tenemos%200%20unidades%20disponibles%20y%20el%20l%C3%ADmite%20configurado%20es%205.%20%C2%BFPodr%C3%ADa%20apoyarme%20con%20disponibilidad%20y%20precio%3F\",\"mailtoUrl\":null}','2026-06-05 12:10:07'),(41,NULL,4,'Alertas','Solicitar compra','Se solicitó reabastecimiento del producto Agua natural al proveedor Marlen por Correo.',26,'{\"estado\":\"Pendiente\"}','{\"estado\":\"Pendiente de compra\",\"proveedor\":\"Marlen\",\"proveedorTelefono\":\"7226866255\",\"proveedorCorreo\":\"marlencitlallig18@gmail.com\",\"medio\":\"Correo\",\"mensajeCompra\":\"Hola, buen día. Soy de Los Inge. Necesito solicitar reabastecimiento del producto Agua natural. Actualmente tenemos 0 unidades disponibles y el límite configurado es 5. ¿Podría apoyarme con disponibilidad y precio?\",\"whatsappUrl\":null,\"mailtoUrl\":\"mailto:marlencitlallig18@gmail.com?subject=Solicitud%20de%20reabastecimiento%20-%20Agua%20natural&body=Hola%2C%20buen%20d%C3%ADa.%0A%0ASoy%20de%20Los%20Inge.%20Necesito%20solicitar%20reabastecimiento%20del%20producto%20Agua%20natural.%0A%0AStock%20actual%3A%200%0AL%C3%ADmite%20configurado%3A%205%0A%0A%C2%BFPodr%C3%ADa%20apoyarme%20con%20disponibilidad%2C%20precio%20y%20tiempo%20de%20entrega%3F%0A%0AGracias.\"}','2026-06-05 12:11:10'),(42,NULL,NULL,'Configuración','Actualizar logo de empresa','Se actualizó el logo de la empresa.',NULL,NULL,'{\"logoUrl\":\"/images/logo-empresa.png\"}','2026-06-05 12:17:34'),(43,NULL,NULL,'Configuración','Actualizar logo de empresa','Se actualizó el logo de la empresa.',NULL,NULL,'{\"logoUrl\":\"/images/logo-empresa.png\"}','2026-06-05 12:20:14'),(44,NULL,NULL,'Cortes de caja','Generar PDF de corte','Se solicitaron datos completos para generar PDF del corte CC-000004.',4,NULL,'{\"folio\":\"CC-000004\",\"reporte\":true}','2026-06-05 12:20:25'),(45,NULL,4,'Alertas','Solicitar compra','Se solicitó reabastecimiento del producto Agua natural al proveedor Marlen por WhatsApp.',26,'{\"estado\":\"Pendiente\"}','{\"estado\":\"Pendiente de compra\",\"proveedor\":\"Marlen\",\"proveedorTelefono\":\"7226866255\",\"proveedorCorreo\":\"marlencitlallig18@gmail.com\",\"medio\":\"WhatsApp\",\"mensajeCompra\":\"Hola, buen día. Soy de Los Inge. Necesito solicitar reabastecimiento del producto Agua natural. Actualmente tenemos 0 unidades disponibles y el límite configurado es 5. ¿Podría apoyarme con disponibilidad y precio?\",\"whatsappUrl\":\"https://wa.me/527226866255?text=Hola%2C%20buen%20d%C3%ADa.%20Soy%20de%20Los%20Inge.%20Necesito%20solicitar%20reabastecimiento%20del%20producto%20Agua%20natural.%20Actualmente%20tenemos%200%20unidades%20disponibles%20y%20el%20l%C3%ADmite%20configurado%20es%205.%20%C2%BFPodr%C3%ADa%20apoyarme%20con%20disponibilidad%20y%20precio%3F\",\"mailtoUrl\":null}','2026-06-05 12:21:23'),(46,NULL,NULL,'Configuración','Editar datos de empresa','Se editaron los datos de empresa Los Inge.',1,'{\"id\":1,\"nombre\":\"Los Inge\",\"giro\":\"Comida rapida\",\"direccion\":\"Esq. Norte 3 C VBH #416, col. Victor Bravo Aguja, Santa Lucia del Camino\",\"telefono\":\"722 686 6255\",\"correo\":\"marrlencitlallig@gmail.com\",\"mision\":\"Dar un mejor servicio \",\"vision\":\"Ofrecer a nuestros clientes un servicio de excelente calidad con comida deliciosa\",\"valores\":\"Honestidad, puntualidad, calidad en el servicio, profesionalismo, respeto, tolerancia, solidaridad y justicia\"}','{\"id\":1,\"nombre\":\"Los Inge\",\"giro\":\"Comida rapida\",\"direccion\":\"Esq. Norte 3 C VBH #416, col. Victor Bravo Aguja, Santa Lucia del Camino\",\"telefono\":\"951 101 5707\",\"correo\":\"marrlencitlallig@gmail.com\",\"mision\":\"Dar un mejor servicio \",\"vision\":\"Ofrecer a nuestros clientes un servicio de excelente calidad con comida deliciosa\",\"valores\":\"Honestidad, puntualidad, calidad en el servicio, profesionalismo, respeto, tolerancia, solidaridad y justicia\"}','2026-06-05 12:21:57'),(47,NULL,NULL,'Cortes de caja','Generar PDF de corte','Se solicitaron datos completos para generar PDF del corte CC-000003.',3,NULL,'{\"folio\":\"CC-000003\",\"reporte\":true}','2026-06-05 12:25:41'),(48,NULL,4,'Alertas','Solicitar compra','Se solicitó reabastecimiento del producto Agua natural al proveedor Marlen por WhatsApp.',26,'{\"estado\":\"Pendiente\"}','{\"estado\":\"Pendiente de compra\",\"proveedor\":\"Marlen\",\"proveedorTelefono\":\"7226866255\",\"proveedorCorreo\":\"marlencitlallig18@gmail.com\",\"medio\":\"WhatsApp\",\"mensajeCompra\":\"Hola, buen día. Soy de Los Inge. Necesito solicitar reabastecimiento del producto Agua natural. Actualmente tenemos 0 unidades disponibles y el límite configurado es 5. ¿Podría apoyarme con disponibilidad y precio?\",\"whatsappUrl\":\"https://wa.me/527226866255?text=Hola%2C%20buen%20d%C3%ADa.%20Soy%20de%20Los%20Inge.%20Necesito%20solicitar%20reabastecimiento%20del%20producto%20Agua%20natural.%20Actualmente%20tenemos%200%20unidades%20disponibles%20y%20el%20l%C3%ADmite%20configurado%20es%205.%20%C2%BFPodr%C3%ADa%20apoyarme%20con%20disponibilidad%20y%20precio%3F\",\"mailtoUrl\":null}','2026-06-05 12:37:21'),(49,NULL,NULL,'Cortes de caja','Crear corte de caja','Se creo el corte de caja CC-000005.',5,NULL,'{\"id\":5,\"folio\":\"CC-000005\",\"usuario_id\":null,\"canal_id\":null,\"turno\":\"Matutino\",\"fecha\":\"2026-06-05\",\"hora_inicio\":\"06:00\",\"hora_fin\":\"16:00\",\"total_ventas\":514,\"total_efectivo\":514,\"total_tarjeta\":0,\"total_transferencia\":0,\"monto_contado\":6000,\"diferencia\":5486,\"ventasIncluidas\":[60,61,62,63,64,65,66]}','2026-06-05 12:49:16'),(50,NULL,NULL,'Cortes de caja','Generar PDF de corte','Se solicitaron datos completos para generar PDF del corte CC-000005.',5,NULL,'{\"folio\":\"CC-000005\",\"reporte\":true}','2026-06-05 12:49:18'),(51,NULL,NULL,'Cortes de caja','Crear corte de caja','Se creo el corte de caja CC-000006.',6,NULL,'{\"id\":6,\"folio\":\"CC-000006\",\"usuario_id\":11,\"canal_id\":null,\"turno\":\"Matutino\",\"fecha\":\"2026-06-05\",\"hora_inicio\":\"08:00\",\"hora_fin\":\"16:00\",\"total_ventas\":0,\"total_efectivo\":0,\"total_tarjeta\":0,\"total_transferencia\":0,\"monto_contado\":0,\"diferencia\":0,\"ventasIncluidas\":[]}','2026-06-05 13:09:56'),(52,NULL,NULL,'Cortes de caja','Generar PDF de corte','Se solicitaron datos completos para generar PDF del corte CC-000006.',6,NULL,'{\"folio\":\"CC-000006\",\"reporte\":true}','2026-06-05 13:09:58'),(53,NULL,NULL,'Cortes de caja','Crear corte de caja','Se creo el corte de caja CC-000007.',7,NULL,'{\"id\":7,\"folio\":\"CC-000007\",\"usuario_id\":11,\"canal_id\":null,\"turno\":\"Matutino\",\"fecha\":\"2026-06-05\",\"hora_inicio\":\"05:00\",\"hora_fin\":\"16:00\",\"total_ventas\":60,\"total_efectivo\":60,\"total_tarjeta\":0,\"total_transferencia\":0,\"monto_contado\":0,\"diferencia\":-60,\"ventasIncluidas\":[66]}','2026-06-05 13:10:24'),(54,NULL,NULL,'Cortes de caja','Generar PDF de corte','Se solicitaron datos completos para generar PDF del corte CC-000007.',7,NULL,'{\"folio\":\"CC-000007\",\"reporte\":true}','2026-06-05 13:10:27'),(55,NULL,4,'Alertas','Solicitar compra','Se solicitó reabastecimiento del producto Agua natural al proveedor Marlen por WhatsApp.',26,'{\"estado\":\"Pendiente\"}','{\"estado\":\"Pendiente de compra\",\"proveedor\":\"Marlen\",\"proveedorTelefono\":\"951 101 5707\",\"proveedorCorreo\":\"marlencitlallig18@gmail.com\",\"medio\":\"WhatsApp\",\"mensajeCompra\":\"Hola, buen día. Soy de Los Inge. Necesito solicitar reabastecimiento del producto Agua natural. Actualmente tenemos 0 unidades disponibles y el límite configurado es 5. ¿Podría apoyarme con disponibilidad, precio y tiempo de entrega?\",\"whatsappUrl\":\"https://wa.me/529511015707?text=Hola%2C%20buen%20d%C3%ADa.%20Soy%20de%20Los%20Inge.%20Necesito%20solicitar%20reabastecimiento%20del%20producto%20Agua%20natural.%20Actualmente%20tenemos%200%20unidades%20disponibles%20y%20el%20l%C3%ADmite%20configurado%20es%205.%20%C2%BFPodr%C3%ADa%20apoyarme%20con%20disponibilidad%2C%20precio%20y%20tiempo%20de%20entrega%3F\",\"mailtoUrl\":null,\"gmailUrl\":null}','2026-06-05 13:19:44'),(56,NULL,4,'Alertas','Solicitar compra','Se solicitó reabastecimiento del producto Agua natural al proveedor Marlen por Gmail.',26,'{\"estado\":\"Pendiente\"}','{\"estado\":\"Pendiente de compra\",\"proveedor\":\"Marlen\",\"proveedorTelefono\":\"951 101 5707\",\"proveedorCorreo\":\"marlencitlallig18@gmail.com\",\"medio\":\"Gmail\",\"mensajeCompra\":\"Hola, buen día. Soy de Los Inge. Necesito solicitar reabastecimiento del producto Agua natural. Actualmente tenemos 0 unidades disponibles y el límite configurado es 5. ¿Podría apoyarme con disponibilidad, precio y tiempo de entrega?\",\"whatsappUrl\":null,\"mailtoUrl\":null,\"gmailUrl\":\"https://mail.google.com/mail/?view=cm&fs=1&to=marlencitlallig18%40gmail.com&su=Solicitud%20de%20reabastecimiento%20-%20Agua%20natural&body=Hola%2C%20buen%20d%C3%ADa.%0A%0ASoy%20de%20Los%20Inge.%20Necesito%20solicitar%20reabastecimiento%20del%20producto%20Agua%20natural.%0A%0AStock%20actual%3A%200%0AL%C3%ADmite%20configurado%3A%205%0A%0A%C2%BFPodr%C3%ADa%20apoyarme%20con%20disponibilidad%2C%20precio%20y%20tiempo%20de%20entrega%3F%0A%0AGracias.\"}','2026-06-05 13:20:26');
/*!40000 ALTER TABLE `bitacora_sistema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `canales`
--

DROP TABLE IF EXISTS `canales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `canales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int DEFAULT NULL,
  `nombre` varchar(80) NOT NULL,
  `tipo` enum('Digital','Presencial') NOT NULL,
  `estado` enum('Activo','Inactivo') DEFAULT 'Activo',
  `activo` tinyint DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `canales_empresa_fk` (`empresa_id`),
  CONSTRAINT `canales_empresa_fk` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `canales`
--

LOCK TABLES `canales` WRITE;
/*!40000 ALTER TABLE `canales` DISABLE KEYS */;
INSERT INTO `canales` VALUES (1,1,'WhatsApp','Digital','Inactivo',0),(2,1,'Tienda local sur','Digital','Inactivo',0),(3,1,'Instagram','Digital','Inactivo',0),(4,1,'Tienda física','Presencial','Inactivo',0),(5,1,'Web','Digital','Inactivo',1),(6,1,'Punto de venta','Presencial','Inactivo',0),(9,1,'Mostrador','Presencial','Activo',1),(10,1,'Didi Foods','Digital','Activo',1),(11,1,'Uber Eats','Digital','Inactivo',0),(12,1,'Telefono','Digital','Inactivo',0),(14,1,'Facebook','Digital','Inactivo',0);
/*!40000 ALTER TABLE `canales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `activo` tinyint DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (6,'Chocolate',0),(11,'Especialidades',0),(12,'Aguas',0),(16,'Tacos',1),(17,'Comidas',1),(18,'Bebidas simples',0),(19,'Postres',1),(20,'Combos',1),(21,'Extras',1),(28,'General',0),(29,'Promociones',0),(31,'Hamburguesas',0),(32,'Sin categoria',1),(33,'Bebidas',1),(34,'Salsas',0);
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cierre_caja_detalle`
--

DROP TABLE IF EXISTS `cierre_caja_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cierre_caja_detalle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cierre_id` int NOT NULL,
  `corte_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cierre_corte` (`cierre_id`,`corte_id`),
  KEY `fk_cierre_detalle_corte` (`corte_id`),
  CONSTRAINT `fk_cierre_detalle_cierre` FOREIGN KEY (`cierre_id`) REFERENCES `cierres_caja` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cierre_detalle_corte` FOREIGN KEY (`corte_id`) REFERENCES `cortes_caja` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cierre_caja_detalle`
--

LOCK TABLES `cierre_caja_detalle` WRITE;
/*!40000 ALTER TABLE `cierre_caja_detalle` DISABLE KEYS */;
/*!40000 ALTER TABLE `cierre_caja_detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cierres_caja`
--

DROP TABLE IF EXISTS `cierres_caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cierres_caja` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `fecha` date NOT NULL,
  `total_cortes` int DEFAULT '0',
  `total_ventas` decimal(10,2) DEFAULT '0.00',
  `total_efectivo` decimal(10,2) DEFAULT '0.00',
  `total_tarjeta` decimal(10,2) DEFAULT '0.00',
  `total_transferencia` decimal(10,2) DEFAULT '0.00',
  `monto_final_contado` decimal(10,2) DEFAULT '0.00',
  `diferencia` decimal(10,2) DEFAULT '0.00',
  `observaciones` text,
  `estado` enum('cerrado','cancelado') DEFAULT 'cerrado',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_cierres_empresa` (`empresa_id`),
  KEY `fk_cierres_usuario` (`usuario_id`),
  CONSTRAINT `fk_cierres_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cierres_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cierres_caja`
--

LOCK TABLES `cierres_caja` WRITE;
/*!40000 ALTER TABLE `cierres_caja` DISABLE KEYS */;
/*!40000 ALTER TABLE `cierres_caja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion_sistema`
--

DROP TABLE IF EXISTS `configuracion_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_sistema` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int DEFAULT NULL,
  `clave` varchar(80) NOT NULL,
  `valor` varchar(255) NOT NULL,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_configuracion_clave` (`clave`),
  KEY `fk_configuracion_empresa` (`empresa_id`),
  CONSTRAINT `fk_configuracion_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_sistema`
--

LOCK TABLES `configuracion_sistema` WRITE;
/*!40000 ALTER TABLE `configuracion_sistema` DISABLE KEYS */;
INSERT INTO `configuracion_sistema` VALUES (1,1,'stock_minimo_alerta','5','2026-06-05 02:06:01'),(2,1,'alerta_producto_agotado','1','2026-06-05 02:06:01'),(3,1,'alerta_stock_bajo','1','2026-06-05 02:06:01'),(4,1,'alerta_reabastecimiento','1','2026-06-05 02:06:01');
/*!40000 ALTER TABLE `configuracion_sistema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `corte_caja_detalle`
--

DROP TABLE IF EXISTS `corte_caja_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `corte_caja_detalle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `corte_id` int NOT NULL,
  `venta_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_corte_venta` (`corte_id`,`venta_id`),
  KEY `fk_corte_detalle_venta` (`venta_id`),
  CONSTRAINT `fk_corte_detalle_corte` FOREIGN KEY (`corte_id`) REFERENCES `cortes_caja` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_corte_detalle_venta` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `corte_caja_detalle`
--

LOCK TABLES `corte_caja_detalle` WRITE;
/*!40000 ALTER TABLE `corte_caja_detalle` DISABLE KEYS */;
INSERT INTO `corte_caja_detalle` VALUES (1,1,50),(2,2,50),(3,5,60),(4,5,61),(5,5,62),(6,5,63),(7,5,64),(8,5,65),(9,5,66),(10,7,66);
/*!40000 ALTER TABLE `corte_caja_detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cortes_caja`
--

DROP TABLE IF EXISTS `cortes_caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cortes_caja` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `canal_id` int DEFAULT NULL,
  `folio` varchar(30) DEFAULT NULL,
  `turno` enum('Matutino','Vespertino','Nocturno','Personalizado') DEFAULT 'Personalizado',
  `fecha` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `total_ventas` decimal(10,2) DEFAULT '0.00',
  `total_efectivo` decimal(10,2) DEFAULT '0.00',
  `total_tarjeta` decimal(10,2) DEFAULT '0.00',
  `total_transferencia` decimal(10,2) DEFAULT '0.00',
  `monto_contado` decimal(10,2) DEFAULT '0.00',
  `diferencia` decimal(10,2) DEFAULT '0.00',
  `observaciones` text,
  `estado` enum('cerrado','cancelado') DEFAULT 'cerrado',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `total_productos_vendidos` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_cortes_empresa` (`empresa_id`),
  KEY `fk_cortes_usuario` (`usuario_id`),
  KEY `fk_cortes_canal` (`canal_id`),
  CONSTRAINT `fk_cortes_canal` FOREIGN KEY (`canal_id`) REFERENCES `canales` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cortes_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cortes_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cortes_caja`
--

LOCK TABLES `cortes_caja` WRITE;
/*!40000 ALTER TABLE `cortes_caja` DISABLE KEYS */;
INSERT INTO `cortes_caja` VALUES (1,1,NULL,NULL,'CC-000001','Vespertino','2026-06-02','08:00:00','16:00:00',45.00,45.00,0.00,0.00,0.00,-45.00,NULL,'cerrado','2026-06-03 00:30:23',0),(2,1,NULL,NULL,'CC-000002','Personalizado','2026-06-02','08:00:00','16:00:00',45.00,45.00,0.00,0.00,0.00,-45.00,NULL,'cerrado','2026-06-03 00:31:01',0),(3,NULL,NULL,NULL,'CC-000003','Matutino','2026-06-05','08:00:00','16:00:00',0.00,0.00,0.00,0.00,2000.00,2000.00,NULL,'cerrado','2026-06-05 10:14:31',0),(4,NULL,NULL,NULL,'CC-000004','Matutino','2026-06-05','08:00:00','16:00:00',0.00,0.00,0.00,0.00,1382.00,1382.00,NULL,'cerrado','2026-06-05 10:15:04',0),(5,NULL,NULL,NULL,'CC-000005','Matutino','2026-06-05','06:00:00','16:00:00',514.00,514.00,0.00,0.00,6000.00,5486.00,NULL,'cerrado','2026-06-05 12:49:16',0),(6,NULL,11,NULL,'CC-000006','Matutino','2026-06-05','08:00:00','16:00:00',0.00,0.00,0.00,0.00,0.00,0.00,NULL,'cerrado','2026-06-05 13:09:56',0),(7,NULL,11,NULL,'CC-000007','Matutino','2026-06-05','05:00:00','16:00:00',60.00,60.00,0.00,0.00,0.00,-60.00,NULL,'cerrado','2026-06-05 13:10:24',0);
/*!40000 ALTER TABLE `cortes_caja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_ventas`
--

DROP TABLE IF EXISTS `detalle_ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_ventas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `venta_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `detalle_ventas_ibfk_1` (`venta_id`),
  KEY `detalle_ventas_ibfk_2` (`producto_id`),
  CONSTRAINT `detalle_ventas_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `detalle_ventas_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_ventas`
--

LOCK TABLES `detalle_ventas` WRITE;
/*!40000 ALTER TABLE `detalle_ventas` DISABLE KEYS */;
INSERT INTO `detalle_ventas` VALUES (1,1,1,2,180.00,360.00,'2026-05-22 13:07:59'),(2,2,1,1,180.00,180.00,'2026-05-22 13:07:59'),(3,3,2,3,90.00,270.00,'2026-05-22 13:07:59'),(4,4,2,2,90.00,180.00,'2026-05-22 13:07:59'),(5,5,3,2,160.00,320.00,'2026-05-22 13:07:59'),(6,6,4,1,390.00,390.00,'2026-05-22 13:07:59'),(7,7,5,2,130.00,260.00,'2026-05-22 13:07:59'),(8,8,6,1,220.00,220.00,'2026-05-22 13:07:59'),(9,9,9,1,760.00,760.00,'2026-05-22 13:07:59'),(10,10,10,1,6500.00,6500.00,'2026-05-22 13:07:59'),(11,11,11,1,950.00,950.00,'2026-05-22 13:07:59'),(12,12,12,2,450.00,900.00,'2026-05-22 13:07:59'),(16,16,1,2,180.00,360.00,'2026-05-22 13:07:59'),(17,17,2,1,90.00,90.00,'2026-05-22 13:07:59'),(18,18,3,2,160.00,320.00,'2026-05-22 13:07:59'),(19,19,4,1,390.00,390.00,'2026-05-22 13:07:59'),(20,20,5,3,130.00,390.00,'2026-05-22 13:07:59'),(21,21,6,2,220.00,440.00,'2026-05-22 13:07:59'),(22,22,9,1,760.00,760.00,'2026-05-22 13:07:59'),(23,23,10,1,6500.00,6500.00,'2026-05-22 13:07:59'),(24,24,11,1,950.00,950.00,'2026-05-22 13:07:59'),(25,25,12,2,450.00,900.00,'2026-05-22 13:07:59'),(30,30,11,2,950.00,1900.00,'2026-05-22 13:07:59'),(31,31,5,3,130.00,390.00,'2026-05-22 13:07:59'),(65,34,31,1,129.00,129.00,'2026-05-22 14:23:06'),(66,34,30,1,45.00,45.00,'2026-05-22 14:23:06'),(67,35,31,1,129.00,129.00,'2026-05-26 22:38:12'),(68,36,28,1,35.00,35.00,'2026-05-26 22:51:33'),(69,36,27,1,25.00,25.00,'2026-05-26 22:51:33'),(70,36,26,1,18.00,18.00,'2026-05-26 22:51:33'),(71,37,30,1,45.00,45.00,'2026-05-26 22:53:02'),(72,38,31,1,129.00,129.00,'2026-05-26 22:53:15'),(73,38,30,1,45.00,45.00,'2026-05-26 22:53:15'),(74,38,29,1,55.00,55.00,'2026-05-26 22:53:15'),(75,38,27,1,25.00,25.00,'2026-05-26 22:53:15'),(76,39,31,1,129.00,129.00,'2026-05-26 23:04:45'),(77,39,30,2,45.00,90.00,'2026-05-26 23:04:45'),(78,39,29,1,55.00,55.00,'2026-05-26 23:04:45'),(79,40,29,1,55.00,55.00,'2026-05-27 13:37:22'),(80,40,28,1,35.00,35.00,'2026-05-27 13:37:22'),(81,41,31,1,129.00,129.00,'2026-05-27 15:57:37'),(82,41,30,1,45.00,45.00,'2026-05-27 15:57:37'),(83,41,26,1,18.00,18.00,'2026-05-27 15:57:37'),(84,42,31,1,129.00,129.00,'2026-05-27 16:59:27'),(85,43,29,1,55.00,55.00,'2026-05-27 17:05:31'),(86,43,28,1,35.00,35.00,'2026-05-27 17:05:31'),(87,43,31,1,129.00,129.00,'2026-05-27 17:05:31'),(88,43,30,1,45.00,45.00,'2026-05-27 17:05:31'),(89,44,30,1,45.00,45.00,'2026-05-27 17:10:13'),(90,45,30,1,45.00,45.00,'2026-05-27 19:33:47'),(91,46,26,1,18.00,18.00,'2026-05-27 19:40:45'),(92,47,30,1,45.00,45.00,'2026-05-27 19:53:50'),(93,48,30,1,45.00,45.00,'2026-05-27 22:34:01'),(94,48,29,1,55.00,55.00,'2026-05-27 22:34:01'),(95,49,27,1,25.00,25.00,'2026-05-27 22:47:38'),(96,49,28,1,35.00,35.00,'2026-05-27 22:47:38'),(97,49,29,1,55.00,55.00,'2026-05-27 22:47:38'),(98,50,30,1,45.00,45.00,'2026-06-02 19:36:54'),(99,51,32,3,15.00,45.00,'2026-06-02 22:47:55'),(100,52,30,1,45.00,45.00,'2026-06-03 00:07:24'),(101,52,28,1,35.00,35.00,'2026-06-03 00:07:24'),(102,52,27,1,25.00,25.00,'2026-06-03 00:07:24'),(103,53,32,4,15.00,60.00,'2026-06-03 00:39:49'),(104,53,31,5,129.00,645.00,'2026-06-03 00:39:49'),(105,54,32,5,15.00,75.00,'2026-06-03 19:24:39'),(106,55,24,1,99.00,99.00,'2026-06-03 19:26:29'),(107,56,28,1,35.00,35.00,'2026-06-03 19:27:31'),(108,56,30,1,45.00,45.00,'2026-06-03 19:27:31'),(109,56,31,1,129.00,129.00,'2026-06-03 19:27:31'),(110,56,24,1,99.00,99.00,'2026-06-03 19:27:31'),(111,57,33,1,25.00,25.00,'2026-06-05 10:39:47'),(112,57,32,1,15.00,15.00,'2026-06-05 10:39:47'),(113,58,30,5,45.00,225.00,'2026-06-05 10:40:14'),(114,59,33,1,25.00,25.00,'2026-06-05 11:05:47'),(115,60,30,3,45.00,135.00,'2026-06-05 12:08:27'),(116,61,32,1,15.00,15.00,'2026-06-05 12:12:17'),(117,61,33,1,25.00,25.00,'2026-06-05 12:12:17'),(118,62,32,1,15.00,15.00,'2026-06-05 12:22:08'),(119,63,33,1,25.00,25.00,'2026-06-05 12:33:27'),(120,63,32,1,15.00,15.00,'2026-06-05 12:33:27'),(121,64,33,2,25.00,50.00,'2026-06-05 12:43:18'),(122,65,31,1,129.00,129.00,'2026-06-05 12:43:28'),(123,65,30,1,45.00,45.00,'2026-06-05 12:43:28'),(124,66,30,1,45.00,45.00,'2026-06-05 12:45:08'),(125,66,32,1,15.00,15.00,'2026-06-05 12:45:08'),(126,67,33,1,25.00,25.00,'2026-06-05 13:12:50'),(127,67,32,1,15.00,15.00,'2026-06-05 13:12:50'),(128,68,31,3,129.00,387.00,'2026-06-05 13:22:22');
/*!40000 ALTER TABLE `detalle_ventas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empresa`
--

DROP TABLE IF EXISTS `empresa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empresa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `giro` varchar(150) NOT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `mision` text,
  `vision` text,
  `valores` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empresa`
--

LOCK TABLES `empresa` WRITE;
/*!40000 ALTER TABLE `empresa` DISABLE KEYS */;
INSERT INTO `empresa` VALUES (1,'Los Inge','Comida rapida','Esq. Norte 3 C VBH #416, col. Victor Bravo Aguja, Santa Lucia del Camino','951 101 5707','marrlencitlallig@gmail.com','Dar un mejor servicio ','Ofrecer a nuestros clientes un servicio de excelente calidad con comida deliciosa','Honestidad, puntualidad, calidad en el servicio, profesionalismo, respeto, tolerancia, solidaridad y justicia');
/*!40000 ALTER TABLE `empresa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimientos_caja`
--

DROP TABLE IF EXISTS `movimientos_caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimientos_caja` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `corte_id` int DEFAULT NULL,
  `tipo` enum('Fondo inicial','Entrada','Retiro','Gasto','Ajuste') NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `motivo` varchar(255) NOT NULL,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('Activo','Cancelado') DEFAULT 'Activo',
  PRIMARY KEY (`id`),
  KEY `idx_movimientos_corte` (`corte_id`),
  KEY `fk_movimientos_empresa` (`empresa_id`),
  KEY `fk_movimientos_usuario` (`usuario_id`),
  CONSTRAINT `fk_movimientos_corte` FOREIGN KEY (`corte_id`) REFERENCES `cortes_caja` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_movimientos_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_movimientos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos_caja`
--

LOCK TABLES `movimientos_caja` WRITE;
/*!40000 ALTER TABLE `movimientos_caja` DISABLE KEYS */;
/*!40000 ALTER TABLE `movimientos_caja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int DEFAULT NULL,
  `sku` varchar(30) NOT NULL,
  `codigo_barras` varchar(50) DEFAULT NULL,
  `nombre` varchar(120) NOT NULL,
  `imagen_url` text,
  `categoria_id` int NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `precio_sugerido` decimal(10,2) DEFAULT NULL,
  `stock` int NOT NULL,
  `demanda` enum('Baja','Media','Alta') DEFAULT 'Media',
  `promedio_ventas_diarias` decimal(10,2) DEFAULT '0.00',
  `estado` enum('Activo','Stock crítico','Riesgo de agotamiento','Inactivo') DEFAULT 'Activo',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `proveedor_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  UNIQUE KEY `uq_productos_codigo_barras` (`codigo_barras`),
  KEY `categoria_id` (`categoria_id`),
  KEY `productos_empresa_fk` (`empresa_id`),
  KEY `fk_productos_proveedor` (`proveedor_id`),
  CONSTRAINT `fk_productos_proveedor` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `productos_empresa_fk` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (23,1,'POS-HAM-001','750100000001','Hamburguesa clasica','https://barbacoaburger.com/wp-content/uploads/2024/12/HAMBURGUESA-SENCILLA.png',17,89.00,93.00,50,'Media',0.00,'Inactivo','2026-05-22 13:12:29',NULL),(24,1,'POS-PIZ-002','750100000002','Pizza individual','http://elrincondejeanne.com/cdn/shop/files/B8214D24-45BA-4AD6-AF1E-F284FE9671BD.jpg?v=1756925010',17,99.00,104.00,38,'Media',0.00,'Activo','2026-05-22 13:12:29',NULL),(25,1,'POS-TAC-003','750100000003','Tacos al pastor',NULL,17,75.00,75.00,60,'Media',0.00,'Inactivo','2026-05-22 13:12:29',NULL),(26,1,'POS-AGU-004','750100000004','Agua natural','/images/productos/agua-1780446498614.jpeg',33,18.00,19.00,0,'Media',0.00,'Activo','2026-05-22 13:12:29',1),(27,1,'POS-REF-005','750100000005','Refresco cola','https://www.google.com/imgres?q=refresco%20coca%20cola%20vaso&imgurl=https%3A%2F%2Fpng.pngtree.com%2Fpng-clipart%2F20231005%2Foriginal%2Fpngtree-coke-drink-glass-png-image_13271452.png&imgrefurl=https%3A%2F%2Fes.pngtree.com%2Ffreepng%2Fcoke-drink-glass_13271452.html&docid=9Mymgbf8_n0azM&tbnid=X7TEVChrVkbkzM&vet=12ahUKEwjilZ_uxumUAxUinGoFHYAEBSQQnPAOegQIGBAB..i&w=1200&h=1200&hcb=2&ved=2ahUKEwjilZ_uxumUAxUinGoFHYAEBSQQnPAOegQIGBAB',33,25.00,26.00,0,'Media',0.00,'Activo','2026-05-22 13:12:29',1),(28,1,'POS-CAF-006','750100000006','Cafe americano','/images/productos/cafe-1780424433223.jpeg',33,35.00,37.00,64,'Media',0.00,'Activo','2026-05-22 13:12:29',NULL),(29,1,'POS-PAS-007','750100000007','Pastel de chocolate','https://imgs.search.brave.com/aOBQ6NJvupQuH2pBe3_ihKS3Ck9kaae3sgpG8VNqCb0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTE5/MTQ1ODgxMi9lcy9m/b3RvL3Bhc3RlbC1k/ZS1jYXBhLWRlLWNo/b2NvbGF0ZS5qcGc_/cz02MTJ4NjEyJnc9/MCZrPTIwJmM9N01J/VnowQWdwVzJnTTI4/aHlsQ2NpZVRoZkx2/OFVmTWJ3MmR0dWRa/WFFfOD0',19,55.00,58.00,0,'Media',0.00,'Stock crítico','2026-05-22 13:12:29',NULL),(30,1,'POS-PAP-008','750100000008','Papas a la francesa','https://imgs.search.brave.com/kmgN-4o4I9uiw8YbC_T-M2aay5lOc--QsZKXlrunrUU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS1jZG4udHJpcGFk/dmlzb3IuY29tL21l/ZGlhL3Bob3RvLW8v/MTMvZjQvNDcvZWYv/b3JkZW4tZGUtcGFw/YXMtYS1sYS1mcmFu/Y2VzYS5qcGc',21,45.00,47.00,21,'Media',0.00,'Activo','2026-05-22 13:12:29',NULL),(31,1,'POS-CHB-009','750100000009','Combo hamburguesaaaa','/images/productos/combohamburguesa-1779900882554.png',20,129.00,135.00,18,'Media',0.00,'Activo','2026-05-22 13:12:29',NULL),(32,1,'POS-NEW-031','34567890','Tacos','https://imgs.search.brave.com/l2T0_vTzyrlhQYx8yG7moIF3fuZgKldubVA1lRaNAE8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMjI0/MjI5ODM1MC9waG90/by90d28tZnJpZW5k/cy1nZXR0aW5nLXRv/LWtub3ctbWV4aWNv/LXN0b3AtdG8tZWF0/LXRhY29zLWFsLXBh/c3Rvci1vbi10aGUt/c3RyZWV0LndlYnA_/YT0xJmI9MSZzPTYx/Mng2MTImdz0wJms9/MjAmYz1mcEkzcVlw/djhjSWl4SkppT0dp/VUlvUFM0QV9udjVN/dXd5WmY0bVBzdFZ3/PQ',16,15.00,16.00,7,'Media',0.00,'Activo','2026-05-27 22:37:19',NULL),(33,1,'POS-NEW-009','750100000079','Agua de horchata','https://mahatmarice.com/wp-content/uploads/2020/04/GettyImages-493110032.jpg',33,25.00,26.00,6,'Media',0.00,'Activo','2026-06-04 23:09:39',1);
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedores`
--

DROP TABLE IF EXISTS `proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `direccion` text,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_proveedores_empresa` (`empresa_id`),
  CONSTRAINT `fk_proveedores_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedores`
--

LOCK TABLES `proveedores` WRITE;
/*!40000 ALTER TABLE `proveedores` DISABLE KEYS */;
INSERT INTO `proveedores` VALUES (1,1,'Marlen','951 101 5707','marlencitlallig18@gmail.com','Norte 3 106','activo','2026-06-02 19:35:57');
/*!40000 ALTER TABLE `proveedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('Administrador','Cajero','Empleado','Tecnico','Supervisor') DEFAULT 'Cajero',
  `estado` enum('Activo','Inactivo') DEFAULT 'Activo',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `canal_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`),
  KEY `usuarios_empresa_fk` (`empresa_id`),
  CONSTRAINT `usuarios_empresa_fk` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (4,1,'Administrador Generals','admin@merkalinkpos.com','scrypt$a3915958e889566a44d8212a336a8360$0fb5ccd6e227457abf2e3bc0b148309d049eda0080d93a22913dd9e394c6af09bd5403a15f3b9134d822da1d024bb233833f5e1fb7310972919daf7f0d0b0756','Administrador','Activo','2026-05-22 12:54:06',NULL),(5,1,'Cajero Principal','cajero@merkalinkpos.com','scrypt$cf328f51bbd2490b1b5d85158de9ed8b$2ec0924da0af5b92e64c4e1f651a16c81d07cde23e8fc38b7145f7818ab39e6dbdccaedca07b56a932e6dfeb3702a7f20d5eb8a0089473f5ba2635c883a99629','Cajero','Activo','2026-05-22 12:54:06',NULL),(11,1,'Cajero 2','cajero2@merkalinkpos.com','scrypt$6d635d3a33607c5f41ce215c75bf3b02$f279963f1f5a0bb0fab33c6f5111cd9b37299ef7df049b99c676848aef669f0d5f696e22dcbeebb2be825aa7defa9b1475008034f7de52f2102d480f56e96636','Cajero','Activo','2026-06-03 00:17:15',6);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int DEFAULT NULL,
  `folio` varchar(30) DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `canal_id` int NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `metodo_pago` enum('Efectivo','Tarjeta','Transferencia','Mixto') DEFAULT 'Efectivo',
  `monto_recibido` decimal(10,2) DEFAULT NULL,
  `cambio` decimal(10,2) DEFAULT NULL,
  `estado` enum('Completada','Cancelada') DEFAULT 'Completada',
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `canal_id` (`canal_id`),
  KEY `ventas_ibfk_3` (`usuario_id`),
  KEY `ventas_empresa_fk` (`empresa_id`),
  CONSTRAINT `ventas_empresa_fk` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`),
  CONSTRAINT `ventas_ibfk_2` FOREIGN KEY (`canal_id`) REFERENCES `canales` (`id`),
  CONSTRAINT `ventas_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas`
--

LOCK TABLES `ventas` WRITE;
/*!40000 ALTER TABLE `ventas` DISABLE KEYS */;
INSERT INTO `ventas` VALUES (1,1,'POS-000001',NULL,1,360.00,'Efectivo',NULL,NULL,'Completada','2026-03-20 16:15:00'),(2,1,'POS-000002',NULL,1,180.00,'Efectivo',NULL,NULL,'Completada','2026-05-19 22:13:09'),(3,1,'POS-000003',NULL,4,270.00,'Efectivo',NULL,NULL,'Completada','2026-05-19 22:13:09'),(4,1,'POS-000004',NULL,3,180.00,'Efectivo',NULL,NULL,'Completada','2026-05-19 22:13:09'),(5,1,'POS-000005',NULL,3,320.00,'Efectivo',NULL,NULL,'Completada','2026-05-19 22:13:09'),(6,1,'POS-000006',NULL,2,390.00,'Efectivo',NULL,NULL,'Completada','2026-05-19 22:13:09'),(7,1,'POS-000007',NULL,4,260.00,'Efectivo',NULL,NULL,'Completada','2026-05-19 22:13:09'),(8,1,'POS-000008',NULL,1,220.00,'Efectivo',NULL,NULL,'Completada','2026-05-19 22:13:09'),(9,1,'POS-000009',NULL,1,760.00,'Efectivo',NULL,NULL,'Completada','2026-05-19 22:13:09'),(10,1,'POS-000010',NULL,4,6500.00,'Efectivo',NULL,NULL,'Completada','2026-05-19 22:13:09'),(11,1,'POS-000011',NULL,2,950.00,'Efectivo',NULL,NULL,'Completada','2026-05-19 22:13:09'),(12,1,'POS-000012',NULL,1,900.00,'Efectivo',NULL,NULL,'Completada','2026-05-19 22:13:09'),(13,1,'POS-000013',NULL,1,280.00,'Efectivo',NULL,NULL,'Completada','2026-05-20 07:51:29'),(14,1,'POS-000014',NULL,3,45.00,'Efectivo',NULL,NULL,'Completada','2026-05-20 07:52:01'),(15,1,'POS-000015',NULL,3,240.00,'Efectivo',NULL,NULL,'Completada','2026-05-20 07:52:49'),(16,1,'POS-000016',NULL,1,360.00,'Efectivo',NULL,NULL,'Completada','2026-03-22 16:30:00'),(17,1,'POS-000017',NULL,2,90.00,'Efectivo',NULL,NULL,'Completada','2026-03-28 18:10:00'),(18,1,'POS-000018',NULL,3,320.00,'Efectivo',NULL,NULL,'Completada','2026-04-02 21:25:00'),(19,1,'POS-000019',NULL,4,390.00,'Efectivo',NULL,NULL,'Completada','2026-04-08 15:50:00'),(20,1,'POS-000020',NULL,1,390.00,'Efectivo',NULL,NULL,'Completada','2026-04-15 19:40:00'),(21,1,'POS-000021',NULL,2,440.00,'Efectivo',NULL,NULL,'Completada','2026-04-21 22:30:00'),(22,1,'POS-000022',NULL,3,760.00,'Efectivo',NULL,NULL,'Completada','2026-04-29 17:20:00'),(23,1,'POS-000023',NULL,4,6500.00,'Efectivo',NULL,NULL,'Completada','2026-05-03 23:10:00'),(24,1,'POS-000024',NULL,1,950.00,'Efectivo',NULL,NULL,'Completada','2026-05-08 16:45:00'),(25,1,'POS-000025',NULL,2,900.00,'Efectivo',NULL,NULL,'Completada','2026-05-13 20:00:00'),(26,1,'POS-000026',NULL,3,120.00,'Efectivo',NULL,NULL,'Completada','2026-05-19 00:30:00'),(27,1,'POS-000027',NULL,4,90.00,'Efectivo',NULL,NULL,'Completada','2026-05-19 18:15:00'),(28,1,'POS-000028',NULL,1,280.00,'Efectivo',NULL,NULL,'Completada','2026-05-20 15:30:00'),(29,1,'POS-000029',NULL,1,280.00,'Efectivo',NULL,NULL,'Completada','2026-05-20 08:15:16'),(30,1,'POS-000030',NULL,2,1900.00,'Efectivo',NULL,NULL,'Completada','2026-05-20 08:15:28'),(31,1,'POS-000031',NULL,1,390.00,'Efectivo',NULL,NULL,'Completada','2026-05-20 10:15:11'),(32,1,'POS-000032',NULL,2,1400.00,'Efectivo',NULL,NULL,'Completada','2026-05-21 23:11:56'),(33,1,'POS-000033',5,6,200.00,'Efectivo',NULL,NULL,'Completada','2026-05-22 13:10:22'),(34,1,'POS-000034',5,6,174.00,'Transferencia',NULL,NULL,'Completada','2026-05-22 14:23:06'),(35,1,'POS-000035',5,6,129.00,'Efectivo',NULL,NULL,'Completada','2026-05-26 22:38:12'),(36,1,'POS-000036',4,6,78.00,'Efectivo',NULL,NULL,'Completada','2026-05-26 22:51:33'),(37,1,'POS-000037',NULL,2,45.00,'Efectivo',NULL,NULL,'Completada','2026-05-26 22:53:02'),(38,1,'POS-000038',5,6,254.00,'Tarjeta',NULL,NULL,'Completada','2026-05-26 22:53:15'),(39,1,'POS-000039',4,6,274.00,'Efectivo',NULL,NULL,'Completada','2026-05-26 23:04:45'),(40,1,'POS-000040',4,6,90.00,'Efectivo',NULL,NULL,'Completada','2026-05-27 13:37:22'),(41,1,NULL,4,6,192.00,'Efectivo',NULL,NULL,'Completada','2026-05-27 15:57:37'),(42,1,NULL,4,6,129.00,'Efectivo',NULL,NULL,'Completada','2026-05-27 16:59:27'),(43,1,NULL,4,6,264.00,'Efectivo',NULL,NULL,'Completada','2026-05-27 17:05:31'),(44,1,NULL,4,6,45.00,'Efectivo',NULL,NULL,'Completada','2026-05-27 17:10:13'),(45,1,'POS-000045',4,10,45.00,'Efectivo',60.00,15.00,'Completada','2026-05-27 19:33:47'),(46,1,'POS-000046',4,10,18.00,'Efectivo',30.00,12.00,'Completada','2026-05-27 19:40:45'),(47,1,'POS-000047',4,10,45.00,'Tarjeta',45.00,0.00,'Completada','2026-05-27 19:53:50'),(48,1,'POS-000048',4,10,100.00,'Efectivo',500.00,400.00,'Completada','2026-05-27 22:34:01'),(49,1,'POS-000049',5,9,115.00,'Efectivo',500.00,385.00,'Completada','2026-05-27 22:47:38'),(50,1,'POS-000050',4,10,45.00,'Efectivo',60.00,15.00,'Completada','2026-06-02 19:36:54'),(51,1,'POS-000051',5,9,45.00,'Efectivo',700.00,655.00,'Completada','2026-06-02 22:47:55'),(52,1,'POS-000052',4,9,105.00,'Efectivo',600.00,495.00,'Completada','2026-06-03 00:07:24'),(53,1,'POS-000053',4,9,705.00,'Efectivo',1000.00,295.00,'Completada','2026-06-03 00:39:49'),(54,1,'POS-000054',4,9,75.00,'Tarjeta',75.00,0.00,'Completada','2026-06-03 19:24:39'),(55,1,'POS-000055',4,9,99.00,'Efectivo',200.00,101.00,'Completada','2026-06-03 19:26:29'),(56,1,'POS-000056',4,9,308.00,'Efectivo',1000.00,692.00,'Completada','2026-06-03 19:27:31'),(57,NULL,'POS-000057',4,9,40.00,'Efectivo',60.00,20.00,'Completada','2026-06-05 10:39:47'),(58,NULL,'POS-000058',4,9,225.00,'Efectivo',500.00,275.00,'Completada','2026-06-05 10:40:14'),(59,NULL,'POS-000059',4,9,25.00,'Efectivo',500.00,475.00,'Completada','2026-06-05 11:05:47'),(60,NULL,'POS-000060',4,9,135.00,'Efectivo',500.00,365.00,'Completada','2026-06-05 12:08:27'),(61,NULL,'POS-000061',4,9,40.00,'Efectivo',500.00,460.00,'Completada','2026-06-05 12:12:17'),(62,NULL,'POS-000062',4,9,15.00,'Efectivo',15.00,0.00,'Completada','2026-06-05 12:22:08'),(63,NULL,'POS-000063',4,9,40.00,'Efectivo',500.00,460.00,'Completada','2026-06-05 12:33:27'),(64,NULL,'POS-000064',5,9,50.00,'Efectivo',56.00,6.00,'Completada','2026-06-05 12:43:18'),(65,NULL,'POS-000065',5,9,174.00,'Efectivo',500.00,326.00,'Completada','2026-06-05 12:43:28'),(66,NULL,'POS-000066',11,9,60.00,'Efectivo',99.99,39.99,'Completada','2026-06-05 12:45:08'),(67,NULL,'POS-000067',4,10,40.00,'Efectivo',500.00,460.00,'Completada','2026-06-05 13:12:50'),(68,NULL,'POS-000068',4,9,387.00,'Efectivo',500.00,113.00,'Completada','2026-06-05 13:22:22');
/*!40000 ALTER TABLE `ventas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-05  7:46:26

-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: atmosfera
-- ------------------------------------------------------
-- Server version	8.4.11-0ubuntu0.26.04.1

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
-- Table structure for table `atuadores`
--

DROP TABLE IF EXISTS `atuadores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `atuadores` (
  `id_atuador` int NOT NULL AUTO_INCREMENT,
  `id_dispositivo_fk` int NOT NULL,
  `nome_atuador` varchar(30) NOT NULL,
  `status_atual` tinyint(1) NOT NULL DEFAULT '0',
  `ultimo_comando` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_atuador`),
  KEY `fk_dispositivo_atuadores` (`id_dispositivo_fk`),
  CONSTRAINT `fk_dispositivo_atuadores` FOREIGN KEY (`id_dispositivo_fk`) REFERENCES `dispositivos` (`id_dispositivo`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `atuadores`
--

LOCK TABLES `atuadores` WRITE;
/*!40000 ALTER TABLE `atuadores` DISABLE KEYS */;
INSERT INTO `atuadores` VALUES (4,4,'Miguel\'s boy',1,'2026-10-09 15:40:04'),(5,1,'Miguel\'sMom',1,'2026-10-09 15:40:04'),(6,1,'Miguel\'sMom',1,'2026-10-09 15:40:04'),(7,1,'Miguel\'sMom',1,'2026-10-09 15:40:04'),(8,1,'Miguel\'sMom',1,'2026-10-09 15:40:04'),(9,1,'Miguel\'sMom',1,NULL),(10,1,'Miguel\'sMom',1,'2026-10-09 15:40:04'),(11,1,'Miguel\'s boy',1,'2026-10-09 15:40:04');
/*!40000 ALTER TABLE `atuadores` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-30 12:22:54

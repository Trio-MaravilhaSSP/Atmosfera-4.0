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
-- Temporary view structure for view `v_Registros_Dispositivos`
--

DROP TABLE IF EXISTS `v_Registros_Dispositivos`;
/*!50001 DROP VIEW IF EXISTS `v_Registros_Dispositivos`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_Registros_Dispositivos` AS SELECT 
 1 AS `Dispositivo`,
 1 AS `Data`,
 1 AS `Temperatura`,
 1 AS `Umidade`,
 1 AS `Pressão`,
 1 AS `Altitude`,
 1 AS `Luminosidade`,
 1 AS `Velocidade do vento`,
 1 AS `Direção do vento`,
 1 AS `Intensidade do Wifi`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_Registros_Atuadores`
--

DROP TABLE IF EXISTS `v_Registros_Atuadores`;
/*!50001 DROP VIEW IF EXISTS `v_Registros_Atuadores`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_Registros_Atuadores` AS SELECT 
 1 AS `Atuador`,
 1 AS `Status`,
 1 AS `Ultimo comando`,
 1 AS `Dispositivo`,
 1 AS `Localização`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `v_Registros_Dispositivos`
--

/*!50001 DROP VIEW IF EXISTS `v_Registros_Dispositivos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_Registros_Dispositivos` AS select `d`.`nome_dispositivo` AS `Dispositivo`,`r`.`data_hora` AS `Data`,`r`.`temperatura` AS `Temperatura`,`r`.`umidade` AS `Umidade`,`r`.`pressao` AS `Pressão`,`r`.`altitude` AS `Altitude`,`r`.`luminosidade` AS `Luminosidade`,`r`.`velocidade_vento` AS `Velocidade do vento`,`r`.`direcao_vento` AS `Direção do vento`,`r`.`intensidade_wifi` AS `Intensidade do Wifi` from (`dispositivos` `d` join `registros` `r` on((`r`.`id_dispositivo_fk` = `d`.`id_dispositivo`))) order by `d`.`nome_dispositivo` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_Registros_Atuadores`
--

/*!50001 DROP VIEW IF EXISTS `v_Registros_Atuadores`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_Registros_Atuadores` AS select `at`.`nome_atuador` AS `Atuador`,`at`.`status_atual` AS `Status`,`at`.`ultimo_comando` AS `Ultimo comando`,`ds`.`nome_dispositivo` AS `Dispositivo`,`ds`.`localizacao` AS `Localização` from (`atuadores` `at` join `dispositivos` `ds` on((`at`.`id_dispositivo_fk` = `ds`.`id_dispositivo`))) order by `at`.`nome_atuador` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-30 12:22:54

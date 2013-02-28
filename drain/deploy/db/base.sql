/*
SQLyog Ultimate v10.42 
MySQL - 5.1.36-community : Database - leakage
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*Table structure for table `meta_domains` */

CREATE TABLE `meta_domains` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `domain_name` varchar(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `domain_name` (`domain_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

/*Table structure for table `meta_http_queries` */

CREATE TABLE `meta_http_queries` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `http_query` varchar(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `http_query` (`http_query`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

/*Table structure for table `meta_sql` */

CREATE TABLE `meta_sql` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `sql` varchar(255) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sql` (`sql`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

/*Table structure for table `queries` */

CREATE TABLE `queries` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `session_id` char(10) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `sql_id` int(10) unsigned NOT NULL,
  `account_id` int(10) unsigned NOT NULL,
  `person_id` int(10) unsigned NOT NULL,
  `domain_id` int(10) unsigned NOT NULL,
  `http_query_id` int(10) unsigned NOT NULL,
  `query_time` int(10) unsigned NOT NULL,
  `log_date` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

/*Table structure for table `requests` */

CREATE TABLE `requests` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `session_id` char(10) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `account_id` int(10) unsigned NOT NULL,
  `person_id` int(10) unsigned NOT NULL,
  `domain_id` int(10) unsigned NOT NULL,
  `http_query_id` int(10) unsigned NOT NULL,
  `render_time` int(10) unsigned NOT NULL,
  `log_date` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

/*Table structure for table `queries_view` */

DROP TABLE IF EXISTS `queries_view`;

/*!50001 CREATE TABLE  `queries_view`(
 `domain_name` varchar(255) ,
 `query_time` int(10) unsigned ,
 `log_date` datetime ,
 `sql` varchar(255) ,
 `http_query` varchar(255) 
)*/;

/*Table structure for table `requests_view` */

DROP TABLE IF EXISTS `requests_view`;

/*!50001 CREATE TABLE  `requests_view`(
 `domain_name` varchar(255) ,
 `render_time` int(10) unsigned ,
 `log_date` datetime ,
 `http_query` varchar(255) 
)*/;

/*View structure for view queries_view */

/*!50001 DROP TABLE IF EXISTS `queries_view` */;
/*!50001 CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`127.0.0.1` SQL SECURITY DEFINER VIEW `queries_view` AS (select `meta_domains`.`domain_name` AS `domain_name`,`queries`.`query_time` AS `query_time`,`queries`.`log_date` AS `log_date`,`meta_sql`.`sql` AS `sql`,`meta_http_queries`.`http_query` AS `http_query` from (((`meta_sql` join `queries` on((`meta_sql`.`id` = `queries`.`sql_id`))) join `meta_http_queries` on((`meta_http_queries`.`id` = `queries`.`http_query_id`))) join `meta_domains` on((`meta_domains`.`id` = `queries`.`domain_id`))) order by `queries`.`log_date` desc) */;

/*View structure for view requests_view */

/*!50001 DROP TABLE IF EXISTS `requests_view` */;
/*!50001 CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`127.0.0.1` SQL SECURITY DEFINER VIEW `requests_view` AS (select `meta_domains`.`domain_name` AS `domain_name`,`requests`.`render_time` AS `render_time`,`requests`.`log_date` AS `log_date`,`meta_http_queries`.`http_query` AS `http_query` from ((`meta_domains` join `requests` on((`meta_domains`.`id` = `requests`.`domain_id`))) join `meta_http_queries` on((`meta_http_queries`.`id` = `requests`.`http_query_id`))) order by `requests`.`log_date` desc) */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

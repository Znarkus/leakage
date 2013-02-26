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
  `sql_id` int(10) unsigned NOT NULL,
  `account_id` int(10) unsigned NOT NULL,
  `domain_id` int(10) unsigned NOT NULL,
  `http_query_id` int(10) unsigned NOT NULL,
  `query_time` int(10) unsigned NOT NULL,
  `log_date` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

/*Table structure for table `requests` */

CREATE TABLE `requests` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `account_id` int(10) unsigned NOT NULL,
  `domain_id` int(10) unsigned NOT NULL,
  `http_query_id` int(10) unsigned NOT NULL,
  `render_time` int(10) unsigned NOT NULL,
  `log_date` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

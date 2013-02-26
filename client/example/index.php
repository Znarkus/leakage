<?php

error_reporting(E_ALL | E_STRICT);

/* Get the port for the WWW service. */
//$service_port = getservbyname('www', 'tcp');

/* Get the IP address for the target host. */
//$address = gethostbyname('www.example.com');
require __DIR__ . '/../lib/leakage.php';

$ip = '127.0.0.1';
$port = 4001;
$leakage = new Leakage($ip, $port);
$leakage->log('query', array(
	'domainName' => 'example.com',
	'httpQuery' => '/test?param=valueåäö',
	'sql' => 'SELECT * FROM tables WHERE id = ?',
	'accountId' => 9812,
	'queryTime' => 99219921
));

/* Create a TCP/IP socket. */


/*$in = "HEAD / HTTP/1.1\r\n";
$in .= "Host: www.example.com\r\n";
$in .= "Connection: Close\r\n\r\n";
$out = '';

echo "Sending HTTP HEAD request...";
socket_write($socket, $in, strlen($in));
echo "OK.\n";

echo "Reading response:\n\n";*/
/*while ($out = socket_read($socket, 2048)) {
    echo $out;
}*/

/*if (socket_read($socket, 4) !== 'done') {
	throw new Exception('Job receipt not received');
}

echo "Closing socket...";
socket_close($socket);
echo "OK.\n\n";*/
<?php

class Leakage
{
	private $_socket;
	
	public function __construct($ip, $port)
	{
		$this->_socket = @socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
		//socket_set_nonblock($this->_socket);

		if ($this->_socket === false) {
		    throw new Exception("socket_create() failed: reason: " . socket_strerror(socket_last_error()));
		}

		//echo "Attempting to connect to '{$ip}' on port '{$port}'...";
		$result = @socket_connect($this->_socket, $ip, $port);
		
		if ($result === false) {
		    throw new Exception("socket_connect() failed. Reason: ($result) " . socket_strerror(socket_last_error($this->_socket)));
		}

		
	}
	
	public function log($type, $data)
	{
		$data['logDate'] = time();
		socket_write($this->_socket, json_encode(array('type' => $type, 'data' => $data)));
	}
}
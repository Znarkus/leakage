<?php

class Leakage
{
	private $_socket;
	private $_ip;
	private $_port;
	private $_session_id;
	private $_connection_fail = false;
	
	public function __construct($ip, $port)
	{
		$this->_session_id = base_convert(uniqid(), 16, 36);
		$this->_ip = $ip;
		$this->_port = $port;
	}
	
	private function _connect()
	{
		if ($this->_connection_fail) {
			$this->_connection_fail = true;
			return false;
		}
		
		$this->_socket = @socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
		//socket_set_nonblock($this->_socket);
		
		if ($this->_socket === false) {
		    //throw new Exception("socket_create() failed: reason: " . socket_strerror(socket_last_error()));
		    
		    return false;
		}
		
		//echo "Attempting to connect to '{$ip}' on port '{$port}'...";
		$result = @socket_connect($this->_socket, $this->_ip, $this->_port);
		
		if ($result === false) {
		    //throw new Exception("socket_connect() failed. Reason: ($result) " . socket_strerror(socket_last_error($this->_socket)));
		    $this->_connection_fail = true;
		    return false;
		}
		
		return true;
	}
	
	public function log($type, $data)
	{
		if ($this->_connect()) {
			$data['logDate'] = time();
			$data['sessionId'] = $this->_session_id;
			socket_write($this->_socket, json_encode(array('type' => $type, 'data' => $data)));
			socket_close($this->_socket);
		}
	}
}
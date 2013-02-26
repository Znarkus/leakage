var Net = require('net'),
	Util = require('util'),
	Http = require('http'),
	queue = [],
	processingQueue = false,
	netClient,
	netServer;

function processQueue() {
	if (processingQueue) {
		return false;
	}
	
	var req, data;
	
	processingQueue = true;
	data = queue.shift();
	console.log('Processing queue.');
	
	req = Http.request({
		host: '127.0.0.1',
		port: 4000,
		path: '/',
		method: 'POST',
		headers: { 'Content-type': 'application/json' }
	}, function (res) {
		/*console.log('STATUS: ' + res.statusCode);
		console.log('HEADERS: ' + JSON.stringify(res.headers));*/
		//res.setEncoding('utf8');
		/*res.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
		});*/
		
		processingQueue = false;
		
		if (res.statusCode != 200) {
			queue.push(data);
		}
		
		if (queue.length > 0) {
			processQueue();
		}
	});

	req.on('error', function(e) {
		console.error('Problem with request: ' + e.message);
		queue.push(data);
		processingQueue = false;
	});

	// write data to request body
	req.write(data);
	req.end();
}
	
netServer = Net.createServer(function (socket) {
	/*
	Protocol:
	[Type]\n
	[JSON data length]\n
	[Raw JSON data]
	*/
	var buffer = [],
		length = 0;

	socket.setEncoding('utf8');
	socket.on('data', function (data) {
		buffer.push(data);
		length += data.length;
	});
	
	socket.on('close', function () {
		console.log('Connection closed.');
		//console.log(buffer);
		queue.push(buffer.join(''));
		processQueue();
		//netClient.write(buffer.join(''));
	});
	
	socket.on('connect', function () {
		console.log('Connection from ' + socket.remoteAddress + '.');
	});
});

netServer.on('listening', function () {
	var address = netServer.address();
	console.log('Sink listening on %s:%s.', address.address, address.port);
});

netServer.listen(4001, '127.0.0.1');

/*netClient = Net.connect({ port: 4000 }, function () {
	console.log('Connected to drain at %s:%s.', netClient.remoteAddress, netClient.remotePort);
});

netClient.on('end', function () {
	console.error('Drain disconnected.');
	process.exit(1);
});

netClient.on('error', function (err) {
	console.error('Failed to connect to drain.');
	process.exit(1);
});*/
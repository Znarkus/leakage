var Net = require('net'),
	Util = require('util'),
	netClient, netServer;

netServer = Net.createServer(function (socket) {
	var buffer = [],
		length = 0;

	socket.setEncoding('utf8');
	socket.on('data', function (data) {
		buffer.push(data);
		length += data.length;
	});
	
	socket.on('close', function () {
		netClient = Net.connect({ port: 4000 }, function () {
			console.log('client connected');
			
			/*netClient.write('query\n' + JSON.stringify({
				domainName: 'example.com',
				httpQuery: '/test?param=valueåäö',
				sql: 'SELECT * FROM tables WHERE id = ?',
				accountId: 9812,
				queryTime: 99219921
			}));*/
			console.log(buffer);
			netClient.write(buffer.join(''));
			
			netClient.end();
		});

		netClient.on('data', function (data) {
			console.log(data.toString());
			netClient.end();
		});

		netClient.on('end', function () {
			console.log('client disconnected');
		});
		
		console.info('Connection closed.');
		
		
	});
	
	socket.on('connect', function () {
		console.info('Connection from ' + socket.remoteAddress + '.');
	});
});

netServer.on('listening', function () {
	console.info(Util.format('TCP server listening on port %d at %s.', 4001, '127.0.0.1'));
});

netServer.listen(4001, '127.0.0.1');
	

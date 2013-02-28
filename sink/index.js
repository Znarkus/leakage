var Net = require('net'),
	Util = require('util'),
	Http = require('http'),
	Commander = require('commander'),
	logger = require('just-log'),
	//Nconf = require('nconf'),
	queue = [],
	processingQueue = false,
	netClient,
	netServer,
	delayTimer,
	config;

function delayedProcessQueue() {
	if (!delayTimer) {
		delayTimer = setTimeout(function () {
			delayTimer = null;
			processQueue();
		}, 3000);
	}
}

function processQueue() {
	if (processingQueue) {
		return false;
	}
	
	var req, data;
	
	processingQueue = true;
	data = queue.shift();
	
	logger.verbose('Processing queue. Queue length: %s', queue.length);
	
	req = Http.request({
		host: config.drain.hostname,
		port: config.drain.port,
		path: '/',
		method: 'POST',
		headers: { 'Content-type': 'application/json' }
	}, function (res) {
		/*logger.verbose('STATUS: ' + res.statusCode);
		logger.verbose('HEADERS: ' + JSON.stringify(res.headers));*/
		//res.setEncoding('utf8');
		/*res.on('data', function (chunk) {
			logger.verbose('BODY: ' + chunk);
		});*/
		
		processingQueue = false;
		
		if (res.statusCode != 200) {
			logger.error('Request failed with code ' + res.statusCode);
			queue.push(data);
			delayedProcessQueue();
		} else if (queue.length > 0) {
			logger.verbose('Successfully sent data to drain.');
			processQueue();
		}
		
		
	});

	req.on('error', function(e) {
		logger.error('Problem with request: ' + e.message);
		processingQueue = false;
		queue.push(data);
		delayedProcessQueue();
	});

	// write data to request body
	req.write(data);
	req.end();
}

Commander
	.option('-c, --config [path]', 'Config file (json)')
	.option('-d, --debug', 'Enable debug mode')
	.option('-v, --verbose', 'Enable verbose mode')
	//.option('-a, --address [address]', 'Bind to address:port', '127.0.0.1:4000')
	.parse(process.argv);

if (!Commander.config) {
	Commander.help();
}

logger.mode.debug = Commander.debug;
logger.mode.verbose = Commander.verbose;

config = require(process.cwd() + '/' + Commander.config);

/*(function () {
	var address;
	
	address = Commander.config ?  Commander.address;
	address = address.match(/^(.*):(\d+)$/);
	
	config = {
		ip: address[1],
		port: address[2]
	};
}());*/
	
netServer = Net.createServer(function (socket) {
	var buffer = [],
		length = 0;

	socket.setEncoding('utf8');
	socket.on('data', function (data) {
		buffer.push(data);
		length += data.length;
	});
	
	socket.on('close', function () {
		//logger.verbose(buffer);
		queue.push(buffer.join(''));
		logger.verbose('Connection closed. Data added to queue. Queue length: %s', queue.length);
		processQueue();
		//netClient.write(buffer.join(''));
	});
	
	socket.on('connect', function () {
		logger.verbose('Connection from ' + socket.remoteAddress + '.');
	});
});

netServer.on('listening', function () {
	var address = netServer.address();
	logger.info('Sink listening on %s:%s.', address.address, address.port);
});

netServer.listen(config.server.port, config.server.ip);

/*netClient = Net.connect({ port: 4000 }, function () {
	logger.verbose('Connected to drain at %s:%s.', netClient.remoteAddress, netClient.remotePort);
});

netClient.on('end', function () {
	logger.error('Drain disconnected.');
	process.exit(1);
});

netClient.on('error', function (err) {
	logger.error('Failed to connect to drain.');
	process.exit(1);
});*/
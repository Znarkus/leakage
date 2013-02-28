var Net = require('net'),
	Util = require('util'),
	Http = require('http'),
	Commander = require('commander'),
	Logger = require('just-log'),
	Fs = require('fs'),
	//Nconf = require('nconf'),
	queue = [],
	processingQueue = false,
	stats,
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
	
	Logger.verbose('Processing queue. Queue length: %s', queue.length);
	
	req = Http.request({
		host: config.drain.hostname,
		port: config.drain.port,
		path: '/',
		method: 'POST',
		headers: { 'Content-type': 'application/json' }
	}, function (res) {
		/*Logger.verbose('STATUS: ' + res.statusCode);
		Logger.verbose('HEADERS: ' + JSON.stringify(res.headers));*/
		//res.setEncoding('utf8');
		/*res.on('data', function (chunk) {
			Logger.verbose('BODY: ' + chunk);
		});*/
		
		processingQueue = false;
		
		if (res.statusCode != 200) {
			Logger.error('Request failed with code ' + res.statusCode);
			stats.sentFailed++;
			queue.push(data);
			delayedProcessQueue();
		} else if (queue.length > 0) {
			Logger.verbose('Successfully sent data to drain.');
			stats.sent++;
			processQueue();
		}
		
		
	});

	req.on('error', function(e) {
		Logger.error('Problem with request: ' + e.message);
		stats.sentFailed++;
		processingQueue = false;
		queue.push(data);
		delayedProcessQueue();
	});

	// write data to request body
	req.write(data);
	req.end();
}

function resetStats() {
	stats = { received: 0, sent: 0, sentFailed: 0 };
}

Commander
	.option('-c, --config [path]', 'Config file (json)')
	.option('-d, --debug', 'Enable debug mode')
	.option('-v, --verbose', 'Enable verbose mode')
	.option('-s, --status [path]', 'Write status to a file every minute')
	//.option('-a, --address [address]', 'Bind to address:port', '127.0.0.1:4000')
	.parse(process.argv);

if (!Commander.config) {
	Commander.help();
}

Logger.mode.debug = !!Commander.debug;
Logger.mode.verbose = !!Commander.verbose;

resetStats();

if (Commander.status) {
	setInterval(function () {
		Fs.appendFile(Commander.status, Util.format('Queue length is %d. Stats: %j\n', queue.length, stats));
		resetStats();
	}, 60000);
}

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
		var data = buffer.join('');
		//Logger.verbose(buffer);
		queue.push(data);
		stats.received++;
		Logger.verbose('Data added to queue: %s', data);
		Logger.verbose('Connection closed. Queue length: %s', queue.length);
		processQueue();
		//netClient.write(buffer.join(''));
	});
	
	socket.on('connect', function () {
		Logger.verbose('Connection from ' + socket.remoteAddress + '.');
	});
});

netServer.on('listening', function () {
	var address = netServer.address();
	Logger.info('Sink listening on %s:%s.', address.address, address.port);
});

netServer.listen(config.server.port, config.server.ip);

/*netClient = Net.connect({ port: 4000 }, function () {
	Logger.verbose('Connected to drain at %s:%s.', netClient.remoteAddress, netClient.remotePort);
});

netClient.on('end', function () {
	Logger.error('Drain disconnected.');
	process.exit(1);
});

netClient.on('error', function (err) {
	Logger.error('Failed to connect to drain.');
	process.exit(1);
});*/
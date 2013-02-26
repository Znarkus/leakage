var Do = require('do'),
	Mysql = require('Mysql'),
	Net = require('net'), 
	Util = require('util'),
	netServer,
	mysqlConnection;

mysqlConnection = Mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'leakage'
});



function queryInsert(sql, data, callback) {
	mysqlConnection.query(sql, data, function(err, result) {
		if (err) {
			throw err;
		}
		
		// Callback( [error], result )
		callback(null, result.insertId);
	});
}

function addMeta(table, data, callback) {
	queryInsert('INSERT INTO ' + Mysql.escapeId(table) + ' SET ? ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)', data, callback);
}

function logQuery(data) {
	var todo = new Do(3),
		sqlData = {};
	
	// When all meta is inserted, run this
	todo.success(function () {
		sqlData.account_id = data.accountId;
		sqlData.query_time = data.queryTime;
		sqlData.log_date = new Date();
		
		queryInsert('INSERT INTO `queries` SET ?', sqlData, function () {
			// Done
		});
	});
	
	todo.error(function (err) {
		throw err;
	});
	
	
	addMeta('meta_domains', { domain_name: data.domainName }, function (err, id) {
		sqlData.domain_id = id;
		todo.done();
	});
	
	addMeta('meta_http_queries', { http_query: encodeURI(data.httpQuery) }, function (err, id) {
		sqlData.http_query_id = id;
		todo.done();
	});
	
	addMeta('meta_sql', { sql: data.sql }, function (err, id) {
		sqlData.sql_id = id;
		todo.done();
	});
}



netServer = Net.createServer(function (socket) {
	var buffer = [],
		length = 0;

	socket.setEncoding('utf8');
	socket.on('data', function (data) {
		buffer.push(data);
		length += data.length;
	});
	
	socket.on('close', function () {
		var data = buffer.join('').match('^([a-z]+)\n(.+)$');
		
		switch (data[1]) {
			case 'query':
				logQuery(JSON.parse(data[2]));
			break;
			
			default:
				throw Util.format('Invalid log type %s.', data[1]);
		}
		
		console.info('Connection closed.');
		//console.log(buffer, length);
		
	});
	
	socket.on('connect', function () {
		console.info('Connection from ' + socket.remoteAddress + '.');
	});
});

mysqlConnection.connect();
//insert();
//connection.end();

netServer.on('listening', function () {
	console.info(Util.format('TCP server listening on port %d at %s.', 4000, '127.0.0.1'));
});

netServer.listen(4000, '127.0.0.1');
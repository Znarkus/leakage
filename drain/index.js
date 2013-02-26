var Do = require('do'),
	Mysql = require('Mysql'),
	Express = require('express'),
	Util = require('util'),
	mysqlConnection,
	expressApp,
	webServer;


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
		sqlData.log_date = new Date(data.logDate * 1000);
		
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

function logRequest(data) {
	var todo = new Do(2),
		sqlData = {};
	
	// When all meta is inserted, run this
	todo.success(function () {
		sqlData.account_id = data.accountId;
		sqlData.render_time = data.renderTime;
		sqlData.log_date = new Date(data.logDate * 1000);
		
		queryInsert('INSERT INTO `requests` SET ?', sqlData, function () {
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
}



mysqlConnection = Mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'leakage'
});

mysqlConnection.connect();
appExpress = Express();
//insert();
//connection.end();

appExpress.use(Express.json());
appExpress.post('/', function (req, res) {
	console.log('Connection from ' + req.ip + '.');
	res.set('connection', 'close');
	
	if (req.is('application/json')) {
		switch (req.body.type) {
			case 'query':
				logQuery(req.body.data);
			break;
			
			case 'request':
				logRequest(req.body.data);
			break;
			
			default:
				throw Util.format('Invalid log type %s.', req.body.type);
		}
		
		res.send({ success: true });
		
	} else {
		res.send(404, { success: false });
	}
	
	
	/*res.send('hello world');
	console.log(req, res);*/
});

var webServer = appExpress.listen(4000, function () {
	var address = webServer.address();
	console.log('Drain listening for HTTP on %s:%s.', address.address, address.port);
});

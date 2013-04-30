var Do = require('do'),
	Mysql = require('mysql'),
	Express = require('express'),
	Util = require('util'),
	Commander = require('commander'),
	Logger = require('just-log'),
	//metaCache = {},
	mysqlConnection,
	expressApp,
	webServer,
	config;


/*function queryInsert(sql, data, callback) {
	Logger.debug('Sql "%s" with data %j', sql, data);
	
	mysqlConnection.query(sql, data, function(err, result) {
		// Callback( [error], result )
		callback(err, result.insertId);
	});
}*/

function addMeta(table, data, callback) {
	/*var id;
	
	if (metaCache[table] && metaCache[table])*/
	mysqlConnection.query('INSERT INTO ' + Mysql.escapeId(table) + ' SET ? ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)', data, callback);
}

function logQuery(data) {
	var todo = new Do(3),
		sqlData = {};
	
	// When all meta is inserted, run this
	todo.success(function () {
		sqlData.session_id = data.sessionId;
		sqlData.account_id = data.accountId;
		sqlData.person_id = data.personId;
		sqlData.query_time = data.queryTime;
		sqlData.log_date = new Date(data.logDate * 1000);
		
		mysqlConnection.query('INSERT INTO `database_queries` SET ?', sqlData, function (err, result) {
			if (err) {
				Logger.error(err.message);
			}
		});
	});
	
	todo.error(function (err) {
		//throw err;
		Logger.error(err);
	});
	
	addMeta('meta_domains', { domain_name: data.domainName }, function (err, result) {
		if (err) {
			throw err;
		} else {
			sqlData.domain_id = result.insertId;
			todo.done();
		}
	});
	
	addMeta('meta_http_query_strings', { http_query: encodeURI(data.httpQuery) }, function (err, result) {
		if (err) {
			throw err;
		} else {
			sqlData.http_query_string_id = result.insertId;
			todo.done();
		}
	});
	
	addMeta('meta_sql', { sql: data.sql }, function (err, result) {
		if (err) {
			throw err;
		} else {
			sqlData.sql_id = result.insertId;
			todo.done();
		}
	});
}

function logRequest(data) {
	var todo = new Do(2),
		sqlData = {};
	
	// When all meta is inserted, run this
	todo.success(function () {
		sqlData.session_id = data.sessionId;
		sqlData.account_id = data.accountId;
		sqlData.person_id = data.personId;
		sqlData.render_time = data.renderTime;
		sqlData.database_query_count = data.databaseQueryCount;
		sqlData.log_date = new Date(data.logDate * 1000);
		
		mysqlConnection.query('INSERT INTO `http_requests` SET ?', sqlData, function (err, result) {
			if (err) {
				Logger.error(err.message);
			}
		});
	});
	
	todo.error(function (err) {
		//throw err;
		Logger.error(err);
	});
	
	
	addMeta('meta_domains', { domain_name: data.domainName }, function (err, result) {
		if (err) {
			throw err;
		} else {
			sqlData.domain_id = result.insertId;
			todo.done();
		}
	});
	
	addMeta('meta_http_query_strings', { http_query: encodeURI(data.httpQuery) }, function (err, result) {
		if (err) {
			throw err;
		} else {
			sqlData.http_query_string_id = result.insertId;
			todo.done();
		}
	});
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

Logger.mode.debug = !!Commander.debug;
Logger.mode.verbose = !!Commander.verbose;
config = require(process.cwd() + '/' + Commander.config);

mysqlConnection = Mysql.createConnection({
	host     : config.mysql.hostname,
	user     : config.mysql.username,
	password : config.mysql.password,
	database : config.mysql.dbname
});

mysqlConnection.connect(function (err) {
	if (err) {
		Logger.error('Failed to connect to MySQL server.');
		process.exit(1);
	} else {
		Logger.info('Connected to MySQL server on %s:%d.', mysqlConnection.config.host, mysqlConnection.config.port);
	}
});

appExpress = Express();
//insert();
//connection.end();

appExpress.use(Express.json());
appExpress.post('/', function (req, res) {
	function success() {
		res.send({ success: true });
	}
	
	function failed(err) {
		Logger.error(err);
		res.send(404, { success: false });
	}
	
	Logger.verbose('Connection from ' + req.ip + '.');
	res.set('connection', 'close');
	
	if (req.is('application/json')) {
		Logger.debug('Data received: %j', req.body);
		
		switch (req.body.type) {
			case 'query':
				try {
					logQuery(req.body.data);
					success();
				} catch (err) {
					failed(err);
				}
			break;
			
			case 'request':
				try {
					logRequest(req.body.data);
					success();
				} catch (err) {
					failed(err);
				}
			break;
			
			default:
				//throw Util.format('Invalid log type %s.', req.body.type);
				Logger.error('Invalid log type %s.', req.body.type);
				
		}
		
	} else {
		res.send(404, { success: false });
	}
	
	
	/*res.send('hello world');
	Logger.verbose(req, res);*/
});

var webServer = appExpress.listen(config.server.port, function () {
	var address = webServer.address();
	Logger.info('Drain listening for HTTP on %s:%s.', address.address, address.port);
});

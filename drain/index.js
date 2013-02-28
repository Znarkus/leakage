var Do = require('do'),
	Mysql = require('mysql'),
	Express = require('express'),
	Util = require('util'),
	Commander = require('commander'),
	logger = require('just-log'),
	//metaCache = {},
	mysqlConnection,
	expressApp,
	webServer,
	config;


function queryInsert(sql, data, callback) {
	logger.debug('Sql "%s" with data %j', sql, data);
	
	mysqlConnection.query(sql, data, function(err, result) {
		if (err) {
			//throw err;
			Logger.error(err);
		}
		
		// Callback( [error], result )
		callback(null, result.insertId);
	});
}

function addMeta(table, data, callback) {
	/*var id;
	
	if (metaCache[table] && metaCache[table])*/
	queryInsert('INSERT INTO ' + Mysql.escapeId(table) + ' SET ? ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)', data, callback);
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
		sqlData.session_id = data.sessionId;
		sqlData.account_id = data.accountId;
		sqlData.person_id = data.personId;
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


Commander
	.option('-c, --config [path]', 'Config file (json)')
	.option('-d, --debug', 'Enable debug mode')
	.option('-v, --verbose', 'Enable verbose mode')
	//.option('-a, --address [address]', 'Bind to address:port', '127.0.0.1:4000')
	.parse(process.argv);

if (!Commander.config) {
	Commander.help();
}

logger.mode.debug = !!Commander.debug;
logger.mode.verbose = !!Commander.verbose;
config = require(process.cwd() + '/' + Commander.config);

mysqlConnection = Mysql.createConnection({
	host     : config.mysql.hostname,
	user     : config.mysql.username,
	password : config.mysql.password,
	database : config.mysql.dbname
});

mysqlConnection.connect(function (err) {
	if (err) {
		logger.error('Failed to connect to MySQL server.');
		process.exit(1);
	} else {
		logger.info('Connected to MySQL server on %s:%d.', mysqlConnection.config.host, mysqlConnection.config.port);
	}
});

appExpress = Express();
//insert();
//connection.end();

appExpress.use(Express.json());
appExpress.post('/', function (req, res) {
	logger.verbose('Connection from ' + req.ip + '.');
	res.set('connection', 'close');
	
	if (req.is('application/json')) {
		logger.debug('Data received: %j', req.body);
		
		switch (req.body.type) {
			case 'query':
				logQuery(req.body.data);
				res.send({ success: true });
			break;
			
			case 'request':
				logRequest(req.body.data);
				res.send({ success: true });
			break;
			
			default:
				//throw Util.format('Invalid log type %s.', req.body.type);
				Logger.error('Invalid log type %s.', req.body.type);
				res.send(404, { success: false });
		}
		
	} else {
		res.send(404, { success: false });
	}
	
	
	/*res.send('hello world');
	logger.verbose(req, res);*/
});

var webServer = appExpress.listen(config.server.port, function () {
	var address = webServer.address();
	logger.info('Drain listening for HTTP on %s:%s.', address.address, address.port);
});

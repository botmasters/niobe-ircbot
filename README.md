#Niobe IRC Bot - Node.JS

##Installing Required packages:

<pre>
npm install irc
npm install sqlite3
</pre>

##Database creation
<pre>
sqlite3 dbname.db

CREATE TABLE channels (id INTEGER PRIMARY KEY ASC, channel TEXT);
CREATE TABLE users (id INTEGER PRIMARY KEY ASC, user TEXT, email TEXT, level INTEGER DEFAULT 10);
CREATE TABLE definitions (id integer primary key asc, user text, name text, description text);
</pre>

##Usage
```javascript
var niobe = require('niobe-ircbot'),
    config = require('./config.js');

var bot = new niobe(config);
```

##Configuration file
```javascript
var config = {
	servers : {
	    'ServerName' :
		{
		    host : 'irc.server.address',
		    secure : true, // SSL?
		    selfSigned : true, // Self-signed certificate?
		    port : 6697,
		    nick : 'dev_niobe',
		    channels: ['#channel'],
		    db : 'niobe.db' // Sqlite3 Database File
		}
	},
	debug : true,
	modules : [ 'hash', 'ping', 'accountservices', 'quotes' ], // add any modules you want
	modulesPath : './modules/'
};

module.exports = config;
```

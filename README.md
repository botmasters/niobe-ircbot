#Niobe IRC Bot - Node.JS

##Installing Required packages:

<pre>
npm install
</pre>

##Database creation
<pre>
sqlite3 dbname.db

CREATE TABLE channels (id INTEGER PRIMARY KEY ASC, channel TEXT);
CREATE TABLE users (id INTEGER PRIMARY KEY ASC, user TEXT, email TEXT, level INTEGER DEFAULT 10);
CREATE TABLE definitions (id integer primary key asc, user text, name text, description text);
CREATE TABLE telegram_channels (id integer primary key asc, irc_chan text, t_group_id text, mode text);
CREATE TABLE telegram_users (id integer primary key asc, tc_id integer, irc_nick text, t_username text);
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
	    'KernelPanic' :
		{
		    host : 'irc.kernelpanic.com.ar',
		    secure : true,
		    selfSigned : true,
		    port : 6697,
		    nick : 'niobe-dev',
		    channels: ['#niobe'],
		    db : 'niobe.db',
			oper : {
				user : 'oper_user',
				pass : 'oper_pass'
			},

			nickserv : {
				user : 'nickserv_user',
				pass: 'nickserv_pass'
			}
		}
	},
	debug : true,
	modules : [ 'hash', 'ping', 'accountservices', 'explain', 'google', 'exploit-db', 'geoip', 'servicecmds', 'urlinfo', 'telegram' ],
	modulesPath : './modules/'
};

module.exports = config;
```

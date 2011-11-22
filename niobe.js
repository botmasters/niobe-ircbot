/**
 * Niobe IRC Bot
 * This is a very alpha version
 * @author zephrax <zephrax@gmail.com>
 */

var irc = require('irc'),
    config = require('./config.js'),
    child_process = require('child_process'),
    botdb = require('./botdb.js');

//process.on('uncaughtException', function(err) {
//    console.log('Uncaught Exception: ' + err);
//});

var niobe = function (config) {
    var self = this;
    
    this.debug = config.debug || false;
    this.modules = {};
    this.modulesPath = config.modulesPath;
    this.identifiedUsers = [];
    this.clients = {};
    this.dbs = {};
    
    Object.keys(config.servers).forEach(function(key) {
	var server = config.servers[key];
        self.clients[key] = new irc.Client(server.host, server.nick, { channels: server.channels, secure : server.secure, selfSigned: server.selfSigned, debug: server.debug, port : server.port, retryDelay: 5000 });
	self.dbs[key] = new botdb(config.servers[key]);
	
	self.clients[key].on('motd', function () {
	    self.bootstrap(key);
	});
	
	self.clients[key].on('message', function (from, target, message) {
	    if (self.debug)
		console.log(from, target, message);
	    self.commandCenter(key, from, target, message, (target == self.clients[key].opt.nick));
	});
	
	// Load modules
	(config.modules || []).forEach(function (module) {
	    self.loadModule(key, module);
	});
    });
    
};

niobe.prototype.say = function (server, target, text) {
    this.clients[server].say(target, text);
};

niobe.prototype.notice = function (server, target, text) {
    this.clients[server].notice(target, text);
};

niobe.prototype.addModuleListeners = function (server, module) {
    var self = this;
    
    if (this.debug)
	console.log('Adding listeners for ' + module + ' ...');
    
    // Add listeners
    if (module.listeners) {
	(Object.keys(module.listeners) || []).forEach(function (listener) {
	    self.clients[server].on(listener, function proc() {
		var args = arguments,
		    params = [server];
		Object.keys(args).forEach(function (key) {
		    params.push(args[key]);
		});
		var result = module.listeners[listener].apply(self, params);
	    }
	);
	});
    }
};

niobe.prototype.loadModule = function (server, module) {
    if (this.debug)
	console.log('Loading module ' + module + ' ...');
    
    var fp = this.modulesPath + module + '/index.js';
    var pl = require(fp);
    pl.bot = this;
    
    this.modules[module] = pl;
    
    this.addModuleListeners(server, pl);
    
    if (pl.initModule)
	pl.initModule(server);
};

niobe.prototype.unloadModule = function (server, module) {
    var pl = this.plugins[cleanName];
    
    if (self.debug)
	console.log('Unloading module ' + module + ' ...');
    
    if (pl.teardownPlugin) {
	    pl.teardownPlugin(server);
    }
    
    if(pl) {
	    this.removeListeners(server, pl);
	    delete this.plugins[module];
    }
};

/**
 * Performs startup actions, like joining channels, etc..
 */
niobe.prototype.bootstrap = function (server) {
    var self = this;
    
    this.dbs[server].getChannels(function (err, results) {
	if (!err) {
	    (results || []).forEach(function (channel) {
		if (self.debug)
		    console.log('Auto-joining ' + channel.channel + ' ...');
		self.clients[server].join(channel.channel);
	    });
	}
    });
};

/**
 * Niobe Command Processing Center
 * @param string from User who sent the command
 * @param string target Target of the command (channel or my own nick)
 * @param string message Sent message from the user
 * @param bool is_pv True if is a private message
 */
niobe.prototype.commandCenter = function (server, from, channel, message, is_pv) {
    var self = this;
    var parts = message.trim().split(/ +/);
    var command = parts[0];

    if (is_pv) {
    } else {
	switch (command) {
	    case '!uptime':
		this.exec(server, 'uptime', channel);
		break;

	    case '!uname':
		this.exec(server, 'uname', channel, ['-a']);
		break;

	    case '!join':
		//if (self.modules.account.get) check for permissions here
		if (self.modules.account.module.getUserLevel(server, from, channel, message, function (level) {
		    console.log('Level power: ' + level + ' ===== ');
		}));
		if (parts[1] != undefined)
		    this.clients[server].join(parts[1]);
		break;

	    case '!channels':
		this.cmdChannels(server, parts, channel);
		break;

	    case '!debug':
		console.log(this.clients[server].chans);
		break;

	    case '!part':
		if (parts[1] != undefined)
		    this.clients[server].part(parts[1]);
		break;

	    case '!broadcast':
		delete parts[0];
		message = parts.join(' ');
		Object.keys(this.clients[server].chans).forEach(function(chan) {
			    self.clients[server].say(chan, message.trim());
    		});
		break;

	    case 'vater!':
		this.clients[server].send('KICK ' + channel + ' vater','por gato!');
		break;
	    case 'ea':
	    case 'eaea':
	    case 'aza':
		this.clients[server].say(channel, 'eaea');
		break;
	    default:
		break;
	}
    }
};

niobe.prototype.exec = function (server, command, target, args) {
    var self = this;
    
    if (args == undefined)
	var args = [];
    
    var child = child_process.spawn(command, args);
    
    child.stdout.on('data', function (data) {
	self.say(server, target, data);
    });
};

niobe.prototype.cmdChannels = function (server, parts, channel) {
    var self = this;

    this.dbs[server].getChannels(function (err, results) {
	(results || []).forEach(function (chan) {
	    self.say(server, channel, chan.channel);
	});
    });
};

var bot = new niobe(config);

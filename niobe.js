/**
 * Niobe IRC Bot
 * This is a very alpha version
 * @author zephrax <zephrax@gmail.com>
 */

var irc = require('irc'),
    config = require('./config.js'),
    child_process = require('child_process'),
    botdb = require('./botdb.js');

process.on('uncaughtException', function(err) {
    console.log('Uncaught Exception: ' + err);
});

var niobe = function (config) {
    var self = this;
    
    this.debug = config.debug || false;
    this.modules = {};
    this.modulesPath = config.modulesPath;
    this.identifiedUsers = [];
    
    this.client = new irc.Client(config.host, config.nick, { channels: config.channels, secure : true, selfSigned: true, debug: true, port : config.port, retryDelay: 5000 });
    this.db = new botdb(config);
    
    // Load modules
    (config.modules || []).forEach(function (module) {
	self.loadModule(module);
    });
    
    this.client.on('motd', function () {
	self.bootstrap();
	self.client.send('WHOIS zephrax');
    });
    
    this.client.on('message', function (from, target, message) {
	if (self.debug)
	    console.log(from, target, message);
	self.commandCenter(from, target, message, (target == self.client.opt.nick));
    });
};

niobe.prototype.say = function (target, text) {
    this.client.say(target, text);
};

niobe.prototype.notice = function (target, text) {
    this.client.notice(target, text);
};

niobe.prototype.addModuleListeners = function (module) {
    var self = this;
    
    if (this.debug)
	console.log('Adding listeners for ' + module + ' ...');
    
    // Add listeners
    if (module.listeners) {
	(Object.keys(module.listeners) || []).forEach(function (listener) {
	    self.client.on(listener, module.listeners[listener]);
	});
    }
};

niobe.prototype.loadModule = function (module) {
    if (this.debug)
	console.log('Loading module ' + module + ' ...');
    
    var fp = this.modulesPath + module + '/index.js';
    var pl = require(fp);
    pl.bot = this;
    
    this.modules[module] = pl;
    
    this.addModuleListeners(pl);
    
    if (pl.initModule)
	pl.initModule();
};

niobe.prototype.unloadModule = function (module) {
    var pl = this.plugins[cleanName];
    
    if (self.debug)
	console.log('Unloading module ' + module + ' ...');
    
    if (pl.teardownPlugin) {
	    pl.teardownPlugin();
    }
    
    if(pl) {
	    this.removeListeners(pl);
	    delete this.plugins[module];
    }
};

/**
 * Performs startup actions, like joining channels, etc..
 */
niobe.prototype.bootstrap = function () {
    var self = this;
    
    this.db.getChannels(function (err, results) {
	if (!err) {
	    (results || []).forEach(function (channel) {
		if (self.debug)
		    console.log('Auto-joining ' + channel.channel + ' ...');
		self.client.join(channel.channel);
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
niobe.prototype.commandCenter = function (from, channel, message, is_pv) {
    var self = this;
    var parts = message.trim().split(/ +/);
    var command = parts[0];

    if (is_pv) {
    } else {
	switch (command) {
	    case '!uptime':
		this.exec('uptime', channel);
		break;

	    case '!uname':
		this.exec('uname', channel, ['-a']);
		break;

	    case '!join':
		//if (self.modules.account.get) check for permissions here
		if (parts[1] != undefined)
		    this.client.join(parts[1]);
		break;

	    case '!channels':
		this.cmdChannels(parts, channel);
		break;

	    case '!debug':
		console.log(this.client.chans);
		break;

	    case '!part':
		if (parts[1] != undefined)
		    this.client.part(parts[1]);
		break;

	    case '!broadcast':
		delete parts[0];
		message = parts.join(' ');
		Object.keys(this.client.chans).forEach(function(chan) {
			    self.client.say(chan, message);
    		});
		break;
	    case 'vater!':
		this.client.say(channel,'/KICK vater por gato!');
		break;
	
	    default:
		break;
	}
    }
};

niobe.prototype.exec = function (command, target, args) {
    var self = this;
    
    if (args == undefined)
	var args = [];
    
    var child = child_process.spawn(command, args);
    
    child.stdout.on('data', function (data) {
	self.say(target, data);
    });
};

niobe.prototype.cmdChannels = function (parts, channel) {
    var self = this;

    this.db.getChannels(function (err, results) {
	(results || []).forEach(function (chan) {
	    self.say(channel, chan.channel);
	});
    });
};

var bot = new niobe(config);

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
<<<<<<< HEAD
    this.client = new irc.Client(config.host, config.nick, { channels: config.channels, secure : true, selfSigned: true, debug: true, port : config.port, retryDelay: 5000 });
    
    this.client.on('message', function (from, channel, message) {
	self.commandCenter(from, channel, message);
=======
    this.client = new irc.Client(config.host, config.nick, { channels: ['#niobe'], secure : true, selfSigned: true, debug: true, port : config.port, retryDelay: 5000 });
    this.db = new botdb(config);
    
    this.bootstrap();

    this.client.on('message', function (from, target, message) {
	console.log(from, target, message);
	self.commandCenter(from, target, message, (target == self.client.opt.nick));
>>>>>>> c8ed2754744817c4357c6e84d84f60b5beb85953
    });
};

niobe.prototype.say = function (target, text) {
    this.client.say(target, text);
};

/**
 * Performs startup actions, like joining channels, etc..
 */
niobe.prototype.bootstrap = function () {
    var self = this;
    
    this.db.getChannels(function (err, results) {
	if (!err) {
	    (results || []).forEach(function (channel) {
		self.client.join(channel);
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

    switch (command) {
	case '!uptime':
	    this.exec('uptime', channel);
	    break;

	case '!uname':
	    this.exec('uname -a', channel);
	    break;

	case '!join':
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

	default:
	    break;
    }
};

niobe.prototype.exec = function (command, target) {
    var self = this;
    child = child_process.exec(command, function (error, stdout, stderr) {
	if (error !== null) {
	    self.say(target, 'Error executing "' + command  + '": ' + error);
	} else {
	    self.say(target, stdout);
	}
    });
}

niobe.prototype.cmdChannels = function (parts, channel) {
    var self = this;

    this.db.getChannels(function (err, results) {
	(results || []).forEach(function (chan) {
	    self.say(channel, chan.channel);
	});
    });
};

var bot = new niobe(config);

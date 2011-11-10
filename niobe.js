/**
 * Niobe IRC Bot
 * This is a very alpha version
 * @author zephrax <zephrax@gmail.com>
 */

var irc = require('irc'),
    config = require('./config.js'),
    child_process = require('child_process');

process.on('uncaughtException', function(err) {
    console.log('Uncaught Exception: ' + err);
});

var niobe = function (config) {
    var self = this;
    this.client = new irc.Client(config.host, config.nick, { channels: ['#niobe'], secure : true, selfSigned: true, debug: true, port : config.port, retryDelay: 5000 });
    
    this.client.on('message', function (from, channel, message) {
	self.commandCenter(from, channel, message);
    });
};

niobe.prototype.say = function (target, text) {
    this.client.say(target, text);
}

niobe.prototype.commandCenter = function (from, channel, message) {
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

var bot = new niobe(config);

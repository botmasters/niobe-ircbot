/**
 * Niobe IRC Bot
 *  Hash Module
 * @author zephrax <zephrax@gmail.com>
 */

var crypto = require('crypto');

var hash = {
    main : function (server, from, target, message) {
	if (undefined != message.trim) {
	console.log(server + ' # ' + from + ' # ' + target + ' # ' + message);
	    var parts = message.trim().split(/ +/);
	    var command = parts[0];

	    if (target != hashModule.bot.clients[server].opt.nick) { // public message
		switch (command) {
		    case '!hash':
			hash.cmdHash(server, target, parts[1], parts.slice(2).join(' '));
			break;
		    default:
		}
	    }
	}
    },
    
    /**
     * Handles users registration
     * @param string nick User being registered
     * @param array params Command parameters
     */
    cmdHash : function (server, target, hash, message) {
	if (hash != 'md5' && hash != 'sha1') {
	    hashModule.bot.say(server, target, 'Unknown hash...');
	} else {
	    var password = crypto.createHash(hash);
	    password.update(message);
	    hashModule.bot.say(server, target, password.digest('hex'));
	}
    }
    
};

var hashModule = {
    listeners : {
	message : hash.main
    },
    
    help : function (server, from) {
        this.bot.clients[server].notice(from, '!hash [md5|sha1] texto');
    }
};

module.exports = hashModule;

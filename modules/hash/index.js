/**
 * Niobe IRC Bot
 *  Hash Module
 * @author zephrax <zephrax@gmail.com>
 */

var crypto = require('crypto');

var hash = {
    main : function (from, target, message) {
	var parts = message.trim().split(/ +/);
	var command = parts[0];
	
	if (target != hashModule.bot.client.opt.nick) { // public message
	    switch (command) {
		case '!hash':
		    hash.cmdHash(target, parts[1], parts.slice(2).join(' '));
		    break;
		default:
	    }
	}
    },
    
    /**
     * Handles users registration
     * @param string nick User being registered
     * @param array params Command parameters
     */
    cmdHash : function (target, hash, message) {
	if (hash != 'md5' && hash != 'sha1') {
	    hashModule.bot.say(target, 'Unknown hash...');
	} else {
	    var password = crypto.createHash(hash);
	    password.update(message);
	    hashModule.bot.say(target, password.digest('hex'));
	}
    }
    
};

var hashModule = {
    listeners : {
	message : hash.main
    }
};

module.exports = hashModule;

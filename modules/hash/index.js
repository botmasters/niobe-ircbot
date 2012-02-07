/**
 * Niobe IRC Bot
 *  Hash Module
 * @author zephrax <zephrax@gmail.com>
 */

var crypto = require('crypto');

var hash = {
	/**
     * Handles users registration
     * @param string nick User being registered
     * @param array params Command parameters
     */
	cmdHash : function (server, from, target, message) {
		var parts = message.split(' '),
		hash = parts[0],
		text = parts.slice(1).join(' ');

		if (hash != 'md5' && hash != 'sha1') {
			hashModule.bot.say(server, target, 'Unknown hash...');
		} else {
			var password = crypto.createHash(hash);
			password.update(text);
			hashModule.bot.say(server, target, password.digest('hex'));
		}
	}

};

var hashModule = {
	info : {
		name : 'hash'
	},

	commands : {
		chan : {
			'!hash' : { level : 0, callback : hash.cmdHash }
		}
	},

	help : function (server, from) {
		this.bot.clients[server].notice(from, '!hash [md5|sha1] text');
	}
};

module.exports = hashModule;

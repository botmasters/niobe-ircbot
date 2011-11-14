/**
 * Niobe IRC Bot
 *  Account Module
 * @author zephrax <zephrax@gmail.com>
 */

var crypto = require('crypto');

var account = {
    main : function (from, target, message) {
	var self = account;
	
	var parts = message.trim().split(/ +/);
	var command = parts[0];
	
	if (target == accountModule.bot.client.opt.nick) { // private message
	    switch (command) {
		case 'register':
		    console.log(self);
		    self.cmdRegister(from, parts.slice(1));
		    break;
		case 'identify':
		    self.cmdIdentify(from, parts.slice(1));
		    break;
		case 'access':
		    self.cmdAccess(from, parts.slice(1));
		    break;
	    }
	}
    },
    
    /**
     * Handles users registration
     * @param string nick User being registered
     * @param array params Command parameters
     */
    cmdRegister : function (nick, params) {
	var self = this;
	
	if (params.length == 2) {
	    accountModule.bot.db.getUser(nick, function (result) {
		if (result) { // user already exists
		    accountModule.bot.notice(nick, 'Your nick is already registered.');
		} else { // everything went ok, proceed
		    var password = crypto.createHash('sha1');
		    password.update(params[1]);
		    accountModule.bot.db.newUser([nick, params[0], password.digest('hex')], function (result) {
			if (result === null)
			    accountModule.bot.notice(nick, 'You are now registered! There is no need to identify right now ;)');
			else
			    accountModule.bot.notice(nick, 'Failed to save the user to database, please try again later.');
			
			cb(result);
		    });
		}
	    });
	}
    },

    /**
     * Handles users identification
     * @param string nick User being identified
     * @param array params Command parameters
     */
    cmdIdentify : function (nick, params) {
    },
    
    /**
     * Handles users access list
     */
    cmdAccess : function () {
	
    }

};

var accountModule = {
    listeners : {
	message : account.main
    }
};

module.exports = accountModule;

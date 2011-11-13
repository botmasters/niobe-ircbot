/**
 * Niobe IRC Bot
 *  Account Module
 * @author zephrax <zephrax@gmail.com>
 */

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
    }

};

var accountModule = {
    listeners : {
	message : account.main
    }
};

module.exports = accountModule;

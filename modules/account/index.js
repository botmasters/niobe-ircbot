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
			    accountModule.bot.notice(nick, 'You are now registered!');
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
	if (accountModule.bot.identifiedUsers.indexOf(nick) != -1) {
	    accountModule.bot.notice(nick, 'You are already identified.');
	} else if (params.length >= 1) {
	    var password = crypto.createHash('sha1');
	    password.update(params[0]);
	    accountModule.bot.db.getUserForLogin(nick, password.digest('hex'), function (result) {
		if (result) {
		    accountModule.bot.notice(nick, 'You are now identified.');
		    if (accountModule.bot.identifiedUsers.indexOf(nick) == -1)
			accountModule.bot.identifiedUsers.push(nick);
		} else {
		    accountModule.bot.notice(nick, 'Invalid credentials.');
		}
	    });
	}
    },
    
    /**
     * Handles users access list
     */
    cmdAccess : function () {
	
    },
    
    checkInAnotherChannel : function (curr_chan, nick) {
	var active_user = false;
	(Object.keys(accountModule.bot.client.chans) || []).forEach(function (chan) {
	   if (chan != curr_chan) {
	       (Object.keys(accountModule.bot.client.chans[chan].users || [])).forEach(function (user){
		   if (user == nick)
		       active_user = true;
	       });
	   }
	});
	
	return active_user;
    },
    
    logoutUser : function (user) {
	delete accountModule.bot.identifiedUsers[accountModule.bot.identifiedUsers.indexOf(user)];
	console.log('Logout ' + user + ' ...');
    },
    
    // #niobe zephrax 'leaving'
    part : function (arg0, nick, arg1) {
	if (!account.checkInAnotherChannel(arg0, nick)) {
	    account.logoutUser(nick);
	}
    },
    
    // #niobe zephrax Chanserv (zephrax) test
    kick : function (arg0, arg1, nick, arg2) {
	if (!account.checkInAnotherChannel(arg0, arg1)) {
	    account.logoutUser(arg1);
	}
    }
};

var accountModule = {
    listeners : {
	message : account.main,
	part : account.part,
	kick : account.kick
    }
};

module.exports = accountModule;

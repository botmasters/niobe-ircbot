/**
 * Niobe IRC Bot
 *  Account Module for IRC services
 * @author zephrax <zephrax@gmail.com>
 */

var crypto = require('crypto');

var account = {
    callbacksQueue : {},
    userLevel : {},
    
    getUserLevel : function (server, from, cb) {
	var self = this;
	
	if (account.userLevel[server] == undefined)
	    account.userLevel[server] = {};
	
	if (account.userLevel[server][from] == undefined) {
	    
	    if (this.callbacksQueue[server] == undefined)
		this.callbacksQueue[server] = {};
	    
	    if (this.callbacksQueue[server][from] == undefined)
		this.callbacksQueue[server][from] = [];
	    
	    
	    var afterWhois = function(server, data) {
		if (data.account != undefined) {
		    accountModule.bot.dbs[server].getUser(data.nick, function (user) {
			self.userLevel[server][from] = user.level != undefined ? user.level : 0;
			cb(server, self.userLevel[server][from]);
		    });
		} else {
		    cb(server, -1);
		}
	    }
	    
	    this.callbacksQueue[server][from].push(afterWhois)
	    
	    accountModule.bot.clients[server].send('WHOIS ' + from);
	} else {
	    cb(server, this.userLevel[server][from]);
	}
    },
    
    checkInAnotherChannel : function (server, curr_chan, nick) {
	if (nick == accountModule.bot.clients[server].opt.nick) {
	    if (Object.keys(accountModule.bot.clients[server].chans).length == 1)
		account.logoutAllUsers();
	} else {
	    var active_user = false;
	     (Object.keys(accountModule.bot.clients[server].chans) || []).forEach(function (chan) {
	       if (chan != curr_chan) {
		   (Object.keys(accountModule.bot.clients[server].chans[chan].users || [])).forEach(function (user){
		       if (user == nick)
			   active_user = true;
		   });
	       }
	    });
	    
	    return active_user;
	}
    },
    
    whois : function (server, data) {
	if (account.callbacksQueue[server][data.nick] instanceof Array && account.callbacksQueue[server][data.nick].length > 0) {
	    (account.callbacksQueue[server][data.nick] || []).forEach(function (callback) {
		callback(server, data);
	    });
	    account.callbacksQueue[server][data.nick] = [];
	}
    },
    
    part : function (server, chan, nick) {
	if (!account.checkInAnotherChannel(server, chan, nick)) {
	    if (account.userLevel[server] != undefined && account.userLevel[server][nick] != undefined) {
		console.log('Logging out ' + nick + ' from ' + chan + '@' + server);
		console.log(account.userLevel);
		delete account.userLevel[server][nick];
	    }
	}
    },
    
    kick : function (server, chan, nick, reason) {
	if (!account.checkInAnotherChannel(server, chan, nick)) {
	    if (account.userLevel[server] != undefined && account.userLevel[server][nick] != undefined) {
		console.log('Logging out ' + nick + ' from ' + chan + '@' + server);
		console.log(account.userLevel);
		delete account.userLevel[server][nick];
	    }
	}
    }
    
};

var accountModule = {
    module : account,
    
    listeners : {
	part : account.part,
	kick : account.kick,
	whois : account.whois
    }
};

module.exports = accountModule;

/**
 * Niobe IRC Bot
 *  Account Module for IRC services
 * @author zephrax <zephrax@gmail.com>
 */

var crypto = require('crypto');

var account = {
    callbacksQueue : {},
    userLevel : {},
    
    main : function (server, from, target, message) {
	if (target != accountModule.bot.clients[server].opt.nick) {
	} else { // private message
            var parts = message.trim().split(/ +/),
                command = parts[0];

            switch (command) {
                case 'access':
                    account.cmdAccess(server, from, target, parts.length > 1 ? parts.slice(1) : []);
                    break;
                
                case '':
                    break;

                default:
            }
        }
    },
    
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
                    console.log(data.account);
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
		this.userLevel[server] = {};
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
    
    cmdAccess : function (server, nick, target, params) {
	if (params[0] == undefined) {
	    accountModule.bot.clients[server].notice(nick, '-- ACCESS LIST --');
	    accountModule.bot.dbs[server].getAccessList(function (err, result) {
		if (!err && result) {
		    var output = [],
			count = 0;

		    (result).forEach(function (user) {
			count++;
			if (count%5 == 0) {
			    output.push(user.user + ' (' + user.level + ')');
			    accountModule.bot.clients[server].notice(nick, output.join(', '));
			    count = 0;
			    output = [];
			} else {
			    output.push(user.user + ' (' + user.level + ')');
			}
		    });
		    
		    if (count != 0) {
			accountModule.bot.clients[server].say(target, output.join(', '));
			count = 0;
			output = '';
		    }
		}
	    });
	} else {
	    switch (params[0]) {
		case 'add':
		    if (params.length  >= 4) {
			this.getUserLevel(server, nick, function (server, level) {
			    if (level > 90) {
				accountModule.bot.dbs[server].getUser(params[1], function (user) {
				    if (user) {
					accountModule.bot.clients[server].notice(nick, 'User ' + params[1] + ' already exists');
				    } else {
					var userData = [params[1], params[2], parseInt(params[3])];
					accountModule.bot.dbs[server].newUser(userData, function () {
					    accountModule.bot.clients[server].notice(nick, 'User ' + params[1] + ' added with level ' + params[3]);
					});
				    }
				});
			    } else {
				accountModule.bot.permissionDenied(server, nick);
			    }
			});
		    } else {
			accountModule.bot.invalidArguments(server, nick);
		    }
		    break;
		    
		case 'set':
		    if (params.length  >= 4) {
			this.getUserLevel(server, nick, function (server, level) {
			    if (level > 90) {
				accountModule.bot.dbs[server].getUser(params[1], function (user) {
				    if (user) {
					switch (params[2]) {
					    case 'level':
						var level = parseInt(params[3]);
                                                if (level < 0 || level > 99) {
                                                    accountModule.bot.clients[server].notice(nick, 'Invalid level ;) (valid values 0-99)');
                                                } else {
                                                    accountModule.bot.dbs[server].setUserProp(params[1], 'level', level, function () {
                                                        if (level >= 90) {
                                                            accountModule.bot.clients[server].notice(nick, 'User ' + params[1] + ' ROOOCK!!! now is level ' + level);
                                                            accountModule.bot.clients[server].notice(params[1], 'You rocks brotha!');
                                                        } else {
                                                            accountModule.bot.clients[server].notice(nick, 'User ' + params[1] + ' now is level ' + level);
                                                        }
                                                    });
                                                }
						break;
						
					    default:
					}
				    } else {
					accountModule.bot.clients[server].notice(nick, 'User ' + params[1] + ' not found.');
				    }
				});
			    } else {
				accountModule.bot.permissionDenied(server, nick);
			    }
			});
		    } else {
			accountModule.bot.invalidArguments(server, nick);
		    }
		    break;
		
		case 'del':
		    if (params.length  >= 2) {
			this.getUserLevel(server, nick, function (server, level) {
			    if (level > 90) {
				accountModule.bot.dbs[server].getUser(params[1], function (user) {
				    if (user) {
					var userData = [params[1], params[2], parseInt(params[3])];
					accountModule.bot.dbs[server].delUser(params[1], function () {
					    accountModule.bot.clients[server].notice(nick, 'User ' + params[1] + ' removed');
					});
				    } else {
                                        accountModule.bot.clients[server].notice(nick, 'User ' + params[1] + ' not found');
				    }
				});
			    } else {
				accountModule.bot.permissionDenied(server, nick);
			    }
			});
		    } else {
			accountModule.bot.invalidArguments(server, nick);
		    }
		    break;
		    
		default:
	    }
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
		delete account.userLevel[server][nick];
	    }
	}
    },
    
    nick : function (server, oldnick, newnick, channels) {
        if (account.userLevel[server] != undefined && account.userLevel[server][oldnick] != undefined) {
            console.log('Logging out ' + oldnick + ' @' + server);
            delete account.userLevel[server][oldnick];
        }
    }
};

var accountModule = {
    module : account,
    
    listeners : {
	message : account.main,
	part : account.part,
	kick : account.kick,
	whois : account.whois,
        nick : account.nick
    }
};

module.exports = accountModule;

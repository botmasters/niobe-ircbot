/**
 * Niobe IRC Bot
 *  Ping Module
 * @author zephrax <zephrax@gmail.com>
 */

var ping = {
    main : function (server, from, target, message) {
	console.log(message);
	if (undefined != message.trim) {
	    var parts = message.trim().split(/ +/);
	    var command = parts[0],
		host = parts[1];

	    if (target != pingModule.bot.clients[server].opt.nick) { // public message
		switch (command) {
		    case '!ping':
			if (pingModule.bot.modules.accountservices.module.getUserLevel(server, from, function (server, level) {
			    console.log(level);
			}));
			ping.cmdPing(server, target, parts[1]);
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
    cmdPing : function (server, target, host) {
	pingModule.bot.exec(server, 'ping', target, ['-c4', host])
    }
    
};

var pingModule = {
    listeners : {
	message : ping.main
    }
};

module.exports = pingModule;

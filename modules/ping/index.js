/**
 * Niobe IRC Bot
 *  Ping Module
 * @author zephrax <zephrax@gmail.com>
 */

var ping = {
    main : function (from, target, message) {
	var parts = message.trim().split(/ +/);
	var command = parts[0],
	    host = parts[1];
	
	if (target != pingModule.bot.client.opt.nick) { // public message
	    switch (command) {
		case '!ping':
		    ping.cmdPing(target, parts[1]);
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
    cmdPing : function (target, host) {
	pingModule.bot.exec('ping', target, ['-c4', host])
    }
    
};

var pingModule = {
    listeners : {
	message : ping.main
    }
};

module.exports = pingModule;

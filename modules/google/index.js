/**
 * Niobe IRC Bot
 *  Google Module
 * @author zephrax <zephrax@gmail.com>
 */
var request = require('request'),
    querystring = require('querystring');

var Google = {
    main : function (server, from, target, message) {
	if (undefined != message.trim()) {
	    var parts = message.trim().split(/ +/);
	    var command = parts[0];
            
	    if (target != googleModule.bot.clients[server].opt.nick) { // public message
		switch (command) {
		    case '!google':
			if (googleModule.bot.modules.accountservices.module.getUserLevel(server, from, function (server, level) {
			    if (level > 0) {
                                Google.cmdGoogle(server, from, target, parts.slice(1).join(' '));
			    } else {
				googleModule.bot.clients[server].notice(from, 'Ha-ha-ha!?');
			    }
			}));
			break;
                        
		    default:
		}
	    }
	}
    },
    
    /**
     * Handles Google Search command
     */
    cmdGoogle : function (server, from, target, message) {
        request('https://ajax.googleapis.com/ajax/services/search/web?' + querystring.stringify({v: '1.0', q: message}), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var result = JSON.parse(body);
                for (var t=0;t<3;t++) {
                    var item = result.responseData.results[t];
                    googleModule.bot.clients[server].say(target, item.titleNoFormatting + '(' + item.unescapedUrl + ')');
                }
            } else {
                googleModule.bot.clients[server].say(target, 'Error sending request. Status Code #' + response.statusCode);
            }
        });
    }
};

var googleModule = {
    listeners : {
	message : Google.main
    },
    
    help : function (server, from) {
        this.bot.clients[server].notice(from, '!google [keywords]');
    }
};

module.exports = googleModule;

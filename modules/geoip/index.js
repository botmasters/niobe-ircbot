/**
 * Niobe IRC Bot
 *  GeoIP Module
 * @author zephrax <zephrax@gmail.com>
 */

var request = require('request'),
    querystring = require('querystring');

var geoip = {
    main : function (server, from, target, message) {
	if (undefined != message.trim) {
	    var parts = message.trim().split(/ +/);
	    var command = parts[0];

	    if (target != geoipModule.bot.clients[server].opt.nick) { // public message
		switch (command) {
		    case '!geoip':
			geoip.cmdGeoip(server, from, target, parts[1]);
			break;
		    default:
		}
	    }
	}
    },
    
    /**
     * Handles geoip process
     */
    cmdGeoip : function (server, from, target, ip) {
	if (!ip) {
	    geoipModule.bot.say(server, target, 'You must specify an IP Address');
	} else {
            request('http://api.hostip.info/get_html.php?' + querystring.stringify({'ip': ip}), function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var info = body.split("\n");
                    if (info.length > 0) {
                        for (var t=0;t<info.length;t++) {
                            geoipModule.bot.clients[server].say(target, info[t]);
                        }
                    } else {
                        geoipModule.bot.clients[server].say(target, 'Empty result');
                    }
                } else {
                    geoipModule.bot.clients[server].say(target, 'Error sending request. Status Code #' + response.statusCode);
                }
            });
        }
    }
    
};

var geoipModule = {
    listeners : {
	message : geoip.main
    },
    
    help : function (server, from) {
        this.bot.clients[server].notice(from, '!geoip address');
    }
};

module.exports = geoipModule;

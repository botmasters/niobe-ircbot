/**
 * Niobe IRC Bot
 *  GeoIP Module
 * @author zephrax <zephrax@gmail.com>
 */

var request = require('request'),
    querystring = require('querystring');

var geoip = {
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
                    geoipModule.bot.clients[server].say(target, 'Error sending request.' + ( response && response.statusCode ?  ' Status Code #' + response.statusCode : '' ));
                }
            });
        }
    }

};

var geoipModule = {
    commands : {
		chan : {
			'!geoip' : { level : 10, callback : geoip.cmdGeoip }
		}
	},

    help : function (server, from) {
        this.bot.clients[server].notice(from, '!geoip address');
    }
};

module.exports = geoipModule;

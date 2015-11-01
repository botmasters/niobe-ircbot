/**
* Niobe IRC Bot
*  URL Info Module
* @author zephrax <zephrax@gmail.com>
*/

var request = require('request');

var urlInfo = {
	/**
	* Handles urlinfo main routine
	*/
	main : function (server, from, target, message) {
		var self = urlInfo;

		var parts = message.trim().split(/ +/);
		var command = parts[0];
		var urlMatch = message.match(/(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/);

		if (target.match(/^#(.*)$/) && urlMatch) { // Channel message
			request(urlMatch[0], function (error, response, body) {
				if (!error && response.statusCode == 200) {
					var title = body.match(/(<\s*title[^>]*>(.+?)<\s*\/\s*title)>/gi);
					if (title) {
						urlInfoModule.bot.clients[server].say(target, 'Title: ' + title[0].replace(/<\/?[^>]+(>|$)/g, ''));
					}
				}
			});
		}
	},

};

var urlInfoModule = {
	info : {
		name : 'urlinfo'
	},

	listeners : {
		message : urlInfo.main,
	},

	help : function (server, from) {
		this.bot.clients[server].notice(from, '!urlinfo text');
	}
};

module.exports = urlInfoModule;

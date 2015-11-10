/**
* Niobe IRC Bot
*  URL Info Module
* @author zephrax <zephrax@gmail.com>
*/

var request = require('request'),
	config = require('../../config'),
	TelegramBot = require('node-telegram-bot-api');

var telegramBridge = {

	_bridges : {},
	_rev_bridges : {},

	/**
	* Handles telegramBridge main routine
	*/
	cmdMain : function (server, from, target, message) {
		var self = telegramBridge,
			parts = message.split(/ +/),
			command = parts[0],
			ircChannel,
			telegramGroup;

		if (target.match(/^#(.*)$/)) { // Channel message
			switch (parts[0]) {
				case 'bridge':
					switch (parts[1]) {
						case 'add':
							ircChannel = parts[2];
							telegramGroup = parts[3];

							if (!ircChannel.match(/^#(.*)$/)) {
								return telegramBridgeModule.bot.clients[server].say(target, 'Invalid IRC channel');
							}

							return telegramBridge.bridgeAdd(server, from, target, parts[2], parts[3]);

						case 'del':
							return telegramBridge.bridgeDel(server, from, target, parts[2]);

						case 'list':
							return telegramBridge.bridgeList(server, from, target, message);

						default:
							return telegramBridgeModule.bot.clients[server].say(target, 'Invalid parameters');
					}

					break;

				case '':
					break;

				default:
			}
		}
	},

	reload : function (server, next) {
		// mapping Channel TO ID
		telegramBridge._bridges = {};
		telegramBridge._bridges[server] = {};
		// reverse mapping, from ID to Channel
		telegramBridge._rev_bridges = {};
		telegramBridge._rev_bridges[server] = {};

		var stmt = telegramBridgeModule.bot.dbs[server].db.all('SELECT * FROM telegram_channels', function (err, result) {
			if (!err && result && result.length) {
				result.forEach(function (row) {
					telegramBridge._bridges[server][row.irc_chan] = row.t_group_id;
					telegramBridge._rev_bridges[server][row.t_group_id] = row.irc_chan;
				});

				if (next !== undefined) {
					next();
				}
			} else{
				if (next !== undefined) {
					next();
				}
			}
		});
	},

	setupEvents : function (server) {
		telegramBridge._bot.on('text', (function (server) { return function (msg) {
			if (msg && msg.chat && msg.chat.id && telegramBridge._rev_bridges[server][msg.chat.id]) {
				var uName = msg.from.username ? msg.from.username : msg.from.first_name + ' ' + msg.from.last_name;
				telegramBridgeModule.bot.clients[server].say(telegramBridge._rev_bridges[server][msg.chat.id], '[Telegram/' + uName + '] ' + msg.text);
			}
		}; })(server));
	},

	bridgeHandler : function (server, from, target, message) {
		if (telegramBridge._bridges[server] !== undefined && telegramBridge._bridges[server][target] !== undefined) {
			telegramBridge._bot.sendMessage(telegramBridge._bridges[server][target], '[IRC/' + from + '] ' + message);
		} else {
			// no bridges, do nothing.
		}
	},

	bridgeList : function (server, from, target, message) {
		var stmt = telegramBridgeModule.bot.dbs[server].db.all('SELECT * FROM telegram_channels', function (err, results) {
			if (err) {
				return telegramBridgeModule.bot.clients[server].say(target, 'Database error.');
			}

			if (!(results && results.length)) {
				telegramBridgeModule.bot.clients[server].say(target, 'No bridges found.');
			} else {
				telegramBridgeModule.bot.clients[server].say(target, 'Listing telegram bridges...');
				results.forEach(function (row) {
					telegramBridgeModule.bot.clients[server].say(target, 'Channel ' + row.irc_chan + ' -> Telegram Group ID ' + row.t_group_id);
				});
			}
		});

		telegramBridgeModule.bot.clients[server].say(target, '');
	},

	bridgeAdd : function (server, from, target, irc_channel, t_group_id) {
		var stmt = telegramBridgeModule.bot.dbs[server].db.get('SELECT * FROM telegram_channels WHERE irc_chan = ?', [irc_channel], function (err, dbBridge) {
			if (err) {
				return telegramBridgeModule.bot.clients[server].say(target, 'Database error.');
			}

			if (dbBridge) {
				return telegramBridgeModule.bot.clients[server].say(target, 'There is already a bridge for channel ' + irc_channel);
			}

			var stmt = telegramBridgeModule.bot.dbs[server].db.prepare('INSERT INTO telegram_channels (irc_chan, t_group_id) VALUES (?, ?)');
			stmt.run(irc_channel, t_group_id, function (err) {
				if (!err) {
					telegramBridgeModule.bot.clients[server].say(target, 'Channel ' + irc_channel + ' bridged succesfuly to telegram group ' + t_group_id);
					telegramBridge.reload(server);
				} else {
					return telegramBridgeModule.bot.clients[server].say(target, 'Database error.');
				}
			});

		});

		telegramBridgeModule.bot.clients[server].say(target, '');
	},

	bridgeDel : function (server, from, target, irc_channel) {
		var stmt = telegramBridgeModule.bot.dbs[server].db.get('SELECT * FROM telegram_channels WHERE irc_chan = ?', [irc_channel], function (err, dbBridge) {
			if (err) {
				return telegramBridgeModule.bot.clients[server].say(target, 'Database error.');
			}

			if (!dbBridge) {
				return telegramBridgeModule.bot.clients[server].say(target, 'Bridge not found for channel ' + irc_channel);
			}

			var stmt = telegramBridgeModule.bot.dbs[server].db.prepare('DELETE FROM telegram_channels WHERE irc_chan = ?');
			stmt.run(irc_channel, function (err) {
				if (!err) {
					telegramBridgeModule.bot.clients[server].say(target, 'Bridge for ' + irc_channel + ' deleted succesfuly.');
					telegramBridge.reload(server);
				} else {
					return telegramBridgeModule.bot.clients[server].say(target, 'Database error.');
				}
			});

		});

		telegramBridgeModule.bot.clients[server].say(target, '');
	}

};

var telegramBridgeModule = {
	info : {
		name : 'telegram_bridge'
	},

	commands : {
		chan : {
			'!telegram' : { level : 50 , callback : telegramBridge.cmdMain }
		}
	},

	listeners : {
		message : telegramBridge.bridgeHandler,
	},

	help : function (server, from) {
	},

	initModule : function (server, next) {
		telegramBridge._bot = new TelegramBot(config.telegram.token, {polling: true});
		telegramBridge.setupEvents(server);
		telegramBridge.reload(server);
	}
};

module.exports = telegramBridgeModule;

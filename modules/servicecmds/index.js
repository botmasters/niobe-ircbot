/**
 * Niobe IRC Bot
 *  Service Commands Module
 *  This module binds some services commands (ban, uban, etc)
 * @author zephrax <zephrax@gmail.com>
 */

var servicecmds = {

    cmdBan : function (server, from, channel, message) {
		var parts = message.split(' '),
			nick = parts[0] ? parts[0] : from;
		servicecmdsModule.bot.clients[server].say('ChanServ', 'BAN ' + channel + ' ' + nick);
    },

    cmdUnban : function (server, from, channel, message) {
		var parts = message.split(' '),
			nick = parts[0] ? parts[0] : from;
		servicecmdsModule.bot.clients[server].say('ChanServ', 'UNBAN ' + channel + ' ' + nick);
    },

    cmdOp : function (server, from, channel, message) {
		var parts = message.split(' '),
			nick = parts[0] ? parts[0] : from;
		servicecmdsModule.bot.clients[server].say('ChanServ', 'OP ' + channel + ' ' + nick);
	},

    cmdDeop : function (server, from, channel, message) {
		var parts = message.split(' '),
			nick = parts[0] ? parts[0] : from;
		servicecmdsModule.bot.clients[server].say('ChanServ', 'DEOP ' + channel + ' ' + nick);
	},

    cmdVoice : function (server, from, channel, message) {
		var parts = message.split(' '),
			nick = parts[0] ? parts[0] : from;
		servicecmdsModule.bot.clients[server].say('ChanServ', 'VOICE ' + channel + ' ' + nick);
	},

    cmdDevoice : function (server, from, channel, message) {
		var parts = message.split(' '),
			nick = parts[0] ? parts[0] : from;
		servicecmdsModule.bot.clients[server].say('ChanServ', 'DEVOICE ' + channel + ' ' + nick);
	},

	cmdPanic : function (server, from, channel, message) {
		// TODO
	},

	cmdDontpanic : function (server, from, channel, message) {
		// TODO
	}
};

var servicecmdsModule = {
    module : servicecmds,
    
	commands : {
		chan : {
			'!ban' : { level : 70 , callback : servicecmds.cmdBan },
			'!unban' : { level : 70 , callback : servicecmds.cmdUnban },
			'!sop' : { level : 70 , callback : servicecmds.cmdOp },
			'!sdeop' : { level : 70 , callback : servicecmds.cmdDeop },
			'!svoice' : { level : 70 , callback : servicecmds.cmdVoice },
			'!sdevoice' : { level : 70 , callback : servicecmds.cmdDevoice }
		},

		priv : {
			'panic' : { level : 99 , callback : servicecmds.cmdPanic },
			'dontpanic' : { level : 99 , callback : servicecmds.cmdDontPanic },
		}
	},

    help : function (server, from) {
        this.bot.clients[server].notice(from, 'Service commands: !ban !unban !sop !sdeop !svoice !sdevoice');
    }
};

module.exports = servicecmdsModule;

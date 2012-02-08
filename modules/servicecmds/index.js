/**
 * Niobe IRC Bot
 *  Service Commands Module
 *  This module binds some services commands (ban, uban, etc)
 * @author zephrax <zephrax@gmail.com>
 */

var servicecmds = {

    cmdBan : function (server, from, channel, message) {
		var parts = message.split(' ');
		servicecmdsModule.bot.clients[server].say('NickServ', 'BAN ' + channel + ' ' + parts[0]);
    },
    
    cmdUnban : function (server, from, channel, message) {
		var parts = message.split(' ');
		servicecmdsModule.bot.clients[server].say('NickServ', 'UNBAN ' + channel + ' ' + parts[0]);
    },

    cmdOp : function (server, from, channel, message) {
		var parts = message.split(' ');
		servicecmdsModule.bot.clients[server].say('NickServ', 'OP ' + channel + ' ' + parts[0]);
	},
	
    cmdDeop : function (server, from, channel, message) {
		var parts = message.split(' ');
		servicecmdsModule.bot.clients[server].say('NickServ', 'DEOP ' + channel + ' ' + parts[0]);
	},
	
    cmdVoice : function (server, from, channel, message) {
		var parts = message.split(' ');
		servicecmdsModule.bot.clients[server].say('NickServ', 'VOICE ' + channel + ' ' + parts[0]);
	},
	
    cmdDevoice : function (server, from, channel, message) {
		var parts = message.split(' ');
		servicecmdsModule.bot.clients[server].say('NickServ', 'DEVOICE ' + channel + ' ' + parts[0]);
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
        //this.bot.clients[server].notice(from, '!ping host');
    }
};

module.exports = servicecmdsModule;

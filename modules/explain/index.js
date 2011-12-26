/**
 * Niobe IRC Bot
 *  Explain Module
 * @author zephrax <zephrax@gmail.com>
 */

var Explain = {
    main : function (server, from, target, message) {
	if (undefined != message.trim()) {
	    var parts = message.trim().split(/ +/);
	    var command = parts[0];

	    if (target != explainModule.bot.clients[server].opt.nick) { // public message
		switch (command) {
		    case '!explica':
			Explain.cmdExplica(server, from, target, parts.slice(1).join(' '));
			break;
		    case '!aprende':
			if (explainModule.bot.modules.accountservices.module.getUserLevel(server, from, function (server, level) {
			    if (level > 0) {
                                Explain.cmdAprende(server, from, target, parts.slice(1).join(' '));
			    } else {
				explainModule.bot.clients[server].notice(from, 'Ha-ha-ha!?');
			    }
			}));
			break;
		    case '!olvida':
			if (explainModule.bot.modules.accountservices.module.getUserLevel(server, from, function (server, level) {
			    if (level > 0) {
                                Explain.cmdOlvida(server, from, target, parts.slice(1).join(' '));
			    } else {
				explainModule.bot.clients[server].notice(from, 'Ha-ha-ha!?');
			    }
			}));
			break;
		    case '!saber':
                        Explain.cmdSaber(server, from, target, parts.slice(1).join(' '));
			break;
		    default:
		}
	    }
	}
    },
    
    /**
     * Handles aprende command
     */
    cmdAprende : function (server, from, target, message) {
        var parts = message.split(/es/i),
            name = parts[0].trim(),
            description = parts.splice(1).join('es').trim();
        
        var stmt = explainModule.bot.dbs[server].db.get('SELECT 1 FROM definitions WHERE name = ?', [name], function (err, result) {
            if (!err) {
                if (undefined == result) {
                    var stmt = explainModule.bot.dbs[server].db.get('INSERT INTO definitions (user, name, description) VALUES (?, ?, ?)', [target, name, description], function (err, result) {
                        if (err)
                            explainModule.bot.clients[server].notice(from, 'Ya existe una definición para ' + name);
                        else
                            explainModule.bot.clients[server].say(target, 'Entendido!');
                    });
                } else {
                    explainModule.bot.clients[server].notice(from, 'Error guardando definición.');
                }
            }
        });
    },
    
    /**
     * Handles explica command
     */
    cmdExplica : function (server, from, target, message) {
        var name = message.trim();
        
        var stmt = explainModule.bot.dbs[server].db.get('SELECT * FROM definitions WHERE name = ?', [message], function (err, result) {
            if (!err) {
                if (undefined == result) {
                    explainModule.bot.clients[server].say(target, 'No conozco ' + message);
                } else {
                    explainModule.bot.clients[server].say(target, message + ' es ' + result.description);
                }
            }
        });
    },

    /**
     * Handles olvida command
     */
    cmdOlvida : function (server, from, target, message) {
        var name = message.trim();

        var stmt = explainModule.bot.dbs[server].db.get('SELECT * FROM definitions WHERE name = ?', [message], function (err, result) {
            if (!err) {
                if (undefined == result) {
                    explainModule.bot.clients[server].notice(from, 'No conozco ' + message);
                } else {
                    var stmt = explainModule.bot.dbs[server].db.get('DELETE FROM definitions WHERE name = ?', [message], function (err, result) {
                        if (!err) {
                            if (undefined == result) {
                                explainModule.bot.clients[server].say(target, 'He olvidado ' + name);
                            }
                        } else {
                            explainModule.bot.clients[server].say(target, 'Error olvidando ' + name);
                        }
                    });
                }
            }
        });
    },
    
    /**
     * Handles saber command
     */
    cmdSaber : function (server, from, target, message) {
        var stmt = explainModule.bot.dbs[server].db.all('SELECT * FROM definitions', function (err, result) {
            if (!err) {
                var res = result.map(function (item) { return item.name; });
                explainModule.bot.clients[server].say(target, 'Conozco: ' + res.join(', '));
            }
        });
    }
};

var explainModule = {
    listeners : {
	message : Explain.main
    },
    
    help : function (server, from) {
        this.bot.clients[server].notice(from, '!aprende [algo] es [descripción]');
        this.bot.clients[server].notice(from, '!explica [algo]');
        this.bot.clients[server].notice(from, '!olvida [algo]');
        this.bot.clients[server].notice(from, '!saber');
    }
};

module.exports = explainModule;

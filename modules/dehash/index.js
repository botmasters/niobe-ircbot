/**
 * DeHash module 
 *  Search hashes on diferents sites for decrypt
 * @author exos <tioscar@gmail.com>
 */

var dehash = require('./lib/dehash');
var sources = require('./sources');



var DeHash = {

    cmdDehash : function (server, from, target, message) {

	var hashes = message.split(',');

	for (i in sources) {

		hashes.forEach (function (hash) {

	        	(function (i) {
				var type = null;
        	        	dehash(hash, type, sources[i], function (err, data) {
                	        	if (err) {
						explainModule.bot.clients[server].notice(from, i + " [error] :" +  err);
	        	                } else {
						explainModule.bot.clients[server].say(i + ":" + data);
		                        }
        		        });
		        })(i);

		});

	}

    }

};

var explainModule = {
	commands : {
		chan : {
			'!dehash' : { level : 0 , callback : DeHash.cmdDehash }
		}
	},
	
    help : function (server, from) {
        this.bot.clients[server].notice(from, '!dehash hash');
    }
};

module.exports = explainModule;

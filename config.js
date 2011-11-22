var config = {
	servers : {
	    'KernelPanic' :
		{
		    debug : true,
		    host : 'irc.kernelpanic.com.ar',
		    secure : true,
		    selfSigned : true,
		    port : 6697,
		    nick : 'niobe',
		    channels: ['#niobe'],
		    db : 'niobe.db'
		}
	},
	debug : true,
	modules : [ 'hash', 'ping', 'accountservices' ],
	modulesPath : './modules/'
};

module.exports = config;

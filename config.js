var config = {
	servers : {
	    'KernelPanic' :
		{
		    host : 'irc.kernelpanic.com.ar',
		    secure : true,
		    selfSigned : true,
		    port : 6697,
		    nick : 'niobe-dev',
		    channels: ['#niobe'],
		    db : 'niobe.db',
			oper : {
				user : 'root',
				pass : ''
			}
		}
	},
	debug : true,
	modules : [ 'hash', 'ping', 'accountservices', 'explain', 'google', 'exploit-db', 'geoip' ],
	modulesPath : './modules/'
};

module.exports = config;

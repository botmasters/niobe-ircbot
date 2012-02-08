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
				user : '',
				pass : ''
			},
                        
			nickserv : {
				user : '',
				pass: ''
			}
		}
	},
	debug : true,
	modules : [ 'hash', 'ping', 'accountservices', 'explain', 'google', 'exploit-db', 'geoip', 'servicecmds' ],
	modulesPath : './modules/'
};

module.exports = config;

var config = {
	servers : {
	    'KernelPanic' :
		{
		    debug : true,
		    host : '127.0.0.1',
		    secure : true,
		    selfSigned : true,
		    port : 6697,
		    nick : 'niobe',
		    channels: ['#niobe', '#kernelpanic'],
		    db : 'niobe.db'
		}
	},
	debug : true,
	modules : [ 'hash', 'ping', 'accountservices' ],
	modulesPath : './modules/'
};

module.exports = config;

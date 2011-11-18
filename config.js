var config = {
	debug : true,
	host : 'irc.kernelpanic.com.ar',
	ssl : true,
	port : 6697,
	nick : 'aza_not',
        servers: [ 
		{ 
		host:'irc.kernelpanic.com.ar', 
		channels:['#niobe','#kernelpanic'], 
		port:6697 
		}, 
		{
		host:'irc.freenode.net',
		channels:['#ppar','#esfriki'],
		port:7000
		},
	],
	db : 'niobe.db',
	modules : [ 'hash', 'ping', 'account' ],
	modulesPath : './modules/'
};

module.exports = config;

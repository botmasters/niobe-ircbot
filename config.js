var config = {
	debug : true,
	host : 'irc.kernelpanic.com.ar',
	ssl : true,
	port : 6697,
	nick : 'niobe',
        channels: ['#niobe'],
	db : 'niobe.db',
	modules : [ 'account' ],
	modulesPath : './modules/'
};

module.exports = config;

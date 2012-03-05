
var dehash = require('./lib/dehash');
var sources = require('./sources');


hash = '202cb962ac59075b964b07152d234b70';
type = 'md5';


for (i in sources) {

	(function (i) {
		dehash(hash, type, sources[i], function (err, data) {
			if (err) {
				console.log(i + " [error] :" +  err);
			} else {
				console.log(i + ":" + data);
			}
		});
	})(i);

}

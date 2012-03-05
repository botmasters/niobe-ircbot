
var crequest = require('./crawrequest').request;

module.exports = function (hash, type, source, dhcb) {

	if (!type) {

		if (/^[a-f0-9]{32}$/i.test(hash)) {
			type = 'md5';
		} else if (/^[a-f0-9]{40}$/i.test(hash))  { 
			type = 'sha1';
		} else if (/^[a-f0-9]{64}$/i.test(hash)) {
			type = 'sha256';
		} else if (/^[a-f0-9]{128}$/i.test(hash)) {
			type = 'sha512';
		} else if (/^[-]?[0-9]+$/.test(hash)) {
			type = 'crc32';
		}
	}

	var params = {};
	
	if (source.params) {
		for (i in source.params) {
			params[i] = source.params[i].replace('{hash}',hash).replace('{type}', type);
		}
	}

	var craw = new crequest({
		url: source.url,
		method: source.method,
		params: params
	})

	craw.getParsedContent ( new RegExp (source.regexp), function (err, matches) {
		if (!err && matches &&  matches[1]) {
			dhcb(null, matches[1]);
		} else {
			dhcb (err, null);
		}
	});

};

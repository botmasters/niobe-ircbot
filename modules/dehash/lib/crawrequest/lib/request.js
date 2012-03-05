var request = require('request');
var querystring = require('querystring');


var CRequest = function () {
    this.initialize.apply(this,arguments);
}

CRequest.prototype = (function () {
    
    var req = function (url, method, params, to, cb) {
        
        var options = {
            url: url,
            method: method || 'get',
            timeout: to,
            referer: 'http://md5decryption.com/'
        };
        
        if (method == 'post') {
            //options.body = params;
            options.headers = {
                'content-type' : 'application/x-www-form-urlencoded'
            };
            options.body = querystring.stringify(params);
        } else if (method == 'get') {
            options.url += "?" + querystring.stringify(params);
        }
        
        request.post(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                cb(null, body);
            } else {
                cb(error || response.statusCode, null);
            }
        });
        
    };
    
    var content = null;
    
    return {
        
        url: null,
        timeout: 30000,
        method: 'get',
        rex: null,
        
        initialize: function () {
        
            this.params = {};
        
            if (typeof arguments[0] == 'string') {
                this.url = arguments[0];
            } else if (typeof arguments[0] == 'object') {
                if (arguments[0].url) this.url = arguments[0].url;
                if (arguments[0].timeout) this.url = arguments[0].timeout;
                if (arguments[0].method) this.method = arguments[0].method;
                if (arguments[0].params) this.params = arguments[0].params;
                if (arguments[0].regexp) this.rex = arguments[0].regexp;
            }
            
        },
        
        getParsedContent: function (regexp, cb) {
            
            var reg = regexp || this.rex;
            
            var parse = function (err,data) {
              
                if (err) {
                    cb(err,null);
                } else {
                    cb(err, reg.exec(data));
                }
                
            }
            
            if (content) {
                parse(null,content);
            } else {
                content = req(this.url, this.method, this.params, this.timeout, parse );
            }
           
        }
        
    };
    
})();

module.exports = CRequest;
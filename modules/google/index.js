/**
 * Niobe IRC Bot
 *  Google Module
 * @author zephrax <zephrax@gmail.com>
 */
var request = require('request'),
  querystring = require('querystring');

var Google = {
  /**
   * Handles Google Search command
   */
  cmdGoogle: function(server, from, target, message) {
    request('https://ajax.googleapis.com/ajax/services/search/web?' + querystring.stringify({
      v: '1.0',
      q: message
    }), function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var result = JSON.parse(body),
          count = result.responseData.results.length >= 3 ? 3 : result.responseData.results.length;
        if (count > 0) {
          for (var t = 0; t < count; t++) {
            var item = result.responseData.results[t];
            googleModule.bot.clients[server].say(target, item.titleNoFormatting + '(' + item.unescapedUrl + ')');
          }
        } else {
          googleModule.bot.clients[server].say(target, 'No results found');
        }
      } else {
        googleModule.bot.clients[server].say(target, 'Error sending request. Status Code #' + response.statusCode);
      }
    });
  }
};

var googleModule = {
  commands: {
    chan: {
      '!google': {
        level: 10,
        callback: Google.cmdGoogle
      }
    }
  },

  help: function(server, from) {
    this.bot.clients[server].notice(from, '!google [keywords]');
  }
};

module.exports = googleModule;
/**
 * Niobe IRC Bot
 *  URL Info Module
 * @author zephrax <zephrax@gmail.com>
 */

var request = require('request'),
  google = require('googleapis'),
  youtube = google.youtube('v3'),
  config = require('../../config');

var urlInfo = {

  _serviceDetectors: {
    youtube: new RegExp(/.*(youtube\.com\/watch\?.*v=|youtu\.be\/)([A-Za-z0-9._%-]*)[&\w;=\+_\-]*.*/)
  },

  /**
   * Handles urlinfo main routine
   */
  main: function(server, from, target, message) {
    var self = urlInfo;

    var parts = message.trim().split(/ +/);
    var command = parts[0];
    var urlMatch = message.match(/(http|ftp|https):\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/);

    if (target.match(/^#(.*)$/) && urlMatch) { // Channel message
      var service = urlInfo.detectService(urlMatch[0]);

      switch (service.name) {
        case 'youtube':
          urlInfo.youtubeInfo(server, target, service.parts[2]);
          break;

        default:
          urlInfo.basicInfo(server, target, urlMatch[0]);
      }
    }
  },

  basicInfo: function(server, target, url) {
    request(url, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var title = body.match(/(<\s*title[^>]*>(.+?)<\s*\/\s*title)>/gi);
        if (title) {
          urlInfoModule.bot.clients[server].say(target, title[0].replace(/<\/?[^>]+(>|$)/g, ''));
        }
      }
    });
  },

  youtubeInfo: function(server, target, videoId) {
    youtube.videos.list({
      key: config.google.apiKey,
      part: 'id,contentDetails,statistics,snippet',
      id: videoId
    }, function(err, data) {
      if (err) {
        return console.log(err);
      }

      var video = data.items[0];
      urlInfoModule.bot.clients[server].say(target, video.snippet.title + ' (' + video.statistics.viewCount + ' views, ' +
        video.statistics.likeCount + ' likes, ' +
        video.statistics.dislikeCount + ' dislikes, ' +
        video.statistics.favoriteCount + ' favs, ' +
        video.statistics.commentCount + ' comments)');
    });
  },

  detectService: function(url) {
    var detectedService = false;

    Object.keys(urlInfo._serviceDetectors).forEach(function(serviceDetector) {
      var serviceMatch = url.match(urlInfo._serviceDetectors[serviceDetector]);

      if (!detectedService && serviceMatch) {
        detectedService = {
          name: serviceDetector,
          parts: serviceMatch
        };
      }
    });

    return detectedService;
  }
};

var urlInfoModule = {
  info: {
    name: 'urlinfo'
  },

  listeners: {
    message: urlInfo.main,
  },

  help: function(server, from) {}
};

module.exports = urlInfoModule;
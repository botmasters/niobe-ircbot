/**
 * Niobe IRC Bot
 *  Telegram Module
 * @author zephrax <zephrax@gmail.com>
 */

var request = require('request'),
  config = require('../../config'),
  TelegramBot = require('node-telegram-bot-api'),
  Cloud = require('./lib/cloud'),
  cloud = new Cloud();

var telegram = {

  _bridges: {},
  _rev_bridges: {},

  /**
   * Handles irc commands
   */
  cmdMain: function(server, from, target, message) {
    var self = telegram,
      parts = message.split(/ +/),
      command = parts[0],
      ircChannel,
      telegramGroup;

    if (target.match(/^#(.*)$/)) { // Channel message
      switch (parts[0]) {
        case 'bridge':
          switch (parts[1]) {
            case 'add':
              ircChannel = parts[2];
              telegramGroup = parts[3];

              if (!ircChannel.match(/^#(.*)$/)) {
                return telegramModule.bot.clients[server].say(target, 'Invalid IRC channel');
              }

              return telegram.bridgeAdd(server, from, target, parts[2], parts[3]);

            case 'del':
              return telegram.bridgeDel(server, from, target, parts[2]);

            case 'list':
              return telegram.bridgeList(server, from, target, message);

            case 'mode':
              return telegram.bridgeMode(server, from, target, parts[2]);

            default:
              return telegramModule.bot.clients[server].say(target, 'Invalid parameters');
          }

          break;

        case 'say':
          parts.shift();
          telegram._bot.sendMessage(telegram._bridges[server][target], '[IRC/' + from + '] ' + parts.join(' '));
          break;

        default:
      }
    }
  },

  /**
   * Handles telegram commands
   */
  cmdTelegram: function(server, msg) {
    var self = telegram,
      parts = msg.text.indexOf(' ') > -1 ? msg.text.split(/ +/) : [msg.text],
      command = parts[0],
      uName = msg.from.username ? msg.from.username : msg.from.first_name + ' ' + msg.from.last_name;

    switch (command) {
      case '/users':
        var ircUsers = (Object.keys(telegramModule.bot.clients[server].chans[telegram._rev_bridges[server][msg.chat.id]].users || []))
          .map(function(user) {
            return ' ' + user;
          });

        if (ircUsers.length) {
          telegram._bot.sendMessage(msg.chat.id, 'Users on ' + telegram._rev_bridges[server][msg.chat.id] + '\n' + ircUsers.join('\n'));
        } else {
          telegram._bot.sendMessage(msg.chat.id, 'No users on ' + telegram._rev_bridges[server][msg.chat.id]);
        }
        break;

      case '/irc':
        parts.shift();
        telegramModule.bot.clients[server].say(telegram._rev_bridges[server][msg.chat.id], '[Telegram/' + uName + '] ' + parts.join(' '));
        break;

      case '/raw':
        parts.shift();
        telegramModule.bot.clients[server].say(telegram._rev_bridges[server][msg.chat.id], parts.join(' '));
        break;

      case '/mode':
        switch (parts[1]) {
          case 'full':
          case 'selective':
            telegram.switchMode(server, telegram._rev_bridges[server][msg.chat.id], parts[1], function(res) {
              telegram._bot.sendMessage(msg.chat.id, res);
            });
            break;

          default:
            telegram._bot.sendMessage(msg.chat.id, 'Invalid parameters.');
        }

        break;

      case '/help':
        var helpCmds = [
          'Available commands:',
          '/users - Lists the connected IRC users',
          '/mode [full/selective] - Changes the bridge mode. FULL to transfer every message / SELECTIVE to select which are transfered',
          '/irc [text] - In SELETIVE mode, is used to send text to the bridged IRC channel',
          '/raw [text] - Send RAW text to the bridged IRC channel'
        ];
        telegram._bot.sendMessage(msg.chat.id, helpCmds.join('\n'));
        break;

      case '/stats':
        telegram.stats(server, msg);
        break;
    }
  },

  stats: function(server, msg) {
    var chatId = msg.chat.id,
      params = msg.text.split(" "),
      filter = (typeof params[1] != "undefined") ? params[1] : "";

    telegram._bot.sendMessage(chatId, "Wait a moment...").then(function(a) {
      var replyTo = a.message_id;

      cloud.getCloud(chatId, filter, function(err, file) {
        if (!err) {
          telegram._bot.sendPhoto(chatId, file, {
            caption: cloud.getCaption(filter)
          });
        } else {
          switch (err) {
            case "NO_DATA":
              telegram._bot.sendMessage(chatId, "No enough words. Speak more :P");
              break;

            default:
              console.log(err);
              telegram._bot.sendMessage(chatId, "Something is wrong. Check logs!");
              break;
          }
        }
      });
    });
  },

  switchMode: function(server, irc_chan, mode, next) {
    var stmt = telegramModule.bot.dbs[server].db.prepare('UPDATE telegram_channels SET mode = ? WHERE irc_chan = ?');
    stmt.run(mode, irc_chan, function(err) {
      if (!err) {
        telegram.reload(server, function() {
          next('Bridge mode set to ' + mode);
        });
      } else {
        next('Database error');
      }
    });
  },

  reload: function(server, next) {
    // mapping Channel TO ID
    telegram._bridges = {};
    telegram._bridges[server] = {};

    // reverse mapping, from ID to Channel
    telegram._rev_bridges = {};
    telegram._rev_bridges[server] = {};

    // bridge options. currently it only supports mode
    telegram._options = {};
    telegram._options[server] = {};

    var stmt = telegramModule.bot.dbs[server].db.all('SELECT * FROM telegram_channels', function(err, result) {
      if (!err && result && result.length) {
        result.forEach(function(row) {
          telegram._bridges[server][row.irc_chan] = row.t_group_id;
          telegram._rev_bridges[server][row.t_group_id] = row.irc_chan;
          telegram._options[server][row.irc_chan] = {
            mode: row.mode
          };
        });

        if (next !== undefined) {
          next();
        }
      } else {
        if (next !== undefined) {
          next();
        }
      }
    });
  },

  setupEvents: function(server) {
    telegram._bot.on('text', (function(server) {
      return function(msg) {
        if (msg && msg.chat && msg.chat.id && telegram._rev_bridges[server][msg.chat.id]) {
          var uName = msg.from.username ? msg.from.username : msg.from.first_name + ' ' + msg.from.last_name;

          if (msg.text.match(/^\//)) { // Command from telegram
            telegram.cmdTelegram(server, msg);
          } else { // Normal message
            var toSave = {
              chatId: msg.chat.id,
              date: msg.date,
              words: msg.text
            };

            console.log(toSave);

            cloud.save(toSave);

            if (telegram._options[server][telegram._rev_bridges[server][msg.chat.id]].mode == 'full') {
              if (msg.forward_from !== undefined) {
                telegramModule.bot.clients[server].say(telegram._rev_bridges[server][msg.chat.id], '[Telegram/' + uName + '][fwd+' +
                  (msg.forward_from.username ? msg.forward_from.username : msg.forward_from.first_name) +
                  '] ' + msg.text);
              } else {
                telegramModule.bot.clients[server].say(telegram._rev_bridges[server][msg.chat.id], '[Telegram/' + uName + '] ' + msg.text);
              }
            }
          }
        }
      };
    })(server));
  },

  bridgeHandler: function(server, from, target, message) {
    if (telegram._bridges[server] !== undefined && telegram._bridges[server][target] !== undefined) {
      if (telegram._options[server][target].mode == 'full') {
        telegram._bot.sendMessage(telegram._bridges[server][target], '[IRC/' + from + '] ' + message);
      }
    } else {
      // no bridges, do nothing.
    }
  },

  bridgeList: function(server, from, target, message) {
    var stmt = telegramModule.bot.dbs[server].db.all('SELECT * FROM telegram_channels', function(err, results) {
      if (err) {
        return telegramModule.bot.clients[server].say(target, 'Database error.');
      }

      if (!(results && results.length)) {
        telegramModule.bot.clients[server].say(target, 'No bridges found.');
      } else {
        telegramModule.bot.clients[server].say(target, 'Listing telegram bridges...');
        results.forEach(function(row) {
          telegramModule.bot.clients[server].say(target, 'Channel ' + row.irc_chan + ' -> Telegram Group ID ' + row.t_group_id);
        });
      }
    });

    telegramModule.bot.clients[server].say(target, '');
  },

  bridgeAdd: function(server, from, target, irc_channel, t_group_id) {
    var stmt = telegramModule.bot.dbs[server].db.get('SELECT * FROM telegram_channels WHERE irc_chan = ?', [irc_channel], function(err, dbBridge) {
      if (err) {
        return telegramModule.bot.clients[server].say(target, 'Database error.');
      }

      if (dbBridge) {
        return telegramModule.bot.clients[server].say(target, 'There is already a bridge for channel ' + irc_channel);
      }

      var stmt = telegramModule.bot.dbs[server].db.prepare('INSERT INTO telegram_channels (irc_chan, t_group_id) VALUES (?, ?)');
      stmt.run(irc_channel, t_group_id, function(err) {
        if (!err) {
          telegramModule.bot.clients[server].say(target, 'Channel ' + irc_channel + ' bridged succesfuly to telegram group ' + t_group_id);
          telegram.reload(server);
        } else {
          return telegramModule.bot.clients[server].say(target, 'Database error.');
        }
      });

    });

    telegramModule.bot.clients[server].say(target, '');
  },

  bridgeDel: function(server, from, target, irc_channel) {
    var stmt = telegramModule.bot.dbs[server].db.get('SELECT * FROM telegram_channels WHERE irc_chan = ?', [irc_channel], function(err, dbBridge) {
      if (err) {
        return telegramModule.bot.clients[server].say(target, 'Database error.');
      }

      if (!dbBridge) {
        return telegramModule.bot.clients[server].say(target, 'Bridge not found for channel ' + irc_channel);
      }

      var stmt = telegramModule.bot.dbs[server].db.prepare('DELETE FROM telegram_channels WHERE irc_chan = ?');
      stmt.run(irc_channel, function(err) {
        if (!err) {
          telegramModule.bot.clients[server].say(target, 'Bridge for ' + irc_channel + ' deleted succesfuly.');
          telegram.reload(server);
        } else {
          return telegramModule.bot.clients[server].say(target, 'Database error.');
        }
      });

    });

    telegramModule.bot.clients[server].say(target, '');
  },

  bridgeMode: function(server, from, target, mode) {
    var stmt = telegramModule.bot.dbs[server].db.get('SELECT * FROM telegram_channels WHERE irc_chan = ? ', [target], function(err, results) {
      if (err) {
        return telegramModule.bot.clients[server].say(target, 'Database error.');
      }

      if (!results) {
        telegramModule.bot.clients[server].say(target, 'No bridge for this channel.');
      } else {
        switch (mode) {
          case 'full':
          case 'selective':
            telegram.switchMode(server, target, mode, function(res) {
              telegramModule.bot.clients[server].say(target, res);
            });
            break;

          default:
            telegramModule.bot.clients[server].say(target, 'Invalid parameters.');
        }
      }
    });

    telegramModule.bot.clients[server].say(target, '');
  },

};

var telegramModule = {
  info: {
    name: 'telegram'
  },

  commands: {
    chan: {
      '!telegram': {
        level: 50,
        callback: telegram.cmdMain
      }
    }
  },

  listeners: {
    message: telegram.bridgeHandler,
  },

  help: function(server, from) {
    this.bot.clients[server].notice(from, '!telegram bridge add [#chan] [telegram_group_id]');
    this.bot.clients[server].notice(from, '!telegram bridge del [#chan]');
    this.bot.clients[server].notice(from, '!telegram bridge list');
    this.bot.clients[server].notice(from, '!telegram bridge mode [full/selective]');
    this.bot.clients[server].notice(from, '!telegram say [text]');
  },

  initModule: function(server, next) {
    telegram._bot = new TelegramBot(config.telegram.token, {
      polling: true
    });
    telegram.setupEvents(server);
    telegram.reload(server);
  }
};

module.exports = telegramModule;
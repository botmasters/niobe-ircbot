/**
 * Niobe IRC Bot
 *  Ping Module
 * @author zephrax <zephrax@gmail.com>
 */

var ping = {
  /**
   * Handles ping command
   */
  cmdPing: function(server, from, target, host) {
    pingModule.bot.exec(server, 'ping', target, ['-c4', host])
  }

};

var pingModule = {
  module: ping,

  commands: {
    chan: {
      '!ping': {
        level: 10,
        callback: ping.cmdPing
      }
    }
  },

  help: function(server, from) {
    this.bot.clients[server].notice(from, '!ping host');
  }
};

module.exports = pingModule;
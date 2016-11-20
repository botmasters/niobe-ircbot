/**
 * Niobe IRC Bot
 *  Account Module
 * @author zephrax <zephrax@gmail.com>
 */

var crypto = require('crypto');

var account = {
  main: function(server, from, target, message) {
    var self = account;

    var parts = message.trim().split(/ +/);
    var command = parts[0];

    if (target == accountModule.bot.client.opt.nick) { // private message
      switch (command) {
        case 'register':
          console.log(self);
          self.cmdRegister(from, parts.slice(1));
          break;
        case 'identify':
          self.cmdIdentify(from, parts.slice(1));
          break;
        case 'access':
          self.cmdAccess(from, parts.slice(1));
          break;
      }
    }
  },

  /**
   * Handles users registration
   * @param string nick User being registered
   * @param array params Command parameters
   */
  cmdRegister: function(nick, params) {
    var self = this;

    if (params.length == 2) {
      accountModule.bot.db.getUser(nick, function(result) {
        if (result) { // user already exists
          accountModule.bot.notice(nick, 'Your nick is already registered.');
        } else { // everything went ok, proceed
          var password = crypto.createHash('sha1');
          password.update(params[0]);
          accountModule.bot.db.newUser([nick, params[1], password.digest('hex')], function(result) {
            if (result === null)
              accountModule.bot.notice(nick, 'You are now registered!');
            else
              accountModule.bot.notice(nick, 'Failed to save the user to database, please try again later.');

            cb(result);
          });
        }
      });
    }
  },

  /**
   * Handles users identification
   * @param string nick User being identified
   * @param array params Command parameters
   */
  cmdIdentify: function(nick, params) {
    if (accountModule.bot.identifiedUsers.indexOf(nick) != -1) {
      accountModule.bot.notice(nick, 'You are already identified.');
    } else if (params.length >= 1) {
      var password = crypto.createHash('sha1');
      password.update(params[0]);
      accountModule.bot.db.getUserForLogin(nick, password.digest('hex'), function(result) {
        if (result) {
          accountModule.bot.notice(nick, 'You are now identified.');
          if (accountModule.bot.identifiedUsers.indexOf(nick) == -1)
            accountModule.bot.identifiedUsers.push(nick);
        } else {
          accountModule.bot.notice(nick, 'Invalid credentials.');
        }
      });
    }
  },

  /**
   * Handles users access list
   */
  cmdAccess: function(nick, params) {
    if (params.length <= 1) {
      accountModule.bot.notice(nick, 'Usage access user [0..99]');
      return;
    }

    accountModule.bot.db.getUser(params[0], function(result) {
      if (!result) {
        accountModule.bot.notice(nick, 'User \'' + params[0] + '\' not found.');
      } else {
        accountModule.bot.db.setUserPerms(params[0], parseInt(params[1]), function(result) {
          if (result)
            accountModule.bot.notice(nick, 'Failed to update user perms. Please try again later.');
          else
            accountModule.bot.notice(nick, 'User \'' + params[0] + '\' not have level \'' + params[1] + '.');
        });
      }
    });
  },

  /**
   * Check if the user is or not in another channel
   * @param string curr_chan The current channel where the event was triggered
   * @param string nick User nickname
   */
  checkInAnotherChannel: function(curr_chan, nick) {
    if (nick == accountModule.bot.client.opt.nick) {
      if (Object.keys(accountModule.bot.client.chans).length == 1)
        account.logoutAllUsers();
    } else {
      var active_user = false;
      (Object.keys(accountModule.bot.client.chans) || []).forEach(function(chan) {
        if (chan != curr_chan) {
          (Object.keys(accountModule.bot.client.chans[chan].users || [])).forEach(function(user) {
            if (user == nick)
              active_user = true;
          });
        }
      });

      return active_user;
    }
  },

  logoutAllUsers: function() {
    console.log('Logging out all of the users..');
    accountModule.bot.identifiedUsers = [];
  },

  logoutUser: function(user) {
    delete accountModule.bot.identifiedUsers[accountModule.bot.identifiedUsers.indexOf(user)];
    console.log('Logout ' + user + ' ...');
  },

  getUserLevel: function(nick, cb) {
    accountModule.bot.db.getUser(nick, function(result) {
      cb(result);
    });
  },

  part: function(arg0, nick, arg1) {
    if (!account.checkInAnotherChannel(arg0, nick)) {
      account.logoutUser(nick);
    }
  },

  kick: function(arg0, arg1, nick, arg2) {
    if (!account.checkInAnotherChannel(arg0, arg1)) {
      account.logoutUser(arg1);
    }
  }
};

var accountModule = {
  listeners: {
    message: account.main,
    part: account.part,
    kick: account.kick
  }
};

module.exports = accountModule;
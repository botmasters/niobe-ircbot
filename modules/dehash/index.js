/**
 * DeHash module 
 *  Search hashes on diferents sites for decrypt
 * @author exos <tioscar@gmail.com>
 */

var dehash = require('./lib/dehash');
var sources = require('./sources');
var only = null;


var DeHashSources = {

  list: function(server, from, target, message) {

    if (dehashModule.bot.debug) console.log("Listo los sources");

    for (i in sources) {
      dehashModule.bot.clients[server].say(target, i);
    }
  },

  detail: function(server, from, target, message) {
    var source = message.split(/[\s\t]+/)[1];

    if (sources[source]) {
      dehashModule.bot.clients[server].say(target, JSON.stringify(sources[source]));
    } else {
      dehashModule.bot.clients[server].notice(from, "[dehash-error] : Source not found");
    }
  },

  del: function(server, from, target, message) {
    var source = message.split(/[\s\t]+/)[1];

    if (sources[source]) {
      delete sources[source];
      dehashModule.bot.clients[server].say(target, source + " eliminado ");
    } else {
      dehashModule.bot.clients[server].notice(from, "[dehash-error] : Source not found");
    }
  },

  reload: function(server, from, target, message) {
    sources = require('./sources');
    this.list.apply(this, arguments);
  },

  only: function(server, from, target, message) {
    var source = message.split(/[\s\t]+/)[1] || null;

    if (source) {
      if (sources[source]) {
        only = {};
        only[source] = true;
        dehashModule.bot.clients[server].say(target, "Solo se usara: " + source);
      } else {
        dehashModule.bot.clients[server].notice(from, "[dehash-error] : Source not found");
      }
    } else {
      only = null;
    }

  },

};


var DeHash = {

  cmdDehash: function(server, from, target, message) {

    if (dehashModule.bot.debug) console.log("Disparado comando dehash");

    var hashes = message.split(',');

    if (dehashModule.bot.debug) console.log("recorro los sources");
    for (i in (only ? only : sources)) {

      hashes.forEach(function(hash) {

        if (dehashModule.bot.debug) console.log("chequeo " + hash + " en " + sources[i]);

        (function(i) {
          var type = null;

          dehash(hash, type, sources[i], function(err, data) {
            if (err) {
              dehashModule.bot.clients[server].notice(from, i + " [error] :" + err);
            } else {
              if (dehashModule.bot.debug) console.log(i + ":" + data);
              if (dehashModule.bot.debug) console.log(dehashModule.bot.clients[server].say);
              dehashModule.bot.clients[server].say(target, i + ":" + data);
            }
          });
        })(i);

      });

    }

  },

  cmdDehasSources: function(server, from, target, message) {

    var method = message.split(/\b/)[0];

    if (dehashModule.bot.debug) console.log("Veo si ejecuto " + method);

    if (DeHashSources[method]) {
      DeHashSources[method].apply(DeHashSources, arguments);
    } else {
      dehashModule.bot.clients[server].notice(from, "[dehash-error] : Command not found");
    }

  }

};

var dehashModule = {

  commands: {
    chan: {
      '!dehash': {
        level: 0,
        callback: DeHash.cmdDehash
      },
      '!dehash-sources': {
        level: 0,
        callback: DeHash.cmdDehasSources
      }
    }
  },

  help: function(server, from) {
    this.bot.clients[server].notice(from, '!dehash hash');
    this.bot.clients[server].notice(from, '!dehash-sources list|detail|del|reload|only');
  }
};

module.exports = dehashModule;
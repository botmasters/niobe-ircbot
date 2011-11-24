/**
 * Niobe IRC Bot Storage Abstraction Object
 * @author zephrax <zephrax@gmail.com>
 */

var sqlite3 = require('sqlite3').verbose();

var botdb = function (config) {
    this.db = new sqlite3.Database(config.db);
};

/**
 * Retrieves list of channels where bot should be
 * @param callback cb (err, results)
 */
botdb.prototype.getChannels = function (cb) {
    var stmt = this.db.all('SELECT id, channel FROM channels', function (err, channels) {
	cb(err, channels);
    });
};

/**
 * Get user from database
 */
botdb.prototype.getUser = function (user, cb) {
    var stmt = this.db.get('SELECT id, user, email, level FROM users WHERE user = ?', [user], function (err, result) {
	if (!err)
	    cb(result || false);
    });
};

/**
 * Get user from database for login
 */
botdb.prototype.getUserForLogin = function (user, password_hash, cb) {
    var stmt = this.db.get('SELECT id, user, email FROM users WHERE user = ? AND password = ?', [user, password_hash], function (err, result) {
	if (!err)
	    cb(result || false);
    });
};

/**
 * Create a new user and saves it to database
 */
botdb.prototype.newUser = function (data, cb) {
    var stmt = this.db.prepare('INSERT INTO users (id, user, email, level) VALUES (null, ?, ?, ?)');
    stmt.run(data[0], data[1], data[2], function (result) {
	cb(result);
    });
};

/**
 * Set user permissions
 */
botdb.prototype.setUserPerms = function (user, level, cb) {
    var stmt = this.db.prepare('UPDATE users SET level = ? WHERE user = ?');
    stmt.run(level, user, function (result) {
	cb(result);
    });
};

/**
 * Set user properties (db fields, email, level, etc)
 */
botdb.prototype.setUserProp = function (user, prop, value, cb) {
    var stmt = this.db.prepare('UPDATE users SET ' + prop + ' = ? WHERE user = ?');
    stmt.run(value, user, function (result) {
	cb(result);
    });
}

botdb.prototype.getAccessList = function (cb) {
    var stmt = this.db.all('SELECT * FROM users', function (err, users) {
	cb(err, users);
    });
};

module.exports = botdb;

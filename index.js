'use strict';

var dgram = require('dgram');
var hostname = require('os').hostname();
var METHODS = {
    INCREMENT: 'i',
    DECREMENT: 'd',
    GAUGE: 'g'
};

module.exports = Udp;

function Udp(options) {
    options = options || {};
    this.host = options.host;
    this.port = options.port;
    this.prefix = options.prefix ? options.prefix + '.' : '';
    if (options.hostname) {
        this.hostname = hostname;
        this.prefix += this.hostname + '.';
    }
    this.debug = options.debug;
    this.enabled = options.enabled !== undefined ? options.enabled : true;
    this.start();
}

Udp.prototype.METHODS = METHODS;

Udp.prototype.start = function start() {
    this.socket = dgram.createSocket('udp4');
    this.socket.on('close', this.onClose.bind(this));
    this.socket.on('error', this.onError.bind(this));
}

Udp.prototype.onClose = function onClose() {
    console.log('socket closed ' + this.host + ':' + this.port);
    this.start();
};

Udp.prototype.onError = function onError(err) {
    console.log('socket error ' + this.host + ':' + this.port + ' - ' + err);
};

Udp.prototype.send = function send(key, value, method, callback) {
    if (Array.isArray(key)) {
        key = key.join('.');
    }

    var message = this.prefix + key + ':' + value + ':' + method;
    var buffer = new Buffer(message);

    if (this.debug) {
        this.log();
    }
    if (!this.enabled) {
        callback(null, buffer.length);
    }
    this.socket.send(buffer, 0, buffer.length, this.port, this.host, callback || noop);
};

Udp.prototype.increment = function increment(key, value, callback) {
    this.send(key, value || 1, this.METHODS.INCREMENT, callback);
};

Udp.prototype.decrement = function decrement(key, value, callback) {
    this.send(key, value || 1, this.METHODS.DECREMENT, callback);
};

Udp.prototype.gauge = function gauge(key, value, callback) {
    this.send(key, value || 0, this.METHODS.GAUGE, callback);
};

function noop() {}

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
    this.METHODS = METHODS;
    this.start();
}

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

    var message = new Buffer(this.prefix + key + ':' + value + ':' + method);

    this.socket.send(message, 0, message.length, this.port, this.host, callback || noop);
};

Udp.prototype.increment = function increment(key, value, callback) {
    this.send(key, value || 1, this.METHODS.INCREMENT, callback);
};

Udp.prototype.decrement = function decrement(key, value, callback) {
    this.send(key, value || 1, this.METHODS.DECREMENT, callback);
};

Udp.prototype.gauge = function gauge(key, value, callback) {
    this.send(key, value || 1, this.METHODS.GAUGE, callback);
};

function noop() {}

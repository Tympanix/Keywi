'use strict';

const stream = require('stream');
const util = require('util');
const crypto = require('crypto');

function EchoStream(salt) {
    stream.Transform.call(this);

    // Create HMAC generating algorithm
    this.hmac = crypto.createHmac('sha256', 'a secret');

    // Write the salt to the biginning of the file
    this.write(salt);
};

util.inherits(EchoStream, stream.Transform);

EchoStream.prototype._transform = function (data, encoding, callback) {
    this.push(data);
    this.hmac.update(data.toString('hex'));
    process.stdout.write(data.toString('hex'));
    callback();
};

EchoStream.prototype._flush = function (done) {
    var hmac = this.hmac.digest();
    console.log("\nHMAC:", hmac.toString('hex'));
    this.push(hmac);
    done();
};

module.exports = EchoStream;

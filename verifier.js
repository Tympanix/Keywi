'use strict';

const stream = require('stream');
const util = require('util');
const crypto = require('crypto');

function EchoStream() {
    stream.Transform.call(this);

    // Create HMAC generating algorithm
    this.hmac = crypto.createHmac('sha256', 'a secret');

    this.salt = Buffer.alloc(32);
    this.checksum = Buffer.alloc(32);

    this.ciphertext = [];

    this.readBytesSalt = 0;
    this.readBytesChecksum = 0;
};

util.inherits(EchoStream, stream.Transform);

EchoStream.prototype._transform = function (data, encoding, callback) {
    var cipherText;

    if (this.readBytesSalt < 32){
        var numBytes = data.copy(this.salt, 0, 0, 32 - this.readBytesSalt);
        cipherText = data.slice(numBytes);
        this.readBytesSalt += numBytes;
    } else {
        cipherText = data;
    }

    this.push(cipherText);
    this.hmac.update(cipherText.toString('hex'));
    process.stdout.write(cipherText.toString('hex'));
    callback();
};

EchoStream.prototype._flush = function (done) {
    var hmac = this.hmac.digest();
    console.log("\nHMAC:", hmac.toString('hex'));
    this.push(hmac);
    done();
};

module.exports = EchoStream;

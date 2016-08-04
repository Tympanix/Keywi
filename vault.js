'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const Q = require('q');

const SALT = generateSalt();
var VAULT = {
    name: "mathias",
    age: "23",
    education: "Software Engineer"
}

function writeVault(){
    const defer = Q.defer();

    const data = new Buffer(JSON.stringify(VAULT), 'utf8');
    const cipher = crypto.createCipher(config.CIPHER, config.SECRET);
    const hmac = crypto.createHmac(config.HMAC, config.SECRET);
    const output = fs.createWriteStream(config.OUTPUT_FILE);

    cipher.on('readable', () => {
        var data = cipher.read();
        if (data) {
            output.write(data);
            hmac.update(data);
        }
    });

    cipher.on('end', () => {
        const calcHmac = hmac.digest();
        console.log("Salt:", SALT.toString('hex'));
        console.log("HMAC:", calcHmac.toString('hex'));
        output.end(calcHmac);
    });

    cipher.on('error', (err) => {
        defer.reject(err);
    });

    output.on('error', (err) => {
        defer.reject(err);
    });

    output.on('finish', () => {
        defer.resolve("Vault saved");
    });

    output.write(SALT);
    hmac.update(SALT);
    cipher.write(data);
    cipher.end();

    return defer.promise;
}

function readVault(){
    const defer = Q.defer();

    var output = "";
    const decipher = crypto.createDecipher(config.CIPHER, config.SECRET)
    const hmac = crypto.createHmac(config.HMAC, config.SECRET);
    const input = fs.readFileSync('files/out.txt');

    const salt = input.slice(0, 32);
    const vaultHmac = input.slice(input.length - 32);
    const cipherText = input.slice(32, input.length - 32);

    decipher.on('readable', () => {
        var data = decipher.read();
        if (data) {
            output += data.toString('utf8');
        }
    })

    decipher.on('end', () => {
        try {
            console.log("Cipher done!");
            VAULT = JSON.parse(output);
            defer.resolve(VAULT);
        } catch (e) {
            defer.reject(e);
        }
    });

    decipher.on('error', (err) => {
        defer.reject(err);
    });

    hmac.on('readable', () => {
        var data = hmac.read();
        if (data) {
            console.log("Vault HMAC", vaultHmac.toString('hex'));
            console.log("Calc. HMAC:", data.toString('hex'));

            if (!vaultHmac.equals(data)){
                defer.reject(Error("HMAC doesn't match"));
            } else {
                decipher.write(cipherText);
                decipher.end();
            }
        }
    });

    hmac.write(salt);
    hmac.write(cipherText);
    hmac.end();

    return defer.promise;
}

function generateSalt(){
    return crypto.randomBytes(32);
}

exports.writeVault = writeVault;
exports.readVault = readVault;
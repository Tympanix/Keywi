'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const commander = require('commander');

const Signer = require('./signer');

const SECRET = 'mysecret';

commander
    .version('0.0.1')
    .option('-d, --decypher', 'Decypher the input file')
    .parse(process.argv);


if (commander.decypher){
    console.log("Running decipher!");
    decrypt();
} else {
    console.log("Running cipher!");
    encrypt();
}

function encrypt(){
    const cipher = crypto.createCipher('aes-256-cbc', SECRET)
    const signer = new Signer('hello world');

    const input = fs.createReadStream('in.txt');
    const output = fs.createWriteStream('out.txt');

    // Pipe the input through the cipher and to the output!
    input.pipe(cipher).pipe(signer).pipe(output);
}


function decrypt(){
    const decipher = crypto.createDecipher('aes-256-cbc', SECRET)

    const input = fs.createReadStream('out.txt');
    const output = fs.createWriteStream('copy.txt');

    input.pipe(decipher).pipe(output);

    decipher.on('error', function(e){
        console.log("Error!");
    })
}

'use strict';

const commander = require('commander');
const vault = require('./vault');
const config = require('./config');

commander
    .version('0.0.1')
    .option('-d, --decypher', 'Decypher the input file')
    .option('-g, --generate', 'Generate HMAC and AES keys')
    .parse(process.argv);


if (commander.decypher){
    console.log("Running decipher!");
    decrypt();
} else if (commander.generate) {
    vault.hashPassword(config.SECRET, 'salt')
} else {
    console.log("Running cipher!");
    encrypt();
}

function encrypt(){
    vault.writeVault(config.SECRET)
        .then(function(data) {
            console.log(data);
        })
        .catch(function(err) {
            console.error(err);
        })
}


function decrypt(){
    vault.readVault(config.SECRET)
        .then(function(data) {
            console.log(data);
        })
        .catch(function(err) {
            console.error(err);
        })
}

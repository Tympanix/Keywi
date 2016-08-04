'use strict';

const commander = require('commander');
const vault = require('./vault');

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
    vault.writeVault()
        .then(function(data) {
            console.log(data);
        })
        .catch(function(err) {
            console.error(err);
        })
}


function decrypt(){
    vault.readVault()
        .then(function(data) {
            console.log(data);
        })
        .catch(function(err) {
            console.error(err);
        })
}

var fs = require("fs");
function randBoolPos(pos_ratio){ return (Math.random() < pos_ratio); }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function writeToFile(fileName, data) {
    fs.writeFile('experiments/'+fileName+'.csv', data, 'utf8', function (err) {
        if (err) { console.log(err); }
    });
}

function readCsvIntoAddresses(csv_name) {
    return new Promise(resolve => {
        fs.readFile(csv_name, 'utf8', (err, data) => {
            if (err) throw err;
            resolve(data.split(","));
        });
    });
}

module.exports = {
    randBoolPos, sleep, writeToFile, readCsvIntoAddresses
}


function randBoolPos(pos_ratio){ return (Math.random() < pos_ratio); }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function writeToFile(fileName, data) {
    fs.writeFile('experiments/'+fileName+'.csv', data, 'utf8', function (err) {
        if (err) { console.log(err); }
    });
}

module.exports = {
    randBoolPos, sleep, writeToFile
}
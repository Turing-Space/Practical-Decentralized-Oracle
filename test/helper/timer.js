function getNow() {
    return new Promise(function(resolve) {
          resolve(new Date().getTime());
      });
}

function getTimeDiff(startTime) {
    var diff = getNow() - startTime;
    return diff;
}

module.exports = { getNow, getTimeDiff }
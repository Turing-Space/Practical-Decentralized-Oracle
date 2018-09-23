function getNow() {
    return new Date().getTime(); // Return sth that uses 0.001 second as unit
}

function getTimeDiff(startTime) {
    var diff = getNow() - startTime;
    return diff;
}

module.exports ={
    getNow, getTimeDiff,
  }
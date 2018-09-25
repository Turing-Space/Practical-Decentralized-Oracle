var fs = require('fs');
var obj;
fs.readFile('./result.json', 'utf8', function (err, data) {
  if (err) throw err;
  res = JSON.parse(data).result;
  allAns = []

  for(var i=0;i<res.length;i++){
    curRes = res[i];
    if ((curRes.contractAddress != "") && (curRes.gasUsed == "325139") ) {
        allAns.push(curRes.contractAddress);
    }
  }

  console.log(allAns);
  console.log(allAns.length);
});
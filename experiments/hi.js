var fs = require("fs");
var obj = JSON.parse(fs.readFileSync('experiments/kovanTnx.json', 'utf8')).result;
const { sleep, writeToFile } = require("../test/helper/util");

contract_addr = [];
cnt = 0;
for(var i=0;i<obj.length;i++){
    // console.log(obj[i])
    if(obj[i].gasUsed == "325139"){
        contract_addr.push(obj[i].contractAddress);
        cnt++;
    }
    if(cnt>=101) break;
}
console.log("address obtained:", cnt);
writeToFile("client_addr", contract_addr);




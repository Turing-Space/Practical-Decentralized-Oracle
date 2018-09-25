const Client = artifacts.require("Client");
let N = 100;
let client;
let client_addr = [];
let cnt = 0;

for (var n = 0; n<N; n++){
    client = await Client.new();
    client_addr.push(client.address);
    cnt++;
}

console.log("client addresses obtained:", cnt);
writeToFile("client_addr", client_addr);
const { getNow } = require("./helper/timer");
const { sleep, writeToFile } = require("./helper/util");

const Custodian = artifacts.require("Custodian");
const Client = artifacts.require("Client");

const argv = require('minimist')(process.argv.slice(2), {string: ['prefix']});



let clients = []; // array of client contracts 
let consensus = {};
let events;

let t1 = []; 
let t2 = [];
let max_trial = 20;                 // was 20
// let N = 100;    // fixed N clients  // was 100
let N = 50;    // fixed N clients  // was 100
let M = 1;    // max custodians
let T = 100;                        // was 100
let STEP = 1; 
let START_NUM = 1;
let EXP_NUM = "Exp1";

let timerOn = false;

contract('Custodian', function (accounts) {

    context('N voters', function () {
        it("Exp", async function(){

            // Catch file prefix
            const prefix = argv['prefix'];

            // Create client
            clients = [];
            for (var n = 0; n<N; n++){
                clients[n] = await Client.new();
            }
            
            // Do multiple trials
            for (var j = 1; j<=max_trial; j++){
                let ans_array_per_trial = [];

            // Test different number of N
            for (var n = START_NUM; n<=N; n+=STEP) {
                    consensus[0] = await Custodian.new();

                    // extend voter base to n
                    for (var _n = 0; _n<n; _n++){
                        await clients[_n].vote(consensus[0].address, true);  // HAS AWAIT
                    }
                    assert.equal(await consensus[0].numOfTotalVoterClients(), n);

                    // start!
                    t1[n] = await getNow();
                    timerOn = true;

                    // Event
                    events = consensus[0].allEvents(["latest"]);
                    events.watch(async function(error, event){
                        if (!error) {

                            if (timerOn) {
                                t2[n] = await getNow(); 
                                timerOn = false;
                            }

                        } else { console.log(error); }
                    });

                    // terminate all camps for each consensus before start another vote camp
                    await consensus[0].unsafeTerminateCurrentOpenedSeq();

                    // all client votes
                    for (var i = 0; i < n; i++) { 
                        if(!timerOn) break;
                        clients[i].vote(consensus[0].address, false); 
                    }
                
                    await sleep(3000);
                    assert.equal(await consensus[0].numOfTotalVoterClients(), n);

                    cur_ans = t2[n] - t1[n];
                    console.log(n, ":", t2[n], t1[n], cur_ans);
                    ans_array_per_trial.push(cur_ans);
                }
                // Output to file (m:time)
                writeToFile(EXP_NUM+"-"+prefix+"-trial#"+j.toString(), ans_array_per_trial);
            }
        }).timeout(3000000000);
    });
});
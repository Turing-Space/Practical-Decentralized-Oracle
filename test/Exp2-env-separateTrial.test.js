const { getNow } = require("./helper/timer");
const { sleep, writeToFile } = require("./helper/util");

const argv = require('minimist')(process.argv.slice(2), {string: ['prefix']});


const Custodian = artifacts.require("Custodian");
const Client = artifacts.require("Client");

let clients = []; // array of client contracts 
let consensus = {};
let events;

let t1 = []; 
let t2 = [];
let max_trial = 20;
let N = 20;    // fixed N clients
let M = 20;    // max custodians 20
let STEP = 1; 
let START_NUM = 1;
let EXP_NUM = "Exp2";

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
            console.log("All Clients deployed");

            // Create custodian
            for (var m = 0; m<M; m++){
                consensus[m] = await Custodian.new();

                // extend voter base to N
                for (var n = 0; n<N; n++){
                    await clients[n].vote(consensus[m].address, true);  // HAS AWAIT
                }

                // Terminate custodian m
                await consensus[m].unsafeTerminateCurrentOpenedSeq();
            }
            console.log("All Custodians deployed");            

            // Termination of creation
            await sleep(800);

            // Do multiple trials
            for (var j = 1; j<=max_trial; j++){
                let ans_array_per_trial = [];

            // Test different number of Consensus
            for (var m = START_NUM; m<=M; m+=STEP) {
                    // start!
                    t1[m] = await getNow();

                    for (var c = 0; c<m; c++) {

                        // Event
                        events = consensus[c].allEvents(["latest"]);
                        events.watch(async function(error, event){
                            if (!error) {
                                t2[m] = await getNow(); 
                            } else { console.log(error); }
                        });

                        // terminate all camps for each consensus before start another vote camp
                        await consensus[c].unsafeTerminateCurrentOpenedSeq();

                        // all clients vote (NO AWAIT)
                        for (var i = 0; i < N; i++) { clients[i].vote(consensus[c].address, false); }
                    }

                    // sleep before catch t2
                    await sleep(5000);
                    
                    // Catch t2
                    cur_ans = t2[m] - t1[m];
                    console.log(m, ":", t2[m], t1[m], cur_ans);
                    ans_array_per_trial.push(cur_ans);
                }

                // Output to file (m:time)
                writeToFile(EXP_NUM+"-"+prefix+"-trial#"+j.toString(), ans_array_per_trial);
            }
        }).timeout(3000000000);
    });
});
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
let N = 100;    // fixed N clients
let M = 1;    // max custodians
let T = 100;
let STEP = 5; 
let START_NUM = 5;
let EXP_NUM = "Exp3";

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

                // Test different number of Threshold
                for (var t = START_NUM; t<=T; t+=STEP) {
                    await consensus[0].unsafeSetThreshold(t);
                    assert.equal(await consensus[0].THRESHOLD_OF_PARTICIPANTS(), t);
                    console.log("Threshold", await consensus[0].THRESHOLD_OF_PARTICIPANTS(), t);

                        // start!
                        t1[t] = await getNow();
                        timerOn = true;

                        // Event
                        events = consensus[0].allEvents(["latest"]);
                        events.watch(async function(error, event){
                            if (!error) {

                                if (timerOn) {
                                    t2[t] = await getNow(); 
                                    timerOn = false;
                                }

                            } else { console.log(error); }
                        });

                        // terminate all camps for each consensus before start another vote camp
                        await consensus[0].unsafeTerminateCurrentOpenedSeq();

                        // all clients vote (NO AWAIT)
                        for (var i = 0; i < N; i++) { clients[i].vote(consensus[0].address, false); }
                    
                        await sleep(5000);

                        cur_ans = t2[t] - t1[t];
                        console.log(t, ":", t2[t], t1[t], cur_ans);
                        ans_array_per_trial.push(cur_ans);
                    }
                // Output to file (m:time)
                writeToFile(EXP_NUM+"-"+prefix+"-#trial"+j.toString(), ans_array_per_trial);
            }
        }).timeout(3000000000);
    });
});


// exp1
// 10 - 15
// 20 - 25 
// 30 - 
// 40

// exp3
// 1 - 100
// 2 - 100
// 3
// 4truffle test test/Exp3-env-separateTrial.test.js --prefix aws3-redo-again-sep

// 5
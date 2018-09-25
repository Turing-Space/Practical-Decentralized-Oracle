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

            // Test different number of Threshold
            for (var t = 10; t<=T; t+=10) {

                let ans_array_per_t = [];
                await consensus[0].unsafeSetThreshold(t);
                assert.equal(await consensus[0].THRESHOLD_OF_PARTICIPANTS(), t);

                // Do multiple trials
                for (var j = 0; j<max_trial; j++){

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
                
                    await sleep(3000);

                    cur_ans = t2[t] - t1[t];
                    console.log(t, ":", t2[t], t1[t], cur_ans);
                    ans_array_per_t.push(cur_ans);
                }
                // Output to file (m:time)
                writeToFile("Exp1-"+prefix+"-"+n.toString(), ans_array_per_t);
            }
        }).timeout(3000000000);
    });
});
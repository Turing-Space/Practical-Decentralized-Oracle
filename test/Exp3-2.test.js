const { assertRevert } = require("./helper/assertRevert");
const { getNow, getTimeDiff } = require("./helper/timer");

const Custodian = artifacts.require("Custodian");
const Client = artifacts.require("Client");
const IoT_temp = artifacts.require("IoT_temp");
const IoT_press = artifacts.require("IoT_press");

var _ = require('lodash');
var fs = require('fs');

let clients = []; // array of client contracts 
// let clientIdToPolarity = {};
let seq;
let result;
let totalVoters;
let ioT_temp = [];
let ioT_press = [];
let finalResult = {"noAgreement": 0, "true": 1, "false": 2}
let consensus = {};
let N = 100;          // The total number of voters (can be updated according to Exp)
let events;

let t1; 
let t2;
let hasAllVoted = false;
let ans = [];

function randBoolPos(pos_ratio){ return (Math.random() < pos_ratio); }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function writeToFile(fileName, data) {
    fs.writeFile('experiments/'+fileName+'.csv', data, 'utf8', function (err) {
        if (err) { console.log(err); }
    });
}



contract('Custodian', function (accounts) {
    context('N voters', function () {
        it("Exp", async function(){

            let max_trial = 20;
            

            

            for (var t = 10; t<=100; t+=10) {

                let ans_array_per_N = [];

                for (var j = 0; j<max_trial;j++){

                    // Create custodian
                    custodian = await Custodian.new();
                    consensus["Test"] = custodian.address;

                    // Set thershold
                    await custodian.unsafeSetThreshold(t);
                    assert.equal(await custodian.THRESHOLD_OF_PARTICIPANTS(), t);

                    // Create event
                    events = custodian.allEvents(["latest"]);

                    // Watch event
                    events.watch(function(error, event){
                        if (!error) {
                            // console.log("Event", event.event, event.args.seq,":", event.args.finalResult.toNumber(), "End Time: ", getNow());
                            
                            // Catch t2
                            if (hasAllVoted) { 
                                // console.log("Event", event.event, event.args.seq,":", event.args.finalResult.toNumber(), "End Time: ", getNow());
                                t2 = getNow(); 
                                cur_ans = t2 - t1;
                                console.log(N, ":", cur_ans);
                                hasAllVoted = false;

                                // Append to array
                                ans_array_per_N.push(cur_ans);
                                
                                
                            }
                        } else { console.log(error); }
                    });

                    // Extend the voter base to N
                    for (var i = 0; i < N; i++) {
                        clients[i] = await Client.new();
                        // console.log("voter", i+1, "joins at", getNow());
                        await clients[i].vote(consensus["Test"], true);  // HAS AWAIT
                    }

                    // Termination
                    await custodian.unsafeTerminateCurrentOpenedSeq();
                    // console.log(" ========== Everything starts from here :) ========== ");
                    await sleep(2000);

                    // Catch t1
                    t1 = getNow();
                    hasAllVoted = true;

                    // Extend the voter base to N (NO AWAIT)
                    for (var i = 0; i < N; i++) { clients[i].vote(consensus["Test"], false); }

                    await sleep(2000);
                }

                // Output to file (N:time)
                writeToFile(N.toString(), ans_array_per_N);
            }
        }).timeout(3000000000);

    });

});
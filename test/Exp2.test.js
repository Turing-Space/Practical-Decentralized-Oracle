const { assertRevert } = require("./helper/assertRevert");
const { getNow, getTimeDiff } = require("./helper/timer");
const { randBoolPos, sleep, writeToFile } = require("./helper/util");

const Custodian = artifacts.require("Custodian");
const Client = artifacts.require("Client");
const IoT_temp = artifacts.require("IoT_temp");
const IoT_press = artifacts.require("IoT_press");

let clients = []; // array of client contracts 
// let clientIdToPolarity = {};
let seq;
let result;
let totalVoters;
let ioT_temp = [];
let ioT_press = [];
let finalResult = {"noAgreement": 0, "true": 1, "false": 2}
let custodians = {};
let N = 0;          // The total number of voters (can be updated according to Exp)
let events;

let t1; 
let t2;
let hasAllVoted = false;
let ans = [];
let finalized_n = 0;

contract('Custodian', function (accounts) {
    context('N voters', function () {
        it("Exp", async function(){

            let max_trial = 3;

            let N = 10;    // fixed N clients
            let M = 10;    // max custodians

            // Create client
            clients = [];
            for (var n=0; n<N; n++){ clients[n] = await Client.new(); }
            console.log("All Clients deployed");

            // Create custodian
            custodians = [];
            for (var m1=0; m1<M; m1++){
                custodian = await Custodian.new();
                custodians[m1] = custodian;

                // All clients vote for custodian m
                for (var n1=0; n1<N; n1++){
                    await clients[n1].vote(custodians[m1].address, true);  // HAS AWAIT
                }
                // Terminate custodian m
                await custodian.unsafeTerminateCurrentOpenedSeq();
                // console.log(await custodian.numOfTotalVoterClients());
            }
            console.log("All Custodians deployed");            

            // Termination of client creation
            await sleep(800);


            // Test different numbers of custodians
            for (var m = 10; m<=M; m=m+10) {
                // console.log("This is m", m);

                let ans_array_per_m = [];

                // Do multiple trials
                for (var j = 0; j<max_trial;j++){

                    // await sleep(1000);

                    for (var c = 0; c<m; c++) {
                        custodian = custodians[c];
                        await custodian.unsafeTerminateCurrentOpenedSeq();
                    }
                    
                    // start!
                    t1 = getNow();
                    finalized_n = 0;
                    hasFinalized = false;

                    for (var c = 0; c<m; c++) {
                        custodian = custodians[c];
                        // console.log(custodian.address);
                        // await custodian.unsafeTerminateCurrentOpenedSeq();


                        // Event
                        events = custodian.allEvents(["latest"]);
                        events.watch(function(error, event){
                            if (!error) {

                                if (!hasFinalized) {
                                    // console.log("watched", c, finalized_n, m);
                                
                                    t2 = getNow();
                                    finalized_n++;
                                    
                                    if(finalized_n>=m){
                                        finalized_n = 0;
                                        hasFinalized = true;

                                        cur_ans = t2 - t1;
                                        console.log(m, ":", cur_ans);
                                        ans_array_per_m.push(cur_ans);
                                    }
                                }
                                
                            } else { console.log(error); }
                        });
                        // Extend the voter base to N (NO AWAIT)
                        for (var i = 0; i < N; i++) { clients[i].vote(custodian.address, false); }
                    }
                }

                await sleep(1000);

                // Output to file (m:time)
                writeToFile("Exp2-"+m.toString(), ans_array_per_m);
            }
        }).timeout(3000000000);

    });

});
const { assertRevert } = require("./helper/assertRevert");
const { getNow, getTimeDiff } = require("./helper/timer");

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
let consensus = {};
let N = 0;          // The total number of voters (can be updated according to Exp)
let events;

let t1; 
let t2;
let hasAllVoted = false;
let ans = [];

function randBoolPos(pos_ratio){ return (Math.random() < pos_ratio); }

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

contract('Custodian', function (accounts) {

    context('N=10 voters', function () {

        let N = 50;

        it("decide which consensus to be voted on and deploy a custodian contract for this", async function(){
            // Create custodian
            custodian = await Custodian.new();
            consensus["Test"] = custodian.address;

            // Create event
            events = custodian.allEvents(["latest"]);

            // Watch event
            events.watch(function(error, event){
                if (!error) {
                    console.log("Event", event.event, event.args.seq,":", event.args.finalResult.toNumber(), "End Time: ", getNow());
                    
                    // Catch t2
                    if (hasAllVoted) { 
                        t2 = getNow(); 
                        console.log("Answer:", t2 - t1);
                    }
                } else { console.log(error); }
            });
        });

        it("should deploy one new client contract", async function () {
            // Extend the voter base to N
            for (var i = 0; i < N; i++) {
                clients[i] = await Client.new();
                console.log("voter", i+1, "joins at", getNow());
                await clients[i].vote(consensus["Test"], true);  // HAS AWAIT
            }

            // Termination
            await custodian.unsafeTerminateCurrentOpenedSeq();
            console.log(" ========== Everything starts from here :) ========== ");
            await sleep(500);
        });

        it("let's vote", async function () {
            // Catch t1
            t1 = getNow();
            hasAllVoted = true;

            // Extend the voter base to N (NO AWAIT)
            for (var i = 0; i < N; i++) { clients[i].vote(consensus["Test"], false); }
        });

        it("let's sleep", async function () {
            await sleep(500);
        });

    });

});
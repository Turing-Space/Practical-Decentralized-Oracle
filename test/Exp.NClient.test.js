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
let start_ts; 
let events;      

function randBoolPos(pos_ratio){ return (Math.random() < pos_ratio); }

contract('Custodian', function (accounts) {

    context('N=10 voters', function () {

        let N = 10;

        it("decide which consensus to be voted on and deploy a custodian contract for this", async function(){
            custodian = await Custodian.new();
            consensus["Test"] = custodian.address;
            events = custodian.allEvents(["latest"]);
            events.watch(function(error, event){
                if (!error) {
                    console.log("Event", event.event, event.args.seq,":", event.args.finalResult.toNumber());
                    console.log("End Time: ", getNow());   
                } else { console.log(error); }
            });
        });

        it("should deploy one new client contract", async function () {
            for (var i = 0; i < N; i++) {
                clients[i] = await Client.new();
                // Extend the voter base to N
                console.log("voter", i+1, "joins at", getNow());
                await clients[i].vote(consensus["Test"], false);
            }
        });

        it("should deploy one new client contract", async function () {
            events.watch(function(error, event){
                if (!error) {
                    console.log("Event", event.event, event.args.seq,":", event.args.finalResult.toNumber());
                    // Get the timer counts
                    time_diff = getTimeDiff(start_ts);
                    console.log("Time Difference: ", time_diff);   
                    // events.stopWatching();
                } else { console.log(error); }
            });
        });

    });

});
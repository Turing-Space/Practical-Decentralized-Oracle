const { assertRevert } = require("./helper/assertRevert");
const { getNow, getTimeDiff } = require("./helper/timer");

// const Custodian = artifacts.require("Custodian");
const Custodian_arti = require("../build/contracts/Custodian.json");
const Client_arti = require("../build/contracts/Client.json");

const Web3 = require("web3");
const contract = require("truffle-contract");
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const Custodian = contract(Custodian_arti);
const Client = contract(Client_arti);

    var LOCALHOST_URL = 'http://localhost:8545';

    // Bootstrap the Market abstraction for Use.
    Custodian.setProvider(new web3.providers.HttpProvider(LOCALHOST_URL));
    Client.setProvider(new web3.providers.HttpProvider(LOCALHOST_URL));

// const Client = artifacts.require("Client");
// const IoT_temp = artifacts.require("IoT_temp");
// const IoT_press = artifacts.require("IoT_press");

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

accounts = web3.eth.accounts;

// contract('Custodian', function (accounts) {
// 
    // context('N=10 voters', function () {

async function main() {

    N = 20;

            // describe("decide which consensus to be voted on and deploy a custodian contract for this", async function(){
    custodian = await Custodian.new();
    consensus["Test"] = custodian.address;
    events = custodian.allEvents(["latest"]);
    events.watch(function(error, event){
        if (!error) {
            console.log("Event", event.event, event.args.seq,":", event.args.finalResult.toNumber());
            console.log("End Time: ", getNow());   
        } else { console.log(error); }
    });
            // });

            // it("should deploy one new client contract", async function () {
                // Extend the voter base to N
    Promise.all([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => clients[i] = Client.new())).then(function(data){
        console.log(data);

        Promise.all([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((j) => clients[j].vote(consensus["Test"], false))).then(function(data){
            console.log(data);
        });
    });


}


main();

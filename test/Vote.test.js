const { assertRevert } = require("./helper/assertRevert");
const { soliditySha3 } = require('web3-utils');
const Custodian = artifacts.require("Custodian");
const Client = artifacts.require("Client");
const IoT_temp = artifacts.require("IoT_temp");
const IoT_press = artifacts.require("IoT_press");

let custodian;
let client = []; // array of client contracts 
let seq;
let result;
let totalVoters;
let ioT_temp = [];
let ioT_press = [];
let finalResult = {"noAgreement": 0, "true": 1, "false": 2}

contract('Custodian', function (accounts) {
    const [owner] = accounts;

    context('Single participant, one voter', function () {

        it("deploy custodian contract", async function(){
            custodian = await Custodian.new();
        });

        it("should deploy one new client contract", async function () {
            client[0] = await Client.new(custodian.address);
        });

        it("client 0 vote for true", async function () {
            // check seq before vote
            seq = await client[0].seq();
            assert.equal(seq, 0);

            await client[0].vote(true); 
        });

        it("consensus/agreement reached = true", async function () {
            // vote camp finished since reaching > 60% total number of clients 
            // only client 0 votes
            assert.equal(await custodian.campHasFinished(seq), true);
            assert.equal(await client[0].queryFinalState(), finalResult.true); 
        });

        it("client 0 can vote again after the previous vote camp ends", async function(){
            await client[0].vote(true); 
        });
    });

    context('Two participants, two voters', function () {

        it("another new client contract is deployed", async function () {
            client[1] = await Client.new(custodian.address);
        });

        it("client 1 vote for false", async function () {
            // new camp hasn't finished
            seq = await custodian.newly_opened_seq();
            assert.equal(await custodian.campHasFinished(seq), false);
            
            // client 1 vote false for the latest camp
            await client[1].vote(false); 

            // new camp still hasn't finished because only 50% voter votes
            assert.equal(await custodian.campHasFinished(seq), false);
        });

        it("client 1 should not be able to vote again", async function(){
            await assertRevert(client[1].vote(true)); 
        });

        it("client 0 vote for true", async function(){
            // client 0 vote true for the latest camp
            await client[0].vote(true); 
        });

        it("voting camp ends and no agreement is reached", async function(){
            // vote camp finished since reaching > 60% total number of clients 
            // client 0 and 1 both have to vote to reach consensus (if not considering timeout)
            // since client 0 vote for false and client 1 vote for true, no agreement is reached
            assert.equal(await custodian.campHasFinished(seq), true);
            assert.equal(await client[1].queryFinalState(), finalResult.noAgreement); 
        })
    });

    context('Three participants, three voters', function () {

        it("another new client contract is deployed", async function () {
            client[2] = await Client.new(custodian.address);
        });

        it("check voting camp for new seq hasn't finished", async function(){
            // record seq before vote
            seq = await custodian.newly_opened_seq();

            // camp hasn't finished
            assert.equal(await custodian.campHasFinished(seq), false);
        });

        it("client 2 vote true and becomes a new voter", async function(){    
            // client 2 vote and become a new voter
            await client[2].vote(true); 

            // 3 voters in total now
            totalVoters = await custodian.numOfTotalVoterClients();  
            assert.equal(totalVoters, 3);
        });

        it("client 0 vote true", async function(){
            // client 0 vote for true
            await client[0].vote(true); 
        });

        it("voting camp ends and agreement reached = true", async function(){
            // camp finished because 2/3 = 66.6% voters vote
            assert.equal(await custodian.campHasFinished(seq), true);
            assert.equal(await client[0].queryFinalState(), finalResult.true); 
            assert.equal(await client[2].queryFinalState(), finalResult.true); 
        });

        it("past voter can still query final state", async function(){
            // client 1 can also query the latest state without voting 
            assert.equal(await client[1].queryFinalState(), finalResult.true);  
        });        

    });

    context('Four participants, three voters', function () {

        it("another new client contract is deployed", async function () {
            client[3] = await Client.new(custodian.address);
        });

        it("client 3 just want to be updated without becoming a voter himself", async function(){
            assert.equal(await client[3].queryFinalState(), finalResult.true);
            
            // total voter is still 3
            totalVoters = await custodian.numOfTotalVoterClients();  // TODO: changed to total voters?
            assert.equal(totalVoters, 3);
        });

    });

    context('Four participants, four voters', function () {

        it("check voting camp for new seq hasn't finished", async function(){
            // record seq before vote
            seq = await custodian.newly_opened_seq();

            // camp hasn't finished
            assert.equal(await custodian.campHasFinished(seq), false);
        });

        it("client 3 vote for false and becomes a new voter", async function () {
            await client[3].vote(false); 

            // 4 voters in total now
            totalVoters = await custodian.numOfTotalVoterClients();  
            assert.equal(totalVoters, 4);
        });

        it("client 0 vote true", async function(){
            // client 0 vote for true
            await client[0].vote(false); 
        });

        it("client 1 vote true", async function(){
            // client 0 vote for true
            await client[1].vote(true); 
        });

        it("voting camp ends and agreement reached = false", async function(){
            // camp finished because 2/3 = 66.6% voters vote
            assert.equal(await custodian.campHasFinished(seq), true);
            assert.equal(await client[0].queryFinalState(), finalResult.false); 
            assert.equal(await client[1].queryFinalState(), finalResult.false); 
            assert.equal(await client[2].queryFinalState(), finalResult.false); 
            assert.equal(await client[3].queryFinalState(), finalResult.false); 
        });
    });

    context('Perform anomaly reaction between two different kinds of IoT devices as Client contract', function () {

        it("a new custodian, 3 temperature and 1 pressure IoT devices of client contracts are deployed", async function () {
            custodian = await Custodian.new();
            ioT_temp[0] = await IoT_temp.new(custodian.address);
            ioT_temp[1] = await IoT_temp.new(custodian.address);
            ioT_temp[2] = await IoT_temp.new(custodian.address);
            ioT_press[0] = await IoT_press.new(custodian.address);
        });

        it("ioT_temp 0 joins and vote true, agreement = true", async function () {
            // before vote
            seq = await custodian.newly_opened_seq();
            assert.equal(await custodian.campHasFinished(seq), false);

            // vote
            await ioT_temp[0].vote(true); 

            // 1 voters in total now
            totalVoters = await custodian.numOfTotalVoterClients();  
            assert.equal(totalVoters, 1);
            
            // after vote 
            assert.equal(await custodian.campHasFinished(seq), true);
            assert.equal(await ioT_temp[0].queryFinalState(), finalResult.true); 
        });

        it("ioT_temp 1 joins and vote true, ioT_temp 0 still votes true, agreement = true", async function () {
            // before vote
            seq = await custodian.newly_opened_seq();
            assert.equal(await custodian.campHasFinished(seq), false);

            // vote
            await ioT_temp[1].vote(true); 
            await ioT_temp[0].vote(true); 

            // 2 voters in total now
            totalVoters = await custodian.numOfTotalVoterClients();  
            assert.equal(totalVoters, 2);
            
            // after vote 
            assert.equal(await custodian.campHasFinished(seq), true);
            assert.equal(await ioT_temp[0].queryFinalState(), finalResult.true); 
            assert.equal(await ioT_temp[1].queryFinalState(), finalResult.true); 

            // perform action on anomaly case
            result = await ioT_temp[0].adjustTemp();
            assert.equal(result.logs[0].event, "CoolDown");
            result = await ioT_temp[1].adjustTemp();
            assert.equal(result.logs[0].event, "CoolDown");
        });

        it("ioT_temp 2 joins and vote false, ioT_temp 0 votes true, agreement = no agreement", async function () {
            // before vote
            seq = await custodian.newly_opened_seq();
            assert.equal(await custodian.campHasFinished(seq), false);

            // vote
            await ioT_temp[2].vote(false); 
            await ioT_temp[0].vote(true); 
            
            // 3 voters in total now
            totalVoters = await custodian.numOfTotalVoterClients();  
            assert.equal(totalVoters, 3);
            
            // after vote 
            assert.equal(await custodian.campHasFinished(seq), true);
            assert.equal(await ioT_temp[0].queryFinalState(), finalResult.noAgreement); 
        });

        it("ioT_press 0 joins and vote false, ioT_temp 0 votes true, ioT_temp 1 votes false, agreement = false", async function () {
            // before vote
            seq = await custodian.newly_opened_seq();
            assert.equal(await custodian.campHasFinished(seq), false);

            // vote
            await ioT_press[0].vote(false); 
            await ioT_temp[0].vote(true); 
            await ioT_temp[1].vote(false); 
            
            // 4 voters in total now
            totalVoters = await custodian.numOfTotalVoterClients();  
            assert.equal(totalVoters, 4);
            
            // after vote 
            assert.equal(await custodian.campHasFinished(seq), true);
            assert.equal(await ioT_temp[0].queryFinalState(), finalResult.false); 
        });
    });

});
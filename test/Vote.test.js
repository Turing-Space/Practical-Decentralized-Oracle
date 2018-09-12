const { assertRevert } = require("./helper/assertRevert");
const { soliditySha3 } = require('web3-utils');
const Custodian = artifacts.require("Custodian");
const Client = artifacts.require("Client");

let custodian;
let client = []; // array of client contracts 
let seq;
let result;
let totalVoters;
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

        it("client 0 should not be able to vote again", async function(){
            assertRevert(await client[0].vote(true)); 
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

        it("previous but not current voter can query final state", async function(){
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

});
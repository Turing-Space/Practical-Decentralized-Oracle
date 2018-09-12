const { assertRevert } = require("./helper/assertRevert");
const { soliditySha3 } = require('web3-utils');
const Custodian = artifacts.require("Custodian");
const Client = artifacts.require("Client");

let custodian;
let client = []; // array of client contracts 
let seq;
let result;
let finalResult = {"noAgreement": 0, "true": 1, "false": 2}

contract('Custodian', function (accounts) {
    const [owner] = accounts;

    context('Single participant', function () {

        it("deploy custodian contract", async function(){
            custodian = await Custodian.new();
        });

        it("should deploy one new client contract", async function () {
            client[0] = await Client.new(custodian.address);
        });

        it("client 0 vote for true", async function () {
            // seq before vote
            seq = await client[0].seq();
            assert.equal(seq, 0);

            // vote 
            await client[0].vote(true); 

            // vote camp finished since reaching > 60% total number of clients 
            // only client 0 votes
            assert.equal(await custodian.campHasFinished(seq), true);
            assert.equal(await client[0].finalResultOnCamp(seq), finalResult.true); 

            // check seq has been updated
            seq = await client[0].seq();
            assert.equal(seq, soliditySha3(0));
        });

        it("client 0 should not be able to vote again", async function(){
            assertRevert(await client[0].vote(true)); 
        });
    });

    context('Two participants', function () {

        it("another new client contract is deployed", async function () {
            client[1] = await Client.new(custodian.address);
        });

        it("client 1 vote before sync", async function(){
            // seq before vote
            seq = await client[1].seq();
            assert.equal(seq, 0);

            // client 1 vote without sync to network (vote to a finished camp)
            result = await client[1].vote(false); 

            // nothing will happen without syncing
            // even numOfTotalClients and votesCountOnCamp will not be updated
            // only final result for the previous seq has been updated
            assert.equal(finalResult.true, await client[1].finalResultOnCamp(seq));
        });

        it("client 1 vote for false after sync", async function () {
            
            // client 1 sync to the network
            await client[1].syncToNewlyOpenedSeq(); 
            seq = await client[1].seq(); 

            // new camp hasn't finished
            assert.equal(await custodian.campHasFinished(seq), false);
            
            // client 1 vote false for the latest camp
            result = await client[1].vote(false); 

            // new camp still hasn't finished because only 50% voter votes
            assert.equal(await custodian.campHasFinished(seq), false);
        });

        it("client 0 vote for true", async function(){
            // client 0 sync or not doesn't matter (seq remains the same)
            seq = await client[0].seq();
            await await client[0].syncToNewlyOpenedSeq();
            assert.equal(seq, await client[0].seq());

            // client 0 vote true for the latest camp
            result = await client[0].vote(true); 

            // vote camp finished since reaching > 60% total number of clients 
            // client 0 and 1 both have to vote to reach consensus (if not considering timeout)
            // since client 0 vote for false and client 1 vote for true, no agreement is reached
            assert.equal(await custodian.campHasFinished(seq), true);
            assert.equal(await client[1].finalResultOnCamp(seq), finalResult.noAgreement); 
        })
    });

    context('Three participants', function () {

        it("another new client contract is deployed", async function () {
            client[2] = await Client.new(custodian.address);
        });

        
    });

});
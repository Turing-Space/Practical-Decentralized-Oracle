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
            // seq before vote
            seq = await client[0].seq();
            assert.equal(seq, 0);

            // vote 
            await client[0].vote(true); 

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

            // TODO: client can register to a custodian by paying an entry fee to be one of the voters  
            // kick out the silent client (which doesn't vote after some seq) -> like your membership will expire
            // problem: client must vote?? yes, in order to have some right to participate in this vote camp and involve in a voting decision, u must vote continuously, otherwise u can just query  

            // TODO: let client pay a small fee when voting

        });

        // it("client 1 vote before sync", async function(){
        //     // seq before vote
        //     seq = await client[1].seq();
        //     assert.equal(seq, 0);

        //     // client 1 vote without sync to network (vote to a finished camp)
        //     await client[1].vote(false); 

        //     // nothing will happen without syncing
        //     // even numOfTotalClients and votesCountOnCamp will not be updated
        //     // only final result for the previous seq has been updated
        //     assert.equal(finalResult.true, await client[1].queryFinalState());
        // });

        it("client 1 vote for false", async function () {
            
            // client 1 sync to the network
            // await client[1].syncToNewlyOpenedSeq(); 
            // seq = await client[1].seq(); 
            // assert.equal(seq, await custodian.newly_opened_seq());

            // new camp hasn't finished
            seq = await custodian.newly_opened_seq();
            assert.equal(await custodian.campHasFinished(seq), false);
            
            // client 1 vote false for the latest camp
            await client[1].vote(false); 

            // new camp still hasn't finished because only 50% voter votes
            assert.equal(await custodian.campHasFinished(seq), false);
        });

        it("client 0 vote for true", async function(){
            // // client 0 sync or not doesn't matter (seq remains the same)
            // seq = await client[0].seq();
            // await await client[0].syncToNewlyOpenedSeq();
            // assert.equal(seq, await client[0].seq());

            // client 0 vote true for the latest camp
            await client[0].vote(true); 

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

        it("client 2 doesn't vote", async function(){
            // client 2 has not been synced to latest
            assert.notEqual(await custodian.newly_opened_seq(), await client[2].seq());

            // // client 2 sync
            // // TODO: why not always sync to latest before voting?
            // await client[2].syncToNewlyOpenedSeq(); 
            // seq = await client[2].seq(); 
            // assert.equal(seq, await custodian.newly_opened_seq());
        })

        it("client 2 vote true and becomes a network participant", async function(){
            // client 2 vote and become a new voter
            await client[2].vote(true); 

            // 3 voters in total now
            totalVoters = await custodian.numOfTotalVoterClients();  // TODO: changed to total voters?
            assert.equal(totalVoters, 3);

            // client 0 vote for true
            await client[0].vote(true); 

            // camp finished because 2/3 = 66.6% voters vote
            assert.equal(await custodian.campHasFinished(seq), true);
            assert.equal(await client[0].queryFinalState(), finalResult.true); 
            assert.equal(await client[2].queryFinalState(), finalResult.true); 

            // client 1 does not know the latest state because he didn't participate in last vote camp 
            assert.equal(await client[1].queryFinalState(), finalResult.true); 
            // assert.equal(await client[1].queryFinalState(), finalResult.noAgreement); 

            // // in order to know latest state, client 1 must vote to be updated
            // await client[1].vote(true);

            // enter next round of voting, however, there must be someone that is not the voter cause > 60% 
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
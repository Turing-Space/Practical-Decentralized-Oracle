const { assertRevert } = require("./helper/assertRevert");
const Custodian = artifacts.require("Custodian");
const Client = artifacts.require("Client");
const IoT_temp = artifacts.require("IoT_temp");
const IoT_press = artifacts.require("IoT_press");

let client = []; // array of client contracts 
let seq;
let result;
let totalVoters;
let ioT_temp = [];
let ioT_press = [];
let finalResult = {"noAgreement": 0, "true": 1, "false": 2}
let consensus = {};

contract('Custodian', function (accounts) {

    context('Single participant, one voter', function () {

        it("decide which consensus to be voted on and deploy a custodian contract for this", async function(){
            custodian = await Custodian.new();
            consensus["goToLunch"] = custodian.address;
        });

        it("should deploy one new client contract", async function () {
            client[0] = await Client.new();
        });

        it("client 0 vote for true", async function () {
            // check seq before vote
            seq = await client[0].seq();
            assert.equal(seq, 0);

            await client[0].vote(consensus["goToLunch"], true); 
        });

        it("consensus/agreement reached = true", async function () {
            // vote camp finished since reaching > 60% total number of clients 
            // only client 0 votes
            assert.equal(await Custodian.at(consensus["goToLunch"]).campHasFinished(seq), true);
            assert.equal(await client[0].queryFinalState(consensus["goToLunch"]), finalResult.true); 
        });

        it("client 0 can vote again after the previous vote camp ends", async function(){
            await client[0].vote(consensus["goToLunch"], true); 
        });
    });

    context('Two participants, two voters', function () {

        it("another new client contract is deployed", async function () {
            client[1] = await Client.new();
        });

        it("client 1 vote for false", async function () {
            // new camp hasn't finished
            seq = await Custodian.at(consensus["goToLunch"]).newly_opened_seq();
            assert.equal(await Custodian.at(consensus["goToLunch"]).campHasFinished(seq), false);
            
            // client 1 vote false for the latest camp
            await client[1].vote(consensus["goToLunch"], false); 

            // new camp still hasn't finished because only 50% voter votes
            assert.equal(await Custodian.at(consensus["goToLunch"]).campHasFinished(seq), false);
        });

        it("client 1 should not be able to vote again", async function(){
            await assertRevert(client[1].vote(consensus["goToLunch"], true)); 
        });

        it("client 0 vote for true", async function(){
            // client 0 vote true for the latest camp
            await client[0].vote(consensus["goToLunch"], true); 
        });

        it("voting camp ends and no agreement is reached", async function(){
            // vote camp finished since reaching > 60% total number of clients 
            // client 0 and 1 both have to vote to reach consensus (if not considering timeout)
            // since client 0 vote for false and client 1 vote for true, no agreement is reached
            assert.equal(await Custodian.at(consensus["goToLunch"]).campHasFinished(seq), true);
            assert.equal(await client[1].queryFinalState(consensus["goToLunch"]), finalResult.noAgreement); 
        })
    });

    context('Three participants, three voters', function () {

        it("another new client contract is deployed", async function () {
            client[2] = await Client.new();
        });

        it("check voting camp for new seq hasn't finished", async function(){
            // record seq before vote
            seq = await Custodian.at(consensus["goToLunch"]).newly_opened_seq();

            // camp hasn't finished
            assert.equal(await Custodian.at(consensus["goToLunch"]).campHasFinished(seq), false);
        });

        it("client 2 vote true and becomes a new voter", async function(){    
            // client 2 vote and become a new voter
            await client[2].vote(consensus["goToLunch"], true); 

            // 3 voters in total now
            totalVoters = await Custodian.at(consensus["goToLunch"]).numOfTotalVoterClients();  
            assert.equal(totalVoters, 3);
        });

        it("client 0 vote true", async function(){
            // client 0 vote for true
            await client[0].vote(consensus["goToLunch"], true); 
        });

        it("voting camp ends and agreement reached = true", async function(){
            // camp finished because 2/3 = 66.6% voters vote
            assert.equal(await Custodian.at(consensus["goToLunch"]).campHasFinished(seq), true);
            assert.equal(await client[0].queryFinalState(consensus["goToLunch"]), finalResult.true); 
            assert.equal(await client[2].queryFinalState(consensus["goToLunch"]), finalResult.true); 
        });

        it("past voter can still query final state", async function(){
            // client 1 can also query the latest state without voting 
            assert.equal(await client[1].queryFinalState(consensus["goToLunch"]), finalResult.true);  
        });        

    });

    context('Four participants, three voters', function () {

        it("another new client contract is deployed", async function () {
            client[3] = await Client.new();
        });

        it("client 3 just want to be updated without becoming a voter himself", async function(){
            assert.equal(await client[3].queryFinalState(consensus["goToLunch"]), finalResult.true);
            
            // total voter is still 3
            totalVoters = await Custodian.at(consensus["goToLunch"]).numOfTotalVoterClients();  // TODO: changed to total voters?
            assert.equal(totalVoters, 3);
        });

    });

    context('Four participants, four voters', function () {

        it("check voting camp for new seq hasn't finished", async function(){
            seq = await Custodian.at(consensus["goToLunch"]).newly_opened_seq();
            assert.equal(await Custodian.at(consensus["goToLunch"]).campHasFinished(seq), false);
        });

        it("client 3 vote for false and becomes a new voter", async function () {
            await client[3].vote(consensus["goToLunch"], false); 

            // 4 voters in total now
            totalVoters = await Custodian.at(consensus["goToLunch"]).numOfTotalVoterClients();  
            assert.equal(totalVoters, 4);
        });

        it("client 0 vote true", async function(){
            await client[0].vote(consensus["goToLunch"], false); 
        });

        it("client 1 vote true", async function(){
            // client 1 vote for true
            await client[1].vote(consensus["goToLunch"], true); 
        });

        it("voting camp ends and agreement reached = false", async function(){
            // camp finished because 2/3 = 66.6% voters vote
            assert.equal(await Custodian.at(consensus["goToLunch"]).campHasFinished(seq), true);
            assert.equal(await client[0].queryFinalState(consensus["goToLunch"]), finalResult.false); 
            assert.equal(await client[1].queryFinalState(consensus["goToLunch"]), finalResult.false); 
            assert.equal(await client[2].queryFinalState(consensus["goToLunch"]), finalResult.false); 
            assert.equal(await client[3].queryFinalState(consensus["goToLunch"]), finalResult.false); 
        });
    });

    context('Perform reaction based on anomaly detection by two kinds of IoT devices as Client contract', function () {

        it("a new custodian, 3 temperature and 1 pressure IoT devices of client contracts are deployed", async function () {
            custodian = await Custodian.new();
            consensus["envAbnormal"] = custodian.address;

            ioT_temp[0] = await IoT_temp.new();
            ioT_temp[1] = await IoT_temp.new();
            ioT_temp[2] = await IoT_temp.new();
            ioT_press[0] = await IoT_press.new();
        });

        it("ioT_temp 0 joins and log 50 degrees for temp, agreement on anomaly = true", async function () {
            // before vote
            seq = await Custodian.at(consensus["envAbnormal"]).newly_opened_seq();
            assert.equal(await Custodian.at(consensus["envAbnormal"]).campHasFinished(seq), false);

            // vote
            await ioT_temp[0].logTemperature(consensus["envAbnormal"], 50); 

            // 1 voters in total now
            totalVoters = await Custodian.at(consensus["envAbnormal"]).numOfTotalVoterClients();  
            assert.equal(totalVoters, 1);
            
            // after vote 
            assert.equal(await Custodian.at(consensus["envAbnormal"]).campHasFinished(seq), true);
            assert.equal(await ioT_temp[0].queryFinalState(consensus["envAbnormal"]), finalResult.true); 
        });

        it("ioT_temp 1 joins and logs 60 degree, ioT_temp 0 logs 50, agreement on anomaly = true", async function () {
            // before vote
            seq = await Custodian.at(consensus["envAbnormal"]).newly_opened_seq();
            assert.equal(await Custodian.at(consensus["envAbnormal"]).campHasFinished(seq), false);

            // vote
            await ioT_temp[1].logTemperature(consensus["envAbnormal"], 60); 
            await ioT_temp[0].logTemperature(consensus["envAbnormal"], 50); 
 
            // 2 voters in total now
            totalVoters = await Custodian.at(consensus["envAbnormal"]).numOfTotalVoterClients();  
            assert.equal(totalVoters, 2);
            
            // after vote 
            assert.equal(await Custodian.at(consensus["envAbnormal"]).campHasFinished(seq), true);
            assert.equal(await ioT_temp[0].queryFinalState(consensus["envAbnormal"]), finalResult.true); 
            assert.equal(await ioT_temp[1].queryFinalState(consensus["envAbnormal"]), finalResult.true);        
        });

        it("All, even non-voter, IoT devices perform action on anomaly case", async function () {
            result = await ioT_temp[0].adjustTemp(consensus["envAbnormal"]);
            assert.equal(result.logs[0].event, "CoolDown");
            result = await ioT_temp[1].adjustTemp(consensus["envAbnormal"]);
            assert.equal(result.logs[0].event, "CoolDown");
            result = await ioT_temp[2].adjustTemp(consensus["envAbnormal"]);
            assert.equal(result.logs[0].event, "CoolDown");
        });

        it("ioT_temp 2 joins and log 30 degree (normal), ioT_temp 0 still logs 45, agreement on anomaly = no agreement", async function () {
            // before vote
            seq = await Custodian.at(consensus["envAbnormal"]).newly_opened_seq();
            assert.equal(await Custodian.at(consensus["envAbnormal"]).campHasFinished(seq), false);

            // vote
            await ioT_temp[2].logTemperature(consensus["envAbnormal"], 30); 
            await ioT_temp[0].logTemperature(consensus["envAbnormal"], 45); 
            
            // 3 voters in total now
            totalVoters = await Custodian.at(consensus["envAbnormal"]).numOfTotalVoterClients();  
            assert.equal(totalVoters, 3);
            
            // after vote 
            assert.equal(await Custodian.at(consensus["envAbnormal"]).campHasFinished(seq), true);
            assert.equal(await ioT_temp[0].queryFinalState(consensus["envAbnormal"]), finalResult.noAgreement); 
        });

        it("ioT_press 0 joins and logs 50 for pressure (normal), ioT_temp 0 logs 45 degree, ioT_temp 1 votes 30 degree, agreement on anomaly = false", async function () {
            // before vote
            seq = await Custodian.at(consensus["envAbnormal"]).newly_opened_seq();
            assert.equal(await Custodian.at(consensus["envAbnormal"]).campHasFinished(seq), false);

            // vote
            await ioT_press[0].logPressure(consensus["envAbnormal"], 50); 
            await ioT_temp[0].logTemperature(consensus["envAbnormal"], 45); 
            await ioT_temp[1].logTemperature(consensus["envAbnormal"], 30); 
            
            // 4 voters in total now
            totalVoters = await Custodian.at(consensus["envAbnormal"]).numOfTotalVoterClients();  
            assert.equal(totalVoters, 4);
            
            // after vote 
            assert.equal(await Custodian.at(consensus["envAbnormal"]).campHasFinished(seq), true);
            assert.equal(await ioT_temp[0].queryFinalState(consensus["envAbnormal"]), finalResult.false); 
        });
    });

});
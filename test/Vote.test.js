const { assertRevert } = require("./helper/assertRevert");
const Custodian = artifacts.require("Custodian");
const Client = artifacts.require("Client");

let custodian;
let client = []; // array of client contracts 
let seq;
let result;

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
            result = await client[0].vote(true); 

            // vote camp finished since reaching > 60% total number of clients 
            assert.equal(result.logs[0].event, "VoteCampFinished");
            assert.equal(result.logs[0].args.seq.valueOf(), seq);
            assert.equal(result.logs[0].args.finalResult.valueOf(), true);
        });
    });
});
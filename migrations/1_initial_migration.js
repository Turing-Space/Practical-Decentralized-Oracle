var Migrations = artifacts.require("./Migrations.sol");
var Custodian = artifacts.require("./Custodian.sol");
var Client = artifacts.require("./Client.sol");
var IoT_temp = artifacts.require("./IoT_temp.sol");
var IoT_press = artifacts.require("./IoT_press.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Custodian);
  deployer.deploy(Client);
  deployer.deploy(IoT_temp);
  deployer.deploy(IoT_press);
};

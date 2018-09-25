/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */
var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "force pistol endless treat spot craft easily panel hurt potato slide explain";

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!


  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    net9001: {
      host: "localhost",
      port: 9001,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: function () {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/lMgQfS5DDh31T0z6iD5E")
      },
      network_id: 3,
      gas: 4612388,
    },

    // https://kovan.infura.io/v3/c0a7585bd72f4617800c7774c6278b28
    kovan: {
      provider: function () {
        return new HDWalletProvider(mnemonic, "https://kovan.infura.io/lMgQfS5DDh31T0z6iD5E")
      },
      network_id: 42,
      gas: 7990000,
    },
  }
};

require("@nomiclabs/hardhat-waffle");
require("dotenv").config();


const GOERLI_URL = process.env.GOERLI_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.4",
  network: {
    // hardhat: {
    //   chainId: 1337
    // },
    goerli: {
      url: GOERLI_URL,
      accounts: [PRIVATE_KEY]
    }
    // mumbai: {
    //   url: "https://rpc-mumbai.matic.today",
    //   accounts: [process.env.pk]
    // },
    // polygon: {
    //   url: "https://polygon-mainnet.infura.io/v3/d295b94a983e4f658580ad8bf8e0e578",
    //   accounts: [process.env.pk]
    // }
  }
};

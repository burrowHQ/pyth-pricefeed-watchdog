const Big = require("big.js");
module.exports = {
  getConfig: (env) => {
    const config = (() => {
      switch (env) {
        case "production":
        case "mainnet":
          return {
            networkId: "mainnet",
            nodeUrl: process.env.NODE_URL || "https://rpc.mainnet.near.org",
            walletUrl: "https://wallet.near.org",
            helperUrl: "https://helper.mainnet.near.org",
            explorerUrl: "https://explorer.mainnet.near.org",
            pythContractId: "pyth-oracle.near",
            accountId: process.env.PUSHER_ACCOUNT_ID,
            // https://www.pyth.network/developers/price-feed-ids#near-mainnet
            centerPriceService: "https://hermes.pyth.network/v2/updates/price/latest?ids[]=",
          };
        case "development":
        case "testnet":
          return {
            networkId: "testnet",
            nodeUrl: process.env.NODE_URL || "https://rpc.testnet.near.org",
            walletUrl: "https://wallet.testnet.near.org",
            helperUrl: "https://helper.testnet.near.org",
            explorerUrl: "https://explorer.testnet.near.org",
            pythContractId: "pyth-oracle.testnet",
            accountId: process.env.PUSHER_ACCOUNT_ID,
            // https://www.pyth.network/developers/price-feed-ids#near-testnet
            centerPriceService: "https://hermes-beta.pyth.network/v2/updates/price/latest?ids[]=",
          };
        default:
          throw Error(
            `Unconfigured environment '${env}'. Can be configured in src/config.js.`
          );
      }
    })();
    config.maxSecondsGap = (process.env.MAX_SECONDS_GAP || 50);
    config.enableUpdate = !!process.env.ENABLE_UPDATE;
    // default to Crypto.NEAR/USD
    config.priceId = (process.env.PRICE_ID || "27e867f0f4f61076456d1a73b14c7edc1cf5cef4f4d6193a33424288f11bd0f4");
   
    return config;
  },
};
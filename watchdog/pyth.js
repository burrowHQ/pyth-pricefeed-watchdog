const nearAPI = require("near-api-js");
const { connect, keyStores, utils } = nearAPI;
const path = require("path");
const os = require("os");
const Big = require("big.js");
const fetch = require('node-fetch');

const { getConfig } = require("./config");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// https://hermes-beta.pyth.network/v2/updates/price/latest?
// ids[]=d6b3bc030a8bbb7dd9de46fb564c34bb7f860dead8985eb16a49cdc62f8ab3a5
// &ids[]=d6b3bc030a8bbb7dd9de46fb564c34bb7f860dead8985eb16a49cdc62f8ab3a5

/*
{
  "binary":{"encoding":"hex","data":["..."]},
  "parsed":[
    {
      "id":"d6b3bc030a8bbb7dd9de46fb564c34bb7f860dead8985eb16a49cdc62f8ab3a5",
      "price":{"price":"12542984632","conf":"6515368","expo":-8,"publish_time":1724935521},
      "ema_price":{"price":"12401423000","conf":"7049081","expo":-8,"publish_time":1724935521},
      "metadata":{"slot":161053938,"proof_available_time":1724935522,"prev_publish_time":1724935521}
    },
    {
      "id":"d6b3bc030a8bbb7dd9de46fb564c34bb7f860dead8985eb16a49cdc62f8ab3a5",
      "price":{"price":"12542984632","conf":"6515368","expo":-8,"publish_time":1724935521},
      "ema_price":{"price":"12401423000","conf":"7049081","expo":-8,"publish_time":1724935521},
      "metadata":{"slot":161053938,"proof_available_time":1724935522,"prev_publish_time":1724935521}
    }
  ]
}
*/

async function updatePriceFeed() {

  const NearConfig = getConfig(process.env.NODE_ENV || "development");
  const keyStore = new nearAPI.keyStores.InMemoryKeyStore();
  const keyPath = path.join(os.homedir(), ".near-credentials", NearConfig.networkId, NearConfig.accountId + ".json");
  // console.log("keyPath: ", keyPath);
  const near = await nearAPI.connect(Object.assign({keyPath, deps: {keyStore}}, NearConfig));
  const account = new nearAPI.Account(near.connection, NearConfig.accountId);
  const contract = new nearAPI.Contract(
    account,
    NearConfig.pythContractId,
    {
      viewMethods: ["get_update_fee_estimate", "get_price_unsafe"],
      changeMethods: ["update_price_feeds"],
    }
  );

  let price_id = NearConfig.priceId;
  let prev_publish_time = 0;

  while (true) {
    const response = await fetch(NearConfig.centerPriceService + price_id, {
      method: "GET",
      headers: {
        "accept": 'application/json'
      },
    });
    let body = await response.json();
    const hex_data = body.binary.data[0];
    const publish_time = body.parsed[0].price.publish_time;
    // console.log("Center publish_time: ", publish_time);
    if (prev_publish_time != 0 && publish_time <= prev_publish_time) {
      console.log(`Warning! Publish time may be freezing. prev_publish:${prev_publish_time}, cur_publish:${publish_time}, gap:${publish_time - prev_publish_time}`);
    }
    prev_publish_time = publish_time;
  
    // view onchain price data
    const on_chain_latest_price = await contract.get_price_unsafe({price_identifier: price_id});
    const on_chain_publish_time = on_chain_latest_price.publish_time;
    const gap = publish_time - on_chain_publish_time
    console.log(`publish_time [Center, Onchain]: [${publish_time}, ${on_chain_publish_time}], gap: ${gap}`);

    // compare publish time
    if (publish_time > on_chain_publish_time && gap > NearConfig.maxSecondsGap) {
      // need update
      console.log(`Need update, ${gap} seconds ahead`);
      if (NearConfig.enableUpdate) {
        // const result = await contract.update_price_feeds({data: hex_data}, Big(10).pow(12).mul(300).toFixed(0), Big(10).pow(22).mul(2).toFixed(0));
        const result = await contract.update_price_feeds({
          args: {data: hex_data}, 
          gas: Big(10).pow(12).mul(300).toFixed(0), 
          amount: Big(10).pow(22).mul(2).toFixed(0)
        });
        console.log("Update Price Feeds Result: ", result);
      }
      
    }
    // evaluate fee
    // const fee_estimate = await contract.get_update_fee_estimate({data: hex_data});
    // 0.019_200_000_000_000_000_000_001 NEAR < 0.02 NEAR = Big(10).pow(22).mul(2).toFixed(0)
    // console.log("get_update_fee_estimate Result: ", fee_estimate);
    
    await sleep(20000);
  }
}

updatePriceFeed()

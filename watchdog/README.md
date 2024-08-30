# watchdog
Pyth price pusher watchdog

## Prepare
In order to run the job, you need install dependency lib first:
- `npm install`

## Run Locally
```
PRICE_ID=27e867f0f4f61076456d1a73b14c7edc1cf5cef4f4d6193a33424288f11bd0f4 \
ENABLE_UPDATE=true PUSHER_ACCOUNT_ID=alice.testnet \
node pyth.js

PRICE_ID=27e867f0f4f61076456d1a73b14c7edc1cf5cef4f4d6193a33424288f11bd0f4 \
NODE_ENV=testnet \
ENABLE_UPDATE=true PUSHER_ACCOUNT_ID=alice.testnet \
node pyth.js
```

## Run in Production Mode
```
PRICE_ID=27e867f0f4f61076456d1a73b14c7edc1cf5cef4f4d6193a33424288f11bd0f4 ENABLE_UPDATE=true PUSHER_ACCOUNT_ID=alice.testnet npx pm2 start pyth.js --log pyth_w_near.log --name pyth_w_near --log-date-format "YYYY-MM-DD HH:mm:ss"

NODE_ENV=testnet \
PRICE_ID=27e867f0f4f61076456d1a73b14c7edc1cf5cef4f4d6193a33424288f11bd0f4 \
ENABLE_UPDATE=true PUSHER_ACCOUNT_ID=alice.testnet \
npx pm2 start pyth.js \
--log pyth_w_near.log --name pyth_w_near --log-date-format "YYYY-MM-DD HH:mm:ss"
```
- `npx pm2 stop [id]`
- `npx pm2 ls`

## Manage PM2
```bash
npx pm2 ls
npx pm2 del xxx
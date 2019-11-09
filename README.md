# wallet-notify
Set of tools to create and process wallet notifications

![npm](https://img.shields.io/npm/v/wallet-notify)

```
yarn add wallet-notify
```

## Notification format
```js
{
  text: "Hello, I'm a wallet notification!", // <-- required
  thumbnailUrl: "https://me.com/my-logo.gif",
}

// OR

{
  text: "Hello, I'm a wallet notification. Click to go to my website.", // <-- required
  thumbnailUrl: "https://me.com/my-logo.gif",
  actionUrl: "https://me.com/do-that-thing"
}

// OR

{
  text: 'Hello, I’m a wallet notification. Click to buy crypto kitty', // <-- required
  thumbnailUrl: "https://me.com/my-logo.gif",
  actionTx: {
    to: '0x...', // <-- required
    amount: 0,
    data: '0xdeadbeef'
  }
}
```

## Send notification
```js
import WalletNotify from 'wallet-notify'

const notification = {
  text: 'Hello World',
  thumbnailUrl: 'https://www.publicdomainpictures.net/pictures/200000/velka/unicorn-icon.jpg',
  actionUrl: 'https://ethwaterloo.com'
}

const tx = await WalletNotify.send({
  notification
  to: addressOrAddressArray,
  web3: web3,
  gasPrice: gasPrice,
  gasLimit: gasLimit,
})

// OR

const data = WalletNotify.encode(notification)
const tx = await provider.transactionSend({
  ...,
  data
})

```

## Receive notification
```js
import WalletNotify from 'wallet-notify'

// ... listen to incoming transactions

const notification = WalletNotify.decode(tx)
if (notification) {
  // render as a notification
}
// render as a transaction
```

# wallet-notify
Set of tools to create and process wallet notifications

![npm](https://img.shields.io/npm/v/wallet-notify)

```
yarn add wallet-notify
```

# Send notification
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
  provider: web3provider
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

# Receive notification
```js
import WalletNotify from 'wallet-notify'

// ... listen to incoming transactions

const notification = WalletNotify.decode(tx)
if (notification) {
  // render as a notification
}
// render as a transaction
```

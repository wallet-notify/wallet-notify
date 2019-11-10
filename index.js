const Ethers = require('ethers')
const EthCrypto = require('eth-crypto')

/**
 * Encrypts notification to be used as transaction data.
 */
async function encrypt({ to, notification, web3 }) {
  // Validate
  _assertNotificationValid(notification)

  // 1. Encrypt
  const publicKey = await getPublicKey({ address: to, web3 })
  const cipher = EthCrypto.encryptWithPublicKey(
    publicKey,
    JSON.stringify(notification),
  )

  // 2. Convert to hex
  const data = ethers.utils.toUtf8Bytes('!!' + EthCrypto.cipher.stringify(encrypted))

  return data
}


/**
 * Decrypt notification from transaction data.
 */
function decrypt({ data, privateKey}) {
  // Validate
  const dataString = ethers.utils.toUtf8String(data)
  if (!/^!!/.match(dataString)) {
    return null
  }

  // 1. Convert to cipher
  const cipher = EthCrypto.cipher.parse(dataString.slice(2))

  // 2. Decrypt
  const notification = EthCrypto.decryptWithPrivateKey(
    privateKey,
    cipher
  )

  return notification
}


/**
 * Sends notification transaction to a specified recipient or a list of recipients.
 */
async function send({ to, notification, web3, gasPrice, gasLimit }) {

  if (Array.isArray(to) && to.length > 1) {
    return _batchSend({ to, notification, web3, gasPrice, gasLimit })
  } else if (Array.isArray(to) && to.length == 1) {
    to = to[0]
  } else if (Array.isArray(to)) {
    throw new Error('Invalid call - "to" can’t be an empty array')
  }

  const data = await encrypt({ to, notification, web3 })
  const tx = await web3.eth.sendTransaction({
    gasLimit,
    gasPrice,
    to,
    data,
  })

  return tx
}

/////////////
// HELPERS //
/////////////

let memoizedPublicKeysMap = null

/**
 * Returns public key from an address.
 * Note: Requires to make a signature with web3.
 * @private
 */
async function _getPublicKey({ address, web3 }) {

  if (memoizedPublicKeysMap[address]) {
    return memoizedPublicKeysMap[address]
  }

  const message = '0xNotImportant'

  const signature = await new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      method: 'personal_sign',
      params: [message, address],
      from: address,
    }, (err, response) => {
      if(err) return reject(err);
      resolve(response.result);
    })
  })

  const publicKey = EthCrypto.recoverPublicKey(
    signature,
    web3.eth.accounts.hashMessage(message)
  )

  memoizedPublicKeysMap[address] = publicKey

  return publicKey
}

/**
 * Sends notification transaction.
 * @private
 */
function _batchSend() {
  throw new Error('Batch send is not implemented')
}

/**
 * Validates notification format.
 * @private
 */
function _assertNotificationValid(notification) {
  if (!notification.text || !notification.t) {
    throw new Error('Invalid Notification - required text field is missing')
  }
}



module.exports = {
  send,
  encrypt,
  decrypt
}

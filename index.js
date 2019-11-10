const Ethers = require('ethers')
const EthCrypto = require('eth-crypto')
const promisify = require('js-promisify')

/**
 * Encrypts notification to be used as transaction data.
 */
async function encrypt({ to, notification, web3 }) {
  // Validate
  _assertNotificationValid(notification)

  // 1. Encrypt
  const publicKey = await _getPublicKey({ address: to, web3 })
  const cipher = await EthCrypto.encryptWithPublicKey(
    publicKey,
    JSON.stringify(notification),
  )

  // 2. Convert to hex
  const data = Ethers.utils.toUtf8Bytes('!!' + EthCrypto.cipher.stringify(cipher))

  return data
}


/**
 * Decrypt notification from transaction data.
 */
function decrypt({ data, privateKey}) {
  // Validate
  const dataString = Ethers.utils.toUtf8String(data)
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
  // Validate
  _assertNotificationValid(notification)

  if (Array.isArray(to) && to.length > 1) {
    return _batchSend({ to, notification, web3, gasPrice, gasLimit })
  } else if (Array.isArray(to) && to.length == 1) {
    to = to[0]
  } else if (Array.isArray(to)) {
    throw new Error('Invalid call - "to" can’t be an empty array')
  }

  // Encrypt & send
  const data = await encrypt({ to, notification, web3 })
  const tx = await promisify(web3.eth.sendTransaction, [{
    from: web3.eth.accounts[0],
    gasLimit,
    gasPrice,
    to,
    data,
  }])

  return tx
}

/////////////
// HELPERS //
/////////////

let memoizedPublicKeysMap = {}

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

  const hashMessage = web3.sha3(
    web3.toHex('\x19Ethereum Signed Message:\n' + message.length + message)
  )
  const publicKey = EthCrypto.recoverPublicKey(signature, hashMessage)

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
  if (!notification.text && !notification.t) {
    throw new Error('Invalid Notification - required text field is missing')
  }

  if (
    (notification.thumbnailUrl && !_validUrl(notification.thumbnailUrl))
    ||
    (notification.tu && !_validUrl(notification.tu))
  ) {
    throw new Error('Invalid Notification - thumbnailUrl is not a valid URL')
  }

  if (
    (notification.actionUrl && !_validUrl(notification.actionUrl))
    ||
    (notification.au && !_validUrl(notification.au))
  ) {
    throw new Error('Invalid Notification - actionUrl is not a valid URL')
  }
}

function _validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}



module.exports = {
  send,
  encrypt,
  decrypt
}

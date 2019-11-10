const Web3 = require('web3')

const WalletNotify = require('./index')

const SIMPLE_TEXT_NOTIFICATION = {
  text: 'Test'
}

const web3mock = {
  sinon.stub

test('returns encrypted notification transaction data', async () => {

  console.log({ Web3 })

  const data = await WalletNotify.encrypt({
    to,
    notification: SIMPLE_TEXT_NOTIFICATION,
    web3
  })

  const output = WalletNotify.decrypt(data)
  expect(data).toBe(3)
});

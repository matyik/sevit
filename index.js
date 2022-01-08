import express from 'express'
import Web3 from 'web3'
const web3 = new Web3(
  Web3.givenProvider ||
    'https://eth-mainnet.alchemyapi.io/v2/U3mc_zqiTxo1w0KKpTgWsKfyEh1XO7aK'
)
const app = express()

const PORT = process.env.PORT || 5000
app.listen(PORT)

app.use(express.json())

app.post(`/contract/:contractAddress/:method`, async (req, res) => {
  const ABI = req.body
  const { contractAddress, method } = req.params
  try {
    const contract = new web3.eth.Contract(ABI, contractAddress)
    const result = await contract.methods[method](
      ...Object.values(req.query)
    ).call()
    res.json({ result })
  } catch (err) {
    if (err.message === 'contract.methods[method] is not a function') {
      return res.status(400).json({ error: 'Method not found' })
    }
    res.status(500).json({ error: err.message })
  }
})

app.get('/balance/:address', async (req, res) => {
  const { address } = req.params
  try {
    const balance = await web3.eth.getBalance(address)
    res.json({ balance })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/ens/:name', async (req, res) => {
  const { name } = req.params
  try {
    const address = await web3.eth.ens.getAddress(name)
    res.json({ address })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/gasprice', async (req, res) => {
  try {
    const gasPrice = await web3.eth.getGasPrice()
    res.json({ gasPrice })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/transaction/:transactionHash', async (req, res) => {
  const { transactionHash } = req.params
  try {
    const transaction = await web3.eth.getTransaction(transactionHash)
    res.json({ transaction })
  } catch (error) {
    if (
      error.message.indexOf(
        'Returned error: invalid argument 0: hex string has length'
      ) !== -1 ||
      error.message ===
        'Returned error: invalid argument 0: json: cannot unmarshal hex string of odd length into Go value of type common.Hash'
    ) {
      return res.status(400).json({ error: 'Invalid transaction hash' })
    }
    res.status(500).json({ error: error.message })
  }
})

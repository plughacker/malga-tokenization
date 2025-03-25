import express from 'express'
import bodyParser from 'body-parser'

const server = express()
const port = 3000

server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))

server.post('/checkout', async (req, res) => {
  try {
    res.json({ data: JSON.stringify(req.body, null, 2) })
  } catch (error) {
    res.json({ status: 'failed', error })
  }
})

server.listen(port, () => {
  console.log(`server running into port ${port}`)
})

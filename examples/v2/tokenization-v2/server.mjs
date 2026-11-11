import { createServer } from 'node:http'

// Sandbox: https://sandbox-api.malga.io | Production: https://api.malga.io
const MALGA_API_URL =
  process.env.MALGA_API_URL ?? 'https://sandbox-api.malga.io'
const { MALGA_CLIENT_ID, MALGA_SECRET_KEY } = process.env
const PORT = Number(process.env.PORT ?? 3001)

if (!MALGA_CLIENT_ID || !MALGA_SECRET_KEY) {
  console.error(
    'Set MALGA_CLIENT_ID and MALGA_SECRET_KEY before starting the server.',
  )
  process.exit(1)
}

async function createTokensSubKey() {
  const response = await fetch(`${MALGA_API_URL}/v1/auth`, {
    method: 'POST',
    headers: {
      'X-Client-Id': MALGA_CLIENT_ID,
      'X-Api-Key': MALGA_SECRET_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ scope: ['tokens'], expires: 900 }),
  })

  if (!response.ok) {
    throw new Error(`POST /v1/auth responded with ${response.status}`)
  }

  const { publicKey, clientId } = await response.json()
  return { publicKey, clientId }
}

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(body))
}

// In production, create sub-keys only for a valid purchase session and rate limit this route
const server = createServer(async (request, response) => {
  if (request.method !== 'POST' || request.url !== '/checkout/malga-key') {
    return sendJson(response, 404, { error: 'Not found' })
  }

  try {
    sendJson(response, 200, await createTokensSubKey())
  } catch (error) {
    console.error(error)
    sendJson(response, 502, { error: 'Could not start the payment' })
  }
})

server.listen(PORT, () => {
  console.log(`Sub-key server running on http://localhost:${PORT}`)
})

import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('https://sandbox-api.malga.io/v1/tokens', () => {
    return HttpResponse.json({ tokenId: 'sandbox-token-id' })
  }),
  http.post('https://api.malga.io/v1/tokens', async ({ request }) => {
    const apiKey = request.headers.get('X-Api-Key')
    const clientId = request.headers.get('X-Client-Id')

    if (!apiKey && !clientId) {
      return new HttpResponse({ message: 'Forbidden' } as any, { status: 403 })
    }

    return HttpResponse.json({ tokenId: 'production-token-id' })
  }),
]

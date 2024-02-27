import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('https://sandbox-api.malga.io/v1/tokens', () => {
    return HttpResponse.json({ tokenId: 'sandbox-token-id' })
  }),
  http.post('https://api.malga.io/v1/tokens', async ({ request }) => {
    const apiKey = request.headers.get('X-Api-Key')
    const clientId = request.headers.get('X-Client-Id')

    const data = await request.formData()

    const cardHolderName = data.get('cardHolderName')
    const cardNumber = data.get('cardNumber')
    const cardExpirationDate = data.get('cardExpirationDate')
    const cardCvv = data.get('cardCvv')

    if (!cardHolderName || !cardNumber || !cardExpirationDate || !cardCvv) {
      return new HttpResponse({ message: 'Forbidden' } as any, { status: 403 })
    }

    if (!apiKey && !clientId) {
      return new HttpResponse({ message: 'Forbidden' } as any, { status: 403 })
    }

    return HttpResponse.json({ tokenId: 'production-token-id' })
  }),
]

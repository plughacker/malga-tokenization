import { http, HttpResponse, PathParams } from 'msw'

export type malgaRequestBody = {
  cardHolderName: string
  cardNumber: string
  cardExpirationDate: string
  cardCvv: string
}
export const handlers = [
  http.post('https://sandbox-api.malga.io/v1/tokens', () => {
    return HttpResponse.json({ tokenId: 'sandbox-token-id' })
  }),
  http.post<PathParams, malgaRequestBody>(
    'https://api.malga.io/v1/tokens',
    async ({ request }) => {
      const apiKey = request.headers.get('X-Api-Key')
      const clientId = request.headers.get('X-Client-Id')

      const data = await request.json()

      const cardHolderName = data.cardHolderName
      const cardNumber = data.cardNumber
      const cardExpirationDate = data.cardExpirationDate
      const cardCvv = data.cardCvv

      if (!cardHolderName || !cardNumber || !cardExpirationDate || !cardCvv) {
        return new HttpResponse({ message: 'invalid card number' } as any, {
          status: 400,
        })
      }

      if (!apiKey && !clientId) {
        return new HttpResponse({ message: 'Forbidden' } as any, {
          status: 403,
        })
      }

      return HttpResponse.json({ tokenId: 'production-token-id' })
    },
  ),
]

import { Malga } from './malga'

describe('Malga', () => {
  test('should make the request to the production domain', async () => {
    const malga = new Malga({ apiKey: 'API_KEY', clientId: 'CLIENT_ID' })
    const response = await malga.tokenization({
      holderName: 'Alan Turing',
      number: '5309459504335006',
      cvv: '951',
      expirationDate: '05/2030',
    })

    expect(response).toMatchObject({ tokenId: 'production-token-id' })
  })

  test('should make the request to the sandbox domain', async () => {
    const malga = new Malga({
      apiKey: 'API_KEY',
      clientId: 'CLIENT_ID',
      options: { sandbox: true },
    })
    const response = await malga.tokenization({
      holderName: 'Alan Turing',
      number: '5309459504335006',
      cvv: '951',
      expirationDate: '05/2030',
    })
    console.log('response: ', response)
    expect(response).toMatchObject({ tokenId: 'sandbox-token-id' })
  })

  test('should handle a request failure', async () => {
    const malga = new Malga({
      apiKey: '',
      clientId: '',
    })

    try {
      await malga.tokenization({
        holderName: 'Alan Turing',
        number: '5309459504335006',
        cvv: '951',
        expirationDate: '05/2030',
      })
    } catch (error) {
      expect(error).toMatchObject({
        error: {
          code: 403,
          message: 'forbidden',
          type: 'invalid_request_error',
        },
      })
    }
  })
})

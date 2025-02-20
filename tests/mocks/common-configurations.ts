export const configurations = {
  clientId: 'test-client-id',
  apiKey: 'test-api-key',
  options: {
    config: {
      fields: {
        cardNumber: {
          container: '#card-number',
        },
        cardHolderName: {
          container: '#card-holder-name',
        },
        cardExpirationDate: {
          container: '#card-expiration-date',
        },
        cardCvv: {
          container: '#card-cvv',
        },
      },
    },
    sandbox: true,
  },
}

export function createEventMock(type: string, origin?: string) {
  const event = {
    origin: origin ?? 'https://develop.d3krxmg1839vaa.amplifyapp.com',
    data: {
      type: type,
      data: {
        fieldType: 'card-number',
      },
    },
  }

  return event
}

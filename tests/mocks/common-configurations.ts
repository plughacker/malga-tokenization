import type { MalgaConfigurations } from 'src/interfaces'

export const configurationsSDK: MalgaConfigurations = {
  clientId: 'test-client-id',
  apiKey: 'test-api-key',
  options: {
    config: {
      fields: {
        cardNumber: {
          container: 'card-number',
          placeholder: '9999 9999 9999 9999',
          type: 'text',
        },
        cardHolderName: {
          container: 'card-holder-name',
          placeholder: 'Its a test',
          type: 'text',
        },
        cardExpirationDate: {
          container: 'card-expiration-date',
          placeholder: 'MM/YY',
          type: 'text',
        },
        cardCvv: {
          container: 'card-cvv',
          placeholder: '999',
          type: 'text',
        },
      },
    },
  },
}

export const configurationWithSubmitData = {
  eventType: 'submit',
  data: {
    authorizationData: {
      clientId: 'test-client-id',
      apiKey: 'test-api-key',
    },
  },
}

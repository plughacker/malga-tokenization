import { MalgaTokenization } from './tokenization'

describe('Constructor', () => {
  test('should be possible for MalgaTokenizationObject to be an instance of the MalgaTokenization class', () => {
    const MalgaConfigurations = {
      apiKey: '44829c89-ae91-4271-b347-5024a06a3fc3',
      clientId: 'af1f76f7-b461-430e-abac-4f1b010a1629',
      options: {
        sandbox: true,
      },
    }
    const MalgaTokenizationObject = new MalgaTokenization(MalgaConfigurations)

    expect(MalgaTokenizationObject).toBeInstanceOf(MalgaTokenization)
  })
})

describe('init', () => {
  test('ajsjns', () => {})
})

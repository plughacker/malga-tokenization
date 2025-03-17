<div align="center">
  <picture>
    <img alt="Malga" src="docs/assets/malga.png" width="85" />
  </picture>
  <h1>Malga Tokenization SDK</h1>
</div>

![Tests](https://github.com/plughacker/malga-tokenization/actions/workflows/tests.yml/badge.svg)

Simple way to tokenize cards with Malga

## Getting Started

First of all, you'll need to install our SDK into your project:

```bash
yarn add @malga/tokenization
# or
npm install @malga/tokenization
# or
pnpm add @malga/tokenization
```

1. Add the identification keys for each field involving card data in your form

```html
<form onSubmit="{handleGetTokenId}">
  <section>
    <div className="form-group">
      <label htmlFor="card-number">Card Number</label>
      <div id="card-number" className="form-control"></div>
    </div>
    <div className="form-group">
      <label htmlFor="card-holder-name">Card Holder Name</label>
      <div id="card-holder-name" className="form-control"></div>
    </div>
    <div className="form-group">
      <label htmlFor="card-cvv">Card CVV</label>
      <div id="card-cvv" className="form-control"></div>
    </div>
    <div className="form-group">
      <label htmlFor="card-expiration-date">Card Expiration Date</label>
      <div id="card-expiration-date" className="form-control"></div>
    </div>
  </section>
  <button type="submit">Submit</button>
</form>
```

2. Now all you need to do is configure our SDK with your keys and call the tokenize method in your function handling the form submit

```ts
import { MalgaTokenization } from '@malga/tokenization'

const malgaTokenization = new MalgaTokenization({
  apiKey: '<YOUR_API_KEY>',
  clientId: '<YOUR_CLIENT_ID>',
  options: {
    config: {
      fields: {
        cardNumber: {
          container: 'card-number',
          placeholder: '9999 9999 9999 9999',
        },
        cardHolderName: {
          container: 'card-holder-name',
          placeholder: 'Its a test',
        },
        cardExpirationDate: {
          container: 'card-expiration-date',
          placeholder: 'MM/YY',
        },
        cardCvv: {
          container: 'card-cvv',
          placeholder: '999',
        },
      },
      styles: {
        input: {
          color: '#000',
          'font-size': '16px',
        },
      },
      preventAutofill: false,
    },
    sandbox: true,
  },
})

// You can use others events like:
malgaTokenization.on('cardTypeChanged', (event) => {
  console.log('cardTypeChanged', event)
})

malgaTokenization.on('validity', (event) => {
  console.log('validation', event)
})

malgaTokenization.on('blur', (event) => {
  console.log('blur', event)
})

malgaTokenization.on('focus', (event) => {
  console.log('blur', event)
})

async function handleSubmit(event) {
  event.preventDefault()

  const { tokenId } = await malgaTokenization.tokenize()
  console.log({ tokenId })

  // Now you just need to send the tokenId along with
  // the rest of the transaction data to your API
}
```

3. Submit the form and see the magic happen 💳

For more details on the implementation, you can access our documentation by [clicking here](https://docs.malga.io/docs/sdks/tokenization/intro).

## Examples

If you have any doubts about the integration, you can [click here](https://github.com/plughacker/malga-tokenization/tree/main/examples) to see some examples

## Contributing

Feel free to contribute to this project by submitting pull requests, creating documentation, or bringing ideas to make the project even better!

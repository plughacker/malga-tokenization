<div align="center">
  <picture>
    <img alt="Malga" src="docs/assets/malga.png" width="85" />
  </picture>
  <h1>Malga Tokenization SDK</h1>
</div>

![Release](https://github.com/plughacker/malga-tokenization/actions/workflows/release.yml/badge.svg)
![Tests](https://github.com/plughacker/malga-tokenization/actions/workflows/tests.yml/badge.svg)

Simple way to tokenize cards with Malga

## Getting Started

There are two ways to use Malga Tokenization that will depend on how your application is structured,
basically, it depends on whether you will handle the form submit on the client-side or on the server-side.
For more details on the implementation, you can access our documentation by [clicking here](https://docs.malga.io/docs/sdks/tokenization/intro).

First of all, you'll need to install our SDK into your project:

```bash
yarn add @malga/tokenization
# or
npm install @malga/tokenization
# or
pnpm add @malga/tokenization
```

### Sync Tokenization

To handle the form on the client-side, you'll need to:

1. Add the identification keys for each field involving card data in your form

```html
<form data-malga-tokenization-form>
  <input
    data-malga-tokenization-holder-name
    name="holderName"
    type="text"
    placeholder="Card Holder Name"
  />
  <input
    data-malga-tokenization-number
    name="number"
    type="number"
    placeholder="Card Number"
  />
  <input
    data-malga-tokenization-expiration-date
    name="expirationDate"
    type="text"
    placeholder="Card Expiration Date"
  />
  <input
    data-malga-tokenization-cvv
    name="cvv"
    type="number"
    placeholder="Card CVV"
  />
  <button type="submit">Submit</button>
</form>
```

2. Now all you need to do is configure our SDK with your keys and call the tokenize method in your function handling the form submit

```ts
import { MalgaTokenization } from '@malga/tokenization'

const malgaTokenization = new MalgaTokenization({
  apiKey: '<YOUR_API_KEY>',
  clientId: '<YOUR_CLIENT_ID>',
  options: { sandbox: true },
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

### Form Handling Tokenization

To handle the form on the server-side, you'll need to:

1. Call the `init()` method in your main JS/TS file, the entrypoint of your application. This way, when the form is submitted, tokenization will occur automatically

```js
import { MalgaTokenization } from '@malga/tokenization'

const malgaTokenization = new MalgaTokenization({
  apiKey: '<YOUR_API_KEY>',
  clientId: '<YOUR_CLIENT_ID>',
  options: { sandbox: true },
})

malgaTokenization.init()
```

2. Add the identification keys for each field involving card data in your form

```html
<form data-malga-tokenization-form method="POST" action="/checkout">
  <input
    data-malga-tokenization-holder-name
    name="holderName"
    type="text"
    placeholder="Card Holder Name"
  />
  <input
    data-malga-tokenization-number
    name="number"
    type="number"
    placeholder="Card Number"
  />
  <input
    data-malga-tokenization-expiration-date
    name="expirationDate"
    type="text"
    placeholder="Card Expiration Date"
  />
  <input
    data-malga-tokenization-cvv
    name="cvv"
    type="number"
    placeholder="Card CVV"
  />
  <button type="submit">Submit</button>
</form>
```

3. Submit the form and see the magic happen. You will notice that only the card's `tokenId` will reach your server 💳

## Examples

If you have any doubts about the integration, you can [click here]('https://github.com/plughacker/malga-tokenization/tree/main/examples') to see some examples

## Contributing

Feel free to contribute to this project by submitting pull requests, creating documentation, or bringing ideas to make the project even better!

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

### Authentication

The SDK runs in the browser, so the `apiKey` you pass to it is visible to anyone who opens your checkout page. Never use your account's secret key there.

1. In your backend, create a [sub-key](https://docs.malga.io/api-reference/client-token/criar-nova-chave-publica-para-uso-no-client-side) for each checkout session with `POST /v1/auth`, using only the `tokens` scope and a short expiration (`expires` is in seconds):

```bash
curl --request POST 'https://api.malga.io/v1/auth' \
  --header 'X-Client-Id: YOUR_CLIENT_ID' \
  --header 'X-Api-Key: YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{ "scope": ["tokens"], "expires": 900 }'
```

2. Return only the `publicKey` (and your `clientId`) to the front-end. The secret key stays on your server.
3. In the front-end, fetch that sub-key and only then create the `MalgaTokenization` instance, passing the `publicKey` as `apiKey`.

Good practices:

- Use only the `tokens` scope. The SDK doesn't need anything else.
- Use a short expiration (for example, `900`) and a new sub-key for each checkout session. Don't use `expires: 0` in the front-end: a sub-key without expiration stays valid indefinitely.
- Don't hardcode the key in your HTML, in front-end config files or in build-time variables that end up in the bundle.
- Protect the backend route that creates sub-keys: create them only for a valid purchase session in your system and rate limit that route.
- After `expires`, the API rejects the sub-key with `403`. With a string `apiKey`, call `destroy()`, fetch a new sub-key and create a new instance. To renew it without recreating the fields, pass a function as `apiKey` (see [Fetching the API key on demand](#fetching-the-api-key-on-demand)).

Use `https://sandbox-api.malga.io` with your sandbox credentials while testing, together with `sandbox: true`.

### Usage

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

2. Now fetch the sub-key from your backend, configure our SDK with it and call the tokenize method in your function handling the form submit

```ts
import { MalgaTokenization } from '@malga/tokenization'

// Sub-key with scope ["tokens"] and a short expiration, created by your backend for this checkout session
const { publicKey, clientId } = await fetch('/checkout/malga-key', {
  method: 'POST',
}).then((response) => response.json())

const malgaTokenization = new MalgaTokenization({
  apiKey: publicKey,
  clientId,
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
        // With this object, it's possible to change the styles of input components
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

malgaTokenization.on('loading', ({ isLoading }) => {
  submitButton.disabled = isLoading
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

For more details on the implementation, you can access our documentation by [clicking here](https://docs.malga.io/sdks/tokenization/v2/intro).

### Loading and timeout

`loading` is `true` when a `tokenize()` starts and `false` when it finishes. If the card number iframe does not answer within 30 seconds, `tokenize()` resolves with `{ tokenId: '', error: { type: 'timeout', code: 0, message } }` and `loading` goes back to `false`.

### Fetching the API key on demand

`apiKey` also accepts a function that returns the key, sync or async. The SDK calls it on every `tokenize()`, right before sending the card data, so you can create a short-lived sub-key in your backend only when the customer submits the form. If the sub-key expires, the function can return a new one on the next `tokenize()`, without recreating the fields or losing the typed card.

```ts
const malgaTokenization = new MalgaTokenization({
  apiKey: async () => {
    // Your backend route returns the publicKey of a sub-key created with POST /v1/auth
    const response = await fetch('/checkout/malga-key', { method: 'POST' })
    const { publicKey } = await response.json()
    return publicKey
  },
  clientId: '<YOUR_CLIENT_ID>',
  options,
})
```

- `loading` is `true` while the function runs.
- If the function throws or returns an empty value, `tokenize()` resolves without sending the card, with `{ tokenId: '', error: { type: 'invalid_request_error', code: 0, message: 'Could not get the API key: ...' } }`. The message doesn't include the error thrown by your function, so details of your backend don't reach the customer. With `debug: true`, that error is logged in the console.
- If the function doesn't answer within 30 seconds, `tokenize()` resolves with `error.type: 'timeout'`. A key returned after that is ignored.
- The 30 seconds of the function and the 30 seconds of the card number iframe are counted separately, so in the worst case `tokenize()` takes up to 60 seconds to resolve.
- Once the key arrives, the SDK checks the card fields again. If one was cleared in the meantime, it resolves with the missing card data error and sends nothing.
- If the instance is destroyed, or its card fields are replaced by another instance, while the function runs, the card is not sent. When the function returns a key, `tokenize()` rejects; when it fails or times out, `tokenize()` resolves with the errors above.
- The function is called on every `tokenize()`. To keep one sub-key per checkout session, as recommended in the [authentication docs](https://docs.malga.io/sdks/tokenization/v2/authentication), cache it in your function (or return the same sub-key from your backend route while it is valid) and fetch a new one before its `expires` time is over. An expired sub-key is rejected by the API with `403`.

### Missing card data

Before sending anything, `tokenize()` checks that every field configured in `config.fields` has a value. If any is empty, it resolves right away, without a request and without `loading`, with `{ tokenId: '', error: { type: 'invalid_request_error', code: 0, message, details } }`, where `details` lists the missing fields (`['cardCvv', 'cardExpirationDate']`). Fields you didn't configure are not required.

### Containers and more than one card

- A `container` can be any element `id` (`card-number`, `numero`, `card.number`...). The collected data is keyed by the field (`cardNumber`, `cardCvv`...), never by the container name.
- To render two or more cards on the same page, create one `MalgaTokenization` per card, each one with its own containers. A container `id` must never repeat on the page.
- Each instance keeps its collected card in `sessionStorage` under `malga-card-<cardNumber container>` (it was `malga-card` before). Only relevant if you read that key directly.
- Two live instances can't share a container, and one instance can't use the same container for two fields. The constructor throws before rendering anything, naming the container: `ContainerInUseError` or `DuplicatedContainerError`. Call `destroy()` on the old instance first.

### Destroying an instance

`destroy()` undoes everything the constructor set up: it removes the iframes from the containers (and the classes the SDK added to them), stops waiting for containers that aren't in the DOM yet, removes the message listener and the `on()` handlers, clears the collected card from `sessionStorage` and frees the containers for a new instance. After it, `tokenize()` throws. Calling it more than once is safe.

Call it whenever the checkout unmounts. Without it, mounting the screen again throws `ContainerInUseError`, because the old instance still holds the containers.

> **Upgrading to 5.0.0:** in 4.x, creating a new instance on the same containers without cleanup silently stacked a second set of iframes and kept the old listener alive. Now the constructor throws `ContainerInUseError`. If your screen can mount more than once (React `useEffect` without a cleanup, `StrictMode`, navigating back to the route), call `destroy()` when it unmounts, as below.

```js
// React
useEffect(() => {
  const malgaTokenization = new MalgaTokenization({ apiKey, clientId, options })

  return () => malgaTokenization.destroy()
}, [])
```

## Examples

If you have any doubts about the integration, you can [click here](https://github.com/plughacker/malga-tokenization/tree/main/examples) to see some examples. The [v2 example](https://github.com/plughacker/malga-tokenization/tree/main/examples/v2/tokenization-v2) includes a backend route that creates the sub-key.

## Contributing

Feel free to contribute to this project by submitting pull requests, creating documentation, or bringing ideas to make the project even better!

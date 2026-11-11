import { MalgaTokenization } from '@malga/tokenization'
import { useEffect, useRef } from 'react'

const malgaTokenization = new MalgaTokenization({
  /**
   * Use a sub-key created by your backend, never your secret key.
   * - Create it with POST /v1/auth using only the ["tokens"] scope.
   * - Use a short expiration (e.g. expires: 900) and one sub-key per checkout session.
   * - Don't use expires: 0 and don't hardcode the key in your HTML or front-end bundle.
   * Reference: https://docs.malga.io/api-reference/client-token/criar-nova-chave-publica-para-uso-no-client-side
   * Example with a backend creating the sub-key: examples/v2/tokenization-v2
   */
  apiKey: '<YOUR_PUBLIC_KEY>',
  clientId: '<YOUR_CLIENT_ID>',
  options: { sandbox: true },
})

export function App() {
  const isRendered = useRef(false)

  useEffect(() => {
    if (isRendered.current) {
      malgaTokenization.init()
    }

    isRendered.current = true
  }, [])

  return (
    <main>
      <form
        action="http://localhost:3000/checkout"
        method="POST"
        data-malga-tokenization-form
      >
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
    </main>
  )
}

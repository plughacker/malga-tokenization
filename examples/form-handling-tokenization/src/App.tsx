import { MalgaTokenization } from '@malga/tokenization'
import { useEffect, useRef } from 'react'

const malgaTokenization = new MalgaTokenization({
  apiKey: '<YOUR_API_KEY>',
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

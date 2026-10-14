import { useState, type FormEvent } from 'react'
import './App.css'
import { MalgaTokenization } from '@malga/tokenization'

const malgaTokenization = new MalgaTokenization({
  apiKey: 'API_KEY',
  clientId: 'CLIENT_ID',
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

export default function App() {
  const [tokenId, setTokenId] = useState('')

  async function handleGetTokenId(event: FormEvent<HTMLFormElement>) {
    const { tokenId, error } = await malgaTokenization.tokenize()

    if (!!error) {
      console.log(error)
    }

    setTokenId(tokenId)
  }

  return (
    <main>
      <form onSubmit={handleGetTokenId}>
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
      {tokenId}
    </main>
  )
}

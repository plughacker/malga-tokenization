import { useEffect, useRef, useState, type FormEvent } from 'react'
import './App.css'
import { MalgaTokenization } from '@malga/tokenization'

interface MalgaKey {
  publicKey: string
  clientId: string
}

// The sub-key comes from the backend (server.mjs): tokens scope, short expiration, one per checkout session
async function fetchMalgaKey(): Promise<MalgaKey> {
  const response = await fetch('/checkout/malga-key', { method: 'POST' })

  if (!response.ok) {
    throw new Error('Could not fetch the sub-key')
  }

  return response.json()
}

function createMalgaTokenization({ publicKey, clientId }: MalgaKey) {
  return new MalgaTokenization({
    apiKey: publicKey,
    clientId,
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
}

export default function App() {
  const malgaTokenization = useRef<MalgaTokenization | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [tokenId, setTokenId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let instance: MalgaTokenization | undefined
    let unmounted = false

    fetchMalgaKey()
      .then((malgaKey) => {
        if (unmounted) return
        instance = createMalgaTokenization(malgaKey)
        malgaTokenization.current = instance
        setIsReady(true)
      })
      .catch((error: Error) => setErrorMessage(error.message))

    // Frees the containers on unmount (including the StrictMode second mount)
    return () => {
      unmounted = true
      instance?.destroy()
      malgaTokenization.current = null
      setIsReady(false)
    }
  }, [])

  async function handleGetTokenId(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!malgaTokenization.current) return

    const { tokenId, error } = await malgaTokenization.current.tokenize()

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setErrorMessage('')
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
        <button type="submit" disabled={!isReady}>
          Submit
        </button>
      </form>
      {errorMessage && <p role="alert">{errorMessage}</p>}
      {tokenId}
    </main>
  )
}

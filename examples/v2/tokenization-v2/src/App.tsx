import { useEffect, useState, type FormEvent } from 'react'
import './App.css'
import { MalgaTokenization } from '@malga/tokenization'

// Este exemplo mostra os dois usos do SDK na mesma página:
//
//   1. Um cartão:     uma instância, containers com os ids padrão.
//   2. Dois cartões:  uma instância POR cartão, containers com ids únicos.
//
// A regra é uma só: cada instância controla os campos dos seus containers, e
// um container (id) nunca pode se repetir na página.

// `suffix` vazio gera os ids padrão (card-number, card-cvv...).
// `suffix` '1' gera card-number-1, card-cvv-1...
const ids = (suffix = '') => {
  const end = suffix ? `-${suffix}` : ''

  return {
    cardNumber: `card-number${end}`,
    cardHolderName: `card-holder-name${end}`,
    cardCvv: `card-cvv${end}`,
    cardExpirationDate: `card-expiration-date${end}`,
  }
}

function createTokenization(suffix?: string) {
  const container = ids(suffix)

  return new MalgaTokenization({
    apiKey: 'API_KEY',
    clientId: 'CLIENT_ID',
    options: {
      sandbox: true,
      config: {
        fields: {
          // As chaves (cardNumber, cardHolderName...) são sempre as mesmas.
          // O que muda de um cartão para o outro é só o `container`.
          cardNumber: {
            container: container.cardNumber,
            placeholder: '9999 9999 9999 9999',
          },
          cardHolderName: {
            container: container.cardHolderName,
            placeholder: 'Nome impresso no cartão',
          },
          cardExpirationDate: {
            container: container.cardExpirationDate,
            placeholder: 'MM/YY',
          },
          cardCvv: {
            container: container.cardCvv,
            placeholder: '999',
          },
        },
        styles: {
          input: { color: '#000', 'font-size': '16px' },
        },
      },
    },
  })
}

// Criadas uma vez, fora do componente. Cada `new MalgaTokenization` monta os
// iframes nos containers; criar de novo a cada render duplicaria os campos.
const singleCard = createTokenization()
const firstCard = createTokenization('1')
const secondCard = createTokenization('2')

// Os 4 campos de um cartão. Os ids precisam ser iguais aos `container`
// configurados acima.
function CardFields({ suffix, title }: { suffix?: string; title?: string }) {
  const container = ids(suffix)

  return (
    <fieldset>
      {title && <legend>{title}</legend>}
      <div className="form-group">
        <label htmlFor={container.cardNumber}>Card Number</label>
        <div id={container.cardNumber} className="form-control"></div>
      </div>
      <div className="form-group">
        <label htmlFor={container.cardHolderName}>Card Holder Name</label>
        <div id={container.cardHolderName} className="form-control"></div>
      </div>
      <div className="form-group">
        <label htmlFor={container.cardCvv}>Card CVV</label>
        <div id={container.cardCvv} className="form-control"></div>
      </div>
      <div className="form-group">
        <label htmlFor={container.cardExpirationDate}>
          Card Expiration Date
        </label>
        <div id={container.cardExpirationDate} className="form-control"></div>
      </div>
    </fieldset>
  )
}

// `loading` avisa quando a tokenização começa e termina. Aqui serve para
// travar o botão. O `on` devolve uma função que remove o listener.
function useLoading(...instances: MalgaTokenization[]) {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const removers = instances.map((instance) =>
      instance.on('loading', ({ isLoading }) => setLoading(isLoading)),
    )

    return () => removers.forEach((remove) => remove())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return loading
}

// 1. Um cartão: uma instância, um tokenize().
function SingleCardExample() {
  const [tokenId, setTokenId] = useState('')
  const loading = useLoading(singleCard)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const { tokenId, error } = await singleCard.tokenize()

    if (error) {
      console.error(error)
      return
    }

    setTokenId(tokenId)
  }

  return (
    <section>
      <h2>Um cartão</h2>
      <form onSubmit={handleSubmit}>
        <CardFields />
        <button type="submit" disabled={loading}>
          Tokenizar
        </button>
      </form>
      {tokenId && <p>tokenId: {tokenId}</p>}
    </section>
  )
}

// 2. Dois cartões: uma instância por cartão. Cada tokenize() devolve o token
// do próprio cartão, e dá para chamá-los ao mesmo tempo.
function TwoCardsExample() {
  const [tokenIds, setTokenIds] = useState<string[]>([])
  const loading = useLoading(firstCard, secondCard)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const results = await Promise.all([
      firstCard.tokenize(),
      secondCard.tokenize(),
    ])

    const failed = results.find(({ error }) => error)

    if (failed) {
      console.error(failed.error)
      return
    }

    setTokenIds(results.map(({ tokenId }) => tokenId))
  }

  return (
    <section>
      <h2>Dois cartões</h2>
      <form onSubmit={handleSubmit}>
        <CardFields suffix="1" title="Cartão 1" />
        <CardFields suffix="2" title="Cartão 2" />
        <button type="submit" disabled={loading}>
          Tokenizar os dois
        </button>
      </form>
      {tokenIds.map((tokenId, index) => (
        <p key={tokenId}>
          tokenId do cartão {index + 1}: {tokenId}
        </p>
      ))}
    </section>
  )
}

export default function App() {
  return (
    <main>
      <SingleCardExample />
      <TwoCardsExample />
    </main>
  )
}

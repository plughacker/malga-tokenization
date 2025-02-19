import { CSSClasses, EventEmits, Event } from 'src/enums'
import { EventListener, validation } from 'src/events'
import { eventsEmitter } from 'src/tokenization'

export function listener() {
  const windowMessage = new EventListener(window.parent)
  console.log('oi')
  windowMessage.listener('message', (event) => {
    console.log(event)
    if (event.origin !== 'https://develop.d3krxmg1839vaa.amplifyapp.com') return //URL DA APLICAÇÃO
    const { type, data } = event.data

    const parentNode = document.querySelector(`#${data?.fieldType}`)
    if (!parentNode) return

    if (type === Event.Validity) {
      validation(data, parentNode)
    }

    if (type === Event.CardTypeChanged) {
      console.log('aqui')
      eventsEmitter.emit('cardTypeChanged', {
        card: data.card,
        parentNode: parentNode,
      })
    }

    if (type === Event.Focus || type === Event.Blur) {
      parentNode?.classList.toggle(CSSClasses.Focused)

      eventsEmitter.emit(
        type === EventEmits.Focus ? EventEmits.Focus : EventEmits.Blur,
        {
          field: data.fieldType,
          parentNode: parentNode,
        },
      )
    }
  })
}

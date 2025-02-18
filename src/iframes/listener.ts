import { EventListener, validation } from 'src/events'
import { eventsEmitter } from 'src/tokenization'

export function listener() {
  const windowMessage = new EventListener(window.parent)

  windowMessage.listener('message', (event) => {
    if (event.origin !== 'https://develop.d3krxmg1839vaa.amplifyapp.com') return //URL DA APLICAÇÃO
    const { type, data } = event.data

    const parentNode = document.querySelector(`#${data?.fieldType}`)
    if (!parentNode) return

    if (type === 'validation') {
      validation(data, parentNode)
    }

    if (type === 'cardTypeChanged') {
      eventsEmitter.emit('cardTypeChanged', {
        card: data.card,
        parentNode: parentNode,
      })
    }

    if (type === 'focus' || type === 'blur') {
      parentNode?.classList.toggle('malga-hosted-field-focused')

      eventsEmitter.emit(type === 'focus' ? 'focus' : 'blur', {
        field: data.fieldType,
        parentNode: parentNode,
      })
    }
  })
}

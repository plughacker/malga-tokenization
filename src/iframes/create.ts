import { CSSClasses } from 'src/enums'
import type { MalgaInputFieldConfiguration } from 'src/interfaces'
import { gettingIframeSrc, waitingForElement } from 'src/utils'

// Como parar de esperar o container de cada iframe ainda não inserido.
const stopWaiting = new WeakMap<HTMLIFrameElement, () => void>()

export function create(
  fieldConfig: MalgaInputFieldConfiguration,
  debug?: boolean,
  sandbox?: boolean,
) {
  const src = gettingIframeSrc(debug, sandbox)
  const iframe = document.createElement('iframe')

  iframe.setAttribute('name', fieldConfig.container)
  iframe.setAttribute('src', src)
  iframe.setAttribute('width', '100%')
  iframe.setAttribute('height', '100%')
  iframe.setAttribute('frameborder', '0')

  stopWaiting.set(
    iframe,
    waitingForElement(fieldConfig.container, (parentNode) => {
      parentNode?.appendChild(iframe)
      parentNode.classList.add(CSSClasses.Default)
    }),
  )

  return iframe
}

/**
 * Desfaz o create(): para de esperar o container, tira o iframe do DOM e as
 * classes que o SDK pôs no container.
 */
export function removeIframe(iframe: HTMLIFrameElement) {
  stopWaiting.get(iframe)?.()
  stopWaiting.delete(iframe)

  iframe.parentElement?.classList.remove(...Object.values(CSSClasses))
  iframe.remove()
}

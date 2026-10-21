import { CSSClasses } from 'src/enums'
import type { MalgaInputFieldConfiguration } from 'src/interfaces'
import { gettingIframeSrc, waitingForElement } from 'src/utils'

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

  waitingForElement(fieldConfig.container, (parentNode) => {
    parentNode?.appendChild(iframe)
    parentNode.classList.add(CSSClasses.Default)
  })

  return iframe
}

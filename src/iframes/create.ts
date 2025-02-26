import { CSSClasses } from 'src/enums'
import type { MalgaInputFieldConfiguration } from 'src/interfaces'
import { waitingForElement } from 'src/utils'
import { URL_HOSTED_FIELD } from '../constants'

export function create(fieldConfig: MalgaInputFieldConfiguration) {
  const iframe = document.createElement('iframe')

  iframe.setAttribute('name', fieldConfig.container)
  iframe.setAttribute('src', URL_HOSTED_FIELD)
  iframe.setAttribute('width', '100%')
  iframe.setAttribute('height', '100%')
  iframe.setAttribute('frameborder', '0')

  waitingForElement(fieldConfig.container, (parentNode) => {
    parentNode?.appendChild(iframe)
    parentNode.classList.add(CSSClasses.Default)
  })

  return iframe
}

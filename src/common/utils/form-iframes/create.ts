import type { MalgaInputFieldConfiguration } from 'src/common/interfaces'
import { waitingForElement } from './observer'
import { camelToKebabCase } from './parsedString'

export function create(
  type: string,
  fieldConfig: MalgaInputFieldConfiguration,
) {
  const iframe = document.createElement('iframe')
  const iframeName = camelToKebabCase(type)

  iframe.setAttribute('name', iframeName)
  iframe.setAttribute('src', 'https://develop.d3krxmg1839vaa.amplifyapp.com/')
  iframe.setAttribute('width', '100%')
  iframe.setAttribute('height', '100%')
  iframe.setAttribute('frameborder', '0')

  waitingForElement(fieldConfig.container, (parentNode) => {
    parentNode?.appendChild(iframe)
    parentNode.classList.add('malga-hosted-field')
  })

  return iframe
}

import { CSSClasses } from 'src/enums'
import type { MalgaInputFieldConfiguration } from 'src/interfaces'
import { gettingOriginEvent, waitingForElement } from 'src/utils'

export function create(
  fieldConfig: MalgaInputFieldConfiguration,
  debug?: boolean,
  sandbox?: boolean,
) {
  const origin = gettingOriginEvent(debug, sandbox)
  const iframe = document.createElement('iframe')
  console.log({ origin })

  iframe.setAttribute('name', fieldConfig.container)
  iframe.setAttribute('src', 'https://develop.d3krxmg1839vaa.amplifyapp.com')
  iframe.setAttribute('width', '100%')
  iframe.setAttribute('height', '100%')
  iframe.setAttribute('frameborder', '0')

  waitingForElement(fieldConfig.container, (parentNode) => {
    parentNode?.appendChild(iframe)
    parentNode.classList.add(CSSClasses.Default)
  })

  return iframe
}

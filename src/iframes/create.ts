import { CSSClasses } from 'src/enums'
import type { MalgaInputFieldConfiguration } from 'src/interfaces'
import { gettingHostedFieldsUrl, waitingForElement } from 'src/utils'

export function create(
  fieldConfig: MalgaInputFieldConfiguration,
  debug?: boolean,
  sandbox?: boolean,
) {
  // a URL do iframe carrega o caminho da versão; a validação de origem, não
  const urlDoIframe = gettingHostedFieldsUrl(debug, sandbox)
  const iframe = document.createElement('iframe')

  iframe.setAttribute('name', fieldConfig.container)
  iframe.setAttribute('src', urlDoIframe)
  iframe.setAttribute('width', '100%')
  iframe.setAttribute('height', '100%')
  iframe.setAttribute('frameborder', '0')

  waitingForElement(fieldConfig.container, (parentNode) => {
    parentNode?.appendChild(iframe)
    parentNode.classList.add(CSSClasses.Default)
  })

  return iframe
}

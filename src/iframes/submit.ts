import type { MalgaConfigurations } from 'src/interfaces'
import { Event } from 'src/enums'
import { EventPostMessage } from 'src/events'
import { gettingOriginEvent } from 'src/utils'

export function submit(
  configurations: MalgaConfigurations,
  requestId?: string,
) {
  const iframeCardNumber = document.querySelector(
    'iframe[name=card-number]',
  ) as HTMLIFrameElement

  if (!iframeCardNumber || !iframeCardNumber.contentWindow) {
    console.error(
      'iframeCardNumber is null or has no contentWindow, cannot send postMessage',
    )
    return
  }

  const origin = gettingOriginEvent(
    configurations.options.debug,
    configurations.options.sandbox,
  )

  const getSessionStorageCard = JSON.parse(
    sessionStorage.getItem('malga-card') || '{}',
  )

  const iframePostMessage = new EventPostMessage(
    iframeCardNumber.contentWindow!,
    origin,
  )

  // O campo só entra no payload quando existe, para que a submissão continue
  // idêntica à atual para quem chama `submit` sem correlação.
  const correlation = requestId ? { requestId } : {}

  iframePostMessage.send(Event.Submit, {
    authorizationData: {
      clientId: configurations.clientId,
      apiKey: configurations.apiKey,
    },
    sandbox: configurations.options?.sandbox,
    debug: configurations.options.debug,
    card: getSessionStorageCard,
    ...correlation,
  })
}

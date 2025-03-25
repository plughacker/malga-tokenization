import type { MalgaConfigurations } from 'src/interfaces'
import { Event } from 'src/enums'
import { EventPostMessage } from 'src/events'
import { gettingOriginEvent } from 'src/utils'

export function submit(configurations: MalgaConfigurations) {
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
    configurations.options?.sandbox,
  )

  const iframePostMessage = new EventPostMessage(
    iframeCardNumber.contentWindow!,
    origin,
  )

  iframePostMessage.send(Event.Submit, {
    authorizationData: {
      clientId: configurations.clientId,
      apiKey: configurations.apiKey,
    },
    sandbox: configurations.options?.sandbox,
    debug: configurations.options.debug,
  })
}

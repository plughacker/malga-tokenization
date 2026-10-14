import type { MalgaConfigurations } from 'src/interfaces'
import { Event } from 'src/enums'
import { EventPostMessage } from 'src/events'
import { getStorageKey, gettingOriginEvent } from 'src/utils'

export function submit(
  configurations: MalgaConfigurations,
  requestId?: string,
): Window | undefined {
  const container = configurations.options.config.fields.cardNumber.container
  const iframeCardNumber = Array.from(
    document.getElementsByName(container),
  ).find((element) => element instanceof HTMLIFrameElement) as
    HTMLIFrameElement | undefined

  if (!iframeCardNumber || !iframeCardNumber.contentWindow) {
    console.error(
      'iframeCardNumber is null or has no contentWindow, cannot send postMessage',
    )
    return undefined
  }

  const origin = gettingOriginEvent(
    configurations.options.debug,
    configurations.options.sandbox,
  )

  const storageKey = getStorageKey(configurations.options)
  const getSessionStorageCard = JSON.parse(
    sessionStorage.getItem(storageKey) || '{}',
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
    card: getSessionStorageCard,
    requestId,
  })

  return iframeCardNumber.contentWindow
}

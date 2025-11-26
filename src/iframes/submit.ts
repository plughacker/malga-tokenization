import type { MalgaConfigurations, MalgaFieldsGroup } from 'src/interfaces'
import { Event } from 'src/enums'
import { EventPostMessage } from 'src/events'
import { gettingOriginEvent } from 'src/utils'

export function submit(
  configurations: MalgaConfigurations,
  fieldsToSubmit: MalgaFieldsGroup[],
) {
  const origin = gettingOriginEvent(
    configurations.options.debug,
    configurations.options.sandbox,
  )

  fieldsToSubmit.forEach((field) => {
    const container = field.cardNumber.container
    const iframeCardNumber = document.querySelector(
      `iframe[name=${container}]`,
    ) as HTMLIFrameElement

    if (!iframeCardNumber?.contentWindow) {
      console.error(
        'iframeCardNumber is null or has no contentWindow, cannot send postMessage',
      )
      return
    }

    const storageKey = `malga-card-${container}`
    const cardData = JSON.parse(sessionStorage.getItem(storageKey) || '{}')

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
      card: cardData,
    })
  })
}

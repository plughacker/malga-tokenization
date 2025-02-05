import type { MalgaConfigurations } from 'src/common/interfaces'
import { EventPostMessage } from '../form-events'
import { getFormValues } from '../form-values'
import { Event } from 'src/common/enums'

export function submit(configurations: MalgaConfigurations) {
  const { holderName, number, expirationDate, cvv } = getFormValues()

  const iframeCardNumber = document.querySelector(
    'iframe[name=card-number]',
  ) as HTMLIFrameElement

  if (!iframeCardNumber) {
    console.error('iframeCardNumber is null, cannot send postMessage')
    return
  }

  const iframePostMessage = new EventPostMessage(
    iframeCardNumber.contentWindow!,
    '*',
  )

  iframePostMessage.send(
    Event.Submit,
    {
      data: {
        holderName,
        number,
        expirationDate,
        cvv,
      },
      authorizationData: {
        clientId: configurations.clientId,
        apiKey: configurations.apiKey,
      },
    },
    '*',
  )
}

import type { MalgaInputFieldConfigurations } from 'src/common/interfaces'
import { create } from './create'
import { camelToKebabCase } from './parsedString'
import { Event } from 'src/common/enums'

export function loaded(config: MalgaInputFieldConfigurations) {
  const fields = Object.keys(config.fields)

  for (const field of fields) {
    const fieldConfig = config.fields[field as keyof typeof config.fields]

    const iframe = create(field)
    const iframeName = camelToKebabCase(field)

    if (!iframe) {
      console.error(iframe, field)
      console.error(`Error to access the iframe of ${field}`)
      return
    }

    document.addEventListener('DOMContentLoaded', () => {
      const waitForElement = (
        selector: string,
        callback: (element: HTMLElement) => void,
      ) => {
        const element = document.querySelector(selector)

        if (element) {
          callback(element as HTMLElement)
          return
        }

        const observer = new MutationObserver((_, observer) => {
          const element = document.querySelector(selector)
          if (element) {
            observer.disconnect()
            callback(element as HTMLElement)
          }
        })

        observer.observe(document.body, { childList: true, subtree: true })
      }

      waitForElement(fieldConfig.container, (div) => {
        div?.appendChild(iframe)
      })
    })

    iframe.onload = () => {
      if (!iframe.contentWindow) {
        console.error('iframe.contentWindow is null, cannot send postMessage')
        return
      }

      iframe.contentWindow.postMessage(
        {
          type: Event.SetTypeField,
          fieldType: iframeName,
        },
        '*',
      )
    }
  }
}

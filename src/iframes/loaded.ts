import type {
  MalgaInputFieldConfiguration,
  MalgaInputFieldConfigurations,
  MalgaOptions,
} from 'src/interfaces'
import { create } from './create'
import { Event } from 'src/enums'

function validateConfig(config: MalgaInputFieldConfigurations): boolean {
  if (!config || typeof config !== 'object') {
    console.error('Invalid configuration object')
    return false
  }

  if (!config.fields || typeof config.fields !== 'object') {
    console.error('Invalid fields configuration')
    return false
  }

  return true
}

function onLoadIframeField(
  field: any,
  iframe: HTMLIFrameElement,
  fieldConfig: MalgaInputFieldConfiguration,
  cardNumberContainer: string,
  options: MalgaOptions,
) {
  if (!iframe.contentWindow) {
    console.error('iframe.contentWindow is null, cannot send postMessage')
    return
  }

  console.log('[TOKENIZATION] onLoadIframeField:', {
    field,
    container: fieldConfig.container,
    cardNumberContainer,
  })

  iframe.contentWindow.postMessage(
    {
      type: Event.SetTypeField,
      fieldType: field,
      container: fieldConfig.container,
      cardNumberContainer: cardNumberContainer,
      fieldConfig: fieldConfig,
      styles: options.config?.styles,
      preventAutofill: options.config?.preventAutofill,
      debug: options?.debug,
      sandbox: options?.sandbox,
    },
    '*',
  )
}

export function loaded(options: MalgaOptions) {
  if (!validateConfig(options.config)) {
    return
  }

  //fields is array
  options.config.fields.forEach((fieldsGroup) => {
    const fields = Object.keys(fieldsGroup)
    const cardNumberContainer = fieldsGroup.cardNumber.container

    fields.forEach((field) => {
      const fieldConfig = fieldsGroup[field as keyof typeof fieldsGroup]
      const iframe = create(fieldConfig, options.debug, options.sandbox)

      if (!iframe) {
        console.error(`Error to access the iframe of ${field}`)
        return
      }

      iframe.onload = () =>
        onLoadIframeField(
          field,
          iframe,
          fieldConfig,
          cardNumberContainer,
          options,
        )
    })
  })
}

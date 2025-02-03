import type { MalgaConfigurations } from '../interfaces'

export class Malga {
  constructor(private readonly configurations: MalgaConfigurations) {}

  private getBaseUrl() {
    if (this.configurations.options?.sandbox) {
      return 'https://sandbox-api.malga.io/v1'
    }

    return 'https://api.malga.io/v1'
  }

  public async tokenization() {
    const cardNumberIframe = document.querySelector(
      "iframe[name='card-number']",
    ) as HTMLIFrameElement

    return cardNumberIframe.contentWindow?.postMessage(
      {
        type: 'submit',
        data: {
          apiKey: this.configurations.apiKey,
          clientId: this.configurations.clientId,
          url: this.getBaseUrl(),
        },
      },
      '*',
    )
  }
}

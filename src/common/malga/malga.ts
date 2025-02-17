import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'

import { MalgaConfigurations } from 'src/common/interfaces'

import { MalgaErrorResponse, TokenizationPayload } from './interfaces'

export class Malga {
  private readonly api: AxiosInstance

  constructor(private readonly configurations: MalgaConfigurations) {
    this.api = axios.create({
      baseURL: this.getBaseUrl(),
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': this.configurations.apiKey,
        'X-Client-Id': this.configurations.clientId,
      },
    })
  }

  private getBaseUrl() {
    if (this.configurations.options?.sandbox) {
      return 'https://sandbox-api.dev.malga.io/v1'
    }

    return 'https://api.dev.malga.io/v1'
  }

  private handleSuccess(response: AxiosResponse) {
    return response.data
  }

  private handleError(error: AxiosError<any>): Promise<MalgaErrorResponse> {
    if (!error.response?.data || error.response.status >= 500) {
      return Promise.reject({
        error: {
          type: 'api_error',
          code: 500,
          message: 'unexpected error',
        },
      })
    }

    if (error.response.status === 403) {
      return Promise.reject({
        error: {
          type: 'invalid_request_error',
          code: 403,
          message: 'forbidden',
        },
      })
    }

    return Promise.reject(error.response.data)
  }

  public async tokenization(payload: TokenizationPayload) {
    const parsedPayload = {
      cardNumber: payload.number,
      cardCvv: payload.cvv,
      cardExpirationDate: payload.expirationDate,
      cardHolderName: payload.holderName,
    }

    return this.api
      .post('/tokens', parsedPayload)
      .then(this.handleSuccess)
      .catch(this.handleError)
  }
}

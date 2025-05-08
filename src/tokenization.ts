import type {
  EventPayloadReturnObject,
  EventTypeReturn,
  MalgaConfigurations,
} from 'src/interfaces'

import { Tokenize } from './tokenize'
import { Events } from './events'
import { listener, loaded } from './iframes'

export const eventsEmitter = new Events()

export class MalgaTokenization {
  private readonly configurations: MalgaConfigurations

  constructor(configurations: MalgaConfigurations) {
    if (!configurations.apiKey || !configurations.clientId) {
      console.error(
        'Missing API key. Pass it to the constructor `new MalgaTokenization({ apiKey: "YOUR_API_KEY", clientId: "YOUR_CLIENT_ID" })`',
      )
      sessionStorage.removeItem('malga-card')
    }

    sessionStorage.removeItem('malga-card')

    this.configurations = configurations

    loaded(configurations.options)
    listener(configurations.options.debug, configurations.options.sandbox)
  }

  public async tokenize() {
    const tokenize = new Tokenize(this.configurations)
    return tokenize.handle()
  }

  /**
   * Configures the event provider and registers an event handler for the specified event type.
   *
   * This method allows you to react the specifics events emitted by the MalgaTokenization component.
   *
   * @param eventType - The type of event to be watched. Possible values are:
   * - 'validity': Triggered when the validity of the field data is changed (valid/invalid).
   * - 'cardTypeChanged': Triggered when the card type is detected or changed.
   * - 'focus': Triggered when a input field receives focus.
   * - 'blur': Triggered when a input field loses focus.
   * @param eventHandler - The event handler function.
   * @returns {void}
   */

  public on<T extends EventTypeReturn>(
    eventType: T,
    eventHandler: (data: EventPayloadReturnObject[T]) => void,
  ) {
    return eventsEmitter.on(eventType, eventHandler)
  }
  // public on(eventType: EventTypeReturn, eventHandler: (event: any) => void) {
  //   return eventsEmitter.on(eventType, eventHandler)
  // }
}

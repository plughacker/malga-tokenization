import type {
  EventPayloadReturnObject,
  EventTypeReturn,
  MalgaConfigurations,
  MalgaOptions,
} from 'src/interfaces'

import { Tokenize } from './tokenize'
import { Events } from './events'
import { listener, loaded } from './iframes'
import { claimContainers, getStorageKey, releaseContainers } from './utils'

function containersOf(options: MalgaOptions): string[] {
  return Object.values(options?.config?.fields ?? {}).map(
    (field) => field.container,
  )
}

export class MalgaTokenization {
  private readonly configurations: MalgaConfigurations
  private readonly events = new Events()
  private readonly teardowns: Array<(() => void) | undefined> = []
  private destroyed = false

  constructor(configurations: MalgaConfigurations) {
    if (!configurations.apiKey || !configurations.clientId) {
      console.error(
        'Missing API key. Pass it to the constructor `new MalgaTokenization({ apiKey: "YOUR_API_KEY", clientId: "YOUR_CLIENT_ID" })`',
      )
    }

    claimContainers(this, containersOf(configurations.options))

    try {
      sessionStorage.removeItem(getStorageKey(configurations.options))

      this.configurations = configurations

      this.teardowns.push(loaded(configurations.options))
      this.teardowns.push(listener(configurations.options, this.events))
    } catch (error) {
      // Se o construtor lança, o merchant não recebe instância para chamar
      // destroy(): sem isso os containers ficariam reservados para sempre.
      this.teardown()
      releaseContainers(this)
      throw error
    }
  }

  public async tokenize() {
    if (this.destroyed) {
      throw new Error('MalgaTokenization: this instance was destroyed')
    }

    const tokenize = new Tokenize(this.configurations, this.events)
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
   * - 'loading': Triggered when a tokenization starts and finishes ({ isLoading }).
   * @param eventHandler - The event handler function.
   * @returns A function that removes the registered event handler.
   */

  public on<T extends EventTypeReturn>(
    eventType: T,
    eventHandler: (data: EventPayloadReturnObject[T]) => void,
  ) {
    return this.events.on(eventType, eventHandler)
  }

  /**
   * Undoes everything the constructor set up: removes the iframes from the
   * containers, stops waiting for containers not yet in the DOM, removes the
   * message listener and the `on()` handlers, clears the collected card and
   * frees the containers for a new instance.
   *
   * Call it when the checkout unmounts (e.g. in a React effect cleanup).
   * Calling it more than once is safe. After it, `tokenize()` throws.
   */
  public destroy() {
    if (this.destroyed) return
    this.destroyed = true

    this.teardown()
    this.events.clear()
    sessionStorage.removeItem(getStorageKey(this.configurations.options))
    releaseContainers(this)
  }

  private teardown() {
    for (const teardown of this.teardowns.reverse()) teardown?.()
    this.teardowns.length = 0
  }
}

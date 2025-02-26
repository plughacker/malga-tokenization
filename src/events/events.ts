// import type { EventTypePostMessage, EventTypeReturn } from 'src/interfaces'

import type {
  EventTypeListener,
  EventTypePostMessage,
  EventPayloadReturnObject,
} from 'src/interfaces'

export class EventPostMessage {
  constructor(
    private action: Window,
    private origin: string,
  ) {}

  send(eventType?: EventTypePostMessage, data?: any, origin?: string) {
    this.action.postMessage({ eventType, data }, origin ?? this.origin)
  }
}

export class EventListener {
  constructor(private action: Window | HTMLElement | Document) {}

  listener(eventType: EventTypeListener, eventHandler: (event: any) => void) {
    this.action.addEventListener(eventType, eventHandler)
  }
}

export class Events {
  events: {
    [key in keyof EventPayloadReturnObject]?: Array<
      (payload: EventPayloadReturnObject[key]) => void
    >
  } = {}

  public on<T extends keyof EventPayloadReturnObject>(
    eventType: T,
    eventHandler: (data: EventPayloadReturnObject[T]) => void,
  ) {
    if (!this.events[eventType]) {
      this.events[eventType] = []
    }

    this.events[eventType]?.push(eventHandler)
  }

  public emit<T extends keyof EventPayloadReturnObject>(
    eventType: T,
    data: EventPayloadReturnObject[T],
  ) {
    if (!this.events[eventType]) {
      return
    }

    this.events[eventType]?.forEach((eventHandler) => {
      eventHandler(data)
    })
  }
}

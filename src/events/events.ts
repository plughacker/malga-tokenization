export class EventPostMessage {
  constructor(
    private action: Window,
    private origin: string,
  ) {}

  send(type?: string, data?: any, origin?: string) {
    console.log('aqui', type, data, origin)
    this.action.postMessage({ type, data }, origin ?? this.origin)
  }
}

export class EventListener {
  constructor(private action: Window | HTMLElement | Document) {}

  listener(type: string, eventHandler: (event: any) => void) {
    this.action.addEventListener(type, eventHandler)
  }
}

export class Events {
  events: { [key: string]: Array<(event: any) => void> } = {}

  public on(
    eventName: 'validity' | 'cardTypeChanged' | 'focus' | 'blur',
    eventHandler: (event: any) => void,
  ) {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }

    this.events[eventName].push(eventHandler)
  }

  public emit(
    eventName: 'validity' | 'cardTypeChanged' | 'focus' | 'blur',
    payload: any,
  ) {
    if (!this.events[eventName]) {
      return
    }

    for (const eventHandler of this.events[eventName]) {
      eventHandler(payload)
    }
  }
}

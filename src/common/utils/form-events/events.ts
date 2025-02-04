export class EventPostMessage {
  constructor(
    private action: Window,
    private origin: '*',
  ) {}
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  send(type?: string, data?: any, origin?: string) {
    this.action.postMessage({ type, data }, origin ?? this.origin)
  }
}

export class EventListener {
  constructor(private action: Window | HTMLElement) {}

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  get(type: string, eventHandler: (event: any) => void) {
    this.action.addEventListener(type, eventHandler)
  }
}

export class Events {
  events: { [key: string]: Array<(event: any) => void> } = {}

  public on(eventName: string, eventHandler: (event: any) => void) {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }

    this.events[eventName].push(eventHandler)
  }

  public emit(eventName: string, payload: any) {
    if (!this.events[eventName]) {
      return
    }

    for (const eventHandler of this.events[eventName]) {
      eventHandler(payload)
    }
  }
}

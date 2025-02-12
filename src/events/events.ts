export class Events {
  events: { [key: string]: Array<(event: any) => void> } = {}
  // constructor() {
  //   this.events = {}
  // }

  public on(eventName: string, eventHandler: (event: any) => void) {
    console.log('Adding new event handler for event', eventName)
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }

    this.events[eventName].push(eventHandler)
  }

  public emit(eventName: string, payload: any) {
    console.log(this.events)
    if (!this.events[eventName]) {
      return
    }

    for (const eventHandler of this.events[eventName]) {
      eventHandler(payload)
    }
  }
}

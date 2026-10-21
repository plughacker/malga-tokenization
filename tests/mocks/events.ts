export function handleCreateMockEvent(eventType: string, origin: string) {
  const eventMocked = {
    origin: origin,
    data: {
      eventType: eventType,
      data: {
        field: 'card-number',
      },
    },
  }

  return eventMocked
}

export function handleCreateMockValidityEvent(
  eventType: string,
  origin: string,
) {
  const eventMocked = {
    origin: origin,
    data: {
      eventType: eventType,
      data: {
        field: 'card-number',
        valid: true,
        empty: false,
        potentialValid: false,
      },
    },
  }

  return eventMocked
}

export function handleCreateMessageEventMock(
  eventType: string,
  origin: string,
  tokenId?: string,
) {
  const messageEvent = new MessageEvent('message', {
    origin: origin,
    data: {
      eventType: eventType,
      data: {
        tokenId: tokenId,
      },
    },
  })

  return messageEvent
}

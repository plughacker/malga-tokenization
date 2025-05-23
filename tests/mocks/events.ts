export function handleCreateMockEvent(eventType: string, origin?: string) {
  const eventMocked = {
    origin: origin ?? 'https://hosted-fields.dev.malga.io',
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
  origin?: string,
) {
  const eventMocked = {
    origin: origin ?? 'https://hosted-fields.dev.malga.io',
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
  tokenId?: string,
  origin?: string,
) {
  const messageEvent = new MessageEvent('message', {
    origin: origin ?? 'https://hosted-fields.dev.malga.io',
    data: {
      eventType: eventType,
      data: {
        tokenId: tokenId,
      },
    },
  })

  return messageEvent
}

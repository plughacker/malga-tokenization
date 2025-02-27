export function handleCreateMockEvent(eventType: string, origin?: string) {
  const eventMocked = {
    origin: origin ?? 'https://develop.d3krxmg1839vaa.amplifyapp.com/',
    data: {
      eventType: eventType,
      data: {
        field: 'card-number',
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
    origin: origin ?? 'https://develop.d3krxmg1839vaa.amplifyapp.com/',
    data: { eventType: eventType, data: tokenId },
  })

  return messageEvent
}

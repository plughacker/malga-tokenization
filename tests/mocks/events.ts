export function handleCreateMockEvent(type: string, origin?: string) {
  const eventMocked = {
    origin: origin ?? 'https://develop.d3krxmg1839vaa.amplifyapp.com',
    data: {
      type: type,
      data: {
        field: 'card-number',
      },
    },
  }

  return eventMocked
}

export function handleCreateMessageEventMock(
  type: string,
  tokenId?: string,
  origin?: string,
) {
  const messageEvent = new MessageEvent('message', {
    origin: origin ?? 'https://develop.d3krxmg1839vaa.amplifyapp.com',
    data: { type: type, data: tokenId },
  })

  return messageEvent
}

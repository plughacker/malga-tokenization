import { setupServer } from 'msw/node'
import { handlers } from './request-handlers'

export const server = setupServer(...handlers)

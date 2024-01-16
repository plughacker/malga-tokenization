import { afterEach, afterAll, beforeAll, expect } from 'vitest'
import matchers from '@testing-library/jest-dom/matchers'
import { setupServer } from 'msw/node'

export const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

expect.extend(matchers)

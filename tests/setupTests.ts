import '@testing-library/jest-dom'
import '@testing-library/jest-dom/vitest'

import { afterEach, afterAll, beforeAll, expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

import { server } from './mocks'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

expect.extend(matchers)

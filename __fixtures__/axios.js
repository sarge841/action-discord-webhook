import { jest } from '@jest/globals'

const axios = {
  post: jest.fn(() => Promise.resolve({ data: {} }))
}

export default axios

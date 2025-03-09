/**
 * Unit tests for the action's main functionality, src/main.js
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { it, jest } from '@jest/globals'
import axios from '../__fixtures__/axios.js'
import * as core from '../__fixtures__/core.js'

jest.unstable_mockModule('axios', () => ({ default: axios }))
jest.unstable_mockModule('@actions/core', () => core)

const { run } = await import('../src/main.js')

describe('run', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    process.env = { ...OLD_ENV }
  })

  afterEach(() => {
    process.env = OLD_ENV
    jest.resetAllMocks()
  })

  it('should exit with error if webhook URL is missing', async () => {
    core.getInput.mockImplementation(() => '')

    await run()
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('No webhook URL provided!')
    )
  })

  it('should exit with error if both content and embed description are provided', async () => {
    const mockGetInput = (input) => {
      switch (input) {
        case 'webhook_url':
          return 'https://discord.com/api/webhooks/test'
        case 'content':
          return 'Test content'
        case 'embed_description':
          return 'Test embed description'
        default:
          return ''
      }
    }
    core.getInput.mockImplementation(mockGetInput)

    await run()
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('Both content and embed description provided!')
    )
  })

  it('should exit with error if content exceeds 2000 characters', async () => {
    const mockGetInput = (input) => {
      switch (input) {
        case 'webhook_url':
          return 'https://discord.com/api/webhooks/test'
        case 'content':
          return 'a'.repeat(2001)
        default:
          return ''
      }
    }
    core.getInput.mockImplementation(mockGetInput)

    await run()
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('Content exceeds 2000 characters!')
    )
  })

  // Test to build repo url from env variables
  it('should build repo URL from environment variables', async () => {
    process.env.GITHUB_SERVER_URL = 'https://github.com'
    process.env.GITHUB_REPOSITORY = 'owner/repo'
    process.env.GITHUB_REF_NAME = 'branch'
    const mockGetInput = (input) => {
      switch (input) {
        case 'webhook_url':
          return 'https://discord.com/api/webhooks/test'
        case 'content':
          return 'Test content'
        default:
          return ''
      }
    }
    core.getInput.mockImplementation(mockGetInput)
    axios.post.mockResolvedValue({ status: 204 })

    await run()

    expect(axios.post).toHaveBeenCalledWith(
      'https://discord.com/api/webhooks/test',
      {
        content: 'Test content'
      }
    )
  })

  it('should send a message with content', async () => {
    const mockGetInput = (input) => {
      switch (input) {
        case 'webhook_url':
          return 'https://discord.com/api/webhooks/test'
        case 'content':
          return 'Test content'
        default:
          return ''
      }
    }
    core.getInput.mockImplementation(mockGetInput)
    axios.post.mockResolvedValue({ status: 204 })

    await run()

    expect(axios.post).toHaveBeenCalledWith(
      'https://discord.com/api/webhooks/test',
      {
        content: 'Test content'
      }
    )
  })

  it('should fail with a non 204 return code', async () => {
    const mockGetInput = (input) => {
      switch (input) {
        case 'webhook_url':
          return 'https://discord.com/api/webhooks/test'
        case 'content':
          return 'Test content'
        default:
          return ''
      }
    }
    core.getInput.mockImplementation(mockGetInput)
    axios.post.mockResolvedValue({ status: 400 })

    await run()

    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('Failed to send message.')
    )
  })

  it('should expand environment variables in content', async () => {
    process.env.TEST_VAR = 'test value'
    const mockGetInput = (input) => {
      switch (input) {
        case 'webhook_url':
          return 'https://discord.com/api/webhooks/test'
        case 'content':
          return 'Test content with $TEST_VAR'
        default:
          return ''
      }
    }
    core.getInput.mockImplementation(mockGetInput)
    axios.post.mockResolvedValue({ status: 204 })

    await run()

    expect(axios.post).toHaveBeenCalledWith(
      'https://discord.com/api/webhooks/test',
      {
        content: 'Test content with test value'
      }
    )
  })

  it('should send a message with content and using DISCORD_WEBHOOK_URL env', async () => {
    process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/test'
    const mockGetInput = (input) => {
      switch (input) {
        case 'content':
          return 'Test content'
        default:
          return ''
      }
    }
    core.getInput.mockImplementation(mockGetInput)
    axios.post.mockResolvedValue({ status: 204 })

    await run()

    expect(axios.post).toHaveBeenCalledWith(
      'https://discord.com/api/webhooks/test',
      {
        content: 'Test content'
      }
    )
  })

  it('should send a message with embed', async () => {
    const mockGetInput = (input) => {
      switch (input) {
        case 'webhook_url':
          return 'https://discord.com/api/webhooks/test'
        case 'embed_title':
          return 'Test title'
        case 'embed_description':
          return 'Test description'
        default:
          return ''
      }
    }
    core.getInput.mockImplementation(mockGetInput)
    axios.post.mockResolvedValue({ status: 204 })

    await run()

    expect(axios.post).toHaveBeenCalledWith(
      'https://discord.com/api/webhooks/test',
      {
        embeds: [
          {
            title: 'Test title',
            description: 'Test description'
          }
        ]
      }
    )
  })

  it('should log the payload if show_payload is true', async () => {
    const mockGetInput = (input) => {
      switch (input) {
        case 'webhook_url':
          return 'https://discord.com/api/webhooks/test'
        case 'content':
          return 'Test content'
        case 'show_payload':
          return 'true'
        default:
          return ''
      }
    }
    core.getInput.mockImplementation(mockGetInput)
    axios.post.mockResolvedValue({ status: 204 })

    await run()

    expect(core.info).toHaveBeenCalledWith(expect.stringContaining('Payload: '))
  })

  it('should exit with error if embed title exceeds 256 characters', async () => {
    const mockGetInput = (input) => {
      switch (input) {
        case 'webhook_url':
          return 'https://discord.com/api/webhooks/test'
        case 'embed_title':
          return 'a'.repeat(257)
        default:
          return ''
      }
    }
    core.getInput.mockImplementation(mockGetInput)

    await run()
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('Embed title exceeds')
    )
  })

  it('should exit with error if embed description exceeds 4096 characters', async () => {
    const mockGetInput = (input) => {
      switch (input) {
        case 'webhook_url':
          return 'https://discord.com/api/webhooks/test'
        case 'embed_description':
          return 'a'.repeat(4097)
        default:
          return ''
      }
    }
    core.getInput.mockImplementation(mockGetInput)

    await run()
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('Embed description exceeds')
    )
  })

  it('should exit with error if embed fields are not proper JSON', async () => {
    const mockGetInput = (input) => {
      switch (input) {
        case 'webhook_url':
          return 'https://discord.com/api/webhooks/test'
        case 'embed_fields':
          return 'Not a JSON string'
        default:
          return ''
      }
    }
    core.getInput.mockImplementation(mockGetInput)

    await run()
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('Invalid JSON for embed fields')
    )
  })

  it('should exit with error if embed field count exceeds 25', async () => {
    const mockGetInput = (input) => {
      switch (input) {
        case 'webhook_url':
          return 'https://discord.com/api/webhooks/test'
        case 'embed_fields':
          return JSON.stringify(
            new Array(26).fill({
              name: 'Test field name',
              value: 'Test field value'
            })
          )
        default:
          return ''
      }
    }
    core.getInput.mockImplementation(mockGetInput)

    await run()
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('Embed fields exceed')
    )
  })

  it('should exit with error if embed field name exceeds 256 characters', async () => {
    const mockGetInput = (input) => {
      switch (input) {
        case 'webhook_url':
          return 'https://discord.com/api/webhooks/test'
        case 'embed_fields':
          return (
            '[{"name": "' + 'a'.repeat(257) + '", "value": "Test field value"}]'
          )
        default:
          return ''
      }
    }
    core.getInput.mockImplementation(mockGetInput)

    await run()
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('Embed field name exceeds')
    )
  })

  it('should exit with error if embed field value exceeds 1024 characters', async () => {
    const mockGetInput = (input) => {
      switch (input) {
        case 'webhook_url':
          return 'https://discord.com/api/webhooks/test'
        case 'embed_fields':
          return (
            '[{"name": "Test field name", "value": "' + 'a'.repeat(1025) + '"}]'
          )
        default:
          return ''
      }
    }
    core.getInput.mockImplementation(mockGetInput)

    await run()
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('Embed field value exceeds')
    )
  })

  it('should exit with error if embed footer text exceeds 2048 characters', async () => {
    const mockGetInput = (input) => {
      switch (input) {
        case 'webhook_url':
          return 'https://discord.com/api/webhooks/test'
        case 'embed_footer_text':
          return 'a'.repeat(2049)
        default:
          return ''
      }
    }
    core.getInput.mockImplementation(mockGetInput)

    await run()
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('Embed footer text exceeds')
    )
  })

  it('should exit with error if embed author name exceeds 256 characters', async () => {
    const mockGetInput = (input) => {
      switch (input) {
        case 'webhook_url':
          return 'https://discord.com/api/webhooks/test'
        case 'embed_author_name':
          return 'a'.repeat(257)
        default:
          return ''
      }
    }
    core.getInput.mockImplementation(mockGetInput)

    await run()
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('Embed author name exceeds')
    )
  })
})

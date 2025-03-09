import axios from 'axios'
import * as core from '@actions/core'

// Embed limits for Discord messages
const EMBED_LIMITS = {
  title: 256,
  description: 4096,
  fields: 25,
  fieldName: 256,
  fieldValue: 1024,
  footerText: 2048,
  authorName: 256
}

// Function to expand environment variables in a given text
// This works for both ${VAR} and $VAR formats
function expandEnvVariables(text) {
  return text.replace(
    /\$\{(\w+)\}|\$(\w+)/g,
    (_, v1, v2) => process.env[v1 || v2] || ''
  )
}

// Function to validate the embed object against Discord's limits
function validateEmbed(embed) {
  if (embed.title && embed.title.length > EMBED_LIMITS.title) {
    throw new Error(`Embed title exceeds ${EMBED_LIMITS.title} characters.`)
  }
  if (
    embed.description &&
    embed.description.length > EMBED_LIMITS.description
  ) {
    throw new Error(
      `Embed description exceeds ${EMBED_LIMITS.description} characters.`
    )
  }
  if (embed.fields && embed.fields.length > EMBED_LIMITS.fields) {
    throw new Error(`Embed fields exceed ${EMBED_LIMITS.fields} field objects.`)
  }
  if (embed.fields) {
    embed.fields.forEach((field) => {
      if (field.name.length > EMBED_LIMITS.fieldName) {
        throw new Error(
          `Embed field name exceeds ${EMBED_LIMITS.fieldName} characters.`
        )
      }
      if (field.value.length > EMBED_LIMITS.fieldValue) {
        throw new Error(
          `Embed field value exceeds ${EMBED_LIMITS.fieldValue} characters.`
        )
      }
    })
  }
  if (
    embed.footer &&
    embed.footer.text &&
    embed.footer.text.length > EMBED_LIMITS.footerText
  ) {
    throw new Error(
      `Embed footer text exceeds ${EMBED_LIMITS.footerText} characters.`
    )
  }
  if (
    embed.author &&
    embed.author.name &&
    embed.author.name.length > EMBED_LIMITS.authorName
  ) {
    throw new Error(
      `Embed author name exceeds ${EMBED_LIMITS.authorName} characters.`
    )
  }
}

// Function to send a message to Discord via webhook
async function sendDiscordMessage(webhookUrl, payload) {
  core.info('Sending message to Discord...')

  try {
    const response = await axios.post(webhookUrl, payload)

    if (response.status === 204) {
      core.info('Message sent successfully!')
    } else {
      core.setFailed(
        `Failed to send message. HTTP ${response.status}: ${response.statusText}`
      )
    }
  } catch (error) {
    core.setFailed(`Request failed: ${error}`)
  }
}

// Main function to run the action
export async function run() {
  core.info('Checking environment variables...')

  // Retrieve inputs
  const webhookUrl =
    core.getInput('webhook_url') || process.env.DISCORD_WEBHOOK_URL || ''
  const content = core.getInput('content') || ''
  const username = core.getInput('username') || ''
  const avatarUrl = core.getInput('avatar_url') || ''
  const tts = core.getInput('tts') === 'true'
  const embedTitle = core.getInput('embed_title') || ''
  const embedDescription = core.getInput('embed_description') || ''
  const embedUrl = core.getInput('embed_url') || ''
  const embedTimestamp = core.getInput('embed_timestamp') || ''
  const embedColor = core.getInput('embed_color') || ''
  const embedAuthorName = core.getInput('embed_author_name') || ''
  const embedAuthorUrl = core.getInput('embed_author_url') || ''
  const embedAuthorIconUrl = core.getInput('embed_author_icon_url') || ''
  const embedFooterText = core.getInput('embed_footer_text') || ''
  const embedFooterIconUrl = core.getInput('embed_footer_icon_url') || ''
  const embedFields = core.getInput('embed_fields') || ''
  const showPayload = core.getInput('show_payload') === 'true'

  // Default repository URL
  let repoUrl = 'https://github.com/owner/repo'
  if (
    process.env.GITHUB_SERVER_URL &&
    process.env.GITHUB_REPOSITORY &&
    process.env.GITHUB_REF_NAME
  ) {
    repoUrl = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/src/branch/${process.env.GITHUB_REF_NAME}`
  }

  // Check if webhook URL is provided
  if (!webhookUrl) {
    core.setFailed(
      'No webhook URL provided! Set the `DISCORD_WEBHOOK_URL` environment variable or provide the `webhook_url` input.'
    )
    return
  }

  // Check if both content and embed description are provided
  if (content && embedDescription) {
    core.setFailed(
      'Both content and embed description provided! Ensure only one of `content` or `embed_description` is set. Exiting.'
    )
    return
  }

  // Check if content exceeds 2000 characters
  if (content && content.length > 2000) {
    core.setFailed(
      'Content exceeds 2000 characters! Ensure the `content` input is within the limit. Exiting.'
    )
    return
  }

  // Create the payload object
  const payload = {}

  // Add content to payload if provided
  if (content) {
    payload.content = expandEnvVariables(content)
  }

  // Add username to payload if provided
  if (username) {
    payload.username = username
  }

  // Add avatar URL to payload if provided
  if (avatarUrl) {
    payload.avatar_url = avatarUrl
  }

  // Add TTS to payload if enabled
  if (tts) {
    payload.tts = tts
  }

  // Add embed to payload if no content and embed properties are provided
  if (
    !content &&
    (embedTitle ||
      embedDescription ||
      embedUrl ||
      embedTimestamp ||
      embedColor ||
      embedAuthorName ||
      embedAuthorUrl ||
      embedAuthorIconUrl ||
      embedFooterText ||
      embedFooterIconUrl ||
      embedFields)
  ) {
    const embed = {}

    if (embedTitle) {
      embed.title = embedTitle
    }

    if (embedDescription) {
      embed.description = expandEnvVariables(embedDescription)
    }

    if (embedUrl) {
      embed.url = embedUrl
    }

    if (embedTimestamp) {
      embed.timestamp = embedTimestamp
    }

    if (embedColor) {
      embed.color = parseInt(embedColor, 16)
    }

    if (embedAuthorName || embedAuthorUrl || embedAuthorIconUrl) {
      embed.author = {}
      if (embedAuthorName) {
        embed.author.name = embedAuthorName
      }
      if (embedAuthorUrl) {
        embed.author.url = embedAuthorUrl
      }
      if (embedAuthorIconUrl) {
        embed.author.icon_url = embedAuthorIconUrl
      }
    }

    if (embedFooterText || embedFooterIconUrl) {
      embed.footer = {}
      if (embedFooterText) {
        embed.footer.text = embedFooterText
      }
      if (embedFooterIconUrl) {
        embed.footer.icon_url = embedFooterIconUrl
      }
    }

    if (embedFields) {
      try {
        embed.fields = JSON.parse(embedFields)
      } catch (error) {
        core.setFailed(
          'Invalid JSON for embed fields. Ensure the `embed_fields` input is a valid JSON array.'
        )
        return
      }
    }

    try {
      validateEmbed(embed)
    } catch (error) {
      core.setFailed(error.message)
      return
    }
    payload.embeds = [embed]
  }

  // Log the payload if show_payload is true
  if (showPayload) {
    core.info(`Payload: ${JSON.stringify(payload)}`)
  }

  // Send the message to Discord
  await sendDiscordMessage(webhookUrl, payload)
}

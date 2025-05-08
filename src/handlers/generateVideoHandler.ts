import fetch from 'node-fetch';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

const API_BASE = 'https://api.json2video.com/v2';

function handleApiError(result: any, customMessage?: string) {
  if (!result.success) {
    throw new McpError(
      ErrorCode.InternalError,
      customMessage || `json2video API error: ${JSON.stringify(result)}`
    );
  }
}

export async function generateVideo(args: any, apiKey: string) {
  console.error(`[API] Generating video with args: ${JSON.stringify(args)}`);
  const response = await fetch(`${API_BASE}/movies`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(args)
  });
  const result = await response.json() as { project: string };

  handleApiError(result, `json2video API error: ${JSON.stringify(result)}`);
  if (!result.project) {
    throw new McpError(
      ErrorCode.InternalError,
      `json2video API error: ${JSON.stringify(result)}`
    );
  }

  return {
    content: [
      {
        type: 'text',
        text: `Video generation started. Project ID: ${result.project}`
      }
    ]
  };
} 
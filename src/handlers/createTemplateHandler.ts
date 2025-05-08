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

export async function createTemplate(args: any, apiKey: string) {
  console.error(`[API] Creating template with args: ${JSON.stringify(args)}`);
  const response = await fetch(`${API_BASE}/templates`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: args.name,
      description: args.description ?? `Template created at ${new Date().toISOString()}`
    })
  });
  const result = await response.json() as { template: string };

  handleApiError(result, `json2video API error: ${JSON.stringify(result)}`);

  return {
    content: [
      {
        type: 'text',
        text: `Template created successfully. Template ID: ${result.template}`
      }
    ]
  };
} 
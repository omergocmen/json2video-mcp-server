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

export async function listTemplates(apiKey: string) {
  console.error('[API] Listing all templates');
  const response = await fetch(`${API_BASE}/templates`, {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': '*/*',
      'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  });
  const result = await response.json() as { templates: string[] };

  handleApiError(result, `json2video API error: ${JSON.stringify(result)}`);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result.templates, null, 2)
      }
    ]
  };
} 
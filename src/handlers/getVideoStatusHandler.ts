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

export async function getVideoStatus(args: any, apiKey: string) {
  console.error(`[API] Getting video status for project: ${args.project}`);
  const url = `${API_BASE}/movies?project=${args.project}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'x-api-key': apiKey }
  });
  const result = await response.json();

  handleApiError(result, `json2video API error: ${JSON.stringify(result)}`);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }
    ]
  };
} 
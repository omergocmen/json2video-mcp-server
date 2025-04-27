#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

class Json2VideoServer {
  constructor() {
    console.error('[Setup] Initializing json2video MCP server...');

    this.server = new Server(
      {
        name: 'json2video-mcp',
        version: '1.1.7',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();

    this.server.onerror = (error) => console.error('[Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'generate_video',
          description: 'Creates a video project using the json2video API. Each project can contain multiple scenes, and each scene can contain various elements such as text, images, video, audio, components, HTML, voice, audiogram, and subtitles. See https://json2video.com/docs/api/ for full schema.',
          inputSchema: {
            type: 'object',
            description: 'Input for creating a video project. The main content is in the "scenes" array. See https://json2video.com/docs/api/ for full schema and examples.',
            properties: {
              id: { type: 'string', description: 'Unique identifier for the movie project. If not provided, a random string will be generated.' },
              comment: { type: 'string', description: 'A comment or description for the movie project.' },
              cache: { type: 'boolean', description: 'Use the cached version of the movie if available. Default: true.' },
              client_data: { type: 'object', description: 'Key-value pairs included in the response and webhooks. Used to pass information to later workflow steps.' },
              draft: { type: 'boolean', description: 'If true, adds a watermark to the movie. Free plans must set draft to true.' },
              quality: { type: 'string', description: 'Quality of the final rendered movie. Use for speed/quality tradeoff.', enum: ['low', 'medium', 'high'], default: 'high' },
              resolution: { type: 'string', description: 'Preset resolution. Use "custom" to set width/height manually.', enum: ['sd', 'hd', 'full-hd', 'squared', 'instagram-story', 'instagram-feed', 'twitter-landscape', 'twitter-portrait', 'custom'], default: 'custom' },
              width: { type: 'integer', description: 'Width of the movie (pixels). Only if resolution is "custom". Min: 50, Max: 3840.' },
              height: { type: 'integer', description: 'Height of the movie (pixels). Only if resolution is "custom". Min: 50, Max: 3840.' },
              variables: { type: 'object', description: 'Global variables for use in templates/components. Variable names: letters, numbers, underscores.' },
              elements: { type: 'array', description: 'Global elements not tied to a specific scene. Each element can be of type video, image, text, html, component, audio, voice, audiogram, subtitles.', items: { type: 'object', description: 'Element object. See element schemas below.' } },
              scenes: {
                type: 'array',
                description: 'List of scenes in the video. Each scene contains an array of elements.',
                items: {
                  type: 'object',
                  description: 'Scene object.',
                  properties: {
                    id: { type: 'string', description: 'Unique identifier for the scene.' },
                    comment: { type: 'string', description: 'Description or comment for the scene.' },
                    background_color: { type: 'string', description: 'Hex color or "transparent". Default: #000000.' },
                    cache: { type: 'boolean', description: 'Use cached version of the scene if available.' },
                    condition: { type: 'string', description: 'Condition for rendering the scene. If false/empty, scene is skipped.' },
                    duration: { type: 'number', description: 'Scene duration in seconds. -1 means auto.' },
                    variables: { type: 'object', description: 'Local variables for the scene.' },
                    elements: {
                      type: 'array',
                      description: 'List of elements in the scene. Each element can be of type video, image, text, html, component, audio, voice, audiogram, subtitles.',
                      items: { type: 'object', description: 'Element object. See element schemas below.' }
                    }
                  },
                  required: ['elements']
                }
              },
              apiKey: { type: 'string', description: 'json2video API key (optional, can also be set as environment variable JSON2VIDEO_API_KEY)' },
            },
            required: ['scenes'],
            examples: [
              {
                comment: 'MyProject',
                resolution: 'full-hd',
                scenes: [
                  {
                    elements: [
                      {
                        type: 'video',
                        src: 'https://example.com/path/to/my/video.mp4'
                      }
                    ]
                  }
                ]
              }
            ],
            // For LLMs: See https://json2video.com/docs/api/ for full details on each element type (video, image, text, html, component, audio, voice, audiogram, subtitles). Each element type has its own properties. For example, a text element requires "type: text" and "text" fields, a video element requires "type: video" and "src" fields, etc.
          }
        },
        {
          name: 'get_video_status',
          description: 'Get the status or result of a generated video',
          inputSchema: {
            type: 'object',
            properties: {
              apiKey: { type: 'string', description: 'json2video API key (optional, can also be set as environment variable JSON2VIDEO_API_KEY)' },
              project: { type: 'string', description: 'Project ID from video generation' }
            },
            required: ['project']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        if (!['generate_video', 'get_video_status'].includes(request.params.name)) {
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
        }

        const args = request.params.arguments || {};
        const apiKey = args.apiKey || process.env.JSON2VIDEO_API_KEY;
        if (!apiKey) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'API key is required (either in arguments or as environment variable JSON2VIDEO_API_KEY)'
          );
        }

        if (request.params.name === 'generate_video') {
          console.error(`[API] Generating video with scenes: ${JSON.stringify(args.scenes)}`);
          const response = await fetch('https://api.json2video.com/v2/movies', {
            method: 'POST',
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ scenes: args.scenes })
          });
          const result = await response.json();

          if (!result.success || !result.project) {
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
        } else {
          // get_video_status
          console.error(`[API] Getting video status for project: ${args.project}`);
          const url = `https://api.json2video.com/v2/movies?project=${args.project}`;
          const response = await fetch(url, {
            method: 'GET',
            headers: { 'x-api-key': apiKey }
          });
          const result = await response.json();

          if (!result.success) {
            throw new McpError(
              ErrorCode.InternalError,
              `json2video API error: ${JSON.stringify(result)}`
            );
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        }
      } catch (error) {
        if (error instanceof McpError) {
          console.error('[MCP Error]', error);
          throw error;
        }
        console.error('[Error] Tool call failed:', error);
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to process tool call: ${error.message}`
        );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('json2video MCP server running on stdio');
  }
}

const server = new Json2VideoServer();
server.run().catch(console.error); 
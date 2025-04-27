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
        version: '1.1.4',
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
          description: 'Creates a customizable video project. Each project can contain multiple scenes, and each scene can contain various elements such as text, images, video, audio, components, and more. Example input: { "id": "q663vmm2", "width": 1920, "height": 1080, "scenes": [ { "elements": [ { "type": "text", "text": "Hello world", "duration": 5 } ] } ] }',
          inputSchema: {
            type: 'object',
            description: 'Input for creating a video project. See the "scenes" array for the main content.',
            properties: {
              id: { type: 'string', description: 'Unique identifier for the movie project.' },
              comment: { type: 'string', description: 'A comment or description for the movie project.' },
              width: { type: 'integer', description: 'Width of the output video in pixels.' },
              height: { type: 'integer', description: 'Height of the output video in pixels.' },
              quality: { type: 'string', description: 'Video quality. Possible values: "low", "medium", "high".' },
              draft: { type: 'boolean', description: 'If true, the video will be rendered as a draft (faster, lower quality).' },
              resolution: { type: 'string', description: 'Preset resolution, e.g. "custom", "instagram-story", "full-hd".' },
              fps: { type: 'integer', description: 'Frames per second for the output video.' },
              settings: { type: 'object', description: 'Additional global settings for the video.' },
              cache: { type: 'boolean', description: 'If true, enables caching for faster repeated renders.' },
              variables: { type: 'object', description: 'Global variables for use in components or dynamic content.' },
              scenes: {
                type: 'array',
                description: 'List of scenes in the video. Each scene contains an array of elements.',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', description: 'Unique identifier for the scene.' },
                    comment: { type: 'string', description: 'Description or comment for the scene.' },
                    elements: {
                      type: 'array',
                      description: 'List of elements in the scene. Each element can be text, image, video, etc.',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', description: 'Unique identifier for the element.' },
                          type: { type: 'string', description: 'Element type. E.g. "text", "image", "video", "voice", "html", "audiogram", "component", "subtitles".' },
                          text: { type: 'string', description: 'Text content (for type "text").' },
                          src: { type: 'string', description: 'Source URL (for type "image" or "video").' },
                          duration: { type: 'number', description: 'Duration in seconds (for timed elements).' },
                          width: { type: 'number', description: 'Width of the element.' },
                          height: { type: 'number', description: 'Height of the element.' },
                          x: { type: 'number', description: 'X position of the element.' },
                          y: { type: 'number', description: 'Y position of the element.' },
                          component: { type: 'string', description: 'Component type (for type "component").' },
                          settings: { type: 'object', description: 'Component-specific settings (for type "component").' }
                        }
                      }
                    }
                  }
                }
              },
              elements: { type: 'array', description: 'Global elements not tied to a specific scene.' },
              apiKey: { type: 'string', description: 'json2video API key (optional, can also be set as environment variable JSON2VIDEO_API_KEY)' },
            },
            required: ['scenes']
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
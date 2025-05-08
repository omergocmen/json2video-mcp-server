import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {CallToolRequestSchema,ErrorCode,ListToolsRequestSchema,McpError,} from '@modelcontextprotocol/sdk/types.js';
import { listTemplatesTool } from './tools/listTemplatesTool.js';
import { getTemplateTool } from './tools/getTemplateTool.js';
import { createTemplateTool } from './tools/createTemplateTool.js';
import { generateVideoTool } from './tools/generateVideoTool.js';
import { getVideoStatusTool } from './tools/getVideoStatusTool.js';
import { getTemplate } from './handlers/getTemplateHandler.js';
import { listTemplates } from './handlers/listTemplatesHandler.js';
import { createTemplate } from './handlers/createTemplateHandler.js';
import { generateVideo } from './handlers/generateVideoHandler.js';
import { getVideoStatus } from './handlers/getVideoStatusHandler.js';

class Json2VideoServer {
  server = null;
  constructor() {
    console.error('[Setup] Initializing json2video MCP server...');

    this.server = new Server(
      {
        name: 'json2video-mcp',
        version: '1.3.0',
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
      tools: [listTemplatesTool, getTemplateTool, createTemplateTool, generateVideoTool, getVideoStatusTool]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        if (!['generate_video', 'get_video_status', 'create_template', 'get_template', 'list_templates'].includes(request.params.name)) {
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

        switch (request.params.name) {
          case 'get_template':
            return await getTemplate(args, apiKey);
          case 'list_templates':
            return await listTemplates(apiKey);
          case 'create_template':
            return await createTemplate(args, apiKey);
          case 'generate_video':
            return await generateVideo(args, apiKey);
          case 'get_video_status':
            return await getVideoStatus(args, apiKey);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
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
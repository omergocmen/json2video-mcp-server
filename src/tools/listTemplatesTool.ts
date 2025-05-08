const listTemplatesTool = {
  name: 'list_templates',
  description: 'List all available templates from json2video',
  inputSchema: {
    type: 'object',
    properties: {
      apiKey: { type: 'string', description: 'json2video API key (optional, can also be set as environment variable JSON2VIDEO_API_KEY)' }
    }
  }
};

export { listTemplatesTool }; 
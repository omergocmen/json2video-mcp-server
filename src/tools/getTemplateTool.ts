const getTemplateTool = {
  name: 'get_template',
  description: 'Get template details from json2video',
  inputSchema: {
    type: 'object',
    properties: {
      apiKey: { type: 'string', description: 'json2video API key (optional, can also be set as environment variable JSON2VIDEO_API_KEY)' },
      name: { type: 'string', description: 'Name of the template to search for' }
    },
    required: ['name']
  }
};

export { getTemplateTool }; 
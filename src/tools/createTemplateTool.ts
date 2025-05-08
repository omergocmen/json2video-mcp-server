const createTemplateTool = {
  name: 'create_template',
  description: 'Create a new template in json2video',
  inputSchema: {
    type: 'object',
    properties: {
      apiKey: { type: 'string', description: 'json2video API key (optional, can also be set as environment variable JSON2VIDEO_API_KEY)' },
      name: { type: 'string', description: 'Name of the template' },
      description: { type: 'string', description: 'Description of the template' }
    },
    required: ['name']
  }
};

export { createTemplateTool }; 
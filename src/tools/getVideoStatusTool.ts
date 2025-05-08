const getVideoStatusTool = {
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
};

export { getVideoStatusTool }; 